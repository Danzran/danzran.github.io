import json, os, math, numpy as np, cv2
OUT = r'C:\dev\danzran.github.io\redesign\assets\golf'
os.makedirs(OUT, exist_ok=True)
pose = json.load(open('pose30.json'))
H0, W0 = 1280, 720
CY0, CH = 150, 960            # crop 720x960 (3:4)
OW, OH = 600, 800
rng = np.random.default_rng(7)
hexc = lambda h: np.array([int(h[i:i+2], 16) for i in (5, 3, 1)], np.uint8)  # -> BGR
BG = [hexc('#B9A8FF'), hexc('#9ED8FF'), hexc('#FFB3D1'), hexc('#FFE58A')]
FG = [hexc('#FF7A8A'), hexc('#FFB08A'), hexc('#FFF1D6')]
INK = hexc('#2B2433')

def fill_pose(i):
    j = i
    while pose[j] is None: j -= 1
    return pose[j]

def noise_field(h, w, amp, scale):
    n = rng.standard_normal((h // scale + 2, w // scale + 2)).astype(np.float32)
    return cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC) * amp

def stylize(src_idx):
    img = cv2.imread(f'raw/f{src_idx+1:03d}.png')
    m = cv2.imread(f'mask/m{src_idx+1:03d}.png', 0)
    if m is None: m = np.zeros(img.shape[:2], np.uint8)
    # remove baked-in story text overlay (top right): inpaint bright pixels in that box
    box = np.zeros(img.shape[:2], np.uint8); box[int(.27*H0):int(.40*H0), int(.6*W0):] = 255
    txt = ((cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) > 120) & (box > 0)).astype(np.uint8) * 255
    img = cv2.inpaint(img, cv2.dilate(txt, np.ones((9, 9), np.uint8)), 7, cv2.INPAINT_TELEA)
    img = img[CY0:CY0+CH]; m = m[CY0:CY0+CH]
    img = cv2.resize(img, (OW, OH), interpolation=cv2.INTER_AREA); m = cv2.resize(m, (OW, OH))
    sm = cv2.bilateralFilter(img, 9, 60, 9)
    g = cv2.cvtColor(sm, cv2.COLOR_BGR2GRAY).astype(np.float32)
    person = cv2.GaussianBlur(m, (7, 7), 0) > 110
    out = np.zeros_like(img)
    # background: 4 pastel bands by luminance (+ slight vertical bias so the ground reads warm)
    yy = np.linspace(0, 1, OH)[:, None].repeat(OW, 1)
    lb = np.clip((g / 255) * 1.6 + (yy - .45) * 1.2, 0, .999)
    bi = (lb * 4).astype(int)
    for k in range(4): out[(bi == k) & ~person] = BG[k]
    # person: 3 warm tones
    lp = np.clip(g / 255 * 1.8, 0, .999); pi = (lp * 3).astype(int)
    for k in range(3): out[(pi == k) & person] = FG[k]
    # boil: warp everything slightly, differently each frame
    dx = noise_field(OH, OW, 1.6, 40); dy = noise_field(OH, OW, 1.6, 40)
    mx, my = np.meshgrid(np.arange(OW, dtype=np.float32), np.arange(OH, dtype=np.float32))
    out = cv2.remap(out, mx + dx, my + dy, cv2.INTER_NEAREST, borderMode=cv2.BORDER_REFLECT)
    # ink: edges + jittered silhouette outline
    e = cv2.Canny(cv2.GaussianBlur(g.astype(np.uint8), (5, 5), 0), 40, 110)
    e = cv2.remap(e, mx + dx * 1.5, my + dy * 1.5, cv2.INTER_LINEAR)
    e = cv2.dilate(e, np.ones((2, 2), np.uint8))
    cs, _ = cv2.findContours(person.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    ol = np.zeros((OH, OW), np.uint8)
    for c in cs:
        if len(c) < 30: continue
        c = c[::3, 0, :].astype(np.float32)
        c += rng.normal(0, 1.1, c.shape).astype(np.float32)
        cv2.polylines(ol, [c.astype(np.int32)], True, 255, 3, cv2.LINE_AA)
    ink = np.maximum(e, ol).astype(np.float32) / 255
    out = (out * (1 - ink[..., None]) + INK * ink[..., None])
    # paper grain + crayon speckle
    grain = rng.normal(1, .045, (OH, OW)).astype(np.float32)
    grain = cv2.GaussianBlur(grain, (3, 3), 0)
    out = np.clip(out * grain[..., None], 0, 255).astype(np.uint8)
    return out

# 12 fps "on twos-ish": hold frames like hand animation
N = int(len(pose) / 2.5)
frames, kp = [], []
for k in range(N):
    s = min(round(k * 2.5), len(pose) - 1)
    cv2.imwrite(os.path.join(OUT, f'g{k:02d}.webp'), stylize(s), [cv2.IMWRITE_WEBP_QUALITY, 78])
    p = fill_pose(s)
    kp.append([[round(x, 4), round((y * H0 - CY0) / CH, 4), v] for x, y, v in p])

# ---- swing metrics (2D, camera-relative estimates) ----
def ang(a, b, c):
    v1 = np.array(a[:2]) - b[:2]; v2 = np.array(c[:2]) - b[:2]
    v1[0] *= OW; v2[0] *= OW; v1[1] *= OH; v2[1] *= OH
    return math.degrees(math.acos(np.clip(v1 @ v2 / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6), -1, 1)))
