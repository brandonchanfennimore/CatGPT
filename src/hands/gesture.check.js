// Quick self-check for gesture.js using fake hands. Run: npm run check
import assert from 'node:assert/strict';
import { classifyHand, createGestureTracker } from './gesture.js';

// Build a fake 21-point hand around (cx, cy). Up on screen = smaller y.
function makeHand({ cx = 0.5, cy = 0.6, curled = false, pinch = false } = {}) {
  const p = (x, y) => ({ x: cx + x * 0.5, y: cy + y * 0.5 });
  const lm = [p(0, 0)]; // 0 wrist
  for (let i = 1; i <= 4; i++) lm.push(p(-0.05 * i, -0.05 * i)); // thumb 1..4
  [-0.1, -0.03, 0.03, 0.1].forEach((fx) => {
    lm.push(p(fx, -0.3)); // knuckle
    if (curled) lm.push(p(fx, -0.4), p(fx, -0.35), p(fx, -0.28)); // tip folds back
    else lm.push(p(fx, -0.45), p(fx, -0.52), p(fx, -0.58)); // straight finger
  });
  if (pinch) lm[4] = { ...lm[8] }; // thumb tip touches index tip
  return lm;
}

assert.equal(classifyHand(makeHand()), 'open');
assert.equal(classifyHand(makeHand({ curled: true })), 'fist');
assert.equal(classifyHand(makeHand({ pinch: true })), 'pinch');

// One pinching hand moving right (in the mirrored view) -> rotate with dx > 0.
// Real-world "right" is smaller raw x, because the camera image is not mirrored.
let track = createGestureTracker();
let out;
for (let i = 0; i < 10; i++) out = track([makeHand({ pinch: true, cx: 0.6 - i * 0.02 })]);
assert.equal(out.mode, 'rotate');
assert.ok(out.dx > 0, `expected dx > 0, got ${out.dx}`);

// Tiny jitter stays inside the dead zone -> no movement.
track = createGestureTracker();
for (let i = 0; i < 10; i++) out = track([makeHand({ pinch: true, cx: 0.5 + (i % 2) * 0.001 })]);
assert.equal(out.dx, 0);

// A second hand is ignored: only the first hand controls.
track = createGestureTracker();
assert.equal(track([makeHand(), makeHand({ pinch: true })]).mode, 'open');

// Fist moving up -> zoom with dy < 0 (HandCameraControls: up = closer).
track = createGestureTracker();
for (let i = 0; i < 10; i++) out = track([makeHand({ curled: true, cy: 0.7 - i * 0.02 })]);
assert.equal(out.mode, 'zoom');
assert.ok(out.dy < 0, `expected dy < 0, got ${out.dy}`);
assert.equal(track([]).mode, 'none');

// Fling: pinch moving fast, then the hand disappears -> fling with x speed > 0.
// Frames are 33 ms apart (30 fps).
track = createGestureTracker();
for (let i = 0; i < 10; i++) track([makeHand({ pinch: true, cx: 0.7 - i * 0.03 })], i * 33);
out = track([], 10 * 33);
assert.equal(out.mode, 'none');
assert.ok(out.fling && out.fling.x > 0, `expected a rightward fling, got ${JSON.stringify(out.fling)}`);

// Holding still before letting go -> no fling.
track = createGestureTracker();
for (let i = 0; i < 30; i++) track([makeHand({ pinch: true })], i * 33);
assert.equal(track([], 30 * 33).fling, null);

console.log('gesture checks passed');
