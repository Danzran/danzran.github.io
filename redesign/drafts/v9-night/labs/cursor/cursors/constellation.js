/* Constellation.
   A sparse field of faint stars lives on a fixed layer but is only visible near the pointer.
   The closest few stars are joined to the (eased) pointer with hairline gold lines, and to each
   other in a short chain, so a little constellation forms and re-forms as you move. Over a card
   the lines reach for the card's nearest corners instead of the pointer.
   The layer sits under the page content (z-index 1), so it never covers text.
   Native cursor kept. Touch: off. Reduced motion: no easing, no twinkle (lines still follow). */
(window.CURSORS = window.CURSORS || {}).constellation = (() => {
  const REVEAL = 230, LINK = 170, MAXL = 5, SEL = '.card,[data-cursor]';
  let cv, ctx, raf = 0, on = false, dpr = 1, stars = [], target = null, prev = 0, t = 0;
  const p = { x: -999, y: -999, vis: 0 }, e = { x: -999, y: -999, a: 0 }, A = [[-999, -999], [-999, -999]];
  let cards = [];
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rnd(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    const r = rnd(1187), n = Math.round(innerWidth * innerHeight / 7000);   // seeded: same sky every visit
    stars = [...Array(n)].map(() => ({ x: r() * innerWidth, y: r() * innerHeight, s: 0.5 + r() * 1.1, ph: r() * 6.3 }));
  }
  function move(ev) { if (ev.pointerType === 'touch') return; p.x = ev.clientX; p.y = ev.clientY; p.vis = 1; target = ev.target.closest ? ev.target.closest(SEL) : null; }
  const leave = ev => { if (!ev.relatedTarget) { p.vis = 0; target = null; } };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const rm = reduce(), dt = Math.min(0.05, (now - (prev || now)) / 1000); prev = now; t += rm ? 0 : dt;
    if (e.x < -500 || rm) { e.x = p.x; e.y = p.y; } else { e.x += (p.x - e.x) * 0.12; e.y += (p.y - e.y) * 0.12; }
    e.a += (p.vis - e.a) * 0.06;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (e.a < 0.01) return;
    // anchors: the pointer, or (over a card) the two card corners nearest it; eased so lines glide over
    let goal = [[e.x, e.y], [e.x, e.y]];
    if (target && target.isConnected) {
      const r = target.getBoundingClientRect(), cs = [[r.left, r.top], [r.right, r.top], [r.right, r.bottom], [r.left, r.bottom]];
      goal = cs.sort((a, b) => Math.hypot(a[0] - p.x, a[1] - p.y) - Math.hypot(b[0] - p.x, b[1] - p.y)).slice(0, 2);
    }
    A.forEach((an, i) => { if (rm || an[0] < -500) { an[0] = goal[i][0]; an[1] = goal[i][1]; } else { an[0] += (goal[i][0] - an[0]) * 0.12; an[1] += (goal[i][1] - an[1]) * 0.12; } });
    const rects = cards.map(c => c.getBoundingClientRect());
    const near = [];
    for (const s of stars) {
      if (rects.some(r => s.x > r.left && s.x < r.right && s.y > r.top && s.y < r.bottom)) continue;   // behind the glass: skip
      let d = 1e9, an = A[0]; for (const q of A) { const dd = Math.hypot(s.x - q[0], s.y - q[1]); if (dd < d) { d = dd; an = q; } }
      if (d > REVEAL) continue;
      const fall = 1 - d / REVEAL, tw = 0.6 + 0.4 * Math.sin(t * 2 + s.ph), a = fall * fall * tw * e.a;
      ctx.fillStyle = `rgba(255,244,214,${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill();
      if (d < LINK) near.push({ s, d, an });
    }
    near.sort((a, b) => a.d - b.d); const pick = near.slice(0, MAXL);
    ctx.lineWidth = 0.9;
    pick.forEach(({ s, d, an }, i) => {
      const a = (1 - d / LINK) * e.a * 0.85;
      ctx.strokeStyle = `rgba(255,217,138,${a.toFixed(3)})`; ctx.beginPath(); ctx.moveTo(an[0], an[1]); ctx.lineTo(s.x, s.y); ctx.stroke();
      if (i > 0) { const q = pick[i - 1].s; ctx.strokeStyle = `rgba(255,236,190,${(a * 0.6).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(s.x, s.y); ctx.stroke(); }
      ctx.fillStyle = `rgba(255,244,214,${Math.min(1, a * 1.8).toFixed(3)})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.s + 0.6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = `rgba(255,217,138,${(0.75 * e.a).toFixed(3)})`;
    for (const q of A) { ctx.beginPath(); ctx.arc(q[0], q[1], 1.8, 0, Math.PI * 2); ctx.fill(); }
  }

  return {
    label: 'constellation', note: 'faint stars appear only near the pointer and join to it with hairline gold lines; over a card they reach for its corners',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';   // under the content: frosted cards blur it, lines meet their corners
      document.body.appendChild(cv); ctx = cv.getContext('2d'); size(); cards = [...document.querySelectorAll('.card')];
      addEventListener('resize', size); addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); prev = 0; target = null; e.x = e.y = -999; e.a = 0; A.forEach(q => { q[0] = q[1] = -999; });
      removeEventListener('resize', size); removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      cv.remove();
    }
  };
})();
