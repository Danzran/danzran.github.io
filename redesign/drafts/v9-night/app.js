(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const rand = (a, b) => a + Math.random() * (b - a);
let onTwos = false;                                  // v9: water moves smoothly (Daniel: "too framey")
const clock = () => { const t = performance.now() / 1000; return onTwos ? Math.floor(t * 12) / 12 : t; };

/* ---------- day / night tide: night tints the sky navy and lights the water from inside with gold ---------- */
const DAY = { ...Water.C };
const NIGHT = { deep: '#1d4fa8', mid: '#4d8fe0', light: '#ffd98a', foam: '#fff3c4', ink: '#0d1c40', edge: '#d6e8ff', s1: '#ffe9b0', s2: '#ffd27a', s3: '#f6c25e', glow: 'rgba(255,214,120,.55)' };
const theme = { night: 0 };
const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * .8, r: Math.random() * 1.3 + .3, tw: Math.random() * 6 }));
function setNight(on, instant) {
  document.documentElement.classList.toggle('night', on);
  Object.assign(Water.C, on ? NIGHT : DAY);
  if (instant || reduce || !window.gsap) theme.night = on ? 1 : 0;
  else gsap.to(theme, { night: on ? 1 : 0, duration: .9, ease: 'steps(6)' });   // the sky changes in drawn steps, not a fade
}
setNight(true, true);   // v9 is night only (Daniel dropped the day sky)

/* ---------- ink strength 1-5 (STYLE-LAB/water-r3/31 ink ladder): contour weight, jitter, and speed lines at 4-5 ---------- */
const INK_LEVELS = { 1: [0, 0, 0], 2: [.9, .35, 1], 3: [1.6, .6, 1.6], 4: [2.8, .85, 2.6], 5: [4.2, 1, 3.6] };
let ink = 3;
function setInk(n) {
  ink = n; const [w, a, j] = INK_LEVELS[n]; Object.assign(Water.C, { inkW: w, inkA: a, inkJ: j }); Object.assign(DAY, { inkW: w, inkA: a, inkJ: j }); Object.assign(NIGHT, { inkW: w, inkA: a, inkJ: j });
  document.documentElement.dataset.ink = n;
}
const qInk = +(location.search.match(/[?&]ink=(\d)/) || [])[1]; setInk(qInk >= 1 && qInk <= 5 ? qInk : 3);
// concentration lines behind the figure, redrawn on threes (only at ink 4-5)
function speedLines(ctx, drawing, scroll) {
  if (ink < 4 || scroll > H) return;
  const b = figBox(), cx = b.x + b.w * .5, cy = b.y + b.h * .55, R = Math.hypot(W, H), n = ink === 5 ? 120 : 60;
  let seed = Math.floor(drawing / 3) * 9301 + 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  ctx.save(); ctx.fillStyle = Water.C.ink;
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.283, r0 = R * (.2 + rnd() * .16), w = .002 + rnd() * (ink === 5 ? .01 : .005);
    ctx.globalAlpha = (ink === 5 ? .5 : .25) * (.4 + rnd() * .6);
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R); ctx.lineTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R); ctx.fill();
  }
  ctx.restore();
}

/* ---------- lettering + figure drawings on threes ---------- */
// v9: continuously mutating scribble (scribble.js); letters arrive on their own when first seen. ?scribble=calm|crawl|echo|torn|stepped
document.querySelectorAll('[data-brush]').forEach((el, i) => Scribble.render(el, { seed: 9 + i * 29, delay: i ? 0 : .2 }));
if (!reduce) Scribble.start();
const figEl = document.getElementById('fig'), figs = [...figEl.querySelectorAll('img')]; let fk = 0;
// v9: the figure no longer swaps between drawings every 125ms (read as "framey"); one drawing holds

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

/* painted hero plates (STYLE-LAB/water-r3/61, 62): cover the hero, drift slower than the page, fade out below it */
const plates = { day: new Image(), night: new Image() };
plates.day.src = 'assets/plate-day.webp'; plates.night.src = 'assets/plate-night.webp';
function drawPlate(img, scroll, alpha) {
  if (!img.complete || !img.naturalWidth || alpha <= 0) return;
  const s = Math.max(W / img.naturalWidth, H / img.naturalHeight) * 1.06, w = img.naturalWidth * s, h = img.naturalHeight * s;
  sx.globalAlpha = alpha; sx.drawImage(img, (W - w) / 2, (H - h) / 2 - scroll * .35, w, h); sx.globalAlpha = 1;
}
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
  const plateA = Math.max(0, 1 - scroll / (H * 1.1));
  drawPlate(plates.day, scroll, plateA * (1 - theme.night));
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
  drawPlate(plates.night, scroll, plateA * n);
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
    if (el.hasAttribute('data-whirl')) {
      // a little whirlpool beside this stop (the timeline marker), out on the open side of the card
      const onLeft = r.left + r.width / 2 < W / 2, wx = narrow ? x : onLeft ? Math.min(W - 80, r.right + 150) : Math.max(110, r.left - 150), R = 72, dir = onLeft ? 1 : -1;
      pts.push({ x: wx, y: y - R * 2.2 });
      for (let i = 0; i <= 7; i++) { const a = -Math.PI / 2 + dir * i * .95, k = 1 - i / 16; pts.push({ x: wx + Math.cos(a) * R * k * 1.4, y: y + Math.sin(a) * R * k }); }
      pts.push({ x: wx, y: y + R * 2.4 });
      return;
    }
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

