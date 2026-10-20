/* v11 Skyshader: shooting stars and the hero's sky chart (the sky itself is the WebGL shader in sky.js).
   #fx  (fixed, above the sky, under the content): meteors with long glowing tails and shed sparkles, their reflections
        in the hero lake, the landers whose head starts each heading's light painting (lightpaint.js), and the meteor at
        the tip of the timeline. Scroll velocity briefly stretches every tail.
   Hero: sky-chart annotations (real facts) placed around the figure; a hidden constellation (a music note).
        Hover shows its lines; clicking the seven stars in order brings a meteor shower and plays the song.
   Reduced motion: no meteors, headings drawn at once, constellation still works (song plays, no shower). */
(() => {
const SF = window.SF = window.SF || {};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const TAU = Math.PI * 2, rand = (a, b) => a + Math.random() * (b - a), clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const hero = document.getElementById('hero');
const fxc = document.getElementById('fx'), fx = fxc.getContext('2d');
let W = 0, H = 0, HW = 0, HH = 0;

/* ---------- meteors ---------- */
const meteors = [], sparks = [], bursts = [];
const RAD = { x: -.12, y: -.28 };   // radiant: every shower meteor comes from beyond the upper left
let trailMul = 1, vel = 0, lastScroll = scrollY;
function spawnMeteor(o = {}) {
  // start on the top or left edge region, heading away from the radiant
  const sxp = o.x != null ? o.x : rand(-.05, .85) * W, syp = o.y != null ? o.y : rand(-.05, .38) * H;
  const rad = W <= 820 ? { x: -.9, y: -.25 } : RAD;
  let dx = sxp - rad.x * W, dy = syp - rad.y * H; const l = Math.hypot(dx, dy); dx /= l; dy /= l;
  const big = o.big != null ? o.big : Math.random() < .18;
  meteors.push({ x: sxp, y: syp, dx, dy, v: o.v || rand(650, 1150) * (big ? 1.15 : 1), L: o.L || rand(240, 420) * (big ? 1.7 : 1), w: big ? 3.4 : rand(1.7, 2.5),
    life: 0, dur: o.dur || rand(.8, 1.5), hue: Math.random() < .25 ? 'rose' : Math.random() < .5 ? 'azure' : 'gold', refl: o.refl !== false });
}
const TAILC = { gold: ['255,248,226', '255,214,138', '246,170,90'], azure: ['250,252,255', '170,205,255', '110,150,240'], rose: ['255,246,240', '255,196,214', '200,150,240'] };
function drawTail(g, x, y, dx, dy, L, w, a, hue) {
  const c = TAILC[hue], tx = x - dx * L, ty = y - dy * L, nx = -dy, ny = dx;
  // wide soft glow
  let gr = g.createLinearGradient(x, y, tx, ty); gr.addColorStop(0, `rgba(${c[1]},${.22 * a})`); gr.addColorStop(1, `rgba(${c[2]},0)`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(x + nx * w * 4, y + ny * w * 4); g.lineTo(tx, ty); g.lineTo(x - nx * w * 4, y - ny * w * 4); g.arc(x, y, w * 4, Math.atan2(-ny, -nx), Math.atan2(ny, nx)); g.fill();
  // bright tapered core
  gr = g.createLinearGradient(x, y, tx, ty); gr.addColorStop(0, `rgba(${c[0]},${a})`); gr.addColorStop(.25, `rgba(${c[1]},${.75 * a})`); gr.addColorStop(1, `rgba(${c[2]},0)`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(x + nx * w, y + ny * w); g.lineTo(tx, ty); g.lineTo(x - nx * w, y - ny * w); g.closePath(); g.fill();
  // head
  const hg = g.createRadialGradient(x, y, 0, x, y, w * 7); hg.addColorStop(0, `rgba(255,255,255,${a})`); hg.addColorStop(.25, `rgba(${c[1]},${.5 * a})`); hg.addColorStop(1, `rgba(${c[1]},0)`);
  g.fillStyle = hg; g.beginPath(); g.arc(x, y, w * 7, 0, TAU); g.fill();
}
function sparkle(g, x, y, r, a, c = '255,244,214') {   // four-point glint
  g.fillStyle = `rgba(${c},${a})`;
  g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r * .9, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r * .9, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
  const hg = g.createRadialGradient(x, y, 0, x, y, r * .7); hg.addColorStop(0, `rgba(${c},${a * .6})`); hg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = hg; g.beginPath(); g.arc(x, y, r * .7, 0, TAU); g.fill();
}
// the lake mirror: reflections live below the shader's horizon, left of the rock ledge
function lakeClip(scroll) {
  const hy = SF.sky.horizonY(scroll);
  if (hy > H) return null;
  const water = new Path2D(); water.rect(0, hy, Math.max(0, SF.sky.rockX0()), H - hy);
  return { hy, water, bottom: H };
}

/* ---------- landers: a meteor per section heading; it lands beside the title, bursts, and the title lights up ---------- */
const landers = [];
function launchLander(h) {
  if (h.lit || h.launched) return; h.launched = true;
  const r = h.el.getBoundingClientRect(), hp = LightPaint.headAt(h.el) || { x: r.left + Math.min(r.width * .12, 50), y: r.top + r.height * .5 };
  const tx = hp.x, tyDoc = hp.y + scrollY;
  let dx = 1, dy = .78; const l = Math.hypot(dx, dy); dx /= l; dy /= l;
  const dist = Math.min(W * .7, 820);
  landers.push({ h, sx: tx - dx * dist, syOff: -dy * dist, tx, tyDoc, dx, dy, life: 0, dur: .95 });
}
function land(L) {
  const { h } = L;
  burst(L.tx, L.tyDoc, .55);
  h.lit = true; LightPaint.play(h.el, 0);
}
function burst(x, yDoc, k) {
  bursts.push({ x, yDoc, life: 0, k });
  const n = Math.round(46 * k);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, sp = rand(40, 280) * k;
    sparks.push({ x, yDoc, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, life: 0, dur: rand(.7, 1.7), r: rand(1.2, 3.6), c: ['255,244,214', '255,214,138', '190,214,255', '255,200,222'][i % 4], doc: true });
  }
}
if (!reduce && SF.headings) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const h = SF.headings.find(h => h.el === e.target); if (h) launchLander(h); } }), { rootMargin: '0px 0px -28% 0px' });
  SF.headings.forEach(h => io.observe(h.el));
  // safety: a heading that somehow stayed dark lights itself once it has been on screen for a while
  setInterval(() => SF.headings.forEach(h => { if (h.lit) return; const r = h.el.getBoundingClientRect(); if (r.top < H * .9 && r.bottom > 0) { h.seen = (h.seen || 0) + 1; if (h.seen > 3) { h.lit = true; LightPaint.play(h.el, 0); } } }), 1000);
}

