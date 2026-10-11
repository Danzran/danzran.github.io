(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const S = window.SWING, GOLF = '../v5-elemental/assets/golf';
document.querySelectorAll('[data-brush]').forEach((el, i) => Lettering.render(el, { seed: 41 + i * 23 }));
if (!reduce) Lettering.start(7);

/* ---------- sky: same azure/ivory/gold cotton sky as the homepage, simplified ---------- */
const sky = document.getElementById('sky'), sx = sky.getContext('2d');
const river = document.getElementById('river'), rx = river.getContext('2d');
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
function drawSky(t, scroll) {
  const g = sx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8fc0f5'); g.addColorStop(.55, '#cfe4fb'); g.addColorStop(1, '#fbf4e6');
  sx.fillStyle = g; sx.fillRect(0, 0, W, H);
  const sg = sx.createRadialGradient(W * .8, H * .12, 0, W * .8, H * .12, Math.max(W, H) * .5);
  sg.addColorStop(0, 'rgba(255,246,214,.9)'); sg.addColorStop(.15, 'rgba(250,221,150,.45)'); sg.addColorStop(1, 'rgba(250,221,150,0)');
  sx.fillStyle = sg; sx.fillRect(0, 0, W, H);
  for (const c of clouds) {
    const w = c.img.width * (W / 1600) * (.6 + c.d), h = c.img.height * (W / 1600) * (.6 + c.d);
    const y = c.y * H - scroll * c.d, yy = ((y % (H * 3)) + H * 3) % (H * 3) - H * .4;
    sx.globalAlpha = .55 + c.d; sx.drawImage(c.img, ((c.x + t * c.v) % 1.4 - .2) * W - w / 2, yy, w, h);
  }
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

/* ---------- river: down the page edges, and one water line threading under the five keyframes ---------- */
let path = [];
function layout() {
  W = innerWidth; H = innerHeight;
  [sky, river].forEach(c => { c.width = W * DPR; c.height = H * DPR; }); sx.setTransform(DPR, 0, 0, DPR, 0, 0); rx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const top = el => el.getBoundingClientRect().top + scrollY, r = s => document.querySelector(s).getBoundingClientRect();
  const main = r('.p-main'), strip = r('.keystrip'), how = r('.how'), back = r('.back');
  const sy = scrollY, L = Math.max(W * .04, main.left - 36), R = Math.min(W * .96, main.right + 36);
  path = [{ x: W * .5, y: r('.p-head').bottom + sy - 10 }, { x: L, y: main.top + sy + main.height * .2 }, { x: L, y: main.bottom + sy - 40 },
    { x: L + 10, y: strip.bottom + sy + 26 }];
  tiles.forEach((T, i) => { const b = T.c.getBoundingClientRect(); path.push({ x: b.left + b.width * .5, y: b.bottom + sy + (i % 2 ? 30 : 14) }); });
  path.push({ x: R, y: strip.bottom + sy + 30 }, { x: R, y: how.top + sy + how.height * .5 }, { x: back.left + back.width * .5 + 120, y: back.top + sy + back.height * .5 });
  path = path.map(p => ({ ...p, z: 1 }));
}
layout(); addEventListener('resize', layout); addEventListener('load', layout);
document.fonts.ready.then(() => { layout(); GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), GOLF); });

let lastDrawing = -1;
function frame(now) {
  requestAnimationFrame(frame);
  const t = reduce ? 0 : Math.floor(now / 1000 * 12) / 12, drawing = Math.floor(now / (1000 / 12)), scroll = scrollY;
  drawSky(t, scroll);
  rx.clearRect(0, 0, W, H);
  if (path.length > 1) {
    const pts = path.map((p, i) => ({ x: p.x + Math.sin(t * .8 + i * 1.7) * 6, y: p.y, z: 1 }));
    rx.save(); rx.translate(0, -scroll); Water.setSeed(drawing + 5); Water.draw(rx, pts, { width: Math.max(14, Math.min(28, W * .02)), t, side: 0, drawn: 1, alpha: .9, taper: 200 }); rx.restore();
  }
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
