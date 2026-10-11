# Handstand orbit — notes

## What is usable

- The main stepping sequence is `yaw-m90`, `yaw-m60`, `yaw-m40`, `yaw-m20`, `yaw-000`, `yaw-p20`, `yaw-p40`, `yaw-p60`, `yaw-p90`.
- The view set is coherent in palette, line treatment, clothing, white background, figure scale, and hand baseline. It is best suited to a **slow, eased stepped/crossfade orbit**, rather than a claim of a mathematically continuous 3D rotation.
- `low-hands.png`, `high-feet.png`, `close-hands.png`, and `close-torso.png` are deliberate camera-path insert views. They should not be blended directly with the yaw sequence because their perspective/framing changes materially.
- `strip.png` is a reviewed navy-background preview of the nine yaw cutouts in order. It shows no unwanted green/teal treatment.

## Drift and limits

- The subject is a generated illustration constrained by the photo and turnaround; it is not verified 3D reconstruction or exact photographic likeness.
- The front-ish `yaw-000` and the stronger side frames have subtly different garment-fold detail, shoe sole visibility, hair, and arm spread. Use opacity crossfades of about 180–300 ms (or a slow scroll interpolation) so those small redraw changes read as animated illustration instead of a hard pop.
- `yaw-m90`/`yaw-p90` work as profile endpoints. The closest faithful arc is `m60 → m40 → m20 → 000 → p20 → p40 → p60`; hold/fade the profile endpoints instead of expecting exact geometric angular increments.

## Suggested scroll mapping

| Scroll progress within orbit beat | Frame blend |
|---:|---|
| 0.00 | `yaw-m60` |
| 0.14 | `yaw-m40` |
| 0.29 | `yaw-m20` |
| 0.43 | `yaw-000` |
| 0.57 | `yaw-p20` |
| 0.71 | `yaw-p40` |
| 0.86 | `yaw-p60` |
| 1.00 | hold `yaw-p60`, optionally ease to `yaw-p90` |

For reduced motion, use `yaw-000` as the static full figure and make the camera-route content independently reachable. For mobile, use only `m20 → 000 → p20` or a single static frame.

## Cutout delivery limitation

`cut/` contains 13 verified RGBA PNG cutouts at `933 × 1400`, made from the border-connected pure-white background so interior white sneaker areas remain opaque. The requested Windows-Python cutout program could not launch in this WSL session (`UtilBindVsockAnyPort: socket failed`), and this environment has no working WebP/JPEG encoder. Therefore these are intentionally named `.png`; they are not falsely labeled as WebP. Likewise the reviewed contact strip is `strip.png`, not the requested `strip.jpg`. A later codec-enabled conversion can turn each PNG into lossless/quality-90 WebP and `strip.png` into JPEG without changing alpha or layout.
