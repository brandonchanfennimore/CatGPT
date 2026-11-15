/*
 * clusters.js - merge dots that are too close together on screen.
 *
 * Works in screen pixels, so clustering follows the zoom automatically:
 * zoomed out, nearby places are only a few pixels apart and merge into one
 * numbered bubble; zoom in and the same places spread out and split again.
 *
 * Method ("leader" clustering): take the most important dot that isn't in a
 * cluster yet, sweep every free dot within `radiusPx` of it into its cluster,
 * repeat. The cluster sits on its leader, so it doesn't drift as dots join.
 *
 * No React or three.js here, so it can be tested with plain Node (clusters.check.js).
 */

/**
 * points:   [{ x, y, priority }] screen positions (px); higher priority leads.
 * radiusPx: dots closer than this to a leader join its cluster.
 * Returns:  [{ x, y, members: [index into points, ...] }], leader first.
 */
export function clusterScreenPoints(points, radiusPx) {
  // Most important first; ties keep list order so the result never flickers.
  const order = points.map((_, i) => i).sort((a, b) => points[b].priority - points[a].priority || a - b);
  const taken = new Array(points.length).fill(false);
  const r2 = radiusPx * radiusPx;
  const clusters = [];

  for (const leader of order) {
    if (taken[leader]) continue;
    const { x, y } = points[leader];
    const members = [];
    for (const j of order) {
      if (taken[j]) continue;
      const dx = points[j].x - x;
      const dy = points[j].y - y;
      if (dx * dx + dy * dy <= r2) {
        taken[j] = true;
        members.push(j);
      }
    }
    clusters.push({ x, y, members });
  }
  return clusters;
}
