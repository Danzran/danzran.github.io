/* Experience as a vertical timeline (replaces the NLE timeline.js; that one stays viewable in labs/timeline/c-edit-timeline).
   A gold spine runs down the section with a year marker per job. Each frame we measure how far every entry's card sits
   from the middle of the viewport: the nearest one takes focus (--f -> 1: full size, bright, sharp) and the others
   recede (smaller, dimmer, blurred). The same distances weight a fixed full-screen canvas (#vtBg) behind the section,
   where each job has its own themed animation; the themes crossfade continuously as focus moves down the list.
     edit : the reel itself, soft and huge, film strips of it on the edges, light leaks, NLE ruler + timecode
     it   : circuit traces with packets travelling between nodes, VM windows stacking
     lock : pin-tumbler cross-section with a key sliding in and the pins lifting to the shear line,
            a push-to-start ring that pulses (brighter when the pins line up), programmer <-> fob handshake
     ext  : a swing arc with the club head sweeping, a Bluetooth sensor pulsing at the grip,
            data points streaming up into a cloud database
   Card visuals: the reel <video> for the edit years; the painted plate (assets/projects/<id>/plate-768.webp) for the
   others, or window.ProjectViz if it has been loaded; if the plate fails, a small live emblem of the theme is drawn instead.
   Uses app.js's Lenis indirectly (it scrolls the window); no ScrollTrigger needed. Reduced motion: themes hold still. */
(() => {
const root = document.getElementById('vt');
if (!root) return;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.25);
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const fract = x => x - Math.floor(x);
const srand = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const C = { navy: '13,28,64', ink: '6,12,32', deep: '31,95,191', blue: '77,143,224', azure: '140,192,255', ivory: '251,248,241', cream: '243,234,214', gold: '246,194,94', goldsoft: '255,217,138', pink: '244,182,200' };
const rgba = (c, a) => `rgba(${C[c]},${a})`;
const mode = (w, h, mini) => mini ? 'mini' : w < 820 ? 'tall' : 'wide';
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
function glow(g, x, y, r, c, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(c, a)); gr.addColorStop(1, rgba(c, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}

/* ================= themes: each factory returns draw(g, w, h, t, A, o) ================= */

/* ---- video editor: the reel, film strips, light leaks, ruler + timecode ---- */
function makeEdit() {
  const sm = document.createElement('canvas'); sm.width = 48; sm.height = 27; const sg = sm.getContext('2d');
  const bl = document.createElement('canvas'); bl.width = 160; bl.height = 90; const bg = bl.getContext('2d');   // softened copy, so the upscale has no blocks
  let last = -1, has = false;
  return (g, w, h, t, A, o) => {
    const m = Math.min(w, h), v = o.video;
    if (v && v.readyState >= 2 && v.videoWidth && v.currentTime !== last) { sg.drawImage(v, 0, 0, 48, 27); last = v.currentTime; has = true; bg.filter = 'blur(5px)'; bg.drawImage(v, -10, -6, 180, 102); }
    // warm wash from below, like the projector spill
    g.globalAlpha = A; glow(g, w * .5, h * 1.05, Math.max(w, h) * .8, 'gold', .16);
    // 1. the reel itself, huge and soft (a 48x27 frame upscaled is its own blur)
    if (has) {
      const s = Math.max(w / 160, h / 90) * 1.08; g.imageSmoothingEnabled = true;
      g.globalAlpha = A * .22; g.drawImage(bl, (w - 160 * s) / 2, (h - 90 * s) / 2, 160 * s, 90 * s);
      // keep its light but take the hue from the night palette (the reel itself is grey-cream)
      g.globalCompositeOperation = 'color'; g.globalAlpha = A * .55; g.fillStyle = rgba('deep', 1); g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';
    }
    // 2. light leaks drifting across (additive)
    g.globalCompositeOperation = 'lighter';
    [['goldsoft', 1], ['cream', .6], ['pink', .45]].forEach(([c, k], i) => {
      const x = w * (.5 + .5 * Math.sin(t * .11 + i * 2.4)), y = h * (.45 + .45 * Math.sin(t * .083 + i * 1.7 + 1)), r = Math.max(w, h) * (i === 2 ? .16 : .3 + .08 * Math.sin(t * .2 + i));
      g.globalAlpha = A * k * (.55 + .45 * Math.sin(t * .37 + i * 1.9)); glow(g, x, y, r, c, .2);
    });
    g.globalCompositeOperation = 'source-over';
    // 3. film strips of the reel running up the left edge and down the right
    const sw = clamp(m * .085, 30, 84), fh = sw * 1.3;
    for (const side of [0, 1]) {
      const x0 = side ? w - sw : 0, off = fract(t * .45 * (side ? -1 : 1)) * fh;
      g.globalAlpha = A * .9; g.fillStyle = rgba('ink', .78); g.fillRect(x0, 0, sw, h);
      for (let y = -fh + off; y < h + fh; y += fh) {
        if (has) { g.globalAlpha = A * .6; g.drawImage(sm, 12, 0, 24, 27, x0 + sw * .2, y + fh * .07, sw * .6, fh * .86); }
        else { g.globalAlpha = A * .4; g.fillStyle = rgba('deep', .8); g.fillRect(x0 + sw * .2, y + fh * .07, sw * .6, fh * .86); }
        g.globalAlpha = A * .45; g.fillStyle = rgba('cream', 1);
        for (let k = 0; k < 3; k++) { rr(g, x0 + sw * .05, y + (k + .3) * fh / 3, sw * .09, fh * .12, 2); g.fill(); rr(g, x0 + sw * .86, y + (k + .3) * fh / 3, sw * .09, fh * .12, 2); g.fill(); }
      }
    }
    // 4. hairline scratches that wander smoothly
    g.strokeStyle = rgba('ivory', 1); g.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const x = w * (.5 + .42 * Math.sin(t * .23 + i * 2.7) + .02 * Math.sin(t * 3.1 + i));
      g.globalAlpha = A * .1 * (.5 + .5 * Math.sin(t * 2.3 + i * 4)); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 6 * Math.sin(t + i), h); g.stroke();
    }
    // 5. an edit ruler along the bottom scrolling under a fixed playhead, clips on a track, running timecode
    const rb = clamp(m * .085, 38, 70), y0 = h - rb, sp = rb * .22, scroll = t * rb * .9;
    g.globalAlpha = A * .8; g.fillStyle = rgba('ink', .6); g.fillRect(0, y0, w, rb);
    g.strokeStyle = rgba('goldsoft', .5); g.lineWidth = 1; g.beginPath();
    for (let i = Math.floor(scroll / sp) - 1, n = i + w / sp + 3; i < n; i++) { const x = i * sp - scroll, tall = i % 6 === 0; g.moveTo(x, y0); g.lineTo(x, y0 + (tall ? rb * .26 : rb * .12)); }
    g.stroke();
    const r2 = srand(5), clips = Array.from({ length: 12 }, () => [r2() * 4 + 2, r2() * 1.2 + .4]);
    const cyc = clips.reduce((s, c) => s + c[0] + c[1], 0) * sp;
    let cx = -fract(scroll / cyc) * cyc;
    while (cx < w) for (const [len, gap] of clips) { const cw = len * sp; g.globalAlpha = A * .55; g.fillStyle = rgba('deep', 1); rr(g, cx, y0 + rb * .4, cw - 2, rb * .4, 4); g.fill(); g.globalAlpha = A * .5; g.strokeStyle = rgba('goldsoft', 1); g.stroke(); cx += cw + gap * sp; }
    const px = w * .5;
    g.globalAlpha = A * .16; g.fillStyle = rgba('goldsoft', 1); g.fillRect(px - 1, 0, 2, y0);
    g.globalAlpha = A * .9; g.fillStyle = rgba('gold', 1); g.fillRect(px - 1, y0, 2, rb); g.beginPath(); g.moveTo(px - 7, y0); g.lineTo(px + 7, y0); g.lineTo(px, y0 + 9); g.fill();
    const f = Math.floor(t * 24), tc = [Math.floor(f / 86400) % 24, Math.floor(f / 1440) % 60, Math.floor(f / 24) % 60, f % 24].map(n => String(n).padStart(2, '0')).join(':');
    g.globalAlpha = A * .75; g.fillStyle = rgba('cream', 1); g.font = `${Math.round(clamp(m * .026, 12, 19))}px ui-monospace, Menlo, Consolas, monospace`;
    g.textBaseline = 'bottom'; g.fillText('TC ' + tc, sw + 14, y0 - 10);
    g.globalAlpha = 1;
  };
}

