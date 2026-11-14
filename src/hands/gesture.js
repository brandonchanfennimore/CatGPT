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
 * This file has no React or MediaPipe code, so it can be tested with plain Node
 * (see gesture.check.js).
 */

// ---- Tuning knobs: change these if gestures feel too twitchy or too sticky ----

// Pinch = thumb tip close to index tip, measured relative to hand size,
// so it works whether your hand is near or far from the camera.
// Two thresholds ("hysteresis"): a pinch STARTS below PINCH_ON but only ENDS
// above PINCH_OFF. This stops flickering when your fingers hover at the edge.
export const PINCH_ON = 0.35;
export const PINCH_OFF = 0.5;

// Smoothing (0..1). Lower = smoother but laggier. Higher = snappier but jittery.
export const SMOOTHING = 0.4;

// Dead zone: movements smaller than this (fraction of the video size) are ignored.
// This removes the small shaking that hand tracking always has.
export const DEAD_ZONE = 0.004;

// "Fling": when a rotate ends (hand leaves the camera or opens), we report the
// hand's recent speed so the globe can keep spinning like a wheel and slow down.
// Speed is in video-widths per second. Slower than this = no fling.
export const MIN_FLING_SPEED = 0.15;
// How quickly the speed estimate follows the hand (0..1). Lower = steadier.
export const VELOCITY_SMOOTHING = 0.5;

// ---------------------------------------------------------------------------

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// The webcam preview is shown mirrored (like a selfie), so we mirror x here too.
// Then "hand moves right" means x increases, matching what you see.
const mirror = (p) => ({ x: 1 - p.x, y: p.y });

/**
 * Classify one hand as 'pinch', 'fist' or 'open'.
 * wasPinching: was this hand pinching last frame? (for hysteresis)
 */
export function classifyHand(lm, wasPinching = false) {
  // Hand size = wrist to middle-finger knuckle. Used to make thresholds scale-free.
  const size = dist(lm[0], lm[9]) || 1e-6;

  // A finger is "curled" when its tip is closer to the wrist than its middle joint.
  const curled = [[8, 6], [12, 10], [16, 14], [20, 18]]
    .every(([tip, pip]) => dist(lm[tip], lm[0]) < dist(lm[pip], lm[0]));
  if (curled) return 'fist';

  const pinchRatio = dist(lm[4], lm[8]) / size;
  if (pinchRatio < (wasPinching ? PINCH_OFF : PINCH_ON)) return 'pinch';

  return 'open';
}

/**
 * Create a gesture tracker for ONE hand. It remembers the previous frame so it
 * can report how far the hand MOVED (deltas), with smoothing and a dead zone.
 *
 *   pinch + move  -> 'rotate'
 *   fist + move   -> 'zoom' (up = closer, down = farther)
 *   open hand     -> 'open' (released, nothing moves)
 *   no hand       -> 'none'
 *
 * Call the returned function once per video frame with MediaPipe's
 * `result.landmarks` (an array of hands; only the first is used) and the frame
 * time in milliseconds. It returns:
 *   { mode, dx, dy, fling }
 *   dx, dy: how far the hand moved this frame (fraction of the video size)
 *   fling:  only on the frame a rotate ends: {x, y} speed of the hand, else null
 */
export function createGestureTracker() {
  let mode = 'none';
  let smooth = null; // smoothed hand position {x, y}
  let prev = null; // last position we reported movement from
  let wasPinching = false; // for pinch hysteresis
  let vel = { x: 0, y: 0 }; // smoothed hand speed (per second), used for fling
  let lastTime = null;

  return function update(hands = [], timeMs = performance.now()) {
    const dt = lastTime === null ? 0 : (timeMs - lastTime) / 1000; // seconds since last frame
    lastTime = timeMs;

    // Pick the mode and the hand point we follow for that mode.
    const hand = hands[0];
    const kind = hand ? classifyHand(hand, wasPinching) : null;
    wasPinching = kind === 'pinch';
    let newMode, raw;
    if (kind === 'pinch') {
      newMode = 'rotate';
      raw = pinchPoint(hand);
    } else if (kind === 'fist') {
      newMode = 'zoom';
      raw = mirror(hand[9]); // middle knuckle = roughly the palm centre
    } else {
      newMode = hand ? 'open' : 'none';
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
      return { mode, dx: 0, dy: 0, fling };
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
    // so letting go of a still hand does NOT fling.
    if (dt > 0) {
      vel.x += VELOCITY_SMOOTHING * (dx / dt - vel.x);
      vel.y += VELOCITY_SMOOTHING * (dy / dt - vel.y);
    }

    return { mode, dx, dy, fling: null };
  };
}

// Point between thumb tip and index tip (mirrored).
function pinchPoint(lm) {
  return mirror({ x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2 });
}
