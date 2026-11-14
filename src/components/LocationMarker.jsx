import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { EARTH_RADIUS } from "./Earth";
import { registerMarker } from "../markers";

// ---- Marker size on screen (radius in px) ----
// It grows with the zoom number on the zoom bar: PX_PER_ZOOM px per "1×",
// so about 8 px at 1.0×, 16 px at 2.0×, 26 px at 3.3×. Clamped to a sensible range.
const PX_PER_ZOOM = 8;
const MIN_PX = 5;
const MAX_PX = 28;

// Where the marker sits. Placeholder spot for now (0°N 90°W, the side facing the
// starting camera). For a real study area use latLonToVector(lat, lon) from ../geo.
const POSITION = new Vector3(0, 0, EARTH_RADIUS);

export default function LocationMarker({
  studyArea,
  onSelect,
}) {
  const mesh = useRef(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size); // canvas size in px
  const startDistance = useRef(null); // starting view = "1.0×", same as the zoom bar

  // Join the shared marker list so the pinch-and-open hand gesture can "click" us too.
  useEffect(
    () => registerMarker({ position: POSITION, open: () => onSelect(studyArea) }),
    [onSelect, studyArea]
  );

  // Every frame: pick the on-screen size for the current zoom, then work out how
  // big the ball must be in the 3D world to look that big from where the camera is.
  useFrame(() => {
    if (!mesh.current) return;
    startDistance.current ??= camera.position.length();
    const zoom = startDistance.current / camera.position.length();
    const px = MathUtils.clamp(PX_PER_ZOOM * zoom, MIN_PX, MAX_PX);

    // Pixels per world unit at distance 1 (from the camera's field of view).
    const focalPx = size.height / 2 / Math.tan((camera.fov * Math.PI) / 360);
    const distance = camera.position.distanceTo(POSITION);
    mesh.current.scale.setScalar((px * distance) / focalPx); // geometry radius is 1
  });

  return (
    <mesh
      ref={mesh}
      // Centred on the surface, so it shows as a dome sitting on the Earth.
      position={POSITION}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(studyArea);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial
        color="#ff3b30"
        depthTest
      />
    </mesh>
  );
}
