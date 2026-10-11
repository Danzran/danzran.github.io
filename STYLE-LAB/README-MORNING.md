# Good morning: what's here

**Start by double-clicking `STYLE-LAB/index.html`.** It's one gallery with every mockup plus links to the live prototypes. Click an image to enlarge it (← → to flip), press **S** or click ★ to star what you like, then hit **"copy my ★ picks"** and paste the list back to me.

Everything is on the `redesign` branch, committed in small steps, not pushed. Your live `index.html` is untouched.

## Live prototypes (these actually move; open in Chrome)

| | What it is | Try this |
|---|---|---|
| **v5 · Elemental flow** `redesign/drafts/v5-elemental/` | Built on the Codex session's "Cotton Sky + water" mockup (your latest direction). The painted water actually flows (WebGL flow map). Stylized water ribbons wrap your handstand. Scrolling flies the camera hands → torso → feet, with a chapter card at each stop. | Move the mouse over the water (it swirls). Use the bottom-right toggle to compare smooth water vs. "on twos". |
| **v6 · The edit** `redesign/drafts/v6-edit/` | COD-edit / Beautiful World: your handstand colour-graded, glowing scratchy white title, REC + timecode, flash-frame cuts, letterbox. The work section is an edit bay, and scrolling drags the playhead through your projects. | Scroll slowly through "the work". |
| **v4 · Sakuga** `redesign/drafts/v4-sakuga/` | Impact-frame energy: black brush ink, concentration lines redrawn on threes, inverted flash + shake on impacts, smear-frame entrances, manga panels. | Scroll fast past the panels. |
| **v7 · Manga page** `redesign/drafts/v7-manga/` | Direction D built for real: the page is a manga chapter on paper. Screentone clouds, speech-bubble nav, SFX (FWOOP, SWISH, ZIP), and panel borders that boil. Panels wipe open on threes as you read down. | Scroll at reading speed. |
| **v3 · Cloud soft ink** `redesign/drafts/v3-cloud-ink/` | Calm Ghibli-like sky, drifting fluffy clouds, your inked handstand with redrawn light rays. You "sink into the clouds" on scroll. | |

All four share:
- **Brush lettering that boils.** Each letter has 3 drawings swapped out of step: the "write every letter a few times" effect you described.
- **Your real golf swing.** Rotoscoped from `golfswing.mov` with MediaPipe pose, live angle arcs, hand path, and swing stats (tempo 1.7:1, 0.5s back, 0.3s down). The hand speed assumes a 1.70m height, so it's a rough estimate.
- **The video editing GIF.** Converted from 42MB to a 1.7MB video.

## Mockup folders (images)

- `STYLE-LAB/a…h`: eight interpretations by separate agents.
  - **a** cloud soft-ink
  - **b** sakuga
  - **c** animator pencils
  - **d** manga page
  - **e** COD-edit grade
  - **f** fluffy UI
  - **g** dusk → night
  - **h** 90s cel
  
  Each has `NOTES.md` (how it would move and how to build it) and `PROMPTS.md` (exact prompts, so you can tweak and re-run).
- `STYLE-LAB/codex-session/`: a fresh Codex-terra run's picks for what was missing.
- `HANDSTAND-DRAFTS/` and `CLOUD-MOCKUPS/`: from the other Codex session (water/cloud direction, camera path along your body).
- `STYLE-BLEND/`: the first cloud × anime-ink tests. **05 is the ink-strength ladder**; telling me a number 1–5 is a fast way to steer.

## Honest caveats

- **Codex image quota.** It ran out at about 3am (resets 6:05). Several folders are missing their last 1–3 images (mobile, style sheet, storyboard). The prompts are saved, and I'm re-running them after the reset.
- **Your likeness.** The AI-drawn figures resemble your handstand but aren't exact. The prototypes use a redraw of your actual photo.
- **Invented details.** Some mockups contain made-up job titles or dates. Ignore those; they're layout placeholders.
- **Not tested on a phone.** The prototypes were tested in headless Chrome at desktop and phone width, not on a real phone.
