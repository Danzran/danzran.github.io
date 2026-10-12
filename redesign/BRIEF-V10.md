# v10 brief: main page + "Your Name" variations (2026-10-12)

Read `redesign/BRIEF-V9.md` first; its hard rules still apply (no green or teal, no invented facts, static over `file://`, exact CDN versions, reduced motion, the handstand is Daniel, keep the video reel). Git: branch `redesign`, never push, never touch root `nebula.html`, only `git add` your own paths, and **commit once per coherent change** (not per file or tweak).

## What Daniel asked (verbatim, 2026-10-12, before going to sleep)

> make this the page that shows in main on the site. or is it already? And then we will work on it more. specifically in the timeline I think we can do more with the side that doesn't have the asset on it. Like we can put more information like I had before underneath the year/month title which we should add months there too. and also we should have the timeline be in reverse order from present to past. Also look at my commits in the safe ship moving organization for the last 7-8 months or so and make a section for that since its my current job @ Safe Ship Moving Services. find the best most impactful projects that I did, especially with ingesting the calls, the ai call analysis infrastructure, and the optimizations I made to cut our mongodb bill nearly in half ($6k less per month, over 70k per year). The timeline also takes a bit too long to scroll through so make the scrolling time a little bit less. Of course use codex to make cool assets for my recent job. If you find the logo and cool variations of it in the crispx-movers repo you can use that to make some kind of cool animated asset that fits our theme. After that, fan out subagents and use codex to keep our theme kind of but make the site more like kimi no nawa visual type stuff with the shooting stars and the cool animations. I think that's a better reference to go through than this vague one, even though we're close and the assets are coming out nicely. Make the scroll effect have something to do with the shooting stars on the hero page and also put more details in the about me, put some of those on the hero page and make the favorite song be an easter egg having something to do wtih the shooting stars. I can't stress enough to use codex to generate these assets and use good prompts. make multiple variations and keep the main page how it currently is. another thing to try as part of a different variation so we should have ones with and without what I am about to say: I want more fluffy cloud kind of containers for the cards. I'm going to sleep now so good luck

## Plan
1. **Main page** = v9 Night (`redesign/drafts/v9-night/`) with these changes, then promoted to the repo root `index.html` on the `redesign` branch (going live needs a merge to `main` and a push, which is Daniel's call):
   - Experience timeline: newest → oldest, month + year titles, the empty side carries the details from the old site (bullets + tags), shorter scroll.
   - Safe Ship Moving Services (current job): its own section plus the top timeline entry, with Codex assets.
2. **Variations** ("Your Name" / Kimi no Nawa direction, Makoto Shinkai-style skies): separate copies in `redesign/drafts/v10-*`. The main page stays as it is.
   - Shooting stars / the comet on the hero, and the scroll effect is driven by them.
   - More About details, some of them on the hero.
   - The favourite song (`tgrave.mp3`) becomes an easter egg tied to the shooting stars.
   - Variants **with and without** fluffy cloud containers for the cards.
   - Codex generates the assets, with good prompts and several variations.

## Facts available (do not invent beyond these)
- Old site + resume (`DanielAzranResume.pdf`, root `index.html` at HEAD): UCF B.S. Computer Science, 3.5 GPA; coursework DSA, Computer Organization, ML, AI, Robot Vision, OOP, Statistics; Hebrew speaker; video-editing background ("what the consumer sees is just as important as behind the scenes"); skills Java, Dart, Python, Rust, JS, React, Node, R, C/C++, Flutter, Firebase, AWS, MongoDB.
- Jobs with months:
  - Extropian, Backend Software Developer, Orlando FL, Sep 2024 – May 2025.
  - Systems Assembler & IT Technician, Freelance, Sep 2018 – Present.
  - Sonic Locksmith, Lockout Technician, Hollywood FL, Aug 2022 – Dec 2023.
  - Video Editor, Freelance, Remote, 2014 – 2020 (no months known).
- Safe Ship Moving Services (current job), from Daniel's message only:
  - call ingestion;
  - AI call-analysis infrastructure;
  - MongoDB optimisations that cut the bill nearly in half: about $6k less per month, over $70k per year.
  - The org's repos are **private**. The crispx-movers logo could not be fetched without credentials, so the start month and repo details are unknown. Do not make them up.
