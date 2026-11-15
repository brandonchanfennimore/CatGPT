// Quick self-check for tiles.js. Run: npm run check
import assert from 'node:assert/strict';
import { parentTile, tileBounds, tileDegrees, tilesInBox, visibleTiles } from './tiles.js';

// Tile sizes and bounds match the GIBS "500m" grid.
assert.equal(tileDegrees(5), 9);
assert.equal(tileDegrees(7), 2.25);
assert.deepEqual(tileBounds(5, 0, 0), { west: -180, east: -171, north: 90, south: 81 });
assert.deepEqual(tileBounds(7, 79, 159), { west: 177.75, east: 180, north: -87.75, south: -90 });

// Parent tile contains the child.
const child = { z: 6, row: 13, col: 41 };
const p = parentTile(child), cb = tileBounds(6, 13, 41), pb = tileBounds(p.z, p.row, p.col);
assert.ok(pb.west <= cb.west && pb.east >= cb.east && pb.north >= cb.north && pb.south <= cb.south);

// A box across the date line wraps to both ends, without duplicates.
const wrap = tilesInBox(5, -5, 5, 175, 185);
assert.deepEqual([...new Set(wrap.map((t) => t.col))].sort((a, b) => a - b), [0, 39]);
assert.equal(wrap.length, 4); // 2 rows (the box crosses the equator) x 2 columns

// Zoomed out: the base map is sharp enough, no tiles.
const base = (Math.PI * 2) / 8192;
assert.equal(visibleTiles({ lat: 0, lon: 0, altitude: 2.5, viewRadians: 1, aspect: 1.5, screenPx: 800, baseRadiansPerPx: base }).level, null);

// Zoomed in close (~64 km up): finest level, a handful of tiles, all near the point.
const near = visibleTiles({ lat: 39.4, lon: -0.4, altitude: 0.01, viewRadians: 0.0077, aspect: 1.5, screenPx: 800, baseRadiansPerPx: base });
assert.equal(near.level, 7);
assert.ok(near.tiles.length >= 1 && near.tiles.length <= 12);
for (const t of near.tiles) {
  const b = tileBounds(t.z, t.row, t.col);
  assert.ok(b.north > 35 && b.south < 44 && b.east > -6 && b.west < 5);
}

console.log('tiles checks passed');
