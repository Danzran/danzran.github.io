/* Spotlight (round 2).
   The night gets very slightly darker everywhere except a wide soft pool around the pointer,
   as if you were reading by your own lantern. No shape at the cursor; the pool is ~300px of
   untouched page that fades to a light navy veil (max 17%) far away. It fades in once you move
   and lifts when the pointer leaves the window.
   Native cursor kept. Touch: off. Reduced motion: the pool sits on the pointer, no easing. */
(window.CURSORS = window.CURSORS || {}).spotlight = (() => {
  const INNER = 190, OUTER = 680, DIM = 0.17;
  let el, raf = 0, on = false;
  const p = { x: -1, y: -1, vis: 0 }, e = { x: -1, y: -1, a: 0 };
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const move = ev => { if (ev.pointerType === 'touch') return; p.x = ev.clientX; p.y = ev.clientY; p.vis = 1; };
  const leave = ev => { if (!ev.relatedTarget) p.vis = 0; };

  function frame() {
    raf = requestAnimationFrame(frame);
    const rm = reduce();
    if (e.x < 0 || rm) { e.x = p.x; e.y = p.y; } else { e.x += (p.x - e.x) * 0.12; e.y += (p.y - e.y) * 0.12; }
    e.a += (p.vis - e.a) * (rm ? 1 : 0.035);
    el.style.opacity = e.a.toFixed(3);
    el.style.background = `radial-gradient(${OUTER}px circle at ${e.x.toFixed(1)}px ${e.y.toFixed(1)}px,rgba(5,12,34,0) 0,rgba(5,12,34,0) ${INNER}px,rgba(5,12,34,${DIM * 0.55}) ${(INNER + OUTER) / 2}px,rgba(5,12,34,${DIM}) ${OUTER}px)`;
  }

  return {
    label: 'spotlight', note: 'the page dims a touch everywhere except a wide soft pool of light around the pointer',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      el = document.createElement('div'); el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:0';
      document.body.appendChild(el);
      addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); e.x = e.y = -1; e.a = 0;
      removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      el.remove();
    }
  };
})();