/* ---- systems & IT: circuit traces, packets between nodes, VM windows stacking ---- */
function makeIT() {
  let key = '', paths = [], nodes = [], cell = 30;
  function build(w, h) {
    const r = srand(11); cell = Math.max(26, Math.min(w, h) / 11);
    const cols = Math.max(3, Math.floor(w / cell)), rows = Math.max(3, Math.floor(h / cell));
    const n = Math.round(clamp(cols * rows / 8, 8, 30)); nodes = []; paths = [];
    for (let i = 0; i < n; i++) nodes.push({ x: (1 + Math.floor(r() * (cols - 1))) * cell, y: (1 + Math.floor(r() * (rows - 1))) * cell });
    const seen = new Set();
    nodes.forEach((a, i) => {
      nodes.map((b, j) => [j, Math.hypot(a.x - b.x, a.y - b.y)]).filter(([j]) => j !== i).sort((p, q) => p[1] - q[1]).slice(0, 2).forEach(([j]) => {
        const k = i < j ? i + '-' + j : j + '-' + i; if (seen.has(k)) return; seen.add(k);
        const b = nodes[j], dx = b.x - a.x, dy = b.y - a.y, ch = Math.min(Math.abs(dx), Math.abs(dy), cell * .7);
        const pts = [[a.x, a.y], [b.x - Math.sign(dx) * ch, a.y], [b.x, a.y + Math.sign(dy) * ch], [b.x, b.y]];
        const cum = [0]; for (let s = 1; s < pts.length; s++) cum.push(cum[s - 1] + Math.hypot(pts[s][0] - pts[s - 1][0], pts[s][1] - pts[s - 1][1]));
        const len = cum[cum.length - 1]; if (len < 1) return;
        const rev = r() < .5;
        paths.push({ pts: rev ? pts.slice().reverse() : pts, cum: rev ? cum.map(c => len - c).reverse() : cum, len, sp: cell * (1.2 + r() * 1.6), ph: r() * 50 });
      });
    });
  }
  const at = (p, s) => { s = clamp(s, 0, p.len); let i = 1; while (i < p.cum.length - 1 && p.cum[i] < s) i++; const k = (s - p.cum[i - 1]) / ((p.cum[i] - p.cum[i - 1]) || 1); return [lerp(p.pts[i - 1][0], p.pts[i][0], k), lerp(p.pts[i - 1][1], p.pts[i][1], k)]; };
  return (g, w, h, t, A, o) => {
    if (key !== w + 'x' + h) { key = w + 'x' + h; build(w, h); }
    const md = mode(w, h, o.mini);
    g.globalAlpha = A; glow(g, w * .7, h * .4, Math.max(w, h) * .7, 'azure', .13);
    // traces
    g.lineWidth = 1.6; g.lineJoin = 'round'; g.strokeStyle = rgba('azure', .24); g.beginPath();
    for (const p of paths) { g.moveTo(p.pts[0][0], p.pts[0][1]); for (let s = 1; s < p.pts.length; s++) g.lineTo(p.pts[s][0], p.pts[s][1]); }
    g.stroke();
    g.fillStyle = rgba('navy', 1); g.strokeStyle = rgba('azure', .55); g.lineWidth = 1.4;
    for (const n of nodes) { g.beginPath(); g.arc(n.x, n.y, 4, 0, TAU); g.fill(); g.stroke(); }
    // packets: a gold head with a fading tail; a ring opens on the node it reaches
    for (const p of paths) {
      const gap = p.len * .7, s = (t * p.sp + p.ph) % (p.len + gap);
      if (s < p.len) {
        for (let k = 7; k >= 0; k--) { const [x, y] = at(p, s - k * cell * .16); g.globalAlpha = A * (1 - k / 8) * .9; g.fillStyle = rgba(k ? 'goldsoft' : 'ivory', 1); g.beginPath(); g.arc(x, y, k ? 2 : 2.8, 0, TAU); g.fill(); }
        const [x, y] = at(p, s); g.globalAlpha = A; glow(g, x, y, 12, 'gold', .45);
      } else {
        const u = (s - p.len) / gap, [x, y] = p.pts[p.pts.length - 1];
        g.globalAlpha = A * (1 - u) * .7; g.strokeStyle = rgba('gold', 1); g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 4 + u * cell * .9, 0, TAU); g.stroke();
      }
    }
    // VM windows: a stack that keeps booting at the front and drifting back
    const ww = md === 'mini' ? w * .4 : clamp(w * .22, 130, 300), wh = ww * .64;
    const [ax, ay] = md === 'wide' ? [w * .8, h * .6] : md === 'tall' ? [w * .6, h * .8] : [w * .68, h * .55];
    const N = 4, list = [];
    for (let k = 0; k < N; k++) list.push(fract(t * .07 + k / N));
    list.sort((a, b) => b - a).forEach(u => {
      const x = ax - ww / 2 + lerp(ww * .22, -ww * .22, u), y = ay - wh / 2 + lerp(wh * .32, -wh * .42, u), a = A * Math.sin(Math.PI * u) * (1 - u * .35);
      g.globalAlpha = a; g.fillStyle = rgba('navy', .88); rr(g, x, y, ww, wh, 9); g.fill();
      g.strokeStyle = rgba('goldsoft', .6); g.lineWidth = 1.4; g.stroke();
      g.fillStyle = rgba('deep', .55); rr(g, x, y, ww, wh * .16, [9, 9, 0, 0]); g.fill();
      ['pink', 'gold', 'ivory'].forEach((c, i) => { g.fillStyle = rgba(c, .9); g.beginPath(); g.arc(x + 12 + i * 11, y + wh * .08, 3, 0, TAU); g.fill(); });
      for (let j = 0; j < 4; j++) { const bw = ww * .7 * (.35 + .65 * (.5 + .5 * Math.sin(t * .9 + j * 1.7 + u * 9))); g.fillStyle = rgba(j ? 'azure' : 'goldsoft', j ? .45 : .7); rr(g, x + 12, y + wh * (.27 + j * .13), bw, wh * .06, 3); g.fill(); }
      g.fillStyle = rgba('ivory', .15); rr(g, x + 12, y + wh * .84, ww - 24, wh * .06, 3); g.fill();
      g.fillStyle = rgba('gold', .8); rr(g, x + 12, y + wh * .84, (ww - 24) * smooth(u * 1.6), wh * .06, 3); g.fill();
    });
    g.globalAlpha = 1;
  };
}

