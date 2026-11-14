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

// Two pinching hands moving apart -> zoom with dSpread > 0.
track = createGestureTracker();
for (let i = 0; i < 10; i++) {
  out = track([makeHand({ pinch: true, cx: 0.3 - i * 0.02 }), makeHand({ pinch: true, cx: 0.7 + i * 0.02 })]);
}
assert.equal(out.mode, 'zoom');
assert.ok(out.dSpread > 0);

// Fist -> tilt; no hands -> none.
track = createGestureTracker();
assert.equal(track([makeHand({ curled: true })]).mode, 'tilt');
assert.equal(track([]).mode, 'none');

console.log('gesture checks passed');
