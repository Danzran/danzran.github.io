/* InkBrush: ink-brush write-on. Each glyph's centre-lines (LetterCore.skeleton) become brush strokes that
   are painted in writing order by stamping a bristle dab along them, pressing in at the start and lifting
   into dry-brush (flying white) streaks at the tail. The paint is clipped to the true glyph so the letter
   keeps its shape; the dry gaps stay. Ivory ink on the night sky with a soft glow that breathes when idle.
   Default font: Kaushan Script (redesign/assets/fonts/kaushan-script-font.js) (Yuji Boku was tried first; its Latin glyphs read poorly).
   InkBrush.render(el, {font, text, size, ink:[top,bottom], dab:'brush-dab'|'brush-stroke'}) */
(() => {
  const C = LetterCore;
  const dabFallback = (x, s) => { const r = C.rng(3); x.clearRect(0, 0, s, s); x.translate(s / 2, s / 2);
    for (let i = 0; i < 70; i++) { const y = (r() - .5) * s * .62, L = s * (.25 + r() * .35); x.strokeStyle = `rgba(255,255,255,${.35 + r() * .6})`; x.lineWidth = 1 + r() * 4;
      x.beginPath(); x.moveTo(-s * .3 + r() * 6, y); x.lineTo(-s * .3 + L, y + (r() - .5) * 3); x.stroke(); }
    const g = x.createRadialGradient(-s * .1, 0, 0, -s * .1, 0, s * .32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.7, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.ellipse(-s * .1, 0, s * .3, s * .3, 0, 0, 6.283); x.fill(); x.setTransform(1, 0, 0, 1, 0, 0); };
  const dabs = {}; const dabFor = o => dabs[o.dab] || (dabs[o.dab] = C.texture(C.BASE + 'tex/' + o.dab + '.webp', dabFallback, 128));

  const FX = {
    duration: 4.2, hold: 2.6,
    defaults: { font: 'kaushan-script', size: 112, ink: ['#fffaf1', '#ffd9b8'], glow: 'rgba(255,196,170,.55)', dab: 'brush-dab' },
    build(L, o) {
      const res = Math.max(1, Math.min(3, 150 / L.size)), stamps = [];
      let strokes = [];
      for (const g of L.glyphs) {
        let sk = [];
        try { sk = C.skeleton(g.polys, res); } catch (e) { sk = []; }
        if (!sk.length) { const b = g.bb; sk = [{ pts: [[b.x0, (b.y0 + b.y1) / 2], [b.x1, (b.y0 + b.y1) / 2]], r: [b.h / 2, b.h / 2], L: b.w }]; }
        for (const s of sk) { const a = s.pts[0], b = s.pts[s.pts.length - 1]; if (b[0] * .7 + b[1] < a[0] * .7 + a[1]) { s.pts.reverse(); s.r.reverse(); } }
        sk.sort((a, b) => (a.pts[0][0] * .45 + a.pts[0][1]) - (b.pts[0][0] * .45 + b.pts[0][1]));
        strokes.push(...sk.map(s => Object.assign(s, { gi: g.i })));
      }
      strokes = strokes.filter(s => s.L > .3);
      const lift = L.size * .35; let total = 0; for (const s of strokes) total += s.L + lift;
      let acc = 0;
      for (const s of strokes) {
        const pts = s.pts, rr = s.r, n = pts.length; let d = 0;
        const rmax = Math.max(...rr);
        for (let i = 0; i < n; i++) {
          if (i) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          const f = d / (s.L || 1), r = Math.max(1.2, rr[i] * 1.3 + .6);
          const j = Math.min(n - 1, i + 2), k = Math.max(0, i - 2), a = Math.atan2(pts[j][1] - pts[k][1], pts[j][0] - pts[k][0]);
          const press = C.ease.smooth(0, .07, f), liftF = 1 - C.ease.smooth(.78, 1, f);
          stamps.push({ x: pts[i][0], y: pts[i][1], r: Math.min(r, rmax * 1.35 + 1), a, alpha: s.dot || s.L < 2 ? 1 : .35 + .65 * Math.min(press, .4 + liftF * .6), dry: !s.dot && f > .78, tau: (acc + d) / total });
        }
        acc += s.L + lift;
      }
      // thin the stamp list to ~r*.3 spacing
      const out = []; let last = null;
      for (const s of stamps) { if (!last || Math.hypot(s.x - last.x, s.y - last.y) > Math.max(.8, s.r * .28) || s.tau - last.tau > .01) { out.push(s); last = s; } }
      const cov = C.offscreen(L), ink = C.offscreen(L), clip = C.toPath2D(L.all, true);
      const grad = L.ctx.createLinearGradient(0, L.bb.y0, 0, L.bb.y1); grad.addColorStop(0, o.ink[0]); grad.addColorStop(1, o.ink[1]);
      return { stamps: out, cov, ink, clip, grad, idx: 0, lastT: -1, dabReady: dabFor(o).ready };
    },
    draw(L, d, t, time, final) {
      const x = L.ctx, cx = d.cov.x, o = d.opts, dab = dabFor(o);
      if (final) t = 1;
      if (t < d.lastT || d.dabReady !== dab.ready) { cx.clearRect(0, 0, L.W, L.H); d.idx = 0; d.dabReady = dab.ready; }
      d.lastT = t;
      const img = dab.img;
      while (d.idx < d.stamps.length && d.stamps[d.idx].tau <= t) {
        const s = d.stamps[d.idx++], w = s.r * 2.5, h = s.r * 2.1;
        cx.save(); cx.translate(s.x, s.y); cx.rotate(s.a); cx.globalAlpha = s.alpha * (s.dry ? .55 : .9);
        cx.drawImage(img, -w * .5, -h * .5, w, h); cx.restore();
      }
      // ink = coverage ∩ glyph, tinted
      const ix = d.ink.x; ix.globalCompositeOperation = 'copy'; ix.setTransform(1, 0, 0, 1, 0, 0); ix.drawImage(d.cov.c, 0, 0); ix.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
      ix.globalCompositeOperation = 'destination-in'; ix.fillStyle = '#fff'; ix.fill(d.clip);
      ix.globalCompositeOperation = 'source-in'; ix.fillStyle = d.grad; ix.fillRect(0, 0, L.W, L.H); ix.globalCompositeOperation = 'source-over';
      const idle = Math.max(0, time - FX.duration), breathe = final ? .5 : .42 + .16 * Math.sin(idle * 1.6);
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
      x.globalAlpha = breathe; x.filter = `blur(${Math.round(L.size * .07 * L.dpr)}px)`; x.drawImage(d.ink.c, 0, 0);
      x.filter = 'none'; x.globalAlpha = 1; x.drawImage(d.ink.c, 0, 0);
      x.restore();
      // wet brush tip
      if (!final && t < 1 && d.idx > 0 && d.idx < d.stamps.length) { const s = d.stamps[d.idx - 1], g = x.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 1.8);
        g.addColorStop(0, 'rgba(255,250,240,.9)'); g.addColorStop(1, 'rgba(255,220,200,0)'); x.fillStyle = g; x.beginPath(); x.arc(s.x, s.y, s.r * 1.8, 0, 6.283); x.fill(); }
    },
  };
  window.InkBrush = { label: 'Ink brush write-on', defaults: FX.defaults, render: (el, o) => C.run(el, Object.assign({}, FX.defaults, o), FX) };
  LetterFX.inkBrush = window.InkBrush;
})();
