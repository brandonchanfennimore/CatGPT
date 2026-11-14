
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState } from "react";
import { MathUtils, Vector3 } from "three";

import Earth, { EARTH_RADIUS } from "./components/Earth";
import Lighting from "./components/Lighting";
import { ZoomBar, ZoomReadout } from "./components/ZoomBar";
import { Borders, LabelPositioner, PlaceLabels } from "./components/MapOverlay";
import HandCameraControls from "./hands/HandCameraControls";
import HandTracker from "./hands/HandTracker";
import { LensOverlay, RadarFlashlight } from "./modes/RadarFlashlight";
import CameraFlyer from "./modes/CameraFlyer";
import { CurtainDates, CurtainDivider, TimeCurtain } from "./modes/TimeCurtain";
import ModeBar from "./modes/ModeBar";
import { latLonToVector } from "./geo";
import {
  LENS_RADIUS_MAX_PX,
  LENS_RADIUS_MIN_PX,
  LENS_RADIUS_PX,
  LENS_WHEEL_SENSITIVITY,
  RADAR_FLY_ZOOM,
  RENDER_MAX_PIXEL_RATIO,
} from "./tuning";

import Header from "./components/Header";
import StudyAreaView from "./components/StudyAreaView";
import { studyAreas } from "./data/studyAreas";

import "./components/UI.css";
import LocationMarker from "./components/LocationMarker";

