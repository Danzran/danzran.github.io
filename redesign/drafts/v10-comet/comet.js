/* v10 Comet: the twilight comet is the spine of the page.
   - Hero: the comet hangs in the blue-hour sky over the still water (and is mirrored in it). Scrolling moves its head
     along a path; a little way in it SPLITS. The violet fragment falls into the water (a flash and a ripple). The gold
     fragment keeps going: its trail becomes the gold progress line that runs down the page margin, swings into the
     Experience timeline as its spine, swings back out and ends in a star under "Say hello".
     The head sits a little below the middle of the viewport, so the line is always "drawn as far as you have read".
   - Fragments flare when the head passes a section heading or a timeline year (sparks + the heading glows).
   - Shooting stars cross the sky behind the content; they fall more densely the further down you are.
   - Easter egg: click/tap 3 shooting stars and you make a wish: the comet bursts into a meteor shower and Daniel's
     favourite song fades in. A tiny now-playing star (bottom left) stops it.
   All geometry is in document coordinates; the canvas is fixed and translated by -scrollY each frame.
   Reduced motion: no time-based motion. The line and head follow the scroll position only; shooting stars become
   still twinkles that fade in and out (still catchable); bursts are replaced by a soft glow. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const cv = document.getElementById('comet'), g = cv.getContext('2d');
const base = window.V9_BASE || '';
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const rand = (a, b) => a + Math.random() * (b - a);
// sprites were painted on black; tools turned black into alpha (assets/*.webp are RGBA), so they screen over any layer
const sprite = src => { const i = new Image(); i.src = base + src; return i; };
const SPR = { head: sprite('assets/comet-head.webp'), split: sprite('assets/comet-split.webp'), flare: sprite('assets/flare.webp') };
// sprite anchors (fraction of the image) and the direction the sprite is travelling in
const HEAD = { ax: .573, ay: .533, dir: 46 * Math.PI / 180 }, SPLIT = { ax: .643, ay: .623, dir: 48 * Math.PI / 180 };
// tinted copies of the flare: gold for the progress head, violet for the fragment that falls
const tinted = {};
function tint(name, col) {
  if (tinted[name]) return tinted[name];
  const im = SPR.flare; if (!im.complete || !im.naturalWidth) return null;
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d');
  x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = .55; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
  return (tinted[name] = c);
}

let W = 0, H = 0, docH = 0, narrow = false;
/* ---------------- path building ---------------- */
// Hermite segments sampled every ~4px; every waypoint has a tangent, the vertical runs use (0,1) so y never goes back
function sampleSeg(out, P, Q, tP, tQ) {
  const d = Math.hypot(Q.x - P.x, Q.y - P.y), k = d * .42;
  const c1 = { x: P.x + tP.x * k, y: P.y + tP.y * k }, c2 = { x: Q.x - tQ.x * k, y: Q.y - tQ.y * k };
  const n = Math.max(2, Math.ceil(d / 4));
  for (let i = out.length ? 1 : 0; i <= n; i++) {
    const u = i / n, v = 1 - u;
    out.push({ x: v * v * v * P.x + 3 * v * v * u * c1.x + 3 * v * u * u * c2.x + u * u * u * Q.x, y: v * v * v * P.y + 3 * v * v * u * c1.y + 3 * v * u * u * c2.y + u * u * u * Q.y });
  }
}
function build(wps) {
  const pts = [];
  for (let i = 0; i < wps.length - 1; i++) sampleSeg(pts, wps[i], wps[i + 1], wps[i].t, wps[i + 1].t);
  const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return { pts, len, total: len[len.length - 1] };
}
const unit = (x, y) => { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };
// first index whose y >= y (paths are monotonic in y), with the fraction toward the next sample
function atY(P, y) {
  const p = P.pts; if (y <= p[0].y) return { i: 0, f: 0 }; if (y >= p[p.length - 1].y) return { i: p.length - 1, f: 0 };
  let lo = 0, hi = p.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p[m].y < y) lo = m; else hi = m; }
  return { i: lo, f: (y - p[lo].y) / ((p[hi].y - p[lo].y) || 1) };
}
const ptAt = (P, a) => { const p = P.pts, q = p[Math.min(p.length - 1, a.i + 1)]; return { x: lerp(p[a.i].x, q.x, a.f), y: lerp(p[a.i].y, q.y, a.f) }; };
const lenAt = (P, a) => lerp(P.len[a.i], P.len[Math.min(P.len.length - 1, a.i + 1)], a.f);
const dirAt = (P, i) => { const p = P.pts, a = p[Math.max(0, i - 3)], b = p[Math.min(p.length - 1, i + 1)]; return Math.atan2(b.y - a.y, b.x - a.x); };

