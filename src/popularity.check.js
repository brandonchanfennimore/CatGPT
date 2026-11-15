// Quick self-check for popularity.js. Run: npm run check
import assert from 'node:assert/strict';
import { areaPlace, cityPlace, loadPlaces, recordVisit } from './popularity.js';

// A stand-in for the browser's localStorage.
function fakeStorage() {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)) };
}

const starters = [
  ['Tokyo', 35.69, 139.692],
  ['Delhi', 28.61, 77.23],
  ['Cairo', 30.044, 31.236],
  ['Lima', -12.06, -77.037],
].map(cityPlace);

// First load: n different random starters with 0 visits, saved for next time.
const storage = fakeStorage();
const first = loadPlaces(storage, starters, 3);
assert.equal(first.length, 3);
assert.equal(new Set(first.map((p) => p.id)).size, 3, 'starters should not repeat');
assert.ok(first.every((p) => p.visits === 0));
assert.deepEqual(loadPlaces(storage, starters, 3), first, 'a reload should keep the same starters');

// Blocked or corrupted storage still gives a list.
assert.equal(loadPlaces(null, starters, 2).length, 2);
const broken = fakeStorage();
broken.setItem('popularPlaces', '{not json');
assert.equal(loadPlaces(broken, starters, 2).length, 2);

// Visits: a new place jumps above the 0-visit starters; repeat visits rank higher.
const area = areaPlace({ id: 'test-area', name: 'Test Region', center: { lat: 0, lon: -90 } });
let places = recordVisit(first, area);
assert.equal(places[0].id, 'area:test-area');
assert.equal(places[0].visits, 1);
assert.equal(places.length, 4);

const last = first[2];
places = recordVisit(places, last);
places = recordVisit(places, last);
assert.equal(places[0].id, last.id, 'the most visited place comes first');
assert.equal(places[0].visits, 2);
assert.equal(places[1].id, 'area:test-area');
assert.deepEqual(places.slice(2).map((p) => p.id), [first[0].id, first[1].id], 'ties keep their order');

console.log('popularity checks passed');
