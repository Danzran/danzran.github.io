# v11 lettering lab

`index.html` shows eight typeface and animated-scribble pairs. Each one renders "Daniel Azran" and a section word ("Experience") over a small living WebGL sky (`sky.js`) that goes from night to dusk as you scroll. Every tile has its own Replay button. The header has Replay all and a Loop toggle. None of the effects use outline noise displacement or drips.

URL options: `?only=N` shows tile N only, and `?loop=1` starts with Loop switched on.

| # | Effect module | Font (all OFL 1.1) | What it does |
|---|---|---|---|
| 1 | `LightPaint` (`light-paint.js`) | Shippori Mincho B1 ExtraBold | A comet head traces every contour. Its white-hot trail cools through gold to rose, then the letter fills with light. Idle: a slow light sweep and glints. |
| 2 | `PencilScribble` (`pencil-scribble.js`) | Mochiy Pop One | A sketched outline, then three pastel pencils lay zig-zag hatching at different angles, with pencil grain. It re-scribbles gently on twos. |
| 3 | `InkBrush` (`ink-brush.js`) | Kaushan Script | Centre-line strokes (skeleton) are painted in writing order with a bristle dab. Stroke tails break into dry brush. Idle: the glow breathes. |
| 4 | `SketchPass` (`sketch-pass.js`) | DM Serif Display | Edges are split at corners and drawn as 2–3 loose passes that overshoot the corners. The passes then settle over a slightly mis-registered pastel wash. |
| 5 | `RedCord` (`red-cord.js`) | EMS Allure (single-line) | A braided kumihimo cord threads along the pen path behind a gold bead. Codex braid texture is mapped along the curve. Idle: a silk sheen runs along the cord. |
| 6 | `Constellation` (`constellation.js`) | EMS Nixish (single-line) | Stars ignite at the stroke corners and thin lines join them. A shooting star links the last star. Idle: twinkle and a line pulse. |
| 7 | `ChalkPastel` (`chalk-pastel.js`) | Shrikhand | Short pastel strokes follow a flow field and build up on twos, with paper tooth and a chalk edge line. Idle: drifting chalk dust. |
| 8 | `NeonWrite` (`neon-write.js`) | Relief SingleLine | True pen-order writing with a spark at the pen tip. The neon tube flickers on, then hums, and now and then one letter stutters. |

## Using an effect elsewhere

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/opentype.js/1.3.4/opentype.min.js"></script> <!-- outline fonts only -->
<script src="redesign/assets/fonts/kaushan-script-font.js"></script>
<script src="redesign/assets/lettering/core.js"></script>
<script src="redesign/assets/lettering/ink-brush.js"></script>
<h1 id="name"></h1>
<script>
  const ctl = InkBrush.render(document.getElementById('name'), { text: 'Daniel Azran', size: 140 });
  // ctl.replay(); ctl.setLoop(true); ctl.rebuild(); ctl.destroy();
</script>
```

- `Effect.render(el, opts)` puts a HiDPI canvas inside `el`. It fits the text to `el`'s width, measured by the real ink bounds. Below `minSize` it wraps at a space onto two lines. It sets `role="img"` and an `aria-label` with the text, and it returns a controller.
- Every effect is also registered as `LetterFX.<camelName>`.
- Common options:
  - `font`: the key of a font file in `redesign/assets/fonts/`;
  - `text`;
  - `size`: maximum px;
  - `minSize`: wrap threshold;
  - `fill`: the share of the width to use, default .94;
  - `align`: `'center'` or `'left'`;
  - `lineHeight`;
  - `pad`: canvas bleed in em;
  - `track`: extra letter spacing in em;
  - `delay` and `duration` in seconds;
  - `hold`: the pause before a loop restarts;
  - `loop`: per instance; otherwise the global `LetterCore.setLoop(bool)` applies;
  - `idle: false`: stop drawing once the animation is done;
  - `seed`.
- Effect-specific options are listed in each file's header. Examples: `LightPaint {palette:'dawn'|'ice'}`, `PencilScribble {colors, edge, boil:'twos'|'off'}`, `InkBrush {ink, dab:'brush-dab'|'brush-stroke'}`, `SketchPass {passes, colors, wash}`, `RedCord {width, texture:'cord-tile'|'cord-tile-silk'}`, `Constellation {line, warm}`, `ChalkPastel {colors, edge}` and `NeonWrite {color:'rose'|'azure'|'gold'|{tube,core,glow}}`.
- Any effect can take any font:
  - Single-line fonts feed their pen paths directly.
  - Outline fonts give contours, and the effects that need centre-lines (ink, cord, constellation, neon) get them from `LetterCore.skeleton()`.
- Animation starts when the element first scrolls into view. It pauses while off screen and re-lays-out on resize.
- With `prefers-reduced-motion: reduce`, only the final frame is drawn: no idle motion and no replay animation.
- Fonts:
  - Outline fonts are Latin-subset WOFF files stored as base64 in `window.LETTER_FONTS[key]`, parsed by opentype.js 1.3.4.
  - Single-line fonts are SVG-font glyph tables in `window.LETTER_SLFONTS[key]`, parsed by `core.js`.
  - Both work over `file://`. Each font file's header carries its license and source.
- Textures live in `redesign/assets/lettering/tex/` (Codex, see `PROMPTS.md`) and are loaded relative to `core.js`. Every effect has a procedural fallback if a texture is missing. Effects never read pixels back from texture canvases, so `file://` tainting is harmless.

## Files

- `redesign/assets/lettering/`: `core.js` and the eight effect modules, plus `tex/` (cord tiles, brush dab and stroke, pencil grain, chalk tooth, paper tooth).
- `redesign/assets/fonts/`:
  - outline fonts: `shippori-mincho-font.js`, `mochiy-pop-font.js`, `kaushan-script-font.js`, `dm-serif-display-font.js`, `shrikhand-font.js`;
  - single-line fonts: `ems-allure-font.js`, `ems-nixish-font.js`, `ems-osmotron-font.js`, `relief-singleline-font.js`.
- This folder: `index.html`, `lab.css`, `lab.js`, `sky.js` and `PROMPTS.md`.
- Screenshots: `redesign/shots/v11-lettering/`.
