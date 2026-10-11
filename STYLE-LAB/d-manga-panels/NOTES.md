# D: Manga panels (pastel manga page)

**What:** The homepage as a pastel manga page. Slanted gutters, panels that break their borders, screentone-dot cloud shading, hand-lettered SFX (FWOOP, FWOOSH, SWISH, CLICK, ZIP), speech/thought bubbles as nav and annotations, emphasis lines. Palette lilac/peach/sky/butter/pink on cream. Ink about 3-4 on the ladder.

**Why:** Scrolling = reading a page. It makes the golf swing, handstand and edit-reel feel like sakuga key moments, and panels give natural slots for projects and jobs. Clouds are the gutter.

**Files:** 01 hero splash, 02 four-panel opening, 03 tall chapter page, 04 projects, 05 experience, 06 mobile webtoon, 07 motion storyboard, 08 style sheet.

**How it moves:** panels slide in diagonally on scroll; borders draw themselves with line boil (redraw on twos, 12fps); SFX stamp in with a 2-frame shake; emphasis lines burst (swap 2-3 SVG variants on twos); bubbles pop with overshoot; cloud layers parallax in gutters. Mobile: vertical webtoon, one panel per viewport, gutters = cloud bands.

**How to build static:**
- Layout: CSS grid with `clip-path: polygon()` for slanted panels; negative margins / `overflow: visible` on the figure image so legs break the border.
- Screentone: CSS `radial-gradient` dot pattern + `mask-image` of a cloud SVG, `mix-blend-mode: multiply`.
- SFX/title: SVG text or pre-drawn PNG frames (3 variants swapped via `steps()` animation) for line boil; `feTurbulence`+`feDisplacementMap` re-seeded every 83ms for borders.
- Bubbles: SVG paths, nav = bubble links. Respect `prefers-reduced-motion`.
- Art: handstand and golf panels come from the real photos redrawn in ink; the generated mockups are placeholders for key art.

**Caveats:** the character in the generated art drifts between panels (the 06/03 faces are generic anime, not Daniel); some panels (03 bottom, 06 middle) are filler scenes. 04 has an extra "Motion Studies" panel.
