/*
 * markers.js - a shared list of clickable markers on the globe, so a hand
 * gesture can "click" one without the mouse.
 *
 * Each marker adds itself with registerMarker({ position, open }) and removes
 * itself when it goes away. `open` is whatever a mouse click on it does.
 *
 * The Earth is assumed to sit at the origin (0, 0, 0), as it does in App.jsx.
 */
import { Vector3 } from 'three';

const markers = new Set();

/** Add a marker. Returns a function that removes it again (handy for useEffect). */
export function registerMarker(marker) {
  markers.add(marker);
  return () => markers.delete(marker);
}

// Scratch vectors reused on every call.
const toCamera = new Vector3();
const onScreen = new Vector3();

/**
 * "Click" the marker nearest the middle of the screen, as seen by `camera`.
 * Markers on the far side of the globe or off screen are ignored.
 * Returns the marker that was opened, or null if none was visible.
 */
export function openMarkerNearestCenter(camera) {
  let best = null;
  let bestDistance = Infinity;
  for (const m of markers) {
    // Facing test: is the marker on the side of the globe that faces the camera?
    toCamera.copy(camera.position).sub(m.position);
    if (toCamera.dot(m.position) <= 0) continue;

    // Screen position from -1..1 in x and y; (0, 0) is the exact centre.
    onScreen.copy(m.position).project(camera);
    if (Math.abs(onScreen.x) > 1 || Math.abs(onScreen.y) > 1) continue;
    // Multiply x by the aspect ratio so the distance is measured in a round way
    // (otherwise a wide window would squash left/right distances).
    const distance = Math.hypot(onScreen.x * camera.aspect, onScreen.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = m;
    }
  }
  best?.open();
  return best;
}
