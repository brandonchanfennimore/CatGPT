/*
 * Lighting - the scene's lights, in one of two modes:
 *  - "bright":    even light everywhere, so the whole globe is easy to see.
 *  - "realistic": one "sun" light placed where the real Sun is right now,
 *                 so day and night match the actual time around the world.
 */
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { sunDirection } from "../sun";

const SUN_DISTANCE = 50; // far away, so the light rays are almost parallel like real sunlight

export default function Lighting({ mode }) {
  const sun = useRef(null);

  // Move the sun every frame from the real clock. The maths is a few sines and
  // cosines, so this is cheap, and the day/night line creeps along as time passes.
  useFrame(() => {
    if (!sun.current) return;
    const [x, y, z] = sunDirection(new Date());
    sun.current.position.set(x * SUN_DISTANCE, y * SUN_DISTANCE, z * SUN_DISTANCE);
  });

  // three.js ambient light shows a texture at its full brightness at intensity π (~3.14).
  if (mode === "bright") return <ambientLight intensity={Math.PI} />;

  return (
    <>
      {/* A little ambient light so the night side is dark but not pitch black. */}
      <ambientLight intensity={0.06} />
      <directionalLight ref={sun} intensity={3} />
    </>
  );
}
