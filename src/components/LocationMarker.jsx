import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, MathUtils, Vector3 } from "three";

const toCamera = new Vector3(); // scratch vector reused every frame
import { EARTH_RADIUS } from "./Earth";
import { latLonToVector } from "../geo";
import { registerMarker } from "../markers";

// ---- Marker size on screen (radius in px) ----
// It grows with the zoom number on the zoom bar: PX_PER_ZOOM px per "1×",
// so about 5 px at 1.0×, 10 px at 2.0×, 17 px at 3.3×. Clamped to a sensible range.
// (Kept small because there are 130 pins.)
const PX_PER_ZOOM = 5;
const MIN_PX = 3;
const MAX_PX = 20;
// Hide pins this close to the globe's edge (0 = right at the edge), so pins just
// over the horizon don't poke out of the outline as bumps.
const HORIZON_HIDE = 0.12;

// Glow (Flashlight/Time modes): a soft halo this many times the marker's size,
// pulsing this many times per second.
const GLOW_SIZE = 2.2;
// In the radar modes the pin sits on top of the data you're looking at, so keep it
// small there (max radius in px) instead of growing with the zoom.
const GLOW_MAX_PX = 7;
const GLOW_PULSES_PER_SECOND = 0.8;

// interactive: clickable (Explore mode). glow: pulsing halo showing where radar
// data exists (Flashlight/Time modes, where clicking is turned off).
// color: pin colour (by category, see data/categories.js).
export default function LocationMarker({
  studyArea,
  onSelect,
  interactive = true,
  glow = false,
  color = "#ff3b30",
}) {
  const mesh = useRef(null);
  const halo = useRef(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size); // canvas size in px
  const startDistance = useRef(null); // starting view = "1.0×", same as the zoom bar

  // Where the marker sits: the study area's centre (lat/lon), on the surface.
  const { lat = 0, lon = -90 } = studyArea.center ?? {};
  const position = useMemo(() => new Vector3(...latLonToVector(lat, lon, EARTH_RADIUS)), [lat, lon]);

  // Join the shared marker list so the two-finger swipe-up gesture can "click" us
  // too (only while clicking is allowed).
  useEffect(() => {
    if (!interactive) return;
    return registerMarker({ position, open: () => onSelect(studyArea) });
  }, [interactive, position, onSelect, studyArea]);

  // Every frame: pick the on-screen size for the current zoom, then work out how
  // big the ball must be in the 3D world to look that big from where the camera is.
  useFrame(({ clock }) => {
    if (!mesh.current) return;

    // Facing test: is the pin on the side of the globe that faces the camera?
    toCamera.copy(camera.position).sub(position);
    const facing = toCamera.dot(position) / (toCamera.length() * EARTH_RADIUS);
    mesh.current.visible = facing > HORIZON_HIDE;
    if (!mesh.current.visible) return;

    startDistance.current ??= camera.position.length();
    const zoom = startDistance.current / camera.position.length();
    const px = MathUtils.clamp(PX_PER_ZOOM * zoom, MIN_PX, glow ? GLOW_MAX_PX : MAX_PX);

    // Pixels per world unit at distance 1 (from the camera's field of view).
    const focalPx = size.height / 2 / Math.tan((camera.fov * Math.PI) / 360);
    const distance = camera.position.distanceTo(position);
    mesh.current.scale.setScalar((px * distance) / focalPx); // geometry radius is 1

    // Pulse the glow: opacity goes up and down smoothly (a sine wave).
    if (halo.current) {
      const wave = 0.5 + 0.5 * Math.sin(clock.elapsedTime * GLOW_PULSES_PER_SECOND * 2 * Math.PI);
      halo.current.material.opacity = 0.25 + 0.35 * wave;
    }
  });

  return (
    <mesh
      ref={mesh}
      // Centred on the surface, so it shows as a dome sitting on the Earth.
      position={position}
      onClick={(event) => {
        if (!interactive) return;
        event.stopPropagation();
        onSelect(studyArea);
      }}
      onPointerOver={() => {
        if (interactive) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial
        color={color}
        depthTest
      />
      {glow && (
        // A bigger, see-through ball around the marker, added on top (additive)
        // so it looks like light. It's a child, so it scales with the marker.
        <mesh ref={halo} scale={GLOW_SIZE} raycast={() => null}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </mesh>
  );
}
