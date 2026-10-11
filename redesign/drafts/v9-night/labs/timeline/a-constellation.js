/* A · constellation
   The Experience section pins to a single night-sky stage. A gold ecliptic arc carries the years 2014-2026;
   each job is its own constellation drawn above its years. Scrolling moves a comet along the ecliptic:
   stars ignite and the lines between them draw continuously as it passes. Active jobs surface as cards. */
(() => {
  const { JOBS, Y0, Y1, clamp, smooth, lerp, reduce, DPR } = TL;
  const stage = document.getElementById('cnStage'), cv = document.getElementById('cnCanvas'), g = cv.getContext('2d');
  const yearEl = document.getElementById('cnYear');
  const deck = TL.makeDeck(document.getElementById('cnDeck'), { center: () => !narrow });
  let W = 0, H = 0, narrow = false, R = null, figs = [];
  let target = 0, prog = 0;   // scroll progress 0..1 and its eased follower

  // each job's figure: a chain of stars over its years plus one branch star, so it reads as a shape
  const SHAPES = {
    edit: { lane: .22, n: 7, amp: .55, seed: 1.2, branch: [2, -.9] },
    it:   { lane: .78, n: 9, amp: .4, seed: 3.1, branch: [5, .8] },
    lock: { lane: .16, n: 4, amp: .5, seed: 5.4, branch: [1, .9] },
    ext:  { lane: .4, n: 4, amp: .6, seed: 2.2, branch: [2, -.8] },
  };
  const yx = y => R.x + (y - Y0) / (Y1 - Y0) * R.w;
  const axisY = x => R.ay - Math.sin(Math.PI * clamp((x - R.x) / R.w)) * R.arch;

  function layout() {
    W = stage.clientWidth; H = stage.clientHeight; narrow = W < 820;
    Object.assign(TL.opts, narrow ? { moonX: .82, moonY: .93 } : { moonX: .1, moonY: .13 });
    cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
    R = narrow ? { x: 28, w: W - 56, y: H * .16, h: H * .2, ay: H * .44, arch: H * .03 }
               : { x: W * .4, w: W * .55, y: H * .16, h: H * .44, ay: H * .8, arch: H * .06 };
    figs = JOBS.map(j => {
      const s = SHAPES[j.id], x0 = yx(j.from + .1), x1 = yx(Math.min(j.to, 2026.6));
      const stars = Array.from({ length: s.n }, (_, i) => {
        const u = i / (s.n - 1), x = lerp(x0, x1, u);
        return { x, y: R.y + R.h * (s.lane + Math.sin(i * 2.3 + s.seed) * s.amp * .22), r: 1.6 + ((i * 7 + s.n) % 3) * .7 + (i === 0 ? 1.4 : 0), tw: i * 1.7 + s.seed };
      });
      const [bi, bd] = s.branch, b = stars[bi];
      stars.push({ x: b.x + (x1 - x0) / s.n * .5, y: b.y + R.h * .2 * bd, r: 1.8, tw: 9 });
      const edges = stars.slice(0, s.n - 1).map((_, i) => [i, i + 1]); edges.push([bi, s.n]);
      return { j, stars, edges };
    });
  }

  function glowDot(x, y, r, a, warm) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r * 6);
    gr.addColorStop(0, `rgba(255,${warm ? 236 : 246},${warm ? 190 : 225},${a})`); gr.addColorStop(.25, `rgba(255,214,120,${a * .35})`); gr.addColorStop(1, 'rgba(255,214,120,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 6, 0, 7); g.fill();
    g.fillStyle = `rgba(255,248,230,${a})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }

  function draw(t) {
    prog = reduce ? target : lerp(prog, target, .12);
    const c = Y0 - .3 + prog * (Y1 - Y0 - .2), cx = yx(c);
    g.clearRect(0, 0, W, H);
    // ecliptic: faint full arc, lit up to the comet
    g.lineCap = 'round';
    const arc = (xa, xb) => { g.beginPath(); for (let x = xa; x <= xb; x += 6) g.lineTo(x, axisY(x)); g.lineTo(xb, axisY(xb)); g.stroke(); };
    g.strokeStyle = 'rgba(255,233,176,.18)'; g.lineWidth = 1; arc(R.x - 20, R.x + R.w + 20);
    g.save(); g.shadowColor = 'rgba(255,214,120,.8)'; g.shadowBlur = 10; g.strokeStyle = 'rgba(255,224,150,.85)'; g.lineWidth = 1.6; arc(R.x - 20, cx); g.restore();
    // year ticks
    g.font = `500 ${narrow ? 11 : 13}px "Cormorant Garamond"`; g.textAlign = 'center';
    for (let y = Y0; y <= 2026; y++) {
      const x = yx(y + .5), ay = axisY(x), lit = smooth((cx - x) / 30 + 1);
      g.save(); g.translate(x, ay); g.rotate(Math.PI / 4); g.fillStyle = `rgba(255,233,176,${.25 + .6 * lit})`; g.fillRect(-2, -2, 4, 4); g.restore();
      if (!narrow || y % 2 === 0) { g.fillStyle = `rgba(243,234,214,${.3 + .6 * lit})`; g.fillText(y, x, ay + (narrow ? 20 : 26)); }
    }
    // constellations
    for (const f of figs) {
      const { stars, edges, j } = f;
      g.save(); g.shadowColor = 'rgba(255,214,120,.9)'; g.shadowBlur = 8; g.strokeStyle = 'rgba(255,226,160,.8)'; g.lineWidth = 1.3;
      for (const [a, b] of edges) {
        const A = stars[a], B = stars[b], k = clamp((cx - A.x) / Math.max(1, Math.abs(B.x - A.x) + 40));
        if (k <= 0) continue;
        g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(lerp(A.x, B.x, k), lerp(A.y, B.y, k)); g.stroke();
      }
      g.restore();
      // faint guide from the first star down to its year on the ecliptic
      const s0 = stars[0], lit0 = smooth((cx - s0.x) / 40 + 1);
      g.setLineDash([2, 6]); g.strokeStyle = `rgba(255,233,176,${.08 + .22 * lit0})`; g.lineWidth = 1;
      g.beginPath(); g.moveTo(s0.x, s0.y + 8); g.lineTo(s0.x, axisY(s0.x) - 6); g.stroke(); g.setLineDash([]);
      for (const s of stars) {
        const lit = smooth((cx - s.x) / 26 + 1), tw = reduce ? 1 : .8 + .2 * Math.sin(t * 2.2 + s.tw);
        glowDot(s.x, s.y, s.r * (1 + lit * .5), (.18 + .82 * lit) * tw, lit > .5);
      }
      // name beside the first star
      g.font = `600 ${narrow ? 12 : 15}px "Cormorant Garamond"`; g.textAlign = 'left';
      g.fillStyle = `rgba(255,217,138,${.15 + .85 * lit0})`;
      const label = narrow ? j.title.replace(' · Extropian', '').toUpperCase() : j.title.toUpperCase();
      g.save(); g.letterSpacing = narrow ? '1px' : '3px';
      const top = Math.min(...stars.map(s => s.y)), tw = g.measureText(label).width;
      g.fillText(label, Math.min(s0.x - 4, R.x + R.w + 10 - tw), top - (narrow ? 12 : 18)); g.restore();
    }
    // comet on the ecliptic + a moonbeam rising through the sky
    const cy = axisY(cx);
    const beam = g.createLinearGradient(0, R.y - 30, 0, cy);
    beam.addColorStop(0, 'rgba(255,226,160,0)'); beam.addColorStop(1, 'rgba(255,226,160,.22)');
    g.fillStyle = beam; g.fillRect(cx - 1, R.y - 30, 2, cy - R.y + 30);
    for (let i = 10; i > 0; i--) { const x = cx - i * 7, k = 1 - i / 11; glowDot(x, axisY(x), 1.2 + k, .05 + .25 * k, true); }
    glowDot(cx, cy, 3.4, 1, true);
    // cards for whatever is active at this moment
    const acts = {}; for (const j of JOBS) acts[j.id] = TL.activity(j, c);
    deck.update(acts);
    yearEl.textContent = Math.floor(Math.min(c, 2026));
  }

  layout(); addEventListener('resize', layout); document.fonts.ready.then(layout);
  if (window.ScrollTrigger) {
    ScrollTrigger.create({ trigger: stage, pin: true, start: 'top top', end: () => '+=' + innerHeight * 3.2, onUpdate: st => target = st.progress, onRefresh: layout });
  }
  TL.loops.push(draw);
})();
