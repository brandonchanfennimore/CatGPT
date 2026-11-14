// Quick self-check for gesture.js using fake hands. Run: npm run check
import assert from 'node:assert/strict';
import { classifyHand, createGestureTracker } from './gesture.js';

// Build a fake 21-point hand around (cx, cy). Up on screen = smaller y.
// curled = [index, middle, ring, pinky]: true = finger folded down.
function makeHand({ cx = 0.5, cy = 0.6, curled = [false, false, false, false], pinch = false } = {}) {
  const p = (x, y) => ({ x: cx + x * 0.5, y: cy + y * 0.5 });
  const lm = [p(0, 0)]; // 0 wrist
  for (let i = 1; i <= 4; i++) lm.push(p(-0.05 * i, -0.05 * i)); // thumb 1..4
  [-0.1, -0.03, 0.03, 0.1].forEach((fx, f) => {
    lm.push(p(fx, -0.3)); // knuckle
    if (curled[f]) lm.push(p(fx, -0.4), p(fx, -0.3), p(fx, -0.18)); // tip folds back into the palm
    else lm.push(p(fx, -0.45), p(fx, -0.52), p(fx, -0.58)); // straight finger
  });
  if (pinch) lm[4] = { ...lm[8] }; // thumb tip touches index tip
  return lm;
}
const OPEN = [false, false, false, false];
const FIST = [true, true, true, true];
const POINT = [false, true, true, true]; // only the index finger up
const PEACE = [false, false, true, true];

assert.equal(classifyHand(makeHand({ curled: OPEN })), 'open');
assert.equal(classifyHand(makeHand({ curled: FIST })), 'fist');
assert.equal(classifyHand(makeHand({ curled: POINT })), 'point');
assert.equal(classifyHand(makeHand({ curled: PEACE })), 'other');
assert.equal(classifyHand(makeHand({ pinch: true })), 'pinch');
// Fist with the thumb on the curled index tip: not a pinch (fingertip tucked near the wrist).
assert.equal(classifyHand(makeHand({ curled: FIST, pinch: true })), 'fist');

// Open palm moving right (in the mirrored view) -> rotate with dx > 0.
// Real-world "right" is smaller raw x, because the camera image is not mirrored.
let track = createGestureTracker();
let out;
for (let i = 0; i < 10; i++) out = track([makeHand({ cx: 0.6 - i * 0.02 })]);
assert.equal(out.mode, 'rotate');
assert.ok(out.dx > 0, `expected dx > 0, got ${out.dx}`);

// Tiny jitter stays inside the dead zone -> no movement.
track = createGestureTracker();
for (let i = 0; i < 10; i++) out = track([makeHand({ cx: 0.5 + (i % 2) * 0.001 })]);
assert.equal(out.dx, 0);

// Pointing finger moving right -> zoom with dx > 0 (HandCameraControls: right = closer).
track = createGestureTracker();
for (let i = 0; i < 10; i++) out = track([makeHand({ curled: POINT, cx: 0.6 - i * 0.02 })]);
assert.equal(out.mode, 'zoom');
assert.ok(out.dx > 0, `expected dx > 0, got ${out.dx}`);

// Fist -> release; no hand -> none; a second hand is ignored.
track = createGestureTracker();
assert.equal(track([makeHand({ curled: FIST })]).mode, 'release');
assert.equal(track([]).mode, 'none');
assert.equal(track([makeHand({ curled: FIST }), makeHand()]).mode, 'release');

// Fling: open palm moving fast, then the hand disappears -> fling with x speed > 0.
// Frames are 33 ms apart (30 fps).
track = createGestureTracker();
for (let i = 0; i < 10; i++) track([makeHand({ cx: 0.7 - i * 0.03 })], i * 33);
out = track([], 10 * 33);
assert.equal(out.mode, 'none');
assert.ok(out.fling && out.fling.x > 0, `expected a rightward fling, got ${JSON.stringify(out.fling)}`);

// Holding still before leaving -> no fling.
track = createGestureTracker();
for (let i = 0; i < 30; i++) track([makeHand()], i * 33);
assert.equal(track([], 30 * 33).fling, null);

// Pinch "click": hold a pinch (10 frames = 330 ms), then open the hand -> select once.
track = createGestureTracker();
for (let i = 0; i < 10; i++) {
  out = track([makeHand({ pinch: true })], i * 33);
  assert.equal(out.mode, 'pinch');
  assert.equal(out.select, false);
}
out = track([makeHand()], 10 * 33);
assert.equal(out.select, true, 'opening a held pinch should select');
assert.equal(track([makeHand()], 11 * 33).select, false, 'select fires only once');

// Too quick (one frame) -> no select.
track = createGestureTracker();
track([makeHand({ pinch: true })], 0);
assert.equal(track([makeHand()], 33).select, false);

// Hand disappears while pinched (tracking lost) -> no select.
track = createGestureTracker();
for (let i = 0; i < 10; i++) track([makeHand({ pinch: true })], i * 33);
assert.equal(track([], 10 * 33).select, false);

// Fist, then open palm -> no select.
track = createGestureTracker();
for (let i = 0; i < 10; i++) track([makeHand({ curled: FIST })], i * 33);
assert.equal(track([makeHand()], 10 * 33).select, false);

console.log('gesture checks passed');
