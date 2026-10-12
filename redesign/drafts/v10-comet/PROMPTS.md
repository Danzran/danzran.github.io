# v10 Comet: Codex asset prompts (2026-10-12)

Generated with `cat prompt.txt | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra -`, one image per run, 9 runs in parallel.
Each prompt ended with: "Generate ONE image with your image generation tool and save it in the current directory as NAME.png. Do not write any other files."

| run | used as | notes |
|---|---|---|
| sky-a | `assets/sky-twilight.webp` (hero plate, 2000w) | picked: open upper-left sky for the comet, cumulus on the right behind the figure, mirror water; horizon at 69% |
| sky-b, sky-c | not used | b: fewer stars; c: darker, gold less luminous |
| night-a | `assets/sky-night.webp` (fixed night sky below the hero) | picked: softer Milky Way |
| night-b | not used | busier, warmer core |
| comet-a | `assets/comet-head.webp` (head sprite) | black keyed to alpha (alpha = brightest channel) so it screens on its own canvas |
| comet-b | `assets/comet-split.webp` (split flash) | gold + violet fragments; same keying |
| flare-a | `assets/flare.webp` (star/head flare, tinted gold/violet in code) | same keying |
| flare-b | not used | the shooting stars are drawn procedurally instead |

All picks were checked by eye: no green, no teal, no text or watermark.

## sky-a

```
Wide 16:9 anime background painting in the luminous style of Makoto Shinkai films (original scene, no characters, no text, no logo). Blue hour just after sunset: a deep navy-to-azure sky that grades down to a thin band of warm gold and peach light right at the horizon, with soft rose and violet tints in the mid sky. Enormous towering cumulus clouds rim-lit gold on their sunset side and cool periwinkle-blue in shadow. The first stars are coming out in the upper sky. The lower 35% of the frame is perfectly still water, a glassy flooded plain or calm lake, that mirrors the sky and clouds like a mirror, with a very low distant dark-blue silhouette of hills on the horizon line. Leave the upper-left third of the sky fairly open (stars and soft gradient) for a comet to be drawn later; do not paint any comet or meteor. Painterly, crisp light, gentle lens bloom and light leak glow near the horizon. Palette strictly navy, blue, azure, ivory, gold, with small rose/violet accents. Absolutely no green, no teal, no cyan-green, no trees or grass, no people, no buildings with signs, no text, no watermark.
```

## sky-b

```
Wide 16:9 anime background painting in the luminous style of Makoto Shinkai films (original scene, no characters, no text, no logo). Blue hour just after sunset: a deep navy-to-azure sky that grades down to a thin band of warm gold and peach light right at the horizon, with soft rose and violet tints in the mid sky. Enormous towering cumulus clouds rim-lit gold on their sunset side and cool periwinkle-blue in shadow. The first stars are coming out in the upper sky. The lower 35% of the frame is perfectly still water, a glassy flooded plain or calm lake, that mirrors the sky and clouds like a mirror, with a very low distant dark-blue silhouette of hills on the horizon line. Leave the upper-left third of the sky fairly open (stars and soft gradient) for a comet to be drawn later; do not paint any comet or meteor. Painterly, crisp light, gentle lens bloom and light leak glow near the horizon. Palette strictly navy, blue, azure, ivory, gold, with small rose/violet accents. Absolutely no green, no teal, no cyan-green, no trees or grass, no people, no buildings with signs, no text, no watermark. Variation: the horizon gold is a little brighter and the clouds sit more to the right side of the frame, the water has faint concentric ripples far away.
```

## sky-c

