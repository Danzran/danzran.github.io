/* Star-catcher (round 2).
   The stars painted into plate-night.webp (positions found by a local-maximum pass over the
   plate, listed below in plate px) twinkle brighter and grow small cross flares when the
   pointer comes near them; far ones stay as painted. A click sends one short gold shooting
   star sliding down-left from the click point (~0.9 s), then it is gone. Nothing follows the
   pointer and nothing is drawn at it. The layer sits under the content (z-index 1).
   Plate mapping: same `fit` as moonlight. Lab: cover at 50% 30%. v9 #sky canvas:
     CURSORS.starcatch.fit = { posY: .5, zoom: 1.06, scrollK: .35 }
   Touch: off. Reduced motion: stars brighten without twinkling; no shooting stars. */
(window.CURSORS = window.CURSORS || {}).starcatch = (() => {
  const PW = 1920, PH = 1081, R = 210;
  // x, y, strength (4..8) of painted stars in the dark sky
  const RAW = '594,122,8,466,86,8,1160,94,8,1011,67,8,836,323,8,1207,144,8,969,29,7,276,371,7,74,36,7,1101,355,7,825,18,7,1128,59,7,1689,41,7,618,156,7,547,447,7,491,417,7,1443,215,7,1363,372,7,1030,296,7,1211,416,7,727,280,7,1629,16,7,1565,71,7,1254,214,7,1210,202,7,188,232,7,1470,132,7,1207,316,7,1509,117,7,203,285,7,1727,18,6,1676,70,6,634,236,6,1476,244,6,1424,180,6,349,415,6,1478,427,6,358,330,6,1764,17,6,310,55,6,1768,115,6,1827,247,6,1475,213,6,236,617,6,1722,59,6,1212,597,6,433,447,6,1172,197,6,1180,339,6,281,272,6,1514,410,6,1231,565,6,195,593,6,1268,249,6,1470,316,6,1397,483,6,1693,98,6,1203,68,6,1547,99,6,176,171,6,1461,90,6,1332,383,6,914,483,6,1375,129,5,1420,441,5,1069,137,5,238,347,5,1472,169,5,255,288,5,1416,315,5,261,403,5,1232,438,5,1525,65,5,1295,115,5,1438,146,5,1084,204,5,1380,444,5,1095,59,5,1314,247,5,1238,26,5,1226,172,5,1392,185,5,1284,276,5,1256,407,5,326,313,5,1344,228,5,1597,73,5,133,300,5,523,77,5,1385,307,5,1130,178,5,1069,511,5,727,576,5,96,120,5,586,208,5,349,266,5,1190,241,5,352,556,5,1401,267,5,1754,156,4,1896,186,4,687,266,4,313,402,4,1289,559,4,66,108,4,800,48,4,1149,314,4,1800,24,4,1336,313,4,701,355,4';
  const STARS = []; { const v = RAW.split(',').map(Number); for (let i = 0; i < v.length; i += 3) STARS.push({ x: v[i], y: v[i + 1], k: v[i + 2] / 8, ph: (i * 1.37) % 6.28, g: 0 }); }
  const api = { fit: { posY: 0.3, zoom: 1, scrollK: 0 } };
  let cv, ctx, raf = 0, on = false, dpr = 1, prev = 0, t = 0, shots = [];
  const p = { x: -999, y: -999, vis: 0 };
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function view(px, py) {
    const f = api.fit, W = innerWidth, H = innerHeight, s = Math.max(W / PW, H / PH) * (f.zoom || 1);
    return [(W - PW * s) / 2 + px * s, (H - PH * s) * (f.posY ?? 0.5) - scrollY * (f.scrollK || 0) + py * s];
  }
  function size() { dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  const move = ev => { if (ev.pointerType === 'touch') return; p.x = ev.clientX; p.y = ev.clientY; p.vis = 1; };
  const leave = ev => { if (!ev.relatedTarget) p.vis = 0; };
  const down = ev => {
    if (ev.pointerType === 'touch' || ev.button !== 0 || reduce()) return;
    if (shots.length > 2) shots.shift();
    const a = Math.PI * (0.80 + Math.random() * 0.08);      // down-left, a little varied
    shots.push({ x: ev.clientX, y: ev.clientY, a, t: 0, life: 0.9, dist: 230 + Math.random() * 60 });
  };

  function flare(x, y, len, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, len * 0.9);
    g.addColorStop(0, `rgba(255,246,222,${(a * 0.9).toFixed(3)})`); g.addColorStop(0.3, `rgba(255,217,138,${(a * 0.35).toFixed(3)})`); g.addColorStop(1, 'rgba(255,217,138,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, len * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(255,246,222,${(a * 0.7).toFixed(3)})`; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x - len, y); ctx.lineTo(x + len, y); ctx.moveTo(x, y - len); ctx.lineTo(x, y + len); ctx.stroke();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const rm = reduce(), dt = Math.min(0.05, (now - (prev || now)) / 1000); prev = now; t += rm ? 0 : dt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const s of STARS) {
      const [x, y] = view(s.x, s.y), d = Math.hypot(x - p.x, y - p.y);
      const goal = p.vis && d < R ? Math.pow(1 - d / R, 1.5) : 0;
      s.g += (goal - s.g) * (rm ? 1 : 0.07);                  // each star wakes and settles smoothly
      if (s.g < 0.02) continue;
      const tw = rm ? 1 : 0.6 + 0.4 * Math.sin(t * (2.2 + s.k) + s.ph);
      flare(x, y, (4 + 9 * s.g * tw) * (0.6 + s.k * 0.5), s.g * (0.5 + 0.5 * tw) * s.k);
    }
    shots = shots.filter(sh => (sh.t += dt) < sh.life);
    for (const sh of shots) {
      const u = sh.t / sh.life, e = 1 - Math.pow(1 - u, 2), hx = sh.x + Math.cos(sh.a) * sh.dist * e, hy = sh.y + Math.sin(sh.a) * sh.dist * e;
      const tail = 90 * Math.sin(Math.PI * Math.min(1, u * 1.2)), tx = hx - Math.cos(sh.a) * tail, ty = hy - Math.sin(sh.a) * tail;
      const a = Math.sin(Math.PI * u);
      const g = ctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, 'rgba(255,217,138,0)'); g.addColorStop(1, `rgba(255,236,190,${(a * 0.9).toFixed(3)})`);
      ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      flare(hx, hy, 6, a);
    }
  }

  return Object.assign(api, {
    label: 'star-catcher', note: 'the painted stars near the pointer wake up and twinkle; a click sends one short gold shooting star',
    mount() {
      if (on || matchMedia('(pointer: coarse)').matches) return; on = true;
      cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';
      document.body.appendChild(cv); ctx = cv.getContext('2d'); size();
      addEventListener('resize', size); addEventListener('pointermove', move, { passive: true }); addEventListener('pointerdown', down, { passive: true }); document.addEventListener('pointerout', leave);
      raf = requestAnimationFrame(frame);
    },
    unmount() {
      if (!on) return; on = false; cancelAnimationFrame(raf); prev = 0; shots = []; STARS.forEach(s => { s.g = 0; });
      removeEventListener('resize', size); removeEventListener('pointermove', move); removeEventListener('pointerdown', down); document.removeEventListener('pointerout', leave);
      cv.remove();
    }
  });
})();
