# h-cel-90s: 90s pastel cel anime

## What it is
An original take on a nostalgic 90s pastel cel look: hand-inked cels with slightly
imperfect lines (ink strength about 3 of 5, warm indigo-plum rather than black), flat
cel shading with one soft shadow tone, airbrushed peach-to-lilac skies, sparkle glints
and soft bloom, and a faint VHS/laserdisc softness with grain. Warm, playful and dreamy.
Palette: lilac, periwinkle, peach, cream, butter yellow, rose pink, dusty plum. No green.
Built on the same handstand figure and cloud mood as the brief, but not based on any
existing show or character.

## Status
- 01-hero.png: desktop hero. Works as a mood piece. Lines are cleaner than the brief
  asked for and the grain is light.
- 02-hero-alt.png: title-card / eyecatch with a framed scene and a crescent cloud moon.
  The strongest image in the set for the 90s feel.
- 03-projects.png: 2x2 project cards (golf with pose nodes and "tempo 1.7:1", optical
  flow, digit classifier, price predictor). Readable. Card backgrounds drift painterly.
- 04-experience.png: timeline plus the video-editor reel frame. The years and job titles
  are invented, not Daniel's real history. Replace them before any real use.
- 05 (mobile), 06 (full page), 07 (style sheet): NOT produced. Codex hit its usage
  limit during 05 and the run stopped there.

## How it moves
Designed for framey animation on twos or threes: the figure and sparkles redraw every
few frames, line boil on the ink edges, and the bloom pulses slowly. Nothing is animated
in these PNGs yet. A live version would step through 2-3 redrawn key frames per element.

## How to build it
1. Keep the handstand reference (`../_refs/handstand.png`) and cloud reference
   (`../_refs/cloud-dream.png`) in `../_refs/`.
2. Generate with Codex, one at a time. Each call takes 1 to 3 minutes. Use the prompt
   blocks in `PROMPTS.md`, saved as `PROMPT.txt`, and run:
   `cat PROMPT.txt | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra -i ../_refs/handstand.png -i ../_refs/cloud-dream.png -`
3. Put the Codex output PNG in this folder under the name the prompt asks for.
   Codex sometimes spells text oddly, so check any words in the image.
