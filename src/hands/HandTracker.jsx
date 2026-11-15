/*
 * HandTracker - the webcam panel in the corner.
 *  0. A drag handle: drop the panel anywhere and it snaps to the nearest corner.
 *  1. Start/Stop button (browsers only allow the camera after a click).
 *  2. Runs MediaPipe HandLandmarker on each video frame.
 *  3. Draws the hand skeleton over the preview.
 *  4. Turns landmarks into gestures and writes the movement into `gestureRef.current`,
 *     which HandCameraControls reads inside the 3D scene.
 */
import { DrawingUtils, FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createGestureTracker } from "./gesture";

// The WASM runtime must match the installed package version (see package.json).
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// What each hand shape does in each context: the label shown while you make it,
// and the guide list under the webcam. Same hand shapes, different jobs.
const CONTEXTS = {
  explore: {
    labels: { none: "No hand", release: "Paused", swipe: "Two fingers: swipe up to open", rotate: "Rotate", zoom: "Zoom", settings: "View settings" },
    guide: [
      "🖐️ Open palm + move: rotate (swipe out of view to spin)",
      "☝️ Point + move right/left: zoom in/out",
      "✊ Fist: pause",
      "✌️ Two fingers, swipe up: open the marker in the middle",
      "🤙 Pinky up + move down/up: pick a view setting or event type, right: switch it",
    ],
  },
  info: {
    labels: { none: "No hand", release: "Paused", swipe: "Two fingers: swipe up to go back", rotate: "Scroll", zoom: "Pictures / view", settings: "Paused" },
    guide: [
      "🖐️ Open palm + move up/down: scroll",
      "☝️ Point + move right/left: next/previous picture",
      "☝️ Point + move down/up: normal/radar view",
      "✊ Fist: pause",
      "✌️ Two fingers, swipe up: back to Earth",
    ],
  },
};

