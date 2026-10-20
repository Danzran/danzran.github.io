/* v11 Cloud Sea: one fixed WebGL world behind the whole page (raw WebGL 1, no library).
   - The sky is a full-screen shader: blue hour at the top of the page (peach and gold where the sun went down,
     periwinkle above), deepening to a starry night further down, with a slowly turning star field, the Milky Way,
     a moon that rises as you read, and distant peaks standing out of the cloud sea. Below the horizon the same shader
     draws an endless cloud floor (fbm), fogged into the horizon colour.
   - On top of it, a few hundred soft billboard cloud puffs (Codex-painted luminance mattes, assets/gen/cloud-atlas.webp)
     float in 3-D. The camera glides forward over them all the time and rises (and lifts its gaze) as you scroll,
     so the page reads as one continuous flight from dusk into the night. The puffs drift with the wind, turn and morph
     between two painted shapes, and are rim-lit in screen space by the setting sun, the moon and the comet head.
   - Daniel's handstand stands on the cloud tops in the hero (a billboard sorted with the clouds, so puffs pass in
     front of his hands).
   API for the other scripts (no test hooks): window.SEA = { horizonY(scroll), comet(x, y, a), flash(x, y) }.
   Phones: fewer puffs, lower resolution. Hidden tab: paused. Reduced motion: time stands still, the frame only
   changes with the scroll position. No WebGL: the body's CSS gradient stays as a static sky. */
(() => {
const cv = document.getElementById('sky');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const base = window.V9_BASE || '';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
let W = 0, H = 0, docH = 1, narrow = false;
const state = { comet: [0, 0, 0], flash: [0, 0, 0, 0] };

// horizon height on screen (fraction of the viewport) as a function of scroll; the pitch is solved from it
function horizonFrac(s) {
  const v = s / (H || 1), p = docH > H ? clamp(s / (docH - H)) : 0;
  return lerp(lerp(narrow ? .64 : .63, .8, smooth(v / 2.6)), .9, smooth((p - .45) / .55));
}
window.SEA = {
  horizonY: s => horizonFrac(s) * H,
  comet(x, y, a) { state.comet = [x, y, a]; },
  flash(x, y) { state.flash = [x, y, 1, performance.now() / 1000]; }
};

const gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'default' });
if (!gl) { document.documentElement.classList.add('no-gl'); return; }

/* ---------------- shaders ---------------- */
const COMMON = `
precision highp float;
uniform float uTime, uNight, uCamY, uTravel, uRot;
uniform vec3 uSun, uMoon;
float hash(vec3 p) { p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float a = .5, s = 0.; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
// the sky's own colour in a direction (also the fog colour of everything below the horizon)
vec3 skyCol(vec3 d) {
  float e = max(d.y, 0.);
  vec2 hz = normalize(d.xz + 1e-5), sz = normalize(uSun.xz + 1e-5);
  float s = max(dot(hz, sz), 0.), s3 = s * s * s;
  vec3 hor = mix(vec3(.62, .54, .82), vec3(1., .72, .58), s3);
  vec3 b = mix(hor, vec3(.30, .34, .68), smoothstep(0., .2, e));
  b = mix(b, vec3(.08, .11, .31), smoothstep(.16, .75, e));
  b += vec3(1., .6, .42) * pow(s, 10.) * exp(-e * 12.) * .55;
  vec3 nh = vec3(.13, .13, .31) + vec3(.12, .07, .12) * s3 * (1. - uNight * .6);
  vec3 n = mix(nh, vec3(.04, .055, .15), smoothstep(0., .25, e));
  n = mix(n, vec3(.012, .018, .058), smoothstep(.2, .8, e));
  return mix(b, n, uNight);
}
vec3 horizonCol(vec3 d) { return skyCol(normalize(vec3(d.x, 0., d.z))); }
// fog over distance, fully the horizon colour by the far end of the cloud field
float fogK(float dist) { return 1. - exp(-dist * mix(.05, .032, uNight)); }
// cloud palette: body (lit side), shadow (underside), rim colours
vec3 cloudBody() { return mix(vec3(.62, .58, .86), vec3(.17, .19, .40), uNight); }
vec3 cloudShadow() { return mix(vec3(.30, .30, .62), vec3(.05, .06, .16), uNight); }
`;

