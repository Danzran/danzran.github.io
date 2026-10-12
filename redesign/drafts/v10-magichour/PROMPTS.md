# v10 Magic hour: Codex asset prompts

Generated 2026-10-12 with `codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra -` (prompt on stdin), one image per run, run in parallel from a scratch folder. Converted to webp with `Pillow`/`cv2` (Windows Python). Every image was checked for green/teal, text and watermarks before use.

## Used
| file | source | processing |
|---|---|---|
| assets/sky-gold.webp | sky-b | resized to 1920w. Hero / golden-hour plate. |
| assets/sky-dusk.webp | sky-d | resized. Afterglow plate (middle of the page). |
| assets/sky-night.webp | sky-e | its two baked shooting stars painted out (Hough line detection + cv2 inpaint), resized. Night plate (About/Contact). |
| assets/cloud-1/2/3.webp | cloud-b, cloud-c, cloud-d | black keyed to alpha (max-channel, gamma .8, unpremultiplied, 1.2px feather), cropped. Drifting cumulus, re-lit in canvas. |
| assets/comet-head.webp | comet-a | resized, kept on black for additive blending. Comet and split heads. |
| assets/note-star.webp | note-a | cropped, on black, additive. The song easter-egg star. |
| assets/leak.webp | leak-a | resized, on black; drawn flipped, additive, on the hero only. |
| assets/cord.webp | cord-a | black keyed to alpha, cropped. The red braided cord divider. |

## Generated, not used
- sky-a, sky-c: golden skies; sky-c has a baked comet streak that would fight the live comet.
- cloud-a: a fourth cumulus; three sprites were enough.
- cord-b: straight braid without a knot; cord-a's knot reads better as a divider.
- comet-b: a split-comet V; the live split is drawn procedurally so it can follow the scroll.

## Prompts (verbatim)

### cloud-a

```
Wide landscape 3:2 image. Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no text, no logo, no signature, no watermark, no recognizable film scene). Palette strictly navy, blue, azure, lavender, violet, rose, peach, gold and ivory. Absolutely no green and no teal anywhere, not even in the gradient between blue and gold: the sky passes from blue through lavender and rose into gold. Subject: ONE single isolated big cumulus cloud, billowing towers and a flatter base, painted in that luminous anime background style, lit neutral ivory-white from the upper left with crisp bright rim edges and soft cool grey-lavender shaded underside. Pure flat black background (#000000) everywhere else. The cloud is centered and does not touch the image edges; generous black margin on all sides. No stars, no other objects. Generate ONE image with your image generation tool and save it in the current directory as cloud-a.png. Do not write any other files.
```

### cloud-b

```
Wide landscape 3:2 image. Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no text, no logo, no signature, no watermark, no recognizable film scene). Palette strictly navy, blue, azure, lavender, violet, rose, peach, gold and ivory. Absolutely no green and no teal anywhere, not even in the gradient between blue and gold: the sky passes from blue through lavender and rose into gold. Subject: ONE single isolated big cumulus cloud, billowing towers and a flatter base, painted in that luminous anime background style, lit neutral ivory-white from the upper left with crisp bright rim edges and soft cool grey-lavender shaded underside. Pure flat black background (#000000) everywhere else. The cloud is centered and does not touch the image edges; generous black margin on all sides. No stars, no other objects. Make this one a long low horizontal bank of several merged cumulus puffs, wider than tall. Generate ONE image with your image generation tool and save it in the current directory as cloud-b.png. Do not write any other files.
```

### cloud-c

```
Square image. Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no text, no logo, no signature, no watermark, no recognizable film scene). Palette strictly navy, blue, azure, lavender, violet, rose, peach, gold and ivory. Absolutely no green and no teal anywhere, not even in the gradient between blue and gold: the sky passes from blue through lavender and rose into gold. Subject: ONE single isolated big cumulus cloud, billowing towers and a flatter base, painted in that luminous anime background style, lit neutral ivory-white from the upper left with crisp bright rim edges and soft cool grey-lavender shaded underside. Pure flat black background (#000000) everywhere else. The cloud is centered and does not touch the image edges; generous black margin on all sides. No stars, no other objects. Make this one a tall towering cumulus with two big rounded heads. Generate ONE image with your image generation tool and save it in the current directory as cloud-c.png. Do not write any other files.
```

