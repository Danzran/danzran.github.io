/* PencilScribble: colored-pencil scribble fill. A light pencil outline is sketched first, then three
   pastel pencils fill each letter with loose zig-zag hatching (each layer at its own angle), clipped to a
   slightly fattened letter so the turn-arounds stay inside. Strokes carry a pencil-grain texture, and the
   whole drawing re-scribbles gently on twos (12 fps, small coherent jitter, never a jump cut).
   Default font: Mochiy Pop One (redesign/assets/fonts/mochiy-pop-font.js); thin pen fonts leave no room for the hatching.
   PencilScribble.render(el, {font, text, size, colors:[c1,c2,c3], edge, boil:'twos'|'off'}) */
(() => {
  const C = LetterCore;
  const grainFallback = (x, s) => { const r = C.rng(5); x.clearRect(0, 0, s, s);
    for (let i = 0; i < s * 22; i++) { const px = r() * s, py = r() * s, L = 2 + r() * 7, a = -0.5 + (r() - .5) * .3; x.strokeStyle = `rgba(255,255,255,${.25 + r() * .6})`; x.lineWidth = .6 + r() * .9; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke(); } };
  const grain = C.texture(C.BASE + 'tex/pencil-grain.webp', grainFallback, 256);
  /* pigment mask = floor + grain, so the grain breaks the strokes up without starving them */
  let comp = null, compReady = null;
  const pigment = () => { if (comp && compReady === grain.ready) return comp; const S = 512; comp = document.createElement('canvas'); comp.width = comp.height = S; const x = comp.getContext('2d');
    x.fillStyle = 'rgba(255,255,255,.42)'; x.fillRect(0, 0, S, S); x.drawImage(grain.img, 0, 0, S, S); compReady = grain.ready; return comp; };

  const FX = {
    duration: 3.8, hold: 2.4,
    defaults: { font: 'mochiy-pop', size: 104, colors: ['#ffa9cb', '#ffe2a0', '#b4ccff'], edge: 'rgba(255,248,238,.92)', boil: 'twos', dilate: .018 },
    build(L, o) {
      const s = L.size, dil = s * o.dilate, sp = Math.max(2.2, s * .028), r = C.rng(o.seed || 11);
      const mask = C.offscreen(L), layer = C.offscreen(L);
      mask.x.fillStyle = mask.x.strokeStyle = '#fff'; mask.x.lineJoin = mask.x.lineCap = 'round'; mask.x.lineWidth = dil * 2;
      const n = L.glyphs.length;
      const glyphs = L.glyphs.map((g, gi) => {
        const path = C.toPath2D(g.polys, true); mask.x.fill(path); mask.x.stroke(path);
        const bb = g.bb, cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2, R = Math.hypot(bb.w, bb.h) / 2 + dil;
        const layers = [-58, -14, 34].map((deg, li) => {
          const a = (deg + (r() - .5) * 14) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
          const half = R * (li === 2 ? .8 : 1), pts = [], gap = sp * (li === 0 ? 1 : li === 1 ? 1.35 : 1.8);
          for (let v = -half, k = 0; v <= half; v += gap * (.75 + r() * .5), k++) {
            const u = (k % 2 ? 1 : -1) * half * (.92 + r() * .16);
            pts.push([cx + ux * u + vx * v, cy + uy * u + vy * v]);
          }
          return { pts, seed: r() * 100 };
        });
        const contours = g.polys.map(p => C.resample(p, 1.5, true));
        const t0 = n > 1 ? (gi / (n - 1)) * .55 : 0;
        return { g, path, layers, contours, t0, t1: t0 + .45 };
      });
      return { glyphs, mask, layer, lw: Math.max(1.2, s * .02) };
    },
    draw(L, d, t, time, final) {
      const x = L.ctx, Lx = d.layer.x, W = L.W, H = L.H, opts = d.opts;
      const step = final || (opts && opts.boil === 'off') ? 0 : Math.floor(time * 12);   // on twos
      const amp = final ? 0 : (t < 1 ? 1.1 : .55), cols = opts.colors;
      Lx.clearRect(0, 0, W, H); Lx.lineCap = Lx.lineJoin = 'round';
      for (const G of d.glyphs) {
        const p = final ? 1 : C.clamp01((t - G.t0) / (G.t1 - G.t0)); if (p <= 0) continue;
        // hatching layers
        G.layers.forEach((ly, li) => {
          const lp = C.clamp01((p - .12 - li * .26) / .38); if (lp <= 0) return;
          const P = ly.pts, m = P.length - 1, end = lp * m, k = Math.floor(end);
          const J = i => [P[i][0] + C.n1(step * .71 + i * 1.3 + ly.seed) * amp * 1.6, P[i][1] + C.n1(step * .53 + i * 2.1 + ly.seed + 40) * amp * 1.6];
          Lx.strokeStyle = cols[li % cols.length]; Lx.lineWidth = d.lw * (li === 0 ? 1.15 : 1); Lx.globalAlpha = li === 0 ? .95 : .85;
          Lx.beginPath(); let a = J(0); Lx.moveTo(a[0], a[1]);
          for (let i = 1; i <= Math.min(m, k + 1); i++) {
            const b = J(i), f = i <= k ? 1 : end - k;
            const mx = (a[0] + b[0]) / 2 + C.n1(i * 3.7 + ly.seed + step * .3) * amp * 2.5, my = (a[1] + b[1]) / 2 + C.n1(i * 2.9 + ly.seed + step * .3 + 9) * amp * 2.5;
            if (f >= 1) Lx.quadraticCurveTo(mx, my, b[0], b[1]); else Lx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
            a = b;
          }
          Lx.stroke();
        });
      }
      Lx.globalAlpha = 1;
      // pencil grain (offset hops on twos) then clip to the fattened letters
      Lx.globalCompositeOperation = 'destination-in';
      const pat = Lx.createPattern(pigment(), 'repeat'), sc = Math.max(.35, L.size / 420);
      if (pat) { pat.setTransform(new DOMMatrix([sc, 0, 0, sc, (step * 37) % 97, (step * 53) % 89])); Lx.fillStyle = pat; Lx.globalAlpha = 1; Lx.fillRect(0, 0, W, H); }
      Lx.setTransform(1, 0, 0, 1, 0, 0); Lx.drawImage(d.mask.c, 0, 0); Lx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
      Lx.globalCompositeOperation = 'source-over';
      // faint tinted ground so the gaps between hatch lines are not plain night sky
      for (const G of d.glyphs) { const p = final ? 1 : C.clamp01(((t - G.t0) / (G.t1 - G.t0) - .15) / .5); if (p <= 0) continue; x.globalAlpha = .26 * p; x.fillStyle = cols[2 % cols.length]; x.fill(G.path); }
      x.globalAlpha = 1;
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(d.layer.c, 0, 0); x.restore();
      // sketched outline on top
      x.save(); x.strokeStyle = opts.edge; x.lineWidth = Math.max(1, L.size * .009); x.lineCap = x.lineJoin = 'round';
      for (const G of d.glyphs) {
        const p = final ? 1 : C.clamp01((t - G.t0) / (G.t1 - G.t0) / .3); if (p <= 0) continue;
        x.beginPath();
        for (const c of G.contours) { const m = Math.floor(c.length * p); if (m < 2) continue; const jj = (i, q) => q + C.n1(step * .9 + i * .21) * amp * .6;
          x.moveTo(jj(0, c[0][0]), jj(5, c[0][1])); for (let i = 1; i < m; i++) x.lineTo(jj(i, c[i][0]), jj(i + 5, c[i][1])); if (p >= 1) x.closePath(); }
        x.globalAlpha = .8; x.stroke();
      }
      x.restore();
    },
  };
  window.PencilScribble = { label: 'Colored-pencil scribble', defaults: FX.defaults, render: (el, o) => C.run(el, Object.assign({}, FX.defaults, o), FX) };
  LetterFX.pencilScribble = window.PencilScribble;
})();