/* ---- lockout: key into a pin tumbler, push-to-start ring, programmer handshake ---- */
function makeLock() {
  const BITS = [.75, .25, .9, .45, .6];
  return (g, w, h, t, A, o) => {
    const md = mode(w, h, o.mini), m = Math.min(w, h);
    const [ox, oy, L] = md === 'wide' ? [w * .05, h * .84, clamp(w * .34, 300, 520)] : md === 'tall' ? [w * .06, h * .72, w * .88] : [w * .05, h * .5, w * .5];
    g.globalAlpha = A; glow(g, ox + L * .5, oy, L * 1.1, 'deep', .32);
    // geometry
    const ph = fract(t / 6.5), k = ph < .4 ? smooth(ph / .4) : ph < .66 ? 1 : 1 - smooth((ph - .66) / .34);
    const align = smooth((k - .93) / .07) * (ph < .7 ? 1 : 0);
    const pH = L * .17, py0 = oy, py1 = oy + pH, top = oy - L * .22, cw = L * .075;
    const xs = BITS.map((_, i) => ox + L * (.2 + .15 * i));
    const tipF = ox + L * .95, tipX = lerp(ox - L * .02, tipF, k), rest = py1 - L * .045;
    const depth = b => py0 + L * (.025 + .07 * b);           // key top under pin i at full insertion
    const knots = [[0, py1 - L * .02]];                       // [distance from tip, y of the blade top]
    xs.slice().reverse().forEach((x, j) => { const i = xs.length - 1 - j, d = tipF - x, y = depth(BITS[i]); knots.push([d - L * .012, y], [d + L * .012, y]); if (i) knots.push([d + L * .075, Math.min(y, depth(BITS[i - 1])) - L * .02]); });
    knots.push([tipF - xs[0] + L * .1, py0 + L * .03], [L * 1.4, py0 + L * .03]);
    const keyTop = u => { if (u <= 0) return py1; for (let i = 1; i < knots.length; i++) if (u <= knots[i][0]) { const [u0, y0] = knots[i - 1], [u1, y1] = knots[i]; return lerp(y0, y1, (u - u0) / (u1 - u0)); } return knots[knots.length - 1][1]; };
    // housing and plug
    g.fillStyle = rgba('navy', .7); g.strokeStyle = rgba('goldsoft', .35); g.lineWidth = 1.5;
    rr(g, ox, top, L, py0 - top, [10, 10, 0, 0]); g.fill(); g.stroke();
    g.fillStyle = rgba('deep', .38); rr(g, ox, py0, L, pH, [0, 0, 10, 10]); g.fill(); g.stroke();
    // shear line, which lights up when every pin sits on it
    g.setLineDash([6, 6]); g.strokeStyle = rgba('ivory', .3 + .5 * align); g.lineWidth = 1.2 + align * 1.5; g.beginPath(); g.moveTo(ox - 6, py0); g.lineTo(ox + L + 6, py0); g.stroke(); g.setLineDash([]);
    if (align > .01) { g.globalAlpha = A * align; glow(g, ox + L * .5, py0, L * .6, 'gold', .25); g.globalAlpha = A; }
    // pins
    xs.forEach((x, i) => {
      g.fillStyle = rgba('ink', .85); g.fillRect(x - cw / 2 - 2, top + 4, cw + 4, py1 - top - pH * .45);
      const under = tipX > x - cw / 2, bot = under ? Math.min(rest, keyTop(tipX - x)) : rest, kp = depth(BITS[i]) - py0, dp = L * .075;
      const kTop = bot - kp, dTop = kTop - dp;
      g.fillStyle = rgba('azure', .85); rr(g, x - cw / 2, kTop, cw, kp, [2, 2, cw / 2, cw / 2]); g.fill();
      g.fillStyle = rgba('gold', .9); rr(g, x - cw / 2, dTop, cw, dp - 1, 2); g.fill();
      g.strokeStyle = rgba('ivory', .55); g.lineWidth = 1.1; g.beginPath(); g.moveTo(x, top + 4);
      const coils = 6; for (let c = 1; c <= coils; c++) g.lineTo(x + (c % 2 ? cw * .4 : -cw * .4), lerp(top + 4, dTop, c / coils));
      g.lineTo(x, dTop); g.stroke();
    });
    // the key: blade profile from the tip back, then the bow
    g.save(); g.beginPath(); g.rect(ox - L * .5, top - L, L * 1.5 + 6, L * 2); g.clip();
    g.beginPath(); g.moveTo(tipX, py1 - L * .015);
    const BL = L * 1.02, bx = tipX - BL - L * .1, by = (py0 + py1) / 2;
    for (let u = 0; u <= BL; u += L * .008) g.lineTo(tipX - u, keyTop(u));
    g.lineTo(tipX - BL, py1 - L * .015); g.closePath();
    g.fillStyle = rgba('cream', .55); g.fill(); g.strokeStyle = rgba('goldsoft', .85); g.lineWidth = 1.4; g.stroke();
    g.beginPath(); g.arc(bx, by, L * .13, 0, TAU); g.arc(bx - L * .04, by, L * .04, 0, TAU, true); g.fillStyle = rgba('cream', .5); g.fill('evenodd'); g.stroke();
    g.restore();
    // push-to-start ring
    const [sx, sy, R] = md === 'wide' ? [w * .64, h * .25, clamp(m * .075, 34, 72)] : md === 'tall' ? [w * .8, h * .21, clamp(m * .1, 30, 54)] : [w * .82, h * .3, m * .17];
    for (let j = 0; j < 3; j++) { const u = fract(t * .32 + j / 3); g.globalAlpha = A * (1 - u) * (.45 + .4 * align); g.strokeStyle = rgba('gold', 1); g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, R * (1 + u * 1.5), 0, TAU); g.stroke(); }
    g.globalAlpha = A; glow(g, sx, sy, R * 1.6, 'goldsoft', .12 + .25 * align);
    g.fillStyle = rgba('navy', .9); g.beginPath(); g.arc(sx, sy, R, 0, TAU); g.fill();
    g.strokeStyle = rgba('ivory', .7); g.lineWidth = 2; g.stroke();
    g.strokeStyle = rgba('goldsoft', .5 + .5 * align); g.lineWidth = 1.2; g.beginPath(); g.arc(sx, sy, R * .86, 0, TAU); g.stroke();
    g.strokeStyle = rgba('gold', .75 + .25 * align); g.lineWidth = Math.max(2, R * .06); g.lineCap = 'round';
    g.beginPath(); g.arc(sx, sy - R * .08, R * .3, -Math.PI / 2 + .7, -Math.PI / 2 - .7 + TAU); g.stroke();
    g.beginPath(); g.moveTo(sx, sy - R * .48); g.lineTo(sx, sy - R * .14); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = rgba('cream', .8); g.font = `600 ${Math.round(R * .15)}px "Cormorant Garamond", Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('START  STOP', sx, sy + R * .5); g.textAlign = 'left';
    // programmer <-> fob handshake along an arc, with bytes drifting up
    const [hx, hy, D] = md === 'wide' ? [w * .8, h * .84, clamp(m * .14, 60, 140)] : md === 'tall' ? [w * .5, h * .92, w * .3] : [w * .78, h * .8, m * .2];
    const P = [hx - D, hy], F = [hx + D, hy], Q = [hx, hy - D * .9];
    const bez = u => [lerp(lerp(P[0], Q[0], u), lerp(Q[0], F[0], u), u), lerp(lerp(P[1], Q[1], u), lerp(Q[1], F[1], u), u)];
    g.setLineDash([3, 6]); g.strokeStyle = rgba('azure', .45); g.lineWidth = 1.4; g.beginPath(); g.moveTo(...P); g.quadraticCurveTo(...Q, ...F); g.stroke(); g.setLineDash([]);
    for (let j = 0; j < 3; j++) { const u = fract(t * .45 + j / 3), [x, y] = bez(u); g.globalAlpha = A * Math.sin(Math.PI * u); g.fillStyle = rgba('goldsoft', 1); g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); }
    { const u = fract(t * .45 + .5), [x, y] = bez(1 - u); g.globalAlpha = A * Math.sin(Math.PI * u); g.fillStyle = rgba('pink', 1); g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill(); }
    const bytes = ['0x3A', 'ACK', '0x7F', '0xC4', 'SYN'];
    g.font = `${Math.round(clamp(D * .14, 10, 15))}px ui-monospace, Menlo, Consolas, monospace`; g.textAlign = 'center';
    bytes.forEach((b, j) => { const u = fract(t * .16 + j / bytes.length); g.globalAlpha = A * Math.sin(Math.PI * u) * .7; g.fillStyle = rgba('cream', 1); g.fillText(b, hx + Math.sin(j * 2.3 + t * .4) * D * .5, hy - D * .55 - u * D * .9); });
    g.textAlign = 'left'; g.globalAlpha = A;
    // programmer box and fob
    g.fillStyle = rgba('navy', .92); g.strokeStyle = rgba('goldsoft', .6); g.lineWidth = 1.4;
    rr(g, P[0] - D * .32, P[1] - D * .2, D * .64, D * .44, 6); g.fill(); g.stroke();
    g.fillStyle = rgba('azure', .35 + .2 * Math.sin(t * 2)); rr(g, P[0] - D * .24, P[1] - D * .13, D * .48, D * .2, 3); g.fill();
    g.fillStyle = rgba('navy', .92); rr(g, F[0] - D * .14, F[1] - D * .24, D * .28, D * .46, D * .12); g.fill(); g.stroke();
    g.fillStyle = rgba('gold', .8); g.beginPath(); g.arc(F[0], F[1] - D * .06, D * .06, 0, TAU); g.fill();
    g.globalAlpha = 1;
  };
}

/* ---- Extropian: swing arc, Bluetooth sensor pulses, data streaming into a cloud database ---- */
function makeExt() {
  const A0 = -0.6, ATOP = Math.PI + .9, AIMP = Math.PI / 2;
  // club-head angle and visibility through one swing (address, back, top, down, through, fade)
  const swing = p => {
    if (p < .12) return [AIMP, smooth(p / .06)];
    if (p < .55) return [lerp(AIMP, ATOP, smooth((p - .12) / .43)), 1];
    if (p < .62) return [ATOP, 1];
    if (p < .74) { const u = (p - .62) / .12; return [lerp(ATOP, AIMP, u * u), 1]; }
    if (p < .88) { const u = (p - .74) / .14; return [lerp(AIMP, A0, 1 - (1 - u) * (1 - u)), 1]; }
    return [A0, 1 - smooth((p - .88) / .1)];
  };
  return (g, w, h, t, A, o) => {
    const md = mode(w, h, o.mini), m = Math.min(w, h);
    const [cx, cy, R] = md === 'wide' ? [w * .74, h * .56, clamp(m * .27, 130, 280)] : md === 'tall' ? [w * .5, h * .58, w * .36] : [w * .3, h * .5, m * .36];
    const [dx, dy, dR] = md === 'wide' ? [w * .3, h * .24, clamp(m * .06, 30, 56)] : md === 'tall' ? [w * .7, h * .2, w * .09] : [w * .78, h * .22, m * .1];
    const arc = a => [cx + Math.cos(a) * R, cy + Math.sin(a) * R * .86];
    g.globalAlpha = A; glow(g, cx, cy + R * .4, R * 2.2, 'azure', .14); glow(g, dx, dy, dR * 4, 'blue', .16);
    // swing plane
    g.setLineDash([2, 7]); g.strokeStyle = rgba('azure', .35); g.lineWidth = 1.4; g.beginPath();
    for (let a = A0; a <= ATOP + .001; a += .05) { const [x, y] = arc(a); a === A0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke(); g.setLineDash([]);
    // data stream: points peel off the arc and rise to the database
    for (let i = 0; i < 44; i++) {
      const u = fract(t * .16 + i / 44), a0 = lerp(A0, ATOP, fract(i * .618)), [x0, y0] = arc(a0);
      const qx = lerp(x0, dx, .5) + Math.sin(i * 1.7) * R * .4, qy = Math.min(y0, dy) - R * .15;
      const x = lerp(lerp(x0, qx, u), lerp(qx, dx, u), u), y = lerp(lerp(y0, qy, u), lerp(qy, dy, u), u);
      g.globalAlpha = A * Math.sin(Math.PI * u) * .8; g.fillStyle = rgba(['azure', 'goldsoft', 'ivory'][i % 3], 1);
      const s = 1.6 + (i % 4) * .5; g.fillRect(x - s, y - s, s * 2, s * 2);
    }
    // club head, shaft and trail
    const p = fract(t / 4.2), [a, vis] = swing(p);
    for (let k = 14; k >= 1; k--) { const [ak, vk] = swing(fract((t - k * .025) / 4.2)), [x, y] = arc(ak); g.globalAlpha = A * vis * vk * (1 - k / 15) * .7; g.fillStyle = rgba('goldsoft', 1); g.beginPath(); g.arc(x, y, 3.2 * (1 - k / 18), 0, TAU); g.fill(); }
    const [hx, hy] = arc(a);
    g.globalAlpha = A * vis * .35; g.strokeStyle = rgba('ivory', 1); g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(hx, hy); g.stroke();
    g.globalAlpha = A * vis; glow(g, hx, hy, 18, 'gold', .5); g.fillStyle = rgba('ivory', 1); g.beginPath(); g.arc(hx, hy, 4.5, 0, TAU); g.fill();
    // impact: a small pink ring at the bottom of the arc
    const imp = Math.exp(-Math.pow((p - .745) * 22, 2));
    if (imp > .01) { const [ix, iy] = arc(AIMP); g.globalAlpha = A * imp; g.strokeStyle = rgba('pink', 1); g.lineWidth = 2; g.beginPath(); g.arc(ix, iy, 8 + (1 - imp) * 22, 0, TAU); g.stroke(); }
    // Bluetooth sensor at the grip, pulsing arcs both ways
    for (let j = 0; j < 3; j++) {
      const u = fract(t * .6 + j / 3), r = 10 + u * R * .32; g.globalAlpha = A * (1 - u) * .7; g.strokeStyle = rgba('azure', 1); g.lineWidth = 1.6;
      g.beginPath(); g.arc(cx, cy, r, -.55, .55); g.stroke(); g.beginPath(); g.arc(cx, cy, r, Math.PI - .55, Math.PI + .55); g.stroke();
    }
    g.globalAlpha = A; glow(g, cx, cy, 16, 'gold', .5); g.fillStyle = rgba('navy', 1); g.strokeStyle = rgba('gold', 1); g.lineWidth = 2; rr(g, cx - 7, cy - 7, 14, 14, 4); g.fill(); g.stroke();
    // cloud + database
    g.globalAlpha = A; [[-.9, .25, 1.1], [0, -.2, 1.5], [.9, .2, 1.1]].forEach(([u, v, s]) => glow(g, dx + u * dR, dy + v * dR, dR * s, 'ivory', .1));
    const pulse = .5 + .5 * Math.sin(t * 2.6);
    for (let j = 2; j >= 0; j--) {
      const y = dy + (j - 1) * dR * .42;
      g.fillStyle = rgba('navy', .92); g.strokeStyle = rgba('ivory', .7); g.lineWidth = 1.4;
      g.beginPath(); g.ellipse(dx, y + dR * .2, dR, dR * .32, 0, 0, Math.PI); g.lineTo(dx - dR, y); g.ellipse(dx, y, dR, dR * .32, 0, Math.PI, TAU); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(dx, y, dR, dR * .32, 0, 0, TAU); g.strokeStyle = rgba(j ? 'ivory' : 'gold', j ? .5 : .55 + .4 * pulse); g.stroke();
    }
    // swing metrics as live bars beside the database
    for (let j = 0; j < 5; j++) {
      const bh = dR * (.3 + .7 * (.5 + .5 * Math.sin(t * .9 + j * 1.3))), bx = dx + dR * 1.5 + j * dR * .24;
      g.fillStyle = rgba(j === 2 ? 'goldsoft' : 'azure', .6); rr(g, bx, dy + dR * .55 - bh, dR * .14, bh, 2); g.fill();
    }
    g.globalAlpha = 1;
  };
}

/* ---- Safe Ship: call lines streaming in as waveforms, folding into transcripts + analysis tags, a database whose
   monthly bill drops to about half (the ~$6k/month cut Daniel made) ---- */
function makeSSM() {
  return (g, w, h, t, A, o) => {
    const md = mode(w, h, o.mini), m = Math.min(w, h);
    const [x0, x1, y0, gap] = md === 'wide' ? [w * .04, w * .46, h * .14, clamp(m * .045, 24, 44)] : md === 'tall' ? [w * .04, w * .7, h * .8, w * .07] : [w * .06, w * .55, h * .28, h * .12];
    const [dx, dy, dR] = md === 'wide' ? [w * .58, h * .2, clamp(m * .05, 26, 48)] : md === 'tall' ? [w * .82, h * .84, w * .06] : [w * .7, h * .5, m * .1];
    g.globalAlpha = A; glow(g, (x0 + x1) / 2, y0 + gap * 1.5, (x1 - x0) * .8, 'blue', .14); glow(g, dx, dy, dR * 4, 'azure', .12);
    // 4 call lines: a waveform scrolls right; it flattens into transcript dashes as it reaches the pipe
    for (let L = 0; L < 4; L++) {
      const y = y0 + L * gap, ph = L * 1.9, live = .5 + .5 * Math.sin(t * .5 + L * 1.3);
      g.strokeStyle = rgba(L % 2 ? 'azure' : 'goldsoft', .85); g.lineWidth = 1.6; g.globalAlpha = A * (.45 + .55 * live);
      g.beginPath();
      for (let x = x0; x <= x1; x += 3) {
        const u = (x - x0) / (x1 - x0), env = Math.pow(Math.max(0, Math.sin((x * .021 - t * 2.2 + ph))), 2) * (1 - smooth((u - .55) / .3));
        const a = gap * .32 * env * (Math.sin(x * .31 + t * 9 + ph) * .6 + Math.sin(x * .13 - t * 5) * .4);
        x === x0 ? g.moveTo(x, y + a) : g.lineTo(x, y + a);
      }
      g.stroke();
      // transcript words after the fold, with analysis tags lighting up
      for (let k = 0; k < 6; k++) {
        const u = fract(t * .12 + k / 6 + L * .17), x = lerp(x0 + (x1 - x0) * .62, dx - dR * 1.6, u), wd = gap * (.35 + .3 * fract(k * .618 + L * .3));
        g.globalAlpha = A * Math.sin(Math.PI * u) * .9; g.fillStyle = rgba(k % 3 === 1 ? 'pink' : k % 3 ? 'ivory' : 'gold', 1); rr(g, x, y - 2, wd, 4, 2); g.fill();
      }
      g.globalAlpha = A; glow(g, x0, y, 10, 'gold', .6);
    }
    // database stack
    for (let j = 2; j >= 0; j--) {
      const y = dy + (j - 1) * dR * .42;
      g.globalAlpha = A; g.fillStyle = rgba('navy', .92); g.strokeStyle = rgba('ivory', .7); g.lineWidth = 1.4;
      g.beginPath(); g.ellipse(dx, y + dR * .2, dR, dR * .32, 0, 0, Math.PI); g.lineTo(dx - dR, y); g.ellipse(dx, y, dR, dR * .32, 0, Math.PI, TAU); g.closePath(); g.fill(); g.stroke();
    }
    // monthly bill: bars step down to about half at the cut, then stay there
    const n = 10, bw = dR * .34, bx0 = dx + dR * 1.6, base = dy + dR * .7, cut = 5, roll = fract(t / 10) * n;
    for (let i = 0; i < n; i++) {
      const hgt = dR * 2.2 * (i < cut ? 1 - .03 * Math.sin(i * 2.1) : .52 + .02 * Math.sin(i * 1.7)), on = smooth(roll - i);
      g.globalAlpha = A * (.25 + .75 * on); g.fillStyle = rgba(i < cut ? 'azure' : 'goldsoft', .75); rr(g, bx0 + i * bw * 1.35, base - hgt * on, bw, hgt * on, 2); g.fill();
    }
    if (roll > cut + .5) { const k = smooth(roll - cut - .5); g.globalAlpha = A * k; g.fillStyle = rgba('goldsoft', 1); g.font = `600 ${Math.round(dR * .42)}px ${getComputedStyle(document.body).fontFamily}`; g.fillText('−$6k / month', bx0 + cut * bw * 1.35, base - dR * 1.5); }
    g.globalAlpha = 1;
  };
}

const MAKERS = { ssm: makeSSM, edit: makeEdit, it: makeIT, lock: makeLock, ext: makeExt };

/* ================= wiring ================= */
// v11: the full-screen themed backdrop (#vtBg) is gone so the cloud sea stays one continuous world; it still runs if a page has it
const canvas = document.getElementById('vtBg'), g = canvas && canvas.getContext('2d');
const section = document.getElementById('experience'), list = root.querySelector('.vt-list'), fill = root.querySelector('.vt-fill');
const video = root.querySelector('.vt-reel');
const items = [...root.querySelectorAll('.vt-item')].map(el => ({ el, card: el.querySelector('.vt-card'), id: el.dataset.theme, bg: MAKERS[el.dataset.theme](), f: -1 }));
// card visuals: plate (or ProjectViz) when available, else a live emblem of the theme
items.forEach(it => {
  const img = it.el.querySelector('.vt-plate'), em = it.el.querySelector('.vt-emblem');
  if (!em) return;
  it.emblem = { c: em, g: em.getContext('2d'), draw: MAKERS[it.id]() };
  if (!img) return;
  const ok = () => { it.el.classList.add('has-plate'); it.emblem = null; if (window.ProjectViz && img.dataset.viz) { try { ProjectViz.mount(em, img.dataset.viz, (window.V9_BASE || '') + '../../assets/projects'); it.el.classList.add('has-viz'); } catch (e) {} } };
  const bad = () => img.remove();
  if (img.complete) img.naturalWidth ? ok() : bad(); else { img.addEventListener('load', ok); img.addEventListener('error', bad); }
});

let W = 0, H = 0;
function resize() {
  W = innerWidth; H = innerHeight;
  if (canvas) { canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR); }
}
resize(); addEventListener('resize', resize);
if (reduce && video) { video.removeAttribute('autoplay'); video.controls = true; }

let shown = true;
function frame(now) {
  requestAnimationFrame(frame);
  const t = reduce ? 2.4 : now / 1000;
  const sr = section.getBoundingClientRect();
  const presence = smooth((H - sr.top) / (H * .6)) * smooth((sr.bottom - H * .35) / (H * .45));
  if (presence <= 0) {
    if (shown) { if (canvas) { g.clearRect(0, 0, canvas.width, canvas.height); canvas.style.visibility = 'hidden'; } shown = false; if (video && !video.paused) video.pause(); }
    return;
  }
  if (!shown) { if (canvas) canvas.style.visibility = 'visible'; shown = true; }
  // focus: distance of each card's centre from the viewport centre, in viewport heights
  const ds = items.map(it => { const r = it.card.getBoundingClientRect(); return (r.top + r.height / 2 - H / 2) / H; });
  items.forEach((it, i) => {
    const f = +(1 - smooth(Math.abs(ds[i]) / .5)).toFixed(3);
    if (f !== it.f) { it.f = f; it.el.style.setProperty('--f', f); it.el.classList.toggle('is-focus', f > .6); }
  });
  const lr = list.getBoundingClientRect();
  fill.style.transform = `scaleY(${clamp((H * .5 - lr.top) / lr.height).toFixed(4)})`;
  // background weights: the first theme holds above the list, the last below it, so one is always fully there
  const wts = ds.map((d, i) => { if (i === 0) d = Math.min(d, 0); if (i === ds.length - 1) d = Math.max(d, 0); return smooth(1 - Math.abs(d) / .55); });
  const sum = wts.reduce((a, b) => a + b, 0) || 1;
  if (canvas) { g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H); }
  if (canvas) items.forEach((it, i) => { const a = presence * wts[i] / Math.max(1, sum) * (W < 820 ? .55 : 1); /* quieter behind the stacked phone layout */ if (a > .004) { g.save(); it.bg(g, W, H, t, a, { video }); g.restore(); } });
  // the reel plays while its entry or theme is on screen
  if (video && !reduce) {
    const ei = items.findIndex(it => it.id === 'edit'), want = ei >= 0 && (wts[ei] > .01 || Math.abs(ds[ei]) < .9);
    if (want && video.paused) video.play().catch(() => {}); else if (!want && !video.paused) video.pause();
  }
  // emblems for entries without a plate, only when near the viewport
  items.forEach((it, i) => {
    const e = it.emblem; if (!e || Math.abs(ds[i]) > 1.1) return;
    const w = e.c.clientWidth, h = e.c.clientHeight; if (!w) return;
    if (e.c.width !== Math.round(w * DPR)) { e.c.width = Math.round(w * DPR); e.c.height = Math.round(h * DPR); }
    e.g.setTransform(DPR, 0, 0, DPR, 0, 0);
    const bgr = e.g.createLinearGradient(0, 0, 0, h); bgr.addColorStop(0, '#0a1638'); bgr.addColorStop(1, '#1d3c86');
    e.g.fillStyle = bgr; e.g.fillRect(0, 0, w, h);
    e.g.save(); e.draw(e.g, w, h, t, 1, { mini: true, video }); e.g.restore();
  });
}
requestAnimationFrame(frame);
})();