/* ---------- the timeline's progress line ends in a falling meteor ---------- */
const vtFill = document.querySelector('.vt-fill');
function timelineMeteor(t) {
  if (!vtFill) return;
  const r = vtFill.getBoundingClientRect();
  if (r.height < 6 || r.bottom < -40 || r.top > H + 40) return;
  const x = r.left + r.width / 2, y = Math.min(r.bottom, H + 20), L = Math.min(r.height, 150 * trailMul);
  drawTail(fx, x, y, 0, 1, L, 1.8, .95, 'gold');
  sparkle(fx, x, y, 9 + Math.sin(t * 6) * 2, .8);
  if (Math.random() < .5) sparks.push({ x: x + rand(-3, 3), yDoc: y + scrollY, vx: rand(-25, 25), vy: rand(-30, 10), life: 0, dur: rand(.5, 1), r: rand(.8, 2), c: '255,226,160', doc: true });
}

/* ---------- sky-chart annotations around the figure ---------- */
const chart = document.getElementById('chart'), chartLines = document.getElementById('chartLines');
const ANCHOR = { head: [.47, .8], hands: [.3, .95], hip: [.58, .5], feet: [.52, .07], sky: [.42, .28] };
function placeChart() {
  const f = SF.fig; if (!f || !chart) return;
  const narrow = HW <= 820; chart.classList.toggle('stacked', narrow);
  let svg = '';
  if (!narrow) {
    const gapL = 64, gapR = 70;
    const spots = {   // label positions (left/top of the label box) relative to the figure
      feet: [f.x + f.w + gapR - 20, f.y + f.h * .02, 'R'], hip: [f.x + f.w + gapR, f.y + f.h * .42, 'R'],
      head: [f.x - gapL, f.y + f.h * .66, 'L'], hands: [f.x - gapL - 20, f.y + f.h * .9, 'L'], sky: [f.x - gapL - 30, f.y + f.h * .3, 'L'] };
    chart.querySelectorAll('li').forEach(li => {
      const k = li.dataset.at, [lx, ly, side] = spots[k], a = ANCHOR[k];
      const lxx = side === 'L' ? lx : Math.min(lx, HW - li.offsetWidth - 18);
      li.style.left = side === 'L' ? '' : lxx + 'px'; li.style.right = side === 'L' ? (HW - lx) + 'px' : ''; li.style.top = ly + 'px';
      li.dataset.side = side;
      const ax = f.x + f.w * a[0], ay = f.y + f.h * a[1], ex = side === 'L' ? lx + 8 : lxx - 8, ey = ly + 12;
      const mx = (ax + ex) / 2, my = Math.min(ay, ey) - 10;
      svg += `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" pathLength="1"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3.2"/>`;
    });
  } else chart.querySelectorAll('li').forEach(li => { li.style.left = li.style.right = li.style.top = ''; });
  chartLines.setAttribute('viewBox', `0 0 ${HW} ${HH}`); chartLines.innerHTML = svg;
}

