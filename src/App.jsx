import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef } from "react";
import Earth, { EARTH_RADIUS } from "./components/Earth";
import HandCameraControls from "./hands/HandCameraControls";
import HandTracker from "./hands/HandTracker";

export default function App() {
  // Shared "mailbox" between the webcam (outside the 3D canvas) and the camera
  // controls (inside it). A ref, not state, so 30 updates a second don't re-render React.
  const gestureRef = useRef({ mode: "none", dx: 0, dy: 0, dSpread: 0 });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 7] }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />

        <Stars />
        <Earth />

        {/* Mouse/touch controls. makeDefault lets HandCameraControls find them. */}
        <OrbitControls
          makeDefault
          enableDamping
          enablePan={false}
          minDistance={EARTH_RADIUS * 1.05}
          maxDistance={EARTH_RADIUS * 10}
        />
        <HandCameraControls gestureRef={gestureRef} earthRadius={EARTH_RADIUS} />
      </Canvas>

      <HandTracker gestureRef={gestureRef} />
    </div>
  );
}
