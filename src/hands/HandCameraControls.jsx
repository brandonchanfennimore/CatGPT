/*
 * HandCameraControls - lives inside the <Canvas>. Every frame it reads the
 * latest gesture movement (written by HandTracker) and moves the camera.
 *
 * The mouse/touch OrbitControls stay in charge of the camera; we only nudge
 * the camera position and call controls.update(), so both work together.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, Spherical, Vector3 } from "three";

// Tuning knobs
const ROTATE_SPEED = 2; // radians per full video width, at 1 Earth radius above the surface
const ZOOM_SPEED = 3; // how strongly spreading your hands zooms
const TILT_SPEED = 2; // radians per full video height

// Scratch objects reused every frame (avoids creating garbage 60 times a second).
const spherical = new Spherical();
const offset = new Vector3();

export default function HandCameraControls({ gestureRef, earthRadius }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls); // set by <OrbitControls makeDefault />
  const tilt = useRef(0); // how far the camera looks up from the Earth's centre

  // Runs every frame, AFTER OrbitControls.update() (drei runs that at priority -1).
  useFrame(() => {
    if (!controls) return;
    const g = gestureRef.current;

    if (g.dx || g.dy || g.dSpread) {
      // Describe the camera position as "spherical coordinates" around the target:
      // radius = distance, theta = angle around the vertical axis, phi = angle from the north pole.
      offset.copy(camera.position).sub(controls.target);
      spherical.setFromVector3(offset);

      if (g.mode === "rotate") {
        // Slow down near the surface so small hand moves don't fling you across the planet.
        const altitude = (spherical.radius - earthRadius) / earthRadius;
        // Minus signs = "grab" feel: the surface follows your hand.
        spherical.theta -= g.dx * ROTATE_SPEED * altitude;
        spherical.phi -= g.dy * ROTATE_SPEED * altitude;
        spherical.phi = MathUtils.clamp(spherical.phi, 0.05, Math.PI - 0.05); // don't flip over the poles
      } else if (g.mode === "zoom") {
        // Hands apart (dSpread > 0) = move closer.
        spherical.radius *= MathUtils.clamp(1 - g.dSpread * ZOOM_SPEED, 0.5, 1.5);
        spherical.radius = MathUtils.clamp(spherical.radius, controls.minDistance, controls.maxDistance);
      } else if (g.mode === "tilt") {
        // Fist moving up (dy < 0) tilts the view up toward the horizon.
        tilt.current -= g.dy * TILT_SPEED;
      }

      offset.setFromSpherical(spherical);
      camera.position.copy(controls.target).add(offset);
      controls.update(); // re-aims the camera at the target
      g.dx = g.dy = g.dSpread = 0; // movement consumed
    }

    // Tilt: OrbitControls always points the camera straight at the Earth's centre,
    // so we re-apply our tilt every frame on top of that. The limit asin(R/d) is the
    // angle to the horizon, so you can tilt until the horizon sits mid-screen.
    const d = camera.position.distanceTo(controls.target);
    const maxTilt = Math.asin(Math.min(1, earthRadius / d));
    tilt.current = MathUtils.clamp(tilt.current, 0, maxTilt);
    camera.rotateX(tilt.current);
  });

  return null;
}
