// Quick self-check for curtain.js. Run: npm run check
import assert from 'node:assert/strict';
import { createCurtainTracker } from './curtain.js';

// Feed palm samples at 30 fps (33 ms apart). x changes by `perFrame` each sample.
function run(track, { from = 0.5, perFrame, frames, startMs = 0 }) {
  const out = [];
  for (let i = 0; i < frames; i++) {
    const t = startMs + i * 33;
    out.push(track({ x: from + i * perFrame, t }, t));
  }
  return out;
}

// Slow palm movement: the divider follows, no date steps.
let track = createCurtainTracker();
let out = run(track, { perFrame: 0.005, frames: 20 }); // ~0.15 widths/second
assert.ok(out.every((o) => o.step === 0), 'slow movement must not step');
assert.ok(Math.abs(out.at(-1).follow - (0.5 + 19 * 0.005)) < 1e-9, 'divider follows the palm');

// Fast swipe right: exactly one step forward, and the divider holds still.
track = createCurtainTracker();
out = run(track, { perFrame: 0.08, frames: 8 }); // ~2.4 widths/second
assert.equal(out.filter((o) => o.step === 1).length, 1, 'one swipe = one step');
assert.equal(out.at(-1).follow, null, 'divider holds still during a swipe');

// Fast swipe left: one step back.
track = createCurtainTracker();
out = run(track, { from: 0.9, perFrame: -0.08, frames: 8 });
assert.deepEqual(out.filter((o) => o.step !== 0).map((o) => o.step), [-1]);

// Two swipes in a row: the second only counts after the cooldown (700 ms).
track = createCurtainTracker();
const first = run(track, { perFrame: 0.08, frames: 8 });
const tooSoon = run(track, { perFrame: 0.08, frames: 8, startMs: 300 });
const later = run(track, { perFrame: 0.08, frames: 8, startMs: 1500 });
assert.equal([...first, ...tooSoon].filter((o) => o.step).length, 1, 'cooldown blocks a second step');
assert.equal(later.filter((o) => o.step).length, 1, 'after the cooldown, swipes work again');

// No palm: nothing happens.
assert.deepEqual(createCurtainTracker()(null, 0), { step: 0, follow: null });

console.log('curtain checks passed');
