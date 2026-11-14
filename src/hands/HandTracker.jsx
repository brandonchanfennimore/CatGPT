/*
 * HandTracker - the webcam panel in the corner.
 *  1. "Start camera" button (browsers only allow the camera after a click).
 *  2. Runs MediaPipe HandLandmarker on each video frame.
 *  3. Draws the hand skeleton over the preview.
 *  4. Turns landmarks into gestures and writes the movement into `gesture.current`,
 *     which HandCameraControls reads inside the 3D scene.
 */
import { DrawingUtils, FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import { createGestureTracker } from "./gesture";

// The WASM runtime must match the installed package version (see package.json).
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const LABELS = { none: "No hand", open: "Open hand (released)", rotate: "Rotate", zoom: "Zoom", tilt: "Tilt" };

export default function HandTracker({ gesture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cleanupRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | loading | running | error
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("none");

  // Stop the camera and model when the component goes away.
  useEffect(() => () => cleanupRef.current?.(), []);

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
        numHands: 2,
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
        const result = landmarker.detectForVideo(video, performance.now());

        // Draw the skeleton: lines between joints, dots on joints.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const hand of result.landmarks) {
          draw.drawConnectors(hand, HandLandmarker.HAND_CONNECTIONS, { color: "#4fd1ff", lineWidth: 3 });
          draw.drawLandmarks(hand, { color: "#ffffff", radius: 3 });
        }

        // Add this frame's movement to whatever the 3D scene hasn't used yet.
        const g = track(result.landmarks);
        const shared = gesture.current;
        shared.mode = g.mode;
        shared.dx += g.dx;
        shared.dy += g.dy;
        shared.dSpread += g.dSpread;

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

  function fail(text) {
    setState("error");
    setMessage(text);
  }

  return (
    <div className="hand-panel">
      <div className="hand-preview" hidden={state !== "running"}>
        {/* Both are mirrored with CSS so it looks like a mirror, matching gesture.js. */}
        <video ref={videoRef} playsInline muted />
        <canvas ref={canvasRef} />
      </div>

      {state === "running" ? (
        <p className="hand-status">
          Gesture: <strong>{LABELS[mode]}</strong>
        </p>
      ) : (
        <button onClick={start} disabled={state === "loading"}>
          {state === "loading" ? "Starting…" : "Start camera"}
        </button>
      )}
      {message && <p className="hand-error">{message}</p>}

      <ul className="hand-guide">
        <li>🤏 One hand pinch + move: rotate</li>
        <li>🤏🤏 Two hands pinch, apart/together: zoom</li>
        <li>✊ Fist + move up/down: tilt</li>
        <li>🖐️ Open hand: release</li>
      </ul>
    </div>
  );
}
