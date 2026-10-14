/* v10 Comet: page shell. The painted sky (twilight plate over a deep night plate), the scribble lettering,
   the handstand orbit with its reflection in the still water, the golf card, Lenis + entrances.
   The comet, its gold progress line, the shooting stars and the wish easter egg live in comet.js. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.5);
document.documentElement.classList.add('night');

/* ---------- lettering ---------- */
document.querySelectorAll('[data-brush]').forEach((el, i) => Scribble.render(el, { seed: 9 + i * 29, delay: i ? 0 : .2 }));
if (!reduce) Scribble.start();

/* ---------- hero orbit: scrolling the hero away turns the camera around him; the reflection follows ---------- */
const figEl = document.getElementById('fig'), figR = document.getElementById('figR');
const figs = [...figEl.querySelectorAll('img')], refl = [...figR.querySelectorAll('img')];
const YAWS = figs.map(im => +im.dataset.yaw);
let yawPointer = 0, yawSmooth = 0;
if (!reduce && matchMedia('(pointer: fine)').matches) addEventListener('pointermove', e => { yawPointer = (e.clientX / innerWidth - .5) * 40; }, { passive: true });
function setYaw(target) {
  yawSmooth += (target - yawSmooth) * .08;
  const y = Math.max(YAWS[0], Math.min(YAWS[YAWS.length - 1], yawSmooth));
  let i = 0; while (i < YAWS.length - 2 && YAWS[i + 1] < y) i++;
  const k = (y - YAWS[i]) / (YAWS[i + 1] - YAWS[i]);
  figs.forEach((im, j) => { const o = j === i ? 1 : j === i + 1 ? k : 0; if (im._o !== o) { im.style.opacity = o; refl[j].style.opacity = o; im._o = o; } });
}

/* ---------- sky ---------- */
const sky = document.getElementById('sky'), sx = sky.getContext('2d'), hero = document.getElementById('hero');
let W = 0, H = 0, docH = 0;
const base = window.V9_BASE || '';
const img = src => { const i = new Image(); i.src = base + src; return i; };
const plates = { dusk: img('assets/sky-twilight.webp'), night: img('assets/sky-night.webp') };
const stars = Array.from({ length: 160 }, () => ({ x: Math.random(), y: Math.random() * .85, r: Math.random() * 1.2 + .3, tw: Math.random() * 6, s: 1.2 + Math.random() * 2.4 }));
// the hero plate's bottom is faded to transparent once, so no hard edge shows as it scrolls up into the night
const fadedCache = new Map();
function faded(im) {
  if (fadedCache.has(im)) return fadedCache.get(im);
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d');
  g.drawImage(im, 0, 0); g.globalCompositeOperation = 'destination-out';
  const gr = g.createLinearGradient(0, c.height * .82, 0, c.height); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = gr; g.fillRect(0, c.height * .82, c.width, c.height * .18);
  fadedCache.set(im, c); return c;
}
// where the hero plate sits: cover the viewport, anchored so the horizon lands around 60% of the hero (phones crop the sides)
const SKY = window.SKY = { horizon: .69, posY: .5, zoom: 1.04, k: .35,
  rect(im) { im = im || plates.dusk; const iw = im.naturalWidth || 1600, ih = im.naturalHeight || 900;
    const s = Math.max(W / iw, H / ih) * this.zoom, w = iw * s, h = ih * s; return { x: (W - w) / 2, y: (H - h) * this.posY - scrollY * this.k, w, h }; },
  horizonY() { const r = this.rect(); return r.y + r.h * this.horizon; },
  // the twilight holds through most of the hero, then gives way to the night
  alpha(s) { const x = Math.min(1, Math.max(0, (s - H * .5) / (H * .75))); return 1 - x * x * (3 - 2 * x); } };
