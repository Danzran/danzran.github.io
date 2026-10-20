/* LetterCore: shared plumbing for the v11 lettering effects (redesign/assets/lettering/*.js).
   - fonts: outline fonts are base64 WOFF in window.LETTER_FONTS[key] (parsed with opentype.js 1.3.4),
            single-line stroke fonts are glyph tables in window.LETTER_SLFONTS[key] (SVG path data, pen order).
   - layout(el, opts): makes a HiDPI canvas inside el, fits the text to the width (wraps at spaces if it
            would get too small) and returns per-glyph polylines in CSS px.
   - run(el, layoutOpts, effect): the animation runner every effect uses (replay, loop, visibility pause,
            resize, prefers-reduced-motion = final frame only).
   No DOM globals other than window.LetterCore / window.LetterFX. Works over file://. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = {
    out: t => 1 - Math.pow(1 - clamp01(t), 3),
    inOut: t => { t = clamp01(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    smooth: (a, b, v) => { v = clamp01((v - a) / (b - a)); return v * v * (3 - 2 * v); },
  };
  const rng = s => () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /* smooth 1-D / 2-D value noise, -1..1 */
  const P = new Float32Array(512); { const r = rng(91); for (let i = 0; i < 512; i++) P[i] = r() * 2 - 1; }
  const fade = t => t * t * (3 - 2 * t);
  const n1 = x => { const i = Math.floor(x), f = x - i; return P[i & 511] + (P[(i + 1) & 511] - P[i & 511]) * fade(f); };
  const PM = new Uint8Array(512); { const r = rng(7), a = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } for (let i = 0; i < 512; i++) PM[i] = a[i & 255]; }
  const n2 = (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = fade(x - i), fy = fade(y - j);
    const h = (a, b) => P[PM[(PM[a & 255] + b) & 255] * 2 & 511];
    const a = h(i, j), b = h(i + 1, j), c = h(i, j + 1), d = h(i + 1, j + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; };

  /* ---------------- fonts ---------------- */
  const cache = {};
  function b64ToBuf(b64) { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; }
  function font(key) {
    if (cache[key]) return cache[key];
    const sl = (window.LETTER_SLFONTS || {})[key];
    if (sl) return (cache[key] = { type: 'single', key, data: sl, upm: sl.upm, ascent: sl.ascent, descent: sl.descent });
    const b64 = (window.LETTER_FONTS || {})[key];
    if (!b64) throw new Error('LetterCore: font "' + key + '" not loaded (include redesign/assets/fonts/' + key + '-font.js)');
    if (!window.opentype) throw new Error('LetterCore: opentype.js 1.3.4 is required');
    const f = opentype.parse(b64ToBuf(b64));
    return (cache[key] = { type: 'outline', key, ot: f, upm: f.unitsPerEm, ascent: f.ascender, descent: f.descender });
  }

  /* flatten opentype commands -> closed polylines */
  function flattenCmds(cmds, tol = .6) {
    const out = []; let cur = null, x = 0, y = 0, sx = 0, sy = 0;
    const seg = (n, fn) => { for (let i = 1; i <= n; i++) cur.push(fn(i / n)); };
    for (const c of cmds) {
      if (c.type === 'M') { if (cur && cur.length > 1) out.push(cur); cur = [[c.x, c.y]]; x = sx = c.x; y = sy = c.y; }
      else if (c.type === 'L') { cur.push([c.x, c.y]); x = c.x; y = c.y; }
      else if (c.type === 'Q') { const L = Math.hypot(c.x1 - x, c.y1 - y) + Math.hypot(c.x - c.x1, c.y - c.y1), n = Math.max(2, Math.ceil(Math.sqrt(L / tol) * 1.2)), x0 = x, y0 = y;
        seg(n, t => { const u = 1 - t; return [u * u * x0 + 2 * u * t * c.x1 + t * t * c.x, u * u * y0 + 2 * u * t * c.y1 + t * t * c.y]; }); x = c.x; y = c.y; }
      else if (c.type === 'C') { const L = Math.hypot(c.x1 - x, c.y1 - y) + Math.hypot(c.x2 - c.x1, c.y2 - c.y1) + Math.hypot(c.x - c.x2, c.y - c.y2), n = Math.max(3, Math.ceil(Math.sqrt(L / tol) * 1.3)), x0 = x, y0 = y;
        seg(n, t => { const u = 1 - t; return [u * u * u * x0 + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x, u * u * u * y0 + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y]; }); x = c.x; y = c.y; }
      else if (c.type === 'Z') { if (cur && cur.length > 1) { const a = cur[0], b = cur[cur.length - 1]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) < .01) cur.pop(); out.push(cur); } cur = null; x = sx; y = sy; }
    }
    if (cur && cur.length > 1) out.push(cur);
    return out;
  }

  /* minimal SVG path parser (M L H V C S Q T Z, abs + rel) -> open polylines in font units */
  function parseSvgPath(d, tol = 4) {
    const toks = d.match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/g) || [];
    const out = []; let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, cur = null, lcx = 0, lcy = 0, lq = null;
    const num = () => parseFloat(toks[i++]);
    const push = (px, py) => { cur.push([px, py]); x = px; y = py; };
    const bez = (x1, y1, x2, y2, ex, ey) => { const L = Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(ex - x2, ey - y2), n = Math.max(3, Math.ceil(L / (tol * 3))), x0 = x, y0 = y;
      for (let k = 1; k <= n; k++) { const t = k / n, u = 1 - t; cur.push([u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * ex, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * ey]); }
      x = ex; y = ey; lcx = x2; lcy = y2; };
    while (i < toks.length) {
      if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
      if (C === 'M') { if (cur && cur.length > 1) out.push(cur); const px = num() + ox, py = num() + oy; cur = [[px, py]]; x = sx = px; y = sy = py; cmd = rel ? 'l' : 'L'; lq = null; continue; }
      if (C === 'Z') { if (cur) { cur.push([sx, sy]); out.push(cur); cur = null; } x = sx; y = sy; continue; }
      if (!cur) cur = [[x, y]];
      if (C === 'L') push(num() + ox, num() + oy);
      else if (C === 'H') push(num() + ox, y);
      else if (C === 'V') push(x, num() + oy);
      else if (C === 'C') { const a = num() + ox, b = num() + oy, c = num() + ox, d2 = num() + oy, e = num() + ox, f = num() + oy; bez(a, b, c, d2, e, f); continue; }
      else if (C === 'S') { const a = 2 * x - lcx, b = 2 * y - lcy, c = num() + ox, d2 = num() + oy, e = num() + ox, f = num() + oy; bez(a, b, c, d2, e, f); continue; }
      else if (C === 'Q' || C === 'T') { let qx, qy; if (C === 'Q') { qx = num() + ox; qy = num() + oy; } else { qx = lq ? 2 * x - lq[0] : x; qy = lq ? 2 * y - lq[1] : y; }
        const ex = num() + ox, ey = num() + oy; bez(x + 2 / 3 * (qx - x), y + 2 / 3 * (qy - y), ex + 2 / 3 * (qx - ex), ey + 2 / 3 * (qy - ey), ex, ey); lq = [qx, qy]; continue; }
      else { i++; continue; }
      lcx = x; lcy = y; lq = null;
    }
    if (cur && cur.length > 1) out.push(cur);
    return out;
  }

  /* ---------------- geometry helpers ---------------- */
  function polyLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
  /* even arclength resample; closed polylines wrap */
  function resample(poly, step, closed) {
    const pts = closed ? poly.concat([poly[0]]) : poly, cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = cum[cum.length - 1], n = Math.max(2, Math.round(L / step)), out = []; let s = 0;
    const last = closed ? n - 1 : n;
    for (let k = 0; k <= last; k++) {
      const d = (k / n) * L; while (s < pts.length - 2 && cum[s + 1] < d) s++;
      const a = pts[s], b = pts[s + 1], f = (d - cum[s]) / ((cum[s + 1] - cum[s]) || 1);
      out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
    }
    out.length = Math.max(out.length, 0); out.L = L; return out;
  }
  /* Catmull-Rom smoothing for coarse single-line fonts */
  function smoothPoly(p, sub = 4) {
    if (p.length < 3) return p; const o = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
      // keep sharp corners sharp
      const a1 = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), a2 = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
      let da = Math.abs(a2 - a1); if (da > Math.PI) da = 2 * Math.PI - da;
      if (da > 1.9 && i > 0) { o.push(p2); continue; }
      for (let k = 1; k <= sub; k++) { const t = k / sub, t2 = t * t, t3 = t2 * t;
        o.push([.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); }
    }
    return o;
  }
  /* point + tangent at distance d along a resampled polyline (pts from resample) */
  function along(pts, f) {
    const n = pts.length - 1, x = clamp01(f) * n, i = Math.min(n - 1, Math.floor(x)), t = x - i, a = pts[i], b = pts[i + 1] || a;
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, a: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  }
  function bbox(polys) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of polys) for (const q of p) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 }; }
  function toPath2D(polys, closed) { const p = new Path2D(); for (const c of polys) { p.moveTo(c[0][0], c[0][1]); for (let i = 1; i < c.length; i++) p.lineTo(c[i][0], c[i][1]); if (closed) p.closePath(); } return p; }
  /* Douglas-Peucker */
  function simplify(p, eps) {
    if (p.length < 3) return p.slice(); const keep = new Uint8Array(p.length); keep[0] = keep[p.length - 1] = 1; const st = [[0, p.length - 1]];
    while (st.length) { const [a, b] = st.pop(); let md = 0, mi = -1; const ax = p[a][0], ay = p[a][1], dx = p[b][0] - ax, dy = p[b][1] - ay, L = Math.hypot(dx, dy) || 1;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((p[i][0] - ax) * dy - (p[i][1] - ay) * dx) / L; if (d > md) { md = d; mi = i; } }
      if (md > eps && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
    return p.filter((_, i) => keep[i]);
  }


  /* ---------------- skeleton (centre-lines of an outline glyph) ----------------
     Rasterise, chamfer distance transform, Zhang-Suen thinning, trace into polylines, prune spurs.
     Returns [{pts:[[x,y]..], r:[radius..]}] in the same CSS px space as the polys. */
  function skeleton(polys, res = 2) {
    const bb = bbox(polys), M = 3, w = Math.ceil(bb.w * res) + M * 2, h = Math.ceil(bb.h * res) + M * 2;
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true });
    x.setTransform(res, 0, 0, res, (M - bb.x0 * res), (M - bb.y0 * res)); x.fill(toPath2D(polys, true), 'nonzero');
    const a = x.getImageData(0, 0, w, h).data, N = w * h, img = new Uint8Array(N), D = new Float32Array(N);
    for (let i = 0; i < N; i++) { img[i] = a[i * 4 + 3] > 110 ? 1 : 0; D[i] = img[i] ? 1e6 : 0; }
    for (let y = 1; y < h - 1; y++) for (let X = 1; X < w - 1; X++) { const i = y * w + X; if (!img[i]) continue; D[i] = Math.min(D[i], D[i - 1] + 1, D[i - w] + 1, D[i - w - 1] + 1.414, D[i - w + 1] + 1.414); }
    for (let y = h - 2; y > 0; y--) for (let X = w - 2; X > 0; X--) { const i = y * w + X; if (!img[i]) continue; D[i] = Math.min(D[i], D[i + 1] + 1, D[i + w] + 1, D[i + w + 1] + 1.414, D[i + w - 1] + 1.414); }
    // Zhang-Suen
    const nb = i => [img[i - w], img[i - w + 1], img[i + 1], img[i + w + 1], img[i + w], img[i + w - 1], img[i - 1], img[i - w - 1]];
    let changed = true; const del = [];
    while (changed) { changed = false;
      for (let pass = 0; pass < 2; pass++) { del.length = 0;
        for (let y = 1; y < h - 1; y++) for (let X = 1; X < w - 1; X++) { const i = y * w + X; if (!img[i]) continue; const p = nb(i); let B = 0, A = 0; for (let k = 0; k < 8; k++) { B += p[k]; if (!p[k] && p[(k + 1) & 7]) A++; }
          if (B < 2 || B > 6 || A !== 1) continue;
          if (pass === 0 ? (p[0] * p[2] * p[4] === 0 && p[2] * p[4] * p[6] === 0) : (p[0] * p[2] * p[6] === 0 && p[0] * p[4] * p[6] === 0)) del.push(i); }
        for (const i of del) img[i] = 0; if (del.length) changed = true; } }
    const OFF = [-w, -w + 1, 1, w + 1, w, w - 1, -1, -w - 1], DIR = OFF.map(o => [((o % w) + w + 1) % w - 1, Math.round((o - (((o % w) + w + 1) % w - 1)) / w)]);
    const vis = new Uint8Array(N), owner = new Int32Array(N).fill(-1), chains = [];
    const free = i => { let n = 0; for (const o of OFF) if (img[i + o] && !vis[i + o]) n++; return n; };
    // greedy chaining: start at the pixel with the fewest unvisited neighbours, keep going as straight as possible
    const px = []; for (let i = 0; i < N; i++) if (img[i]) px.push(i);
    while (true) {
      let s = -1, best = 9;
      for (const i of px) if (!vis[i]) { const f = free(i); if (f < best) { best = f; s = i; if (f <= 1) break; } }
      if (s < 0) break;
      const ch = [s]; vis[s] = 1; owner[s] = chains.length; let cur = s, dx = 0, dy = 0;
      while (true) {
        let nx = -1, sc = -1e9;
        for (let k = 0; k < 8; k++) { const j = cur + OFF[k]; if (!img[j] || vis[j]) continue; const [ex, ey] = DIR[k], L = Math.hypot(ex, ey);
          const v = ch.length > 1 ? (ex * dx + ey * dy) / L : 0; const score = v * 2 - (L > 1 ? .15 : 0) - free(j) * .05; if (score > sc) { sc = score; nx = j; } }
        if (nx < 0) break;
        const ex = (nx % w) - (cur % w), ey = ((nx / w) | 0) - ((cur / w) | 0), L = Math.hypot(ex, ey);
        dx = dx * .6 + ex / L * .4; dy = dy * .6 + ey / L * .4; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
        vis[nx] = 1; owner[nx] = chains.length; ch.push(nx); cur = nx;
      }
      chains.push(ch);
    }
    const toXY = i => [bb.x0 + ((i % w) - M) / res, bb.y0 + (((i / w) | 0) - M) / res];
    let strokes = chains.map((e, ci) => { let touches = false; for (const i of e) for (const o of OFF) if (img[i + o] && owner[i + o] !== ci) touches = true;
      return { pts: e.length === 1 ? [toXY(e[0]), toXY(e[0])] : e.map(toXY), r: (e.length === 1 ? [e[0], e[0]] : e).map(i => D[i] / res), touches, n: e.length }; });
    for (const s of strokes) s.L = polyLen(s.pts);
    // prune spurs: short chains that hang off another stroke; isolated short chains are dots and stay
    const rAll = Math.max(...strokes.map(s => Math.max(...s.r)));
    strokes = strokes.filter(s => !(s.touches && s.L < Math.max(...s.r) * 1.5 + 1 / res && strokes.length > 1));
    for (const s of strokes) { const p = s.pts; if (p.length > 4) { s.pts = p.map((v, k) => k < 2 || k > p.length - 3 ? v : [(p[k - 2][0] + p[k - 1][0] + v[0] + p[k + 1][0] + p[k + 2][0]) / 5, (p[k - 2][1] + p[k - 1][1] + v[1] + p[k + 1][1] + p[k + 2][1]) / 5]); } s.L = polyLen(s.pts); s.dot = !s.touches && s.L < rAll * 2; }
    return strokes;
  }

  /* ---------------- layout ---------------- */
  function measure(F, text, size) {
    if (F.type === 'outline') return F.ot.getAdvanceWidth(text, size, { kerning: true });
    const s = size / F.upm; let w = 0; for (const ch of text) w += ((F.data.glyphs[ch] || F.data.glyphs[' '] || [F.upm * .4])[0]) * s; return w;
  }
  function glyphsFor(F, text, ox, oy, size, track) {
    const out = [];
    if (F.type === 'outline') {
      let i = 0, extra = 0; const chars = [...text];
      F.ot.forEachGlyph(text, ox, oy, size, { kerning: true }, (g, gx) => {
        const ch = chars[i++] || ''; gx += extra; extra += track * size;
        if (ch === ' ' || !g.path || !g.path.commands.length) return;
        const polys = flattenCmds(g.getPath(gx, oy, size).commands, Math.max(.25, size / 260));
        if (!polys.length) return;
        out.push({ ch, x: gx, y: oy, size, adv: g.advanceWidth * size / F.upm, polys, closed: true, bb: bbox(polys) });
      });
    } else {
      const s = size / F.upm; let x = ox;
      for (const ch of text) {
        const g = F.data.glyphs[ch] || F.data.glyphs[' '];
        if (g && g[1]) {
          let polys = parseSvgPath(g[1], 6).map(p => p.map(([gx, gy]) => [x + gx * s, oy - gy * s])).filter(p => polyLen(p) > .5);
          if (F.key === 'ems-allure' || F.key === 'ems-nixish' || F.key === 'ems-osmotron') polys = polys.map(p => smoothPoly(p, F.key === 'ems-osmotron' ? 1 : 4));
          if (polys.length) out.push({ ch, x, y: oy, size, adv: g[0] * s, polys, closed: false, bb: bbox(polys) });
        }
        x += (g ? g[0] : F.upm * .4) * s + track * size;
      }
    }
    return out;
  }
  /* opts: font, text, size (max px), minSize (wrap below this), lineHeight, align, pad, track, maxLines */
  function layout(el, opts) {
    const F = font(opts.font), size0 = opts.size || 96, pad = opts.pad != null ? opts.pad : .22, track = opts.track || 0;
    const W = Math.max(60, el.clientWidth), avail = W * (opts.fill || .94);
    const words = String(opts.text).split(' ');
    const fit = lines => { let m = 0; for (const l of lines) m = Math.max(m, measure(F, l, 100) + track * 100 * [...l].length); return Math.min(size0, avail * 100 / m); };
    let lines = opts._lines || [String(opts.text)], size = fit(lines);
    if (!opts._lines && size < (opts.minSize || size0 * .62) && words.length > 1) { const two = [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]; const s2 = fit(two); if (s2 > size * 1.15) { lines = two; size = s2; } }
    const asc = F.ascent / F.upm * size, desc = -F.descent / F.upm * size, lh = (opts.lineHeight || 1.08) * size, padPx = pad * size;
    const H = Math.ceil(padPx * 2 + asc + desc + lh * (lines.length - 1));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let cv = el.querySelector(':scope > canvas.lc-canvas');
    if (!cv) { cv = document.createElement('canvas'); cv.className = 'lc-canvas'; cv.setAttribute('aria-hidden', 'true'); cv.style.display = 'block'; cv.style.width = '100%'; el.appendChild(cv); }
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + 'px';
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', opts.text);
    el.setAttribute('role', el.getAttribute('role') || 'img');
    const glyphs = [];
    lines.forEach((ln, li) => {
      const w = measure(F, ln, size) + track * size * ([...ln].length - 1);
      const ox = opts.align === 'left' ? W * (1 - (opts.fill || .94)) / 2 : (W - w) / 2;
      const oy = padPx + asc + li * lh;
      for (const g of glyphsFor(F, ln, ox, oy, size, track)) { g.line = li; g.i = glyphs.length; glyphs.push(g); }
    });
    // fit and centre by the real ink bounds (script swashes overhang their advance widths)
    let ib = bbox(glyphs.flatMap(g => g.polys)); const maxW = W * (opts.fill || .94);
    if (ib.w > maxW * 1.01 && !opts._refit) return layout(el, Object.assign({}, opts, { size: size * maxW / ib.w * .99, _lines: lines, _refit: 1 }));
    const dx = opts.align === 'left' ? Math.max(0, 4 - ib.x0) : (W - ib.w) / 2 - ib.x0;
    if (Math.abs(dx) > .1) for (const g of glyphs) { for (const p of g.polys) for (const q of p) q[0] += dx; g.x += dx; g.bb.x0 += dx; g.bb.x1 += dx; }
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { el, canvas: cv, ctx, dpr, W, H, size, lines, font: F, glyphs, all: glyphs.flatMap(g => g.polys), bb: bbox(glyphs.flatMap(g => g.polys)) };
  }

  /* ---------------- offscreen helpers ---------------- */
  function offscreen(L) { const c = document.createElement('canvas'); c.width = L.canvas.width; c.height = L.canvas.height; const x = c.getContext('2d'); x.setTransform(L.dpr, 0, 0, L.dpr, 0, 0); return { c, x }; }
  const texCache = {};
  /* image texture with a procedural fallback (fn(ctx, size)) if the file is missing; never read back (file:// taints) */
  function texture(url, fallback, size = 256) {
    if (texCache[url]) return texCache[url];
    const fb = document.createElement('canvas'); fb.width = fb.height = size; fallback && fallback(fb.getContext('2d'), size);
    const t = { img: fb, ready: false };
    if (url) { const im = new Image(); im.onload = () => { t.img = im; t.ready = true; dispatchEvent(new Event('lettercore:texture')); }; im.src = url; }
    return (texCache[url] = t);
  }
  /* script-relative base, so effects find ./tex/ from any page */
  const BASE = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');

  /* ---------------- runner ---------------- */
  const all = new Set();
  const state = { loop: false };
  /* effect: { duration, hold?, build(L, opts) -> data, draw(L, data, t = 0..1 progress, time = s since start, final) } */
  function run(el, opts, effect) {
    let L, data, raf = 0, start = 0, visible = true, alive = true, lastW = -1, seen = false;
    const duration = (opts.duration || effect.duration || 3) * 1000, hold = (opts.hold != null ? opts.hold : effect.hold || 2.4) * 1000, delay = (opts.delay || 0) * 1000;
    const idle = opts.idle != null ? opts.idle : effect.idle !== false;
    const ctl = { el, opts, loop: opts.loop != null ? opts.loop : null };
    function build() { L = layout(el, opts); data = effect.build(L, opts) || {}; if (!data.opts) data.opts = opts; lastW = el.clientWidth; }
    function frame(now) {
      raf = 0; if (!alive) return;
      const el2 = now - start - delay, t = Math.max(0, el2) / duration;
      const loop = ctl.loop != null ? ctl.loop : state.loop;
      if (loop && el2 > duration + hold) { start = now; return tick(); }
      L.ctx.clearRect(0, 0, L.W, L.H);
      effect.draw(L, data, Math.min(1, t), Math.max(0, el2) / 1000, false);
      if (t < 1 || idle || loop) tick();
    }
    function tick() { if (reduce) return; if (!raf && visible && alive) raf = requestAnimationFrame(frame); }
    function drawFinal() { L.ctx.clearRect(0, 0, L.W, L.H); effect.draw(L, data, 1, (duration / 1000) + 1, true); }
    ctl.replay = () => { if (!L) build(); if (reduce) return drawFinal(); start = performance.now(); seen = true; cancelAnimationFrame(raf); raf = 0; tick(); };
    ctl.setLoop = v => { ctl.loop = v; tick(); };
    ctl.destroy = () => { alive = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); all.delete(ctl); };
    ctl.rebuild = () => { build(); reduce ? drawFinal() : tick(); };
    const io = new IntersectionObserver(es => { for (const e of es) { visible = e.isIntersecting; if (visible) { if (!seen && !reduce) ctl.replay(); else tick(); } } }, { rootMargin: '80px' });
    let rt = 0;
    const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - lastW) < 2) return; clearTimeout(rt); rt = setTimeout(() => { build(); reduce ? drawFinal() : tick(); }, 120); });
    build();
    if (reduce) drawFinal(); else start = performance.now();
    if (reduce) addEventListener('lettercore:texture', () => alive && drawFinal());
    io.observe(el); ro.observe(el); all.add(ctl);
    return ctl;
  }

  window.LetterCore = {
    reduce, clamp01, ease, rng, n1, n2, font, layout, measure, resample, smoothPoly, along, bbox, toPath2D, simplify, polyLen, parseSvgPath, flattenCmds,
    offscreen, texture, BASE, run, skeleton,
    setLoop(v) { state.loop = !!v; for (const c of all) c.setLoop(c.loop); },
    get loop() { return state.loop; },
  };
  window.LetterFX = window.LetterFX || {};
})();
