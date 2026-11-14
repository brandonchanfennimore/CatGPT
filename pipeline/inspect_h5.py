"""
inspect_h5.py - print everything inside one NISAR .h5 file.

Why: an HDF5 file is like a folder tree packed into one file.
"Groups" are folders, "datasets" are the arrays (images, coordinates,
metadata). Before processing, we need the exact paths of the layers,
for example /science/LSAR/GCOV/grids/frequencyA/HHHH.

Usage:
    python pipeline/inspect_h5.py                     # first .h5 in data/raw/
    python pipeline/inspect_h5.py data/raw/file.h5    # a specific file
"""

import sys
from pathlib import Path

import h5py
import numpy as np

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"


def pick_file():
    """Use the path given on the command line, or the first .h5 in data/raw/."""
    if len(sys.argv) > 1:
        return Path(sys.argv[1])
    files = sorted(RAW_DIR.glob("*.h5"))
    if not files:
        sys.exit(f"No .h5 files found in {RAW_DIR}. Download one from ASF Vertex first.")
    return files[0]


def short_value(dset):
    """Read small datasets (metadata) so we can see their value.
    Big ones (images) are only described by shape, because reading them is slow."""
    if dset.size > 10:
        return ""
    value = dset[()]
    if isinstance(value, bytes):  # HDF5 often stores text as raw bytes
        value = value.decode(errors="replace")
    elif isinstance(value, np.ndarray) and value.dtype.kind == "S":
        value = [v.decode(errors="replace") for v in value.ravel()]
    return f" = {value}"


def print_item(name, obj):
    """Called once for every group/dataset in the file (by visititems below)."""
    depth = name.count("/")
    indent = "  " * depth
    leaf = name.split("/")[-1]
    if isinstance(obj, h5py.Group):
        print(f"{indent}{leaf}/")
        return
    # A dataset: show shape (rows, cols), data type, and units if present.
    units = obj.attrs.get("units", b"")
    if isinstance(units, bytes):
        units = units.decode(errors="replace")
    units = f" [{units}]" if units else ""
    print(f"{indent}{leaf}  shape={obj.shape} dtype={obj.dtype}{units}{short_value(obj)}")


def summarize_grids(f):
    """Short GCOV summary: image layers, map projection, and coverage.
    GCOV images live in grids/frequencyA (main L-band) and maybe frequencyB."""
    print("\n=== GCOV summary ===")
    found = False

    def visit(name, obj):
        nonlocal found
        if not (isinstance(obj, h5py.Group) and name.endswith(("frequencyA", "frequencyB"))):
            return
        if "xCoordinates" not in obj:  # not an image grid group
            return
        found = True
        x, y = obj["xCoordinates"][()], obj["yCoordinates"][()]
        print(f"\n{name}")
        # Polarization layers are 2D images with 4-letter names like HHHH, HVHV.
        layers = [k for k in obj if isinstance(obj[k], h5py.Dataset) and obj[k].ndim == 2]
        print(f"  2D image layers: {layers}")
        print(f"  image size: {len(y)} rows x {len(x)} cols")
        print(f"  x range: {x.min():.1f} .. {x.max():.1f}")
        print(f"  y range: {y.min():.1f} .. {y.max():.1f}")
        if "projection" in obj:
            # The EPSG code names the map projection (e.g. 326xx = UTM zone xx North).
            print(f"  EPSG code: {obj['projection'].attrs.get('epsg_code', '?')}")

    f.visititems(visit)
    if not found:
        print("No grid groups with xCoordinates found. Is this a GCOV file?")


def main():
    path = pick_file()
    size_gb = path.stat().st_size / 1e9
    print(f"File: {path.name}  ({size_gb:.2f} GB)\n")
    with h5py.File(path, "r") as f:
        f.visititems(print_item)
        summarize_grids(f)


if __name__ == "__main__":
    main()
