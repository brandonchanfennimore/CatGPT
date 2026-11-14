"""
Turn three OPERA DSWx-S1 browse PNGs (tile T30SYJ, Valencia) into web overlays:
  - one PNG per date: water = blue, inundated vegetation = cyan, everything else transparent
  - change.png: water that appeared after the flood = red, water already there = faint blue
All re-projected from the tile's UTM grid (EPSG:32630) to plain lat/lon (EPSG:4326)
and cropped to the flood area, so the app can drape them over a lat/lon box.

Step 1, download the three browse PNGs (public, no login; ~19 KB each) into data/raw/dswx:
  mkdir -p data/raw/dswx && cd data/raw/dswx
  B=https://archive.podaac.earthdata.nasa.gov/podaac-ops-cumulus-public/OPERA_L3_DSWX-S1_V1/OPERA_L3_DSWx-S1_T30SYJ
  curl -L -o 20241019.png ${B}_20241019T180307Z_20241019T225807Z_S1A_30_v1.0_BROWSE.png
  curl -L -o 20241031.png ${B}_20241031T180258Z_20241102T080220Z_S1A_30_v1.0_BROWSE.png
  curl -L -o 20241107.png ${B}_20241107T175439Z_20241109T013651Z_S1A_30_v1.0_BROWSE.png
(Found with NASA's CMR search: short_name=OPERA_L3_DSWX-S1_V1, point=-0.42,39.38.)

Step 2, convert (from the project folder):
  pipeline/.venv/bin/python pipeline/valencia_dswx.py data/raw/dswx public/radar/valencia

Colours in the browse PNGs: white = not water, blue = open water,
green = inundated vegetation, index 255 = outside the radar swath.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from rasterio.crs import CRS
from rasterio.transform import Affine, from_bounds
from rasterio.warp import Resampling, reproject, transform

raw_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)

DATES = {"20241019": "2024-10-19", "20241031": "2024-10-31", "20241107": "2024-11-07"}

# MGRS tile 30SYJ in UTM zone 30N: OPERA uses the 100 km MGRS square (700000-800000 E,
# 4300000-4400000 N) plus a 4.9 km margin on every side = 109.8 km. Upper-left corner
# solved from NASA's catalogue box (fits to < 1e-6 degrees). Browse PNG = 1024 px across.
UTM = CRS.from_epsg(32630)
TILE_ULX, TILE_ULY, TILE_SIZE, PX = 695100.0, 4404900.0, 109800.0, 1024
SRC_TRANSFORM = Affine(TILE_SIZE / PX, 0, TILE_ULX, 0, -TILE_SIZE / PX, TILE_ULY)

# Sanity check: tile corners in lat/lon must match NASA's catalogue box for this tile
# (lat 38.7519666..39.7716958, lon -0.7538667..0.5580355).
xs = [TILE_ULX, TILE_ULX + TILE_SIZE, TILE_ULX, TILE_ULX + TILE_SIZE]
ys = [TILE_ULY, TILE_ULY, TILE_ULY - TILE_SIZE, TILE_ULY - TILE_SIZE]
lons, lats = transform(UTM, CRS.from_epsg(4326), xs, ys)
print("tile lat", round(min(lats), 4), round(max(lats), 4), "lon", round(min(lons), 4), round(max(lons), 4))
assert abs(min(lats) - 38.7520) < 0.01 and abs(max(lons) - 0.5580) < 0.01, "georeference mismatch"

# Output box: the flood zone south of Valencia (L'Horta Sud, Albufera lagoon) plus the city.
BOUNDS = {"west": -0.68, "south": 39.18, "east": -0.22, "north": 39.56}
RES = 0.0008  # degrees per pixel (~70-90 m), close to the browse image's ~107 m
width = round((BOUNDS["east"] - BOUNDS["west"]) / RES)
height = round((BOUNDS["north"] - BOUNDS["south"]) / RES)
DST_TRANSFORM = from_bounds(BOUNDS["west"], BOUNDS["south"], BOUNDS["east"], BOUNDS["north"], width, height)

FILL = 255  # outside the radar swath


def to_latlon(classes):
    """Re-project a class map (0 dry, 1 water, 3 inundated vegetation, 255 fill) to the lat/lon box."""
    out = np.full((height, width), FILL, dtype=np.uint8)
    reproject(classes, out, src_transform=SRC_TRANSFORM, src_crs=UTM, dst_transform=DST_TRANSFORM,
              dst_crs=CRS.from_epsg(4326), resampling=Resampling.nearest, src_nodata=FILL, dst_nodata=FILL)
    return out


def rgba(classes):
    img = np.zeros((height, width, 4), dtype=np.uint8)  # transparent by default
    img[classes == 1] = (40, 120, 255, 220)  # open water: blue
    img[classes == 3] = (0, 229, 255, 200)  # inundated vegetation: cyan
    return img


maps = {}
for key, date in DATES.items():
    classes = to_latlon(np.array(Image.open(raw_dir / f"{key}.png")))
    maps[date] = classes
    Image.fromarray(rgba(classes)).save(out_dir / f"{date}.png", optimize=True)

# Change map: wet after the flood (31 Oct) but dry before (19 Oct) = new flood water.
wet = lambda c: (c == 1) | (c == 3)
before, after = maps["2024-10-19"], maps["2024-10-31"]
seen = (before != FILL) & (after != FILL)
change = np.zeros((height, width, 4), dtype=np.uint8)
change[seen & wet(before) & wet(after)] = (40, 120, 255, 90)  # water both times: faint blue
change[seen & ~wet(before) & wet(after)] = (255, 59, 48, 235)  # NEW water: red
Image.fromarray(change).save(out_dir / "change.png", optimize=True)

new_px = int((seen & ~wet(before) & wet(after)).sum())
km2 = new_px * (RES * 111.32) * (RES * 111.32 * np.cos(np.radians(39.37)))
print("size", width, "x", height, "| new water pixels", new_px, f"~{km2:.0f} km2")
print(json.dumps(BOUNDS))
