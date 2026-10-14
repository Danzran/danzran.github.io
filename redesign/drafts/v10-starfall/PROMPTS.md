# v10 Starfall: Codex asset prompts

All images generated with `codex exec -m gpt-5.6-terra` (built-in image tool), 2026-10-12, then converted to webp with Pillow.
Clouds were converted to RGBA: alpha = brightest channel (pure black -> transparent), colour un-premultiplied, so they draw normally over the night page.

## Used

| file | source run | notes |
|---|---|---|
| assets/sf/lake.webp | lake-c-clean (edit of lake-c, `-i ref.png`) | hero plate. Horizon 0.597, rock slab top ~0.80-0.82 (values in starfall.js PLATE) |
| assets/sf/milkyway-band.webp | milky-a | rotating Milky Way band, screen-blended under the procedural stars |
| assets/sf/cloud-row.webp | cloud-b | billow crest along the top of each cloud card |
| assets/sf/cloud-puff.webp | cloud-c | towering puff on one top corner of each cloud card |
| assets/sf/cloud-bank.webp | cloud-a | faint painterly texture inside the lower body of the cloud cards |

## Variations generated but not used
- lake-a (snow peaks, rocky right shore; painted meteors), lake-a-clean (same without meteors): strong, but the rocks give no flat place to stand.
- lake-b (hilltop over a lake; painted meteor fan): the meteors are baked in and the hill hides the lake reflections.
- lake-c (the original with painted meteors): replaced by the clean edit so only animated meteors move.
- milky-b (square starfield): replaced by ~900 procedural stars, which stay crisp while they rotate and draw trails.

## Prompts

### lake-a

```
Generate ONE image with your image generation tool and save it in the current directory as lake-a.png. Do not write any other files.
Image: wide 16:9 landscape (about 1920x1080). A perfectly still mountain lake at deep night under an enormous, dense Milky Way that arcs diagonally from the lower left to the upper right, thick with star clusters, glowing violet-rose dust lanes and countless sparkling stars. Two or three bright shooting stars with long thin glowing gold-ivory tails cross the upper sky. The horizon sits at about 58% of the height: low distant mountains silhouetted in deep indigo. The lake below is a mirror that reflects the Milky Way, the stars and the meteor trails, with faint horizontal ripples. In the lower right foreground a flat, smooth rock shore ledge (dark indigo-navy, empty) juts slightly into the water, big enough for a person to stand on it, lit faintly with gold rim light. The left third of the sky is calmer, darker navy (space for a title). Magic-hour afterglow: a thin warm gold and rose band glows along the horizon. Style: a hand-painted anime background in the style of luminous Japanese animated feature films of the 2010s (painterly, glowing, highly detailed, crisp stars, soft bloom, light leaks). Palette strictly: deep navy, royal blue, azure, ivory, warm gold, with small accents of rose and violet. ABSOLUTELY NO green and NO teal or cyan anywhere: any foliage, hills or rocks must be painted in deep indigo, violet-navy and blue-black. No people, no characters, no animals, no text, no letters, no logos, no watermark, no signature, no frame or border.
```

### lake-b

```
Generate ONE image with your image generation tool and save it in the current directory as lake-b.png. Do not write any other files.
Image: wide 16:9 landscape (about 1920x1080). A quiet hilltop above a calm lake at night, seen from slightly below. The sky fills the upper 65%: a breathtakingly dense Milky Way band rising from the right horizon and sweeping up and across, glittering with thousands of stars of different sizes, bright blue-white and gold stars with gentle diffraction sparkles, violet and rose nebula glow inside the band. A meteor shower: four or five thin shooting stars with long, glowing ivory-gold tails, all radiating from the same point in the upper left. Below, a long still lake mirrors the whole sky and the meteors. The near shore in the lower center-right is a smooth gently-rounded hill crest of dark indigo, bare, with no plants, empty and flat on top. Faint warm gold glow on the far horizon from a distant town. Style: a hand-painted anime background in the style of luminous Japanese animated feature films of the 2010s (painterly, glowing, highly detailed, crisp stars, soft bloom, light leaks). Palette strictly: deep navy, royal blue, azure, ivory, warm gold, with small accents of rose and violet. ABSOLUTELY NO green and NO teal or cyan anywhere: any foliage, hills or rocks must be painted in deep indigo, violet-navy and blue-black. No people, no characters, no animals, no text, no letters, no logos, no watermark, no signature, no frame or border.
```

### lake-c

```
Generate ONE image with your image generation tool and save it in the current directory as lake-c.png. Do not write any other files.
Image: wide 16:9 landscape (about 1920x1080). Night panorama over a wide, glassy lake ringed by soft distant mountains in deep indigo and violet. Above: a vivid, star-filled sky with a thick luminous Milky Way crossing from upper right to the left horizon, sparkling with star clusters, soft violet-rose and azure glow, scattered bright gold stars with small four-point sparkles. Several meteors streak down at a steep diagonal with long glowing gold-to-azure tails that fade out, one larger fireball with a bright ivory head. The lake reflects everything like a mirror with very fine ripple lines. Lower right foreground: a wide, empty, flat stone jetty or rock platform at the water's edge in dark navy with a warm gold rim highlight, no objects on it. Lens flare and soft light leak in the top corner. Style: a hand-painted anime background in the style of luminous Japanese animated feature films of the 2010s (painterly, glowing, highly detailed, crisp stars, soft bloom, light leaks). Palette strictly: deep navy, royal blue, azure, ivory, warm gold, with small accents of rose and violet. ABSOLUTELY NO green and NO teal or cyan anywhere: any foliage, hills or rocks must be painted in deep indigo, violet-navy and blue-black. No people, no characters, no animals, no text, no letters, no logos, no watermark, no signature, no frame or border.
```

