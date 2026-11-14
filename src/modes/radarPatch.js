/*
 * radarPatch.js - helpers shared by the radar modes (Flashlight and Time).
 *
 * A radar image covers a lat/lon box. To lay it on the globe we use a piece of
 * a sphere (three.js SphereGeometry with start/length angles) covering exactly
 * that box, sitting just above the surface.
 */
import { EARTH_RADIUS } from "../components/Earth";

const DEG = Math.PI / 180;

// Just above the surface (and above the country borders at 1.002), so it never flickers into the Earth.
export const PATCH_RADIUS = EARTH_RADIUS * 1.003;

/**
 * SphereGeometry arguments for a { west, south, east, north } box (degrees).
 * three.js measures "phi" around the equator starting at longitude -180°, and
 * "theta" down from the North Pole, so the box is converted into those angles.
 * The image's top edge lands on `north` and its left edge on `west`.
 */
export function patchArgs({ west, south, east, north }, segments = 64) {
  return [PATCH_RADIUS, segments, segments, (west + 180) * DEG, (east - west) * DEG, (90 - north) * DEG, (north - south) * DEG];
}

// Vertex shader both radar modes use: passes on where in the image each point
// is (vUv) and its direction from the Earth's centre (vDir).
export const patchVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vDir;
  void main() {
    vUv = uv;
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
