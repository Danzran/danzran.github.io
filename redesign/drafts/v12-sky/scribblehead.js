/* v12 Sky lettering: Daniel's Unchained LOW scribble (slow redraw, 5 fps) in Peachy or his "cloud" font, replacing the light painting.
   Keeps the LightPaint API that app.js, starfall.js and golf-page.js call (mount, play, playing, headAt), so the meteor
   that lands on each heading still "writes" it: play() wipes the scribbling word in from left to right.
   The boil itself is ../../assets/lettering/unchained-scribble.js. ?level=mid|high and ?fps=15|10 try the other presets.
   Default (Daniel's pick, 2026-10-18): LOW with the preset's full wiggle(8,1000) but posterized to 5 fps, a "slow redraw":
   a fresh hand-drawn edge five times a second. ?wig= (e.g. 140 = calm drift) and ?gain= scale the motion.
   Fonts: ?font=peachy (default; fan-made "your name."-style) | cloud. */
window.LightPaint = (() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const q = new URLSearchParams(location.search);
const LEVEL = q.get('level') || 'low', FPS = +(q.get('fps') || 5), WIG = +(q.get('wig') || 1000), GAIN = +(q.get('gain') || .85);
const CF = window.CLOUD_FONTS || {};
const FONT = CF[q.get('font')] ? q.get('font') : CF.peachy ? 'peachy' : 'cloud';
const WEIGHT = { peachy: [.004, .008], cloud: [.016, .022] }[FONT] || [0, 0];   // extra stroke [h1, h2] in em
document.documentElement.dataset.font = FONT;
let ready = Promise.resolve();
if (CF[FONT]) {
  const s = atob(CF[FONT]), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  try { const ff = new FontFace('sh-' + FONT, u.buffer); document.fonts.add(ff); ready = ff.load().catch(() => {}); } catch (e) {}
}
const items = new Map();

function mount(el) {
  el.classList.add('sh');
  const it = { el, fx: null, shown: false };
  items.set(el, it);
  ready.then(() => document.fonts.ready).then(() => {
    it.fx = UnchainedScribble.mount(el, { level: LEVEL, fps: FPS, wiggle: WIG, gain: GAIN, color: '#fff3e8', weight: WEIGHT[el.tagName === 'H1' ? 0 : 1] });
    it.fx.canvas.classList.add('sh-canvas');
    if (reduce || it.shown) show(it, 0);
  });
  return it;
}
function show(it, delay) {
  it.shown = true;
  if (!it.fx) return;
  const c = it.fx.canvas;
  c.style.transitionDelay = (delay || 0) + 's';
  requestAnimationFrame(() => c.classList.add('in'));
}
function play(el, delay = 0) { const it = items.get(el); if (it) show(it, delay); }
function playing(el) { const it = items.get(el); return !!(it && it.shown); }
function headAt(el) { const r = el.getBoundingClientRect(); return { x: r.left + Math.min(r.width * .08, 40), y: r.top + r.height * .55 }; }

return { mount, play, playing, headAt };
})();
