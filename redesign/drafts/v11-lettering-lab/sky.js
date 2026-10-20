/* Lab backdrop: a small living WebGL sky. Night indigo at the top, dusk rose and peach at the horizon,
   domain-warped fbm clouds that drift and morph with light moving through them, twinkling stars and an
   occasional shooting star. Scroll slides it from deep night (top of page) towards dusk (bottom).
   Rendered at reduced resolution; falls back to a CSS gradient without WebGL. Reduced motion: one still frame. */
(() => {
  const cv = document.getElementById('sky'); if (!cv) return;
  const gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false });
  if (!gl) { cv.style.background = 'linear-gradient(#141a3f, #3a3a7c 55%, #e6a2b8 85%, #f7c995)'; return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vs = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }';
  const fs = `precision highp float;
uniform vec2 R; uniform float T, S; uniform vec4 M; // M: shooting star (x0, y0, progress, alive)
float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return s; }
void main(){
  vec2 uv = gl_FragCoord.xy / R; float asp = R.x / R.y; vec2 q = vec2(uv.x * asp, uv.y);
  float dusk = clamp(S, 0., 1.);
  // sky gradient: night top -> violet -> rose -> peach horizon (horizon rises with dusk)
  float y = uv.y;
  vec3 top = mix(vec3(.055,.07,.19), vec3(.10,.11,.30), dusk);
  vec3 mid = mix(vec3(.16,.17,.42), vec3(.33,.27,.58), dusk);
  vec3 low = mix(vec3(.42,.33,.62), vec3(.92,.58,.70), dusk);
  vec3 hor = mix(vec3(.70,.50,.66), vec3(1.0,.79,.62), dusk);
  vec3 col = mix(hor, low, smoothstep(0., .22 + .1*dusk, y));
  col = mix(col, mid, smoothstep(.2, .55, y));
  col = mix(col, top, smoothstep(.5, 1., y));
  // stars (fade towards the horizon and with dusk)
  float sv = 0.; for (int L = 0; L < 2; L++){ float sc = L == 0 ? 90. : 180.; vec2 g = q * sc; vec2 id = floor(g), f = fract(g) - .5;
    float r = h(id + float(L) * 17.); if (r > .965){ vec2 o = vec2(h(id+3.1), h(id+7.7)) - .5; float d = length(f - o*.6);
      float tw = .55 + .45 * sin(T * (1.5 + r * 4.) + r * 60.); sv += smoothstep(.09 - float(L)*.03, 0., d) * tw * (L == 0 ? 1. : .6); } }
  col += vec3(1., .95, .9) * sv * smoothstep(.25, .75, y) * (1. - .55 * dusk);
  // clouds: two warped fbm layers drifting
  vec2 cp = vec2(q.x * 1.6 + T * .012, q.y * 3.2);
  vec2 w = vec2(fbm(cp + T * .02), fbm(cp + vec2(5.2, 1.3) - T * .015));
  float c1 = fbm(cp + 1.8 * w);
  float band = smoothstep(.62, .1, y) * smoothstep(-.05, .18, y) + .35 * smoothstep(.55, .85, y) * smoothstep(1.05, .8, y);
  float cl = smoothstep(.48, .78, c1) * band;
  float lit = fbm(cp * 1.7 + w * 2. - vec2(T * .03, 0.));       // light moving through the clouds
  vec3 shade = mix(vec3(.24,.21,.47), vec3(.55,.38,.62), dusk);
  vec3 rim = mix(vec3(.98,.78,.86), vec3(1.,.86,.66), smoothstep(.4, .1, y));
  vec3 ccol = mix(shade, rim, smoothstep(.35, .8, lit) * (.55 + .45 * smoothstep(.6, .0, y)));
  col = mix(col, ccol, cl * .82);
  col += rim * pow(cl, 3.) * .12;
  // shooting star
  if (M.w > .5){ vec2 a = vec2(M.x * asp, M.y), dir = normalize(vec2(-.8, -.42)); float len = .32;
    vec2 head = a + dir * M.z * .9; vec2 rel = q - head; float along = dot(rel, -dir), perp = abs(dot(rel, vec2(-dir.y, dir.x)));
    float tail = smoothstep(len, 0., along) * step(0., along) * smoothstep(.004, 0., perp) * sin(3.1416 * M.z);
    float hd = smoothstep(.012, 0., length(rel)) * sin(3.1416 * M.z);
    col += vec3(1., .93, .86) * (tail * .9 + hd * 1.4); }
  // gentle grain to avoid banding
  col += (h(gl_FragCoord.xy + fract(T)) - .5) / 255. * 2.;
  gl_FragColor = vec4(col, 1.);
}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = k => gl.getUniformLocation(pr, k), uR = U('R'), uT = U('T'), uS = U('S'), uM = U('M');
  const scale = .5;
  function size() { const w = Math.round(innerWidth * scale), h = Math.round(innerHeight * scale); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); } }
  let star = { x: 0, y: 0, t0: -99 }, next = 2.5;
  function frame(ms) {
    const t = ms / 1000; size();
    const sc = Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
    if (t > next) { star = { x: .45 + Math.random() * .6, y: .7 + Math.random() * .25, t0: t }; next = t + 5 + Math.random() * 7; }
    const sp = (t - star.t0) / 1.1;
    gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, reduce ? 20 : t); gl.uniform1f(uS, .15 + sc * .75);
    gl.uniform4f(uM, star.x, star.y, Math.min(1, sp), sp >= 0 && sp < 1 && !reduce ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduce) requestAnimationFrame(frame);
  }
  if (reduce) { addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true }); addEventListener('resize', () => requestAnimationFrame(frame)); }
  requestAnimationFrame(frame);
})();
