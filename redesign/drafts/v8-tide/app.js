(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const rand = (a, b) => a + Math.random() * (b - a);
let onTwos = true;                                   // framey by default; the toggle shows the smooth version
const clock = () => { const t = performance.now() / 1000; return onTwos ? Math.floor(t * 12) / 12 : t; };
const btn = document.getElementById('cadence');
btn.onclick = () => { onTwos = !onTwos; btn.textContent = 'water: ' + (onTwos ? 'on twos' : 'smooth'); btn.setAttribute('aria-pressed', onTwos); };

/* ---------- day / night tide: night tints the sky navy and lights the water from inside with gold ---------- */
const DAY = { ...Water.C };
const NIGHT = { deep: '#1d4fa8', mid: '#4d8fe0', light: '#ffd98a', foam: '#fff3c4', ink: '#0d1c40', edge: '#d6e8ff', s1: '#ffe9b0', s2: '#ffd27a', s3: '#f6c25e', glow: 'rgba(255,214,120,.55)' };
const theme = { night: 0 };
const nightBtn = document.getElementById('night');
const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * .8, r: Math.random() * 1.3 + .3, tw: Math.random() * 6 }));
function setNight(on) {
  document.documentElement.classList.toggle('night', on);
  Object.assign(Water.C, on ? NIGHT : DAY);
  nightBtn.textContent = on ? '☀ day' : '☾ night tide'; nightBtn.setAttribute('aria-pressed', on);
  if (reduce || !window.gsap) theme.night = on ? 1 : 0;
  else gsap.to(theme, { night: on ? 1 : 0, duration: .9, ease: 'steps(6)' });   // the sky changes in drawn steps, not a fade
}
nightBtn.onclick = () => setNight(!document.documentElement.classList.contains('night'));
if (/[?&]night/.test(location.search)) setNight(true);   // index.html?night opens straight into night tide

/* ---------- lettering + figure drawings on threes ---------- */
document.querySelectorAll('[data-brush]').forEach((el, i) => Lettering.render(el, { seed: 9 + i * 29 }));
if (!reduce) Lettering.start(7);
const figEl = document.getElementById('fig'), figs = [...figEl.querySelectorAll('img')]; let fk = 0;
if (!reduce) setInterval(() => { figs[fk].classList.remove('on'); fk = (fk + 1 + (Math.random() * 2 | 0)) % figs.length; figs[fk].classList.add('on'); }, 125);

/* ---------- canvases ---------- */
const sky = document.getElementById('sky'), river = document.getElementById('river'), front = document.getElementById('ribbonFront'), hero = document.getElementById('hero');
const sx = sky.getContext('2d'), rx = river.getContext('2d'), fx = front.getContext('2d');
let W = 0, H = 0, docH = 0;
const figBox = () => ({ x: figEl.offsetLeft, y: figEl.offsetTop, w: figEl.offsetWidth, h: figEl.offsetHeight });

