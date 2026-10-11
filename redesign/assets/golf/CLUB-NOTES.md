# Club and ball annotations

`club.json` and `club.js` align exactly with `swing.js`: output `gNN` is raw
`f(round(NN * 2.5) + 1)`, cropped from y=150..1110 and normalized to 600×800.

- **Grip:** midpoint of reliable MediaPipe wrist landmarks (falling back to the
  visible wrist), in the same normalized coordinate system as `kp`.
- **Head:** manually checked on the raw mapped frames against the visible shaft
  and driver face. There are 12 visible head positions: g00–g06, g14, g19, and
  g47–g49. The other entries are deliberately `null`: the head is either above/
  beyond the portrait crop, hidden by the original story text, or inseparable
  from motion blur. No invisible arc is presented as measured data.
- **Estimated frames:** none. `est` is all `false`; low-confidence partial
  observations are instead represented by lower `conf` values. A UI may join
  only adjacent non-null head points with a fading path.
- **Ball:** a stationary 0.013-frame-width circle at g00–g13. At g14/f036 the
  driver face occludes the tee position, and the launch is not reliably
  resolvable in the 12 fps selected frames, so later ball entries are `null`.
- **Speed:** `28.0 mph` is an illustrative 2-D peak-head estimate: visible
  impact displacement at 12 fps, scaled by an assumed 1.70 m head-to-ankle
  image height. Camera perspective, skipped source frames, and blur make it
  unsuitable as a launch-monitor or biomechanics measurement.

## Debug sheet

`club-debug.jpg` is a 5×10 source-frame sheet: magenta is the grip, cyan is a
directly observed club-head/shaft line, yellow is the visible ball. It was
visually checked after removing unverified estimates. The supplied Windows
OpenCV command writes a conventional JPEG. In this Linux sandbox, where OpenCV
is unavailable, the tool's dependency-free fallback emitted PNG data under the
same requested filename; it remains viewable by browser/image decoders and is
overwritten as a JPEG when rerun with the supplied Windows environment.

## Pass 2 (Claude, 2026-10-11)
- **Head is now filled for all 50 frames, so the site can draw a continuous club path.**
  - Frames read by eye from `club-debug.jpg` with the head visible (`est: false`): g06, g13, g15, g16, g18, g20, g21, g46–g49.
  - Frames where the head is out of the crop or hidden behind his head (`est: true`, conf 0.4): g07–g12, g17, g22–g45. These are placed by eye along the visible shaft direction, and coordinates may fall outside 0..1.
- **The pass-1 values that were clamped to 0 (g06, g47–g49) are replaced.**
- **`ball_est[15]`:** a faint dot in raw f039, read by eye, which is probably the ball leaving.
- **Dropped `club_speed_est_mph` (28 mph).** The 12 fps sampling cannot support a credible number, and a driver at 28 mph is implausible.
- **Why this was done by hand:** a full-rate OpenCV pass needs Windows interop. The Codex sandbox blocks it, and running Codex unsandboxed was not permitted, so this pass was done by hand.
