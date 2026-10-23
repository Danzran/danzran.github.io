/* Small, dependency-free interactions. Content and links work without JavaScript. */
(() => {
// Classic scripts and JS-wrapped data also work when the owner opens HTML from disk.
const scriptURL = document.currentScript.src;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let ambientPaused = motion.matches;
const visibilityListeners = new Set();
const onVisibility = callback => {
  visibilityListeners.add(callback);
  return () => visibilityListeners.delete(callback);
};
document.addEventListener('visibilitychange', () => visibilityListeners.forEach(fn => fn()));

// Mobile navigation remains in normal document flow, without a focus-trapping overlay.
const menu = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function closeMenu(returnFocus = false) {
  if (!menu || !mobileNav) return;
  menu.setAttribute('aria-expanded', 'false');
  mobileNav.hidden = true;
  if (returnFocus) menu.focus();
}
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  mobileNav.hidden = !open;
});
mobileNav?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
matchMedia('(min-width: 641px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// Section tracking is an enhancement; the anchor links themselves are ordinary URLs.
const sectionLinks = [...document.querySelectorAll('.desktop-nav a')];
const sections = [...document.querySelectorAll('main > section[id]')];
if (sections.length) {
  const activeSections = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => activeSections.set(entry.target.id, entry.isIntersecting));
    const active = sections.find(section => activeSections.get(section.id));
    sectionLinks.forEach(link => {
      if (active && link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, {rootMargin: '-15% 0px -55% 0px'});
  sections.forEach(section => observer.observe(section));
}

// Use the real address as the fallback when clipboard access is unavailable.
document.querySelector('.copy-email')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText(button.dataset.email);
    button.textContent = 'Copied';
    status.textContent = 'Email address copied to clipboard.';
    setTimeout(() => button.textContent = 'Copy email', 2500);
  } catch {
    status.classList.remove('sr-only');
    status.textContent = 'Select the email address to copy it, or click it to open your email app.';
  }
});

// Preserve the original in-view reader demo, with explicit pause and reduced motion.
document.querySelectorAll('.spreed-screen').forEach(screen => {
  const words = 'You are reading this one word at a time and it feels like the text is being beamed straight into your brain.'.split(' ');
  const word = screen.querySelector('.reader-word');
  const [before, pivot, after] = word.children;
  const progress = screen.querySelector('.reader-progress i');
  const button = screen.querySelector('.demo-play');
  const feedback = screen.querySelector('.quiz-feedback');
  let index = 0, requested = !motion.matches, visible = false, timer;
  function readerLabel() {
    button.setAttribute('aria-pressed', String(requested));
    button.innerHTML = requested ? 'Pause reader <span aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16M16 4v16"/></svg></span>' : 'Play reader <span aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 3 15 9-15 9Z"/></svg></span>';
  }
  function show(i) {
    const w = words[i];
    const n = w.replace(/[^a-zA-Z]/g, '').length;
    const p = n <= 3 ? 0 : n <= 6 ? 1 : n <= 9 ? 2 : n <= 13 ? 3 : 4;
    before.textContent = w.slice(0, p);
    pivot.textContent = w[p];
    after.textContent = w.slice(p + 1);
    word.style.transform = `translate(calc(-${p + .5}ch), -50%)`;
    progress.style.width = `${(i + 1) / words.length * 100}%`;
  }
  function update() {
    clearTimeout(timer);
    if (!requested || !visible || document.hidden) return;
    show(index);
    const delay = 160 * (/[.!?]$/.test(words[index]) ? 2 : 1);
    index = (index + 1) % words.length;
    timer = setTimeout(update, delay + (index === 0 ? 1000 : 0));
  }
  button.addEventListener('click', () => {
    requested = !requested;
    readerLabel();
    update();
  });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(screen);
  onVisibility(update);
  motion.addEventListener('change', () => {
    requested = !motion.matches;
    readerLabel();
    update();
  });
  readerLabel();
  screen.querySelectorAll('[data-answer]').forEach(answer => answer.addEventListener('click', () => {
    screen.querySelectorAll('[data-answer]').forEach(other => other.classList.remove('wrong', 'correct'));
    const correct = answer.dataset.answer === 'correct';
    answer.classList.add(correct ? 'correct' : 'wrong');
    feedback.classList.toggle('success', correct);
    feedback.textContent = correct ? 'Exactly. Comprehension is what makes speed count.' : 'Try again. Think about the reader above.';
  }));
});

