/* Parallax (round 2).
   No cursor graphic at all. The sky gains depth: every element marked [data-parallax="<depth>"]
   (the plate, a cloud layer, the moon...) drifts a few px against the pointer, and two faint star
   layers of its own sit at different depths, so near stars slide more than far ones.
   The page content never moves. Max drift is MAX px at depth 1.
   In v9: put data-parallax="1" on #sky (it is scaled up slightly so its edges never show).
   Touch: off. Reduced motion: off entirely. */
(window.CURSORS = window.CURSORS || {}).parallax = (() => {
  const MAX = 14, LAYERS = [{ d: 0.45, n: 1 / 26000, r: 0.7, a: 0.45 }, { d: 1.6, n: 1 / 60000, r: 1.1, a: 0.6 }];
  let cv, ctx, raf = 0, on = false, dpr = 1, els = [], stars = [], t = 0, prev = 0;
  const p = { x: 0, y: 0 }, e = { x: 0, y: 0 };

  function size() {
    dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    let s = 4242; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    stars = LAYERS.flatMap(L => [...Array(Math.round(innerWidth * innerHeight * L.n))].map(() => ({ x: r() * (innerWidth + 60) - 30, y: r() * innerHeight * 0.8, L, ph: r() * 6.3 })));
  }
  // -1..1 from the centre of the screen
  const move = ev => { if (ev.pointerType === 'touch') return; p.x = ev.clientX / innerWidth * 2 - 1; p.y = ev.clientY / innerHeight * 2 - 1; };
  const leave = ev => { if (!ev.relatedTarget) { p.x = 0; p.y = 0; } };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (prev || now)) / 1000); prev = now; t += dt;
    e.x += (p.x - e.x) * 0.045; e.y += (p.y - e.y) * 0.045;
    for (const el of els) {
      const d = parseFloat(el.dataset.parallax) || 1;
      el.style.transform = `translate3d(${(-e.x * MAX * d).toFixed(2)}px,${(-e.y * MAX * 0.6 * d).toFixed(2)}px,0) scale(${1 + (MAX * d * 2.4) / innerWidth})`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const s of stars) {
      const x = s.x - e.x * MAX * s.L.d, y = s.y - e.y * MAX * 0.6 * s.L.d, tw = 0.65 + 0.35 * Math.sin(t * 1.3 + s.ph);
      ctx.fillStyle = `rgba(255,244,214,${(s.L.a * tw).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, s.L.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  return {
    label: 'parallax', note: 'no cursor at all: the sky plate and two faint star layers drift a few px against the pointer, for depth',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return; on = true;
      els = [...document.querySelectorAll('[data-parallax]')];
      els.forEach(el => { el.dataset.pxPrev = el.style.transform || ''; el.style.willChange = 'transform'; });
      cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';
      document.body.appendChild(cv); ctx = cv.getContext('2d'); size();
      addEventListener('resize', size); addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); prev = 0;
      els.forEach(el => { el.style.transform = el.dataset.pxPrev; el.style.willChange = ''; delete el.dataset.pxPrev; });
      removeEventListener('resize', size); removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      cv.remove(); e.x = e.y = p.x = p.y = 0;
    }
  };
})();
