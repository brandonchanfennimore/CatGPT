/*
 * settingsGesture.js - what the pinky-up gesture does to the View settings panel,
 * one animation frame at a time. No React here, so settingsGesture.check.js can test it.
 *
 *   pinky down/up (sy past SETTINGS_STEP)  -> highlight the next / previous row
 *   pinky right (sx past SETTINGS_TOGGLE)  -> switch the highlighted row (then a cooldown)
 *   pinky left                             -> nothing
 * (Header.jsx adds the event types as extra rows after the settings, and opens their
 * list while the highlight is on them.)
 */
import { SETTINGS_STEP, SETTINGS_TOGGLE, SETTINGS_TOGGLE_COOLDOWN_MS } from '../tuning.js';

/**
 * rows:       row keys, top to bottom (e.g. ["lighting", "borders", ...])
 * disabled:   (key) => true if that row can't be switched right now (skipped)
 * focus:      index of the highlighted row
 * sx, sy:     pinky movement added up since last time (video fractions; +x right, +y down)
 * now, lastToggle: times in ms
 * Returns { focus, toggle (row key to switch, or null), lastToggle, sx, sy (what's left over) }.
 */
export function stepSettings({ rows, disabled = () => false, focus, sx = 0, sy = 0, now, lastToggle = -Infinity }) {
  let toggle = null;
  if (Math.abs(sy) > SETTINGS_STEP) {
    let i = focus;
    do i = (i + Math.sign(sy) + rows.length) % rows.length;
    while (disabled(rows[i]) && i !== focus);
    focus = i;
    sy = 0;
  }
  if (sx > SETTINGS_TOGGLE) {
    if (now - lastToggle > SETTINGS_TOGGLE_COOLDOWN_MS && !disabled(rows[focus])) {
      toggle = rows[focus];
      lastToggle = now;
    }
    sx = 0;
  }
  if (sx < 0) sx = 0; // moving left does nothing
  return { focus, toggle, lastToggle, sx, sy };
}