### cloud-d

```
Wide landscape 3:2 image. Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no text, no logo, no signature, no watermark, no recognizable film scene). Palette strictly navy, blue, azure, lavender, violet, rose, peach, gold and ivory. Absolutely no green and no teal anywhere, not even in the gradient between colours. Subject: ONE isolated wide drifting cumulus cloud with several rounded heads and soft wispy edges, painted in that luminous anime background style, lit neutral ivory-white from above with crisp bright rims and soft cool lavender-grey shaded underside. Pure flat black background (#000000) everywhere else. Centered, generous black margin, does not touch the edges. No stars, no other objects. Generate ONE image with your image generation tool and save it in the current directory as cloud-d.png. Do not write any other files.
```

### comet-a

```
Wide landscape 3:2 image, for additive (screen) blending. Pure flat black background. Subject: a single bright comet head with a lens flare, centered: an intensely bright white-ivory core, a soft azure and rose glow halo around it, a thin horizontal anamorphic lens-flare streak through it, a few tiny four-point sparkles, and a short luminous tail fading out to the left in azure and rose. Painted anime-film light effect style. No green, no teal, no text, no planets, no stars field. Generate ONE image with your image generation tool and save it in the current directory as comet-a.png. Do not write any other files.
```

### comet-b

```
Wide landscape 3:2 image, for additive (screen) blending. Pure flat black background. Subject: a comet splitting in two: one bright ivory-white comet head on the left side, and from it two long glowing shooting-star trails diverge to the right in a narrow V, each ending in its own small bright head, trails in azure, lavender and rose with fine sparkle dust. Painted anime-film light effect style. No green, no teal, no text, no planets, no star field. Generate ONE image with your image generation tool and save it in the current directory as comet-b.png. Do not write any other files.
```

### cord-a

```
Wide landscape 3:1 image on a pure flat black background (#000000). Subject: a thin red Japanese kumihimo braided silk cord laid perfectly straight and horizontal across the middle of the image, from near the left edge to near the right edge, with a small neat flat knot in the exact centre. Tight braided pattern of crimson and scarlet threads with a few fine gold threads, soft warm sheen highlights, crisp detail. The cord is thin, about 1/20 of the image height. Both ends taper into small frayed tassels. No other objects, no text, no shadow on the background, no green. Generate ONE image with your image generation tool and save it in the current directory as cord-a.png. Do not write any other files.
```

### cord-b

```
Wide landscape 3:1 image on a pure flat black background (#000000). Subject: a thin red braided silk cord (kumihimo style) running straight and horizontal edge to edge through the middle of the image, no knot. Tight diagonal braid of crimson, scarlet and rose threads with fine gold threads woven in, glossy silk sheen. Thickness about 1/24 of the image height. No other objects, no text, no green. Generate ONE image with your image generation tool and save it in the current directory as cord-b.png. Do not write any other files.
```

### leak-a

```
Wide landscape 16:9 image on a pure flat black background, for additive (screen) blending over a website. Subject: warm film light leaks and lens flare: soft blooms of gold, peach and rose entering from the left edge and the top-left corner, a row of faint hexagonal lens-flare ghosts running diagonally to the lower right, a few tiny sparkles. Most of the right half stays black. No green, no teal, no text, no objects. Generate ONE image with your image generation tool and save it in the current directory as leak-a.png. Do not write any other files.
```

### note-a

```
Square image on a pure flat black background, for additive blending. Subject: a small falling shooting star whose glowing head is a delicate eighth-note music symbol made of light, in gold and ivory with a soft rose glow, trailing a short sparkling tail of tiny stars to the upper left. Painted anime-film light effect style, soft bloom. Centered with black margin. No letters, no text, no green, no teal. Generate ONE image with your image generation tool and save it in the current directory as note-a.png. Do not write any other files.
```

### sky-a

