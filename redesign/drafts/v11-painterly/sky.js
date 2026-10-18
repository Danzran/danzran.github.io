/* v11 Painterly: the living sky. ONE fixed full-page WebGL2 canvas (#gl) behind everything.
   Ingredients are Codex paintings in the Makoto Shinkai style, made as horizontally TILEABLE layers on black
   (window.SKY_TEX, data URIs in assets/sky-tex.js, so WebGL can use them over file://):
     far   : distant cumulus towers on the horizon (golden-hour version crossfading into a dusk version)
     mid   : two billowing cumulus bands at different heights
     cir   : high cirrus streaks and an altocumulus "mackerel" field
     wisp  : near, soft cloud wisps the camera flies through
     milky : a Milky Way band; stars: a deep starfield
   Each layer scrolls sideways on its own wind, is domain-warped by an animated two-phase flowmap plus a slow
   noise warp (so the paint itself billows and morphs), is keyed from black, re-lit by the time of day, and gets a
   rim light from the sun (later the moon) computed from the painting's own luminance gradient. A broad light sweep
   passes through now and then, god rays fan from the low sun, stars twinkle, the Milky Way turns.
   Scroll = camera altitude: from golden hour at the hero, through dusk and the cloud layers, into night and space by
   Contact. One continuous world, no per-section images.
   Performance: rendered at reduced resolution (about 1100 px on the long side), paused when the tab is hidden.
   Reduced motion: no time animation; the sky still follows the scroll. No WebGL2: a CSS gradient stays behind. */