/* ---------- the hidden constellation: a music note ---------- */
const NOTE = [[.12, .9], [.36, 1], [.58, .86], [.6, .52], [.62, .08], [.98, .3], [.9, .62]];   // click order 1..7
const LINES = [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 6]];
const constel = document.getElementById('constel'), cLines = constel.querySelector('svg'), np = document.getElementById('np'), audio = document.getElementById('audio');
let clicked = 0, solved = false;
const cstars = NOTE.map((p, i) => {
  const b = document.createElement('button'); b.className = 'cs'; b.type = 'button';
  b.setAttribute('aria-label', `star ${i + 1} of ${NOTE.length}`);
  b.addEventListener('click', () => clickStar(i)); constel.appendChild(b); return b;
});
function placeConstel() {
  const narrow = HW <= 820, cw = narrow ? 74 : 104, ch = cw * 1.5;
  const f = SF.fig || { x: HW * .6, y: HH * .3, w: 100, h: 100 };
  const x = narrow ? HW - cw - 26 : Math.min(HW - cw - 70, f.x + f.w + 30), y = narrow ? Math.max(f.y - ch - 40, HH * .36) : HH * .09;
  Object.assign(constel.style, { left: x + 'px', top: y + 'px', width: cw + 'px', height: ch + 'px' });
  cstars.forEach((b, i) => { b.style.left = NOTE[i][0] * cw + 'px'; b.style.top = NOTE[i][1] * ch + 'px'; });
  cLines.setAttribute('viewBox', `0 0 ${cw} ${ch}`);
  // painted note (alpha copy of the shared kimi note-star): its head at (.457,.60) and stem top at (.52,.325) of the frame, pinned to our stars
  const ng = constel.querySelector('.note-glow'), ns = ch * 3.05;
  if (ng) Object.assign(ng.style, { width: ns + 'px', height: ns + 'px', left: (cw * .35 - ns * .457) + 'px', top: (ch * .92 - ns * .6) + 'px' });
  cLines.innerHTML = LINES.map(([a, b], k) => `<line data-k="${k}" x1="${NOTE[a][0] * cw}" y1="${NOTE[a][1] * ch}" x2="${NOTE[b][0] * cw}" y2="${NOTE[b][1] * ch}"/>`).join('');
  if (narrow) { np.style.left = (x + cw / 2) + 'px'; np.style.top = (y - 34) + 'px'; np.dataset.side = 'c'; }
  else { np.style.left = (x - 18) + 'px'; np.style.top = (y + ch * .82) + 'px'; np.dataset.side = 'l'; }
}
function litLines() {
  cLines.querySelectorAll('line').forEach((ln, k) => { const [a, b] = LINES[k]; ln.classList.toggle('on', solved || (a < clicked && b < clicked)); });
  cstars.forEach((s, i) => { s.classList.toggle('on', solved || i < clicked); s.classList.toggle('next', !solved && i === clicked && clicked > 0); });
}
function clickStar(i) {
  if (solved) { toggleSong(); return; }
  const r = cstars[i].getBoundingClientRect();
  if (i === clicked) {
    clicked++; burst(r.left + r.width / 2, r.top + r.height / 2 + scrollY, .25);
    if (clicked === NOTE.length) { solved = true; constel.classList.add('solved'); shower(r); toggleSong(true); }
  } else { clicked = 0; constel.classList.remove('miss'); void constel.offsetWidth; constel.classList.add('miss'); }
  litLines();
}
function shower() {
  const cr = constel.getBoundingClientRect();
  burst(cr.left + cr.width / 2, cr.top + cr.height / 2 + scrollY, 1.4);
  if (reduce) return;
  for (let i = 0; i < 38; i++) setTimeout(() => spawnMeteor({ big: Math.random() < .3, dur: rand(.9, 1.6) }), i * 85 + Math.random() * 120);
}
function toggleSong(force) {
  const play = force || audio.paused;
  if (play) { audio.play().catch(() => {}); np.innerHTML = '♪ my favourite song <span>· tap the note to pause</span>'; }
  else { audio.pause(); np.innerHTML = '♪ paused <span>· tap the note to play</span>'; }
  np.classList.add('show'); constel.classList.toggle('playing', play);
}
audio.addEventListener('ended', () => { constel.classList.remove('playing'); np.innerHTML = '♪ <span>tap the note to play it again</span>'; });

