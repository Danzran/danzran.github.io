# A - Cloud world, soft indigo ink (ladder 2-3)

## What it is
A hand-painted watercolor/gouache sky you sink into: towering cumulus in lilac, periwinkle, peach, butter and cream, lit from a low golden sun. Linework is deep indigo/plum, never black, light-to-medium weight, with dry-brush hatching only in cloud and fabric shadows. Emphasis lines (the sakuga burst) become soft rays of coloured light fanning from behind the handstand figure. Type is a loose indigo brush hand. UI is frosted cloud cards with thin indigo borders and pill chips.

## Why it fits Daniel
It extends the existing cloud-dream/handstand work he already likes, keeps the figure as the emotional anchor, and gives the project panels (golf pose nodes, flow arrows, softmax bars) a calm, readable home. The ink is soft enough to avoid the "sharp and rigid" problem he flagged. The reel frame stays prominent (05).

## How it moves
- Load: cloud layers drift in from the sides and fade up (3-4 parallax layers, very slow, 20-60 s loops).
- Title and nav redraw on twos/threes: 3-4 pre-rendered jittered variants of the lettering (SVG filters or sprite swaps) cycling at ~8-12 fps; boil amplitude 1-2 px.
- Handstand figure: 3-frame wobble on threes (tiny rotation +-1.5 deg and 2 px drift), floats up on load.
- Rays: a conic/radial-gradient ray layer rotating ~1 deg per 10 s, opacity pulsing; on hover over a project card, a brighter ray burst appears behind it.
- Scroll: camera "sinks" - foreground clouds slide sideways and scale, sky gradient shifts periwinkle -> peach -> lilac dusk; cards rise out of the cloud line (IntersectionObserver + translateY/opacity).
- prefers-reduced-motion: freeze boil and drift.

## Building on static GitHub Pages
- Layered transparent WebP/PNG cloud strips (4-5 layers) painted or extracted from the mockups, stacked with CSS `position: fixed/absolute` and `transform: translate3d` driven by one rAF scroll handler.
- Handstand as a cut-out PNG/WebP with 3 slightly redrawn frames swapped via CSS `steps()` animation.
- Brush title as an SVG or webfont (Patrick Hand/Caveat-like) plus 3 variant copies with `feTurbulence + feDisplacementMap` at different seeds, stepped with `steps(1)` keyframes.
- Rays: CSS `repeating-conic-gradient` with a mask, `mix-blend-mode: screen`.
- Cards: `backdrop-filter: blur()` frosted panels. No build step or framework needed; one HTML, one CSS, one small JS file.
- Risk: painted full-bleed backgrounds are heavy; slice into tiles, use WebP, lazy-load below the fold.

## Honest caveats
- Generated images contain some small landscape elements (cliffs, tiny trees with a little green, villages) in 03/04 - dial back or repaint to keep the no-green rule strict.
- Body text in 03 is plausible placeholder copy (company names and dates are invented); do not treat as content.
- 08-style-sheet.png generated in round 2.

## Round 2: Cotton Sky + elemental water (21-23)
Same soft-ink cloud world, re-graded to powder blue, azure, ivory and restrained gold (almost no pink), with broad sakuga-style water ribbons curling in S-curves around the handstand figure, white foam bands, and foam dissolving into cloud mist. 21 is the hero (figure standing in a wet-sand shallows with ribbons spiralling up behind), 22 a golf-analyzer-led projects section (pose nodes, 92/147 deg arcs, club speed/hip rotation/tempo 1.7:1 panel plus three cards), 23 a full-page scroll where a water river winds down through the cloud islands. Build: the ribbons are separate transparent layers moving smoothly (slow translate/rotate); foam, lettering and outlines swap on a slower 3-4 frame cadence (steps() sprites or displacement-filter seeds). Caveats: 23 has invented copy and tiny moss/shrubs on rocks (slight green risk), and its golfer is a generic blue-shirt figure rather than Daniel; 22's golfer is closer to his reference but wears a teal beanie. Serif headings in 22/23 differ from the brush hand of 21, so type needs a decision.
