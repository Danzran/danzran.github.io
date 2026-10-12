(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('[data-brush]').forEach((el, i) => Lettering.render(el, { seed: 9 + i * 43 }));
if (!reduce) Lettering.start(8);   // scratchy hand-written titles boil on threes

/* ---------- timecode + clip name ---------- */
const tc = document.getElementById('tc'), t0 = performance.now(), p2 = n => String(n).padStart(2, '0');
const fmt = f => `${p2(Math.floor(f / 108000))}:${p2(Math.floor(f / 1800) % 60)}:${p2(Math.floor(f / 30) % 60)}:${p2(f % 30)}`;
setInterval(() => tc.textContent = fmt(Math.floor((performance.now() - t0) / (1000 / 30))), 33);
const clipName = document.getElementById('clipName');
new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) clipName.textContent = e.target.dataset.clip; }), { threshold: .5 })
  .observe && document.querySelectorAll('[data-clip]').forEach(s => new IntersectionObserver(([e]) => { if (e.isIntersecting) clipName.textContent = s.dataset.clip; }, { threshold: .4 }).observe(s));

/* ---------- flash-frame cut (two white frames, like a hard edit) ---------- */
const flash = document.getElementById('flash');
let lastCut = 0;
function cut() {
  if (reduce) return; const now = performance.now(); if (now - lastCut < 600) return; lastCut = now;
  flash.style.opacity = .9; setTimeout(() => flash.style.opacity = .35, 42); setTimeout(() => flash.style.opacity = 0, 84);
}

/* ---------- golf + song ---------- */
document.fonts.ready.then(() => GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), 'assets/golf'));
const song = document.getElementById('song'), audio = document.getElementById('audio');
song.addEventListener('click', () => { const on = audio.paused; on ? audio.play() : audio.pause(); song.classList.toggle('playing', on); song.setAttribute('aria-pressed', on); });

/* ---------- clip switching (shared by scroll and click) ---------- */
const slides = [...document.querySelectorAll('.slide')], infos = [...document.querySelectorAll('.clipinfo')], monTc = document.getElementById('monTc');
let cur = 0;
function show(i) {
  if (i === cur) return; cur = i; cut();
  slides.forEach((s, k) => s.classList.toggle('on', k === i)); infos.forEach((s, k) => s.classList.toggle('on', k === i));
}
document.querySelectorAll('.track.v i').forEach((el, i) => el.addEventListener('click', () => show(i)));

if (reduce) return;
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .09 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.3 }); }));

/* intro: cut in from black, title smears on */
gsap.timeline()
  .from('.hero__shot img', { scale: 1.25, filter: 'brightness(0)', duration: 1.4, ease: 'power3.out' })
  .add(cut, .2)
  .from('.hero__copy h1 .lt-letter', { x: -80, opacity: 0, skewX: -30, duration: .3, ease: 'steps(3)', stagger: .05 }, .5)
  .from('.hero__sub', { opacity: 0, y: 14, duration: .6 }, 1.1);

/* hero: letterbox closes in, slow push, then cut */
gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=70%', pin: true, scrub: true, onLeave: cut } })
  .to('.hero .bars i', { height: '13vh', ease: 'none' }, 0)
  .to('.hero__shot img', { scale: 1.18, ease: 'none' }, 0)
  .to('.hero__copy', { y: -40, opacity: 0, ease: 'power1.in' }, .3);

/* work: pinned edit bay, scroll drives the playhead across four clips */
gsap.matchMedia().add('(min-width: 821px)', () => {
  const tl = document.getElementById('timeline'), ph = document.getElementById('playhead');
  ScrollTrigger.create({ trigger: '.work', start: 'top top', end: '+=260%', pin: true, scrub: true,
    onUpdate: s => {
      const w = tl.clientWidth - 44; ph.style.left = (44 + s.progress * (w - 2)) + 'px';
      show(Math.min(3, Math.floor(s.progress * 4)));
      monTc.textContent = fmt(108000 + Math.floor(s.progress * 16 * 30));
    } });
});
ScrollTrigger.create({ trigger: '.reel', start: 'top 60%', onEnter: cut });
gsap.from('.reel .bars i', { height: '50%', duration: .8, ease: 'power3.inOut', scrollTrigger: { trigger: '.reel', start: 'top 60%' } });
gsap.utils.toArray('.reel__copy > *, .about > *, .contact > *:not(.contact__bg)').forEach(el =>
  gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
gsap.fromTo('.contact__bg img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.contact', scrub: true } });
})();
