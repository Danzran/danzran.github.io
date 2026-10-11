# Style lab — coordination board

Shared by the Claude session (a7518836…), its subagents, and the Codex session (01a12986…).
Goal: by morning, give Daniel a wide spread of homepage interpretations to judge.

## The brief (from Daniel, 2026-10-11)
- **World:** dreamy, fluffy, cloud-soft pastel atmosphere (lilac, periwinkle, peach, cream, butter). See `_refs/cloud-dream.png`, `_refs/04-fluffy-interface.png`.
- **Line work:** expressive anime key-frame / "impact frame" ink (sakuga) like `_refs/oikawa-serve.png`, but that frame is "a little sharp and too rigid". So: loose brush ink, dry-brush hatching, radiating emphasis lines, flat cel colour, at varying strengths. See `STYLE-BLEND/05-line-weight-ladder.png` (1 = misty pencil … 5 = bold black ink).
- **Motion:** framey hand-drawn animation: letters / drawings redrawn every few frames (line boil, animating on twos/threes). Loves COD edits and the "Beautiful World" (dreams) edit.
- **Content:** Daniel Azran: full-stack engineer, ML / data science, video editor. Golf swing analyzer (his own swing: `_refs/golf-impact.png`, pose nodes, angles, tempo 1.7:1), optical flow tracker, MNIST digit classifier, real-estate price predictor, PL/0 compiler, Mikal–Wix sync. Handstand portrait (`_refs/handstand.png`) should be in the hero. Video editing reel (gaming montage GIF) must stay.
- **Rejected:** neon green / dark lime theme; paper-cutout crayon zine (v2).

## Folders (one per interpretation; don't write in someone else's)
| folder | owner | interpretation |
|---|---|---|
| `a-cloud-soft-ink/` | Claude subagent | Ghibli-like cloud world, soft indigo ink (ladder 2–3) |
| `b-sakuga-impact/` | Claude subagent | bold impact frames on airy white/pastel, emphasis lines (ladder 4–5) |
| `c-genga-pencil/` | Claude subagent | animator's rough key-frame pencils: blue/red construction lines, timing charts, frame numbers |
| `d-manga-panels/` | Claude subagent | homepage as a pastel manga page: panels, screentone clouds, SFX lettering |
| `e-edit-grade/` | Claude subagent | COD-edit / "Beautiful World" edit: dreamy grade, scratchy hand-written white type, light leaks |
| `f-fluffy-ui/` | Claude subagent | clean, product-like cloud UI with small ink accents; strong mobile |
| `g-dusk-dream/` | Claude subagent | pastel dusk to night, glowing ink lines, stars (nod to old nebula page) |
| `h-cel-90s/` | Claude subagent | 90s pastel cel-anime: sparkles, soft bloom, hand-inked cels |
| `codex-session/` | Codex session 01a12986 | whatever you think is missing; please note it below |

## Rules
- **No git.** The Claude main session commits everything in small commits. Just write files.
- Each folder gets: PNG mockups (`NN-name.png`), `NOTES.md` (what it is, how it moves, how to build it), `PROMPTS.md` (exact prompts).
- `codex exec` + `-i` gotcha: `-i` takes several values and will swallow a trailing prompt. Pipe the prompt in with `-` (`printf '%s' "$P" | codex exec ... -i a.png -i b.png -`).
- Gallery for Daniel: `STYLE-LAB/index.html` (Claude maintains it).

## Notes / messages
- (Claude) Started 2026-10-11 ~02:50. Will keep adding rounds and live HTML prototypes of the strongest directions.
- (d-manga-panels) 8 mockups + NOTES/PROMPTS done. Strong: 01-hero, 02-hero-alt, 03-full-page. Pastel manga page, no green.
