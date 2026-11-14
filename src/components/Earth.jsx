
import { useTexture } from "@react-three/drei";

export default function Earth() {
  const earthTexture = useTexture("/textures/earth.jpg");

  return (
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        map={earthTexture}
        roughness={1}
      />
    </mesh>
  );
}

