/* v11 "Painterly": app wiring on top of the living sky (sky.js, WebGL) and the pencil lettering (pencil.js).
   This file draws the 2D overlay (#sky, transparent, above the WebGL sky):
   - The comet is the progress indicator: on the hero it is a faint streak at the top-left; as you scroll its glowing
     trail draws itself further across the sky; over Contact it splits into two shooting stars. Its progress also
     drives the camera altitude of the painted sky (PainterlySky.setProgress), so the shooting star pulls the
     whole world from golden hour up into space.
   - Ambient shooting stars emerge as the sky darkens.
   - Easter egg: at night (near About/Contact) a star with a music note sometimes falls. Click/tap it while it crosses
     to catch it: it bursts, the red cords glow, and Daniel's favourite song plays. The faint ✦ in the footer (and the
     song chip) finds it again. Audio starts only from that gesture.
   Reduced motion: no autonomous motion; the sky and comet still follow the scroll position, the note star waits still. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const BASE = window.V9_BASE || '';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const rand = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;
const load = n => { const i = new Image(); i.decoding = 'async'; i.src = BASE + 'assets/' + n; return i; };
const ok = i => i.complete && i.naturalWidth > 0;

const COMET = load('comet-head.webp'), NOTE = load('note-star.webp');

/* ---------- lettering + hero figure ---------- */
document.querySelectorAll('[data-pencil]').forEach((el, i) => Pencil.render(el, { seed: 9 + i * 29, delay: i ? 0 : .35 }));
if (!reduce) Pencil.start();
const figEl = document.getElementById('fig');
let tilt = 0, tiltTarget = 0;
if (!reduce && matchMedia('(pointer: fine)').matches) addEventListener('pointermove', e => { tiltTarget = (e.clientX / innerWidth - .5) * 2; }, { passive: true });

/* ---------- canvas ---------- */
const sky = document.getElementById('sky'), sx = sky.getContext('2d'), hero = document.getElementById('hero');
let W = 0, H = 0, docH = 1, narrow = false;
const hillY = t => 62 * (1 - t) * (1 - t) + 2 * t * (1 - t) * -14 + 52 * t * t;   // the hill path in index.html (viewBox units)
function layout() {
  W = innerWidth; H = innerHeight; narrow = W < 760;
  docH = Math.max(document.documentElement.scrollHeight, H + 1);
  sky.width = Math.round(W * DPR); sky.height = Math.round(H * DPR);
  // the figure does his handstand on the hilltop, hands on the rim-lit ridge
  const hw = hero.clientWidth, hh = hero.clientHeight, hill = document.getElementById('hill'), hH = hill.getBoundingClientRect().height;
  const h = narrow ? Math.min(hh * .4, hw * .78) : Math.min(hh * .62, hw * .9), w = h * 2 / 3;
  const cx = narrow ? hw * .74 : hw * .7, ridge = hh - hH + hH * hillY(cx / hw) / 100;
  Object.assign(figEl.style, { height: h + 'px', width: w + 'px', left: (cx - w / 2) + 'px', top: (ridge - h * .945) + 'px' });
}

/* ---------- the light: one dusk keyed by progress P (0 = hero, 1 = contact) ---------- */
// key colours used to light clouds, sparks and the CSS accents: gold -> rose -> violet -> moonlit navy (never through green)
const LIGHT = [[0, [255, 214, 168]], [.3, [250, 176, 176]], [.55, [206, 160, 222]], [.78, [150, 156, 226]], [1, [120, 136, 210]]];
function light(P) {
  for (let i = 1; i < LIGHT.length; i++) if (P <= LIGHT[i][0]) { const [a, ca] = LIGHT[i - 1], [b, cb] = LIGHT[i], k = (P - a) / (b - a); return ca.map((v, j) => Math.round(lerp(v, cb[j], k))); }
  return LIGHT[LIGHT.length - 1][1];
}
const rootStyle = document.documentElement.style;

