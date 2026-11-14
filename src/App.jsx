
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef, useState } from "react";

import Earth, { EARTH_RADIUS } from "./components/Earth";
import Lighting from "./components/Lighting";
import { ZoomBar, ZoomReadout } from "./components/ZoomBar";
import HandCameraControls from "./hands/HandCameraControls";
import HandTracker from "./hands/HandTracker";

import Header from "./components/Header";
import LocationPanel from "./components/LocationPanel";
import "./components/UI.css";

export default function App() {
  // Shared "mailbox" between the webcam (outside the 3D canvas) and the camera
  // controls (inside it). A ref, not state, so 30 updates a second don't re-render React.
  const gestureRef = useRef({ mode: "none", dx: 0, dy: 0 });

  // The zoom bar element; ZoomReadout (inside the 3D scene) moves its knob.
  const zoomBarRef = useRef(null);

  // Controls whether the information panel is visible
  const [showPanel, setShowPanel] = useState(false);

  // "bright" = evenly lit globe, "realistic" = day/night from the real current time
  const [lighting, setLighting] = useState("bright");

  return (
    <div className="app-container">

      {/* 3D Earth scene */}
      <Canvas camera={{ position: [0, 0, 7] }}>
        <Lighting mode={lighting} />

        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          fade
        />

        <Earth />

        <OrbitControls
          makeDefault
          enableDamping
          enablePan={false}
          minDistance={EARTH_RADIUS * 1.05}
          maxDistance={EARTH_RADIUS * 10}
        />

        <HandCameraControls
          gestureRef={gestureRef}
          earthRadius={EARTH_RADIUS}
        />

        <ZoomReadout barRef={zoomBarRef} />
      </Canvas>

      {/* Webcam hand tracking */}
      <HandTracker gestureRef={gestureRef} />

      {/* UI overlay */}
      <Header lighting={lighting} onLightingChange={setLighting} />

      <ZoomBar barRef={zoomBarRef} />

      <div className="explore-controls">
        <p>Use your hand or mouse to explore Earth.</p>

        <button onClick={() => setShowPanel(true)}>
          Explore NISAR Data
        </button>
      </div>

      {showPanel && (
        <LocationPanel
          onClose={() => setShowPanel(false)}
        />
      )}

    </div>
  );
}



