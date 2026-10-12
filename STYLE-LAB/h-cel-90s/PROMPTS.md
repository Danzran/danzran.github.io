# PROMPTS - h-cel-90s (90s pastel cel anime)

Save one prompt block as PROMPT.txt in this folder, then run (one at a time):

```
cat PROMPT.txt | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra -i ../_refs/handstand.png -i ../_refs/cloud-dream.png - 2>&1 | tail -15
```

Prompts below are the exact text piped in. 01 to 07 are the pastel set; 2x-water-* are round 2 (elemental water, blue palette). Shared recipe for all: -i ../_refs/handstand.png -i ../_refs/cloud-dream.png (water rounds also -i ../../CLOUD-MOCKUPS/05-elemental-flow.png).

## 01

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 01-hero.png. Report the final path.

Create a desktop website hero mockup, 16:9 landscape, original artwork. Style: 90s pastel cel anime key frame, like a hand-painted cel scanned from a VHS/laserdisc transfer. Hand-inked cel outlines with slightly wobbly, imperfect lines, ink strength about 3 out of 5 (medium warm indigo-plum ink, not pure black). Flat pastel cel shading with exactly one soft shadow tone per object, no painterly texture. Airbrushed gradient sky (peach to lilac to baby blue). Small four-point sparkle glints and soft bloom glow around the light source. Subtle film grain and slight color bleed. Palette: lilac, periwinkle, peach, cream, butter yellow, rose pink, dusty plum. NO GREEN ANYWHERE. Do not imitate any existing show or character.

Composition: a soft sunrise glow at upper right, fluffy cel clouds with ink outlines layered along the bottom third. A young man doing a handstand on top of the clouds, following the pose and outfit of the first reference image (handstand.png): blue sweater and jeans, maroon hoodie, sneakers. His beanie is dusty rose, not green. Sparkles drift around him. The left half has open calm sky for text.

Text in the image: top-right navigation in small rounded lettering reading "Work    About    Contact". Large hand-inked title "Daniel Azran" in deep indigo ink with slightly wobbly strokes on the left, and below it smaller "Engineer / ML / Video editor". Use the second reference (cloud-dream.png) only for the cloud mood and light, redrawn as cel clouds with ink outlines, not as a painting.
```

## 02

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 02-hero-alt.png. Report the final path.

Create an alternative desktop homepage hero, 16:9 landscape, original artwork, as a 90s anime TITLE CARD / eyecatch: a single centered cel scene inside a soft rounded-corner frame with a thin cream border. Style: 90s pastel cel anime key frame, like a hand-painted cel scanned from a VHS/laserdisc transfer. Hand-inked cel outlines with slightly wobbly lines, ink strength about 3 out of 5 (medium warm indigo-plum ink, not pure black). Flat pastel cel shading with exactly one soft shadow tone per object. Airbrushed gradient sky (rose to lilac to butter yellow). Sparkles and soft bloom glow. Film grain and slight color bleed. Palette: lilac, periwinkle, peach, cream, butter yellow, rose pink, dusty plum. NO GREEN ANYWHERE. Do not imitate any existing show or character.

Scene: the handstand figure from the first reference (handstand.png), upside-down pose, sitting on a crescent moon made of cel clouds, a small floating paper-lantern-like glow, with a few sparkles. Outfit: blue sweater and jeans, maroon hoodie, sneakers; beanie dusty rose, not green. Centered and slightly off-axis, leaving breathing room.

Text: a retro title-card caption in hand-inked lettering, centered at the bottom: "Daniel Azran" in large indigo wobbly letters, and smaller underneath "Engineer / ML / Video editor". Small tiny nav text in the top-left corner reading "Work  About  Contact". Use the second reference (cloud-dream.png) only for cloud mood, redrawn in cel style with ink outlines.
```

## 03

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 03-projects.png. Report the final path.

