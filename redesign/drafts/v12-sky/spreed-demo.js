/* The Spreed card's mini screen: the game's own RSVP reader (Spritz ORP steps and dwell multipliers, as in
   spreed/src/components/RSVPReader.tsx) running the landing page's demo line at 375 wpm, and below it a quiz
   question whose timer drains until the right answer is revealed, on a loop. Paused while off screen. */
(() => {
  const el = document.querySelector('.spx'); if (!el) return;
  const WORDS = 'You are reading this one word at a time and it feels like the text is being beamed straight into your brain.'.split(' ');
  const word = el.querySelector('.spx-word'), [b, o, a] = word.children, prog = el.querySelector('.spx-prog i'),
    timer = el.querySelector('.spx-timer i'), secs = el.querySelector('.spx-secs');
  const clean = w => w.replace(/[^a-zA-Z0-9]/g, '').length;
  const orp = w => { const n = clean(w); return n <= 3 ? 0 : n <= 6 ? 1 : n <= 9 ? 2 : n <= 13 ? 3 : 4; };
  const dwell = w => { const n = clean(w); return 1 + (n >= 13 ? .3 : n >= 9 ? .15 : 0) + (/[.!?]$/.test(w) ? 1 : /[,;:]$/.test(w) ? .4 : 0); };
  const WPM = 375, QSEC = 15, Q_RUN = 6200, Q_HOLD = 2600;
  function show(i) {
    const w = WORDS[i], p = orp(w);
    b.textContent = w.slice(0, p); o.textContent = w[p]; a.textContent = w.slice(p + 1);
    word.style.transform = `translate(calc(-${p + .5}ch), -50%)`;
    prog.style.width = (i / (WORDS.length - 1)) * 100 + '%';
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { show(13); el.classList.add('revealed'); timer.style.width = '58%'; secs.textContent = '9s'; return; }
  let on = false, i = 0, next = 0, q0 = 0;
  function loop(now) {
    requestAnimationFrame(loop); if (!on) return;
    if (now >= next) { show(i); next = now + 60000 / WPM * dwell(WORDS[i]) + (i === WORDS.length - 1 ? 900 : 0); i = (i + 1) % WORDS.length; }
    const q = (now - q0) % (Q_RUN + Q_HOLD), left = Math.max(0, 1 - q / Q_RUN * .42);
    if (q < Q_RUN) { el.classList.remove('revealed'); timer.style.width = left * 100 + '%'; secs.textContent = Math.ceil(QSEC * left) + 's'; }
    else el.classList.add('revealed');
  }
  new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) next = 0; }).observe(el);
  q0 = performance.now(); show(0); requestAnimationFrame(loop);
})();
