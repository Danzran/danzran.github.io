/* Rare ripples.
   Nothing follows the pointer. A click drops three thin gold-ivory rings that spread in
   perspective (flattened ellipses, like rings on the night water) and fade out; a quick flick
   of the mouse leaves a single ring where it was, at most every ~0.7 s. Optional water line:
   set CURSORS.ripples.horizon to a 0..1 viewport fraction and flick rings only happen below it
   (clicks still ring everywhere, flatter below the horizon).
   Native cursor kept. Touch: off. Reduced motion: off entirely. */
(window.CURSORS = window.CURSORS || {}).ripples = (() => {
  const FAST = 2.4, COOLDOWN = 700;          // px/ms that counts as a flick; min gap between flick rings
  let cv, ctx, raf = 0, on = false, dpr = 1, rings = [], last = null, lastFlick = 0;
  const api = { horizon: 0 };

  function size() { dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  const flat = y => (api.horizon && y > innerHeight * api.horizon) ? 0.28 : 0.4;
  function add(x, y, n, big) {
    for (let i = 0; i < n; i++) rings.push({ x, y, t: -i * 0.16, life: big ? 1.6 : 1.2, R: big ? 74 : 46, f: flat(y), w: big ? 1.5 : 1.1 });
  }
  function move(e) {
    if (e.pointerType === 'touch') return;
    const now = e.timeStamp;
    if (last && now - last.t > 0) {
      const v = Math.hypot(e.clientX - last.x, e.clientY - last.y) / (now - last.t);
      const below = !api.horizon || e.clientY > innerHeight * api.horizon;
      if (v > FAST && below && now - lastFlick > COOLDOWN) { lastFlick = now; add(e.clientX, e.clientY, 1, false); }
    }
    last = { x: e.clientX, y: e.clientY, t: now };
  }
  const down = e => { if (e.pointerType !== 'touch' && e.button === 0) add(e.clientX, e.clientY, 3, true); };

  let prev = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (prev || now)) / 1000); prev = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    rings = rings.filter(r => (r.t += dt) < r.life);
    for (const r of rings) {
      if (r.t < 0) continue;
      const u = r.t / r.life, e = 1 - Math.pow(1 - u, 3), rad = 6 + r.R * e;
      const a = Math.sin(Math.PI * Math.min(1, u * 1.15)) * Math.pow(1 - u, 0.6) * 0.85;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, rad, rad * r.f, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,236,190,${a.toFixed(3)})`; ctx.lineWidth = r.w * (1 - u * 0.5); ctx.stroke();
      // a faint gold glint on the near (lower) side of the ring, where moonlight would catch it
      ctx.beginPath(); ctx.ellipse(r.x, r.y, rad, rad * r.f, 0, Math.PI * 0.2, Math.PI * 0.8);
      ctx.strokeStyle = `rgba(246,194,94,${(a * 0.7).toFixed(3)})`; ctx.lineWidth = r.w * 1.8; ctx.stroke();
    }
  }

  return Object.assign(api, {
    label: 'ripples', note: 'nothing follows you; a click or a quick flick drops a few rings that spread like ripples on the night water',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return; on = true;
      cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
      document.body.appendChild(cv); ctx = cv.getContext('2d'); size();
      addEventListener('resize', size); addEventListener('pointermove', move, { passive: true }); addEventListener('pointerdown', down, { passive: true });
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); rings = []; last = null; prev = 0;
      removeEventListener('resize', size); removeEventListener('pointermove', move); removeEventListener('pointerdown', down);
      cv.remove();
    }
  });
})();
