/* v11 Cloud Sea: ink-brush write-on lettering.
   Font: Kaushan Script (OFL, window.INK_FONT_B64), parsed with opentype.js 1.3.4 so it works over file://.
   How a heading is painted:
     1. Every glyph is rasterised once at a working size and thinned (Zhang-Suen) to a one-pixel skeleton. The skeleton
        is traced into strokes, short spurs are pruned, and strokes that continue straight through a junction are joined.
        A distance transform gives the half-width of the letter at every skeleton point.
     2. Strokes are ordered like handwriting (left to right inside a glyph, the dots of i/j last) and given a direction
        (left to right for flat strokes, top to bottom for steep ones).
     3. Writing: a brush runs along each stroke. At every step it paints a thin slice of a real brush-stroke texture
        (assets/gen/brush-*.webp, white on black) across the stroke, so the bristle streaks follow the stroke direction,
        the start is the loaded press of the brush and the end is the dry-brush break-up of the texture. The paint is
        clipped to the letter, so the shape stays the font's shape. A small gold light rides the brush tip.
     4. Once written the letter fills in under the paint (so it stays readable), and then breathes: a soft gold ink
        bleed swells and settles, and a faint sheen drifts across the letters.
   API: InkBrush.render(el, {delay, speed})  ->  writes when the heading scrolls into view (the hero writes on load).
   Reduced motion: letters appear already written, with no breathing. */
