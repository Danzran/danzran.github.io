/* Scribble: brush lettering and painted outlines that MUTATE continuously.
   Replaces the stepped v8 boil (lettering.js swapped 3 drawings per letter at ~7 fps).
   Every animation frame each glyph outline point is pushed along its normal by smooth,
   multi-octave 3D noise (x, y, time). The phase drifts, so bumps crawl along the edges and
   the shape never pops between drawings. Reference: "Beautiful World" (dreams) outro
   lettering and paint-on roto outlines.

   Same API as Lettering:   Scribble.render(el, {seed, variant, delay}) ; Scribble.start()
   Extras:                  Scribble.outline(host, shape, opts)   crawling painted stroke on any path/polyline/box
                            Scribble.roto(img, opts)              painted outline around an image's alpha silhouette
   URL:                     ?scribble=calm|crawl|echo|torn|stepped picks the default variant.
   Glyph outlines: Caveat Brush (window.BRUSH_FONT_B64, parsed with opentype.js). */
window.Scribble = (() => {
  const UNITS = 100, PAD = 8, BLEED = 22, GS = 3;      // 1em = 100 units; layout pad as v8; canvas bleed for glow/echo
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (a, b, v) => { v = clamp01((v - a) / (b - a)); return v * v * (3 - 2 * v); };
  const seeded = s => () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /* ---------- variants (text units: 1em = 100; outline units: CSS px) ---------- */
  // giannis: Daniel's own edit (thi.gif). Chunky caps, the whole letterform re-shapes coherently (turbulent displace with
  // evolution), roughened dry edges that re-roll every frame, paint drips hanging off stroke bottoms, rare film scratches.
  const GIANNIS = { caps: 1, size: .82, weight: 3.2, track: 3, wide: 1.12, warp: 2.6, warpFreq: .022, amp: 1.4, freq: .035, detail: .35, speed: .55, crawl: 0,
    grit: 1.3, gritFreq: .55, downRough: 3, spike: .18, hair: .55, hairDown: 1,  drips: 1, dripLen: 22, jitter: .25, echoes: 0, echoA: .3, echoLag: .25,
    smear: 3, glow: .14, blur: 1.2, dry: .35, dryAng: -84, dryW: 2.6, dryBlob: 3, scratch: .06, texSteps: 12.5, texSpeed: 6 };
  const VARIANTS = {
    giannis:       Object.assign({}, GIANNIS, { label: 'giannis (smooth shape, 12.5 fps edges)' }),
    giannissmooth: Object.assign({}, GIANNIS, { label: 'giannis, all smooth', texSteps: 0, texSpeed: 3 }),
    giannis12:     Object.assign({}, GIANNIS, { label: 'giannis on 12.5 fps (GIF rate)', steps: 12.5, speed: .9 }),
    calm:    { label: 'calm mutate',    grit: .25, hair: 0,   amp: 1.1, speed: .45, freq: .05, detail: .3,  spike: 0,   crawl: .35, jitter: .35, echoes: 0, echoA: .3,  echoLag: .25, smear: 3, glow: .22, blur: 1.2, dry: .25 },
    crawl:   { label: 'crawl',          grit: .9,  hair: .7,  amp: 2.1, speed: .9,  freq: .065, detail: .6, spike: .55, crawl: 1.1, jitter: .7,  echoes: 1, echoA: .35, echoLag: .22, smear: 4, glow: .35, blur: 1.4, dry: .5 },
    echo:    { label: 'echo smear',     grit: .6,  hair: .5,  amp: 1.8, speed: .8,  freq: .06, detail: .45, spike: .35, crawl: .8,  jitter: .6,  echoes: 3, echoA: .42, echoLag: .2,  smear: 6, glow: .45, blur: 1.6, dry: .35 },
    torn:    { label: 'torn dry-brush', grit: 1.1, hair: 1.2, amp: 1.5, speed: .7,  freq: .06, detail: .75, spike: 1.5, crawl: .7,  jitter: .5,  echoes: 0, echoA: .3,  echoLag: .25, smear: 3, glow: .25, blur: 1.2, dry: 1 },
    stepped: { label: 'stepped (v8-ish, on 7s)', grit: .4, hair: 0, amp: 1.6, speed: 1.4, freq: .06, detail: .4, spike: .2, crawl: 0, jitter: .9, echoes: 0, echoA: .3, echoLag: .25, smear: 3, glow: .2, blur: 1.2, dry: .4, steps: 7 },
  };
  const q = (location.search.match(/[?&]scribble=([a-z0-9]+)/) || [])[1];
  const DEFAULT = VARIANTS[q] ? q : 'giannis';   // round 2: Daniel's own edit is the reference
  const BASE = { arrive: true, delay: 0, stagger: .075, arriveDur: 1.1, steps: 0, glowColor: null, caps: 0, weight: 0, track: 0, warp: 0, warpFreq: .022, gritFreq: .42, downRough: 0, drips: 0, dripLen: 0, scratch: 0, texSteps: 0, texSpeed: 0, dryAng: null, dryW: 1, dryBlob: 0, wide: 1, hairDown: 0, size: 1 };
  const preset = name => Object.assign({}, BASE, VARIANTS[name] || VARIANTS[DEFAULT], { variant: VARIANTS[name] ? name : DEFAULT });

  /* ---------- smooth 3D gradient noise (improved Perlin), roughly -1..1 ---------- */
  const perm = new Uint8Array(512);
  { const p = [...Array(256).keys()], r = seeded(20261011); for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; }
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10), mix = (a, b, t) => a + t * (b - a);
  const grad = (h, x, y, z) => { h &= 15; const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
  function noise(x, y, z) {
    let X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    x -= X; y -= Y; z -= Z; X &= 255; Y &= 255; Z &= 255;
    const u = fade(x), v = fade(y), w = fade(z);
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z, B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
    return mix(mix(mix(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u), mix(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v),
               mix(mix(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u), mix(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u), v), w);
  }

  /* ---------- geometry ---------- */
  const probe = document.createElement('canvas').getContext('2d');
  function resample(poly, step, closed = true) {          // even arclength spacing -> {xy, n}
    const m = poly.length, segs = closed ? m : m - 1, cum = [0];
    for (let i = 0; i < segs; i++) { const a = poly[i], b = poly[(i + 1) % m]; cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const L = cum[segs], n = Math.max(closed ? 8 : 2, Math.round(L / step)), xy = new Float32Array(n * 2);
    let s = 0;
    for (let k = 0; k < n; k++) {
      const d = closed ? (k / n) * L : (k / (n - 1)) * L;
      while (s < segs - 1 && cum[s + 1] < d) s++;
      const a = poly[s], b = poly[(s + 1) % m], f = (d - cum[s]) / ((cum[s + 1] - cum[s]) || 1);
      xy[k * 2] = a[0] + (b[0] - a[0]) * f; xy[k * 2 + 1] = a[1] + (b[1] - a[1]) * f;
    }
    return { xy, n, closed };
  }
  function normals(c) {
    const { xy, n, closed } = c, nm = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const a = closed ? (i + 1) % n : Math.min(n - 1, i + 1), b = closed ? (i - 1 + n) % n : Math.max(0, i - 1);
      let nx = -(xy[a * 2 + 1] - xy[b * 2 + 1]), ny = xy[a * 2] - xy[b * 2]; const l = Math.hypot(nx, ny) || 1;
      nm[i * 2] = nx / l; nm[i * 2 + 1] = ny / l;
    }
    return (c.nm = nm), c;
  }
  const toPath = cs => { const p = new Path2D(); for (const c of cs) { p.moveTo(c.xy[0], c.xy[1]); for (let i = 1; i < c.n; i++) p.lineTo(c.xy[i * 2], c.xy[i * 2 + 1]); p.closePath(); } return p; };
  function orient(cs, eps) {                               // flip normals so + points out of the ink
    const path = toPath(cs.filter(c => c.closed));
    for (const c of cs) {
      if (!c.closed) continue;
      let inside = 0, tests = 0;
      for (let i = 0; i < c.n; i += Math.max(1, (c.n / 16) | 0), tests++) if (probe.isPointInPath(path, c.xy[i * 2] + c.nm[i * 2] * eps, c.xy[i * 2 + 1] + c.nm[i * 2 + 1] * eps, 'nonzero')) inside++;
      if (inside > tests / 2) for (let i = 0; i < c.nm.length; i++) c.nm[i] = -c.nm[i];
    }
    return cs;
  }
  const smoothPoly = (p, passes = 2) => { for (let k = 0; k < passes; k++) p = p.map((v, i) => { const a = p[(i - 1 + p.length) % p.length], b = p[(i + 1) % p.length]; return [(a[0] + 2 * v[0] + b[0]) / 4, (a[1] + 2 * v[1] + b[1]) / 4]; }); return p; };

  /* ---------- glyphs ---------- */
  let font = null; const cache = new Map();
  function loadFont() {
    if (font) return font;
    const bin = atob(window.BRUSH_FONT_B64), buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return (font = opentype.parse(buf.buffer));
  }
  function flatten(cmds) {
    const polys = []; let cur = null, x = 0, y = 0;
    const end = () => { if (cur && cur.length > 2) { const a = cur[0], b = cur[cur.length - 1]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) < .01) cur.pop(); polys.push(cur); } cur = null; };
    for (const c of cmds) {
      if (c.type === 'M') { end(); cur = [[c.x, c.y]]; }
      else if (c.type === 'L') cur.push([c.x, c.y]);
      else if (c.type === 'Q') for (let k = 1; k <= 8; k++) { const t = k / 8, u = 1 - t; cur.push([u * u * x + 2 * u * t * c.x1 + t * t * c.x, u * u * y + 2 * u * t * c.y1 + t * t * c.y]); }
      else if (c.type === 'C') for (let k = 1; k <= 12; k++) { const t = k / 12, u = 1 - t; cur.push([u * u * u * x + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x, u * u * u * y + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y]); }
      else if (c.type === 'Z') { end(); continue; }
      x = c.x; y = c.y;
    }
    end();
    return polys;
  }
  function glyph(ch) {
    if (cache.has(ch)) return cache.get(ch);
    const f = loadFont(), g = f.charToGlyph(ch), path = g.getPath(0, 0, UNITS);
    const contours = orient(flatten(path.commands).map(p => normals(resample(p, 1.5))), .6);
    const rec = { contours, adv: (g.advanceWidth / f.unitsPerEm) * UNITS, n: contours.reduce((s, c) => s + c.n, 0) };
    cache.set(ch, rec);
    return rec;
  }

  /* ---------- a canvas with a small, blurred glow/echo buffer under it ---------- */
  function surface(canvas) {
    const s = { canvas, ctx: canvas.getContext('2d'), g: document.createElement('canvas'), b: document.createElement('canvas'), w: 0, h: 0, cssW: 0, cssH: 0, dpr: 1 };
    s.gctx = s.g.getContext('2d'); s.bctx = s.b.getContext('2d');
    s.resize = (cssW, cssH) => {
      s.dpr = Math.min(devicePixelRatio || 1, 1.5); s.cssW = cssW; s.cssH = cssH;
      s.w = canvas.width = Math.max(1, Math.round(cssW * s.dpr)); s.h = canvas.height = Math.max(1, Math.round(cssH * s.dpr));
      s.g.width = s.b.width = Math.ceil(s.w / GS); s.g.height = s.b.height = Math.ceil(s.h / GS);
    };
    s.clear = glow => { s.ctx.setTransform(1, 0, 0, 1, 0, 0); s.ctx.globalAlpha = 1; s.ctx.clearRect(0, 0, s.w, s.h); if (glow) { s.gctx.setTransform(1, 0, 0, 1, 0, 0); s.gctx.clearRect(0, 0, s.g.width, s.g.height); } };
    s.composite = blur => {                                 // glow + echoes go UNDER the crisp ink
      const { ctx, bctx } = s;
      bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.clearRect(0, 0, s.b.width, s.b.height);
      bctx.filter = `blur(${blur}px)`; bctx.drawImage(s.g, 0, 0); bctx.filter = 'none';
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(s.b, 0, 0, s.w, s.h); ctx.globalCompositeOperation = 'source-over';
    };
    return s;
  }

  /* ---------- shared ticker, visibility, resize ---------- */
  const items = [];
  let started = false, raf = 0;
  const io = new IntersectionObserver(es => es.forEach(e => {
    const it = e.target.__scribble; if (!it) return;
    it.visible = e.isIntersecting;
    if (e.isIntersecting && it.born == null) it.born = performance.now() / 1000 + (it.cfg.delay || 0);
  }), { rootMargin: '80px' });
  const ro = new ResizeObserver(es => es.forEach(e => { const it = e.target.__scribble; if (it) { it.resize(); if (!started || reduce) it.draw(it.staticT); } }));
  function register(it, watchEl) {
    watchEl.__scribble = it; items.push(it); io.observe(watchEl); ro.observe(watchEl);
    requestAnimationFrame(() => { if (!started || reduce) { it.resize(); it.draw(it.staticT); } });
    return it;
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const T = now / 1000;
    for (const it of items) {
      if (!it.visible) continue;
      if (it.cfg.steps) { const k = Math.floor(T * it.cfg.steps); if (k === it.lastStep) continue; it.lastStep = k; }
      it.draw(T);
    }
  }
  function start() {
    if (started) return; started = true;
    if (reduce) { items.forEach(it => { it.resize(); it.draw(it.staticT); }); return; }   // static under reduced motion
    raf = requestAnimationFrame(loop);
  }

  /* ---------- lettering ---------- */
  // one outline point -> displaced position in o[0], o[1]. lt: shape time, tt: edge-texture time (may be stepped)
  function displace(L, x, y, nx, ny, lt, tt, ampMul, cfg, o) {
    const f = cfg.freq, cr = cfg.crawl * lt, amp = cfg.amp * ampMul;
    let d = cfg.weight + amp * noise(x * f + cr + L.ox, y * f + L.oy, lt) + cfg.detail * .5 * amp * noise(x * f * 2.7 - cr * 1.7 + L.oy, y * f * 2.7, lt * 1.6 + 9);
    const down = cfg.downRough ? (ny > 0 ? 1 + cfg.downRough * ny * ny : .3) : 1;      // ragged mostly along the bottoms of strokes
    if (cfg.grit) { const gf = cfg.gritFreq; d += cfg.grit * ampMul * down * noise(x * gf + cr * 2.3 + L.ox, y * gf, tt * 2.4 + 17); }                 // fine grit: scratchy edge
    if (cfg.spike) { const sv = noise(x * .3 + L.ox, y * .3 - cr * .5, tt * 1.2 + 3) - .22; if (sv > 0) d += cfg.spike * ampMul * 22 * down * sv * sv; }   // torn barbs, outward only
    let px = x + nx * d, py = y + ny * d;
    if (cfg.warp) { const wf = cfg.warpFreq, w = cfg.warp * ampMul; px += w * noise(x * wf + L.ox, y * wf, lt * .8 + 31); py += w * noise(x * wf, y * wf + L.oy, lt * .8 + 47); }  // coherent re-shape
    o[0] = px; o[1] = py;
  }
  const tmp = [0, 0];
  function letterPath(L, lt, ampMul, cfg, tt = lt) {
    const p = new Path2D();
    for (const c of L.g.contours) {
      const { xy, nm, n } = c;
      for (let i = 0; i < n; i++) {
        displace(L, xy[i * 2], xy[i * 2 + 1], nm[i * 2], nm[i * 2 + 1], lt, tt, ampMul, cfg, tmp);
        i ? p.lineTo(tmp[0], tmp[1]) : p.moveTo(tmp[0], tmp[1]);
      }
      p.closePath();
    }
    return p;
  }

  // paint drips hanging off down-facing edges. Length follows slow noise, so they creep down and retract smoothly.
  function dripPath(L, lt, tt, ampMul, cfg) {
    const p = new Path2D();
    for (const dp of L.drips) {
      const v = noise(dp.ph, lt * .3, 23) * .5 + .5, len = cfg.dripLen * cfg.drips * dp.len * Math.max(0, v - .3) / .7;
      if (len < 1.2) continue;
      const { xy, nm } = dp.c, i = dp.i;
      displace(L, xy[i * 2], xy[i * 2 + 1], nm[i * 2], nm[i * 2 + 1], lt, tt, ampMul, cfg, tmp);
      const bx = tmp[0], by = tmp[1] - 2.5, w = dp.w * (.7 + .3 * v), sway = noise(dp.ph, lt * .5, 5) * 1.6, ey = by + len;
      p.moveTo(bx - w * 1.4, by);
      p.quadraticCurveTo(bx - w * .35, by + len * .35, bx - w * .4 + sway, ey);
      p.arc(bx + sway, ey, w * .45, Math.PI, 0, true);
      p.quadraticCurveTo(bx + w * .35, by + len * .35, bx + w * 1.4, by);
      p.closePath();
    }
    return p;
  }

  // dry, torn fibres: thin tapering slivers pulled off the edge, mostly sideways like a dragged dry brush.
  // Their length follows smooth noise, so they grow and retract instead of blinking.
  function hairPath(L, lt, ampMul, cfg) {
    const p = new Path2D();
    for (const h of L.hairs) {
      const v = noise(h.ph, lt * .7, 13.3) - .05; if (v <= 0) continue;
      const len = cfg.hair * h.len * v * 34 * ampMul; if (len < .6) continue;
      const { xy, nm, n } = h.c, i = (h.i + Math.round(noise(h.ph, lt * .2, 2) * 6) + n) % n;
      const x = xy[i * 2], y = xy[i * 2 + 1], nx = nm[i * 2], ny = nm[i * 2 + 1];
      if (cfg.hairDown && ny < .3) continue;                   // giannis: drag streaks only hang off the bottoms of strokes
      let dx = cfg.hairDown ? nx * .25 + noise(h.ph, lt * .5, 7) * .12 : nx + Math.sign(nx || 1) * 1.1, dy = cfg.hairDown ? 1 : ny * .6 + noise(h.ph, lt * .5, 7) * .4;
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const bw = .7 + .5 * h.len, bx = x - nx * 1.2, by = y - ny * 1.2;                // rooted just inside the ink
      const bend = noise(h.ph + 5, lt * .6, 3) * len * .25;
      p.moveTo(bx + ny * bw, by - nx * bw);
      p.quadraticCurveTo(bx + dx * len * .5 - dy * bend, by + dy * len * .5 + dx * bend, bx + dx * len, by + dy * len);
      p.quadraticCurveTo(bx + dx * len * .5 - dy * bend, by + dy * len * .5 + dx * bend, bx - ny * bw, by + nx * bw);
      p.closePath();
    }
    return p;
  }

  function render(el, opts = {}) {
    const text = el.textContent.replace(/\s+/g, ' ').trim(), f = loadFont();
    const cfg = Object.assign(preset(opts.variant), opts, opts.variant ? {} : { variant: DEFAULT });
    const asc = (f.ascender / f.unitsPerEm) * UNITS, desc = (-f.descender / f.unitsPerEm) * UNITS;
    el.setAttribute('aria-label', text); el.textContent = '';
    const space = (f.charToGlyph(' ').advanceWidth / f.unitsPerEm) * UNITS || 25;
    const box = document.createElement('span'), canvas = document.createElement('canvas');
    box.className = 'sc-line'; box.setAttribute('aria-hidden', 'true');
    box.appendChild(canvas); el.appendChild(box);
    const s = surface(canvas), boxH = asc + desc + PAD * 2;
    let boxW = 0, laidCaps = null, laidTrack = null;
    function layout() {                                        // (re)built when caps/tracking change, e.g. switching variant in the lab
      const rnd = seeded((opts.seed || 1) * 7919), letters = [], str = cfg.caps ? text.toUpperCase() : text;
      let x = 0, i = 0;
      for (const ch of str) {
        if (ch === ' ') { x += space * cfg.wide + cfg.track; continue; }
        // Caveat's capital I has bars; the ref's is a plain blunt stroke, so caps mode borrows 'l' squashed to cap height
        const plainI = cfg.caps && ch === 'I', g = glyph(plainI ? 'l' : ch), streaks = [], hairs = [], drips = [];
        const top = gl => Math.min(...gl.contours.map(c => { let m = 0; for (let j = 1; j < c.xy.length; j += 2) m = Math.min(m, c.xy[j]); return m; }));
        const sy = plainI ? top(glyph('H')) / top(g) : 1;
        const ang = (-18 + (rnd() - .5) * 20) * Math.PI / 180, angJ = (rnd() - .5) * 14;
        for (let k = 0; k < 16; k++) streaks.push({ cx: rnd() * g.adv, cy: -rnd() * asc * .9, len: 8 + rnd() * 34, w: .5 + rnd() * .7, ph: rnd() * 50, on: rnd() });
        for (let k = 0; k < 22; k++) { const c = g.contours[(rnd() * g.contours.length) | 0]; hairs.push({ c, i: (rnd() * c.n) | 0, ph: rnd() * 90, len: .5 + rnd() }); }
        const cand = [];
        for (const c of g.contours) for (let j = 0; j < c.n; j += 2) if (c.nm[j * 2 + 1] > .75) cand.push({ c, i: j, low: c.xy[j * 2 + 1] > -22 });
        const pool = cand.filter(d => d.low).length >= 3 ? cand.filter(d => d.low) : cand;
        for (let k = 0; k < Math.min(cfg.caps ? 2 : 4, pool.length); k++) { const d = pool[(rnd() * pool.length) | 0]; drips.push({ c: d.c, i: d.i, ph: rnd() * 70, len: .35 + rnd() * .9, w: .7 + rnd() * 1.7 }); }
        letters.push({ g, x, sy, hairs, drips, ox: rnd() * 100, oy: rnd() * 100, phase: rnd() * 40, rank: i + (rnd() - .5) * 3.5, fromX: (rnd() - .5) * 30, fromY: 18 + rnd() * 26, rot: (rnd() - .5) * .5, ca: Math.cos(ang), sa: Math.sin(ang), angJ, streaks });
        x += g.adv * cfg.wide + cfg.track; i++;
      }
      boxW = x - (i ? cfg.track : 0) + PAD * 2;
      const E = cfg.size / UNITS;                               // size: giannis caps render a bit smaller so headings keep their footprint
      box.style.cssText = `display:inline-block;position:relative;vertical-align:-.28em;width:${boxW * E}em;height:${boxH * E}em;margin:0 ${-PAD * E}em`;
      canvas.style.cssText = `position:absolute;pointer-events:none;left:${-BLEED * E}em;top:${-BLEED * E}em;width:${(boxW + BLEED * 2) * E}em;height:${(boxH + BLEED * 2) * E}em`;
      laidCaps = cfg.caps; laidTrack = cfg.track + cfg.wide * 1000 + cfg.size * 1e6;
      if (it) { it.letters = letters; it.unitsW = boxW + BLEED * 2; }
      return letters;
    }
    let it = null;
    const letters = layout();
    it = {
      el, box, canvas, cfg, letters, visible: false, born: reduce ? -1e9 : null, staticT: 0, lastStep: null, color: '#fff', frame: 0,
      ox: PAD + BLEED, oy: PAD + BLEED + asc, unitsW: boxW + BLEED * 2,
      resize() { const r = box.getBoundingClientRect(); s.resize(r.width * (it.unitsW / boxW), r.height * ((boxH + BLEED * 2) / boxH)); it.color = getComputedStyle(el).color; },
      set(o) {
        if (o.variant) Object.assign(cfg, preset(o.variant)); Object.assign(cfg, o); it.lastStep = null;
        if (cfg.caps !== laidCaps || cfg.track + cfg.wide * 1000 + cfg.size * 1e6 !== laidTrack) { layout(); it.resize(); }
        if (!started || reduce) it.draw(it.staticT);
      },
      replay(delay = 0) { it.born = performance.now() / 1000 + delay; },
      draw(T) { drawText(it, s, T); },
    };
    if (!cfg.arrive) it.born = -1e9;
    return register(it, box);
  }

  function drawText(it, s, T) {
    if (!s.w) return;
    const cfg = it.cfg, k = (s.w / it.unitsW), gk = k / GS, ctx = s.ctx, gctx = s.gctx;
    if ((it.frame++ & 31) === 0) it.color = getComputedStyle(it.el).color;   // follows the day/night toggle
    const glowOn = cfg.glow > 0 || cfg.echoes > 0;
    s.clear(glowOn);
    const tq = cfg.steps ? Math.floor(T * cfg.steps) / cfg.steps : T;
    const texT = cfg.texSteps ? Math.floor(T * cfg.texSteps) / cfg.texSteps : tq;     // edge texture can re-roll on 12.5s like the GIF
    ctx.fillStyle = it.color; ctx.strokeStyle = '#000'; ctx.lineCap = 'round'; gctx.fillStyle = cfg.glowColor || it.color;
    const born = it.born == null ? Infinity : it.born, still = reduce || !started;
    for (const L of it.letters) {
      const a = still ? 1 : clamp01((T - born - Math.max(0, L.rank) * cfg.stagger) / cfg.arriveDur);
      if (a <= 0) continue;
      const ae = Math.pow(1 - a, 3), e = 1 - ae;                 // ae: how much "arriving" is left
      const lt = tq * cfg.speed + L.phase, ampMul = 1 + 5 * ae, alpha = smooth(0, .3, a);
      const jx = cfg.jitter * noise(L.ox, lt * .35, 5.5) * 1.6 + L.fromX * ae * ae, jy = cfg.jitter * noise(L.oy, lt * .35, 7.1) * 1.6 + L.fromY * ae * ae;
      const rot = cfg.jitter * noise(L.ox + 3, lt * .3, 1.7) * .035 + L.rot * ae * ae, cx = L.g.adv / 2;
      const place = (c, kk, ex = 0, ey = 0) => { c.setTransform(kk, 0, 0, kk, (it.ox + L.x + jx + ex) * kk, (it.oy + jy + ey) * kk); c.translate(cx, -35); c.rotate(rot); c.translate(-cx, 35); if (cfg.wide !== 1 || L.sy !== 1) c.scale(cfg.wide, L.sy); };
      const tt = cfg.texSpeed ? texT * cfg.texSpeed + L.phase : lt;
      const body = letterPath(L, lt, ampMul, cfg, tt);
      const hair = cfg.hair > 0 ? hairPath(L, lt, ampMul, cfg) : null;
      const drip = cfg.drips > 0 ? dripPath(L, lt, tt, ampMul, cfg) : null;
      place(ctx, k); ctx.globalAlpha = alpha; ctx.fill(body); if (hair) ctx.fill(hair); if (drip) ctx.fill(drip);
      if (cfg.dry > 0) {                                         // dry-brush gaps: streaks that grow/shrink smoothly, erased from the ink
        ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000';
        const nS = Math.round(L.streaks.length * Math.min(1, cfg.dry));
        for (let j = 0; j < nS; j++) {
          const st = L.streaks[j], grow = noise(st.ph, lt * .4, 2.2) * .5 + .5, len = st.len * grow * (1 + (cfg.dry > 1 ? cfg.dry - 1 : 0));
          if (len < 2) continue;
          const dx = st.cx + noise(st.ph, lt * .25, 4) * 4, dy = st.cy + noise(st.ph + 9, lt * .25, 4) * 4;
          let ca = L.ca, sa = L.sa;
          if (cfg.dryAng != null) { const a = (cfg.dryAng + L.angJ) * Math.PI / 180; ca = Math.cos(a); sa = Math.sin(a); }
          ctx.globalAlpha = .85 * alpha; ctx.lineWidth = st.w * .8 * cfg.dryW;
          ctx.beginPath(); ctx.moveTo(dx - ca * len / 2, dy - sa * len / 2); ctx.lineTo(dx + ca * len / 2, dy + sa * len / 2); ctx.stroke();
          if (cfg.dryBlob && st.on < .5) { ctx.beginPath(); ctx.ellipse(dx, dy, st.w * cfg.dryBlob * grow, st.w * cfg.dryBlob * 1.6 * grow, ca, 0, 6.283); ctx.fill(); }   // blotchy dry holes
        }
        ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = it.color;
      }
      if (glowOn) {
        place(gctx, gk); gctx.globalAlpha = cfg.glow * alpha; gctx.fill(body); if (hair) gctx.fill(hair); if (drip) gctx.fill(drip);
        for (let j = 1; j <= cfg.echoes; j++) {                  // ghosts: the same letter from a moment ago, trailing left
          const ep = letterPath(L, lt - j * cfg.echoLag, ampMul * (1 + .35 * j), cfg);
          place(gctx, gk, -cfg.smear * j * (1 + 2 * ae), noise(L.oy, j * 1.3, lt * .5) * cfg.smear * .5);
          gctx.globalAlpha = Math.min(1, cfg.echoA * alpha * (1 - j / (cfg.echoes + 1)) * (1 + 1.5 * ae)); gctx.fill(ep);
        }
      }
    }
    if (glowOn) s.composite(cfg.blur);
    if (cfg.scratch && !still) {                               // film scratches: a thin vertical line on the odd frame
      const fr = Math.floor(T * 12.5), r = seeded(fr * 977 + (it.ox | 0) * 13 + it.letters.length);
      for (let j = 0; j < 2; j++) {
        if (r() > cfg.scratch) { r(); r(); r(); continue; }
        const x = r() * s.w, y0 = r() * s.h * .5, len = s.h * (.35 + .65 * r());
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = .55; ctx.fillStyle = it.color; ctx.fillRect(x, y0, Math.max(1, s.dpr * .9), len);
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- outlines: a painted, crawling stroke along any closed path / polyline ---------- */
  const OUTLINE = { width: 4.5, amp: 2.2, speed: .7, freq: .018, detail: .5, crawl: .8, gap: -.05, soft: .22, gapFreq: .011, bristles: 2, offset: 2, glow: .45, blur: 1.6, echoes: 0, echoA: .3, echoLag: .2, smear: 3, color: '#fff7e6', glowColor: null, arrive: true, arriveDur: 1.6, delay: 0, steps: 0 };
  const OUTLINE_VARIANTS = { calm: { amp: 1.2, speed: .4, gap: -.6, bristles: 1 }, crawl: {}, echo: { echoes: 2 }, torn: { gap: .1, bristles: 3, width: 5 }, stepped: { steps: 7, speed: 1.2, crawl: 0 } };

  function resolveShape(host, spec, W, H) {               // -> [{pts:[[x,y]], closed}] in host CSS px
    if (!spec || spec === 'box') {
      const r = Math.min(parseFloat(getComputedStyle(host).borderTopLeftRadius) || 0, W / 2, H / 2), pts = [], seg = 8;
      const arc = (cx, cy, a0) => { for (let k = 0; k <= seg; k++) { const a = a0 + (k / seg) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
      arc(W - r, r, -Math.PI / 2); arc(W - r, H - r, 0); arc(r, H - r, Math.PI / 2); arc(r, r, Math.PI);
      return [{ pts, closed: true }];
    }
    if (typeof spec === 'function') return spec(W, H);
    if (spec.d) {                                          // SVG path data in a viewBox [w, h], scaled to the host
      const [vw, vh] = spec.viewBox || [W, H], svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), out = [];
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; document.body.appendChild(svg);
      for (const sd of spec.d.split(/(?=[Mm])/)) {
        const pe = document.createElementNS('http://www.w3.org/2000/svg', 'path'); pe.setAttribute('d', sd); svg.appendChild(pe);
        const L = pe.getTotalLength(), n = Math.max(8, Math.round(L / 2)), pts = [];
        for (let k = 0; k <= n; k++) { const p = pe.getPointAtLength((k / n) * L); pts.push([p.x * W / vw, p.y * H / vh]); }
        out.push({ pts, closed: /z\s*$/i.test(sd) });
      }
      svg.remove(); return out;
    }
    if (spec.contours) return spec.contours.map(c => ({ pts: c.map(([x, y]) => [x * W, y * H]), closed: true }));   // normalised 0..1
    if (spec.points) return [{ pts: spec.points.map(([x, y]) => spec.norm ? [x * W, y * H] : [x, y]), closed: spec.closed !== false }];
    return [];
  }

  function ribbon(path, c, qx, qy, w, off) {              // filled variable-width runs; zero width splits the stroke
    const { n, nm, closed } = c, on = i => w[i] > .05;
    const L = i => [qx[i] + nm[i * 2] * (off + w[i] / 2), qy[i] + nm[i * 2 + 1] * (off + w[i] / 2)];
    const R = i => [qx[i] + nm[i * 2] * (off - w[i] / 2), qy[i] + nm[i * 2 + 1] * (off - w[i] / 2)];
    let start = -1;
    for (let i = 0; i < n; i++) if (!on(i)) { start = i; break; }
    if (start < 0) {                                       // unbroken loop: outer ring + reversed inner ring
      if (!closed) start = 0;
      else {
        for (let i = 0; i < n; i++) { const p = L(i); i ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1]); } path.closePath();
        for (let i = n - 1; i >= 0; i--) { const p = R(i); i === n - 1 ? path.moveTo(p[0], p[1]) : path.lineTo(p[0], p[1]); } path.closePath();
        return;
      }
    }
    let run = [];
    const flush = () => {
      if (run.length > 1) { run.forEach((i, k) => { const p = L(i); k ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1]); }); for (let k = run.length - 1; k >= 0; k--) { const p = R(run[k]); path.lineTo(p[0], p[1]); } path.closePath(); }
      run = [];
    };
    for (let m = 0; m < n; m++) { const i = closed ? (start + m) % n : m; if (on(i)) run.push(i); else flush(); }
    flush();
  }

  function outline(host, shape, opts = {}) {
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const variant = opts.variant || DEFAULT;
    const cfg = Object.assign({}, OUTLINE, OUTLINE_VARIANTS[variant] || {}, opts, { variant });
    const pad = opts.bleed || 24, canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true'); canvas.className = 'sc-outline';
    canvas.style.cssText = `position:absolute;pointer-events:none;left:${-pad}px;top:${-pad}px;width:calc(100% + ${pad * 2}px);height:calc(100% + ${pad * 2}px);z-index:${opts.z ?? 1}`;
    host.appendChild(canvas);
    const s = surface(canvas), rnd = seeded((opts.seed || 3) * 104729), seed = rnd() * 100;
    let cs = [], buf = null;
    const it = {
      host, canvas, cfg, visible: false, born: reduce ? -1e9 : null, staticT: 0, lastStep: null,
      resize() {
        const W = host.clientWidth, H = host.clientHeight; s.resize(W + pad * 2, H + pad * 2);
        const box = opts.box ? opts.box() : { x: 0, y: 0, w: W, h: H };
        cs = resolveShape(host, shape, box.w, box.h).map(p => normals(resample((p.closed ? smoothPoly(p.pts, 1) : p.pts).map(([x, y]) => [x + box.x, y + box.y]), 3, p.closed)));
        orient(cs, 1.5);
        const N = Math.max(1, ...cs.map(c => c.n)); buf = { qx: new Float32Array(N), qy: new Float32Array(N), w: new Float32Array(N), wb: new Float32Array(N) };
      },
      set(o) { if (o.variant) Object.assign(cfg, OUTLINE, OUTLINE_VARIANTS[o.variant] || {}, opts); Object.assign(cfg, o); it.lastStep = null; if (!started || reduce) it.draw(it.staticT); },
      replay(delay = 0) { it.born = performance.now() / 1000 + delay; },
      draw(T) { drawOutline(it, s, cs, buf, T, pad, seed); },
    };
    if (!cfg.arrive) it.born = -1e9;
    return register(it, host);
  }

  function strokePath(cs, buf, lt, cfg, seed, thrBoost, ampMul) {
    const main = new Path2D(), bristle = new Path2D(), f = cfg.freq, cr = cfg.crawl * lt, gf = cfg.gapFreq;
    for (const c of cs) {
      const { xy, nm, n } = c, { qx, qy, w, wb } = buf;
      for (let i = 0; i < n; i++) {
        const x = xy[i * 2], y = xy[i * 2 + 1];
        const d = cfg.offset + cfg.amp * ampMul * (noise(x * f + cr + seed, y * f, lt) + cfg.detail * .5 * noise(x * f * 3 - cr * 1.6, y * f * 3 + seed, lt * 1.7 + 5));
        qx[i] = x + nm[i * 2] * d; qy[i] = y + nm[i * 2 + 1] * d;
        const cov = cfg.gap <= -1 ? 1 : noise(x * gf + lt * .25 + seed, y * gf - cr * .3, lt * .15 + 11);
        const thr = cfg.gap + thrBoost, body = .55 + .45 * noise(x * f * 1.4 + 40, y * f * 1.4 - cr, lt * .8 + 21);
        w[i] = cfg.width * body * (cfg.gap <= -1 ? 1 : smooth(thr, thr + cfg.soft, cov));
        wb[i] = cfg.gap <= -1 ? 0 : Math.max(0, .9 * smooth(thr - .14, thr - .14 + cfg.soft * .6, cov + .08 * noise(x * .2, y * .2, lt)));   // dry tails run past the stroke ends
      }
      ribbon(main, c, qx, qy, w, 0);
      for (let b = 0; b < cfg.bristles; b++) ribbon(bristle, c, qx, qy, wb, (b - (cfg.bristles - 1) / 2) * cfg.width * .45);
    }
    return { main, bristle };
  }

  function drawOutline(it, s, cs, buf, T, pad, seed) {
    if (!s.w || !buf) return;
    const cfg = it.cfg, k = s.dpr, gk = k / GS, ctx = s.ctx, gctx = s.gctx, still = reduce || !started;
    const born = it.born == null ? Infinity : it.born, a = still ? 1 : clamp01((T - born) / cfg.arriveDur);
    const glowOn = cfg.glow > 0 || cfg.echoes > 0;
    s.clear(glowOn);
    if (a <= 0) return;
    const ae = Math.pow(1 - a, 3), tq = cfg.steps ? Math.floor(T * cfg.steps) / cfg.steps : T, lt = tq * cfg.speed;
    const thrBoost = ae * 2.2, ampMul = 1 + 2 * ae;            // arrive: strokes paint on from scattered blobs
    const { main, bristle } = strokePath(cs, buf, lt, cfg, seed, thrBoost, ampMul);
    ctx.setTransform(k, 0, 0, k, pad * k, pad * k); ctx.fillStyle = cfg.color;
    ctx.globalAlpha = 1; ctx.fill(main); ctx.globalAlpha = .7; ctx.fill(bristle);
    if (glowOn) {
      gctx.setTransform(gk, 0, 0, gk, pad * gk, pad * gk); gctx.fillStyle = cfg.glowColor || cfg.color;
      gctx.globalAlpha = cfg.glow; gctx.fill(main);
      for (let j = 1; j <= cfg.echoes; j++) {
        const ep = strokePath(cs, buf, lt - j * cfg.echoLag, cfg, seed, thrBoost, ampMul * (1 + .3 * j)).main;
        gctx.setTransform(gk, 0, 0, gk, (pad - cfg.smear * j) * gk, pad * gk); gctx.globalAlpha = cfg.echoA * (1 - j / (cfg.echoes + 1)); gctx.fill(ep);
      }
      s.composite(cfg.blur);
    }
  }

  /* ---------- roto: outline an image's alpha silhouette ---------- */
  function traceAlpha(img, thr = 110, side = 220) {       // Moore-neighbour trace of the largest opaque blob; throws if the canvas is tainted
    const sc = side / Math.max(img.naturalWidth, img.naturalHeight), w = Math.max(2, Math.round(img.naturalWidth * sc)), h = Math.max(2, Math.round(img.naturalHeight * sc)), W = w + 2, H = h + 2;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 1, 1, w, h);
    const d = x.getImageData(0, 0, W, H).data, lab = new Int32Array(W * H), sizes = [0];
    for (let p = 0; p < W * H; p++) {
      if (lab[p] || d[p * 4 + 3] <= thr) continue;
      const id = sizes.length, st = [p]; lab[p] = id; let sz = 0;
      while (st.length) { const c = st.pop(); sz++; const cx = c % W, cy = (c / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy, np = ny * W + nx; if (nx >= 0 && ny >= 0 && nx < W && ny < H && !lab[np] && d[np * 4 + 3] > thr) { lab[np] = id; st.push(np); } } }
      sizes.push(sz);
    }
    const best = sizes.indexOf(Math.max(...sizes.slice(1)));
    if (best < 1) return [];
    const inB = (i, j) => i >= 0 && j >= 0 && i < W && j < H && lab[j * W + i] === best;
    const s0 = lab.indexOf(best), sx = s0 % W, sy = (s0 / W) | 0;
    const D = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]], dirOf = (dx, dy) => D.findIndex(v => v[0] === dx && v[1] === dy);
    let px = sx, py = sy, bx = sx - 1, by = sy, guard = 0; const pts = [];
    do {
      pts.push([(px - 1 + .5) / w, (py - 1 + .5) / h]);
      const bi = dirOf(bx - px, by - py); let moved = false;
      for (let k = 1; k <= 8; k++) {
        const di = (bi + k) % 8, qx = px + D[di][0], qy = py + D[di][1];
        if (inB(qx, qy)) { const pi = (di + 7) % 8; bx = px + D[pi][0]; by = py + D[pi][1]; px = qx; py = qy; moved = true; break; }
      }
      if (!moved) break;
    } while (!(px === sx && py === sy) && guard++ < 50000);
    return [smoothPoly(pts.filter((_, i) => i % 2 === 0), 2)];
  }

  function roto(img, opts = {}) {
    const host = opts.host || img.parentElement;
    const run = () => {
      let contours = opts.contour && opts.contour.contours, source = 'precomputed';
      if (!contours) {
        try { contours = traceAlpha(img); source = 'runtime alpha trace'; }
        catch (err) { contours = []; source = 'tainted canvas (' + err.name + '), no contour'; }
      }
      const box = () => ({ x: img.offsetLeft, y: img.offsetTop, w: img.offsetWidth, h: img.offsetHeight });
      const it = outline(host, { contours }, Object.assign({ box, gap: -.12, width: 8, offset: 4.5, amp: 3, bristles: 3 }, opts));
      it.source = source;
      return it;
    };
    if (opts.contour || img.complete) return run();
    return new Promise(res => img.addEventListener('load', () => res(run()), { once: true }));
  }

  return { render, start, outline, roto, traceAlpha, noise, VARIANTS, OUTLINE_VARIANTS, DEFAULT, items };
})();
