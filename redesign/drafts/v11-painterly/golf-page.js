(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const S = window.SWING, GOLF = '../v5-elemental/assets/golf';
document.querySelectorAll('[data-pencil]').forEach((el, i) => Pencil.render(el, { seed: 41 + i * 23 }));
if (!reduce) Pencil.start();

/* ---------- sky: same azure/ivory/gold cotton sky as the homepage, simplified ---------- */
const sky = document.getElementById('sky'), sx = sky.getContext('2d');
let W = 0, H = 0;
function puffCloud(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const puff = (x, y, r) => { r = Math.min(r, x, w - x, y, h - y); if (r < 4) return; const rg = g.createRadialGradient(x, y - r * .2, r * .1, x, y, r); rg.addColorStop(0, '#fff'); rg.addColorStop(.78, 'rgba(255,255,255,.96)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  for (let i = 0; i < 22; i++) { const u = Math.random(), hump = Math.sin(Math.PI * u); puff(w * (.15 + .7 * u), h * (.7 - .22 * hump * Math.random()), h * (.12 + .2 * hump)); }
  g.globalCompositeOperation = 'source-atop';
  const sh = g.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(246,214,150,.35)'); sh.addColorStop(.45, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(90,130,200,.5)');
  g.fillStyle = sh; g.fillRect(0, 0, w, h); return c;
}
const clouds = Array.from({ length: 12 }, () => { const s = .5 + Math.random(); return { img: puffCloud(560 * s | 0, 280 * s | 0), x: Math.random(), y: Math.random() * 3, d: .08 + Math.random() * .35, v: .004 + Math.random() * .008 }; });
const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .3, tw: Math.random() * 6 }));
const plate = new Image(); plate.src = '../v9-night/assets/plate-night.webp';
function drawSky(t, scroll) {
  // v9 night: navy blue hour, moonlit cloud edges, stars, and the painted night plate fading out below the header
  const g = sx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#081234'); g.addColorStop(.6, '#142c6c'); g.addColorStop(1, '#22428c');
  sx.fillStyle = g; sx.fillRect(0, 0, W, H);
  const pa = Math.max(0, 1 - scroll / (H * 1.1));
  if (pa > 0 && plate.complete && plate.naturalWidth) { const s = Math.max(W / plate.naturalWidth, H / plate.naturalHeight) * 1.06, w = plate.naturalWidth * s, h = plate.naturalHeight * s; sx.globalAlpha = pa * .55; sx.drawImage(plate, (W - w) / 2, (H - h) / 2 - scroll * .35, w, h); }
  sx.fillStyle = '#fff6dc';
  for (const st of stars) { sx.globalAlpha = .45 + .45 * Math.sin(t * 2 + st.tw); sx.beginPath(); sx.arc(st.x * W, ((st.y * H - scroll * .05) % H + H) % H, st.r, 0, 7); sx.fill(); }
  sx.globalAlpha = 1;
}

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

function layout() {
  W = innerWidth; H = innerHeight;
  sky.width = W * DPR; sky.height = H * DPR; sx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
layout(); addEventListener('resize', layout); addEventListener('load', layout);
document.fonts.ready.then(() => { layout(); GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), GOLF); });

let lastDrawing = -1;
function frame(now) {
  requestAnimationFrame(frame);
  const t = reduce ? 0 : now / 1000, drawing = Math.floor(now / (1000 / 12)), scroll = scrollY;
  drawSky(t, scroll);
  if (drawing !== lastDrawing && drawing % 2 === 0) { lastDrawing = drawing; tiles.forEach(drawTile); }
}
requestAnimationFrame(frame);

if (reduce) return;
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .09 }); lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(tk => lenis.raf(tk * 1000)); gsap.ticker.lagSmoothing(0);
gsap.from('.p-head h1 .lt-letter', { y: 50, opacity: 0, duration: .45, ease: 'steps(4)', stagger: .04, delay: .1 });
gsap.utils.toArray('.card, .keystrip li').forEach((c, i) => gsap.from(c, { y: 70, opacity: 0, duration: .55, ease: 'steps(6)', delay: (i % 5) * .06, scrollTrigger: { trigger: c, start: 'top 90%' } }));
gsap.utils.toArray('.keys h2, .how h2').forEach(h => gsap.from(h.querySelectorAll('.lt-letter'), { y: 40, opacity: 0, duration: .35, ease: 'steps(3)', stagger: .04, scrollTrigger: { trigger: h, start: 'top 85%' } }));
ScrollTrigger.addEventListener('refresh', layout);
})();
