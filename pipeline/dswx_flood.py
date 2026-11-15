"""
dswx_flood.py - turn NASA OPERA DSWx-S1 flood maps into overlays for the web app.

For each site below it:
  1. downloads the "browse" PNGs (public, no login, ~20 KB each) into data/raw/dswx/<site>/
  2. places them on the map: the PNG covers one 109.8 km UTM tile; we work out the
     tile's exact position from NASA's catalogue box, then re-project to plain lat/lon
  3. recolours: open water = blue, inundated vegetation = cyan, everything else transparent
  4. makes change.png: water that appeared after the flood = red, water already there = faint blue
  5. crops to the site's box and saves to public/radar/<site>/

Usage (from the project folder):
  pipeline/.venv/bin/python pipeline/dswx_flood.py valencia
  pipeline/.venv/bin/python pipeline/dswx_flood.py boris

To add a flood: find granules with NASA's CMR search, e.g.
  https://cmr.earthdata.nasa.gov/search/granules.json?short_name=OPERA_L3_DSWX-S1_V1&point=LON,LAT&temporal=START,END
pick one tile (Txxxxx in the name) and images from the SAME time of day (same satellite
track) before and after the flood, then add an entry to SITES.

Browse PNG colours: white = not water, blue = open water, green = inundated vegetation,
palette index 255 = outside the radar swath.
"""
import sys
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image
from rasterio.crs import CRS
from rasterio.transform import Affine, from_bounds
from rasterio.warp import Resampling, reproject, transform

BROWSE_URL = (
    "https://archive.podaac.earthdata.nasa.gov/podaac-ops-cumulus-public/OPERA_L3_DSWX-S1_V1/"
    "OPERA_L3_DSWx-S1_{tile}_{stamp}_S1A_30_v1.0_BROWSE.png"
)

SITES = {
    "valencia": {
        "tile": "T30SYJ",
        "utm_epsg": 32630,  # UTM zone 30 north
        # NASA catalogue box for the tile: south, west, north, east (degrees)
        "tile_box": (38.7519666, -0.7538667, 39.7716958, 0.5580355),
        # date -> the part of the granule name after the tile ID
        "images": {
            "2024-10-19": "20241019T180307Z_20241019T225807Z",
            "2024-10-31": "20241031T180258Z_20241102T080220Z",
            "2024-11-07": "20241107T175439Z_20241109T013651Z",
        },
        "change": ("2024-10-19", "2024-10-31"),  # (before, after) for change.png
        "bounds": {"west": -0.68, "south": 39.18, "east": -0.22, "north": 39.56},
        "res": 0.0008,  # output degrees per pixel
    },
    "boris": {
        "tile": "T33UXR",
        "utm_epsg": 32633,  # UTM zone 33 north
        "tile_box": (49.5737555, 16.3161272, 50.5882515, 17.8930338),
        # The 05:01 UTC track: covers 98% of the valley. (The 16:51 track only
        # clips the tile's corner, so it's almost all "no data" here.)
        "images": {
            "2024-09-03": "20240903T050154Z_20251107T051808Z",
            "2024-09-15": "20240915T050210Z_20240915T135736Z",
            "2024-09-27": "20240927T050147Z_20240930T004926Z",
        },
        "change": ("2024-09-03", "2024-09-15"),
        # Otmuchow + Nysa reservoirs, Nysa town and the river plain to its north.
        # (The mountain valleys upstream are too narrow for this ~107 m browse image.)
        "bounds": {"west": 16.95, "south": 50.40, "east": 17.70, "north": 50.585},
        "res": 0.001,
    },
}

TILE_SIZE, PX, FILL = 109800.0, 1024, 255  # metres, browse pixels, "no data" index
LATLON = CRS.from_epsg(4326)


