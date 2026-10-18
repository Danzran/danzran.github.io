/* v11 Skyshader lettering: LIGHT PAINTING in a cloud font (v12; OFL, embedded in ../../assets/fonts/cloud-*-font.js).
   A small shooting-star head traces every contour of every glyph, glyph by glyph, leaving an additive trail
   (white-hot core -> warm gold -> pastel rose/lavender bloom). Each finished glyph cools into its filled letterform,
   and once the word is written it keeps a quiet life: a slow light runs along the contours and motes of light drift off.
   The real text stays in the DOM (transparent, same font) for layout, selection and screen readers; the canvas draws it.
   API: LightPaint.mount(el) -> item; LightPaint.play(el, delay); items play once. Reduced motion: drawn instantly, still. */
window.LightPaint = (() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = () => Math.min(devicePixelRatio || 1, 2);
const TAU = Math.PI * 2, rand = (a, b) => a + Math.random() * (b - a), clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
/* v12: cloud fonts (../../assets/fonts/cloud-*-font.js). ?font=rubik-bubbles|cherry-bomb-one|sniglet|modak; Mincho if none loaded */
const CF = window.CLOUD_FONTS || {}, want = (location.search.match(/[?&]font=([\w-]+)/) || [])[1];
const FONT_KEY = CF[want] ? want : CF['rubik-bubbles'] ? 'rubik-bubbles' : Object.keys(CF)[0];
document.documentElement.dataset.font = FONT_KEY || 'mincho';
const bin = Uint8Array.from(atob(FONT_KEY ? CF[FONT_KEY] : window.MINCHO_FONT_B64), c => c.charCodeAt(0)).buffer;
const font = opentype.parse(bin);
let faceReady = Promise.resolve();
try { const ff = new FontFace('LP Cloud', bin.slice(0)); document.fonts.add(ff); faceReady = ff.load().catch(() => {}); } catch (e) {}
const BLOOM = ['255,186,206', '214,190,255', '255,206,160', '190,210,255'];   // rose, lavender, peach, periwinkle
const items = [];
let now = 0;

/* ---------- geometry: glyph outlines -> fill Path2D + sampled contours ---------- */
function contoursOf(path) {
  const cs = []; let cur = null, px = 0, py = 0;
  const push = (x, y) => { cur.push(x, y); px = x; py = y; };
  for (const c of path.commands) {
    if (c.type === 'M') { cur = []; cs.push(cur); push(c.x, c.y); }
    else if (c.type === 'L') push(c.x, c.y);
    else if (c.type === 'Q' || c.type === 'C') {
      const x0 = px, y0 = py, n = Math.max(4, Math.min(24, Math.round(Math.hypot(c.x - x0, c.y - y0) / 3)));
      for (let i = 1; i <= n; i++) {
        const t = i / n, u = 1 - t; let x, y;
        if (c.type === 'Q') { x = u * u * x0 + 2 * u * t * c.x1 + t * t * c.x; y = u * u * y0 + 2 * u * t * c.y1 + t * t * c.y; }
        else { x = u * u * u * x0 + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x; y = u * u * u * y0 + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y; }
        push(x, y);
      }
    } else if (c.type === 'Z' && cur && cur.length) push(cur[0], cur[1]);
  }
  return cs.filter(a => a.length >= 6).map(a => {
    const pts = Float32Array.from(a), n = pts.length / 2, cum = new Float32Array(n);
    for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(pts[i * 2] - pts[i * 2 - 2], pts[i * 2 + 1] - pts[i * 2 - 1]);
    return { pts, cum, len: cum[n - 1], n };
  });
}
function build(it) {
  const el = it.el, cs = getComputedStyle(el), size = parseFloat(cs.fontSize);
  const r = el.getBoundingClientRect(); if (!r.width) return false;
  const sc = size / font.unitsPerEm, asc = font.ascender * sc, desc = -font.descender * sc;
  const ls = parseFloat(cs.letterSpacing) || 0;
  const pad = Math.round(size * .5), dpr = DPR();
  it.size = size; it.pad = pad; it.w = r.width + pad * 2; it.h = r.height + pad * 2;
  const c = it.canvas; c.width = Math.round(it.w * dpr); c.height = Math.round(it.h * dpr);
  Object.assign(c.style, { left: -pad + 'px', top: -pad + 'px', width: it.w + 'px', height: it.h + 'px' });
  it.g = c.getContext('2d'); it.g.setTransform(dpr, 0, 0, dpr, 0, 0); it.dpr = dpr;
  const runs = el.querySelectorAll('.ln').length ? [...el.querySelectorAll('.ln')] : [el];
  const glyphs = []; let top = Infinity, bottom = -Infinity;
  runs.forEach(run => {
    const rr = run === el ? r : run.getBoundingClientRect();
    const lineH = run === el ? parseFloat(cs.lineHeight) || rr.height : rr.height;
    const ox = rr.left - r.left + pad, base = rr.top - r.top + pad + (run === el ? (rr.height - lineH) / 2 : 0) + (lineH - (asc + desc)) / 2 + asc;
    top = Math.min(top, base - asc * .78); bottom = Math.max(bottom, base + desc * .2);
    const gs = font.stringToGlyphs(run.textContent.trim()); let x = ox;
    gs.forEach((gl, i) => {
      const p = gl.getPath(x, base, size);
      const cont = contoursOf(p);
      if (cont.length) glyphs.push({ path: new Path2D(p.toPathData(2)), cont, len: cont.reduce((s, q) => s + q.len, 0), bloom: BLOOM[glyphs.length % BLOOM.length] });
      x += gl.advanceWidth * sc + ls + (gs[i + 1] ? font.getKerningValue(gl, gs[i + 1]) * sc : 0);
    });
  });
  it.glyphs = glyphs; it.top = top; it.bottom = bottom;
  // timeline: one head, contour after contour, glyph after glyph
  const v = Math.max(900, size * (size > 110 ? 13 : 16)); it.v = v;
  let t = 0, prev = null;
  glyphs.forEach(g => {
    g.cont.forEach(q => {
      if (prev) { const d = Math.hypot(q.pts[0] - prev[0], q.pts[1] - prev[1]); q.jump = clamp(d / (v * 1.8), .02, .14); t += q.jump; } else q.jump = 0;
      q.t0 = t; t += q.len / v; q.t1 = t; prev = [q.pts[q.n * 2 - 2], q.pts[q.n * 2 - 1]];
    });
    g.done = t;
    g.main = g.cont.reduce((a, b) => (b.len > a.len ? b : a));
  });
  // scalloped cloud outlines are long: keep the write-on to a couple of seconds
  const maxT = size > 110 ? 2.6 : 1.5, k = t > maxT ? maxT / t : 1;
  if (k < 1) glyphs.forEach(g => { g.done *= k; g.cont.forEach(q => { q.t0 *= k; q.t1 *= k; q.jump *= k; }); });
  it.v = v / k; it.total = t * k;
  it.cache = null;
  return true;
}
function at(q, d) {   // point at arc length d along a contour
  let lo = 0, hi = q.n - 1;
  while (lo < hi - 1) { const m = (lo + hi) >> 1; if (q.cum[m] < d) lo = m; else hi = m; }
  const seg = q.cum[hi] - q.cum[lo] || 1, k = clamp((d - q.cum[lo]) / seg);
  return [q.pts[lo * 2] + (q.pts[hi * 2] - q.pts[lo * 2]) * k, q.pts[lo * 2 + 1] + (q.pts[hi * 2 + 1] - q.pts[lo * 2 + 1]) * k, lo];
}

/* ---------- drawing ---------- */
function fillStyle(it, g) {
  const gr = g.createLinearGradient(0, it.top, 0, it.bottom);
  // lit like a cloud at dusk: white crown, warm middle, lavender underside
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(.45, '#fff3ea'); gr.addColorStop(.8, '#f4d3e6'); gr.addColorStop(1, '#c9b6f2');
  return gr;
}
function drawFill(it, g, glyph, a, hot) {
  g.globalCompositeOperation = 'source-over';
  g.save();
  g.globalAlpha = a; g.shadowColor = 'rgba(255,214,236,.6)'; g.shadowBlur = it.size * (.12 + .3 * hot);
  g.fillStyle = it.fs; g.fill(glyph.path);
  g.restore();
  if (hot > .01) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * hot * .8; g.fillStyle = '#fff6e6'; g.fill(glyph.path); g.globalAlpha = 1; }
}
function sparkle(g, x, y, r, a, c) {
  g.fillStyle = `rgba(${c},${a})`;
  g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r * .85, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r * .85, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
}
function head(it, g, x, y, dx, dy) {
  const s = it.size, R = Math.max(10, s * .2);
  const hg = g.createRadialGradient(x, y, 0, x, y, R);
  hg.addColorStop(0, 'rgba(255,255,255,1)'); hg.addColorStop(.12, 'rgba(255,246,220,.95)'); hg.addColorStop(.35, 'rgba(255,206,140,.35)'); hg.addColorStop(1, 'rgba(255,180,200,0)');
  g.fillStyle = hg; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();
  sparkle(g, x, y, R * .9, .9, '255,250,236');
  const l = Math.hypot(dx, dy) || 1, tx = x - dx / l * s * .7, ty = y - dy / l * s * .7;   // a short comet tail behind the head
  const tg = g.createLinearGradient(x, y, tx, ty); tg.addColorStop(0, 'rgba(255,244,214,.9)'); tg.addColorStop(1, 'rgba(255,190,140,0)');
  g.strokeStyle = tg; g.lineWidth = Math.max(1.5, s * .03); g.beginPath(); g.moveTo(x, y); g.lineTo(tx, ty); g.stroke();
  if (Math.random() < .7) it.motes.push({ x, y, vx: rand(-1, 1) * s * .5 - dx / l * s * .4, vy: rand(-1, 1) * s * .5 - dy / l * s * .4, life: 0, dur: rand(.35, .8), r: rand(.6, 1.6) * Math.max(1, s / 90), c: Math.random() < .5 ? '255,236,190' : it.glyphs[0].bloom });
}
// the trail: chunks of a contour from its start to `upto` (arc length), coloured by how long ago the head passed
function trail(it, g, q, upto, tnow, bloom) {
  const v = it.v, s = it.size, step = 5;
  let i = 0;
  g.lineCap = 'round'; g.lineJoin = 'round';
  while (i < q.n - 1 && q.cum[i] < upto) {
    const j = Math.min(q.n - 1, i + step);
    const mid = q.cum[Math.min(q.n - 1, i + (step >> 1))];
    const age = tnow - (q.t0 + mid / v);
    const I = Math.exp(-Math.max(0, age) / .5);
    if (I > .02) {
      g.beginPath(); g.moveTo(q.pts[i * 2], q.pts[i * 2 + 1]);
      let k = i + 1;
      for (; k <= j && q.cum[k - 1] < upto; k++) g.lineTo(q.pts[k * 2], q.pts[k * 2 + 1]);
      g.strokeStyle = `rgba(${bloom},${.16 * I})`; g.lineWidth = s * (.06 + .1 * I); g.stroke();
      g.strokeStyle = `rgba(255,${200 + 40 * I | 0},${130 + 100 * I | 0},${.55 * I})`; g.lineWidth = s * (.02 + .03 * I); g.stroke();
      g.strokeStyle = `rgba(255,252,240,${.95 * I * I})`; g.lineWidth = Math.max(1, s * .012); g.stroke();
    }
    i = j;
  }
}
function drawMotes(it, g, dt) {
  g.globalCompositeOperation = 'lighter';
  for (let i = it.motes.length - 1; i >= 0; i--) {
    const m = it.motes[i]; m.life += dt; const p = m.life / m.dur;
    if (p >= 1) { it.motes.splice(i, 1); continue; }
    m.vx *= .96; m.vy = m.vy * .96 - it.size * .25 * dt; m.x += m.vx * dt; m.y += m.vy * dt;
    const a = (1 - p) * (.55 + .45 * Math.sin(m.life * 24 + i));
    if (m.r > 1.6) sparkle(g, m.x, m.y, m.r * 2.4, a, m.c);
    else { g.fillStyle = `rgba(${m.c},${a})`; g.beginPath(); g.arc(m.x, m.y, m.r, 0, TAU); g.fill(); }
  }
  if (it.motes.length > 260) it.motes.splice(0, it.motes.length - 260);
}
function makeCache(it) {
  const c = document.createElement('canvas'); c.width = it.canvas.width; c.height = it.canvas.height;
  const g = c.getContext('2d'); g.setTransform(it.dpr, 0, 0, it.dpr, 0, 0);
  it.glyphs.forEach(gl => drawFill(it, g, gl, 1, 0));
  it.cache = c;
}
function render(it, dt) {
  const g = it.g; it.fs = it.fs || fillStyle(it, g);
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, it.canvas.width, it.canvas.height); g.setTransform(it.dpr, 0, 0, it.dpr, 0, 0);
  const t = it.state === 'idle' ? Infinity : now - it.start;
  if (t < 0) return;
  if (it.state === 'drawing' && t > it.total + 1.6) { it.state = 'done'; it.doneAt = now; }
  if (it.state === 'done' || it.state === 'idle') {
    if (!it.cache) makeCache(it);
    g.globalCompositeOperation = 'source-over'; g.drawImage(it.cache, 0, 0, it.w, it.h);
    if (it.state === 'idle') return;
    shimmer(it, g, dt); return;
  }
  // 1. letterforms that have finished cool into their fill
  it.glyphs.forEach(gl => {
    const k = clamp((t - gl.done + .08) / .55);
    if (k > 0) drawFill(it, g, gl, k * k * (3 - 2 * k), Math.exp(-(t - gl.done) * 2.2));
  });
  // 2. the light trail
  g.globalCompositeOperation = 'lighter';
  let hx = null, hy, hdx = 0, hdy = 0;
  it.glyphs.forEach(gl => gl.cont.forEach(q => {
    if (t < q.t0) {
      if (t > q.t0 - q.jump && hx == null) {   // the head flying to this contour's start
        const k = 1 - (q.t0 - t) / q.jump, pq = q.prev;
        if (pq) { hx = pq[0] + (q.pts[0] - pq[0]) * k; hy = pq[1] + (q.pts[1] - pq[1]) * k - Math.sin(k * Math.PI) * it.size * .15; hdx = q.pts[0] - pq[0]; hdy = q.pts[1] - pq[1]; }
      }
      return;
    }
    const upto = Math.min(q.len, (t - q.t0) * it.v);
    trail(it, g, q, upto, t, gl.bloom);
    if (t < q.t1) { const p = at(q, upto), p0 = at(q, Math.max(0, upto - 6)); hx = p[0]; hy = p[1]; hdx = p[0] - p0[0]; hdy = p[1] - p0[1]; }
  }));
  if (hx != null) head(it, g, hx, hy, hdx, hdy);
  drawMotes(it, g, dt);
  g.globalCompositeOperation = 'source-over';
}
// after the word is written: light runs slowly along each glyph's outer contour, and motes drift off the strokes
function shimmer(it, g, dt) {
  const s = it.size, T = now - it.doneAt;
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  it.glyphs.forEach((gl, k) => {
    const q = gl.main, L = Math.min(q.len * .3, s * .9);
    const pos = ((T * s * .55 + k * q.len * .37) % (q.len + L * 2)) - L;
    const breathe = .6 + .4 * Math.sin(T * .9 + k * 1.7);
    const N = 10;
    for (let i = 0; i < N; i++) {
      const a0 = pos + (i / N) * L, a1 = pos + ((i + 1) / N) * L;
      if (a1 < 0 || a0 > q.len) continue;
      const p0 = at(q, clamp(a0, 0, q.len)), p1 = at(q, clamp(a1, 0, q.len));
      const w = Math.sin(((i + .5) / N) * Math.PI);
      g.strokeStyle = `rgba(${gl.bloom},${.16 * w * breathe})`; g.lineWidth = s * .07;
      g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
      g.strokeStyle = `rgba(255,248,228,${.6 * w * breathe})`; g.lineWidth = Math.max(1, s * .014); g.stroke();
    }
  });
  // motes, about three a second per heading (more on the big hero name)
  if (Math.random() < dt * (s > 110 ? 7 : 3)) {
    const gl = it.glyphs[(Math.random() * it.glyphs.length) | 0], q = gl.cont[(Math.random() * gl.cont.length) | 0], p = at(q, Math.random() * q.len);
    it.motes.push({ x: p[0], y: p[1], vx: rand(-.15, .15) * s, vy: rand(-.25, -.05) * s, life: 0, dur: rand(1.4, 2.8), r: rand(.5, 1.9) * Math.max(1, s / 110), c: Math.random() < .5 ? '255,236,190' : gl.bloom });
  }
  drawMotes(it, g, dt);
  g.globalCompositeOperation = 'source-over';
}

