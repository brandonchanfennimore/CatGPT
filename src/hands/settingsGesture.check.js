// Quick self-check for settingsGesture.js. Run: npm run check
import assert from 'node:assert/strict';
import { stepSettings } from './settingsGesture.js';

const rows = ['lighting', 'borders', 'labels', 'coordinates'];
const base = { rows, focus: 0, now: 10000 };

// Small movements do nothing and are kept until they add up.
let s = stepSettings({ ...base, sy: 0.02, sx: 0.02 });
assert.deepEqual([s.focus, s.toggle, s.sy, s.sx], [0, null, 0.02, 0.02]);

// Pinky down one step -> next row; up from the top wraps to the bottom.
assert.equal(stepSettings({ ...base, sy: 0.1 }).focus, 1);
assert.equal(stepSettings({ ...base, sy: -0.1 }).focus, 3);

// Disabled rows are skipped (Coordinates while Labels is off).
const disabled = (k) => k === 'coordinates';
assert.equal(stepSettings({ ...base, focus: 2, sy: 0.1, disabled }).focus, 0);

// Pinky right -> switch the highlighted row, then a cooldown blocks a second switch.
s = stepSettings({ ...base, focus: 1, sx: 0.12 });
assert.equal(s.toggle, 'borders');
const again = stepSettings({ ...base, focus: 1, sx: 0.12, now: base.now + 200, lastToggle: s.lastToggle });
assert.equal(again.toggle, null);
const later = stepSettings({ ...base, focus: 1, sx: 0.12, now: base.now + 1000, lastToggle: s.lastToggle });
assert.equal(later.toggle, 'borders');

// Pinky left does nothing and is thrown away.
s = stepSettings({ ...base, sx: -0.2 });
assert.deepEqual([s.toggle, s.sx], [null, 0]);

console.log('settings gesture checks passed');
