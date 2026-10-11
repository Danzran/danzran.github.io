/* Caustic lens.
   Under the pointer, a small round window of moving water light: the caustic net you see on
   the floor of a pool, in ivory and gold, screened onto the page and feathered at the edge.
   The pattern is anchored to the page, not the pointer, so moving the mouse reveals it like a
   lens sliding over lit water, while it keeps rippling slowly by itself. Over links, buttons
   and cards the lens opens a little wider and warmer. Rendered at 96x96 and scaled up, so it is
   soft and cheap. Native cursor kept. Touch: off. Reduced motion: the light holds still. */
(window.CURSORS = window.CURSORS || {}).caustics = (() => {
  const RES = 96, SIZE = 300, SCALE = 1 / 180, SEL = 'a,button,[role="button"],.card,[data-cursor]';
  let cv, ctx, buf, bctx, img, raf = 0, on = false, t0 = 0, hov = false;
  const p = { x: -999, y: -999, vis: 0 }, e = { x: -999, y: -999, a: 0, s: 1 };
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function move(ev) { if (ev.pointerType === 'touch') return; p.x = ev.clientX; p.y = ev.clientY; p.vis = 1; hov = !!(ev.target.closest && ev.target.closest(SEL)); }
  const leave = ev => { if (!ev.relatedTarget) p.vis = 0; };

  // classic iterative caustic (after a well-known water shader), evaluated per buffer pixel
  function caustic(x, y, time) {
    const TAU = 6.28318;
    let px = x * TAU - 250, py = y * TAU - 250, ix = px, iy = py, c = 1;
    for (let n = 0; n < 4; n++) {
      const t = time * (1 - 3.5 / (n + 1));
      const nx = px + Math.cos(t - ix) + Math.sin(t + iy), ny = py + Math.sin(t - iy) + Math.cos(t + ix);
      ix = nx; iy = ny;
      c += 1 / Math.hypot(px / (Math.sin(ix + t) / 0.005), py / (Math.cos(iy + t) / 0.005));
    }
    c = 1.17 - Math.pow(c / 4, 1.4);
    return Math.pow(Math.abs(c), 5);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const rm = reduce(), time = rm ? 3 : (now - t0) / 1000 * 0.35 + 3;
    if (e.x < -500 || rm) { e.x = p.x; e.y = p.y; } else { e.x += (p.x - e.x) * 0.2; e.y += (p.y - e.y) * 0.2; }
    e.a += (p.vis * (hov ? 1 : 0.75) - e.a) * 0.08; e.s += ((hov ? 1.18 : 1) - e.s) * 0.1;
    cv.style.transform = `translate3d(${e.x - SIZE / 2}px,${e.y - SIZE / 2}px,0) scale(${e.s.toFixed(3)})`;
    cv.style.opacity = e.a.toFixed(3);
    if (e.a < 0.01) return;
    const d = img.data, ox = (e.x - SIZE / 2 + scrollX) * SCALE, oy = (e.y - SIZE / 2 + scrollY) * SCALE, step = SIZE / RES * SCALE;
    for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
      const u = (i + 0.5) / RES - 0.5, v = (j + 0.5) / RES - 0.5, r = Math.hypot(u, v) * 2;
      const k = (j * RES + i) * 4;
      if (r >= 1) { d[k + 3] = 0; continue; }
      const m = Math.pow(1 - r * r, 1.6);                               // feathered round lens
      const raw = caustic(ox + i * step, oy + j * step, time), c = Math.min(1, Math.max(0, (raw - 0.07) / 0.5)) * m;
      d[k] = 255; d[k + 1] = 226 + 22 * c; d[k + 2] = 160 + 70 * c; d[k + 3] = Math.min(255, c * 215 + m * 14);
    }
    bctx.putImageData(img, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE); ctx.drawImage(buf, 0, 0, SIZE, SIZE);
  }

  return {
    label: 'caustics', note: 'a small lens of moving pool-light under the pointer; the pattern is fixed to the page so you slide over it',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      cv = document.createElement('canvas'); cv.width = cv.height = SIZE; cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = `position:fixed;left:0;top:0;width:${SIZE}px;height:${SIZE}px;pointer-events:none;z-index:9999;opacity:0;mix-blend-mode:screen;filter:blur(.6px);will-change:transform,opacity`;
      document.body.appendChild(cv); ctx = cv.getContext('2d'); ctx.imageSmoothingQuality = 'high';
      buf = document.createElement('canvas'); buf.width = buf.height = RES; bctx = buf.getContext('2d'); img = bctx.createImageData(RES, RES);
      addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      t0 = performance.now(); raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); e.x = e.y = -999; e.a = 0; e.s = 1;
      removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      cv.remove();
    }
  };
})();
