# E — Edit-grade: "COD edit / Beautiful World, made dreamy"

## What
The homepage as a frame from a colour-graded edit: washed teal shadows, cream highlights, pink/lilac accents, bloom, light leaks, film burn, chromatic offsets and motion-smear. Titles are scratchy hand-written white lettering that boils. UI chrome borrows from an NLE: timecode, REC dot, keyframe diamonds, a timeline scrubber, letterbox bars. Projects are "clips", experience is a timeline, the video-editor reel is a big letterboxed moment.

## Why
Daniel grew up making COD edits and loves the Beautiful World edit. This direction makes the site itself show editing taste, which is the single skill no other direction proves. The pastel grade keeps it in the cloud world (not dark/gritty) and the sunset handstand gets re-graded rather than replaced.

## How it moves
- Section changes: 2-3 frame white flash, then settle (no easing, hard cuts).
- Scroll: small camera shake plus horizontal smear on fast scroll velocity.
- Titles: line boil, redrawn on threes (about 8 fps swap between 3-4 jitter variants).
- Hover on clips: scrub preview, chromatic split for 2 frames.
- Timecode ticks with scroll position; letterbox bars slide in on the reel.

## Static build notes
- Grade: CSS `filter: saturate(.85) contrast(1.05) brightness(1.05) hue-rotate(-10deg)` on the hero image plus overlay layers: `mix-blend-mode: soft-light` teal (#7fc4c4) gradient, `screen` cream/pink radial gradient for the leak, `mix-blend-mode: overlay` lilac. An SVG `feColorMatrix`/`feComponentTransfer` (table values) gives a real LUT-like curve.
- Bloom: duplicate the image, `filter: blur(18px) brightness(1.3)`, `mix-blend-mode: screen`, opacity .35.
- Chromatic offset: 3 stacked copies with `mix-blend-mode: screen`, R/B channels isolated by feColorMatrix, translated +-2px (animate on hover/flash).
- Grain/dust: pre-rendered PNG tile, `steps(4)` background-position jitter. Film burn: a few transparent PNG/WebP edge overlays swapped per section.
- Boil lettering: generate 3-4 hand-lettered SVG/PNG variants of each title (or an SVG `feTurbulence` + `feDisplacementMap` with `seed` stepped by JS every ~120ms); use `animation-timing-function: steps()`.
- Flash frames: fixed full-screen `#fff` div, opacity keyframes 0>.9>0 over ~160ms, triggered by IntersectionObserver.
- Smear: `transform: skewX()` + `filter: blur()` driven by scroll velocity, clamped.
- Letterbox: two fixed black/ink bars with height tied to section progress; keep pastel by making them deep periwinkle instead of pure black.
- Canvas option: one WebGL/2D canvas for hero grade (RGB split, grain, leak) at low res scaled up; respect `prefers-reduced-motion` (freeze boil, no flashes).

## Risks
Flash frames and shake need a reduced-motion fallback (photosensitivity). Legibility of white scratchy type on bright cream skies: keep a soft teal shadow behind it.

## Status
7 of 8 mockups generated. `07-motion-storyboard.png` NOT generated: Codex hit its usage limit (resets ~6:05 AM). Prompt is ready in `p/07-motion-storyboard.txt`; rerun with `./run.sh p/07-motion-storyboard.txt` from this folder. Motion behaviour is described in "How it moves" above.
