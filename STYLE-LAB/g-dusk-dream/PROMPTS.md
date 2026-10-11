# g-dusk-dream prompts

Generation command used for every image (run from this folder, one at a time):

```
printf '%s' "$PROMPT" | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra -i ../_refs/handstand.png -i ../_refs/01-hero-soft-ink.png - 2>&1 | tail -15
```

Shared style clause (in every prompt): original artwork, no green, pastel dreamy hand-drawn anime key-frame look, loose brush ink at strength about 3 of 5, ink lines glowing pale gold and pink with soft bloom, never harsh or neon.

## 01-hero-sunset.png (16:9, done)
Create a 16:9 desktop hero for a portfolio website. Golden-hour sky (peach, butter, cream, lilac clouds), warm sun behind, soft rays, a few starlight streaks top corners. Cloud sea at the bottom. Handstand figure (maroon hoodie, blue jeans, white sneakers) on the clouds at the right third, rim-lit with gold ink. Open sky on the left. Hand-lettered navy 'Daniel Azran', 'Engineer / ML / Video editor', nav 'Work', 'About', 'Contact'. Refs: 01-hero-soft-ink (atmosphere, lettering), handstand (figure).

## 02-projects-twilight.png (16:9, done)
Lilac twilight, first stars. Heading 'Projects'. 2x2 cream-glass cards with glowing pale-gold borders: golf swing analyzer (glowing pose nodes, angle arcs, 'tempo 1.7:1'), optical flow tracker (glowing flow arrows over clouds), MNIST digit classifier (digit grid, one glowing '7'), real estate price predictor (glowing rising line, small lit house).

## 03-experience-night.png (16:9, done)
Full night, navy with pastel stars and streaks, lilac horizon glow. Heading 'Experience' in pale gold-cream ink. Vertical timeline of three glowing dots: 'Full-stack engineer', 'ML / data science', 'Video editor'. Right: floating cream-glass video reel frame with a hand-drawn montage still, play glyph, scrubber with glowing playhead.

## 04-contact-stars.png (16:9, done)
Starry pastel night over a cloud sea. Heading 'Let us talk' in glowing cream-gold. Three pill buttons 'Email', 'LinkedIn', 'GitHub'. Small gold-line handstand silhouette bottom right looking up.

## 05-full-page.png (about 2:5 portrait, done)
One continuous tall homepage, sky moving sunset to night as you scroll. Four bands of about 25% each: hero (sunset, name, nav), Projects (twilight, 2x2 cards), Experience (night, timeline, film strip), Contact (starry night, pills). Smooth gradient between bands, no seams. Text spelled exactly as in 01-04.

## 06-mobile.png (9:19.5 portrait, NOT GENERATED)
Status: blocked. Codex returned "usage limit", retry after 6:05 AM. Intended prompt: phone hero mockup, portrait 9:19.5. Golden-hour clouds at top fading to lilac with a few stars at the bottom. Nav row with menu icon top right. Handstand figure mid-upper, gold rim light. 'Daniel Azran' large in navy, 'Engineer / ML / Video editor' smaller, rounded cream-glass button 'See my work' near the bottom. Generous margins for text.

## 07-style-sheet.png (NOT GENERATED)
Status: not attempted (same usage limit). Intended prompt: style sheet, palette ramp from golden hour (peach, butter, cream) through lilac twilight to soft navy night, with labeled swatches and glowing ink line samples at strength 1 to 5, plus a row of pale gold and pink glow samples. Original artwork, no green.
