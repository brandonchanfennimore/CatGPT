
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef, useState } from "react";

import Earth, { EARTH_RADIUS } from "./components/Earth";
import Lighting from "./components/Lighting";
import { ZoomBar, ZoomReadout } from "./components/ZoomBar";
import { Borders, LabelPositioner, PlaceLabels } from "./components/MapOverlay";
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
  // The layer holding country/city labels; LabelPositioner moves them.
  const labelsRef = useRef(null);

  // Currently selected NISAR study area
  const [selectedArea, setSelectedArea] = useState(null);

  // Lighting mode: bright or realistic
  const [lighting, setLighting] = useState("bright");

  // Which map layers are switched on (the "Map layers" panel under the title)
  const [layers, setLayers] = useState({ borders: true, labels: true, coordinates: true });

  return (
    <div className="app-container">
      {/* 3D Earth scene */}
      {/* near: how close to the camera things can be and still be drawn. The closest
          zoom puts the camera only 0.1 above the surface, so it must be smaller than that. */}
      <Canvas camera={{ position: [0, 0, 7], near: 0.01 }}>
        <Lighting mode={lighting} />

        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          fade
        />

        <Earth />
        {layers.borders && <Borders />}

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

        {/* Paused while the info view is open: it uses the hand gestures instead. */}
        <HandCameraControls
          gestureRef={gestureRef}
          earthRadius={EARTH_RADIUS}
          paused={selectedArea !== null}
        />

        <ZoomReadout barRef={zoomBarRef} targetRef={zoomTargetRef} />
        <LabelPositioner layerRef={labelsRef} />
      </Canvas>

      {/* Country and city names over the globe */}
      <PlaceLabels layerRef={labelsRef} visible={layers.labels} coordinates={layers.coordinates} />

      {/* Data credits (CC BY data must be credited where it's shown) */}
      <p className="map-credits">
        Imagery: NASA Blue Marble · Borders: <a href="https://www.naturalearthdata.com/">Natural Earth</a> ·
        Cities: <a href="https://simplemaps.com/data/world-cities">SimpleMaps</a> (CC BY 4.0)
      </p>

      {/* Webcam hand tracking */}
      <HandTracker gestureRef={gestureRef} context={selectedArea ? "info" : "globe"} />

      {/* UI overlay */}
      <Header
        lighting={lighting}
        onLightingChange={setLighting}
        layers={layers}
        onLayersChange={setLayers}
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
          gestureRef={gestureRef}
        />
      )}
    </div>
  );
}





