/*
 * tiles.js - which NASA GIBS map tiles to show for the current camera view.
 *
 * GIBS "500m" tile set (EPSG:4326, plain lat/lon): at zoom level z each tile is 512 px
 * and covers 288 / 2^z degrees, starting at the top-left corner (-180°, 90°). From
 * level 3 up the tiles fit the world exactly (level 5 = 40 x 20 tiles of 9°,
 * level 6 = 80 x 40 of 4.5°, level 7 = 160 x 80 of 2.25°, about 500 m per pixel).
 *
 * No React or three.js here, so it can be tested with plain Node (tiles.check.js).
 */

export const TILE_PX = 512;
export const MIN_LEVEL = 5; // level 4 is about as sharp as the 8K base map, so start one finer
export const MAX_LEVEL = 7; // the finest level Blue Marble has on GIBS (500 m)
export const MAX_TILES = 48; // never draw more than this many tiles at once

const RAD = Math.PI / 180;

// Size of one tile at level z, in degrees.
export const tileDegrees = (z) => 288 / 2 ** z;

// Ground size of one tile pixel at level z, in radians of arc around the globe.
export const pixelRadians = (z) => (tileDegrees(z) / TILE_PX) * RAD;

// Lat/lon box of a tile.
export function tileBounds(z, row, col) {
  const d = tileDegrees(z);
  return { west: -180 + col * d, east: -180 + (col + 1) * d, north: 90 - row * d, south: 90 - (row + 1) * d };
}

// The tile one level coarser that contains this one (tiles halve exactly from level 3 up).
export const parentTile = (t) => ({ z: t.z - 1, row: t.row >> 1, col: t.col >> 1 });

export const tileKey = (t) => `${t.z}/${t.row}/${t.col}`;

/**
 * Tiles to draw for a camera looking straight down at (lat, lon).
 *  altitude:   camera height above the ground, in Earth radii (0.01 = ~64 km)
 *  viewRadians: half the view's height on the ground, as an angle around the globe
 *  screenPx:   the view's height in screen pixels
 *  baseRadiansPerPx: how sharp the base map already is (radians of arc per pixel)
 * Returns { level, tiles: [{z, row, col}] }, or level null when the base map is sharp enough.
 */
export function visibleTiles({ lat, lon, altitude, viewRadians, aspect, screenPx, baseRadiansPerPx }) {
  const neededRadiansPerPx = (2 * viewRadians) / screenPx; // what one screen pixel covers
  if (neededRadiansPerPx >= baseRadiansPerPx) return { level: null, tiles: [] };

  // Coarsest level that is at least as sharp as the screen (no finer than we have).
  let level = MIN_LEVEL;
  while (level < MAX_LEVEL && pixelRadians(level) > neededRadiansPerPx) level++;

  // Area to cover: the view, limited by the horizon, with a margin for the edges.
  const horizon = Math.acos(1 / (1 + altitude));
  const halfLat = Math.min(horizon, viewRadians * 1.25) / RAD;
  const halfLon = Math.min(180, (Math.min(horizon, viewRadians * Math.max(aspect, 1) * 1.25) / RAD) / Math.max(Math.cos(lat * RAD), 0.05));

  // Too many tiles at this level (very wide window)? Use a coarser one.
  for (; level >= MIN_LEVEL; level--) {
    const tiles = tilesInBox(level, lat - halfLat, lat + halfLat, lon - halfLon, lon + halfLon);
    if (tiles.length <= MAX_TILES || level === MIN_LEVEL) return { level, tiles: tiles.slice(0, MAX_TILES * 2) };
  }
  return { level: null, tiles: [] };
}

// All tiles at level z touching a lat/lon box (longitudes may run past ±180: they wrap).
export function tilesInBox(z, south, north, west, east) {
  const d = tileDegrees(z);
  const cols = Math.round(360 / d);
  const rows = Math.round(180 / d);
  const r0 = Math.max(0, Math.floor((90 - Math.min(north, 90)) / d));
  const r1 = Math.min(rows - 1, Math.floor((90 - Math.max(south, -90)) / d));
  const c0 = Math.floor((west + 180) / d);
  const c1 = Math.floor((east + 180) / d);
  const tiles = [];
  const seen = new Set();
  for (let row = r0; row <= r1; row++) {
    for (let c = c0; c <= Math.min(c1, c0 + cols - 1); c++) {
      const col = ((c % cols) + cols) % cols; // wrap across the date line
      const key = `${row}/${col}`;
      if (!seen.has(key)) {
        seen.add(key);
        tiles.push({ z, row, col });
      }
    }
  }
  return tiles;
}
