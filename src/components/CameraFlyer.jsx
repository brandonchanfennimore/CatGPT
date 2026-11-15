/*
 * CameraFlyer - smoothly flies the camera to a spot on the globe.
 *
 * Set flyRef.current = { dir, zoom } to start a flight:
 *   dir  = direction from the Earth's centre to the spot (a Vector3, any length)
 *   zoom = zoom level to end at (the "×" on the zoom bar)
 * Each frame the camera turns part of the way toward `dir` and moves part of the
 * way to the right distance, so it eases in and slows down at the end.
 * Grabbing the globe with the mouse cancels the flight.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, Quaternion, Vector3 } from "three";
import { FLY_SPEED } from "../tuning";

// Scratch objects reused every frame.
const from = new Vector3();
const goalDir = new Vector3();
const turn = new Quaternion();
const step = new Quaternion();

export default function CameraFlyer({ flyRef }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const startDistance = useRef(null); // the starting view = "1.0×", same as the zoom bar

  useEffect(() => {
    if (!controls) return;
    const cancel = () => (flyRef.current = null);
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controls, flyRef]);

  useFrame((_, delta) => {
    startDistance.current ??= camera.position.length();
    const flight = flyRef.current;
    if (!flight || !controls) return;

    const k = 1 - Math.exp(-FLY_SPEED * delta); // fraction of the way to go this frame
    from.copy(camera.position).normalize();
    goalDir.copy(flight.dir).normalize();

    // Turn: the full rotation from here to there, then only a fraction k of it.
    turn.setFromUnitVectors(from, goalDir);
    step.identity().slerp(turn, k);

    // Distance: move a fraction k of the way (in log space, so it feels even).
    const distance = camera.position.length();
    const goal = startDistance.current / flight.zoom;
    const next = Math.exp(MathUtils.lerp(Math.log(distance), Math.log(goal), k));

    camera.position.copy(from.applyQuaternion(step)).multiplyScalar(next);
    controls.update();

    // Close enough: stop.
    if (from.angleTo(goalDir) < 0.001 && Math.abs(Math.log(next / goal)) < 0.001) flyRef.current = null;
  });

  return null;
}
