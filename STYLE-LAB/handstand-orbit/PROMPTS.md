# Handstand orbit — prompts

Generated 2026-10-11 with the built-in image generator. Every generation used these four references: `handstand.PNG` (identity, clothing and pose), `redesign/drafts/v3-cloud-ink/assets/figure.png` (rendering), `redesign/drafts/v9-night/assets/plate-night.webp` (upper-right moonlight only), and `00-turnaround.png` (view continuity after it was made).

## Shared direction

> Use case: identity-preserve. Create the same real adult in the strict two-handed handstand from the photo. Render in the `figure.png` style: controlled dark-indigo drawn contours and soft painted textile folds. Use restrained cool upper-right moon rim light. Clothing is locked to a deep navy knit beanie, maroon/burgundy long sleeve, pale blue denim jeans, and cream-white sneakers. Use a flat, pure `#FFFFFF` backdrop. Avoid green, teal, aqua, scenery, text, props, extra limbs, crop, and watermark.

## Turnaround — `00-turnaround.png`

> Create one clean wide turnaround sheet with exactly 8 separate full-body views of the same handstanding person, arranged left to right across one wide canvas: yaw -135, -90, -45, 0/front (closest to photo), +45, +90, +135, 180/back. The pose is the identical two-hands-planted handstand in every cell: hands on a shared baseline, arms down, body inverted, legs straight together and vertical, feet at the same height. Give each view equal scale and centered spacing. No labels, no grid, no text.

## Main yaw frames

Each uses the shared direction plus the exact view/framing clause below.

| File | Exact view/framing clause |
|---|---|
| `yaw-m90.png` | `True -90° yaw from the subject's left: side-profile torso/head, edge-on pair of straight legs, plausible staggered hands on a common 90%-height baseline. Full body centered at 80% height.` |
| `yaw-m60.png` | `Viewed at yaw -60 degrees around the subject (left-side three-quarter orbit). Full body centered, figure fills about 80% of frame height. Both planted hands rest on exactly the same horizontal baseline near 90% of canvas height.` |
| `yaw-m40.png` | `Viewed from left-front three-quarter -40° yaw. Full person centered at 80% height, both hands planted at a shared 90%-height baseline.` |
| `yaw-m20.png` | `Viewed slightly from his left-front at -20° yaw: legs held tightly together, fully vertical; two planted hands on exactly the 90% canvas-height ground baseline.` |
| `yaw-000.png` | `Camera faces him closest to the original-photo view, not a side view. Full body centered at 80% canvas height, planted hands exactly aligned on a 90%-height baseline.` |
| `yaw-p20.png` | `A small right-front orbit angle (+20° relative to yaw 0), consistent with the turnaround. Full 80%-tall body centered; two hands planted together on the exact 90%-height baseline.` |
| `yaw-p40.png` | `Yawed +40° to his right, giving the mirror right-front three-quarter view. Center full 80%-height figure. Both hands on fixed shared baseline at 90% of canvas.` |
| `yaw-p60.png` | `Seen from a right-side three-quarter +60° orbit. Full 80%-height body centered. Both hands land on identical fixed ground baseline at 90% canvas height.` |
| `yaw-p90.png` | `True +90° yaw: exact profile from his right, side-profile torso and head, legs paired edge-on, both hands in plausible staggered side-profile placement on the unchanged 90%-height baseline.` |

## Camera-elevation frames

| File | Exact view/framing clause |
|---|---|
| `low-hands.png` | `Camera is very low at ground level near the hands, looking up the arms, torso and vertical legs; hands foreground but full body still visible, legs together and straight, shoes near top. Perspective is natural and not fisheye.` |
| `high-feet.png` | `Camera above and slightly in front of the feet, looking downward along body to the planted hands. Feet and jeans have modest nearer-camera scale, hands recede naturally but stay visible at bottom. Full pose visible and centered.` |

## Camera-path crops

| File | Exact view/framing clause |
|---|---|
| `close-hands.png` | `Close 2:3 framing: both planted hands large and clear across the bottom, forearms and maroon sleeves rising into the frame, navy beanie/head and part of shoulders visible above. Intentional upper-torso crop; no legs or shoes.` |
| `close-torso.png` | `Close 2:3 crop of the inverted body: maroon upper torso and waist at lower section, light-blue jean hips and thighs prominent above, denim folds and pocket details. Exclude hands, head, lower legs and shoes.` |

All main frames requested a 2:3 portrait, no crop, figure at about 80% height. Generation follows the photo and illustration references but is still an illustrated interpretation, not a reconstructed 3D scan.
