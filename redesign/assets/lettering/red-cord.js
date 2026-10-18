/* RedCord: a braided red kumihimo cord (a Kimi no Nawa nod) threads along the pen path of a single-line
   script, led by a small glowing gold bead. The braid texture is mapped along the curve slice by slice,
   with a soft shadow so crossings read as over/under. Idle: a silk sheen runs along the cord.
   Default font: EMS Allure (single-line, redesign/assets/fonts/ems-allure-font.js). Works with any
   single-line font; with an outline font it follows the glyph centre-lines (LetterCore.skeleton).
   RedCord.render(el, {font, text, size, width, texture:'cord-tile'|'cord-tile-silk'}) */
(() => {
  const C = LetterCore;
  const tileFallback = (x, s) => {           // procedural braid: red body, alternating chevrons, gold thread
    x.canvas.width = 256; x.canvas.height = 64; const W = 256, H = 64;
    const g = x.createLinearGradient(0, 4, 0, H - 4); g.addColorStop(0, '#ff7a55'); g.addColorStop(.35, '#e8432f'); g.addColorStop(1, '#8e1a22');
    x.fillStyle = g; x.beginPath(); x.roundRect(0, 4, W, H - 8, 26); x.fill();
    for (let i = -1; i < 17; i++) { const cx = i * 16; x.strokeStyle = i % 2 ? 'rgba(255,170,130,.55)' : 'rgba(120,10,20,.45)'; x.lineWidth = 5;
      x.beginPath(); x.moveTo(cx, 8); x.quadraticCurveTo(cx + 8, H / 2, cx, H - 8); x.stroke(); }
    x.strokeStyle = '#f2c46d'; x.lineWidth = 4; for (let i = -1; i < 5; i++) { x.beginPath(); x.moveTo(i * 64, H - 6); x.lineTo(i * 64 + 40, 6); x.stroke(); }
  };
  const tiles = {}; const tileFor = o => tiles[o.texture] || (tiles[o.texture] = C.texture(C.BASE + 'tex/' + o.texture + '.webp', tileFallback, 64));

  const FX = {
    duration: 4.6, hold: 2.6,
    defaults: { font: 'ems-allure', size: 124, width: .1, texture: 'cord-tile' },
    build(L, o) {
      const w = Math.max(3, L.size * o.width);
      let paths = L.glyphs.flatMap(g => g.closed ? C.skeleton(g.polys, Math.max(1, Math.min(3, 150 / L.size))).map(s => s.pts) : g.polys);
      paths = paths.map(p => C.resample(p, 1, false)).filter(p => p.length > 1);
      const lift = L.size * .25; let total = 0; for (const p of paths) total += p.L + lift;
      let acc = 0; const segs = [];
      for (const p of paths) { segs.push({ p, t0: acc / total, t1: (acc + p.L) / total, L: p.L }); acc += p.L + lift; }
      const lay = C.offscreen(L);
      return { segs, w, lay, seg: 0, idx: 0, lastT: -1, ready: tileFor(o).ready, dist: 0 };
    },
    draw(L, d, t, time, final) {
      const x = L.ctx, lx = d.lay.x, w = d.w, tile = tileFor(d.opts);
      if (!d.tile || d.tileReady !== tile.ready) {   // pre-scale the braid once to ~device size, so slices do not alias into glitter
        const src = tile.img, H = Math.max(8, Math.round(w * L.dpr * 1.25)), Wd = Math.max(8, Math.round(src.width * H / src.height)), c = document.createElement('canvas');
        c.width = Wd; c.height = H; const cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(src, 0, 0, Wd, H); d.tile = c; d.tileReady = tile.ready; }
      const img = d.tile;
      if (final) t = 1;
      if (t < d.lastT || d.ready !== tile.ready) { lx.clearRect(0, 0, L.W, L.H); d.seg = 0; d.idx = 0; d.dist = 0; d.ready = tile.ready; }
      d.lastT = t;
      const tw = img.width, th = img.height, k = th / w;
      let head = null;
      while (d.seg < d.segs.length) {
        const S = d.segs[d.seg], P = S.p, upto = t >= S.t1 ? P.length - 1 : Math.floor(C.clamp01((t - S.t0) / (S.t1 - S.t0)) * (P.length - 1));
        if (t < S.t0) break;
        if (d.idx < upto) {
          // shadow for this chunk, then the braid slices
          lx.save(); lx.strokeStyle = 'rgba(16,10,40,.35)'; lx.lineWidth = w * 1.05; lx.lineCap = 'round'; lx.beginPath(); lx.moveTo(P[d.idx][0] + w * .18, P[d.idx][1] + w * .28);
          for (let i = d.idx + 1; i <= upto; i++) lx.lineTo(P[i][0] + w * .18, P[i][1] + w * .28); lx.stroke(); lx.restore();
          for (let i = Math.max(1, d.idx); i <= upto; i++) {
            const a = P[i - 1], b = P[i], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
            const sx = ((d.dist * k) % tw + tw) % tw, sw = Math.min(tw - sx, Math.max(1, k * 1.2));
            lx.save(); lx.translate(a[0], a[1]); lx.rotate(ang); lx.drawImage(img, sx, 0, sw, th, -.3, -w / 2, sw / k + .6, w); lx.restore();
            d.dist += Math.hypot(b[0] - a[0], b[1] - a[1]);
          }
          d.idx = upto;
        }
        if (t < S.t1) { head = P[upto]; break; }
        d.seg++; d.idx = 0;
      }
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(d.lay.c, 0, 0); x.restore();
      x.save(); x.globalCompositeOperation = 'lighter';
      if (head && !final) {           // gold bead leading the thread
        const r = w * 1.6, g = x.createRadialGradient(head[0], head[1], 0, head[0], head[1], r * 1.6);
        g.addColorStop(0, 'rgba(255,248,220,1)'); g.addColorStop(.25, 'rgba(255,210,120,.85)'); g.addColorStop(1, 'rgba(255,140,80,0)');
        x.fillStyle = g; x.beginPath(); x.arc(head[0], head[1], r * 1.6, 0, 6.283); x.fill();
      }
      const idle = Math.max(0, time - FX.duration);
      if (!final && idle > 0) {      // silk sheen travelling along the whole cord
        const tot = d.segs.reduce((a, s) => a + s.L, 0), pos = (idle * L.size * 3.2) % (tot + L.size * 6) - L.size * 2; let acc = 0;
        x.lineCap = 'round'; x.lineWidth = w * .35;
        for (const S of d.segs) { const a0 = pos - acc, P = S.p; if (a0 > -L.size * 1.2 && a0 < S.L + L.size * 1.2) {
            for (let i = Math.max(1, Math.floor(a0 - L.size)); i < Math.min(P.length, a0 + L.size); i += 3) { const f = 1 - Math.abs(i - a0) / L.size; if (f <= 0) continue;
              x.strokeStyle = `rgba(255,236,210,${(.24 * f * f).toFixed(3)})`; x.beginPath(); x.moveTo(P[i - 1][0], P[i - 1][1] - w * .14); x.lineTo(P[Math.min(P.length - 1, i + 3)][0], P[Math.min(P.length - 1, i + 3)][1] - w * .14); x.stroke(); } }
          acc += S.L; }
      }
      x.restore();
    },
  };
  window.RedCord = { label: 'Red cord (kumihimo)', defaults: FX.defaults, render: (el, o) => C.run(el, Object.assign({}, FX.defaults, o), FX) };
  LetterFX.redCord = window.RedCord;
})();
