/* Brush lettering with line boil.
   Each letter is re-inked in VARIANTS slightly different brush drawings (wobbled outline,
   different dry-brush gaps, tiny pose changes) and swapped a few times per second,
   out of step with its neighbours. Glyph outlines: Caveat Brush (window.BRUSH_FONT_B64). */
window.Lettering = (() => {
  const VARIANTS = 3, UNITS = 100, NS = 'http://www.w3.org/2000/svg';
  let font = null;
  const cache = new Map(), letters = [];
  const sampler = document.createElementNS(NS, 'path');

  const seeded = s => () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  function loadFont() {
    if (font) return font;
    const bin = atob(window.BRUSH_FONT_B64), buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return (font = opentype.parse(buf.buffer));
  }

  function glyph(ch) {
    if (cache.has(ch)) return cache.get(ch);
    const f = loadFont(), g = f.charToGlyph(ch);
    const d = g.getPath(0, 0, UNITS).toPathData(2);
    const contours = d.split(/(?=M)/).filter(s => s.trim().length > 2).map(sd => {
      sampler.setAttribute('d', sd);
      const len = sampler.getTotalLength(), n = Math.max(10, Math.round(len / 1.6)), pts = [];
      for (let i = 0; i < n; i++) { const p = sampler.getPointAtLength((i / n) * len); pts.push([p.x, p.y]); }
      return pts;
    });
    const rec = { contours, d, adv: (g.advanceWidth / f.unitsPerEm) * UNITS };
    cache.set(ch, rec);
    return rec;
  }

  function wobble(pts, rnd, amp) {
    const p1 = rnd() * 6.28, p2 = rnd() * 6.28, f1 = 2 + rnd() * 3, f2 = 6 + rnd() * 6, n = pts.length;
    return pts.map(([x, y], i) => {
      const a = pts[(i + 1) % n], b = pts[(i - 1 + n) % n];
      let nx = -(a[1] - b[1]), ny = a[0] - b[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const t = (i / n) * 6.28, o = amp * (Math.sin(t * f1 + p1) * .7 + Math.sin(t * f2 + p2) * .3);
      return [x + nx * o, y + ny * o];
    });
  }
  const closed = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';

  function variant(ch, v, seed) {
    const g = glyph(ch), rnd = seeded(seed * 131 + v * 17 + ch.charCodeAt(0) * 3);
    const rot = (rnd() - .5) * 5, sc = .96 + rnd() * .08, dx = (rnd() - .5) * 3, dy = (rnd() - .5) * 4;
    const id = `lt-${ch.charCodeAt(0)}-${seed}-${v}`;
    // body: the glyph re-traced with a little wobble, filled like a loaded brush
    const body = g.contours.map(c => closed(wobble(c, rnd, 1.1))).join('');
    // dry-brush: thin paper-coloured streaks along the stroke direction, clipped to the glyph
    const ang = (-18 + (rnd() - .5) * 20) * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang);
    let dry = '';
    for (let k = -60; k < 60; k += 2.2 + rnd() * 3.5) {
      if (rnd() < .55) continue;
      const cx = g.adv / 2 + k * -sa, cy = -30 + k * ca, len = 10 + rnd() * 40, off = (rnd() - .5) * 60;
      dry += `M${(cx + ca * (off - len / 2)).toFixed(1)} ${(cy + sa * (off - len / 2)).toFixed(1)}L${(cx + ca * (off + len / 2)).toFixed(1)} ${(cy + sa * (off + len / 2)).toFixed(1)}`;
    }
    // an outer edge pass: slightly offset second contour gives the bleed of wet ink
    const edge = g.contours.map(c => closed(wobble(c, rnd, 1.8))).join('');
    return `<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${rot.toFixed(1)} ${g.adv / 2} -30) scale(${sc.toFixed(3)})">
      <clipPath id="${id}"><path d="${body}" fill-rule="nonzero"/></clipPath>
      <path d="${edge}" fill="currentColor" opacity=".35"/>
      <path d="${body}" fill="currentColor"/>
      <path clip-path="url(#${id})" d="${dry}" stroke="var(--dry, #fff7f0)" stroke-width="${(.8 + rnd() * .9).toFixed(1)}" stroke-linecap="round" opacity=".55"/>
    </g>`;
  }

  function render(el, { seed = 1 } = {}) {
    const text = el.textContent, f = loadFont();
    const asc = (f.ascender / f.unitsPerEm) * UNITS, desc = (-f.descender / f.unitsPerEm) * UNITS;
    el.setAttribute('aria-label', text.trim()); el.textContent = '';
    let i = 0;
    for (const word of text.split(/(\s+)/)) {
      if (!word) continue;
      if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(' ')); continue; }
      const w = document.createElement('span'); w.className = 'lt-word'; w.setAttribute('aria-hidden', 'true');
      for (const ch of word) {
        const g = glyph(ch), pad = 8, svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', `${-pad} ${-asc - pad} ${g.adv + pad * 2} ${asc + desc + pad * 2}`);
        svg.setAttribute('class', 'lt-letter');
        svg.style.width = ((g.adv + pad * 2) / UNITS) + 'em'; svg.style.height = ((asc + desc + pad * 2) / UNITS) + 'em'; svg.style.margin = `0 ${-(pad / UNITS)}em`;
        let html = '';
        for (let v = 0; v < VARIANTS; v++) html += `<g class="lt-v" style="display:${v ? 'none' : 'inline'}">${variant(ch, v, seed + i)}</g>`;
        svg.innerHTML = html; w.appendChild(svg);
        letters.push({ el, vs: [...svg.querySelectorAll('.lt-v')], cur: 0, next: 0 });
        i++;
      }
      el.appendChild(w);
    }
  }

  // one shared ticker; letters hold each drawing 2-4 ticks so neighbours change out of step
  let tick = 0, started = false;
  const vis = new WeakMap(), io = new IntersectionObserver(es => es.forEach(e => vis.set(e.target, e.isIntersecting)));
  function start(fps = 6) {
    if (started) return; started = true;
    new Set(letters.map(l => l.el)).forEach(el => io.observe(el));
    let last = 0;
    (function step(now) {
      requestAnimationFrame(step);
      if (now - last < 1000 / fps) return; last = now; tick++;
      for (const l of letters) {
        if (vis.get(l.el) === false || tick < l.next) continue;
        let n; do { n = Math.floor(Math.random() * l.vs.length); } while (n === l.cur);
        l.vs[l.cur].style.display = 'none'; l.vs[n].style.display = 'inline'; l.cur = n;
        l.next = tick + 2 + Math.floor(Math.random() * 3);
      }
    })(0);
  }
  return { render, start };
})();
