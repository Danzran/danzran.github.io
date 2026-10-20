/* v11 Painterly: colored-pencil scribble lettering.
   Each heading is set in Kalam Bold (OFL, window.PENCIL_FONT_B64, parsed with opentype.js 1.3.4 so it works over file://).
   Every glyph is FILLED by fast zig-zag hatching strokes (the way you colour a letter in with a pencil): a dense pass in the
   main gold/cream tone and a sparser cross pass in a pastel pencil colour, each letter at its own angle. The hatching is
   clipped to the glyph (an offscreen mask), eaten by a paper-grain texture (assets/grain.webp, from Codex; procedural
   fallback), and a loose double pencil outline is sketched over it.
   Motion: when a heading first scrolls into view the letters are coloured in quickly one after another (strokes grow
   along the zig-zag), then the outline is traced. After that the heading RE-SCRIBBLES on threes: every ~125 ms each
   letter gets a fresh random hatching (angle, spacing and wobble re-rolled), so it boils like hand-drawn animation.
   Only headings on screen boil. Reduced motion: drawn once, complete, no boil.
   API: Pencil.render(el, {seed, delay}) ; Pencil.start() */
window.Pencil = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE = window.V9_BASE || '';
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = x => 1 - Math.pow(1 - clamp(x), 2.2);
  const rng = s => () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const BOIL = .125;                 // seconds per drawing (on threes at 24 fps)
  const B = .3;                      // canvas bleed around the layout box, em
  const LH = 1.02, BASELINE = .8;    // line height and first baseline, em

  let font = null;
  try {
    const bin = atob(window.PENCIL_FONT_B64), buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    font = opentype.parse(buf.buffer);
  } catch (e) { font = null; }

  /* paper grain: Codex texture with alpha = where the paper tooth shows through (white) */
  const grainImg = new Image(); grainImg.src = BASE + 'assets/grain.webp';
  let grainFallback = null;
  function grainSource() {
    if (grainImg.complete && grainImg.naturalWidth) return grainImg;
    if (!grainFallback) {
      const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), d = g.createImageData(128, 128), R = rng(7);
      for (let i = 0; i < d.data.length; i += 4) { const v = R(); d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; d.data[i + 3] = v > .72 ? (v - .72) * 700 : 0; }
      g.putImageData(d, 0, 0); grainFallback = c;
    }
    return grainFallback;
  }

  /* palettes: night sky (default) and on a lit cloud card (deeper pencils on the pale cloud) */
  const PAL = {
    sky:   { main: ['#fff1c8', '#ffd07a', '#ffae7e'], base: 'rgba(255,232,196,.34)', hi: '#fffaf0', acc: ['#ff8fb4', '#b99aff', '#ff9a6e', '#f49fe0', '#8fb2ff'], line: '#25174f', lineA: .82, line2: '#ffd9e6', shadow: 'rgba(36,16,78,.42)' },
    cloud: { main: ['#7b6fd0', '#5b4fb0', '#463c96'], base: 'rgba(91,79,176,.16)', hi: '#ffffff', acc: ['#e06d98', '#7d6ae0', '#4f7fd8', '#e98a66', '#c56fb4'], line: '#231a52', lineA: .8, line2: '#ffffff', shadow: 'rgba(255,255,255,.0)' },
  };

  /* ---------- glyph layout in em units ---------- */
  function flatten(cmds) {
    const contours = []; let cur = null, x = 0, y = 0;
    for (const c of cmds) {
      if (c.type === 'M') { cur = [[c.x, c.y]]; contours.push(cur); x = c.x; y = c.y; }
      else if (c.type === 'L') { cur.push([c.x, c.y]); x = c.x; y = c.y; }
      else if (c.type === 'Q') { for (let k = 1; k <= 6; k++) { const t = k / 6, u = 1 - t; cur.push([u * u * x + 2 * u * t * c.x1 + t * t * c.x, u * u * y + 2 * u * t * c.y1 + t * t * c.y]); } x = c.x; y = c.y; }
      else if (c.type === 'C') { for (let k = 1; k <= 8; k++) { const t = k / 8, u = 1 - t; cur.push([u * u * u * x + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x, u * u * u * y + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y]); } x = c.x; y = c.y; }
      else if (c.type === 'Z' && cur && cur.length) { cur.push(cur[0].slice()); }
    }
    return contours.filter(c => c.length > 2);
  }
  function layout(text, maxEm) {
    const words = text.split(/\s+/).filter(Boolean), space = font.charToGlyph(' ').advanceWidth / font.unitsPerEm;
    const wordW = w => { const gs = font.stringToGlyphs(w); let x = 0; gs.forEach((g, i) => { x += g.advanceWidth / font.unitsPerEm; if (gs[i + 1]) x += font.getKerningValue(g, gs[i + 1]) / font.unitsPerEm; }); return x; };
    const lines = []; let line = [], lw = 0;
    for (const w of words) {
      const ww = wordW(w);
      if (line.length && lw + space + ww > maxEm) { lines.push([line, lw]); line = [w]; lw = ww; }
      else { lw += (line.length ? space : 0) + ww; line.push(w); }
    }
    if (line.length) lines.push([line, lw]);
    const letters = []; let width = 0;
    lines.forEach(([ws, w], li) => {
      width = Math.max(width, w);
      const gs = font.stringToGlyphs(ws.join(' ')); let x = 0;
      gs.forEach((g, i) => {
        const p = g.getPath(x, BASELINE + li * LH, 1), bb = p.getBoundingBox();
        if (bb.x2 > bb.x1 && g.unicode !== 32) letters.push({ d: new Path2D(p.toPathData(5)), bb, contours: flatten(p.commands), line: li });
        x += g.advanceWidth / font.unitsPerEm; if (gs[i + 1]) x += font.getKerningValue(g, gs[i + 1]) / font.unitsPerEm;
      });
    });
    return { letters, width, height: (lines.length - 1) * LH + 1.08, lines: lines.length };
  }

  /* ---------- drawing ---------- */
  // one zig-zag scribble across a letter's box at angle a; k = 0..1 how much of it is drawn so far
  function zigzag(g, bb, a, gap, wob, k, R) {
    const ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
    const cs = [[bb.x1, bb.y1], [bb.x2, bb.y1], [bb.x1, bb.y2], [bb.x2, bb.y2]];
    let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
    for (const [x, y] of cs) { const u = x * ux + y * uy, v = x * vx + y * vy; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
    const n = Math.max(2, Math.ceil((v1 - v0) / gap) + 1), m = n * k;
    if (m < .05) return;
    const P = (u, v) => [u * ux + v * vx, u * uy + v * vy];
    let v = v0 - gap * .5 * R(), side = 0;
    let [px, py] = P(u0 - .04 * R(), v);
    const a0 = g.globalAlpha, w0 = g.lineWidth;
    for (let j = 1; j <= Math.ceil(m); j++) {
      side ^= 1; v += gap * (.75 + .5 * R());
      const u = side ? u1 + .06 * R() - .03 : u0 - .06 * R() + .03;
      let [x, y] = P(u, v + (R() - .5) * gap * .6);
      const f = Math.min(1, m - (j - 1));
      if (f < 1) { x = px + (x - px) * f; y = py + (y - py) * f; }
      // each stroke bows a little, like a fast wrist movement, and the pencil pressure varies stroke to stroke
      const mx = (px + x) / 2 + vx * (R() - .5) * wob, my = (py + y) / 2 + vy * (R() - .5) * wob;
      g.globalAlpha = a0 * (.6 + .4 * R()); g.lineWidth = w0 * (.75 + .5 * R());
      g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(mx, my, x, y); g.stroke();
      px = x; py = y;
    }
    g.globalAlpha = a0; g.lineWidth = w0;
  }
  function sketch(g, contours, amp, k, R) {
    for (const c of contours) {
      const n = Math.max(2, Math.floor(c.length * k)); if (k <= 0) return;
      const ox = (R() - .5) * amp, oy = (R() - .5) * amp, ph = R() * 6.28, fr = 3 + R() * 4;
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const w = Math.sin(i / c.length * fr * 6.28 + ph) * amp * .6;
        const x = c[i][0] + ox + w, y = c[i][1] + oy + Math.cos(i * .7 + ph) * amp * .35;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
  }

  const items = [];
  function render(el, opts = {}) {
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    if (!font || !text) return;
    el.classList.add('pc');
    el.textContent = '';
    const sr = document.createElement('span'); sr.className = 'pc-sr'; sr.textContent = text;
    const box = document.createElement('span'); box.className = 'pc-box'; box.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas'); box.appendChild(canvas); el.append(sr, box);
    const it = { el, box, canvas, ctx: canvas.getContext('2d'), hatch: document.createElement('canvas'), mask: document.createElement('canvas'), shade: document.createElement('canvas'),
      text, seed: opts.seed || 1, delay: opts.delay || 0, born: reduce ? -1e9 : null, visible: false, lay: null, px: 0, maxEm: 0, lastKey: '', pal: null };
    it.hg = it.hatch.getContext('2d');
    // per letter: its own hatch angle (roughly diagonal, mirrored now and then) and accent pencil
    it.resize = () => {
      const cs = getComputedStyle(el), px = parseFloat(cs.fontSize);
      const avail = (el.parentElement.clientWidth || innerWidth) - 4;
      const maxEm = avail / px;
      if (px === it.px && Math.abs(maxEm - it.maxEm) < .01 && it.lay) return;
      it.px = px; it.maxEm = maxEm;
      it.lay = layout(text, Math.max(3, maxEm));
      const R = rng(it.seed * 977 + 5);
      it.lay.letters.forEach((L, i) => { L.ang = (R() < .78 ? -.95 : .95) + (R() - .5) * .5; L.acc = Math.floor(R() * 5); L.i = i; });
      const dpr = Math.min(devicePixelRatio || 1, 2), S = px * dpr, W = it.lay.width + B * 2, H = it.lay.height + B * 2;
      box.style.width = it.lay.width + 'em'; box.style.height = it.lay.height + 'em';
      Object.assign(canvas.style, { left: -B + 'em', top: -B + 'em', width: W + 'em', height: H + 'em' });
      for (const c of [canvas, it.hatch, it.mask, it.shade]) { c.width = Math.ceil(W * S); c.height = Math.ceil(H * S); }
      it.S = S; it.lastKey = ''; it.pal = null; it.grad = null;
    };
    it.build = pal => {   // glyph mask + soft halo behind (for contrast over a bright sky)
      const S = it.S, mg = it.mask.getContext('2d'), sg = it.shade.getContext('2d');
      mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, it.mask.width, it.mask.height);
      mg.setTransform(S, 0, 0, S, B * S, B * S); mg.fillStyle = '#000';
      mg.lineJoin = 'round'; mg.lineWidth = .012; mg.strokeStyle = '#000';
      it.lay.letters.forEach(L => { mg.fill(L.d); mg.stroke(L.d); });
      sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, it.shade.width, it.shade.height);
      sg.filter = `blur(${Math.max(2, S * .04)}px)`; sg.drawImage(it.mask, 0, S * .03); sg.drawImage(it.mask, 0, S * .03); sg.filter = 'none';
      sg.globalCompositeOperation = 'source-in'; sg.fillStyle = pal.shadow; sg.fillRect(0, 0, it.shade.width, it.shade.height); sg.globalCompositeOperation = 'source-over';
      it.pal = pal;
    };
    it.draw = now => {
      if (!it.lay) it.resize();
      const pal = el.closest('.card') && document.documentElement.classList.contains('clouds') ? PAL.cloud : PAL.sky;
      if (pal !== it.pal) { it.build(pal); it.lastKey = ''; }
      const t = now / 1000, age = it.born == null ? -1 : t - it.born - it.delay;
      const n = it.lay.letters.length, stag = Math.min(.07, .7 / n), dur = .42;
      const drawing = age < n * stag + dur + .7;
      const boil = reduce ? 0 : Math.floor(t / BOIL);
      const key = drawing ? 'd' + now : 'b' + boil;
      if (key === it.lastKey) return;
      it.lastKey = key;
      const { ctx, hg, S } = it, Wd = it.hatch.width, Hd = it.hatch.height;
      hg.setTransform(1, 0, 0, 1, 0, 0); hg.globalCompositeOperation = 'source-over'; hg.clearRect(0, 0, Wd, Hd);
      hg.setTransform(S, 0, 0, S, B * S, B * S); hg.lineCap = 'round'; hg.lineJoin = 'round';
      const big = it.px > 70 ? 1 : 1.25;
      // the main pencil shades from cream at the top of each line to gold and peach at the bottom (low sun light)
      if (!it.grad || it.grad.pal !== pal) {
        const gr = hg.createLinearGradient(0, BASELINE - .72, 0, BASELINE + .12);
        gr.addColorStop(0, pal.main[0]); gr.addColorStop(.55, pal.main[1]); gr.addColorStop(1, pal.main[2]);
        it.grad = { pal, lines: [gr] };
        for (let li = 1; li < it.lay.lines; li++) { const g2 = hg.createLinearGradient(0, BASELINE + li * LH - .72, 0, BASELINE + li * LH + .12); g2.addColorStop(0, pal.main[0]); g2.addColorStop(.55, pal.main[1]); g2.addColorStop(1, pal.main[2]); it.grad.lines.push(g2); }
      }
      // a light wash first, so the letter reads even through the gaps between strokes
      hg.fillStyle = pal.base;
      it.lay.letters.forEach((L, i) => { const k = reduce ? 1 : ease((age - i * stag) / dur); if (k > 0) { hg.globalAlpha = k; hg.fill(L.d); } });
      hg.globalAlpha = 1;
      it.lay.letters.forEach((L, i) => {
        const k = reduce ? 1 : ease((age - i * stag) / dur); if (k <= 0) return;
        const R = rng(it.seed * 7919 + i * 131 + boil * 977);
        // dense main tone
        hg.strokeStyle = it.grad.lines[L.line]; hg.globalAlpha = 1; hg.lineWidth = .032 * big;
        zigzag(hg, L.bb, L.ang + (R() - .5) * .16, .04 * big, .06, k, R);
        // cross pass in this letter's pastel pencil
        hg.strokeStyle = pal.acc[(L.acc + (reduce ? 0 : 0)) % pal.acc.length]; hg.globalAlpha = .9; hg.lineWidth = .026 * big;
        zigzag(hg, L.bb, L.ang + 1.15 + (R() - .5) * .3, .075 * big, .07, clamp(k * 1.3 - .3), R);
        // a few cream highlight strokes
        hg.strokeStyle = pal.hi; hg.globalAlpha = .6; hg.lineWidth = .016 * big;
        zigzag(hg, L.bb, L.ang - .35 + (R() - .5) * .3, .16 * big, .08, clamp(k * 1.6 - .6), R);
      });
      hg.globalAlpha = 1;
      // paper tooth eats some pigment
      const gs = grainSource(); const pat = hg.createPattern(gs, 'repeat');
      if (pat) {
        hg.setTransform(1, 0, 0, 1, 0, 0);
        const sc = gs === grainImg ? .5 * Math.min(devicePixelRatio || 1, 2) : 1;
        if (pat.setTransform) pat.setTransform(new DOMMatrix([sc, 0, 0, sc, (boil % 3) * 37, (boil % 2) * 53]));
        hg.globalCompositeOperation = 'destination-out'; hg.globalAlpha = .55; hg.fillStyle = pat; hg.fillRect(0, 0, Wd, Hd);
        hg.globalAlpha = 1;
      }
      hg.globalCompositeOperation = 'destination-in'; hg.drawImage(it.mask, 0, 0);
      hg.globalCompositeOperation = 'source-over';
      // compose: halo, hatching, then the loose pencil outline
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, Wd, Hd);
      const showAll = reduce ? 1 : clamp(age * 3);
      ctx.globalAlpha = showAll; ctx.drawImage(it.shade, 0, 0); ctx.globalAlpha = 1;
      ctx.drawImage(it.hatch, 0, 0);
      ctx.setTransform(S, 0, 0, S, B * S, B * S); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      it.lay.letters.forEach((L, i) => {
        const k = reduce ? 1 : ease((age - i * stag - .18) / .55); if (k <= 0) return;
        const R = rng(it.seed * 104729 + i * 31 + boil * 613);
        ctx.strokeStyle = pal.line; ctx.globalAlpha = pal.lineA; ctx.lineWidth = .022 * big;
        sketch(ctx, L.contours, .016, k, R);
        ctx.strokeStyle = pal.line2; ctx.globalAlpha = .4; ctx.lineWidth = .009 * big;
        sketch(ctx, L.contours, .026, k, R);
      });
      ctx.globalAlpha = 1;
    };
    el.__pencil = it; items.push(it);
    it.resize(); it.draw(performance.now());
    io.observe(el); ro.observe(el.parentElement);
    return it;
  }

  const io = new IntersectionObserver(es => es.forEach(e => {
    const it = e.target.__pencil; if (!it) return;
    it.visible = e.isIntersecting;
    if (e.isIntersecting && it.born == null) it.born = performance.now() / 1000;
  }), { rootMargin: '0px 0px -8% 0px' });
  const ro = new ResizeObserver(() => items.forEach(it => { const p = it.px; it.resize(); if (p !== it.px || !it.lastKey) it.draw(performance.now()); }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) items.forEach(it => { it.lastKey = ''; }); });

  let started = false;
  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    for (const it of items) if (it.visible) it.draw(now);
  }
  function start() { if (started) return; started = true; requestAnimationFrame(loop); }
  // the clouds switch changes the palette for headings that sit on a card
  let cl = null;
  new MutationObserver(() => { const c = document.documentElement.classList.contains('clouds'); if (c === cl) return; cl = c; items.forEach(it => { it.pal = null; it.lastKey = ''; it.draw(performance.now()); }); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return { render, start };
})();
