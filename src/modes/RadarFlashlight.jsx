/*
 * RadarFlashlight - Flashlight mode: a circular "lens" that reveals a site's radar
 * image on the globe. Outside the lens you see the normal Earth photo.
 *
 * Two parts:
 *  - <RadarFlashlight> (inside <Canvas>): the radar image, bent to fit the globe
 *    over its lat/lon box, with a small shader that only shows the pixels inside
 *    the lens. Every frame it also works out where the lens is.
 *  - <LensOverlay> (outside <Canvas>, plain HTML): the glowing ring, the
 *    "RADAR VIEW" label and the "No radar data here" message.
 *
 * Where the lens goes:
 *  - Pointing finger (index straight, other fingers bent): lens follows the fingertip.
 *  - Otherwise, moving the mouse moves the lens (handy when no hand is in view).
 *  - The lens is stored as a point ON THE GLOBE, not on the screen, so it stays
 *    stuck to the ground when the globe turns.
 *
 * All the tuning numbers live in ../tuning.js.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Raycaster, SRGBColorSpace, Sphere, TextureLoader, Vector2, Vector3 } from "three";
import { EARTH_RADIUS } from "../components/Earth";
import { insideBounds, vectorToLatLon } from "../geo";
import { LENS_EDGE_SOFTNESS, LENS_FADE_SPEED, LENS_SMOOTHING, POINTER_GAIN } from "../tuning";
import { patchArgs, patchVertexShader } from "./radarPatch";

const DEG = Math.PI / 180;

// The shader: runs once per pixel of the radar image on screen (the vertex
// shader is shared with Time mode, in radarPatch.js).
// It measures how far (as an angle around the globe) the pixel is from the lens
// centre, and fades the pixel out beyond the lens radius.
const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;   // the radar image
  uniform vec3 uLensDir;    // lens centre (direction from the Earth's centre)
  uniform float uLensAngle; // lens radius, as an angle around the globe (radians)
  uniform float uSoftness;  // soft edge, as a fraction of the radius
  uniform float uOpacity;   // 0..1, fades the whole lens in/out
  varying vec2 vUv;
  varying vec3 vDir;
  void main() {
    // Angle between this point and the lens centre. (2*asin(chord/2) stays
    // accurate for tiny angles, unlike acos(dot), which matters when zoomed in.)
    float angle = 2.0 * asin(clamp(length(normalize(vDir) - uLensDir) * 0.5, 0.0, 1.0));
    float inside = 1.0 - smoothstep(uLensAngle * (1.0 - uSoftness), uLensAngle, angle);
    float alpha = inside * uOpacity;
    if (alpha < 0.002) discard; // outside the lens: draw nothing, the Earth shows through
    vec4 color = texture2D(uMap, vUv);
    gl_FragColor = vec4(color.rgb, color.a * alpha);
    #include <colorspace_fragment>
  }
`;

// Scratch objects reused every frame.
const earthSphere = new Sphere(new Vector3(), EARTH_RADIUS);
const raycaster = new Raycaster();
const ndc = new Vector2();
const hit = new Vector3();
const lensPoint = new Vector3();
const projected = new Vector3();

export function RadarFlashlight({ area, gestureRef, overlayRef, radiusPx }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const { bounds } = area;

  // Load the site's radar image (the newest observation).
  const imageUrl = area.observations.at(-1)?.image;
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;
    new TextureLoader().load(imageUrl, (t) => {
      t.colorSpace = SRGBColorSpace;
      if (cancelled) t.dispose();
      else setTexture(t);
    });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);
  useEffect(() => () => texture?.dispose(), [texture]); // free GPU memory when replaced

  // A piece of sphere covering exactly the image's lat/lon box (see radarPatch.js).
  const geometryArgs = useMemo(() => patchArgs(bounds), [bounds]);

  // Starting values for the shader's inputs ("uniforms"); updated every frame below.
  const uniforms = useMemo(
    () => ({
      uMap: { value: null },
      uLensDir: { value: new Vector3(1, 0, 0) },
      uLensAngle: { value: 0 },
      uSoftness: { value: LENS_EDGE_SOFTNESS },
      uOpacity: { value: 0 },
    }),
    []
  );

  // The mouse position (canvas pixels) and whether it moved since last frame.
  const mouse = useRef({ x: 0, y: 0, moved: false });
  useEffect(() => {
    const onMove = (e) => {
      const r = gl.domElement.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top, moved: true };
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  const lens = useRef({ placed: false, opacity: 0, finger: null });
  const material = useRef(null); // the shader material: we update its uniforms each frame

  useFrame((_, delta) => {
    const L = lens.current;
    const g = gestureRef.current;
    const u = material.current?.uniforms;
    if (!u) return;
    u.uMap.value = texture;

    // 1. Where is the pointer on screen this frame (if it moved)?
    let screenX = null;
    let screenY = null;
    if (g.mode === "zoom" && g.tip) {
      // Pointing: map the fingertip (0..1 in the webcam picture) to the screen,
      // magnified around the centre so the edges are reachable, then smooth it.
      const tx = (0.5 + (g.tip.x - 0.5) * POINTER_GAIN) * size.width;
      const ty = (0.5 + (g.tip.y - 0.5) * POINTER_GAIN) * size.height;
      if (!L.finger) L.finger = { x: tx, y: ty }; // just started pointing: no lag
      L.finger.x += LENS_SMOOTHING * (tx - L.finger.x);
      L.finger.y += LENS_SMOOTHING * (ty - L.finger.y);
      screenX = L.finger.x;
      screenY = L.finger.y;
    } else {
      L.finger = null;
      if (mouse.current.moved) {
        screenX = mouse.current.x;
        screenY = mouse.current.y;
        mouse.current.moved = false;
      }
    }

    // 2. Turn that screen point into a point on the globe (shoot a ray from the
    //    camera through the pointer and see where it hits the Earth sphere).
    if (screenX !== null) {
      ndc.set((screenX / size.width) * 2 - 1, -(screenY / size.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectSphere(earthSphere, hit)) {
        lensPoint.copy(hit);
        L.placed = true;
      }
    }

    const el = overlayRef.current;
    if (!L.placed) {
      if (el) el.style.visibility = "hidden";
      return;
    }

    // 3. Is the lens on the side of the globe facing us? Where is it on screen?
    const facing = lensPoint.dot(camera.position) > EARTH_RADIUS * EARTH_RADIUS;
    projected.copy(lensPoint).project(camera);
    const x = ((projected.x + 1) / 2) * size.width;
    const y = ((1 - projected.y) / 2) * size.height;

    // 4. Lens size: radiusPx on screen -> an angle around the globe, using how far
    //    the lens point is from the camera. (Exact when looking straight down,
    //    slightly off near the globe's edge, where the ground is seen at a slant.)
    const focalPx = size.height / 2 / Math.tan((camera.fov * Math.PI) / 360);
    const worldRadius = (radiusPx * camera.position.distanceTo(lensPoint)) / focalPx;

    // 5. Radar data here? It counts if any part of the lens overlaps the image's
    //    box: grow the box by the lens radius, then test the lens centre against it.
    //    (Longitude degrees shrink toward the poles, hence the divide by cos(lat).)
    const { lat, lon } = vectorToLatLon(lensPoint.x, lensPoint.y, lensPoint.z);
    const growDeg = (worldRadius / EARTH_RADIUS) / DEG;
    const growLonDeg = growDeg / Math.max(0.05, Math.cos(lat * DEG));
    const grown = {
      west: bounds.west - growLonDeg,
      east: bounds.east + growLonDeg,
      south: bounds.south - growDeg,
      north: bounds.north + growDeg,
    };
    const hasData = facing && texture !== null && insideBounds(lat, lon, grown);
    const fade = Math.min(1, LENS_FADE_SPEED * delta);
    L.opacity += ((hasData ? 1 : 0) - L.opacity) * fade;

    u.uLensDir.value.copy(lensPoint).normalize();
    u.uLensAngle.value = worldRadius / EARTH_RADIUS;
    u.uOpacity.value = L.opacity;

    // 6. Move the HTML ring to match.
    if (el) {
      el.style.visibility = facing ? "visible" : "hidden";
      el.style.transform = `translate(${(x - radiusPx).toFixed(1)}px, ${(y - radiusPx).toFixed(1)}px)`;
      if (L.radiusPx !== radiusPx) {
        // Only resize the ring when the size actually changed (resizing costs a re-layout).
        el.style.width = el.style.height = `${radiusPx * 2}px`;
        L.radiusPx = radiusPx;
      }
      el.classList.toggle("no-data", !hasData);
    }
  });

  return (
    <mesh renderOrder={1}>
      <sphereGeometry args={geometryArgs} />
      <shaderMaterial
        ref={material}
        vertexShader={patchVertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/** The glowing ring, label and "no data" message (HTML on top of the globe). */
export function LensOverlay({ overlayRef }) {
  return (
    <div className="lens" ref={overlayRef} aria-hidden="true">
      <div className="lens-ring" />
      <span className="lens-label">RADAR VIEW</span>
      <span className="lens-nodata">No radar data here</span>
    </div>
  );
}
