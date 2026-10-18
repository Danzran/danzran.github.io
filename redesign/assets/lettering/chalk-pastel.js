/* ChalkPastel: soft chalk-pastel lettering. Short, broad pastel strokes (rose, peach, butter, lavender,
   azure across the word) follow a gentle diagonal flow field and build each letter up left to right,
   on twos (12 fps). The pigment catches only the paper tooth (a tileable texture), the letter gets a chalk
   edge line, and when finished a little chalk dust drifts off. No boiling once settled.
   Default font: Shrikhand (redesign/assets/fonts/shrikhand-font.js).
   ChalkPastel.render(el, {font, text, size, colors:[...], edge}) */
(() => {
  const C = LetterCore;
  const toothFallback = (x, s) => { const r = C.rng(9); x.clearRect(0, 0, s, s); for (let i = 0; i < s * s / 6; i++) { x.fillStyle = `rgba(255,255,255,${(r() * r()).toFixed(2)})`; x.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2); } };
  const tooth = C.texture(C.BASE + 'tex/chalk-tooth.webp', toothFallback, 256);
  let comp = null, compReady = null;
  const pigment = () => { if (comp && compReady === tooth.ready) return comp; const S = 512; comp = document.createElement('canvas'); comp.width = comp.height = S; const x = comp.getContext('2d');
    x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(0, 0, S, S); x.drawImage(tooth.img, 0, 0, S, S); compReady = tooth.ready; return comp; };
  const probe = document.createElement('canvas').getContext('2d');

  const FX = {
    duration: 3.6, hold: 2.6,
    defaults: { font: 'shrikhand', size: 108, colors: ['#ffb3c9', '#ffc8a2', '#ffe6a8', '#d6c2ff', '#aecbff'], edge: 'rgba(255,250,242,.95)' },
    build(L, o) {
      const s = L.size, r = C.rng(o.seed || 17), sp = s * .045, strokes = [], cols = o.colors;
      const mask = C.offscreen(L), lay = C.offscreen(L), edgeW = Math.max(1.2, s * .014);
      mask.x.fillStyle = mask.x.strokeStyle = '#fff'; mask.x.lineWidth = edgeW * 1.6; mask.x.lineJoin = 'round';
      const x0 = L.bb.x0, w = L.bb.w || 1, n = L.glyphs.length;
      const colAt = f => { const q = f * (cols.length - 1), i = Math.min(cols.length - 2, Math.floor(q)); return r() < q - i ? cols[i + 1] : cols[i]; };
      const glyphs = L.glyphs.map((g, gi) => {
        const path = C.toPath2D(g.polys, true); mask.x.fill(path); mask.x.stroke(path);
        const b = g.bb;
        for (let y = b.y0 - sp * .3; y < b.y1 + sp * .3; y += sp * .6) for (let xx = b.x0 - sp * .3; xx < b.x1 + sp * .3; xx += sp * .9) {
          const px = xx + (r() - .5) * sp, py = y + (r() - .5) * sp; if (!probe.isPointInPath(path, px, py)) continue;
          const a = -.55 + C.n2(px * .01, py * .01) * .6, len = s * (.1 + r() * .14), f = (px - x0) / w;
          strokes.push({ x: px - Math.cos(a) * len / 2, y: py - Math.sin(a) * len / 2, dx: Math.cos(a) * len, dy: Math.sin(a) * len, bow: (r() - .5) * len * .25,
            w: s * (.03 + r() * .03), col: colAt(C.clamp01(f + (r() - .5) * .12)), t0: .04 + .62 * f + (r() - .5) * .08, a: .45 + r() * .55 });
        }
        const t0 = n > 1 ? .1 + .62 * gi / (n - 1) : .1;
        return { path, contours: g.polys.map(p => C.resample(p, 1.5, true)), t0 };
      });
      strokes.sort((a, b) => a.t0 - b.t0);
      const dust = []; for (let i = 0; i < 26; i++) { const st = strokes[(r() * strokes.length) | 0]; if (st) dust.push({ x: st.x, y: st.y, vx: (r() - .5) * 6, vy: 6 + r() * 14, ph: r() * 6, c: st.col, life: 2 + r() * 3 }); }
      return { strokes, glyphs, mask, lay, edgeW, dust };
    },
    draw(L, d, t, time, final) {
      const x = L.ctx, lx = d.lay.x, o = d.opts, dur = FX.duration, step = final ? 0 : Math.floor(time * 12);
      const tq = final ? 1 : Math.min(1, Math.floor(t * dur * 12) / (dur * 12));          // on twos
      const settled = final || t >= 1;
      lx.clearRect(0, 0, L.W, L.H); lx.lineCap = 'round';
      for (const k of d.strokes) { const p = C.clamp01((tq - k.t0) / .07); if (p <= 0) break;
        lx.strokeStyle = k.col; lx.globalAlpha = k.a; lx.lineWidth = k.w;
        lx.beginPath(); lx.moveTo(k.x, k.y); lx.quadraticCurveTo(k.x + k.dx * p / 2 - k.dy / (Math.hypot(k.dx, k.dy) || 1) * k.bow, k.y + k.dy * p / 2 + k.dx / (Math.hypot(k.dx, k.dy) || 1) * k.bow, k.x + k.dx * p, k.y + k.dy * p); lx.stroke(); }
      lx.globalAlpha = 1;
      // chalk edge line, sketched per glyph
      lx.strokeStyle = o.edge; lx.lineWidth = d.edgeW; lx.lineJoin = 'round';
      for (const G of d.glyphs) { const p = C.clamp01((tq - G.t0) / .2); if (p <= 0) continue; lx.beginPath();
        for (const c of G.contours) { const m = Math.floor(c.length * p); if (m < 2) continue; lx.moveTo(c[0][0], c[0][1]); for (let i = 1; i < m; i++) lx.lineTo(c[i][0], c[i][1]); if (p >= 1) lx.closePath(); }
        lx.stroke(); }
      // paper tooth (hops on twos while drawing, still once settled) and the letter mask
      lx.globalCompositeOperation = 'destination-in';
      const pat = lx.createPattern(pigment(), 'repeat'), sc = Math.max(.5, L.size / 160), hop = settled ? 0 : step % 3;
      if (pat) { pat.setTransform(new DOMMatrix([sc, 0, 0, sc, hop * 41, hop * 23])); lx.fillStyle = pat; lx.fillRect(0, 0, L.W, L.H); }
      lx.setTransform(1, 0, 0, 1, 0, 0); lx.drawImage(d.mask.c, 0, 0); lx.setTransform(L.dpr, 0, 0, L.dpr, 0, 0);
      lx.globalCompositeOperation = 'source-over';
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(d.lay.c, 0, 0); x.restore();
      // chalk dust drifting off once finished
      const idle = final ? 0 : Math.max(0, time - dur);
      if (idle > 0) for (const q of d.dust) { const a = ((idle + q.ph) % q.life) / q.life, al = Math.sin(Math.PI * a) * .55;
        x.fillStyle = q.c; x.globalAlpha = al; x.beginPath(); x.arc(q.x + q.vx * a * q.life + Math.sin(idle * 2 + q.ph) * 3, q.y + q.vy * a * q.life, 1.2, 0, 6.283); x.fill(); x.globalAlpha = 1; }
    },
  };
  window.ChalkPastel = { label: 'Chalk pastel', defaults: FX.defaults, render: (el, o) => C.run(el, Object.assign({}, FX.defaults, o), FX) };
  LetterFX.chalkPastel = window.ChalkPastel;
})();
