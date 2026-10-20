/* NeonWrite: true pen-order handwriting with a single-line font, rendered as a neon tube. A spark writes
   each stroke at an even pen speed (with short pen lifts), the tube glows as it is laid down, then the
   sign flickers on and settles into a soft hum; now and then one letter stutters.
   Default font: Relief SingleLine (redesign/assets/fonts/relief-singleline-font.js). Any single-line
   font works; outline fonts fall back to their centre-lines (LetterCore.skeleton).
   NeonWrite.render(el, {font, text, size, color:'rose'|'azure'|'gold'|{tube,core,glow}}) */
(() => {
  const C = LetterCore;
  const COLORS = {
    rose:  { tube: '255,128,182', core: '255,240,247', glow: '255,96,160' },
    azure: { tube: '138,178,255', core: '238,244,255', glow: '100,140,255' },
    gold:  { tube: '255,196,120', core: '255,247,230', glow: '255,160,90' },
  };
  const FX = {
    duration: 4.4, hold: 2.6,
    defaults: { font: 'relief-singleline', size: 112, color: 'rose', track: .02 },
    build(L, o) {
      const s = L.size, strands = [];
      for (const g of L.glyphs) { const lines = g.closed ? C.skeleton(g.polys, Math.max(1, Math.min(3, 150 / s))).map(k => k.pts) : g.polys;
        for (const p of lines) { const q = C.resample(p, 1, false); if (q.length > 1) strands.push({ p: q, L: q.L, gi: g.i }); } }
      const lift = s * .3, write = .84; let total = 0; for (const k of strands) total += k.L + lift;
      let acc = 0; for (const k of strands) { k.t0 = acc / total * write; k.t1 = (acc + k.L) / total * write; acc += k.L + lift; }
      const col = typeof o.color === 'object' ? o.color : COLORS[o.color] || COLORS.rose;
      return { strands, col, n: L.glyphs.length, write };
    },
    draw(L, d, t, time, final) {
      const x = L.ctx, s = L.size, c = d.col, idle = final ? 0 : Math.max(0, time - FX.duration);
      // ignition flicker after writing, then hum
      let master = 1;
      if (!final && t < 1 && t > d.write) { const f = (t - d.write) / (1 - d.write); master = [1, .25, 1, .1, .9, 1, .4, 1][Math.floor(f * 8)] || 1; }
      if (idle > 0) master = .93 + .07 * C.n1(time * 7);
      const stutterG = idle > 0 && (idle % 6.5) < .35 ? Math.floor(idle / 6.5 * 7.3) % d.n : -1, stutter = .3 + .7 * (Math.sin(idle * 70) > 0 ? 1 : 0);
      const paths = new Map(); let head = null;
      for (const k of d.strands) { const p = final ? 1 : C.clamp01((t - k.t0) / (k.t1 - k.t0)); if (p <= 0) continue;
        const m = Math.max(1, Math.floor(p * (k.p.length - 1))), P = k.p; let path = paths.get(k.gi); if (!path) paths.set(k.gi, path = new Path2D());
        path.moveTo(P[0][0], P[0][1]); for (let i = 1; i <= m; i++) path.lineTo(P[i][0], P[i][1]);
        if (p < 1) head = P[m]; }
      x.save(); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round';
      for (const [gi, path] of paths) {
        const a = master * (gi === stutterG ? stutter : 1);
        x.strokeStyle = `rgba(${c.glow},${(.09 * a).toFixed(3)})`; x.lineWidth = s * .2; x.stroke(path);
        x.strokeStyle = `rgba(${c.glow},${(.2 * a).toFixed(3)})`; x.lineWidth = s * .09; x.stroke(path);
        x.strokeStyle = `rgba(${c.tube},${(.85 * a).toFixed(3)})`; x.lineWidth = s * .038; x.stroke(path);
        x.strokeStyle = `rgba(${c.core},${(.95 * Math.max(.25, a)).toFixed(3)})`; x.lineWidth = s * .014; x.stroke(path);
      }
      if (head && !final) { const R = s * .16, g = x.createRadialGradient(head[0], head[1], 0, head[0], head[1], R);
        g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.2, `rgba(${c.core},.9)`); g.addColorStop(1, `rgba(${c.glow},0)`); x.fillStyle = g; x.beginPath(); x.arc(head[0], head[1], R, 0, 6.283); x.fill();
        for (let i = 0; i < 5; i++) { const an = time * 13 + i * 1.3, rr = s * (.05 + .06 * ((time * 3 + i * .37) % 1)); x.fillStyle = `rgba(${c.core},.8)`; x.fillRect(head[0] + Math.cos(an) * rr, head[1] + Math.sin(an) * rr, 1.5, 1.5); } }
      x.restore();
    },
  };
  window.NeonWrite = { label: 'Neon pen write-on', defaults: FX.defaults, render: (el, o) => C.run(el, Object.assign({}, FX.defaults, o), FX) };
  LetterFX.neonWrite = window.NeonWrite;
})();
