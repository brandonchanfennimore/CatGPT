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
 * Create a gesture tracker. It remembers the previous frame so it can
 * report how far things MOVED (deltas), with smoothing and a dead zone.
 *
 * Call the returned function once per video frame with MediaPipe's
 * `result.landmarks` (an array of hands). It returns:
 *   { mode, dx, dy, dSpread }
 *   mode:    'none' | 'open' | 'rotate' | 'zoom' | 'tilt'
 *   dx, dy:  how far the controlling hand moved this frame (fraction of video)
 *   dSpread: how much the two pinching hands moved apart (+) or together (-)
 */
export function createGestureTracker() {
  let mode = 'none';
  let smooth = null; // smoothed control value: {x, y} for one hand, or {x: spread} for zoom
  let prev = null; // last value we reported movement from
  let pinching = []; // per-hand "was pinching" flags for hysteresis

  return function update(hands = []) {
    const kinds = hands.map((lm, i) => classifyHand(lm, pinching[i]));
    pinching = kinds.map((k) => k === 'pinch');

    // Pick the mode and the raw "control value" we track for that mode.
    const pinchHands = hands.filter((_, i) => kinds[i] === 'pinch');
    const fistHand = hands.find((_, i) => kinds[i] === 'fist');
    let newMode, raw;
    if (pinchHands.length >= 2) {
      // Zoom: track the distance between the two pinch points.
      const [a, b] = pinchHands.map(pinchPoint);
      newMode = 'zoom';
      raw = { x: dist(a, b), y: 0 };
    } else if (pinchHands.length === 1) {
      newMode = 'rotate';
      raw = pinchPoint(pinchHands[0]);
    } else if (fistHand) {
      newMode = 'tilt';
      raw = mirror(fistHand[9]); // middle knuckle = roughly the palm centre
    } else {
      newMode = hands.length ? 'open' : 'none';
      raw = null;
    }

    // Mode changed (or released)? Start fresh so the camera doesn't jump.
    if (newMode !== mode || !raw) {
      mode = newMode;
      smooth = raw && { ...raw };
      prev = raw && { ...raw };
      return { mode, dx: 0, dy: 0, dSpread: 0 };
    }

    // Exponential smoothing: move part of the way toward the new value each frame.
    smooth.x += SMOOTHING * (raw.x - smooth.x);
    smooth.y += SMOOTHING * (raw.y - smooth.y);

    // Dead zone: ignore tiny movement. We keep `prev` where it was, so slow,
    // steady movement still adds up and eventually counts.
    let dx = smooth.x - prev.x;
    let dy = smooth.y - prev.y;
    if (Math.hypot(dx, dy) < DEAD_ZONE) return { mode, dx: 0, dy: 0, dSpread: 0 };
    prev = { ...smooth };

    if (mode === 'zoom') return { mode, dx: 0, dy: 0, dSpread: dx };
    return { mode, dx, dy, dSpread: 0 };
  };
}

// Point between thumb tip and index tip (mirrored).
function pinchPoint(lm) {
  return mirror({ x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2 });
}
