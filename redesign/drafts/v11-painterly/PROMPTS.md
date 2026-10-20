# v11 Painterly: Codex asset prompts

Generated 2026-10-12 with `cat prompt.txt | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra -`,
one image per run, serially in `codex/` (one job in the folder at a time; logs kept outside the repo).
Sources stay in `codex/*.png`. `tools/build_tex.py` (Windows Python, Pillow + numpy) turns them into the page assets:
- horizontal wrap seam fixed by offset-and-blend (keep the middle, replace the edges with the half-rolled copy,
  crossfade at the two columns where both agree best); the starfield and the grain are fixed in both directions;
- near-black floor clamped to pure black (clean keying in the shader), resized, webp;
- `assets/sky-tex.js`: the sky layers as data URIs (WebGL refuses `file://` images; data URIs work);
- `assets/grain.webp`: the pencil grain as white + alpha (alpha = where the paper tooth eats pigment).

Every image was checked for green/teal, text and watermarks.

All cloud and star layers are painted on pure black so the shader can key them, re-light them by time of day and
add a rim light from their own luminance gradient.

The v10 assets kept in `assets/` (comet head, note star, cord) come from the v10 Magic hour pack; see
`../v10-magichour/PROMPTS.md`. The hero figure is `../../assets/kimi/hero/handstand-cutout-rim.webp`.

## Prompts (verbatim)

### cumulus-mid-a

```
Wide landscape image, 3:2 (1536x1024). Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no buildings, no ground, no text, no logo, no signature, no watermark, no recognizable film scene). Hand-painted gouache/digital-paint look with soft brush texture, crisp bright rim edges where light catches the cloud tops and soft painterly shading. Palette strictly ivory, cream, gold, peach, rose, lavender, violet, periwinkle and azure. Absolutely no green and no teal anywhere. Subject: a mid-distance layer of big billowing fair-weather cumulus clouds spread as a loose horizontal band through the middle of the image (roughly from 25% to 80% of the height), several separate puffy clouds of varied size with gaps of black between them. Lit ivory-white from above with crisp golden rims, undersides soft lavender-grey. Pure flat black background (#000000) everywhere there is no cloud, so it can be keyed/screen-blended over a separate sky; do not paint any sky colour or gradient behind the clouds. CRITICAL: this is a SEAMLESS HORIZONTALLY TILEABLE texture for a scrolling parallax layer. The left edge and the right edge must wrap: whatever is cut at the right border continues exactly at the left border, so copies placed side by side form one endless band with no visible seam, and no cloud ends abruptly at either side border. Keep the density even from left to right (no single centred subject, no vignette, no frame). Generate ONE image with your image generation tool and save it in the current directory as cumulus-mid-a.png. Do not write any other files.
```

### far-towers-a

```
Wide landscape image, 3:2 (1536x1024). Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no buildings, no ground, no text, no logo, no signature, no watermark, no recognizable film scene). Hand-painted gouache/digital-paint look with soft brush texture, crisp bright rim edges where light catches the cloud tops and soft painterly shading. Palette strictly ivory, cream, gold, peach, rose, lavender, violet, periwinkle and azure. Absolutely no green and no teal anywhere. Subject: a far, distant horizon band of towering cumulus and cumulonimbus heads along the LOWER 45% of the image, at golden hour: tops lit warm gold and peach from a low sun on the right, shaded sides soft rose-lavender, some towers taller than others like a mountain range of clouds. The upper half is empty black. Pure flat black background (#000000) everywhere there is no cloud, so it can be keyed/screen-blended over a separate sky; do not paint any sky colour or gradient behind the clouds. CRITICAL: this is a SEAMLESS HORIZONTALLY TILEABLE texture for a scrolling parallax layer. The left edge and the right edge must wrap: whatever is cut at the right border continues exactly at the left border, so copies placed side by side form one endless band with no visible seam, and no cloud ends abruptly at either side border. Keep the density even from left to right (no single centred subject, no vignette, no frame). Generate ONE image with your image generation tool and save it in the current directory as far-towers-a.png. Do not write any other files.
```

### cirrus-b

