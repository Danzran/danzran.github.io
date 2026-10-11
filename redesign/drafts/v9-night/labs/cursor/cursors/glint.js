/* Star glint.
   A single small four-point star sits just off the native arrow's tip, as if the pointer caught
   the moon. It turns slowly and twinkles; moving fast leans and stretches its rays a little;
   over a link, button or card it opens into a larger warm-gold glint; a click flares it once.
   One element, no trail. Native cursor kept. Touch: off. Reduced motion: still star, no spin or flare. */
(window.CURSORS = window.CURSORS || {}).glint = (() => {
  const SEL = 'a,button,[role="button"],.card,[data-cursor]', NS = 'http://www.w3.org/2000/svg';
  let el, star, halo, raf = 0, on = false, hov = false, prev = 0, t = 0;
  const p = { x: -99, y: -99, vis: 0 }, s = { x: -99, y: -99, a: 0, sc: 1, rot: 0, flare: 0, vx: 0, vy: 0 };
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function move(e) { if (e.pointerType === 'touch') return; p.x = e.clientX; p.y = e.clientY; p.vis = 1; hov = !!(e.target.closest && e.target.closest(SEL)); }
  const leave = e => { if (!e.relatedTarget) p.vis = 0; };
  const down = e => { if (e.pointerType !== 'touch' && !reduce()) s.flare = 1; };
  // four-point star: long thin rays, concave sides
  const shape = (L, w) => `M0 ${-L} C${w} ${-w} ${w} ${-w} ${L} 0 C${w} ${w} ${w} ${w} 0 ${L} C${-w} ${w} ${-w} ${w} ${-L} 0 C${-w} ${-w} ${-w} ${-w} 0 ${-L}Z`;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const rm = reduce(), dt = Math.min(0.05, (now - (prev || now)) / 1000); prev = now; t += rm ? 0 : dt;
    const gx = p.x + 16, gy = p.y + 20;                  // just below-right of the arrow, never on what you are reading
    if (s.x < -50 || rm) { s.x = gx; s.y = gy; s.vx = s.vy = 0; }
    else { const nx = s.x + (gx - s.x) * 0.3, ny = s.y + (gy - s.y) * 0.3; s.vx += ((nx - s.x) - s.vx) * 0.2; s.vy += ((ny - s.y) - s.vy) * 0.2; s.x = nx; s.y = ny; }
    s.a += (p.vis - s.a) * 0.1; s.sc += ((hov ? 1.7 : 1) - s.sc) * 0.12; s.flare *= 0.9; s.rot += dt * (hov ? 40 : 18);
    const tw = rm ? 1 : 0.82 + 0.18 * Math.sin(t * 3.1) * Math.sin(t * 1.7 + 1);
    const sp = Math.min(1, Math.hypot(s.vx, s.vy) / 14), ang = Math.atan2(s.vy, s.vx) * 180 / Math.PI;
    star.setAttribute('d', shape(7 * tw + s.flare * 9, 1.1 + s.flare * 0.6));
    star.setAttribute('fill', hov ? '#ffd98a' : '#fff1cf');
    halo.setAttribute('r', (5 + s.flare * 10) * s.sc); halo.setAttribute('opacity', (0.35 + s.flare * 0.4) * tw);
    // stretch along the motion a little, then turn the star itself
    el.style.transform = `translate3d(${s.x}px,${s.y}px,0) rotate(${ang}deg) scale(${1 + sp * 0.5},${1 - sp * 0.25}) rotate(${-ang}deg) rotate(${(rm ? 0 : s.rot) % 360}deg) scale(${s.sc.toFixed(3)})`;
    el.style.opacity = s.a.toFixed(3);
  }

  return {
    label: 'glint', note: 'one small four-point star rides beside the arrow, twinkling; it opens into a warm glint over things you can click',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      el = document.createElementNS(NS, 'svg'); el.setAttribute('aria-hidden', 'true'); el.setAttribute('viewBox', '-30 -30 60 60');
      el.style.cssText = 'position:fixed;left:-30px;top:-30px;width:60px;height:60px;pointer-events:none;z-index:9999;opacity:0;overflow:visible;filter:drop-shadow(0 0 3px rgba(246,194,94,.7)) drop-shadow(0 0 1px rgba(13,28,64,.6))';
      el.innerHTML = '<defs><radialGradient id="gl-h"><stop offset="0" stop-color="#ffe3a3"/><stop offset="1" stop-color="#ffe3a3" stop-opacity="0"/></radialGradient></defs>';
      halo = document.createElementNS(NS, 'circle'); halo.setAttribute('fill', 'url(#gl-h)');
      star = document.createElementNS(NS, 'path');
      el.append(halo, star); document.body.appendChild(el);
      addEventListener('pointermove', move, { passive: true }); addEventListener('pointerdown', down, { passive: true }); document.addEventListener('pointerout', leave);
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); prev = 0; s.x = s.y = -99; s.a = 0;
      removeEventListener('pointermove', move); removeEventListener('pointerdown', down); document.removeEventListener('pointerout', leave);
      el.remove();
    }
  };
})();