Create a desktop website PROJECTS section mockup, 16:9 landscape, original artwork. Style: 90s pastel cel anime key frame, like a hand-painted cel scanned from a VHS/laserdisc transfer. Hand-inked cel outlines with slightly wobbly lines, ink strength about 3 out of 5 (medium warm indigo-plum ink, not pure black). Flat pastel cel shading with exactly one soft shadow tone per object. Airbrushed gradient background (cream to lilac). Small sparkle glints and soft bloom. Film grain, slight color bleed. Palette: lilac, periwinkle, peach, cream, butter yellow, rose pink, dusty plum. NO GREEN ANYWHERE. Do not imitate any existing show or character.

Layout: four project cards arranged in a 2x2 or row of four, each a cel-style card with thick-ish ink outline, rounded corners, a small pastel tab label, and a mini scene inside:
1. Golf swing analyzer: a golfer mid-swing drawn as a cel figure with pose nodes (small glowing dots joined by thin lines) on the joints, angle arcs, and a small label "tempo 1.7:1" in indigo hand lettering. Keep the figure original, a generic golfer in a rose cardigan.
2. Optical flow tracker: small cel arrows flowing across a cel cloud, with dotted trails.
3. MNIST digit classifier: a grid of hand-drawn handwritten digits 3, 7, 1 with a small butter-yellow confidence bar.
4. Real estate price predictor: a cute cel house with a small line chart rising beside it, sparkles.
Section heading at top-left in hand-inked indigo lettering: "Selected work". Small nav at top-right: "Work  About  Contact". Include a small tag text "Python  PyTorch  OpenCV" under each card in tiny lettering. Use the first reference handstand.png only to keep the same character style if a tiny figure appears in the corner. Use cloud-dream.png only for background mood.
```

## 04

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 04-experience.png. Report the final path.

Create a desktop website EXPERIENCE section mockup, 16:9 landscape, original artwork. Style: 90s pastel cel anime key frame, like a hand-painted cel scanned from a VHS/laserdisc transfer. Hand-inked cel outlines with slightly wobbly lines, ink strength about 3 out of 5 (medium warm indigo-plum ink, not pure black). Flat pastel cel shading with exactly one soft shadow tone per object. Airbrushed gradient background (cream to lilac to peach). Sparkles and soft bloom. Film grain, slight color bleed like a VHS transfer. Palette: lilac, periwinkle, peach, cream, butter yellow, rose pink, dusty plum. NO GREEN ANYWHERE. Do not imitate any existing show or character.

Layout: left column is a vertical timeline of four cel-style entries, each with a small pastel dot on a wobbly ink line, a year tag, and a title in hand-inked indigo lettering: "Full-stack engineer", "ML / data science", "Video editor", "Compiler and sync projects". Each entry has one short line of tiny placeholder text in soft ink squiggles, not real words.

Right column: a video-editing reel frame, drawn as a cel-style film strip / video editor timeline with a glowing frame preview in the center showing a cel gaming montage moment (a stylized anime-style character leaping, with motion lines and an impact flash), below it a timeline with colored clip blocks in lilac, peach and butter yellow and a playhead. Small label "reel" in hand lettering. Top-left heading "Experience" in large hand-inked indigo wobbly letters. Top-right nav in small type: "Work  About  Contact". Use the first reference handstand.png only as a small cameo sticker in a corner if at all.
```

## 05

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 05-mobile.png. Report the final path.

Create a PHONE homepage hero mockup, portrait orientation, aspect ratio 9:19.5 (tall phone screen), original artwork. Style: 90s pastel cel anime key frame, like a hand-painted cel scanned from a VHS/laserdisc transfer. Hand-inked cel outlines with slightly wobbly lines, ink strength about 3 out of 5 (medium warm indigo-plum ink, not pure black). Flat pastel cel shading with exactly one soft shadow tone per object. Airbrushed gradient sky (peach to lilac to baby blue). Sparkles and soft bloom glow. Film grain, slight color bleed. Palette: lilac, periwinkle, peach, cream, butter yellow, rose pink, dusty plum. NO GREEN ANYWHERE. Do not imitate any existing show or character.

