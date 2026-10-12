# "Your Name" asset pack: prompts and notes

Generated 2026-10-12 with Codex (`gpt-5.6-terra`, built-in image tool) for the v10 "Your Name" / Makoto Shinkai direction. Gallery: [index.html](index.html). Card-frame comparison: [clouds/cloud-card-demo.html](clouds/cloud-card-demo.html).

## How it was run

```sh
# one folder per job in the scratchpad (not the repo); refs copied in for hero jobs
cat prompts/NAME.txt | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra [-i handstand.png -i orbit.png] - > logs/NAME.log 2>&1
```

- 8 jobs ran in parallel (`xargs -P 8`). Each took 1 to 4 minutes; one took 15.
- Every prompt starts with: "Generate ONE image with your image generation tool and save it in the current directory as NAME.png. The image must be <size>. Do not write any other files."
- Sizes: landscape 1536x1024, portrait 1024x1536, square 1024x1024 (squares came back 1254x1254).

## Post-processing (Windows Python with Pillow + cv2)

- **Plates** (skies, hero scenes): a no-green guard `G = min(G, max(R, (R+B)/2) + 8)`, then webp q84 plus a 768-wide copy.
- **Light sprites** (comets, flares, notes, leaks): the same guard, then black levels crushed by 4/255 so `screen` shows no box.
- **Keyed sprites** (clouds, frames, cords): the prompt asks for a flat `#00FF00` background. The key computes alpha from green dominance, un-mixes the green, applies the same guard as despill, and crops to content.
  - Afterwards the clouds get a warm pass: lemon yellows with `G >= 0.96R` are pulled to `G = 0.93R`, so cloud tops read gold, not lime.
- **Horizons:** the flat navy top is detected and cropped, then the top 32% fades to alpha.
- **Cut-outs:** `cutout.py` (white flood-fill) with 1 variant, max height 1400 and pastel 0.08.
- **Check:** every delivered file is scanned for green/teal pixels, and every one scores 0.00 to 0.04% (only edge specks).

## What worked / gotchas

- **Parallel runs can save the wrong image.** Codex looks for "the newest file" in the shared `~/.codex/generated_images/`. In one case (`comet-streak-long`) it copied a neighbouring job's comet.
  - Fix: after each run, read the `session id` from the log and copy the newest PNG from `~/.codex/generated_images/<session id>/`.
- **"Do not write any other files" made Codex delete the job log** in its working dir. Keep logs outside the job folder.
- **Green-screen keying is clean** because the palette has no green: a cloud can never be keyed out by mistake. Ask for "no green spill on its edges".
- **Long palette lists hold well.** "Push the teal band toward azure and lavender" keeps every twilight sky free of teal.
  - Some skies still lean amber/orange at the horizon (warm gold is in-palette); grade down in CSS if needed.
- **Hero fidelity:** two refs (the painted photo plus the clean v9 orbit frame) and an explicit clothing list kept him consistent in every run. Explicitly saying "paint the beanie NAVY BLUE, never green" was needed, because the original photo's beanie reads dark green.
- **Cloud frames:** asking for the inside to be "EMPTY, completely FLAT, solid #eef2fb" plus "billow border even in thickness" gave 9-slice-ready frames on the first try.
- **Codex usage limit:** hit after about 37 images. `hero-falling-stars-landscape` and `cumulus-wisps` (round 2) failed on the limit and were not delivered.

## Files and exact prompts

### Skies (`sky/`)

#### `sky-comet-twilight` → sky/sky-comet-twilight.webp + -768

Note: Best pick. Comet split upper-right, lake town; centre-left calm.

```text
Generate ONE image with your image generation tool and save it in the current directory as sky-comet-twilight.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A full-bleed hero sky at twilight, just after sunset. The upper two-thirds is a vast luminous sky: deep navy at the top fading through royal blue and azure into a band of lavender-violet and soft rose, then warm gold just above the horizon. A brilliant comet crosses the sky from upper right toward lower left, and its head is splitting into two pieces: two long glowing parallel tails, one ivory-white and one rose-gold, diverge slightly as they stream across the sky, with a few tiny fragments and sparkles shedding from the split point. Scattered first stars and a faint thin crescent moon. Dramatic cumulus clouds with gold-lit rims sit along the right side and the lower horizon. At the very bottom, a calm mountain caldera lake reflects the sky and the comet trails like a mirror, and a small lakeside town with warm gold window lights and streetlights curves along the shore, seen from a hillside far above. Composition: keep the centre-left area of the sky calm and uncluttered (smooth gradient with only a few faint stars) so a large headline can sit there; put the comet split point in the upper right third and the densest clouds on the right. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no letters, no numbers, no logos, no title, no watermark, no signature, no frame or border. No people or characters. This is an original composition, not a recreation of any scene from an existing film.
```

