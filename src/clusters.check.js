// Quick self-check for clusters.js. Run: npm run check
import assert from 'node:assert/strict';
import { clusterScreenPoints } from './clusters.js';

const pts = [
  { x: 100, y: 100, priority: 1 }, // 0: event
  { x: 110, y: 105, priority: 2 }, // 1: study site, 11 px from #0
  { x: 400, y: 300, priority: 1 }, // 2: far away
  { x: 125, y: 100, priority: 1 }, // 3: 15 px from the site, 25 px from #0
];

// Radius 20: the site leads and pulls in #0 and #3; #2 stays alone.
let c = clusterScreenPoints(pts, 20);
assert.equal(c.length, 2);
assert.deepEqual(c[0], { x: 110, y: 105, members: [1, 0, 3] }); // sits on the site, site listed first
assert.deepEqual(c[1].members, [2]);

// Zoomed in (same places, 4x farther apart on screen): nothing merges.
const zoomed = pts.map((p) => ({ ...p, x: p.x * 4, y: p.y * 4 }));
c = clusterScreenPoints(zoomed, 20);
assert.equal(c.length, 4);
assert.ok(c.every((k) => k.members.length === 1));

// Every dot ends up in exactly one cluster.
const big = Array.from({ length: 50 }, (_, i) => ({ x: (i * 37) % 300, y: (i * 53) % 200, priority: i % 3 }));
const all = clusterScreenPoints(big, 40).flatMap((k) => k.members).sort((a, b) => a - b);
assert.deepEqual(all, big.map((_, i) => i));

assert.deepEqual(clusterScreenPoints([], 40), []);
console.log('cluster checks passed');