/* ---------- cotton clouds: soft puffs pre-rendered to sprites (ivory tops, azure undersides, a touch of gold) ---------- */
function cloudSprite(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const puff = (x, y, r) => {
    r = Math.min(r, x, w - x, y, h - y); if (r < 4) return;
    const rg = g.createRadialGradient(x, y - r * .2, r * .1, x, y, r); rg.addColorStop(0, '#fff'); rg.addColorStop(.78, 'rgba(255,255,255,.96)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  };
  // a flat-bottomed cumulus: big puffs in the middle, smaller toward the edges, little bumps on top
  for (let i = 0; i < 22; i++) { const u = Math.random(), x = w * (.15 + .7 * u), hump = Math.sin(Math.PI * u); puff(x, h * (.7 - .22 * hump * Math.random()), h * (.12 + .2 * hump)); }
  for (let i = 0; i < 26; i++) { const u = Math.random(), x = w * (.2 + .6 * u), hump = Math.sin(Math.PI * u); puff(x, h * (.62 - .34 * hump), h * (.05 + .07 * Math.random())); }
  g.globalCompositeOperation = 'source-atop';
  const shade = g.createLinearGradient(0, 0, 0, h);
  shade.addColorStop(0, 'rgba(246,214,150,.35)'); shade.addColorStop(.45, 'rgba(255,255,255,0)'); shade.addColorStop(.8, 'rgba(120,160,220,.45)'); shade.addColorStop(1, 'rgba(90,130,200,.55)');
  g.fillStyle = shade; g.fillRect(0, 0, w, h);
  return c;
}
const clouds = [];
for (let i = 0; i < 16; i++) {
  const s = rand(.5, 1.5), depth = rand(.08, .45);
  clouds.push({ img: cloudSprite(Math.round(560 * s), Math.round(280 * s)), x: Math.random(), y: rand(-.1, 3.2), depth, v: rand(.004, .012) * (depth + .3) });
}
clouds.sort((a, b) => a.depth - b.depth);

function drawSky(t, scroll) {
  const p = docH > H ? scroll / (docH - H) : 0;
  // day sky that warms toward gold as you go down the page (never pink, never green)
  const g = sx.createLinearGradient(0, 0, 0, H);
  const top = [143 - 30 * p, 192 - 20 * p, 245 - 25 * p], bot = [251, 244 - 8 * p, 230 - 40 * p];
  g.addColorStop(0, `rgb(${top.map(Math.round)})`); g.addColorStop(.55, 'rgb(207,228,251)'); g.addColorStop(1, `rgb(${bot.map(Math.round)})`);
  sx.fillStyle = g; sx.fillRect(0, 0, W, H);
  // sun glow drifts from upper left to lower right over the whole scroll
  const sunX = W * (.18 + .6 * p), sunY = H * (.16 + .5 * p), R = Math.max(W, H) * .55;
  const sg = sx.createRadialGradient(sunX, sunY, 0, sunX, sunY, R);
  sg.addColorStop(0, 'rgba(255,246,214,.95)'); sg.addColorStop(.12, 'rgba(250,221,150,.55)'); sg.addColorStop(.45, 'rgba(250,221,150,.08)'); sg.addColorStop(1, 'rgba(250,221,150,0)');
  sx.fillStyle = sg; sx.fillRect(0, 0, W, H);
  for (const c of clouds) {
    const w = c.img.width * (W / 1600) * (.6 + c.depth), h = c.img.height * (W / 1600) * (.6 + c.depth);
    const x = ((c.x + t * c.v) % 1.4 - .2) * W - w / 2;
    const y = c.y * H - scroll * c.depth;
    const yy = ((y % (H * 3.4)) + H * 3.4) % (H * 3.4) - H * .5;   // wrap vertically so clouds keep coming
    sx.globalAlpha = .55 + c.depth; sx.drawImage(c.img, x, yy, w, h);
  }
  sx.globalAlpha = 1;
  const n = theme.night; if (!n) return;
  // blue hour: navy wash over everything, then moonlit cloud edges, stars and the moon on top
  const ng = sx.createLinearGradient(0, 0, 0, H);
  ng.addColorStop(0, 'rgba(8,18,52,.94)'); ng.addColorStop(.6, 'rgba(20,44,108,.86)'); ng.addColorStop(1, 'rgba(34,66,140,.8)');
  sx.globalAlpha = n; sx.fillStyle = ng; sx.fillRect(0, 0, W, H);
  for (const c of clouds) {
    const w = c.img.width * (W / 1600) * (.6 + c.depth), h = c.img.height * (W / 1600) * (.6 + c.depth);
    const x = ((c.x + t * c.v) % 1.4 - .2) * W - w / 2, y = c.y * H - scroll * c.depth, yy = ((y % (H * 3.4)) + H * 3.4) % (H * 3.4) - H * .5;
    sx.globalAlpha = n * (.12 + c.depth * .35); sx.drawImage(c.img, x, yy, w, h);
  }
  sx.fillStyle = '#fff6dc';
  for (const st of stars) { sx.globalAlpha = n * (.45 + .45 * Math.sin(t * 2 + st.tw)); sx.beginPath(); sx.arc(st.x * W, st.y * H - (scroll * .05) % H, st.r, 0, 7); sx.fill(); }
  const mx = W * .78, my = H * .16, mg = sx.createRadialGradient(mx, my, 0, mx, my, H * .35);
  mg.addColorStop(0, 'rgba(255,244,214,1)'); mg.addColorStop(.09, 'rgba(255,240,200,.95)'); mg.addColorStop(.1, 'rgba(255,226,160,.35)'); mg.addColorStop(1, 'rgba(255,226,160,0)');
  sx.globalAlpha = n; sx.fillStyle = mg; sx.fillRect(0, 0, W, H);
  sx.globalAlpha = 1;
}

/* ---------- layout: figure + river path in document coordinates ---------- */
let path = [], spiralEnd = { x: 0, y: 0 };
function layout() {
  W = innerWidth; H = innerHeight; docH = document.documentElement.scrollHeight;
  [sky, river].forEach(c => { c.width = W * DPR; c.height = H * DPR; });
  sx.setTransform(DPR, 0, 0, DPR, 0, 0); rx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const hw = hero.clientWidth, hh = hero.clientHeight;
  front.width = hw * DPR; front.height = hh * DPR; fx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const h = Math.min(hh * .66, hw * .95), w = h * 2 / 3, cx = hw > 820 ? hw * .68 : hw * .5;
  Object.assign(figEl.style, { height: h + 'px', width: w + 'px', left: (cx - w / 2) + 'px', top: (hh - h - hh * .05) + 'px' });
  const b = figBox();
  spiralEnd = { x: b.x - b.w * 1.15, y: b.y + b.h * 1.06 };
  // the river visits each anchored element on its side, in document order, and ends in the pool
  const sy = scrollY, pts = [{ x: spiralEnd.x, y: spiralEnd.y }];
  const narrow = W < 820;
  document.querySelectorAll('[data-anchor]').forEach(el => {
    const r = el.getBoundingClientRect(), side = el.dataset.anchor, y = r.top + sy + r.height * .5;
    if (side === 'C') return;
    const x = narrow ? (side === 'L' ? W * .1 : W * .9) : side === 'L' ? Math.max(W * .05, r.left - 30) : Math.min(W * .95, r.right + 30);
    pts.push({ x, y: y - r.height * .3 }, { x, y: y + r.height * .3 });
  });
  const pool = document.getElementById('pool').getBoundingClientRect(), pcx = pool.left + pool.width / 2, pcy = pool.top + sy + pool.height * .55;
  pts.push({ x: pcx - pool.width * .6, y: pcy - pool.height * .9 });
  // a calm whirl: a shrinking ellipse
  for (let i = 0; i <= 10; i++) { const a = Math.PI + i * .62, k = 1 - i / 13; pts.push({ x: pcx + Math.cos(a) * pool.width * .45 * k, y: pcy + Math.sin(a) * pool.height * .35 * k }); }
  path = pts.map(p => ({ ...p, z: 1 }));
}

/* ---------- hero spiral (unwinds as you scroll the hero away) ---------- */
const SPIRAL = [[-1.15, 1.06, 1], [-.45, .95, 1], [.55, .86, 1], [1.1, .76, -1], [.45, .66, -1], [-.3, .57, -1], [-.45, .46, 1], [.4, .36, 1], [1.05, .25, 1], [1.5, .12, 1]];
const SECOND = [[1.5, .99, 1], [.95, .9, 1], [.25, .8, -1], [-.45, .7, -1], [-.85, .56, 1], [-.55, .42, 1], [.1, .3, -1], [.75, .18, -1], [1.0, .06, 1]];
function spiral(t, src, ph, open) {
  const b = figBox();
  return src.map(([u, v, z], i) => ({ x: b.x + b.w * (u * (1 + open * .9) + Math.sin(t * .7 + i * 1.3 + ph) * .05), y: b.y + b.h * (v + Math.cos(t * .6 + i) * .015 - open * .12 * (1 - v)), z }));
}

/* ---------- river: grows from the handstand to just below the reading line ---------- */
function riverPrefix(t, scroll) {
  const p = docH > H ? scroll / (docH - H) : 1;
  const head = scroll + H * (.62 + .55 * Math.pow(p, 3));
  // a point is reached once the running max of y passes the head, so the closing whirl appears all at once
  const out = []; let reach = -Infinity;
  for (let i = 0; i < path.length; i++) {
    const q = path[i], wob = Math.sin(t * .8 + i * 1.7) * 10; reach = Math.max(reach, q.y);
    if (reach <= head) { out.push({ x: q.x + wob, y: q.y, z: 1 }); continue; }
    const a = out[out.length - 1];
    if (a && q.y > a.y) { const k = (head - a.y) / (q.y - a.y); out.push({ x: a.x + (q.x + wob - a.x) * k, y: head, z: 1 }); }
    break;
  }
  return out;
}

/* ---------- mini project drawings, re-inked on twos ---------- */
const minis = [...document.querySelectorAll('[data-mini]')].map(c => ({ c, g: c.getContext('2d'), kind: c.dataset.mini }));
const INK = '#22345e', AZ = '#3f8ee8', DEEP = '#1f5fbf', GOLD = '#e9b85a';
function jl(g, pts, j) { g.beginPath(); pts.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x + rand(-j, j), y + rand(-j, j))); g.stroke(); }
function drawMini(m, t) {
  const { c, g } = m, w = c.clientWidth, h = c.clientHeight; if (!w) return;
  if (c.width !== Math.round(w * DPR)) { c.width = Math.round(w * DPR); c.height = Math.round(h * DPR); }
  g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, w, h); g.lineCap = g.lineJoin = 'round';
  if (m.kind === 'flow') {        // tracked points streaming like currents
    for (let i = 0; i < 26; i++) {
      const x0 = (i * 53 % 97) / 97 * w, y0 = (i * 37 % 89) / 89 * h, a = Math.sin(y0 / h * 5 + t * .4) * .7, L = 18 + (i % 4) * 6;
      const x = (x0 + t * 30 * (1 + i % 3)) % (w + 40) - 20, y = y0;
      g.strokeStyle = i % 5 ? AZ : GOLD; g.lineWidth = 2;
      jl(g, [[x - Math.cos(a) * L, y - Math.sin(a) * L], [x, y]], .8);
      g.fillStyle = INK; g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill();
    }
  } else if (m.kind === 'digits') {  // a hand-drawn 7 and the network's confidence
    g.strokeStyle = INK; g.lineWidth = 7;
    jl(g, [[w * .12, h * .22], [w * .38, h * .2], [w * .24, h * .82]], 1.6);
    g.lineWidth = 3; jl(g, [[w * .17, h * .52], [w * .34, h * .5]], 1.2);
    const conf = [.02, .01, .03, .01, .02, .01, .01, .86 + Math.sin(t) * .03, .02, .01];
    conf.forEach((v, i) => {
      const y = h * .1 + i * h * .08, bw = (w * .42) * v;
      g.fillStyle = i === 7 ? DEEP : 'rgba(63,142,232,.35)'; g.fillRect(w * .52, y, Math.max(3, bw + rand(-1, 1)), h * .055);
      g.fillStyle = INK; g.font = `${Math.round(h * .07)}px "Patrick Hand"`; g.fillText(i, w * .46, y + h * .05);
    });
  } else {                         // a house and the price curve the model fits
    g.strokeStyle = INK; g.lineWidth = 2.4;
    const hx = w * .12, hy = h * .78, s = h * .42;
    jl(g, [[hx, hy], [hx, hy - s * .6], [hx + s * .5, hy - s], [hx + s, hy - s * .6], [hx + s, hy], [hx, hy]], 1.2);
    jl(g, [[hx + s * .38, hy], [hx + s * .38, hy - s * .3], [hx + s * .62, hy - s * .3], [hx + s * .62, hy]], 1);
    g.fillStyle = GOLD;
    for (let i = 0; i < 14; i++) { const u = i / 13, x = w * (.5 + .44 * u), y = h * (.82 - .6 * Math.log1p(u * 4) / Math.log(5)) + ((i * 7) % 5 - 2) * 4; g.beginPath(); g.arc(x + rand(-.6, .6), y, 3, 0, 7); g.fill(); }
    g.strokeStyle = DEEP; g.lineWidth = 2.6;
    jl(g, Array.from({ length: 16 }, (_, i) => { const u = i / 15; return [w * (.5 + .44 * u), h * (.82 - .6 * Math.log1p(u * 4) / Math.log(5))]; }), .9);
  }
}

