# Redesign research — 2026-10-11

Working folder for the portfolio redesign. Nothing here is live yet; `index.html` at the repo root is still the old site.

```
redesign/
  RESEARCH.md        ← this file
  codex-ideas.md     ← 6 hero concepts from Codex (gpt-5.6-terra), with implementation prompts
  mockups/           ← generated concept images (Codex): lens, timeline, line, lando-reveal, lando-scroll
  drafts/v1-reveal/  ← working prototype #1 (open index.html in a browser)
  shots/             ← automated screenshots of drafts (desktop v1-*, phone v1m-*)
```

## Reference: landonorris.com (OFF+BRAND, DesignRush Best Website Apr 2026)

Teardown from the live HTML + JS bundle:

- **Stack:** Webflow + **GSAP / ScrollTrigger / SplitText** + **Lenis** smooth scroll + **three.js** (custom ShaderMaterials, `uMouse` / `uProgress` uniforms) + **Rive** state machines for icons/buttons/scroll-linked illustrations + HLS video streams.
- **Hero:** WebGL — cursor drags gooey blob overlays that reveal/mask layers around the helmet (multiple render targets for masking, per OFF+BRAND's WebGL dev on Codrops).
- **Scroll:** heavy `scrub` usage (46 hits in the bundle), pinned sections, Rive animations driven by ScrollTrigger start/end attributes.
- **Theming:** sections declare `data-theme` / `data-nav-theme`; the nav flips colour as you pass sections.
- **Look:** near-black / dark green, single electric **lime** accent, massive type, lowercase micro-labels, single bold emphasis words in body copy, hover image swaps (helmet grid).
- **Track visualisations:** 24 tracks of ~490 points morphing between each other in WebGL.

## motionsites.ai

- A paid prompt library ($29 lifetime founder deal vs $149/yr reported; check /unlimited). The prompts are spec documents covering tokens, layout, type, motion and per-component Tailwind classes, for pasting into Claude, Cursor or Lovable.
- The prompts target **React + Tailwind v4 + Framer Motion + HLS.js**, so for this static site we convert them to vanilla HTML/CSS/GSAP.
- Signature look: full-bleed looping video, huge display type, liquid-glass nav, fade-in text, logo marquee.
- Worth copying: their *spec format*. If you have a prompt you like, paste it in and it can be adapted.

## Toolkit (versions verified 2026-10-11)

| Lib | Version | CDN |
|---|---|---|
| GSAP + ScrollTrigger (all plugins now free) | 3.15.0 | cdnjs `ajax/libs/gsap/3.15.0/` |
| Lenis | 1.3.26 | jsDelivr `npm/lenis@1.3.26/dist/lenis.min.js` |
| three.js (only if real 3D needed) | 0.186.1 | cdnjs `ajax/libs/three.js/0.186.1/three.module.min.js` |
| OGL (lighter shader alt) | 1.0.11 | jsDelivr |

Avoid: Spline viewer (~3.6 MB), Unicorn Studio (commercial use = paid). No Vite needed for a one-page site.

## Structure / content recommendations

- Order: **Hero → Statement → Selected work (3–4) → Experience → About → Stack strip → Contact**.
- Demote PL/0 + Mikal–Wix to a "more work" list. Cut or shrink Lockout Technician. Keep Video Editor prominent; it's the differentiator.
- MNIST reads as a tutorial project unless it's interactive → **draw-a-digit live demo** (TF.js / ONNX in the browser).
- Hover video previews for Golf + Optical Flow. Convert `thi.gif` (42 MB) to MP4/WebM.
- Easter eggs: "behind the scenes" toggle, footer terminal, keep the song but off by default with a visible toggle.
- Must-haves: reduced-motion fallback, OG image, phone-width layout, contact CTA in hero + footer.

## Hero concepts on the table

1. **Machine-vision reveal** (Lando blob mechanic + Codex "Intelligence Lens"). The polished surface; the cursor reveals what the model sees. → `drafts/v1-reveal/`
2. **Digit constellation**: nebula particles assemble into MNIST digits, then your name.
3. **Optical flow field**: the cursor bends a vector field.
4. **Edit timeline**: the page is an NLE timeline and scroll scrubs the playhead (Codex mockup `hero-timeline.png`).
5. **Gesture to system**: one SVG line morphs through each project (Codex mockup `hero-line.png`).

Sources: motionsites.ai, rar.design/posts/motionsites-ai-prompt-library, gsap.com/community/standard-license, tympanus.net/codrops (OFF+BRAND / Adrián Gubrica), designrush.com/best-designs/websites/lando-norris-website-design
