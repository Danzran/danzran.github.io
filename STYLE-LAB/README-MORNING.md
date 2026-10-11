# Good morning: what's here

**Start by double-clicking `STYLE-LAB/index.html`.** It's one gallery with every mockup plus links to the live prototypes. Click an image to enlarge it (← → to flip), press **S** or click ★ to star what you like, then hit **"copy my ★ picks"** and paste the list back to me.

Everything is on the `redesign` branch, committed in small steps, not pushed. Your live `index.html` is untouched.

## New this morning: the water round (top of the gallery)

After the Codex quota reset at 6:05, every style agent first filled in its missing images. Each then drew your latest direction, **Cotton Sky + elemental water**, in its own style. The palette is blue/azure/ivory/gold, with less pink and no green.

All 23 of those mockups sit side by side in the first gallery section, **"Water round · all styles"**. They also appear in each agent's own folder below it.

My picks from looking at them all together:

| Want | Look at |
|---|---|
| Boldest hero (ink + motion) | `b-sakuga-impact/21-water-hero.png`, `d-manga-panels/21-water-hero.png` (FWOOSH) |
| Softest / most "drawn" hero | `c-genga-pencil/2a-water-hero.png` (pencil construction lines and an onion-skin ghost) |
| Most cinematic hero | `e-edit-grade/21-water-hero.png` (cloud castles, REC/timeline chrome) |
| Cleanest, most buildable hero | `g-dusk-dream/2x-water-hero.png`, `f-fluffy-ui/2x-water-hero.png` |
| Golf card | `c-genga-pencil/2b-water-golf-card.png`, `b-sakuga-impact/22-water-projects.png` |
| Whole-page flow (one river down the page) | `c-genga-pencil/2c-water-full-page.png`, `g-dusk-dream/2x-water-full-page.png` |

The agents agreed on one thing: the water hero (`21` / `2a` / `2x-water-hero`) was the strongest image in every style.

**Round 3 (`STYLE-LAB/water-r3/`)** tunes that direction:
- **`31-ink-ladder.png`**: the water hero at ink strengths 1–5. Reply with a number.
- **`32-river-storyboard.png`**: how v8 Tide behaves on scroll.
- **`33-night-tide.png`**: a blue-hour version with gold glowing water. It's gorgeous and could work as a dark mode or the end of the scroll.
- **`34-water-closeups.png`**: the parts of the water effect, with hex codes. v8 now uses this palette.
- **`35` / `36`**: the two green-flawed mockups, recoloured.
- **`41`–`45`** (round 4): a golf project detail page, the intro storyboard (now built into v8), a "DA" water monogram/favicon sheet, a phone hero that keeps your real outfit, and a 404 page.
- **`51`–`55`** (round 5): experience as a river timeline, an about section, a **horizontal-scroll** panorama (an alternative layout), a **dive-through-the-water** section transition, and the full night-tide page.

Known flaws in the water round:
- **Green that slipped in.** The first two below are fixed in water-r3 (`35`, `36`).
  - A fairway patch in `b/23-water-full-page`.
  - A hillside in `h/2x-water-projects`.
  - A teal beanie on the golfer in `a/22-water-projects`.
- **Invented copy.** Stats like club speed and hip turn, and extra project names in the full-page mockups, are made up.
- **Redrawn people.** The golfer is a redraw, not you.

## Live prototypes (these actually move; open in Chrome)

| | What it is | Try this |
|---|---|---|
| **v8 · Tide** `redesign/drafts/v8-tide/` | **Start here.** Newest, built from the water round. The hero is a painted Codex sky plate with your live handstand, ribbons and lettering on top. One inked water river runs the whole page. It starts from the ribbons wrapped around your handstand and grows downward as you scroll. It weaves between frosted-ivory cards and ends in a calm pool at Contact. The sky warms from azure to gold as you go down. | Scroll slowly and watch the river lead you. Move the mouse to stir a little water. Use the toggle to compare on twos vs. smooth. Click **☾ night tide** (bottom left) for the blue-hour version, where the water glows gold. Open `index.html?night` to start at night. On load, a drop falls, splashes, and unspools into the ribbon (`?nointro` skips it). The golf card's **"read the case study →"** link opens `golf.html`, a project-page template. Between Work and Experience, the page **dives through the water** (from round 5, `54`). |
| **v5 · Elemental flow** `redesign/drafts/v5-elemental/` | Built on the Codex session's "Cotton Sky + water" mockup (your latest direction). The painted water actually flows (WebGL flow map). Stylized water ribbons wrap your handstand. Scrolling flies the camera hands → torso → feet, with a chapter card at each stop. | Move the mouse over the water (it swirls). Use the bottom-right toggle to compare smooth water vs. "on twos". |
| **v6 · The edit** `redesign/drafts/v6-edit/` | COD-edit / Beautiful World: your handstand colour-graded, glowing scratchy white title, REC + timecode, flash-frame cuts, letterbox. The work section is an edit bay, and scrolling drags the playhead through your projects. | Scroll slowly through "the work". |
| **v4 · Sakuga** `redesign/drafts/v4-sakuga/` | Impact-frame energy: black brush ink, concentration lines redrawn on threes, inverted flash + shake on impacts, smear-frame entrances, manga panels. | Scroll fast past the panels. |
| **v7 · Manga page** `redesign/drafts/v7-manga/` | Direction D built for real: the page is a manga chapter on paper. Screentone clouds, speech-bubble nav, SFX (FWOOP, SWISH, ZIP), and panel borders that boil. Panels wipe open on threes as you read down. | Scroll at reading speed. |
| **v3 · Cloud soft ink** `redesign/drafts/v3-cloud-ink/` | Calm Ghibli-like sky, drifting fluffy clouds, your inked handstand with redrawn light rays. You "sink into the clouds" on scroll. | |

All six share:
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

- **Codex image quota.** It ran out at about 3am. After the 6:05 reset, every missing image was generated, so all folders are complete.
- **Your likeness.** The AI-drawn figures resemble your handstand but aren't exact. The prototypes use a redraw of your actual photo.
- **Invented details.** Some mockups contain made-up job titles or dates. Ignore those; they're layout placeholders.
- **Not tested on a phone.** The prototypes were tested in headless Chrome at desktop and phone width, not on a real phone.
