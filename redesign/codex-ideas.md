1. **The Debugging Room**

What’s on screen: Daniel’s name is rendered as a crisp terminal command at the center of a dark “investigation board.” Around it: floating, connected artifacts—a golf-swing skeleton, optical-flow vectors, handwritten digits, a property-price chart, and compiler tokens.

How it moves/reacts: On load, the artifacts resolve from noisy data into clear visuals. Cursor movement creates a subtle parallax depth effect; hovering an artifact highlights its project connection. Scrolling pulls the camera through the board toward featured work.

Color/type direction: Near-black charcoal, phosphor green, electric cyan, and restrained warm-orange warnings. Use a refined monospace for metadata paired with a confident geometric sans-serif for the introduction.

Implementation approach: Vanilla JS + GSAP + SVG/canvas. Keep the “data evidence” elements as lightweight SVGs; use GSAP ScrollTrigger for section transitions.

Implementation prompt:  
“Create a fullscreen hero that feels like an elegant software-engineering investigation board. Center `Daniel Azran` as a terminal-style command, surrounded by five floating project artifacts connected with thin animated lines: golf pose landmarks, optical-flow arrows, MNIST digit grid, real-estate chart, and compiler tokens. On load, animate noisy fragments into precise graphics. Add subtle cursor parallax, artifact hover focus, and a scroll-driven camera push into the work section. Use charcoal, cyan, terminal green, and amber; prioritize editorial spacing and premium motion.”

2. **Frame by Frame**

What’s on screen: A cinematic editing timeline runs across the lower third. Above it, a large adaptive “preview monitor” cycles through stylized scenes from Daniel’s projects: a golfer’s motion path, flowing tracking vectors, a digit being recognized, and source code compiling.

How it moves/reacts: The timeline playhead advances on load, cutting between scenes with film-edit-inspired wipes, match cuts, and motion blur. Scrubbing horizontally or moving the cursor along the timeline previews chapters. Scroll locks briefly into a polished sequence, then releases into the portfolio.

Color/type direction: Matte black, off-white, deep navy, bright signal red, and occasional lime tracking overlays. Film-credit condensed type for labels; modern sans-serif for the core message.

Implementation approach: GSAP + Canvas/WebGL for the preview visuals; vanilla JS for interactive timeline behavior. Avoid actual heavy video files by generating scenes procedurally.

Implementation prompt:  
“Design a cinematic portfolio hero for a full-stack ML engineer and video editor. Build a large responsive preview monitor above an editorial video-timeline UI. The monitor should play a seamless 12-second abstract reel of golf pose tracking, optical flow, handwritten-digit classification, real-estate prediction, and compiler output. Animate it with professional edit transitions: match cuts, split screens, tracking overlays, and restrained film grain. Let cursor position scrub the timeline; use GSAP for a scroll-linked intro sequence. Make it feel like a high-end motion-design reel, not a generic dashboard.”

3. **The Intelligence Lens**

What’s on screen: A giant translucent lens occupies the hero. Inside it, the world is interpreted as machine-readable layers: landmarks around a golf player silhouette, velocity fields, confidence labels, object coordinates, and code annotations. Outside the lens is a clean, calm portrait-like abstract scene.

How it moves/reacts: The lens follows the cursor with a slight delay, revealing different data layers beneath it. On scroll, it expands until the entire viewport becomes the interpreted system, transitioning into project cards.

Color/type direction: Soft midnight blue, foggy silver, ultraviolet, and laser-lime highlights. Clean, large editorial serif for “Daniel Azran,” paired with precise technical sans-serif UI labels.

Implementation approach: Three.js or a GLSL fragment shader for the distortion/reveal lens; GSAP for entrance and scroll expansion. Provide a reduced-motion static fallback.

Implementation prompt:  
“Build a full-screen hero around a large interactive machine-vision lens. Outside the lens, show a minimal abstract scene; inside, reveal computer-vision overlays such as skeletal pose landmarks, optical-flow trails, bounding boxes, confidence values, and source-code annotations. The lens should smoothly chase the cursor and refract the background with subtle glass distortion. On scroll, expand the lens until its interpreted visual language fills the viewport and transitions into projects. Use deep midnight, silver haze, violet, and sharp lime accents. Include reduced-motion and mobile fallbacks.”

