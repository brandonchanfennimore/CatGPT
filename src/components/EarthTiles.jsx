/*
 * EarthTiles - sharper map tiles on top of the globe when you zoom in.
 *
 * The base map (public/textures/earth.jpg) is 8192 px wide, about 5 km per pixel.
 * Zoomed in closer than that, this layer loads NASA Blue Marble tiles from NASA GIBS
 * (down to about 500 m per pixel) just for the area in view, and lays each one on
 * the globe as a small curved patch. tiles.js decides which tiles are needed.
 *
 * While a tile is still loading, its coarser "parent" tile is shown if we have it;
 * otherwise the base map shows through. Old tiles are freed when the cache is full.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { SphereGeometry, SRGBColorSpace, TextureLoader } from "three";
import { vectorToLatLon } from "../geo";
import { MIN_LEVEL, parentTile, tileBounds, tileKey, visibleTiles } from "../tiles";

const TILE_URL = (t) =>
  `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/BlueMarble_ShadedRelief_Bathymetry/default/500m/${t.z}/${t.row}/${t.col}.jpeg`;
const BASE_RADIANS_PER_PX = (2 * Math.PI) / 8192; // the base map's sharpness
const CACHE_SIZE = 160; // tiles kept in memory (512 px each)
const CHECK_EVERY = 0.15; // seconds between "which tiles?" updates
// Tiles float a hair above the globe (about 1 km) so they never flicker into it;
// finer levels a little higher still, so they cover their parents.
const tileRadius = (earthRadius, z) => earthRadius * (1.0002 + 0.00002 * z);

const loader = new TextureLoader();

export default function EarthTiles({ earthRadius }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const cacheRef = useRef(new Map()); // key -> { texture, failed }, oldest first
  const lastRef = useRef({ time: -1, shown: "" });
  const [shown, setShown] = useState([]); // tiles to draw: [{ z, row, col, texture }]

  useFrame(({ clock }) => {
    if (clock.elapsedTime - lastRef.current.time < CHECK_EVERY) return;
    lastRef.current.time = clock.elapsedTime;

    const cache = cacheRef.current;
    const height = camera.position.length() - earthRadius;
    const { lat, lon } = vectorToLatLon(camera.position.x, camera.position.y, camera.position.z);
    const { tiles } = visibleTiles({
      lat,
      lon,
      altitude: height / earthRadius,
      viewRadians: (height * Math.tan((camera.fov * Math.PI) / 360)) / earthRadius,
      aspect: size.width / size.height,
      screenPx: size.height * gl.getPixelRatio(),
      baseRadiansPerPx: BASE_RADIANS_PER_PX,
    });

    // Start loading what's missing; draw each tile, or its nearest loaded parent.
    const draw = new Map();
    for (const t of tiles) {
      const key = tileKey(t);
      if (!cache.has(key)) {
        const entry = { texture: null, failed: false };
        cache.set(key, entry);
        loader.load(
          TILE_URL(t),
          (texture) => {
            texture.colorSpace = SRGBColorSpace;
            entry.texture = texture;
          },
          undefined,
          () => (entry.failed = true) // e.g. offline: the base map stays
        );
      }
      for (let cur = t; cur.z >= MIN_LEVEL; cur = parentTile(cur)) {
        const entry = cache.get(tileKey(cur));
        if (entry?.texture) {
          draw.set(tileKey(cur), { ...cur, texture: entry.texture });
          break;
        }
      }
    }

    // Recently used tiles move to the end; drop the oldest unused ones when full.
    for (const key of draw.keys()) {
      const entry = cache.get(key);
      cache.delete(key);
      cache.set(key, entry);
    }
    for (const [key, entry] of cache) {
      if (cache.size <= CACHE_SIZE) break;
      if (draw.has(key) || (!entry.texture && !entry.failed)) continue; // in use, or still loading
      entry.texture?.dispose();
      cache.delete(key);
    }

    const shownKey = [...draw.keys()].sort().join(",");
    if (shownKey !== lastRef.current.shown) {
      lastRef.current.shown = shownKey;
      setShown([...draw.values()]);
    }
  });

  // Free all tile textures when the layer goes away.
  useEffect(() => {
    const cache = cacheRef.current;
    return () => {
      for (const entry of cache.values()) entry.texture?.dispose();
      cache.clear();
    };
  }, []);

  return shown.map((t) => <Tile key={tileKey(t)} tile={t} radius={tileRadius(earthRadius, t.z)} />);
}

// One tile: a curved patch of sphere covering the tile's lat/lon box.
function Tile({ tile, radius }) {
  const geometry = useMemo(() => {
    const b = tileBounds(tile.z, tile.row, tile.col);
    const rad = Math.PI / 180;
    // Same layout as the globe's sphere: longitude -180° is phi 0, the North Pole is theta 0.
    return new SphereGeometry(radius, 16, 16, (b.west + 180) * rad, (b.east - b.west) * rad, (90 - b.north) * rad, (b.north - b.south) * rad);
  }, [tile.z, tile.row, tile.col, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      {/* Same material as the globe, so day/night lighting looks the same. */}
      <meshStandardMaterial map={tile.texture} roughness={1} />
    </mesh>
  );
}
