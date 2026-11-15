"""
georef.py - place NASA preview images (PNG/JPG) on the map in plain lat/lon.

Each kind of preview is laid out differently, so each gets its own method:
  utm_tile   OPERA DSWx / DIST: one 109.8 km MGRS tile in UTM. Tile corner solved from
             NASA's catalogue box.                                   (checked vs coastline)
  latlon_box ARIA interferograms: a plain lat/lon grid over the footprint's box. (checked)
  corners    NISAR, DISP, Sentinel-1: the 4 corners NASA lists for the footprint are matched
             to 4 points in the image (the corners of the data area, or of the image), then
             the image is warped through those control points.

Everything ends up as an RGBA array on a lat/lon grid for a requested box.
"""
import re

import numpy as np
from rasterio.control import GroundControlPoint
from rasterio.crs import CRS
from rasterio.transform import Affine, from_bounds
from rasterio.warp import Resampling, reproject, transform

LATLON = CRS.from_epsg(4326)
TILE_SIZE = 109800.0


def footprint(entry):
    """[(lat, lon), ...] corners from a CMR granule (first polygon, without the closing point)."""
    if entry.get("polygons"):
        v = [float(x) for x in entry["polygons"][0][0].split()]
        pts = list(zip(v[0::2], v[1::2]))
        return pts[:-1] if pts[0] == pts[-1] else pts
    s, w, n, e = (float(x) for x in entry["boxes"][0].split())
    return [(n, w), (n, e), (s, e), (s, w)]


def bbox(entry):
    pts = footprint(entry)
    lats, lons = [p[0] for p in pts], [p[1] for p in pts]
    return min(lats), min(lons), max(lats), max(lons)  # S, W, N, E


def warp(rgba, src_crs, dst_bounds, size, src_transform=None, gcps=None):
    """Re-project an RGBA image (H, W, 4) to a lat/lon grid; outside = transparent."""
    w, s, e, n = dst_bounds["west"], dst_bounds["south"], dst_bounds["east"], dst_bounds["north"]
    W, H = size
    dst = np.zeros((4, H, W), dtype=np.uint8)
    for b in range(4):
        kw = dict(src_crs=src_crs, dst_transform=from_bounds(w, s, e, n, W, H), dst_crs=LATLON,
                  resampling=Resampling.bilinear if b < 3 else Resampling.nearest, src_nodata=None, dst_nodata=0)
        if gcps is not None:
            reproject(rgba[..., b], dst[b], gcps=gcps, **kw)
        else:
            reproject(rgba[..., b], dst[b], src_transform=src_transform, **kw)
    return np.moveaxis(dst, 0, -1)


# ---- utm_tile (DSWx, DIST) ----

def utm_tile_transform(title, entry, width):
    m = re.search(r"_T(\d{2})([C-X])[A-Z]{2}_", title)
    zone, band = int(m.group(1)), m.group(2)
    utm = CRS.from_epsg((32600 if band >= "N" else 32700) + zone)
    s, w, n, e = bbox(entry)
    target = np.array([s, w, n, e])

    def envelope(ulx, uly):
        xs = [ulx, ulx + TILE_SIZE, ulx, ulx + TILE_SIZE]
        ys = [uly, uly, uly - TILE_SIZE, uly - TILE_SIZE]
        lons, lats = transform(utm, LATLON, xs, ys)
        return np.array([min(lats), min(lons), max(lats), max(lons)])

    (cx,), (cy,) = transform(LATLON, utm, [(w + e) / 2], [(s + n) / 2])
    ulx, uly = cx - TILE_SIZE / 2, cy + TILE_SIZE / 2
    for _ in range(20):
        err = envelope(ulx, uly) - target
        jac = np.column_stack([(envelope(ulx + 10, uly) - envelope(ulx, uly)) / 10,
                               (envelope(ulx, uly + 10) - envelope(ulx, uly)) / 10])
        step = np.linalg.lstsq(jac, -err, rcond=None)[0]
        ulx, uly = ulx + step[0], uly + step[1]
    if np.abs(envelope(ulx, uly) - target).max() > 1e-3:
        raise ValueError("could not place UTM tile")
    ulx, uly = round(ulx), round(uly)
    return utm, Affine(TILE_SIZE / width, 0, ulx, 0, -TILE_SIZE / width, uly)


