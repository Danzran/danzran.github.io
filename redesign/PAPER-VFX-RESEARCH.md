# Paper, pastel, and scribble motion

Research date: 2026-10-11. Three `gpt-6-luna` agents researched motion, typography, and footage treatment in parallel; the main agent recovered the Claude brief, checked primary sources, and synthesized this direction. Terra was not an available model in this session.

**My recommendation:** make the portfolio feel like an animated sketchbook: independently redrawn lettering, pastel paper layers, recognizable footage, and pencil annotations. Start with the name and handstand composition; let the golf sequence demonstrate the connection between motion design and engineering.

Open [the motion study](drafts/paper-motion-study/index.html) directly in a browser. It compares actual alternate letter paths, redrawn marks, and stepped paper movement. Its controls let you inspect individual drawings and compare 4–12 changes per second. This is a technique study, not a proposed finished portfolio layout.

## What I recovered from the Claude session

Read the local transcript for `a7518836-399a-42e2-bfc1-a8af13df88ac`, especially the user message at `2026-10-11T05:55:14Z`:

- Each handwritten letter should have several slightly different drawings, substituted every few frames.
- Animated assets should share a paper animation feel and vibrant pastel colors; the green direction is rejected.
- Use `/mnt/c/Users/pondu/Downloads/golfswing.mov` for the golf feature, with body nodes, analysis lines, and angle annotations.
- Put the handstand image in the hero. Feather the surrounding background and let its lighting spread beyond the original rectangle.
- Keep the original video editor animation, `thi.gif`. Replace the other experience illustrations as needed.
- Preserve the ambition of the earlier scroll concept, with the new visual language.

I inspected `handstand.PNG` and the existing reveal draft. The portrait already has illustrated contours, grain, and a strong sunset behind the figure. Keeping some of that radiating light will work better than indiscriminately deleting the whole background. The golf file exists; this research does not claim to have analyzed its frames or tracked its joints.

## The useful vocabulary

| Term | What it contributes | Where I would use it |
|---|---|---|
| Line boil / boiling outlines | Repeated drawings of the same pose make contours gently change | Name, section words, arrows, circles |
| Replacement animation | Swap complete drawings or cutouts without morphing between them | Alternate letters, paper shapes, icons |
| Animating on twos / threes | At a 24 fps presentation rate, hold each drawing for two / three frames: 12 / 8 new drawings per second | Golf footage and illustrated asset loops |
| Rotoscoping | Use real footage as the guide for drawn motion | Golf swing silhouette and swing arc |
| Posterize Time | Sample an animated layer at a chosen lower frame rate | Held footage and paper movement |
| Paper cutout / mixed media collage | Combine photography, drawing, paper shapes, texture, and physical-looking overlaps | Hero, work cards, section transitions |
| Draw-on | Reveal one stroke progressively | A brief underline or annotation entrance |
| Print misregistration | Slightly offset a color impression from its ink outline | Occasional lilac/peach edges and heading accents |

