import os, numpy as np, cv2
OUT = r'C:\dev\danzran.github.io\redesign\assets\handstand'; os.makedirs(OUT, exist_ok=True)
img = cv2.imread('hs.png'); H, W = img.shape[:2]
m = np.maximum(np.load('m_seg.npy'), np.load('m_seg_rot.npy'))
m = cv2.GaussianBlur((m > .5).astype(np.uint8) * 255, (5, 5), 0)
# keep the largest blob (the figure)
n, lab, st, _ = cv2.connectedComponentsWithStats((m > 127).astype(np.uint8))
big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); fig = (lab == big).astype(np.uint8) * 255
fig = cv2.morphologyEx(fig, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
def pastel(bgr, lift=.42, sat=.85, levels=5):
    lab_ = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab_[..., 0] * (1 - lift) + 255 * lift
    L = np.round(L / 255 * (levels - 1)) / (levels - 1) * 255 * .55 + L * .45   # soft posterize
    lab_[..., 0] = L; lab_[..., 1:] = (lab_[..., 1:] - 128) * sat + 128
    return cv2.cvtColor(np.clip(lab_, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
rng = np.random.default_rng(3)
mx, my = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
def field(amp, sc):
    n = rng.standard_normal((H // sc + 2, W // sc + 2)).astype(np.float32)
    return cv2.resize(n, (W, H), interpolation=cv2.INTER_CUBIC) * amp
base = pastel(cv2.bilateralFilter(img, 9, 50, 9), lift=.3, sat=1.35)
gray = cv2.cvtColor(cv2.GaussianBlur(img, (5, 5), 0), cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 130) * (cv2.erode(fig, np.ones((7, 7), np.uint8)) > 0)
INK = np.array([51, 36, 43], np.float32)
ys, xs = np.where(fig > 0); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
S = 1024 / H
for k in range(3):
    dx, dy = field(2.2, 48), field(2.2, 48)
    f = cv2.remap(fig, mx + dx, my + dy, cv2.INTER_LINEAR)
    col = cv2.remap(base, mx + dx * .5, my + dy * .5, cv2.INTER_LINEAR).astype(np.float32)
    e = cv2.remap(edges, mx + dx, my + dy, cv2.INTER_LINEAR).astype(np.float32) / 255
    cs, _ = cv2.findContours((f > 127).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    ol = np.zeros((H, W), np.uint8)
    for c in cs:
        if len(c) < 40: continue
        c = c[::4, 0, :].astype(np.float32) + rng.normal(0, 1.4, c[::4, 0, :].shape).astype(np.float32)
        cv2.polylines(ol, [c.astype(np.int32)], True, 255, 6, cv2.LINE_AA)
    ink = np.maximum(e * .8, ol.astype(np.float32) / 255)
    col = col * (1 - ink[..., None]) + INK * ink[..., None]
    grain = cv2.GaussianBlur(rng.normal(1, .04, (H, W)).astype(np.float32), (3, 3), 0)
    col = np.clip(col * grain[..., None], 0, 255).astype(np.uint8)
    a = np.maximum(f, ol)
    rgba = cv2.cvtColor(col, cv2.COLOR_BGR2BGRA); rgba[..., 3] = a
    cv2.imwrite(os.path.join(OUT, f'fig-{k}.webp'), cv2.resize(rgba, (int(W * S), 1024), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_WEBP_QUALITY, 85])
# aura: pastel, brighter background feathered radially around the figure
aura = pastel(cv2.GaussianBlur(img, (0, 0), 3), lift=.5, sat=1.0, levels=4)
rx, ry = (x1 - x0) * 1.6 + 120, (y1 - y0) * .75 + 80
d = np.sqrt(((mx - cx) / rx) ** 2 + ((my - cy) / ry) ** 2)
d = d + field(.08, 90)                     # wobbly, hand-cut edge
alpha = np.clip(1 - (d - .35) / .65, 0, 1) ** 1.6
rgba = cv2.cvtColor(aura, cv2.COLOR_BGR2BGRA); rgba[..., 3] = (alpha * 255).astype(np.uint8)
cv2.imwrite(os.path.join(OUT, 'aura.webp'), cv2.resize(rgba, (int(W * S), 1024), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_WEBP_QUALITY, 80])
# figure centre (normalised) so the page can aim light rays from it
open(os.path.join(OUT, 'meta.json'), 'w').write('{"cx":%.3f,"cy":%.3f,"top":%.3f,"bottom":%.3f}' % (cx / W, cy / H, y0 / H, y1 / H))
# preview on paper
paper = np.full((H, W, 3), (231, 241, 250), np.uint8)
def over(dst, src):
    a = src[..., 3:4].astype(np.float32) / 255; return (dst * (1 - a) + src[..., :3] * a).astype(np.uint8)
prev = over(paper, rgba)
f0 = cv2.imread(os.path.join(OUT, 'fig-0.webp'), cv2.IMREAD_UNCHANGED); f0 = cv2.resize(f0, (W, H))
cv2.imwrite('preview.jpg', cv2.resize(over(prev, f0), (512, 768)))
print('ok', cx / W, cy / H)
