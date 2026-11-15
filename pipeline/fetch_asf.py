"""
fetch_asf.py - find every radar pass over a point and grab images for the timeline.

Uses ASF's asf_search library (https://github.com/asfadmin/Discovery-asf_search).

Two satellites (--satellite):
  nisar      NASA-ISRO NISAR, L-band radar, data from late 2025 on (default).
  sentinel1  ESA Sentinel-1, C-band radar, data from 2014 on. Use it for floods
             before NISAR existed. Its previews: dark blue = water, yellow-green = land.

Two kinds of download:
  1. Preview PNGs (default). Every NISAR GCOV granule ships a ready-made
     "_LATLON.png" (~4 MB, ~180 m/pixel) plus a KML with its lat/lon box.
     These are PUBLIC - no Earthdata login. We crop each one around your
     point and write a manifest the app can use directly.
  2. Full .h5 files (--h5 N). The real science data, ~6-7 GB each, needs an
     Earthdata login. Saved to data/raw/ for inspect_h5.py and processing.

Searching by a point returns passes from several orbits (ascending and descending,
different tracks), each seeing the ground from another angle. A time series
is only fair if every frame comes from the SAME track + frame + direction, so by
default we keep only the combination with the most passes (--all-tracks to skip that).

Usage:
    python pipeline/fetch_asf.py --lat 34.05 --lon -118.25 --name los-angeles --list
    python pipeline/fetch_asf.py --lat 34.05 --lon -118.25 --name los-angeles
    python pipeline/fetch_asf.py --lat 34.05 --lon -118.25 --name los-angeles --radius-km 40
    python pipeline/fetch_asf.py --lat 34.05 --lon -118.25 --name los-angeles --h5 1
    python pipeline/fetch_asf.py --satellite sentinel1 --lat 24.90 --lon 91.87 \
        --name sylhet-2022 --start 2022-05-01 --end 2022-08-01

Earthdata login (only for --h5), any one of:
    EARTHDATA_TOKEN=...                         in env or .env
    EARTHDATA_USERNAME=... EARTHDATA_PASSWORD=... in env or .env
    a ~/.netrc entry for urs.earthdata.nasa.gov
"""

import argparse
import datetime
import json
import math
import os
import re
import sys
from collections import Counter
from io import BytesIO
from pathlib import Path

try:
    import asf_search as asf
    import numpy as np
    import requests
    from PIL import Image
except ImportError as e:
    sys.exit(f"Missing library: {e.name}. Use the pipeline's Python environment:\n"
             f"  pipeline/.venv/bin/python pipeline/fetch_asf.py --lat ... --lon ... --name ...\n"
             f"or install it into this Python:  pip install asf_search numpy requests Pillow")

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"
PUBLIC_DIR = ROOT / "public"

Image.MAX_IMAGE_PIXELS = None  # previews are big but trusted (from ASF)

# How to search each satellite, and how dark "no data" is in its previews.
# Sentinel-1 previews are JPEGs, whose black background picks up faint noise.
SATELLITES = {
    "nisar": {"search": {"dataset": asf.DATASET.NISAR}, "product": "GCOV", "no_data_max": 0},
    "sentinel1": {"search": {"platform": asf.PLATFORM.SENTINEL1, "beamMode": "IW"},
                  "product": "GRD_HD", "no_data_max": 15},
}


def parse_args(): 
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    # Not required: anything left out is asked for with a question (see ask_missing).
    p.add_argument("--lat", type=float, help="latitude, -90 (south) to 90 (north)")
    p.add_argument("--lon", type=float, help="longitude, -180 (west) to 180 (east)")
    p.add_argument("--name", help="study area id, used for the output folder")
    p.add_argument("--start", help="earliest date, e.g. 2025-10-01")
    p.add_argument("--end", help="latest date, e.g. 2026-11-01")
    p.add_argument("--satellite", choices=SATELLITES, default="nisar",
                   help="nisar (default, late 2025 on) or sentinel1 (2014 on)")
    p.add_argument("--product", help="product type (default: GCOV for NISAR, GRD_HD for Sentinel-1)")
    p.add_argument("--max", type=int, default=200, help="max search results (default 200)")
    p.add_argument("--radius-km", type=float, default=25, help="half-width of the crop around the point")
    p.add_argument("--all-tracks", action="store_true", help="keep passes from every track/frame")
    p.add_argument("--list", action="store_true", help="only print what was found, download nothing")
    p.add_argument("--h5", type=int, default=0, metavar="N",
                   help="also download the N newest full data files (.h5 for NISAR, .zip for Sentinel-1)")
    p.add_argument("--out", type=Path, help="output folder (default public/<satellite>/<name>)")
    return ask_missing(p.parse_args())