def tile_corner(utm, tile_box):
    """Find the tile's upper-left corner (UTM metres) whose lat/lon envelope matches
    NASA's catalogue box. (OPERA tiles = 100 km MGRS square + 4.9 km margin.)"""
    target = np.array(tile_box)

    def envelope(ulx, uly):
        xs = [ulx, ulx + TILE_SIZE, ulx, ulx + TILE_SIZE]
        ys = [uly, uly, uly - TILE_SIZE, uly - TILE_SIZE]
        lons, lats = transform(utm, LATLON, xs, ys)
        return np.array([min(lats), min(lons), max(lats), max(lons)])

    # Start from the box centre, then refine with a few Newton steps.
    (cx,), (cy,) = transform(LATLON, utm, [(target[1] + target[3]) / 2], [(target[0] + target[2]) / 2])
    ulx, uly = cx - TILE_SIZE / 2, cy + TILE_SIZE / 2
    for _ in range(20):
        err = envelope(ulx, uly) - target
        jac = np.column_stack([(envelope(ulx + 10, uly) - envelope(ulx, uly)) / 10,
                               (envelope(ulx, uly + 10) - envelope(ulx, uly)) / 10])
        step = np.linalg.lstsq(jac, -err, rcond=None)[0]
        ulx, uly = ulx + step[0], uly + step[1]
    err = np.abs(envelope(ulx, uly) - target).max()
    assert err < 1e-4, f"could not place the tile (error {err:.6f} degrees)"
    return round(ulx), round(uly)


def main(name):
    site = SITES[name]
    raw_dir = Path("data/raw/dswx") / name
    out_dir = Path("public/radar") / name
    raw_dir.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1. Download any missing browse images.
    for date, stamp in site["images"].items():
        path = raw_dir / f"{date}.png"
        if not path.exists():
            url = BROWSE_URL.format(tile=site["tile"], stamp=stamp)
            print("downloading", url)
            urllib.request.urlretrieve(url, path)

    # 2. Georeference: tile grid in UTM, output grid in lat/lon.
    utm = CRS.from_epsg(site["utm_epsg"])
    ulx, uly = tile_corner(utm, site["tile_box"])
    print(f"{site['tile']} upper-left corner: {ulx} E, {uly} N")
    src_transform = Affine(TILE_SIZE / PX, 0, ulx, 0, -TILE_SIZE / PX, uly)
    b, res = site["bounds"], site["res"]
    width, height = round((b["east"] - b["west"]) / res), round((b["north"] - b["south"]) / res)
    dst_transform = from_bounds(b["west"], b["south"], b["east"], b["north"], width, height)

    def to_latlon(classes):
        out = np.full((height, width), FILL, dtype=np.uint8)
        reproject(classes, out, src_transform=src_transform, src_crs=utm, dst_transform=dst_transform,
                  dst_crs=LATLON, resampling=Resampling.nearest, src_nodata=FILL, dst_nodata=FILL)
        return out

    # 3. Recolour each date.
    maps = {}
    for date in site["images"]:
        classes = to_latlon(np.array(Image.open(raw_dir / f"{date}.png")))
        maps[date] = classes
        img = np.zeros((height, width, 4), dtype=np.uint8)  # transparent
        img[classes == 1] = (40, 120, 255, 220)  # open water: blue
        img[classes == 3] = (0, 229, 255, 200)  # inundated vegetation: cyan
        Image.fromarray(img).save(out_dir / f"{date}.png", optimize=True)

    # 4. Change map: wet after but dry before = new flood water.
    wet = lambda c: (c == 1) | (c == 3)
    before, after = (maps[d] for d in site["change"])
    seen = (before != FILL) & (after != FILL)
    new = seen & ~wet(before) & wet(after)
    change = np.zeros((height, width, 4), dtype=np.uint8)
    change[seen & wet(before) & wet(after)] = (40, 120, 255, 90)  # water both times: faint blue
    change[new] = (255, 59, 48, 235)  # NEW water: red
    Image.fromarray(change).save(out_dir / "change.png", optimize=True)

    mid_lat = np.radians((b["north"] + b["south"]) / 2)
    km2 = new.sum() * (res * 111.32) ** 2 * np.cos(mid_lat)
    print(f"{width}x{height} px, new water ~{km2:.0f} km2 -> {out_dir}")


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in SITES:
        sys.exit(f"usage: dswx_flood.py <{'|'.join(SITES)}>")
    main(sys.argv[1])
