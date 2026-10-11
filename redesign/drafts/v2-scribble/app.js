(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PASTELS = ['#ffb3d1', '#9ed8ff', '#c8b5ff', '#ffe58a', '#ffc19e', '#ff8f8f'];
const rand = (a, b) => a + Math.random() * (b - a);
const NS = 'http://www.w3.org/2000/svg';

/* ---------- scribbled lettering ---------- */
document.querySelectorAll('[data-scribble]').forEach((el, i) => Scribble.render(el, { seed: 11 + i * 31 }));
if (!reduce) Scribble.start(6);

/* ---------- boil ticker: swap displacement filters ~8x a second ---------- */
if (!reduce) {
  let b = 0;
  setInterval(() => { b = (b + 1 + Math.floor(Math.random() * 2)) % 3; document.documentElement.dataset.boil = b; }, 125);
}

/* ---------- crayon highlighter swaths behind words ---------- */
function swath(host, color) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'swath boil');
  svg.setAttribute('viewBox', '0 0 100 40'); svg.setAttribute('preserveAspectRatio', 'none');
  Object.assign(svg.style, { left: '-3%', top: '34%', width: '106%', height: '58%' });
  let d = `M${rand(0, 3).toFixed(1)} ${rand(26, 32).toFixed(1)}`;
  for (let x = 3; x < 96; x += rand(5, 8)) d += ` L${(x + rand(2, 4)).toFixed(1)} ${rand(4, 12).toFixed(1)} L${(x + rand(4, 7)).toFixed(1)} ${rand(28, 36).toFixed(1)}`;
  svg.innerHTML = `<path d="${d}" fill="none" stroke="${color}" stroke-width="16" stroke-linejoin="round" stroke-linecap="round" filter="url(#crayon)" vector-effect="non-scaling-stroke" opacity=".9"/>`;
  host.style.position = 'relative'; host.style.zIndex = 0;
  host.prepend(svg);
}
document.querySelectorAll('[data-swath]').forEach(el => swath(el, el.dataset.swath));

/* ---------- handstand: rays + replacement frames ---------- */
document.querySelectorAll('[data-handstand]').forEach(stage => {
  const rays = stage.querySelector('.hero__rays');
  const cx = 46.3, cy = 93.2;  // figure centre from assets/handstand/meta.json (0.463, 0.621)
  let html = '';
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2, w = rand(.05, .11), L = rand(85, 140);
    const p = (t, r) => `${(cx + Math.cos(a + t) * r).toFixed(1)} ${(cy + Math.sin(a + t) * r).toFixed(1)}`;
    html += `<path d="M${p(-w * .2, 14)} L${p(-w, L)} L${p(w, L * rand(.9, 1.05))} L${p(w * .2, 14)}Z" fill="${PASTELS[i % PASTELS.length]}" opacity=".55" filter="url(#crayon)"/>`;
  }
  rays.innerHTML = `<g class="spin">${html}</g>`;
  const g = rays.querySelector('.spin');
  const figs = [...stage.querySelectorAll('.hero__fig img')];
  let k = 0, rot = 0;
  if (!reduce) setInterval(() => {
    figs[k].classList.remove('on'); k = (k + 1 + Math.floor(Math.random() * 2)) % figs.length; figs[k].classList.add('on');
    rot += 1.5; g.setAttribute('transform', `rotate(${rot} ${cx} ${cy})`);   // stepped, not smooth
  }, 125);
});

