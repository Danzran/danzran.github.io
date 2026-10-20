/* Lettering lab: builds one tile per effect, each with "Daniel Azran" plus a section word. */
(() => {
  const TILES = [
    { fx: 'LightPaint', title: 'Light painting', font: 'Shippori Mincho B1',
      note: 'A shooting-star head traces each contour; the white-hot trail cools to gold and the letter fills with light, then shimmers.',
      name: {}, word: { palette: 'ice' } },
    { fx: 'PencilScribble', title: 'Colored-pencil scribble', font: 'Mochiy Pop One',
      note: 'Loose zig-zag hatching in three pastel pencils fills the letters, with pencil grain, re-scribbling gently on twos.',
      name: {}, word: { colors: ['#bcd3ff', '#d7c4ff', '#fff3e4'] } },
    { fx: 'InkBrush', title: 'Ink brush write-on', font: 'Kaushan Script',
      note: 'Each stroke is painted in order along the letter’s centre-line by a bristle brush, breaking into dry-brush streaks, then breathes.',
      name: {}, word: {} },
    { fx: 'SketchPass', title: 'Sketchy overshoot', font: 'DM Serif Display',
      note: 'Two or three loose pencil passes per edge overshoot the corners, then settle into place over a soft wash.',
      name: {}, word: {} },
    { fx: 'RedCord', title: 'Red cord (kumihimo)', font: 'EMS Allure (single-line)',
      note: 'A braided red-orange cord threads along the pen path of a single-line script, with a gold bead at its tip and a silk sheen.',
      name: {}, word: {} },
    { fx: 'Constellation', title: 'Constellation', font: 'EMS Nixish (single-line)',
      note: 'Stars light up at the letters’ corners and join with thin lines; a shooting star links the last one, then they twinkle.',
      name: {}, word: {} },
    { fx: 'ChalkPastel', title: 'Chalk pastel', font: 'Shrikhand',
      note: 'Short pastel chalk strokes with paper tooth build up the letters on twos, finished with a chalk edge line.',
      name: {}, word: {} },
    { fx: 'NeonWrite', title: 'Neon pen write-on', font: 'Relief SingleLine',
      note: 'True pen-order writing with a single-line font: a spark writes a neon tube that flickers on and hums.',
      name: {}, word: { color: 'azure' } },
  ];
  const q = new URLSearchParams(location.search), only = +q.get('only') || 0;
  const grid = document.getElementById('grid'), ctls = [];
  TILES.forEach((T, i) => {
    if (only && only !== i + 1) return;
    const art = document.createElement('article'); art.className = 'tile';
    art.innerHTML = `<div class="tile-head"><span class="num">${String(i + 1).padStart(2, '0')}</span><h2>${T.title}</h2><span class="font">${T.font}</span><button type="button" class="replay">Replay</button></div>
      <div class="stage"><div class="name"></div><div class="word"></div></div><p class="note">${T.note}</p>`;
    grid.appendChild(art);
    const FX = window[T.fx], mine = [];
    if (!FX) { art.querySelector('.stage').textContent = T.fx + ' is not loaded'; return; }
    try {
      mine.push(FX.render(art.querySelector('.name'), Object.assign({ text: 'Daniel Azran', size: 118, minSize: 58 }, T.name)));
      mine.push(FX.render(art.querySelector('.word'), Object.assign({ text: 'Experience', size: 66, delay: .5, fill: .62 }, T.word)));
    } catch (e) { console.error(T.fx, e); art.querySelector('.stage').textContent = T.fx + ': ' + e.message; }
    art.querySelector('.replay').addEventListener('click', () => mine.forEach(c => c.replay()));
    ctls.push(...mine);
  });
  document.getElementById('replay-all').addEventListener('click', () => ctls.forEach(c => c.replay()));
  const loop = document.getElementById('loop');
  loop.addEventListener('change', () => LetterCore.setLoop(loop.checked));
  if (q.get('loop') === '1') { loop.checked = true; LetterCore.setLoop(true); }
})();