function drawSky(t, scroll) {
  const p = docH > H ? Math.min(1, scroll / (docH - H)) : 0;
  sx.fillStyle = '#0b1638'; sx.fillRect(0, 0, W, H);
  const n = plates.night;
  if (n.complete && n.naturalWidth) {
    const s = Math.max(W / n.naturalWidth, H / n.naturalHeight) * 1.12, w = n.naturalWidth * s, h = n.naturalHeight * s;
    sx.globalAlpha = .9; sx.drawImage(n, (W - w) / 2, (H - h) / 2 - (p - .5) * H * .1, w, h); sx.globalAlpha = 1;
  }
  // the night deepens the further down the page you go
  sx.fillStyle = `rgba(6,12,36,${(.18 + .3 * p).toFixed(3)})`; sx.fillRect(0, 0, W, H);
  for (const st of stars) { sx.globalAlpha = .35 + .4 * Math.sin(t * st.s + st.tw); sx.fillStyle = '#fff6dc'; sx.beginPath(); sx.arc(st.x * W, st.y * H, st.r, 0, 7); sx.fill(); }
  sx.globalAlpha = 1;
  const d = plates.dusk, a = SKY.alpha(scroll);
  if (a > 0 && d.complete && d.naturalWidth) {
    const r = SKY.rect(d); sx.globalAlpha = a; sx.drawImage(faded(d), r.x, r.y, r.w, r.h);
    // last gold at the horizon breathes a little (a light leak)
    const hy = r.y + r.h * SKY.horizon, gl = sx.createRadialGradient(W * .5, hy, 0, W * .5, hy, Math.max(W, H) * .6);
    const b = .16 + .05 * Math.sin(t * .6);
    gl.addColorStop(0, `rgba(255,214,150,${b})`); gl.addColorStop(.35, `rgba(255,170,150,${b * .35})`); gl.addColorStop(1, 'rgba(255,170,150,0)');
    sx.globalCompositeOperation = 'lighter'; sx.fillStyle = gl; sx.fillRect(0, 0, W, H); sx.globalCompositeOperation = 'source-over';
    sx.globalAlpha = 1;
  }
}

/* ---------- layout ---------- */
function layout() {
  W = innerWidth; H = innerHeight; docH = document.documentElement.scrollHeight;
  sky.width = W * DPR; sky.height = H * DPR; sx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const hw = hero.clientWidth, hh = hero.clientHeight, narrow = hw <= 820;
  const h = narrow ? Math.min(hh * .44, hw * .9) : Math.min(hh * .6, hw * .9), w = h * 2 / 3, cx = narrow ? hw * .5 : hw * .7;
  // he stands on his hands at the waterline; the reflection hangs below his hands
  const bottom = SKY.horizonY() + scrollY * SKY.k + hh * (narrow ? .16 : .2);   // horizon at scroll 0, in hero coordinates
  const top = Math.min(hh - h * 1.02, bottom - h);
  Object.assign(figEl.style, { height: h + 'px', width: w + 'px', left: (cx - w / 2) + 'px', top: top + 'px' });
  Object.assign(figR.style, { height: h + 'px', width: w + 'px', left: (cx - w / 2) + 'px', top: (top + h * .985) + 'px' });
  window.dispatchEvent(new CustomEvent('comet:layout'));
}

/* ---------- main loop ---------- */
function frame() {
  requestAnimationFrame(frame);
  const t = reduce ? 0 : performance.now() / 1000, scroll = scrollY;
  drawSky(t, scroll);
  if (!reduce && scroll < H * 1.3) setYaw(Math.min(1, scroll / (H * .8)) * 60 + yawPointer);
  // he stands on the painted water, which scrolls slower than the page: ride along with it, and fade with the plate
  if (scroll < H * 1.4 || figEl._dy !== 0) {
    const dy = scroll < H * 1.4 ? scroll * (1 - SKY.k) : 0, o = SKY.alpha(scroll * 1.15);
    if (Math.abs(dy - (figEl._dy || 0)) > .1 || figEl._dy === undefined) {
      figEl.style.transform = `translateY(${dy.toFixed(1)}px)`; figR.style.transform = `translateY(${dy.toFixed(1)}px) scaleY(-1)`;
      figEl.style.opacity = o.toFixed(3); figR.style.opacity = (o * .5).toFixed(3); figEl._dy = dy;
    }
  }
}
layout();
document.fonts.ready.then(() => { layout(); GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), base + '../v5-elemental/assets/golf'); });
addEventListener('load', layout);
plates.dusk.addEventListener('load', layout);
addEventListener('resize', layout);
requestAnimationFrame(frame);

if (reduce) return;
/* ---------- smooth scroll + entrances ---------- */
gsap.registerPlugin(ScrollTrigger);
const lenis = window.LENIS = new Lenis({ lerp: .09 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(tk => lenis.raf(tk * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 }); }));
gsap.from('.role, .facts li, .hero .pill', { y: 18, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08, delay: .9 });
gsap.utils.toArray('.card:not(.vt-card)').forEach((c, i) => gsap.from(c, { y: 70, opacity: 0, rotate: i % 2 ? 1.2 : -1.2, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 92%' } }));
ScrollTrigger.addEventListener('refresh', layout);
})();
