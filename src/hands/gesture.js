/*
 * gesture.js - turns raw hand landmarks into camera commands.
 *
 * MediaPipe gives 21 points per hand, each with x, y in 0..1
 * (fraction of the video width/height, y grows downward):
 *
 *   0 = wrist
 *   thumb  1 2 3 4(tip)      index 5 6 7 8(tip)     middle 9 10 11 12(tip)
 *   ring  13 14 15 16(tip)   pinky 17 18 19 20(tip)
 *   (for fingers: 5/9/13/17 = knuckle, 6/10/14/18 = middle joint "PIP")
 *
 * Gestures (one hand only):
 *   open palm + move          -> 'rotate'
 *   index finger + move L/R   -> 'zoom' (right = closer, left = farther)
 *   pinch (thumb + index tips) -> 'pinch' (nothing moves)...
 *     ...then open the pinch   -> `select: true` once: "click" the marker in the middle
 *   fist (or any other shape) -> 'release' (nothing moves)
 *   no hand                   -> 'none'
 *
 * This file has no React or MediaPipe code, so it can be tested with plain Node
 * (see gesture.check.js).
 */

// ---- Tuning knobs: change these if gestures feel too twitchy or too sticky ----

// A finger counts as "extended" when its tip is this much farther from the wrist
// than its middle joint (1.15 = 15% farther). Raise it if bent fingers count as straight.
export const EXTEND_RATIO = 1.15;

// Smoothing (0..1). Lower = smoother but laggier. Higher = snappier but jittery.
export const SMOOTHING = 0.4;

// Dead zone: movements smaller than this (fraction of the video size) are ignored.
// This removes the small shaking that hand tracking always has.
export const DEAD_ZONE = 0.004;

// "Fling": when a rotate ends (hand leaves the camera or changes shape), we report
// the hand's recent speed so the globe can keep spinning like a wheel and slow down.
// Speed is in video-widths per second. Slower than this = no fling.
export const MIN_FLING_SPEED = 0.15;
// How quickly the speed estimate follows the hand (0..1). Lower = steadier.
export const VELOCITY_SMOOTHING = 0.5;

// Pinch = thumb tip close to index tip, measured relative to hand size (so it
// works near or far from the camera). Two thresholds ("hysteresis"): a pinch
// STARTS below PINCH_ON but only ENDS above PINCH_OFF, so it can't flicker.
export const PINCH_ON = 0.25;
export const PINCH_OFF = 0.45;
// In a real pinch the index fingertip is out in front of the palm. In a fist it's
// tucked in near the wrist, so a fist (whose thumb is also near the index) doesn't count.
export const PINCH_MIN_REACH = 0.9; // index tip at least this many hand-sizes from the wrist
// Hold the pinch at least this long before opening it counts as a "click".
export const PINCH_MIN_HOLD_MS = 150;

// ---------------------------------------------------------------------------

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// The webcam preview is shown mirrored (like a selfie), so we mirror x here too.
// Then "hand moves right" means x increases, matching what you see.
const mirror = (p) => ({ x: 1 - p.x, y: p.y });

// [tip, middle joint] for index, middle, ring, pinky. (The thumb is ignored:
// people hold it in all sorts of ways.)
const FINGERS = [[8, 6], [12, 10], [16, 14], [20, 18]];

/**
 * Classify one hand as 'pinch', 'open', 'point', 'fist' or 'other'.
 * wasPinching: was this hand pinching last frame? (for hysteresis)
 */
export function classifyHand(lm, wasPinching = false) {
  // Hand size = wrist to middle-finger knuckle, so thresholds don't depend on distance.
  const size = dist(lm[0], lm[9]) || 1e-6;
  const pinchGap = dist(lm[4], lm[8]) / size;
  const reach = dist(lm[8], lm[0]) / size;
  if (pinchGap < (wasPinching ? PINCH_OFF : PINCH_ON) && reach > PINCH_MIN_REACH) return 'pinch';

  // Is each finger straight? Compare tip and middle-joint distance from the wrist.
  const [index, middle, ring, pinky] = FINGERS.map(
    ([tip, pip]) => dist(lm[tip], lm[0]) > dist(lm[pip], lm[0]) * EXTEND_RATIO
  );
  if (index && middle && ring && pinky) return 'open';
  if (index && !middle && !ring && !pinky) return 'point';
  if (!index && !middle && !ring && !pinky) return 'fist';
  return 'other'; // e.g. a peace sign, or a hand halfway between shapes
}

