/*
 * MapOverlay - Google-Earth-style country borders and place labels.
 *
 *  - <Borders>         thin lines between countries, drawn on the globe (inside <Canvas>).
 *  - <PlaceLabels>     the HTML labels (outside <Canvas>, so text stays crisp).
 *  - <LabelPositioner> inside <Canvas>: whenever the camera moves, decides which
 *                      labels to show and where on screen to put them.
 *
 * Which labels show (like Google Earth):
 *  1. Only places on the side of the globe facing you.
 *  2. Only places big enough on screen: zoom in and smaller countries and cities appear.
 *  3. No overlaps: the most important label wins, the others hide for now.
 *
 * Data: Natural Earth borders (public domain, via world-atlas) and SimpleMaps
 * cities (CC BY 4.0, see scripts/build-cities.mjs).
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferGeometry, Float32BufferAttribute, Matrix4, Vector3 } from "three";
import topology from "world-atlas/countries-50m.json";
import cities from "../data/cities.json";
import { EARTH_RADIUS } from "./Earth";
import { borderPositions, countryLabels, formatLatLon, latLonToVector } from "../geo";

// ---- Tuning knobs ----
// Countries: from each zoom level (the "×" on the zoom bar), countries at least
// this big (km²) get a label. Below the first zoom, no labels show at all.
const COUNTRY_ZOOM_STEPS = [
  [1.5, 7_500_000], // only the giants: Russia, Canada, USA, China, Brazil, Australia
  [2.0, 580_000],
  [2.4, 165_000],
  [2.8, 15_000],
  [3.3, 0], // every country
];
// Cities: same idea, by population. Capitals count as CAPITAL_BOOST x their
// population, so e.g. at 2.0× a capital needs 14.5M / 3 = about 4.8M people.
const CITY_ZOOM_STEPS = [
  [1.5, Infinity], // no cities yet
  [2.0, 14_500_000],
  [2.4, 4_100_000],
  [2.8, 370_000],
  [3.3, 0], // every city in the list
];
const CAPITAL_BOOST = 3;
// Turns population into an on-screen "size", used only to decide which label
// wins when two would overlap (bigger wins).
const CITY_SCALE = 2e-9;
const HORIZON_FADE = 0.15; // hide labels this close to the globe's edge (0 = right at the edge)
const PADDING = 4; // minimum gap between labels (px)
// No labels at all until you zoom in this far: just the globe and its borders.
const LABELS_FROM_ZOOM = COUNTRY_ZOOM_STEPS[0][0];
const BAR_ROUNDING = 0.05; // the bar shows 1 decimal, so "2.0×" can really be 1.95
const KM2_PER_STERADIAN = 6371 ** 2; // Earth radius 6371 km

/** Look up a zoom table: the value of the last step we've zoomed in to (Infinity before the first). */
function stepValue(steps, zoom) {
  let value = Infinity;
  for (const [fromZoom, v] of steps) if (zoom >= fromZoom - BAR_ROUNDING) value = v;
  return value;
}
// On-screen UI that labels should not hide behind.
const UI_SELECTORS = ".app-header, .zoom-bar, .hand-panel, .location-panel, .map-credits";
// Measuring those panels makes the browser recalculate the page layout, which is
// slow if done every frame. Panels rarely move, so re-measure at most this often (ms).
const UI_REMEASURE_MS = 500;

// All labels, built once. `weight` is in "sphere units": for a country its area,
// for a city a made-up area from its population. Screen size = sqrt(weight) x zoom.
const LABELS = [
  ...countryLabels(topology).map((c) => ({
    name: c.name,
    coord: formatLatLon(c.lat, c.lon),
    kind: "country",
    pos: new Vector3(...latLonToVector(c.lat, c.lon, EARTH_RADIUS)),
    size: Math.sqrt(c.area) * EARTH_RADIUS,
    areaKm2: c.area * KM2_PER_STERADIAN,
  })),
  ...cities.map(([name, lat, lon, pop, capital]) => ({
    name,
    coord: formatLatLon(lat, lon),
    kind: capital ? "capital" : "city",
    pos: new Vector3(...latLonToVector(lat, lon, EARTH_RADIUS)),
    rankPop: pop * (capital ? CAPITAL_BOOST : 1),
    size: Math.sqrt(pop * CITY_SCALE * (capital ? CAPITAL_BOOST : 1)) * EARTH_RADIUS,
  })),
];

/** Country borders, drawn just above the surface so they don't flicker into it. */
export function Borders() {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(borderPositions(topology, EARTH_RADIUS * 1.002), 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="white" transparent opacity={0.45} depthWrite={false} />
    </lineSegments>
  );
}

/** The HTML for every label. LabelPositioner shows/hides and moves them. */
export function PlaceLabels({ layerRef, visible = true, coordinates = true }) {
  // "off" hides every label; "no-coords" hides just the coordinate lines (see UI.css).
  const classes = `map-labels${visible ? "" : " off"}${coordinates ? "" : " no-coords"}`;
  return (
    <div className={classes} ref={layerRef} aria-hidden="true">
      {LABELS.map((l, i) => (
        <span key={i} className={`map-label ${l.kind}`}>
          <span className="map-label-name">{l.name}</span>
          <span className="map-label-coord">{l.coord}</span>
        </span>
      ))}
    </div>
  );
}

// Scratch objects reused every frame.
const toCamera = new Vector3();
const projected = new Vector3();

