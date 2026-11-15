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
 *   two fingers (index+middle) -> 'swipe' (nothing moves)...
 *     ...flicked upward        -> `select: true` once: open/close the info view
 *   pinky only + move         -> 'settings' (down/up = pick a View setting, right = toggle it)
 *   fist (or any other shape) -> 'release' (nothing moves)
 *   no hand                   -> 'none'
 *
 * This file has no React or MediaPipe code, so it can be tested with plain Node
 * (see gesture.check.js).
 */

// All tuning knobs (smoothing, dead zone, swipe distance...) live in ../tuning.js.
import {
  DEAD_ZONE,
  EXTEND_RATIO,
  MIN_FLING_SPEED,
  SMOOTHING,
  SWIPE_MAX_MS,
  SWIPE_UP_DISTANCE,
  VELOCITY_SMOOTHING,
} from '../tuning.js';

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// The webcam preview is shown mirrored (like a selfie), so we mirror x here too.
// Then "hand moves right" means x increases, matching what you see.
const mirror = (p) => ({ x: 1 - p.x, y: p.y });

// [tip, middle joint] for index, middle, ring, pinky. (The thumb is ignored:
// people hold it in all sorts of ways.)
const FINGERS = [[8, 6], [12, 10], [16, 14], [20, 18]];

/** Classify one hand as 'open', 'point', 'two', 'pinky', 'fist' or 'other'. */
export function classifyHand(lm) {
  // Is each finger straight? Compare tip and middle-joint distance from the wrist.
  const [index, middle, ring, pinky] = FINGERS.map(
    ([tip, pip]) => dist(lm[tip], lm[0]) > dist(lm[pip], lm[0]) * EXTEND_RATIO
  );
  if (index && middle && ring && pinky) return 'open';
  if (index && !middle && !ring && !pinky) return 'point';
  if (index && middle && !ring && !pinky) return 'two'; // index + middle up, like a peace sign
  if (!index && !middle && !ring && pinky) return 'pinky'; // only the little finger up
  if (!index && !middle && !ring && !pinky) return 'fist';
  return 'other'; // a hand halfway between shapes
}

/**
 * Create a gesture tracker for ONE hand. It remembers the previous frame so it
 * can report how far the hand MOVED (deltas), with smoothing and a dead zone.
 *
 * Call the returned function once per video frame with MediaPipe's
 * `result.landmarks` (an array of hands; only the first is used) and the frame
 * time in milliseconds. It returns:
 *   { mode, dx, dy, fling, select }
 *   mode:   'none' | 'release' | 'swipe' | 'rotate' | 'zoom' | 'settings'
 *   dx, dy: how far the tracked point moved this frame (fraction of the video size)
 *   fling:  only on the frame a rotate ends: {x, y} speed of the hand, else null
 *   select: true only on the frame a two-finger swipe up completes
 */
export function createGestureTracker() {
  let mode = 'none';
  let smooth = null; // smoothed position {x, y} of the point we follow
  let prev = null; // last position we reported movement from
  let vel = { x: 0, y: 0 }; // smoothed hand speed (per second), used for fling
  let lastTime = null;
  let swipeStart = null; // {y, t}: where/when the current two-finger swipe began
  let swiped = false; // already fired for this two-finger pose? (once per pose)

  return function update(hands = [], timeMs = performance.now()) {
    const dt = lastTime === null ? 0 : (timeMs - lastTime) / 1000; // seconds since last frame
    lastTime = timeMs;

    // Pick the mode and the point we follow for that mode.
    const hand = hands[0];
    const kind = hand ? classifyHand(hand) : null;

    // Two-finger swipe up = "select". y grows downward, so rising = y getting smaller.
    let select = false;
    if (kind === 'two') {
      const y = hand[9].y; // middle knuckle: steadier than a fingertip
      // Start a new swipe if there's none yet, or the current one is too slow.
      if (!swipeStart || timeMs - swipeStart.t > SWIPE_MAX_MS) swipeStart = { y, t: timeMs };
      if (!swiped && swipeStart.y - y >= SWIPE_UP_DISTANCE) {
        select = true;
        swiped = true; // lower the fingers (or change shape) before it can fire again
      }
    } else {
      swipeStart = null;
      swiped = false;
    }

    let newMode, raw;
    if (kind === 'two') {
      newMode = 'swipe';
      raw = null; // the swipe never moves the camera
    } else if (kind === 'open') {
      newMode = 'rotate';
      raw = mirror(hand[9]); // middle knuckle = roughly the palm centre
    } else if (kind === 'point') {
      newMode = 'zoom';
      raw = mirror(hand[8]); // index fingertip
    } else if (kind === 'pinky') {
      newMode = 'settings';
      raw = mirror(hand[20]); // pinky fingertip
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
