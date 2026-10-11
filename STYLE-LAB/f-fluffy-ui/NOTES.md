# f-fluffy-ui: clean, product-like cloud UI with small ink accents

## What it is
The most usable direction in the lab. Milky ivory space, with UI elements (nav pill, buttons, project cards, tags, tab bar) built from soft cloud material with feathered edges and thin indigo hairlines. Ink is kept small (strength 2 to 3): a hand-drawn underline under the name and active nav item, doodled arrows toward CTAs, a few radiating dashes near the handstand figure. Type is crisp sans-serif in deep indigo, so it reads first and the clouds sit behind it.

## Mockups
- 01-hero.png (16:9): name, subtitle, nav pill, CTA cloud button, handstand figure on a cloud.
- 02-projects.png (16:9): "Selected work" 2x2 grid of cloud cards, golf pose dots with "tempo 1.7:1", optical flow, digits, price chart.
- 03-experience.png (16:9): timeline on the left, video editing reel card, stack tags, motion card.
- 04-mobile-hero.png (9:19.5): phone hero with bottom cloud tab bar and hamburger.
- 05-mobile-projects.png (9:19.5): phone project list with filter chips and stacked cards.
- 06-full-page.png (about 1:2.6): full homepage, hero to contact footer.
- 07-components.png: produced in round 2 after the quota reset (hover labels say "Button", not CTA text).

## How it moves
Calm, not framey. Suggested motion for a live build:
- Cloud material breathes slowly (feathered edge drifts by a few px over 6 to 8 s).
- Hover on a card: cloud lifts a few px, the ink hairline thickens, and a 2 to 3 dash ink burst appears in a corner.
- Nav underline draws in with a short ink stroke on route change.
- Hero handstand figure does one small hand-drawn "boil" every few seconds, then holds still.

## How to build it
- Tokens: ivory #FBF6F0, lilac, periwinkle, peach as soft fills; deep indigo for type and ink; no green.
- Cards: rounded cloud shape (or radius plus an SVG feathered mask), 1px indigo hairline at 30 to 40% opacity, inner soft glow.
- Ink accents: small SVG strokes with a rough-edge filter at stroke-width 1.5 to 2.5 px.
- Mobile: 16px gutter, single column, bottom cloud tab bar, filter chips in a horizontal row.

## Known issues (honest)
- Hero figure is a generated illustration, not the real handstand reference, and it is a bit more painterly than the rest of the UI.
- Video reel is a generic sunset montage placeholder. It does not use Daniel's real gaming montage GIF.
- Full-page captions ("Turning real-world data...") and the About paragraph are invented filler.
- Type is generic sans, not a brand font.

## Round 2: Cotton Sky with elemental water
A blend of this folder's cloud-UI system with the Cotton Sky direction. The sky is fluffy cotton cloud in powder blue, azure and ivory, with a restrained gold glow. Stylized water ribbons (curling S-curves, white foam bands, tapering ends, sakuga-like "water breathing" anime water) swirl around the handstand figure and dissolve into cloud mist. UI stays cloud-material with feathered edges and thin indigo hairlines, and the ink accents are gold-tinged underlines and blue dashes. Palette is blue, azure, ivory and gold, with no pink and no green. 2x-water-hero.png is the homepage hero with the handstand on a water crest and a small golf tempo card. 2x-water-projects.png is the projects page with the golf swing analyzer feature card (pose nodes, a 37 degree angle arc, a stats table) and three smaller project cards. Motion, per the coordination brief: big water currents move smoothly, and the foam and outline detail change on a slower replacement cadence. 07-components.png was regenerated in round 2 after the Codex quota reset (its hover labels say "Button" rather than the CTA text).