#### `sky-comet-twilight-portrait` → sky/sky-comet-twilight-portrait.webp + -768

Note: Phone version.

```text
Generate ONE image with your image generation tool and save it in the current directory as sky-comet-twilight-portrait.png. The image must be portrait, 1024x1536 pixels. Do not write any other files.

A tall phone-format hero sky at twilight, just after sunset. Deep navy at the top fading through royal blue and azure into lavender-violet, soft rose and a warm gold glow above the horizon. A brilliant comet descends from the upper right; its head splits into two long glowing tails, one ivory-white and one rose-gold, diverging slightly, with tiny sparkling fragments at the split point. Scattered first stars. Towering cumulus with gold-lit rims on the right edge. The bottom quarter shows a calm caldera lake mirroring the comet trails and a small hillside town with warm gold window lights around its shore. Keep the upper-left and middle-left third calm and uncluttered, a smooth gradient with a few faint stars, so a headline can sit there. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no letters, no numbers, no logos, no title, no watermark, no signature, no frame or border. No people or characters. This is an original composition, not a recreation of any scene from an existing film.
```

#### `sky-comet-seaside` → sky/sky-comet-seaside.webp + -768

Note: Round 2 alternative; twin tails reflected in a bay.

```text
Generate ONE image with your image generation tool and save it in the current directory as sky-comet-seaside.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A full-bleed hero sky at blue hour over a quiet seaside town on a curved bay. The sky fills the upper 70 percent: deep navy at the top, royal blue, then clear azure and a band of lavender and rose, with a last warm gold glow along the sea horizon on the right. A comet crosses high from the upper right and splits into two long, slender glowing tails, ivory-white and rose-gold, gently diverging toward the upper centre, with a faint wide luminous haze and a few tiny sparkling fragments. A sprinkling of stars. Soft gold-rimmed cumulus low on the right and long thin rose cloud streaks across the horizon. At the bottom: the calm sea reflects the comet as two long shimmering streaks, and a small hillside town of warm gold window lights and streetlights curves along the bay. Keep the centre-left of the sky calm and uncluttered for a headline. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. Foliage in navy and violet silhouette, never green. No text, no letters, no numbers, no logos, no title, no watermark, no signature, no frame or border. No people or characters. This is an original composition, not a recreation of any scene from an existing film.
```

#### `sky-meteor-night` → sky/sky-meteor-night.webp + -768

Note: Milky Way + radiant meteor shower.

```text
Generate ONE image with your image generation tool and save it in the current directory as sky-meteor-night.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A full-bleed starry night sky over a quiet landscape. A dense, glowing Milky Way arches diagonally from lower right to upper left in ivory, pale gold, azure and lavender star clouds with dark navy dust lanes. A meteor shower: a dozen or more thin shooting stars with long glowing tapering trails, all radiating from the same point in the upper right, in ivory, pale gold and a few rose-tinted ones, with tiny sparkles at their heads. Thousands of fine stars and a few bright twinkling stars with small cross flares. Deep navy and royal blue sky with azure glow near the horizon. At the bottom, a low silhouetted ridge of navy hills with a small town of warm gold lights scattered along it, and soft violet mist in the valleys. Composition: keep the centre-left area relatively calm (darker, fewer meteors crossing it) so a headline can sit there. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no letters, no numbers, no logos, no title, no watermark, no signature, no frame or border. No people or characters. This is an original composition, not a recreation of any scene from an existing film.
```

#### `sky-meteor-night-portrait` → sky/sky-meteor-night-portrait.webp + -768

Note: Took ~15 min (slowest job).

```text
Generate ONE image with your image generation tool and save it in the current directory as sky-meteor-night-portrait.png. The image must be portrait, 1024x1536 pixels. Do not write any other files.

A tall phone-format starry night sky. A dense glowing Milky Way runs diagonally through the frame in ivory, pale gold, azure and lavender star clouds with dark navy dust lanes. A meteor shower: many thin shooting stars with long glowing tapering trails radiating from the upper right, ivory, pale gold and a few rose-tinted, sparkles at their heads. Deep navy and royal blue sky with azure glow near the horizon. Bottom fifth: silhouetted navy hills with a small town of warm gold lights and violet valley mist. Keep the middle-left third calm and darker so a headline can sit there. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no letters, no numbers, no logos, no title, no watermark, no signature, no frame or border. No people or characters. This is an original composition, not a recreation of any scene from an existing film.
```

