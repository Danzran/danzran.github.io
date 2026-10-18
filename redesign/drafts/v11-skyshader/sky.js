/* v11 Skyshader: one living sky behind the whole page, drawn by a single WebGL fragment shader on #sky.
   - Camera: a pinhole camera standing on a lake shore. Scrolling tilts it up (the horizon, the lake, the far town and
     the rock Daniel stands on sink out of the bottom of the hero), then keeps easing toward the zenith all page long.
   - Time of day follows page progress: magic hour on the hero, dusk through Now/Work, night by Experience, deep
     starry night at Contact. The sun sets behind the figure; the moon takes over the cloud lighting.
   - Clouds: two layers on planes above the camera (cumulus from a Codex-painted tile, cirrus from a second tile),
     domain-warped by noise and slowly morphing, lit by the sun then the moon (lit edges, violet self-shadow, silver lining).
   - Stars (three hashed layers, twinkling), the Milky Way (Codex strip + procedural glow), the moon, crepuscular glow,
     town lights at dusk, lake reflections with ripples and a sun glitter path, and the comet, which splits in two
     as the night deepens. Meteors live on the 2D #fx canvas (starfall.js) because they are interactive.
   Performance: rendered at 0.6x (desktop) / 0.9x css px (phones) and upscaled; capped at 60 fps; paused when hidden.
   Fallback (reduced motion or no WebGL): html.sky-static, a slow CSS gradient from magic hour to night (style in skyshader.css). */
