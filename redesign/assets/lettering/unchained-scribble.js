/* UnchainedScribble: web port of "Unchained's 2D Presets and Elements" SCRIBBLE PRESETS (After Effects, 2016),
   decoded from G:\Editing\Unchained\Unchained's 2D Presets and Elements (CC12).aep — see redesign/AE-TOOLKIT-FINDINGS.md.

   Each AE preset is three stacked Turbulent Displace effects, every one with Evolution = wiggle(8,1000);
   the CHOPPY / VERY CHOPPY versions add Posterize Time 15 / 10 fps. Values straight from the project:
       LOW   amount  3 /  3 / 10   size 50 / 25 / 5
       MID   amount  6 /  7 / 17   size 50 / 25 / 5
       HIGH  amount 13 / 15 / 34   size 50 / 25 / 5
   Here: the element's text is drawn to a canvas texture and a WebGL shader applies the same three displacements
   in order, with 3-D simplex noise standing in for Turbulent Displace and its Evolution as the third axis.

   UnchainedScribble.mount(el, opts) -> { set(opts), frame(), destroy() }
     level: 'low' | 'mid' | 'high'          fps: 30 (comp rate, "smooth") | 15 (choppy) | 10 (very choppy) | 60
     color: CSS colour                       font: CSS family (defaults to the element's computed one)
     scale: AE px per CSS px of a 150px headline (default 1 = text as big as a typical 1080p AE title)
     gain:  displacement multiplier          wiggle: the wiggle amplitude in degrees (1000 in the preset)
     weight: extra stroke in em (thickens hairline fonts, e.g. .012)
   The element keeps its real text for screen readers; the canvas is aria-hidden. prefers-reduced-motion = one still frame. */