#### `sky-magic-hour` → sky/sky-magic-hour.webp + -768

Note: Cloud sea at sunset; strong amber, right-weighted.

```text
Generate ONE image with your image generation tool and save it in the current directory as sky-magic-hour.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A full-bleed magic-hour sky seen from above the clouds. The sun has just touched the horizon on the right, throwing long golden rays and a soft anamorphic lens flare streak across the frame. Below, an endless sea of fluffy cumulus clouds stretches to the horizon, their tops glowing warm gold and ivory, their shadowed sides rose and lavender violet. Above, the sky graduates from warm gold and peach near the sun, through rose and lavender, to clear azure and royal blue, and deep navy at the very top with a few first stars and one faint shooting star. A few tall towering cumulus with brilliant gold rims rise on the right. Sparkling light specks in the air. Composition: the sun and the brightest clouds on the right third; keep the centre-left sky calm, a smooth gradient, so a large headline can sit there. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no letters, no numbers, no logos, no title, no watermark, no signature, no frame or border. No people or characters. This is an original composition, not a recreation of any scene from an existing film.
```

#### `sky-magic-hour-portrait` → sky/sky-magic-hour-portrait.webp + -768

```text
Generate ONE image with your image generation tool and save it in the current directory as sky-magic-hour-portrait.png. The image must be portrait, 1024x1536 pixels. Do not write any other files.

A tall phone-format magic-hour sky above a sea of clouds. The sun sits low on the right edge, golden rays and a soft lens flare. An endless cloud sea fills the lower third, tops glowing gold and ivory, shadowed sides rose and lavender. Sky graduates upward from warm gold and peach through rose and lavender to azure, royal blue and deep navy at the top with a few stars and one faint shooting star. A towering gold-rimmed cumulus on the right. Keep the upper-middle left area calm and smooth for a headline. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no letters, no numbers, no logos, no title, no watermark, no signature, no frame or border. No people or characters. This is an original composition, not a recreation of any scene from an existing film.
```

#### `horizon-lake-town` → sky/horizon-lake-town.webp + -768 (RGBA)

Note: Best horizon. Flat navy top cropped, top 32% faded to alpha.

```text
Generate ONE image with your image generation tool and save it in the current directory as horizon-lake-town.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A wide horizontal strip meant to sit at the bottom of a web page. The TOP 45 percent of the image must be a completely flat, uniform solid dark navy colour (hex #0d1b3d), no stars, no gradient, no detail at all. Below that, the scene fades up out of the navy: a night view from a hillside down to a calm caldera lake, with a small lakeside town of hundreds of warm gold and ivory window lights, streetlights and a few rose-tinted lanterns curving around the shore, a railway line of tiny lights, the lights reflecting as long shimmering gold streaks in the dark navy lake water, soft violet mist between the roofs, silhouetted navy hills and trees (painted in navy and dark violet, never green). Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no letters, no numbers, no logos, no title, no watermark, no signature, no frame or border. No people or characters. This is an original composition, not a recreation of any scene from an existing film.
```

#### `horizon-hill-town` → sky/horizon-hill-town.webp + -768 (RGBA)

Note: Codex left a hard seam under the flat band; the alpha fade hides it.

```text
Generate ONE image with your image generation tool and save it in the current directory as horizon-hill-town.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A wide horizontal strip meant to sit at the bottom of a web page. The TOP 45 percent of the image must be a completely flat, uniform solid dark navy colour (hex #0d1b3d), with no detail at all. Below that, rising out of the navy: a silhouetted skyline of a small hillside town at blue hour — tiled rooftops, a shrine roof, power lines and utility poles, a water tower, all in deep navy silhouette with a thin azure rim light, and hundreds of warm gold glowing windows and streetlights, a few rose lanterns, sparkling bokeh light specks and a soft lavender haze over the rooftops. Foliage is painted as navy and violet silhouette, never green. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no letters, no numbers, no logos, no title, no watermark, no signature, no frame or border. No people or characters. This is an original composition, not a recreation of any scene from an existing film.
```

### Comets and light (`comet/`, pure black, use `mix-blend-mode: screen`)

#### `comet-split` → comet/comet-split.webp

Note: Best pick.

