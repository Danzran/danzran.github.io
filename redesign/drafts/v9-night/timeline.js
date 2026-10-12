/* Experience as an edit timeline (ported from labs/timeline/c-edit-timeline.js).
   A nod to the video-editing years: each job is a clip on its own track (V1 the reel with its audio on A1,
   V2 the IT work that is still running, V3 the two later jobs back to back). Scrolling scrubs the playhead
   from 2014 to now; the program monitor plays the real reel while the editing years run, with the other jobs
   as titles that glide from lower thirds to a full-frame slate once the reel dissolves out.
   Runs its own rAF loop and reads progress from a ScrollTrigger pin; uses app.js's Lenis (no second instance). */
(() => {
  const nle = document.getElementById('nle');
  if (!nle || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const lerp = (a, b, k) => a + (b - a) * k;

  // the only facts: four jobs, overlapping
  const JOBS = [
    { id: 'edit', title: 'Video editor', years: '2014–2020', from: 2014, to: 2020.99, desc: 'COD edits, compositing, camera tracking, led a team of 4 editors.' },
    { id: 'it', title: 'Systems assembler & IT', years: '2018–now', from: 2018, to: 2026.8, desc: 'Builds, networks, virtual machines.' },
    { id: 'lock', title: 'Lockout technician', years: '2022–23', from: 2022, to: 2023.99, desc: 'Push-to-start keys and programming.' },
    { id: 'ext', title: 'Backend developer · Extropian', years: '2024–25', from: 2024, to: 2025.99, desc: 'Golf app: Bluetooth sensors, swing metrics, Firebase.' },
  ];
  const Y0 = 2014, Y1 = 2027, span = Y1 - Y0;
  const byId = Object.fromEntries(JOBS.map(j => [j.id, j]));
  const esc = s => s.replace('&', '&amp;');
  const pct = y => ((y - Y0) / span * 100).toFixed(3) + '%';
  // activity of a job at fractional year c, with soft edges `e` years wide (dissolves, never cuts)
  const activity = (j, c, e = .45) => smooth((c - j.from + e * .5) / e) * smooth((j.to - c + e * .5) / e);

  const $ = id => document.getElementById(id);
  const lanes = [...$('lanes').children], ruler = $('ruler'), tracks = $('tracks'), playhead = $('playhead');
  const reel = $('monReel'), titlesEl = $('monTitles'), monitor = $('monitor'), tc = $('monTC'), deckEl = $('inspDeck');

  // ruler: years and quarter ticks
  for (let y = Y0; y < Y1; y++) {
    ruler.insertAdjacentHTML('beforeend', `<span class="yr" style="left:${pct(y)}" data-y="${y}">${y}</span>`);
    for (let m = 3; m < 12; m += 3) ruler.insertAdjacentHTML('beforeend', `<span class="mo" style="left:${pct(y + m / 12)}"></span>`);
  }
  // clips (short names for phone, where a two-year clip is only ~50px wide)
  const CLIPS = [
    { job: 'lock', lane: 0, name: 'Lockout technician', short: 'Lockout' },
    { job: 'ext', lane: 0, name: 'Extropian backend', short: 'Extropian' },
    { job: 'it', lane: 1, name: 'Systems assembler &amp; IT', short: 'Systems &amp; IT', cls: 'now' },
    { job: 'edit', lane: 2, name: 'Video editor · edit.mp4', short: 'Video editor', cls: 'film' },
    { job: 'edit', lane: 3, cls: 'audio' },
  ];
  CLIPS.forEach(c => {
    const j = byId[c.job], el = document.createElement('div');
    el.className = 'clip ' + (c.cls || '');
    el.style.left = pct(j.from); el.style.width = `calc(${pct(Math.min(j.to, 2026.95) - j.from + Y0)} - 2px)`;
    el.innerHTML = c.cls === 'audio' ? '<canvas></canvas>' : `<span class="lg">${c.name}</span><span class="sh">${c.short}</span><small>${j.years}</small>`;
    lanes[c.lane].appendChild(el); c.el = el;
  });
  // A1: a deterministic waveform for the reel's audio, drawn once per resize
  function waveform() {
    const c = CLIPS[4].el.querySelector('canvas'), w = c.clientWidth, h = c.clientHeight, d = Math.min(devicePixelRatio || 1, 2);
    if (!w || !h) return;
    c.width = w * d; c.height = h * d; const g = c.getContext('2d'); g.scale(d, d);
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.fillStyle = 'rgba(255,217,138,.85)';
    for (let x = 2; x < w - 2; x += 3) {
      const beat = Math.pow(Math.abs(Math.sin(x / 23)), 6), a = (.18 + .5 * beat + .3 * rnd()) * h * .42;
      g.fillRect(x, h / 2 - a, 1.6, a * 2);
    }
  }
  // monitor titles for the jobs that are not the reel
  const TITLES = JOBS.filter(j => j.id !== 'edit').map(j => {
    const el = document.createElement('div'); el.className = 'mtitle';
    el.innerHTML = `<b>${esc(j.title)}</b><span>${j.years}</span>`;
    titlesEl.appendChild(el); return { j, el, y: null };
  });
  // inspector: the clips under the playhead stack here; space opens and closes continuously
  deckEl.innerHTML = JOBS.map(j => `<article class="card" data-job="${j.id}"><span class="tag">${j.years}</span><h3>${esc(j.title)}</h3><p>${j.desc}</p></article>`).join('');
  const deck = [...deckEl.children].map((el, i) => ({ el, job: JOBS[i], y: 0, first: true }));
  function updateDeck(acts) {
    const gap = 14; let total = 0;
    for (const c of deck) { c.h = c.el.offsetHeight; total += (c.h + gap) * acts[c.job.id]; }
    let y = -(total - gap) / 2;
    for (const c of deck) {
      const a = acts[c.job.id], ty = y - (1 - a) * 12;
      c.y = c.first ? ty : lerp(c.y, ty, .14); c.first = false;
      y += (c.h + gap) * a;
      c.el.style.opacity = a.toFixed(3);
      c.el.style.transform = `translate(${((1 - a) * 20).toFixed(1)}px, ${c.y.toFixed(1)}px) scale(${(.96 + .04 * a).toFixed(3)})`;
      c.el.style.filter = a > .99 ? 'none' : `blur(${((1 - a) * 8).toFixed(1)}px)`;
      c.el.style.visibility = a < .005 ? 'hidden' : 'visible';
    }
  }

  let target = 0, prog = 0, narrow = false, onScreen = true;
  function layout() {
    narrow = innerWidth < 820;
    nle.style.setProperty('--th', (narrow ? 30 : Math.max(32, Math.min(44, innerHeight * .048))) + 'px');
    ruler.querySelectorAll('.yr').forEach(el => el.style.visibility = narrow && el.dataset.y % 2 ? 'hidden' : 'visible');
    waveform();
  }

  function draw() {
    prog = reduce ? target : lerp(prog, target, .14);
    const c = Y0 + .02 + prog * (2026.75 - Y0);
    playhead.style.transform = `translate3d(${((c - Y0) / span * tracks.clientWidth).toFixed(2)}px,0,0)`;
    const frac = c - Math.floor(c), mo = Math.floor(frac * 12) + 1, fr = Math.floor(frac * 12 * 24) % 24;
    tc.textContent = `TC ${Math.floor(c)}:${String(mo).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
    CLIPS.forEach(k => k.el.style.setProperty('--hot', activity(byId[k.job], c, .25).toFixed(3)));
    // program monitor: the reel dissolves in and out over its years (and only plays while visible)
    const reelA = activity(byId.edit, c, .5);
    reel.style.opacity = reelA.toFixed(3);
    if (!reduce) { if (reelA > .01 && onScreen && reel.paused) reel.play().catch(() => {}); else if ((reelA <= .01 || !onScreen) && !reel.paused) reel.pause(); }
    // titles: lower thirds over the reel, a full-frame slate once it has gone
    const mw = monitor.clientWidth, mh = monitor.clientHeight, m = reelA;
    const sc = lerp(narrow ? 1.05 : 1.35, narrow ? .7 : .8, m), gap = lerp(18, 8, m) * (narrow ? .6 : 1);
    const act = TITLES.map(t => activity(t.j, c, .35));
    let total = 0; TITLES.forEach((t, i) => total += (t.el.offsetHeight * sc + gap) * act[i]);
    let yC = mh * .54 - total / 2, yL = mh * .9 - total;
    TITLES.forEach((t, i) => {
      const a = act[i], h = (t.el.offsetHeight * sc + gap) * a, ty = lerp(yC, yL, m);
      t.y = t.y == null ? ty : lerp(t.y, ty, .2);
      yC += h; yL += h;
      t.el.style.opacity = a.toFixed(3);
      t.el.style.transform = `translate3d(${(mw * lerp(.08, .045, m) - (1 - a) * 24).toFixed(1)}px,${t.y.toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
    });
    const acts = {}; JOBS.forEach(j => acts[j.id] = activity(j, c, .35));
    updateDeck(acts);
  }

  layout(); addEventListener('resize', layout); document.fonts.ready.then(layout);
  // refreshPriority: this pin sits above the about/contact triggers, so it must be measured first
  ScrollTrigger.create({ trigger: nle, pin: true, start: 'top top', end: () => '+=' + innerHeight * 3.6, refreshPriority: 1,
    onUpdate: st => target = st.progress, onRefresh: st => { target = st.progress; layout(); } });
  ScrollTrigger.create({ trigger: nle, start: 'top bottom', end: 'bottom top', onToggle: st => onScreen = st.isActive });
  ScrollTrigger.sort(); ScrollTrigger.refresh();
  if (reduce) { reel.removeAttribute('autoplay'); reel.pause(); reel.controls = true; }
  (function loop() { requestAnimationFrame(loop); if (onScreen || prog !== target) draw(); })();
})();
