# After Effects toolkit findings (G: drive, 2026-10-18)

Read-only search of `G:\Program Files\Adobe`, `G:\Program Files\Common Files\Adobe`, `G:\Editing`, and `G:\Boris Continuum Complete 9`. `G:\Users\pondu` was permission-denied, so personal User Presets/Scripts there are unknown.

## Daniel's scribble preset: Unchained's SCRIBBLE PRESETS

Daniel remembered "a preset for scribble with low / medium / high versions". It is the `SCRIBBLE PRESETS` comp in `G:\Editing\Unchained\Unchained's 2D Presets and Elements (CC12).aep` (2016; there is also a CS6 copy and a converted copy in `Project Files`). Daniel used it in `OCE Trash.aep` (Low and High scribble layers). There are nine layers, each marked "(COPY FROM HERE)": LOW / MID / HIGH, each in a normal, CHOPPY or VERY CHOPPY version.

Each layer has three stacked Turbulent Displace effects, named "Unchained's Low/Mid/High Scribble". Every one has its Evolution set to `wiggle(8,1000)`, Displacement Type left at the default, Offset at the centre, and Complexity at the default. Values were parsed from the binary `cdat` chunks:

| Preset | TD 1 amount / size | TD 2 | TD 3 |
|---|---|---|---|
| LOW  | 3 / 50  | 3 / 25  | 10 / 5 |
| MID  | 6 / 50  | 7 / 25  | 17 / 5 |
| HIGH | 13 / 50 | 15 / 25 | 34 / 5 |

CHOPPY adds Posterize Time at 15 fps, and VERY CHOPPY adds it at 10 fps. The *Beautiful World* project uses the same `wiggle(8,1000)` Turbulent Displace trick, about 930 times.

The web port is `redesign/assets/lettering/unchained-scribble.js`, and the lab is `redesign/drafts/v12-scribble-lab/`.

## The "Beautiful World" reference edit — project file found

`G:\Editing\Beautiful World\Red Bombs.aep` (+ CS6 / CC12 copies, 2016) is the purchased project file for *Beautiful World ft Bombs* by dreams — the video already named in DESIGN-PROGRESS as the scribble reference. Effect tally from the binary (`strings`):

| Effect / data | Count | What it does to the look |
|---|---|---|
| **Turbulent Displace**, Evolution = `wiggle(8,1000)` | 932 | Evolution jumps to a new random value ~8×/s → outlines **boil/mutate** organically |
| Paint strokes (`ADBE Paint Atom/Shape`) on 74 Paint groups | ~4,983 | Frame-by-frame **hand-painted** strokes (write-ons, scribbles) |
| Red Giant **ToonIt Sketch** (Universe) | 28 | Image → pencil/ink sketch outlines |
| **BCC Pencil Sketch** | present | Second sketch pass |
| Tile, Displacement Map, Fractal Noise | 1054 / 106 / 146 | Texture-driven warps |
| Posterize Time, Roughen Edges | 71 / 58 | Stepped cadence, ragged edges |
| Optical Flares, Glow, Camera Lens Blur, `wiggle(1,5)` | — | Dreamy light, soft drift |

No `ADBE Scribble` (the stock Generate > Scribble effect) appears in this project or any `.aep` under `G:\Editing`.

## The user's own projects (`G:\Editing\Project Files\`, 2015–16)

Gaming montages. Recurring toolkit: Twixtor (everywhere), Sapphire (S_Shake, S_FilmDamage, S_TimeWarpRGB, S_CartoonPaint in Creation.aep), BCC (Ultra Glow, Film Damage, LensBlur), Glow, Turbulent Displace, Paint, Roughen Edges, Posterize Time, Particular.

## Scribble-ish candidates on disk

- Stock `Scribble.aex` (AE CC 2014 / CC 2017 Effects folders) — installed, not used in any found project.
- Pre-rendered `G:\Editing\RS3004-Stanza-30p\Misc\Simple Scribble - Left to Right.mov` / `Right to Left.mov`, `Crosshatch.mov`.
- `BCCSketch.aex`, ToonIt Sketch, Sapphire `Sketchy Cartoon` / `CartoonPaint Ink Sketch` presets (`G:\ProgramData\GenArts\Sapphire\presets\`).

## Web translation of the Beautiful World recipe

Text as SVG/canvas strokes → `feTurbulence` + `feDisplacementMap` whose `seed`/`baseFrequency` is re-randomised ~8×/s (= `wiggle(8,1000)` on Evolution) → optional second jittered pass offset slightly (sketch double-line) → stroke-dashoffset write-on for the painted strokes.
