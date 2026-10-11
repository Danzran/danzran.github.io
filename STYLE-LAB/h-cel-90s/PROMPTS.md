# PROMPTS - h-cel-90s (90s pastel cel anime)

Save one prompt block as PROMPT.txt in this folder, then run (one at a time) (Codex CLI image generation):

```
cat PROMPT.txt | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra -i ../_refs/handstand.png -i ../_refs/cloud-dream.png - 2>&1 | tail -15
```

Prompts below are the exact text piped in, in order. 05 (mobile) was attempted and failed on a Codex usage limit; 06 and 07 were not started.

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
