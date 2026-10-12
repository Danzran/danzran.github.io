/* Moon-glow lens.
   A soft gold halo eases after the pointer. Under it the sky is lifted a touch (backdrop
   brightness through a radial mask), so the painted stars wake up as it passes, and the
   gold-ivory border of any card near it lights up along the arc closest to the pointer.
   The native cursor stays. Touch: off. Reduced motion: the halo sits on the pointer, no easing. */
(window.CURSORS = window.CURSORS || {}).moonglow = (() => {
  const R = 190;                      // halo radius, px
  let el, style, raf = 0, on = false, cards = [];
  const p = { x: -999, y: -999 }, h = { x: -999, y: -999, a: 0, ta: 0 };

  const css = `
  .mg-halo{position:fixed;left:0;top:0;width:${R * 2}px;height:${R * 2}px;margin:-${R}px 0 0 -${R}px;border-radius:50%;
    pointer-events:none;z-index:9999;opacity:0;will-change:transform,opacity;
    background:radial-gradient(closest-side,rgba(255,224,160,.26),rgba(255,214,140,.09) 55%,rgba(255,214,140,0));
    -webkit-backdrop-filter:brightness(1.45) saturate(1.15);backdrop-filter:brightness(1.45) saturate(1.15);
    -webkit-mask:radial-gradient(closest-side,#000 25%,transparent);mask:radial-gradient(closest-side,#000 25%,transparent)}
  html.mg-on .card{--mga:0}
  html.mg-on .card::before{content:"";position:absolute;inset:-2px;border-radius:inherit;padding:2px;pointer-events:none;opacity:var(--mga);
    background:radial-gradient(360px circle at var(--mgx,50%) var(--mgy,50%),rgba(255,240,200,1),rgba(246,194,94,.7) 40%,transparent 78%);
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}`;

  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const move = e => { if (e.pointerType === 'touch') return; p.x = e.clientX; p.y = e.clientY; h.ta = 1; };
  const leave = e => { if (!e.relatedTarget) h.ta = 0; };

  function frame() {
    raf = requestAnimationFrame(frame);
    const k = reduce() ? 1 : 0.16;
    if (h.x < -500) { h.x = p.x; h.y = p.y; }
    h.x += (p.x - h.x) * k; h.y += (p.y - h.y) * k; h.a += (h.ta - h.a) * (reduce() ? 1 : 0.08);
    el.style.transform = `translate3d(${h.x}px,${h.y}px,0)`;
    el.style.opacity = h.a.toFixed(3);
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      const dx = Math.max(r.left - h.x, 0, h.x - r.right), dy = Math.max(r.top - h.y, 0, h.y - r.bottom);
      const a = Math.max(0, 1 - Math.hypot(dx, dy) / 220) * h.a;
      c.style.setProperty('--mga', a.toFixed(3));
      if (a > 0) { c.style.setProperty('--mgx', (h.x - r.left) + 'px'); c.style.setProperty('--mgy', (h.y - r.top) + 'px'); }
    }
  }

  return {
    label: 'moon-glow', note: 'a soft gold lens follows the pointer: stars brighten under it, card borders catch its light',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
      el = document.createElement('div'); el.className = 'mg-halo'; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el);
      cards = [...document.querySelectorAll('.card')];
      document.documentElement.classList.add('mg-on');
      addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf);
      removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      document.documentElement.classList.remove('mg-on');
      cards.forEach(c => ['--mga', '--mgx', '--mgy'].forEach(v => c.style.removeProperty(v)));
      el.remove(); style.remove(); h.x = h.y = -999; h.a = h.ta = 0;
    }
  };
})();
