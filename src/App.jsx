
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Earth from "./components/Earth";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 7] }}>
        <ambientLight intensity={1.2} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
        />

        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          fade
        />

        <Suspense fallback={null}>
          <Earth />
        </Suspense>

        <OrbitControls
          enableDamping
          minDistance={2.5}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}


