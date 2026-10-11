"""Sakuga impact-frame version of the golf rotoscope (v4): black brush ink, heavy hatching, white + speed lines. Reuses raw/ frames, mask/ and pose30.json."""
import json, os, math, numpy as np, cv2
OUT = r'C:\dev\danzran.github.io\redesign\drafts\v4-sakuga\assets\golf'
os.makedirs(OUT, exist_ok=True)
pose = json.load(open('pose30.json'))
H0, W0 = 1280, 720; CY0, CH = 150, 960; OW, OH = 600, 800
rng = np.random.default_rng(11)
def bgr(h): return np.array([int(h[i:i+2], 16) for i in (5, 3, 1)], np.float32)
INK = bgr('#16121f')
FG = [bgr('#8f6fd0'), bgr('#c3aef5'), bgr('#ffd6c4'), bgr('#fffaf2')]   # plum -> lilac -> cream
mx, my = np.meshgrid(np.arange(OW, dtype=np.float32), np.arange(OH, dtype=np.float32))
def field(amp, sc, r=rng):
    n = r.standard_normal((OH // sc + 2, OW // sc + 2)).astype(np.float32)
    return cv2.resize(n, (OW, OH), interpolation=cv2.INTER_CUBIC) * amp
# white field with radial concentration lines (pastel + a few ink), rebuilt per frame for boil
def speed_bg():
    bg = np.full((OH, OW, 3), 255, np.float32)
    cx, cy = OW * .52, OH * .42
    for i in range(120):
        a = rng.uniform(0, 2 * math.pi); r0 = rng.uniform(180, 300); r1 = r0 + rng.uniform(150, 500)
        w = rng.uniform(.004, .012); col = [bgr('#c3aef5'), bgr('#ffd6c4'), bgr('#bcd8ff'), bgr('#ffe7a3'), INK][rng.integers(0, 5) if rng.random() < .25 else rng.integers(0, 4)]
        pts = np.array([[cx + math.cos(a - w) * r0, cy + math.sin(a - w) * r0], [cx + math.cos(a) * r1, cy + math.sin(a) * r1], [cx + math.cos(a + w) * r0, cy + math.sin(a + w) * r0]], np.int32)
        cv2.fillPoly(bg, [pts], col.tolist(), cv2.LINE_AA)
    return bg
def fill_pose(i):
    while pose[i] is None: i -= 1
    return pose[i]
def stylize(src):
    img = cv2.imread(f'raw/f{src+1:03d}.png')[CY0:CY0 + CH]
    m = cv2.imread(f'mask/m{src+1:03d}.png', 0)[CY0:CY0 + CH]
    img = cv2.resize(img, (OW, OH), interpolation=cv2.INTER_AREA); m = cv2.resize(m, (OW, OH))
    sm = cv2.bilateralFilter(img, 9, 60, 9)
    g = cv2.cvtColor(sm, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    person = cv2.GaussianBlur(m, (7, 7), 0) > 110
    dx, dy = field(1.4, 40), field(1.4, 40)
    out = speed_bg()
    lv = np.clip(g * 2.0, 0, .999); idx = (lv * 4).astype(int)
    for k in range(4): out[(idx == k) & person] = FG[k]
    out = cv2.remap(out, mx + dx, my + dy, cv2.INTER_LINEAR)
    # dry-brush hatching in the darkest person tones
    dark = ((idx <= 1) & person).astype(np.uint8) * 255
    hatch = np.zeros((OH, OW), np.uint8)
    ang = math.radians(-55 + rng.uniform(-8, 8)); ca, sa = math.cos(ang), math.sin(ang)
    for k in range(-900, 900, 5):
        x0, y0 = OW / 2 + k * -sa, OH / 2 + k * ca
        p1 = (int(x0 - ca * 900), int(y0 - sa * 900)); p2 = (int(x0 + ca * 900), int(y0 + sa * 900))
        cv2.line(hatch, p1, p2, 255, 1 + int(rng.random() < .55), cv2.LINE_AA)
    hatch = cv2.bitwise_and(hatch, dark)
    brk = (field(1, 6) > -.2).astype(np.uint8)        # broken, dry-brush strokes
    hatch = hatch * brk
    # ink: soft edges + varying-width silhouette
    e = cv2.Canny(cv2.GaussianBlur((g * 255).astype(np.uint8), (5, 5), 0), 45, 120)
    near = cv2.dilate(person.astype(np.uint8), np.ones((161, 161), np.uint8)) > 0
    near[int(OH * .86):] = person[int(OH * .86):]
    e = cv2.remap(e, mx + dx * 1.4, my + dy * 1.4, cv2.INTER_LINEAR) * near
    club = (e > 0) & ~person
    e = np.where(club, cv2.dilate(e, np.ones((2, 2), np.uint8)), e)
    cs, _ = cv2.findContours(person.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    ol = np.zeros((OH, OW), np.uint8)
    for c in cs:
        if len(c) < 30: continue
        pts = c[::3, 0, :].astype(np.float32) + rng.normal(0, .9, c[::3, 0, :].shape).astype(np.float32)
        for i in range(len(pts) - 1):
            w = 3 + int(4 * (.5 + .5 * math.sin(i * .07 + rng.random())))
            cv2.line(ol, tuple(pts[i].astype(int)), tuple(pts[i + 1].astype(int)), 255, w, cv2.LINE_AA)
    ink = np.maximum.reduce([np.where(person, e.astype(np.float32) * .85, e.astype(np.float32)), ol.astype(np.float32), hatch.astype(np.float32)]) / 255
    out = out * (1 - ink[..., None]) + INK * ink[..., None]
    grain = cv2.GaussianBlur(rng.normal(1, .025, (OH, OW)).astype(np.float32), (3, 3), 0)
    return np.clip(out * grain[..., None], 0, 255).astype(np.uint8)
N = int(len(pose) / 2.5)
for k in range(N):
    s = min(round(k * 2.5), len(pose) - 1)
    cv2.imwrite(os.path.join(OUT, f'g{k:02d}.webp'), stylize(s), [cv2.IMWRITE_WEBP_QUALITY, 80])
print('frames', N)