window.PainterlySky = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('gl');
  const gl = canvas && canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  const api = { progress: 0, light: [255, 214, 168], ok: !!gl };
  if (!gl) { document.documentElement.classList.add('no-gl'); return api; }

  const VS = `#version 300 es
  in vec2 a; out vec2 vUv; void main(){ vUv = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }`;
  const FS = `#version 300 es
  precision highp float;
  in vec2 vUv; out vec4 o;
  uniform vec2 uRes; uniform float uT, uP, uCam;
  uniform vec3 uTop, uMid, uHor, uTint, uRim, uSunCol;
  uniform vec2 uSun; uniform float uSunA, uDark, uStarA, uMoonA, uHorY;
  uniform sampler2D tFarA, tFarB, tMidA, tMidB, tCirA, tCirB, tWisp, tMilky, tStars;
  uniform vec4 uAsp; // aspect of far, mid, cir, wisp tiles
  uniform float uAsp2;

  float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
  vec2 flow(vec2 q, float t){ return vec2(fbm(q * 1.7 + vec2(0., t * .02)), fbm(q * 1.7 + vec2(5.2, 1.3) - vec2(t * .017, 0.))) - .5; }

  // a painted layer: p in viewport-height units; base = world height of the tile's bottom; s = tile height.
  // returns the keyed paint (rgb, alpha); gL = gradient of its blurred luminance (for the rim light)
  vec2 gL;
  vec4 layer(sampler2D tx, float asp, vec2 p, float base, float s, float wind, float warp, float seed){
    gL = vec2(0.);
    vec2 uv = vec2(p.x / (s * asp) + wind, (p.y - base) / s);
    float edge = smoothstep(-.02, .12, uv.y) * smoothstep(1.02, .86, uv.y);
    if (edge <= 0.) return vec4(0.);
    float t = uT;
    // slow non-cyclic billow
    uv += warp * .5 * vec2(fbm(uv * vec2(1.6, 2.4) + seed + t * .012) - .5, fbm(uv * vec2(1.6, 2.4) + seed + 9.1 - t * .01) - .5);
    // two-phase flowmap: the paint creeps along a noise field and is re-seeded every cycle without a visible pop
    vec2 f = flow(uv * vec2(1.1, 1.8) + seed, t) * warp;
    float ph0 = fract(t * .04 + seed * .13), ph1 = fract(ph0 + .5), wb = abs(1. - 2. * ph0);
    vec2 st = vec2(uv.x, 1. - uv.y);
    vec3 c = mix(texture(tx, st + f * (ph0 - .5)).rgb, texture(tx, st + f * (ph1 - .5)).rgb, wb);
    // soft key from a blurred (higher mip) sample, so painted edges feather instead of crunching
    vec2 sb = st + f * (ph0 - .5) * (1. - wb) + f * (ph1 - .5) * wb;
    float Lb = dot(texture(tx, sb, 2.5).rgb, vec3(.4, .35, .25));
    float e = .006;
    float Lx = dot(texture(tx, sb + vec2(e / asp * 1.5, 0.), 3.).rgb, vec3(.4, .35, .25));
    float Ly = dot(texture(tx, sb - vec2(0., e * 1.5), 3.).rgb, vec3(.4, .35, .25));
    gL = vec2(Lx - Lb, Ly - Lb) / e;
    float L = max(c.r, max(c.g, c.b));
    float al = smoothstep(.07, .42, Lb * .7 + L * .3) * edge;
    return vec4(c, al);
  }
  // re-light a keyed layer and composite it over the current colour
  vec3 lit(vec3 base, vec4 L, vec2 p, float amt, float rimK){
    if (L.a <= .001) return base;
    float mx = max(L.r, max(L.g, L.b));
    // un-premultiply the dark fringe of paint keyed off black (edges stay luminous, not brown)
    vec3 col = clamp(mix(L.rgb / max(mx, .08) * mix(.8, 1., L.a), L.rgb, .18 * L.a), 0., 1.);
    col = mix(col, col * uTint, amt);
    vec2 ld = normalize(uSun - p + vec2(0., .001));
    float rim = clamp(dot(-gL, ld) * .18, 0., 1.) * smoothstep(.0, 3., length(gL)) * (1. - smoothstep(.55, 1., L.a));
    // a broad band of light that sweeps across the clouds every ~24 s
    float sw = fract(uT / 24.);
    float band = exp(-pow((dot(p, normalize(vec2(1., .35))) - (sw * 4.2 - 1.)) / .25, 2.));
    col += uRim * (rim * rimK * .9 + band * .16 * mx);
    float halo = exp(-length(uSun - p) * 2.6) * uSunA;
    col += uSunCol * halo * .3;
    return mix(base, col, L.a);
  }
  vec3 stars(vec2 p, float t){
    // procedural twinkling stars on a grid
    vec3 s = vec3(0.);
    for (int k = 0; k < 2; k++){
      float sc = k == 0 ? 60. : 140.;
      vec2 q = p * sc + float(k) * 31.7, id = floor(q), f = fract(q) - .5;
      float r = h21(id); if (r > .86){
        vec2 off = vec2(h21(id + 3.1), h21(id + 7.7)) - .5;
        float d = length(f - off * .7);
        float tw = .55 + .45 * sin(t * (1. + 3. * h21(id + 1.3)) + r * 40.);
        float br = (k == 0 ? 1.2 : .7) * smoothstep(.12, 0., d) * tw;
        s += br * mix(vec3(1., .93, .82), vec3(.8, .86, 1.), h21(id + 5.));
      }
    }
    return s;
  }
  void main(){
    vec2 fc = vUv * uRes; float H = uRes.y;
    vec2 p = vec2(fc.x / H, fc.y / H);      // viewport-height units, y up
    float t = uT;
    // ---- sky gradient: horizon sinks below the screen as the camera climbs
    float y = p.y - uHorY;
    vec3 col = mix(uHor, uMid, smoothstep(0., .55, y));
    col = mix(col, uTop, smoothstep(.35, 1.45, y));
    col += uHor * .25 * exp(-abs(y) * 9.) * (1. - uDark);
    col = mix(col, uMid * .62, smoothstep(0., -.45, y));
    // ---- night: starfield, procedural stars and the turning Milky Way
    if (uStarA > .001){
      float ang = t * .006 + uP * .5;
      vec2 c = vec2(.9 * uRes.x / H, -1.2);
      vec2 q = p - c; q = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * q + c;
      vec3 sf = texture(tStars, q * .55 + vec2(0., uCam * .02)).rgb;
      vec3 mw = texture(tMilky, vec2(q.x / (1.5 * uAsp2) + t * .0015, 1. - (q.y - .15 + uCam * .02) / 1.5)).rgb;
      float mwa = smoothstep(-.1, .2, q.y + uCam * .02 - .15) * smoothstep(1.7, 1.3, q.y + uCam * .02 - .15);
      col += (sf * .9 + mw * mwa * .8) * uStarA + stars(q, t) * uStarA;
    }
    // ---- moon glow
    if (uMoonA > .001){ vec2 m = vec2(.22 * uRes.x / H, .82); float d = length(p - m);
      float disk = smoothstep(.032, .028, d), bite = smoothstep(.03, .026, length(p - m - vec2(.014, .01)));
      float cres = disk * (1. - bite * .92);
      col += vec3(.7, .74, 1.) * exp(-d * 7.) * .28 * uMoonA;
      col = mix(col, vec3(1., .96, .88), cres * uMoonA); }
    // ---- low sun: bloom + god rays
    if (uSunA > .001){
      vec2 d = p - uSun; float r = length(d), a = atan(d.y, d.x);
      float rays = pow(fbm(vec2(a * 7., t * .04)), 2.) * smoothstep(1.6, .0, r) * smoothstep(.0, .12, r);
      col += uSunCol * (exp(-r * 3.2) * .55 + exp(-r * 14.) * .6 + rays * .45) * uSunA;
    }
    // ---- painted layers, far to near. Each: world base height, parallax factor (how fast the camera passes it)
    float cam = uCam;
    // far towers on the horizon (golden version crossfading into the dusk version)
    vec2 pf = p + vec2(0., cam * .22);
    vec4 fa = layer(tFarA, uAsp.x, pf, -.02 + uHorY * .0, .62, t * .0018, .018, 1.);
    vec4 fb = layer(tFarB, uAsp.x, pf, -.02, .62, t * .0018 + .37, .018, 2.);
    float kfb = smoothstep(.12, .4, uP);
    vec4 far = mix(fa, fb, kfb);
    col = lit(col, far * vec4(1, 1, 1, .95), p, .35 + .5 * uDark, .6);
    // high cirrus streaks
    col = lit(col, layer(tCirA, uAsp.z, p + vec2(0., cam * .35), .62, .85, t * .0035, .03, 3.) * vec4(1, 1, 1, .7 * (1. - .4 * uDark)), p, .5, .5);
    // mid cumulus band A (around the hero horizon)
    col = lit(col, layer(tMidA, uAsp.y, p + vec2(0., cam * .55), -.3, .8, t * .0045 + .2, .03, 4.), p, .45, 1.);
    // mackerel sky high up, met mid-page
    col = lit(col, layer(tCirB, uAsp.z, p + vec2(0., cam * .5), 1.5, 1.4, -t * .0028, .03, 5.) * vec4(1, 1, 1, .5), p, .6, .8);
    // mid cumulus band B, the camera climbs through it in the middle of the page
    col = lit(col, layer(tMidB, uAsp.y, p + vec2(0., cam * .7), 2.05, 1.05, -t * .0055, .035, 6.), p, .6, 1.);
    // near wisps: fast parallax, soft, flown through twice
    vec4 w1 = layer(tWisp, uAsp.w, p + vec2(0., cam * 1.05), 2.5, 1.3, t * .012, .05, 7.);
    vec4 w2 = layer(tWisp, uAsp.w, p * vec2(-1., 1.) + vec2(3., cam * 1.05), 4.6, 1.5, t * .014, .05, 8.);
    col = lit(col, w1 * vec4(1, 1, 1, .7), p, .6, .5);
    col = lit(col, w2 * vec4(1, 1, 1, .55), p, .7, .4);
    // soft vignette + dither
    col *= 1. - .18 * pow(length(vUv - .5) * 1.25, 2.4);
    col += (h21(fc + fract(t)) - .5) / 255.;
    o = vec4(col, 1.);
  }`;

  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  const prog = gl.createProgram();
  try { gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); }
  catch (e) { console.warn('sky shader', e.message); document.documentElement.classList.add('no-gl'); api.ok = false; return api; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['uRes', 'uT', 'uP', 'uCam', 'uTop', 'uMid', 'uHor', 'uTint', 'uRim', 'uSunCol', 'uSun', 'uSunA', 'uDark', 'uStarA', 'uMoonA', 'uHorY', 'uAsp', 'uAsp2'].forEach(n => U[n] = gl.getUniformLocation(prog, n));

  /* textures */
  const TEX = window.SKY_TEX || {};
  const NAMES = ['tFarA', 'tFarB', 'tMidA', 'tMidB', 'tCirA', 'tCirB', 'tWisp', 'tMilky', 'tStars'];
  const KEYS = ['farA', 'farB', 'midA', 'midB', 'cirA', 'cirB', 'wisp', 'milky', 'stars'];
  const asp = {};
  NAMES.forEach((n, i) => {
    const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]));
    gl.uniform1i(gl.getUniformLocation(prog, n), i);
    const src = TEX[KEYS[i]]; if (!src) return;
    const im = new Image();
    im.onload = () => {
      gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, KEYS[i] === 'stars' ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      asp[KEYS[i]] = im.naturalWidth / im.naturalHeight; dirty = true;
    };
    im.src = src;
  });

  /* time-of-day keys by progress P (0 hero .. 1 contact): never interpolates through green */
  const K = [
    { p: 0,   top: [118, 150, 226], mid: [246, 182, 170], hor: [255, 210, 150], tint: [255, 232, 205], rim: [255, 214, 150], sun: [255, 196, 130], sunA: 1, dark: 0, star: 0, moon: 0, horY: .02 },
    { p: .28, top: [92, 104, 196],  mid: [222, 146, 176], hor: [255, 172, 140], tint: [250, 206, 214], rim: [255, 188, 170], sun: [255, 160, 130], sunA: .55, dark: .1, star: 0, moon: 0, horY: -.35 },
    { p: .52, top: [52, 54, 140],   mid: [128, 96, 172],  hor: [214, 136, 168], tint: [196, 178, 232], rim: [244, 176, 206], sun: [240, 150, 170], sunA: .12, dark: .35, star: .25, moon: .2, horY: -.9 },
    { p: .78, top: [18, 22, 70],    mid: [42, 40, 104],   hor: [96, 70, 140],   tint: [128, 140, 214], rim: [190, 200, 255], sun: [190, 180, 255], sunA: 0, dark: .7, star: .75, moon: .7, horY: -1.5 },
    { p: 1,   top: [5, 7, 26],      mid: [12, 14, 46],    hor: [34, 28, 84],    tint: [96, 110, 190],  rim: [176, 190, 255], sun: [180, 180, 255], sunA: 0, dark: 1, star: 1, moon: .5, horY: -2.2 },
  ];
  const lerp = (a, b, k) => a + (b - a) * k;
  function keyAt(P) {
    let i = 1; while (i < K.length - 1 && P > K[i].p) i++;
    const A = K[i - 1], Bk = K[i], k0 = Math.min(1, Math.max(0, (P - A.p) / (Bk.p - A.p))), k = k0 * k0 * (3 - 2 * k0), r = {};
    for (const n in A) r[n] = Array.isArray(A[n]) ? A[n].map((v, j) => lerp(v, Bk[n][j], k)) : lerp(A[n], Bk[n], k);
    return r;
  }

  let W = 0, H = 0, dirty = true, scale = 1;
  function resize() {
    W = innerWidth; H = innerHeight;
    scale = Math.min(1, Math.max(.45, 1100 / Math.max(W, H)));
    canvas.width = Math.round(W * scale); canvas.height = Math.round(H * scale);
    gl.viewport(0, 0, canvas.width, canvas.height); dirty = true;
  }
  resize(); addEventListener('resize', resize);

  let P = 0, lastP = -1, t0 = performance.now(), paused = false;
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });
  function draw(now) {
    const k = keyAt(P), f3 = v => v.map(x => x / 255);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uT, reduce ? 40 : (now - t0) / 1000 + 40);
    gl.uniform1f(U.uP, P); gl.uniform1f(U.uCam, P * 6.2);
    gl.uniform3fv(U.uTop, f3(k.top)); gl.uniform3fv(U.uMid, f3(k.mid)); gl.uniform3fv(U.uHor, f3(k.hor));
    gl.uniform3fv(U.uTint, f3(k.tint)); gl.uniform3fv(U.uRim, f3(k.rim)); gl.uniform3fv(U.uSunCol, f3(k.sun));
    const aspect = W / H;
    gl.uniform2f(U.uSun, aspect * (W < 760 ? .72 : .66), .2 - P * 1.1);
    gl.uniform1f(U.uSunA, k.sunA); gl.uniform1f(U.uDark, k.dark); gl.uniform1f(U.uStarA, k.star); gl.uniform1f(U.uMoonA, k.moon); gl.uniform1f(U.uHorY, k.horY);
    gl.uniform4f(U.uAsp, asp.farA || 1.5, asp.midA || 1.5, asp.cirA || 1.5, asp.wisp || 1.5); gl.uniform1f(U.uAsp2, asp.milky || 1.5);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    api.light = k.rim.map(Math.round);
  }
  function frame(now) {
    requestAnimationFrame(frame);
    if (paused) return;
    if (reduce && !dirty && Math.abs(P - lastP) < 1e-5) return;
    draw(now); lastP = P; dirty = false;
  }
  requestAnimationFrame(frame);
  api.setProgress = p => { P = p; api.progress = p; };
  return api;
})();
