/*
 * HandCameraControls - lives inside the <Canvas>. Every frame it reads the
 * latest hand movement (written by HandTracker) and moves the camera.
 *
 * The camera only ever orbits around the Earth's centre and looks straight at it,
 * so the Earth always stays in the middle of the screen. Mouse/touch
 * OrbitControls stay in charge too (panning is turned off in App.jsx); we only
 * nudge the camera position and call controls.update(), so both work together.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, Spherical, Vector3 } from "three";
import { openMarkerNearestCenter } from "../markers";

// Tuning knobs
const ROTATE_SPEED = 4; // radians per full video width, at 1 Earth radius above the surface
const ZOOM_SPEED = 3; // how strongly sliding your pointing finger left/right zooms
// After a fling, how fast the spin slows down (per second). Higher = stops sooner.
// With 3, the speed halves about every 0.23 s.
const COAST_FRICTION = 3;

// Scratch objects reused every frame (avoids creating garbage 60 times a second).
const spherical = new Spherical();
const offset = new Vector3();

export default function HandCameraControls({ gestureRef, earthRadius, paused = false }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls); // set by <OrbitControls makeDefault />
  const coast = useRef({ x: 0, y: 0 }); // leftover spin speed after a fling (video-widths/s)

  // Grabbing the globe with the mouse/touch stops any coasting spin.
  useEffect(() => {
    if (!controls) return;
    const stopCoast = () => (coast.current = { x: 0, y: 0 });
    controls.addEventListener("start", stopCoast);
    return () => controls.removeEventListener("start", stopCoast);
  }, [controls]);

  // Runs every frame, AFTER OrbitControls.update() (drei runs that at priority -1).
  // `delta` = seconds since the last frame.
  useFrame((_, delta) => {
    // Paused (info view open): leave the gestures for the info view to use.
    if (!controls || paused) return;
    const g = gestureRef.current;

    // Two-finger swipe up: "click" the marker closest to the middle of the screen.
    if (g.select) {
      g.select = false;
      openMarkerNearestCenter(camera);
    }

    // A rotate just ended with the hand moving: start coasting at that speed.
    if (g.fling) {
      coast.current = g.fling;
      g.fling = null;
    }
    // Rotating or zooming by hand "grabs" the wheel and stops the coast.
    if (g.mode === "rotate" || g.mode === "zoom") coast.current = { x: 0, y: 0 };

    // Rotation this frame = hand movement + coasting spin.
    const c = coast.current;
    const handRotates = g.mode === "rotate";
    const rotX = (handRotates ? g.dx : 0) + c.x * delta;
    const rotY = (handRotates ? g.dy : 0) + c.y * delta;
    const zoom = g.mode === "zoom" ? g.dx : 0; // pointing finger: left/right

    // Friction: shrink the coasting speed a bit every frame, like a wheel slowing down.
    // Math.exp makes the slow-down the same no matter the frame rate.
    const decay = Math.exp(-COAST_FRICTION * delta);
    c.x *= decay;
    c.y *= decay;
    if (Math.hypot(c.x, c.y) < 0.01) c.x = c.y = 0; // close enough to stopped

    if (rotX || rotY || zoom) {
      // Describe the camera position as "spherical coordinates" around the Earth's centre:
      // radius = distance, theta = angle around the vertical axis, phi = angle from the north pole.
      offset.copy(camera.position).sub(controls.target);
      spherical.setFromVector3(offset);

      if (rotX || rotY) {
        // Slow down near the surface so small hand moves don't fling you across the planet.
        const altitude = (spherical.radius - earthRadius) / earthRadius;
        // Minus signs = "grab" feel: the surface follows your hand.
        spherical.theta -= rotX * ROTATE_SPEED * altitude;
        spherical.phi -= rotY * ROTATE_SPEED * altitude;
        spherical.phi = MathUtils.clamp(spherical.phi, 0.05, Math.PI - 0.05); // don't flip over the poles
      }
      if (zoom) {
        // Finger moving right (dx > 0) = move closer; left = move away.
        spherical.radius *= MathUtils.clamp(1 - zoom * ZOOM_SPEED, 0.5, 1.5);
        spherical.radius = MathUtils.clamp(spherical.radius, controls.minDistance, controls.maxDistance);
      }

      offset.setFromSpherical(spherical);
      camera.position.copy(controls.target).add(offset);
      controls.update(); // re-aims the camera at the Earth's centre
    }
    // Movement consumed. Always clear it, so unused movement can't pile up
    // and cause a jump later.
    g.dx = g.dy = 0;
  });

  return null;
}