let sImp = 0, A = null, B = null, C0, S, I, TAILFAR, dir0, marks = [], endPt;
const docTop = el => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, cx: r.left + r.width / 2, cy: r.top + scrollY + r.height / 2 }; };
function layout() {
  W = innerWidth; H = innerHeight; docH = document.documentElement.scrollHeight; narrow = W <= 820;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  const hero = docTop(document.getElementById('hero')), hh = hero.bottom - hero.top;
  const horizon = window.SKY ? window.SKY.horizonY() + scrollY * window.SKY.k : hh * .62;
  const work = document.getElementById('work'), cs = getComputedStyle(work), wr = work.getBoundingClientRect();
  const contentL = wr.left + parseFloat(cs.paddingLeft), contentR = wr.right - parseFloat(cs.paddingRight);
  // the margin the line runs down: right side on desktop (between the cards and the edge), left on phones
  const mx = narrow ? Math.max(7, contentL * .45) : Math.min(W - 18, (contentR + W) / 2 + 4);
  C0 = narrow ? { x: W * .5, y: hh * .1 } : { x: W * .3, y: hh * .1 };
  S = narrow ? { x: W * .76, y: hh * .4 } : { x: W * .6, y: hh * .27 };
  dir0 = unit(S.x - C0.x, S.y - C0.y);
  TAILFAR = { x: C0.x - dir0.x * W * 1.2, y: C0.y - dir0.y * W * 1.2 };
  const V = { x: 0, y: 1 };
  const spine = document.querySelector('.vt-spine'), list = document.querySelector('.vt-list');
  const sp = docTop(spine), lt = docTop(list), pool = docTop(document.getElementById('pool'));
  const spineX = sp.cx, listTop = lt.top + H * .02, listBot = sp.bottom;
  endPt = { x: pool.cx, y: pool.cy - (pool.bottom - pool.top) * .1 };
  const wps = [
    { ...C0, t: dir0 }, { ...S, t: dir0 },
    { x: narrow ? mx : lerp(S.x, mx, .82), y: horizon + hh * .12, t: unit(narrow ? -.25 : .35, 1) },
    { x: mx, y: hero.bottom + H * .1, t: V },
    { x: mx, y: listTop - H * .45, t: V }, { x: spineX, y: listTop, t: V },
    { x: spineX, y: listBot, t: V }, { x: mx, y: listBot + H * .45, t: V },
    { x: mx, y: endPt.y - H * .55, t: V }, { x: endPt.x, y: endPt.y, t: unit(narrow ? .6 : -.6, 1) }
  ];
  // keep the waypoints strictly descending (short viewports can squeeze the hero ones)
  for (let i = 1; i < wps.length; i++) if (wps[i].y <= wps[i - 1].y + 8) wps[i].y = wps[i - 1].y + 8;
  A = build(wps);
  // where the violet fragment meets the water: the plate scrolls slower than the page, so find the scroll at which
  // the falling head and the (moving) horizon meet
  I = { x: narrow ? W * .3 : W * .44, y: horizon };
  const k = window.SKY ? window.SKY.k : .35;
  for (let it = 0; it < 6; it++) {
    let lo = 0, hi = H * 3; for (let j = 0; j < 30; j++) { const m = (lo + hi) / 2; headY(m) < I.y ? lo = m : hi = m; }
    I.y = horizon + lo * (1 - k) + hh * .012; sImp = lo;
  }
  B = build([{ ...S, t: dir0 }, { ...I, t: unit(-.35, 1) }]);
  // flare marks: section headings and timeline years
  marks = [...document.querySelectorAll('.sec > h2, .about > h2, .vt-item')].map(el => {
    const isItem = el.classList.contains('vt-item'), r = docTop(isItem ? el.querySelector('.vt-dot') : el);
    return { el, y: r.cy, item: isItem, armed: true };
  });
}

