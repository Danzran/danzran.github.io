/* Star motes.
   Five tiny gold-ivory motes keep company with the pointer at a distance: each has its own
   slow orbit and its own spring, so they drift and lag differently and never form a trail.
   Over a link, button or card they leave the pointer and settle on points around the
   element's edge, breathing in and out. Native cursor kept.
   Touch: off. Reduced motion: off entirely. */
(window.CURSORS = window.CURSORS || {}).fireflies = (() => {
  const COUNT = 5, SEL = 'a,button,[role="button"],.card,[data-cursor]';
  let cv, ctx, raf = 0, on = false, dpr = 1, target = null, motes = [], prev = 0, t = 0;
  const p = { x: innerWidth / 2, y: innerHeight / 2, vis: 0 }, vis = { a: 0 };

  function size() { dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  function seed() {
    motes = [...Array(COUNT)].map((_, i) => ({
      x: p.x, y: p.y, vx: 0, vy: 0,
      ang: (i / COUNT) * Math.PI * 2 + Math.random(), dist: 46 + Math.random() * 46, spin: (Math.random() < .5 ? -1 : 1) * (0.25 + Math.random() * 0.3),
      k: 0.010 + Math.random() * 0.012, ph: Math.random() * 10, r: 1.7 + Math.random() * 1.2, edge: Math.random()
    }));
  }
  function move(e) {
    if (e.pointerType === 'touch') return;
    p.x = e.clientX; p.y = e.clientY; p.vis = 1;
    target = e.target.closest ? e.target.closest(SEL) : null;
  }
  const leave = e => { if (!e.relatedTarget) { p.vis = 0; target = null; } };

  // point on a rounded rect's perimeter (u in 0..1), pushed out by `pad`
  function perim(r, u, pad) {
    const w = r.width + pad * 2, h = r.height + pad * 2, L = 2 * (w + h); let s = (u % 1) * L;
    const x0 = r.left - pad, y0 = r.top - pad;
    if (s < w) return [x0 + s, y0]; s -= w;
    if (s < h) return [x0 + w, y0 + s]; s -= h;
    if (s < w) return [x0 + w - s, y0 + h]; s -= w;
    return [x0, y0 + h - s];
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (prev || now)) / 1000); prev = now; t += dt;
    vis.a += (p.vis - vis.a) * 0.05;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    const r = target && target.isConnected ? target.getBoundingClientRect() : null;
    for (const m of motes) {
      m.ang += m.spin * dt;
      let gx, gy;
      if (r) { [gx, gy] = perim(r, m.edge + t * 0.012 * m.spin, 10 + Math.sin(t * 0.8 + m.ph) * 4); }
      else { const d = m.dist + Math.sin(t * 0.7 + m.ph) * 12; gx = p.x + Math.cos(m.ang) * d; gy = p.y + Math.sin(m.ang) * d * 0.8; }
      gx += Math.sin(t * 1.3 + m.ph * 2) * 5; gy += Math.cos(t * 1.1 + m.ph) * 5;      // idle hover wander
      m.vx = (m.vx + (gx - m.x) * m.k) * 0.9; m.vy = (m.vy + (gy - m.y) * m.k) * 0.9; m.x += m.vx; m.y += m.vy;
      const blink = 0.55 + 0.45 * Math.pow(Math.sin(t * 1.1 + m.ph) * 0.5 + 0.5, 2), a = blink * vis.a;
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 6);
      g.addColorStop(0, `rgba(255,240,200,${(a * 0.95).toFixed(3)})`); g.addColorStop(0.25, `rgba(246,194,94,${(a * 0.45).toFixed(3)})`); g.addColorStop(1, 'rgba(246,194,94,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 6, 0, Math.PI * 2); ctx.fill();
    }
  }

  return {
    label: 'star motes', note: 'five gold motes drift around the pointer at a distance and gather along the edge of whatever you hover',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return; on = true;
      cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
      document.body.appendChild(cv); ctx = cv.getContext('2d'); size(); seed();
      addEventListener('resize', size); addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); prev = 0; target = null; vis.a = 0;
      removeEventListener('resize', size); removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      cv.remove();
    }
  };
})();
