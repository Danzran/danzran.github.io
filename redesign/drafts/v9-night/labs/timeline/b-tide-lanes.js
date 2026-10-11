/* B · tide lanes
   The section pins and scrolls sideways. A moonlit tide line runs through the middle of the stage with the
   years marked along it; under the surface each job is a gold-lit water current (water.js ribbons) in its own
   lane, so the overlapping eras run in parallel. A current flows in up to the "now" line as you scroll,
   and each job's card rides its current like a boat, then moors where the job ended. */
(() => {
  const { JOBS, Y0, Y1, clamp, smooth, lerp, reduce, DPR } = TL;
  Object.assign(Water.C, { deep: '#1d4fa8', mid: '#4d8fe0', light: '#ffd98a', foam: '#fff3c4', ink: '#0d1c40', edge: '#d6e8ff', s1: '#ffe9b0', s2: '#ffd27a', s3: '#f6c25e', glow: 'rgba(255,214,120,.55)', inkW: 1.6, inkA: .6, inkJ: 1.6 });
  Object.assign(TL.opts, { moonX: .82, moonY: .14 });
  const stage = document.getElementById('tdStage'), track = document.getElementById('tdTrack');
  const cv = document.getElementById('tdCanvas'), g = cv.getContext('2d');
  track.innerHTML = JOBS.map(j => TL.cardHTML(j, j.video ? 'has-video' : '')).join('') +
    Array.from({ length: 13 }, (_, i) => `<span class="td-year">${Y0 + i}</span>`).join('');
  const cards = [...track.querySelectorAll('.card')], years = [...track.querySelectorAll('.td-year')];
  const LANES = { edit: 0, it: 1, lock: 2, ext: 2 };   // lock and ext never overlap, so they share a lane
  let W, H, narrow, TW, yw, sea, laneY = [], laneH = [], target = 0, prog = 0;
  const yx = y => W * .12 + (y - Y0) * yw;

  function layout() {
    W = stage.clientWidth; H = stage.clientHeight; narrow = W < 820;
    Object.assign(TL.opts, narrow ? { moonX: .6, moonY: .08 } : { moonX: .82, moonY: .14 });
    cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
    yw = narrow ? 200 : Math.max(340, W * .27);
    TW = yx(Y1) + W * .5;
    track.style.width = TW + 'px';
    // lane heights follow the cards that ride in them (the reel card is the tallest)
    const ch = id => cards[JOBS.findIndex(j => j.id === id)].offsetHeight;
    laneH = [ch('edit'), Math.max(ch('it'), 0), Math.max(ch('lock'), ch('ext'))].map(h => h + (narrow ? 40 : 58));
    const total = laneH.reduce((a, b) => a + b, 0);
    sea = Math.max(H * .16, H - total - H * (narrow ? .07 : .06));
    let y = sea + (narrow ? 14 : 24); laneY = laneH.map(h => (y += h) - h);
    years.forEach((el, i) => { el.style.left = yx(Y0 + i) + 'px'; el.style.top = (sea - (narrow ? 30 : 38)) + 'px'; });
  }
  const riverY = l => laneY[l] + laneH[l] - (narrow ? 18 : 26);

  function ribbon(j, scrollX, nowX, t) {
    const y = riverY(LANES[j.id]), x0 = yx(j.from), x1 = Math.min(yx(j.to), nowX), amp = narrow ? 4 : 6;
    if (x1 <= x0 + 4) return null;
    const a = Math.max(x0, scrollX - 400), b = Math.min(x1, scrollX + W + 400);
    if (b <= a) return { x: x1 - scrollX, y };
    const pts = [], n = Math.max(3, Math.ceil((b - a) / 90));
    for (let i = 0; i <= n; i++) {
      const x = lerp(a, b, i / n);
      pts.push({ x: x - scrollX, y: y + Math.sin(x / 210 + t * .9 + LANES[j.id] * 1.7) * amp, z: 1 });
    }
    // taper only where the current really starts or where the tide has reached
    const width = narrow ? 13 : 19;
    Water.draw(g, pts, { width, t: t + LANES[j.id], side: 0, drawn: 0, alpha: .95, taper: a === x0 || b === x1 ? Math.min(160, (b - a) / 2) : 0.001 });
    return { x: x1 - scrollX, y: pts[pts.length - 1].y };
  }

  function draw(t) {
    prog = reduce ? target : lerp(prog, target, .14);
    const scrollX = prog * (TW - W), nowX = scrollX + W * (narrow ? .9 : .62);
    track.style.transform = `translate3d(${(-scrollX).toFixed(2)}px,0,0)`;
    g.clearRect(0, 0, W, H);
    // the sea under the tide line: deepening navy, a moon path of broken gold glints
    const sg = g.createLinearGradient(0, sea, 0, H);
    sg.addColorStop(0, 'rgba(20,48,110,.55)'); sg.addColorStop(1, 'rgba(8,18,52,.85)');
    g.fillStyle = sg; g.fillRect(0, sea, W, H - sea);
    const mx = W * TL.opts.moonX;
    for (let i = 0; i < 60; i++) {
      const yy = sea + 6 + Math.pow(i / 60, 1.4) * (H - sea), spread = 10 + i * 2.4, w = 6 + (i * 37 % 30);
      const x = mx + Math.sin(i * 12.9 + t * 1.3) * spread;
      g.fillStyle = `rgba(255,226,160,${(.5 - i / 140) * (.6 + .4 * Math.sin(t * 2 + i))})`; g.fillRect(x - w / 2, yy, w, 1.5);
    }
    // tide line: a soft glowing surface that ripples
    g.save(); g.shadowColor = 'rgba(255,214,120,.9)'; g.shadowBlur = 12; g.strokeStyle = 'rgba(255,233,176,.85)'; g.lineWidth = 1.6;
    g.beginPath(); for (let x = -10; x <= W + 10; x += 8) g.lineTo(x, sea + Math.sin((x + scrollX) / 90 + t * 1.4) * 2.2); g.stroke(); g.restore();
    // year ticks on the tide line
    for (let y = Y0; y <= 2026; y++) {
      const x = yx(y) - scrollX; if (x < -20 || x > W + 20) continue;
      g.fillStyle = 'rgba(255,233,176,.8)'; g.beginPath(); g.arc(x, sea, 3, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,233,176,.1)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, sea + 8); g.lineTo(x, H); g.stroke();
    }
    // currents
    g.font = `600 ${narrow ? 14 : 17}px "Patrick Hand"`;
    JOBS.forEach(j => {
      const head = ribbon(j, scrollX, nowX, t);
      if (head && head.x > -50 && head.x < W + 50 && yx(j.to) > nowX) {   // a bead of light where the tide is arriving
        const gr = g.createRadialGradient(head.x, head.y, 0, head.x, head.y, 26);
        gr.addColorStop(0, 'rgba(255,244,214,.95)'); gr.addColorStop(1, 'rgba(255,214,120,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(head.x, head.y, 26, 0, 7); g.fill();
      }
    });
    // the "now" line where the tide has reached
    const nx = nowX - scrollX, ny = sea;
    const beam = g.createLinearGradient(0, H * .05, 0, H);
    beam.addColorStop(0, 'rgba(255,226,160,0)'); beam.addColorStop(.55, 'rgba(255,226,160,.35)'); beam.addColorStop(1, 'rgba(255,226,160,0)');
    g.fillStyle = beam; g.fillRect(nx - .75, H * .05, 1.5, H * .95);
    const cy = Y0 + (nowX - W * .12) / yw;
    g.font = `600 ${narrow ? 22 : 30}px "Cormorant Garamond"`; g.fillStyle = 'rgba(255,233,176,.95)'; g.textAlign = 'center';
    g.save(); g.shadowColor = 'rgba(255,214,120,.8)'; g.shadowBlur = 14; g.fillText(Math.min(2026, Math.floor(cy)), nx, sea - (narrow ? 52 : 70)); g.restore();
    // cards ride the head of their current, then moor where the job ended
    cards.forEach((el, i) => {
      const j = JOBS[i], w = el.offsetWidth, x0 = yx(j.from), x1 = Math.max(x0, yx(j.to) - w - 30);
      const x = Math.max(clamp(nowX - w - (narrow ? 22 : 34), x0, x1), Math.min(x1, scrollX + 12)), a = smooth((nowX - x0) / (w + 34));
      el.style.opacity = (.12 + .88 * a).toFixed(3);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${(laneY[LANES[j.id]] + (1 - a) * 30).toFixed(1)}px, 0)`;
    });
  }

  layout(); addEventListener('resize', layout); document.fonts.ready.then(layout);
  ScrollTrigger.create({ trigger: stage, pin: true, start: 'top top', end: () => '+=' + Math.max(innerHeight * 3, (TW - W) * 1.1), onUpdate: st => target = st.progress, onRefresh: layout, invalidateOnRefresh: true });
  TL.loops.push(draw);
})();