P = [np.array(fill_pose(i)) for i in range(len(pose))]
hands = np.array([(p[15][:2] + p[16][:2]) / 2 for p in P])
y0 = hands[0, 1]
start = next(i for i in range(len(hands)) if hands[i, 1] < y0 - .02)
top = start + int(np.argmin(hands[start:start + 25, 1]))
imp = top + int(np.argmax(hands[top:top + 15, 1]))
addr = max(0, start - 3)
spd = np.linalg.norm(np.diff(hands * [OW, OH], axis=0), axis=1) * 30
body_px = np.linalg.norm((P[0][0][:2] - (P[0][27][:2] + P[0][28][:2]) / 2) * [OW, OH])
peak_ms = float(spd[top:imp + 3].max() / body_px * 1.70)  # assume ~1.70 m head-to-ankle
per = []
for p in P:
    lead_arm = ang(p[11], p[13], p[15]); knee = ang(p[24], p[26], p[28])
    sh = math.degrees(math.atan2((p[12][1] - p[11][1]) * OH, (p[12][0] - p[11][0]) * OW))
    hp = math.degrees(math.atan2((p[24][1] - p[23][1]) * OH, (p[24][0] - p[23][0]) * OW))
    mid_s = (p[11][:2] + p[12][:2]) / 2; mid_h = (p[23][:2] + p[24][:2]) / 2
    spine = math.degrees(math.atan2((mid_s[0] - mid_h[0]) * OW, -(mid_s[1] - mid_h[1]) * OH))
    per.append([round(lead_arm), round(knee), round(abs(sh - hp)), round(spine)])
meta = {
    'fps': 12, 'frames': N, 'w': OW, 'h': OH,
    'phases': {'address': round(addr / 2.5), 'top': round(top / 2.5), 'impact': round(imp / 2.5)},
    'tempo': round((top - addr) / max(1, imp - top), 1),
    'backswing_s': round((top - addr) / 30, 2), 'downswing_s': round((imp - top) / 30, 2),
    'peak_hand_speed_ms': round(peak_ms, 1),
    'per_frame': [per[min(round(k * 2.5), len(per) - 1)] for k in range(N)],
    'per_frame_keys': ['lead_arm_deg', 'trail_knee_deg', 'shoulder_hip_sep_deg', 'spine_tilt_deg'],
    'kp': kp,
}
json.dump(meta, open(os.path.join(OUT, 'swing.json'), 'w'), separators=(',', ':'))
print({k: v for k, v in meta.items() if k not in ('kp', 'per_frame')})