(() => {
  const PRESETS = {
    low:  [[3, 50], [3, 25], [10, 5]],
    mid:  [[6, 50], [7, 25], [17, 5]],
    high: [[13, 50], [15, 25], [34, 5]],
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* AE wiggle(freq, amp): value + amp * smooth noise(freq * t), independent per property */
  const hash = n => { const s = Math.sin(n * 127.1) * 43758.5453; return (s - Math.floor(s)) * 2 - 1; };
  const wiggle = (t, freq, amp, seed) => {
    const x = t * freq, i = Math.floor(x), f = x - i, u = f * f * f * (f * (f * 6 - 15) + 10);
    const a = hash(i + seed * 101.7), b = hash(i + 1 + seed * 101.7);
    return amp * (a + (b - a) * u);
  };

  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;
varying vec2 v;uniform sampler2D tex;uniform vec2 res;uniform vec3 amt;uniform vec3 siz;uniform vec3 evo;uniform float k;uniform vec4 col;
vec4 perm(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
float sn(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
 vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
 vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
 i=mod(i,289.);vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
 vec3 ns=.142857142857*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
 vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
 vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
 vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
 vec4 nm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=nm.x;p1*=nm.y;p2*=nm.z;p3*=nm.w;
 vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
 return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
/* one Turbulent Displace: offset (in px) of amount a, noise feature size s, evolution e */
vec2 td(vec2 q,float a,float s,float e,float o){vec3 n=vec3(q/(s*k*2.),e);
 /* AE's offset grows with Size: ~amount*size/100 px */
 return a*s*.015*k*vec2(sn(n+vec3(o,0.,0.)),sn(n+vec3(0.,o+31.4,0.)));}
void main(){vec2 q=v*res;
 /* effects run 1 -> 2 -> 3, so the lookup unwinds 3 first */
 q-=td(q,amt.z,siz.z,evo.z,17.);q-=td(q,amt.y,siz.y,evo.y,5.);q-=td(q,amt.x,siz.x,evo.x,0.);
 float a=texture2D(tex,q/res).a;gl_FragColor=vec4(col.rgb*a,a*col.a);}`;

  function parseColor(c) {
    const cv = document.createElement('canvas').getContext('2d'); cv.fillStyle = c; const s = cv.fillStyle;
    if (s[0] === '#') { const n = parseInt(s.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1]; }
    const m = s.match(/[\d.]+/g).map(Number); return [m[0] / 255, m[1] / 255, m[2] / 255, m[3] ?? 1];
  }

  function mount(el, opts = {}) {
    const o = Object.assign({ level: 'mid', fps: 30, gain: 1, wiggle: 1000, scale: 1, color: null, font: null, weight: 0 }, opts);
    const text = el.textContent.trim();
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.innerHTML = '';
    const words = text.split(/(\s+)/).map(w => { const s = document.createElement('span'); s.textContent = w; el.appendChild(s); return s; });
    el.style.color = 'transparent';
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;pointer-events:none;';
    el.appendChild(cv);
    const src = document.createElement('canvas'), sx = src.getContext('2d');
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) { el.style.color = ''; cv.remove(); return { set() {}, frame() {}, destroy() {} }; }

    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n), u = { res: U('res'), amt: U('amt'), siz: U('siz'), evo: U('evo'), k: U('k'), col: U('col') };
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([a, b]) => gl.texParameteri(gl.TEXTURE_2D, a, b));
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let W = 0, H = 0, dpr = 1, kpx = 1;
    function layout() {
      const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
      dpr = Math.min(devicePixelRatio || 1, 2);
      kpx = fs / 150 * o.scale * dpr;                       // AE px -> device px
      const pad = Math.ceil(24 * kpx * o.gain / dpr + 8);  // room for the largest (HIGH) displacement
      const r = el.getBoundingClientRect();
      W = r.width + pad * 2; H = r.height + pad * 2;
      cv.style.left = -pad + 'px'; cv.style.top = -pad + 'px'; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      cv.width = src.width = Math.round(W * dpr); cv.height = src.height = Math.round(H * dpr);
      sx.setTransform(dpr, 0, 0, dpr, 0, 0); sx.clearRect(0, 0, W, H);
      sx.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${o.font || cs.fontFamily}`;
      sx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      sx.textBaseline = 'middle'; sx.fillStyle = sx.strokeStyle = '#fff'; sx.lineWidth = o.weight * fs; sx.lineJoin = 'round';
      for (const s of words) { if (!s.textContent.trim()) continue; const b = s.getBoundingClientRect(), x = b.left - r.left + pad, y = b.top - r.top + b.height / 2 + pad; sx.fillText(s.textContent, x, y); if (o.weight) sx.strokeText(s.textContent, x, y); }
      gl.viewport(0, 0, cv.width, cv.height);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.uniform2f(u.res, cv.width, cv.height);
      apply();
    }
    function apply() {
      const p = PRESETS[o.level] || PRESETS.mid;
      gl.uniform3f(u.amt, p[0][0] * o.gain, p[1][0] * o.gain, p[2][0] * o.gain);
      gl.uniform3f(u.siz, p[0][1], p[1][1], p[2][1]);
      gl.uniform1f(u.k, kpx);
      gl.uniform4fv(u.col, parseColor(o.color || getComputedStyle(el.parentElement).color));
    }
    function draw(t) {
      // AE Evolution is in degrees; one revolution ~ one unit along the noise's third axis
      gl.uniform3f(u.evo, wiggle(t, 8, o.wiggle, 1) / 360, wiggle(t, 8, o.wiggle, 2) / 360 + 40, wiggle(t, 8, o.wiggle, 3) / 360 + 80);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    let raf = 0, last = -1, visible = true, t0 = performance.now();
    function tick(now) {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) / 1000, f = Math.floor(t * o.fps);  // Posterize Time
      if (f !== last) { last = f; draw(f / o.fps); }
    }
    const start = () => { if (!raf && !reduce && visible) raf = requestAnimationFrame(tick); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }); io.observe(el);
    const ro = new ResizeObserver(() => { layout(); draw(last / o.fps || 0); }); ro.observe(el);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { layout(); draw(0); start(); });

    return {
      canvas: cv,
      set(n) { const relayout = 'font' in n || 'scale' in n || 'gain' in n; Object.assign(o, n); last = -1; relayout ? layout() : apply(); draw(0); },
      frame: () => draw(last / o.fps || 0),
      destroy() { stop(); io.disconnect(); ro.disconnect(); cv.remove(); el.textContent = text; el.style.color = ''; },
    };
  }

  window.UnchainedScribble = { mount, PRESETS };
})();
