/* LightPaint: long-exposure light painting. A shooting-star head traces every contour of each glyph,
   leaving a white-hot trail that cools through gold to rose; the letter then fills with soft light and
   keeps a faint shimmer (a slow light sweep plus a few glints) while idle.
   Default font: Shippori Mincho B1 ExtraBold (redesign/assets/fonts/shippori-mincho-font.js).
   LightPaint.render(el, {font, text, size, duration, delay, palette:'dawn'|'ice'}) -> controller (see README). */
(() => {
  const C = LetterCore;
  const PAL = {
    dawn: { fill: ['#fffaf0', '#ffe2c2', '#f6c9e6'], cool: [255, 205, 160], warm: [255, 236, 206], glow: [255, 190, 150] },
    ice:  { fill: ['#ffffff', '#dfe9ff', '#d9ccff'], cool: [190, 205, 255], warm: [235, 240, 255], glow: [170, 190, 255] },
  };
  const sprite = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.12, 'rgba(255,250,235,.9)'); g.addColorStop(.35, 'rgba(255,214,170,.35)'); g.addColorStop(1, 'rgba(255,190,150,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c; })();

  const FX = {
    duration: 4.4, hold: 2.6,
    defaults: { font: 'shippori-mincho', size: 110, palette: 'dawn' },
    build(L, o) {
      const n = L.glyphs.length, pal = PAL[o.palette] || PAL.dawn, span = .42, lead = .42;
      const glyphs = L.glyphs.map((g, gi) => {
        const s0 = n > 1 ? (gi / (n - 1)) * lead : 0, cs = g.polys.map(p => C.resample(p, Math.max(.9, L.size / 90), true));
        const tot = cs.reduce((a, c) => a + c.L, 0) || 1; let acc = 0;
        const contours = cs.map(c => { const a0 = acc / tot; acc += c.L; const a1 = acc / tot;
          return { pts: c, tau: c.map((_, k) => s0 + span * (a0 + (a1 - a0) * (k / Math.max(1, c.length - 1)))), t0: s0 + span * a0, t1: s0 + span * a1 }; });
        return { g, s0, e0: s0 + span, contours, path: C.toPath2D(g.polys, true) };
      });
      const r = C.rng(o.seed || 7), glints = [];
      for (let i = 0; i < Math.min(40, n * 3); i++) { const G = glyphs[(r() * n) | 0], c = G.contours[(r() * G.contours.length) | 0], p = c.pts[(r() * c.pts.length) | 0]; glints.push({ x: p[0], y: p[1], ph: r() * 9, sp: .6 + r() * 1.2, s: .5 + r() * .8 }); }
      const grad = L.ctx.createLinearGradient(0, L.bb.y0, 0, L.bb.y1);
      grad.addColorStop(0, pal.fill[0]); grad.addColorStop(.55, pal.fill[1]); grad.addColorStop(1, pal.fill[2]);
      return { glyphs, pal, glints, grad, k: Math.max(.6, L.size / 110) };
    },
    draw(L, d, t, time, final) {
      const x = L.ctx, dur = FX.duration, k = d.k, pal = d.pal, idle = Math.max(0, time - dur);
      // 1. the cooled light settles into a soft fill
      for (const G of d.glyphs) {
        const f = final ? 1 : C.ease.smooth(G.e0 - .04, G.e0 + .16, t); if (f <= 0) continue;
        x.save(); x.globalAlpha = .9 * f; x.fillStyle = d.grad; x.shadowColor = `rgba(${pal.glow},.55)`; x.shadowBlur = 18 * k * f; x.fill(G.path); x.restore();
      }
      // 2. trails, binned by age so each bin is one stroke call
      const bins = [.06, .2, .5, 1.1, 1e9].map(() => new Path2D()), edges = [.06, .2, .5, 1.1, 1e9];
      for (const G of d.glyphs) for (const c of G.contours) {
        if (t < c.t0) continue; const P = c.pts, T = c.tau, m = P.length;
        for (let i = 1; i <= m; i++) { const j = i % m; if (T[Math.min(i, m - 1)] > t && !final) break;
          const age = final ? 9 : (t - T[i - 1]) * dur; let b = 0; while (age > edges[b]) b++;
          bins[b].moveTo(P[i - 1][0], P[i - 1][1]); bins[b].lineTo(P[j][0], P[j][1]); }
      }
      x.save(); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round';
      const cool = pal.cool, warm = pal.warm, shimmer = .5 + .5 * Math.sin(idle * 1.3);
      const style = [
        [10 * k, `rgba(${pal.glow},.22)`, 3.2 * k, 'rgba(255,255,255,.98)'],
        [7 * k, `rgba(${pal.glow},.16)`, 2.2 * k, `rgba(${warm},.9)`],
        [5 * k, `rgba(${cool},.10)`, 1.6 * k, `rgba(${cool},.75)`],
        [4 * k, `rgba(${cool},.09)`, 1.4 * k, `rgba(${cool},.7)`],
        [3.5 * k, `rgba(${cool},${.06 + .03 * shimmer})`, 1.2 * k, `rgba(${cool},${.5 + .12 * shimmer})`],
      ];
      for (let b = bins.length - 1; b >= 0; b--) { const s = style[b]; x.strokeStyle = s[1]; x.lineWidth = s[0]; x.stroke(bins[b]); x.strokeStyle = s[3]; x.lineWidth = s[2]; x.stroke(bins[b]); }
      // 3. comet heads + sparks
      if (!final && t < 1) for (const G of d.glyphs) {
        if (t < G.s0 || t > G.e0) continue;
        const c = G.contours.find(c => t >= c.t0 && t <= c.t1); if (!c) continue;
        const f = (t - c.t0) / ((c.t1 - c.t0) || 1), i = Math.min(c.pts.length - 1, Math.floor(f * (c.pts.length - 1))), p = c.pts[i];
        const R = 26 * k; x.drawImage(sprite, p[0] - R, p[1] - R, R * 2, R * 2);
        for (let s = 1; s < 7; s++) { const q = c.pts[Math.max(0, i - s * 4)], jx = C.n1(time * 9 + s * 3.1) * 5 * k, jy = C.n1(time * 8 + s * 5.7) * 5 * k, rr = (7 - s) * .5 * k;
          x.fillStyle = `rgba(255,${230 - s * 10},${200 - s * 12},${.7 - s * .09})`; x.beginPath(); x.arc(q[0] + jx, q[1] + jy, rr, 0, 6.283); x.fill(); }
      }
      // 4. idle shimmer: a slow light sweep and a few glints
      if (!final && idle > 0) {
        const sw = L.bb.x0 - 120 + ((idle * 260) % (L.bb.w + 600));
        const g = x.createLinearGradient(sw - 80, 0, sw + 80, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,248,235,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        x.strokeStyle = g; x.lineWidth = 1.6 * k; x.stroke(bins[4]);
        for (const q of d.glints) { const a = Math.pow(Math.max(0, Math.sin(idle * q.sp + q.ph)), 12); if (a < .02) continue; const R = 14 * k * q.s * (.4 + a);
          x.globalAlpha = a; x.drawImage(sprite, q.x - R, q.y - R, R * 2, R * 2); x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(q.x - R * .9, q.y - .5, R * 1.8, 1); x.fillRect(q.x - .5, q.y - R * .9, 1, R * 1.8); x.globalAlpha = 1; }
      }
      x.restore();
    },
  };
  window.LightPaint = { label: 'Light painting', defaults: FX.defaults, render: (el, o) => C.run(el, Object.assign({}, FX.defaults, o), FX) };
  LetterFX.lightPaint = window.LightPaint;
})();
