# v11 brief: living seamless sky + new lettering (2026-10-12)

Read `redesign/BRIEF-V9.md` and `redesign/BRIEF-V10.md` first. Their hard rules still apply:
- No green, and teal counts as green.
- No invented facts; use only the facts listed in BRIEF-V10.
- Static site that works over `file://`.
- CDN libraries at exact versions only (cdnjs / jsdelivr / unpkg), e.g. GSAP 3.15.0, Lenis 1.3.26, opentype.js 1.3.4. If you need three.js, use an exact version such as 0.160.0 from cdnjs/jsdelivr.
- Respect `prefers-reduced-motion`.
- The handstand is Daniel. Keep the video reel.
- Keep the "with and without cloud cards" switch (`?clouds=1` plus the on-page toggle).
- Keep the song easter egg tied to shooting stars (`tgrave.mp3`).

Git rules:
- Branch `redesign`. Never push. Never commit to main.
- Never touch the root `nebula.html` or the root `index.html`.
- Only `git add` your own paths.
- Commit once per coherent change, with this identity: `git -c user.name=Danzran -c user.email=125504166+Danzran@users.noreply.github.com commit`.
- End each commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, plus `Co-Authored-By: Codex <noreply@openai.com>` when the commit includes Codex output.

## What Daniel said about v10 (verbatim, 2026-10-12, before leaving for work)

> try again. same rules with codex but we need a more seeamless background, not just a generated image. it needs to be alive in a sense. and the text sucks again I want  different font and different kind of scribble effect.

"Same rules" means the v10 request: the Kimi no Nawa / Makoto Shinkai direction, shooting stars driving the scroll effect, more About details (some on the hero), the song as a shooting-star easter egg, multiple variations, Codex for the assets with good prompts and several variations each, and subagents.

## What this means
1. **Living, seamless background.** The v10 backgrounds were static Codex paintings swapped per section. In v11, the background must:
   - be a single continuous, animated world behind the *whole* page, with no seams, hard image edges or per-section image swaps;
   - change continuously with scroll (time of day, camera height or depth, sky rotation);
   - move on its own even when nobody scrolls: clouds drift and morph with light moving through them, stars twinkle, shooting stars fall, water or light shimmers.
   Build it in code (WebGL shaders, canvas, particles). Codex paintings may be used as *ingredients*, e.g. tileable textures, cloud sprites, brush and light textures, or layers animated with flowmaps, but never as a static backdrop.
2. **New font + new scribble effect.**
   - Drop Caveat Brush and the "giannis" dripping noise-displaced outline everywhere in the variation. Also drop Gochi Hand and Patrick Hand for UI text.
   - Pick a genuinely different typeface and a genuinely different kind of animated "scribble" (not outline-noise displacement). Embed the font as base64 JS (pattern: `redesign/assets/fonts/brush-font.js`) so opentype.js works over `file://`. Google Fonts files are available from `https://raw.githubusercontent.com/google/fonts/main/ofl/<family>/`. Use OFL fonts only, and note the license in the JS header.
3. Keep all content and sections from v10/v9: hero, Now (Safe Ship), Work cards with ProjectViz, the Experience timeline (newest first), About, Contact and the golf page link. Fix the known v10 rough edges you inherit: phone cloud cards clipped at the screen edge, test hooks left on `window`, the comet tail behind the nav on phone, and busy timeline backgrounds over the sky.

## Tooling
- **Screenshots:** from `/mnt/c/Users/pondu/AppData/Local/Temp/claude-pptr` run `"/mnt/c/Program Files/nodejs/node.exe" shoot.js "file:///C:/dev/danzran.github.io/<path>/index.html" /mnt/c/dev/danzran.github.io/redesign/shots/<prefix> W H <scroll stops...>`. Read `shoot.js` first for the exact argument meaning. It prints PAGEERROR, CONSOLE and REQFAIL lines. Check at 1440x900 and 390x844. Note that headless WebGL may use SwiftShader, so it is slow but works.
- **JS syntax check:** `"/mnt/c/Program Files/nodejs/node.exe" --check file.js`.
- **Windows Python** (Pillow, cv2): `/mnt/c/Users/pondu/AppData/Local/Temp/claude-pptr/pyenv/Scripts/python.exe`. Convert paths with `wslpath -w`.
- **Codex images:** `cat prompt.txt | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra [-i ref.png] -`, run in the target folder. Tell Codex the exact output filename and size.
  - Run one job per folder at a time, because parallel jobs in the same folder can save the wrong image.
  - Keep logs out of the job folder.
  - Use PNG refs.
  - Save prompts in the folder's `PROMPTS.md`.
  - Make several variations per asset.
  - Budget: about 10 images per agent. Codex has a usage limit. If it hits the limit, say so and continue in code.
  - Convert to webp for the page.
- Asset pack from v10: `redesign/assets/kimi/` (skies, comets, clouds, cloud-card frames, handstand cut-outs `hero/handstand-cutout(-rim).webp`, cord, note-star, light leaks). See its `PROMPTS.md` and `index.html`.

## Variations (one agent each, separate folders)
| Folder | Living background | Font + scribble |
|---|---|---|
| `drafts/v11-skyshader` | A full-page WebGL fragment-shader sky: fbm clouds lit by a moving sun/moon, with scroll driving day → magic hour → night, the Milky Way, procedural shooting stars and a comet | Mincho-style serif (the Kimi no Nawa title feel), e.g. Shippori Mincho B1 / Zen Old Mincho, drawn as **light painting**: a shooting-star head traces each glyph's contours and leaves a glowing trail that cools and keeps faintly shimmering |
| `drafts/v11-painterly` | Codex-painted **tileable** cloud and sky layers animated in WebGL with flowmaps or domain-warp, multi-layer parallax and light sweeps, so the painting itself moves; scroll moves the camera up through the layers into space | Handwritten single-line or pen font, e.g. Reenie Beanie, Nanum Pen Script or a Hershey single-line script; the effect is a **colored-pencil scribble fill**: zig-zag hatching strokes that fill the letters and re-scribble on twos, with a pencil grain texture |
| `drafts/v11-cloudsea` | **3-D cloud-sea flight** (three.js or raw WebGL): sprite or volumetric clouds the camera glides over as you scroll, with the sky and stars above and the comet crossing; Codex cloud sprites as textures | Brush calligraphy display font, e.g. Yuji Boku / Yuji Syuku / Kaushan Script; the effect is **ink brush stroke write-on**: each stroke is painted on in order with bristle texture and dry-brush breakup, then breathes gently |

Lettering lab (one agent): `redesign/drafts/v11-lettering-lab/` holds 6–8 font × effect combos side by side on a living-sky background, e.g. light painting, pencil scribble fill, ink write-on, sketchy overshoot multi-line, the red-cord (kumihimo) tracing the letters, a constellation connect-the-stars and chalk pastel. Daniel can then pick one, and the chosen one can be swapped into any variation.
