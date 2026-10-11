(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => a + Math.random() * (b - a);
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const hero = document.getElementById('hero');

/* ---------- brush lettering (boils at ~6 fps) ---------- */
document.querySelectorAll('[data-brush]').forEach((el, i) => Lettering.render(el, { seed: 7 + i * 29 }));
if (!reduce) Lettering.start(6);

/* ---------- boil ticker for illustrations (8 fps) ---------- */
if (!reduce) { let b = 0; setInterval(() => { b = (b + 1 + (Math.random() * 2 | 0)) % 3; document.documentElement.dataset.boil = b; }, 125); }

/* ---------- figure: three re-inked drawings swapped on threes ---------- */
['heroFig', 'aboutFig'].forEach(id => {
  const imgs = [...document.getElementById(id).querySelectorAll('img')]; let k = 0;
  if (!reduce) setInterval(() => { imgs[k].classList.remove('on'); k = (k + 1 + (Math.random() * 2 | 0)) % imgs.length; imgs[k].classList.add('on'); }, 125);
});

/* ---------- emphasis rays around the figure: 3 drawings, redrawn on threes ---------- */
const rays = document.getElementById('rays');
const RAY_COLORS = ['#fff6e0', '#fff6e0', '#ffe2c4', '#e9dcff', '#ffd1e0', '#3b2f6b'];
function drawRays() {
  const W = hero.clientWidth, H = hero.clientHeight, f = document.getElementById('heroFig').getBoundingClientRect(), hr = hero.getBoundingClientRect();
  const cx = f.left - hr.left + f.width / 2, cy = f.top - hr.top + f.height * .45;
  rays.setAttribute('viewBox', `0 0 ${W} ${H}`); Object.assign(rays.style, { left: 0, top: 0, width: W + 'px', height: H + 'px' });
  let html = '';
  for (let v = 0; v < 3; v++) {
    let g = '';
    for (let i = 0; i < 46; i++) {
      const a = rand(0, Math.PI * 2), r0 = rand(140, 260), r1 = r0 + rand(60, 260), w = rand(1.2, 4.2);
      const c = RAY_COLORS[(Math.random() * RAY_COLORS.length) | 0], ink = c === '#3b2f6b';
      const p = (r, o) => `${(cx + Math.cos(a + o) * r).toFixed(1)} ${(cy + Math.sin(a + o) * r).toFixed(1)}`;
      const o = w / r0;
      g += `<path d="M${p(r0, -o)}L${p(r1, 0)}L${p(r0, o)}Z" fill="${c}" opacity="${ink ? .55 : rand(.55, .9).toFixed(2)}"/>`;
    }
    html += `<g style="display:${v ? 'none' : 'inline'}">${g}</g>`;
  }
  rays.innerHTML = html;
}
drawRays(); addEventListener('resize', drawRays);
const rayGroups = () => [...rays.children];
if (!reduce) { let k = 0; setInterval(() => { const g = rayGroups(); g[k].style.display = 'none'; k = (k + 1 + (Math.random() * 2 | 0)) % g.length; g[k].style.display = 'inline'; }, 125); }

/* ---------- fluffy clouds: soft puffs pre-rendered to sprites, drifting smoothly ---------- */
function cloudSprite(w, h, tint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  const puffs = [];
  const n = 14 + (Math.random() * 10 | 0);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), px = w * (.12 + .76 * t) + rand(-w * .05, w * .05);
    const bump = Math.sin(t * Math.PI);
    const r = h * (.18 + .26 * bump) * rand(.75, 1.15);
    puffs.push([px, h * .78 - bump * h * .28 + rand(-h * .06, h * .04), r]);
  }
  for (let i = 0; i < 8; i++) puffs.push([rand(w * .1, w * .9), h * rand(.72, .85), h * rand(.12, .2)]);
  for (const [px, py, r] of puffs) {
    const g = x.createRadialGradient(px - r * .2, py - r * .3, r * .1, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,.98)'); g.addColorStop(.55, 'rgba(255,250,252,.9)'); g.addColorStop(1, 'rgba(255,248,252,0)');
    x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
  }
  // lilac underside + warm top, only where cloud already is
  x.globalCompositeOperation = 'source-atop';
  const s = x.createLinearGradient(0, 0, 0, h);
  s.addColorStop(0, tint[0]); s.addColorStop(.55, 'rgba(255,255,255,0)'); s.addColorStop(1, tint[1]);
  x.fillStyle = s; x.fillRect(0, 0, w, h);
  return c;
}
function layer(canvas, count, yMin, yMax, scaleMin, scaleMax, speed, tint) {
  const ctx = canvas.getContext('2d');
  const items = Array.from({ length: count }, () => {
    const s = rand(scaleMin, scaleMax);
    return { img: cloudSprite(Math.round(520 * s), Math.round(260 * s), tint), x: rand(-.2, 1.1), y: rand(yMin, yMax), v: speed * rand(.6, 1.4) };
  });
  return { canvas, ctx, items };
}
const back = layer(document.getElementById('cloudsBack'), 6, .52, .82, .6, 1.1, .006, ['rgba(255,214,190,.35)', 'rgba(170,150,240,.45)']);
const front = layer(document.getElementById('cloudsFront'), 6, .98, 1.12, .9, 1.6, .012, ['rgba(255,226,200,.3)', 'rgba(160,140,235,.55)']);
function fit() { for (const L of [back, front]) { L.canvas.width = hero.clientWidth * DPR; L.canvas.height = hero.clientHeight * DPR; L.ctx.setTransform(DPR, 0, 0, DPR, 0, 0); } }
fit(); addEventListener('resize', fit);
const state = { sink: 0, mx: 0, my: 0 };
addEventListener('pointermove', e => { state.mx = e.clientX / innerWidth - .5; state.my = e.clientY / innerHeight - .5; }, { passive: true });
let heroOn = true; new IntersectionObserver(([e]) => heroOn = e.isIntersecting).observe(hero);
let lastT = performance.now();
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min(64, t - lastT) / 1000; lastT = t;
  if (!heroOn) return;
  const W = hero.clientWidth, H = hero.clientHeight;
  [[back, 18, .35], [front, 40, 1]].forEach(([L, par, rise]) => {
    L.ctx.clearRect(0, 0, W, H);
    for (const c of L.items) {
      if (!reduce) c.x -= c.v * dt;
      const cw = c.img.width, ch = c.img.height;
      if (c.x * W + cw < 0) c.x = 1 + rand(0, .15);
      const y = c.y * H - ch * .8 - state.sink * H * rise * 1.1 + state.my * -par;
      L.ctx.drawImage(c.img, c.x * W + state.mx * -par, y);
    }
    if (L === front && state.sink > .55) {   // white-out into the cloud sea
      L.ctx.fillStyle = `rgba(253,246,251,${Math.min(1, (state.sink - .55) / .4)})`; L.ctx.fillRect(0, 0, W, H);
    }
  });
}
requestAnimationFrame(frame);

