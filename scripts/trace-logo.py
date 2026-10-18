"""Trace the engagement logo (أ إ, two interlaced alefs) into clean SVG paths.

Usage (from the repo root; needs `pip install opencv-python-headless potracer`):
  python scripts/trace-logo.py src/assets/invite/logo-source.jpg public/invite-logo.svg src/lib/invite-logo.ts


  1. Upscale 6× (bicubic) and blur lightly: removes JPEG stair-steps.
  2. Threshold, then fill small enclosed holes: removes the faint grey "V"
     left inside the first stroke where two shapes overlapped in the source.
  3. potrace → Bézier curves, mapped back to the source's pixel grid.
"""
import sys

import cv2
import numpy as np
import potrace

src, out_svg, out_ts = sys.argv[1], sys.argv[2], sys.argv[3]
S = 6

img = cv2.imread(src, cv2.IMREAD_GRAYSCALE)
big = cv2.resize(img, None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC)
big = cv2.GaussianBlur(big, (0, 0), 1.6)
ink = (big < 140).astype(np.uint8)

# Fill holes (white regions fully inside ink) smaller than ~60 source px².
contours, hierarchy = cv2.findContours(ink, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
filled = 0
for i, h in enumerate(hierarchy[0]):
    if h[3] != -1 and cv2.contourArea(contours[i]) < 60 * S * S:
        cv2.drawContours(ink, contours, i, 1, -1)
        filled += 1

# Drop specks.
n, labels, stats, _ = cv2.connectedComponentsWithStats(ink, 8)
keep = np.zeros_like(ink)
for k in range(1, n):
    if stats[k, cv2.CC_STAT_AREA] > 40 * S * S:
        keep[labels == k] = 1
print("holes filled:", filled, "| components kept:", int(sum(stats[k, cv2.CC_STAT_AREA] > 40 * S * S for k in range(1, n))), file=sys.stderr)

ys, xs = np.where(keep > 0)
pad = 2 * S
x0, y0 = xs.min() - pad, ys.min() - pad
w, h = xs.max() - x0 + pad, ys.max() - y0 + pad

# For a boolean bitmap, potracer traces the False pixels: pass ink as False.
bm = potrace.Bitmap(keep == 0)
plist = bm.trace(turdsize=30, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.2)

f = lambda v: f"{v:.2f}".rstrip("0").rstrip(".")
pt = lambda p: f"{f((p.x - x0) / S)} {f((p.y - y0) / S)}"
parts = []
for curve in plist:
    d = [f"M{pt(curve.start_point)}"]
    for seg in curve.segments:
        if seg.is_corner:
            d.append(f"L{pt(seg.c)}L{pt(seg.end_point)}")
        else:
            d.append(f"C{pt(seg.c1)} {pt(seg.c2)} {pt(seg.end_point)}")
    parts.append("".join(d) + "Z")
path = "".join(parts)
vw, vh = w / S, h / S
print(f"viewBox 0 0 {f(vw)} {f(vh)} | curves {len(parts)} | path chars {len(path)}", file=sys.stderr)

with open(out_svg, "w", encoding="utf-8") as fh:
    fh.write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(vw)} {f(vh)}">'
        f'<title>أ إ — Ahmed and his bride</title>'
        f'<path fill="#1a1a1a" fill-rule="evenodd" d="{path}"/></svg>\n'
    )
with open(out_ts, "w", encoding="utf-8") as fh:
    fh.write(
        "/*\n"
        " * The couple's logo — أ and إ as two interlaced alefs, the hamza above the\n"
        " * first and below the second — from the engagement. Traced from the original\n"
        " * artwork (src/assets/invite/logo-source.jpg) by scripts/trace-logo.py:\n"
        " * JPEG edges smoothed, a stray overlap line inside the first stroke removed.\n"
        " */\n\n"
        f"export const LOGO_VIEWBOX = {{ width: {f(vw)}, height: {f(vh)} }};\n\n"
        f'export const LOGO_PATH = "{path}";\n'
    )
