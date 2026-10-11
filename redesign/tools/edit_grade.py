"""'Beautiful World' edit grade: washed teal shadows, cream highlights, pink accents, bloom, grain.
usage: grade.py golf  -> graded golf frames (12 fps holds) from raw/ ;  grade.py still in out [w]"""
import sys, os, numpy as np, cv2
rng = np.random.default_rng(2)
def grade(img):
    hsv0 = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    green = (hsv0[..., 0] > 30) & (hsv0[..., 0] < 95)
    hsv0[..., 0] = np.where(green, 135, hsv0[..., 0])               # no green: push to lilac
    img = cv2.cvtColor(hsv0.astype(np.uint8), cv2.COLOR_HSV2BGR)
    f = (img.astype(np.float32) / 255) ** .55                       # open up exposure (dreamy, not moody)
    img = (f * 255).astype(np.uint8)
    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None] / 255
    f = f * .72 + .26                                            # lifted, washed blacks
    sh = np.array([.62, .55, .25], np.float32)                   # BGR teal for shadows
    hi = np.array([.86, .93, 1.0], np.float32)                   # cream highlights
    pk = np.array([.85, .72, 1.0], np.float32)                   # pink in the mids
    w_sh = (1 - lum) ** 2; w_hi = lum ** 2; w_mid = 1 - w_sh - w_hi
    tint = sh * w_sh + hi * w_hi + pk * w_mid
    f = f * .55 + tint * .45 * (f.mean(axis=2, keepdims=True) * 1.2 + .25)
    hsv = cv2.cvtColor(np.clip(f * 255, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] *= .78
    f = cv2.cvtColor(hsv.clip(0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32) / 255
    bright = np.clip((f - .72) * 3, 0, 1)
    f = f + cv2.GaussianBlur(bright, (0, 0), 18) * .35          # bloom
    b, g, r = cv2.split(f); h, w = b.shape
    M = np.float32([[1, 0, 1.5], [0, 1, 0]]); r = cv2.warpAffine(r, M, (w, h), borderMode=cv2.BORDER_REFLECT)   # chroma offset
    f = cv2.merge([b, g, r])
    f += rng.normal(0, .022, f.shape[:2])[..., None]              # grain
    yy, xx = np.mgrid[0:h, 0:w]; vig = 1 - .12 * (((xx / w - .5) ** 2 + (yy / h - .5) ** 2) * 2.2)
    f = f * vig[..., None]
    return np.clip(f * 255, 0, 255).astype(np.uint8)
if sys.argv[1] == 'golf':
    OUT = r'C:\dev\danzran.github.io\redesign\drafts\v6-edit\assets\golf'; os.makedirs(OUT, exist_ok=True)
    import glob
    files = sorted(glob.glob('golf/raw/f*.png')); N = int(len(files) / 2.5)
    for k in range(N):
        im = cv2.imread(files[min(round(k * 2.5), len(files) - 1)])[150:1110]
        # paint out the baked-in story caption first
        box = np.zeros(im.shape[:2], np.uint8); box[int(.27 * 1280) - 150:int(.40 * 1280) - 150, 430:] = 255
        txt = ((cv2.cvtColor(im, cv2.COLOR_BGR2GRAY) > 120) & (box > 0)).astype(np.uint8) * 255
        im = cv2.inpaint(im, cv2.dilate(txt, np.ones((9, 9), np.uint8)), 7, cv2.INPAINT_TELEA)
        im = cv2.resize(im, (600, 800), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(OUT, f'g{k:02d}.webp'), grade(im), [cv2.IMWRITE_WEBP_QUALITY, 80])
    print('golf frames', N)
else:
    im = cv2.imread(sys.argv[2]); W = int(sys.argv[4]) if len(sys.argv) > 4 else 1600
    s = W / im.shape[1]; im = cv2.resize(im, (W, int(im.shape[0] * s)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(sys.argv[3], grade(im), [cv2.IMWRITE_WEBP_QUALITY, 84]); print('still', im.shape)