# ---------- questions (when lat / lon / name were not typed) ----------

def ask_number(question, low, high):
    """Keep asking until the answer is a number between low and high."""
    while True:
        answer = input(question).strip()
        try:
            value = float(answer)
        except ValueError:
            print(f"  '{answer}' is not a number. Example: -24.533")
            continue
        if low <= value <= high:
            return value
        print(f"  Must be between {low} and {high}.")


def ask_missing(args):
    """Fill in lat, lon and name by asking, for any the user didn't type."""
    if args.lat is None:
        args.lat = ask_number("Latitude  (-90 south to 90 north):  ", -90, 90)
    if args.lon is None:
        args.lon = ask_number("Longitude (-180 west to 180 east): ", -180, 180)
    if args.name is None:
        # Suggest a folder name built from the coordinates; Enter accepts it.
        suggested = f"area_{args.lat:.2f}_{args.lon:.2f}".replace("-", "m")
        answer = input(f"Name for this area [{suggested}]: ").strip()
        args.name = re.sub(r"[^A-Za-z0-9_-]+", "-", answer).strip("-") or suggested
    return args


# ---------- search ----------

def search(args):
    return search_point(args.lat, args.lon, args.satellite, args.start, args.end, args.product, args.max)


def search_point(lat, lon, satellite="nisar", start=None, end=None, product=None, max_results=200):
    """Every pass of `satellite` whose coverage includes (lat, lon), optionally between dates."""
    sat = SATELLITES[satellite]
    opts = dict(
        **sat["search"],
        processingLevel=product or sat["product"],
        intersectsWith=f"POINT({lon} {lat})",  # WKT is lon first, then lat
        maxResults=max_results,
    )
    if start:
        opts["start"] = start
    if end:
        opts["end"] = end
    return asf.search(**opts)


def track_key(g):
    """Passes with the same key look at the ground from the same geometry."""
    p = g.properties
    return (p.get("pathNumber"), p.get("frameNumber"), p.get("flightDirection"))


def pick_series(results, all_tracks):
    """Choose which passes to keep, oldest first, one per day."""
    granules = list(results)
    if not all_tracks and granules:
        best, _ = Counter(track_key(g) for g in granules).most_common(1)[0]
        granules = [g for g in granules if track_key(g) == best]
        # Some passes record only HH instead of HH+HV; their previews come out grey
        # instead of colour. Keep the most common polarization setup.
        pol = lambda g: str(g.properties.get("mainBandPolarization") or g.properties.get("polarization"))  # noqa: E731
        common, _ = Counter(pol(g) for g in granules).most_common(1)[0]
        granules = [g for g in granules if pol(g) == common]
    # The same pass can appear twice (PROVISIONAL and final V1). Prefer final, then newest processing.
    def rank(g):
        return ("PROVISIONAL" not in (g.properties.get("url") or ""), g.properties.get("processingDate") or "")
    by_day = {}
    for g in sorted(granules, key=rank):
        day = g.properties["startTime"][:10]
        by_day[(track_key(g), day)] = g
    return sorted(by_day.values(), key=lambda g: g.properties["startTime"])


def h5_bytes(g):
    """NISAR lists sizes per file ({filename: {"bytes": n}}); we want the .h5 one."""
    b = g.properties.get("bytes") or 0
    if isinstance(b, dict):
        return sum(v.get("bytes", 0) for k, v in b.items() if k.endswith(".h5") and "QA_" not in k)
    return b


def print_summary(results, chosen):
    counts = Counter(track_key(g) for g in results)
    print(f"Found {len(results)} granules. Track / frame / direction combinations:")
    for (path, frame, direction), n in counts.most_common():
        print(f"  track {path} frame {frame} {direction:<10} {n} passes")
    print(f"\nUsing {len(chosen)} passes:")
    for g in chosen:
        p = g.properties
        gb = h5_bytes(g) / 1e9
        print(f"  {p['startTime'][:10]}  track {p.get('pathNumber')} {p.get('flightDirection'):<10} "
              f"{gb:.1f} GB  {p['sceneName']}")


