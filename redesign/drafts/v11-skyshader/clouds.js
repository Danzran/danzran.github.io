/* v10 Starfall: moonlit cumulus card containers (off by default; ?clouds=1 or the on-page switch turns them on).
   Each card gets a canvas behind it, a little larger than the card, painted as a cloud that glows from within:
   billows along the edges (big on top, flatter underneath), a deep moonlit blue body, a warm lantern glow in the
   middle, Codex cloud textures laid into the billows, and a bright rim where the moonlight catches the tops.
   Redrawn only when a card's size changes. */
(() => {
const root = document.documentElement, btn = document.getElementById('cloudToggle');
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const TEX = { row: 'assets/sf/cloud-row.webp', bank: 'assets/sf/cloud-bank.webp', puff: 'assets/sf/cloud-puff.webp' };
const img = {}; let loaded = 0;
const srand = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const cards = [...document.querySelectorAll('.card')];
const items = [];

// phones: thinner billows and haze, sized to the 26px side margin skyshader.css gives cloud cards, so the screen edge never clips them
const phone = () => innerWidth <= 820;
function pad(w, h) { return phone() ? 14 : Math.round(Math.max(24, Math.min(40, Math.min(w, h) * .1))); }
let G = 46;   // extra canvas margin so the outer haze is never clipped into a rectangle
function paint(it) {
  const card = it.card, w = card.offsetWidth, h = card.offsetHeight; if (!w || !h) return;
  if (it.w === w && it.h === h && it.done === loaded) return;
  G = phone() ? 10 : 46;
  const P = pad(w, h), M = P + G, CW = w + M * 2, CH = h + M * 2, c = it.canvas;
  it.w = w; it.h = h; it.done = loaded;
  c.width = Math.round(CW * DPR); c.height = Math.round(CH * DPR);
  c.style.left = c.style.top = -M + 'px'; c.style.width = CW + 'px'; c.style.height = CH + 'px';
  const g = c.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, CW, CH);
  const rnd = srand(it.seed), X0 = G, Y0 = G, BW = w + P * 2, BH = h + P * 2;   // cloud box (card + pad), in canvas px
  // 1. silhouette: a soft rounded body + billows (towering on top, rounded on the sides, flat-ish underneath)
  const puffs = [], add = (x, y, r, edge) => puffs.push({ x, y, r, edge });
  const walk = (len, lo, hi, f) => { let u = 0; while (u < len) { const r = lo + rnd() * (hi - lo); f(u + r * .5, r); u += r * (1.15 + rnd() * .5); } };
  walk(BW - P, P * .8, P * 1.55, (u, r) => { const m = Math.sin(Math.PI * clamp01(u / (BW - P))); r *= .65 + .5 * m * (.6 + rnd() * .6); add(X0 + P * .5 + u, Y0 + P + r * .2, r, 'top'); });
  const side = (x0, dir, y0) => walk(BH - P * 2.6, P * 1.1, P * 1.9, (u, r) => { r = Math.min(r, (Y0 + BH - P * .5 - (y0 + u)) / .9); if (r > P * .5) add(x0 + dir * r * .62, y0 + u, r, 'side'); });
  side(X0 + P * .35, 1, Y0 + P * 1.5); side(X0 + BW - P * .35, -1, Y0 + P * 1.8);
  walk(BW - P * 1.4, P * .6, P * .95, (u, r) => add(X0 + P * .7 + u, Y0 + BH - P * .95 - r * .1, r, 'bottom'));
  const shape = new Path2D(); shape.roundRect(X0 + P * .45, Y0 + P * .55, BW - P * .9, BH - P * 1.1, P);
  puffs.forEach(p => { shape.moveTo(p.x + p.r, p.y); shape.arc(p.x, p.y, p.r, 0, Math.PI * 2); });
  // outer moonlit haze
  g.save(); g.filter = `blur(${Math.round(G * .5)}px)`; g.fillStyle = 'rgba(140,168,255,.3)'; g.fill(shape); g.restore();
  // 2. body: moonlit blue, lighter at the tops, violet in the shadows
  const off = document.createElement('canvas'); off.width = c.width; off.height = c.height; const o = off.getContext('2d'); o.setTransform(DPR, 0, 0, DPR, 0, 0);
  const body = o.createLinearGradient(0, Y0, 0, Y0 + BH);
  body.addColorStop(0, 'rgb(128,150,226)'); body.addColorStop(Math.min(.3, P * 2.2 / BH), 'rgb(62,86,168)'); body.addColorStop(.75, 'rgb(40,56,130)'); body.addColorStop(1, 'rgb(54,50,132)');
  o.fillStyle = body; o.fill(shape);
  o.globalCompositeOperation = 'source-atop';
  // 3. volume: each billow softly lit from above, shadowed below
  puffs.forEach(p => {
    const k = p.edge === 'top' ? 1 : p.edge === 'side' ? .22 : .2;
    let gr = o.createRadialGradient(p.x - p.r * .1, p.y - p.r * .55, 0, p.x, p.y - p.r * .2, p.r * 1.1);
    gr.addColorStop(0, `rgba(240,242,255,${.5 * k})`); gr.addColorStop(.5, `rgba(176,194,250,${.22 * k})`); gr.addColorStop(1, 'rgba(120,140,220,0)');
    o.fillStyle = gr; o.fillRect(p.x - p.r * 1.3, p.y - p.r * 1.3, p.r * 2.6, p.r * 2.6);
    gr = o.createRadialGradient(p.x, p.y + p.r * .6, 0, p.x, p.y + p.r * .6, p.r * .9);
    gr.addColorStop(0, 'rgba(70,60,150,.28)'); gr.addColorStop(1, 'rgba(70,60,150,0)');
    o.fillStyle = gr; o.fillRect(p.x - p.r, p.y - p.r * .3, p.r * 2, p.r * 2);
  });
  // inner lantern glow
  const gl = o.createRadialGradient(X0 + BW * .5, Y0 + BH * .3, 0, X0 + BW * .5, Y0 + BH * .42, Math.max(BW, BH) * .6);
  gl.addColorStop(0, 'rgba(255,226,170,.26)'); gl.addColorStop(.55, 'rgba(255,214,150,.08)'); gl.addColorStop(1, 'rgba(255,214,150,0)');
  o.fillStyle = gl; o.fillRect(0, 0, CW, CH);
  // calm reading area
  const veil = o.createRadialGradient(CW / 2, CH * .55, Math.min(w, h) * .15, CW / 2, CH * .55, Math.max(w, h) * .7);
  veil.addColorStop(0, 'rgba(20,32,82,.42)'); veil.addColorStop(1, 'rgba(20,32,82,0)'); o.fillStyle = veil; o.fillRect(0, 0, CW, CH);
  // 4. rim light on the upward faces
  const rim = document.createElement('canvas'); rim.width = c.width; rim.height = c.height; const r = rim.getContext('2d'); r.setTransform(DPR, 0, 0, DPR, 0, 0);
  r.fillStyle = 'rgb(255,240,214)'; r.fill(shape); r.globalCompositeOperation = 'destination-out'; r.translate(-1, 3.5); r.fill(shape);
  o.globalCompositeOperation = 'source-over'; o.setTransform(1, 0, 0, 1, 0, 0);
  o.globalAlpha = .7; o.filter = 'blur(1.3px)'; o.drawImage(rim, 0, 0); o.filter = 'none'; o.globalAlpha = 1;
  o.setTransform(DPR, 0, 0, DPR, 0, 0);
  // 5. painted cumulus from Codex (they glow from within): a billow crest along the top, a tower on one corner
  if (img.row) {
    const th = Math.min(P * 2.8, BW * .35), sw = img.row.width, sh = img.row.height * .7;
    const cw = BW + P * .2, t = document.createElement('canvas'); t.width = Math.ceil(cw * DPR); t.height = Math.ceil(th * DPR); const tg = t.getContext('2d');
    tg.drawImage(img.row, 0, sh * .12, sw, sh * .88, 0, 0, t.width, t.height); tg.globalCompositeOperation = 'destination-in';
    const fade = tg.createLinearGradient(0, 0, t.width, 0), e = Math.min(.18, P * 2.5 / cw);
    fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(e, '#000'); fade.addColorStop(1 - e, '#000'); fade.addColorStop(1, 'rgba(0,0,0,0)');
    tg.fillStyle = fade; tg.fillRect(0, 0, t.width, t.height);
    o.globalAlpha = .92; o.drawImage(t, X0 - P * .1, Y0 - th * .3, cw, th); o.globalAlpha = 1;
  }
  if (img.puff && Math.min(w, h) > 140 && innerWidth > 820) {   // phones: no tower, it would cover the text above the card
    const left = rnd() < .5, sz = Math.min(P * 4.4, w * .4, (G + P * 1.2 - 4) / .9), px = left ? X0 - sz * .2 : X0 + BW - sz * .8, py = Y0 + P * 1.2 - sz * .9;
    const t = document.createElement('canvas'); t.width = Math.ceil(sz * DPR); t.height = Math.ceil(sz * DPR); const tg = t.getContext('2d');
    tg.drawImage(img.puff, 0, 0, t.width, t.height); tg.globalCompositeOperation = 'destination-in';
    const fade = tg.createLinearGradient(0, 0, 0, t.height); fade.addColorStop(0, '#000'); fade.addColorStop(.68, '#000'); fade.addColorStop(.92, 'rgba(0,0,0,0)');
    tg.fillStyle = fade; tg.fillRect(0, 0, t.width, t.height);
    o.drawImage(t, px, py, sz, sz);
  }
  if (img.bank && w > 300) {   // painterly texture in the lower body, kept inside the silhouette
    o.save(); o.clip(shape); const bw = Math.min(BW * .7, 560), bh = bw * img.bank.height / img.bank.width, left = rnd() < .5;
    o.globalAlpha = .14; o.drawImage(img.bank, left ? X0 : X0 + BW - bw, Y0 + BH - bh * .5, bw, bh); o.restore(); o.globalAlpha = 1;
  }
  g.drawImage(off, 0, 0, CW, CH);
  // 6. glints on the brightest crests
  puffs.filter(p => p.edge === 'top').forEach((p, i) => { if (i % 3) return; const x = p.x + (rnd() - .5) * p.r, y = p.y - p.r * .95, s = 3 + rnd() * 4;
    g.fillStyle = 'rgba(255,246,224,.9)'; g.beginPath(); g.moveTo(x, y - s); g.quadraticCurveTo(x, y, x + s, y); g.quadraticCurveTo(x, y, x, y + s); g.quadraticCurveTo(x, y, x - s, y); g.quadraticCurveTo(x, y, x, y - s); g.fill(); });
}
const clamp01 = x => Math.max(0, Math.min(1, x));

function ensure() {
  if (items.length) return;
  cards.forEach((card, i) => {
    const canvas = document.createElement('canvas'); canvas.className = 'cloudbody'; canvas.setAttribute('aria-hidden', 'true');
    card.prepend(canvas); items.push({ card, canvas, seed: 4111 + i * 7919, w: 0, h: 0 });
  });
  const ro = new ResizeObserver(() => { if (root.classList.contains('clouds')) items.forEach(paint); });
  cards.forEach(c => ro.observe(c));
  Object.entries(TEX).forEach(([k, src]) => { const im = new Image(); im.onload = () => { img[k] = im; loaded++; if (root.classList.contains('clouds')) items.forEach(paint); }; im.src = src; });
}
function set(on) {
  root.classList.toggle('clouds', on);
  btn.setAttribute('aria-pressed', on);
  try { sessionStorage.setItem('sf-clouds', on ? '1' : '0'); } catch (e) {}
  if (on) { ensure(); requestAnimationFrame(() => items.forEach(paint)); }
  window.SF && SF.layout && SF.layout();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}
btn.addEventListener('click', () => {
  const on = !root.classList.contains('clouds'); set(on);
  const u = new URL(location.href); u.searchParams.set('clouds', on ? '1' : '0'); history.replaceState(null, '', u);
});
set(root.classList.contains('clouds'));
})();
