/*
 * FloodMarkers - flood dots on the globe that cluster when zoomed out.
 *
 * Same two-part setup as the place labels (MapOverlay.jsx):
 *  - <FloodMarkerLayer>      the HTML dots (outside <Canvas>, so they stay crisp
 *                            and clickable). Makes one element per place up front.
 *  - <FloodMarkerPositioner> inside <Canvas>: whenever the camera moves, finds the
 *                            places facing us, merges the close ones
 *                            (clusters.js), and moves/fills the elements.
 *
 * Dots (colour = type of surface change, see data/categories.js):
 *        big dot with a white ring = has radar images: click to open its timeline.
 *        small dot = info only: click for its name, place, date and a short note.
 *        blue + number = several places too close to tell apart: click to zoom in.
 *        Zoomed right in, a cluster that still won't split (e.g. two floods in the
 *        same town, different years) shows a list to pick from instead.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Matrix4, Vector3 } from "three";
import { EARTH_RADIUS } from "./Earth";
import { clusterScreenPoints } from "../clusters";
import { SITES, hasImages } from "../data/sites";
import { CATEGORY_BY_ID } from "../data/categories";
import { latLonToVector } from "../geo";
import { registerMarker } from "../markers";
import "./FloodMarkers.css";

// ---- Tuning knobs ----
const CLUSTER_RADIUS_PX = 40; // dots closer than this on screen merge
const HORIZON = 0.08; // hide dots this close to the globe's edge (0 = right at the edge)
// Clicking a cluster flies toward it and cuts the height above the ground by this
// factor, so a couple of clicks split any cluster.
const ZOOM_IN_FACTOR = 3;
// Below this height (km above the ground) clicks stop zooming: a cluster that still
// hasn't split (places almost on top of each other) opens its leading place instead.
const STOP_ZOOMING_KM = 40;
const KM_PER_UNIT = 6371 / EARTH_RADIUS; // Earth radius 6371 km

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// "2024-10-29" or "2024-10" -> "Oct 2024"; "ongoing" stays as it is.
const formatMonth = (d) => (!d ? "" : d === "ongoing" ? "ongoing" : `${MONTHS[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`);

// Every place, built once (see data/sites.js). Places with radar images ("site") lead
// their clusters (higher priority) and open the timeline when clicked.
const PLACES = SITES.filter((s) => s.center).map((s) => {
  const site = hasImages(s);
  return {
    kind: site ? "site" : "event",
    id: s.id,
    name: s.name,
    category: s.category,
    color: CATEGORY_BY_ID[s.category]?.color ?? "#ffb020",
    date: s.date,
    meta: [s.category, s.place, formatMonth(s.date)].filter(Boolean).join(" · ") + (site ? " · click to explore" : ""),
    note: s.description,
    area: s,
    ...s.center,
    pos: new Vector3(...latLonToVector(s.center.lat, s.center.lon, EARTH_RADIUS)),
  };
});

/**
 * The dots. `stateRef` is shared with the positioner: it writes which places
 * each element shows; clicks read it back.
 * onOpenSite(area): open a study area.  onFly({ dir, zoom }): fly the camera.
 */
