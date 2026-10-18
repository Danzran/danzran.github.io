"""v11 Painterly: turn the Codex layer paintings (codex/*.png) into the sky textures.
Run with the Windows Python (Pillow + numpy):  python tools/build_tex.py   (from the v11-painterly folder)
 - fixes the horizontal wrap seam (offset-and-blend: keep the middle, replace the edges with the half-rolled copy,
   crossfade where the two agree best); the starfield and grain are fixed in both directions
 - clamps the near-black floor to pure black (clean keying in the shader), resizes, encodes webp
 - writes assets/sky-tex.js (data URIs: WebGL cannot upload file:// images, data URIs work) and assets/grain.webp
"""
import base64, io, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, 'codex'); OUT = os.path.join(HERE, 'assets')

def seam_x(a, bw=.07):
    h, w, _ = a.shape
    r = np.roll(a, w // 2, axis=1); b = int(w * bw)
    cost = np.convolve(np.abs(a - r).sum(axis=(0, 2)), np.ones(2 * b) / (2 * b), mode='same')
    x1 = b + 10 + int(np.argmin(cost[b + 10: w // 2 - b - 10]))
    x2 = w // 2 + b + 10 + int(np.argmin(cost[w // 2 + b + 10: w - b - 10]))
    x = np.arange(w, dtype=np.float32)
    s = lambda e0, e1: np.clip((x - e0) / (e1 - e0), 0, 1)
    m = s(x1 - b, x1 + b) * (1 - s(x2 - b, x2 + b)); m = m * m * (3 - 2 * m)
    return a * m[None, :, None] + r * (1 - m[None, :, None])

def load(name):
    p = os.path.join(SRC, name + '.png')
    return np.asarray(Image.open(p).convert('RGB')).astype(np.float32) if os.path.exists(p) else None

def floor_black(a, lo=10):
    L = a.max(axis=2, keepdims=True)
    k = np.clip((L - lo) / 18, 0, 1)
    return a * k

def enc(a, size, q=82):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize(size, Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
    return buf.getvalue()

LAYERS = {   # key: (source(s) in preference order, size, both-axes)
    'farA':  (['far-towers-a'], (1024, 683), False),
    'farB':  (['far-towers-b', 'far-towers-a'], (1024, 683), False),
    'midA':  (['cumulus-mid-a'], (1536, 1024), False),
    'midB':  (['cumulus-mid-b', 'cumulus-mid-a'], (1536, 1024), False),
    'cirA':  (['cirrus-a', 'cirrus-b'], (1024, 683), False),
    'cirB':  (['cirrus-b', 'cirrus-a'], (1024, 683), False),
    'wisp':  (['wisps-near', 'cirrus-a'], (1024, 683), False),
    'milky': (['milkyway-a'], (1536, 1024), False),
    'stars': (['starfield-b'], (768, 768), True),
}
js = ['/* v11 Painterly sky layers (Codex paintings, made tileable by tools/build_tex.py), as data URIs so WebGL can use them over file:// */', 'window.SKY_TEX = {']
total = 0
for key, (srcs, size, both) in LAYERS.items():
    a = next((x for x in (load(s) for s in srcs) if x is not None), None)
    if a is None: print('missing', key); continue
    a = seam_x(a)
    if both: a = seam_x(a.transpose(1, 0, 2)).transpose(1, 0, 2)
    a = floor_black(a)
    data = enc(a, size); total += len(data)
    js.append(f'  {key}: "data:image/webp;base64,{base64.b64encode(data).decode()}",')
    print(key, srcs[0], len(data) // 1024, 'KB')
js.append('};\n')
open(os.path.join(OUT, 'sky-tex.js'), 'w').write('\n'.join(js))
print('sky-tex.js', total // 1024, 'KB raw')

g = load('pencil-grain')
if g is not None:
    g = seam_x(g); g = seam_x(g.transpose(1, 0, 2)).transpose(1, 0, 2)
    L = g.mean(axis=2)
    L = (L - L.mean()) / (L.std() + 1e-6)
    al = np.clip((L - .35) * 160, 0, 255)          # the paper tooth (brighter than average) eats pigment
    rgba = np.dstack([np.full_like(L, 255)] * 3 + [al]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, 'grain.webp'), 'WEBP', quality=85)
    print('grain.webp written')