const SKY_VS = `attribute vec2 aP; varying vec2 vN; void main() { vN = aP; gl_Position = vec4(aP, 0., 1.); }`;
const SKY_FS = COMMON + `
uniform vec3 uR, uU, uF; uniform vec2 uTan, uRes; uniform sampler2D uPeaks; uniform float uPeaksOn;
uniform vec4 uFlash; uniform vec3 uCometL;
varying vec2 vN;
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }
float starLayer(vec3 d, float scale, float keep, float px) {
  vec3 p = d * scale, c = floor(p), f = fract(p) - .5;
  float h = hash(c); if (h > keep) return 0.;
  vec3 o = (vec3(hash(c + 7.1), hash(c + 3.3), hash(c + 5.7)) - .5) * .55;
  float r = length(f - o) / (px * scale);
  float tw = .55 + .45 * sin(uTime * (1.3 + 3. * hash(c + 1.9)) + h * 60.);
  float big = pow(hash(c + 9.2), 6.);
  return (exp(-r * r * 1.6) * (.35 + 1.4 * big)) * tw;
}
void main() {
  vec3 d = normalize(uF + uR * vN.x * uTan.x + uU * vN.y * uTan.y);
  float px = 2. * uTan.y / uRes.y;                    // one pixel, in radians
  vec3 col = skyCol(d);
  if (d.y > -.02) {
    // the turning star field (rotates about a tilted pole)
    vec3 sd = rotX(.55) * rotY(uRot) * rotX(-.55) * d;
    float above = smoothstep(-.01, .08, d.y);
    float vis = above * mix(.18 * smoothstep(.15, .6, d.y), 1., smoothstep(.05, .6, uNight));
    // Milky Way: a soft band of lilac and rose cloud with dark dust lanes
    vec3 nm = normalize(vec3(.42, .5, -.76));
    float bd = dot(sd, nm), band = exp(-bd * bd / .045);
    float mwN = fbm(sd * 3.2 + 4.), dust = fbm(sd * 7.5 + 11.);
    float mw = band * (.35 + .9 * mwN) * (1. - .65 * smoothstep(.48, .72, dust) * band);
    vec3 mwc = mix(vec3(.55, .5, .95), vec3(1., .75, .82), smoothstep(.4, .8, mwN)) * mw;
    col += mwc * .32 * vis * smoothstep(.2, .9, uNight);
    float st = starLayer(sd, 150., .18, px) + starLayer(sd, 300., .06 + .4 * band, px) * .45 + starLayer(sd, 64., .14, px) * 1.3;
    col += vec3(1., .95, .86) * st * vis;
    // the moon: a soft ivory disc, faint maria, a wide halo
    // the moon: a waxing gibbous lit from the lower left, faint maria, earthshine on the dark side, a wide halo
    float ma = acos(clamp(dot(d, uMoon), -1., 1.)), MR = .019;
    vec3 mr = normalize(cross(uMoon, vec3(0., 1., 0.))), mu = cross(mr, uMoon);
    vec2 mp = vec2(dot(d - uMoon, mr), dot(d - uMoon, mu)) / MR;
    float disc = smoothstep(1.04, .96, length(mp));
    vec3 mn = vec3(mp, sqrt(max(0., 1. - dot(mp, mp))));
    float lit = smoothstep(-.08, .22, dot(mn, normalize(vec3(-.75, -.3, .6))));
    float maria = smoothstep(.45, .7, fbm(vec3(mp * 2.2, 3.))) * .22;
    vec3 moonC = vec3(1., .95, .86) * (1. - maria) * lit + vec3(.1, .11, .2) * (1. - lit);
    col = mix(col, moonC, disc * uNight * above);
    col += vec3(.78, .78, 1.) * (exp(-ma * 10.) * .12 + exp(-ma * 45.) * .16) * uNight * above;
    // far peaks above the cloud sea, painted silhouettes (luminance matte) tinted into the haze
    if (uPeaksOn > .5) {
      float az = atan(d.x, -d.z);
      vec2 uv = vec2((az + .78) / 1.15, (d.y + .05) / .17);
      if (uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.) {
        vec4 pk = texture2D(uPeaks, uv);
        float m = smoothstep(.05, .35, pk.r);
        vec3 pc = mix(vec3(.36, .34, .62), vec3(.07, .08, .19), uNight);
        float rim = smoothstep(.55, 1., pk.r);
        pc += rim * mix(vec3(.55, .32, .3), vec3(.16, .17, .3), uNight);
        pc = mix(pc, horizonCol(d), .3 + .35 * (1. - smoothstep(0., .1, d.y)));
        col = mix(col, pc, m);
      }
    }
  }
  if (d.y < 0.) {
    // the endless cloud floor under the puffs
    float t = (uCamY + .25) / max(-d.y, 1e-3);
    vec2 q = d.xz * t; q.y -= uTravel;
    vec3 P = vec3(q * .33, uTime * .015);
    vec3 w = vec3(fbm(P + vec3(3.1, 7.7, 0.)), fbm(P + vec3(9.2, 1.3, 0.)), 0.);
    float h = fbm(P + w * 1.3);
    vec2 lz = normalize(uSun.xz + 1e-4) * (1. - uNight) + normalize(uMoon.xz + 1e-4) * uNight;
    float h2 = fbm(P + w * 1.3 + vec3(lz * .18, 0.));
    float dens = smoothstep(.32, .72, h);
    vec3 c = mix(cloudShadow(), cloudBody(), dens);
    float rim = clamp((h - h2) * 7., 0., 1.);
    vec3 rimc = mix(vec3(1., .74, .58), vec3(.72, .76, 1.), uNight);
    c += rimc * rim * .5 * smoothstep(.2, .6, h);
    // the flash where the comet's fragment falls into the sea
    vec2 fn = vN - uFlash.xy; float fl = uFlash.z * exp(-dot(fn, fn) * 5.);
    c += vec3(.75, .62, 1.) * fl * .8;
    // the comet head lights the cloud tops nearest below it
    vec2 cn = vN - uCometL.xy; c += vec3(1., .82, .55) * uCometL.z * exp(-dot(cn, cn) * 2.2) * .35 * dens;
    float f = clamp(fogK(t) + smoothstep(-.06, 0., d.y), 0., 1.);
    col = mix(c, horizonCol(d), f);
  }
  // a whisper of film grain so the gradients never band
  col += (hash(vec3(gl_FragCoord.xy, uTime)) - .5) / 128.;
  gl_FragColor = vec4(col, 1.);
}`;