// Reuse the owner's original stylized swing and pose data, loading frames on demand.
const swingURL = new URL('../../assets/golf/', scriptURL);
let swingData;
function getSwing() {
  if (window.SWING) return Promise.resolve(window.SWING);
  return swingData ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('swing.js', swingURL).href;
    script.onload = () => {
      if (window.SWING) resolve(window.SWING);
      else { script.remove(); swingData = undefined; reject(new Error('Swing data is missing.')); }
    };
    script.onerror = () => { script.remove(); swingData = undefined; reject(new Error('The swing study could not be loaded.')); };
    document.head.append(script);
  });
}
document.querySelectorAll('.golf-frame').forEach(frame => {
  const img = frame.querySelector('.swing-frame');
  const canvas = frame.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const button = frame.querySelector('.swing-play');
  const bones = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
  const nodes = [11,12,13,14,15,16,23,24,25,26,27,28];
  let data, index = 0, requested = !motion.matches, visible = false, timer, loaded = false;
  const images = [];
  function draw() {
    if (!data || !ctx) return;
    const w = frame.clientWidth, h = frame.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const scale = Math.max(w/data.w,h/data.h), dw = data.w*scale, dh = data.h*scale;
    const ox = (w-dw)/2, oy = (h-dh)/2;
    const kp = data.kp[index];
    const point = i => [ox+kp[i][0]*dw,oy+kp[i][1]*dh];
    ctx.strokeStyle = '#233f64'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    bones.forEach(([a,b]) => { ctx.beginPath();ctx.moveTo(...point(a));ctx.lineTo(...point(b));ctx.stroke(); });
    nodes.forEach((node,i) => { const p=point(node);ctx.beginPath();ctx.arc(...p,4.5,0,Math.PI*2);ctx.fillStyle=['#f0d39f','#b9cfff','#fff9e9'][i%3];ctx.fill();ctx.stroke(); });
    // Illustrative path through both wrists; no speed/angle accuracy is implied.
    ctx.beginPath();ctx.strokeStyle='#be6592';ctx.lineWidth=2.5;ctx.setLineDash([4,5]);
    for(let f=Math.max(0,index-8);f<=index;f++){
      const p=data.kp[f];const x=ox+(p[15][0]+p[16][0])/2*dw,y=oy+(p[15][1]+p[16][1])/2*dh;
      if(f===Math.max(0,index-8))ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();ctx.setLineDash([]);
  }
  async function load() {
    data = await getSwing();
    if (!loaded) {
      loaded = true;
      for(let i=0;i<data.frames;i++) {const image=new Image();image.src=new URL(`g${String(i).padStart(2,'0')}.webp`,swingURL);images.push(image);}
    }
    draw();
  }
  function tick() {
    clearTimeout(timer);
    if (!requested || !visible || document.hidden || !data) return;
    const next = images[index];
    if (next?.complete && next.naturalWidth) { img.src = next.src;draw();index=(index+1)%data.frames; }
    timer=setTimeout(tick,index===0?850:1000/data.fps);
  }
  function label() {
    button.setAttribute('aria-pressed',String(requested));
    button.innerHTML=requested?'Pause swing <span aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16M16 4v16"/></svg></span>':'Play swing <span aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 3 15 9-15 9Z"/></svg></span>';
  }
  button.addEventListener('click',async()=>{
    requested=!requested;label();
    if (requested) {
      try { await load(); } catch {requested=false;label();button.textContent='Couldn’t load swing. Try again.';return;}
    }
    tick();
  });
  new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(visible&&requested) load().then(tick).catch(()=>{requested=false;label();});
    else if(visible&&!data) getSwing().then(s=>{data=s;draw();}).catch(()=>{});
    tick();
  }).observe(frame);
  new ResizeObserver(draw).observe(frame);
  onVisibility(tick);
  motion.addEventListener('change',()=>{
    requested=!motion.matches;label();
    if(requested&&visible) load().then(tick).catch(()=>{requested=false;label();});
    tick();
  });
  label();
});