/* ---------- golf ---------- */
document.fonts.ready.then(() => GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), 'assets/golf'));

/* ---------- song ---------- */
const song = document.getElementById('song'), audio = document.getElementById('audio');
song.addEventListener('click', () => { const on = audio.paused; on ? audio.play() : audio.pause(); song.classList.toggle('playing', on); song.setAttribute('aria-pressed', on); });

if (reduce) return;

/* ---------- smooth scroll ---------- */
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .08 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 });
}));
ScrollTrigger.create({ trigger: '.cloudsea', start: 'top 80px', onToggle: s => document.getElementById('nav').classList.toggle('solid', s.isActive), end: 'max' });

/* ---------- intro: drift in softly ---------- */
gsap.from('.hero__title .lt-letter', { y: 40, opacity: 0, duration: 1.4, ease: 'power3.out', stagger: .06, delay: .2 });
gsap.from('.hero__sub, .hero__cta', { y: 20, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: .15, delay: .9 });
gsap.from('#heroFig', { y: 80, opacity: 0, duration: 1.8, ease: 'power3.out', delay: .4 });
gsap.from('#rays', { opacity: 0, scale: .8, transformOrigin: '70% 50%', duration: 2, ease: 'power2.out', delay: .8 });

/* ---------- hero: sink into the clouds ---------- */
gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: '+=120%', pin: true, scrub: 1 } })
  .to(state, { sink: 1, ease: 'none' }, 0)
  .to('.hero__copy', { yPercent: -40, opacity: 0, ease: 'power1.in' }, 0)
  .to('#heroFig', { y: () => -innerHeight * .25, scale: .8, ease: 'none' }, 0)
  .to('#rays', { opacity: 0, ease: 'none' }, 0)
  .to('.hero__sky', { y: () => -innerHeight * .12, ease: 'none' }, 0)
  .to('.hero__hint', { opacity: 0, duration: .2 }, 0);

/* ---------- sections float up like clouds ---------- */
gsap.utils.toArray('.cloud-wrap, .reel, .job, .about > *, .sec-title, .sec-sub').forEach(el =>
  gsap.from(el, { y: 70, opacity: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
// gentle buoyancy on the project clouds
gsap.utils.toArray('.cloud-wrap').forEach((el, i) => gsap.to(el, { y: i % 2 ? 8 : -8, duration: 3 + i * .4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * .3 }));
})();