/* ---------- layout + loop ---------- */
function resize() {
  W = innerWidth; H = innerHeight; HW = hero.clientWidth; HH = hero.clientHeight;
  fxc.width = Math.round(W * DPR); fxc.height = Math.round(H * DPR);
  fx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
SF.onLayout = () => { if (HW !== hero.clientWidth || W !== innerWidth || H !== innerHeight) resize(); placeChart(); placeConstel(); };
resize();

let last = performance.now(), nextAmbient = 0, T = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now; T += dt;
  const t = reduce ? 0 : T, scroll = scrollY;
  // scroll velocity (px/s) -> tails stretch, then relax
  const v = (scroll - lastScroll) / Math.max(dt, .001); lastScroll = scroll;
  vel += (v - vel) * .25;
  const want = 1 + Math.min(2.2, Math.abs(vel) / 900);
  trailMul += (want - trailMul) * (want > trailMul ? .35 : .05);
  fx.clearRect(0, 0, W, H);
  if (reduce) return;
  fx.globalCompositeOperation = 'lighter';
  // ambient shower: denser over the hero, a steady trickle further down
  if (T > nextAmbient) { spawnMeteor(); nextAmbient = T + (scroll < HH * .8 ? rand(.5, 1.6) : rand(.7, 2.2)); }
  const lake = lakeClip(scroll);
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i]; m.life += dt; const p = m.life / m.dur;
    if (p >= 1) { meteors.splice(i, 1); continue; }
    m.x += m.dx * m.v * dt; m.y += m.dy * m.v * dt;
    let a = Math.pow(Math.sin(Math.PI * p), .7); const L = m.L * Math.min(1, p * 3.5) * trailMul;
    if (lake && m.refl) a *= clamp((lake.hy - 6 - m.y) / 90);   // burns out before it reaches the water line
    if (a <= .002 && p > .2) { meteors.splice(i, 1); continue; }
    drawTail(fx, m.x, m.y, m.dx, m.dy, L, m.w, a, m.hue);
    if (Math.random() < .35) sparks.push({ x: m.x, yDoc: m.y + scroll, vx: m.dx * 40 + rand(-20, 20), vy: m.dy * 40 + rand(-20, 20), life: 0, dur: rand(.4, .9), r: rand(.6, 1.6), c: TAILC[m.hue][1], doc: true });
    if (lake && m.refl && m.y < lake.hy) {   // mirror in the lake: flipped about the water line, softer, rippled, never on the rock
      const ry = 2 * lake.hy - m.y, rip = Math.sin(t * 9 + m.x * .05) * 3;
      if (ry < lake.bottom + L) { fx.save(); fx.clip(lake.water, 'evenodd'); drawTail(fx, m.x + rip, ry, m.dx, -m.dy, L * .8, m.w * 1.4, a * .38, m.hue); fx.restore(); }
    }
  }
  // landers
  for (let i = landers.length - 1; i >= 0; i--) {
    const L = landers[i]; L.life += dt; const p = Math.min(1, L.life / L.dur), e = Math.pow(p, 1.5);
    const ty = L.tyDoc - scroll, sy = ty + L.syOff, x = L.sx + (L.tx - L.sx) * e, y = sy + (ty - sy) * e;
    drawTail(fx, x, y, L.dx, L.dy, (120 + 260 * p) * trailMul, 2.4, Math.min(1, p * 4), 'gold');
    if (p >= 1) { landers.splice(i, 1); land(L); }
  }
  timelineMeteor(t);
  // bursts: flash ring + anamorphic flare
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i]; b.life += dt; const p = b.life / 1.1; if (p >= 1) { bursts.splice(i, 1); continue; }
    const y = b.yDoc - scroll, a = 1 - p, r = 20 + 90 * smooth(p) * b.k;
    const gl = fx.createRadialGradient(b.x, y, 0, b.x, y, r * 1.6); gl.addColorStop(0, `rgba(255,240,200,${.7 * a * a})`); gl.addColorStop(1, 'rgba(255,214,138,0)');
    fx.fillStyle = gl; fx.beginPath(); fx.arc(b.x, y, r * 1.6, 0, TAU); fx.fill();
    fx.strokeStyle = `rgba(255,226,170,${.5 * a})`; fx.lineWidth = 1.5; fx.beginPath(); fx.arc(b.x, y, r, 0, TAU); fx.stroke();
    const fw = 260 * b.k * (1 - p * .4), fl = fx.createLinearGradient(b.x - fw, 0, b.x + fw, 0);
    fl.addColorStop(0, 'rgba(160,190,255,0)'); fl.addColorStop(.5, `rgba(255,246,226,${.75 * a})`); fl.addColorStop(1, 'rgba(160,190,255,0)');
    fx.fillStyle = fl; fx.fillRect(b.x - fw, y - 1.5, fw * 2, 3);
    sparkle(fx, b.x, y, 26 * b.k * (1 - p * .5), a);
  }
  // sparks
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]; s.life += dt; const p = s.life / s.dur; if (p >= 1) { sparks.splice(i, 1); continue; }
    s.vx *= .95; s.vy = s.vy * .95 + 40 * dt; s.x += s.vx * dt; s.yDoc += s.vy * dt;
    const a = (1 - p) * (.6 + .4 * Math.sin(s.life * 30 + i));
    if (s.r > 2.4) sparkle(fx, s.x, s.yDoc - scroll, s.r * 2.2, a, s.c);
    else { fx.fillStyle = `rgba(${s.c},${a})`; fx.beginPath(); fx.arc(s.x, s.yDoc - scroll, s.r, 0, TAU); fx.fill(); }
  }
  if (sparks.length > 900) sparks.splice(0, sparks.length - 900);
  fx.globalCompositeOperation = 'source-over';
}
requestAnimationFrame(frame);
addEventListener('resize', () => { resize(); placeChart(); placeConstel(); });
})();