export function LabelPositioner({ layerRef }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size); // canvas size in px
  const state = useRef(null); // { els, widths, heights, nameHeights, shown, coords }
  const lastMatrix = useRef(new Matrix4());
  const lastSize = useRef("");
  const startDistance = useRef(null); // the starting view = "1.0×", same as the zoom bar
  const obstacles = useRef({ boxes: [], at: -Infinity, sizeKey: "" }); // cached panel boxes

  useFrame(() => {
    const layer = layerRef.current;
    if (!layer) return;

    // Labels switched off: do nothing, and make sure we redo everything when
    // they come back (lastSize = "" forces the "something changed" path below).
    if (layer.classList.contains("off")) {
      lastSize.current = "";
      return;
    }

    // Measure every label once. Re-measure when coordinates are switched on/off,
    // because that changes each label's width and height.
    const coords = !layer.classList.contains("no-coords");
    if (!state.current || state.current.coords !== coords) {
      const els = [...layer.children];
      for (const el of els) el.style.visibility = "hidden"; // start from a clean slate
      state.current = {
        els,
        coords,
        widths: els.map((el) => el.offsetWidth),
        heights: els.map((el) => el.offsetHeight),
        nameHeights: els.map((el) => el.firstChild.offsetHeight), // first line only
        shown: new Array(els.length).fill(false),
      };
      lastSize.current = ""; // force a re-layout this frame
    }

    // Nothing moved? Then nothing to do (saves a lot of work while idle).
    const sizeKey = `${size.width}x${size.height}`;
    if (camera.matrixWorld.equals(lastMatrix.current) && sizeKey === lastSize.current) return;
    lastMatrix.current.copy(camera.matrixWorld);
    lastSize.current = sizeKey;

    // Too far out? Fade the whole label layer away and skip the rest.
    // (The Earth sits at the origin, so the camera's distance = its position length.)
    startDistance.current ??= camera.position.length();
    const zoom = startDistance.current / camera.position.length();
    const tooFar = zoom < LABELS_FROM_ZOOM - BAR_ROUNDING;
    layer.classList.toggle("too-far", tooFar);
    if (tooFar) return;
    const minArea = stepValue(COUNTRY_ZOOM_STEPS, zoom);
    const minPop = stepValue(CITY_ZOOM_STEPS, zoom);

    const { els, widths, heights, nameHeights, shown } = state.current;
    // Pixels per world unit at distance 1 (from the camera's field of view).
    const focalPx = size.height / 2 / Math.tan((camera.fov * Math.PI) / 360);

    // 1 + 2: find labels that face us and are big enough, with their screen position.
    const candidates = [];
    for (let i = 0; i < LABELS.length; i++) {
      const l = LABELS[i];
      toCamera.copy(camera.position).sub(l.pos);
      const dist = toCamera.length();
      // Facing test: the surface normal (pos / radius) vs. the direction to the camera.
      const facing = toCamera.dot(l.pos) / (dist * EARTH_RADIUS);
      if (facing < HORIZON_FADE) continue;
      // Big enough for this zoom? Countries by area, cities by population (zoom tables above).
      if (l.kind === "country" ? l.areaKm2 < minArea : l.rankPop < minPop) continue;
      const px = (l.size * focalPx) / dist; // on-screen size, used below to rank labels

      projected.copy(l.pos).project(camera); // -> -1..1 screen coordinates
      const x = ((projected.x + 1) / 2) * size.width;
      const y = ((1 - projected.y) / 2) * size.height;
      if (x < 0 || x > size.width || y < 0 || y > size.height) continue;
      // Countries rank above cities of similar size.
      candidates.push({ i, x, y, priority: px * (l.kind === "country" ? 2 : 1) });
    }

    // 3: place the most important first; skip anything that would overlap.
    // The page's own panels count as already "placed", so labels avoid them too.
    candidates.sort((a, b) => b.priority - a.priority);
    const now = performance.now();
    const ob = obstacles.current;
    if (now - ob.at > UI_REMEASURE_MS || ob.sizeKey !== sizeKey) {
      const origin = layer.getBoundingClientRect();
      ob.boxes = [...document.querySelectorAll(UI_SELECTORS)].map((el) => {
        const r = el.getBoundingClientRect();
        return [r.left - origin.left, r.top - origin.top, r.right - origin.left, r.bottom - origin.top];
      });
      ob.at = now;
      ob.sizeKey = sizeKey;
    }
    const placed = [...ob.boxes];
    const nowShown = new Array(LABELS.length).fill(false);
    for (const c of candidates) {
      const w = widths[c.i];
      const h = heights[c.i];
      // Countries are centred on their point. Cities have a dot on the point with
      // the name to its right, so the name's line (not the whole label) is centred on it.
      const isCountry = LABELS[c.i].kind === "country";
      const left = isCountry ? c.x - w / 2 : c.x - 4;
      const top = isCountry ? c.y - h / 2 : c.y - nameHeights[c.i] / 2;
      const box = [left - PADDING, top - PADDING, left + w + PADDING, top + h + PADDING];
      if (placed.some((p) => box[0] < p[2] && box[2] > p[0] && box[1] < p[3] && box[3] > p[1])) continue;
      placed.push(box);
      nowShown[c.i] = true;
      els[c.i].style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
    }

    // Only touch the page for labels whose visibility changed.
    for (let i = 0; i < els.length; i++) {
      if (nowShown[i] !== shown[i]) els[i].style.visibility = nowShown[i] ? "visible" : "hidden";
      shown[i] = nowShown[i];
    }
  });

  return null;
}
