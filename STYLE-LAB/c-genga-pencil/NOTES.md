# c-genga-pencil - animator's rough key-frame pencils

## What / why
The homepage is a stack of anime production sheets (genga / douga): cream-lilac animation paper, three peg-bar holes at the top, circled frame numbers, tick-mark in-between ladders, X-sheet timing grids, registration crosses. Drawings are rough graphite plus blue and red construction lines with cleaner indigo line on top, faint lilac/peach onion-skin ghosts, soft pastel wash and loose dreamy clouds. Pitch: Daniel is a video editor and engineer, so the site shows "behind the scenes of the frame" - the drawing before it was finished. Soft, bright, not dark, not collage.

## Status
Only 01-hero.png and 02-hero-alt.png were generated. The Codex account hit its usage limit ("try again at 6:05 AM"), so 03-08 are NOT produced; their prompts are in PROMPTS.md, ready to rerun. (Also note: another agent shares scratchpad/p and overwrote 03/04 prompt files there; mine were rewritten in PROMPTS.md.)

## How it moves
- Load: sheet drops onto the peg bar (2-frame settle).
- Title redrawn on threes (line boil, 3 SVG-turbulence variants swapped at 8 fps).
- Handstand: 2-3 key poses (A/B) crossfaded with stepped timing; onion-skin ghosts = the previous pose at 20% opacity.
- Scroll: each section is a sheet; entering sheet flips in with previous sheet ghosted; frame number in the corner counts up with scroll.
- Hover on a card: red construction lines and angle arcs draw in (stroke-dashoffset).
- Clouds drift slowly in stepped 8 fps jumps.

## How to build static
- Background: cream paper texture (CSS gradient + subtle noise PNG), cloud PNG washes as fixed layers.
- Sheet furniture as reusable SVG: peg holes (3 rounded slots), circled number, tick ladder, registration cross.
- Handstand: 3 transparent PNG/SVG poses (line + wash) with blue/red construction as a separate SVG layer toggled on hover.
- Timing sheet for Experience: CSS grid table with bars as positioned divs.
- Fonts: hand-lettered, e.g. Kalam / Patrick Hand; indigo #2e2a6b text.
- Boil: SVG feTurbulence + feDisplacementMap with steps(3) animated seed.

## Assessment
01 is on-brief and very usable (clean title, nav, handstand with onion skin, timing chart). 02 is the stronger concept (golf sequence + tempo 1.7:1 tied to his analyzer), though the sheet is busier.
