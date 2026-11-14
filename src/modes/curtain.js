/*
 * curtain.js - reads the open palm in Time mode and decides, each frame:
 *  - "follow": move the divider to the palm's sideways position, or
 *  - "step":   the palm swiped fast, so go to the next (+1) / previous (-1) date pair.
 *
 * A fast swipe should NOT also drag the divider along, so while a swipe is
 * happening (and during the cooldown after it) the divider stays put.
 *
 * No React or three.js here, so it can be tested with plain Node (curtain.check.js).
 */
import { TIME_SWIPE_COOLDOWN_MS, TIME_SWIPE_SPEED, TIME_VELOCITY_SMOOTHING } from '../tuning.js';

/**
 * Returns update(palm, nowMs) -> { step, follow }
 *   palm:   { x, t } = palm position across the (mirrored) webcam picture (0..1)
 *           and the time that sample was taken (ms); or null when there's no open palm.
 *   step:   -1, 0 or +1
 *   follow: palm x (0..1) the divider should move toward, or null to stay put.
 */
export function createCurtainTracker() {
  let lastX = null; // previous palm sample
  let lastT = null;
  let velocity = 0; // smoothed sideways speed, video widths per second (+ = right)
  let lastSwipe = -Infinity; // when the last swipe fired (ms)

  return function update(palm, nowMs) {
    if (!palm) {
      lastX = null;
      velocity = 0;
      return { step: 0, follow: null };
    }

    // New webcam sample? (The webcam is ~30 fps, the screen ~60, so often not.)
    if (palm.t !== lastT) {
      if (lastX !== null) {
        const dt = (palm.t - lastT) / 1000;
        // Ignore gaps (e.g. the hand was lost for a moment): they'd fake a huge speed.
        if (dt > 0 && dt < 0.25) velocity += TIME_VELOCITY_SMOOTHING * ((palm.x - lastX) / dt - velocity);
      }
      lastX = palm.x;
      lastT = palm.t;
    }

    let step = 0;
    if (nowMs - lastSwipe >= TIME_SWIPE_COOLDOWN_MS && Math.abs(velocity) > TIME_SWIPE_SPEED) {
      step = Math.sign(velocity); // right = next, left = previous
      lastSwipe = nowMs;
      velocity = 0;
    }

    // Hold the divider still while swiping or cooling down after a swipe.
    const swiping = nowMs - lastSwipe < TIME_SWIPE_COOLDOWN_MS || Math.abs(velocity) > TIME_SWIPE_SPEED / 2;
    return { step, follow: swiping ? null : palm.x };
  };
}