/* ---------- cursor stirs a little ribbon of water ---------- */
const trail = [];
addEventListener('pointermove', e => trail.push({ x: e.clientX, y: e.clientY + scrollY, life: 1 }), { passive: true });

/* ---------- intro (STYLE-LAB/water-r3/42): a drop falls, splashes into a ring, the ring unspools into the spiral ---------- */
const INTRO = { start: performance.now(), drop: .7, splash: .6, grow: 1.1 };
INTRO.total = INTRO.drop + INTRO.splash + INTRO.grow;
INTRO.skip = reduce || /[?&]nointro/.test(location.search);
const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
function growPts(pts, g) {             // first g of the spiral, cut at an interpolated point so it grows smoothly
  const f = g * (pts.length - 1), i = Math.floor(f), k = f - i;
  const out = pts.slice(0, i + 1);
  if (i + 1 < pts.length) { const a = pts[i], b = pts[i + 1]; out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: b.z }); }
  return out.length > 1 ? out : null;
}
function drawIntro(ctx, it, drawing) {
  const b = figBox(), lx = b.x + b.w * .5, ly = b.y + b.h * 1.0;   // the drop lands where his hands meet the water
  Water.setSeed(drawing);
  if (it < INTRO.drop) {                                           // falling drop with a short streak
    const y = ease(it / INTRO.drop * 1.1) * ly;
    ctx.strokeStyle = 'rgba(79,169,232,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, y - 60); ctx.lineTo(lx, y - 12); ctx.stroke();
    ctx.fillStyle = Water.C.mid; ctx.beginPath(); ctx.moveTo(lx, y - 16); ctx.quadraticCurveTo(lx + 9, y, lx, y + 8); ctx.quadraticCurveTo(lx - 9, y, lx, y - 16); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx - 2.5, y - 1, 2, 0, 7); ctx.fill();
    return;
  }
  const st = it - INTRO.drop;
  if (st < INTRO.splash + .3) {                                    // rings + crown of droplets, redrawn on twos
    const q = ease(st / INTRO.splash);
    for (let r = 0; r < 3; r++) {
      const R = (40 + r * 34) * q * (b.w / 160);
      ctx.globalAlpha = Math.max(0, 1 - q * .55 - r * .12); ctx.strokeStyle = r ? Water.C.deep : Water.C.mid; ctx.lineWidth = 9 - r * 2.5;
      ctx.beginPath(); ctx.ellipse(lx + (Math.random() - .5) * 2, ly, R, R * .28, 0, 0, 7); ctx.stroke();
    }
    ctx.fillStyle = Water.C.light;
    for (let d = 0; d < 14; d++) { const a = Math.PI + (d / 13) * Math.PI, h = Math.sin(q * Math.PI) * (50 + (d * 37) % 40); ctx.globalAlpha = 1 - q * .5; ctx.beginPath(); ctx.arc(lx + Math.cos(a) * 60 * q, ly - h + Math.sin(a) * 6, 3 + (d % 3), 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
}
function introState(now) {
  if (INTRO.skip) return { done: true, g: 1 };
  const it = (now - INTRO.start) / 1000;
  return { it, done: it > INTRO.total, g: ease((it - INTRO.drop - INTRO.splash * .6) / INTRO.grow) };
}
if (!INTRO.skip) figEl.style.clipPath = 'inset(100% 0 0 0)';

/* ---------- main loop ---------- */
let lastDrawing = -1;
function frame(now) {
  requestAnimationFrame(frame);
  const t = reduce ? 0 : clock(), drawing = Math.floor(now / (1000 / 12)), scroll = scrollY;
  drawSky(t, scroll);
  rx.clearRect(0, 0, W, H); fx.clearRect(0, 0, front.width, front.height);
  const b = figBox(), open = Math.min(1, scroll / (H * .9)), width = b.h * .052;
  // hero ribbons: back halves on the fixed river canvas (offset by scroll), front halves above the figure
  const intro = introState(now);
  if (!intro.done) {
    drawIntro(fx, intro.it, drawing);
    // the figure is revealed hands-first, in drawn steps, as the ribbon climbs
    figEl.style.clipPath = `inset(${Math.round((1 - intro.g) * 8) / 8 * 100}% 0 0 0)`;
  } else if (figEl.style.clipPath) figEl.style.clipPath = '';
  if (scroll < H * 1.3 && intro.g > 0) {
    let p1 = spiral(t, SPIRAL, 0, open), p2 = spiral(t, SECOND, 2, open);
    if (intro.g < 1) { p1 = growPts(p1, intro.g); p2 = growPts(p2, Math.max(0, intro.g * 1.3 - .3)); }
    rx.save(); rx.translate(0, -scroll);
    if (p2) { Water.setSeed(drawing + 3); Water.draw(rx, p2, { width: width * .5, t: t * 1.2, side: -1, drawn: 1, alpha: .6 }); }
    if (p1) { Water.setSeed(drawing); Water.draw(rx, p1, { width, t, side: -1, drawn: 1, alpha: .85 }); }
    rx.restore();
    if (p2) { Water.setSeed(drawing + 3); Water.draw(fx, p2, { width: width * .5, t: t * 1.2, side: 1, drawn: 1, alpha: .7 }); }
    if (p1) { Water.setSeed(drawing); Water.draw(fx, p1, { width, t, side: 1, drawn: 1, alpha: .92 }); }
  }
  // the river
  const pre = intro.done ? riverPrefix(t, scroll) : [];
  if (pre.length > 1) {
    rx.save(); rx.translate(0, -scroll);
    Water.setSeed(drawing + 11); Water.draw(rx, pre, { width: Math.max(18, Math.min(38, W * .026)), t, side: 0, drawn: 1, alpha: .95, taper: 260 });
    rx.restore();
  }
  // cursor trail
  trail.forEach(p => p.life -= .03); while (trail.length && trail[0].life <= 0) trail.shift(); if (trail.length > 26) trail.splice(0, trail.length - 26);
  if (trail.length > 4 && !reduce) {
    rx.save(); rx.translate(0, -scroll);
    Water.setSeed(drawing + 7); Water.draw(rx, trail.filter((_, i) => i % 2 === 0).map(p => ({ x: p.x, y: p.y, z: 1 })), { width: 14, t, side: 0, drawn: 1, alpha: Math.min(1, trail.length / 14) });
    rx.restore();
  }
  if (drawing !== lastDrawing && drawing % 2 === 0) { lastDrawing = drawing; minis.forEach(m => drawMini(m, t)); }
}
layout();
document.fonts.ready.then(() => { layout(); GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), '../v5-elemental/assets/golf'); });
addEventListener('load', layout);
addEventListener('resize', layout);
requestAnimationFrame(frame);

