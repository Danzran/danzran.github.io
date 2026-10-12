/* Living scribble.
   A hand-drawn loop that never holds still: its outline is a closed curve whose radius is
   perturbed by slow sine noise that keeps drifting, so the line crawls and reshapes every frame
   (no swapped drawings, no stepping). It overshoots its start like a real pen loop, and a fainter
   echo stroke trails a quarter-second behind (the ghost smear from the "Beautiful World" outro).
   Idle it is a tiny loose loop around the pointer; over a link, button or card it grows and
   draws itself on around the element, and the shape morphs from one target to the next.
   Native cursor kept. Touch: off. Reduced motion: still loop, no crawl, no draw-on. */
(window.CURSORS = window.CURSORS || {}).scribble = (() => {
  const SEL = 'a,button,[role="button"],.card,[data-cursor]', NS = 'http://www.w3.org/2000/svg', N = 72, OVER = 0.55;
  let svg, main, ghost, raf = 0, on = false, target = null, t0 = 0;
  const p = { x: -99, y: -99, vis: 0 };
  const G = { cx: -99, cy: -99, a: 12, b: 12, n: 2, prog: 1, a2: 0 };   // current shape (eased)

  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function move(e) {
    if (e.pointerType === 'touch') return;
    p.x = e.clientX; p.y = e.clientY; p.vis = 1;
    const t = e.target.closest ? e.target.closest(SEL) : null;
    if (t !== target) { target = t; G.prog = reduce() ? 1 : 0.04; }
  }
  const leave = e => { if (!e.relatedTarget) { p.vis = 0; target = null; } };

  // superellipse point with a radial wobble, as a function of angle and time
  function shape(th, t, seed, wob) {
    const c = Math.cos(th), s = Math.sin(th), e = 2 / G.n;
    const bx = Math.sign(c) * Math.pow(Math.abs(c), e) * G.a, by = Math.sign(s) * Math.pow(Math.abs(s), e) * G.b;
    const n = Math.sin(2 * th + t * 0.9 + seed) * 0.55 + Math.sin(3 * th - t * 1.3 + seed * 2) * 0.3 + Math.sin(5 * th + t * 2.1 + seed * 3) * 0.15;
    const L = Math.hypot(bx, by) || 1, d = n * wob;
    return [G.cx + bx + bx / L * d, G.cy + by + by / L * d];
  }
  function pathFor(t, seed, wob, spiral) {
    const start = -2.2 + Math.sin(t * 0.21 + seed) * 0.5, span = Math.PI * 2 + OVER, pts = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, [x, y] = shape(start + span * u, t, seed, wob);
      // the pen spirals out a little so the end passes outside the start, not over it
      const dx = x - G.cx, dy = y - G.cy, L = Math.hypot(dx, dy) || 1, sp = (u - 0.5) * spiral;
      pts.push([x + dx / L * sp, y + dy / L * sp]);
    }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {      // Catmull-Rom → cubic Bézier, so the line is smooth
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  }
  function draw(el, d, prog) {
    el.setAttribute('d', d);
    const L = el.getTotalLength();
    el.style.strokeDasharray = `${L} ${L}`; el.style.strokeDashoffset = (L * (1 - prog)).toFixed(1);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const rm = reduce(), t = rm ? 0 : (now - t0) / 1000;
    let cx = p.x, cy = p.y, a = 13, b = 11, n = 2, wob = 2.2, spiral = 4;
    if (target && target.isConnected) {
      const r = target.getBoundingClientRect(), card = target.matches('.card');
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      if (card) { n = 7; a = r.width / 2 + 10; b = r.height / 2 + 10; wob = 7; spiral = 12; }
      else { n = 2.3; a = r.width / 2 * 1.16 + 10; b = r.height / 2 * 1.2 + 9; wob = 3.2; spiral = 7; }
    }
    const k = rm || G.cx < -50 ? 1 : 0.16;
    G.cx += (cx - G.cx) * k; G.cy += (cy - G.cy) * k; G.a += (a - G.a) * k; G.b += (b - G.b) * k; G.n += (n - G.n) * k;
    G.prog += (1 - G.prog) * (rm ? 1 : 0.075);
    G.a2 += ((target ? 0.95 : 0.5) * p.vis - G.a2) * 0.1;
    draw(main, pathFor(t, 0.7, wob, spiral), G.prog);
    draw(ghost, pathFor(t - 0.25, 2.9, wob * 1.4, spiral * 1.3), Math.max(0, G.prog - 0.12));
    svg.style.opacity = G.a2.toFixed(3);
  }

  return {
    label: 'scribble', note: 'a pen loop that keeps mutating: tiny around the pointer, it draws itself around whatever you hover and morphs between targets',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      svg = document.createElementNS(NS, 'svg'); svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:0;overflow:visible;filter:drop-shadow(0 0 1.5px rgba(13,28,64,.55)) drop-shadow(0 0 6px rgba(246,194,94,.3))';
      ghost = document.createElementNS(NS, 'path'); main = document.createElementNS(NS, 'path');
      ghost.setAttribute('style', 'fill:none;stroke:#ffd98a;stroke-width:1.1;stroke-linecap:round;opacity:.45');
      main.setAttribute('style', 'fill:none;stroke:#fff1cf;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round');
      svg.append(ghost, main); document.body.appendChild(svg);
      addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      t0 = performance.now(); raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); target = null;
      removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      svg.remove(); G.cx = G.cy = -99; G.a2 = 0;
    }
  };
})();