/* ---------- the comet: page progress drawn as a glowing trail ---------- */
const bez = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
function cometPaths() {
  const N = narrow
    ? { a: [-.06, .19], c: [.46, .1], b: [.82, .27], A: [[1.0, .4], [.9, .68]], B: [[.5, .38], [.12, .72]] }   // below the phone nav
    : { a: [-.04, .12], c: [.42, -.04], b: [.78, .24], A: [[.98, .32], [.92, .72]], B: [[.6, .3], [.17, .74]] };
  const s = p => [p[0] * W, p[1] * H];
  return { main: [s(N.a), s(N.c), s(N.b)], A: [s(N.b), s(N.A[0]), s(N.A[1])], B: [s(N.b), s(N.B[0]), s(N.B[1])] };
}
function trail(path, u0, u1, opts) {
  const n = Math.max(2, Math.round((u1 - u0) * opts.res)), pts = [];
  for (let i = 0; i <= n; i++) pts.push(bez(...path, u0 + (u1 - u0) * i / n));
  sx.lineCap = 'round';
  for (const [wid, col, al] of opts.passes) {
    sx.lineWidth = wid; sx.strokeStyle = col;
    for (let i = 1; i <= n; i++) {
      const k = i / n, a = al * Math.pow(k, opts.fall) * opts.a;
      if (a < .004) continue;
      sx.globalAlpha = a; sx.beginPath(); sx.moveTo(...pts[i - 1]); sx.lineTo(...pts[i]); sx.stroke();
    }
  }
  sx.globalAlpha = 1;
  const p = pts[n], q = pts[n - 1]; return { x: p[0], y: p[1], ang: Math.atan2(p[1] - q[1], p[0] - q[0]) };
}
function glow(x, y, r, rgb, a) {
  const g = sx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  sx.fillStyle = g; sx.fillRect(x - r, y - r, r * 2, r * 2);
}
function head(h, size, a, t) {
  glow(h.x, h.y, size * .55, '255,236,214', .55 * a);
  glow(h.x, h.y, size * 1.3, '196,176,255', .16 * a);
  if (ok(COMET)) {
    const s = size * (1 + .06 * Math.sin(t * 5.3)) / COMET.naturalHeight * 1.4;
    sx.save(); sx.translate(h.x, h.y); sx.rotate(h.ang); sx.globalAlpha = a;
    // the sprite's bright core sits a little right of centre; its own short tail points back along the path
    sx.drawImage(COMET, -COMET.naturalWidth * .53 * s, -COMET.naturalHeight * .5 * s, COMET.naturalWidth * s, COMET.naturalHeight * s);
    sx.restore(); sx.globalAlpha = 1;
  }
}
const PASSES = [[16, 'rgb(236,170,214)', .05], [7, 'rgb(150,184,255)', .16], [2.6, 'rgb(214,222,255)', .5], [1.1, 'rgb(255,248,236)', .9]];
const SPLIT = .86;

/* sparks: dust shed by the comet heads, catch bursts */
const sparks = [];
function spark(x, y, vx, vy, life, rgb, r) { if (sparks.length < 400) sparks.push({ x, y, vx, vy, life, age: 0, rgb, r }); }
/* ambient shooting stars: they emerge as the sky darkens */
const shooters = [];
let nextShooter = 0;

/* ---------- the note star (song easter egg) ---------- */
const audio = document.getElementById('audio'), chip = document.getElementById('songchip'), chipBtn = document.getElementById('songbtn'), wish = document.getElementById('wish');
let noteStar = null, nextNote = 0, noteHead = null, caught = false;
try { if (localStorage.getItem('mh-caught') === '1') wish.classList.add('found'); } catch (e) {}
function setPlaying(on) {
  document.documentElement.classList.toggle('cord-lit', on);
  wish.setAttribute('aria-pressed', on); chipBtn.setAttribute('aria-pressed', on);
  chipBtn.textContent = on ? '❚❚' : '▶'; chipBtn.setAttribute('aria-label', on ? 'Pause the song' : 'Play the song');
  if (on) { chip.hidden = false; requestAnimationFrame(() => chip.classList.add('on')); }
}
function playSong() {
  caught = true; wish.classList.add('found');
  try { localStorage.setItem('mh-caught', '1'); } catch (e) {}
  audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
}
function toggleSong() { if (audio.paused) playSong(); else { audio.pause(); setPlaying(false); } }
chipBtn.addEventListener('click', toggleSong);
wish.addEventListener('click', toggleSong);
audio.addEventListener('ended', () => setPlaying(false));
function burst(x, y) {
  for (let i = 0; i < 70; i++) { const a = rand(0, TAU), v = rand(30, 260); spark(x, y, Math.cos(a) * v, Math.sin(a) * v, rand(.8, 2), i % 3 ? '255,214,150' : '244,150,170', rand(.8, 2.4)); }
  flash = 1; flashAt = [x, y];
}
let flash = 0, flashAt = [0, 0];
const near = (x, y) => noteHead && Math.hypot(x - noteHead.x, y - noteHead.y) < (matchMedia('(pointer: coarse)').matches ? 95 : 75);
addEventListener('pointerdown', e => {
  if (!near(e.clientX, e.clientY)) return;
  burst(noteHead.x, noteHead.y); noteStar = null; noteHead = null; nextNote = performance.now() + rand(14000, 22000); document.documentElement.classList.remove('can-catch');
  playSong();
}, { passive: true });
addEventListener('pointermove', e => document.documentElement.classList.toggle('can-catch', !!near(e.clientX, e.clientY)), { passive: true });

