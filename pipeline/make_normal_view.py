"""
make_normal_view.py - turn radar timeline images into "normal view" images:
a true-colour satellite photo with the water the radar detected painted blue on top.

Run after fetch_asf.py. It reads public/<satellite>/<name>/manifest.json and:
  1. Downloads one cloud-free true-colour photo of the area from NASA GIBS
     (HLS = Harmonized Landsat Sentinel-2, 30 m pixels). It is the same photo
     in every frame - only the blue water changes.
  2. Finds water in each radar image: smooth water reflects the radar away
     from the satellite, so it is the darkest part of the image. In Sentinel-1
     previews water is also the only blue thing, which catches water roughened
     by wind or heavy rain (it looks lighter blue, not dark).
  3. Paints that water blue on the photo and saves <image>_normal.jpg.
  4. Adds "normalImage" to each observation in manifest.json.

The water outline is a simple colour/darkness cut-off, so it is a picture of the flood,
not a scientific flood map: very smooth dry ground (bare fields, runways) can be
picked up as water, and edges are only as sharp as the radar preview (~170 m).

Usage:
    python pipeline/make_normal_view.py chokwe-flood
    python pipeline/make_normal_view.py chokwe-flood --photo-date 2025-08-15
    python pipeline/make_normal_view.py chokwe-flood --threshold 50
    python pipeline/make_normal_view.py sylhet-2022        (a Sentinel-1 folder works too)
"""

import argparse
import json
import math
import sys
from datetime import date, timedelta
from io import BytesIO
from pathlib import Path

try:
    import numpy as np
    import requests
    from PIL import Image, ImageFilter
except ImportError as e:
    sys.exit(f"Missing library: {e.name}. Run with pipeline/.venv/bin/python, "
             f"or: pip install numpy requests Pillow")

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"

GIBS_WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"
PHOTO_LAYER = "HLS_S30_Nadir_BRDF_Adjusted_Reflectance"  # Sentinel-2 part of HLS
PHOTO_WIDTH = 1000  # pixels; 50 km / 1000 = 50 m per pixel

WATER_RGB = np.array([40, 120, 255], dtype=float)  # bright blue
WATER_OPACITY = 0.8
# Per satellite: radar pixels this dark (0-255) are "no data", not water (JPEG
# previews have noise in their black background), and the default darkness cut-off.
NO_DATA_MAX = {"nisar": 5, "sentinel1": 15}
DARK_THRESHOLD = {"nisar": 55, "sentinel1": 45}


def parse_args():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("name", help="study area folder, e.g. chokwe-flood (looked up under public/<satellite>/)")
    p.add_argument("--photo-date", help="date of the true-colour photo (default: search for a clear day)")
    p.add_argument("--threshold", type=float,
                   help="radar brightness (0-255) below which a pixel counts as water "
                        "(default 55 for NISAR, 45 for Sentinel-1)")
    return p.parse_args()


# ---------- true-colour photo ----------

def area_bounds(observations):
    """One box covering every radar crop (they differ by a pixel or two)."""
    b = [o["bounds"] for o in observations]
    return (min(x["west"] for x in b), min(x["south"] for x in b),
            max(x["east"] for x in b), max(x["north"] for x in b))


def get_photo(bounds, day):
    """Ask GIBS for the true-colour image of `bounds` on `day`. Returns RGBA or None."""
    west, south, east, north = bounds
    # Make pixels square on the ground: a degree of longitude shrinks by cos(latitude).
    mid_lat = math.radians((south + north) / 2)
    height = round(PHOTO_WIDTH * (north - south) / ((east - west) * math.cos(mid_lat)))
    params = dict(SERVICE="WMS", REQUEST="GetMap", VERSION="1.3.0", LAYERS=PHOTO_LAYER,
                  CRS="EPSG:4326", BBOX=f"{south},{west},{north},{east}",  # WMS 1.3 + EPSG:4326 = lat first
                  WIDTH=PHOTO_WIDTH, HEIGHT=height, FORMAT="image/png", TRANSPARENT="TRUE", TIME=day)
    try:
        r = requests.get(GIBS_WMS, params=params, timeout=120)
    except requests.RequestException:
        return None
    if not r.headers.get("content-type", "").startswith("image"):
        return None
    return Image.open(BytesIO(r.content)).convert("RGBA")


def photo_quality(img):
    """(fraction of the box covered by data, fraction that looks like cloud)."""
    a = np.asarray(img).astype(int)
    has_data = a[..., 3] > 0
    cloud = (a[..., :3].min(axis=2) > 200) & has_data
    return has_data.mean(), cloud.mean()


def find_clear_photo(bounds, before_day, max_days=240):
    """Walk back day by day from `before_day` until a full, cloud-free photo turns up."""
    start = date.fromisoformat(before_day)
    for back in range(1, max_days + 1):
        day = (start - timedelta(days=back)).isoformat()
        img = get_photo(bounds, day)
        if img is None:
            continue
        covered, cloud = photo_quality(img)
        if covered > 0.99 and cloud < 0.02:
            return img, day
        if covered > 0:
            print(f"  {day}: {covered:.0%} covered, {cloud:.0%} cloud - keep looking")
    return None, None