# ---------- preview images ----------

def preview_urls(g):
    """The full-size browse PNG, plus its KML if it has one.
    Newer granules have a "_LATLON.png" + ".kml". Older ones have a single map-grid PNG
    and no KML; for those we return (png, None) and place it with footprint_fit()."""
    browse = g.properties.get("browse") or []
    for url in browse:
        if url.endswith("_LATLON.png"):
            return url, url[: -len(".png")] + ".kml"
    for url in browse:  # skip thumbnails and NATIVE (radar geometry, not a map)
        if url.endswith((".png", ".jpg")) and "_thumbnail" not in url and "_NATIVE" not in url:
            return url, None
    return None, None


def sibling_kmls(chosen, g):
    """KML URLs of other passes on the same track + frame, newest first."""
    for other in reversed(chosen):
        if other is not g and track_key(other) == track_key(g):
            url = preview_urls(other)[1]
            if url:
                yield url


def kml_bounds(text):
    """Read west/south/east/north from a KML <LatLonQuad> or <LatLonBox>."""
    m = re.search(r"<coordinates>(.*?)</coordinates>", text, re.S)
    if m:
        pts = [tuple(map(float, c.split(",")[:2])) for c in m.group(1).split()]
        lons, lats = zip(*pts)
        return min(lons), min(lats), max(lons), max(lats)
    tags = {t: re.search(rf"<{t}>(.*?)</{t}>", text) for t in ("west", "south", "east", "north")}
    if all(tags.values()):
        return tuple(float(tags[t].group(1)) for t in ("west", "south", "east", "north"))
    raise ValueError("no bounds in KML")


# A "georef" is a 3x2 matrix M with  [pixel_x, pixel_y] = [lon, lat, 1] @ M.
# Both ways of placing an image (KML corners, footprint fit) produce one.

def bounds_to_georef(bounds, size):
    """A plain lat/lon grid: pixel position is linear in degrees."""
    west, south, east, north = bounds
    w, h = size
    sx, sy = w / (east - west), h / (north - south)
    return np.array([[sx, 0], [0, -sy], [-west * sx, north * sy]])


def footprint_fit(img, footprint, no_data_max=0):
    """Place a PNG that has no KML by matching the corners of its data area to the
    granule's footprint corners from the ASF search.

    The image shows the swath as a tilted rectangle on transparent black. Its
    northernmost / southernmost / easternmost / westernmost pixels are the same 4
    corners as the footprint polygon, so a least-squares fit gives lon/lat -> pixel.
    Returns (georef, worst corner error in pixels), or None."""
    a = np.asarray(img)
    mask = a.max(axis=2) > no_data_max  # no-data is black (or nearly, in a JPEG)
    solid = mask.copy()  # shave 2 px so stray specks can't pose as corners
    for dy in (-2, 0, 2):
        for dx in (-2, 0, 2):
            solid &= np.roll(np.roll(mask, dy, 0), dx, 1)
    ys, xs = np.nonzero(solid)
    if len(xs) == 0:
        return None
    px = {"N": (xs[ys.argmin()], ys.min()), "S": (xs[ys.argmax()], ys.max()),
          "W": (xs.min(), ys[xs.argmin()]), "E": (xs.max(), ys[xs.argmax()])}
    c = np.array(footprint)[:, :2]
    geo = {"N": c[c[:, 1].argmax()], "S": c[c[:, 1].argmin()],
           "W": c[c[:, 0].argmin()], "E": c[c[:, 0].argmax()]}
    A = np.array([[*geo[k], 1] for k in "NSEW"])
    B = np.array([px[k] for k in "NSEW"], dtype=float)
    M = np.linalg.lstsq(A, B, rcond=None)[0]
    return M, float(np.abs(A @ M - B).max())