Composition, top to bottom: a small nav row at the top reading "Work   About   Contact" in tiny rounded lettering. Upper-middle: the handstand figure from handstand.png, drawn as a cel character on top of fluffy cel clouds, with sparkles, the beanie dusty rose, blue sweater and jeans, maroon hoodie, sneakers. Lower third: large hand-inked title "Daniel Azran" in deep indigo wobbly strokes, then "Engineer / ML / Video editor" smaller underneath, then a small rounded pill button reading "See work" in cream with an indigo outline. Bottom edge: layered cel clouds. Keep the text large enough to read on a phone and keep 16px side margins clear.
```

## 06

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 06-full-page.png. Report the final path.

Create a TALL full-homepage mockup, portrait orientation, aspect ratio about 1:3, original artwork, showing a whole desktop-width website scrolled top to bottom as one long image. Style: 90s pastel cel anime key frame, like a hand-painted cel scanned from a VHS/laserdisc transfer. Hand-inked cel outlines with slightly wobbly lines, ink strength about 3 out of 5 (medium warm indigo-plum ink, not pure black). Flat pastel cel shading with exactly one soft shadow tone per object. Airbrushed gradient backgrounds. Sparkles and soft bloom. Film grain, slight color bleed. Palette: lilac, periwinkle, peach, cream, butter yellow, rose pink, dusty plum. NO GREEN ANYWHERE. Do not imitate any existing show or character.

Sections from top to bottom, separated by soft cloud bands:
1. Hero: top nav "Work  About  Contact", the handstand figure from handstand.png on cel clouds, title "Daniel Azran" in deep indigo wobbly ink, "Engineer / ML / Video editor" underneath.
2. "Selected work" heading, then a 2x2 grid of cel project cards: Golf Swing Analyzer (figure with pose nodes and "tempo 1.7:1"), Optical Flow Tracker (cel arrows over clouds), MNIST Digit Classifier (handwritten digits with confidence bars), Real Estate Price Predictor (cute cel house with a rising line chart).
3. "Experience" heading with a vertical timeline of four entries on the left and a video-editor reel frame on the right (a gaming-montage style action frame, timeline clips in lilac, peach and butter yellow).
4. "About" block: a small cel portrait placeholder (a simple silhouette in a rose cardigan, no real face detail) with three short lines of soft placeholder ink squiggles.
5. "Contact" footer: a cream pill button "Say hello", small social icons drawn as cel stickers, and a row of tiny sparkles over the layered cloud floor.
Keep all text labels readable and use the same palette everywhere.
```

## 07

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 07-style-sheet.png. Report the final path.

Create a 16:9 landscape STYLE SHEET board, original artwork, laid out like an art-direction reference sheet on a cream paper background. Style: 90s pastel cel anime, like a hand-painted cel scanned from a VHS/laserdisc transfer. Film grain, slight color bleed. NO GREEN ANYWHERE. Do not imitate any existing show or character.

Sections, labelled with small hand-inked indigo headings:
1. "Cel palette": a row of six flat swatches with tiny hex-like labels (not real hex codes, just placeholder ink marks): lilac, periwinkle, peach, cream, butter yellow, rose pink, dusty plum.
2. "Line weight": four ink-line samples drawn with slightly wobbly strokes, labelled strength 1 (pale pencil) to 5 (bold ink), with 3 highlighted as the house style.
3. "Shading": a small cel sphere and a cel cloud each showing exactly one soft shadow tone.
4. "Sparkle and bloom": four sparkle glints of different sizes, and a soft bloom glow sample around a small butter-yellow light.
5. "Type": a hand-inked display sample "Daniel Azran" and a clean rounded sample "Engineer / ML / Video editor".
6. A tiny handstand figure thumbnail from the reference handstand.png, drawn as a cel character.
Keep it airy, orderly and readable.
```

## 2x-water-hero (round 2)

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 2x-water-hero.png. Report the final path.

Create a desktop website hero mockup, 16:9 landscape, original artwork. Style: 90s pastel cel anime key frame, hand-inked cel outlines with slightly wobbly lines, ink strength about 3 of 5 (warm indigo-slate ink, not pure black). Flat cel shading with one soft shadow tone per object. Airbrushed sky. Sparkles and soft bloom, faint film grain, slight VHS color bleed. Palette: powder blue, azure, slate indigo, ivory, restrained sunlight gold. Much less pink and lavender. NO GREEN ANYWHERE. Do not imitate any existing show or character.

Elemental water: broad stylized water ribbons with curling S-curves swirl around the handstand figure, drawn like anime water-breathing effects in sakuga key frames, with white foam bands, tapering ends, and foam dissolving into cloud mist. Follow the water style of the third reference (elemental-flow.png). Use the first reference (handstand.png) for the figure: upside-down handstand on top of cloud, blue sweater and jeans, maroon hoodie, sneakers, beanie in ivory or slate blue, not green. Cotton-sky clouds from the second reference (cloud-dream.png), redrawn as fluffy cel clouds with ink outlines.

Text: top-right nav "Work    About    Contact" in small rounded lettering. Large hand-inked title "Daniel Azran" in slate indigo on the left, with "Engineer / ML / Video editor" smaller underneath. Leave room on the left for text.
```

