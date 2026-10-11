# b-sakuga-impact: bold impact frames on airy white/pastel

STATUS: only 2 of the 9 requested mockups were generated (01-hero, 02-hero-alt) plus one accidental hero variant (01b). Codex hit its usage limit ("try again at 6:05 AM"). Re-run the prepared prompts in PROMPTS.md after that.

## What it is
Anime climax ("sakuga impact frame") language applied to a portfolio: mostly white page, flat pastel cel fills (lilac, peach, sky, butter, pink), loose tapering brush ink, dry-brush hatching, dense radiating emphasis lines, clouds as inked cel shapes. Looser than the oikawa reference: scratchy brush rather than clean outlines.

## Why it fits
Keeps Daniel's dreamy cloud palette but gives the hero the punch of the key-frame he likes. Each section can be one "impact frame" (a held drawing with a burst behind it) with white gaps between, so text stays readable.

## How it moves
- Line boil: 3 to 4 hand-drawn variants of the emphasis-line layer and title lettering, swapped on threes (about 8 fps) with steps().
- Entry: hero starts as a white flash plus black smear frame, 2 frames of speed lines, then the held drawing.
- Emphasis lines flash (opacity pulse, 2 frames) on hover or when a section scrolls in; clouds drift slowly on twos.
- Section changes: a diagonal ink-slash wipe (clip-path) across 3 frames.
- prefers-reduced-motion: show the first held frame only.

## Static-site build
- Layers as transparent PNG/WebP or SVG: background cloud cel, figure, emphasis lines (3 to 4 variants), title lettering (3 variants).
- CSS sprite or stacked img elements toggled by a JS timer at 8 fps (or CSS animation: steps(4)); IntersectionObserver for section impact flashes.
- Brush lettering for headings (Caveat Brush or similar webfont), small handwritten caps for nav and subtitle. Body text stays plain on white.
- Cards as slightly rotated clip-path polygons with a loose SVG ink border (feTurbulence displacement for boil).

## Assessment
Heroes work well and are clearly more brush-like than the reference, but 01 is close to 02-hero-strong-ink (only slightly looser). Faces on 02-hero-alt are anime-ish; golfer is stylised, not a likeness.
