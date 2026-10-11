# g-dusk-dream: pastel dusk into night

## What it is
A nod to Daniel's old nebula page. The homepage is one sky that goes from golden-hour sunset to lilac twilight to soft navy night as you scroll. The ink is loose and soft (about strength 3 of 5). Ink lines glow pale gold and pink, and the emphasis lines become starlight streaks. Pastel and dreamy throughout, never neon or harsh.

Palette (day to night ramp): cream and butter, peach, lilac, periwinkle, dusty navy. No green.

## How it moves
- Hero: golden hour. The handstand figure sits in warm rays and the sun glows behind him.
- Projects: lilac twilight with the first stars. Cards glow at their edges.
- Experience: full night. Starry sky, timeline dots, and a floating video reel with a glowing playhead.
- Contact: starry pastel night over a cloud sea.
- The scroll is the sunset. Each section sits one step further toward night.
- Planned motion (not built): stars twinkle on twos, streaks fire once per section, ink glow pulses slowly, a hand-drawn line boil on headings.

## How to build it
- Static: stack the four sections as backgrounds. Each section gets a gradient from its band color to the next. Ink lines get a `filter: drop-shadow` glow in pale gold.
- Stars: a few absolutely positioned `<span>`s with a small CSS twinkle keyframe, stepped on twos.
- Cards: cream glass (`backdrop-filter: blur`), pale gold border with a soft outer glow.
- Mobile: one column, the hero figure shrinks to the lower half, nav collapses into a menu icon.
- Keep the figure and the reel as images. Use the same ink treatment in both.

## Status
01 to 05 are generated. 06 (mobile) and 07 (style sheet) are blocked by a Codex usage limit (retry after 6:05 AM). See PROMPTS.md.