// context: "explore", or "info" (a study area's full info view is open).
// onHelp: shows the gesture tutorial ("?" button). ref.current.start() starts the camera
// (the tutorial's "Start camera" button uses it). onRunningChange(true/false): camera on/off.
export default function HandTracker({ gestureRef, context = "explore", onHelp, onRunningChange, ref }) {
  const ui = CONTEXTS[context] ?? CONTEXTS.explore; // unknown context: fall back to Explore
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cleanupRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | loading | running | error
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("none");
  const panelRef = useRef(null);
  const dragHandle = useCornerSnap(panelRef);

  // Stop the camera and model when the component goes away.
  useEffect(() => () => cleanupRef.current?.(), []);

  // Tell the app when hand control is on (the info pop-up then shows gesture hints).
  const running = state === "running";
  useEffect(() => onRunningChange?.(running), [running, onRunningChange]);

  useImperativeHandle(ref, () => ({ start: () => state === "idle" || state === "error" ? start() : undefined }));

  async function start() {
    setState("loading");
    setMessage("");

    // Camera API only exists on secure pages (https:// or localhost).
    if (!navigator.mediaDevices?.getUserMedia) {
      return fail("Camera needs a secure page: open the site on localhost or https://.");
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    } catch (err) {
      if (err.name === "NotAllowedError") {
        return fail(
          "Camera access was blocked. Click the camera icon in the address bar, allow it, then try again. Mouse and touch still work."
        );
      }
      if (err.name === "NotFoundError") return fail("No camera found. You can still use mouse and touch.");
      return fail(`Could not start the camera (${err.name}).`);
    }

    let landmarker;
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO", // optimised for a stream of frames
        numHands: 1, // one-hand controls: a second hand is ignored
      });
    } catch (err) {
      stream.getTracks().forEach((t) => t.stop());
      console.error(err);
      return fail("Could not load the hand-tracking model. Check your internet connection.");
    }

    const video = videoRef.current;
    video.srcObject = stream;
    await video.play();

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    const draw = new DrawingUtils(ctx);
    const track = createGestureTracker();
    let lastTime = -1;
    let lastMode = "none";
    let frame;

    const loop = () => {
      // Only run the model when the video shows a new frame.
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        const now = performance.now();
        const result = landmarker.detectForVideo(video, now);

        // Draw the skeleton: lines between joints, dots on joints.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const hand of result.landmarks) {
          draw.drawConnectors(hand, HandLandmarker.HAND_CONNECTIONS, { color: "#4fd1ff", lineWidth: 3 });
          draw.drawLandmarks(hand, { color: "#ffffff", radius: 3 });
        }

        // Add this frame's movement to whatever the 3D scene hasn't used yet.
        const g = track(result.landmarks, now);
        const shared = gestureRef.current;
        shared.mode = g.mode;
        if (g.mode === "settings") {
          // Pinky movement goes to its own "mailbox" (read by the View settings panel),
          // so the globe never moves with it.
          shared.sx = (shared.sx ?? 0) + g.dx;
          shared.sy = (shared.sy ?? 0) + g.dy;
        } else {
          shared.dx += g.dx;
          shared.dy += g.dy;
        }
        if (g.fling) shared.fling = g.fling; // HandCameraControls turns this into a coasting spin
        if (g.select) shared.select = true; // HandCameraControls opens the marker in the middle

        // Only re-render React when the label actually changes.
        if (g.mode !== lastMode) setMode((lastMode = g.mode));
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    cleanupRef.current = () => {
      cancelAnimationFrame(frame);
      stream.getTracks().forEach((t) => t.stop());
      landmarker.close();
    };
    setState("running");
  }

  function stop() {
    cleanupRef.current?.(); // stops the camera light, the loop and the model
    cleanupRef.current = null;
    videoRef.current.srcObject = null;
    // Clear any leftover movement so the globe doesn't keep drifting.
    gestureRef.current = { mode: "none", dx: 0, dy: 0 };
    setMode("none");
    setState("idle");
  }

  function fail(text) {
    setState("error");
    setMessage(text);
  }

  return (
    <div className="hand-panel" ref={panelRef} data-corner={dragHandle.corner}>
      {/* Top bar: drag handle on the left, Start/Stop on the right. */}
      <div className="hand-header">
        <button
          type="button"
          className="hand-drag"
          aria-label="Move panel. Drag it, or use arrow keys to pick a corner."
          title="Drag to move"
          {...dragHandle.props}
        >
          {/* "Grip" icon: six dots */}
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            {[4, 8, 12].map((y) =>
              [6, 10].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="currentColor" />)
            )}
          </svg>
        </button>
        <div className="hand-actions">
          {onHelp && (
            <button type="button" className="hand-help" onClick={onHelp} aria-label="How to use hand gestures" title="How to use hand gestures">
              ?
            </button>
          )}
          {state === "running" ? (
            <button type="button" className="hand-toggle stop" onClick={stop}>
              Stop
            </button>
          ) : (
            <button type="button" className="hand-toggle start" onClick={start} disabled={state === "loading"}>
              {state === "loading" ? "Starting…" : "Start"}
            </button>
          )}
        </div>
      </div>

      <div className="hand-preview" hidden={state !== "running"}>
        {/* Both are mirrored with CSS so it looks like a mirror, matching gesture.js. */}
        <video ref={videoRef} playsInline muted />
        <canvas ref={canvasRef} />
      </div>

      {state === "running" && (
        <p className="hand-status">
          Gesture: <strong>{ui.labels[mode]}</strong>
        </p>
      )}
      {message && <p className="hand-error">{message}</p>}

      <ul className="hand-guide">
        {ui.guide.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

/*
 * useCornerSnap - lets the user drag the panel and "magnetically" snaps it to the
 * nearest screen corner on release.
 *
 * How: the corner is stored in React state and CSS anchors the panel there
 * (see [data-corner] in index.css). While dragging, we only move the panel
 * visually with a CSS transform. On release we pick the corner closest to the
 * panel's centre, then animate from where it was dropped into the corner
 * (the "FLIP" trick: measure First, switch to Last, Invert with a transform, Play).
 */
function useCornerSnap(panelRef) {
  const [corner, setCorner] = useState("br"); // t/b = top/bottom, l/r = left/right
  const dragStart = useRef(null);

  function snapTo(next) {
    const panel = panelRef.current;
    const before = panel.getBoundingClientRect(); // where it is now (maybe mid-drag)
    flushSync(() => setCorner(next)); // apply the new corner to the DOM right away
    panel.style.transition = "none";
    panel.style.transform = "none";
    const after = panel.getBoundingClientRect(); // where the corner puts it
    // Jump back visually to where it was...
    panel.style.transform = `translate(${before.left - after.left}px, ${before.top - after.top}px)`;
    panel.getBoundingClientRect(); // force the browser to apply that before animating
    // ...then glide into the corner. The curve overshoots a little = "magnetic" feel.
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel.style.transition = reduceMotion ? "none" : "transform 0.35s cubic-bezier(0.2, 1.3, 0.4, 1)";
    panel.style.transform = "";
  }

  const props = {
    onPointerDown(e) {
      e.currentTarget.setPointerCapture(e.pointerId); // keep receiving moves outside the handle
      dragStart.current = { x: e.clientX, y: e.clientY };
      panelRef.current.style.transition = "none";
    },
    onPointerMove(e) {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      panelRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    },
    onPointerUp() {
      if (!dragStart.current) return;
      dragStart.current = null;
      const r = panelRef.current.getBoundingClientRect();
      const top = r.top + r.height / 2 < innerHeight / 2;
      const left = r.left + r.width / 2 < innerWidth / 2;
      snapTo((top ? "t" : "b") + (left ? "l" : "r"));
    },
    // Keyboard users: arrow keys move the panel to another corner.
    onKeyDown(e) {
      const keys = { ArrowUp: "t" + corner[1], ArrowDown: "b" + corner[1], ArrowLeft: corner[0] + "l", ArrowRight: corner[0] + "r" };
      if (keys[e.key] && keys[e.key] !== corner) {
        e.preventDefault();
        snapTo(keys[e.key]);
      }
    },
  };
  props.onPointerCancel = props.onPointerUp;

  return { corner, props };
}
