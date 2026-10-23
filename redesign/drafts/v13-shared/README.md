# v13 portfolio directions

Delivery branch: `redesign` (developed on `design/portfolio-next`; commit and push explicitly authorized on 2026-10-23). The root page still uses **Observatory** from the initial implementation; its design recommendation was withdrawn after the owner rejected the visual direction. Studio and Skyline are complete alternatives. The user has not selected a favorite. The live GitHub Pages site has not been changed.

## Preview

From the repository root:

```sh
python3 -m http.server 8000
```

- Comparison gallery: `http://localhost:8000/redesign/drafts/v13-gallery/`
- Current root candidate: `http://localhost:8000/`
- Observatory: `http://localhost:8000/redesign/drafts/v13-observatory/`
- Studio: `http://localhost:8000/redesign/drafts/v13-studio/`
- Skyline: `http://localhost:8000/redesign/drafts/v13-skyline/`
- Original design: `http://localhost:8000/redesign/drafts/v12-sky/`

Direct opening from disk is supported by the revised asset-loading design. Shared interactions use a classic deferred script, and the golf study loads the existing JavaScript-wrapped data rather than fetching JSON. Keep the repository folders together so relative asset paths resolve.

## What changed

- Three art directions, each with a homepage, Safe Ship case study, and golf case study.
- Engineering context and résumé access in the introduction; fewer competing hero elements.
- Spreed remains the featured personal project, with an actual reader and comprehension interaction.
- Safe Ship's call infrastructure, AI review, partner portal, and API decomposition get their own story.
- Phone navigation uses an explicit menu with Escape handling and accessible expanded state.
- Direct email, clipboard copy with a graceful fallback, and clear GitHub/LinkedIn/résumé links.
- Reader, swing, and original muted editing reel play automatically in view, with pause controls. Reduced motion disables automatic playback; offscreen and hidden-tab playback pauses.
- Reduced-motion handling, an ambient-motion control, visible focus styles, a skip link, and readable no-JavaScript content.
- Fonts are self-hosted WOFF2 with OFL license files. The application uses no external runtime packages or scripts.
- A generated observatory illustration is retained as a source PNG and optimized WebP ingredients. Exact prompt: [PROMPTS.md](PROMPTS.md).
- The promotion utility now rebases responsive `srcset` URLs, as well as `src`, `href`, and `poster`.

## Edit and rebuild

- Shared copy/layout and case studies: `redesign/tools/build_v13.py`.
- Shared presentation: `redesign/drafts/v13-shared/style.css` and `fonts.css`.
- Interactions and lightweight atmosphere: `redesign/drafts/v13-shared/app.js`.
- Gallery: `redesign/drafts/v13-gallery/index.html`.
- `sky.js` is generated from the original v12 sky, with a frame cap, pause hook, and event-driven reduced-motion fallback. Edit its generation step rather than changing the derived script alone.

```sh
python3 redesign/tools/build_v13.py
python3 redesign/tools/promote.py v13-observatory
```

Promotion writes the branch-local root file. It does not commit, push, or deploy.

## Validation

The browser acceptance report is `redesign/shots/v13/validation.json`. It covers 34 layouts, 18 automated axe accessibility scans, mobile navigation, both case studies, responsive images, demo controls, quiz answers, clipboard, motion settings, gallery controls, and no-JavaScript navigation/contact. The recorded run passed without runtime errors or failed requests.

The isolated local mobile Lighthouse summary is `redesign/shots/v13/lighthouse-summary.json`: 96 performance, 100 accessibility, 100 best practices, 100 SEO; 0 ms total blocking time and zero cumulative layout shift. The result is a local lab measurement.

The verifier requires Playwright and optionally axe-core. They are development tools, not site dependencies. With the local server running and Playwright available to Node:

```sh
node redesign/tools/verify_v13.cjs \
  --base=http://127.0.0.1:8000 \
  --axe=/path/to/axe-core/axe.min.js \
  --report=/tmp/portfolio-validation.json
```

Set `PORTFOLIO_CHROMIUM` if Chromium is not at `/usr/bin/chromium`. Screenshots and a compact comparison sheet live under `redesign/shots/v13/`.

## Content boundaries

The source is the existing public page, résumé, approved entries in `DESIGN-PROGRESS.md`, and `redesign/SAFE-SHIP-AUDIT.md`. No new employment dates, customer figures, financial amounts, or calibrated sports measurements were invented. The 40,000+ daily call figure refers to metadata; recording eligibility and sales-call AI review are distinguished in the case study. The golf visualization is a separate illustrative 2D study, not a screenshot of the wearable app.

The original PDF résumé is unchanged and predates the site's Safe Ship material. Its update needs the owner's actual employment dates and preferred résumé wording. Earlier projects and artwork remain available in the original drafts.

Automated checks and browser emulation do not establish real-device performance or manual screen-reader usability. Lighthouse results are local lab measurements and can vary by load and hosting. A numerical design rating remains a judgment; the delivered pages and validation evidence are the reviewable result.

## Motion repair — 2026-10-23

The first delivery used an ES module and a JSON fetch, which were incompatible with the owner’s direct-from-disk preview workflow. They have been replaced by a classic deferred runtime and the existing JS-wrapped swing data. Reader, swing, and muted reel now play in view with explicit pause and reduced-motion handling. `redesign/tools/verify_v13_motion.cjs` measures actual canvas pixels, changing frames, media time, CSS transforms, sky time and scroll response. Its report is `redesign/shots/v13/motion-validation.json`.

The managed Chromium in this environment blocks `file://` navigation before page load. Direct-file delivery was checked for classic script/data compatibility and existing asset paths, but end-to-end direct-file browser validation remains unverified. HTTP browser motion checks passed. This functional repair does not resolve the owner’s rejection of the visual design.
