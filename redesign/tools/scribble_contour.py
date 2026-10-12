import sys, json, cv2, numpy as np
from PIL import Image
src, out, name = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGBA'); w, h = im.size
a = np.array(im)[:, :, 3]
a = cv2.GaussianBlur(a, (0, 0), 3)
m = (a > 110).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
cs = sorted(cs, key=cv2.contourArea, reverse=True)
keep = [c for c in cs if cv2.contourArea(c) > 0.004 * w * h][:4]
res = []
for c in keep:
    c = cv2.approxPolyDP(c, 1.2, True)[:, 0, :]
    res.append([[round(float(x) / w, 4), round(float(y) / h, 4)] for x, y in c])
print(w, h, [len(c) for c in res], file=sys.stderr)
with open(out, 'w') as f:
    f.write('/* alpha-silhouette contour of %s, normalised 0..1 (precomputed: file:// canvas reads are tainted). tools: claude-pptr/scribble/contour.py */\n' % name)
    f.write('window.SCRIBBLE_CONTOURS = window.SCRIBBLE_CONTOURS || {};\n')
    f.write('window.SCRIBBLE_CONTOURS[%s] = %s;\n' % (json.dumps(name), json.dumps({'w': w, 'h': h, 'contours': res}, separators=(',', ':'))))
