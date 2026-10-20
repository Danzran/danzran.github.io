# v11 Cloud Sea: Codex asset prompts (2026-10-12)

Generated one at a time in `assets/gen/` with `cat prompt.txt | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra -` (6 images, all checked by eye: greyscale only, no text or watermark).
Every prompt ended with: "Generate ONE image with your image generation tool and save it in the current directory as NAME.png (exact filename). Do not write any other files and do not edit anything else."

The PNGs are mattes (white on black, luminance = alpha); colour and light come from the shaders. A build step (Windows Python + Pillow) turned them into `cloud-atlas.webp` (2048x1024, 4x2 cells of 512, borders faded), `peaks.webp`, `brush-a.webp`, `brush-b.webp` and `figure.webp` (the kimi pack's `hero/handstand-cutout-rim.webp` at 760 px), and embedded them as data URIs in `assets/textures.js`, because a `file://` page cannot upload file images to WebGL or read them back from a canvas.
Reused from v10 Comet (kimi pack prompts): `assets/comet-head.webp`, `assets/comet-split.webp`, `assets/flare.webp`.

| run | used as | notes |
|---|---|---|
| puffs-a | cloud-atlas.webp cells 0-3 | used: towering, wide, triple-lobe and leaning cumulus |
| puffs-b | cloud-atlas.webp cells 4-7 | used: flat mound, rolling billow, top-down puff, torn wisp |
| puffs-c | not used | softer and more photographic than a/b; kept as a spare variation |
| peaks-a | peaks.webp (far peaks in the sky shader) | used, squeezed to 1.15 rad of azimuth |
| brush-a | brush-a.webp (ink lettering, brush texture A) | used; loaded press, bristle body, frayed dry end |
| brush-b | brush-b.webp (ink lettering, brush texture B) | used; squarer press, drier body |

## puffs-a

```
A square 1024x1024 sprite sheet for a real-time 3D cloud renderer: a 2x2 grid of four separate soft painted cumulus cloud puffs, each centred in its own 512x512 cell with generous empty margin so no puff touches a cell edge or another puff. Style: hand-painted Makoto Shinkai anime cumulus, billowy rounded cauliflower tops, soft feathered edges, rich internal painted shading with bright sunlit lobes and softer greyer hollows, slightly flatter base. Render each cloud in pure greyscale WHITE on a PURE BLACK (#000000) background, like a luminance matte: the brightest lit lobes near white, thin wispy edges fading smoothly into the black. Four different shapes: (1) a round towering puff, (2) a wide low billow, (3) a cluster of three small lobes, (4) a lopsided puff leaning right. No colour at all, no gradient in the background, no grid lines, no text, no labels, no border, no stars.
```

## puffs-b

```
A square 1024x1024 sprite sheet for a real-time 3D cloud-sea renderer: a 2x2 grid of four separate soft painted cloud shapes seen from slightly above, each centred in its own 512x512 cell with generous empty margin so nothing touches a cell edge or another shape. Style: Makoto Shinkai anime sea-of-clouds, the tops of a stratocumulus deck: (1) a broad flat-topped cloud mound with gentle rounded bumps, (2) a long horizontal rolling billow, (3) a soft fluffy cauliflower top seen from above, (4) a thin wispy torn cloud fragment. Painterly brushwork with visible soft painted lobes and gentle internal shading. Render in pure greyscale WHITE on a PURE BLACK (#000000) background as a luminance matte: dense lit lobes bright white, thin edges and wisps fading smoothly into black. No colour, no background texture, no grid lines, no text, no labels, no border, no stars.
```

## puffs-c

```
A square 1024x1024 sprite sheet for a real-time 3D cloud renderer: a 2x2 grid of four separate small soft cumulus puffs, each centred in its own 512x512 cell with wide empty margins (each puff fills only about 70% of its cell and never touches the cell edge). Style: Makoto Shinkai anime cloud painting, very soft and airy, round cotton-like lobes stacked in clusters, airbrushed feathered edges with a few delicate wisps, gentle painted shading inside so the lobes read as 3D. Each puff a different silhouette: round, oval wide, double-lobed, small tall. Render in pure greyscale WHITE on PURE BLACK (#000000) as a luminance matte; edges fade softly to black. No colour, no grid lines, no text, no labels, no border, no stars, nothing else in the image.
```

## peaks-a

```
A wide 2048x640 panorama painting for a game: a distant mountain range whose peaks rise out of a sea of clouds, Makoto Shinkai anime style. Paint ONLY the mountains as a soft luminance matte: the mountain masses in solid light grey to white, with gentle painted ridgelines, a slightly brighter rim along the sunlit left edges of the ridges and softer greyer faces; the lower 25% of the mountains fades smoothly into pure black where the cloud sea would hide them. Two or three main peaks of different heights, one tall sharp peak left of centre, a long low ridge to the right, plus faint lower ridges. Everything else in the image is PURE BLACK (#000000): no sky, no clouds, no stars, no moon, no colour, no text, no border.
```

## brush-a

```
A 1024x512 texture of ONE single horizontal Japanese sumi ink brush stroke (fude calligraphy), white ink on a PURE BLACK (#000000) background, for use as a brush stamp texture. The stroke starts on the left with a pressed, rounded, fully loaded wet blob, runs straight across with long fine parallel bristle streaks visible inside the stroke (slightly varying density), and ends on the right in a dramatic dry-brush break-up (kasure): the stroke splits into separate thin bristle trails, scratchy gaps and flying white strands that taper off. Edges slightly ragged. The stroke fills most of the width and about 45% of the height, centred vertically. Pure white and black only, no colour, no paper texture, no background noise, no text, no seal stamp, no border.
```

## brush-b

```
A 1024x512 texture of ONE single horizontal Chinese/Japanese calligraphy brush stroke, white on a PURE BLACK (#000000) background, for use as a brush stamp texture. A medium-dry brush: the stroke body is mostly solid white but streaked throughout with many fine dark parallel bristle lines running along its length; the left start is a firm square-ish press, the right end frays into a fan of dry bristle strands with scratchy breaks (kasure) that taper off. The stroke is centred vertically and spans about 90% of the width and 40% of the height. Pure white on pure black only, no colour, no paper grain, no text, no seal, no border.
```