/* ---------- hero doodles (stars, sparkles) ---------- */
const doodles = document.querySelector('.hero__doodles');
const star = (x, y, r, c) => {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`; }
  return `<path d="${d}Z" fill="${c}" stroke="#2b2433" stroke-width="2" stroke-linejoin="round"/>`;
};
const spark = (x, y, r, c) => `<path d="M${x - r} ${y}L${x + r} ${y}M${x} ${y - r}L${x} ${y + r}M${x - r * .6} ${y - r * .6}L${x + r * .6} ${y + r * .6}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
function placeDoodles() {
  const W = innerWidth, H = innerHeight;
  doodles.setAttribute('viewBox', `0 0 ${W} ${H}`);
  doodles.innerHTML = star(W * .07, H * .12, 16, '#ffb3d1') + star(W * .52, H * .1, 12, '#c8b5ff') + star(W * .43, H * .8, 14, '#ffe58a')
    + spark(W * .6, H * .62, 12, '#ff8f8f') + spark(W * .3, H * .1, 10, '#9ed8ff') + spark(W * .93, H * .5, 9, '#ffc19e');
}
placeDoodles(); addEventListener('resize', placeDoodles);

/* ---------- crayon cursor trail (12 fps, fades in steps) ---------- */
const cv = document.getElementById('crayonTrail'), cx2 = cv.getContext('2d');
const fitCv = () => { cv.width = innerWidth; cv.height = innerHeight; };
fitCv(); addEventListener('resize', fitCv);
let pts = [], color = PASTELS[0], lastMove = 0;
addEventListener('pointermove', e => {
  const now = performance.now();
  if (now - lastMove > 350) color = PASTELS[Math.floor(Math.random() * PASTELS.length)];
  lastMove = now; pts.push([e.clientX, e.clientY]);
}, { passive: true });
if (!reduce) setInterval(() => {
  cx2.globalCompositeOperation = 'destination-out'; cx2.fillStyle = 'rgba(0,0,0,.18)'; cx2.fillRect(0, 0, cv.width, cv.height);
  cx2.globalCompositeOperation = 'source-over';
  if (pts.length > 1) {
    cx2.strokeStyle = color; cx2.lineCap = 'round';
    for (let pass = 0; pass < 4; pass++) {
      cx2.lineWidth = rand(5, 10); cx2.globalAlpha = rand(.35, .7);
      cx2.beginPath(); pts.forEach(([x, y], i) => cx2[i ? 'lineTo' : 'moveTo'](x + rand(-3, 3), y + rand(-3, 3))); cx2.stroke();
    }
    cx2.globalAlpha = 1;
    pts = pts.slice(-1);
  }
}, 1000 / 12);

/* ---------- golf ---------- */
document.fonts.ready.then(() => GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), '../../assets/golf'));

/* ---------- song ---------- */
const song = document.getElementById('song'), audio = document.getElementById('audio');
song.addEventListener('click', () => {
  const on = audio.paused; on ? audio.play() : audio.pause();
  song.classList.toggle('playing', on); song.setAttribute('aria-pressed', on);
});

/* ---------- marquee ---------- */
const mq = document.getElementById('marquee'); mq.innerHTML += mq.innerHTML;

if (reduce) return;

/* ---------- smooth scroll ---------- */
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .09 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.4 });
}));

ScrollTrigger.create({ start: 0, end: 40, onToggle: s => document.body.classList.toggle('hero-top', s.isActive) });

/* ---------- intro: letters "drawn in" one by one, on 8s ---------- */
const heroLetters = gsap.utils.toArray('.hero__name .sc-letter');
gsap.from(heroLetters, { opacity: 0, scale: .6, rotate: () => rand(-25, 25), duration: .5, ease: 'steps(4)', stagger: .07, delay: .2 });
gsap.from('.hero__stage', { opacity: 0, scale: .85, duration: .8, ease: 'steps(6)', delay: .5 });
gsap.from('.hero__note, .hero__scroll', { opacity: 0, y: 20, duration: .6, ease: 'steps(5)', delay: 1.1, stagger: .15 });

