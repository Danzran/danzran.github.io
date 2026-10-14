/* v10 Starfall: page plumbing (lettering, hero figure + its lake reflection, golf card, smooth scroll, entrances).
   The sky, meteors, heading lights and the constellation live in starfall.js; cloud cards in clouds.js. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('night');
const SF = window.SF = window.SF || {};
SF.reduce = reduce;

/* ---------- lettering: the hero title arrives on its own; section headings wait for their meteor (starfall.js) ---------- */
SF.headings = [];
document.querySelectorAll('[data-brush]').forEach((el, i) => {
  const it = Scribble.render(el, { seed: 9 + i * 29, delay: i ? 0 : .2 });
  if (el.tagName === 'H2' && !reduce) { it.born = Infinity; SF.headings.push({ el, it, lit: false }); }   // Infinity: IntersectionObserver leaves it alone
});
if (!reduce) Scribble.start();

/* ---------- hero figure: 7 orbit drawings; scrolling the hero away turns the camera (0 -> +60 deg), pointer adds +-20 ---------- */
const hero = document.getElementById('hero'), figEl = document.getElementById('fig');
const figs = [...figEl.querySelectorAll('img')];
const YAWS = figs.map(im => +im.dataset.yaw);
let yawPointer = 0, yawSmooth = 0;
if (!reduce && matchMedia('(pointer: fine)').matches) addEventListener('pointermove', e => { yawPointer = (e.clientX / innerWidth - .5) * 40; }, { passive: true });
function setYaw(target) {
  yawSmooth += (target - yawSmooth) * .08;
  const y = Math.max(YAWS[0], Math.min(YAWS[YAWS.length - 1], yawSmooth));
  let i = 0; while (i < YAWS.length - 2 && YAWS[i + 1] < y) i++;
  const k = (y - YAWS[i]) / (YAWS[i + 1] - YAWS[i]);
  figs.forEach((im, j) => { const o = j === i ? 1 : j === i + 1 ? k : 0; if (im._o !== o) { im.style.opacity = o; im._o = o; } });
}

/* figure stands on the rock slab of the plate; starfall.js tells us where that is (SF.shoreY, fraction of hero height) */
function layout() {
  const hw = hero.clientWidth, hh = hero.clientHeight, narrow = hw <= 820;
  const shore = (SF.shoreAt ? SF.shoreAt(hw, hh) : { x: hw * .68, y: hh * .86 });
  let h = Math.min(hh * (narrow ? .46 : .56), hw * .95);
  const chart = document.getElementById('chart'), copy = hero.querySelector('.hero-copy');
  if (chart) chart.classList.toggle('stacked', narrow);
  if (narrow && chart) {   // phone: the facts sit under the hero copy, and the figure fits below them
    const top = copy.offsetTop + copy.offsetHeight + 14; chart.style.top = top + 'px';
    h = Math.max(hh * .26, Math.min(h, (shore.y - (top + chart.offsetHeight + 14)) / .955));
  } else if (chart) chart.style.top = '';
  const w = h * 2 / 3;
  // the drawings have ~5% empty margin under the hands
  const top = shore.y - h * .955, left = shore.x - w / 2;
  Object.assign(figEl.style, { height: h + 'px', width: w + 'px', left: left + 'px', top: top + 'px' });
  SF.fig = { x: left, y: top, w, h };
  if (SF.onLayout) SF.onLayout();
}
SF.layout = layout;

function frame() {
  requestAnimationFrame(frame);
  if (!reduce && scrollY < innerHeight * 1.3) setYaw(Math.min(1, scrollY / (innerHeight * .8)) * 60 + yawPointer);
}
layout();
document.fonts.ready.then(() => { layout(); GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), '../v5-elemental/assets/golf'); });
addEventListener('load', layout);
addEventListener('resize', layout);
requestAnimationFrame(frame);

if (reduce) return;
/* ---------- smooth scroll + entrances ---------- */
gsap.registerPlugin(ScrollTrigger);
const lenis = SF.lenis = new Lenis({ lerp: .09 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(tk => lenis.raf(tk * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 }); }));
gsap.from('.role, .hero .pill', { y: 20, opacity: 0, duration: .9, ease: 'power3.out', stagger: .15, delay: .9 });
// cards drift up out of the night, smoothly
gsap.utils.toArray('.card:not(.vt-card)').forEach((c, i) => gsap.from(c, { y: 70, opacity: 0, rotate: i % 2 ? 1 : -1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 92%' } }));
ScrollTrigger.addEventListener('refresh', layout);
})();
