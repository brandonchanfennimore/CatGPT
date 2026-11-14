/*
 * geo.js - turns map data (latitude/longitude) into positions on the 3D globe.
 *
 * Country data comes as TopoJSON from Natural Earth (public domain), via the
 * world-atlas package. TopoJSON stores each shared border only once, which is
 * exactly what we want for drawing borders.
 *
 * No React or three.js here, so it can be tested with plain Node (geo.check.js).
 */
import { feature, mesh } from 'topojson-client';

const DEG = 180 / Math.PI;

/**
 * Turn latitude/longitude (degrees) into a point on a sphere of radius `r`.
 * Matches how three.js wraps a flat world map onto a SphereGeometry:
 * longitude 0° faces +X, 90°E faces -Z, the North Pole is +Y.
 */
export function latLonToVector(latDeg, lonDeg, r = 1) {
  const lat = latDeg / DEG;
  const lon = lonDeg / DEG;
  return [r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), -r * Math.cos(lat) * Math.sin(lon)];
}

/**
 * Readable coordinates, e.g. formatLatLon(6.455, 3.384) -> "6.46°N 3.38°E".
 * Two decimals = about 1 km, plenty for a place label.
 */
export function formatLatLon(lat, lon) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lon).toFixed(2)}°${ew}`;
}

/**
 * Border lines between countries, ready for a three.js LineSegments:
 * a flat array [x1,y1,z1, x2,y2,z2, ...], two points per little line piece.
 * Coastlines are left out: the Earth photo already shows them.
 */
export function borderPositions(topology, radius) {
  // mesh(..., a !== b) keeps only edges shared by two DIFFERENT countries.
  const borders = mesh(topology, topology.objects.countries, (a, b) => a !== b);
  const out = [];
  const MAX_STEP = 0.5; // degrees: split long pieces so they bend with the globe

  for (const line of borders.coordinates) {
    for (let i = 1; i < line.length; i++) {
      const [lon1, lat1] = line[i - 1];
      const [lon2, lat2] = line[i];
      if (Math.abs(lon2 - lon1) > 180) continue; // jumps across the date line: skip

      // A straight 3D line between two far-apart points would cut under the
      // surface (e.g. the long, straight US-Canada border), so add points in between.
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(lon2 - lon1), Math.abs(lat2 - lat1)) / MAX_STEP));
      for (let s = 0; s < steps; s++) {
        const a = s / steps;
        const b = (s + 1) / steps;
        out.push(
          ...latLonToVector(lat1 + (lat2 - lat1) * a, lon1 + (lon2 - lon1) * a, radius),
          ...latLonToVector(lat1 + (lat2 - lat1) * b, lon1 + (lon2 - lon1) * b, radius)
        );
      }
    }
  }
  return out;
}

/**
 * One label per country: { name, lat, lon, area }.
 * The label sits at the centre of the country's biggest piece of land, so e.g.
 * "France" is on mainland France, not averaged with French Guiana.
 * `area` is in steradians (fraction of the sphere x 4π), used to decide how
 * zoomed-in you must be before a small country's label appears.
 */
export function countryLabels(topology) {
  const countries = feature(topology, topology.objects.countries).features;
  return countries
    .filter((f) => f.geometry && f.properties.name)
    .map((f) => {
      // Normalise to a list of polygons; each polygon's first ring is its outline.
      const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      let total = 0;
      let best = null;
      for (const [outline] of polygons) {
        const c = ringCentroid(outline);
        total += c.area;
        if (!best || c.area > best.area) best = c;
      }
      return { name: f.properties.name, lat: best.lat, lon: best.lon, area: total };
    });
}

/**
 * Centre and area of one outline (a closed list of [lon, lat] points).
 * Uses the standard "shoelace" polygon formulas on the flat map, then corrects
 * the area for latitude (map squares shrink toward the poles by cos(latitude)).
 * ponytail: flat-map centre, fine for labels; a C- or L-shaped country can get a
 * centre slightly outside itself. Swap in a "pole of inaccessibility" if that matters.
 */
function ringCentroid(ring) {
  let a2 = 0; // twice the signed area, in square degrees
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x0, y0] = ring[j];
    const [x1, y1] = ring[i];
    const cross = x0 * y1 - x1 * y0;
    a2 += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  if (Math.abs(a2) < 1e-12) {
    // Degenerate (a sliver): fall back to the first point.
    return { lon: ring[0][0], lat: ring[0][1], area: 0 };
  }
  const lon = cx / (3 * a2);
  const lat = cy / (3 * a2);
  const area = (Math.abs(a2) / 2) * Math.cos(lat / DEG) / (DEG * DEG); // square degrees -> steradians
  return { lon, lat, area };
}