```text
Generate ONE image with your image generation tool and save it in the current directory as comet-split.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A comet splitting in two, as a light sprite. A brilliant comet enters from the upper right; at the centre of the image its glowing head breaks apart and from that point two long glowing tails continue toward the lower left, gently diverging: one ivory-white with a gold core, one rose-pink with a lavender edge, each ending in its own small bright head fragment. A burst of tiny sparkling fragments and a soft lens-flare glint at the split point, and a faint wide luminous haze around the tails. Anime film style (Makoto Shinkai), luminous, dreamy, clean. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `comet-split-b` → comet/comet-split-b.webp

```text
Generate ONE image with your image generation tool and save it in the current directory as comet-split-b.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A comet splitting into twin tails, falling steeply from the top-right corner toward the lower-left at about 50 degrees. The main head is a brilliant ivory point with a cross-shaped star flare; just below it the body splits into two long, slender, glowing trails that separate in a narrow V — one gold-ivory, one rose-violet — and a third tiny fragment veers off with a short sparkle trail. Fine glittering particles along both tails. Anime film style, luminous. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `comet-streak-long` → comet/comet-streak-long.webp

Note: First attempt got another job's image (see notes); fixed by copying from its own session folder.

```text
Generate ONE image with your image generation tool and save it in the current directory as comet-streak-long.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A single shooting star sprite: one long, thin, glowing meteor streak crossing diagonally from the top-right corner area down toward the lower-left, at roughly 25 degrees below horizontal. The head is a small brilliant ivory-white point with a soft round bloom and a tiny four-point star glint; the tail is long, smooth and tapering, warm gold near the head fading through rose to a faint lavender wisp at the end, with a delicate secondary inner core line and a few tiny sparkle particles shedding along it. Anime film style (Makoto Shinkai), luminous and clean. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `comet-streak-steep` → comet/comet-streak-steep.webp

Note: Three streaks; the brief asked for separate ones and got them.

```text
Generate ONE image with your image generation tool and save it in the current directory as comet-streak-steep.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A sprite of three separate shooting stars of different lengths falling steeply, at about 60 degrees, from upper right to lower left, well separated from each other with black space between them. Each has a brilliant ivory-white head with a small star glint and soft bloom, and a smooth tapering glowing tail: one gold, one pale azure, one rose. Tiny sparkles trail behind. Anime film style, luminous, clean. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `flare-burst` → comet/flare-burst.webp

```text
Generate ONE image with your image generation tool and save it in the current directory as flare-burst.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A lens-flare sparkle burst sprite centred in the image: a brilliant ivory-white star point with a long thin horizontal anamorphic flare streak (azure tinted), a fine four-point and six-point star glint, a soft warm gold round bloom, a few faint hexagonal and circular lens ghosts in rose, lavender and azure arranged along a diagonal line, and tiny glittering specks around it. Anime film style. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `flare-burst-b` → comet/flare-burst-b.webp

```text
Generate ONE image with your image generation tool and save it in the current directory as flare-burst-b.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A soft magic-hour sun-flare sprite: a large warm gold and ivory circular glow off-centre to the upper left, with radiating thin light rays, a long horizontal anamorphic streak, a chain of soft circular lens ghosts and a ring flare in rose, lavender and azure crossing the frame diagonally toward the lower right. Dreamy, painterly anime film style. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `sparkle-burst` → comet/sparkle-burst.webp

Note: Reads a little like a firework; use small and brief.

```text
Generate ONE image with your image generation tool and save it in the current directory as sparkle-burst.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A sprite of a starburst explosion of light: from a brilliant ivory-white centre point, dozens of tiny glowing sparks and short shooting-star streaks fly outward radially in all directions, each with a small fading tail, in ivory, warm gold, rose and pale azure, plus a soft round gold bloom and a faint thin ring shockwave of lavender light. Like a comet fragment bursting in an anime film sky. Centred with black margin. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `glitter` → comet/glitter.webp

```text
Generate ONE image with your image generation tool and save it in the current directory as glitter.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A sprite of sparkling glitter particles: hundreds of tiny glowing light specks scattered loosely across the frame, denser in a soft diagonal drift band from upper left to lower right, in ivory, warm gold, pale azure and a few rose; some are tiny round dots with soft bloom, some are crisp four-point star glints of varying sizes, a few larger twinkles. Like light dust in an anime film sky. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

### Clouds (`clouds/`, keyed from #00FF00 to RGBA)

#### `cumulus-bank` → clouds/cumulus-bank.webp

```text
Generate ONE image with your image generation tool and save it in the current directory as cumulus-bank.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A single large isolated bank of fluffy cumulus clouds, centred, filling about 80 percent of the width, painted in anime film style (Makoto Shinkai): soft billowing rounded tops lit warm ivory and gold from the right, shadowed undersides in lavender, periwinkle and soft azure blue, delicate rose rim light, crisp painted edges with soft wispy fringes, flat-ish base. The cloud is fully contained inside the frame with margin on all sides. The background must be a completely flat, uniform, pure chroma-key green (#00FF00) everywhere outside the subject, with no shadows, no gradient and no texture, so it can be keyed out. The subject itself must contain no green at all, and no green spill on its edges. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `cumulus-puffs` → clouds/cumulus-puffs.webp + cumulus-puffs-1..5.webp

Note: Split by connected components.

```text
Generate ONE image with your image generation tool and save it in the current directory as cumulus-puffs.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

