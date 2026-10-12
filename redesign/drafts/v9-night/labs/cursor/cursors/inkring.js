/* Ink dot + brush ring.
   An ivory ink dot sits exactly on the pointer (it is the cursor, zero lag). A thin ring follows
   on a spring; over a link, button or card it morphs (position, size and corner radius all
   spring together) into a slightly rough, brush-inked outline around the element. Small links
   and buttons lean a few px toward the pointer (magnetic). The native cursor is hidden only on
   fine pointers and comes back over text fields. Touch: off. Reduced motion: no spring, no lean. */
(window.CURSORS = window.CURSORS || {}).inkring = (() => {
  const SEL = 'a,button,[role="button"],.card,[data-cursor]', MAG = 'a:not(.card),button,[role="button"]';
  let root, dot, ring, style, raf = 0, on = false, target = null, magEl = null;
  const p = { x: -99, y: -99, vis: 0 };
  // spring state for ring: x, y, w, h, r (corner radius)
  const S = { x: -99, y: -99, w: 30, h: 30, r: 15, vx: 0, vy: 0, vw: 0, vh: 0, vr: 0 };

  const css = `
  html.ir-on, html.ir-on *{cursor:none!important}
  html.ir-on input, html.ir-on textarea, html.ir-on [contenteditable]{cursor:text!important}
  .ir-root{position:fixed;inset:0;pointer-events:none;z-index:9999}
  .ir-dot{position:absolute;left:0;top:0;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:#fff1cf;
    box-shadow:0 0 0 1.5px rgba(13,28,64,.75),0 0 10px rgba(255,214,140,.6);transition:width .25s,height .25s,margin .25s,opacity .3s}
  .ir-ring{position:absolute;left:0;top:0;border:1.6px solid rgba(255,236,190,.85);filter:url(#ir-rough) drop-shadow(0 0 4px rgba(246,194,94,.35));transition:opacity .3s}
  .ir-root.hov .ir-dot{width:5px;height:5px;margin:-2.5px 0 0 -2.5px}
  .ir-root.hov .ir-ring{border-color:#ffd98a;border-width:2px}`;

  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function move(e) {
    if (e.pointerType === 'touch') return;
    p.x = e.clientX; p.y = e.clientY; p.vis = 1;
    const t = e.target.closest ? e.target.closest(SEL) : null;
    if (t !== target) { setMag(null); target = t; root.classList.toggle('hov', !!t); if (t && t.matches(MAG) && !reduce()) magEl = t; }
  }
  const leave = e => { if (!e.relatedTarget) { p.vis = 0; target = null; setMag(null); root.classList.remove('hov'); } };
  function setMag(el) { if (magEl && magEl !== el) magEl.style.translate = ''; magEl = el; }

  function spring(key, goal, k, d) { const v = 'v' + key; S[v] = (S[v] + (goal - S[key]) * k) * d; S[key] += S[v]; }

  function frame() {
    raf = requestAnimationFrame(frame);
    let gx = p.x, gy = p.y, gw = 30, gh = 30, gr = 15;
    if (target && target.isConnected) {
      const b = target.getBoundingClientRect(), pad = target.matches('.card') ? 7 : 8;
      // lean: the ring is pulled slightly toward the pointer; small targets lean themselves too
      const mx = (p.x - (b.left + b.width / 2)), my = (p.y - (b.top + b.height / 2));
      const pull = target.matches('.card') ? 0.025 : 0.12;
      gx = b.left + b.width / 2 + mx * pull; gy = b.top + b.height / 2 + my * pull;
      gw = b.width + pad * 2; gh = b.height + pad * 2;
      const cr = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 6;
      gr = Math.min(cr + pad, gh / 2);
      if (magEl === target) magEl.style.translate = `${(mx * 0.18).toFixed(2)}px ${(my * 0.25).toFixed(2)}px`;
    }
    if (reduce() || S.x < -50) { Object.assign(S, { x: gx, y: gy, w: gw, h: gh, r: gr }); }
    else { spring('x', gx, .14, .72); spring('y', gy, .14, .72); spring('w', gw, .12, .7); spring('h', gh, .12, .7); spring('r', gr, .12, .7); }
    dot.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
    ring.style.width = S.w + 'px'; ring.style.height = S.h + 'px'; ring.style.borderRadius = Math.max(0, S.r) + 'px';
    ring.style.transform = `translate3d(${S.x - S.w / 2}px,${S.y - S.h / 2}px,0)`;
    root.style.opacity = p.vis;
  }

  return {
    label: 'ink ring', note: 'an ink dot is the cursor; a brush ring springs after it and wraps links, buttons and cards (links lean in)',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
      root = document.createElement('div'); root.className = 'ir-root'; root.setAttribute('aria-hidden', 'true'); root.style.opacity = 0;
      root.innerHTML = `<svg width="0" height="0" style="position:absolute"><filter id="ir-rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter></svg>
        <div class="ir-ring"></div><div class="ir-dot"></div>`;
      document.body.appendChild(root); dot = root.querySelector('.ir-dot'); ring = root.querySelector('.ir-ring');
      document.documentElement.classList.add('ir-on');
      addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); setMag(null); target = null;
      removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      document.documentElement.classList.remove('ir-on'); root.remove(); style.remove(); S.x = S.y = -99;
    }
  };
})();
