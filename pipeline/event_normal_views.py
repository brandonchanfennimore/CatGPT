"""
event_normal_views.py - give every event radar image a "normal view", using the same
method as make_normal_view.py (which made the Limpopo and Sylhet normal views):

  1. find one cloud-free true-colour photo of the event's box (NASA GIBS), before the
     first radar date. Tries HLS (30 m, Landsat + Sentinel-2) first; if there's no clear
     HLS photo (older events, very cloudy places) it uses MODIS (250 m, daily since 2000);
  2. for each radar image, find the water (darkest / blue pixels) with water_mask();
  3. paint that water blue on the photo with paint_water() and save <image>-normal.webp.

It updates src/data/eventImages.json: each observation gets "normalImage", and each event
gets "normalView" (which photo was used) and "viewNotes" (the text under the image).

Usage (from the project folder):
  pipeline/.venv/bin/python pipeline/event_normal_views.py            # all events
  pipeline/.venv/bin/python pipeline/event_normal_views.py okavango   # some events
Then upload: bash pipeline/upload_r2.sh
"""
import json
import sys

import numpy as np
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
from pathlib import Path

from PIL import Image

import make_normal_view as mnv

MANIFEST = Path("src/data/eventImages.json")
IMAGES = Path("data/radar/events")  # local copy of what's in R2 (/radar/events/...)

PHOTO_LAYERS = [
    ("HLS_S30_Nadir_BRDF_Adjusted_Reflectance", "NASA HLS (Landsat/Sentinel-2)", 120),
    ("MODIS_Terra_CorrectedReflectance_TrueColor", "NASA MODIS Terra", 120),
]  # (GIBS layer, name for the credits, how many days to search each way)
PROBE_WIDTH = 200  # small preview while searching for a clear day (fast, light)
GOOD_COVER, GOOD_CLOUD = 0.98, 0.03  # a "clear" photo: almost full box, almost no cloud
OK_COVER, OK_CLOUD = 0.9, 0.06  # if nothing clear turns up, the best photo at least this good
MIN_BRIGHTNESS = 45  # darker than this on average = polar night / dusk: not a usable photo


def find_photo(bounds, first_day):
    """Search for a clear photo: back from the first radar date (like make_normal_view.py),
    then forward from it (needed where it's dark in winter). Returns (photo, day, layer name)."""
    for layer, label, max_days in PHOTO_LAYERS:
        best = None
        days = [first_day - timedelta(days=n) for n in range(1, max_days + 1)]
        days += [first_day + timedelta(days=n) for n in range(0, max_days + 1)]
        for d in days:
            if d > date.today():
                continue
            day = d.isoformat()
            probe = mnv.get_photo(bounds, day, layer=layer, width=PROBE_WIDTH)
            if probe is None:
                continue
            a = np.asarray(probe)
            lit = a[..., 3] > 0
            if not lit.any() or a[..., :3][lit].mean() < MIN_BRIGHTNESS:
                continue  # too dark (night-time / polar winter)
            cover, cloud = mnv.photo_quality(probe)
            if cover >= GOOD_COVER and cloud <= GOOD_CLOUD:
                best = (cloud, day)
                break
            if cover >= OK_COVER and cloud <= OK_CLOUD and (best is None or cloud < best[0]):
                best = (cloud, day)
        if best:
            day = best[1]
            photo = mnv.get_photo(bounds, day, layer=layer)  # full size for the chosen day
            if photo is not None:
                return photo, day, label
    return None, None, None


def first_date(event):
    return date.fromisoformat(event["observations"][0]["date"][:10])


def process(item):
    eid, ev = item
    obs = ev.get("observations") or []
    if not obs:
        return eid, None, "no radar images"
    b = ev["bounds"]
    area = (b["west"], b["south"], b["east"], b["north"])
    photo, photo_day, photo_name = find_photo(area, first_date(ev))
    if photo is None:
        return eid, None, "no clear photo found"

    updated = []
    for o in obs:
        local = IMAGES / o["image"].split("/radar/events/", 1)[1]
        # Our radar images mark "no data" with transparency, so tell water_mask() that way:
        # transparent -> black (its no-data colour); real pixels at least 16 so very calm,
        # almost-black water still counts as water instead of "no data".
        rgba = np.asarray(Image.open(local).convert("RGBA")).copy()
        has_data = rgba[..., 3] > 0
        rgb = rgba[..., :3]
        rgb[has_data] = np.maximum(rgb[has_data], mnv.NO_DATA_MAX["sentinel1"] + 1)
        rgb[~has_data] = 0
        radar = Image.fromarray(rgb, "RGB")
        mask = mnv.water_mask(radar, mnv.DARK_THRESHOLD["sentinel1"], "sentinel1")
        normal, water = mnv.paint_water(photo, mask, b, area)
        out = local.with_name(local.stem.removesuffix("-s1") + "-normal.webp")
        normal.save(out, "WEBP", quality=82, method=6)
        updated.append({**o, "normalImage": o["image"].rsplit("/", 1)[0] + "/" + out.name})
    notes = {
        "radar": "Sentinel-1 radar preview, false colour. Dark or blue = water or very smooth "
                 "ground; brighter = rough land, plants and buildings.",
        "normal": f"Blue = water found in the radar image on this date (not the real colour of "
                  f"the water). Background: cloud-free photo ({photo_name}) from {photo_day}, "
                  f"the same in every frame.",
    }
    return eid, {"observations": updated, "normalView": {"photo": photo_name, "photoDate": photo_day},
                 "viewNotes": notes}, f"{photo_name} {photo_day}"


def main(only=None):
    manifest = json.loads(MANIFEST.read_text())
    items = [(k, v) for k, v in manifest.items() if not only or k in only]
    with ThreadPoolExecutor(4) as pool:  # be gentle with NASA's map server
        for eid, update, note in pool.map(process, items):
            print(f"{eid:34} {'ok  ' if update else 'SKIP'} {note}", flush=True)
            if update:
                manifest[eid].update(update)
            else:  # no usable photo: drop any normal views from an earlier run
                ev = manifest[eid]
                for key in ("normalView", "viewNotes"):
                    ev.pop(key, None)
                for obs in ev.get("observations", []):
                    obs.pop("normalImage", None)
    MANIFEST.write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n")
    done = sum(all(o.get("normalImage") for o in v.get("observations", [])) and bool(v.get("observations")) for v in manifest.values())
    print(f"\n{done} of {len(manifest)} events have normal views")


if __name__ == "__main__":
    main(set(sys.argv[1:]) or None)
