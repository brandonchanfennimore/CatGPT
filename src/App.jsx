
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useCallback, useRef, useState } from "react";

import Earth, { EARTH_RADIUS } from "./components/Earth";
import EarthTiles from "./components/EarthTiles";
import Lighting from "./components/Lighting";
import { ZoomBar, ZoomReadout } from "./components/ZoomBar";
import { Borders, LabelPositioner, PlaceLabels } from "./components/MapOverlay";
import HandCameraControls from "./hands/HandCameraControls";
import HandTracker from "./hands/HandTracker";
import CameraFlyer from "./components/CameraFlyer";
import AdaptiveNear from "./components/AdaptiveNear";
import { RENDER_MAX_PIXEL_RATIO } from "./tuning";

import Header from "./components/Header";
import StudyAreaView from "./components/StudyAreaView";
import GestureTutorial from "./components/GestureTutorial";
import { countByCategory } from "./data/sites";
import { CATEGORIES } from "./data/categories";

import "./components/UI.css";
import { FloodMarkerLayer, FloodMarkerPositioner } from "./components/FloodMarkers";

const TUTORIAL_SEEN_KEY = "hand-me-the-earth:tutorial-seen";

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
  // Flood dots: their HTML layer, and what each dot shows right now.
  const floodLayerRef = useRef(null);
  const floodStateRef = useRef(null);
  // A camera flight in progress ({ dir, zoom }), or null. CameraFlyer flies it.
  const flyRef = useRef(null);

  // Currently selected NISAR study area
  const [selectedArea, setSelectedArea] = useState(null);

  // Lighting mode: bright or realistic
  const [lighting, setLighting] = useState("bright");

  // Which map layers are switched on (the "Map layers" panel under the title)
  const [layers, setLayers] = useState({ borders: true, labels: true, coordinates: true });
  // Event categories whose pins are hidden (toggled in the legend under "Map layers").
  const [hiddenCategories, setHiddenCategories] = useState(() => new Set());

  const infoFullScreen = selectedArea !== null;

  // Gesture tutorial: shown automatically on the first visit only (remembered in this
  // browser), and any time from the camera panel's "?" button.
  const handTrackerRef = useRef(null);
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return !localStorage.getItem(TUTORIAL_SEEN_KEY);
    } catch {
      return true; // storage blocked (private window): just show it
    }
  });
  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
    try {
      localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
    } catch {
      // storage blocked: it will show again next visit, which is fine
    }
  }, []);

  // Clicking a cluster of flood dots flies toward it.
  const flyTo = useCallback((target) => (flyRef.current = target), []);

  // Which gesture guide/labels the webcam panel shows.
  const handContext = infoFullScreen ? "info" : "explore";

  return (
    <div className="app-container">
      {/* 3D Earth scene */}
      {/* near: how close to the camera things can be and still be drawn. AdaptiveNear
          (below) keeps it right for the current altitude; 0.01 is just the start. */}
      {/* dpr: draw at most RENDER_MAX_PIXEL_RATIO real pixels per CSS pixel (see tuning.js). */}
      <Canvas camera={{ position: [0, 0, 7], near: 0.01 }} dpr={[1, RENDER_MAX_PIXEL_RATIO]}>
        <Lighting mode={lighting} />

        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          fade
        />

        <Earth />
        {/* Sharper NASA map tiles for the area in view when zoomed in */}
        <EarthTiles earthRadius={EARTH_RADIUS} />
        {layers.borders && <Borders />}

        {/* Clickable dots (HTML) that cluster when zoomed out (FloodMarkers.jsx). */}
        <FloodMarkerPositioner layerRef={floodLayerRef} stateRef={floodStateRef} hidden={hiddenCategories} />

        <OrbitControls
          makeDefault
          enableDamping
          enablePan={false}
          // Closest zoom: 0.4% of the Earth's radius above the ground (about 25 km),
          // close enough to see a city-sized flood.
          minDistance={EARTH_RADIUS * 1.004}
          maxDistance={EARTH_RADIUS * 10}
        />

        {/* Paused while the full-screen info view is open: it uses the hand gestures instead. */}
        <HandCameraControls
          gestureRef={gestureRef}
          earthRadius={EARTH_RADIUS}
          paused={infoFullScreen}
        />

        <CameraFlyer flyRef={flyRef} />
        <AdaptiveNear earthRadius={EARTH_RADIUS} />
        <ZoomReadout barRef={zoomBarRef} targetRef={zoomTargetRef} />
        <LabelPositioner layerRef={labelsRef} />
      </Canvas>

      {/* Country and city names over the globe */}
      <PlaceLabels layerRef={labelsRef} visible={layers.labels} coordinates={layers.coordinates} />

      {/* Flood dots over the globe (hidden while the full-screen info view is open) */}
      {!infoFullScreen && (
        <FloodMarkerLayer
          layerRef={floodLayerRef}
          stateRef={floodStateRef}
          onOpenSite={setSelectedArea}
          onFly={flyTo}
        />
      )}

      {/* Data credits (CC BY data must be credited where it's shown) */}
      <p className="map-credits">
        Imagery: NASA Blue Marble via NASA GIBS · Borders: <a href="https://www.naturalearthdata.com/">Natural Earth</a> ·
        Cities: <a href="https://simplemaps.com/data/world-cities">SimpleMaps</a> (CC BY 4.0) ·
        Radar: NASA OPERA (DSWx, DIST), ARIA, NISAR (NASA/ISRO) via NASA Earthdata · Copernicus Sentinel-1 data ·
        Normal-view photos: NASA HLS and MODIS via NASA GIBS
      </p>

      {/* Webcam hand tracking */}
      <HandTracker
        ref={handTrackerRef}
        gestureRef={gestureRef}
        context={handContext}
        onHelp={() => setShowTutorial(true)}
      />

      {/* Gesture tutorial: on the first visit, and from the camera panel's "?" button */}
      {showTutorial && (
        <GestureTutorial onClose={closeTutorial} onStartCamera={() => handTrackerRef.current?.start()} />
      )}

      {/* UI overlay */}
      <Header
        lighting={lighting}
        onLightingChange={setLighting}
        layers={layers}
        onLayersChange={setLayers}
        categories={CATEGORIES}
        siteCounts={countByCategory}
        hiddenCategories={hiddenCategories}
        onHiddenCategoriesChange={setHiddenCategories}
        gestureRef={gestureRef}
        gestureEnabled={!infoFullScreen && !showTutorial}
      />

      <ZoomBar barRef={zoomBarRef} targetRef={zoomTargetRef} />

      {/* Info view for the selected site (full screen) */}
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
