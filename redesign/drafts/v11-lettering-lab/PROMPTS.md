# v11 lettering lab: Codex texture prompts

Generated 2026-10-12 with Codex (`gpt-5.6-terra`, built-in image tool). The 8 jobs ran one at a time in a scratch folder, with logs kept outside the job folder:

```sh
cat prompts/NAME.txt | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra - > logs/NAME.log 2>&1
# then copy the newest PNG from ~/.codex/generated_images/<session id>/
```

## Post-processing

Windows Python with Pillow and numpy wrote the results to `redesign/assets/lettering/tex/` as webp:

- **Cord tiles:** the `#00FF00` key becomes alpha, green is despilled with `G <= 0.9 * max(R, (R+B)/2)` (no-green guard), and the image is cropped to the cord band. The braid period is found by autocorrelation and the tile is trimmed to a whole number of periods, so it repeats cleanly along the path, then scaled to 72 px tall.
- **Brush dab and stroke:** luminance becomes alpha on white, cropped to the ink, max 256 / 384 px.
- **Grain and tooth tiles:** the 2–98 percentile luminance stretch becomes alpha on white, 512x512 (Codex returns about 1254 px squares).

| Source | Delivered as | Used by |
|---|---|---|
| cord-tile-b | `tex/cord-tile.webp` (default) | RedCord |
| cord-tile-a | `tex/cord-tile-silk.webp` (`texture:'cord-tile-silk'`) | RedCord |
| brush-dab-a | `tex/brush-dab.webp` (default) | InkBrush |
| brush-stroke-b | `tex/brush-stroke.webp` (`dab:'brush-stroke'`) | InkBrush |
| pencil-grain-a | `tex/pencil-grain.webp` | PencilScribble |
| pencil-grain-b | `tex/pencil-grain-b.webp` (alternate) | not wired in |
| chalk-tooth-a | `tex/chalk-tooth.webp` | ChalkPastel |
| paper-tooth-b | `tex/paper-tooth.webp` (alternate) | not wired in |

## Exact prompts

### cord-tile-a

```text
Generate ONE image with your image generation tool and save it in the current directory as cord-tile-a.png. The image must be landscape, 1536x512 pixels. Do not write any other files.

A straight, perfectly horizontal braided silk cord (Japanese kumihimo) crossing the full width of the image from the left edge to the right edge, vertically centered, cord thickness about one fifth of the image height. The braid is a tight round kumihimo pattern of diagonal chevron twists in vivid vermilion red and red-orange silk, with one thin warm gold thread spiraling through it and a soft silky sheen along the top. The pattern repeats evenly so the left and right ends join seamlessly when tiled. Background: a completely flat, solid pure #00FF00 chroma key green, no shadow, no gradient, no green spill on the cord edges. Photoreal macro product shot, crisp, evenly lit. No text, no letters, no logo, no watermark, no frame or border, no knots, no tassels.
```

### cord-tile-b

```text
Generate ONE image with your image generation tool and save it in the current directory as cord-tile-b.png. The image must be landscape, 1536x512 pixels. Do not write any other files.

A straight, perfectly horizontal flat braided cord crossing the full width of the image from the left edge to the right edge, vertically centered, cord height about one fifth of the image height: a Japanese kumihimo braid in a luminous anime style, rose red and coral orange silk threads in a crisp herringbone twist, with two fine ivory and gold threads running along it, painted with soft cel shading and a glowing highlight along the top edge like a cord in a Makoto Shinkai film. The pattern repeats evenly so the left and right ends join seamlessly when tiled. Background: a completely flat, solid pure #00FF00 chroma key green, no shadow, no gradient, no green spill on the cord edges. No text, no letters, no logo, no watermark, no frame or border, no knots, no tassels.
```

### brush-dab-a

```text
Generate ONE image with your image generation tool and save it in the current directory as brush-dab-a.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A single dry-brush ink dab, white ink on a pure black background, centered, seen from above: a short, wide stamp of a round Japanese calligraphy brush pressed and dragged a little to the right, so its body is solid in the middle while the edges and the right side break into dozens of fine separate bristle streaks running horizontally (left to right), with dry gaps and tiny flecks. The dab fills about 60 percent of the image width and 45 percent of its height, with generous black margin all around and nothing touching the edges. Pure grayscale only, white on black. Sumi-e ink texture scan, very crisp, high detail. No text, no letters, no seal, no logo, no watermark, no frame or border.
```

### brush-stroke-b

```text
Generate ONE image with your image generation tool and save it in the current directory as brush-stroke-b.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A single long horizontal dry-brush calligraphy stroke in white ink on a pure black background: it starts at the left with a firm rounded press of a large sumi-e brush, runs straight across the middle of the image, and ends at the right in a fast flying-white (hihaku) tail where the ink runs out and the stroke splits into many fine separate bristle streaks with dry paper gaps. Stroke height about one quarter of the image height, vertically centered, with black margin above, below and at both ends; nothing touches the image edges. Pure grayscale only, white on black. Ink texture scan, very crisp, high detail. No text, no letters, no seal, no logo, no watermark, no frame or border.
```

### pencil-grain-a

```text
Generate ONE image with your image generation tool and save it in the current directory as pencil-grain-a.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A seamless tileable texture of soft white colored-pencil grain on a pure black background, as if a soft white pencil had been rubbed evenly across cold-press drawing paper: fine broken grain where the paper tooth leaves countless tiny black gaps, faint parallel pencil strokes running diagonally at about 30 degrees, slightly uneven pressure. Uniform density across the whole image (about 55 percent white coverage), no vignette, no gradient, no single focal point; the left and right edges and top and bottom edges must tile seamlessly. Pure grayscale only, white on black. Macro texture scan, crisp, high detail. No text, no letters, no logo, no watermark, no frame or border.
```

### pencil-grain-b

```text
Generate ONE image with your image generation tool and save it in the current directory as pencil-grain-b.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A seamless tileable texture of white colored pencil cross-hatching on a pure black background: two layers of quick, loose parallel hatching strokes crossing at about 40 degrees, each stroke slightly tapered with grainy broken edges where the paper tooth shows through as black specks; the strokes overlap densely so coverage is even (about 60 percent white). Uniform density everywhere, no vignette, no gradient, no focal point; all four edges tile seamlessly. Pure grayscale only, white on black. Macro texture scan, crisp, high detail. No text, no letters, no logo, no watermark, no frame or border.
```

### chalk-tooth-a

```text
Generate ONE image with your image generation tool and save it in the current directory as chalk-tooth-a.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A seamless tileable texture of soft white chalk pastel rubbed on a dark rough pastel paper, white on pure black: dense powdery chalk that catches only the raised paper tooth, so the coverage is broken into a fine irregular speckle of white with black pits in the valleys, plus faint short directional smudges. Even density across the whole image (about 50 percent white), no vignette, no gradient, no focal point; all four edges must tile seamlessly. Pure grayscale only. Macro texture scan, crisp. No text, no letters, no logo, no watermark, no frame or border.
```

### paper-tooth-b

```text
Generate ONE image with your image generation tool and save it in the current directory as paper-tooth-b.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A seamless tileable height map of coarse cold-press watercolor paper texture, rendered in grayscale: raised paper tooth bumps are bright white and the valleys between them are black, an irregular organic pattern of soft rounded bumps about 6 to 12 pixels across with fine fibers. Even, uniform distribution everywhere, no lighting gradient, no vignette, no focal point; all four edges must tile seamlessly. Pure grayscale only. Crisp macro scan. No text, no letters, no logo, no watermark, no frame or border.
```
