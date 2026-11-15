"""
event_images.py - make before/after images for every event pin in src/data/events.js.

For each event it searches NASA's catalogue (CMR), downloads the public preview images
(no login needed), places them on the map with georef.py, crops them to a box around the
event and saves small WebP files:

  data/radar/events/<event-id>/<file>.webp     (uploaded to R2 by upload_r2.sh)
  src/data/eventImages.json                    (which images each event has)

Sources by category (see CATEGORY_PLAN):
  - Sentinel-1 radar previews: before / after / later (every category)
  - Floods, crops & wetlands, coastal: OPERA DSWx water maps when available
  - Wildfires, deforestation: OPERA DIST vegetation-loss map (flashlight image)
  - Earthquakes, volcanoes, landslides: ARIA interferogram spanning the event (flashlight)
  - Ongoing changes: newest NISAR image (flashlight) when available

Usage (from the project folder):
  pipeline/.venv/bin/python pipeline/event_images.py            # all events
  pipeline/.venv/bin/python pipeline/event_images.py mexico-city # one event
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta
from pathlib import Path

import numpy as np
from PIL import Image

import georef

RAW = Path("data/raw/events")
OUT = Path("data/radar/events")
MANIFEST = Path("src/data/eventImages.json")
URL_PREFIX = "/radar/events"  # the Worker serves /radar/* from the R2 bucket

S1 = [f"SENTINEL-1{s}_{p}_GRD_{r}" for s in "ABC" for p in ("DP", "SP") for r in ("HIGH", "MEDIUM")]
DSWX, DIST = "OPERA_L3_DSWX-S1_V1", "OPERA_L3_DIST-ALERT-HLS_V1"
ARIA = "SENTINEL-1_INTERFEROGRAMS"
NISAR_GCOV = ["NISAR_L2_GCOV_PROVISIONAL_V1", "NISAR_L2_GCOV_V1"]
NISAR_GUNW = ["NISAR_L2_GUNW_PROVISIONAL_V1", "NISAR_L2_GUNW_V1"]

# Half-height of the image box (degrees of latitude) and the "flashlight" source per category.
CATEGORY_PLAN = {
    "Floods": (0.35, "dswx_change"),
    "Earthquakes": (0.6, "aria"),
    "Volcanoes": (0.3, "aria"),
    "Subsidence": (0.3, "nisar_gunw"),
    "Landslides": (0.15, "aria"),
    "Wildfires": (0.3, "dist"),
    "Deforestation": (0.4, "dist"),
    "Crops & wetlands": (0.35, "nisar_gcov"),
    "Glaciers": (0.5, "nisar_gcov"),
    "Sea ice": (1.5, None),
    "Oil slicks": (0.4, None),
    "Coastal": (0.2, "nisar_gcov"),
    "Soil moisture": (1.0, None),
}
WATER_MAPS = {"Floods", "Crops & wetlands", "Coastal"}  # use DSWx as the before/after images if possible
MAX_WIDTH = 720  # output pixels
MIN_COVER = 0.1  # skip a radar image that covers less than 10% of the box
MIN_FEATURES = 0.002  # skip a water / vegetation-loss map with almost nothing on it (<0.2% of the box)


# ---------------- NASA catalogue (CMR) ----------------

def cmr(short_names, lat, lon, start, end, page_size=200):
    """Granules covering a point in a time window, as simple dicts, oldest first."""
    q = [("point", f"{lon},{lat}"), ("temporal", f"{start}T00:00:00Z,{end}T23:59:59Z"),
         ("page_size", str(page_size)), ("sort_key", "start_date")]
    q += [("short_name[]", n) for n in ([short_names] if isinstance(short_names, str) else short_names)]
    url = "https://cmr.earthdata.nasa.gov/search/granules.umm_json?" + urllib.parse.urlencode(q)
    for attempt in range(4):
        try:
            items = json.load(urllib.request.urlopen(url, timeout=90))["items"]
            break
        except Exception:
            time.sleep(2 + 3 * attempt)
    else:
        return []
    out = []
    for it in items:
        u = it["umm"]
        geo = u.get("SpatialExtent", {}).get("HorizontalSpatialDomain", {}).get("Geometry", {})
        if geo.get("GPolygons"):
            pts = geo["GPolygons"][0]["Boundary"]["Points"]
            poly = " ".join(f"{p['Latitude']} {p['Longitude']}" for p in pts)
            entry = {"polygons": [[poly]]}
        elif geo.get("BoundingRectangles"):
            r = geo["BoundingRectangles"][0]
            entry = {"boxes": [f"{r['SouthBoundingCoordinate']} {r['WestBoundingCoordinate']} {r['NorthBoundingCoordinate']} {r['EastBoundingCoordinate']}"]}
        else:
            continue
        attrs = {a["Name"]: (a.get("Values") or [None])[0] for a in u.get("AdditionalAttributes", [])}
        begin = u.get("TemporalExtent", {}).get("RangeDateTime", {}).get("BeginningDateTime")
        if not begin:
            continue
        entry.update({
            "title": u["GranuleUR"],
            "time": datetime.fromisoformat(begin.replace("Z", "+00:00")),
            "urls": [r["URL"] for r in u.get("RelatedUrls", []) if r.get("URL", "").startswith("https")],
            "ascending": attrs.get("ASCENDING_DESCENDING", "").upper().startswith("ASC"),
        })
        out.append(entry)
    return sorted(out, key=lambda e: e["time"])


def browse_url(entry, kind):
    want = {
        "s1": lambda u: u.lower().endswith(".jpg"),
        "dswx": lambda u: u.endswith("_BROWSE.png"),
        "dist": lambda u: u.endswith("VEG-DIST-STATUS.png"),
        "aria": lambda u: u.endswith(".png"),
        "nisar": lambda u: u.endswith("_LATLON.png"),
    }[kind]
    return next((u for u in entry["urls"] if want(u)), None)


def download(url, path):
    if path.exists() and path.stat().st_size > 0:
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "nasa-space-apps-globe/1.0"})
            with urllib.request.urlopen(req, timeout=180) as r:
                path.write_bytes(r.read())
            return path
        except Exception:
            time.sleep(2 + 3 * attempt)
    raise RuntimeError(f"download failed: {url}")


# ---------------- picking images ----------------

def track_key(e):
    """Same satellite track = same pass direction and (almost) the same time of day."""
    minutes = e["time"].hour * 60 + e["time"].minute
    return (e["ascending"], round(minutes / 8))


def tile_key(e):
    m = re.search(r"_(T\d{2}[A-Z]{3})_", e["title"])
    return (m.group(1) if m else "", round((e["time"].hour * 60 + e["time"].minute) / 8))


def pick_three(entries, event_day, key):
    """Before / after / later images from the same track (or tile). For ongoing changes
    (event_day=None): start, middle and end of the window."""
    groups = {}
    for e in entries:
        groups.setdefault(key(e), []).append(e)
    best = None
    for g in groups.values():
        if event_day is None:
            if len(g) >= 2:
                pick = [g[0], g[len(g) // 2], g[-1]] if len(g) >= 3 else [g[0], g[-1]]
                score = (len(g), 0)
            else:
                continue
        else:
            before = [e for e in g if e["time"].date() < event_day]
            after = [e for e in g if e["time"].date() >= event_day]
            if not before or not after:
                continue
            pick = [before[-1], after[0]] + ([after[1]] if len(after) > 1 else [])
            score = (len(pick), -(after[0]["time"].date() - before[-1]["time"].date()).days)
        if best is None or score > best[0]:
            best = (score, pick)
    return best[1] if best else []


# ---------------- images ----------------

def load_rgba(path, black_is_empty=False):
    im = Image.open(path)
    if im.mode == "P" or "transparency" in im.info:
        im = im.convert("RGBA")
    rgba = np.array(im.convert("RGBA"))
    if black_is_empty:
        rgba[..., 3] = np.where(rgba[..., :3].max(-1) > 3, rgba[..., 3], 0)
    return rgba


def place(kind, entry, path, bounds, size):
    """Warp one preview onto the lat/lon box. Returns RGBA or None if it barely covers it."""
    if kind == "s1":
        rgba = load_rgba(path, black_is_empty=True)
        out = georef.warp(rgba, georef.LATLON, bounds, size, gcps=georef.sentinel1_gcps(entry, rgba, entry["ascending"]))
    elif kind in ("dswx", "dist"):
        raw = np.array(Image.open(path))
        rgba = recolour_dswx(raw) if kind == "dswx" else load_rgba(path)
        if kind == "dist":  # dark grey = no disturbance -> transparent
            rgba[..., 3] = np.where(rgba[..., :3].max(-1) > 40, rgba[..., 3], 0)
        crs, tr = georef.utm_tile_transform(entry["title"], entry, rgba.shape[1])
        out = georef.warp(rgba, crs, bounds, size, src_transform=tr)
    elif kind == "aria":
        rgba = load_rgba(path)
        crs, tr = georef.latlon_box_transform(entry, rgba.shape[1], rgba.shape[0])
        out = georef.warp(rgba, crs, bounds, size, src_transform=tr)
    elif kind == "nisar":
        rgba = load_rgba(path)
        out = georef.warp(rgba, georef.LATLON, bounds, size, gcps=georef.quad_gcps(entry, rgba[..., 3]))
    else:
        raise ValueError(kind)
    # Only count clearly visible pixels. Water and vegetation-loss maps are mostly
    # transparent on purpose, so they just need *something* on them.
    cover = (out[..., 3] >= 50).mean()
    return out if cover >= (MIN_FEATURES if kind in ("dswx", "dist") else MIN_COVER) else None


def recolour_dswx(classes):
    if classes.ndim == 3:  # paletted PNG opened as RGB(A): fall back to colour matching
        rgb = classes[..., :3].astype(int)
        cls = np.full(rgb.shape[:2], 255, np.uint8)
        cls[(rgb == (255, 255, 255)).all(-1)] = 0
        cls[(rgb == (0, 0, 255)).all(-1)] = 1
        cls[(rgb == (0, 255, 0)).all(-1)] = 3
        classes = cls
    rgba = np.zeros(classes.shape + (4,), np.uint8)
    rgba[classes == 1] = (40, 120, 255, 220)  # open water
    rgba[classes == 3] = (0, 229, 255, 200)  # inundated vegetation
    rgba[..., 3] = np.where(classes == 255, 0, rgba[..., 3])
    return rgba


def water_change(before_png, after_png, entry_b, entry_a, bounds, size):
    """Red = water in the after image that wasn't there before (both DSWx).
    Class numbers: 0 dry, 1 open water, 3 water under vegetation, 255 no data."""
    def classes(path, entry):
        cls = np.array(Image.open(path))
        crs, tr = georef.utm_tile_transform(entry["title"], entry, cls.shape[1])
        return georef.warp_classes(cls, crs, bounds, size, tr)
    b, a = classes(before_png, entry_b), classes(after_png, entry_a)
    wet = lambda c: (c == 1) | (c == 3)
    seen = (b != 255) & (a != 255)  # both images have data here
    out = np.zeros(b.shape + (4,), np.uint8)
    out[seen & wet(b) & wet(a)] = (40, 120, 255, 90)  # water both times: faint blue
    out[seen & ~wet(b) & wet(a)] = (255, 59, 48, 235)  # new water: red
    return out if (seen & ~wet(b) & wet(a)).any() else None


def save(rgba, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    rgba = rgba.copy()
    rgba[rgba[..., 3] < 8] = 0  # fully clear the nearly-clear pixels (keeps files small, edges clean)
    Image.fromarray(rgba, "RGBA").save(path, "WEBP", quality=80, alpha_quality=100, method=6)


# ---------------- one event ----------------

def box_for(ev):
    half, _ = CATEGORY_PLAN[ev["category"]]
    lat, lon = ev["center"]["lat"], ev["center"]["lon"]
    half_lon = min(half / max(np.cos(np.radians(lat)), 0.05), half * 5)
    b = {"west": lon - half_lon, "east": lon + half_lon, "south": max(lat - half, -89.9), "north": min(lat + half, 89.9)}
    width = MAX_WIDTH
    height = int(round(width * (b["north"] - b["south"]) / ((b["east"] - b["west"]) * np.cos(np.radians(lat)))))
    return {k: round(v, 5) for k, v in b.items()}, (width, max(height, 50))


def window(ev):
    if ev["date"] == "ongoing":
        return None, ("2024-01-01", "2024-12-31")
    d = date.fromisoformat(ev["date"])
    return d, ((d - timedelta(days=24)).isoformat(), (d + timedelta(days=30)).isoformat())


def label(entry, sensor, event_day):
    d = entry["time"].date()
    when = "" if event_day is None else (" (before)" if d < event_day else " (after)")
    return f"{d.isoformat()}{when} · {sensor}"


def process(ev):
    eid, cat = ev["id"], ev["category"]
    lat, lon = ev["center"]["lat"], ev["center"]["lon"]
    bounds, size = box_for(ev)
    event_day, (start, end) = window(ev)
    raw, out = RAW / eid, OUT / eid
    result = {"bounds": bounds, "observations": [], "flashlightImage": None, "flashlightLabel": None}
    log = []

    def emit(rgba, name, text):
        if rgba is None:
            return None
        save(rgba, out / f"{name}.webp")
        return f"{URL_PREFIX}/{eid}/{name}.webp"

    # 1. Before / after images: always the raw Sentinel-1 radar preview.
    s1 = [e for e in cmr(S1, lat, lon, start, end) if browse_url(e, "s1")]
    picks = pick_three(s1, event_day, track_key)
    if not picks and event_day is None:  # nothing usable in 2024: try 2025 too
        s1 = [e for e in cmr(S1, lat, lon, "2024-01-01", "2025-12-31") if browse_url(e, "s1")]
        picks = pick_three(s1, None, track_key)
    for e in picks:
        p = download(browse_url(e, "s1"), raw / f"s1_{e['time']:%Y%m%dT%H%M}.jpg")
        try:
            url = emit(place("s1", e, p, bounds, size), f"{e['time']:%Y-%m-%d}-s1", "")
        except Exception as ex:  # bad footprint etc.
            log.append(f"s1 {e['title'][:30]}: {ex}")
            url = None
        if url:
            result["observations"].append({"date": label(e, "Sentinel-1 radar", event_day), "image": url})

    # 1b. Water categories: NASA's OPERA water maps for the same period, kept separately
    #     (not in the timeline): they're the blue water layer for the "normal view".
    used_dswx = []
    if cat in WATER_MAPS:
        dswx = [e for e in cmr(DSWX, lat, lon, start, end) if browse_url(e, "dswx")]
        for e in pick_three(dswx, event_day, tile_key):
            p = download(browse_url(e, "dswx"), raw / f"dswx_{e['time']:%Y%m%dT%H%M}.png")
            url = emit(place("dswx", e, p, bounds, size), f"{e['time']:%Y-%m-%d}-water", "")
            if url:
                result.setdefault("water", []).append({"date": e["time"].date().isoformat(), "image": url})
                used_dswx.append((e, p))

    # 2. Flashlight image.
    _, special = CATEGORY_PLAN[cat]
    try:
        if special == "dswx_change" and len(used_dswx) >= 2:
            (eb, pb), (ea, pa) = used_dswx[0], used_dswx[1]
            url = emit(water_change(pb, pa, eb, ea, bounds, size), "change", "")
            if url:
                result["flashlightImage"], result["flashlightLabel"] = url, "New water after the event (red)"
        elif special == "dist":
            a = event_day.isoformat() if event_day else start
            b = (event_day + timedelta(days=30)).isoformat() if event_day else end
            dist = [e for e in cmr(DIST, lat, lon, a, b) if browse_url(e, "dist")]
            for e in reversed(dist):  # newest first
                p = download(browse_url(e, "dist"), raw / f"dist_{e['time']:%Y%m%dT%H%M}_{e['title'][-30:-20]}.png")
                url = emit(place("dist", e, p, bounds, size), "vegetation-loss", "")
                if url:
                    result["flashlightImage"] = url
                    result["flashlightLabel"] = f"Vegetation loss up to {e['time']:%Y-%m-%d} (OPERA DIST)"
                    break
        elif special == "aria" and event_day:
            ifgs = [e for e in cmr(ARIA, lat, lon, (event_day - timedelta(days=40)).isoformat(),
                                   (event_day + timedelta(days=40)).isoformat()) if browse_url(e, "aria")]
            spanning = []
            for e in ifgs:
                m = re.search(r"-(\d{8})_(\d{8})-", e["title"])
                if m:
                    d1, d2 = sorted(datetime.strptime(x, "%Y%m%d").date() for x in m.groups())
                    if d1 < event_day <= d2:
                        spanning.append(((d2 - d1).days, e, d1, d2))
            for _, e, d1, d2 in sorted(spanning, key=lambda t: t[0]):
                p = download(browse_url(e, "aria"), raw / f"aria_{e['title'][:60]}.png")
                url = emit(place("aria", e, p, bounds, size), "interferogram", "")
                if url:
                    result["flashlightImage"] = url
                    result["flashlightLabel"] = f"Ground movement {d1} → {d2} (InSAR, ARIA)"
                    break
        if result["flashlightImage"] is None and special in ("nisar_gcov", "nisar_gunw", "aria", "dist") and event_day is None:
            names = NISAR_GUNW if special == "nisar_gunw" else NISAR_GCOV
            nis = [e for e in cmr(names, lat, lon, "2025-10-01", "2026-12-31") if browse_url(e, "nisar")]
            for e in reversed(nis[-6:]):  # newest few
                p = download(browse_url(e, "nisar"), raw / f"nisar_{e['time']:%Y%m%dT%H%M%S}.png")
                try:
                    url = emit(place("nisar", e, p, bounds, size), "nisar", "")
                except Exception as ex:  # odd footprint shape: try the next image
                    log.append(f"nisar: {str(ex)[:40]}")
                    continue
                if url:
                    result["flashlightImage"] = url
                    kind = "interferogram" if special == "nisar_gunw" else "radar image"
                    result["flashlightLabel"] = f"NISAR {kind}, {e['time']:%Y-%m-%d}"
                    break
    except Exception as ex:
        log.append(f"flashlight: {ex}")

    n = len(result["observations"]) + (1 if result["flashlightImage"] else 0)
    print(f"{eid:34} {len(result['observations'])} obs + {'flash' if result['flashlightImage'] else '-    '}  {'; '.join(log)[:80]}", flush=True)
    return eid, (result if n else None)


# The hand-made flood study areas (src/data/studyAreas.js) that use Sentinel-1 data
# get their timeline images here too, the same way as the events.
STUDY_AREAS = [
    {"id": "valencia-2024", "category": "Floods", "date": "2024-10-29", "center": {"lat": 39.37, "lon": -0.4}},
    {"id": "storm-boris-2024", "category": "Floods", "date": "2024-09-15", "center": {"lat": 50.47, "lon": 17.28}},
]


def load_events():
    text = Path("src/data/events.js").read_text()
    return json.loads(text[text.index("["): text.rindex("]") + 1]) + STUDY_AREAS


def main(only=None):
    events = [e for e in load_events() if not only or e["id"] in only]
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    with ThreadPoolExecutor(6) as pool:
        for eid, res in pool.map(process, events):
            if res:
                manifest[eid] = res
            else:
                manifest.pop(eid, None)
    MANIFEST.write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n")
    files = list(OUT.rglob("*.webp"))
    print(f"\n{len(manifest)} events with images, {len(files)} files, {sum(f.stat().st_size for f in files) / 1e6:.1f} MB")


if __name__ == "__main__":
    main(set(sys.argv[1:]) or None)
