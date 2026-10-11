(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => a + Math.random() * (b - a);
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const COLS = ['#c3aef5', '#ffcfb8', '#bcd8ff', '#ffe7a3', '#ffc1d6'];
const INK = '#16121f';

/* ---------- lettering: sakuga holds drawings on threes (8 fps) ---------- */
document.querySelectorAll('[data-brush]').forEach((el, i) => Lettering.render(el, { seed: 3 + i * 41 }));
if (!reduce) Lettering.start(8);
if (!reduce) { let b = 0; setInterval(() => { b = (b + 1 + (Math.random() * 2 | 0)) % 3; document.documentElement.dataset.boil = b; }, 125); }

/* ---------- figure drawings ---------- */
document.querySelectorAll('#heroFig, .about__fig').forEach(box => {
  const imgs = [...box.querySelectorAll('img')]; let k = 0;
  if (!reduce) setInterval(() => { imgs[k].classList.remove('on'); k = (k + 1 + (Math.random() * 2 | 0)) % imgs.length; imgs[k].classList.add('on'); }, 125);
});

/* ---------- concentration lines (shuchusen), redrawn completely every frame on threes ---------- */
function burst(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const o = Object.assign({ count: 150, inner: .22, ink: .22, invert: false, focus: () => [.62, .45] }, opts);
  const fit = () => { canvas.width = canvas.clientWidth * DPR; canvas.height = canvas.clientHeight * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
  fit(); addEventListener('resize', fit);
  function draw(power = 1) {
    const W = canvas.clientWidth, H = canvas.clientHeight, [fx, fy] = o.focus(), cx = fx * W, cy = fy * H;
    const R = Math.hypot(W, H);
    ctx.fillStyle = o.invert ? INK : 'rgba(0,0,0,0)'; ctx.clearRect(0, 0, W, H); if (o.invert) ctx.fillRect(0, 0, W, H);
    const n = Math.round(o.count * power);
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), r0 = R * rand(o.inner, o.inner + .25) / power, w = rand(.003, .014);
      const isInk = Math.random() < o.ink;
      ctx.fillStyle = o.invert ? (isInk ? '#fffdf8' : COLS[i % COLS.length]) : (isInk ? INK : COLS[i % COLS.length]);
      ctx.globalAlpha = isInk ? rand(.6, 1) : rand(.55, .95);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R);
      ctx.lineTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  return { draw };
}
const mouse = { x: .62, y: .45 };
addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth; mouse.y = e.clientY / innerHeight; }, { passive: true });
const heroBurst = burst(document.getElementById('burst'), { focus: () => [.66 + (mouse.x - .5) * .12, .45 + (mouse.y - .5) * .12] });
const contactBurst = burst(document.getElementById('burst2'), { invert: false, count: 110, focus: () => [.5, .45] });
const aboutBurst = burst(document.getElementById('burst3'), { count: 90, inner: .12, focus: () => [.5, .5] });
const heroState = { power: 1 };
let tick = 0;
function onThrees() {
  tick++;
  heroBurst.draw(heroState.power);
  contactBurst.draw(1);
  aboutBurst.draw(1);
}
onThrees();
if (!reduce) setInterval(onThrees, 125);

/* ---------- inked cel clouds in the hero ---------- */
function cloudPath(x, y, w, h) {
  let d = `M${x} ${y + h}`;
  const n = 5 + (Math.random() * 3 | 0);
  for (let i = 0; i < n; i++) {
    const x1 = x + (w * (i + 1)) / n, r = (w / n) * rand(.55, .8);
    d += ` A${r.toFixed(0)} ${(r * rand(.8, 1.1)).toFixed(0)} 0 0 1 ${x1.toFixed(0)} ${(y + h - rand(0, h * .35)).toFixed(0)}`;
  }
  return d + ` L${x + w} ${y + h + 40} L${x} ${y + h + 40}Z`;
}
function heroClouds() {
  const svg = document.getElementById('heroClouds'), W = innerWidth, H = innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const specs = [[-40, H * .78, W * .42, 90, COLS[0]], [W * .3, H * .86, W * .5, 70, COLS[2]], [W * .62, H * .8, W * .45, 100, COLS[4]], [-60, H * .9, W * .5, 60, COLS[1]], [W * .55, H * .92, W * .5, 60, COLS[3]]];
  svg.innerHTML = specs.map(([x, y, w, h, c]) => `<path d="${cloudPath(x, y, w, h)}" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`).join('');
}
heroClouds(); addEventListener('resize', heroClouds);

/* ---------- impact frame: two held inverted drawings + a shake ---------- */
const flash = document.getElementById('flash'), flashBurst = burst(flash.querySelector('canvas'), { invert: true, count: 180, ink: .5, inner: .1, focus: () => [mouse.x, mouse.y] });
let lastImpact = 0;
function impact() {
  if (reduce) return;
  const now = performance.now(); if (now - lastImpact < 700) return; lastImpact = now;
  flashBurst.draw(1.2); flash.style.opacity = 1;
  setTimeout(() => flashBurst.draw(1.4), 42);
  setTimeout(() => { flash.style.opacity = 0; document.body.classList.add('shake'); }, 125);
  setTimeout(() => document.body.classList.remove('shake'), 400);
}

/* ---------- golf ---------- */
document.fonts.ready.then(() => GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), 'assets/golf'));

/* ---------- song ---------- */
const song = document.getElementById('song'), audio = document.getElementById('audio');
song.addEventListener('click', () => { const on = audio.paused; on ? audio.play() : audio.pause(); song.classList.toggle('playing', on); song.setAttribute('aria-pressed', on); });

if (reduce) return;

/* ---------- smooth scroll ---------- */
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.2 }); }));

/* ---------- intro: smear in, then an impact frame ---------- */
gsap.timeline({ delay: .2 })
  .from('.hero__title .lt-letter', { x: -160, scaleX: 1.8, skewX: -25, opacity: 0, duration: .35, ease: 'steps(3)', stagger: .04 })
  .from('#heroFig', { y: 200, scale: .7, duration: .4, ease: 'steps(4)' }, '-=.2')
  .add(impact)
  .from('.hero__tag, .hero__sfx', { scale: 2, opacity: 0, duration: .25, ease: 'steps(3)', stagger: .08 });

/* ---------- hero: figure lunges at the camera, lines intensify, then cut ---------- */
gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=80%', pin: true, scrub: true, onLeave: impact } })
  .to(heroState, { power: 1.8, ease: 'none' }, 0)
  .to('#heroFig', { scale: 1.5, x: () => -innerWidth * .12, ease: 'steps(8)' }, 0)
  .to('.hero__copy', { x: -120, opacity: 0, ease: 'steps(5)' }, 0)
  .to('.hero__sfx', { scale: 1.6, opacity: 0, ease: 'steps(4)' }, 0);

/* ---------- panels: smear-frame entrance + impact ---------- */
document.querySelectorAll('[data-impact]').forEach((el, i) => {
  gsap.from(el, { x: i % 2 ? 140 : -140, skewX: i % 2 ? 18 : -18, scaleX: 1.25, opacity: 0, duration: .45, ease: 'steps(4)',
    scrollTrigger: { trigger: el, start: 'top 82%', onEnter: () => setTimeout(impact, 350) } });
});
gsap.utils.toArray('.chapter__title').forEach(t => gsap.from(t.querySelectorAll('.lt-letter'), { y: -80, rotate: () => rand(-30, 30), opacity: 0, duration: .3, ease: 'steps(3)', stagger: .03, scrollTrigger: { trigger: t, start: 'top 85%' } }));
})();
