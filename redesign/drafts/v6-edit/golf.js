/* v6 edit palette (white ink on graded footage). Golf swing card: pastel rotoscoped frames (tools/golf_stylize.py) played at 12 fps,
   with a hand-drawn analysis layer re-scribbled every frame from MediaPipe keypoints. */
window.GolfSwing = (() => {
  const S = window.SWING;
  const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
  const NODES = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  const PASTEL = ['#ffd1e6', '#bff3ff', '#fff3c4', '#e5d4ff', '#ffffff'];
  const INK = '#ffffff';

  function mount(canvas, statsEl, base) {
    const ctx = canvas.getContext('2d');
    const frames = Array.from({ length: S.frames }, (_, i) => {
      const im = new Image(); im.src = `${base}/g${String(i).padStart(2, '0')}.webp`; return im;
    });
    let f = 0, playing = false, last = 0, hold = 0;
    const trail = [];
    const fit = () => {
      // layout size, not getBoundingClientRect: entrance transforms (scale/skew) must not shrink the buffer
      const d = Math.min(devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * d; canvas.height = canvas.clientHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    fit(); new ResizeObserver(fit).observe(canvas);
    new IntersectionObserver(([e]) => playing = e.isIntersecting).observe(canvas);

    const jit = (a = 1.6) => (Math.random() - .5) * a;
    function scribbleLine(x1, y1, x2, y2, color, w = 2.4) {
      for (let p = 0; p < 2; p++) {
        ctx.strokeStyle = color; ctx.lineWidth = w - p * .8; ctx.globalAlpha = p ? .55 : 1;
        ctx.beginPath(); ctx.moveTo(x1 + jit(), y1 + jit());
        const mx = (x1 + x2) / 2 + jit(4), my = (y1 + y2) / 2 + jit(4);
        ctx.quadraticCurveTo(mx, my, x2 + jit(), y2 + jit()); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    function scribbleDot(x, y, r, fill) {
      ctx.fillStyle = fill; ctx.beginPath();
      for (let a = 0; a <= 6.4; a += .5) { const rr = r + jit(1.4); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke();
    }
    function hand(text, x, y, size = 16, color = INK, rot = 0) {
      ctx.save(); ctx.translate(x + jit(1), y + jit(1)); ctx.rotate(rot + jit(.03));
      ctx.font = `${size}px "Gochi Hand", "Patrick Hand", cursive`; ctx.fillStyle = color; ctx.fillText(text, 0, 0); ctx.restore();
    }
    function arc(cx, cy, a1, a2, r, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.beginPath();
      let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      for (let t = 0; t <= 1.001; t += .1) { const a = a1 + d * t, rr = r + jit(1.5); ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      ctx.stroke();
    }

    function draw() {
      const W = canvas.clientWidth, H = canvas.clientHeight;
      // cover-fit the 600x800 frame
      const s = Math.max(W / S.w, H / S.h), dw = S.w * s, dh = S.h * s, ox = (W - dw) / 2, oy = (H - dh) / 2;
      const im = frames[f];
      if (im.complete && im.naturalWidth) ctx.drawImage(im, ox, oy, dw, dh);
      const kp = S.kp[f], P = i => [ox + kp[i][0] * dw, oy + kp[i][1] * dh];
      const k = Math.max(1, W / 340);   // scale strokes + labels with the card

      // hand path (club grip) trail
      const hx = (P(15)[0] + P(16)[0]) / 2, hy = (P(15)[1] + P(16)[1]) / 2;
      trail.push([hx, hy]); if (trail.length > 14) trail.shift();
      ctx.setLineDash([2, 7]); ctx.lineCap = 'round';
      for (let i = 1; i < trail.length; i++) scribbleLine(...trail[i - 1], ...trail[i], '#e0679a', 3.2 * k);
      ctx.setLineDash([]);

      // shoulder + hip lines extended, spine
      const ext = (a, b, k) => [a[0] + (a[0] - b[0]) * k, a[1] + (a[1] - b[1]) * k];
      scribbleLine(...ext(P(11), P(12), .5), ...ext(P(12), P(11), .5), '#8fb4ff', 2.4 * k);
      scribbleLine(...ext(P(23), P(24), .6), ...ext(P(24), P(23), .6), '#b39dff', 2.4 * k);
      const ms = [(P(11)[0] + P(12)[0]) / 2, (P(11)[1] + P(12)[1]) / 2], mh = [(P(23)[0] + P(24)[0]) / 2, (P(23)[1] + P(24)[1]) / 2];
      ctx.setLineDash([6, 6]); scribbleLine(...mh, ...ext(ms, mh, .35), '#ffab7a', 2.2 * k); ctx.setLineDash([]);

      // skeleton + nodes
      ctx.lineCap = 'round';
      for (const [a, b] of BONES) scribbleLine(...P(a), ...P(b), INK, 2.8 * k);
      NODES.forEach((n, i) => scribbleDot(...P(n), (n === 0 ? 7 : 5) * k, PASTEL[(i + f) % PASTEL.length]));

      // angle arcs: lead elbow + trail knee
      const [leadArm, knee, sep, spine] = S.per_frame[f];
      const ang = (o, p) => Math.atan2(p[1] - o[1], p[0] - o[0]);
      arc(...P(13), ang(P(13), P(11)), ang(P(13), P(15)), 18 * k, '#e0679a');
      hand(`${leadArm}°`, P(13)[0] - 50 * k, P(13)[1] - 10 * k, 19 * k, '#b8457d');
      arc(...P(26), ang(P(26), P(24)), ang(P(26), P(28)), 18 * k, '#5b7fd6');
      hand(`${knee}°`, P(26)[0] + 16 * k, P(26)[1] + 6 * k, 19 * k, '#3f5fb8');
      hand(`sep ${sep}°`, ms[0] + 30 * k, ms[1] - 18 * k, 17 * k, '#6a52c9', -.06);

      // phase sticker
      const ph = S.phases;
      const tag = f >= ph.impact && f < ph.impact + 6 ? 'impact!' : f >= ph.top && f < ph.top + 4 ? 'top of swing' : f <= ph.address + 2 ? 'address' : '';
      if (tag) {
        ctx.save(); ctx.translate(18, 34); ctx.rotate(-.05 + jit(.02));
        ctx.fillStyle = '#fff0b8'; ctx.beginPath(); ctx.moveTo(-6 + jit(), -24 + jit()); ctx.lineTo(tag.length * 10 + 10 + jit(), -26 + jit());
        ctx.lineTo(tag.length * 10 + 6 + jit(), 10 + jit()); ctx.lineTo(-8 + jit(), 8 + jit()); ctx.fill();
        ctx.restore(); hand(tag, 22, 38, 22, INK, -.05);
      }
      if (statsEl) statsEl.querySelector('[data-live]').textContent = `lead arm ${leadArm}° · knee ${knee}° · spine ${spine}°`;
    }

    function loop(now) {
      requestAnimationFrame(loop);
      if (!playing || now - last < 1000 / S.fps) return;
      last = now;
      if (hold > 0) { hold--; draw(); return; }   // re-scribble the held frame so it keeps boiling
      draw();
      if (f === S.frames - 1 && !paused) { hold = 10; paused = true; return; } // pause a beat at the finish
      paused = false;
      f = (f + 1) % S.frames;
      if (f === 0) trail.length = 0;
    }
    let paused = false;
    frames[0].onload = draw;
    requestAnimationFrame(loop);
    if (statsEl) {
      statsEl.querySelector('[data-tempo]').textContent = `${S.tempo} : 1`;
      statsEl.querySelector('[data-back]').textContent = `${S.backswing_s}s`;
      statsEl.querySelector('[data-down]').textContent = `${S.downswing_s}s`;
      statsEl.querySelector('[data-speed]').textContent = `~${S.peak_hand_speed_ms} m/s`;
    }
  }
  return { mount };
})();
