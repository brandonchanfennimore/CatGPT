/*
 * Zoom bar at the top of the screen, like a camera's zoom indicator:
 *
 *     −  |---------o-----------|  +   2.4×
 *
 * Two parts, because the bar is normal HTML but the zoom level lives in the 3D scene:
 *  - <ZoomBar>     the HTML bar (outside the <Canvas>).
 *  - <ZoomReadout> runs inside the <Canvas>, reads the camera distance every frame
 *                  and moves the knob directly (no React re-render, so it's cheap).
 * It follows every kind of zoom: hand gesture, mouse wheel, and touch pinch.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils } from "three";

export function ZoomBar({ barRef }) {
  return (
    <div
      className="zoom-bar"
      ref={barRef}
      role="meter"
      aria-label="Zoom level"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className="zoom-end" aria-hidden="true">−</span>
      <div className="zoom-track">
        <div className="zoom-knob" />
      </div>
      <span className="zoom-end" aria-hidden="true">+</span>
      <span className="zoom-value">1.0×</span>
    </div>
  );
}

export function ZoomReadout({ barRef }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const startDistance = useRef(null); // the starting view counts as "1.0×"
  const lastT = useRef(-1);

  useFrame(() => {
    const bar = barRef.current;
    if (!bar || !controls) return;

    const d = camera.position.distanceTo(controls.target);
    startDistance.current ??= d;

    // Knob position 0..1: 0 = farthest allowed, 1 = closest allowed.
    // Logarithmic, so each step of zoom moves the knob by the same amount
    // (like a real camera: 1× -> 2× looks as big as 2× -> 4×).
    const { minDistance, maxDistance } = controls;
    const t = MathUtils.clamp(Math.log(maxDistance / d) / Math.log(maxDistance / minDistance), 0, 1);

    if (Math.abs(t - lastT.current) < 0.001) return; // unchanged: skip DOM work
    lastT.current = t;
    bar.style.setProperty("--zoom", t); // CSS uses this to place the knob
    bar.setAttribute("aria-valuenow", Math.round(t * 100)); // for screen readers
    bar.querySelector(".zoom-value").textContent = `${(startDistance.current / d).toFixed(1)}×`;
  });

  return null;
}
