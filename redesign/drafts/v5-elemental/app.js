(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(devicePixelRatio || 1, 1.75);
const journey = document.getElementById('journey'), world = document.getElementById('world');
const figEl = document.getElementById('fig');
let onTwos = false;                       // cadence toggle: smooth vs. 12 fps
const clock = () => { const t = performance.now() / 1000; return onTwos ? Math.floor(t * 12) / 12 : t; };
const btn = document.getElementById('cadence');
btn.onclick = () => { onTwos = !onTwos; btn.textContent = 'water: ' + (onTwos ? 'on twos' : 'smooth'); btn.setAttribute('aria-pressed', onTwos); };

/* ---------- lettering ---------- */
document.querySelectorAll('[data-brush]').forEach((el, i) => Lettering.render(el, { seed: 5 + i * 37 }));
if (!reduce) Lettering.start(6);

/* ---------- figure: replacement drawings on threes ---------- */
const figs = [...figEl.querySelectorAll('img')]; let fk = 0;
if (!reduce) setInterval(() => { figs[fk].classList.remove('on'); fk = (fk + 1 + (Math.random() * 2 | 0)) % figs.length; figs[fk].classList.add('on'); }, 125);

/* ---------- layout: figure stands on the water, centred under the title ---------- */
function layout() {
  const H = journey.clientHeight, W = journey.clientWidth;
  const h = Math.min(H * .6, W * .9), w = h * 2 / 3;
  Object.assign(figEl.style, { height: h + 'px', width: w + 'px', left: (W - w) / 2 + 'px', top: (H - h - H * .03) + 'px' });
}
layout(); addEventListener('resize', layout);
const figBox = () => ({ x: figEl.offsetLeft, y: figEl.offsetTop, w: figEl.offsetWidth, h: figEl.offsetHeight });

/* ---------- WebGL: painting + flow map -> flowing water ---------- */
const sc = document.getElementById('scene');
const gl = sc.getContext('webgl', { premultipliedAlpha: false });
const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; v.y = 1. - v.y; gl_Position = vec4(p, 0, 1); }`;
const FS = `precision mediump float;
varying vec2 v; uniform sampler2D img, flow; uniform float t, aspect, imgAspect; uniform vec2 mouse; uniform float mouseAmt;
vec2 cover(vec2 uv){ vec2 s = aspect > imgAspect ? vec2(1., imgAspect / aspect) : vec2(aspect / imgAspect, 1.); return (uv - .5) * s + .5; }
void main(){
  vec2 uv = cover(v);
  vec3 f = texture2D(flow, uv).rgb;
  vec2 dir = (f.rg * 2. - 1.) * f.b;
  // the cursor stirs a little eddy
  vec2 d = uv - mouse; float fall = exp(-dot(d * vec2(aspect, 1.), d * vec2(aspect, 1.)) * 40.) * mouseAmt;
  dir += vec2(-d.y, d.x) * 6. * fall;
  float speed = .12, amp = .022;
  float p0 = fract(t * speed), p1 = fract(t * speed + .5);
  vec4 c0 = texture2D(img, uv - dir * p0 * amp), c1 = texture2D(img, uv - dir * p1 * amp);
  float wgt = abs((.5 - p0) / .5);
  vec4 c = mix(c0, c1, wgt);
  // soft shimmer on the water highlights
  c.rgb += f.b * .04 * sin(t * 2. + uv.x * 40. + uv.y * 20.);
  gl_FragColor = c;
}`;
function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; }
const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const U = n => gl.getUniformLocation(prog, n);
function texture(src, unit, cb) {
  const im = new Image(); im.onload = () => {
    const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    cb && cb(im);
  }; im.src = src;
}
let imgAspect = 16 / 9, ready = 0;
texture(window.SCENE_SRC, 0, im => { imgAspect = im.width / im.height; ready++; });
texture(window.FLOW_SRC, 1, () => ready++);
gl.uniform1i(U('img'), 0); gl.uniform1i(U('flow'), 1);
function fitGL() { sc.width = journey.clientWidth * DPR; sc.height = journey.clientHeight * DPR; gl.viewport(0, 0, sc.width, sc.height); }
fitGL(); addEventListener('resize', fitGL);
const mouse = { x: .5, y: .5, amt: 0, px: 0, py: 0, trail: [] };
addEventListener('pointermove', e => {
  const r = journey.getBoundingClientRect();
  const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
  mouse.amt = Math.min(1, mouse.amt + Math.hypot(e.clientX - mouse.px, e.clientY - mouse.py) / 120);
  mouse.px = e.clientX; mouse.py = e.clientY; mouse.x = nx; mouse.y = ny;
  mouse.trail.push({ x: e.clientX - r.left, y: e.clientY - r.top, life: 1 });
}, { passive: true });

/* ---------- ribbons ---------- */
const back = document.getElementById('ribbonBack'), front = document.getElementById('ribbonFront'), trail = document.getElementById('trail');
const ctxs = [back, front, trail].map(c => c.getContext('2d'));
function fit2d() { [back, front, trail].forEach((c, i) => { c.width = journey.clientWidth * DPR; c.height = journey.clientHeight * DPR; ctxs[i].setTransform(DPR, 0, 0, DPR, 0, 0); }); }
fit2d(); addEventListener('resize', fit2d);
// a spiral that wraps the upside-down figure: (u, v) in figure-box units, z = in front (+) / behind (-)
const SPIRAL = [[-1.9, 1.05, 1], [-.55, .93, 1], [.55, .85, 1], [1.1, .75, -1], [.45, .65, -1], [-.25, .57, -1], [-.4, .46, 1], [.4, .36, 1], [1.3, .22, 1], [2.5, .04, 1]];
const SECOND = [[2.2, .98, 1], [1.1, .9, 1], [.25, .8, -1], [-.5, .7, -1], [-1.0, .55, 1], [-.6, .4, 1], [.1, .3, -1], [.9, .2, -1], [1.6, .08, 1]];
function spiralPts(t, path = SPIRAL, ph = 0) {
  const b = figBox();
  return path.map(([u, v, z], i) => ({ x: b.x + b.w * (u + Math.sin(t * .7 + i * 1.3 + ph) * .05), y: b.y + b.h * (v + Math.cos(t * .6 + i) * .015), z }));
}

/* ---------- main loop ---------- */
let last = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const t = reduce ? 0 : clock();
  const drawing = Math.floor(now / (1000 / 12));          // drawn details always change on twos
  // scene
  if (ready === 2) {
    gl.uniform1f(U('t'), t); gl.uniform1f(U('aspect'), sc.width / sc.height); gl.uniform1f(U('imgAspect'), imgAspect);
    gl.uniform2f(U('mouse'), mouse.x, mouse.y); gl.uniform1f(U('mouseAmt'), mouse.amt);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  mouse.amt *= .96;
  // ribbon around the figure
  const W = journey.clientWidth, H = journey.clientHeight, b = figBox();
  ctxs[0].clearRect(0, 0, W, H); ctxs[1].clearRect(0, 0, W, H); ctxs[2].clearRect(0, 0, W, H);
  const pts = spiralPts(t), pts2 = spiralPts(t, SECOND, 2), width = b.h * .036;
  Water.setSeed(drawing + 3); Water.draw(ctxs[0], pts2, { width: width * .5, t: t * 1.2, side: -1, drawn: 1, alpha: .6 });
  Water.setSeed(drawing); Water.draw(ctxs[0], pts, { width, t, side: -1, drawn: 1, alpha: .82 });
  Water.setSeed(drawing + 3); Water.draw(ctxs[1], pts2, { width: width * .5, t: t * 1.2, side: 1, drawn: 1, alpha: .7 });
  Water.setSeed(drawing); Water.draw(ctxs[1], pts, { width, t, side: 1, drawn: 1, alpha: .92 });
  // cursor trail ribbon
  mouse.trail.forEach(p => p.life -= .028); mouse.trail = mouse.trail.filter(p => p.life > 0).slice(-26);
  if (mouse.trail.length > 4) {
    const tp = mouse.trail.filter((_, i) => i % 2 === 0 || i === mouse.trail.length - 1).map(p => ({ x: p.x, y: p.y, z: 1 }));
    Water.setSeed(drawing + 7); Water.draw(ctxs[2], tp, { width: 16, t, side: 0, drawn: 1, alpha: Math.min(1, mouse.trail.length / 14) });
  }
}
requestAnimationFrame(frame);

/* ---------- golf + song ---------- */
document.fonts.ready.then(() => GolfSwing.mount(document.getElementById('golf'), document.getElementById('golfStats'), 'assets/golf'));
const song = document.getElementById('song'), audio = document.getElementById('audio');
song.addEventListener('click', () => { const on = audio.paused; on ? audio.play() : audio.pause(); song.classList.toggle('playing', on); song.setAttribute('aria-pressed', on); });

if (reduce) return;

/* ---------- smooth scroll + camera path along the body ---------- */
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: .08 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 }); }));

const cam = { fx: 0, fy: 0, s: 1 };
function applyCam() {
  const W = journey.clientWidth, H = journey.clientHeight, s = cam.s;
  const fx = Math.min(W - W / (2 * s), Math.max(W / (2 * s), cam.fx)), fy = Math.min(H - H / (2 * s), Math.max(H / (2 * s), cam.fy));
  world.style.transform = `translate(${W / 2 - fx * s}px, ${H / 2 - fy * s}px) scale(${s})`;
}
function focus(u, v) { const b = figBox(); return { fx: b.x + b.w * u, fy: b.y + b.h * v }; }
function resetCam() { cam.fx = journey.clientWidth / 2; cam.fy = journey.clientHeight / 2; cam.s = 1; applyCam(); }
resetCam();
const stops = [...document.querySelectorAll('.stop')];
const tl = gsap.timeline({ scrollTrigger: { trigger: journey, start: 'top top', end: '+=420%', pin: true, scrub: 1, invalidateOnRefresh: true }, onUpdate: applyCam });
tl.to('#title', { autoAlpha: 0, y: -60, duration: .5 }, 0)
  .to(cam, { ...focus(.5, .93), s: 2.3, duration: 1, ease: 'power2.inOut', onUpdate: applyCam }, 0)       // hands
  .to(stops[0], { autoAlpha: 1, y: 0, duration: .4 }, .7).to(stops[0], { autoAlpha: 0, duration: .3 }, 1.6)
  .to(cam, { ...focus(.45, .55), s: 2, duration: 1, ease: 'power2.inOut', onUpdate: applyCam }, 1.6)    // torso
  .to(stops[1], { autoAlpha: 1, duration: .4 }, 2.3).to(stops[1], { autoAlpha: 0, duration: .3 }, 3.2)
  .to(cam, { ...focus(.5, .08), s: 2.2, duration: 1, ease: 'power2.inOut', onUpdate: applyCam }, 3.2)   // feet
  .to(stops[2], { autoAlpha: 1, duration: .4 }, 3.9).to(stops[2], { autoAlpha: 0, duration: .3 }, 4.9)
  .to(cam, { fx: () => journey.clientWidth / 2, fy: () => journey.clientHeight / 2, s: 1, duration: 1, ease: 'power2.inOut', onUpdate: applyCam }, 4.9);
gsap.set(stops, { y: 20 });
addEventListener('resize', () => { layout(); ScrollTrigger.refresh(); });
gsap.from('.title h1 .lt-letter', { y: 50, opacity: 0, duration: 1.4, ease: 'power3.out', stagger: .05, delay: .2 });
gsap.from('.title p, .title .cta', { y: 20, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: .15, delay: .9 });
gsap.utils.toArray('.doc h2, .golf, .golf-copy > *, .contact > *').forEach(el => gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
})();