### lake-c-clean

```
Generate ONE image with your image generation tool and save it in the current directory as lake-c-clean.png. Do not write any other files.
Use the attached image ref.png as the exact reference. Repaint the SAME scene at the same 16:9 framing, composition, palette and painterly anime-background style (same Milky Way, same mountains, same mirror lake, same rock platform in the lower right), with ONE change: remove every shooting star, meteor and streak of light from the sky, and remove their reflections in the water. The sky should contain only the Milky Way and crisp twinkling stars. Make the rock platform in the lower right have a flat, level top surface at its left end near the water's edge. Keep the left upper third of the sky slightly calmer and darker navy. ABSOLUTELY NO green, teal or cyan. No people, no text, no watermark.
```

### lake-a-clean

```
Generate ONE image with your image generation tool and save it in the current directory as lake-a-clean.png. Do not write any other files.
Use the attached image ref.png as the exact reference. Repaint the SAME scene at the same 16:9 framing, composition, palette and painterly anime-background style (same Milky Way, same mountains, same mirror lake, same rock platform in the lower right), with ONE change: remove every shooting star, meteor and streak of light from the sky, and remove their reflections in the water. The sky should contain only the Milky Way and crisp twinkling stars. Make the rock platform in the lower right have a flat, level top surface at its left end near the water's edge. Keep the left upper third of the sky slightly calmer and darker navy. ABSOLUTELY NO green, teal or cyan. No people, no text, no watermark.
```

### milky-a

```
Generate ONE image with your image generation tool and save it in the current directory as milky-a.png. Do not write any other files.
Image: wide 2:1 (about 2048x1024). A dense, glowing Milky Way galactic band running horizontally straight across the centre of the frame on a PURE BLACK background (the black must stay pure black, #000, so the image can be blended additively). The band: billions of tiny stars, bright star clusters, soft glowing cores, wispy dark dust lanes, colours in ivory, pale gold, azure blue, soft violet and rose. Sparse single stars scattered across the black around it. The band fades out softly to black at the top and bottom edges and is roughly symmetric. No horizon, no landscape, no text, no watermark. ABSOLUTELY NO green, teal or cyan.
```

### milky-b

```
Generate ONE image with your image generation tool and save it in the current directory as milky-b.png. Do not write any other files.
Image: square (about 1536x1536). A starfield on a PURE BLACK background (pure #000 black between stars, so it can be blended additively) for a rotating night sky: thousands of crisp stars of many sizes and brightness, a few bright ones with tiny four-point diffraction sparkles, colours ivory-white, pale gold, azure and a few rose; a soft diagonal Milky Way haze of violet and pale gold crosses the frame from corner to corner. No horizon, no landscape, no text, no watermark. ABSOLUTELY NO green, teal or cyan.
```

### cloud-a

```
Generate ONE image with your image generation tool and save it in the current directory as cloud-a.png. Do not write any other files.
Image: wide 16:9 (about 1920x1080). A single big fluffy cumulus cloud bank, painted in a luminous anime background style, floating in the middle of a PURE BLACK background (pure #000 around it so it can be screen-blended onto a night page). The cloud is lit from WITHIN and from above by moonlight: glowing ivory and warm gold billowing tops, inner light like a lantern behind the puffs, soft azure and periwinkle shading in the lower puffs, a little rose-violet tint in the shadows. The cloud is wide and roughly lens-shaped with a flattish bottom, with many round billows along its top edge; its centre is bright and glowing. No stars, no moon, no landscape, no text, no watermark. ABSOLUTELY NO green, teal or cyan, no grey.
```

### cloud-b

```
Generate ONE image with your image generation tool and save it in the current directory as cloud-b.png. Do not write any other files.
Image: wide 3:1 panorama (about 2400x800). A long horizontal row of soft, fluffy cumulus cloud billows, painted in a luminous anime background style, on a PURE BLACK background (pure #000 above and below so it can be screen-blended). The billows are round and puffy, glowing from inside with moonlight: ivory-white and pale gold highlights on top, azure and soft violet in the shaded undersides, sparkles of light along the rims. The row is like the top edge of a giant cloud: a continuous band of rounded puffs of varied sizes, fading to black below. No stars, no landscape, no text, no watermark. ABSOLUTELY NO green, teal or cyan, no grey.
```

### cloud-c

```
Generate ONE image with your image generation tool and save it in the current directory as cloud-c.png. Do not write any other files.
Image: square (about 1536x1536). A round, towering, very fluffy cumulus cloud puff (like a cauliflower-shaped cloud) centred on a PURE BLACK background (pure #000 around it so it can be screen-blended). Painted in a luminous anime background style, lit from within like a moonlit lantern: glowing ivory and warm-gold core, soft billows with bright rims, azure-blue and lavender shading at the bottom, a few tiny sparkles at the edges. Nothing else in the frame. No text, no watermark. ABSOLUTELY NO green, teal or cyan, no grey.
```
