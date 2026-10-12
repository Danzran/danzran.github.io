/* Light leak (round 2).
   Hover only; nothing happens over empty space. Entering a card (or a .pill / [data-leak])
   washes a warm painted light leak into it, the kind of burn an editor drops on a cut: a
   gold-amber bloom near the pointer, a small pink kiss beside it, a thin anamorphic flare
   streak across, and a little film grain. It drifts with the pointer inside the element and
   fades when you leave. Screened on, so it brightens and never covers text.
   Native cursor kept. Touch: off. Reduced motion: the leak fades in where you are and holds still. */
(window.CURSORS = window.CURSORS || {}).lightleak = (() => {
  const SEL = '.card,.pill,[data-leak]';
  const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 .95 0 0 0 0 .85 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const css = `
  .ll-host{position:relative}
  .ll{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none;z-index:3;opacity:0;transition:opacity .7s ease;mix-blend-mode:screen}
  .ll.on{opacity:1}
  .ll i{position:absolute;inset:0;display:block}
  .ll .bloom{background:
      radial-gradient(42% 64% at var(--lx) var(--ly),rgba(255,180,100,.62),rgba(255,150,80,.18) 55%,transparent 76%),
      radial-gradient(22% 34% at calc(var(--lx) + 16%) calc(var(--ly) + 14%),rgba(255,128,150,.30),transparent 70%),
      radial-gradient(70% 40% at calc(100% - var(--lx)) 110%,rgba(255,226,160,.26),transparent 70%),
      linear-gradient(115deg,transparent calc(var(--lx) - 30%),rgba(255,196,120,.16) var(--lx),transparent calc(var(--lx) + 22%));filter:blur(6px)}
  .ll .flare{top:var(--ly);bottom:auto;height:2px;margin-top:-1px;background:linear-gradient(90deg,transparent,rgba(255,236,200,.0) calc(var(--lx) - 45%),rgba(255,240,210,.8) var(--lx),rgba(255,236,200,0) calc(var(--lx) + 45%),transparent);filter:blur(.6px)}
  .ll .grain{background-image:${GRAIN};background-size:160px;opacity:.22;mix-blend-mode:overlay;transform:translate(var(--gx),var(--gy))}
  .pill .ll{border-radius:999px}`;
  let style, raf = 0, on = false, live = new Map(), hover = null;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function layer(host) {
    let L = host.querySelector(':scope > .ll');
    if (!L) {
      if (getComputedStyle(host).position === 'static') host.classList.add('ll-host');
      L = document.createElement('span'); L.className = 'll'; L.setAttribute('aria-hidden', 'true');
      L.innerHTML = '<i class="bloom"></i><i class="flare"></i><i class="grain"></i>'; host.appendChild(L);
    }
    return L;
  }
  function move(ev) {
    if (ev.pointerType === 'touch') return;
    const h = ev.target.closest ? ev.target.closest(SEL) : null;
    if (h !== hover) {
      if (hover && live.has(hover)) live.get(hover).L.classList.remove('on');
      hover = h;
      if (h) {
        const r = h.getBoundingClientRect(), L = layer(h);
        let st = live.get(h);
        // sweep in from the edge you came through
        const fx = ((ev.clientX - r.left) / r.width) * 100, fy = ((ev.clientY - r.top) / r.height) * 100;
        if (!st) { st = { L, x: fx < 50 ? -20 : 120, y: fy, tx: fx, ty: fy, gx: 0, gy: 0 }; live.set(h, st); }
        if (reduce()) { st.x = fx; st.y = fy; }
        L.classList.add('on');
      }
    }
    if (h) { const r = h.getBoundingClientRect(), st = live.get(h); st.tx = ((ev.clientX - r.left) / r.width) * 100; st.ty = ((ev.clientY - r.top) / r.height) * 100; }
  }
  const leave = ev => { if (!ev.relatedTarget && hover) { live.get(hover)?.L.classList.remove('on'); hover = null; } };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const rm = reduce();
    for (const [h, st] of live) {
      if (!rm) { st.x += (st.tx - st.x) * 0.06; st.y += (st.ty - st.y) * 0.06; st.gx = Math.sin(now / 900) * 20; st.gy = Math.cos(now / 1300) * 20; }
      else { st.x = st.tx; st.y = st.ty; }
      st.L.style.setProperty('--lx', st.x.toFixed(2) + '%'); st.L.style.setProperty('--ly', st.y.toFixed(2) + '%');
      st.L.style.setProperty('--gx', st.gx.toFixed(1) + 'px'); st.L.style.setProperty('--gy', st.gy.toFixed(1) + 'px');
    }
  }

  return {
    label: 'light leak', note: 'hover only: a card or button gets a warm editor’s light leak, flare streak and grain that drift with the pointer inside it',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
      addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); hover = null;
      removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      for (const [h, st] of live) { st.L.remove(); h.classList.remove('ll-host'); } live.clear(); style.remove();
    }
  };
})();