(() => {
const SF = window.SF = window.SF || {};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('sky');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/* ---------- camera + time of day (also used by the static fallback so the figure layout is identical) ---------- */
let W = innerWidth, H = innerHeight, F = H, narrow = W <= 820;
function dims() { W = innerWidth; H = innerHeight; narrow = W <= 820; F = narrow ? H * 1.02 : Math.max(H, W * .58); }
dims();
const H0 = () => narrow ? .6 : .62;
const pageOnly = !document.getElementById('hero');   // case-study page: no shore; the camera starts already looking up, at dusk
const SOFF = () => pageOnly ? H * 2.4 : 0;                      // horizon at rest, fraction of the viewport height
function pitchAt(s) {
  const p0 = Math.atan((H0() - .5) * H / F);
  s += SOFF();
  return Math.min(1.40, p0 + .74 * (1 - Math.exp(-s / (.5 * H))) + .052 * s / H);
}
const horizonAt = s => H / 2 + F * Math.tan(pitchAt(s));
SF.sky = {
  horizonY: s => horizonAt(s == null ? scrollY : s),
  worldDy: s => horizonAt(s == null ? scrollY : s) - horizonAt(0),   // how far the ground has sunk on screen
  shore: () => ({ x: W * (narrow ? .62 : .735), y: H * (narrow ? .865 : .875) }),
  rockX0: () => SF.sky.shore().x - (narrow ? W * .3 : Math.min(330, W * .22)),
};
SF.shoreAt = () => SF.sky.shore();

/* fallback (reduced motion / no WebGL): a still 2D painting of the same scene, repainted only when the scroll changes:
   one slow vertical gradient from magic hour to night, the lake and the rock while the hero is on screen, a few stars. */
function staticSky() {
  document.documentElement.classList.add('sky-static');
  const g = canvas.getContext('2d'); if (!g) return;
  const stars = Array.from({ length: 160 }, () => [Math.random(), Math.random(), Math.random()]);
  const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const P = { A: [[64, 110, 230], [153, 178, 255], [255, 204, 163]], B: [[26, 36, 112], [115, 87, 199], [255, 143, 133]], C: [[2, 4, 16], [6, 12, 38], [19, 26, 69]] };
  let lastS = -1;
  const paint = () => {
    requestAnimationFrame(paint);
    if (scrollY === lastS && canvas.width === W) return; lastS = scrollY;
    dims(); canvas.width = W; canvas.height = H;
    const max = Math.max(1, document.documentElement.scrollHeight - H), u = clamp(scrollY / max), sunEl = .075 - .52 * Math.pow(u, .85);
    const dusk = sstep(.07, -.07, sunEl), night = sstep(-.08, -.25, sunEl);
    const stop = j => mix(mix(P.A[j], P.B[j], dusk), P.C[j], night);
    const hy = SF.sky.horizonY(scrollY), gr = g.createLinearGradient(0, Math.min(0, hy - H * 1.2), 0, Math.max(H, hy));
    gr.addColorStop(0, `rgb(${stop(0)})`); gr.addColorStop(.6, `rgb(${stop(1)})`); gr.addColorStop(1, `rgb(${stop(2)})`);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const sv = clamp(night + dusk * .3);
    g.fillStyle = '#fff4dc'; stars.forEach(([x, y, m]) => { if (y * H < hy - 8) { g.globalAlpha = sv * (.3 + .7 * m); g.fillRect(x * W, y * H, 1 + m * 1.4, 1 + m * 1.4); } }); g.globalAlpha = 1;
    if (hy < H) {
      const lg = g.createLinearGradient(0, hy, 0, H); lg.addColorStop(0, `rgb(${mix(stop(2), [20, 24, 70], .3)})`); lg.addColorStop(1, `rgb(${mix(stop(0), [6, 10, 34], .5)})`);
      g.fillStyle = lg; g.fillRect(0, hy, W, H - hy);
      const sh = SF.sky.shore(), sy = sh.y + SF.sky.worldDy(scrollY), x0 = SF.sky.rockX0();
      g.fillStyle = '#0b0b22'; g.beginPath(); g.moveTo(x0, sy + 4); g.lineTo(W, sy - (W - sh.x) * .018); g.lineTo(W, H); g.lineTo(x0 + (H - sy) * .55, H); g.closePath(); g.fill();
    }
  };
  requestAnimationFrame(paint);
}

let gl = null;
if (!reduce) {
  try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
}
if (!gl) { staticSky(); return; }

/* ---------- shader ---------- */
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `
precision highp float;
uniform vec2 uRes, uView;
uniform float uTime, uPitch, uF, uDusk, uNight, uCometA, uSplit, uCov, uSunUp;
uniform vec3 uSun, uMoon, uCometH, uCometT, uCometT2, uFrag;
uniform mat3 uRot;
uniform vec4 uRock;
uniform sampler2D uNoise, uCloud, uCirrus, uMilky, uTown;
#define TAU 6.2831853

float hash13(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float hash12(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }

/* sky colour without clouds: three palettes (magic hour, dusk, night), each a zenith / mid / horizon gradient */
vec3 atmo(vec3 d, bool sharp){
  float e = clamp(d.y, 0., 1.), h = 1. - e;
  float t1 = pow(h, 7.), t2 = pow(h, 2.4);
  vec3 A = mix(mix(vec3(.25,.43,.90), vec3(.60,.70,1.0), t2), vec3(1.0,.80,.64), t1);
  vec3 B = mix(mix(vec3(.10,.14,.44), vec3(.45,.34,.78), t2), vec3(1.0,.56,.52), t1);
  vec3 C = mix(mix(vec3(.008,.016,.062), vec3(.025,.045,.15), t2), vec3(.075,.10,.27), t1);
  vec3 col = mix(mix(A, B, uDusk), C, uNight);
  float sd = max(dot(d, uSun), 0.);
  vec3 glowC = mix(vec3(1.,.74,.44), vec3(1.,.47,.50), uDusk);
  col += glowC * pow(sd, 5.) * .32 * (1. - uNight) * (.35 + .65 * t2);
  if (!sharp) return col;   // haze colour for far clouds: no sun disk or tight glow, or the sun's azimuth would streak
  col += glowC * (pow(sd, 40.) * .45 + pow(sd, 400.) * .6) * (1. - uNight) * (.35 + .65 * t2);
  // crepuscular glow: soft rays fanning out of the sun
  vec3 sr = normalize(cross(uSun, vec3(0., 1., 0.))), su = cross(sr, uSun);
  vec3 v = d - uSun * dot(d, uSun);
  float ang = atan(dot(v, sr), dot(v, su));
  float rays = texture2D(uNoise, vec2(ang * 1.6, uTime * .004)).r;
  col += glowC * smoothstep(.45, .9, rays) * pow(sd, 3.) * .22 * (1. - uNight) * smoothstep(-.02, .1, d.y);
  // the sun disk while it is up
  col += vec3(1.,.95,.85) * smoothstep(.99955, .9999, sd) * uSunUp * 1.6;
  // the moon: a soft disk with a halo
  float md = max(dot(d, uMoon), 0.);
  vec3 moonC = vec3(1.,.96,.88);
  col += moonC * (smoothstep(.99985, .99994, md) * 1.3 + pow(md, 900.) * .25 + pow(md, 60.) * .06) * uNight;
  return col;
}
vec3 starCol(float h){ return h < .3 ? vec3(1.,.95,.86) : h < .55 ? vec3(.80,.86,1.) : h < .75 ? vec3(1.,.84,.62) : h < .88 ? vec3(1.,.80,.86) : vec3(.88,.82,1.); }
vec3 stars(vec3 d, float sc, float keep, float sz, float big){
  vec3 c = floor(d * sc);
  float h = hash13(c);
  if (h > keep) return vec3(0.);
  vec3 sd = normalize((c + .5 + (vec3(hash13(c + 17.1), hash13(c + 41.7), hash13(c + 73.3)) - .5) * .4) / sc);
  vec3 dv = d - sd;
  float px = length(dv) * uF;
  float m = 1. - h / keep, b = m * m * m;
  float r = sz * (.55 + 1.1 * b);
  float tw = .55 + .45 * sin(uTime * (1.3 + 4. * hash13(c + 3.3)) + h * 91.);
  float s = exp(-px * px / (r * r)) * (.3 + 1.5 * b);
  if (big > 0.) {   // four-point glints on the brightest stars
    vec3 ax = normalize(cross(sd, vec3(0., 1., 0.))), ay = cross(ax, sd);
    float x = dot(dv, ax) * uF, y = dot(dv, ay) * uF;
    s += b * big * (exp(-abs(x) * .45 - y * y * 1.6) + exp(-abs(y) * .45 - x * x * 1.6)) * .55;
  }
  return starCol(hash13(c + 9.)) * s * tw;
}
/* cumulus: Codex-painted tile, domain-warped, morphing; returns rgb + alpha */
float cRaw(vec2 q, out float shade){
  vec2 w = texture2D(uNoise, q * .21 + vec2(uTime * .0021, -uTime * .0013)).rg - .5;
  vec2 qq = q + w * .12;
  float c = texture2D(uCloud, qq).r;
  float n = texture2D(uNoise, qq * 1.7 + vec2(uTime * .004, 0.)).b;
  float m = texture2D(uNoise, q * .09 + vec2(-uTime * .0011, uTime * .0007)).a;
  shade = c;
  return c + (n - .5) * .12 + (m - .5) * .75;
}
vec4 cumulus(vec3 d, vec3 L, vec3 litC, vec3 shC, vec3 rimC, vec3 hazeC){
  if (d.y < .012) return vec4(0.);
  float r = 1. / d.y;
  vec2 q = d.xz * r * .17 + vec2(uTime * .0032, uTime * .0012);
  float sh, sh2;
  float raw = cRaw(q, sh);
  float den = smoothstep(uCov, uCov + .2, raw);
  if (den < .003) return vec4(0.);
  vec2 ld = normalize(L.xz + vec2(1e-4)) * .015;
  float raw2 = cRaw(q + ld, sh2);
  float edge = clamp(.5 + (raw - raw2) * 3.2, 0., 1.);     // brighter where the cloud thins toward the light
  float lit = clamp(mix(smoothstep(.2, 1., sh), edge, .45), 0., 1.);
  float thick = smoothstep(.15, .9, den);
  vec3 col = mix(shC, litC, lit);
  col *= 1. - .28 * thick * (1. - lit);                       // self-shadow in the dense cores
  float fwd = pow(max(dot(d, L), 0.), 5.);
  col += rimC * (1. - thick) * (.25 + fwd * 1.6);              // lit rims, silver lining toward the light
  float far = 1. - exp(-r * .16);
  col = mix(col, hazeC, far * .85);
  return vec4(col, den * smoothstep(.012, .1, d.y) * (1. - far * .55));
}
vec4 cirrus(vec3 d, vec3 litC, vec3 hazeC){
  if (d.y < .02) return vec4(0.);
  float r = 1. / d.y;
  vec2 q = d.xz * r * .12 + vec2(uTime * .0016, uTime * .0005);
  vec2 w = texture2D(uNoise, q * .5 + uTime * .001).ba - .5;
  float c = texture2D(uCirrus, q + w * .06).r;
  float a = smoothstep(.18, .75, c) * smoothstep(.02, .14, d.y);
  float far = 1. - exp(-r * .1);
  return vec4(mix(litC, hazeC, far * .7), a * .62);
}
/* the comet: head + ion tail + curved dust tail, in local tangent coords around the head */
vec3 comet(vec3 d, vec3 h, vec3 tu, float len, vec3 cHead, vec3 cTail, float k){
  float cd = dot(d, h);
  if (cd < .6) return vec3(0.);
  vec3 tv = normalize(cross(h, tu));
  vec3 dv = d - h * cd;
  float x = dot(dv, tu), y = dot(dv, tv);
  float rr = (x * x + y * y) * uF * uF;
  vec3 col = cHead * (exp(-rr / 6.) * 1.5 + exp(-rr / 90.) * .45 + exp(-rr / 1600.) * .14);
  if (x > 0.) {
    float f = x / len;
    float wI = .0012 + x * .018;
    float ion = exp(-y * y / (wI * wI)) * exp(-f * 3.2) * smoothstep(0., .02, x);
    float yd = y - x * x * .55;
    float wD = .003 + x * .11;
    float dust = exp(-yd * yd / (wD * wD)) * exp(-f * 2.3) * smoothstep(0., .03, x);
    float streak = .75 + .5 * texture2D(uNoise, vec2(x * 2.5 - uTime * .01, yd / wD * .25)).r;
    col += vec3(.80,.82,1.) * ion * .5 + cTail * dust * .5 * streak;
  }
  return col * k;
}
vec3 scene(vec3 d, bool refl){
  vec3 col = atmo(d, true);
  vec3 ds = uRot * d;
  float sv = smoothstep(.05, .8, uNight + uDusk * .35) * smoothstep(-.01, .2, d.y);
  if (sv > .001) {
    // the Milky Way: a band around a great circle of the turning sky
    vec3 n = normalize(vec3(.92, .28, -.27)), e1 = normalize(cross(n, vec3(0., 0., 1.))), e2 = cross(n, e1);
    float lat = dot(ds, n), lon = atan(dot(ds, e2), dot(ds, e1));
    vec2 uv = vec2(lon / TAU * 2., .5 - lat / .62);
    vec3 mw = texture2D(uMilky, uv).rgb;
    float band = exp(-lat * lat / .028);
    float grain = texture2D(uNoise, uv * vec2(4., 1.3) + .3).r;
    mw = mw * 1.15 + vec3(.30, .24, .52) * band * (.16 + .2 * grain) + vec3(.5, .34, .5) * exp(-lat * lat / .005) * .08;
    col += mw * sv * (.55 + .45 * uNight);
    vec3 st = stars(ds, 150., .13, .62, 0.) + stars(ds, 72., .1, .85, 0.);
    if (!refl) st += stars(ds, 34., .085, 1.25, 1.);
    col += st * sv;
  }
  if (!refl && uCometA > .001) {
    col += comet(d, uCometH, uCometT, .9, vec3(1., .97, .9), vec3(1., .80, .58), uCometA);
    if (uSplit > .001) col += comet(d, uFrag, uCometT2, .55, vec3(1., .88, .9), vec3(1., .66, .74), uCometA * uSplit * .85);
  }
  // light for the clouds: the sun, then the moon
  vec3 L = normalize(mix(uSun, uMoon, uNight));
  vec3 litC = mix(mix(vec3(1., .86, .70), vec3(1., .60, .66), uDusk), vec3(.38, .42, .66), uNight);
  vec3 shC  = mix(mix(vec3(.58, .58, .86), vec3(.34, .26, .58), uDusk), vec3(.035, .05, .14), uNight);
  vec3 rimC = mix(mix(vec3(1., .82, .55), vec3(1., .62, .62), uDusk), vec3(.42, .46, .7), uNight) * mix(.55, .3, uNight);
  vec3 hazeC = atmo(normalize(vec3(d.x, .05, d.z)), false);
  vec4 ci = cirrus(d, mix(mix(vec3(1., .9, .86), vec3(1., .64, .74), uDusk), vec3(.2, .24, .44), uNight), hazeC);
  col = mix(col, ci.rgb, ci.a);
  vec4 cu = cumulus(d, L, litC, shC, rimC, hazeC);
  col = mix(col, cu.rgb, cu.a);
  return col;
}
/* the far town and mountains across the lake (Codex silhouette strip), with lights coming on at dusk */
float townMask(vec3 d, float el){
  float az = atan(d.x, d.z);
  float v = .79 - el / .24;            // el 0 = the strip shoreline; the far mountain peaks ~6 degrees up
  if (v < 0. || v > 1.) return v > 1. ? 1. : 0.;
  return 1. - texture2D(uTown, vec2(az / TAU * 3.75 + .47, v)).r;
}
vec3 townCol(vec3 d, float el, vec3 horizon){
  vec3 c = mix(horizon, mix(vec3(.13,.11,.30), vec3(.03,.035,.1), uNight), .88);
  float az = atan(d.x, d.z);
  vec2 g = vec2(az * 900., el * 900.);
  vec2 cell = floor(g);
  float h = hash12(cell);
  float on = step(.93, h) * smoothstep(.15, .7, uDusk + uNight) * step(el, .03);
  float l = exp(-dot(fract(g) - .5, fract(g) - .5) * 14.) * on * (.7 + .3 * sin(uTime * 2. + h * 50.));
  return c + vec3(1., .78, .5) * l * 1.4;
}
void main(){
  vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) * uView.x / uRes.x;
  vec2 s = vec2(css.x - uView.x * .5, uView.y * .5 - css.y) / (uF * uView.x / uRes.x);   // uF is in render px
  float cp = cos(uPitch), sp = sin(uPitch);
  vec3 d = normalize(vec3(s.x, 0., 0.) + vec3(0., cp, -sp) * s.y + vec3(0., sp, cp));
  vec3 col;
  float el = d.y;
  vec3 horizon = atmo(normalize(vec3(d.x, 0., d.z)), false);
  if (el >= 0.) {
    col = scene(d, false);
    if (el < .2) { float m = townMask(d, el); col = mix(col, townCol(d, el, horizon), m); }
  } else {
    // the lake: a rippled mirror of the sky, darker toward the camera, with the sun's glitter path
    vec2 hit = d.xz / -el;
    vec2 rp = texture2D(uNoise, hit * vec2(.9, .22) + vec2(uTime * .012, uTime * .03)).rg - .5;
    rp += (texture2D(uNoise, hit * vec2(2.6, .7) - vec2(uTime * .02, uTime * .05)).gb - .5) * .5;
    float k = clamp(-el * 6., .15, 1.);
    vec3 rd = normalize(vec3(d.x + rp.x * .03 * k, max(-el + rp.y * .02 * k, .0005), d.z));
    col = scene(rd, true);
    float m = townMask(rd, rd.y);
    col = mix(col, townCol(rd, rd.y, horizon) * .8, m);
    col *= mix(.86, .5, smoothstep(0., .35, -el));
    col = mix(col, mix(vec3(.06,.08,.22), vec3(.01,.02,.06), uNight), smoothstep(.05, .6, -el) * .35);
    float glit = pow(max(dot(rd, uSun), 0.), 30.) * smoothstep(.6, .85, texture2D(uNoise, hit * vec2(5., 1.2) + vec2(uTime * .03, uTime * .01)).b);
    col += vec3(1., .82, .55) * glit * 1.6 * (1. - uNight) * (1. - uDusk * .6) * smoothstep(-.1, -.006, el);
    float mg = pow(max(dot(rd, uMoon), 0.), 60.) * smoothstep(.6, .85, texture2D(uNoise, hit * vec2(3., .8) - uTime * .02).g);
    col += vec3(.9, .92, 1.) * mg * uNight * .8;
    // a thin bright line where the water meets the far shore
    col += horizon * exp(el * 900.) * .25;
  }
  // the rock ledge Daniel stands on (screen space, sinks with the horizon)
  if (uRock.w > 0.) {
    float x = css.x, tip = max(0., 1. - (x - uRock.x) / 150.);
    float top = uRock.z + 16. * (texture2D(uNoise, vec2(x * .0011, .4)).r - .5) + 5. * (texture2D(uNoise, vec2(x * .006, .7)).g - .5) - (x - uRock.y) * .03 + tip * tip * 46.;
    float face = uRock.x + (css.y - top) * .42 + 10. * (texture2D(uNoise, vec2(.2, css.y * .004)).b - .5);
    if (css.y > top && x > face) {
      float n = texture2D(uNoise, css * .006).g;
      vec3 rock = mix(vec3(.035, .035, .1), vec3(.07, .06, .16), n);
      float rimT = exp(-(css.y - top) / 2.2), rimS = exp(-(x - face) / 3.);
      vec3 rimc = mix(mix(vec3(1., .78, .5), vec3(1., .55, .55), uDusk), vec3(.55, .6, .9), uNight);
      rock += rimc * (rimT * .9 + rimS * .2 * (1. - rimT)) + rimc * .05 * exp(-(css.y - top) / 40.);
      float strata = smoothstep(.48, .52, texture2D(uNoise, vec2(x * .003, css.y * .02)).b) * .03;
      col = rock + strata;
    }
  }
  col += (hash12(gl_FragCoord.xy + fract(uTime) * 61.) - .5) / 255. * 2.;
  gl_FragColor = vec4(col, 1.);
}`;

function sh(type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('sky shader: ' + gl.getShaderInfoLog(s));
  return s;
}
let prog;
try {
  prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('sky link: ' + gl.getProgramInfoLog(prog));
} catch (e) { console.warn(e.message); staticSky(); return; }
gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const U = {};
['uRes', 'uView', 'uTime', 'uPitch', 'uF', 'uDusk', 'uNight', 'uCometA', 'uSplit', 'uCov', 'uSunUp', 'uSun', 'uMoon', 'uCometH', 'uCometT', 'uCometT2', 'uFrag', 'uRot', 'uRock',
 'uNoise', 'uCloud', 'uCirrus', 'uMilky', 'uTown'].forEach(n => U[n] = gl.getUniformLocation(prog, n));

/* ---------- textures: a tileable RGBA noise made here, and the Codex ingredients (data URIs in skytex.js, so WebGL can use them over file://) ---------- */
function makeNoise(N = 256) {
  let seed = 20261012; const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;   // same sky every visit
  const out = new Uint8Array(N * N * 4);
  const periods = [[4, 8, 16, 32, 64], [4, 8, 16, 32, 64], [8, 16, 32, 64, 128], [2, 4, 8, 16, 32]];
  for (let ch = 0; ch < 4; ch++) {
    const acc = new Float32Array(N * N); let amp = 1;
    for (const P of periods[ch]) {
      const g = new Float32Array(P * P); for (let i = 0; i < g.length; i++) g[i] = random();
      for (let y = 0; y < N; y++) {
        const fy = y / N * P, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty), y1 = (y0 + 1) % P;
        for (let x = 0; x < N; x++) {
          const fx = x / N * P, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx), x1 = (x0 + 1) % P;
          const a = g[y0 * P + x0] + (g[y0 * P + x1] - g[y0 * P + x0]) * sx, b = g[y1 * P + x0] + (g[y1 * P + x1] - g[y1 * P + x0]) * sx;
          acc[y * N + x] += (a + (b - a) * sy) * amp;
        }
      }
      amp *= .52;
    }
    let lo = Infinity, hi = -Infinity; for (const v of acc) { if (v < lo) lo = v; if (v > hi) hi = v; }
    for (let i = 0; i < N * N; i++) out[i * 4 + ch] = Math.round((acc[i] - lo) / (hi - lo) * 255);
  }
  return { data: out, N };
}
function tex(unit, opts) {
  const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
  const set = (src, w, h) => {
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    if (src.data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, src.data);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, opts.ws || gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, opts.wt || gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (opts.mip) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  };
  return { t, set };
}
const noise = makeNoise();
const T = {
  uNoise: tex(0, { mip: true }), uCloud: tex(1, { mip: true }), uCirrus: tex(2, { mip: true }),
  uMilky: tex(3, { wt: gl.CLAMP_TO_EDGE }), uTown: tex(4, { wt: gl.CLAMP_TO_EDGE }),
};
T.uNoise.set(noise, noise.N, noise.N);
// until (or unless) the paintings arrive: noise stands in for the clouds, black for the Milky Way, white (no town) for the strip
T.uCloud.set(noise, noise.N, noise.N); T.uCirrus.set(noise, noise.N, noise.N);
T.uMilky.set({ data: new Uint8Array(4) }, 1, 1); T.uTown.set({ data: new Uint8Array([255, 255, 255, 255]) }, 1, 1);
Object.keys(T).forEach((k, i) => gl.uniform1i(U[k], i));
const SRC = window.SKY_TEX || {};
[['uCloud', 'cloud'], ['uCirrus', 'cirrus'], ['uMilky', 'milky'], ['uTown', 'town']].forEach(([u, k]) => {
  if (!SRC[k]) return;
  const im = new Image(); im.onload = () => { try { T[u].set(im); } catch (e) { console.warn('sky texture', k, e.message); } }; im.src = SRC[k];
});