```
Wide 16:9 anime background painting in the luminous style of Makoto Shinkai films (original scene, no characters, no text, no logo). Blue hour just after sunset: a deep navy-to-azure sky that grades down to a thin band of warm gold and peach light right at the horizon, with soft rose and violet tints in the mid sky. Enormous towering cumulus clouds rim-lit gold on their sunset side and cool periwinkle-blue in shadow. The first stars are coming out in the upper sky. The lower 35% of the frame is perfectly still water, a glassy flooded plain or calm lake, that mirrors the sky and clouds like a mirror, with a very low distant dark-blue silhouette of hills on the horizon line. Leave the upper-left third of the sky fairly open (stars and soft gradient) for a comet to be drawn later; do not paint any comet or meteor. Painterly, crisp light, gentle lens bloom and light leak glow near the horizon. Palette strictly navy, blue, azure, ivory, gold, with small rose/violet accents. Absolutely no green, no teal, no cyan-green, no trees or grass, no people, no buildings with signs, no text, no watermark. Variation: a slightly later moment, more stars, the gold at the horizon is a thin ember line, the clouds are lower and more spread out, with a soft violet glow behind them.
```

## night-a

```
Wide 16:9 anime background painting, Makoto Shinkai style (original, no characters, no text): a deep blue-hour night sky only, no ground, no horizon. Rich navy at the top grading to deep royal blue below, a faint band of the Milky Way crossing diagonally with soft violet and rose dust, thousands of fine stars of different sizes, a few brighter twinkling stars with tiny cross flares, and a few thin wisps of high cloud lit faintly by moonlight in periwinkle. Calm, luminous, crisp. Palette navy, blue, azure, ivory, gold with small rose/violet accents. Absolutely no green, no teal, no comet, no meteor, no text, no watermark.
```

## night-b

```
Wide 16:9 anime background painting, Makoto Shinkai style (original, no characters, no text): a deep blue-hour night sky only, no ground, no horizon. Rich navy at the top grading to deep royal blue below, a faint band of the Milky Way crossing diagonally with soft violet and rose dust, thousands of fine stars of different sizes, a few brighter twinkling stars with tiny cross flares, and a few thin wisps of high cloud lit faintly by moonlight in periwinkle. Calm, luminous, crisp. Palette navy, blue, azure, ivory, gold with small rose/violet accents. Absolutely no green, no teal, no comet, no meteor, no text, no watermark. Variation: slightly brighter, the Milky Way runs from the lower left to the upper right with a little warm gold dust near its core.
```

## comet-a

```
A single bright comet head isolated on a pure black background (#000000), for additive blending in a web page. Anime / Makoto Shinkai style: a brilliant ivory-white nucleus with a soft gold and pale azure coma, short glowing tail streaming toward the upper-left, subtle prismatic lens-flare spikes and a few tiny sparkles. Centered nucleus, generous black margins all around, nothing touches the edges. Square image. No green, no teal, no text, no watermark, no background stars.
```

## comet-b

```
A single bright comet head isolated on a pure black background (#000000), for additive blending in a web page. Anime / Makoto Shinkai style: a brilliant ivory-white nucleus with a soft gold and pale azure coma, short glowing tail streaming toward the upper-left, subtle prismatic lens-flare spikes and a few tiny sparkles. Centered nucleus, generous black margins all around, nothing touches the edges. Square image. No green, no teal, no text, no watermark, no background stars. Variation: the head is splitting into two fragments, one gold and one pale blue-violet, each with its own short glowing tail, slightly diverging.
```

## flare-a

```
A single anime-style star sparkle / lens flare isolated on a pure black background (#000000), for additive blending: a tiny intense ivory-white core, four long thin crisp diffraction spikes plus four shorter diagonal ones, a soft warm gold halo and a faint rose-violet outer ring, like a twinkling star in a Makoto Shinkai night sky. Centered, square image, generous black margins, nothing touches the edges. No green, no teal, no text, no watermark.
```

## flare-b

```
A short anime shooting star isolated on a pure black background (#000000), for additive blending: a bright ivory-gold head with a small sparkle, and a long thin glowing tail that fades smoothly to nothing, running diagonally from the lower-right head to the upper-left. Makoto Shinkai style luminous light. Wide 2:1 image, generous black margins. No green, no teal, no text, no watermark.
```

