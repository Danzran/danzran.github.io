(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => a + Math.random() * (b - a);
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const COLS = ['#bcd8ff', '#d5c4ff', '#ffd3bd', '#ffeba8', '#ffc6da'];

document.querySelectorAll('[data-brush]').forEach((el, i) => Lettering.render(el, { seed: 13 + i * 31 }));
if (!reduce) Lettering.start(8);
// panel borders boil on threes
if (!reduce) { let b = 0; setInterval(() => { b = (b + 1 + (Math.random() * 2 | 0)) % 3; document.documentElement.dataset.boil = b; }, 125); }
// figure drawings
document.querySelectorAll('.fig').forEach(f => { const im = [...f.querySelectorAll('img')]; let k = 0;
  if (!reduce) setInterval(() => { im[k].classList.remove('on'); k = (k + 1 + (Math.random() * 2 | 0)) % im.length; im[k].classList.add('on'); }, 125); });

/* focus lines inside panels, redrawn on threes */
const lineCanvases = [...document.querySelectorAll('[data-lines]')].map(c => ({ c, ctx: c.getContext('2d') }));
function drawLines() {
  for (const { c, ctx } of lineCanvases) {
    const W = c.clientWidth, H = c.clientHeight; if (!W) continue;
    if (c.width !== W * DPR) { c.width = W * DPR; c.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
    ctx.clearRect(0, 0, W, H);
    const cx = W * .72, cy = H * .45, R = Math.hypot(W, H);
    for (let i = 0; i < 140; i++) {
      const a = rand(0, 6.283), r0 = R * rand(.22, .4), w = rand(.003, .012), ink = Math.random() < .3;
      ctx.fillStyle = ink ? '#1b1626' : COLS[i % COLS.length]; ctx.globalAlpha = ink ? rand(.4, .8) : rand(.5, .9);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R); ctx.lineTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
drawLines(); if (!reduce) setInterval(drawLines, 125);

document.fonts.ready.then(() => GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), '../v4-sakuga/assets/golf'));
const song = document.getElementById('song'), audio = document.getElementById('audio');
song.addEventListener('click', () => { const on = audio.paused; on ? audio.play() : audio.pause(); song.setAttribute('aria-pressed', on); song.textContent = on ? '♪ pause' : '♪ play my favorite song'; });

if (reduce) return;
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { offset: -70, duration: 1.2 }); }));

/* intro */
gsap.timeline({ delay: .15 })
  .from('.p-splash', { clipPath: 'polygon(0 0,0 0,0 100%,0 100%)', duration: .5, ease: 'steps(5)' })
  .from('.p-splash .title .lt-letter', { y: -120, rotate: () => rand(-40, 40), opacity: 0, duration: .3, ease: 'steps(3)', stagger: .04 }, '-=.1')
  .from('#heroFig', { y: 160, duration: .35, ease: 'steps(4)' }, '-=.4')
  .from('.s-fwoop, .caption, .thought', { scale: 2.2, opacity: 0, duration: .25, ease: 'steps(3)', stagger: .1 });

/* panels are "read" in order: each wipes open on threes with its own direction */
gsap.utils.toArray('.spread:not(.hero) .panel, .hero .p-small1, .hero .p-small2').forEach((p, i) => {
  const from = ['polygon(0 0,0 0,0 100%,0 100%)', 'polygon(100% 0,100% 0,100% 100%,100% 100%)', 'polygon(0 0,100% 0,100% 0,0 0)'][i % 3];
  const to = getComputedStyle(p).clipPath;
  gsap.fromTo(p, { clipPath: from }, { clipPath: to === 'none' ? 'polygon(0 0,100% 0,100% 100%,0 100%)' : to, duration: .45, ease: 'steps(5)', scrollTrigger: { trigger: p, start: 'top 85%' } });
  p.querySelectorAll('.sfx, .speech').forEach(s => gsap.from(s, { scale: 2, opacity: 0, duration: .25, ease: 'steps(3)', delay: .4, scrollTrigger: { trigger: p, start: 'top 85%' } }));
});
gsap.utils.toArray('.chapter').forEach(c => gsap.from(c.querySelectorAll('.lt-letter'), { y: -60, opacity: 0, duration: .25, ease: 'steps(3)', stagger: .03, scrollTrigger: { trigger: c, start: 'top 88%' } }));
})();
