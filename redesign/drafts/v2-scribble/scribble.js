/* Scribble lettering: every letter is redrawn in several slightly different
   crayon "drawings" and swapped a few times per second (replacement animation /
   line boil), like hand-lettering every frame in an edit.

   Glyph outlines come from Permanent Marker (window.MARKER_FONT_B64) via opentype.js.
   Each variant re-traces the outline twice with wobble and fills it with jittered
   crayon hatching at its own angle, so the drawings genuinely differ. */
window.Scribble = (() => {
  const VARIANTS = 3;
  const UNITS = 100;              // glyph drawn at font size 100
  let font = null;
  const glyphCache = new Map();   // ch -> { contours, adv, d }
  const letters = [];             // live letter records for the ticker
  const sampler = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  function seeded(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function loadFont() {
    if (font) return font;
    const bin = atob(window.MARKER_FONT_B64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    font = opentype.parse(buf.buffer);
    return font;
  }

  function glyph(ch) {
    if (glyphCache.has(ch)) return glyphCache.get(ch);
    const f = loadFont();
    const g = f.charToGlyph(ch);
    const path = g.getPath(0, 0, UNITS);
    const d = path.toPathData(2);
    // split into sub-paths and sample each one evenly
    const subs = d.split(/(?=M)/).filter(s => s.trim().length > 2);
    const contours = subs.map(sd => {
      sampler.setAttribute('d', sd);
      const len = sampler.getTotalLength();
      const n = Math.max(8, Math.round(len / 2.2));
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const p = sampler.getPointAtLength((i / n) * len);
        pts.push([p.x, p.y]);
      }
      return pts;
    });
    const rec = { contours, d, adv: (g.advanceWidth / f.unitsPerEm) * UNITS };
    glyphCache.set(ch, rec);
    return rec;
  }

  // wobble a closed contour along its normals with two low-frequency sines
  function wobble(pts, rnd, amp) {
    const p1 = rnd() * 6.28, p2 = rnd() * 6.28, f1 = 2 + rnd() * 3, f2 = 5 + rnd() * 5;
    const n = pts.length;
    return pts.map(([x, y], i) => {
      const a = pts[(i + 1) % n], b = pts[(i - 1 + n) % n];
      let nx = -(a[1] - b[1]), ny = a[0] - b[0];
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const t = i / n * 6.28;
      const o = amp * (Math.sin(t * f1 + p1) * .7 + Math.sin(t * f2 + p2) * .3);
      return [x + nx * o, y + ny * o];
    });
  }

  const poly = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');

  function drawVariant(ch, v, seed) {
    const g = glyph(ch);
    const rnd = seeded(seed * 97 + v * 13 + ch.charCodeAt(0) * 7);
    const rot = (rnd() - .5) * 7, sc = .95 + rnd() * .1, dx = (rnd() - .5) * 4, dy = (rnd() - .5) * 5;
    const clipId = `sc-${ch.charCodeAt(0)}-${seed}-${v}`;
    let out = `<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${rot.toFixed(1)} ${g.adv / 2} -35) scale(${sc.toFixed(3)})">`;
    out += `<clipPath id="${clipId}"><path d="${g.d}"/></clipPath>`;
    // crayon hatch fill, angle differs per drawing
    const ang = (-62 + (rnd() - .5) * 26) * Math.PI / 180;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    let hatch = '';
    for (let k = -140; k < 160; k += 3.1 + rnd() * 1.2) {
      const j1 = (rnd() - .5) * 2, j2 = (rnd() - .5) * 2;
      const cx = g.adv / 2 + k * -sa, cy = -36 + k * ca;
      hatch += `M${(cx - ca * 90 + j1).toFixed(1)} ${(cy - sa * 90).toFixed(1)}L${(cx + ca * 90 + j2).toFixed(1)} ${(cy + sa * 90).toFixed(1)}`;
    }
    out += `<path clip-path="url(#${clipId})" d="${hatch}" fill="none" stroke="currentColor" stroke-width="2.9" stroke-linecap="round" opacity=".92"/>`;
    // two wobbly tracing passes, each starting a little past where it ends
    for (let pass = 0; pass < 2; pass++) {
      for (const c of g.contours) {
        const w = wobble(c, rnd, 1.6 + pass * .6);
        const over = Math.round(w.length * (.04 + rnd() * .06));
        const traced = w.concat(w.slice(0, over));
        out += `<path d="${poly(traced)}" fill="none" stroke="currentColor" stroke-width="${(2.6 - pass * .7).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity="${pass ? .7 : 1}"/>`;
      }
    }
    return out + '</g>';
  }

  // Replace an element's text with scribbled letters. Keeps the text for screen readers.
  function render(el, { seed = 1 } = {}) {
    const text = el.textContent;
    el.setAttribute('aria-label', text.trim());
    el.textContent = '';
    const f = loadFont();
    const asc = (f.ascender / f.unitsPerEm) * UNITS, desc = (-f.descender / f.unitsPerEm) * UNITS;
    let i = 0;
    for (const word of text.split(/(\s+)/)) {
      if (!word) continue;
      if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(' ')); continue; }
      const w = document.createElement('span');
      w.className = 'sc-word';
      w.setAttribute('aria-hidden', 'true');
      for (const ch of word) {
        const g = glyph(ch);
        const pad = 8;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `${-pad} ${-asc - pad} ${g.adv + pad * 2} ${asc + desc + pad * 2}`);
        svg.setAttribute('class', 'sc-letter');
        svg.style.width = ((g.adv + pad * 2) / UNITS) + 'em'; svg.style.height = ((asc + desc + pad * 2) / UNITS) + 'em';
        svg.style.margin = `0 ${-(pad / UNITS)}em`;
        let html = '';
        for (let v = 0; v < VARIANTS; v++) html += `<g class="sc-v" style="display:${v ? 'none' : 'inline'}">${drawVariant(ch, v, seed + i)}</g>`;
        svg.innerHTML = html;
        w.appendChild(svg);
        letters.push({ svg, vs: [...svg.querySelectorAll('.sc-v')], cur: 0, next: 0, el });
        i++;
      }
      el.appendChild(w);
    }
    return el;
  }

  // Ticker: each letter holds its drawing for 2-4 ticks so neighbours change out of step.
  let tick = 0, running = false, visible = new WeakMap();
  const io = new IntersectionObserver(es => es.forEach(e => visible.set(e.target, e.isIntersecting)));
  function start(fps = 6) {
    if (running) return; running = true;
    letters.forEach(l => io.observe(l.el));
    let last = 0;
    const step = now => {
      requestAnimationFrame(step);
      if (now - last < 1000 / fps) return;   // sample real time, not refresh rate
      last = now; tick++;
      for (const l of letters) {
        if (visible.get(l.el) === false || tick < l.next) continue;
        let n; do { n = Math.floor(Math.random() * l.vs.length); } while (n === l.cur);
        l.vs[l.cur].style.display = 'none'; l.vs[n].style.display = 'inline';
        l.cur = n; l.next = tick + 1 + Math.floor(Math.random() * 3);
      }
    };
    requestAnimationFrame(step);
  }
  return { render, start, ready: () => !!window.opentype && !!window.MARKER_FONT_B64 };
})();
