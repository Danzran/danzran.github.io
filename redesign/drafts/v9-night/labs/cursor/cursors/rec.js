/* REC (round 2): the edit-suite cursor.
   A nod to the video-editing years. Next to the native arrow sits a tiny viewfinder readout: a
   softly pulsing rose REC dot and a running SMPTE timecode (24 fps). Over a card it reads
   "▶ PLAY", over a link or button "CUT ▸"; set data-cursor-label on any element to override.
   While the pointer is active, four thin crop marks frame the viewport corners, like a
   camera's safe-area frame. Text is small (10.5px), monospace, never over what you point at.
   Native cursor kept. Touch: off. Reduced motion: no pulse, timecode shows whole seconds only. */
(window.CURSORS = window.CURSORS || {}).rec = (() => {
  const css = `
  .rec-tag{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;display:flex;align-items:center;gap:6px;opacity:0;transition:opacity .35s;
    font:600 10.5px/1 ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;letter-spacing:.08em;color:rgba(255,241,207,.9);
    text-shadow:0 0 2px rgba(5,12,34,.9),0 0 8px rgba(5,12,34,.6);white-space:nowrap}
  .rec-tag b{width:7px;height:7px;border-radius:50%;background:#ff8fa0;box-shadow:0 0 6px rgba(255,143,160,.8)}
  .rec-tag .lbl{color:#ffd98a}
  .rec-crop{position:fixed;inset:18px;z-index:9999;pointer-events:none;opacity:0;transition:opacity .8s}
  .rec-crop i{position:absolute;width:18px;height:18px;border:0 solid rgba(255,241,207,.42)}
  .rec-crop i:nth-child(1){left:0;top:0;border-width:1px 0 0 1px}.rec-crop i:nth-child(2){right:0;top:0;border-width:1px 1px 0 0}
  .rec-crop i:nth-child(3){right:0;bottom:0;border-width:0 1px 1px 0}.rec-crop i:nth-child(4){left:0;bottom:0;border-width:0 0 1px 1px}`;
  let style, tag, dot, txt, crop, raf = 0, on = false, t0 = 0, label = '';
  const p = { x: -99, y: -99, vis: 0 };
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');

  function move(ev) {
    if (ev.pointerType === 'touch') return;
    p.x = ev.clientX; p.y = ev.clientY; p.vis = 1;
    const h = ev.target.closest ? ev.target.closest('[data-cursor-label],.card,a,button,[role="button"]') : null;
    label = !h ? '' : h.dataset.cursorLabel || (h.matches('.card') ? '▶ PLAY' : 'CUT ▸');
  }
  const leave = ev => { if (!ev.relatedTarget) p.vis = 0; };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const rm = reduce(), s = (now - t0) / 1000;
    // keep the readout on screen: flip to the left of the arrow near the right edge
    const flip = p.x > innerWidth - 150;
    tag.style.transform = `translate3d(${flip ? p.x - 14 : p.x + 16}px,${p.y + 22}px,0) translateX(${flip ? '-100%' : '0'})`;
    tag.style.opacity = p.vis;
    crop.style.opacity = p.vis * 0.9;
    dot.style.opacity = rm ? 1 : (0.45 + 0.55 * (0.5 + 0.5 * Math.cos(s * Math.PI))).toFixed(3);   // smooth 2 s breath, not a blink
    const tc = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}` + (rm ? '' : `:${pad(Math.floor(s * 24) % 24)}`);
    const want = label ? label : 'REC ' + tc;
    if (txt.textContent !== want) txt.textContent = want;
    txt.classList.toggle('lbl', !!label);
  }

  return {
    label: 'REC', note: 'an edit-suite readout beside the arrow: rose REC dot and running timecode, “▶ PLAY” on cards, crop marks at the corners',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
      tag = document.createElement('div'); tag.className = 'rec-tag'; tag.setAttribute('aria-hidden', 'true'); tag.innerHTML = '<b></b><span></span>';
      dot = tag.querySelector('b'); txt = tag.querySelector('span');
      crop = document.createElement('div'); crop.className = 'rec-crop'; crop.setAttribute('aria-hidden', 'true'); crop.innerHTML = '<i></i><i></i><i></i><i></i>';
      document.body.append(crop, tag);
      addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerout', leave);
      t0 = performance.now(); raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); p.vis = 0; label = '';
      removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave);
      tag.remove(); crop.remove(); style.remove();
    }
  };
})();
