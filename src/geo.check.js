// Quick self-check for geo.js using the real Natural Earth data. Run: npm run check
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { borderPositions, countryLabels, formatLatLon } from './geo.js';

const topology = JSON.parse(readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));

// Borders: a non-empty list of points, all sitting on the requested radius.
const pts = borderPositions(topology, 2);
assert.ok(pts.length > 10_000 && pts.length % 6 === 0, 'expected many 2-point segments');
for (let i = 0; i < pts.length; i += 3 * 997) {
  const r = Math.hypot(pts[i], pts[i + 1], pts[i + 2]);
  assert.ok(Math.abs(r - 2) < 1e-9, `point off the sphere: r=${r}`);
}

// Country labels land inside the right country (main landmass).
const labels = Object.fromEntries(countryLabels(topology).map((l) => [l.name, l]));
const inside = (name, [latMin, latMax], [lonMin, lonMax]) => {
  const l = labels[name];
  assert.ok(l, `missing label for ${name}`);
  assert.ok(l.lat > latMin && l.lat < latMax && l.lon > lonMin && l.lon < lonMax,
    `${name} label at ${l.lat.toFixed(1)}, ${l.lon.toFixed(1)}`);
};
inside('France', [42, 51], [-5, 8]); // mainland, not French Guiana
inside('United States of America', [30, 48], [-120, -75]); // lower 48, not Alaska
inside('Brazil', [-20, 0], [-60, -40]);
inside('Japan', [30, 42], [130, 145]);
assert.ok(labels.Russia.area > labels.France.area * 10, 'areas should rank countries by size');

// Coordinates: hemisphere letters and two decimals.
assert.equal(formatLatLon(6.455, 3.384), '6.46°N 3.38°E'); // Lagos
assert.equal(formatLatLon(-33.8688, -70.6693), '33.87°S 70.67°W'); // Santiago-ish
assert.equal(formatLatLon(0, 0), '0.00°N 0.00°E');

console.log('geo checks passed');