const SPR_VS = `
precision highp float;
attribute vec3 aC; attribute vec2 aO; attribute vec4 aS; attribute vec3 aT;
uniform vec3 uR, uU, uF; uniform vec2 uTan; uniform float uCamY, uAspect;
varying vec2 vUv; varying vec3 vT; varying vec4 vS; varying vec3 vDir; varying vec2 vC; varying float vDist;
void main() {
  vec3 rel = aC - vec3(0., uCamY, 0.);
  float c = cos(aS.y), s = sin(aS.y);
  vec2 a0 = aO * vec2(aT.z, 1.);
  vec2 o = vec2(c * a0.x - s * a0.y, s * a0.x + c * a0.y) * aS.x;
  vec3 w = rel + uR * o.x + uU * o.y;
  vec3 v = vec3(dot(w, uR), dot(w, uU), dot(w, uF));
  vec3 vc = vec3(dot(rel, uR), dot(rel, uU), dot(rel, uF));
  vUv = aO + .5; vT = aT; vS = aS; vDir = normalize(w); vDist = vc.z;
  vC = vec2(vc.x / (vc.z * uTan.x), vc.y / (vc.z * uTan.y));
  gl_Position = vec4(v.x / uTan.x, v.y / uTan.y, 0., v.z);
}`;
const SPR_FS = COMMON + `
uniform sampler2D uAtlas, uFig; uniform float uAspect, uFigMode;
uniform vec3 uSunL, uMoonL, uCometL; uniform vec4 uFlash;
varying vec2 vUv; varying vec3 vT; varying vec4 vS; varying vec3 vDir; varying vec2 vC; varying float vDist;
vec2 cellUV(float cell, vec2 uv) { uv = clamp(uv, .01, .99); return (vec2(mod(cell, 4.), floor(cell / 4.)) + uv) / vec2(4., 2.); }
float dens(vec2 uv) { return mix(texture2D(uAtlas, cellUV(vT.x, uv)).r, texture2D(uAtlas, cellUV(vT.y, uv)).r, vS.z); }
vec2 toLocal(vec2 v) { float c = cos(-vS.y), s = sin(-vS.y); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
vec2 ldir(vec3 L) { vec2 d = (L.xy - vC) * vec2(uAspect, 1.); return toLocal(d / (length(d) + 1e-4)); }
void main() {
  if (uFigMode > .5) {
    // Daniel: the painted cut-out, cooled into the blue hour, rim-lit by the comet and the afterglow
    vec4 t = texture2D(uFig, vUv);
    if (t.a < .01) discard;
    vec2 lc = ldir(uCometL), ls = ldir(uSunL);
    float ac = texture2D(uFig, vUv + lc * .007).a, as = texture2D(uFig, vUv + ls * .007).a;
    vec3 c = t.rgb;
    c *= mix(vec3(.56, .52, .82), vec3(.36, .38, .66), uNight);
    c += vec3(1., .82, .55) * clamp((t.a - ac) * 2., 0., 1.) * (.2 + .5 * uCometL.z);
    c += vec3(1., .66, .55) * clamp((t.a - as) * 2., 0., 1.) * .5 * (1. - uNight);
    float a = t.a * vS.w;
    gl_FragColor = vec4(c * a, a);
    return;
  }
  float d0 = dens(vUv);
  float a = smoothstep(.05, .5, d0) * vS.w;
  if (a < .004) discard;
  vec2 ls = ldir(uSunL), lm = ldir(uMoonL), lc = ldir(uCometL);
  float rs = clamp((d0 - dens(vUv + ls * .05)) * 3.2, 0., 1.);
  float rm = clamp((d0 - dens(vUv + lm * .05)) * 3.2, 0., 1.);
  float rc = clamp((d0 - dens(vUv + lc * .05)) * 3.2, 0., 1.);
  float top = clamp(vUv.y * 1.1 - .15 + (d0 - .5) * .6, 0., 1.);
  vec3 c = mix(cloudShadow(), cloudBody(), top) * (.72 + .4 * d0);
  float sunUp = 1. - uNight;
  c += vec3(1., .7, .55) * rs * .75 * sunUp * (.4 + .6 * top);
  c += vec3(.74, .78, 1.) * rm * .55 * uNight * (.4 + .6 * top);
  vec2 cd = (uCometL.xy - vC) * vec2(uAspect, 1.);
  c += vec3(1., .84, .56) * rc * uCometL.z * exp(-dot(cd, cd) * 1.4) * 1.1;
  // inner glow where the comet fragment fell in
  vec2 fd = (uFlash.xy - vC) * vec2(uAspect, 1.);
  c += vec3(.78, .64, 1.) * uFlash.z * exp(-dot(fd, fd) * 6.) * (.5 + .8 * (1. - d0));
  c = mix(c, horizonCol(vDir), clamp(fogK(vDist), 0., 1.));
  gl_FragColor = vec4(c * a, a);
}`;

