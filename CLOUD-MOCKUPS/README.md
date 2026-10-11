# Cloud mockups

**Windows folder:** `C:\dev\danzran.github.io\CLOUD-MOCKUPS`

Double-click **OPEN-MOCKUPS.html** for a local image gallery. You can also open any PNG directly in your preferred image editor. Nothing needs installing or serving.

## Images

- `01-cotton-sky.png` — warm, expansive peach/blue cloud world. The generator added fantasy architecture; this is an exploratory variation rather than a requirement for the site.
- `02-lilac-cloud-dream.png` — the handstand pose integrated into lilac clouds and peach light. `handstand.PNG` was the pose reference.
- `03-cloud-material-playground.png` — cloud lettering and a family of fluffy shapes to compare. The shapes are part of one image, not separately extracted assets.
- `04-fluffy-interface.png` — a cleaner, more abstract portfolio direction where the interface forms themselves feel cloudy.
- `05-elemental-flow.png` — Cotton Sky's atmosphere with flowing blue water, white foam, and cloud mist; the latest direction after the water-effects reference.

The latest vocabulary and visual galleries are in **EFFECTS-REFERENCE-GUIDE.md**. The fifth image's exact prompt is in **05-ELEMENTAL-FLOW-PROMPT.md**.

Generated with the built-in image_gen tool. The exact prompts are in **PROMPTS.md**. These PNGs are flattened concept images, not layered Photoshop files or finished page implementations. Keep a copy of an original before editing it.

The design target is **fluffy forms and luminous atmosphere**: rounded vapor contours, dissolving edges, pastel shading, soft ambient light, and clear typography. Motion can later combine slow drift with subtle changes in painted details. The fourth concept tests how much of that feeling can come from the interface material itself.

## Beautiful World reference

The exact user reference is [Beautiful World by dreams](https://www.youtube.com/watch?v=flL7hff_WRc), confirmed from the Claude session's YouTube metadata and the actual YouTube page opened for this pass. It is approximately 2 minutes 25 seconds long. The earlier Podenco music-video example was a separate process reference, not this video.

I could inspect early frame samples around 5 and 36 seconds. The sampled game scenery has bright, diffuse highlights, muted teal, pink accents, and visible outline/texture treatment. My take is that the footage feels transformed into a dreamlike image; carrying that treatment into the portfolio's real assets could connect your editing background with the softer cloud direction.

Full playback/seeking was unreliable, so I am not claiming a complete viewing, listening session, exact beat-sync analysis, or identification of the original effects/plugins. The `reference/` subfolder contains the sampled frames and access-check screenshot for local inspection; those are video reference captures, not generated mockups.

## Video and VFX skills

Yes: maintained skills exist for both agents. [Remotion's official skills](https://www.remotion.dev/docs/ai/skills) explicitly support Claude Code and Codex. The relevant ones are:

- **remotion-markup** — practical composition, typography, animation, media, timing, and effects guidance.
- **remotion-interactivity** — structure for making compositions and controls editable in Studio.
- **remotion-render** — rendering video or still output.
- **remotion-best-practices** — routes to the relevant guidance.

I read the actual [remotion-markup skill](https://github.com/remotion-dev/skills/blob/main/skills/remotion-markup/SKILL.md). It links to specific guidance for motion blur, transitions, visual effects, timing, audio, and text annotations. Its listed effects include glow, light leaks, noise displacement, paper textures, and roughened edges. This is useful implementation knowledge; it does not determine the art direction or guarantee a particular editor's look.

For this project, my recommendation is to settle the visual material using these mockups, then use a reproducible composition workflow to animate approved artwork and treat the real footage. A short motion test will tell us more than adding a large collection of unrelated skills.

The imagegen skill is already available and was used for this pass. Remotion was researched, not installed. Optional Runway and Adobe integrations also appeared in the plugin directory, but they are not connected here and were not used to make these images.

[OpenAI Docs](https://learn.chatgpt.com/docs/build-skills) describes skills as instructions with optional scripts, references, and assets. [Claude's documentation](https://support.claude.com/en/articles/12512180-use-skills-in-claude) likewise supports custom skills. A skill can teach a repeatable editing workflow; the actual artwork, tools, and visual judgment still matter.
