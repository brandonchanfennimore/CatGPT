/*
 * AdaptiveNear - keeps the camera's "near" distance right for the current altitude.
 *
 * The camera only draws things farther away than `near`. Zoomed in close (a few
 * tens of km above the ground) the surface is very close, so `near` must be tiny or
 * the ground gets cut off. But a tiny `near` all the time makes the 3D depth test
 * imprecise when zoomed out, so thin layers (borders, radar images) flicker into
 * the Earth. Solution: set `near` from the current altitude every frame.
 */
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";

const NEAR_FRACTION = 0.3; // near = 30% of the distance to the surface below
const NEAR_MIN = 0.0002;
const NEAR_MAX = 1;

export default function AdaptiveNear({ earthRadius }) {
  // useFrame hands us the scene state each frame, including the camera.
  useFrame(({ camera }) => {
    const altitude = camera.position.length() - earthRadius; // Earth is at the origin
    const near = MathUtils.clamp(altitude * NEAR_FRACTION, NEAR_MIN, NEAR_MAX);
    // Only rebuild the projection when it changed noticeably (it's a little work).
    if (Math.abs(near - camera.near) / camera.near > 0.05) {
      camera.near = near;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}