# ---- latlon_box (ARIA) ----

def latlon_box_transform(entry, width, height):
    s, w, n, e = bbox(entry)
    return LATLON, from_bounds(w, s, e, n, width, height)


# ---- corners (NISAR, DISP, Sentinel-1) ----

def _order_ll(pts):
    """Order (lat, lon) corners as NW, NE, SE, SW using sums/differences (robust for tilted quads)."""
    pts = np.array(pts)
    # lon, lat -> roughly equal-distance units: a degree of longitude is only
    # cos(latitude) as wide as a degree of latitude (half as wide at 60 degrees).
    x, y = pts[:, 1] * np.cos(np.radians(pts[:, 0].mean())), pts[:, 0]
    nw = pts[np.argmax(y - x)]
    ne = pts[np.argmax(y + x)]
    se = pts[np.argmax(-y + x)]
    sw = pts[np.argmax(-y - x)]
    return [tuple(p) for p in (nw, ne, se, sw)]


def data_corners(alpha):
    """Pixel (col, row) corners of the valid-data area, ordered top-left, top-right,
    bottom-right, bottom-left (same trick: extremes of x+y and x-y)."""
    rows, cols = np.nonzero(alpha > 0)
    x, y = cols.astype(float), rows.astype(float)
    tl = np.argmin(x + y); br = np.argmax(x + y)
    tr = np.argmax(x - y); bl = np.argmin(x - y)
    return [(x[i], y[i]) for i in (tl, tr, br, bl)]


def corner_gcps(pixel_corners, ll_corners):
    """Ground control points: pixel (col,row) <-> (lat,lon), both in TL/NW,TR/NE,BR/SE,BL/SW order."""
    return [GroundControlPoint(row=r, col=c, x=lon, y=lat) for (c, r), (lat, lon) in zip(pixel_corners, ll_corners)]


def quad_gcps(entry, alpha):
    """NISAR / DISP: the image is roughly north-up with the footprint visible as a tilted
    quadrilateral of data; match its 4 corners to the catalogue's 4 footprint corners."""
    return corner_gcps(data_corners(alpha), _order_ll(footprint(entry)))


def image_corner_gcps(entry, width, height, orientation):
    """Sentinel-1 previews fill the whole image in radar geometry. orientation 0-7 picks
    which footprint corner sits at the image's top-left and whether it's mirrored."""
    ll = _order_ll(footprint(entry))  # NW, NE, SE, SW (clockwise)
    k, flip = orientation % 4, orientation >= 4
    ring = ll[k:] + ll[:k]
    if flip:
        ring = [ring[0], ring[3], ring[2], ring[1]]  # counter-clockwise = mirror image
    px = [(0, 0), (width - 1, 0), (width - 1, height - 1), (0, height - 1)]
    return corner_gcps(px, ring)


def sentinel1_gcps(entry, rgba, ascending):
    """Sentinel-1 previews come in two layouts:
    - footprint drawn as a tilted shape inside a black border (already a north-up map):
      match the data area's corners to the footprint corners;
    - image filling the whole frame (radar geometry): for ascending passes the start of the
      pass (south) is at the top, near range (west) on the left -> top-left = south-west.
    (Checked against the coastline at Valencia, Florida and Mauritius.)"""
    alpha = rgba[..., 3]
    if (alpha > 0).mean() < 0.92:
        return quad_gcps(entry, alpha)
    h, w = alpha.shape
    return image_corner_gcps(entry, w, h, 7 if ascending else 5)


def warp_classes(classes, src_crs, dst_bounds, size, src_transform, nodata=255):
    """Like warp(), for a single band of class numbers: nearest-pixel (no blending of
    class values) and `nodata` outside the source image."""
    w, s, e, n = dst_bounds["west"], dst_bounds["south"], dst_bounds["east"], dst_bounds["north"]
    W, H = size
    dst = np.full((H, W), nodata, dtype=np.uint8)
    reproject(classes, dst, src_transform=src_transform, src_crs=src_crs, dst_transform=from_bounds(w, s, e, n, W, H),
              dst_crs=LATLON, resampling=Resampling.nearest, src_nodata=nodata, dst_nodata=nodata)
    return dst