```
Wide landscape image, 3:2 (1536x1024). Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no buildings, no ground, no text, no logo, no signature, no watermark, no recognizable film scene). Hand-painted gouache/digital-paint look with soft brush texture, crisp bright rim edges where light catches the cloud tops and soft painterly shading. Palette strictly ivory, cream, gold, peach, rose, lavender, violet, periwinkle and azure. Absolutely no green and no teal anywhere. Subject: a high altocumulus 'mackerel sky': rows of small rippled cloudlets arranged in long gently curving bands across the whole image, ivory and peach highlights with lavender shading, the iconic anime sky texture. About 45% coverage with black gaps between the cloudlets. Pure flat black background (#000000) everywhere there is no cloud, so it can be keyed/screen-blended over a separate sky; do not paint any sky colour or gradient behind the clouds. CRITICAL: this is a SEAMLESS HORIZONTALLY TILEABLE texture for a scrolling parallax layer. The left edge and the right edge must wrap: whatever is cut at the right border continues exactly at the left border, so copies placed side by side form one endless band with no visible seam, and no cloud ends abruptly at either side border. Keep the density even from left to right (no single centred subject, no vignette, no frame). Generate ONE image with your image generation tool and save it in the current directory as cirrus-b.png. Do not write any other files.
```

### milkyway-a

```
Wide landscape image, 3:2 (1536x1024). Painted Japanese animated-film night sky in the luminous Makoto Shinkai style (style inspiration only: no text, no logo, no watermark, no landscape, no ground, no clouds). Subject: the Milky Way as a wide luminous band running HORIZONTALLY across the middle of the image, with dense star dust, glowing nebular clouds in lavender, rose-pink, periwinkle and azure, dark dust lanes, and thousands of tiny white and pale gold stars of varied brightness everywhere, a few bright sparkling stars with soft glows. Background pure black/deep navy-black. Absolutely no green and no teal. No shooting stars, no comets, no moon. CRITICAL: this is a SEAMLESS HORIZONTALLY TILEABLE texture for a scrolling parallax layer. The left edge and the right edge must wrap: whatever is cut at the right border continues exactly at the left border, so copies placed side by side form one endless band with no visible seam, and no cloud ends abruptly at either side border. Keep the density even from left to right (no single centred subject, no vignette, no frame). Ideally it also tiles vertically. Generate ONE image with your image generation tool and save it in the current directory as milkyway-a.png. Do not write any other files.
```

### pencil-grain

```
Square image (1024x1024). A seamless tileable texture: close-up of colored-pencil grain on cold-press drawing paper, monochrome grey only: the tooth of the paper catching light pencil strokes, a fine irregular speckled grain with tiny paper pits and soft directional pencil fibres. Mid-grey overall with fine light and dark speckle, even density, no visible strokes direction dominating, no vignette, no text, no objects. CRITICAL: SEAMLESS in both directions; left/right and top/bottom edges wrap perfectly. Generate ONE image with your image generation tool and save it in the current directory as pencil-grain.png. Do not write any other files.
```

### wisps-near

```
Wide landscape image, 3:2 (1536x1024). Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no buildings, no ground, no text, no logo, no signature, no watermark, no recognizable film scene). Hand-painted gouache/digital-paint look with soft brush texture, crisp bright rim edges where light catches the cloud tops and soft painterly shading. Palette strictly ivory, cream, gold, peach, rose, lavender, violet, periwinkle and azure. Absolutely no green and no teal anywhere. Subject: very close, soft, out-of-focus cloud wisps and mist streaks drifting horizontally, like the edges of cloud the camera is flying through: long soft feathered smoky streaks, ivory-white and pale lavender, very soft edges, with lots of black between them (about 35% coverage). Pure flat black background (#000000) everywhere there is no cloud, so it can be keyed/screen-blended over a separate sky; do not paint any sky colour or gradient behind the clouds. CRITICAL: this is a SEAMLESS HORIZONTALLY TILEABLE texture for a scrolling parallax layer. The left edge and the right edge must wrap: whatever is cut at the right border continues exactly at the left border, so copies placed side by side form one endless band with no visible seam, and no cloud ends abruptly at either side border. Keep the density even from left to right (no single centred subject, no vignette, no frame). Generate ONE image with your image generation tool and save it in the current directory as wisps-near.png. Do not write any other files.
```

### cumulus-mid-b