/* ---------------- head position from scroll ---------------- */
// doc y of the gold head: starts high in the sky, settles ~55% down the viewport, and reaches the end star at the bottom
function headY(s) {
  let y = s + H * .56 - (H * .56 - C0.y) * Math.exp(-1.3 * s / H);
  const left = docH - H - s; if (left < H * .6) y = lerp(y, endPt.y + 1, smooth(1 - left / (H * .6)));
  return y;
}

/* ---------------- particles, shooting stars ---------------- */
let sparks = [], shots = [], ripples = [], flash = 0, splitT = -9, impactT = -9, wasSplit = false, wasImpact = false;
const COLS = ['255,240,206', '255,214,138', '246,194,94', '255,190,210', '200,180,255', '190,215,255'];
function burst(x, y, n, spd, cols) {
  if (reduce) { flash = Math.max(flash, .35); return; }
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), v = rand(.25, 1) * spd;
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * .15, t: 0, life: rand(.7, 1.7), r: rand(.8, 2.2), c: (cols || COLS)[i % (cols || COLS).length] });
  }
  if (sparks.length > 600) sparks.splice(0, sparks.length - 600);
}
// a shooting star in viewport coordinates, falling the same way the comet does (down and to the right)
function shoot(o = {}) {
  const ang = (o.ang ?? rand(24, 40)) * Math.PI / 180, sp = o.sp ?? rand(520, 980);
  const s = { x: o.x ?? rand(-.25, .85) * W, y: o.y ?? rand(-.1, .55) * H, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
    len: o.len ?? rand(110, 260), w: o.w ?? rand(1, 1.9), big: !!o.big, t: 0, life: o.life ?? rand(.75, 1.3), c: o.c || (Math.random() < .7 ? '255,236,190' : Math.random() < .5 ? '255,190,214' : '196,186,255'), wish: !!o.wish };
  if (reduce) { s.vx = s.vy = 0; s.life = rand(2.6, 3.6); s.len = 0; }
  shots.push(s); if (shots.length > 160) shots.shift();
  return s;
}
let nextShot = 1.5, nextWish = 4 + Math.random() * 3, shower = 0, wishT = -9, wishAt = null;
// the meteor shower after a wish: bigger, longer, brighter stars from the comet's side of the sky
const showerStar = () => shoot({ x: rand(-.4, .8) * W, y: rand(-.35, .35) * H, ang: rand(26, 36), sp: rand(800, 1300), len: rand(240, 460), w: rand(1.8, 3.2), life: rand(.9, 1.5), c: ['255,240,206', '255,214,138', '255,190,214', '206,190,255'][Math.floor(Math.random() * 4)], big: true });

/* ---------------- drawing helpers ---------------- */
// a tapered glowing ribbon along P from length l0 to l1; style(d) gets the distance back from the head (l1)
function ribbon(P, l0, l1, style, view0, view1) {
  const p = P.pts, len = P.len; if (l1 <= l0) return;
  let i = 0; { let lo = 0, hi = len.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (len[m] < l0) lo = m; else hi = m; } i = lo; }
  const STEP = 5;
  for (; i < p.length - 1 && len[i] < l1; i += STEP) {
    const j = Math.min(p.length - 1, i + STEP);
    if (Math.max(p[i].y, p[j].y) < view0 || Math.min(p[i].y, p[j].y) > view1) continue;
    const st = style(l1 - Math.min(l1, len[j])); if (!st || st.a < .004) continue;
    g.strokeStyle = `rgba(${st.c},${st.a.toFixed(3)})`; g.lineWidth = st.w;
    g.beginPath(); g.moveTo(p[i].x, p[i].y); for (let k = i + 1; k <= j; k++) { if (len[k] > l1) break; g.lineTo(p[k].x, p[k].y); } g.stroke();
  }
}
function polyline(pts, from, to, view0, view1, end) {
  g.beginPath(); let on = false;
  for (let i = from; i <= to; i++) {
    const q = pts[i]; if (q.y < view0 - 40 || q.y > view1 + 40) { on = false; continue; }
    on ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); on = true;
  }
  if (on && end) g.lineTo(end.x, end.y);
  g.stroke();
}
function drawSprite(im, x, y, size, rot, alpha, ax = .5, ay = .5) {
  if (!im || !(im.naturalWidth || im.width) || alpha <= .003) return;
  g.save(); g.globalAlpha = alpha; g.translate(x, y); if (rot) g.rotate(rot); g.drawImage(im, -size * ax, -size * ay, size, size); g.restore();
}

