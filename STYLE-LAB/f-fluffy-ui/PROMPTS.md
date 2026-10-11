# f-fluffy-ui: exact prompts

Shared base for every call (codex exec, model gpt-5.6-terra, run from this folder):

    printf '%s' "$P" | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra -i <refs...> -

Each prompt starts with: "Using your image generation tool, generate this image and save the PNG into the current directory as <NN-name>.png. Report the final path."

## 01-hero (refs: 04-fluffy-interface.png, handstand.png)

Create an original artwork: a desktop homepage hero mockup, 16:9 landscape, for a software engineer portfolio called "clean, product-like cloud UI with small ink accents". Overall: generous milky ivory and cream space (#FBF6F0 range), soft pastel lilac, periwinkle and peach accents only. No green anywhere, no neon, no lime.

Layout: a slim top navigation pill made of soft cloud material with feathered edges, containing "Work", "About", "Contact" in crisp readable sans-serif, with a tiny hand-inked underline under "Work". Left column: large crisp heading "Daniel Azran" in a clean modern sans-serif, deep indigo ink colour, with a small hand-drawn ink swoosh underline beneath it at medium ink strength. Below it, a smaller subtitle "Engineer / ML / Video editor" in clean sans, slate-indigo. A short doodled arrow pointing toward a call-to-action button "See my work", the button is a soft cloud-shaped pill with feathered edges and a thin indigo ink outline.

Right column: a small handstand figure (use the reference handstand image as the figure: a person in a handstand, drawn with loose brush ink outline and flat cel colour in lilac and cream) sitting on top of a single soft fluffy cloud, with two or three tiny ink emphasis lines (short radiating dashes) near the figure, ink strength about 2 to 3 out of 5, not heavy. Background: a few faint distant clouds at the edges, very soft, feathered, low contrast, so the UI stays readable.

Style: product-like clarity first. Crisp readable type, clean alignment, flat cloud material for UI elements, small hand-inked accents only. Original artwork, not a copy of the reference images. Text must be legible and spelled exactly: "Daniel Azran", "Engineer / ML / Video editor", "Work", "About", "Contact", "See my work".


## 02-projects (refs: 04-fluffy-interface.png, golf-impact.png, 01-hero.png)

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 02-projects.png. Report the final path.

Create an original artwork: a desktop projects page mockup, 16:9 landscape, in the same product-like cloud UI style as the reference hero (milky ivory and cream background, soft pastel lilac, periwinkle and peach only, no green, no neon). Top: the same slim nav pill with feathered cloud edges, "Work" active with a tiny ink underline, "About", "Contact". Heading "Selected work" in crisp deep indigo sans-serif, with a short hand-inked underline.

Below: a clean grid of four project cards, each card a soft cloud-material panel with feathered edges and a thin indigo ink hairline border, with a flat cel-coloured preview area at the top and crisp readable text below. Cards, left to right, top row:
1. Golf swing analyzer: preview shows a stylised golf swing silhouette with small pose dots joined by thin lines, one small ink arc; caption "Golf swing analyzer" and a small tag "tempo 1.7:1" in a soft pill with indigo text.
2. Optical flow tracker: preview shows a few flowing arrows and tracked dots across a soft gradient; caption "Optical flow tracker".
Bottom row:
3. Digit classifier: preview shows handwritten digits 0 to 9 in soft lilac cloud bubbles; caption "MNIST digit classifier".
4. Real-estate price predictor: preview shows a simple soft line chart with a rising curve and a few dots, in periwinkle; caption "Real-estate price predictor".
Each card has a small doodled arrow or a tiny ink emphasis burst (ink strength 2 of 5) near its corner. Include a small "View project" text link with a tiny arrow under each caption. Generous milky spacing between cards.

Style: product clarity first, clean alignment, crisp readable type, flat cloud material for UI elements, small hand-inked accents only. Original artwork. Text must be spelled exactly: "Selected work", "Golf swing analyzer", "tempo 1.7:1", "Optical flow tracker", "MNIST digit classifier", "Real-estate price predictor", "View project".
```

## 03-experience (refs: 04-fluffy-interface.png, 02-projects.png, handstand.png)

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 03-experience.png. Report the final path.

Create an original artwork: a desktop experience page mockup, 16:9 landscape, in the same product-like cloud UI style as the reference hero (milky ivory and cream background, soft pastel lilac, periwinkle and peach only, no green, no neon). Top: the same slim nav pill with feathered cloud edges, "About" active with a tiny ink underline, "Work", "Contact". Heading "Experience" in crisp deep indigo sans-serif with a short hand-inked underline, and a one-line subtitle "Where I have built things" in slate indigo.

Main area: a vertical timeline on the left third, drawn as a thin indigo ink line with soft cloud-shaped dots as milestones. Each milestone has a crisp date label and role title, in readable sans-serif: "2024 to now, Full-stack engineer", "2023, ML and data science", "2021, Video editor (freelance)", "2019, Software engineering studies". Small doodled emphasis dashes (ink strength 2 of 5) beside the active milestone.

Right two thirds: a row of two or three soft cloud-material cards. One card is a video editing reel card: a rounded cloud-material panel with feathered edges containing a film strip motif running along the bottom, a cel-coloured gaming montage still with a small play button in a soft cloud circle, and a label "Video editing reel" with a small "Play reel" text link. Another card is a small "Stack" card with soft pill tags: "Python", "PyTorch", "OpenCV", "React", "Wix", "C" in cloud-shaped tag pills with indigo text. A third small card shows a tiny signal waveform in periwinkle with the caption "Motion and sync".

Style: product clarity first, clean alignment, crisp readable type, flat cloud material for UI elements, small hand-inked accents only. Original artwork. Text must be spelled exactly: "Experience", "Where I have built things", "Video editing reel", "Play reel", "Stack", "Motion and sync".
```

## 04-mobile-hero (refs: 04-fluffy-interface.png, 01-hero.png, handstand.png)

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 04-mobile-hero.png. Report the final path.

Create an original artwork: a phone homepage hero screen mockup, PORTRAIT orientation with a 9:19.5 aspect ratio (tall phone screen, not 16:9), shown as a flat screen with no device frame, edge to edge. Style: product-like cloud UI, milky ivory and cream background (#FBF6F0 range), soft pastel lilac, periwinkle and peach only, no green, no neon. Feathered cloud-material UI elements, crisp readable sans-serif type, small hand-inked accents at ink strength 2 of 5.

Top: a small status-bar-free header with a round cloud-material menu button on the right and a small text "Work  About  Contact" compressed into a soft cloud nav pill at the top. Middle: large crisp heading "Daniel Azran" in deep indigo, with a short hand-inked underline beneath it, then "Engineer / ML / Video editor" in smaller slate indigo sans-serif. Below: the handstand figure (from the handstand reference, loose brush ink outline, flat cel colour in lilac and cream) sitting on a single soft fluffy cloud, with two tiny ink emphasis dashes beside the figure. Lower part: a full-width cloud-shaped button "See my work" with a thin indigo ink outline, and a small doodled arrow pointing to it. At the bottom, a row of three small cloud-material chips labelled "Vision", "Learning", "Motion" with tiny icons (golf pose dots, digits, film strip). Bottom navigation: a floating cloud-material tab bar with four soft icons and tiny labels "Home", "Work", "About", "Contact" with the active one underlined by a small ink stroke.

Original artwork, text legible and spelled exactly: "Daniel Azran", "Engineer / ML / Video editor", "See my work", "Vision", "Learning", "Motion", "Home", "Work", "About", "Contact". Generous spacing, 16px side margins, no horizontal clutter.
```

## 05-mobile-projects (refs: 04-fluffy-interface.png, 04-mobile-hero.png, 02-projects.png)

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 05-mobile-projects.png. Report the final path.

Create an original artwork: a phone projects screen mockup, PORTRAIT orientation with a 9:19.5 aspect ratio (tall phone screen, not 16:9), flat screen with no device frame, edge to edge. Style: product-like cloud UI, milky ivory and cream background, soft pastel lilac, periwinkle and peach only, no green, no neon. Feathered cloud-material cards, crisp readable sans-serif type, small hand-inked accents at ink strength 2 of 5. Match the reference mobile hero style (same nav pill, same type, same bottom cloud tab bar).

Top: slim cloud nav pill with "Work" active (tiny ink underline), "About", "Contact", and a round menu button. Heading "Selected work" in deep indigo with a short hand-inked underline. A row of small filter chips in cloud pills: "All" (selected, slightly deeper lilac), "ML", "Vision", "Video".

Then a vertical stack of four cloud-material project cards, each full width with feathered edges, thin indigo hairline, a flat cel-coloured preview area on top and crisp caption below:
1. "Golf swing analyzer": preview with a golf swing silhouette, small pose dots joined by thin lines, and a soft pill tag "tempo 1.7:1".
2. "Optical flow tracker": preview with flowing arrows and tracked dots over soft gradient.
3. "MNIST digit classifier": preview with handwritten digits in soft lilac cloud bubbles.
4. "Real-estate price predictor": preview with a rising periwinkle line chart and dots.
Each card has a tiny "View project" text link with an arrow. Tiny ink emphasis dashes (strength 2) near one corner of the first card only.

Bottom: the same floating cloud-material tab bar with "Home", "Work" (active, underlined with a small ink stroke), "About", "Contact".

Original artwork, text legible and spelled exactly: "Selected work", "Work", "About", "Contact", "All", "ML", "Vision", "Video", "Golf swing analyzer", "tempo 1.7:1", "Optical flow tracker", "MNIST digit classifier", "Real-estate price predictor", "View project", "Home". 16px side margins, no horizontal clutter.
```

## 06-full-page (refs: 04-fluffy-interface.png, 01-hero.png, 02-projects.png, 03-experience.png, handstand.png)

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 06-full-page.png. Report the final path.

Create an original artwork: a full-length desktop homepage mockup shown as one tall PORTRAIT image (roughly 1:2.6 aspect ratio, tall scrolling page, not 16:9), in the same product-like cloud UI style as the reference hero: milky ivory and cream background, soft pastel lilac, periwinkle and peach only, no green, no neon. Feathered cloud-material UI cards and nav pill, crisp readable sans-serif type, small hand-inked accents at ink strength 2 of 5, generous milky space between sections.

Sections from top to bottom, each clearly separated by space:
1. Hero: slim nav pill at top with "Work", "About", "Contact" (Work underlined with a tiny ink stroke). Large "Daniel Azran" in deep indigo with a short hand-inked underline, subtitle "Engineer / ML / Video editor", a small handstand figure (from the handstand reference, loose brush ink outline, flat cel colour in lilac and cream) on a soft cloud, and a cloud-shaped button "See my work".
2. Three pillars in soft cloud panels: "Vision" (golf swing pose dots), "Learning" (floating digits), "Motion" (film strip and waveform).
3. "Selected work" heading with a hand-inked underline, then a 2 by 2 grid of cloud cards: "Golf swing analyzer" with pose dots and a pill "tempo 1.7:1", "Optical flow tracker" with flowing arrows, "MNIST digit classifier" with digits in cloud bubbles, "Real-estate price predictor" with a rising line chart. Each card has "View project" with an arrow.
4. "Experience" heading with subtitle "Where I have built things", a vertical timeline of four milestones on the left (thin indigo ink line, soft cloud dots): "2024 to now, Full-stack engineer", "2023, ML and data science", "2021, Video editor (freelance)", "2019, Software engineering studies". On the right, a "Video editing reel" cloud card with a film strip and a "Play reel" link, and a "Stack" card with cloud tag pills "Python", "PyTorch", "OpenCV", "React", "Wix", "C".
5. "About" section: a short soft paragraph block as placeholder text lines in slate indigo, and a small handstand-style cloud badge.
6. Contact: heading "Let us build something" in deep indigo with a cloud button "Get in touch" and a footer line of small text.

Original artwork, text legible and spelled exactly: "Work", "About", "Contact", "Daniel Azran", "Engineer / ML / Video editor", "See my work", "Vision", "Learning", "Motion", "Selected work", "Golf swing analyzer", "tempo 1.7:1", "Optical flow tracker", "MNIST digit classifier", "Real-estate price predictor", "View project", "Experience", "Where I have built things", "Video editing reel", "Play reel", "Stack", "Get in touch".
```

## 07-components (NOT GENERATED: Codex usage limit hit; refs planned: 04-fluffy-interface.png, 01-hero.png, 05-mobile-projects.png)

```text
Using your image generation tool, generate this image and save the PNG into the current directory as 07-components.png. Report the final path.

Create an original artwork: a UI component sheet, 16:9 landscape, in the same product-like cloud UI style as the reference hero: milky ivory and cream background, soft pastel lilac, periwinkle and peach only, no green, no neon. Feathered cloud-material elements, crisp readable sans-serif type in deep indigo and slate indigo, small hand-inked accents at ink strength 2 of 5. Clean grid layout with small labels under each specimen.

Specimens, arranged in a neat grid with labels:
1. Buttons row: primary cloud-shaped button "See my work" (soft lilac fill, thin indigo ink outline), secondary button "View project" (ivory fill, indigo text), ghost text link "Play reel" with a small ink underline and arrow. Label "Buttons".
2. Hover states row: the same primary button in default, hover (slightly deeper lilac, a tiny ink emphasis dash appears at one side), and pressed (slightly flattened cloud). Label "Hover and press".
3. Nav pill: a slim cloud nav pill with "Work" active (tiny ink underline), "About", "Contact"; and a mobile version as a round cloud menu button with three lines. Label "Nav".
4. Cards: one project card specimen with a flat cel-coloured preview area (a simple pose dot figure), caption "Project title" and a "View project" link; one stat card showing "1.7:1" with label "tempo ratio". Label "Cards".
5. Tags: row of cloud-shaped tag pills "ML", "Vision", "Video", "tempo 1.7:1", and a selected state pill deeper lilac. Label "Tags".
6. Timeline node: a single milestone dot in a soft cloud, with thin ink line and label "Milestone". Label "Timeline".
7. Ink accents: a strip of small hand-inked accents at strength 1 to 3: a short underline swoosh, a three-dash emphasis burst, a doodled arrow, and a small check tick. Label "Ink accents".
8. Feathered panel: a large cloud-material panel showing the edge feathering and a hairline indigo border. Label "Panel".

Original artwork, text legible and spelled exactly: "Buttons", "See my work", "View project", "Play reel", "Hover and press", "Nav", "Work", "About", "Contact", "Cards", "Project title", "1.7:1", "tempo ratio", "Tags", "ML", "Vision", "Video", "tempo 1.7:1", "Timeline", "Milestone", "Ink accents", "Panel".
```
