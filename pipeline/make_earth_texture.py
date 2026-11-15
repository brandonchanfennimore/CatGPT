"""
make_earth_texture.py - build the globe's base map, public/textures/earth.jpg (8192 x 4096).

Downloads NASA Blue Marble (shaded relief + ocean bathymetry) from NASA GIBS (the same tiles the globe
loads for close-up detail, see src/components/EarthTiles.jsx) and stitches them:
zoom level 4 of the "500m" tile set is 20 x 10 tiles of 512 px, 18 degrees each,
covering the whole world (10240 x 5120 px). That is resized to 8192 x 4096 (about
5 km per pixel), a size most graphics cards can use as one texture (three.js shrinks
it automatically on devices that can't).

Usage (from the project folder):
  pipeline/.venv/bin/python pipeline/make_earth_texture.py
"""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image

TILE_URL = ("https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/"
            "BlueMarble_ShadedRelief_Bathymetry/default/500m/{z}/{row}/{col}.jpeg")
LEVEL, COLS, ROWS, TILE = 4, 20, 10, 512
OUT = Path("public/textures/earth.jpg")
SIZE = (8192, 4096)


def tile(rc):
    row, col = rc
    r = requests.get(TILE_URL.format(z=LEVEL, row=row, col=col), timeout=60)
    r.raise_for_status()
    return row, col, Image.open(BytesIO(r.content)).convert("RGB")


def main():
    world = Image.new("RGB", (COLS * TILE, ROWS * TILE))
    jobs = [(row, col) for row in range(ROWS) for col in range(COLS)]
    with ThreadPoolExecutor(6) as pool:  # gentle on NASA's server
        for row, col, img in pool.map(tile, jobs):
            world.paste(img, (col * TILE, row * TILE))
    world.resize(SIZE, Image.LANCZOS).save(OUT, quality=88, optimize=True, progressive=True)
    print(f"saved {OUT} ({OUT.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