# ---------- water from radar ----------

def water_mask(radar_img, threshold, satellite):
    """0..1 water amount per pixel: the darkest radar pixels, with specks smoothed out.
    Sentinel-1 previews also count blue pixels (blue clearly above red and green).

    Pixels that are almost exactly black (every channel <= NO_DATA_MAX) are not
    water: they're the edge of the radar swath or a seam where there's no data.
    Real water is much brighter than that (about 20-50). Their blurred border (4 px)
    is dropped too, so a swath edge doesn't turn into a blue stripe."""
    rgb = np.asarray(radar_img.convert("RGB")).astype(float)
    no_data = Image.fromarray(((rgb.max(axis=2) <= NO_DATA_MAX[satellite]) * 255).astype(np.uint8))
    no_data = np.asarray(no_data.filter(ImageFilter.MaxFilter(9))) > 0  # grow it by 4 px
    water = rgb.mean(axis=2) < threshold
    if satellite == "sentinel1":
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        water |= (b > r + 10) & (b > g + 10)
    water &= ~no_data
    mask = Image.fromarray((water * 255).astype(np.uint8))
    return mask.filter(ImageFilter.MedianFilter(3))  # drop single-pixel radar noise


def paint_water(photo, mask, crop_bounds, area):
    """Lay the water mask onto the photo, using lat/lon bounds to line them up."""
    west, south, east, north = area
    pw, ph = photo.size
    # Where this radar crop sits inside the photo, in photo pixels.
    x0 = round((crop_bounds["west"] - west) / (east - west) * pw)
    x1 = round((crop_bounds["east"] - west) / (east - west) * pw)
    y0 = round((north - crop_bounds["north"]) / (north - south) * ph)
    y1 = round((north - crop_bounds["south"]) / (north - south) * ph)
    # Bilinear upscaling + slight blur gives soft edges instead of radar-pixel blocks.
    big = mask.resize((x1 - x0, y1 - y0), Image.BILINEAR).filter(ImageFilter.GaussianBlur(2))
    alpha = Image.new("L", photo.size, 0)
    alpha.paste(big, (x0, y0))
    a = np.asarray(alpha).astype(float)[..., None] / 255 * WATER_OPACITY
    rgb = np.asarray(photo.convert("RGB")).astype(float)
    out = rgb * (1 - a) + WATER_RGB * a
    return Image.fromarray(out.round().astype(np.uint8)), float((np.asarray(alpha) > 127).mean())


def main():
    args = parse_args()
    found = sorted(PUBLIC_DIR.glob(f"*/{args.name}/manifest.json"))
    if not found:
        sys.exit(f"No public/<satellite>/{args.name}/manifest.json. Run fetch_asf.py first.")
    manifest_path = found[0]
    folder = manifest_path.parent
    manifest = json.loads(manifest_path.read_text())
    satellite = manifest.get("satellite", "nisar")  # older manifests are all NISAR
    threshold = args.threshold if args.threshold is not None else DARK_THRESHOLD[satellite]
    obs = manifest["observations"]
    if not obs:
        sys.exit("manifest.json has no observations.")
    area = area_bounds(obs)

    if args.photo_date:
        photo, photo_day = get_photo(area, args.photo_date), args.photo_date
        if photo is None or photo_quality(photo)[0] < 0.5:
            sys.exit(f"No usable {PHOTO_LAYER} image on {args.photo_date}. Try another date.")
    else:
        print(f"Looking for a cloud-free photo before {obs[0]['date']}...")
        photo, photo_day = find_clear_photo(area, obs[0]["date"])
        if photo is None:
            sys.exit("No cloud-free photo found. Pick one with --photo-date "
                     "(browse dates at https://worldview.earthdata.nasa.gov).")
    photo_file = folder / f"photo_{photo_day}.jpg"
    photo.convert("RGB").save(photo_file, quality=88)
    print(f"Photo: {PHOTO_LAYER} on {photo_day} -> {photo_file.relative_to(ROOT)}")

    for o in obs:
        radar_file = ROOT / "public" / o["image"].lstrip("/")
        mask = water_mask(Image.open(radar_file), threshold, satellite)
        normal, water_frac = paint_water(photo, mask, o["bounds"], area)
        out = radar_file.with_name(radar_file.stem + "_normal.jpg")
        normal.save(out, quality=85)
        o["normalImage"] = "/" + out.relative_to(ROOT / "public").as_posix()
        print(f"  {o['date']}: {water_frac:5.1%} water -> {out.relative_to(ROOT)}")

    manifest["normalView"] = {"photoLayer": PHOTO_LAYER, "photoDate": photo_day,
                              "waterThreshold": threshold}
    manifest_path.write_text(json.dumps(manifest, indent=2))
    print(f"\nUpdated {manifest_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
