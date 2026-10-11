# Style lab — coordination board

Shared by the Claude session (a7518836…), its subagents, and the Codex session (01a12986…).
Goal: by morning, give Daniel a wide spread of homepage interpretations to judge.

## The brief (from Daniel, 2026-10-11)
- **World:** dreamy, fluffy, cloud-soft pastel atmosphere (lilac, periwinkle, peach, cream, butter). See `_refs/cloud-dream.png`, `_refs/04-fluffy-interface.png`.
- **Line work:** expressive anime key-frame / "impact frame" ink (sakuga) like `_refs/oikawa-serve.png`, but that frame is "a little sharp and too rigid". So: loose brush ink, dry-brush hatching, radiating emphasis lines, flat cel colour, at varying strengths. See `STYLE-BLEND/05-line-weight-ladder.png` (1 = misty pencil … 5 = bold black ink).
- **Motion:** framey hand-drawn animation: letters / drawings redrawn every few frames (line boil, animating on twos/threes). Loves COD edits and the "Beautiful World" (dreams) edit.
- **Content:** Daniel Azran: full-stack engineer, ML / data science, video editor. Golf swing analyzer (his own swing: `_refs/golf-impact.png`, pose nodes, angles, tempo 1.7:1), optical flow tracker, MNIST digit classifier, real-estate price predictor, PL/0 compiler, Mikal–Wix sync. Handstand portrait (`_refs/handstand.png`) should be in the hero. Video editing reel (gaming montage GIF) must stay.
- **Rejected:** neon green / dark lime theme; paper-cutout crayon zine (v2).

## UPDATE ~02:35: Daniel's latest direction (via the Codex session, see CLOUD-MOCKUPS/EFFECTS-REFERENCE-GUIDE.md)
- **Cotton Sky (CLOUD-MOCKUPS/01) is the closest so far.** Add **stylized elemental water**: broad flowing water ribbons with curling S-curves, white foam bands, tapering ends (anime "water breathing"-type effects, ukiyo-e influenced), with foam dissolving into cloud mist. See `CLOUD-MOCKUPS/05-elemental-flow.png`.
- **Palette shift:** powder blue, azure, slate-indigo, ivory, restrained sunlight gold. Much **less pink/lavender**.
- **Motion:** big currents move smoothly; drawn surface details (foam, lettering, outlines) change on a slower replacement cadence.
- Round 2 (after the Codex quota reset at 6:05) should explore THIS direction with the handstand, golf swing and projects.

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
- (g-dusk-dream, Claude subagent) 01 to 05 done (hero-sunset, projects-twilight, experience-night, contact-stars, full-page). 06-mobile and 07-style-sheet NOT done: Codex usage limit hit, retry after 6:05 AM. See g-dusk-dream/NOTES.md and PROMPTS.md.
- (a-cloud-soft-ink) Done 2026-10-11: 01-07 generated; 08-style-sheet blocked by Codex usage limit (resets ~6:05 AM), prompt ready in PROMPTS.md. Note: scratchpad dir 'p/' was shared with another agent; use per-agent dirs.
- (f-fluffy-ui, Claude subagent, 2026-10-11) Produced 01 to 06 (hero, projects, experience, mobile hero, mobile projects, full page). 07-components not made: Codex usage limit, retry at 6:05 AM. Files: STYLE-LAB/f-fluffy-ui/NOTES.md, PROMPTS.md.
- (h-cel-90s subagent, 2026-10-11 ~03:00) 01-04 done in h-cel-90s/ (hero, title-card alt, projects, experience+reel). 05 mobile failed: Codex usage limit, retry after 6:05 AM. 06 and 07 not started. Years/titles in 04 are placeholders.
- (b-sakuga-impact subagent) Only 01-hero, 02-hero-alt (+01b variant) done; Codex usage limit hit until 6:05 AM, so 03-09 not generated. Prepared prompts are in b-sakuga-impact/PROMPTS.md.
- (e-edit-grade) 7/8 mockups done in e-edit-grade/ (01-06, 08); 07 storyboard blocked by Codex usage limit until ~6:05 AM, rerun `./run.sh p/07-motion-storyboard.txt`.
- (d-manga-panels) Round 2 (09-14) blocked: Codex usage limit until 6:05 AM. Prompts saved in PROMPTS.md; rerun with d-manga-panels/RUN-ROUND2.sh.txt.
