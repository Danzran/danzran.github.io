/* Fluffy cloud card containers (v10 Magic hour). Off by default; ?clouds=1 or the on-page switch turns them on
   (the switch is remembered in localStorage; ?clouds=0 forces off).
   Each .card gets an SVG cumulus laid around its own box: big rounded towers on top, smaller puffs down the sides and
   a flatter base, re-laid when the card resizes (seeded, so it is stable). Every cloud is lit by the sky colour at its
   place on the page: warm gold-peach near the top (golden hour), rose and lavender in the middle, cool moonlit blue at
   the bottom (night). No filters are animated; the SVG is static once built. */
(() => {
const NS = 'http://www.w3.org/2000/svg', root = document.documentElement, sw = document.getElementById('cloudswitch');
const KEYS = [
  [0,   { hi: '#fff7e8', mid: '#ffe3c6', lo: '#eaa9a6', rim: '#ffd9a0' }],
  [.35, { hi: '#fff2f2', mid: '#f8d6e2', lo: '#c99ad2', rim: '#f6b6c9' }],
  [.65, { hi: '#f3eefc', mid: '#ddd6f5', lo: '#9e97d8', rim: '#cbb9f5' }],
  [1,   { hi: '#edf1fc', mid: '#cdd5f2', lo: '#8190cc', rim: '#bccbff' }],
];
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, k) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
function tint(q) {
  for (let i = 1; i < KEYS.length; i++) if (q <= KEYS[i][0]) { const [a, A] = KEYS[i - 1], [b, B] = KEYS[i], k = (q - a) / (b - a); return Object.fromEntries(Object.keys(A).map(n => [n, mix(A[n], B[n], k)])); }
  return KEYS[KEYS.length - 1][1];
}
const rng = s => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const cards = [...document.querySelectorAll('.card')];

function build(card, idx) {
  const w = card.offsetWidth, h = card.offsetHeight; if (!w || !h) return;
  const vw = document.documentElement.clientWidth;
  if (card._cw === w && card._ch === h && card._vw === vw && card._svg) return;
  card._cw = w; card._ch = h; card._vw = vw;
  // keep the side puffs inside the screen (on a phone the card sits ~30px from the edge): cap the puff size by the room left
  const rect = card.getBoundingClientRect(), side = Math.max(0, Math.min(rect.left, document.documentElement.clientWidth - rect.right));
  const r0 = Math.max(10, Math.min(44, Math.min(w, h) * .11, side * .95)), pad = r0 * 2.2, W = w + pad * 2, H = h + pad * 2;
  const R = rng(idx * 7919 + 13), docH = document.documentElement.scrollHeight;
  const q = Math.min(1, Math.max(0, (card.getBoundingClientRect().top + scrollY + h / 2) / docH));
  const c = tint(q), id = 'cc' + idx;
  const puffs = [];   // [x, y, r, lit]
  // top edge: a row of puffs plus 2-3 towers
  for (let x = pad + r0 * .4; x < pad + w - r0 * .4; x += r0 * (1 + R() * .5)) puffs.push([x, pad + r0 * .25 - R() * r0 * .3, r0 * (.8 + R() * .5), 1]);
  const towers = w > 360 ? 3 : 2;
  for (let i = 0; i < towers; i++) { const x = pad + w * (.15 + .7 * (i + R() * .6) / towers); puffs.push([x, pad - r0 * (.1 + R() * .35), r0 * (1.4 + R() * .6), 1]); }
  // sides
  for (let y = pad + r0; y < pad + h - r0 * .6; y += r0 * (.9 + R() * .4)) { puffs.push([pad + r0 * .1 - R() * r0 * .2, y, r0 * (.62 + R() * .3), .5]); puffs.push([pad + w - r0 * .1 + R() * r0 * .2, y, r0 * (.62 + R() * .3), .5]); }
  // flatter base
  for (let x = pad + r0 * .3; x < pad + w - r0 * .3; x += r0 * (.9 + R() * .4)) puffs.push([x, pad + h - r0 * .05, r0 * (.5 + R() * .25), 0]);
  const circ = (p, dx = 0, dy = 0, k = 1) => `<circle cx="${(p[0] + dx).toFixed(1)}" cy="${(p[1] + dy).toFixed(1)}" r="${(p[2] * k).toFixed(1)}"/>`;
  const body = `<rect x="${pad}" y="${pad}" width="${w}" height="${h}" rx="${r0}"/>`;
  const svg = card._svg || document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'puffs'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.cssText = `left:${-pad}px;top:${-pad}px;width:${W}px;height:${H}px;--rim:${c.rim}`;
  svg.innerHTML = `<defs>
      <linearGradient id="${id}f" gradientUnits="userSpaceOnUse" x1="0" y1="${pad * .4}" x2="0" y2="${pad + h + r0}"><stop offset="0" stop-color="${c.hi}"/><stop offset=".5" stop-color="${c.mid}"/><stop offset="1" stop-color="${c.lo}"/></linearGradient>
      <radialGradient id="${id}l" cx=".38" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="${c.hi}" stop-opacity=".35"/><stop offset="1" stop-color="${c.hi}" stop-opacity="0"/></radialGradient>
    </defs>
    <g fill="${c.lo}" opacity=".55">${puffs.map(p => circ(p, 0, p[2] * .22)).join('')}${body.replace('<rect', `<rect transform="translate(0 ${r0 * .25})"`)}</g>
    <g fill="url(#${id}f)">${puffs.map(p => circ(p)).join('')}${body}</g>
    <g fill="url(#${id}l)">${puffs.filter(p => p[3] === 1).map(p => circ(p, -p[2] * .18, -p[2] * .2, .78)).join('')}</g>`;
  if (!card._svg) { card.prepend(svg); card._svg = svg; }
}
let ro = null;
function on() { cards.forEach(build); if (!ro && window.ResizeObserver) { ro = new ResizeObserver(es => es.forEach(e => build(e.target, cards.indexOf(e.target)))); cards.forEach(c => ro.observe(c)); } }
function set(v, remember) {
  root.classList.toggle('clouds', v); sw.setAttribute('aria-pressed', v);
  if (remember) try { localStorage.setItem('mh-clouds', v ? '1' : '0'); } catch (e) {}
  if (v) requestAnimationFrame(on);
  if (window.ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
  dispatchEvent(new Event('resize'));
}
sw.addEventListener('click', () => set(!root.classList.contains('clouds'), true));
set(root.classList.contains('clouds'), false);
addEventListener('load', () => { if (root.classList.contains('clouds')) { cards.forEach(c => { c._cw = 0; }); on(); } });
})();