export function FloodMarkerLayer({ layerRef, stateRef, onOpenSite, onFly }) {
  // Two-finger swipe up "clicks" the study site nearest the screen centre, as before.
  useEffect(() => {
    const unregister = PLACES.filter((p) => p.kind === "site").map((p) =>
      registerMarker({ position: p.pos, open: () => onOpenSite(p.area) })
    );
    return () => unregister.forEach((off) => off());
  }, [onOpenSite]);

  function handleClick(slot) {
    const s = stateRef.current;
    const cluster = s?.slots[slot];
    if (!cluster) return;
    if (cluster.members.length > 1) {
      if (cluster.flyTo) onFly(cluster.flyTo);
      else togglePin(s, cluster.pinId); // can't zoom further: show the list
      return;
    }
    const place = PLACES[cluster.members[0]];
    if (place.kind === "site") onOpenSite(place.area);
    else {
      togglePin(s, place.id);
    }
  }

  // A study site picked from a cluster's list.
  function handleListClick(event) {
    const button = event.target.closest("button[data-member]");
    if (button) onOpenSite(PLACES[Number(button.dataset.member)].area);
  }

  return (
    <div className="flood-markers" ref={layerRef}>
      {PLACES.map((_, slot) => (
        <div key={slot} className="fm-item">
          <button type="button" className="fm-dot" onClick={() => handleClick(slot)}>
            <span className="fm-count" />
          </button>
          <div className="fm-tip" onClick={handleListClick}>
            <strong className="fm-tip-name" />
            <span className="fm-tip-meta" />
            <span className="fm-tip-note" />
            <ul className="fm-tip-list" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Open a dot's card, or close it if it's already open. */
function togglePin(s, id) {
  s.pinned = s.pinned === id ? null : id;
  s.dirty = true;
}

// Scratch objects reused every frame.
const toCamera = new Vector3();
const projected = new Vector3();

// hidden: Set of category ids whose dots are switched off in the legend.
export function FloodMarkerPositioner({ layerRef, stateRef, hidden }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size); // canvas size in px
  const lastMatrix = useRef(new Matrix4());
  const lastSize = useRef("");
  const startDistance = useRef(null); // the starting view = "1.0×", same as the zoom bar

  // Legend changed: redraw on the next frame even if the camera didn't move.
  useEffect(() => {
    if (stateRef.current) stateRef.current.dirty = true;
  }, [hidden, stateRef]);

  useFrame(() => {
    const layer = layerRef.current;
    if (!layer) return;
    // First frame, or the layer was remounted: start fresh.
    if (stateRef.current?.layer !== layer) {
      stateRef.current = { layer, slots: [], keys: [], pinned: null, dirty: true };
    }
    const s = stateRef.current;

    // Nothing moved and nothing clicked? Nothing to do.
    const sizeKey = `${size.width}x${size.height}`;
    if (!s.dirty && camera.matrixWorld.equals(lastMatrix.current) && sizeKey === lastSize.current) return;
    lastMatrix.current.copy(camera.matrixWorld);
    lastSize.current = sizeKey;
    s.dirty = false;

    // Screen position of every place on the side of the globe facing us.
    const visible = []; // indexes into PLACES
    const points = [];
    for (let i = 0; i < PLACES.length; i++) {
      if (hidden?.has(PLACES[i].category)) continue; // switched off in the legend
      const pos = PLACES[i].pos;
      toCamera.copy(camera.position).sub(pos);
      if (toCamera.dot(pos) / (toCamera.length() * EARTH_RADIUS) < HORIZON) continue;
      projected.copy(pos).project(camera);
      const x = ((projected.x + 1) / 2) * size.width;
      const y = ((1 - projected.y) / 2) * size.height;
      if (x < 0 || x > size.width || y < 0 || y > size.height) continue;
      visible.push(i);
      points.push({ x, y, priority: PLACES[i].kind === "site" ? 2 : 1 });
    }
    const clusters = clusterScreenPoints(points, CLUSTER_RADIUS_PX).map((c) => ({
      ...c,
      members: c.members.map((m) => visible[m]),
    }));

    // Where a cluster click flies to: the middle of its places, a few times closer.
    startDistance.current ??= camera.position.length();
    const height = camera.position.length() - EARTH_RADIUS;
    const flyZoom = startDistance.current / (EARTH_RADIUS + height / ZOOM_IN_FACTOR);

    // Fill one element per cluster; hide the spare ones.
    const els = layer.children;
    for (let slot = 0; slot < els.length; slot++) {
      const el = els[slot];
      const c = clusters[slot];
      s.slots[slot] = c ?? null;
      if (!c) {
        if (s.keys[slot] !== "") el.style.visibility = "hidden";
        s.keys[slot] = "";
        continue;
      }
      el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;

      const single = c.members.length === 1 ? PLACES[c.members[0]] : null;
      const key = c.members.join(",");
      c.pinId = single ? single.id : `cluster:${key}`;
      if (!single) {
        const dir = new Vector3();
        for (const m of c.members) dir.add(PLACES[m].pos);
        c.flyTo = height * KM_PER_UNIT > STOP_ZOOMING_KM ? { dir, zoom: flyZoom } : null;
      }

      // Only rewrite the text when this element shows something different.
      if (s.keys[slot] !== key) {
        s.keys[slot] = key;
        fillSlot(el, c, single);
      }
      el.classList.toggle("pinned", c.pinId === s.pinned);
      el.classList.toggle("max-zoom", !single && !c.flyTo); // CSS swaps the hint text
    }
  });

  return null;
}

/** Write a cluster's look and text into its element. */
function fillSlot(el, c, single) {
  const button = el.firstChild;
  const [name, meta, note, list] = el.lastChild.children;
  const hasSite = c.members.some((m) => PLACES[m].kind === "site");
  el.className = `fm-item ${single ? single.kind : "cluster"}${hasSite ? " has-site" : ""}`;
  el.style.setProperty("--n", Math.min(c.members.length, 12));
  el.style.setProperty("--c", single ? single.color : ""); // category colour
  button.firstChild.textContent = single ? "" : c.members.length;
  if (single) {
    name.textContent = single.name;
    meta.textContent = single.meta;
    note.textContent = single.note ?? "";
    button.setAttribute("aria-label", `${single.name}, ${single.meta}`);
  } else {
    const label = `${c.members.length} places here`;
    name.textContent = label;
    meta.textContent = ""; // hint comes from CSS: "zoom in" or "pick one" (max-zoom)
    note.textContent = "";
    button.setAttribute("aria-label", label);
  }
  // The pick-a-place list (shown only when a cluster can't zoom any further).
  // Study sites are buttons; other floods are plain lines.
  list.replaceChildren(
    ...(single ? [] : c.members).map((m) => {
      const p = PLACES[m];
      const li = document.createElement("li");
      if (p.kind === "site") {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.member = m;
        b.textContent = p.name;
        li.append(b);
      } else {
        li.textContent = `${p.name} · ${p.category} · ${formatMonth(p.date)}`;
      }
      return li;
    })
  );
  el.style.visibility = "visible";
}