/* ---------- main loop ---------- */
let P = 0, last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  const t = reduce ? 0 : now / 1000, scroll = scrollY;
  const target = clamp(scroll / (docH - H));
  P = reduce ? target : P + (target - P) * Math.min(1, dt * 7);
  if (Math.abs(target - P) < 1e-5) P = target;
  sx.setTransform(DPR, 0, 0, DPR, 0, 0);

  sx.clearRect(0, 0, W, H);
  if (window.PainterlySky) PainterlySky.setProgress(P);

  sx.globalCompositeOperation = 'lighter';
  // 5. ambient shooting stars
  const dark = smooth(.3, .9, P);
  if (!reduce && dark > 0 && now > nextShooter) {
    const L = rand(.14, .26) * Math.max(W, 700), a = rand(2.3, 2.7), x = rand(.35, 1.1) * W, y = rand(-.05, .35) * H;
    shooters.push({ x, y, vx: Math.cos(a) * W * rand(.7, 1.1), vy: Math.sin(a) * W * rand(.7, 1.1) * .6 + H * .25, L, age: 0, life: rand(.7, 1.1) });
    nextShooter = now + rand(900, 2400) / dark;
  }
  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i]; s.age += dt; if (s.age > s.life) { shooters.splice(i, 1); continue; }
    const k = s.age / s.life, hx = s.x + s.vx * s.age, hy = s.y + s.vy * s.age, v = Math.hypot(s.vx, s.vy), tx = hx - s.vx / v * s.L * Math.min(1, k * 3), ty = hy - s.vy / v * s.L * Math.min(1, k * 3);
    const a = Math.sin(Math.PI * k) * dark;
    const g = sx.createLinearGradient(tx, ty, hx, hy); g.addColorStop(0, 'rgba(160,180,255,0)'); g.addColorStop(1, `rgba(255,246,232,${a})`);
    sx.strokeStyle = g; sx.lineWidth = 1.6; sx.beginPath(); sx.moveTo(tx, ty); sx.lineTo(hx, hy); sx.stroke();
    glow(hx, hy, 9, '255,240,220', .7 * a);
  }

  // 6. the comet: trail grows with progress, splits into two over Contact
  const paths = cometPaths(), s = .24 + .76 * clamp(P / SPLIT), split = smooth(0, 1, (P - SPLIT) / (1 - SPLIT));
  const headA = .75 + .25 * smooth(0, .25, P), size = (narrow ? 70 : 104) * (1 - .35 * split);
  const mainA = .7 + .3 * smooth(0, .3, P);
  const hMain = trail(paths.main, 0, s, { res: 160, fall: 1.25, a: mainA * (1 - .35 * split), passes: PASSES });
  if (split > 0) {
    const hA = trail(paths.A, 0, split, { res: 90, fall: 1.1, a: mainA, passes: PASSES });
    const hB = trail(paths.B, 0, split, { res: 90, fall: 1.1, a: mainA, passes: PASSES.map(([w, c, a]) => [w, c === 'rgb(150,184,255)' ? 'rgb(236,160,200)' : c, a]) });
    glow(paths.A[0][0], paths.A[0][1], 60 + 80 * Math.sin(Math.PI * Math.min(1, split * 2)), '255,226,236', .35 * Math.sin(Math.PI * Math.min(1, split * 2)));
    head(hA, size * .8, headA, t); head(hB, size * .8, headA, t + 1);
    if (!reduce && Math.random() < .5) [hA, hB].forEach(h => spark(h.x, h.y, rand(-20, 20), rand(-10, 30), rand(.6, 1.4), Math.random() < .5 ? '255,226,190' : '214,190,255', rand(.6, 1.6)));
  }
  if (split < 1) head(hMain, size, headA * (1 - split), t);
  if (!reduce && split < 1 && Math.random() < .35 + Math.abs(target - P) * 40) spark(hMain.x, hMain.y, rand(-30, 10), rand(-8, 22), rand(.6, 1.5), Math.random() < .5 ? '255,236,210' : '200,190,255', rand(.5, 1.5));

  // 7. the note star: at night, now and then; click it to catch it
  const night = P > .72;
  if (night && !noteStar && now > nextNote) {
    if (!nextNote) nextNote = now + 2200;
    else if (reduce) noteStar = { still: true };
    else { const x0 = rand(.06, .4) * W; noteStar = { x0, y0: -.06 * H, x1: x0 + rand(.42, .55) * W, y1: rand(.5, .62) * H, t0: now, dur: 4200 }; }
  }
  if (!night && noteStar && !noteStar.still) { noteStar = null; noteHead = null; nextNote = now + 1500; }
  if (!night && noteStar && noteStar.still) { noteStar = null; noteHead = null; nextNote = 0; }
  if (noteStar) {
    let x, y, a;
    if (noteStar.still) { x = W * .78; y = H * .3; a = 1; }
    else {
      const k = (now - noteStar.t0) / noteStar.dur;
      if (k >= 1) { noteStar = null; noteHead = null; nextNote = now + rand(9000, 15000); }
      else { x = lerp(noteStar.x0, noteStar.x1, k); y = lerp(noteStar.y0, noteStar.y1, k) + Math.sin(k * Math.PI) * -H * .04; a = Math.min(1, Math.sin(Math.PI * k) * 2.2); }
    }
    if (noteStar) {
      noteHead = { x, y };
      const sz = narrow ? 120 : 150;
      glow(x, y, 46, '255,214,160', .35 * a);
      if (ok(NOTE)) { sx.globalAlpha = a; sx.drawImage(NOTE, x - sz * .7, y - sz * .88, sz, sz); sx.globalAlpha = 1; }
      else { sx.globalAlpha = a; sx.fillStyle = '#ffe2b0'; sx.font = '34px serif'; sx.fillText('♪', x - 10, y + 10); sx.globalAlpha = 1; }
      if (!reduce && Math.random() < .6) spark(x, y, rand(-40, 0), rand(-40, 0), rand(.5, 1.2), Math.random() < .5 ? '255,214,150' : '244,170,190', rand(.5, 1.4));
    }
  }

  // sparks + catch flash
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i]; p.age += dt; if (p.age > p.life) { sparks.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .97; p.vy = p.vy * .97 + 14 * dt;
    const a = 1 - p.age / p.life; sx.globalAlpha = a; sx.fillStyle = `rgb(${p.rgb})`; sx.beginPath(); sx.arc(p.x, p.y, p.r * (.6 + .4 * a), 0, TAU); sx.fill();
  }
  sx.globalAlpha = 1;
  if (flash > .01) { glow(flashAt[0], flashAt[1], 260 * (1.4 - flash), '255,220,200', .5 * flash); flash *= Math.pow(.05, dt); }
  sx.globalCompositeOperation = 'source-over';

  // CSS accent follows the light (cards, nav glow); written rarely
  const lc = light(P).join(','); if (lc !== frame.lc) { rootStyle.setProperty('--sky', lc); frame.lc = lc; }
  // the hero figure: a slow sway, a little lean toward the pointer, and he sinks into the hill as the camera climbs
  if (scroll < H * 1.3) {
    tilt += (tiltTarget - tilt) * .05;
    const sway = reduce ? 0 : Math.sin(t * .9) * .6;
    figEl.style.transform = `translateY(${(scroll * .18).toFixed(1)}px) rotate(${(sway + tilt * 1.5).toFixed(2)}deg)`;
  }
}
layout();
document.fonts.ready.then(() => { layout(); GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), BASE + '../v5-elemental/assets/golf'); });
addEventListener('load', layout);
addEventListener('resize', layout);
if (window.ResizeObserver) new ResizeObserver(() => { docH = Math.max(document.documentElement.scrollHeight, H + 1); }).observe(document.querySelector('main'));
requestAnimationFrame(frame);

if (reduce || !window.gsap) return;
/* ---------- smooth scroll + entrances (continuous eases, nothing stepped) ---------- */
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .09 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(tk => lenis.raf(tk * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 }); }));
gsap.from('.role, .hero-lines li, .hero .pill', { y: 18, opacity: 0, duration: .9, ease: 'power3.out', stagger: .1, delay: .9 });
gsap.utils.toArray('.card:not(.vt-card)').forEach(c => gsap.from(c, { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 90%' } }));
gsap.utils.toArray('.cord img').forEach(c => gsap.from(c, { clipPath: 'inset(0 50% 0 50%)', duration: 1.4, ease: 'power2.inOut', scrollTrigger: { trigger: c, start: 'top 92%' } }));
ScrollTrigger.addEventListener('refresh', layout);
})();
