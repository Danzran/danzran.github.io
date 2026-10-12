/* Shared runtime for the Experience timeline labs:
   jobs data, night sky canvas (navy gradient, stars, moon, painted plate under the hero),
   static brush lettering, Lenis + ScrollTrigger. Each concept page adds its own section script. */
window.TL = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(devicePixelRatio || 1, 1.5);
  const ROOT = '../../';   // the v9-night folder

  // the only facts: four jobs, overlapping
  const JOBS = [
    { id: 'edit', title: 'Video editor', years: '2014–2020', from: 2014, to: 2020.99, desc: 'COD edits, compositing, camera tracking, led a team of 4 editors.', video: true },
    { id: 'it', title: 'Systems assembler & IT', years: '2018–now', from: 2018, to: 2026.8, now: true, desc: 'Builds, networks, virtual machines.' },
    { id: 'lock', title: 'Lockout technician', years: '2022–23', from: 2022, to: 2023.99, desc: 'Push-to-start keys and programming.' },
    { id: 'ext', title: 'Backend developer · Extropian', years: '2024–25', from: 2024, to: 2025.99, desc: 'Golf app: Bluetooth sensors, swing metrics, Firebase.' },
  ];
  const Y0 = 2014, Y1 = 2027;   // axis: Jan 2014 .. end of 2026
  const VIDEO = '../../../../assets/video/edit.mp4', POSTER = '../../../../assets/video/edit-poster.jpg';
  const videoTag = (extra = '') => `<video src="${VIDEO}" poster="${POSTER}" autoplay muted loop playsinline aria-label="Video editing reel" ${extra}></video>`;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const lerp = (a, b, k) => a + (b - a) * k;

  /* ---------- sky ---------- */
  const opts = { moon: true, moonX: .8, moonY: .17, plate: true, starsDrift: .05 };
  const sky = document.getElementById('sky'), sx = sky.getContext('2d');
  let W = 0, H = 0;
  const stars = Array.from({ length: 170 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .3, tw: Math.random() * 6 }));
  const plate = new Image(); plate.src = ROOT + 'assets/plate-night.webp';
  function resize() { W = innerWidth; H = innerHeight; sky.width = W * DPR; sky.height = H * DPR; sx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  function drawSky(t) {
    const scroll = scrollY;
    const g = sx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#081234'); g.addColorStop(.6, '#142c6c'); g.addColorStop(1, '#22428c');
    sx.fillStyle = g; sx.fillRect(0, 0, W, H);
    sx.fillStyle = '#fff6dc';
    for (const s of stars) {
      sx.globalAlpha = .4 + .45 * Math.sin(t * 1.6 + s.tw);
      const y = ((s.y * H - scroll * opts.starsDrift) % H + H) % H;
      sx.beginPath(); sx.arc(s.x * W, y, s.r, 0, 7); sx.fill();
    }
    sx.globalAlpha = 1;
    if (opts.moon) {
      const mx = W * opts.moonX, my = H * opts.moonY, mg = sx.createRadialGradient(mx, my, 0, mx, my, H * .35);
      mg.addColorStop(0, 'rgba(255,244,214,1)'); mg.addColorStop(.09, 'rgba(255,240,200,.95)'); mg.addColorStop(.1, 'rgba(255,226,160,.3)'); mg.addColorStop(1, 'rgba(255,226,160,0)');
      sx.fillStyle = mg; sx.fillRect(0, 0, W, H);
    }
    const a = opts.plate ? clamp(1 - scroll / (H * 1.05)) : 0;
    if (a > 0 && plate.complete && plate.naturalWidth) {
      const s = Math.max(W / plate.naturalWidth, H / plate.naturalHeight) * 1.06, w = plate.naturalWidth * s, h = plate.naturalHeight * s;
      sx.globalAlpha = a; sx.drawImage(plate, (W - w) / 2, (H - h) / 2 - scroll * .35, w, h); sx.globalAlpha = 1;
    }
  }
  resize(); addEventListener('resize', resize);
  const loops = [];
  const t0 = performance.now();
  (function frame(now) {
    requestAnimationFrame(frame);
    const t = reduce ? 0 : (now - t0) / 1000;
    drawSky(t);
    for (const f of loops) f(t, now);
  })(t0);

  /* ---------- lettering: rendered once, no stepped boil ---------- */
  function letter() { if (window.Lettering && window.opentype) document.querySelectorAll('[data-brush]').forEach((el, i) => Lettering.render(el, { seed: 9 + i * 29 })); }
  letter();

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (!reduce) {
      lenis = new Lenis({ lerp: .085 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tk => lenis.raf(tk * 1000)); gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 }); }));
      gsap.utils.toArray('.sec-head h2 .lt-letter').length && gsap.from('.sec-head h2 .lt-letter', { y: 40, opacity: 0, filter: 'blur(6px)', duration: 1.1, ease: 'power3.out', stagger: .05, scrollTrigger: { trigger: '.sec-head', start: 'top 80%' } });
    }
  }
  if (reduce) setTimeout(() => document.querySelectorAll('video').forEach(v => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; }), 0);

  /* ---------- card deck: active jobs stack in a column, space opens and closes continuously ---------- */
  function cardHTML(j, cls = '', noVideo = false) {
    return `<article class="card ${cls}" data-job="${j.id}">${j.video && !noVideo ? videoTag() : ''}<span class="tag">${j.years}</span><h3>${j.title.replace('&', '&amp;')}</h3><p>${j.desc}</p></article>`;
  }
  function makeDeck(el, { center = true, gap = 14, dx = -26, noVideo = false } = {}) {
    el.innerHTML = JOBS.map(j => cardHTML(j, '', noVideo)).join('');
    const cards = [...el.children].map((c, i) => ({ el: c, job: JOBS[i], y: 0, a: -1 }));
    function update(acts) {
      let total = 0;
      for (const c of cards) { c.h = c.el.offsetHeight; total += (c.h + gap) * clamp(acts[c.job.id] || 0); }
      let y = (typeof center === 'function' ? center() : center) ? -(total - gap) / 2 : 0;
      for (const c of cards) {
        const a = clamp(acts[c.job.id] || 0), ty = y - (1 - a) * 12;
        c.y = c.a < 0 ? ty : lerp(c.y, ty, .14); c.a = a;
        y += (c.h + gap) * a;
        c.el.style.opacity = a.toFixed(3);
        c.el.style.transform = `translate(${((1 - a) * dx).toFixed(1)}px, ${c.y.toFixed(1)}px) scale(${(.96 + .04 * a).toFixed(3)})`;
        c.el.style.filter = a > .99 ? 'none' : `blur(${((1 - a) * 8).toFixed(1)}px)`;
        c.el.style.visibility = a < .005 ? 'hidden' : 'visible';
        c.el.style.pointerEvents = a > .5 ? 'auto' : 'none';
      }
    }
    return { cards, update };
  }
  // activity of a job at fractional year c, with soft edges `e` years wide
  const activity = (j, c, e = .45) => smooth((c - j.from + e * .5) / e) * smooth((j.to - c + e * .5) / e);

  return { cardHTML, makeDeck, activity, JOBS, Y0, Y1, VIDEO, POSTER, videoTag, clamp, smooth, lerp, reduce, DPR, opts, loops, get lenis() { return lenis; }, size: () => ({ W, H }) };
})();
