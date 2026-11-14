// Quick self-check for sun.js. Run: npm run check
import assert from 'node:assert/strict';
import { latLonToVector, subsolarPoint } from './sun.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: expected ~${b}, got ${a}`);

// June solstice, noon UTC: Sun over the Tropic of Cancer, near Greenwich.
let p = subsolarPoint(new Date('2026-06-21T12:00:00Z'));
near(p.lat, 23.4, 0.3, 'June solstice latitude');
near(p.lon, 0, 1.5, 'noon UTC longitude');

// December solstice: Tropic of Capricorn.
p = subsolarPoint(new Date('2026-12-21T12:00:00Z'));
near(p.lat, -23.4, 0.3, 'December solstice latitude');

// March equinox, 18:00 UTC: Sun over the equator, 6 hours west of Greenwich (~90°W).
p = subsolarPoint(new Date('2026-03-20T18:00:00Z'));
near(p.lat, 0, 0.5, 'equinox latitude');
near(p.lon, -90, 3, 'evening UTC longitude');

// Map directions must match three.js SphereGeometry texture wrapping.
const close = (v, w) => v.forEach((x, i) => near(x, w[i], 1e-9, `vector[${i}]`));
close(latLonToVector(0, 0), [1, 0, 0]); // Greenwich on the equator -> +X
close(latLonToVector(0, 90), [0, 0, -1]); // 90°E -> -Z
close(latLonToVector(90, 0), [0, 1, 0]); // North Pole -> +Y

console.log('sun checks passed');
