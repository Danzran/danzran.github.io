"""Turn a soft-ink illustration on white into a sakuga-style cutout: flat pastel cels, black brush lines, hatched shadows.
usage: sakuga_fig.py in.png out_prefix [variants] [max_h]"""
import sys, math, numpy as np, cv2
src, pre = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 3; MAXH = int(sys.argv[4]) if len(sys.argv) > 4 else 1200
img = cv2.imread(src); h, w = img.shape[:2]; s = min(1, MAXH / h)
img = cv2.resize(img, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA); h, w = img.shape[:2]
# alpha: flood-fill the white background from the borders
nw = (img.min(axis=2) > 232).astype(np.uint8); ff = nw.copy(); m = np.zeros((h + 2, w + 2), np.uint8)
for x, y in [(x, 0) for x in range(0, w, 20)] + [(x, h - 1) for x in range(0, w, 20)] + [(0, y) for y in range(0, h, 20)] + [(w - 1, y) for y in range(0, h, 20)]:
    if ff[y, x] == 1: cv2.floodFill(ff, m, (x, y), 2)
alpha = (ff != 2).astype(np.uint8) * 255
alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
bh = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
lines = ((bh > 38) & (gray < 150)).astype(np.uint8) * 255      # thin dark strokes only, not dark fabric
# flat cels: k-means on colours inside the figure, then lift toward pastel
inside = alpha > 0
Z = cv2.bilateralFilter(img, 9, 40, 9)[inside].astype(np.float32)
K = 7
_, lab, cen = cv2.kmeans(Z, K, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1), 3, cv2.KMEANS_PP_CENTERS)
cen_lab = cv2.cvtColor(cen.reshape(1, K, 3).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)[0]
lum = cen_lab[:, 0].copy()
cen_lab[:, 0] = 150 + cen_lab[:, 0] * .42                      # pastel lift
cen_lab[:, 1:] = (cen_lab[:, 1:] - 128) * 1.05 + 128
pal = cv2.cvtColor(cen_lab.reshape(1, K, 3).astype(np.uint8), cv2.COLOR_LAB2BGR)[0]
flat = np.full_like(img, 255); flat[inside] = pal[lab.ravel()]
shadow = np.zeros((h, w), np.uint8)
dark_ids = np.argsort(lum)[:2]
sh = np.zeros(lab.shape[0], bool)
for d in dark_ids: sh |= lab.ravel() == d
tmp = np.zeros(inside.sum(), np.uint8); tmp[sh] = 255; shadow[inside] = tmp
INK = np.array([31, 18, 22], np.float32)
rng = np.random.default_rng(4)
mx, my = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
def field(a, sc):
    n = rng.standard_normal((h // sc + 2, w // sc + 2)).astype(np.float32); return cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC) * a
for k in range(N):
    hatch = np.zeros((h, w), np.uint8); ang = math.radians(-50 + rng.uniform(-10, 10)); ca, sa = math.cos(ang), math.sin(ang)
    for t in range(-2 * max(w, h), 2 * max(w, h), 6):
        x0, y0 = w / 2 - sa * t, h / 2 + ca * t
        cv2.line(hatch, (int(x0 - ca * 3000), int(y0 - sa * 3000)), (int(x0 + ca * 3000), int(y0 + sa * 3000)), 255, 1 + int(rng.random() < .5), cv2.LINE_AA)
    hatch = cv2.bitwise_and(hatch, shadow) * (field(1, 7) > -.3)
    ln = cv2.dilate(lines, np.ones((2, 2), np.uint8))
    cs, _ = cv2.findContours((alpha > 0).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    ol = np.zeros((h, w), np.uint8)
    for c in cs:
        if len(c) < 40: continue
        p = c[::3, 0, :].astype(np.float32) + rng.normal(0, 1, c[::3, 0, :].shape).astype(np.float32)
        for i in range(len(p) - 1):
            cv2.line(ol, tuple(p[i].astype(int)), tuple(p[i + 1].astype(int)), 255, 4 + int(4 * (.5 + .5 * math.sin(i * .05 + k))), cv2.LINE_AA)
    ink = np.maximum.reduce([ln, ol, hatch]).astype(np.float32) / 255
    out = flat.astype(np.float32) * (1 - ink[..., None]) + INK * ink[..., None]
    a = np.maximum(alpha, ol)
    dx, dy = (field(1.4, 34), field(1.4, 34)) if k else (np.zeros((h, w), np.float32),) * 2
    rgba = cv2.remap(np.dstack([np.clip(out, 0, 255).astype(np.uint8), a]), mx + dx, my + dy, cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    cv2.imwrite(f'{pre}-{k}.webp', rgba, [cv2.IMWRITE_WEBP_QUALITY, 88])
print('ok', w, h)