Five separate, isolated small fluffy cumulus cloud puffs of different sizes and shapes, arranged in a loose row with clear empty space between every cloud so none touch, painted in anime film style (Makoto Shinkai): rounded billowy tops glowing ivory and pale gold, undersides in soft azure and lavender, faint rose rim light, crisp painted edges. Each cloud fully inside the frame. The background must be a completely flat, uniform, pure chroma-key green (#00FF00) everywhere outside the subject, with no shadows, no gradient and no texture, so it can be keyed out. The subject itself must contain no green at all, and no green spill on its edges. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `cumulus-tower` → clouds/cumulus-tower.webp

Note: Jagged left edge; prefer tower-b.

```text
Generate ONE image with your image generation tool and save it in the current directory as cumulus-tower.png. The image must be portrait, 1024x1536 pixels. Do not write any other files.

A single isolated tall towering cumulonimbus cloud, centred, filling most of the height with margin around it, painted in anime film style (Makoto Shinkai) at twilight: the top billows glow brilliant gold and ivory from a low sun on the left, the body is soft rose and lavender, the base deep periwinkle blue, with crisp painted edges and soft wispy fringes. The background must be a completely flat, uniform, pure chroma-key green (#00FF00) everywhere outside the subject, with no shadows, no gradient and no texture, so it can be keyed out. The subject itself must contain no green at all, and no green spill on its edges. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `cumulus-tower-b` → clouds/cumulus-tower-b.webp

Note: Best tower (asked for smooth edges).

```text
Generate ONE image with your image generation tool and save it in the current directory as cumulus-tower-b.png. The image must be portrait, 1024x1536 pixels. Do not write any other files.

A single isolated towering cumulus cloud at night lit by moonlight and starlight, centred, with generous margin all round: rounded billowing heads with smooth soft painted edges (no jagged or spiky edges), tops glowing ivory and pale azure, a faint warm gold rim on one side, body in periwinkle, royal blue and lavender, base in deep navy-violet. Anime film style (Makoto Shinkai). The background must be a completely flat, uniform, pure chroma-key green (#00FF00) everywhere outside the subject, with no shadows, no gradient and no texture, so it can be keyed out. The subject itself must contain no green at all, and no green spill on its edges. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `cloud-frame-landscape` → clouds/cloud-frame-landscape.webp

```text
Generate ONE image with your image generation tool and save it in the current directory as cloud-frame-landscape.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A wide landscape cloud card frame filling about 90 percent of the image width and 80 percent of the height, centred. It is a decorative UI card frame: a soft, bright, fluffy cloud-shaped panel. The outer edge is a puffy, scalloped ring of rounded cumulus billows (painted in anime film style, lit ivory and pale gold from the top, with soft lavender and pale azure shading underneath each puff and a faint rose rim light), running all the way around the panel. The inside of the panel is a large, EMPTY, completely FLAT and smooth solid area of pale ivory-blue (hex #eef2fb) with no texture, no clouds and no detail, so text can be placed on it. The billow border should be fairly even in thickness (about 8 to 12 percent of the panel's shorter side) so it can be stretched. The background must be a completely flat, uniform, pure chroma-key green (#00FF00) everywhere outside the subject, with no shadows, no gradient and no texture, so it can be keyed out. The subject itself must contain no green at all, and no green spill on its edges. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `cloud-frame-square` → clouds/cloud-frame-square.webp

Note: Best frame; used by the 9-slice demo (slice 215).

```text
Generate ONE image with your image generation tool and save it in the current directory as cloud-frame-square.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A square cloud card frame filling about 88 percent of the image, centred. It is a decorative UI card frame: a soft, bright, fluffy cloud-shaped panel. The outer edge is a puffy, scalloped ring of rounded cumulus billows (painted in anime film style, lit ivory and pale gold from the top, with soft lavender and pale azure shading underneath each puff and a faint rose rim light), running all the way around the panel. The inside of the panel is a large, EMPTY, completely FLAT and smooth solid area of pale ivory-blue (hex #eef2fb) with no texture, no clouds and no detail, so text can be placed on it. The billow border should be fairly even in thickness (about 8 to 12 percent of the panel's shorter side) so it can be stretched. The background must be a completely flat, uniform, pure chroma-key green (#00FF00) everywhere outside the subject, with no shadows, no gradient and no texture, so it can be keyed out. The subject itself must contain no green at all, and no green spill on its edges. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `cloud-frame-tall` → clouds/cloud-frame-tall.webp

```text
Generate ONE image with your image generation tool and save it in the current directory as cloud-frame-tall.png. The image must be portrait, 1024x1536 pixels. Do not write any other files.

A tall portrait cloud card frame filling about 85 percent of the width and 90 percent of the height, centred. It is a decorative UI card frame: a soft, bright, fluffy cloud-shaped panel. The outer edge is a puffy, scalloped ring of rounded cumulus billows (painted in anime film style, lit ivory and pale gold from the top, with soft lavender and pale azure shading underneath each puff and a faint rose rim light), running all the way around the panel. The inside of the panel is a large, EMPTY, completely FLAT and smooth solid area of pale ivory-blue (hex #eef2fb) with no texture, no clouds and no detail, so text can be placed on it. The billow border should be fairly even in thickness (about 8 to 12 percent of the panel's shorter side) so it can be stretched. The background must be a completely flat, uniform, pure chroma-key green (#00FF00) everywhere outside the subject, with no shadows, no gradient and no texture, so it can be keyed out. The subject itself must contain no green at all, and no green spill on its edges. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

### Hero (`hero/`, refs: `handstand.PNG` + `redesign/drafts/v9-night/assets/orbit/yaw-000.webp` as PNG on white)

#### `hero-comet-twilight` → hero/hero-comet-twilight.webp + -768

Note: Best pick. Pose, build, maroon sweatshirt, jeans, beige sneakers and navy beanie are faithful.

Refs: `-i handstand.png -i orbit.png`

```text
Generate ONE image with your image generation tool and save it in the current directory as hero-comet-twilight.png. The image must be portrait, 1024x1536 pixels. Do not write any other files.

The attached reference images show Daniel, a real person, doing a straight handstand: he wears a maroon / burgundy long-sleeve sweatshirt, light-blue denim jeans, beige-white low sneakers, and a navy-blue knit beanie with a pom-pom (paint the beanie NAVY BLUE, never green); short brown hair shows under the beanie; he is seen from behind, legs together pointing straight up, arms straight and hands flat on the ground. Keep his pose, body proportions, build and clothing exactly faithful to the references — it must clearly be the same person and the same pose. Do not show a face. Paint a new tall anime film still (Makoto Shinkai style) of him doing this handstand on a grassless rocky lakeside hilltop at twilight, figure about 45 percent of the image height in the lower-centre-right, mostly silhouetted in deep navy with a thin glowing gold and rose rim light along his edges. Behind him a vast luminous twilight sky: deep navy at the top fading through royal blue, azure and lavender to rose and warm gold at the horizon; a brilliant comet crosses the sky above him and splits into two long glowing tails, ivory-white and rose-gold; first stars; gold-rimmed cumulus. Far below, a caldera lake mirrors the sky with tiny gold town lights on its shore. Keep the upper-left area calm for a headline. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. Ground and foliage in navy, violet and slate blue, never green. No text, no logos, no watermark, no other people.
```

#### `hero-comet-landscape` → hero/hero-comet-landscape.webp + -768

Refs: `-i handstand.png -i orbit.png`

```text
Generate ONE image with your image generation tool and save it in the current directory as hero-comet-landscape.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

The attached reference images show Daniel, a real person, doing a straight handstand: he wears a maroon / burgundy long-sleeve sweatshirt, light-blue denim jeans, beige-white low sneakers, and a navy-blue knit beanie with a pom-pom (paint the beanie NAVY BLUE, never green); short brown hair shows under the beanie; he is seen from behind, legs together pointing straight up, arms straight and hands flat on the ground. Keep his pose, body proportions, build and clothing exactly faithful to the references — it must clearly be the same person and the same pose. Do not show a face. Paint a new wide anime film still (Makoto Shinkai style) of him doing this handstand on the right third of the frame, standing on a hilltop edge above a twilight caldera lake town, figure about 55 percent of the image height, lit by a warm gold and rose rim light with the cool blue sky light on his front. The sky: deep navy to royal blue to azure to lavender and warm gold at the horizon, a comet splitting into twin glowing ivory and rose-gold tails crossing above him, sparkles, gold-rimmed cumulus. Keep the left half calm and open for a headline. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. Ground and foliage in navy, violet and slate blue, never green. No text, no logos, no watermark, no other people.
```

#### `hero-falling-stars` → hero/hero-falling-stars.webp + -768

Refs: `-i handstand.png -i orbit.png`

```text
Generate ONE image with your image generation tool and save it in the current directory as hero-falling-stars.png. The image must be portrait, 1024x1536 pixels. Do not write any other files.

The attached reference images show Daniel, a real person, doing a straight handstand: he wears a maroon / burgundy long-sleeve sweatshirt, light-blue denim jeans, beige-white low sneakers, and a navy-blue knit beanie with a pom-pom (paint the beanie NAVY BLUE, never green); short brown hair shows under the beanie; he is seen from behind, legs together pointing straight up, arms straight and hands flat on the ground. Keep his pose, body proportions, build and clothing exactly faithful to the references — it must clearly be the same person and the same pose. Do not show a face. Paint a new tall anime film still (Makoto Shinkai style) of him doing this handstand on a flat open rooftop or stone plaza at night, figure about 45 percent of the image height in the lower centre, his clothing softly lit from above by falling shooting stars: many glowing meteors with long ivory, gold and rose trails streak down the deep navy and royal-blue starry sky toward him, a dense Milky Way, sparkling glitter in the air around his body, warm gold rim light on his legs and sneakers, soft azure light on his jeans, reflections on the ground. Keep the colours of his clothes recognisable. Keep the upper-left area calm for a headline. Style: a hand-painted Japanese anime feature-film background in the luminous manner of Makoto Shinkai — hyper-detailed painted sky, magic-hour light, soft bloom and glow, anamorphic lens flare streaks, sparkling light specks, crisp dramatic cumulus with glowing gold and rose rims, fine atmospheric gradients. Painterly, cinematic, high dynamic range, clean edges, no photographic noise. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No green anywhere. No text, no logos, no watermark, no other people.
```

#### `hero-cutout` → hero/handstand-cutout.webp

Note: Best cut-out. White bg removed with cutout.py (1 variant, max_h 1400, pastel 0.08).

Refs: `-i handstand.png -i orbit.png`

```text
Generate ONE image with your image generation tool and save it in the current directory as hero-cutout.png. The image must be portrait, 1024x1536 pixels. Do not write any other files.

The attached reference images show Daniel, a real person, doing a straight handstand: he wears a maroon / burgundy long-sleeve sweatshirt, light-blue denim jeans, beige-white low sneakers, and a navy-blue knit beanie with a pom-pom (paint the beanie NAVY BLUE, never green); short brown hair shows under the beanie; he is seen from behind, legs together pointing straight up, arms straight and hands flat on the ground. Keep his pose, body proportions, build and clothing exactly faithful to the references — it must clearly be the same person and the same pose. Do not show a face. Paint him as a clean anime film character illustration (Makoto Shinkai style colour and lighting): full body handstand, centred, filling about 85 percent of the image height, with a clean thin dark-navy outline, soft cel shading, a warm gold and rose rim light along his right side as if lit by a comet, and cool azure shadow on the left. The background must be completely flat pure white (#FFFFFF), no ground, no shadow on the ground, no sky, nothing else, so he can be cut out. No text, no logos, no watermark.
```

#### `hero-cutout-rim` → hero/handstand-cutout-rim.webp

Note: Night rim-lit variant, same cutout.py settings.

Refs: `-i handstand.png -i orbit.png`

```text
Generate ONE image with your image generation tool and save it in the current directory as hero-cutout-rim.png. The image must be portrait, 1024x1536 pixels. Do not write any other files.

The attached reference images show Daniel, a real person, doing a straight handstand: he wears a maroon / burgundy long-sleeve sweatshirt, light-blue denim jeans, beige-white low sneakers, and a navy-blue knit beanie with a pom-pom (paint the beanie NAVY BLUE, never green); short brown hair shows under the beanie; he is seen from behind, legs together pointing straight up, arms straight and hands flat on the ground. Keep his pose, body proportions, build and clothing exactly faithful to the references — it must clearly be the same person and the same pose. Do not show a face. Paint him as a clean anime film character illustration at night, full body handstand, centred, filling about 85 percent of the image height: his figure is mostly in cool deep-blue shadow (clothes still readable as maroon sweatshirt, blue jeans, beige sneakers and navy beanie), with a strong glowing warm gold and rose rim light tracing his right edge and the soles of his sneakers, as if lit from above-right by a falling comet, and a thin azure rim on his left edge. Thin dark-navy outline, soft cel shading. The background must be completely flat pure white (#FFFFFF), no ground, no shadow, no sky, nothing else, so he can be cut out. No text, no logos, no watermark.
```

### Motifs (`motifs/`)

#### `cord-straight` → motifs/cord-straight.webp (RGBA)

```text
Generate ONE image with your image generation tool and save it in the current directory as cord-straight.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A decorative divider sprite: a single long braided silk cord (Japanese kumihimo style, tightly braided with a visible diagonal plait pattern), crimson-rose red with thin gold threads woven through it, running horizontally across the whole width of the image in a gentle, slightly wavy line through the vertical centre, with one simple elegant loop knot in the middle. Softly glowing, with a faint warm rose glow around it and a few tiny gold sparkles. Painted anime film style, crisp detail. The background must be a completely flat, uniform, pure chroma-key green (#00FF00) everywhere outside the subject, with no shadows, no gradient and no texture, so it can be keyed out. The subject itself must contain no green at all, and no green spill on its edges. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `cord-tied` → motifs/cord-tied.webp (RGBA)

Note: Best cord.

```text
Generate ONE image with your image generation tool and save it in the current directory as cord-tied.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A decorative sprite: a braided silk cord (kumihimo style, visible diagonal plait pattern), crimson-rose red with thin gold threads, flowing across the image in a long graceful S-shaped curve from the left edge to the right edge, tied in the centre into a neat decorative bow knot with two short tasselled ends hanging down. A faint warm rose glow and a few tiny gold sparkles around it. Painted anime film style, crisp detail. The background must be a completely flat, uniform, pure chroma-key green (#00FF00) everywhere outside the subject, with no shadows, no gradient and no texture, so it can be keyed out. The subject itself must contain no green at all, and no green spill on its edges. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `note-star` → motifs/note-star.webp (screen)

Note: Best pick for the song easter egg.

```text
Generate ONE image with your image generation tool and save it in the current directory as note-star.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A small glowing sprite for a music easter egg: a single eighth-note music symbol shaped from light, its round note head is a brilliant ivory-gold star with a four-point glint and soft bloom, its stem and flag are a luminous ribbon of gold light trailing into a short rose-and-lavender shooting-star tail with sparkles, centred in the frame with lots of black margin. Anime film style, magical, clean. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `note-star-b` → motifs/note-star-b.webp (screen)

```text
Generate ONE image with your image generation tool and save it in the current directory as note-star-b.png. The image must be square, 1024x1024 pixels. Do not write any other files.

A small glowing sprite: a pair of beamed eighth music notes formed of starlight, the note heads are two bright ivory star points with soft gold bloom and tiny cross glints, joined by a glowing gold beam, with a thin comet trail of rose and azure sparkles curling away behind them like a shooting star. Centred with generous black margin. Anime film style, magical, clean. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `lightleak-gold` → motifs/lightleak-gold.webp + -768 (screen)

```text
Generate ONE image with your image generation tool and save it in the current directory as lightleak-gold.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A magic-hour light-leak overlay: soft blurry warm light leaking in from the top-right corner and the right edge — warm gold and amber core fading to peach and rose, with a soft diagonal band of light and a faint horizontal anamorphic streak, a few soft out-of-focus round bokeh orbs; the left half of the image fades smoothly to pure black. Like film light leak photographed in golden hour. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `lightleak-rose` → motifs/lightleak-rose.webp + -768 (screen)

```text
Generate ONE image with your image generation tool and save it in the current directory as lightleak-rose.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A twilight light-leak overlay: a soft blurry glow of rose pink and lavender violet entering from the bottom-left corner and a fainter azure glow from the top edge, with soft diagonal light rays, a few soft round bokeh orbs and a gentle haze; the centre and the right side fade smoothly to pure black. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```

#### `lightleak-azure` → motifs/lightleak-azure.webp + -768 (screen)

```text
Generate ONE image with your image generation tool and save it in the current directory as lightleak-azure.png. The image must be landscape, 1536x1024 pixels. Do not write any other files.

A dusk light-leak overlay: a wide soft band of azure and pale ivory light sweeping across the top of the frame like light from a low sun through a lens, with a thin warm gold edge, a long horizontal anamorphic flare streak across the upper third, and soft lens ghosts; the lower two-thirds fade smoothly to pure black. The background must be PURE BLACK (#000000) everywhere outside the light itself, completely flat, no stars, no sky, no gradient, no noise, so the image can be used as an additive light sprite with screen blending. Only glowing light on black. Palette strictly limited to: deep navy, royal blue, azure, ivory, warm gold and amber, with small accents of rose pink, soft magenta-rose and lavender violet. Absolutely NO green and NO teal, cyan-green, mint or turquoise anywhere in the image: where a twilight sky would normally turn teal near the horizon, push that band toward clear azure blue and lavender violet instead. No text, no logos, no watermark.
```