function compile(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
function program(vs, fs) {
  const p = gl.createProgram(); gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
  return { p, u };
}
let SKY, SPR;
try { SKY = program(SKY_VS, SKY_FS); SPR = program(SPR_VS, SPR_FS); }
catch (e) { console.warn('cloud sea shader:', e.message); document.documentElement.classList.add('no-gl'); return; }

const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

/* ---------------- textures ---------------- */
function texture(src, onload, mips) {
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
  const im = new Image();
  im.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    const pot = !(im.width & (im.width - 1)) && !(im.height & (im.height - 1));
    if (mips && pot) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    onload && onload(im); dirty = true;
  };
  im.src = src;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}
let atlasOn = false, peaksOn = 0, figAspect = .68, dirty = true;
// data URIs from assets/textures.js (file:// images would count as cross-origin for WebGL); plain paths over http
const TEX = window.SEA_TEX || {};
const atlas = texture(TEX.atlas || base + 'assets/gen/cloud-atlas.webp', () => { atlasOn = true; }, true);
const peaks = texture(TEX.peaks || base + 'assets/gen/peaks.webp', () => { peaksOn = 1; });
const fig = texture(TEX.fig || base + 'assets/gen/figure.webp', im => { figAspect = im.width / im.height; }, false);

/* ---------------- the cloud field ---------------- */
// puffs live in a box ahead of the camera: x across, z0 along the flight (wrapped), y around the cloud-top plane
const DEPTH = 46, NEAR = .7;
let puffs = [], N = 0;
const rnd = (() => { let s = 1234567; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
function makePuffs() {
  const n = narrow ? 170 : 330, XS = narrow ? 16 : 34;
  puffs = [];
  for (let i = 0; i < n; i++) {
    const z0 = rnd() * DEPTH, xr = (rnd() * 2 - 1);
    puffs.push({ x: xr * XS * (.35 + .65 * Math.sqrt(z0 / DEPTH)), z0, y: -.55 + rnd() * .45, s: 1.5 + rnd() * 2.2 + z0 / DEPTH * 2.2,
      rot: (rnd() - .5) * .5, a: Math.floor(rnd() * 8), b: Math.floor(rnd() * 8), seed: rnd() * 100, XS });
  }
  // a few puffs that ride along with Daniel and hold him up
  N = n;
}
const FIG_PUFFS = [[-.5, -.12, -.3, 1.2, 1], [.55, -.15, -.2, 1.3, 4], [-.05, -.45, .55, 1.7, 2], [.12, -.2, -.65, 1.35, 6], [-.3, -.55, -1.1, 1.6, 3]];
const MAXQ = 420;
const vdata = new Float32Array(MAXQ * 4 * 12), vbuf = gl.createBuffer(), ibuf = gl.createBuffer();
{ const idx = new Uint16Array(MAXQ * 6); for (let i = 0; i < MAXQ; i++) idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW); }
gl.bindBuffer(gl.ARRAY_BUFFER, vbuf); gl.bufferData(gl.ARRAY_BUFFER, vdata.byteLength, gl.DYNAMIC_DRAW);
const CORNERS = [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]];
function putQuad(q, x, y, z, size, rot, morph, alpha, a, b, stretch = 1) {
  let o = q * 48;
  for (const [cx, cy] of CORNERS) { vdata.set([x, y, z, cx, cy, size, rot, morph, alpha, a, b, stretch], o); o += 12; }
}

