# v9 brief: night base, round 3 (2026-10-11)

Every agent on this round, Claude or Codex, reads this first. It combines:
- the Claude session `a7518836-399a-42e2-bfc1-a8af13df88ac`: the STYLE-LAB rounds, prototypes v1 to v8;
- the parallel Codex session `01a12986-452c-70b2-ada3-b51db1cc7d78`: the research, CLOUD-MOCKUPS, HANDSTAND-DRAFTS and STYLE-BLEND.

## What Daniel said about v8 Tide (verbatim)

> still not quite.. i like that tide one but still not what im going for. and the scribble effect is too framey. It should really be like mutating and smoother. like that youtube video I sent you. [...] I do like the style of the cards and especially what was done with the video. I wish it had the ball included in there though and the clubhead so it would be nice if you could have the codex agent figure that out. The water effect is cool, especially on the hero page but the one that goes down as you scroll isn't good. Experience should be on some kind of creative, visually appealing timeline and holy shit i just saw the dark mode that one is way better. I love the dynamics of it much more we are going to be using that as the base. Cursor effect sucks, try something else. and have codex make panned shots from the handstand pose so we can twist the perspective a bit. however many frames you need.

## Decisions

### Keep
- The **night tide** look is the base:
  - navy blue-hour sky, moon, stars, gold-lit water ribbons;
  - painted plate `assets/plate-night.webp`;
  - frosted navy cards with gold-ivory borders.
  - Live in `redesign/drafts/v9-night/`, which opens at night by default (`?day` for the old sky).
- The **card style**, especially the golf video card: the real swing with pose nodes, angles and stats.
- The **hero water spiral** around the handstand, and the intro drop → splash → spiral.

### Remove (already removed in v9)
- The river that grows down the page as you scroll.
- The cursor water trail.

### Change
- **Scribble/boil is too "framey".** v8 swaps 3 drawings per letter at about 7 fps, which reads as stepping.
  - Daniel wants the lines **mutating and smoother**: continuously morphing, never popping between discrete drawings.
  - Reference: "Beautiful World" by dreams, a COD edit (https://www.youtube.com/watch?v=flL7hff_WRc). Frames are saved, gitignored, in `STYLE-LAB/_refs/beautiful-world/`:
    - `scribble-text-15-consecutive-frames.jpg`: the outro "thanks for watching" text. Scratchy, distressed hand-lettered glyphs.
      - Each frame the edges are slightly different, but the change is continuous.
      - Letters arrive at different times, with a soft ghost/echo smear and a little glow.
      - Strokes have dry, torn ends.
    - `roto-outline-16-consecutive-frames.jpg`: painted white outline strokes hugging shapes in the footage. The strokes crawl and reshape smoothly frame to frame, like a rotoscoped paint-on.
    - `contact-sheet.jpg`: the whole edit. Teal and cream grade, bright haze, painted textures.
- **Golf card:** add the **club head and the ball** to the analysed swing.
  - Track them in the real footage and draw them with the same node/annotation language.
  - Club head: a node plus a fading club-path arc. Ball: position at address, then the launch after impact.
- **Experience:** a **creative, visually appealing timeline** in place of the current stacked cards.
- **Cursor:** try other cursor effects, and nothing like the water trail.
- **Hero perspective:** Codex makes **panned or orbit shots of the handstand pose**, so we can turn the camera around Daniel a little on scroll. Use as many frames as needed.

## Hard rules (unchanged from the start)
- **Colour:** pastel and luminous. Blue, azure, ivory and gold. Pink only as a small accent. **No green anywhere**, and that includes teal that reads green.
- **Lettering:** keep the brush lettering, and keep the video-editing GIF/reel (`assets/video/edit.mp4`).
- **The handstand is Daniel.** Source photo: `handstand.PNG` in the repo root. Feathered cutouts: `redesign/drafts/v3-cloud-ink/assets/fig-0..2.webp`.
- **Do not invent facts.**
  - Real projects: Golf Swing Analyzer (Extropian, Flutter/Dart/Firebase/Bluetooth), Optical Flow Tracker, MNIST Digit Classifier, Real Estate Price Predictor, PL/0 compiler, Mikal–Wix sync.
  - Real jobs: video editor 2014–2020; systems assembler & IT 2018–now; lockout technician 2022–23; backend developer at Extropian 2024–25.
- **Static site.** No build step; must work over `file://`.
  - Libraries only from cdnjs or jsdelivr with exact versions: GSAP 3.15.0, ScrollTrigger, Lenis 1.3.26, opentype.js 1.3.4.
- **Respect `prefers-reduced-motion`.**
- **Git:** work on the `redesign` branch, never `main`. **Never push.** Commit granularly and often; overcommitting is better than undercommitting. Use:
  ```
  git -c user.name=Danzran -c user.email=125504166+Danzran@users.noreply.github.com commit -m "..."
  ```
  End each message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (Codex: `Co-Authored-By: Codex <noreply@openai.com>`).
  - Several agents commit in parallel, so only `git add` your own paths. Never use `git add -A` or `git add .`. Never touch `index.html` or `nebula.html` at the repo root.

## Where things are
- **v9 base:**
  - `redesign/drafts/v9-night/`: `index.html`, `app.js`, `style.css`, `water.js` (ribbon renderer), `lettering.js` (current stepped boil), `golf.js` (golf card renderer).
- **Golf data:**
  - Swing data: `redesign/assets/golf/swing.js` (`window.SWING`: fps 12, 50 frames, 600x800, `kp[f][i] = [x, y, vis]` normalised MediaPipe landmarks, phases, per_frame).
  - Stylised frames: `redesign/assets/golf/g00..g49.webp`.
  - Pipeline: `redesign/tools/golf_stylize.py`. Work dir with raw frames, masks and `pose30.json`: `C:\Users\pondu\AppData\Local\Temp\claude-pptr\golf`.
  - Source video: `C:\Users\pondu\Downloads\golfswing.mov` (WSL: `/mnt/c/Users/pondu/Downloads/golfswing.mov`).
  - Windows Python with cv2, mediapipe and Pillow: `C:\Users\pondu\AppData\Local\Temp\claude-pptr\pyenv\Scripts\python.exe`.
  - ffmpeg: `...\pyenv\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe`.
- **Screenshots:** `"/mnt/c/Program Files/nodejs/node.exe" C:/Users/pondu/AppData/Local/Temp/claude-pptr/shoot.js <file:///C:/... url> <outprefix> <w> <h> <scroll stops in viewport heights>`. Run it from that folder; it has puppeteer-core and uses system Chrome.
- **Earlier Codex material:**
  - `HANDSTAND-DRAFTS/CAMERA-PATH.md` (scrolling camera around the body: hero → hands → torso → feet → release).
  - `CLOUD-MOCKUPS/`, `STYLE-BLEND/`, `redesign/PAPER-VFX-RESEARCH.md`.
- **Gallery:** `STYLE-LAB/index.html`, rebuilt with `python3 redesign/tools/build_gallery.py`.

## Daniel's answers (same day, after the brief)
- **Scribble:** skip his own tool and build the smooth mutating version for the web.
- **Orbit:** a subtle twist, ±40–60°.
- **Day sky:** dropped entirely. v9 is **night only**. The day/night, cadence and ink toggles are removed.
- **Removed from v9:** the dive transition, the ink picker, and the drop/splash intro.
- **Kept:** the golf case-study page (`golf.html`, now night).
- **Smoothness:** water contours now mutate smoothly (`Water.setTime`), and the figure no longer swaps drawings.