// The owner's original reel plays muted in view, with pause and reduced-motion support.
document.querySelectorAll('.reel-wrap').forEach(wrap => {
  const video = wrap.querySelector('video');
  const button = wrap.querySelector('button');
  let requested = !motion.matches, visible = false;
  function label() {
    button.setAttribute('aria-pressed',String(!video.paused));
    button.innerHTML=video.paused?'Play editing reel <span aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 3 15 9-15 9Z"/></svg></span>':'Pause editing reel <span aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16M16 4v16"/></svg></span>';
  }
  button.addEventListener('click',async()=>{
    if (!video.paused) {requested=false;video.pause();}
    else {
      requested=true;
      try { await video.play(); } catch { button.textContent='Couldn’t play reel. Try again.'; }
    }
  });
  video.addEventListener('play',label);video.addEventListener('pause',label);
  function sync() {
    if(requested&&visible&&!document.hidden) video.play().catch(label);
    else video.pause();
  }
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(wrap);
  onVisibility(sync);
  motion.addEventListener('change',()=>{requested=!motion.matches;sync();});
});

// Quiet, low-cost stars over the illustration. No continuous loop offscreen/hidden.
const ambientCanvases = [...document.querySelectorAll('.atmosphere')];
const ambientObservers = new Set();
ambientCanvases.forEach(canvas=>{
  const ctx=canvas.getContext('2d');if(!ctx)return;
  let visible=false,raf=0,last=0,time=0;
  const stars=Array.from({length:28},(_,i)=>({x:((i*73+19)%101)/101,y:((i*43+5)%79)/130,r:i%5===0?1.4:.7,phase:i*1.7}));
  function draw(now=0){
    raf=0;
    const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,1.5);
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
    ctx.clearRect(0,0,w,h);
    if(!ambientPaused)time=now*.0004;
    stars.forEach(star=>{ctx.globalAlpha=.2+(Math.sin(time+star.phase)+1)*.25;ctx.fillStyle='#ffe6bd';ctx.beginPath();ctx.arc(star.x*w,star.y*h,star.r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
    if(visible&&!ambientPaused&&!document.hidden)raf=requestAnimationFrame(loop);
  }
  function loop(now){if(now-last<42){raf=requestAnimationFrame(loop);return;}last=now;draw(now);}
  function update(){cancelAnimationFrame(raf);draw(last);}
  ambientObservers.add(update);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();}).observe(canvas);
  new ResizeObserver(update).observe(canvas);onVisibility(update);
});
const motionToggle=document.createElement('button');
motionToggle.type='button';motionToggle.className='motion-toggle';
document.querySelector('.footer-bottom>div')?.prepend(motionToggle);
function applyMotion(){
  document.body.classList.toggle('motion-paused',ambientPaused);
  motionToggle.textContent=ambientPaused?'Resume ambient motion':'Pause ambient motion';
  motionToggle.setAttribute('aria-pressed',String(ambientPaused));
  ambientObservers.forEach(update=>update());
  document.dispatchEvent(new CustomEvent('portfolio:motion',{detail:{paused:ambientPaused}}));
}
motionToggle.addEventListener('click',()=>{ambientPaused=!ambientPaused;applyMotion();});
motion.addEventListener('change',()=>{ambientPaused=motion.matches;applyMotion();});
applyMotion();
})();
