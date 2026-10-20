/* SketchPass: sketchy overshoot. Every glyph edge is split at its corners and drawn as two or three loose
   pencil passes that bow, wobble and overshoot past the corners like a quick construction sketch. Once a
   letter is drawn the passes settle (wobble and overshoot ease down, the lines never fully merge) and a
   slightly mis-registered pastel wash fills it. Idle: the lines breathe very slowly, no boiling.
   Default font: DM Serif Display (redesign/assets/fonts/dm-serif-display-font.js).
   SketchPass.render(el, {font, text, size, passes, colors:[...], wash}) */
(() => {
  const C = LetterCore;
  function splitCorners(P, maxLen) {
    const n = P.length, ang = i => { const a = P[(i - 3 + n) % n], b = P[i], c = P[(i + 3) % n]; let d = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]); while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d); };
    const cut = []; for (let i = 0; i < n; i++) { const v = ang(i); if (v > .75 && v >= ang((i + 1) % n) && v >= ang((i - 1 + n) % n)) cut.push(i); }
    if (!cut.length) cut.push(0);
    const segs = [];
    for (let k = 0; k < cut.length; k++) { const a = cut[k], b = cut[(k + 1) % cut.length], seg = []; for (let i = a; ; i = (i + 1) % n) { seg.push(P[i]); if (i === b && seg.length > 1) break; if (seg.length > n + 1) break; }
      // long smooth runs become a few hand strokes with small overlaps
      const L = C.polyLen(seg), parts = Math.max(1, Math.round(L / maxLen));
      if (parts === 1) segs.push(seg); else { const per = Math.ceil(seg.length / parts); for (let q = 0; q < parts; q++) segs.push(seg.slice(Math.max(0, q * per - 2), Math.min(seg.length, (q + 1) * per + 2))); } }
    return segs.filter(s => s.length > 1);
  }
  const FX = {
    duration: 3.9, hold: 2.6,
    defaults: { font: 'dm-serif-display', size: 116, passes: 3, colors: ['rgba(255,247,236,.92)', 'rgba(255,214,196,.7)', 'rgba(214,200,255,.62)'], wash: [['#ffe6d6', '#ffbfd9'], ['#e6ddff', '#c4d6ff']], washAlpha: .9 },
    build(L, o) {
      const s = L.size, r = C.rng(o.seed || 23), n = L.glyphs.length, strokes = [];
      L.glyphs.forEach((g, gi) => {
        const g0 = n > 1 ? (gi / (n - 1)) * .5 : 0, g1 = g0 + .34;
        const segs = g.polys.flatMap(p => splitCorners(C.resample(p, Math.max(1.2, s / 70), true), s * .55));
        const nS = segs.length;
        for (let pass = 0; pass < o.passes; pass++) segs.forEach((seg, si) => {
          const a = seg[0], b = seg[1], y = seg[seg.length - 2], z = seg[seg.length - 1];
          const t0 = g0 + (g1 - g0) * (pass * .3 + (si / nS) * .55), t1 = t0 + (g1 - g0) * (.12 + .3 * C.polyLen(seg) / (s * 2));
          const e0 = s * (.015 + r() * .05), e1 = s * (.015 + r() * .05);
          const ua = Math.atan2(a[1] - b[1], a[0] - b[0]), ub = Math.atan2(z[1] - y[1], z[0] - y[0]);
          strokes.push({ seg, pass, t0, t1: Math.min(t1, g1 + .1), e0, e1, ua, ub, seed: r() * 200, bow: (r() - .5) * 2, sx: (r() - .5) * s * .012, sy: (r() - .5) * s * .012, settle: g1 + .08 });
        });
        g.wash = { t: g1, path: C.toPath2D(g.polys, true), dx: (r() - .5) * s * .03 + s * .015, dy: (r() - .3) * s * .02 };
      });
      return { strokes, s };
    },
    draw(L, d, t, time, final) {
      const x = L.ctx, o = d.opts, s = d.s, dur = FX.duration;
      // wash first so the pencil sits on top
      for (const g of L.glyphs) { const w = final ? 1 : C.ease.smooth(g.wash.t - .02, g.wash.t + .14, t); if (w <= 0) continue;
        if (!d.grads) d.grads = o.wash.map(c => { const gr = x.createLinearGradient(0, L.bb.y0, 0, L.bb.y1); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]); return gr; });
        x.save(); x.globalAlpha = w * o.washAlpha; x.translate(g.wash.dx * (1 - .4 * w), g.wash.dy * (1 - .4 * w)); x.fillStyle = d.grads[g.line % d.grads.length]; x.fill(g.wash.path); x.restore(); }
      x.lineCap = 'round'; x.lineJoin = 'round';
      const idle = Math.max(0, time - dur);
      for (const k of d.strokes) {
        const p = final ? 1 : C.clamp01((t - k.t0) / (k.t1 - k.t0)); if (p <= 0) continue;
        const settle = final ? 1 : C.ease.out(C.clamp01((t - k.settle) / .35));
        const amp = s * (.016 + .01 * k.pass) * (1 - .72 * settle), over = 1 - .45 * settle, seg = k.seg, m = seg.length;
        const breath = idle * .25;
        const pt = (i, f) => { const a = seg[Math.max(0, i - 1)], b = seg[Math.min(m - 1, i + 1)], nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
          const off = amp * (C.n1(f * 3.1 + k.seed + breath) * .9 + k.bow * Math.sin(Math.PI * f) * .8);
          return [seg[i][0] + nx / l * off + k.sx * (1 - .5 * settle), seg[i][1] + ny / l * off + k.sy * (1 - .5 * settle)]; };
        const end = Math.max(1, Math.floor(p * (m - 1)));
        x.beginPath();
        const s0 = pt(0, 0); x.moveTo(s0[0] + Math.cos(k.ua) * k.e0 * over, s0[1] + Math.sin(k.ua) * k.e0 * over); x.lineTo(s0[0], s0[1]);
        for (let i = 1; i <= end; i++) { const q = pt(i, i / (m - 1)); x.lineTo(q[0], q[1]); }
        if (p >= 1) { const q = pt(m - 1, 1); x.lineTo(q[0] + Math.cos(k.ub) * k.e1 * over, q[1] + Math.sin(k.ub) * k.e1 * over); }
        x.strokeStyle = o.colors[k.pass % o.colors.length]; x.lineWidth = Math.max(.9, s * (k.pass ? .0075 : .0105)); x.stroke();
      }
    },
  };
  window.SketchPass = { label: 'Sketchy overshoot', defaults: FX.defaults, render: (el, o) => C.run(el, Object.assign({}, FX.defaults, o), FX) };
  LetterFX.sketchPass = window.SketchPass;
})();
