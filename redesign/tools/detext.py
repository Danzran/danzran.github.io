"""Paint baked-in UI text out of a mockup so it can be used as a backdrop."""
import sys, numpy as np, cv2
src, out = sys.argv[1], sys.argv[2]
img = cv2.imread(src); H, W = img.shape[:2]
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
mask = np.zeros((H, W), np.uint8)
# boxes (fractions) around the title, subtitle, CTA and nav in 05-elemental-flow
for x0, y0, x1, y1 in [(.31, .19, .69, .335), (.38, .335, .62, .385), (.43, .415, .57, .465), (.38, .03, .62, .075)]:
    X0, Y0, X1, Y1 = int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)
    roi = gray[Y0:Y1, X0:X1]
    bg = cv2.medianBlur(roi, 31)
    txt = ((bg.astype(int) - roi.astype(int)) > 9).astype(np.uint8) * 255   # darker than surroundings = ink
    mask[Y0:Y1, X0:X1] = np.maximum(mask[Y0:Y1, X0:X1], txt)
mask = cv2.dilate(mask, np.ones((13, 13), np.uint8))
res = cv2.inpaint(img, mask, 9, cv2.INPAINT_TELEA)
# second pass with a softer blur to hide inpaint smears in the flat sky
blur = cv2.GaussianBlur(res, (0, 0), 6)
soft = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 6)[..., None]
res = (res * (1 - soft) + blur * soft).astype(np.uint8)
cv2.imwrite(out, res, [cv2.IMWRITE_WEBP_QUALITY, 88] if out.endswith('.webp') else [])
cv2.imwrite(out.rsplit('.', 1)[0] + '-mask.png', mask)
print('ok', W, H, int(mask.mean() / 2.55), '% masked')
