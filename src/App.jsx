
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Earth from "./components/Earth";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 7] }}>
        <ambientLight intensity={1.5} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
        />

        <Stars />
        <Earth />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}

