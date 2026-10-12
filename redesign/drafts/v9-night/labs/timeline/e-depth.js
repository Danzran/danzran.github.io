/* E · depth flight
   The section pins and scrolling flies a camera forward through the night. Each year is a gold halo you
   pass through; each job's card hangs at the depth of its start year, and a gold-lit rail runs along the
   floor for as long as the job lasted, so overlapping jobs run as parallel rails into the distance.
   Stars streak with the camera's speed. Projection is done in JS (no CSS 3D) so the frosted cards stay crisp. */
(() => {
  const { JOBS, Y0, clamp, smooth, lerp, reduce, DPR } = TL;
  Object.assign(TL.opts, { moonX: .5, moonY: .36 });   // the moon sits at the vanishing point
  const stage = document.getElementById('dpStage'), cv = document.getElementById('dpCanvas'), g = cv.getContext('2d');
  const world = document.getElementById('dpWorld'), hud = document.getElementById('dpHud');
  world.innerHTML = JOBS.map(j => TL.cardHTML(j, j.video ? 'has-video' : '')).join('');
  const cards = [...world.children];
  hud.innerHTML = '<span class="yr"></span>' + JOBS.map(j => `<span class="chip">${j.title.replace(' · Extropian', '').replace('&', '&amp;')}</span>`).join('');
  const hudYr = hud.querySelector('.yr'), chips = [...hud.querySelectorAll('.chip')];
  const DEPTH = 1000, zOf = y => (y - Y0) * DEPTH;
  const SIDE = { edit: [-1, -.05], it: [1, .05], lock: [-1, .02], ext: [1, -.04] };
  const RAIL = { edit: -1.5, it: .5, lock: -.5, ext: -.5 };
  const stars = Array.from({ length: 260 }, () => ({ x: (Math.random() - .5) * 4000, y: (Math.random() - .5) * 2600, z: Math.random() * zOf(2027.5) - 800 }));
  let W, H, narrow, F, cx, cy, floor, target = 0, prog = 0, lastCam = null;

  function layout() {
    W = stage.clientWidth; H = stage.clientHeight; narrow = W < 820;
    cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
    F = narrow ? 520 : 900; cx = W / 2; cy = H * .45; floor = H * (narrow ? .42 : .5);
  }
  // the camera eases off as it reaches each card at reading distance, so the flight never feels stepped
  // but every card gets a moment: a table of camera depth vs. scroll, weighted by a smooth bump per card
  const READ = 380, CAM0 = -700, CAM1 = zOf(2026.2) - 300, table = [];
  (function buildTable() {
    let acc = 0; const N = 600;
    for (let i = 0; i <= N; i++) {
      const z = lerp(CAM0, CAM1, i / N);
      table.push([acc, z]);
      let w = 1; for (const j of JOBS) w += 3.2 * Math.exp(-Math.pow((z - (zOf(j.from) + 120 - READ)) / 380, 2));
      acc += w;
    }
    table.forEach(r => r[0] /= acc);
  })();
  function camAt(p) {
    let lo = 0, hi = table.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (table[m][0] <= p) lo = m; else hi = m; }
    const [pa, za] = table[lo], [pb, zb] = table[hi];
    return lerp(za, zb, pb > pa ? clamp((p - pa) / (pb - pa)) : 0);
  }
  const proj = (x, y, z, cam) => { const d = z - cam, s = F / (F + d); return { x: cx + x * s, y: cy + y * s, s, d }; };

  function draw(t) {
    prog = reduce ? target : lerp(prog, target, .1);
    const cam = camAt(prog), vel = lastCam == null ? 0 : cam - lastCam; lastCam = cam;
    const c = Y0 + (cam + 700) / DEPTH;   // the year at roughly reading distance
    g.clearRect(0, 0, W, H);
    // stars, streaked by speed
    g.lineCap = 'round';
    for (const s of stars) {
      let z = s.z; if (z - cam < -F * .9) continue;
      const a = proj(s.x, s.y, z, cam); if (a.d > 9000) continue;
      const b = proj(s.x, s.y, z + Math.min(400, Math.abs(vel) * 6 + 4), cam);
      const al = clamp(1 - a.d / 9000) * clamp((a.d + F * .9) / 300);
      g.strokeStyle = `rgba(255,246,220,${(.25 + .6 * al).toFixed(3)})`; g.lineWidth = Math.max(.6, 2.2 * a.s);
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    // floor rails: one per job, from its start year to its end, fading into the distance
    for (const j of JOBS) {
      const rx = RAIL[j.id] * (narrow ? 90 : 220), z0 = Math.max(zOf(j.from), cam - F * .8), z1 = Math.min(zOf(Math.min(j.to, 2026.9)), cam + 12000);
      if (z1 <= z0) continue;
      g.save(); g.shadowColor = 'rgba(255,214,120,.8)'; g.shadowBlur = 10;
      const N = 40;
      for (let i = 0; i < N; i++) {
        const za = lerp(z0, z1, i / N), zb = lerp(z0, z1, (i + 1) / N), A = proj(rx, floor, za, cam), B = proj(rx, floor, zb, cam);
        const fade = clamp(1 - A.d / 11000) * clamp((A.d + F * .8) / 400);
        g.strokeStyle = `rgba(77,143,224,${(.75 * fade).toFixed(3)})`; g.lineWidth = Math.max(1, 26 * A.s);
        g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke();
        g.strokeStyle = `rgba(255,226,160,${(.9 * fade).toFixed(3)})`; g.lineWidth = Math.max(.6, 4 * A.s);
        g.beginPath(); g.moveTo(A.x, A.y - 6 * A.s); g.lineTo(B.x, B.y - 6 * B.s); g.stroke();
      }
      g.restore();
      // glints flowing along the rail toward the viewer
      for (let k = 0; k < 14; k++) {
        const z = z1 - ((t * 900 + k * 870) % (z1 - z0 + 1)); const P = proj(rx, floor - 6, z, cam);
        if (P.d < -F * .8) continue;
        g.fillStyle = `rgba(255,243,196,${(clamp(1 - P.d / 9000) * .9).toFixed(3)})`; g.beginPath(); g.arc(P.x, P.y, Math.max(1, 5 * P.s), 0, 7); g.fill();
      }
    }
    // year halos
    g.textAlign = 'center';
    for (let y = Y0; y <= 2026; y++) {
      const P = proj(0, 0, zOf(y), cam); if (P.d < -F * .85 || P.d > 12000) continue;
      const a = clamp(1 - P.d / 12000) * clamp((P.d + F * .85) / (F * .7)), r = (narrow ? 420 : 640) * P.s;
      g.save(); g.shadowColor = 'rgba(255,214,120,.9)'; g.shadowBlur = 18 * P.s;
      g.strokeStyle = `rgba(255,226,160,${(.55 * a).toFixed(3)})`; g.lineWidth = Math.max(.8, 3 * P.s);
      g.beginPath(); g.ellipse(P.x, P.y, r, r * .62, 0, 0, 7); g.stroke(); g.restore();
      g.font = `600 ${Math.max(8, 96 * P.s)}px "Cormorant Garamond"`; g.fillStyle = `rgba(255,241,207,${(.8 * a).toFixed(3)})`;
      g.fillText(y, P.x, P.y - r * .62 - 14 * P.s);
    }
    // cards
    JOBS.forEach((j, i) => {
      const el = cards[i], [sx, sy] = SIDE[j.id], z = zOf(j.from) + 120;
      const wx = narrow ? 0 : sx * (W < 1200 ? 330 : 420), wy = narrow ? (i % 2 ? 150 : -160) : sy * H;
      const P = proj(wx, wy, z, cam), near = clamp((P.d + 60) / 260), far = clamp(1 - (P.d - 2600) / 1800);
      const a = near * far;
      if (a < .005) { el.style.visibility = 'hidden'; return; }
      el.style.visibility = 'visible'; el.style.opacity = a.toFixed(3);
      el.style.filter = near < .99 ? `blur(${((1 - near) * 10).toFixed(1)}px)` : 'none';
      el.style.zIndex = String(10000 - Math.round(P.d));
      el.style.transform = `translate3d(${(P.x - el.offsetWidth / 2).toFixed(1)}px,${(P.y - el.offsetHeight / 2).toFixed(1)}px,0) scale(${Math.min(P.s, 2.4).toFixed(4)})`;
    });
    // HUD: the year and which jobs are running
    hudYr.textContent = Math.floor(clamp(c, Y0, 2026));
    JOBS.forEach((j, i) => { const a = TL.activity(j, c, .4); chips[i].style.opacity = (.3 + .7 * a).toFixed(3); chips[i].style.display = narrow && a < .05 ? 'none' : ''; });
  }

  layout(); addEventListener('resize', layout);
  ScrollTrigger.create({ trigger: stage, pin: true, start: 'top top', end: () => '+=' + innerHeight * 4.2, onUpdate: st => target = st.progress, onRefresh: layout });
  TL.loops.push(draw);
})();