## 2x-water-projects (round 2)

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 2x-water-projects.png. Report the final path.

Create a desktop website PROJECTS section mockup, 16:9 landscape, original artwork. Style: 90s pastel cel anime key frame, hand-inked cel outlines with slightly wobbly lines, ink strength about 3 of 5 (warm indigo-slate ink, not pure black). Flat cel shading with one soft shadow tone per object. Sparkles and soft bloom, faint film grain. Palette: powder blue, azure, slate indigo, ivory, restrained sunlight gold. Much less pink and lavender. NO GREEN ANYWHERE. Do not imitate any existing show or character.

Background: cotton-sky clouds in blue and ivory, with a few stylized water ribbons with white foam bands curling through the scene, like the elemental water in the third reference (elemental-flow.png).

Main feature, large card on the left: GOLF SWING ANALYZER. A golfer mid-swing as an original cel figure in an ivory polo, with pose nodes (small glowing gold dots joined by thin lines) on shoulders, elbows, hips, knees, and wrists. Angle arcs with small labels like "42 deg" and "118 deg". A stats panel beside it with rows: "tempo 1.7:1", "backswing 0.8 s", "downswing 0.5 s", and a tiny sparkline. Labels in clean indigo lettering.

Right side: three smaller cel project cards stacked: OPTICAL FLOW TRACKER (cel arrows flowing over water ribbons), MNIST DIGIT CLASSIFIER (handwritten digits 3, 7, 1 with confidence bars in gold and azure), REAL ESTATE PRICE PREDICTOR (cute cel house with a rising line chart). Each card has small tags such as "Python  PyTorch  OpenCV" in tiny type.

Heading at top-left "Selected work" in hand-inked slate indigo. Nav top-right "Work  About  Contact".
```

## 2x-water-mobile (round 2)

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 2x-water-mobile.png. Report the final path.

Create a PHONE homepage hero mockup, portrait orientation, aspect ratio 9:19.5, original artwork. Style: 90s pastel cel anime key frame, hand-inked cel outlines with slightly wobbly lines, ink strength about 3 of 5 (warm indigo-slate ink, not pure black). Flat cel shading with one soft shadow tone per object. Sparkles and soft bloom, faint film grain. Palette: powder blue, azure, slate indigo, ivory, restrained sunlight gold. Much less pink and lavender. NO GREEN ANYWHERE. Do not imitate any existing show or character.

Elemental water: a long stylized water ribbon with curling S-curves and white foam bands spirals up around the handstand figure and dissolves into cloud mist at the top, in sakuga anime water style, following the third reference (elemental-flow.png). The handstand figure from the first reference (handstand.png) sits on cotton clouds from the second reference (cloud-dream.png), redrawn as cel clouds with ink outlines. Beanie ivory or slate blue, not green.

Top to bottom: nav row "Work   About   Contact" in tiny rounded lettering. Upper-middle the handstand figure inside the water ribbon. Lower third: "Daniel Azran" in large slate indigo hand-inked lettering, "Engineer / ML / Video editor" underneath, then a pill button "See work" in ivory with a slate outline. Keep 16px side margins clear and text large enough to read on a phone.
```
