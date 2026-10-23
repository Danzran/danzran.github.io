# Portfolio review — 2026-10-20

Codex reviewed the current root portfolio at the user's request for an objective opinion. This was an assessment; no portfolio implementation or content was changed. Recommendations below are agent judgments, not approved user decisions.

## Evidence

- Read the shared handoff, root HTML, v12 folder prompts, relevant CSS/JS, golf case study, and golf annotation notes.
- Ran [review.cjs](review.cjs) using Windows Node and headless Chrome with software WebGL, loading the local root `index.html` via `file://`.
- Captured hero, Now, Work, Experience, and About at 1440×900 and 390×844 with touch/mobile emulation on the latter. Results: [report.json](report.json). No page errors or failed requests were recorded. Document width matched the viewport at both sizes.
- Inspected all ten PNG captures. Representative evidence: [desktop hero](desktop-hero.png), [desktop work](desktop-work.png), [desktop experience](desktop-experience.png), [phone hero](phone-hero.png), and [phone work](phone-work.png).
- Page height: 10,858 px desktop (~12.1 viewports) and 13,430 px phone (~15.9 viewports). Experience alone occupies 3,763 px on desktop. These are layout measurements, not user-engagement findings.

## Assessment and proposed priorities

- The continuous illustrated sky, lettering and handstand establish a distinctive personal identity. Safe Ship's concrete production work and the product-specific Spreed preview provide the strongest engineering evidence.
- The hero's strongest proof (40,000+ calls/day) is a small annotation; the main actions emphasize exploration and the song puzzle. Suggest bringing a concrete value statement and a clear work/resume action into the primary hierarchy.
- Readability competes with the detailed sky. At the captured desktop Experience position, the first entry's text is blurred and faint while the Milky Way passes behind it. This is an observed scroll state, not a claim that all entries stay unreadable. Phone timeline text is substantially clearer.
- On the phone hero, the fact plates overlap the upper part of the handstand figure. The phone Spreed card starts with a tall product demo, placing its title and explanation below the initial section viewport. The nav requires horizontal scrolling to reveal Contact.
- Safe Ship is repeated across Now, Experience, and About. Older technical exercises plus full locksmith/IT entries make the page long relative to the strongest work. Suggest prioritizing Safe Ship, Spreed and Golf, then compressing supporting material.
- Project proof needs more context: "98% on MNIST" does not specify evaluation setup; "−7% RMSE" omits its baseline. The golf case study distinguishes the app and page demo in one paragraph but its combined Sensor → Pose model → Feedback sequence leaves their actual relationship ambiguous. Suggest clearly separating shipped wearable work from the portfolio's video/MediaPipe visualization and noting measurement uncertainty.
- Current Safe Ship Experience shows "current job" rather than a date range and uses the company as the card heading rather than an actual role title. Resume is linked only at the footer; no direct email link is present.

## Limits

No live deployment, real phone, performance benchmark, contrast-ratio audit, screen reader, keyboard interaction, reduced-motion behavior, song playback, or external project/repository verification was tested in this review. Screenshots sample animation states; motion quality was not judged through continuous playback. No commit, push, branch switch or publication was performed. Existing unrelated working-tree edits were preserved.