/* the comet itself (head, tails, the fragments); called twice in the hero: once for the sky, once mirrored in the water */
function drawComet(hy, t, scroll, mirror) {
  const view0 = mirror ? -H : scroll - 60, view1 = mirror ? H * 4 : scroll + H + 60;
  const pre = hy < S.y, aA = atY(A, hy), head = ptAt(A, aA), lA = lenAt(A, aA);
  const aS = atY(A, S.y), lS = lenAt(A, aS);
  const after = clamp((hy - S.y) / (H * .9));   // 0 at the split -> 1 well after it
  const scale = narrow ? .7 : 1, shimmer = reduce ? 1 : .85 + .15 * Math.sin(t * 3.1) * Math.sin(t * 1.7);
  g.lineCap = 'round'; g.lineJoin = 'round';
  // 1) the original comet tail, streaming back off the top-left; it dissolves after the split
  const tailA = (pre ? 1 : 1 - .75 * after) * (mirror ? .55 : 1);
  if (tailA > .01) {
    const hx = pre ? head : S, ang = Math.atan2(TAILFAR.y - hx.y, TAILFAR.x - hx.x), L = Math.hypot(TAILFAR.x - hx.x, TAILFAR.y - hx.y) + 80;
    // the tail is a few soft fans layered additively: narrow at the head, flaring and curving gently away from it
    const LAYERS = [[1.2, 6, '255,250,236', .75, .35], [3, 26, '255,232,186', .3, .5], [7, 70, '255,206,150', .13, .7], [12, 150, '170,170,255', .07, 1], [20, 260, '150,150,255', .035, 1]];
    for (const [w0, w1, col, al, reach] of LAYERS) {
      const n = 22, side = [], other = [], LL = L * reach;
      for (let i = 0; i <= n; i++) {
        const u = i / n, bend = (reduce ? 0 : Math.sin(t * .7 + u * 3) * .012) * u, a2 = ang + bend - .08 * u * u;
        const cx = hx.x + Math.cos(a2) * LL * u, cy = hx.y + Math.sin(a2) * LL * u, w = (w0 + (w1 - w0) * Math.pow(u, .85)) * scale;
        side.push([cx - Math.sin(a2) * w, cy + Math.cos(a2) * w]); other.push([cx + Math.sin(a2) * w, cy - Math.cos(a2) * w]);
      }
      const gr = g.createLinearGradient(hx.x, hx.y, hx.x + Math.cos(ang) * LL, hx.y + Math.sin(ang) * LL);
      gr.addColorStop(0, `rgba(${col},${(al * tailA).toFixed(3)})`); gr.addColorStop(.35, `rgba(${col},${(al * tailA * .45).toFixed(3)})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.beginPath(); side.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = other.length - 1; i >= 0; i--) g.lineTo(other[i][0], other[i][1]); g.closePath(); g.fill();
    }
  }
  // the part of the path already travelled before the split, up to the head or the split point
  const lPre = pre ? lA : lS;
  ribbon(A, Math.max(0, lPre - 900), lPre, d => ({ c: '255,236,196', a: .35 * Math.exp(-d / 220) * (pre ? 1 : 1 - after * .8), w: 1.6 * scale }), view0, view1);
  if (pre) {
    const dr = dirAt(A, aA.i);
    drawSprite(SPR.head, head.x, head.y, 230 * scale, dr - HEAD.dir, .95 * shimmer, HEAD.ax, HEAD.ay);
    return;
  }
  // 2) gold fragment: the progress line (thin, persistent) plus a bright comet tail behind the head
  if (!mirror) {
    g.strokeStyle = 'rgba(255,214,138,.16)'; g.lineWidth = 9; polyline(A.pts, aS.i, aA.i, view0, view1, head);
    g.strokeStyle = 'rgba(255,233,176,.75)'; g.lineWidth = 1.6; polyline(A.pts, aS.i, aA.i, view0, view1, head);
  }
  const tailLen = H * (narrow ? .5 : .6);
  ribbon(A, Math.max(lS, lA - tailLen), lA, d => { const k = 1 - d / tailLen; return { c: '255,226,160', a: .2 * k * k, w: (3 + 16 * k * k) * scale }; }, view0, view1);
  ribbon(A, Math.max(lS, lA - tailLen * .7), lA, d => { const k = 1 - d / (tailLen * .7); return { c: '255,246,222', a: .85 * k * k * k, w: (1.4 + 4 * k * k) * scale }; }, view0, view1);
  // 3) violet fragment: falls into the water, then its trail fades
  const aB = atY(B, Math.min(hy, I.y)), hB = ptAt(B, aB), lB = lenAt(B, aB);
  const sinceImpact = hy >= I.y ? (performance.now() / 1000 - impactT) : 0;
  const bFade = hy >= I.y ? clamp(1 - (hy - I.y) / (H * .5)) : 1;
  if (bFade > 0) {
    ribbon(B, Math.max(0, lB - H * .5), lB, d => { const k = 1 - d / (H * .5); return { c: '196,176,255', a: .3 * k * k * bFade, w: (3 + 14 * k * k) * scale }; }, view0, view1);
    ribbon(B, Math.max(0, lB - H * .35), lB, d => { const k = 1 - d / (H * .35); return { c: '236,226,255', a: .8 * k * k * k * bFade, w: (1.2 + 3.5 * k * k) * scale }; }, view0, view1);
    if (hy < I.y) drawSprite(tint('violet', '#c9b8ff'), hB.x, hB.y, 120 * scale * shimmer, 0, .95);
  }
  // gold head
  const pulse = reduce ? 1 : .9 + .1 * Math.sin(t * 4.2);
  drawSprite(SPR.head, head.x, head.y, 120 * scale, dirAt(A, aA.i) - HEAD.dir, .7 * (1 - after * .4), HEAD.ax, HEAD.ay);
  drawSprite(tint('gold', '#ffe2a6'), head.x, head.y, 110 * scale * pulse, reduce ? 0 : t * .15, 1);
  // the split flash: the split sprite blooms at the split point for a moment
  const st = performance.now() / 1000 - splitT;
  if (st < 1.4 && !reduce) drawSprite(SPR.split, S.x, S.y, 320 * scale, Math.atan2(dir0.y, dir0.x) - SPLIT.dir, Math.sin(Math.PI * clamp(st / 1.4)) * .9, SPLIT.ax, SPLIT.ay);
  void sinceImpact;
}

/* ---------------- main loop ---------------- */
let prev = performance.now(), lastHy = null;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - prev) / 1000); prev = now;
  const t = now / 1000, scroll = scrollY;
  if (!A) return;
  const hy = headY(scroll);
  const p = docH > H ? clamp(scroll / (docH - H)) : 0;
  // events: split, impact, section flares (only when travelling down; re-armed when you scroll back above)
  if (hy >= S.y && !wasSplit) { wasSplit = true; splitT = now / 1000; burst(S.x, S.y, 46, 260); }
  if (hy < S.y - 4) wasSplit = false;
  if (hy >= I.y && !wasImpact) { wasImpact = true; impactT = now / 1000; if (Math.abs(scroll - sImp) < H * .3) { burst(I.x, I.y, 36, 200, ['200,180,255', '236,226,255', '255,214,138']); ripples.push({ x: I.x, y: I.y, s0: scroll, t: 0 }); } }
  if (hy < I.y - 4) wasImpact = false;
  const headPt = ptAt(A, atY(A, hy));
  for (const m of marks) {
    if (m.armed && hy >= m.y) {
      m.armed = false;
      const at = m.item ? ptAt(A, atY(A, m.y)) : headPt;
      burst(at.x, at.y, m.item ? 34 : 26, m.item ? 230 : 190);
      if (!reduce) for (let k = 0; k < 2; k++) shoot({ x: at.x, y: at.y - scroll, ang: rand(-160, 20), sp: rand(380, 620), len: rand(60, 120), life: .7, w: 1.2 });
      m.el.classList.remove('lit'); void m.el.offsetWidth; m.el.classList.add('lit');
    } else if (!m.armed && hy < m.y - H * .1) m.armed = true;
  }
  // shooting stars: sparse in the hero, denser the further you scroll; one slower "wish" star every few seconds
  const rate = reduce ? .25 : .2 + 3.6 * Math.pow(p, 1.3);
  nextShot -= dt * rate; while (nextShot <= 0) { nextShot += rand(.5, 1.5); shoot(); }
  if (shower > 0 && !reduce && Math.random() < dt * 30 * shower) showerStar();
  nextWish -= dt; if (nextWish <= 0) { nextWish = rand(5, 9); shoot({ wish: true, sp: rand(260, 360), life: rand(1.8, 2.4), len: rand(160, 240), w: 2.2, c: '255,236,190' }); }
  shower = Math.max(0, shower - dt / 6);

  g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
  g.globalCompositeOperation = 'lighter';
  // the comet (and its reflection in the water while the hero is on screen)
  g.save(); g.translate(0, -scroll); drawComet(hy, t, scroll, false); g.restore();
  if (window.SKY && scroll < H * 1.2) {
    const hz = window.SKY.horizonY();
    g.save(); g.beginPath(); g.rect(0, hz, W, H); g.clip();
    g.globalAlpha = .4 * window.SKY.alpha(scroll);
    g.translate(0, 2 * hz); g.scale(1, -1); g.translate(0, -scroll);
    if (g.globalAlpha > .01) drawComet(hy, t, scroll, true);
    g.restore(); g.globalAlpha = 1;
  }
  // ripples where the fragment hit the water
  ripples = ripples.filter(r => (r.t += dt) < 2.4);
  for (const r of ripples) { const k = r.t / 2.4; g.strokeStyle = `rgba(220,206,255,${(.6 * (1 - k)).toFixed(3)})`; g.lineWidth = 1.4; g.beginPath(); g.ellipse(r.x, r.y - r.s0 - (scroll - r.s0) * (window.SKY ? window.SKY.k : 1), 20 + 240 * k, 4 + 26 * k, 0, 0, TAU); g.stroke(); }
  // sparks (document space)
  sparks = sparks.filter(s => (s.t += dt) < s.life);
  for (const s of sparks) {
    s.vx *= 1 - dt * 1.6; s.vy = s.vy * (1 - dt * 1.6) + 40 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    const k = 1 - s.t / s.life; g.fillStyle = `rgba(${s.c},${(k * .95).toFixed(3)})`; g.beginPath(); g.arc(s.x, s.y - scroll, s.r * (.6 + k), 0, TAU); g.fill();
    if (s.r > 1.9 && k > .4) drawSprite(SPR.flare, s.x, s.y - scroll, 26 * k, 0, k * .8);
  }
  // shooting stars (viewport space)
  shots = shots.filter(s => !s.dead && (s.t += dt) < s.life);
  for (const s of shots) {
    s.x += s.vx * dt; s.y += s.vy * dt;
    const u = s.t / s.life, a = reduce ? Math.sin(Math.PI * u) : Math.min(1, u * 5) * (1 - u * u);
    if (s.len) {
      const sp = Math.hypot(s.vx, s.vy) || 1, L = s.len * Math.min(1, u * 3), tx = s.x - s.vx / sp * L, ty = s.y - s.vy / sp * L;
      const gr = g.createLinearGradient(tx, ty, s.x, s.y); gr.addColorStop(0, `rgba(${s.c},0)`); gr.addColorStop(1, `rgba(${s.c},${(a * .95).toFixed(3)})`);
      g.strokeStyle = gr; g.lineWidth = s.w; g.beginPath(); g.moveTo(tx, ty); g.lineTo(s.x, s.y); g.stroke();
    }
    drawSprite(SPR.flare, s.x, s.y, (s.big ? 64 : s.wish ? 46 : 26) * (reduce ? 1.2 : 1), s.wish && !reduce ? s.t * 2 : 0, a);
  }
  const wt = now / 1000 - wishT;
  if (wishAt && wt < 2.2) {
    const k = clamp(wt / 2.2), x = wishAt.x, y = wishAt.y - scroll, R = (narrow ? 260 : 420) * (.4 + 1.2 * Math.sqrt(k));
    drawSprite(SPR.flare, x, y, R * 2, k * .6, (1 - k) * (1 - k));
    const gl = g.createRadialGradient(x, y, 0, x, y, R); gl.addColorStop(0, `rgba(255,236,200,${(.55 * (1 - k)).toFixed(3)})`); gl.addColorStop(1, 'rgba(255,200,180,0)');
    g.fillStyle = gl; g.fillRect(x - R, y - R, R * 2, R * 2);
  }
  if (flash > 0) { g.fillStyle = `rgba(255,226,170,${(flash * .25).toFixed(3)})`; g.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * .8); }
  g.globalCompositeOperation = 'source-over';
  lastHy = hy;
}

/* ---------------- the wish easter egg ---------------- */
const audio = document.getElementById('audio'), np = document.getElementById('np'), wishes = document.getElementById('wishes');
const wsStars = [...wishes.querySelectorAll('.ws i')], wt = wishes.querySelector('.wt');
const LINES = ['', 'a falling star… one', 'two… one more for a wish', 'wish made ✦'];
let caught = 0, hideT = 0, fadeRaf = 0;
function setCaught(n) {
  caught = n; wsStars.forEach((s, i) => s.classList.toggle('on', i < n)); wt.textContent = LINES[n];
  wishes.classList.toggle('show', n > 0); clearTimeout(hideT);
  if (n > 0) hideT = setTimeout(() => { wishes.classList.remove('show'); if (caught < 3) { /* keep the count, just hide */ } }, n === 3 ? 4200 : 9000);
}
function fadeTo(v, dur, done) {
  cancelAnimationFrame(fadeRaf); const v0 = audio.volume, t0 = performance.now();
  const step = n => { const k = clamp((n - t0) / dur); audio.volume = clamp(lerp(v0, v, k * k * (3 - 2 * k))); if (k < 1) fadeRaf = requestAnimationFrame(step); else done && done(); };
  fadeRaf = requestAnimationFrame(step);
}
function makeWish() {
  setCaught(3);
  const hy = headY(scrollY), h = ptAt(A, atY(A, hy));
  burst(h.x, h.y, 160, 520, ['255,246,222', '255,214,138', '255,190,214', '200,180,255']); flash = 1; wishT = performance.now() / 1000; wishAt = h;
  if (!reduce) { shower = 1; for (let k = 0; k < 30; k++) showerStar(); }
  audio.volume = 0; audio.currentTime = 0;
  const pr = audio.play(); if (pr && pr.catch) pr.catch(() => {});
  fadeTo(.8, 3800);
  np.hidden = false; requestAnimationFrame(() => np.classList.add('show'));
  setTimeout(() => setCaught(0), 4600);
}
function stopSong() {
  np.classList.remove('show');
  fadeTo(0, 1400, () => { audio.pause(); np.hidden = true; });
}
np.addEventListener('click', stopSong);
audio.addEventListener('ended', () => { np.classList.remove('show'); np.hidden = true; });
const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, u = clamp(((px - ax) * dx + (py - ay) * dy) / l); return Math.hypot(px - ax - u * dx, py - ay - u * dy); };
addEventListener('pointerdown', e => {
  if (e.button !== 0 || e.target.closest('a,button,input,video,label,#golf')) return;
  const R = e.pointerType === 'touch' ? 44 : 30;
  let best = null, bd = R;
  for (const s of shots) {
    const sp = Math.hypot(s.vx, s.vy) || 1, L = Math.min(90, s.len * .5), d = segDist(e.clientX, e.clientY, s.x, s.y, s.x - s.vx / sp * L, s.y - s.vy / sp * L) - (s.wish ? 10 : 0);
    if (d < bd) { bd = d; best = s; }
  }
  if (!best) return;
  best.dead = true; burst(best.x, best.y + scrollY, 30, 200);
  if (np.hidden === false && !audio.paused) return;   // already wished; stars still sparkle when caught
  caught >= 2 ? makeWish() : setCaught(caught + 1);
}, { passive: true });

/* ---------------- clouds toggle (cards as twilight cumulus) ---------------- */
const sw = document.getElementById('cloudSwitch'), root = document.documentElement;
const syncSw = () => sw.setAttribute('aria-pressed', root.classList.contains('clouds'));
syncSw();
sw.addEventListener('click', () => {
  const on = root.classList.toggle('clouds'); syncSw();
  const u = new URL(location.href); on ? u.searchParams.set('clouds', '1') : u.searchParams.delete('clouds');
  try { history.replaceState(null, '', u); } catch (e) {}
  setTimeout(relayout, 60);
});

function relayout() { layout(); }
addEventListener('resize', relayout);
addEventListener('load', relayout);
addEventListener('comet:layout', relayout);
document.fonts && document.fonts.ready.then(relayout);
[600, 1600, 3200].forEach(ms => setTimeout(relayout, ms));
if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', relayout);
relayout();
window.__comet = { get shots() { return shots; } };   // read-only peek for the screenshot harness
requestAnimationFrame(frame);
})();