```
Wide landscape image, 3:2 (1536x1024). Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no buildings, no ground, no text, no logo, no signature, no watermark, no recognizable film scene). Hand-painted gouache/digital-paint look with soft brush texture, crisp bright rim edges where light catches the cloud tops and soft painterly shading. Palette strictly ivory, cream, gold, peach, rose, lavender, violet, periwinkle and azure. Absolutely no green and no teal anywhere. Subject: a mid-distance layer of soft, rounded, cotton-like cumulus clouds, scattered loosely across the whole image as many medium and small puffs (more air than cloud, about 40% coverage), lit cream-white with peach rims, undersides periwinkle. Pure flat black background (#000000) everywhere there is no cloud, so it can be keyed/screen-blended over a separate sky; do not paint any sky colour or gradient behind the clouds. CRITICAL: this is a SEAMLESS HORIZONTALLY TILEABLE texture for a scrolling parallax layer. The left edge and the right edge must wrap: whatever is cut at the right border continues exactly at the left border, so copies placed side by side form one endless band with no visible seam, and no cloud ends abruptly at either side border. Keep the density even from left to right (no single centred subject, no vignette, no frame). Generate ONE image with your image generation tool and save it in the current directory as cumulus-mid-b.png. Do not write any other files.
```

### far-towers-b

```
Wide landscape image, 3:2 (1536x1024). Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no buildings, no ground, no text, no logo, no signature, no watermark, no recognizable film scene). Hand-painted gouache/digital-paint look with soft brush texture, crisp bright rim edges where light catches the cloud tops and soft painterly shading. Palette strictly ivory, cream, gold, peach, rose, lavender, violet, periwinkle and azure. Absolutely no green and no teal anywhere. Subject: a far, distant horizon band of soft rounded cumulus towers along the LOWER 40% of the image at dusk after sunset: tops lit with fading rose-pink and apricot afterglow, bodies cool lavender and periwinkle, gentle and dreamy. The upper half is empty black. Pure flat black background (#000000) everywhere there is no cloud, so it can be keyed/screen-blended over a separate sky; do not paint any sky colour or gradient behind the clouds. CRITICAL: this is a SEAMLESS HORIZONTALLY TILEABLE texture for a scrolling parallax layer. The left edge and the right edge must wrap: whatever is cut at the right border continues exactly at the left border, so copies placed side by side form one endless band with no visible seam, and no cloud ends abruptly at either side border. Keep the density even from left to right (no single centred subject, no vignette, no frame). Generate ONE image with your image generation tool and save it in the current directory as far-towers-b.png. Do not write any other files.
```

### cirrus-a

```
Wide landscape image, 3:2 (1536x1024). Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no buildings, no ground, no text, no logo, no signature, no watermark, no recognizable film scene). Hand-painted gouache/digital-paint look with soft brush texture, crisp bright rim edges where light catches the cloud tops and soft painterly shading. Palette strictly ivory, cream, gold, peach, rose, lavender, violet, periwinkle and azure. Absolutely no green and no teal anywhere. Subject: high-altitude cirrus clouds: thin, wispy, feathery streaks and mares' tails sweeping diagonally and horizontally across the whole image, delicate and translucent, ivory-white with faint gold and rose highlights. Sparse (about 30% coverage), very fine brushwork. Pure flat black background (#000000) everywhere there is no cloud, so it can be keyed/screen-blended over a separate sky; do not paint any sky colour or gradient behind the clouds. CRITICAL: this is a SEAMLESS HORIZONTALLY TILEABLE texture for a scrolling parallax layer. The left edge and the right edge must wrap: whatever is cut at the right border continues exactly at the left border, so copies placed side by side form one endless band with no visible seam, and no cloud ends abruptly at either side border. Keep the density even from left to right (no single centred subject, no vignette, no frame). Generate ONE image with your image generation tool and save it in the current directory as cirrus-a.png. Do not write any other files.
```

### starfield-b

```
Square image (1024x1024). Painted anime-style deep night starfield (style inspiration Makoto Shinkai; no text, no logo, no watermark, no landscape, no clouds, no Milky Way band, no shooting stars, no moon). Thousands of tiny stars of varied size and brightness, white, pale gold, pale azure and faint pink, some bright stars with tiny soft cross glints, a very faint lavender and blue nebular haze in patches. Pure black background. Absolutely no green and no teal. CRITICAL: SEAMLESS TILEABLE TEXTURE in BOTH directions: left/right and top/bottom edges must wrap with no seam; even density, no vignette. Generate ONE image with your image generation tool and save it in the current directory as starfield-b.png. Do not write any other files.
```