/* ---------- per-frame state ---------- */
const AX = (() => { const a = [0, .62, .78], l = Math.hypot(...a); return a.map(v => v / l); })();   // celestial pole
function rotMat(ang) {   // Rodrigues, column-major for uniformMatrix3fv
  const [x, y, z] = AX, c = Math.cos(ang), s = Math.sin(ang), t = 1 - c;
  return new Float32Array([t * x * x + c, t * x * y + s * z, t * x * z - s * y, t * x * y - s * z, t * y * y + c, t * y * z + s * x, t * x * z + s * y, t * y * z - s * x, t * z * z + c]);
}
const dir = (az, el) => [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
const norm = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const tangent = (h, v) => norm(v.map((x, i) => x - dot(v, h) * h[i]));
let scale = 1, RW = 0, RH = 0;
function resize() {
  dims();
  scale = narrow ? .9 : (W > 1700 ? .5 : .6);
  RW = Math.max(2, Math.round(W * scale)); RH = Math.max(2, Math.round(H * scale));
  canvas.width = RW; canvas.height = RH; gl.viewport(0, 0, RW, RH);
}
resize();
addEventListener('resize', resize);

let prog01 = 0, sSmooth = scrollY, last = 0, t0 = performance.now(), running = true, timeAcc = 0;
document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(frame); } });
function state(s) {
  const max = Math.max(1, document.documentElement.scrollHeight - H);
  const u = pageOnly ? .22 + .2 * clamp(s / max) : clamp(s / max);
  const sunEl = .075 - .52 * Math.pow(u, .85);
  const sun = dir(narrow ? .3 : .4, sunEl);
  return {
    u, sun, sunEl,
    dusk: sstep(.07, -.07, sunEl), night: sstep(-.08, -.25, sunEl),
  };
}
SF.sky.state = () => state(sSmooth);
function frame(now) {
  if (!running) return;
  requestAnimationFrame(frame);
  if (now - last < 15.5) return;                      // ~60 fps cap on fast displays
  const dt = Math.min(.1, (now - last) / 1000 || .016); last = now; timeAcc += dt;
  sSmooth = scrollY;   // Lenis already smooths the scroll; the rock must stay locked to the figure
  const s = sSmooth, st = state(s), t = timeAcc;
  gl.uniform2f(U.uRes, RW, RH); gl.uniform2f(U.uView, W, H);
  gl.uniform1f(U.uTime, t); gl.uniform1f(U.uPitch, pitchAt(s)); gl.uniform1f(U.uF, F * scale);
  gl.uniform1f(U.uDusk, st.dusk); gl.uniform1f(U.uNight, st.night);
  gl.uniform1f(U.uSunUp, sstep(-.01, .02, st.sunEl));
  gl.uniform3fv(U.uSun, st.sun); gl.uniform3fv(U.uMoon, norm(dir(narrow ? -.12 : -.42, .92)));
  gl.uniform1f(U.uCov, .5 + .07 * st.dusk + .2 * st.night);
  gl.uniformMatrix3fv(U.uRot, false, rotMat(-st.u * .9 - t * .0035));
  // the comet: it climbs into view at dusk; around the timeline a fragment breaks away and drifts apart
  // it rises a little as the page goes on, so it settles in the upper right and stays company down the page;
  // the tail is aimed in screen terms: up-left on desktop, left and slightly down on phones (never under the nav)
  const pc = pitchAt(s), head = norm(dir(narrow ? .12 : .32, .98 + .42 * st.u));
  const scr = narrow ? [-1, -.32] : [-1, .72], upv = [0, Math.cos(pc), -Math.sin(pc)];
  const tail = tangent(head, [scr[0], scr[1] * upv[1], scr[1] * upv[2]]);
  const split = sstep(.34, .62, st.u);
  const side = norm([tail[1] * head[2] - tail[2] * head[1], tail[2] * head[0] - tail[0] * head[2], tail[0] * head[1] - tail[1] * head[0]]);
  const frag = norm(head.map((h, i) => h + (side[i] * .05 - tail[i] * .015) * split));
  const tail2 = tangent(frag, tail.map((x, i) => x + side[i] * .35));
  gl.uniform3fv(U.uCometH, head); gl.uniform3fv(U.uCometT, tail); gl.uniform3fv(U.uFrag, frag); gl.uniform3fv(U.uCometT2, tail2);
  gl.uniform1f(U.uCometA, sstep(.0, .14, st.u) * (.35 + .65 * Math.max(st.dusk, st.night)));
  gl.uniform1f(U.uSplit, split);
  // the rock, in viewport css px, sinking with the horizon (hidden once it has left the screen)
  const dy = SF.sky.worldDy(s), sh0 = SF.sky.shore(), sy = sh0.y + dy;
  gl.uniform4f(U.uRock, SF.sky.rockX0(), sh0.x, sy, sy < H + 10 && !pageOnly ? 1 : 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  SF.sky.t = t;
}
requestAnimationFrame(frame);
})();
