(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const S = window.SWING, GOLF = '../v5-elemental/assets/golf';
/* v11: headings are light-painted (lightpaint.js) and the living WebGL sky (sky.js) runs behind the page, held at dusk */
const heads = [...document.querySelectorAll('[data-lp]')]; heads.forEach(el => LightPaint.mount(el));
document.fonts.ready.then(() => {
  LightPaint.play(heads[0], .3);
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { LightPaint.play(e.target, .1); io.unobserve(e.target); } }), { rootMargin: '0px 0px -20% 0px' });
  heads.slice(1).forEach(h => io.observe(h));
});

/* ---------- keyframe tiles: the real frame + skeleton re-inked on twos ---------- */
const KEYS = [['address', S.phases.address], ['takeaway', Math.round((S.phases.address + S.phases.top) / 2)], ['top', S.phases.top], ['impact', S.phases.impact], ['finish', Math.min(S.frames - 1, S.phases.impact + 12)]];
const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
const ol = document.getElementById('keys');
const tiles = KEYS.map(([name, f]) => {
  const li = document.createElement('li'), c = document.createElement('canvas'), im = new Image();
  im.src = `${GOLF}/g${String(f).padStart(2, '0')}.webp`;
  const arm = S.per_frame[f] ? Math.round(S.per_frame[f][0]) : null;
  li.innerHTML = `<b>${name}</b><span>frame ${f}${arm != null ? ` · lead arm ${arm}°` : ''}</span>`; li.prepend(c); ol.append(li);
  return { c, g: c.getContext('2d'), im, f };
});
const jit = a => (Math.random() - .5) * a;
function drawTile(T) {
  const { c, g, im, f } = T, w = c.clientWidth, h = c.clientHeight; if (!w) return;
  if (c.width !== Math.round(w * DPR)) { c.width = Math.round(w * DPR); c.height = Math.round(h * DPR); }
  g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, w, h);
  if (im.complete && im.naturalWidth) g.drawImage(im, 0, 0, w, h);
  const kp = S.kp[f]; if (!kp) return;
  const P = i => [kp[i][0] * w + jit(1.4), kp[i][1] * h + jit(1.4)];
  g.lineCap = 'round'; g.strokeStyle = '#1557b0'; g.lineWidth = 2.4;
  for (const [a, b] of BONES) { if (kp[a][2] < .3 || kp[b][2] < .3) continue; const [x1, y1] = P(a), [x2, y2] = P(b); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  for (const i of [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) { if (kp[i][2] < .3) continue; const [x, y] = P(i); g.fillStyle = i === 15 || i === 16 ? '#e9b85a' : '#fff'; g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill(); g.strokeStyle = '#25396c'; g.lineWidth = 1.4; g.stroke(); g.lineWidth = 2.4; g.strokeStyle = '#1557b0'; }
}

function layout() {}
layout(); addEventListener('resize', layout); addEventListener('load', layout);
document.fonts.ready.then(() => { layout(); GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), GOLF); });

let lastDrawing = -1;
function frame(now) {
  requestAnimationFrame(frame);
  const t = reduce ? 0 : now / 1000, drawing = Math.floor(now / (1000 / 12)), scroll = scrollY;
  if (drawing !== lastDrawing && drawing % 2 === 0) { lastDrawing = drawing; tiles.forEach(drawTile); }
}
requestAnimationFrame(frame);

if (reduce) return;
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .09 }); lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(tk => lenis.raf(tk * 1000)); gsap.ticker.lagSmoothing(0);
gsap.utils.toArray('.card, .keystrip li').forEach((c, i) => gsap.from(c, { y: 70, opacity: 0, duration: .55, ease: 'steps(6)', delay: (i % 5) * .06, scrollTrigger: { trigger: c, start: 'top 90%' } }));
ScrollTrigger.addEventListener('refresh', layout);
})();