def crop_around(img, georef, lat, lon, radius_km):
    """Cut a square of +/- radius_km around (lat, lon).
    Returns the crop and its lon/lat bounds (west, south, east, north)."""
    dlat = radius_km / 111.32
    dlon = radius_km / (111.32 * math.cos(math.radians(lat)))
    corners = np.array([[lon + sx * dlon, lat + sy * dlat, 1] for sx in (-1, 1) for sy in (-1, 1)])
    pxs = corners @ georef
    w, h = img.size
    left, top = max(0, round(pxs[:, 0].min())), max(0, round(pxs[:, 1].min()))
    right, bottom = min(w, round(pxs[:, 0].max())), min(h, round(pxs[:, 1].max()))
    if right - left < 2 or bottom - top < 2:
        return None, None
    # Map the final pixel box back to lon/lat (it may have been clipped at the image edge).
    inv = np.linalg.inv(np.vstack([georef.T, [0, 0, 1]]))  # pixel -> lon/lat
    lonlat = np.array([inv @ [x, y, 1] for x in (left, right) for y in (top, bottom)])[:, :2]
    bounds = (*lonlat.min(axis=0), *lonlat.max(axis=0))
    return img.crop((left, top, right, bottom)), tuple(round(float(b), 6) for b in bounds)


def show(path):
    """Path relative to the repo when possible, for shorter log lines."""
    try:
        return path.relative_to(ROOT)
    except ValueError:
        return path


def get_kml_bounds(url):
    try:
        r = requests.get(url, timeout=60)
        return kml_bounds(r.text) if r.ok else None
    except (requests.RequestException, ValueError):
        return None


def crop_preview(g, satellite, lat, lon, radius_km, others=(), known_bounds=None):
    """Download one pass's preview, place it on the map and crop around (lat, lon).

    Returns (crop, (west, south, east, north), method) on success,
    or (None, reason, None) saying why not.
    others:       other passes (same track) whose KML can stand in for a missing one.
    known_bounds: dict reused across calls so a KML is only fetched once per track."""
    known_bounds = {} if known_bounds is None else known_bounds
    png_url, kml_url = preview_urls(g)
    if not png_url:
        return None, "no preview image", None
    try:
        img = Image.open(BytesIO(requests.get(png_url, timeout=300).content)).convert("RGB")
    except (requests.RequestException, OSError) as e:
        return None, f"preview download failed ({e})", None
    georef, method = None, None
    if kml_url:
        grid = (track_key(g), img.size)
        bounds = get_kml_bounds(kml_url) or known_bounds.get(grid) or next(
            (b for b in map(get_kml_bounds, sibling_kmls(others, g)) if b), None)
        if bounds:
            known_bounds[grid] = bounds
            georef, method = bounds_to_georef(bounds, img.size), "kml"
    if georef is None:
        fit = footprint_fit(img, g.geometry["coordinates"][0], SATELLITES[satellite]["no_data_max"])
        if not fit or fit[1] > 15:  # corners disagree by >15 px: don't trust it
            return None, "could not place this preview on the map", None
        georef, method = fit[0], f"footprint fit, +/-{fit[1]:.0f}px"
    crop, crop_bounds = crop_around(img, georef, lat, lon, radius_km)
    if crop is None:
        return None, "point is outside this preview", None
    return crop, crop_bounds, method


