/* Project + job cards: a pastel rotoscoped plate (Codex, prompts in ./prompts) with a live hand-drawn
   analysis layer on top, in the same node/annotation language as the golf card (drafts/v9-night/golf.js).
   UI-independent: ProjectViz.mount(canvas, id, { base }) where base is the path to assets/projects.
   ids: flow digits house compiler sync it lock extropian. Pixel data (corners, digit grid) comes from
   data.js (tools/projects_data.py), since getImageData is blocked over file://.
   Motion is continuous: every wobble is smooth noise in (stroke index, time), never re-drawn on twos. */
window.ProjectViz = (() => {
  const INK = '#22345e', GOLD = '#ffd98a', AMBER = '#e9b85a', PINK = '#e0679a', ROSE = '#b8457d',
    BLUE = '#3f5fb8', SKY = '#7fb6ff', LAV = '#6a52c9', IVORY = '#fff3c4', WHITE = '#ffffff';
  const PASTEL = [SKY, WHITE, GOLD, '#a9c8ff', '#5f8fe0'];
  const HAND = '"Gochi Hand", "Patrick Hand", cursive', MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  const D = () => window.PROJECT_DATA || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // seeded random for stable layouts
  const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function mount(canvas, id, opt = {}) {
    const base = typeof opt === 'string' ? opt : opt.base || '.';
    const ctx = canvas.getContext('2d');
    const plate = new Image();
    let W = 0, H = 0, k = 1, ox = 0, oy = 0, dw = 0, dh = 0, t = 0, n = 0, playing = true, raf = 0, t0 = performance.now();
    const fit = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const s = Math.max(W / 1536, H / 1024); dw = 1536 * s; dh = 1024 * s; ox = (W - dw) / 2; oy = (H - dh) / 2;
      k = Math.max(.8, Math.min(W, H * 1.5) / 640);
      if (!plate.src) plate.src = `${base}/${id}/plate${W * d > 900 ? '' : '-768'}.webp`;
      if (reduce) frame();
    };
    // plate space (0..1) -> canvas
    const Q = (x, y) => [ox + x * dw, oy + y * dh];

    // ---- shared hand-drawn primitives (smooth wobble) ----
    const nz = () => { n++; return Math.sin(n * 1.71 + t * 2.3) * .45 + Math.sin(n * .37 - t * 3.1 + 1.3) * .35 + Math.sin(n * .113 + t * 1.2) * .2; };
    const j = (a = 1.4) => nz() * a;
    function line(x1, y1, x2, y2, color, w = 2.4, bend = 4) {
      for (let p = 0; p < 2; p++) {
        ctx.strokeStyle = color; ctx.lineWidth = (w - p * .8) * k; ctx.globalAlpha *= p ? .55 : 1;
        ctx.beginPath(); ctx.moveTo(x1 + j(), y1 + j());
        ctx.quadraticCurveTo((x1 + x2) / 2 + j(bend), (y1 + y2) / 2 + j(bend), x2 + j(), y2 + j()); ctx.stroke();
        if (p) ctx.globalAlpha /= .55;
      }
    }
    function poly(pts, color, w = 2.4) {
      ctx.strokeStyle = color; ctx.lineWidth = w * k; ctx.lineCap = ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x + j(.8), y + j(.8))); ctx.stroke();
    }
    function dot(x, y, r, fill, ink = INK) {
      ctx.fillStyle = fill; ctx.beginPath();
      for (let a = 0; a <= 6.4; a += .5) { const rr = r * k + j(1.1); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      ctx.fill(); if (ink) { ctx.strokeStyle = ink; ctx.lineWidth = 1.5 * k; ctx.stroke(); }
    }
    function ring(x, y, r, color, w = 2, a0 = 0, a1 = 6.29) {
      ctx.strokeStyle = color; ctx.lineWidth = w * k; ctx.beginPath();
      for (let a = a0; a <= a1 + .001; a += .25) { const rr = r + j(1.2); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      ctx.stroke();
    }
    function hand(text, x, y, size = 16, color = INK, rot = 0, align = 'left') {
      ctx.save(); ctx.translate(x + j(.6), y + j(.6)); ctx.rotate(rot + j(.015));
      ctx.font = `${size * k}px ${HAND}`; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(text, 0, 0); ctx.restore();
    }
    function mono(text, x, y, size = 10, color = INK, align = 'left') {
      ctx.font = `600 ${size * k}px ${MONO}`; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.textAlign = 'left';
    }
    // label with a soft ivory backing so it reads on any part of the plate
    function chip(text, x, y, size = 15, color = INK, fill = 'rgba(255,248,226,.86)', align = 'left') {
      ctx.font = `${size * k}px ${HAND}`; const w = ctx.measureText(text).width, h = size * k;
      const lx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      ctx.fillStyle = fill; ctx.beginPath();
      ctx.moveTo(lx - 6 * k + j(), y - h * .95 + j()); ctx.lineTo(lx + w + 6 * k + j(), y - h + j());
      ctx.lineTo(lx + w + 5 * k + j(), y + h * .32 + j()); ctx.lineTo(lx - 7 * k + j(), y + h * .3 + j()); ctx.fill();
      hand(text, lx, y, size, color);
    }
    // phase sticker, top-left like the golf card
    function sticker(tag) {
      if (!tag) return;
      ctx.save(); ctx.translate(14 * k, 30 * k); ctx.rotate(-.05 + j(.01));
      ctx.font = `${20 * k}px ${HAND}`; const w = ctx.measureText(tag).width;
      ctx.fillStyle = '#fff0b8'; ctx.beginPath(); ctx.moveTo(-6 * k + j(), -22 * k + j()); ctx.lineTo(w + 10 * k + j(), -24 * k + j());
      ctx.lineTo(w + 8 * k + j(), 9 * k + j()); ctx.lineTo(-8 * k + j(), 7 * k + j()); ctx.fill();
      ctx.restore(); hand(tag, 18 * k, 34 * k, 20, INK, -.05);
    }
    function arrow(x1, y1, x2, y2, color, w = 2) {
      line(x1, y1, x2, y2, color, w, 1.5);
      const a = Math.atan2(y2 - y1, x2 - x1), L = 7 * k;
      line(x2, y2, x2 - Math.cos(a - .5) * L, y2 - Math.sin(a - .5) * L, color, w, 0);
      line(x2, y2, x2 - Math.cos(a + .5) * L, y2 - Math.sin(a + .5) * L, color, w, 0);
    }
    // a point travelling along a quadratic path, u in 0..1
    const qpt = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
    function qcurve(a, c, b, color, w = 2, dash = null) {
      ctx.strokeStyle = color; ctx.lineWidth = w * k; if (dash) ctx.setLineDash(dash.map(v => v * k));
      ctx.beginPath(); ctx.moveTo(a[0] + j(), a[1] + j()); ctx.quadraticCurveTo(c[0] + j(3), c[1] + j(3), b[0] + j(), b[1] + j()); ctx.stroke(); ctx.setLineDash([]);
    }

    // ---- per-project layers ----
    const R = {};

    /* Optical Flow Tracker: Shi-Tomasi corners baked from the plate, tracked as the hand waves (the KLT script
       draws exactly this: points + trails). A scan bar sweeps across; points it passes print their flow vector.
       Every few seconds a forward-backward check rejects a track and it re-seeds. */
    {
      const C = (D().flow || {}).corners || [];
      const inHand = ([x, y]) => x > .1 && x < .56 && y > .14 && y < .95 && !(x > .45 && y < .3) && !(x < .28 && y < .34);
      const pivot = [.31, .92];
      const pos = ([x, y], hand, tt) => {
        if (hand) {
          const a = .085 * Math.sin(tt * 2.2) + .02 * Math.sin(tt * 5.1), dx = (x - pivot[0]) * 1.5, dy = y - pivot[1];
          return [pivot[0] + (dx * Math.cos(a) - dy * Math.sin(a)) / 1.5, pivot[1] + dx * Math.sin(a) + dy * Math.cos(a)];
        }
        return [x + .002 * Math.sin(tt * 1.3), y + .0015 * Math.sin(tt * 1.7 + 1)];   // a little camera shake
      };
      const pts = C.map((c, i) => ({ c, hand: inHand(c), i }));
      R.flow = () => {
        const scan = (t * .22) % 1.25 - .1;   // sweep 0..1 then rest
        let live = 0;
        const reject = Math.floor(t / 2.6) % Math.max(1, pts.length), rejU = (t / 2.6) % 1;
        ctx.lineCap = 'round';
        for (const p of pts) {
          const cur = pos(p.c, p.hand, t), [cx, cy] = Q(...cur);
          const rejected = p.i === reject && rejU < .45;
          if (p.hand) {
            const tr = []; for (let s = 0; s <= 8; s++) tr.push(Q(...pos(p.c, true, t - s * .045)));
            ctx.globalAlpha = .9; poly(tr, rejected ? PINK : GOLD, 2.6);
          }
          ctx.globalAlpha = 1;
          if (rejected) {
            line(cx - 6 * k, cy - 6 * k, cx + 6 * k, cy + 6 * k, PINK, 2.6, 0); line(cx + 6 * k, cy - 6 * k, cx - 6 * k, cy + 6 * k, PINK, 2.6, 0);
            const right = cx > W * .7; hand('fb error → re-seed', cx + (right ? -10 : 10) * k, cy - 8 * k, 14, ROSE, 0, right ? 'right' : 'left');
            continue;
          }
          live++;
          dot(cx, cy, p.hand ? 3.6 : 2.6, p.hand ? PASTEL[p.i % PASTEL.length] : 'rgba(255,255,255,.85)', p.hand ? INK : 'rgba(34,52,94,.6)');
          // numbers: the flow vector, printed while the scan bar is just past the point
          const since = scan - p.c[0];
          if (since > 0 && since < .2 && (p.hand ? p.i % 2 === 0 : p.i % 4 === 0)) {
            const prev = pos(p.c, p.hand, t - 1 / 30), vx = (cur[0] - prev[0]) * 1536, vy = (cur[1] - prev[1]) * 1024;
            ctx.globalAlpha = 1 - since / .2;
            mono(`${vx >= 0 ? '+' : ''}${vx.toFixed(1)},${vy >= 0 ? '+' : ''}${vy.toFixed(1)}`, cx + 5 * k, cy - 4 * k, 9.5, p.hand ? INK : 'rgba(34,52,94,.8)');
            ctx.globalAlpha = 1;
          }
        }
        // the LK window + pyramid levels around one tracked fingertip
        const tip = pts.filter(p => p.hand).sort((a, b) => a.c[1] - b.c[1])[0];
        if (tip) {
          const [x, y] = Q(...pos(tip.c, true, t));
          [1, 2, 4].forEach((s, L) => {
            const h = 10.5 * s * k;
            ctx.globalAlpha = .9 - L * .25; ctx.strokeStyle = L ? SKY : WHITE; ctx.lineWidth = 1.8 * k; ctx.setLineDash(L ? [4 * k, 4 * k] : []);
            ctx.strokeRect(x - h + j(.6), y - h + j(.6), h * 2, h * 2); ctx.setLineDash([]);
          });
          ctx.globalAlpha = 1; chip('21×21 window · 3 pyramid levels', x + 46 * k, y - 30 * k, 13, BLUE);
        }
        // scan bar
        if (scan > 0 && scan < 1) {
          const [sx] = Q(scan, 0), g = ctx.createLinearGradient(sx - 60 * k, 0, sx, 0);
          g.addColorStop(0, 'rgba(255,217,138,0)'); g.addColorStop(1, 'rgba(255,217,138,.32)');
          ctx.fillStyle = g; ctx.fillRect(sx - 60 * k, 0, 60 * k, H);
          line(sx, 0, sx, H, GOLD, 2.2, 2);
        }
        sticker('Lucas–Kanade');
        chip(`tracks ${live} · 30+ fps`, W - 14 * k, H - 14 * k, 15, BLUE, undefined, 'right');
      };
    }

    /* Digit Classifier: the drawn 7 resampled to MNIST's 28x28 (baked from the plate). A 3x3 kernel walks the
       grid, every cell it has read shows its pixel value, and the ten softmax bars settle on 7. */
    {
      const dg = D().digits || { crop: [.06, .06, .57, .88], grid: [] };
      const G = dg.grid, cells = 28 * 28;
      R.digits = () => {
        const [cx, cy, cw, ch] = dg.crop, [x0, y0] = Q(cx, cy), [x1, y1] = Q(cx + cw, cy + ch), cs = (x1 - x0) / 28, rs = (y1 - y0) / 28;
        const cyc = 9, u = (t % cyc) / cyc, read = ease(clamp(u / .72, 0, 1)) * cells, kr = Math.floor(read / 28), kc = Math.floor(read % 28);
        // grid
        ctx.strokeStyle = 'rgba(63,95,184,.22)'; ctx.lineWidth = 1;
        ctx.beginPath(); for (let i = 0; i <= 28; i++) { ctx.moveTo(x0 + i * cs, y0); ctx.lineTo(x0 + i * cs, y1); ctx.moveTo(x0, y0 + i * rs); ctx.lineTo(x1, y0 + i * rs); } ctx.stroke();
        // values of cells already read: ink cells always, blank cells only near the kernel (so it reads like a scan)
        const fs = Math.min(cs, rs) * .5;
        ctx.textAlign = 'center';
        for (let r = 0; r < 28; r++) for (let c = 0; c < 28; c++) {
          const idx = r * 28 + c; if (idx > read || !G[r]) continue;
          const v = G[r][c], near = Math.abs(r - kr) + Math.abs(c - kc) < 7;
          if (!v && !near) continue;
          const age = (read - idx) / 28;
          ctx.globalAlpha = v ? clamp(.55 + v / 400, 0, 1) * (age < 2 ? 1 : .85) : .45 * (1 - (Math.abs(r - kr) + Math.abs(c - kc)) / 7);
          if (v) { ctx.fillStyle = `rgba(255,217,138,${v / 600})`; ctx.fillRect(x0 + c * cs, y0 + r * rs, cs, rs); }
          ctx.font = `600 ${fs}px ${MONO}`; ctx.fillStyle = v > 140 ? IVORY : v ? INK : BLUE; ctx.fillText(v, x0 + (c + .5) * cs, y0 + (r + .68) * rs);
        }
        ctx.textAlign = 'left'; ctx.globalAlpha = 1;
        // the 3x3 kernel
        if (u < .72) {
          const kx = x0 + (kc - 1) * cs, ky = y0 + (kr - 1) * rs;
          ctx.fillStyle = 'rgba(127,182,255,.22)'; ctx.fillRect(kx, ky, cs * 3, rs * 3);
          ctx.strokeStyle = PINK; ctx.lineWidth = 2.4 * k; ctx.strokeRect(kx + j(.5), ky + j(.5), cs * 3, rs * 3);
          hand('3×3 conv', kx + cs * 3.4, ky - 4 * k, 14, ROSE);
        }
        // softmax: ten bars upper right; 7 grows with what has been read
        const [bx0, by1] = Q(.6, .33), bw = (Q(.96, 0)[0] - bx0) / 10, bh = by1 - Q(0, .07)[1];
        const conf = ease(clamp((u - .1) / .65, 0, 1));
        const rnd = rng(7);
        for (let d = 0; d < 10; d++) {
          const noise = .12 + .25 * rnd() * (1 - conf) * (.6 + .4 * Math.sin(t * 3 + d));
          const p = d === 7 ? .1 + .86 * conf : .03 + noise * (1 - conf * .85);
          const x = bx0 + d * bw + bw * .2, h = bh * p;
          ctx.fillStyle = d === 7 ? (conf > .9 ? AMBER : GOLD) : 'rgba(127,182,255,.75)';
          ctx.beginPath(); ctx.roundRect(x, by1 - h, bw * .6, h, 3 * k); ctx.fill();
          ctx.strokeStyle = INK; ctx.lineWidth = 1.4 * k; ctx.stroke();
          hand(String(d), x + bw * .3, by1 + 16 * k, 15, d === 7 ? ROSE : INK, 0, 'center');
        }
        hand('softmax', bx0, Q(0, .07)[1] - 6 * k, 15, BLUE);
        const done = u > .78;
        if (done) chip('it’s a 7', bx0 + bw * 7.3, by1 - bh * .98 - 8 * k, 17, ROSE, undefined, 'center');
        sticker(u < .72 ? 'reading 28 × 28' : 'prediction');
      };
    }

    /* Real Estate Predictor: the Madrid houses features pinned on the facade, and in the sky a price-vs-size
       scatter where three of the models from the notebooks take turns: linear, k-NN, random forest.
       The scatter is illustrative (no axis values), not the dataset itself. */
    {
      const rnd = rng(11), P = [];
      for (let i = 0; i < 46; i++) { const x = Math.pow(rnd(), 1.4); P.push([x, clamp(.12 + .62 * x + .1 * Math.sin(x * 9) + (rnd() - .5) * .22, .03, .97)]); }
      const tags = [['sq_mt_built', .1, .36], ['n_rooms', .36, .5], ['n_bathrooms', .22, .76], ['has_individual_heating', .5, .7]];
      const models = ['linear', 'k-NN', 'random forest'];
      R.house = () => {
        const [ax, ay] = Q(.56, .5), [bx, by] = Q(.96, .07), pw = bx - ax, ph = ay - by;
        const S = (x, y) => [ax + x * pw, ay - y * ph];
        // axes
        ctx.fillStyle = 'rgba(255,248,226,.5)'; ctx.beginPath(); ctx.roundRect(ax - 12 * k, by - 10 * k, pw + 22 * k, ph + 22 * k, 10 * k); ctx.fill();
        line(ax, ay, ax + pw, ay, INK, 2); line(ax, ay, ax, by, INK, 2);
        hand('m² built', ax + pw, ay + 18 * k, 14, INK, 0, 'right'); hand('log price', ax - 4 * k, by - 14 * k, 14, INK);
        P.forEach(([x, y], i) => dot(...S(x, y), 2.6, i % 5 ? SKY : WHITE));
        // model cycle
        const cyc = 4.2, m = Math.floor(t / cyc) % 3, u = (t % cyc) / cyc, draw = ease(clamp(u / .55, 0, 1));
        const f = x => {
          if (m === 0) return .14 + .6 * x;
          if (m === 1) { const nn = P.map(p => [Math.abs(p[0] - x), p[1]]).sort((a, b) => a[0] - b[0]).slice(0, 5); return nn.reduce((s, p) => s + p[1], 0) / 5; }
          const b = Math.min(7, Math.floor(x * 8)), xs = P.filter(p => Math.min(7, Math.floor(p[0] * 8)) === b);   // piecewise like a forest of shallow trees
          return xs.length ? xs.reduce((s, p) => s + p[1], 0) / xs.length : .14 + .6 * x;
        };
        const curve = []; for (let x = 0; x <= draw + .001; x += .02) curve.push(S(x, f(x)));
        ctx.globalAlpha = 1; if (curve.length > 1) poly(curve, m === 2 ? LAV : m === 1 ? PINK : AMBER, 3);
        // query house sliding along: its k nearest neighbours are linked
        const qx = .15 + .7 * (.5 + .5 * Math.sin(t * .6)), [qX, qY] = S(qx, f(qx));
        if (m === 1) P.map(p => [Math.abs(p[0] - qx), p]).sort((a, b) => a[0] - b[0]).slice(0, 5).forEach(([, p]) => { ctx.globalAlpha = .7; line(qX, qY, ...S(...p), ROSE, 1.4, 2); });
        ctx.globalAlpha = 1; dot(qX, qY, 5.5, GOLD);
        chip(models[m], ax + pw - 4 * k, by + 18 * k, 16, m === 2 ? LAV : m === 1 ? ROSE : '#9a6a12', undefined, 'right');
        // feature pins on the facade
        tags.forEach(([name, x, y], i) => {
          const [px, py] = Q(x, y), lift = Math.sin(t * 1.4 + i) * 3 * k, on = Math.floor(t * .7) % tags.length === i;
          ring(px, py, (on ? 13 : 9) * k, on ? GOLD : WHITE, on ? 2.6 : 2);
          dot(px, py, 3.4, on ? GOLD : WHITE);
          line(px, py, px + 26 * k, py - 22 * k + lift, WHITE, 1.6, 2);
          chip(name, px + 30 * k, py - 22 * k + lift, 14, on ? ROSE : INK);
        });
        sticker('target: log price');
      };
    }

    /* PL/0 Compiler: source typed onto the CRT, the lexer's scan highlights each token, and the code generator
       emits stack-machine instructions beside it while a small stack rises and falls. */
    {
      const SRC = ['var x, y;', 'begin', '  x := 3;', '  y := x * 2 + 1', 'end.'];
      const EMIT = [['INC', '0 5', 0], ['LIT', '0 3', 1], ['STO', '0 3', 0], ['LOD', '0 3', 1], ['LIT', '0 2', 2], ['OPR', 'MUL', 1], ['LIT', '0 1', 2], ['OPR', 'ADD', 1], ['STO', '0 4', 0], ['SIO', 'HALT', 0]];
      const toks = []; SRC.forEach((s, r) => { const re = /[A-Za-z]+|\d+|:=|[;,.*+]/g; let m; while ((m = re.exec(s))) toks.push([r, m.index, m[0]]); });
      R.compiler = () => {
        const [sx0, sy0] = Q(.265, .29), [sx1, sy1] = Q(.465, .56), lh = (sy1 - sy0) / 6.2, fs = Math.min(lh * .62, (sx1 - sx0) / 17 * 1.6);
        const cyc = 11, u = (t % cyc) / cyc, typed = ease(clamp(u / .35, 0, 1)) * SRC.join('').length;
        const lexed = clamp((u - .3) / .3, 0, 1) * toks.length, emitted = clamp((u - .45) / .45, 0, 1) * EMIT.length;
        // screen glow + typing
        ctx.save(); ctx.beginPath(); ctx.roundRect(sx0 - 8 * k, sy0 - 10 * k, sx1 - sx0 + 16 * k, sy1 - sy0 + 20 * k, 14 * k); ctx.clip();
        ctx.fillStyle = 'rgba(20,40,96,.12)'; ctx.fillRect(sx0 - 8 * k, sy0 - 10 * k, sx1 - sx0 + 16 * k, sy1 - sy0 + 20 * k);
        let left = typed; ctx.font = `600 ${fs}px ${MONO}`; const cwid = ctx.measureText('m').width;
        SRC.forEach((s, r) => { const vis = s.slice(0, Math.max(0, Math.min(s.length, left))); left -= s.length; mono(vis, sx0, sy0 + (r + 1) * lh, fs / k, INK); });
        toks.forEach(([r, c, s], i) => {
          if (i >= lexed) return;
          const kind = /^\d/.test(s) ? GOLD : /^(var|begin|end)$/.test(s) ? PINK : /^[a-z]/.test(s) ? SKY : '#b39dff';
          ctx.globalAlpha = i > lexed - 2 ? 1 : .6; ctx.strokeStyle = kind; ctx.lineWidth = 2 * k;
          ctx.strokeRect(sx0 + c * cwid - 2 + j(.4), sy0 + r * lh + lh * .22 + j(.4), s.length * cwid + 4, lh * .95);
        });
        ctx.globalAlpha = 1;
        // scanlines
        ctx.fillStyle = 'rgba(34,52,94,.06)'; for (let y = sy0 - 10 * k + (t * 20 % 4); y < sy1 + 10 * k; y += 4) ctx.fillRect(sx0 - 8 * k, y, sx1 - sx0 + 16 * k, 1.5);
        ctx.restore();
        if (u > .3 && u < .62) { const i = Math.min(toks.length - 1, Math.floor(lexed)), tk = toks[i]; if (tk) chip(`token: ${tk[2]}`, sx1 + 18 * k, sy0 + 10 * k, 15, ROSE); }
        // emitted code, upper right
        const [ex, ey] = Q(.6, .1), el = 17 * k;
        hand('code gen → stack VM', ex, ey, 16, BLUE);
        let depth = 0;
        EMIT.forEach(([op, arg, d], i) => {
          if (i >= emitted) return; depth = d;
          const y = ey + (i + 1.2) * el, cur = i === Math.floor(emitted) - 1 || (i === EMIT.length - 1 && emitted >= EMIT.length);
          if (cur) { ctx.fillStyle = 'rgba(255,217,138,.7)'; ctx.fillRect(ex - 4 * k, y - el * .78, 120 * k, el * .95); }
          mono(String(i).padStart(2, '0'), ex, y, 11, 'rgba(34,52,94,.55)'); mono(op, ex + 24 * k, y, 12, cur ? ROSE : INK); mono(arg, ex + 60 * k, y, 12, INK);
        });
        // stack
        const [kx, ky] = Q(.87, .5);
        hand('stack', kx - 4 * k, ky + 18 * k, 14, BLUE);
        for (let s = 0; s < depth; s++) { ctx.fillStyle = s === depth - 1 ? GOLD : SKY; ctx.beginPath(); ctx.roundRect(kx, ky - (s + 1) * 16 * k, 40 * k, 13 * k, 3 * k); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4 * k; ctx.stroke(); }
        line(kx - 4 * k, ky + 2 * k, kx + 44 * k, ky + 2 * k, INK, 2, 1);
        sticker(u < .3 ? 'source' : u < .6 ? 'lexer' : 'codegen');
      };
    }

    /* Mikal–Wix sync: the .LST appointment report rolls off the printer, a regex pass brackets the date, time and
       slot fields on each row (names stay redacted), and each match flies to the laptop as a busy block in a week grid. */
    {
      const rnd = rng(5), blocks = Array.from({ length: 14 }, () => [Math.floor(rnd() * 5), Math.floor(rnd() * 7), 1 + Math.floor(rnd() * 2)]);
      R.sync = () => {
        // the printout is a slanted strip: each row's left/right edge drifts right as it falls toward the floor
        const rows = 9, row = r => { const v = (r + .6) / rows, [a, y] = Q(.205 + .085 * v, .5 + .46 * v), [b] = Q(.345 + .1 * v, 0); return [a, b, y]; };
        const [px0, py0] = Q(.2, .5), [px1] = Q(.44, 0), rh = Q(0, .46 / rows)[1] - Q(0, 0)[1];
        const [lx0, ly0] = Q(.515, .485), [lx1, ly1] = Q(.695, .645);
        const cyc = 10, u = (t % cyc) / cyc, scanned = clamp(u / .8, 0, 1) * rows;
        // printout rows: date | time | ████ name | service | slots
        for (let r = 0; r < rows; r++) {
          const [x, x2, y] = row(r), wv = x2 - x;
          const done = r < scanned, cur = r === Math.floor(scanned);
          if (cur) { ctx.fillStyle = 'rgba(255,217,138,.55)'; ctx.fillRect(x - 3 * k, y - rh * .5, wv + 6 * k, rh * .75); }
          if (!done && !cur) continue;
          const fields = [[0, .2, SKY], [.22, .36, LAV], [.84, .98, GOLD]];
          fields.forEach(([a, b, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 2 * k; ctx.globalAlpha = cur ? 1 : .6; ctx.strokeRect(x + a * wv + j(.4), y - rh * .42 + j(.4), (b - a) * wv, rh * .58); });
          ctx.globalAlpha = cur ? .8 : .45; ctx.fillStyle = INK; ctx.fillRect(x + .4 * wv, y - rh * .22, .3 * wv, rh * .2);   // redacted name
          ctx.globalAlpha = 1;
        }
        if (u < .82) chip('regex: date · time · slots', row(Math.min(rows - 1, Math.floor(scanned)))[1] + 10 * k, row(Math.min(rows - 1, Math.floor(scanned)))[2], 14, BLUE);
        // laptop: week grid filling with busy blocks
        const cols = 7, rws = 5, cw = (lx1 - lx0) / cols, ch = (ly1 - ly0) / rws;
        ctx.strokeStyle = 'rgba(63,95,184,.35)'; ctx.lineWidth = 1;
        ctx.beginPath(); for (let c = 0; c <= cols; c++) { ctx.moveTo(lx0 + c * cw, ly0); ctx.lineTo(lx0 + c * cw, ly1); } for (let r = 0; r <= rws; r++) { ctx.moveTo(lx0, ly0 + r * ch); ctx.lineTo(lx1, ly0 + r * ch); } ctx.stroke();
        const filled = scanned / rows * blocks.length;
        blocks.forEach(([r, c, h], i) => {
          if (i > filled) return; const a = clamp(filled - i, 0, 1);
          ctx.globalAlpha = a; ctx.fillStyle = i % 3 ? SKY : PINK; ctx.beginPath(); ctx.roundRect(lx0 + c * cw + 1.5, ly0 + r * ch + 1.5, cw - 3, Math.min(ch * h, ly1 - ly0 - r * ch) - 3, 2 * k); ctx.fill();
        });
        ctx.globalAlpha = 1;
        // matches in flight from the current row to the next slot
        if (u < .82) for (let i = 0; i < 3; i++) {
          const v = ((t * .9 + i / 3) % 1), cr = row(Math.min(rows - 1, Math.floor(scanned))), a = [cr[1], cr[2]], b = [lx0 + cw * (2 + i), ly0 + ch], c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 60 * k];
          ctx.globalAlpha = Math.sin(v * Math.PI); dot(...qpt(a, c, b, v), 3.6, [SKY, LAV, GOLD][i]);
        }
        ctx.globalAlpha = 1;
        { const cr = row(Math.min(rows - 1, Math.floor(scanned))); qcurve([cr[1], cr[2]], [(cr[1] + lx0) / 2, ly0 - 50 * k], [lx0, ly0 + ch], 'rgba(255,255,255,.75)', 1.6, [4, 6]); }
        chip('Mikal .LST', px0, py0 - 10 * k, 16, INK); chip('busy blocks → Wix', (lx0 + lx1) / 2, ly0 - 12 * k, 16, ROSE, undefined, 'center');
        sticker(u < .82 ? 'parsing' : 'synced ✓');
      };
    }

    /* Systems assembler & IT: a build checklist with leader lines to the parts, the cooler fan turning,
       packets running down the switch cables, and VM windows stacking up above the switch. */
    {
      const parts = [['CPU + cooler', .315, .36], ['RAM', .425, .315], ['GPU', .35, .535], ['PSU', .36, .72], ['cable mgmt', .5, .56]];
      R.it = () => {
        const [lx, ly] = Q(.03, .2), cyc = 9, u = (t % cyc) / cyc, ticked = clamp(u / .6, 0, 1) * parts.length;
        parts.forEach(([name, x, y], i) => {
          const [px, py] = Q(x, y), on = i < ticked, cur = i === Math.floor(ticked);
          const ty = ly + i * 22 * k;
          if (on || cur) { ctx.globalAlpha = on ? .55 : 1; line(lx + 112 * k, ty - 5 * k, px, py, cur ? GOLD : WHITE, cur ? 2.4 : 1.4, 6); ctx.globalAlpha = 1; dot(px, py, cur ? 5 : 3.6, cur ? GOLD : WHITE); }
          chip(`${on ? '☑' : '☐'} ${name}`, lx, ty, 15, on ? INK : 'rgba(34,52,94,.6)');
        });
        // fan sweep
        const [fx, fy] = Q(.315, .36), fr = Q(.36, 0)[0] - fx;
        for (let b = 0; b < 3; b++) { const a = t * 6 + b * 2.09; ctx.globalAlpha = .7; ring(fx, fy, fr * .75, SKY, 2.2, a, a + .9); }
        ctx.globalAlpha = 1;
        // switch ports -> packets along the cables (to the right edge)
        const ports = [.72, .77, .82, .87];
        ports.forEach((x, i) => {
          const a = Q(x, .74), b = Q(1.02, .9 + i * .03), c = [(a[0] + b[0]) / 2, b[1] - 5 * k];
          for (let p = 0; p < 2; p++) { const v = (t * (.35 + i * .07) + p * .5) % 1; dot(...qpt(a, c, b, v), 3, i % 2 ? GOLD : WHITE); }
          ctx.globalAlpha = .5 + .5 * Math.sin(t * 7 + i * 2); dot(...Q(x, .715), 2.2, '#ffe9a8', null); ctx.globalAlpha = 1;
        });
        // VMs stacking above the switch
        const [vx, vy] = Q(.72, .5), vms = 1 + Math.floor((t * .5) % 4);
        for (let i = 0; i < vms; i++) {
          const x = vx + i * 12 * k, y = vy - i * 22 * k, w = 92 * k, h = 50 * k, a = i === vms - 1 ? ease((t * .5) % 1 * 3) : 1;
          ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,248,226,.92)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 6 * k); ctx.fill();
          ctx.strokeStyle = INK; ctx.lineWidth = 1.6 * k; ctx.stroke();
          ctx.fillStyle = [SKY, '#b39dff', GOLD, PINK][i]; ctx.fillRect(x, y, w, 9 * k);
          mono(`vm-0${i + 1}`, x + 6 * k, y + 24 * k, 10, INK);
          ctx.fillStyle = 'rgba(63,95,184,.35)'; ctx.fillRect(x + 6 * k, y + 32 * k, (w - 12 * k) * (.4 + .4 * Math.sin(t * 1.5 + i)), 4 * k);
        }
        ctx.globalAlpha = 1;
        chip('network', ...Q(.83, .82), 15, BLUE, undefined, 'center');
        sticker(u < .6 ? 'build' : 'online');
      };
    }

    /* Lockout technician: the programmer on the seat talks to the car over its cable (hex bytes ride the line),
       the new push-to-start fob answers with RF rings, and a learn-key ring fills until it pairs. */
    {
      R.lock = () => {
        const fob = Q(.39, .58), dev = Q(.77, .51), port = Q(.58, .47), cyc = 8, u = (t % cyc) / cyc, prog = ease(clamp((u - .1) / .65, 0, 1));
        // cable bytes: device -> car
        const c = [(dev[0] + port[0]) / 2, Math.max(dev[1], port[1]) + 40 * k];
        for (let i = 0; i < 6; i++) {
          const v = (t * .4 + i / 6) % 1, [x, y] = qpt(dev, c, port, v);
          ctx.globalAlpha = Math.sin(v * Math.PI); chip(['0x27', '0x01', '0xA4', '0x3E', '0x10', '0x7F'][i], x, y, 12, BLUE, 'rgba(255,248,226,.8)', 'center');
        }
        ctx.globalAlpha = 1;
        // RF rings from the fob toward the car
        for (let i = 0; i < 3; i++) { const v = (t * .7 + i / 3) % 1; ctx.globalAlpha = (1 - v) * .9; ring(...fob, (14 + v * 80) * k, i % 2 ? GOLD : WHITE, 2.4, -1.4, .6); }
        ctx.globalAlpha = 1;
        // learn ring
        ring(...fob, 26 * k, 'rgba(255,255,255,.4)', 4);
        ctx.strokeStyle = prog >= 1 ? AMBER : PINK; ctx.lineWidth = 4.5 * k; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(...fob, 26 * k, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2); ctx.stroke();
        chip(prog >= 1 ? 'key learned ✓' : `learning key ${Math.round(prog * 100)}%`, fob[0] - 20 * k, fob[1] - 40 * k, 16, prog >= 1 ? '#9a6a12' : ROSE, undefined, 'right');
        chip('programmer', ...Q(.87, .43), 15, BLUE, undefined, 'center');
        // push-to-start button in the sky
        const [bx, by] = Q(.14, .2), pulse = prog >= 1 ? .5 + .5 * Math.sin(t * 4) : 0;
        ring(bx, by, 30 * k, WHITE, 2.4); ctx.globalAlpha = .4 + .6 * pulse; ring(bx, by, 24 * k, GOLD, 5); ctx.globalAlpha = 1;
        hand('ENGINE', bx, by - 2 * k, 11, INK, 0, 'center'); hand('START', bx, by + 12 * k, 11, INK, 0, 'center');
        sticker(prog >= 1 ? 'paired' : 'programming');
      };
    }

    /* Backend developer · Extropian: the wrist sensor pulses over Bluetooth, an IMU gizmo wobbles with the hands,
       packets hop sensor -> phone -> the cloud, and a metric streams in the sky. The trace is the real lead-arm
       angle from the golf card's swing (window.SWING) when it is loaded. */
    {
      const S = window.SWING, trace = S ? S.per_frame.map(p => p[0]) : Array.from({ length: 50 }, (_, i) => 150 + 30 * Math.sin(i / 6));
      const lo = Math.min(...trace), hi = Math.max(...trace);
      R.extropian = () => {
        const sen = Q(.29, .35), phone = Q(.33, .87), cloud = Q(.82, .17);
        for (let i = 0; i < 3; i++) { const v = (t * .8 + i / 3) % 1; ctx.globalAlpha = (1 - v) * .9; ring(...sen, (10 + v * 50) * k, SKY, 2.2); }
        ctx.globalAlpha = 1;
        // IMU axes
        const a = Math.sin(t * 1.3) * .25;
        [[0, PINK, 'x'], [Math.PI / 2, SKY, 'y'], [-2.4, GOLD, 'z']].forEach(([b, col, n]) => {
          const L = 30 * k, e = [sen[0] + Math.cos(b + a) * L, sen[1] + Math.sin(b + a) * L];
          arrow(...sen, ...e, col, 2.2); hand(n, e[0] + 4 * k, e[1] + 4 * k, 13, INK);
        });
        dot(...sen, 5, WHITE);
        chip('BLE sensor', sen[0] - 18 * k, sen[1] - 34 * k, 15, BLUE, undefined, 'right');
        // packets: sensor -> phone -> cloud
        const c1 = [sen[0] - 70 * k, (sen[1] + phone[1]) / 2], c2 = [(phone[0] + cloud[0]) / 2, phone[1] - 40 * k];
        qcurve(sen, c1, phone, 'rgba(255,255,255,.6)', 1.6, [4, 6]); qcurve(phone, c2, cloud, 'rgba(255,255,255,.6)', 1.6, [4, 6]);
        for (let i = 0; i < 4; i++) {
          const v = (t * .45 + i / 4) % 1, p = v < .4 ? qpt(sen, c1, phone, v / .4) : qpt(phone, c2, cloud, (v - .4) / .6);
          dot(...p, 3.4, i % 2 ? GOLD : WHITE);
        }
        // cloud + db
        ctx.fillStyle = 'rgba(255,248,226,.92)'; ctx.beginPath();
        [[0, 0, 22], [22, -8, 18], [40, 2, 16], [-20, 4, 15]].forEach(([dx, dy, r]) => { ctx.moveTo(cloud[0] + dx * k + r * k, cloud[1] + dy * k); ctx.arc(cloud[0] + dx * k, cloud[1] + dy * k, r * k, 0, 7); });
        ctx.fill(); hand('Firebase', cloud[0] + 10 * k, cloud[1] + 6 * k, 15, ROSE, 0, 'center');
        // streaming trace (real lead-arm angle, frame by frame)
        const [tx0, ty0] = Q(.5, .5), [tx1, ty1] = Q(.95, .33), N = 40, off = t * 12;
        const pts = []; for (let i = 0; i < N; i++) { const f = Math.floor(off + i) % trace.length, fr = (off + i) % 1, v = trace[f] + (trace[(f + 1) % trace.length] - trace[f]) * fr; pts.push([tx0 + (tx1 - tx0) * i / (N - 1), ty0 + (ty1 - ty0) * (v - lo) / (hi - lo || 1)]); }
        ctx.fillStyle = 'rgba(255,248,226,.5)'; ctx.beginPath(); ctx.roundRect(tx0 - 10 * k, ty1 - 14 * k, tx1 - tx0 + 20 * k, ty0 - ty1 + 28 * k, 8 * k); ctx.fill();
        poly(pts, LAV, 2.6); dot(...pts[N - 1], 4, GOLD);
        const now = trace[Math.floor(off + N - 1) % trace.length];
        hand(`lead arm ${now}°`, tx1, ty1 - 20 * k, 15, LAV, 0, 'right');
        sticker('swing → app → cloud');
      };
    }


    /* Safe Ship Moving Services (current job). Daniel's own summary is the only source: call ingestion, the AI
       call-analysis infrastructure, and the MongoDB optimisation (about $6k less per month). Tags and labels stay generic. */
    const wave = (x0, x1, y, amp, ph, col, w = 2) => {
      const pts = []; for (let x = x0; x <= x1; x += 4 * k) { const u = (x - x0) / (x1 - x0), env = Math.pow(Math.max(0, Math.sin(x * .02 / k - t * 2.4 + ph)), 2) * Math.sin(Math.PI * u);
        pts.push([x, y + amp * env * (Math.sin(x * .3 / k + t * 9 + ph) * .6 + Math.sin(x * .13 / k - t * 5) * .4)]); }
      poly(pts, col, w);
    };
    const dbStack = (cx, cy, r, glowOn) => {
      for (let i = 2; i >= 0; i--) {
        const y = cy + (i - 1) * r * .5;
        ctx.fillStyle = i === 0 && glowOn ? '#fff0b8' : 'rgba(255,248,226,.92)'; ctx.strokeStyle = INK; ctx.lineWidth = 1.6 * k;
        ctx.beginPath(); ctx.ellipse(cx, y + r * .22, r, r * .3, 0, 0, Math.PI); ctx.lineTo(cx - r, y); ctx.ellipse(cx, y, r, r * .3, 0, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, y, r, r * .3, 0, 0, Math.PI * 2); ctx.stroke();
      }
    };

    // calls: the phone rings, each call becomes a waveform lane on the wall, and the lanes feed an ingest queue
    R['ssm-calls'] = () => {
      const phone = Q(.13, .8), head = Q(.5, .8), [x0] = Q(.74, 0), [x1] = Q(.97, 0), [qx, qy] = Q(.86, .5);
      for (let i = 0; i < 2; i++) { const v = (t * .8 + i / 2) % 1; ctx.globalAlpha = (1 - v) * .9; ring(...phone, (16 + v * 46) * k, GOLD, 2.4, -2.4, -.7); }
      ctx.globalAlpha = 1;
      const lanes = 4;
      for (let L = 0; L < lanes; L++) {
        const [, y] = Q(0, .12 + L * .1), live = .5 + .5 * Math.sin(t * .6 + L * 1.7);
        ctx.globalAlpha = .35 + .65 * live; wave(x0, x1, y, 16 * k, L * 1.9, L % 2 ? BLUE : ROSE, 2.2);
        ctx.globalAlpha = 1; dot(x0 - 8 * k, y, 3.4, L % 2 ? SKY : PINK);
        mono(`call ${String(L + 1).padStart(2, '0')}`, x0 - 14 * k, y + 4 * k, 9.5, INK, 'right');
      }
      // queue on the right: received calls stack up as little cards
      const n = 3 + Math.floor((t * .6) % 4);
      for (let i = 0; i < n; i++) { ctx.fillStyle = i === n - 1 ? '#fff0b8' : 'rgba(255,248,226,.9)'; ctx.beginPath(); ctx.roundRect(qx - 18 * k, qy + 70 * k - i * 12 * k, 36 * k, 9 * k, 3 * k); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.3 * k; ctx.stroke(); }
      chip('ingest', qx, qy - 6 * k, 15, BLUE, undefined, 'center');
      // the two monitors scroll an ingest log
      [[.05, .26, .58, .72], [.3, .48, .56, .72]].forEach(([a, b, c, d], m) => {
        const [ax, ay] = Q(a, c), [bx, by] = Q(b, d), rows = 5;
        for (let r = 0; r < rows; r++) { const y = ay + ((r + t * .9 + m * .5) % rows) / rows * (by - ay), w = (bx - ax) * (.4 + .5 * ((r * 7 + m * 3) % 5) / 5);
          ctx.globalAlpha = .55; ctx.fillStyle = r % 3 ? INK : ROSE; ctx.fillRect(ax + 4 * k, y + 2 * k, w - 8 * k, 3 * k); }
        ctx.globalAlpha = 1;
      });
      line(...head, x0 - 40 * k, Q(0, .44)[1], 'rgba(255,255,255,.8)', 1.4, 10);
      sticker('calls in');
    };

    // AI analysis: the monitor fills with a transcript, spans get highlighted and tagged; the rack blinks as it works
    R['ssm-ai'] = () => {
      const [mx0, my0] = Q(.565, .17), [mx1, my1] = Q(.745, .3), lines = 7, lh = (Q(0, .3)[1] - Q(0, .17)[1]);
      const [sx0, sy0] = Q(.56, .16), [sx1, sy1] = Q(.745, .315);
      const [ax, ay] = Q(.555, .15), [bx, by] = Q(.75, .32);
      // monitor: plate monitor is at (.54..0.75, .15..0.32) in the 768 sheet -> left half of the frame here
      const [px0, py0] = Q(.075, .3), [px1, py1] = Q(.49, .62), rh = (py1 - py0) / (lines + 1);
      const cyc = 9, u = (t % cyc) / cyc, shown = clamp(u / .5, 0, 1) * lines;
      for (let r = 0; r < lines; r++) {
        if (r > shown) break;
        const y = py0 + (r + 1) * rh, w = (px1 - px0) * (.55 + .4 * ((r * 5) % 7) / 7) * clamp(shown - r, 0, 1);
        ctx.fillStyle = 'rgba(34,52,94,.55)'; ctx.fillRect(px0 + 10 * k, y - 3 * k, w - 20 * k, 5 * k);
        if (r % 3 === 1 && u > .5) { const hx = px0 + 10 * k + (w - 20 * k) * .3, hw = (w - 20 * k) * .35; ctx.fillStyle = r % 2 ? 'rgba(255,217,138,.75)' : 'rgba(224,103,154,.45)'; ctx.fillRect(hx, y - 6 * k, hw, 11 * k); }
      }
      const tags = window.PV_SSM_AI_TAGS || ['summary', 'sentiment', 'topics'];   // v12 overrides: rubric / coaching / score
      tags.forEach((tg, i) => { const a = clamp((u - .55 - i * .08) / .1, 0, 1); if (a <= 0) return; ctx.globalAlpha = a; chip(tg, px1 + 14 * k, py0 + (i * 2 + 2) * rh, 15, [ROSE, BLUE, LAV][i]); });
      ctx.globalAlpha = 1;
      // pipeline across the sky
      const steps = ['audio', 'text', 'model', 'insights'], [lx0, ly] = Q(.1, .12), [lx1] = Q(.62, 0);
      steps.forEach((st, i) => {
        const x = lx0 + (lx1 - lx0) * i / 3, on = Math.floor((t * .8) % 4) === i;
        dot(x, ly, on ? 6 : 4.4, on ? GOLD : WHITE); hand(st, x, ly + 22 * k, 14, on ? ROSE : INK, 0, 'center');
        if (i) line(x - (lx1 - lx0) / 3 + 10 * k, ly, x - 10 * k, ly, WHITE, 1.8, 2);
      });
      // rack lights + a packet along the cable to the monitor
      for (let i = 0; i < 6; i++) { const [x, y] = Q(.84 + (i % 3) * .035, .5 + Math.floor(i / 3) * .08); ctx.globalAlpha = .4 + .6 * (Math.sin(t * 6 + i * 2.3) > 0 ? 1 : .2); dot(x, y, 2.6, i % 2 ? GOLD : PINK, null); }
      ctx.globalAlpha = 1;
      const a = Q(.85, .47), b = Q(.5, .5), c = [(a[0] + b[0]) / 2, a[1] - 40 * k];
      for (let i = 0; i < 3; i++) dot(...qpt(a, c, b, (t * .5 + i / 3) % 1), 3, i % 2 ? GOLD : WHITE);
      sticker(u < .5 ? 'transcribing' : 'analyzing');
    };

    // MongoDB cost: the monthly bill drops to about half at the cut and stays there; the stack slims down with it
    R['ssm-db'] = () => {
      const [ax, ay] = Q(.06, .62), [bx, by] = Q(.48, .1), pw = bx - ax, ph = ay - by, n = 10, cut = 5;
      const cyc = 9, u = (t % cyc) / cyc, shown = clamp(u / .6, 0, 1) * n;
      ctx.fillStyle = 'rgba(255,248,226,.55)'; ctx.beginPath(); ctx.roundRect(ax - 14 * k, by - 18 * k, pw + 28 * k, ph + 40 * k, 12 * k); ctx.fill();
      line(ax, ay, ax + pw, ay, INK, 2); line(ax, ay, ax, by, INK, 2);
      hand('monthly bill', ax + 6 * k, by - 2 * k, 15, INK);
      const bw = pw / n * .62;
      for (let i = 0; i < n; i++) {
        const v = clamp(shown - i, 0, 1); if (!v) continue;
        const hgt = ph * .86 * (i < cut ? 1 - .04 * Math.sin(i * 2.1) : .53 + .02 * Math.sin(i * 1.7)) * ease(v);
        const x = ax + (i + .2) * pw / n;
        ctx.fillStyle = i < cut ? SKY : GOLD; ctx.beginPath(); ctx.roundRect(x, ay - hgt, bw, hgt, 3 * k); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4 * k; ctx.stroke();
      }
      if (shown > cut) {
        const x = ax + cut * pw / n - 4 * k; ctx.setLineDash([5 * k, 5 * k]); line(x, by + 10 * k, x, ay, ROSE, 2, 0); ctx.setLineDash([]);
        hand('optimized', x + 6 * k, by + 26 * k, 15, ROSE);
      }
      // window.PV_NO_DOLLARS (v12+): relative savings only, no absolute company spend
      if (shown > cut + 2) chip(window.PV_NO_DOLLARS ? 'cost nearly halved' : '≈ −$6k / month', ax + pw * .78, ay - ph * .62, 17, '#9a6a12', undefined, 'center');
      if (u > .75 && !window.PV_NO_DOLLARS) chip('$70k+ / year', ax + pw * .78, ay - ph * .62 + 26 * k, 16, ROSE, undefined, 'center');
      const [sx, sy] = Q(.43, .89); line(sx - 30 * k, sy - 6 * k + Math.sin(t * 6) * 3 * k, sx + 30 * k, sy + 6 * k, ROSE, 2.2, 1);
      sticker(shown < cut ? 'before' : 'after');
    };

    // timeline card: the truck on the road, a route arc across the sky, and a call bubble riding with it
    R.ssm = () => {
      const a = Q(.05, .5), b = Q(.95, .42), c = Q(.5, .05), v = (t * .12) % 1, p = qpt(a, c, b, v);
      qcurve(a, c, b, 'rgba(255,255,255,.75)', 2, [6, 7]);
      [.15, .5, .85].forEach(u => dot(...qpt(a, c, b, u), 3.4, WHITE));
      dot(...p, 6, GOLD);
      const [tx, ty] = Q(.62, .58);
      ctx.fillStyle = 'rgba(255,248,226,.9)'; ctx.beginPath(); ctx.roundRect(tx, ty - 34 * k, 110 * k, 30 * k, 12 * k); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5 * k; ctx.stroke();
      wave(tx + 10 * k, tx + 100 * k, ty - 19 * k, 9 * k, 0, ROSE, 2);
      dbStack(...Q(.12, .3), 22 * k, Math.sin(t * 2) > 0);
      sticker('on the road');
    };

    // partner portal: the leads table fills the laptop, an invoice is drawn up on the wall and stamped, sheet rows
    // reconcile against site rows, and the keys on the desk become API keys
    R['ssm-portal'] = () => {
      const cyc = 10, u = (t % cyc) / cyc;
      // laptop: big panel = leads & calls table, rows slide in
      const [tx0, ty0] = Q(.478, .405), [tx1, ty1] = Q(.65, .505), rows = 5, rh = (ty1 - ty0) / rows;
      for (let r = 0; r < rows; r++) {
        const y = ty0 + (r + .6) * rh, v = clamp(u * 7 - r * .6, 0, 1); if (!v) continue;
        ctx.globalAlpha = v; dot(tx0 + 8 * k, y, 2.6, r % 3 === 1 ? PINK : GOLD, null);
        ctx.fillStyle = 'rgba(34,52,94,.55)'; ctx.fillRect(tx0 + 16 * k, y - 2 * k, (tx1 - tx0 - 60 * k) * (.5 + .45 * ((r * 3) % 5) / 5), 4 * k);
        ctx.fillStyle = 'rgba(63,95,184,.5)'; ctx.fillRect(tx1 - 36 * k, y - 2 * k, 26 * k, 4 * k);
      }
      ctx.globalAlpha = 1;
      // tall panel: weekly invoices as bars
      const [bx0, by1] = Q(.665, .59), [bx1, by0] = Q(.735, .44);
      for (let i = 0; i < 4; i++) { const h = (by1 - by0) * (.35 + .15 * i) * ease(clamp(u * 4 - i * .4, 0, 1)), w = (bx1 - bx0) / 6, x = bx0 + i * (bx1 - bx0) / 4 + 2 * k;
        ctx.fillStyle = i === 3 ? GOLD : SKY; ctx.beginPath(); ctx.roundRect(x, by1 - h, w, h, 2 * k); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2 * k; ctx.stroke(); }
      // invoice on the wall
      const [ix0, iy0] = Q(.06, .09), [ix1, iy1] = Q(.27, .46);
      ctx.fillStyle = 'rgba(255,248,226,.9)'; ctx.beginPath(); ctx.roundRect(ix0, iy0, ix1 - ix0, iy1 - iy0, 10 * k); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6 * k; ctx.stroke();
      hand('invoice', ix0 + 12 * k, iy0 + 26 * k, 17, INK);
      for (let r = 0; r < 4; r++) { const y = iy0 + (52 + r * 22) * k, v = clamp(u * 6 - 1 - r * .5, 0, 1); if (!v) continue;
        ctx.globalAlpha = v; mono(`week ${r + 1}`, ix0 + 12 * k, y, 10, INK); ctx.fillStyle = 'rgba(34,52,94,.45)'; ctx.fillRect(ix1 - 54 * k, y - 6 * k, 40 * k, 4 * k); }
      ctx.globalAlpha = 1;
      if (u > .55) { const a = clamp((u - .55) / .08, 0, 1); ctx.save(); ctx.globalAlpha = a; ctx.translate(...Q(.2, .4)); ctx.rotate(-.18);
        ctx.strokeStyle = ROSE; ctx.lineWidth = 2.4 * k; ctx.beginPath(); ctx.roundRect(-34 * k, -16 * k, 68 * k, 26 * k, 6 * k); ctx.stroke(); hand('paid', -18 * k, 4 * k, 19, ROSE); ctx.restore(); }
      // reconcile: sheet rows vs site rows
      const [cx0, cy0] = Q(.33, .13), [cx1] = Q(.47, 0), gap = 20 * k;
      hand('sheet', cx0 - 14 * k, cy0 - 8 * k, 14, INK); hand('site', cx1 - 10 * k, cy0 - 8 * k, 14, INK);
      for (let r = 0; r < 5; r++) {
        const y = cy0 + 10 * k + r * gap, on = clamp(u * 6 - 1.5 - r * .35, 0, 1), miss = r === 3 && u < .7;
        dot(cx0, y, 3.4, WHITE); dot(cx1, y, 3.4, miss ? PINK : WHITE);
        if (on) { ctx.globalAlpha = on; line(cx0 + 6 * k, y, cx1 - 6 * k, y, miss ? ROSE : BLUE, 1.6, 2); if (!miss) hand('✓', cx1 + 8 * k, y + 5 * k, 14, BLUE); ctx.globalAlpha = 1; }
      }
      // keys -> API key chip, dashed hop to the laptop
      const kk = Q(.42, .8), lp = Q(.52, .66);
      qcurve(kk, [(kk[0] + lp[0]) / 2, kk[1] - 50 * k], lp, 'rgba(255,255,255,.85)', 1.6, [5, 6]);
      chip('api key  ••••3f9a', kk[0] - 30 * k, kk[1] + 46 * k, 14, LAV);
      sticker(u < .55 ? 'invoicing' : 'reconciled');
    };

    // the jobs-API split: one 33k-line block on the wall breaks into 61 module tiles while pieces of the scroll
    // travel up into the cabinet and each drawer lights with its domain
    R['ssm-split'] = () => {
      const cyc = 11, u = (t % cyc) / cyc, [gx0, gy0] = Q(.68, .08), [gx1, gy1] = Q(.97, .47), N = 61, cols = 8;
      const split = ease(clamp((u - .2) / .45, 0, 1)), cw = (gx1 - gx0) / cols, chh = (gy1 - gy0) / 8;
      for (let i = 0; i < N; i++) {
        const c = i % cols, r = Math.floor(i / cols), tx = gx0 + c * cw + 2 * k, ty = gy0 + r * chh + 2 * k;
        const fx = gx0 + (gx1 - gx0) * .15, fy = gy0 + (gy1 - gy0) * .2, fw = (gx1 - gx0) * .7, fh = (gy1 - gy0) * .45;
        const x = fx + (c / cols) * fw + (tx - fx - (c / cols) * fw) * split, y = fy + (r / 8) * fh + (ty - fy - (r / 8) * fh) * split;
        const w = (fw / cols) + (cw - 4 * k - fw / cols) * split, h = (fh / 8) + (chh - 4 * k - fh / 8) * split;
        ctx.fillStyle = split < .02 ? 'rgba(255,248,226,.92)' : ['rgba(255,248,226,.9)', 'rgba(169,200,255,.9)', 'rgba(255,217,138,.9)', 'rgba(255,196,216,.9)'][(i * 7) % 4];
        ctx.fillRect(x, y, w + (split < .02 ? 1 : 0), h + (split < .02 ? 1 : 0));
        if (split > .02) { ctx.strokeStyle = INK; ctx.lineWidth = 1 * k; ctx.strokeRect(x, y, w, h); }
      }
      if (split < .1) { const [lx, ly] = Q(.75, .21); hand('jobs.ts', lx, ly, 18, INK); mono('33,000 lines', lx, ly + 18 * k, 11, INK); }
      if (split > .9) chip('61 modules', ...Q(.8, .52), 16, ROSE, undefined, 'center');
      // pieces of the scroll ride up into the drawers
      const drawers = [[.48, .26, 'pricing'], [.555, .26, 'dispatch'], [.62, .26, 'billing'], [.48, .37, 'notes'], [.555, .37, 'schedule'], [.625, .38, 'search'], [.48, .48, 'export'], [.555, .48, 'QA'], [.625, .5, 'verify']];
      const a = Q(.3, .56), active = Math.floor((t * .9) % drawers.length);
      drawers.forEach(([x, y, name], i) => {
        const p = Q(x, y), on = i === active, done = i < active;
        if (on) { const v = (t * .9) % 1, c = [(a[0] + p[0]) / 2, Math.min(a[1], p[1]) - 60 * k]; dot(...qpt(a, c, p, v), 3.6, GOLD); }
        dot(p[0], p[1], on ? 4.6 : 3, on ? GOLD : done ? WHITE : 'rgba(255,255,255,.4)', on ? INK : null);
        if (on) chip(name, p[0] + 10 * k, p[1] - 10 * k, 14, BLUE);
      });
      sticker(split < .5 ? 'one file' : 'split');
    };

    function frame() {
      n = 0; ctx.clearRect(0, 0, W, H);
      if (plate.complete && plate.naturalWidth) ctx.drawImage(plate, ox, oy, dw, dh);
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      try { (R[id] || (() => {}))(); } finally { ctx.restore(); }
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (!playing) return;
      t = (now - t0) / 1000; frame();
    }
    fit(); new ResizeObserver(fit).observe(canvas);
    plate.onload = () => frame();
    if (reduce) { t = 3; plate.onload = () => frame(); }
    else { new IntersectionObserver(([e]) => playing = e.isIntersecting).observe(canvas); raf = requestAnimationFrame(loop); }
    return { destroy: () => cancelAnimationFrame(raf), get t() { return t; } };
  }
  return { mount, ids: ['flow', 'digits', 'house', 'compiler', 'sync', 'it', 'lock', 'extropian', 'ssm', 'ssm-calls', 'ssm-ai', 'ssm-db', 'ssm-portal', 'ssm-split'] };
})();
