# Hand Me The Earth: NASA NISAR Explorer

An interactive 3D globe for exploring how Earth's surface changes, seen by radar
satellites. Spin the globe with your mouse or **your hand** (webcam gestures), click a
place, and step through radar images from before, during and after the event.

Radar sees through clouds and works at night, so it can map a flood while it's
happening, when ordinary satellite photos only see clouds. The focus is **NISAR**, the
NASA-ISRO radar satellite launched in 2025, with **Sentinel-1** (ESA) for events
from before NISAR's data began.

## What's on the globe

- **Study sites:** hand-checked places with a full image timeline and explanation:
  - **Limpopo River flood, Mozambique** (Jan 2026, NISAR)
  - **Sylhet monsoon floods, Bangladesh** (2026, NISAR)
  - **Valencia floods, Spain** (Oct 2024, Sentinel-1 / NASA OPERA)
  - **Storm Boris floods, Poland** (Sep 2024, Sentinel-1 / NASA OPERA)
- **128 surface-change events** in 13 categories (floods, earthquakes, volcanoes,
  subsidence, landslides, wildfires, deforestation, crops & wetlands, glaciers, sea ice,
  oil slicks, coastal, soil moisture). 117 of them have radar images, with a written
  explanation and cited sources.
- **Notable floods** with a name, date and short note.

Dots **cluster** when zoomed out (a numbered bubble) and split apart as you zoom in.
Click a bubble to fly closer. The legend under "Map layers" shows or hides each category.

## Features

| | |
|---|---|
| **Globe** | Spin and zoom the Earth, open any dot. Country borders, city labels and coordinates appear as you zoom in; "Bright" / "Realistic" lighting. |
| **Info view** | Opens when you click a site: what happened, "What Changed?", why it matters, and a **Sources** list with links (NASA, UN, agencies, journals). |
| **Timeline** | Step through a site's images by date. **Radar view** shows the radar picture; **Normal view** shows a cloud-free photo with the water the radar found painted blue. |
| **Hand gestures** | Webcam hand tracking (MediaPipe). On the globe: open palm to rotate, point and move left/right to zoom, fist to pause, two fingers swiped up to open the dot in the middle. In the info view: palm up/down to scroll, point left/right to change picture, two fingers up to go back. |

## Run it locally

Needs [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev        # then open http://localhost:5173
```

Other commands:

```bash
npm run build      # production build into dist/
npm run lint       # code style checks
npm run check      # quick self-tests (gestures, geography, markers, clustering, ...)
```

> **Event images locally:** the 128 events' images are stored in Cloudflare R2, not in
> git. When running locally they're read from `data/radar/events/`; if that folder is
> missing, those events open without images. Make it with `pipeline/event_images.py`
> (below) or copy it from a teammate. The study sites' images are in `public/` and
> always work.

## How the images are made (`pipeline/`)

Python scripts download NASA's free **preview images** (no login needed), place them on
the map, and crop them around each site. They run on your computer, not in the website.

```bash
python3 -m venv pipeline/.venv
pipeline/.venv/bin/pip install -r pipeline/requirements.txt
```

On macOS, `rasterio` needs GDAL first: `brew install gdal`.

| Script | What it does |
|---|---|
| `fetch_asf.py` | Finds every NISAR (or Sentinel-1) pass over a lat/lon and saves cropped images + a `manifest.json` to `public/<satellite>/<name>/`. Asks for the location if you don't give one. Also has `get_image(lat, lon, date=...)` to fetch a single image from Python. |
| `make_normal_view.py` | Makes the "Normal view" images: a cloud-free photo (NASA GIBS / HLS) with the radar's water painted blue. |
| `event_images.py` | Before/after images for every event in `src/data/events.js` (Sentinel-1, OPERA, ARIA, NISAR), saved to `data/radar/events/`. |
| `event_normal_views.py` | Normal views for the event images. |
| `georef.py` | Shared code that places each kind of preview image on a lat/lon grid. |
| `dswx_flood.py` | Water maps from NASA OPERA DSWx (used for Valencia and Storm Boris). |
| `inspect_h5.py` | Prints what's inside a full NISAR `.h5` data file. |
| `upload_r2.sh` | Uploads `data/radar/events/` to the Cloudflare R2 bucket. |

Example, adding a new NISAR site:

```bash
pipeline/.venv/bin/python pipeline/fetch_asf.py --lat -24.533 --lon 32.983 --name chokwe-flood
pipeline/.venv/bin/python pipeline/make_normal_view.py chokwe-flood
```

Then add an entry to `src/data/studyAreas.js` pointing at the new images.

For floods before NISAR (2014 onward), add `--satellite sentinel1 --start YYYY-MM-DD --end YYYY-MM-DD`.

## Project layout

```
src/
  App.jsx               the globe scene and panels
  components/           globe, markers (FloodMarkers = clustered dots), timeline, info view,
                        map overlay, camera flights
  hands/                webcam hand tracking and gestures
  data/                 studyAreas.js, events.js, floodEvents.js, sites.js (merges them),
                        categories.js, eventFindings.js ("What Changed?"), eventSources.js (citations)
  clusters.js           merges nearby dots on screen
  tuning.js             adjustable numbers for hand gestures and the camera
public/                 study site images (nisar/, radar/), Earth texture
pipeline/               Python scripts that make the images
worker/, wrangler.jsonc Cloudflare hosting
```

## Deployment

The site is hosted on **Cloudflare Workers**. Pushes to `main` build and deploy
automatically (Workers Builds). The Worker (`worker/index.js`) serves the built site
and the event images from the R2 bucket `catgpt-radar`. Manual deploy:

```bash
npm run build
npx wrangler deploy
```

## Notes and limits

- **Water detection is automatic.** "Normal view" water outlines come from how dark (or
  blue) the radar image is. They're a picture of the flood, not a scientific flood map.
- **Previews, not full data.** The images are NASA's quick-look previews (roughly
  170–290 m per pixel), not the full-resolution science files.
- **NISAR's data starts in late 2025.** Older events use Sentinel-1.
- **Event text** in `events.js` and `eventFindings.js` is summarised from public reports;
  each place lists its sources in the info view. Check numbers before presenting.

## Data and credits

- **Radar:** NASA-ISRO NISAR, Copernicus Sentinel-1 (ESA), via NASA's Alaska Satellite
  Facility ([ASF](https://search.asf.alaska.edu)); NASA JPL OPERA (DSWx, DIST) and ARIA
  products via [NASA Earthdata](https://www.earthdata.nasa.gov)
- **Photos for Normal view:** NASA HLS (Landsat / Sentinel-2) and MODIS via
  [NASA GIBS](https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api)
- **Earth texture:** NASA Blue Marble (shaded relief + bathymetry) from NASA GIBS: an 8192 x 4096 base map (`pipeline/make_earth_texture.py`) plus sharper tiles loaded as you zoom in (`src/components/EarthTiles.jsx`, down to ~500 m per pixel)
- **Borders:** [Natural Earth](https://www.naturalearthdata.com) (public domain)
- **Cities:** [SimpleMaps](https://simplemaps.com/data/world-cities) (CC BY 4.0)
- Search library: [asf_search](https://github.com/asfadmin/Discovery-asf_search)

Built for the NASA hackathon by team CatGPT.
