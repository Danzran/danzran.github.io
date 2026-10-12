"""Cut an illustration off a flat white background and write N boil variants (RGBA WebP).
usage: cutout.py in.png out_prefix [variants] [max_h] [pastel]"""
import sys, numpy as np, cv2
src, pre = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 3
MAXH = int(sys.argv[4]) if len(sys.argv) > 4 else 1200
PASTEL = float(sys.argv[5]) if len(sys.argv) > 5 else .25
img = cv2.imread(src); h, w = img.shape[:2]
s = min(1, MAXH / h); img = cv2.resize(img, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA); h, w = img.shape[:2]
# background = near-white region connected to the border
near_white = (img.min(axis=2) > 232).astype(np.uint8)
ff = near_white.copy(); mask = np.zeros((h + 2, w + 2), np.uint8)
for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)] + [(x, 0) for x in range(0, w, 40)] + [(x, h - 1) for x in range(0, w, 40)] + [(0, y) for y in range(0, h, 40)] + [(w - 1, y) for y in range(0, h, 40)]:
    if ff[y, x] == 1: cv2.floodFill(ff, mask, (x, y), 2)
bg = (ff == 2).astype(np.uint8)
alpha = 1 - bg
alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
# soft edge: remove the white fringe by scaling alpha with darkness near the edge
a = cv2.GaussianBlur(alpha.astype(np.float32), (0, 0), 1.2)
edge = (a > 0) & (a < 1)
dark = 1 - img.min(axis=2).astype(np.float32) / 255
a[edge] = np.minimum(a[edge], np.clip(dark[edge] * 3, 0, 1))
# pastel shift: lift lightness, keep hue
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
lab[..., 0] = lab[..., 0] * (1 - PASTEL) + 255 * PASTEL * (lab[..., 0] / 255) ** .5
lab[..., 1:] = (lab[..., 1:] - 128) * (1 - PASTEL * .35) + 128
img = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
rng = np.random.default_rng(9)
mx, my = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
def field(amp, sc):
    n = rng.standard_normal((h // sc + 2, w // sc + 2)).astype(np.float32)
    return cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC) * amp
for k in range(N):
    dx, dy = (field(1.3, 36), field(1.3, 36)) if k else (np.zeros((h, w), np.float32),) * 2
    rgba = np.dstack([img, (a * 255).astype(np.uint8)])
    out = cv2.remap(rgba, mx + dx, my + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    cv2.imwrite(f'{pre}-{k}.webp', out, [cv2.IMWRITE_WEBP_QUALITY, 86])
print('ok', w, h)
