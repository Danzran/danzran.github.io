/* D · moon dial
   The section pins on a large moon ringed by a dial of years. Each job is an orbit: a gold-lit water arc
   on its own radius spanning its years, so overlaps sit side by side. Scrolling turns the dial so the
   current moment always meets the pointer at the top; arcs fill in as the pointer passes, the moon waxes
   from a crescent to full over the whole career, and the active jobs surface as cards. */
(() => {
  const { JOBS, Y0, Y1, clamp, smooth, lerp, reduce, DPR } = TL;
  TL.opts.moon = false;   // the dial's moon is the moon
  const stage = document.getElementById('dlStage'), cv = document.getElementById('dlCanvas'), g = cv.getContext('2d');
  const deck = TL.makeDeck(document.getElementById('dlDeck'), { center: () => !narrow, dx: 26 });
  const ORBIT = { edit: 0, it: 1, lock: 2, ext: 2 };
  const SWEEP = 300 / (Y1 - Y0) * Math.PI / 180;   // radians per year; the ring leaves a gap so the ends read
  let W, H, narrow, cx, cy, Rm, Rd, target = 0, prog = 0;

  function layout() {
    W = stage.clientWidth; H = stage.clientHeight; narrow = W < 820;
    cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (narrow) { Rm = Math.min(W * .16, H * .085); cx = W / 2; cy = H * .27; }
    else { Rm = Math.min(H * .17, W * .11); cx = W * .36; cy = H * .55; }
    Rd = Rm * 1.42;
  }
  const orbitR = k => Rd + (narrow ? 16 : 26) + k * (narrow ? 13 : 20);

  function drawMoon(p, t) {
    // halo
    const halo = g.createRadialGradient(cx, cy, Rm * .8, cx, cy, Rm * 3.2);
    halo.addColorStop(0, `rgba(255,226,160,${.12 + .2 * p})`); halo.addColorStop(1, 'rgba(255,226,160,0)');
    g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, Rm * 3.2, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, Rm, 0, 7); g.clip();
    const mg = g.createRadialGradient(cx - Rm * .3, cy - Rm * .3, Rm * .1, cx, cy, Rm);
    mg.addColorStop(0, '#fffaf0'); mg.addColorStop(.7, '#fbeccb'); mg.addColorStop(1, '#efd59c');
    g.fillStyle = mg; g.fillRect(cx - Rm, cy - Rm, Rm * 2, Rm * 2);
    // soft maria
    [[-.3, -.2, .34], [.22, .08, .26], [-.05, .4, .2], [.38, -.38, .14], [-.48, .28, .14], [.1, -.5, .1]].forEach(([x, y, r], i) => {
      const X = cx + x * Rm, Y = cy + y * Rm, mr = g.createRadialGradient(X, Y, 0, X, Y, r * Rm);
      mr.addColorStop(0, `rgba(190,165,118,${.26 - i * .02})`); mr.addColorStop(.7, 'rgba(190,165,118,.1)'); mr.addColorStop(1, 'rgba(190,165,118,0)');
      g.fillStyle = mr; g.beginPath(); g.arc(X, Y, r * Rm, 0, 7); g.fill();
    });
    // the shadow slides off as the career grows: crescent -> full
    const off = lerp(.28, 2.15, smooth(p)) * Rm;
    g.fillStyle = 'rgba(10,22,62,.88)'; g.beginPath(); g.arc(cx - off, cy, Rm * 1.02, 0, 7); g.fill();
    g.restore();
  }

  function arcPath(r, a0, a1) { g.beginPath(); g.arc(cx, cy, r, a0, a1); }

  function draw(t) {
    prog = reduce ? target : lerp(prog, target, .12);
    const c = Y0 - .2 + prog * (2026.7 - Y0 + .2);
    const ang = y => -Math.PI / 2 + (y - c) * SWEEP;   // the current moment sits at 12 o'clock
    g.clearRect(0, 0, W, H);
    drawMoon(prog, t);
    // dial ring + year ticks
    g.strokeStyle = 'rgba(255,233,176,.35)'; g.lineWidth = 1;
    arcPath(Rd, ang(Y0), ang(Y1)); g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let y = Y0; y <= Y1; y++) {
      const a = ang(y), near = 1 - clamp(Math.abs(y + .5 - c) / 3);
      g.strokeStyle = `rgba(255,233,176,${.4 + .5 * near})`; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * (Rd - 7), cy + Math.sin(a) * (Rd - 7)); g.lineTo(cx + Math.cos(a) * (Rd + 7), cy + Math.sin(a) * (Rd + 7)); g.stroke();
      for (let m = 1; m < 4; m++) { const am = ang(y + m / 4); g.beginPath(); g.moveTo(cx + Math.cos(am) * (Rd - 3), cy + Math.sin(am) * (Rd - 3)); g.lineTo(cx + Math.cos(am) * (Rd + 3), cy + Math.sin(am) * (Rd + 3)); g.stroke(); }
      if (y === Y1) continue;
      const am = ang(y + .5), rr = Rd - (narrow ? 15 : 20);
      if (narrow && y % 2) continue;
      g.font = `${near > .6 ? 600 : 500} ${narrow ? 10 : 13 + near * 4}px "Cormorant Garamond"`;
      g.fillStyle = `rgba(243,234,214,${.45 + .55 * near})`;
      const yr = am + Math.PI / 2; g.save(); g.translate(cx + Math.cos(am) * rr, cy + Math.sin(am) * rr); g.rotate(Math.cos(yr) < 0 ? yr + Math.PI : yr); g.fillText(y, 0, 0); g.restore();
    }
    // orbits: faint dotted path for the whole job, glowing water where time has passed
    for (const j of JOBS) {
      const r = orbitR(ORBIT[j.id]), a0 = ang(j.from), a1 = ang(Math.min(j.to, 2026.95)), aNow = ang(clamp(c, j.from, j.to));
      g.setLineDash([2, 6]); g.strokeStyle = 'rgba(255,233,176,.28)'; g.lineWidth = 1.2; arcPath(r, a0, a1); g.stroke(); g.setLineDash([]);
      if (c <= j.from) continue;
      const w = narrow ? 7 : 11;
      g.save(); g.lineCap = 'round';
      g.shadowColor = 'rgba(255,214,120,.8)'; g.shadowBlur = 16;
      g.strokeStyle = 'rgba(77,143,224,.85)'; g.lineWidth = w; arcPath(r, a0, aNow); g.stroke();
      g.shadowBlur = 0;
      g.strokeStyle = 'rgba(214,232,255,.7)'; g.lineWidth = w * .35; arcPath(r - w * .28, a0, aNow); g.stroke();
      // streaks flowing along the orbit
      g.strokeStyle = 'rgba(255,217,138,.95)'; g.lineWidth = 1.4; g.setLineDash([14, 22]); g.lineDashOffset = -t * 40;
      arcPath(r + w * .15, a0, aNow); g.stroke();
      g.strokeStyle = 'rgba(255,243,196,.9)'; g.setLineDash([6, 30]); g.lineDashOffset = -t * 64; arcPath(r - w * .1, a0, aNow); g.stroke();
      g.restore();
      // a bright bead where the orbit is still being drawn
      if (c < j.to) { const bx = cx + Math.cos(aNow) * r, by = cy + Math.sin(aNow) * r, gr = g.createRadialGradient(bx, by, 0, bx, by, w * 2.2); gr.addColorStop(0, 'rgba(255,248,230,1)'); gr.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(bx, by, w * 2.2, 0, 7); g.fill(); }
      // name at the start of the orbit (desktop)
      if (!narrow) {
        const al = a0 - .02, lr = r + 4;
        g.font = '600 12px "Cormorant Garamond"'; g.fillStyle = `rgba(255,217,138,${.5 + .5 * TL.activity(j, c, .6)})`;
        // tangent text that ends at the orbit's start, turned so it never reads upside down
        let rot = al + Math.PI / 2; const flip = Math.cos(rot) < 0; if (flip) rot += Math.PI;
        g.save(); g.translate(cx + Math.cos(al) * lr, cy + Math.sin(al) * lr); g.rotate(rot); g.textAlign = flip ? 'left' : 'right'; g.letterSpacing = '2px';
        g.fillText(j.title.replace(' · Extropian', '').toUpperCase(), flip ? 8 : -8, 0); g.restore();
      }
    }
    // pointer at 12 o'clock
    const top = cy - orbitR(2) - (narrow ? 22 : 34);
    g.strokeStyle = 'rgba(255,226,160,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy - Rm - 4); g.lineTo(cx, top + 6); g.stroke();
    g.fillStyle = '#f6c25e'; g.save(); g.translate(cx, top); g.rotate(Math.PI / 4); g.fillRect(-5, -5, 10, 10); g.restore();
    g.font = `600 ${narrow ? 18 : 26}px "Cormorant Garamond"`; g.fillStyle = 'rgba(255,241,207,.95)'; g.textAlign = 'center';
    g.save(); g.shadowColor = 'rgba(255,214,120,.8)'; g.shadowBlur = 12; g.fillText(Math.floor(Math.max(Y0, Math.min(2026, c))), cx, top - (narrow ? 18 : 24)); g.restore();
    // cards
    const acts = {}; JOBS.forEach(j => acts[j.id] = TL.activity(j, c, .5));
    deck.update(acts);
  }

  layout(); addEventListener('resize', layout);
  ScrollTrigger.create({ trigger: stage, pin: true, start: 'top top', end: () => '+=' + innerHeight * 3.4, onUpdate: st => target = st.progress, onRefresh: layout });
  TL.loops.push(draw);
})();
