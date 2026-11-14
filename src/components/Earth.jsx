import { useEffect, useState } from "react";
import { SRGBColorSpace, TextureLoader } from "three";

export const EARTH_RADIUS = 2;

// Put a world map image at public/textures/earth.jpg (equirectangular, i.e. a
// flat 2:1 map). If the file is missing we fall back to a plain blue sphere.
const TEXTURE_URL = "/textures/earth.jpg";

export default function Earth() {
  const [map, setMap] = useState(null);

  useEffect(() => {
    new TextureLoader().load(
      TEXTURE_URL,
      (texture) => {
        texture.colorSpace = SRGBColorSpace; // photo colours, not raw data
        setMap(texture);
      },
      undefined,
      () => console.warn(`No Earth texture at ${TEXTURE_URL}, using plain blue.`)
    );
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 128, 64]} />
      {/* `key` forces a fresh material once the texture arrives, so three.js
          recompiles the shader with texture support. */}
      <meshStandardMaterial
        key={map ? "textured" : "plain"}
        map={map}
        color={map ? "white" : "#2876b8"}
      />
    </mesh>
  );
}
