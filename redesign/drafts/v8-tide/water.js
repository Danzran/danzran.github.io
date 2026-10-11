/* Stylized water ribbons (anime "water breathing"-type effects) drawn on 2D canvas.
   Body + flowing inner streaks move smoothly; the inked contour and foam curls are
   redrawn on twos (12 fps) so the drawn details have a hand-animated cadence. */
window.Water = (() => {
  const C = { deep: '#1f5fbf', mid: '#3f8ee8', light: '#8cc4ff', foam: '#ffffff', ink: '#22345e' };

  // Catmull-Rom through control points -> dense samples
  function spline(pts, per = 18) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let j = 0; j < per; j++) {
        const t = j / per, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y), z: f(p0.z ?? 1, p1.z ?? 1, p2.z ?? 1, p3.z ?? 1) });
      }
    }
    out.push({ ...pts[pts.length - 1], z: pts[pts.length - 1].z ?? 1 });
    // normals + arc length
    let L = 0;
    out.forEach((p, i) => {
      const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)];
      let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1; p.nx = nx / l; p.ny = ny / l;
      if (i) L += Math.hypot(p.x - out[i - 1].x, p.y - out[i - 1].y); p.s = L;
    });
    out.forEach(p => p.u = p.s / (L || 1));
    out.L = L;
    return out;
  }

  // seeded jitter: the drawn wobble only changes when the seed (the drawing number) changes
  let seed = 1;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const setSeed = n => { seed = (Math.abs(n | 0) % 2147483646) + 1; };
  const jit = a => (rnd() - .5) * a;

  // Draw the parts of a ribbon whose depth matches `side` (+1 in front, -1 behind, 0 = all)
  function draw(ctx, pts, opt) {
    const { width = 40, t = 0, side = 0, drawn = 0, alpha = 1, taper = 0 } = opt;
    const S = spline(pts);
    // taper: 0 = swell over the whole length; >0 = only the last `taper` px at each end thin out (long rivers)
    const env = p => taper ? Math.pow(Math.min(1, p.s / taper, (S.L - p.s) / taper), .7) : Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, p.u))), .9);
    const w = p => width * env(p) * (.85 + .15 * Math.sin(p.s / 90 + t * 1.3));
    const inSide = p => side === 0 || (side > 0 ? p.z >= 0 : p.z < 0);
    ctx.save(); ctx.globalAlpha = alpha; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // runs of consecutive samples on this side
    const runs = []; let cur = [];
    S.forEach(p => { if (inSide(p)) cur.push(p); else if (cur.length) { runs.push(cur); cur = []; } });
    if (cur.length) runs.push(cur);
    for (const run of runs) {
      if (run.length < 2) continue;
      const edge = (k, j = 0) => run.map(p => [p.x + p.nx * w(p) * k + jit(j), p.y + p.ny * w(p) * k + jit(j)]);
      const top = edge(1), bot = edge(-1).reverse();
      // body
      const g = ctx.createLinearGradient(run[0].x, run[0].y - width, run[0].x, run[0].y + width);
      const mid = run[run.length >> 1], gw = width * 1.2;
      const g2 = ctx.createLinearGradient(mid.x + mid.nx * gw, mid.y + mid.ny * gw, mid.x - mid.nx * gw, mid.y - mid.ny * gw);
      g2.addColorStop(0, '#9fd0ff'); g2.addColorStop(.45, C.mid); g2.addColorStop(1, C.deep);
      ctx.fillStyle = g2;
      ctx.beginPath(); [...top, ...bot].forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.closePath(); ctx.fill();
      // deeper band toward the lower edge
      ctx.fillStyle = C.deep; ctx.globalAlpha = alpha * .55;
      ctx.beginPath(); [...edge(-.15), ...edge(-1).reverse()].forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = alpha;
      // flowing streaks: offset polylines with moving dashes
      const streaks = [[.7, '#e6f3ff', 1.6, 90, 30], [.5, C.light, 1.4, 60, 50], [.25, '#cfe6ff', 1.1, 40, 46], [0, C.light, 1.2, 70, 60], [-.3, '#bfe0ff', 1, 50, 40], [-.6, C.light, 1.3, 90, 55], [.86, C.foam, 1.8, 30, 22]];
      for (const [k, col, lw, dash, gap] of streaks) {
        ctx.strokeStyle = col; ctx.lineWidth = lw * Math.max(.6, width / 46);
        ctx.setLineDash([dash, gap]); ctx.lineDashOffset = -t * 160 * (1 + k * .2);
        ctx.beginPath(); edge(k).forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.stroke();
      }
      ctx.setLineDash([]);
      // foam crest: thick white along the top edge, broken
      ctx.strokeStyle = C.foam; ctx.lineWidth = Math.max(2, width * .16);
      ctx.setLineDash([width * 1.6, width * .5]); ctx.lineDashOffset = -t * 120;
      ctx.beginPath(); edge(.92, drawn ? 1.2 : 0).forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.stroke();
      ctx.setLineDash([]);
      // inked contour, re-drawn each "drawing" with a little jitter
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.globalAlpha = alpha * .45;
      for (const k of [1, -1]) { ctx.beginPath(); edge(k, drawn ? 1.6 : 0).forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.stroke(); }
      ctx.globalAlpha = alpha;
    }
    // foam curls riding the crest (positions travel with t; shapes are re-inked on twos)
    const curls = Math.round(S.L / 140);
    for (let i = 0; i < curls; i++) {
      const u = ((i / curls) + t * .05) % 1, p = S[Math.min(S.length - 1, Math.round(u * (S.length - 1)))];
      if (!inSide(p) || u < .08 || u > .92) continue;
      const r = w(p) * .45, x = p.x + p.nx * w(p) * .9, y = p.y + p.ny * w(p) * .9;
      ctx.strokeStyle = C.foam; ctx.lineWidth = Math.max(1.5, r * .28);
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 3.2; a += .3) { const rr = r * (1 - a / (Math.PI * 3.6)) + jit(drawn ? 1.2 : 0); ctx.lineTo(x + Math.cos(a + p.u * 9) * rr, y + Math.sin(a + p.u * 9) * rr); }
      ctx.stroke();
      ctx.fillStyle = C.foam;
      for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(x + p.nx * (r + 6 + d * 7) + jit(6), y + p.ny * (r + 6 + d * 7) + jit(6), 1.5 + rnd() * 2, 0, 7); ctx.fill(); }
    }
    ctx.restore();
  }
  return { draw, setSeed, C };
})();
