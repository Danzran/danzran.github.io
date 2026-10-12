/* Moonlight (round 2).
   The pointer is the viewer, not a graphic. The painted moon turns its lit rim slightly toward
   the pointer and its halo warms as you get near it, and a path of moon glints on the water
   runs from under the moon toward the pointer's x, the way a reflection follows you along a
   shore. Nothing is drawn at the cursor. The layer sits under the content (z-index 1).
   Plate mapping: `fit` says how plate-night.webp (1920x1081) is laid out. The lab default is
   CSS cover at 50% 30%. For v9's #sky canvas use
     CURSORS.moonlight.fit = { posY: .5, zoom: 1.06, scrollK: .35 }
   Touch: off. Reduced motion: glints hold still, nothing eases. */
(window.CURSORS = window.CURSORS || {}).moonlight = (() => {
  const PW = 1920, PH = 1081, MOON = [1626, 221, 84], HORIZON = 889, GLINTS = 260;
  const api = { fit: { posY: 0.3, zoom: 1, scrollK: 0 } };
  let cv, ctx, raf = 0, on = false, dpr = 1, prev = 0, t = 0, glints = [];
  const p = { x: -1, y: -1, vis: 0 }, e = { x: -1, y: -1, a: 0 };
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function view(px, py) {
    const f = api.fit, W = innerWidth, H = innerHeight, s = Math.max(W / PW, H / PH) * (f.zoom || 1);
    return [(W - PW * s) / 2 + px * s, (H - PH * s) * (f.posY ?? 0.5) - scrollY * (f.scrollK || 0) + py * s, s];
  }
  function size() { dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  function seed() {
    let s = 97; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    // u: 0 at the horizon .. 1 at the bottom of the screen (squared, so glints crowd near the horizon); v: across the path
    glints = [...Array(GLINTS)].map(() => ({ u: Math.pow(r(), 1.7), v: (r() + r() + r()) / 3 - 0.5, ph: r() * 6.3, sp: 0.8 + r() * 1.6 }));
  }
  const move = ev => { if (ev.pointerType === 'touch') return; p.x = ev.clientX; p.y = ev.clientY; p.vis = 1; };
  const leave = ev => { if (!ev.relatedTarget) p.vis = 0; };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const rm = reduce(), dt = Math.min(0.05, (now - (prev || now)) / 1000); prev = now; t += rm ? 0 : dt;
    if (e.x < 0 || rm) { e.x = p.x; e.y = p.y; } else { e.x += (p.x - e.x) * 0.05; e.y += (p.y - e.y) * 0.05; }
    e.a += (p.vis - e.a) * (rm ? 1 : 0.04);
    const W = innerWidth, H = innerHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    if (e.a < 0.01 || e.x < 0) return;
    const [mx, my, s] = view(MOON[0], MOON[1]), mr = MOON[2] * s, hy = view(0, HORIZON)[1];

    // 1. halo: warms as the pointer comes closer to the moon
    const near = Math.max(0, 1 - Math.hypot(e.x - mx, e.y - my) / (W * 0.8));
    const g = ctx.createRadialGradient(mx, my, mr * 0.9, mx, my, mr * 3.4);
    g.addColorStop(0, `rgba(255,232,180,${((0.10 + 0.16 * near) * e.a).toFixed(3)})`); g.addColorStop(1, 'rgba(255,232,180,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, mr * 3.4, 0, Math.PI * 2); ctx.fill();

    // 2. the lit rim turns toward the pointer: a soft bright arc on the limb that faces it
    const ang = Math.atan2(e.y - my, e.x - mx);
    ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(255,214,140,.9)'; ctx.shadowBlur = 14 * s;
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(255,240,205,${((0.55 - i * 0.15) * e.a).toFixed(3)})`; ctx.lineWidth = (2 + i * 3) * s;
      ctx.beginPath(); ctx.arc(mx, my, mr * (1.04 + i * 0.03), ang - 0.8 + i * 0.12, ang + 0.8 - i * 0.12); ctx.stroke();
    }
    ctx.restore();

    // 3. glint path on the water, from under the moon (narrow, at the horizon) to the pointer's x (wide, at the foot)
    if (hy < H - 4) {
      ctx.lineCap = 'round';
      const bottom = H, depth = bottom - hy, footX = mx + (e.x - mx) * 0.85;
      for (const q of glints) {
        const y = hy + 3 + q.u * depth, cx = mx + (footX - mx) * q.u;
        const half = 14 + q.u * 190, x = cx + q.v * 2 * half;
        const sh = rm ? 0.7 : 0.5 + 0.5 * Math.sin(t * q.sp * 2.2 + q.ph);
        const a = Math.min(1, sh * sh * (0.45 + 0.75 * (1 - Math.abs(q.v) * 2))) * e.a;
        const len = 3 + q.u * 26 * (0.6 + sh * 0.4);
        ctx.strokeStyle = `rgba(255,236,190,${a.toFixed(3)})`; ctx.lineWidth = 0.8 + q.u * 1.6;
        ctx.beginPath(); ctx.moveTo(x - len / 2, y); ctx.lineTo(x + len / 2, y); ctx.stroke();
      }
    }
  }

  return Object.assign(api, {
    label: 'moonlight', note: 'the pointer is the viewer: the moon’s lit rim turns toward you and a path of glints on the water follows your x',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';
      document.body.appendChild(cv); ctx = cv.getContext('2d'); size(); seed();
      addEventListener('resize', size); addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); prev = 0; e.x = e.y = -1; e.a = 0;
      removeEventListener('resize', size); removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      cv.remove();
    }
  });
})();