/* ---------------- camera ---------------- */
let scale = 1, frames = 0, slow = 0, pointerX = 0;
function resize() {
  W = innerWidth; H = innerHeight; docH = document.documentElement.scrollHeight;
  const was = narrow; narrow = W <= 820;
  if (!puffs.length || was !== narrow) makePuffs();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const target = (narrow ? .62 : .72) * Math.min(dpr, 1.25) * scale;
  cv.width = Math.max(64, Math.round(W * target)); cv.height = Math.max(64, Math.round(H * target));
  dirty = true;
}
addEventListener('resize', resize);
addEventListener('load', () => { docH = document.documentElement.scrollHeight; dirty = true; });
if (!reduce && matchMedia('(pointer: fine)').matches) addEventListener('pointermove', e => { pointerX = e.clientX / innerWidth - .5; }, { passive: true });
new ResizeObserver(() => { docH = document.documentElement.scrollHeight; dirty = true; }).observe(document.body);

function camera(scroll, t) {
  const v = scroll / H, p = docH > H ? clamp(scroll / (docH - H)) : 0;
  const vfov = (narrow ? 66 : 52) * Math.PI / 180, tanY = Math.tan(vfov / 2), tanX = tanY * W / H;
  const hf = horizonFrac(scroll);
  const pitch = Math.atan((hf - .5) * 2 * tanY);
  const yaw = .045 * Math.sin(t * .021) + pointerYaw;
  const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw);
  const F = [sy * cp, sp, -cy * cp], R = [cy, 0, sy], U = [-sy * sp, cp, cy * sp];
  return { F, R, U, tanX, tanY, v, p,
    camY: .6 + 1.5 * smooth(v / 3) + 1.1 * p,
    travel: t * .3 + v * 2.4,
    night: smooth((v - .35) / 3.4),
    rot: t * .006 + p * 1.1 };
}
let pointerYaw = 0;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const ndcOf = (C, d) => { const z = dot(d, C.F); return z <= .01 ? [9, 9] : [dot(d, C.R) / z / C.tanX, dot(d, C.U) / z / C.tanY]; };
function dirFrom(az, el) { return [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)]; }