/* ---------- hero exit: letters fall off like paper cutouts (stepped) ---------- */
gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=90%', pin: true, scrub: true } })
  .to(heroLetters, { y: () => rand(innerHeight * .4, innerHeight * 1.1), x: () => rand(-80, 80), rotate: () => rand(-70, 70), ease: 'steps(10)', stagger: .02 }, 0)
  .to('.hero .swath', { opacity: 0, ease: 'steps(5)' }, 0)
  .to('.hero__stage', { scale: 1.25, xPercent: -18, ease: 'steps(12)' }, 0)
  .to('.hero__note, .hero__scroll, .hero__doodles', { opacity: 0, ease: 'steps(4)' }, 0);

/* ---------- statement: words + underlines drawn as you scroll ---------- */
const st = document.getElementById('statement');
const words = [];
st.childNodes.forEach(n => {
  if (n.nodeType === 3) {
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(s => {
      if (!s) return;
      if (/^\s+$/.test(s)) return frag.append(s);
      const w = document.createElement('span'); w.className = 'w'; w.textContent = s; frag.append(w); words.push(w);
    });
    n.replaceWith(frag);
  } else { n.classList.add('w'); words.push(n); }
});
st.querySelectorAll('.em').forEach(em => {
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 100 20'); svg.setAttribute('preserveAspectRatio', 'none');
  svg.innerHTML = `<path d="M2 12 C 30 4, 60 18, 98 8 M6 16 C 40 10, 70 18, 94 13" fill="none" stroke="${em.dataset.u}" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" vector-effect="non-scaling-stroke"/>`;
  em.append(svg);
});
gsap.timeline({ scrollTrigger: { trigger: '.statement', start: 'top 70%', end: 'bottom 60%', scrub: true } })
  .to(words, { opacity: 1, stagger: .1, ease: 'steps(2)' })
  .to('.statement .em path', { strokeDashoffset: 0, ease: 'steps(6)', stagger: .3 }, '-=.6');

/* ---------- work: sideways pin ---------- */
gsap.matchMedia().add('(min-width: 761px)', () => {
  const track = document.getElementById('track');
  const dist = () => track.scrollWidth - innerWidth;
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
    trigger: '.work__pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
    onUpdate: s => document.getElementById('workProg').style.strokeDashoffset = 1 - s.progress } });
});
gsap.from('.card, .more', { y: 90, rotate: () => rand(-8, 8), opacity: 0, ease: 'steps(6)', duration: .7, stagger: .08,
  scrollTrigger: { trigger: '.work__pin', start: 'top 75%' } });

/* ---------- experience + about entrances ---------- */
ScrollTrigger.create({ trigger: '#experience', start: 'top 60px', end: 'bottom 60px', toggleClass: { targets: document.body, className: 'theme-lilac' } });
gsap.from('.reel__frame', { rotate: -8, y: 60, opacity: 0, duration: .8, ease: 'steps(6)', scrollTrigger: { trigger: '.reel', start: 'top 75%' } });
gsap.from('.exp__row', { x: -60, opacity: 0, duration: .6, ease: 'steps(5)', stagger: .1, scrollTrigger: { trigger: '.exp__row', start: 'top 80%' } });
gsap.from('.about__doodle', { scale: .7, opacity: 0, duration: .8, ease: 'steps(6)', scrollTrigger: { trigger: '.about', start: 'top 70%' } });

/* ---------- marquee speed follows scroll velocity, moved in steps ---------- */
let mx = 0, acc = 0;
gsap.ticker.add((t, dt) => {
  mx -= (1 + Math.abs(lenis.velocity) * .3) * dt / 16;
  acc += dt; if (acc < 1000 / 12) return; acc = 0;          // only redraw 12x a second
  const half = mq.scrollWidth / 2; if (-mx > half) mx += half;
  mq.style.transform = `translateX(${mx.toFixed(0)}px)`;
});

/* ---------- footer name ---------- */
gsap.from('.footer__big .sc-letter', { y: 120, rotate: () => rand(-30, 30), opacity: 0, ease: 'steps(5)', duration: .6, stagger: .05,
  scrollTrigger: { trigger: '.footer__big', start: 'top 90%' } });
})();