// Keyboard shortcuts for the modes (also shown on the mode buttons).
const MODE_KEYS = { 1: "explore", 2: "flashlight", 3: "time" };

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
  // The radar lens ring (HTML); RadarFlashlight moves it.
  const lensOverlayRef = useRef(null);
  // A camera flight in progress ({ dir, zoom }), or null. CameraFlyer flies it.
  const flyRef = useRef(null);
  // Time curtain: divider position (0..1 across the screen) and its HTML line.
  const splitRef = useRef({ x: 0.5, dragging: false });
  const dividerRef = useRef(null);

  // Currently selected NISAR study area
  const [selectedArea, setSelectedArea] = useState(null);

  // Lighting mode: bright or realistic
  const [lighting, setLighting] = useState("bright");

  // Which map layers are switched on (the "Map layers" panel under the title)
  const [layers, setLayers] = useState({ borders: true, labels: true, coordinates: true });

  // App mode: "explore" (spin, zoom, open sites), "flashlight" (radar lens),
  // "time" (before/after curtain).
  const [mode, setMode] = useState("explore");
  // The site whose radar is shown in Flashlight and Time modes.
  const [radarArea, setRadarArea] = useState(null);
  // Radar lens radius on screen (px): slider + mouse wheel.
  const [lensRadius, setLensRadius] = useState(LENS_RADIUS_PX);
  // Time mode: which pair of dates is compared (0 = 1st vs 2nd image, 1 = 2nd vs 3rd...).
  const [pair, setPair] = useState(0);
  const lastPair = Math.max(0, (radarArea?.observations.length ?? 1) - 2);
  const shownPair = Math.min(pair, lastPair);

  // Next (+1) / previous (-1) date pair; stops at the ends.
  const stepPair = useCallback((delta) => setPair((p) => MathUtils.clamp(p + delta, 0, lastPair)), [lastPair]);

  // The info view is full screen in Explore mode, a side panel in the radar modes.
  const infoCompact = mode !== "explore";
  const infoFullScreen = selectedArea !== null && !infoCompact;

  const switchMode = useCallback(
    (next) => {
      const area = radarArea ?? selectedArea ?? studyAreas[0];
      if (next !== "explore") setRadarArea(area);
      // The curtain only covers the site, so fly there when Time mode starts.
      if (next === "time" && mode !== "time" && area.center) {
        flyRef.current = { dir: new Vector3(...latLonToVector(area.center.lat, area.center.lon)), zoom: RADAR_FLY_ZOOM };
        splitRef.current.x = 0.5;
      }
      setMode(next);
    },
    [radarArea, selectedArea, mode]
  );

  // "Explore with radar": fly to the site, then show its radar under the lens.
  function exploreWithRadar(area) {
    setRadarArea(area);
    setSelectedArea(area); // keep its explanation open (as a side panel)
    setMode("flashlight");
    const { lat, lon } = area.center;
    flyRef.current = { dir: new Vector3(...latLonToVector(lat, lon)), zoom: RADAR_FLY_ZOOM };
  }

  // Keys 1 / 2 / 3 switch modes (ignored while typing in a text box).
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const typing = e.target.closest?.("textarea, [contenteditable], input:not([type=range]):not([type=checkbox])");
      if (typing) return;
      if (MODE_KEYS[e.key]) switchMode(MODE_KEYS[e.key]);
      // Time mode: ← / → step through date pairs (unless the zoom bar or a
      // slider has focus, since they use the arrow keys themselves).
      const arrow = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (mode === "time" && arrow && !e.target.closest?.(".zoom-bar, input")) {
        e.preventDefault();
        stepPair(arrow);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [switchMode, mode, stepPair]);

  // Flashlight mode: the mouse wheel over the globe resizes the lens
  // (instead of zooming; the zoom bar still zooms).
  useEffect(() => {
    if (mode !== "flashlight") return;
    const onWheel = (e) => {
      if (e.target.tagName !== "CANVAS") return; // scrolling the side panel etc.
      setLensRadius((r) =>
        MathUtils.clamp(r * Math.exp(-e.deltaY * LENS_WHEEL_SENSITIVITY), LENS_RADIUS_MIN_PX, LENS_RADIUS_MAX_PX)
      );
    };
    window.addEventListener("wheel", onWheel);
    return () => window.removeEventListener("wheel", onWheel);
  }, [mode]);

  // Which gesture guide/labels the webcam panel shows.
  const handContext = infoFullScreen ? "info" : mode;

  return (
    <div className="app-container" data-mode={mode}>
      {/* 3D Earth scene */}
      {/* near: how close to the camera things can be and still be drawn. The closest
          zoom puts the camera only 0.1 above the surface, so it must be smaller than that. */}
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
        {layers.borders && <Borders />}

        {/* Pins: clickable in Explore; in the radar modes they glow instead. */}
        <LocationMarker
          studyArea={studyAreas[0]}
          onSelect={setSelectedArea}
          interactive={mode === "explore"}
          glow={mode !== "explore"}
        />

        {mode === "flashlight" && radarArea?.bounds && (
          <RadarFlashlight
            area={radarArea}
            gestureRef={gestureRef}
            overlayRef={lensOverlayRef}
            radiusPx={lensRadius}
          />
        )}

        {mode === "time" && radarArea?.bounds && (
          <TimeCurtain
            area={radarArea}
            pair={shownPair}
            gestureRef={gestureRef}
            splitRef={splitRef}
            dividerRef={dividerRef}
            onStep={stepPair}
          />
        )}

        <OrbitControls
          makeDefault
          enableDamping
          enablePan={false}
          enableZoom={mode !== "flashlight"} // the wheel resizes the lens there
          minDistance={EARTH_RADIUS * 1.05}
          maxDistance={EARTH_RADIUS * 10}
        />

        {/* Paused while the full-screen info view is open: it uses the hand gestures instead. */}
        <HandCameraControls
          gestureRef={gestureRef}
          earthRadius={EARTH_RADIUS}
          paused={infoFullScreen}
          appMode={mode}
        />

        <CameraFlyer flyRef={flyRef} />
        <ZoomReadout barRef={zoomBarRef} targetRef={zoomTargetRef} />
        <LabelPositioner layerRef={labelsRef} />
      </Canvas>

      {/* Country and city names over the globe */}
      <PlaceLabels layerRef={labelsRef} visible={layers.labels} coordinates={layers.coordinates} />

      {mode === "flashlight" && <LensOverlay overlayRef={lensOverlayRef} />}
      {mode === "time" && radarArea && (
        <>
          <CurtainDivider dividerRef={dividerRef} splitRef={splitRef} />
          <CurtainDates area={radarArea} pair={shownPair} />
        </>
      )}

      {/* Data credits (CC BY data must be credited where it's shown) */}
      <p className="map-credits">
        Imagery: NASA Blue Marble · Borders: <a href="https://www.naturalearthdata.com/">Natural Earth</a> ·
        Cities: <a href="https://simplemaps.com/data/world-cities">SimpleMaps</a> (CC BY 4.0)
      </p>

      {/* Webcam hand tracking */}
      <HandTracker gestureRef={gestureRef} context={handContext} />

      {/* UI overlay */}
      <Header
        lighting={lighting}
        onLightingChange={setLighting}
        layers={layers}
        onLayersChange={setLayers}
      />

      <ZoomBar barRef={zoomBarRef} targetRef={zoomTargetRef} />

      <ModeBar
        mode={mode}
        onModeChange={switchMode}
        siteName={radarArea?.name}
        lensRadius={lensRadius}
        onLensRadiusChange={setLensRadius}
      />

      <div className="explore-controls">
        <p>Use your hand or mouse to explore Earth.</p>

        <button
          onClick={() => setSelectedArea(studyAreas[0])}
        >
          Explore NISAR Data
        </button>
      </div>

      {/* NISAR study area info: full screen in Explore, a side panel in the radar modes */}
      {selectedArea && (
        <StudyAreaView
          studyArea={selectedArea}
          onBack={() => setSelectedArea(null)}
          // Hand gestures drive the info view only when it's full screen.
          gestureRef={infoCompact ? undefined : gestureRef}
          onExploreRadar={exploreWithRadar}
          compact={infoCompact}
        />
      )}
    </div>
  );
}