def fetch_previews(chosen, args, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = []
    # Some older KMLs are not public. Passes on the same track + frame share one fixed
    # map grid (identical PNG size), so a sibling's bounds are a safe stand-in.
    known_bounds = {}
    for g in chosen:
        p = g.properties
        day = p["startTime"][:10]
        crop, crop_bounds, method = crop_preview(
            g, args.satellite, args.lat, args.lon, args.radius_km, chosen, known_bounds)
        if crop is None:
            print(f"  {day}: {crop_bounds}, skipped")  # crop_bounds holds the reason here
            continue
        file = out_dir / f"{day}_{p.get('flightDirection', '')[:1]}{p.get('pathNumber')}.png"
        crop.save(file, optimize=True)
        print(f"  {day}: {show(file)}  ({crop.width}x{crop.height}px, placed by {method})")
        try:  # path the web app uses, if the output is inside public/
            web_path = "/" + file.relative_to(PUBLIC_DIR).as_posix()
        except ValueError:
            web_path = str(file)
        manifest.append({
            "date": day,
            "image": web_path,
            "bounds": dict(zip(("west", "south", "east", "north"), crop_bounds)),
            "scene": p["sceneName"],
            "track": p.get("pathNumber"),
            "frame": p.get("frameNumber"),
            "direction": p.get("flightDirection"),
            "h5Url": p.get("url"),
        })
    (out_dir / "manifest.json").write_text(json.dumps({
        "name": args.name, "satellite": args.satellite, "lat": args.lat, "lon": args.lon,
        "radiusKm": args.radius_km, "product": args.product or SATELLITES[args.satellite]["product"], "observations": manifest,
    }, indent=2))
    print(f"\nWrote {len(manifest)} images + {show(out_dir / 'manifest.json')}")


# ---------- one image for any point ----------

def get_image(lat, lon, date=None, radius_km=25, satellite="nisar", window_days=45):
    """Radar image around any point on Earth, or None if the satellite has none there.

    lat:  -90..90, lon: -180..180 (raises ValueError outside that).
    date: "YYYY-MM-DD" to get the pass closest to that day (searching window_days
          either side); leave out for the newest pass.
    Returns a dict, e.g.
        {"image": <PIL image>, "date": "2026-01-17", "bounds": {...lat/lon box...},
         "satellite": "nisar", "scene": "...", "placed_by": "kml"}

    Example (from Python, in the pipeline folder):
        from fetch_asf import get_image
        result = get_image(-24.533, 32.983, date="2026-01-17")
        if result:
            result["image"].save("chokwe.png")
    """
    if not -90 <= lat <= 90:
        raise ValueError(f"latitude must be between -90 and 90, got {lat}")
    if not -180 <= lon <= 180:
        raise ValueError(f"longitude must be between -180 and 180, got {lon}")
    if satellite not in SATELLITES:
        raise ValueError(f"satellite must be one of {list(SATELLITES)}, got {satellite!r}")

    start = end = None
    if date:
        day = datetime.date.fromisoformat(date)  # also checks the format
        start = (day - datetime.timedelta(days=window_days)).isoformat()
        end = (day + datetime.timedelta(days=window_days)).isoformat()
    passes = list(search_point(lat, lon, satellite, start, end))
    if not passes:
        return None

    # Best first: closest to the requested date, or simply newest.
    def when(g):
        return datetime.datetime.fromisoformat(g.properties["startTime"].replace("Z", "+00:00"))
    if date:
        target = datetime.datetime.fromisoformat(date + "T12:00:00+00:00")
        passes.sort(key=lambda g: abs(when(g) - target))
    else:
        passes.sort(key=when, reverse=True)

    # A preview can be missing or unplaceable, so try the next-best few.
    known_bounds = {}
    for g in passes[:5]:
        crop, bounds, method = crop_preview(g, satellite, lat, lon, radius_km, passes, known_bounds)
        if crop is not None:
            p = g.properties
            return {
                "image": crop,
                "date": p["startTime"][:10],
                "bounds": dict(zip(("west", "south", "east", "north"), bounds)),
                "satellite": satellite,
                "scene": p["sceneName"],
                "placed_by": method,
            }
    return None


# ---------- full .h5 ----------

def load_dotenv():
    """Tiny .env reader so we don't need another dependency."""
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\""))


def earthdata_session():
    load_dotenv()
    session = asf.ASFSession()
    token = os.environ.get("EARTHDATA_TOKEN")
    user, pw = os.environ.get("EARTHDATA_USERNAME"), os.environ.get("EARTHDATA_PASSWORD")
    try:
        if token:
            return session.auth_with_token(token)
        if user and pw:
            return session.auth_with_creds(user, pw)
    except asf.ASFAuthenticationError as e:
        sys.exit(f"Earthdata login failed: {e}")
    if (Path.home() / ".netrc").exists():
        return session  # requests picks up ~/.netrc automatically
    sys.exit("Full .h5 downloads need an Earthdata login. Set EARTHDATA_TOKEN or "
             "EARTHDATA_USERNAME/EARTHDATA_PASSWORD in .env (see top of this file).")


def fetch_h5(chosen, n):
    newest = chosen[-n:]
    total = sum(h5_bytes(g) for g in newest) / 1e9
    print(f"\nDownloading {len(newest)} .h5 file(s), {total:.1f} GB total, to {RAW_DIR.relative_to(ROOT)}/")
    session = earthdata_session()
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    asf.ASFSearchResults(newest).download(path=str(RAW_DIR), session=session, processes=2)


def main():
    args = parse_args()
    results = search(args)
    if not results:
        sys.exit("No NISAR granules cover that point (check lat/lon and dates).")
    chosen = pick_series(results, args.all_tracks)
    print_summary(results, chosen)
    if args.list:
        return
    out_dir = args.out or PUBLIC_DIR / args.satellite / args.name
    print(f"\nPreviews -> {show(out_dir)}")
    fetch_previews(chosen, args, out_dir)
    if args.h5:
        fetch_h5(chosen, args.h5)


if __name__ == "__main__":
    main()