window.InkBrush = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const WORK = 150;                  // working raster size of 1em for the skeleton
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const base = window.V9_BASE || '';
  let font = null;
  const glyphCache = new Map(), heads = [];

  function loadFont() {
    if (font) return font;
    const bin = atob(window.INK_FONT_B64), buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return (font = opentype.parse(buf.buffer));
  }

  /* ---------------- brush textures ---------------- */
  // a brush texture becomes {c: canvas (white, alpha = luminance), x0, x1, y0, y1: the stroke's extent}
  const brushes = [];
  function prepBrush(img) {
    const w = img.naturalWidth, h = img.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, w, h), p = d.data, col = new Float32Array(w), row = new Float32Array(h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, l = Math.max(p[i], p[i + 1], p[i + 2]);
      const a = clamp((l - 18) / 200); p[i] = p[i + 1] = p[i + 2] = 255; p[i + 3] = a * 255; col[x] += a; row[y] += a;
    }
    g.putImageData(d, 0, 0);
    const ext = (arr, n, th) => { let a = 0, b = n - 1; while (a < n && arr[a] < th) a++; while (b > a && arr[b] < th) b--; return [a, b]; };
    const [x0, x1] = ext(col, w, h * .02), [y0, y1] = ext(row, h, w * .03);
    return { c, x0, x1, y0: Math.max(0, y0 - 4), y1: Math.min(h, y1 + 4) };
  }
  // procedural fallback: a loaded press, bristle streaks along the stroke, a frayed dry end
  function makeBrush(seed) {
    const w = 900, h = 160, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 70; k++) {
      const y = h * (.1 + .8 * r()), end = w * (.72 + .28 * r()) * (Math.abs(y - h / 2) > h * .32 ? .8 : 1);
      g.strokeStyle = `rgba(255,255,255,${.35 + .6 * r()})`; g.lineWidth = 1 + 3 * r(); g.beginPath(); g.moveTo(20 + 30 * r(), y);
      for (let x = 60; x < end; x += 40) g.lineTo(x, y + (r() - .5) * 3);
      g.stroke();
    }
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(70, h / 2, 60, h * .42, 0, 0, Math.PI * 2); g.fill();
    return { c, x0: 10, x1: w - 10, y0: 0, y1: h };
  }
  const brushReady = new Promise(res => {
    const T = window.SEA_TEX || {};   // data URIs, so the pixels can be read over file://
    const srcs = [T.brushA || base + 'assets/gen/brush-a.webp', T.brushB || T.brushA || base + 'assets/gen/brush-b.webp'];
    let left = srcs.length;
    srcs.forEach((src, i) => {
      const im = new Image();
      im.onload = () => { try { brushes[i] = prepBrush(im); } catch (e) { brushes[i] = makeBrush(7 + i); } if (!--left) res(); };
      im.onerror = () => { brushes[i] = makeBrush(7 + i); if (!--left) res(); };
      im.src = src;
    });
  });

  /* ---------------- glyph skeletons ---------------- */
  function glyphData(ch) {
    if (glyphCache.has(ch)) return glyphCache.get(ch);
    const f = loadFont(), gl = f.charToGlyph(ch), bb = gl.getBoundingBox(), u = WORK / f.unitsPerEm;
    const pad = 6, ox = -bb.x1 * u + pad, oy = bb.y2 * u + pad;
    const W = Math.max(4, Math.ceil((bb.x2 - bb.x1) * u) + pad * 2), H = Math.max(4, Math.ceil((bb.y2 - bb.y1) * u) + pad * 2);
    const rec = { strokes: [], ox, oy };
    if (!gl.path || !gl.path.commands.length || !isFinite(W)) { glyphCache.set(ch, rec); return rec; }
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const p = gl.getPath(ox, oy, WORK); p.fill = '#fff'; p.draw(g);
    const a = g.getImageData(0, 0, W, H).data, N = W * H, img = new Uint8Array(N);
    for (let i = 0; i < N; i++) img[i] = a[i * 4 + 3] > 110 ? 1 : 0;
    const dist = distance(img, W, H), sk = thin(img, W, H);
    // a skeleton stops one half-width short of the letter's tips: run every open stroke out to the tip
    const ext = s => {
      if (s.length < 3) return s;
      const tip = (a, b) => { const dx = a[0] - b[0], dy = a[1] - b[1], l = Math.hypot(dx, dy) || 1, k = a[2] * 1.05; return [a[0] + dx / l * k, a[1] + dy / l * k, a[2] * .8]; };
      const k = Math.min(5, s.length - 1);
      const closed = Math.hypot(s[0][0] - s[s.length - 1][0], s[0][1] - s[s.length - 1][1]) < 3;
      return closed ? s : [tip(s[0], s[k]), ...s, tip(s[s.length - 1], s[s.length - 1 - k])];
    };
    rec.strokes = trace(sk, dist, W, H).map(s => ext(s).map(([x, y, r]) => [(x - ox) / WORK, (y - oy) / WORK, r / WORK]));
    order(rec.strokes);
    glyphCache.set(ch, rec);
    return rec;
  }
  // chamfer 3-4 distance to the background, in pixels
  function distance(img, W, H) {
    const d = new Float32Array(W * H), INF = 1e9;
    for (let i = 0; i < W * H; i++) d[i] = img[i] ? INF : 0;
    const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : d[y * W + x];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!d[i]) continue; d[i] = Math.min(d[i], at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4); }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = y * W + x; if (!d[i]) continue; d[i] = Math.min(d[i], at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4); }
    for (let i = 0; i < W * H; i++) d[i] /= 3;
    return d;
  }
  // Zhang-Suen thinning
  function thin(src, W, H) {
    const m = src.slice(), del = [];
    const P = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : m[y * W + x];
    let changed = true;
    while (changed) {
      changed = false;
      for (let pass = 0; pass < 2; pass++) {
        del.length = 0;
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          if (!m[y * W + x]) continue;
          const p2 = P(x, y - 1), p3 = P(x + 1, y - 1), p4 = P(x + 1, y), p5 = P(x + 1, y + 1), p6 = P(x, y + 1), p7 = P(x - 1, y + 1), p8 = P(x - 1, y), p9 = P(x - 1, y - 1);
          const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9; if (B < 2 || B > 6) continue;
          const seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2]; let A = 0; for (let k = 0; k < 8; k++) if (!seq[k] && seq[k + 1]) A++;
          if (A !== 1) continue;
          if (pass === 0 ? (p2 * p4 * p6 || p4 * p6 * p8) : (p2 * p4 * p8 || p2 * p6 * p8)) continue;
          del.push(y * W + x);
        }
        if (del.length) { changed = true; for (const i of del) m[i] = 0; }
      }
    }
    return m;
  }
  const NB = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  // skeleton pixels -> polylines [x, y, radius]; spurs pruned, straight continuations through junctions joined
  function trace(sk, dist, W, H) {
    const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && sk[y * W + x];
    const deg = (x, y) => { let n = 0; for (const [dx, dy] of NB) if (on(x + dx, y + dy)) n++; return n; };
    // crossing number: how many separate skeleton branches touch this pixel (robust to staircase corners)
    const RING = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
    const cn = (x, y) => { let c = 0; for (let k = 0; k < 8; k++) { const a = RING[k], b = RING[(k + 1) % 8]; if (!on(x + a[0], y + a[1]) && on(x + b[0], y + b[1])) c++; } return c; };
    // remove staircase corner pixels (a pixel whose removal keeps its neighbours connected and that sits in an L corner)
    for (let pass = 0; pass < 2; pass++) for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!sk[y * W + x] || deg(x, y) < 2 || cn(x, y) !== 1) continue;
      const N = on(x, y - 1), E = on(x + 1, y), S_ = on(x, y + 1), Wst = on(x - 1, y);
      if ((N && E) || (E && S_) || (S_ && Wst) || (Wst && N)) sk[y * W + x] = 0;
    }
    const node = (x, y) => { const d = deg(x, y); return d <= 1 || cn(x, y) >= 3; };
    const used = new Set(), key = (x, y, X, Y) => x < X || (x === X && y < Y) ? `${x},${y},${X},${Y}` : `${X},${Y},${x},${y}`;
    let paths = [];
    const walk = (x, y, dx, dy) => {
      const pts = [[x, y]]; let px = x, py = y, cx = x + dx, cy = y + dy;
      used.add(key(px, py, cx, cy));
      for (let guard = 0; guard < 5000; guard++) {
        pts.push([cx, cy]);
        if (node(cx, cy) && !(cx === x && cy === y && pts.length < 3)) break;
        let nx = null;
        for (const [ex, ey] of NB) { const qx = cx + ex, qy = cy + ey; if (!on(qx, qy) || (qx === px && qy === py)) continue; if (used.has(key(cx, cy, qx, qy))) continue; nx = [qx, qy]; break; }
        if (!nx) break;
        used.add(key(cx, cy, nx[0], nx[1])); px = cx; py = cy; cx = nx[0]; cy = nx[1];
        if (cx === x && cy === y) { pts.push([cx, cy]); break; }
      }
      return pts;
    };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!on(x, y) || !node(x, y)) continue;
      if (deg(x, y) === 0) { paths.push([[x, y]]); continue; }
      for (const [dx, dy] of NB) if (on(x + dx, y + dy) && !used.has(key(x, y, x + dx, y + dy))) paths.push(walk(x, y, dx, dy));
    }
    // loops without any node (o, 0): start at the top-right of the loop
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!on(x, y)) continue;
      for (const [dx, dy] of NB) if (on(x + dx, y + dy) && !used.has(key(x, y, x + dx, y + dy))) paths.push(walk(x, y, dx, dy));
    }
    const R = (x, y) => dist[y * W + x] || 1;
    const isEnd = (x, y) => deg(x, y) === 1;
    // prune short spurs that hang off a junction
    for (let it = 0; it < 2; it++) paths = paths.filter(p => {
      if (p.length < 2) return true;
      const a = p[0], b = p[p.length - 1], ea = isEnd(a[0], a[1]), eb = isEnd(b[0], b[1]);
      if (ea === eb) return true;
      const j = ea ? b : a;
      if (p.length < R(j[0], j[1]) * 1.25 + 2) { for (const [x, y] of p) if (!(x === j[0] && y === j[1])) sk[y * W + x] = 0; return false; }
      return true;
    });
    paths = paths.filter(p => p.length > 3 || isEnd(p[0][0], p[0][1]) || isEnd(p[p.length - 1][0], p[p.length - 1][1]) || p.length === 1);
    // join paths that meet at the same junction and run on in nearly the same direction
    const dirOut = (p, atStart) => { const k = Math.min(p.length - 1, 8); const a = atStart ? p[0] : p[p.length - 1], b = atStart ? p[k] : p[p.length - 1 - k]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
    const near = (p, q) => Math.abs(p[0] - q[0]) <= 3 && Math.abs(p[1] - q[1]) <= 3;
    const endsNear = pt => { let n = 0; for (const p of paths) if (p.length > 1) { if (near(p[0], pt)) n++; if (near(p[p.length - 1], pt)) n++; } return n; };
    let merged = true;
    while (merged) {
      merged = false;
      outer: for (let i = 0; i < paths.length; i++) for (let j = i + 1; j < paths.length; j++) {
        const A = paths[i], B = paths[j]; if (A.length < 3 || B.length < 3) continue;
        for (const ai of [0, 1]) for (const bi of [0, 1]) {
          const pa = ai ? A[A.length - 1] : A[0], pb = bi ? B[B.length - 1] : B[0];
          if (!near(pa, pb)) continue;
          const da = dirOut(A, !ai), db = dirOut(B, !bi), straight = da[0] * db[0] + da[1] * db[1];
          // two ends alone at a point are one line; at a real junction only the straightest pair runs on
          if (!(endsNear(pa) === 2 && straight < .3) && straight > -.6) continue;
          const a2 = ai ? A : A.slice().reverse(), b2 = bi ? B.slice().reverse() : B;
          paths[i] = a2.concat(b2.slice(1)); paths.splice(j, 1); merged = true; break outer;
        }
      }
    }
    // smooth, resample every ~1.5px, attach radii
    return paths.map(p => {
      if (p.length < 2) return [[p[0][0], p[0][1], R(p[0][0], p[0][1])]];
      const sm = p.map((q, i) => { let sx = 0, sy = 0, n = 0; for (let k = -3; k <= 3; k++) { const r = p[clamp(i + k, 0, p.length - 1)]; sx += r[0]; sy += r[1]; n++; } return [i === 0 || i === p.length - 1 ? q[0] : sx / n, i === 0 || i === p.length - 1 ? q[1] : sy / n, R(q[0], q[1])]; });
      const out = [sm[0]]; let acc = 0;
      for (let i = 1; i < sm.length; i++) { acc += Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1]); if (acc >= 1.5 || i === sm.length - 1) { out.push(sm[i]); acc = 0; } }
      // radii: smooth them too, so the brush does not pulse at pixel steps
      return out.map((q, i) => { let s = 0, n = 0; for (let k = -4; k <= 4; k++) { const r = out[clamp(i + k, 0, out.length - 1)]; s += r[2]; n++; } return [q[0], q[1], s / n]; });
    });
  }
  // direction and order, like a hand would write it
  function order(strokes) {
    strokes.forEach((s, i) => {
      if (s.length < 2) return;
      const a = s[0], b = s[s.length - 1], dx = b[0] - a[0], dy = b[1] - a[1];
      const flip = Math.abs(dx) > Math.abs(dy) * .7 ? dx < 0 : dy < 0;
      if (flip) strokes[i] = s.reverse();
    });
    const len = s => { let L = 0; for (let i = 1; i < s.length; i++) L += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); return L; };
    strokes.forEach(s => { s.L = len(s); s.minx = Math.min(...s.map(q => q[0])); s.miny = Math.min(...s.map(q => q[1])); s.dot = s.L < .06; });
    strokes.sort((a, b) => (a.dot - b.dot) || (a.minx + a.miny * .25) - (b.minx + b.miny * .25));
  }

  /* ---------------- headings ---------------- */
  function render(el, opts = {}) {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text); el.textContent = '';
    const cv = document.createElement('canvas'); cv.className = 'ink-cv'; cv.setAttribute('aria-hidden', 'true');
    el.appendChild(cv);
    const h = { el, cv, g: cv.getContext('2d'), text, opts, state: reduce ? 'done' : 'idle', t0: 0, delay: opts.delay || 0, speed: opts.speed || 1, vis: true };
    heads.push(h);
    layout(h);
    io.observe(el);
    return h;
  }
  // lines of glyph placements in em units; wraps at spaces when the heading would overflow its container
  function place(h, sizePx, maxW) {
    const f = loadFont(), words = h.text.split(/\s+/), scale = 1 / f.unitsPerEm;
    const measure = w => f.getAdvanceWidth(w, 1, { kerning: true });
    const space = measure(' ') * .9, lines = [[]]; let lw = 0;
    for (const w of words) {
      const ww = measure(w);
      if (lines[lines.length - 1].length && (lw + space + ww) * sizePx > maxW) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push(w); lw += (lw ? space : 0) + ww;
    }
    const asc = f.ascender * scale, desc = -f.descender * scale, lh = .95;
    const glyphs = []; let maxx = 0, minx = 0;
    lines.forEach((ws, li) => {
      let x = 0; const y = asc + li * lh;
      ws.forEach((w, wi) => {
        if (wi) x += space;
        f.forEachGlyph(w, x, y, 1, { kerning: true }, (gl, gx, gy) => { if (gl.unicode && gl.unicode !== 32) glyphs.push({ ch: String.fromCharCode(gl.unicode), x: gx, y: gy }); });
        x += measure(w);
      });
      maxx = Math.max(maxx, x);
    });
    // brush scripts overhang their advance: measure the real ink box
    let x0 = 0, x1 = maxx;
    for (const q of glyphs) { const bb = f.charToGlyph(q.ch).getBoundingBox(); x0 = Math.min(x0, q.x + bb.x1 * scale); x1 = Math.max(x1, q.x + bb.x2 * scale); }
    return { glyphs, w: x1 - x0, x0, h: asc + desc + (lines.length - 1) * lh, lines: lines.length };
  }
  function layout(h) {
    const cs = getComputedStyle(h.el), size = parseFloat(cs.fontSize) || 80;
    const box = h.el.parentElement.getBoundingClientRect(), pcs = getComputedStyle(h.el.parentElement);
    const maxW = Math.max(120, box.width - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight));
    const L = place(h, size, maxW), pad = .14;                         // pad for the brush overhang and the glow
    const cw = (L.w + pad * 2) * size, ch = (L.h + pad * 2) * size;
    h.size = size; h.L = L; h.pad = pad; h.cw = cw; h.ch = ch;
    h.cv.style.width = cw + 'px'; h.cv.style.height = ch + 'px';
    h.cv.style.margin = `${-pad * size}px ${-pad * size}px ${-pad * size}px ${-pad * size}px`;
    h.cv.width = Math.round(cw * DPR); h.cv.height = Math.round(ch * DPR);
    const mk = () => { const c = document.createElement('canvas'); c.width = h.cv.width; c.height = h.cv.height; return c; };
    h.mask = mk(); h.paint = mk(); h.ink = mk(); h.done = null; h.bleed = null;
    const S = size * DPR, ox = (pad - L.x0) * S, oy = pad * S;
    h.S = S; h.ox = ox; h.oy = oy;
    // glyph mask and the ink colour (luminous cream at the top of each line, warm gold lower down)
    const f = loadFont(), mg = h.mask.getContext('2d');
    mg.fillStyle = '#fff';
    for (const q of L.glyphs) { const p = f.getPath(q.ch, ox + q.x * S, oy + q.y * S, S); p.fill = '#fff'; p.draw(mg); }
    const ig = h.ink.getContext('2d'), asc = f.ascender / f.unitsPerEm;
    let top = 0;
    for (let li = 0; li < L.lines; li++) {
      const bl = oy + (asc + li * .95) * S, bottom = li === L.lines - 1 ? h.ink.height : bl + S * .16;
      const gr = ig.createLinearGradient(0, bl - S * .78, 0, bl + S * .12);
      gr.addColorStop(0, '#fff4da'); gr.addColorStop(.45, '#ffe6b4'); gr.addColorStop(.8, '#ffd08a'); gr.addColorStop(1, '#f2b062');
      ig.fillStyle = gr; ig.fillRect(0, top, h.ink.width, bottom - top); top = bottom;
    }
    // the strokes, in canvas pixels, with their time slots
    h.strokes = []; let t = 0;
    for (const q of L.glyphs) {
      const gd = glyphData(q.ch); let tg = t;
      for (const s of gd.strokes) {
        const pts = s.map(([x, y, r]) => [ox + (q.x + x) * S, oy + (q.y + y) * S, r * S]);
        const len = s.L * S, dur = s.dot ? .1 : .07 + s.L * .42;
        h.strokes.push({ pts, len, dot: s.dot, t0: tg, t1: tg + dur, drawn: 0, i: 0, brush: brushes[(h.strokes.length * 7 + q.ch.charCodeAt(0)) % 2] });
        tg += dur * .9;
      }
      t = Math.max(t + .08, tg - .03);
    }
    // every heading finishes in a set time, whatever its length: the hero name takes longest
    h.speed = t / (h.opts.target || 1.5);
    h.total = t / h.speed;
    if (h.state === 'writing') { h.state = 'idle'; h.t0 = 0; }   // a resize mid-write starts over cleanly
    if (h.state === 'done' || reduce) finish(h); else clear(h);
  }
  function clear(h) { h.paint.getContext('2d').clearRect(0, 0, h.paint.width, h.paint.height); h.g.clearRect(0, 0, h.cv.width, h.cv.height); }

  // paint one stroke from its current progress up to `upto` pixels of its length
  function paintStroke(pg, s, upto) {
    const b = s.brush || brushes[0]; if (!b) return;
    const P = s.pts;
    if (s.dot || P.length < 2) {
      const [x, y, r] = P[0]; pg.setTransform(1, 0, 0, 1, x, y); pg.rotate(-.5);
      pg.drawImage(b.c, b.x0, b.y0, (b.x1 - b.x0) * .25, b.y1 - b.y0, -r * 1.7, -r * 1.6, r * 3.4, r * 3.2); pg.setTransform(1, 0, 0, 1, 0, 0);
      s.drawn = s.len + 1; return;
    }
    const bw = b.x1 - b.x0, bh = b.y1 - b.y0;
    let d = s.drawn;
    while (s.i < P.length - 1) {
      const a = P[s.i], c = P[s.i + 1], seg = Math.hypot(c[0] - a[0], c[1] - a[1]) || .001;
      if (d + seg > upto) break;
      const ang = Math.atan2(c[1] - a[1], c[0] - a[0]), u0 = d / (s.len || 1), u1 = (d + seg) / (s.len || 1);
      const r = (a[2] + c[2]) / 2, wid = Math.max(3, r * 3.1), step = seg * 2.2;
      pg.setTransform(Math.cos(ang), Math.sin(ang), -Math.sin(ang), Math.cos(ang), (a[0] + c[0]) / 2, (a[1] + c[1]) / 2);
      // the texture's loaded body runs most of the stroke; its dry, fraying tail is kept for the last stretch
      const tu = u => u < .82 ? u / .82 * .62 : .62 + (u - .82) / .18 * .38;
      const sx = b.x0 + bw * tu(clamp(u0)), sw = Math.max(1, bw * (tu(clamp(u1)) - tu(clamp(u0))) * 2.2);
      pg.drawImage(b.c, Math.min(sx, b.x1 - sw), b.y0, sw, bh, -step / 2, -wid / 2, step, wid);
      d += seg; s.i++;
    }
    pg.setTransform(1, 0, 0, 1, 0, 0);
    s.drawn = d;
    if (s.i >= P.length - 1) s.drawn = s.len + 1;
  }
  // the brush moves quickly through the middle of a stroke and lingers at the press and the lift
  const ease = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;

  function compose(h, tip) {
    const g = h.g, W = h.cv.width, H = h.cv.height;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
    g.drawImage(h.paint, 0, 0);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(h.mask, 0, 0);
    g.globalCompositeOperation = 'source-in'; g.drawImage(h.ink, 0, 0);
    g.globalCompositeOperation = 'source-over';
    if (tip) {
      g.globalCompositeOperation = 'lighter';
      const r = Math.max(10, h.S * .16), gr = g.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], r);
      gr.addColorStop(0, 'rgba(255,250,230,.95)'); gr.addColorStop(.25, 'rgba(255,214,138,.55)'); gr.addColorStop(1, 'rgba(255,190,120,0)');
      g.fillStyle = gr; g.fillRect(tip[0] - r, tip[1] - r, r * 2, r * 2);
      g.globalCompositeOperation = 'source-over';
    }
  }
  // final, readable letters: the paint over a slightly dimmer full fill, plus a blurred bleed copy for breathing
  function finish(h) {
    for (const s of h.strokes) if (s.drawn <= s.len) { s.i = s.i || 0; paintStroke(h.paint.getContext('2d'), s, Infinity); }
    const W = h.cv.width, H = h.cv.height, d = document.createElement('canvas'); d.width = W; d.height = H; const g = d.getContext('2d');
    g.globalAlpha = .22; g.drawImage(h.mask, 0, 0); g.globalAlpha = 1; g.drawImage(h.paint, 0, 0);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(h.mask, 0, 0);
    g.globalCompositeOperation = 'source-in'; g.drawImage(h.ink, 0, 0);
    h.done = d;
    const bl = document.createElement('canvas'); bl.width = W; bl.height = H; const bg = bl.getContext('2d');
    bg.filter = `blur(${Math.max(4, h.S * .045)}px)`; bg.drawImage(d, 0, 0); bg.filter = 'none';
    bg.globalCompositeOperation = 'source-in'; bg.fillStyle = '#ffc870'; bg.fillRect(0, 0, W, H);
    h.bleed = bl;
    h.sheen = document.createElement('canvas'); h.sheen.width = W; h.sheen.height = H;
    h.state = 'done'; h.doneAt = performance.now();
    breathe(h, performance.now() / 1000);
  }
  function breathe(h, t) {
    const g = h.g, W = h.cv.width, H = h.cv.height;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
    const k = reduce ? .5 : .5 + .5 * Math.sin(t * .9 + h.cv.width * .001);
    const settle = reduce ? 1 : clamp((performance.now() - h.doneAt) / 900);
    // the ink bleed: swells in as the writing finishes, then breathes
    g.globalAlpha = (.28 + .22 * k) * (1.6 - .6 * settle); g.drawImage(h.bleed, 0, 0);
    g.globalAlpha = 1; g.drawImage(h.done, 0, 0);
    if (!reduce) {
      // a sheen drifting slowly across the wet ink
      const sg = h.sheen.getContext('2d'), x = ((t * .07 + h.cv.width * .0003) % 1.6 - .3) * W;
      sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, W, H);
      const gr = sg.createLinearGradient(x - W * .12, 0, x + W * .12, H * .4);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,250,235,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      sg.fillStyle = gr; sg.fillRect(0, 0, W, H);
      sg.globalCompositeOperation = 'destination-in'; sg.drawImage(h.done, 0, 0);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = .45; g.drawImage(h.sheen, 0, 0);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    }
  }

  /* ---------------- clock ---------------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    const h = heads.find(q => q.el === e.target); if (!h) return;
    h.vis = e.isIntersecting;
    if (e.isIntersecting && h.state === 'idle' && !h.queued) { h.queued = true; brushReady.then(() => { h.state = 'writing'; h.t0 = performance.now() / 1000 + h.delay; }); }
  }), { rootMargin: '0px 0px -12% 0px' });
  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const t = now / 1000;
    const breathing = now - last > 33; if (breathing) last = now;
    for (const h of heads) {
      if (h.state === 'writing') {
        const e = (t - h.t0) * h.speed; if (e < 0) continue;
        const pg = h.paint.getContext('2d'); let tip = null;
        for (const s of h.strokes) {
          if (e < s.t0 || s.drawn > s.len) continue;
          const u = clamp((e - s.t0) / (s.t1 - s.t0)), upto = ease(u) * s.len;
          paintStroke(pg, s, u >= 1 ? Infinity : upto);
          if (u < 1 && !s.dot) { const q = s.pts[Math.min(s.pts.length - 1, s.i)]; tip = [q[0], q[1]]; }
        }
        compose(h, tip);
        if (e >= h.total + .15) finish(h);
      } else if (h.state === 'done' && h.vis && breathing && !reduce) breathe(h, t);
    }
  }
  if (!reduce) requestAnimationFrame(frame);

  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => heads.forEach(layout), 150); });
  brushReady.then(() => heads.forEach(h => { if (h.state === 'done') { layout(h); } }));
  return { render, relayout: () => heads.forEach(layout) };
})();