/* ---------- mini project drawings, re-inked on twos ---------- */
const minis = [...document.querySelectorAll('[data-mini]')].map(c => ({ c, g: c.getContext('2d'), kind: c.dataset.mini }));
const INK = '#22345e', AZ = '#3f8ee8', DEEP = '#1f5fbf', GOLD = '#e9b85a';
// line wobble mutates smoothly with time (each vertex has its own phase) instead of re-randomising per drawing
let miniT = 0;
const wob = (i, j, ph) => j * (Math.sin(miniT * 2.1 + i * 1.9 + ph) * .6 + Math.sin(miniT * 3.3 - i * .7 + ph * 2) * .4);
function jl(g, pts, j) { g.beginPath(); pts.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x + wob(i, j, x * .01), y + wob(i, j, y * .013 + 2))); g.stroke(); }
function drawMini(m, t) {
  miniT = t;
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
      g.fillStyle = i === 7 ? DEEP : 'rgba(63,142,232,.35)'; g.fillRect(w * .52, y, Math.max(3, bw + wob(i, 1, 0)), h * .055);
      g.fillStyle = INK; g.font = `${Math.round(h * .07)}px "Patrick Hand"`; g.fillText(i, w * .46, y + h * .05);
    });
  } else {                         // a house and the price curve the model fits
    g.strokeStyle = INK; g.lineWidth = 2.4;
    const hx = w * .12, hy = h * .78, s = h * .42;
    jl(g, [[hx, hy], [hx, hy - s * .6], [hx + s * .5, hy - s], [hx + s, hy - s * .6], [hx + s, hy], [hx, hy]], 1.2);
    jl(g, [[hx + s * .38, hy], [hx + s * .38, hy - s * .3], [hx + s * .62, hy - s * .3], [hx + s * .62, hy]], 1);
    g.fillStyle = GOLD;
    for (let i = 0; i < 14; i++) { const u = i / 13, x = w * (.5 + .44 * u), y = h * (.82 - .6 * Math.log1p(u * 4) / Math.log(5)) + ((i * 7) % 5 - 2) * 4; g.beginPath(); g.arc(x + wob(i, .6, 1), y, 3, 0, 7); g.fill(); }
    g.strokeStyle = DEEP; g.lineWidth = 2.6;
    jl(g, Array.from({ length: 16 }, (_, i) => { const u = i / 15; return [w * (.5 + .44 * u), h * (.82 - .6 * Math.log1p(u * 4) / Math.log(5))]; }), .9);
  }
}

/* ---------- main loop ---------- */
let lastDrawing = -1;
function frame(now) {
  requestAnimationFrame(frame);
  const t = reduce ? 0 : clock(), drawing = Math.floor(now / (1000 / 12)), scroll = scrollY;
  Water.setTime(t);   // contours mutate smoothly; setSeed below only picks which ribbon's noise stream
  drawSky(t, scroll);
  rx.clearRect(0, 0, W, H); fx.clearRect(0, 0, front.width, front.height);
  const b = figBox(), open = Math.min(1, scroll / (H * .9)), width = b.h * .052;
  // hero ribbons: back halves on the fixed river canvas (offset by scroll), front halves above the figure
  rx.save(); rx.translate(0, -scroll); speedLines(rx, drawing, scroll); rx.restore();
  if (scroll < H * 1.3) {
    const p1 = spiral(t, SPIRAL, 0, open), p2 = spiral(t, SECOND, 2, open);
    rx.save(); rx.translate(0, -scroll);
    if (p2) { Water.setSeed(3); Water.draw(rx, p2, { width: width * .5, t: t * 1.2, side: -1, drawn: 1, alpha: .6 }); }
    if (p1) { Water.setSeed(0); Water.draw(rx, p1, { width, t, side: -1, drawn: 1, alpha: .85 }); }
    rx.restore();
    if (p2) { Water.setSeed(3); Water.draw(fx, p2, { width: width * .5, t: t * 1.2, side: 1, drawn: 1, alpha: .7 }); }
    if (p1) { Water.setSeed(0); Water.draw(fx, p1, { width, t, side: 1, drawn: 1, alpha: .92 }); }
  }
  minis.forEach(m => drawMini(m, t));
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
const titleDelay = .2;
// title letters: Scribble's own arrive (staggered, echo-smeared) replaces the stepped gsap drop
gsap.from('.role, .hero .pill', { y: 20, opacity: 0, duration: .5, ease: 'steps(4)', stagger: .15, delay: titleDelay + .7 });
// cards surface out of the water: rise + settle, on threes
gsap.utils.toArray('.card').forEach((c, i) => gsap.from(c, { y: 80, opacity: 0, rotate: i % 2 ? 1.5 : -1.5, duration: .6, ease: 'steps(6)', scrollTrigger: { trigger: c, start: 'top 90%' } }));
ScrollTrigger.addEventListener('refresh', layout);

})();