const song = document.getElementById('song'), audio = document.getElementById('audio');
song.addEventListener('click', () => { const on = audio.paused; on ? audio.play() : audio.pause(); song.setAttribute('aria-pressed', on); song.textContent = on ? '♪ pause' : '♪ play my favorite song'; });

if (reduce) return;
/* ---------- smooth scroll + entrances on threes ---------- */
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .09 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(tk => lenis.raf(tk * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 }); }));
const titleDelay = INTRO.skip ? .2 : INTRO.total - .3;
gsap.from('.hero h1 .lt-letter', { y: 60, opacity: 0, duration: .5, ease: 'steps(4)', stagger: .05, delay: titleDelay });
gsap.from('.role, .hero .pill', { y: 20, opacity: 0, duration: .5, ease: 'steps(4)', stagger: .15, delay: titleDelay + .7 });
gsap.utils.toArray('.sec h2').forEach(h => gsap.from(h.querySelectorAll('.lt-letter'), { y: 50, opacity: 0, duration: .35, ease: 'steps(3)', stagger: .04, scrollTrigger: { trigger: h, start: 'top 85%' } }));
// cards surface out of the water: rise + settle, on threes
gsap.utils.toArray('.card').forEach((c, i) => gsap.from(c, { y: 80, opacity: 0, rotate: i % 2 ? 1.5 : -1.5, duration: .6, ease: 'steps(6)', scrollTrigger: { trigger: c, start: 'top 90%' } }));
ScrollTrigger.addEventListener('refresh', layout);

