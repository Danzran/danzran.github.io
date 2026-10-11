"""Derive a flow map (RG = direction, B = strength) from a painting's own water streaks."""
import sys, math, numpy as np, cv2
src, out = sys.argv[1], sys.argv[2]
img = cv2.imread(src); H, W = img.shape[:2]
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
yy = np.linspace(0, 1, H)[:, None].repeat(W, 1)
water = ((hsv[..., 0] > 92) & (hsv[..., 0] < 122) & (hsv[..., 1] > 95) & (hsv[..., 2] > 140) & (yy > .47)).astype(np.uint8)
water = cv2.morphologyEx(water, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
foam = cv2.dilate(water, np.ones((17, 17), np.uint8))
strength = np.where(water > 0, 1.0, np.where(foam > 0, .65, np.where(yy > .42, .16, .05))).astype(np.float32)
strength = cv2.GaussianBlur(strength, (0, 0), 6)
# stripe orientation from the structure tensor; flow runs ALONG the streaks
g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
jxx = cv2.GaussianBlur(gx * gx, (0, 0), 15); jyy = cv2.GaussianBlur(gy * gy, (0, 0), 15); jxy = cv2.GaussianBlur(gx * gy, (0, 0), 15)
theta = .5 * np.arctan2(2 * jxy, jxx - jyy) + math.pi / 2
dx, dy = np.cos(theta), np.sin(theta)
flip = dx < 0; dx[flip] *= -1; dy[flip] *= -1               # water heads to the right
# outside the water: a gentle rightward drift with a little lift
dx = np.where(foam > 0, dx, .95); dy = np.where(foam > 0, dy, -.15)
dx = cv2.GaussianBlur(dx.astype(np.float32), (0, 0), 4); dy = cv2.GaussianBlur(dy.astype(np.float32), (0, 0), 4)
n = np.sqrt(dx * dx + dy * dy) + 1e-6; dx /= n; dy /= n
rgb = np.dstack([strength, dy * .5 + .5, dx * .5 + .5])     # BGR order -> R=dx, G=dy, B=strength
small = cv2.resize((rgb * 255).clip(0, 255).astype(np.uint8), (W // 2, H // 2), interpolation=cv2.INTER_AREA)
cv2.imwrite(out, small)
print('ok', W // 2, H // 2, 'water %', round(water.mean() * 100, 1))
