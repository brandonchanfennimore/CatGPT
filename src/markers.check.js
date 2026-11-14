// Quick self-check for markers.js. Run: npm run check
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { openMarkerNearestCenter, registerMarker } from './markers.js';

// Camera looking at the Earth's centre from +Z, like the app's starting view.
const camera = new PerspectiveCamera(75, 16 / 9, 0.01, 1000);
camera.position.set(0, 0, 7);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();

const opened = [];
const add = (name, x, y, z) =>
  registerMarker({ position: new Vector3(x, y, z).setLength(2), open: () => opened.push(name) });

const removeNear = add('near-centre', 0.1, 0.1, 1); // almost straight ahead
add('off-centre', 1, 0.5, 1); // visible, but further from the middle
add('far-side', 0, 0, -1); // directly behind the globe: must be ignored

// Picks the marker closest to the middle of the screen.
openMarkerNearestCenter(camera);
assert.deepEqual(opened, ['near-centre']);

// Remove it: now the other visible marker wins, never the hidden one.
removeNear();
openMarkerNearestCenter(camera);
assert.deepEqual(opened, ['near-centre', 'off-centre']);

console.log('marker checks passed');