/* ---------- dive: the surface rises over the screen (we go under), then falls away below (we come up) ---------- */
const dive = document.getElementById('dive'), dx = dive.getContext('2d');
const bubbles = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: 2 + Math.random() * 7, v: .3 + Math.random() }));
let diveP = 0;
ScrollTrigger.create({ trigger: '#diveGap', start: 'top bottom', end: 'bottom top', onUpdate: st => diveP = st.progress });
function surfaceY(x, base, t) { return base + Math.sin(x / 70 + t * 3) * 10 + Math.sin(x / 23 - t * 5) * 4; }
function drawDive(now) {
  requestAnimationFrame(drawDive);
  const p = diveP;
  if (p <= 0 || p >= 1) { if (dive.style.visibility !== 'hidden') { dive.style.visibility = 'hidden'; } return; }
  dive.style.visibility = 'visible';
  if (dive.width !== W * DPR) { dive.width = W * DPR; dive.height = H * DPR; }
  dx.setTransform(DPR, 0, 0, DPR, 0, 0); dx.clearRect(0, 0, W, H);
  const t = Math.floor(now / 1000 * 12) / 12;                       // the surface is redrawn on twos
  const base = p < .5 ? H * (1 - p * 2.2) : H * ((p - .5) * 2.2 - .1);   // up past the top, then down past the bottom
  const under = p < .5 ? 1 - p * 2 : (p - .5) * 2;                  // 0 at the deepest point
  // water body below the surface
  dx.beginPath(); dx.moveTo(0, H); for (let x = 0; x <= W + 20; x += 20) dx.lineTo(x, surfaceY(x, base, t)); dx.lineTo(W, H); dx.closePath();
  const g = dx.createLinearGradient(0, Math.max(0, base), 0, H); g.addColorStop(0, Water.C.mid); g.addColorStop(.35, Water.C.deep); g.addColorStop(1, '#0d2a66');
  dx.fillStyle = g; dx.fill();
  dx.save(); dx.clip();
  // light rays from the surface
  dx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 11; i++) { const x = (i / 10) * W + Math.sin(t * .7 + i) * 50, w = 10 + (i % 4) * 14; const rg = dx.createLinearGradient(0, base, 0, base + H * .8); rg.addColorStop(0, 'rgba(220,238,255,.16)'); rg.addColorStop(1, 'rgba(220,238,255,0)'); dx.fillStyle = rg; dx.beginPath(); dx.moveTo(x - w, Math.max(0, base)); dx.lineTo(x + w, Math.max(0, base)); dx.lineTo(x + w * 2.6 - 120, H); dx.lineTo(x - w * .6 - 120, H); dx.closePath(); dx.fill(); }
  dx.globalCompositeOperation = 'source-over';
  // bubbles rising (inked rings)
  dx.strokeStyle = 'rgba(255,255,255,.75)'; dx.lineWidth = 1.6;
  for (const b of bubbles) { const y = ((b.y - t * .12 * b.v) % 1 + 1) % 1 * H; dx.beginPath(); dx.arc(b.x * W + Math.sin(t * 2 + b.y * 9) * 6, y, b.r, 0, 7); dx.stroke(); }
  dx.restore();
  // foam band along the surface, jittered per drawing
  dx.strokeStyle = '#fff'; dx.lineWidth = 7; dx.setLineDash([60, 18]); dx.beginPath();
  for (let x = 0; x <= W + 20; x += 20) dx.lineTo(x, surfaceY(x, base, t) + (Math.random() - .5) * 2); dx.stroke(); dx.setLineDash([]);
  dx.strokeStyle = Water.C.ink; dx.globalAlpha = .5; dx.lineWidth = 1.4; dx.beginPath();
  for (let x = 0; x <= W + 20; x += 20) dx.lineTo(x, surfaceY(x, base, t) - 5 + (Math.random() - .5) * 2); dx.stroke(); dx.globalAlpha = 1;
  // splash crown when we break the surface on the way up
  if (p > .5 && base > 0 && base < H * .6) { dx.fillStyle = '#fff'; for (let i = 0; i < 26; i++) { const x = (i * 97 % W), h = (1 - base / (H * .6)) * (40 + (i * 53) % 80); dx.beginPath(); dx.arc(x, base - h, 3 + i % 4, 0, 7); dx.fill(); } }
}
requestAnimationFrame(drawDive);
})();