4. **Signal / Noise**

What’s on screen: The initial screen is alive with beautiful visual noise—pixels, data fragments, waveforms, compiler characters, and ghostly golf-motion frames. At its center, Daniel’s name acts as a stable signal: “Daniel Azran — turning messy input into clear systems.”

How it moves/reacts: A cursor “cleans” or resolves nearby noise, revealing meaningful project imagery. On load, noise pulses then settles into the headline. As users scroll, each project theme emerges from a different signal-processing behavior: tracking, classification, regression, parsing.

Color/type direction: Black and rich indigo base, iridescent RGB aberration, white typography, neon coral accents. Large, disciplined Swiss-style grotesk typography.

Implementation approach: WebGL shader or canvas particle field, with GSAP for orchestration. Use CSS blend modes selectively; make a static CSS fallback for GitHub Pages performance.

Implementation prompt:  
“Create a premium interactive hero called ‘Signal / Noise’ for Daniel Azran. Start with an atmospheric field of pixels, waveforms, optical-flow vectors, code characters, and blurred motion-study imagery. Daniel’s headline remains unusually stable and sharp at center. Let cursor proximity convert surrounding noise into recognizable project data: golf pose landmarks, MNIST digits, housing predictions, and compiler syntax trees. On scrolling, morph noise into orderly project-specific systems. Use deep indigo-black, RGB chromatic aberration, crisp white, and neon coral. Keep the motion subtle, intelligent, and editorial.”

5. **The Personal Render Engine**

What’s on screen: The page presents Daniel as a “render pipeline.” A central live composition assembles from layers labeled `vision`, `data`, `systems`, and `motion`. Each layer is visually distinct: video-grade color curves, model outputs, APIs, and code structures.

How it moves/reacts: On load, layers slide into a final composite. Cursor movement lets visitors tilt the composition in 3D and temporarily isolate a layer. Scrolling sends each layer outward to become a project category or case-study gateway.

Color/type direction: A dark interface with polished translucent panels, cobalt, peach, chartreuse, and pearl-white. Use modern display type with tiny technical annotation text—like a motion graphics compositing application reimagined as an editorial site.

Implementation approach: Three.js/CSS 3D transforms for depth, GSAP timelines for assembly/disassembly, SVG charts and custom canvas components for lightweight visuals.

Implementation prompt:  
“Create a hero that treats Daniel Azran’s portfolio as a personal render engine. Show a centered composited artwork made from four layered planes labeled Vision, Data, Systems, and Motion. Each plane includes an abstract representation of relevant work: pose tracking, prediction charts, compiler structures, and editing-grade visual textures. Animate the layers into a finished composition on load. Add subtle 3D cursor tilt and click-to-isolate behavior. On scroll, separate the layers and transition each into a portfolio pathway. Make it feel like a premium compositing tool crossed with an editorial technology site.”

6. **From Gesture to System**

What’s on screen: A single continuous line begins as a hand-drawn stroke. It evolves across the hero into a golf swing arc, optical-flow streamlines, an MNIST digit, a real-estate prediction curve, and finally a compiler parse tree—ending at Daniel’s name.

How it moves/reacts: The line draws itself on load in an elegant, choreographed sequence. Cursor proximity bends it slightly like a physical filament. Scroll continues the line through the site, becoming dividers, project connectors, and navigation progress.

Color/type direction: Warm ivory or ink-black background, a single saturated cobalt or vermilion line, with graphite text. Pair a characterful editorial serif with understated UI sans-serif details.

Implementation approach: SVG paths with GSAP DrawSVG-like path animation (or native `stroke-dashoffset`), plus lightweight vanilla JS pointer physics. No WebGL required.

Implementation prompt:  
“Design an elegant, highly distinctive portfolio hero titled ‘From Gesture to System.’ Use one continuous animated SVG line that starts as a hand-drawn mark and transforms sequentially into a golf swing arc, dense optical-flow vectors, a handwritten digit, a property-price trend line, and a compiler parse tree. End the path by underlining or forming part of ‘Daniel Azran.’ Animate the full transformation on load with precise pacing; add gentle cursor-driven line displacement and make the line continue as a visual thread through later sections. Use editorial typography, generous whitespace, and one bold accent color. Make it feel more like a title sequence than a developer portfolio.”