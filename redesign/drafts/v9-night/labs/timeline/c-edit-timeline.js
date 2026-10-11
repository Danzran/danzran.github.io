/* C · edit timeline
   A nod to the video-editing years: Experience is a sequence in an editor floating in the night sky.
   Each job is a clip on its own track (V1 the reel and its audio on A1, V2 the IT work that is still running,
   V3 the two later jobs back to back). Scrolling scrubs the playhead from 2014 to now; the program monitor
   shows what is under it: the real reel while the editing years play, with the other jobs as titles that
   glide from lower thirds to a full-frame slate once the reel dissolves out. */
(() => {
  const { JOBS, Y0, Y1, clamp, smooth, lerp, reduce } = TL;
  TL.opts.moon = false;   // the program monitor's slate carries the moon here
  const $ = id => document.getElementById(id);
  const nle = $('nle'), lanes = [...$('lanes').children], ruler = $('ruler'), tracks = $('tracks'), playhead = $('playhead');
  const reel = $('monReel'), titlesEl = $('monTitles'), monitor = $('monitor'), tc = $('monTC');
  const deck = TL.makeDeck($('inspDeck'), { center: true, noVideo: true, dx: 20 });
  const span = Y1 - Y0, pct = y => ((y - Y0) / span * 100).toFixed(3) + '%';
  const byId = Object.fromEntries(JOBS.map(j => [j.id, j]));

  // ruler: years and month ticks
  for (let y = Y0; y < Y1; y++) {
    ruler.insertAdjacentHTML('beforeend', `<span class="yr" style="left:${pct(y)}" data-y="${y}">${y}</span>`);
    for (let m = 3; m < 12; m += 3) ruler.insertAdjacentHTML('beforeend', `<span class="mo" style="left:${pct(y + m / 12)}"></span>`);
  }
  // clips
  const CLIPS = [
    { job: 'lock', lane: 0, name: 'Lockout technician' },
    { job: 'ext', lane: 0, name: 'Extropian backend' },
    { job: 'it', lane: 1, name: 'Systems assembler &amp; IT', cls: 'now' },
    { job: 'edit', lane: 2, name: 'Video editor · edit.mp4', cls: 'film' },
    { job: 'edit', lane: 3, cls: 'audio' },
  ];
  CLIPS.forEach(c => {
    const j = byId[c.job], el = document.createElement('div');
    el.className = 'clip ' + (c.cls || '');
    el.style.left = pct(j.from); el.style.width = `calc(${pct(Math.min(j.to, 2026.95) - j.from + Y0)} - 2px)`;
    el.innerHTML = c.cls === 'audio' ? '<canvas></canvas>' : `<span>${c.name}</span><small>${j.years}</small>`;
    lanes[c.lane].appendChild(el); c.el = el;
  });
  // A1: a deterministic waveform for the reel's audio, drawn once per resize
  function waveform() {
    const c = CLIPS[4].el.querySelector('canvas'), w = c.clientWidth, h = c.clientHeight, d = Math.min(devicePixelRatio || 1, 2);
    c.width = w * d; c.height = h * d; const g = c.getContext('2d'); g.scale(d, d);
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.fillStyle = 'rgba(255,217,138,.85)';
    for (let x = 2; x < w - 2; x += 3) {
      const beat = Math.pow(Math.abs(Math.sin(x / 23)), 6), a = (.18 + .5 * beat + .3 * rnd()) * h * .42;
      g.fillRect(x, h / 2 - a, 1.6, a * 2);
    }
  }
  // monitor titles for the jobs that are not the reel
  const TITLES = JOBS.filter(j => !j.video).map(j => {
    const el = document.createElement('div'); el.className = 'mtitle';
    el.innerHTML = `<b>${j.title.replace('&', '&amp;')}</b><span>${j.years}</span>`;
    titlesEl.appendChild(el); return { j, el, y: null };
  });

  let target = 0, prog = 0, narrow = false;
  function layout() {
    narrow = innerWidth < 820;
    nle.style.setProperty('--th', (narrow ? 30 : Math.max(32, Math.min(44, innerHeight * .048))) + 'px');
    ruler.querySelectorAll('.yr').forEach(el => el.style.visibility = narrow && el.dataset.y % 2 ? 'hidden' : 'visible');
    waveform();
  }

  function draw() {
    prog = reduce ? target : lerp(prog, target, .14);
    const c = Y0 + .02 + prog * (2026.75 - Y0);
    // playhead
    playhead.style.transform = `translate3d(${((c - Y0) / span * tracks.clientWidth).toFixed(2)}px,0,0)`;
    const frac = c - Math.floor(c), mo = Math.floor(frac * 12) + 1, fr = Math.floor(frac * 12 * 24) % 24;
    tc.textContent = `TC ${Math.floor(c)}:${String(mo).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
    // clips glow while the playhead is over them
    CLIPS.forEach(k => k.el.style.setProperty('--hot', TL.activity(byId[k.job], c, .25).toFixed(3)));
    // program monitor: the reel dissolves in and out over its years
    const reelA = TL.activity(byId.edit, c, .5);
    reel.style.opacity = reelA.toFixed(3);
    if (!reduce) { if (reelA > .01 && reel.paused) reel.play().catch(() => {}); else if (reelA <= .01 && !reel.paused) reel.pause(); }
    // titles: lower thirds over the reel, a full-frame slate once it has gone
    const mw = monitor.clientWidth, mh = monitor.clientHeight, m = reelA;
    const sc = lerp(narrow ? 1.05 : 1.35, narrow ? .7 : .8, m), gap = lerp(18, 8, m) * (narrow ? .6 : 1);
    const act = TITLES.map(t => TL.activity(t.j, c, .35));
    let total = 0; TITLES.forEach((t, i) => total += (t.el.offsetHeight * sc + gap) * act[i]);
    let yC = mh * .54 - total / 2, yL = mh * .9 - total;
    TITLES.forEach((t, i) => {
      const a = act[i], h = (t.el.offsetHeight * sc + gap) * a, ty = lerp(yC, yL, m);
      t.y = t.y == null ? ty : lerp(t.y, ty, .2);
      yC += h; yL += h;
      t.el.style.opacity = a.toFixed(3);
      t.el.style.transform = `translate3d(${(mw * lerp(.08, .045, m) - (1 - a) * 24).toFixed(1)}px,${t.y.toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
    });
    // inspector: the clips under the playhead
    const acts = {}; JOBS.forEach(j => acts[j.id] = TL.activity(j, c, .35));
    deck.update(acts);
  }

  layout(); addEventListener('resize', layout); document.fonts.ready.then(layout);
  ScrollTrigger.create({ trigger: nle, pin: true, start: 'top top', end: () => '+=' + innerHeight * 3.6, onUpdate: st => target = st.progress, onRefresh: layout });
  TL.loops.push(draw);
})();
