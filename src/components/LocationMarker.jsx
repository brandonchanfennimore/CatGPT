
import { EARTH_RADIUS } from "./Earth";

export default function LocationMarker({
  studyArea,
  onSelect,
}) {
  return (
    <mesh
      position={[0, 0, EARTH_RADIUS + 0.1]}
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
      <sphereGeometry args={[0.1, 20, 20]} />
      <meshBasicMaterial
        color="#00e5ff"
        depthTest
      />
    </mesh>
  );
}