/* ---------- lifecycle ---------- */
function mount(el) {
  const c = document.createElement('canvas'); c.className = 'lp-canvas'; c.setAttribute('aria-hidden', 'true');
  el.appendChild(c); el.classList.add('lp');
  const it = { el, canvas: c, motes: [], state: 'wait', visible: true };
  items.push(it);
  faceReady.then(() => document.fonts.ready).then(() => { if (build(it)) { linkPrev(it); el.classList.add('lp-ready'); if (reduce) { it.state = 'idle'; render(it, 0); } } });
  return it;
}
function linkPrev(it) { let prev = null; it.glyphs.forEach(g => g.cont.forEach(q => { q.prev = prev; prev = [q.pts[q.n * 2 - 2], q.pts[q.n * 2 - 1]]; })); }
function play(el, delay = 0) {
  const it = items.find(i => i.el === el); if (!it || it.state !== 'wait') return;
  if (reduce) { it.state = 'idle'; return; }
  it.state = 'drawing'; it.start = now + delay;
}
function playing(el) { const it = items.find(i => i.el === el); return !!it && it.state !== 'wait'; }
function headAt(el) {   // where the first stroke starts, in viewport px (the landing meteor aims here)
  const it = items.find(i => i.el === el); if (!it || !it.glyphs || !it.glyphs.length) return null;
  const r = it.canvas.getBoundingClientRect(), q = it.glyphs[0].cont[0];
  return { x: r.left + q.pts[0], y: r.top + q.pts[1] };
}
if (!reduce) {
  const io = new IntersectionObserver(es => es.forEach(e => { const it = items.find(i => i.canvas === e.target); if (it) it.visible = e.isIntersecting; }));
  const watch = () => items.forEach(it => { if (!it.watched) { io.observe(it.canvas); it.watched = true; } });
  let last = performance.now();
  const loop = tm => {
    requestAnimationFrame(loop);
    const dt = Math.min(.05, (tm - last) / 1000); last = tm; now += dt;
    watch();
    items.forEach(it => { if (it.glyphs && it.state !== 'wait' && it.visible) render(it, dt); });
  };
  requestAnimationFrame(loop);
}
let rt = 0;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => items.forEach(it => { if (build(it)) { linkPrev(it); it.fs = null; if (reduce || it.state === 'idle') render(it, 0); } }), 120); });
return { mount, play, playing, headAt };
})();