These effects can coexist. Draw-on is an entrance; replacement drawings supply the continuing life. Lower frame rate supplies timing; alternate artwork supplies the changing shape. Adobe confirms that [Posterize Time locks a layer to a chosen frame rate](https://helpx.adobe.com/after-effects/desktop/apply-effects-and-animation-presets/list-of-effects/time-effects.html).

## References worth opening

These are artists' own project/process pages, not roundup recommendations. The takeaways are my proposed adaptations, not claims that those artists built this exact web effect.

1. **[Podenco — Mike Shinoda, Make It Up As I Go](https://podenco.tv/mike-shinoda-make-it-up-as-i-goofficial-music-video/).** The director describes printing footage frames, painting them with acrylic, recapturing them in After Effects, and combining performance with ripped paper collage. This is the strongest process reference for the golf treatment. The project page also embeds a [postproduction process film](https://vimeo.com/291089282).
2. **[Computer Team — Paramore, Hard Times](https://www.computerteam.co/paramore/).** The studio explicitly combines hand-drawn animation, rotoscoping, and stop motion. Useful inspiration for lively marks around a recognizable person.
3. **[Podenco — Green Day, Revolution Radio](https://podenco.tv/green-day-revolution-radioofficial-lyric-video/).** A type-led cut-and-paste collage with photocopied textures, halftones, and posterized animation. Adapt the texture and timing to a lighter pastel palette.
4. **[MiraRuido — Claire Gimatt, Dali](https://www.miraruido.com/commercial/dali).** The creator describes a collage composed of photographs and rotoscoped videos and provides styleframes and process material. A useful guide to depth and scene assembly.
5. **[Case Jernigan — music videos](https://www.casepaint.com/music-videos).** Several projects combine cut paper, ink, glue, acrylic, photography, and footage. Especially useful for physical materials and handmade marks.

The user supplied [this YouTube reference](https://www.youtube.com/watch?v=flL7hff_WRc). Direct playback and metadata were unavailable through the research browser, so I have not claimed a shot-by-shot viewing or verified its identity. The Podenco case study is independently verified and closely matches the described process.

## Technique recipes

All numerical settings below are **my starting recommendations**, to be tuned against the actual assets. They are not standards or settings prescribed by the linked sources.

### 1. Redrawn lettering

Make three drawings of each required letter with matching baseline and advance width. Change the actual contours: an A's crossbar, an R's bowl, an N's diagonal, an E's middle arm. Keep the word's location and overall spacing stable. Give adjacent letters different variant phases so the whole word does not pulse simultaneously.

Start at **4–6 drawing changes per second** for the name and headings. Compare 8 for more energetic short labels. With three variants, six changes per second produces a half-second A/B/C cycle; this is different from a six-second CSS loop or a 24 fps video.

For a few headlines, export paths as SVG and substitute completed drawings. For an entire alphabet used widely, build a webfont with alternate glyphs and stable metrics. [OpenType GSUB](https://learn.microsoft.com/en-us/typography/opentype/otspec190/gsub) supports alternate substitutions; [FontForge imports SVG outlines](https://fontforge.org/docs/tutorial/importexample.html). A font still needs application code or feature selection to animate its variants.

Rough.js is useful for circles, arrows, brackets, and hatching. Its [seed option makes rough drawings repeatable](https://roughjs.com/posts/release-4.0/); that does not author distinct handwriting for you. Use it to precompute a small variant set if needed. Keep real text available to assistive technology and mark decorative glyph SVGs `aria-hidden="true"`.

### 2. Living pencil annotations

Author three complete versions of a circle, underline, star, or arrow. Draw one version on during entrance using [SVG stroke-dashoffset](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-dashoffset), then flip among completed versions. Keep the endpoint attached to the thing it labels. Start with 1–2 px contour differences at display size and 4–8 drawing changes per second.

A second imperfect stroke, interrupted hatch, or tiny color offset adds more character than large movement of the entire annotation. Keep paragraph text steady; reserve the drawing effect for a few short elements in each viewport.

### 3. Paper material and cutout movement

Build the material from warm off-white edges, slightly irregular silhouettes, restrained shadows, and texture clipped inside the cutout. The paper grain should move with the object. Prefer a few authored grain plates to a freshly randomized texture every frame.

Start with 1–2 px registration changes, rotations under roughly 0.4°, and 8 updates per second. Use a consistent implied light direction. [CSS drop-shadow follows an alpha silhouette](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/filter-function/drop-shadow), which is useful for a transparent paper cutout. Avoid shadowing an entire rectangular media wrapper when you want the person or paper shape to feel detached.

Use [CSS steps()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/steps) for a sprite strip or stepped transform. For JavaScript animation, sample elapsed time; do not count monitor refresh callbacks as animation frames. A 120 Hz display should not double the drawing cadence.

### 4. Pastel footage with temporal consistency

For the golf shot, build a short approved style test before treating the whole clip:

1. Inspect framing, orientation, exposure, and the key moments of the swing.
2. Preserve the person's anatomy and silhouette. Separate subject, background, outlines, and annotations into controllable layers.
3. Apply a deliberately limited palette to broad regions. Retain enough shading to read limb overlap, grip, and the club.
4. Add graphite outlines, local paper grain, and a few independently redrawn marks.
5. Present 8 or 12 unique frames per second, while keeping source motion timing intact.

Use a fixed color treatment or temporally guided stylization. Independent generative edits of every frame are likely to change clothing, anatomy, and background details; this is an implementation risk, not a desirable form of line boil. [Ruder et al.'s video style-transfer research](https://arxiv.org/abs/1604.08610) specifically treats temporal consistency as part of the video stylization problem.

For a rapid downswing, check the source frames near impact before choosing the hold cadence. Preserve a distinct impact pose or vary holds deliberately if uniform sampling misses it.

### 5. Golf nodes that remain attached

Extract pose coordinates from the original decoded footage, then composite graphics onto the same timestamps as the final held frames. [MediaPipe Pose Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/python) supplies image/world landmarks and optional segmentation; video processing uses frame timestamps. It does not supply golf coaching scores or track the golf club as a body joint.

Smooth or manually correct uncertain landmarks before styling. Hide low-confidence points. Use a sparse set of joints, a lilac swing trail, and peach circles. Let line contours boil while the underlying measured coordinates remain steady. For live browser overlays, [requestVideoFrameCallback provides mediaTime](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback); synchronize against the presented video frame rather than an unrelated wall clock. A baked overlay is simpler for this fixed clip.

For vectors u and v at a joint, compute `acos(clamp(dot(u,v) / (length(u)*length(v)), -1, 1))`, then convert to degrees; skip zero-length vectors. Convert normalized image coordinates to pixels before computing image-space angles, or account for aspect ratio. Label the result as a **2D estimated angle**. A single camera projection is not a validated anatomical 3D measurement. Do not invent power, efficiency, or form scores; club tracking needs a separate method or manual annotation.

### 6. Handstand with light escaping the frame

The inspected image has a dark illustrated figure against blue and orange sunset rays. My preferred composition uses three layers: a carefully isolated figure, a broader fading patch of the original environment, and new peach/lilac/butter light shapes behind it.

Keep the hands, feet, and figure crisp. Feather the *environment's outer boundary* more than the silhouette. A [gradient CSS mask](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image) can fade the original rectangle, but cannot isolate the body by itself. A separate subject matte is necessary if it must float freely over type or paper layers.

Make three versions of the surrounding rays or contour marks, cycling at 4–6 changes per second. Keep the underlying pose fixed; tiny registration changes and changing outlines can provide the animation. An offset pastel paper halo can sit behind the silhouette. Inspect hair, fingers, and contact with the ground before treating the mask as final.

### 7. Scroll as a page assembly

Let scroll move paper layers into place, reveal handwritten annotations, and spread the hero's sunset into the next composition. Give drawings their own time-based idle cadence. This keeps the handmade texture alive even when the reader stops scrolling, while the large composition remains controllable.

Try an ink-circle reveal instead of the current green liquid reveal: three rough circle variants expose the pastel portrait or golf layer as the cursor passes. On mobile, use a short entrance or tap action. A later section could turn a swing arc into an underline, then into a project connector. Start with native scrolling and the existing orchestration tools only where needed.

## Palette and hierarchy

| Role | Color | Use |
|---|---|---|
| Warm paper | `#F7F0E3` | Main page surface |
| Graphite / plum | `#332B40` | Body text, pencil lines, labels |
| Peach | `#F4AFA0` | Light, large shapes, selected nodes |
| Lilac | `#BDB0E6` | Hero contrast, swing arcs |
| Powder blue | `#A9CCE5` | Secondary material and overlays |
| Butter | `#F0D77D` | Small highlights and ray shapes |
| Deep violet | `#29243D` | Optional darker showcase panel |

These are proposed tokens. Use dark graphite for readable text on pastels; verify actual contrast after typography and backgrounds are chosen. Keep color largely stable between replacement drawings to avoid a flashing impression.

## Implementation and export choice

Use plain HTML/CSS/JS and authored SVGs for the lettering and marks. Produce the expensive footage treatment offline. A flattened, muted, short MP4 with a poster is a straightforward first delivery; transparency can remain in still-image/SVG layers around it. [Chrome documents alpha WebM](https://developer.chrome.com/blog/alpha-transparency-in-chrome-video/), but that is not a promise of identical playback across all target browsers.

Keep `thi.gif` as requested. It is roughly 42 MB in this checkout; load it when its section is approached rather than making hero readiness depend on it. Any smaller derivative should preserve the animation and supplement the retained original. [FFmpeg's palettegen/paletteuse filters](https://ffmpeg.org/ffmpeg-filters.html#palettegen) support GIF palette workflows, but soft pastel gradients still need visual inspection.

Provide a visible pause control and a [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) treatment that actually stops JavaScript drawing changes and looping media. Pause hidden/offscreen studies and keep a useful static composition. Avoid tying every animation to a heavyweight WebGL render loop.

## Suggested next production pass

1. Approve the name's drawing style and cadence using the motion study; then replace the sample monoline paths with finished artwork.
2. Make a small handstand composition with separate figure/environment/light layers. Review its edges at desktop and phone sizes.
3. Treat a short golf excerpt; review the fastest movement and annotation alignment before processing more footage.
4. Apply the same vocabulary to project and experience assets, preserving the requested video editor GIF.
5. Revisit the scroll sequence with those actual assets, then validate readability, reduced motion, loading, and phone layout.

The first three steps are the highest-value visual tests. They settle the handwriting, portrait integration, and footage treatment before a broader redesign.

## Motion study validation

Checked in headless Chrome at 1440 px and 390 px widths: automatic drawing changes, pause/resume, three distinct glyph variants, cadence selection, registration toggle, active-playback reduced-motion handling, no-JavaScript fallback, and horizontal overflow. No browser errors occurred. Screenshots: [desktop](shots/paper-motion-desktop.png) and [phone](shots/paper-motion-phone.png).
