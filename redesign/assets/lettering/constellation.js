/* Constellation: the letters become star charts. Stars ignite at the corners of a single-line font's
   strokes (left to right), thin light lines join them, and at the end a shooting star streaks in and links
   the last star, which flares. Idle: stars twinkle (bright ones show soft diffraction spikes) and a faint
   pulse runs along the lines.
   Default font: EMS Nixish (single-line, redesign/assets/fonts/ems-nixish-font.js; EMS Osmotron also works but reads poorly). With an outline font
   it uses the glyph centre-lines (LetterCore.skeleton).
   Constellation.render(el, {font, text, size, line, star}) */
(() => {
  const C = LetterCore;
  const sprite = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.1, 'rgba(255,252,245,.95)'); g.addColorStop(.3, 'rgba(210,220,255,.35)'); g.addColorStop(1, 'rgba(180,190,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c; })();
  const FX = {
    duration: 4.4, hold: 2.6,
    defaults: { font: 'ems-nixish', size: 112, line: [205, 216, 255], warm: [255, 226, 200], track: .06 },
    build(L, o) {
      const s = L.size, r = C.rng(o.seed || 31), merge = s * .045, stars = [], edges = [];
      const find = (x, y) => { for (const st of stars) if (Math.hypot(st.x - x, st.y - y) < merge) return st; const st = { x, y, id: stars.length, m: .55 + r() * .55, ph: r() * 9, sp: .8 + r() * 2.2 }; stars.push(st); return st; };
      for (const g of L.glyphs) {
        const lines = g.closed ? C.skeleton(g.polys, Math.max(1, Math.min(3, 150 / s))).map(k => k.pts) : g.polys;
        for (const p of lines) { const v = C.simplify(p, s * .045); let prev = null;
          for (const q of v) { const st = find(q[0], q[1]); st.deg = (st.deg || 0) + 1; if (prev && prev !== st && !edges.some(e => (e.a === prev && e.b === st) || (e.a === st && e.b === prev))) edges.push({ a: prev, b: st }); prev = st; } }
      }
      for (const st of stars) { if ((st.deg || 0) === 1) st.m += .3; }
      const x0 = L.bb.x0, x1 = L.bb.x1;
      for (const st of stars) st.t = .03 + .55 * (st.x - x0) / ((x1 - x0) || 1) + (r() - .5) * .04;
      for (const e of edges) { e.t0 = Math.max(e.a.t, e.b.t) + .04; e.t1 = e.t0 + .1; if (e.b.t < e.a.t) { const q = e.a; e.a = e.b; e.b = q; } }
      const last = stars.reduce((a, b) => (b.x - b.y * .2 > a.x - a.y * .2 ? b : a), stars[0]);
      last.t = .9; for (const e of edges) if (e.a === last || e.b === last) { e.t0 = Math.max(e.t0, .9); e.t1 = e.t0 + .07; }
      const dust = []; for (let i = 0; i < Math.round(L.W * L.H / 2600); i++) dust.push({ x: r() * L.W, y: r() * L.H, m: .15 + r() * .35, ph: r() * 9, t: r() * .6 });
      return { stars, edges, last, dust, s };
    },
    draw(L, d, t, time, final) {
      const x = L.ctx, o = d.opts, s = d.s, idle = final ? 0 : Math.max(0, time - FX.duration), k = Math.max(.6, s / 100);
      x.save(); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
      for (const q of d.dust) { const a = final ? 1 : C.ease.smooth(q.t, q.t + .1, t); if (a <= 0) continue; const tw = .6 + .4 * Math.sin(time * 1.3 + q.ph);
        x.fillStyle = `rgba(220,226,255,${(.5 * q.m * a * tw).toFixed(3)})`; x.fillRect(q.x, q.y, 1.2, 1.2); }
      // lines
      for (const e of d.edges) { const p = final ? 1 : C.ease.inOut((t - e.t0) / (e.t1 - e.t0)); if (p <= 0) continue;
        const ex = e.a.x + (e.b.x - e.a.x) * p, ey = e.a.y + (e.b.y - e.a.y) * p;
        const pulse = idle > 0 ? .5 + .5 * Math.sin(idle * 1.8 - (e.a.x + e.b.x) * .01) : 1;
        x.strokeStyle = `rgba(${o.line},${(.16 + .06 * pulse).toFixed(3)})`; x.lineWidth = 3.2 * k; x.beginPath(); x.moveTo(e.a.x, e.a.y); x.lineTo(ex, ey); x.stroke();
        x.strokeStyle = `rgba(${o.line},${(.62 + .18 * pulse).toFixed(3)})`; x.lineWidth = .9 * k; x.stroke(); }
      // stars
      for (const st of d.stars) { const age = final ? 9 : (t - st.t) * FX.duration; if (age <= 0) continue;
        const pop = age < .35 ? 1 + 1.6 * Math.sin(Math.PI * age / .35) : 1, tw = final ? 1 : .72 + .28 * Math.sin(time * st.sp + st.ph);
        let R = (5 + 7 * st.m) * k * pop * tw; if (st === d.last && age < 1.2) R *= 1 + 2.4 * Math.max(0, 1 - age / 1.2);
        x.globalAlpha = Math.min(1, .55 + st.m * .5); x.drawImage(sprite, st.x - R, st.y - R, R * 2, R * 2);
        if (st.m > 1.2 || st === d.last) { const sp = R * 1.5 * tw; x.fillStyle = `rgba(${o.warm},.55)`; x.fillRect(st.x - sp, st.y - .5 * k, sp * 2, k); x.fillRect(st.x - .5 * k, st.y - sp, k, sp * 2); }
        x.globalAlpha = 1; }
      // shooting star into the last star
      const ls = d.last; if (!final && t > .74 && t < .93) { const p = C.ease.inOut((t - .74) / .16), sx = L.W + 40, sy = -40;
        const hx = sx + (ls.x - sx) * p, hy = sy + (ls.y - sy) * p, ang = Math.atan2(ls.y - sy, ls.x - sx), len = s * 1.4 * Math.min(1, p * 3);
        const g = x.createLinearGradient(hx, hy, hx - Math.cos(ang) * len, hy - Math.sin(ang) * len); g.addColorStop(0, 'rgba(255,250,240,.95)'); g.addColorStop(1, 'rgba(200,210,255,0)');
        x.strokeStyle = g; x.lineWidth = 2.2 * k; x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx - Math.cos(ang) * len, hy - Math.sin(ang) * len); x.stroke();
        const R = 14 * k; x.drawImage(sprite, hx - R, hy - R, R * 2, R * 2); }
      x.restore();
    },
  };
  window.Constellation = { label: 'Constellation', defaults: FX.defaults, render: (el, o) => C.run(el, Object.assign({}, FX.defaults, o), FX) };
  LetterFX.constellation = window.Constellation;
})();
