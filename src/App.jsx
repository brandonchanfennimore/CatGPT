
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef, useState } from "react";

import Earth, { EARTH_RADIUS } from "./components/Earth";
import Lighting from "./components/Lighting";
import { ZoomBar, ZoomReadout } from "./components/ZoomBar";
import HandCameraControls from "./hands/HandCameraControls";
import HandTracker from "./hands/HandTracker";

import Header from "./components/Header";
import StudyAreaView from "./components/StudyAreaView";
import { studyAreas } from "./data/studyAreas";

import "./components/UI.css";
import LocationMarker from "./components/LocationMarker";

export default function App() {
  // Shared reference for webcam and 3D camera controls
  const gestureRef = useRef({
    mode: "none",
    dx: 0,
    dy: 0,
  });

  // Reference used by the zoom bar
  const zoomBarRef = useRef(null);
  // Zoom level (0..1) requested by clicking/dragging the bar, or null.
  const zoomTargetRef = useRef(null);

  // Currently selected NISAR study area
  const [selectedArea, setSelectedArea] = useState(null);

  // Lighting mode: bright or realistic
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

  <LocationMarker
    studyArea={studyAreas[0]}
    onSelect={setSelectedArea}
  />

  <OrbitControls
    makeDefault
    enableDamping
    enablePan={false}
    minDistance={EARTH_RADIUS * 1.05}
    maxDistance={EARTH_RADIUS * 10}
  />

<<<<<<< HEAD
  <HandCameraControls
    gestureRef={gestureRef}
    earthRadius={EARTH_RADIUS}
  />

  <ZoomReadout barRef={zoomBarRef} />
</Canvas>
=======
        <ZoomReadout barRef={zoomBarRef} targetRef={zoomTargetRef} />
      </Canvas>
>>>>>>> 6e24b10 (allow cursor to adjust zoom bar)

      {/* Webcam hand tracking */}
      <HandTracker gestureRef={gestureRef} />

      {/* UI overlay */}
      <Header
        lighting={lighting}
        onLightingChange={setLighting}
      />

      <ZoomBar barRef={zoomBarRef} targetRef={zoomTargetRef} />

      <div className="explore-controls">
        <p>Use your hand or mouse to explore Earth.</p>

        <button
          onClick={() => setSelectedArea(studyAreas[0])}
        >
          Explore NISAR Data
        </button>
      </div>

      {/* NISAR study area timeline */}
      {selectedArea && (
        <StudyAreaView
          studyArea={selectedArea}
          onBack={() => setSelectedArea(null)}
        />
      )}
    </div>
  );
}