/**
 * Create a gesture tracker for ONE hand. It remembers the previous frame so it
 * can report how far the hand MOVED (deltas), with smoothing and a dead zone.
 *
 * Call the returned function once per video frame with MediaPipe's
 * `result.landmarks` (an array of hands; only the first is used) and the frame
 * time in milliseconds. It returns:
 *   { mode, dx, dy, fling, select }
 *   mode:   'none' | 'release' | 'pinch' | 'rotate' | 'zoom'
 *   dx, dy: how far the tracked point moved this frame (fraction of the video size)
 *   fling:  only on the frame a rotate ends: {x, y} speed of the hand, else null
 *   select: true only on the frame a held pinch opens (the hand is still in view)
 */
export function createGestureTracker() {
  let mode = 'none';
  let smooth = null; // smoothed position {x, y} of the point we follow
  let prev = null; // last position we reported movement from
  let vel = { x: 0, y: 0 }; // smoothed hand speed (per second), used for fling
  let lastTime = null;
  let pinchStart = null; // when the current pinch began (ms), or null

  return function update(hands = [], timeMs = performance.now()) {
    const dt = lastTime === null ? 0 : (timeMs - lastTime) / 1000; // seconds since last frame
    lastTime = timeMs;

    // Pick the mode and the point we follow for that mode.
    const hand = hands[0];
    const kind = hand ? classifyHand(hand, mode === 'pinch') : null;

    // Pinch "click": a pinch held long enough, then opened while the hand is still visible.
    let select = false;
    if (kind === 'pinch') {
      pinchStart ??= timeMs;
    } else {
      select = pinchStart !== null && hand !== undefined && timeMs - pinchStart >= PINCH_MIN_HOLD_MS;
      pinchStart = null;
    }

    let newMode, raw;
    if (kind === 'pinch') {
      newMode = 'pinch';
      raw = null; // a pinch never moves the camera
    } else if (kind === 'open') {
      newMode = 'rotate';
      raw = mirror(hand[9]); // middle knuckle = roughly the palm centre
    } else if (kind === 'point') {
      newMode = 'zoom';
      raw = mirror(hand[8]); // index fingertip
    } else {
      newMode = hand ? 'release' : 'none';
      raw = null;
    }

    // Mode changed (or released)? Start fresh so the camera doesn't jump.
    if (newMode !== mode || !raw) {
      // A rotate just ended while the hand was still moving? Hand over its speed.
      const flinging = mode === 'rotate' && Math.hypot(vel.x, vel.y) > MIN_FLING_SPEED;
      const fling = flinging ? { ...vel } : null;
      mode = newMode;
      smooth = raw && { ...raw };
      prev = raw && { ...raw };
      vel = { x: 0, y: 0 };
      return { mode, dx: 0, dy: 0, fling, select };
    }

    // Exponential smoothing: move part of the way toward the new value each frame.
    smooth.x += SMOOTHING * (raw.x - smooth.x);
    smooth.y += SMOOTHING * (raw.y - smooth.y);

    // Dead zone: ignore tiny movement. We keep `prev` where it was, so slow,
    // steady movement still adds up and eventually counts.
    let dx = smooth.x - prev.x;
    let dy = smooth.y - prev.y;
    if (Math.hypot(dx, dy) < DEAD_ZONE) {
      dx = dy = 0;
    } else {
      prev = { ...smooth };
    }

    // Speed estimate = movement / time, smoothed. Holding still pulls it toward 0,
    // so stopping before you let go does NOT fling.
    if (dt > 0) {
      vel.x += VELOCITY_SMOOTHING * (dx / dt - vel.x);
      vel.y += VELOCITY_SMOOTHING * (dy / dt - vel.y);
    }

    return { mode, dx, dy, fling: null, select };
  };
}
