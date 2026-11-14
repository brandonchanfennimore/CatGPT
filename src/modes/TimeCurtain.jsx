/*
 * TimeCurtain - Time mode: a before/after "curtain" over a site's radar images.
 * The older image shows LEFT of a vertical divider, the newer image RIGHT of it.
 *
 * Three parts:
 *  - <TimeCurtain> (inside <Canvas>): one radar patch on the globe with both
 *    images. A small shader picks, pixel by pixel, the older image if the pixel
 *    is left of the divider on screen, otherwise the newer one. (The three.js
 *    version of Cesium's splitDirection + scene.splitPosition.)
 *  - <CurtainDivider> (HTML): the vertical line with a handle you can drag.
 *  - <CurtainDates> (HTML): the two dates being compared, at the top.
 *
 * Control:
 *  - Open palm: the divider follows your hand sideways.
 *  - Fast palm swipe: next/previous date pair (with a cooldown: one swipe = one step).
 *  - Mouse: drag the handle. Arrow keys ← / → step through date pairs (see App.jsx).
 *
 * The divider position lives in splitRef.current.x (0 = left edge, 1 = right edge).
 * Tuning numbers live in ../tuning.js.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { MathUtils, SRGBColorSpace, TextureLoader } from "three";
import { CURTAIN_SMOOTHING, POINTER_GAIN } from "../tuning";
import { createCurtainTracker } from "./curtain";
import { patchArgs, patchVertexShader } from "./radarPatch";

const fragmentShader = /* glsl */ `
  uniform sampler2D uBefore; // older image
  uniform sampler2D uAfter;  // newer image
  uniform float uSplitX;     // divider position, in screen pixels from the left
  uniform float uReady;      // 0 until both images have loaded
  varying vec2 vUv;
  void main() {
    if (uReady < 0.5) discard;
    // gl_FragCoord.x = this pixel's position on screen, counted from the left.
    vec4 color = gl_FragCoord.x < uSplitX ? texture2D(uBefore, vUv) : texture2D(uAfter, vUv);
    gl_FragColor = color;
    #include <colorspace_fragment>
  }
`;

/** Load every image of a site once (so stepping through dates is instant). */
function useTextures(urls) {
  const [textures, setTextures] = useState({});
  const key = urls.join("|");
  useEffect(() => {
    const loaded = {};
    let cancelled = false;
    const loader = new TextureLoader();
    for (const url of key.split("|")) {
      loader.load(url, (t) => {
        t.colorSpace = SRGBColorSpace;
        loaded[url] = t;
        if (!cancelled) setTextures({ ...loaded });
      });
    }
    return () => {
      cancelled = true;
      for (const t of Object.values(loaded)) t.dispose(); // free GPU memory
    };
  }, [key]);
  return textures;
}

export function TimeCurtain({ area, pair, gestureRef, splitRef, dividerRef, onStep }) {
  const gl = useThree((s) => s.gl);
  const material = useRef(null);
  const geometryArgs = useMemo(() => patchArgs(area.bounds), [area.bounds]);
  const textures = useTextures(area.observations.map((o) => o.image));
  const tracker = useMemo(() => createCurtainTracker(), []);

  const before = textures[area.observations[pair]?.image] ?? null;
  const after = textures[area.observations[pair + 1]?.image] ?? null;

  const uniforms = useMemo(
    () => ({ uBefore: { value: null }, uAfter: { value: null }, uSplitX: { value: 0 }, uReady: { value: 0 } }),
    []
  );

  useFrame(() => {
    const split = splitRef.current;
    const g = gestureRef.current;

    // Open palm: follow it sideways, or step dates on a fast swipe.
    const palm = g.mode === "rotate" ? g.palm : null;
    const { step, follow } = tracker(palm, performance.now());
    if (step) onStep(step);
    if (follow !== null && !split.dragging) {
      // Magnify around the centre (like the radar lens), so the screen edges are reachable.
      const target = MathUtils.clamp(0.5 + (follow - 0.5) * POINTER_GAIN, 0, 1);
      split.x += CURTAIN_SMOOTHING * (target - split.x);
    }

    // Shader inputs. The canvas's real pixel width can differ from its CSS width
    // on high-resolution (Retina) screens, so use gl.domElement.width here.
    const u = material.current?.uniforms;
    if (u) {
      u.uBefore.value = before;
      u.uAfter.value = after;
      u.uReady.value = before && after ? 1 : 0;
      u.uSplitX.value = split.x * gl.domElement.width;
    }

    // Move the HTML divider line to match.
    if (dividerRef.current) dividerRef.current.style.transform = `translateX(${(split.x * 100).toFixed(2)}vw)`;
  });

  return (
    <mesh renderOrder={1}>
      <sphereGeometry args={geometryArgs} />
      <shaderMaterial
        ref={material}
        vertexShader={patchVertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/** The vertical divider line with a draggable handle (mouse/touch fallback). */
export function CurtainDivider({ dividerRef, splitRef }) {
  const drag = {
    onPointerDown(e) {
      e.currentTarget.setPointerCapture(e.pointerId); // keep dragging even off the handle
      splitRef.current.dragging = true;
    },
    onPointerMove(e) {
      if (!splitRef.current.dragging) return;
      splitRef.current.x = MathUtils.clamp(e.clientX / window.innerWidth, 0, 1);
    },
    onPointerUp() {
      splitRef.current.dragging = false;
    },
  };
  drag.onPointerCancel = drag.onPointerUp;

  return (
    <div className="curtain-divider" ref={dividerRef}>
      <button type="button" className="curtain-handle" aria-label="Drag to compare the two dates" {...drag}>
        ⟷
      </button>
    </div>
  );
}

/** The two dates being compared, at the top of the screen. */
export function CurtainDates({ area, pair }) {
  const before = area.observations[pair];
  const after = area.observations[pair + 1];
  const pairs = area.observations.length - 1;
  if (!before || !after) return <div className="curtain-dates">This site needs at least two dates.</div>;
  return (
    <div className="curtain-dates" aria-live="polite">
      {/* `key` changes with the pair, so React re-creates the text and its CSS animation replays. */}
      <span key={`b${pair}`} className="curtain-date">
        ◀ {before.date}
      </span>
      <span className="curtain-vs">vs</span>
      <span key={`a${pair}`} className="curtain-date">
        {after.date} ▶
      </span>
      <span className="curtain-count">
        {pair + 1} / {pairs}
      </span>
    </div>
  );
}
