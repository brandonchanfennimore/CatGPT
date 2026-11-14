/*
 * Zoom bar at the top of the screen, like a camera's zoom indicator:
 *
 *     −  |---------o-----------|  +   2.4×
 *
 * Two parts, because the bar is normal HTML but the camera lives in the 3D scene:
 *  - <ZoomBar>     the HTML slider (outside the <Canvas>). Click or drag the track,
 *                  click − / +, or focus it and use the arrow keys. It writes the
 *                  requested zoom (0..1) into `targetRef`.
 *  - <ZoomReadout> runs inside the <Canvas>. Every frame it glides the camera toward
 *                  any requested zoom, then reads the camera distance and moves the
 *                  knob directly (no React re-render, so it's cheap).
 * The knob follows every kind of zoom: this bar, hand gestures, mouse wheel, touch pinch.
 *
 * Zoom level t: 0 = farthest allowed, 1 = closest allowed. It's logarithmic, so
 * each step looks the same (like a real camera: 1× -> 2× feels like 2× -> 4×).
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils } from "three";

const STEP = 0.1; // one − / + click or arrow key = one tick mark
const GLIDE_SPEED = 12; // how fast the camera glides to a new zoom (higher = snappier)

export function ZoomBar({ barRef, targetRef }) {
  const trackRef = useRef(null);

  const setTarget = (t) => (targetRef.current = MathUtils.clamp(t, 0, 1));

  // Where to step from: the zoom we're already gliding to (so quick repeated
  // clicks/keys add up), otherwise the zoom the knob shows now.
  const currentT = () =>
    targetRef.current ?? (parseFloat(barRef.current.style.getPropertyValue("--zoom")) || 0);

  // Turn a mouse/touch x position into a zoom level along the track.
  const tFromPointer = (e) => {
    const r = trackRef.current.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
  };

  const trackEvents = {
    onPointerDown(e) {
      e.currentTarget.setPointerCapture(e.pointerId); // keep dragging even off the bar
      setTarget(tFromPointer(e));
    },
    onPointerMove(e) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) setTarget(tFromPointer(e));
    },
  };

  // Keyboard: arrows step one tick, Home/End jump to the ends.
  function onKeyDown(e) {
    const t = currentT();
    const next = {
      ArrowRight: t + STEP, ArrowUp: t + STEP,
      ArrowLeft: t - STEP, ArrowDown: t - STEP,
      Home: 0, End: 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setTarget(next);
  }

  return (
    <div
      className="zoom-bar"
      ref={barRef}
      role="slider"
      tabIndex={0}
      aria-label="Zoom level"
      aria-valuemin={0}
      aria-valuemax={100}
      onKeyDown={onKeyDown}
    >
      <button type="button" className="zoom-end" tabIndex={-1} aria-hidden="true"
        onClick={() => setTarget(currentT() - STEP)}>
        −
      </button>
      <div className="zoom-track" ref={trackRef} {...trackEvents}>
        <div className="zoom-knob" />
      </div>
      <button type="button" className="zoom-end" tabIndex={-1} aria-hidden="true"
        onClick={() => setTarget(currentT() + STEP)}>
        +
      </button>
      <span className="zoom-value">1.0×</span>
    </div>
  );
}

export function ZoomReadout({ barRef, targetRef }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const startDistance = useRef(null); // the starting view counts as "1.0×"
  const lastT = useRef(-1);

  // Scrolling or dragging the globe with the mouse cancels a glide in progress.
  useEffect(() => {
    if (!controls) return;
    const cancel = () => (targetRef.current = null);
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controls, targetRef]);

  useFrame((_, delta) => {
    const bar = barRef.current;
    if (!bar || !controls) return;
    const { minDistance, maxDistance } = controls;
    const logRange = Math.log(maxDistance / minDistance);
    let d = camera.position.distanceTo(controls.target);
    startDistance.current ??= d;

    // 1. Glide toward a zoom requested by the bar.
    if (targetRef.current !== null) {
      const goal = maxDistance * Math.exp(-targetRef.current * logRange); // t -> distance
      // Move a fraction of the way each frame (in log space, so it feels even).
      const k = 1 - Math.exp(-GLIDE_SPEED * delta);
      d = Math.exp(MathUtils.lerp(Math.log(d), Math.log(goal), k));
      if (Math.abs(Math.log(d / goal)) < 0.001) {
        d = goal;
        targetRef.current = null; // arrived
      }
      // Same direction from the Earth's centre, new distance.
      camera.position.sub(controls.target).setLength(d).add(controls.target);
      controls.update();
    }

    // 2. Show the current zoom on the bar.
    const t = MathUtils.clamp(Math.log(maxDistance / d) / logRange, 0, 1);
    if (Math.abs(t - lastT.current) < 0.001) return; // unchanged: skip DOM work
    lastT.current = t;
    bar.style.setProperty("--zoom", t); // CSS uses this to place the knob
    bar.setAttribute("aria-valuenow", Math.round(t * 100)); // for screen readers
    bar.setAttribute("aria-valuetext", `${(startDistance.current / d).toFixed(1)} times`);
    bar.querySelector(".zoom-value").textContent = `${(startDistance.current / d).toFixed(1)}×`;
  });

  return null;
}
