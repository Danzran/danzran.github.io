/* v11 Skyshader: page plumbing (light-painted lettering, hero figure (one drawing, v12: no orbit) standing on the shader's rock, golf card, smooth scroll, entrances).
   The living sky is sky.js; meteors, the heading landers and the constellation live in starfall.js; cloud cards in clouds.js. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('night');
const SF = window.SF = window.SF || {};
SF.reduce = reduce;

/* ---------- lettering: the hero name is light-painted on its own; section headings wait for their meteor (starfall.js) ---------- */
SF.headings = [];
document.querySelectorAll('[data-lp]').forEach(el => {
  LightPaint.mount(el);
  if (el.tagName === 'H2') SF.headings.push({ el, lit: false });
});
document.fonts.ready.then(() => LightPaint.play(document.querySelector('.hero [data-lp]'), .5));

const hero = document.getElementById('hero'), figEl = document.getElementById('fig');

/* figure stands on the rock ledge the sky shader paints; sky.js says where its top is (SF.shoreAt) */
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

/* the camera tilts up as you scroll: the ground (rock, figure, its sky-chart lines) sinks with the horizon */
const chartEl = document.getElementById('chart'), linesEl = document.getElementById('chartLines');
let lastDy = null;
/* v12 fix: the old version parked everything at translate(200vh) past 2.2 screens, which (hero-relative) put the
   figure back on screen mid-page. Now the layer is simply hidden once the ground has sunk below the viewport. */
let lastHidden = null;
function sink() {
  const s = scrollY, dy = SF.sky ? SF.sky.worldDy(s) : 0;
  const hidden = !SF.fig || SF.fig.y + dy > innerHeight + 20;
  if (hidden !== lastHidden) { lastHidden = hidden; [figEl, linesEl, chartEl].forEach(el => el.style.visibility = hidden ? 'hidden' : ''); }
  if (hidden) return;
  const v = Math.round((s + dy) * 10) / 10;
  if (v === lastDy) return; lastDy = v;
  const tf = `translate3d(0,${v}px,0)`;
  figEl.style.transform = tf; linesEl.style.transform = tf;
  chartEl.style.transform = chartEl.classList.contains('stacked') ? '' : tf;
}
function frame() {
  requestAnimationFrame(frame);
  sink();
}
layout();
document.fonts.ready.then(() => { layout(); GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), (window.V9_BASE || '') + '../v5-elemental/assets/golf'); });
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