/* ---------------- frame ---------------- */
let prevS = -1, lastT = 0, t0 = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden) return;
  const scroll = scrollY;
  if (reduce && !dirty && scroll === prevS) return;
  prevS = scroll; dirty = false;
  const t = reduce ? 40 : (now - t0) / 1000 + 40;
  // adaptive resolution: if frames are slow for a while, render fewer pixels
  if (!reduce && lastT) { const dt = now - lastT; frames++; if (dt > 38) slow++; if (frames >= 45) { if (slow > 30 && scale > .5) { scale *= .85; resize(); } frames = slow = 0; } }
  lastT = now;
  pointerYaw += (pointerX * .05 - pointerYaw) * .03;
  const C = camera(scroll, t);
  const sun = dirFrom(-.42, lerp(-.035, -.22, smooth(C.v / 3)));
  const moon = dirFrom(.55 - C.p * .25, lerp(.05, .5, smooth(C.p * 1.5)) + (C.v < 1 ? 0 : 0));
  gl.viewport(0, 0, cv.width, cv.height);
  gl.disable(gl.DEPTH_TEST);

  // flash decays
  const fa = state.flash[2] ? Math.exp(-(now / 1000 - state.flash[3]) * 1.6) : 0;
  const flash = [state.flash[0] / W * 2 - 1, 1 - state.flash[1] / H * 2, fa < .01 ? 0 : fa, 0];
  const cometL = [state.comet[0] / W * 2 - 1, 1 - state.comet[1] / H * 2, state.comet[2]];

  // sky
  gl.useProgram(SKY.p); const su = SKY.u;
  gl.uniform3fv(su.uR, C.R); gl.uniform3fv(su.uU, C.U); gl.uniform3fv(su.uF, C.F); gl.uniform2f(su.uTan, C.tanX, C.tanY); gl.uniform2f(su.uRes, cv.width, cv.height);
  gl.uniform1f(su.uTime, t); gl.uniform1f(su.uNight, C.night); gl.uniform1f(su.uCamY, C.camY); gl.uniform1f(su.uTravel, C.travel); gl.uniform1f(su.uRot, C.rot);
  gl.uniform3fv(su.uSun, sun); gl.uniform3fv(su.uMoon, moon); gl.uniform1f(su.uPeaksOn, peaksOn); gl.uniform4fv(su.uFlash, flash); gl.uniform3fv(su.uCometL, cometL);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, peaks); gl.uniform1i(su.uPeaks, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  const aP = gl.getAttribLocation(SKY.p, 'aP'); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.disableVertexAttribArray(aP);
  if (!atlasOn) return;

  // puffs: position, cull, sort far to near
  const list = [], lim = Math.max(C.tanX, .4) * 1.25;
  const figOn = clamp(1 - (scroll - H * .9) / (H * .6));
  const fx = narrow ? .2 : 1.35, fz = narrow ? 3.9 : 4.6, fy = 0;
  for (const q of puffs) {
    const dist = NEAR + (((q.z0 - C.travel) % DEPTH) + DEPTH) % DEPTH;
    let x = q.x + (reduce ? 0 : t * .05 + Math.sin(t * .03 + q.seed) * .3); x = ((x + q.XS) % (2 * q.XS) + 2 * q.XS) % (2 * q.XS) - q.XS;
    const sz = q.s * (1 + .06 * Math.sin(t * .11 + q.seed));
    if (Math.abs(x) - sz > dist * lim + 1) continue;
    // camera-relative position (the camera is at x = 0, y = camY, z = 0, looking down -z)
    let alpha = smooth((dist - NEAR) / 1.8) * (1 - smooth((dist - DEPTH * .86) / (DEPTH * .14)));
    // keep the passing puffs from swallowing Daniel in the hero
    if (figOn > 0 && dist < fz && Math.abs(x - fx) < sz * .5 + .55) alpha *= lerp(1, .1, figOn);
    if (alpha < .01) continue;
    const m = .5 + .5 * Math.sin(t * .045 + q.seed * 3);
    list.push({ d: dist, x, y: q.y, z: -dist, s: sz, rot: q.rot + .12 * Math.sin(t * .02 + q.seed), m, al: alpha, a: q.a, b: q.b });
  }
  if (figOn > .01) {
    for (const [dx, dy, dz, s, a] of FIG_PUFFS) list.push({ d: fz + dz, x: fx + dx, y: fy + dy, z: -(fz + dz), s, rot: .1 * Math.sin(t * .05 + a), m: .5 + .5 * Math.sin(t * .06 + a), al: figOn, a, b: (a + 3) % 8 });
    list.push({ fig: true, d: fz, al: figOn });
  }
  list.sort((a, b) => b.d - a.d);
  let q = 0, figAt = -1;
  for (const it of list) {
    if (q >= MAXQ) break;
    if (it.fig) { figAt = q; const hgt = narrow ? 1.35 : 1.62, wid = hgt * figAspect; putQuad(q++, fx, fy + hgt * .5 - .06, -fz, hgt, 0, 0, it.al, 0, 0, wid / hgt); continue; }
    putQuad(q++, it.x, it.y, it.z, it.s, it.rot, it.m, it.al, it.a, it.b);
  }
  gl.useProgram(SPR.p); const u = SPR.u;
  gl.uniform3fv(u.uR, C.R); gl.uniform3fv(u.uU, C.U); gl.uniform3fv(u.uF, C.F); gl.uniform2f(u.uTan, C.tanX, C.tanY);
  gl.uniform1f(u.uCamY, C.camY); gl.uniform1f(u.uAspect, W / H); gl.uniform1f(u.uTime, t); gl.uniform1f(u.uNight, C.night);
  gl.uniform3fv(u.uSun, sun); gl.uniform3fv(u.uMoon, moon);
  const sN = ndcOf(C, sun), mN = ndcOf(C, moon);
  gl.uniform3f(u.uSunL, sN[0], sN[1], 1); gl.uniform3f(u.uMoonL, mN[0], mN[1], 1); gl.uniform3fv(u.uCometL, cometL); gl.uniform4fv(u.uFlash, flash);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, atlas); gl.uniform1i(u.uAtlas, 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fig); gl.uniform1i(u.uFig, 1);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, vdata.subarray(0, q * 48));
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
  const L = n => gl.getAttribLocation(SPR.p, n), S = 48;
  [['aC', 3, 0], ['aO', 2, 12], ['aS', 4, 20], ['aT', 3, 36]].forEach(([n, k, off]) => { const l = L(n); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, k, gl.FLOAT, false, S, off); });
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const draw = (from, to, figMode) => { if (to <= from) return; gl.uniform1f(u.uFigMode, figMode); gl.drawElements(gl.TRIANGLES, (to - from) * 6, gl.UNSIGNED_SHORT, from * 12); };
  if (figAt < 0) draw(0, q, 0);
  else { draw(0, figAt, 0); draw(figAt, figAt + 1, 1); draw(figAt + 1, q, 0); }
  gl.disable(gl.BLEND);
}

cv.addEventListener('webglcontextlost', e => { e.preventDefault(); document.documentElement.classList.add('no-gl'); });
resize();
requestAnimationFrame(frame);
})();
