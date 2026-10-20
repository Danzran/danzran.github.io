# v11 Skyshader: Codex ingredient prompts

The v11 sky is a WebGL fragment shader (`sky.js`), not a painting. Codex made **ingredients** that the shader samples:
tileable greyscale cloud tiles, a horizontally wrapping Milky Way strip, a far-shore town silhouette mask and comet sprites.

All were generated on 2026-10-12 with `cat prompt.txt | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra -`, one job at a time, in a scratch folder.
`mktex.py` (the agent's scratch tool) then processed them:
- forced wrapping by cross-fading the edges;
- clamped green to at most the larger of red and blue in the Milky Way;
- thresholded the town to a clean mask;
- resized to power-of-two sizes and saved webp copies in `assets/sky/`;
- embedded the same webp files as data URIs in `skytex.js`. WebGL cannot upload `file://` images because they taint the canvas, but it can upload data URIs.

## Used

| shader slot | file | source |
|---|---|---|
| `uCloud`: cumulus layer (shape *and* painted shading) | assets/sky/cloud.webp (1024²) | cloud-a |
| `uCirrus`: high cirrus layer | assets/sky/cirrus.webp (512²) | cirrus-a |
| `uMilky`: Milky Way band around a great circle of the turning sky | assets/sky/milky.webp (2048×512) | milky-a |
| `uTown`: far shore silhouette and its lake reflection | assets/sky/town.webp (2048×256) | see below |

The noise texture (`uNoise`, 4 channels of tileable value-noise fbm) is generated in `sky.js` from a fixed seed.

## Generated, not used