```
Wide landscape 16:9 image. Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no text, no logo, no signature, no watermark, no recognizable film scene). Palette strictly navy, blue, azure, lavender, violet, rose, peach, gold and ivory. Absolutely no green and no teal anywhere, not even in the gradient between blue and gold: the sky passes from blue through lavender and rose into gold. Subject: a magic-hour golden sunset sky, nothing but sky. Deep azure-blue at the very top melting through soft lavender and rose into warm glowing gold toward the bottom. Huge towering cumulus clouds in the middle and right, lit from below by a low sun: blazing gold and peach rims, rose and violet shaded undersides, crisp bright highlight edges, fine painted detail. The sun sits just below the bottom-left edge with a soft lens flare, light rays and a warm light leak. Two or three faint early stars in the upper blue. No ground, no horizon objects, no buildings, no trees, no water, no birds. Generate ONE image with your image generation tool and save it in the current directory as sky-a.png. Do not write any other files.
```

### sky-b

```
Wide landscape 16:9 image. Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no text, no logo, no signature, no watermark, no recognizable film scene). Palette strictly navy, blue, azure, lavender, violet, rose, peach, gold and ivory. Absolutely no green and no teal anywhere, not even in the gradient between blue and gold: the sky passes from blue through lavender and rose into gold. Subject: twilight sky at the exact moment of sunset (magic hour), nothing but sky and one thin dark indigo horizon line at the very bottom. Top third deep blue with a few stars, middle lavender-violet, lower third rose then molten gold at the horizon. A long range of big lit cumulus clouds drifting across the middle, their sun-facing edges glowing gold and ivory, shadows violet. Sun just set at the bottom centre-left, a bright gold glow and soft anamorphic lens flare streak. Very luminous, high detail, cinematic. Generate ONE image with your image generation tool and save it in the current directory as sky-b.png. Do not write any other files.
```

### sky-c

```
Wide landscape 16:9 image. Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no text, no logo, no signature, no watermark, no recognizable film scene). Palette strictly navy, blue, azure, lavender, violet, rose, peach, gold and ivory. Absolutely no green and no teal anywhere, not even in the gradient between blue and gold: the sky passes from blue through lavender and rose into gold. Subject: a high-altitude magic-hour sky looking up: an enormous cumulonimbus tower on the right lit gold and rose by the setting sun, smaller cumulus puffs drifting on the left, a faint thin streak of a comet high in the upper-left blue. Gradient from deep azure at top through lavender and rose to gold at the bottom. Sparkling light, lens flare dots. No ground at all. Generate ONE image with your image generation tool and save it in the current directory as sky-c.png. Do not write any other files.
```

### sky-d

```
Wide landscape 16:9 image. Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no text, no logo, no signature, no watermark, no recognizable film scene). Palette strictly navy, blue, azure, lavender, violet, rose, peach, gold and ivory. Absolutely no green and no teal anywhere, not even in the gradient between colours. Subject: the same kind of sky about twenty minutes after sunset: afterglow. Nothing but sky and one thin dark navy horizon line at the very bottom. Top half deep indigo-violet with many small stars appearing, middle soft violet and mauve, lower quarter warm rose fading into a thin band of dim gold at the horizon. Big cumulus clouds across the middle, now lit only from beneath by rose and coral light, their tops cool violet-blue. A faint thin shooting star high up. Calm, luminous, high detail. Generate ONE image with your image generation tool and save it in the current directory as sky-d.png. Do not write any other files.
```

### sky-e

```
Wide landscape 16:9 image. Painted Japanese animated-film background art in the luminous Makoto Shinkai style (style inspiration only: no characters, no people, no text, no logo, no signature, no watermark, no recognizable film scene). Palette strictly navy, blue, azure, lavender, violet, rose, peach, gold and ivory. Absolutely no green and no teal anywhere, not even in the gradient between colours. Subject: clear deep night sky after dusk, nothing but sky and one thin black-navy horizon line at the very bottom. Deep navy and ultramarine blue with a dense field of fine sparkling stars and a soft band of the milky way in pale lavender, ivory and faint rose (no green, no teal, no cyan). A few low cumulus clouds near the bottom, silver-blue lit by moonlight with faint violet shadows, and the last faint violet glow along the horizon. Two thin shooting stars streak down from the upper right. Luminous, high detail. Generate ONE image with your image generation tool and save it in the current directory as sky-e.png. Do not write any other files.
```
