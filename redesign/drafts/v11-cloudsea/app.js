/* v11 Cloud Sea: page shell. Ink-brush headings (inkbrush.js), the golf card, Lenis + entrances.
   The living background (sky, cloud sea, Daniel on the clouds) is sea.js; the comet, its gold progress line,
   the shooting stars and the wish easter egg are comet.js. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('night');
const base = window.V9_BASE || '';

/* ---------- lettering: the hero name writes itself on load, the section titles as they scroll in ---------- */
const run = () => document.querySelectorAll('[data-brush]').forEach((el, i) => InkBrush.render(el, { delay: i ? .1 : .5, target: i ? 1.5 : 2.4 }));
document.fonts && document.fonts.ready ? document.fonts.ready.then(run) : run();

document.fonts.ready.then(() => GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), base + '../v5-elemental/assets/golf'));

if (reduce) return;
/* ---------- smooth scroll + entrances ---------- */
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .09 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(tk => lenis.raf(tk * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 }); }));
gsap.from('.role, .facts li, .hero .pill', { y: 18, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08, delay: 1.6 });
gsap.utils.toArray('.card:not(.vt-card)').forEach((c, i) => gsap.from(c, { y: 70, opacity: 0, rotate: i % 2 ? 1.2 : -1.2, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 92%' } }));
})();
