const glyphs = {
  D: [
    'M 12 72 L 13 10 C 77 3 79 72 12 72',
    'M 14 71 L 11 11 C 70 1 84 70 14 71',
    'M 11 73 L 15 9 C 76 8 74 78 11 73'
  ],
  A: [
    'M 6 72 L 32 9 L 59 73 M 17 47 L 48 46',
    'M 8 73 L 30 11 L 58 71 M 19 49 L 46 44',
    'M 5 71 L 34 8 L 57 74 M 16 45 L 48 48'
  ],
  N: [
    'M 11 72 L 12 10 L 54 71 L 55 11',
    'M 13 73 L 10 12 Q 33 42 56 70 L 53 9',
    'M 10 71 L 14 8 L 52 73 L 56 13'
  ],
  I: [
    'M 13 11 L 46 10 M 30 11 L 29 71 M 12 72 L 47 71',
    'M 11 9 L 48 12 M 28 11 L 32 73 M 14 71 L 46 74',
    'M 14 13 L 45 9 M 32 10 L 27 70 M 11 74 L 49 70'
  ],
  E: [
    'M 52 10 L 12 12 L 11 72 L 54 70 M 12 41 L 45 40',
    'M 54 12 L 10 9 L 14 71 L 51 73 M 12 39 L 43 43',
    'M 50 8 L 14 14 L 10 74 L 55 69 M 13 44 L 46 38'
  ],
  L: [
    'M 13 10 L 11 71 L 53 72',
    'M 11 12 L 14 74 L 51 69',
    'M 15 9 L 10 70 Q 33 75 55 71'
  ],
  Z: [
    'M 10 12 L 55 10 L 9 72 L 57 70',
    'M 12 9 L 53 13 L 11 70 L 55 73',
    'M 8 14 Q 32 9 57 11 L 8 74 L 58 69'
  ],
  R: [
    'M 12 72 L 13 10 C 71 1 68 46 13 42 M 33 41 L 57 73',
    'M 14 73 L 11 12 C 64 3 74 43 12 44 M 31 43 L 55 71',
    'M 10 71 L 15 9 C 73 5 61 48 14 40 M 35 42 L 59 74'
  ]
};

const markVariants = {
  circle: [
    'M 64 90 C 52 12 293 12 302 89 C 320 174 54 185 64 90',
    'M 66 94 C 49 18 295 8 306 91 C 317 169 59 188 62 94',
    'M 61 86 C 60 9 287 18 300 94 C 326 177 48 178 65 87'
  ],
  arrow: [
    'M 325 184 Q 389 104 290 64 M 291 64 L 316 66 M 290 64 L 298 86',
    'M 329 181 Q 383 102 292 62 M 292 62 L 315 65 M 292 62 L 296 85',
    'M 322 186 Q 395 107 289 66 M 289 66 L 318 69 M 289 66 L 300 88'
  ],
  underline: [
    'M 92 182 Q 178 171 257 181 M 104 194 Q 181 182 240 190',
    'M 94 184 Q 177 169 260 180 M 102 192 Q 185 186 243 188',
    'M 89 180 Q 183 174 255 183 M 106 195 Q 175 180 238 192'
  ],
  cutout: [
    'M 115 40 L 273 32 L 295 167 L 258 185 L 123 177 L 102 66 Z',
    'M 117 38 L 270 34 L 297 164 L 260 183 L 121 180 L 105 65 Z',
    'M 113 42 L 275 31 L 293 169 L 255 187 L 125 175 L 100 68 Z'
  ]
};

const lettering = document.querySelector('#lettering');
const cadence = document.querySelector('#cadence');
const pauseButton = document.querySelector('#pause');
const stepButton = document.querySelector('#step');
const registration = document.querySelector('#registration');
const status = document.querySelector('#status');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const namespace = 'http://www.w3.org/2000/svg';
const letters = [];
const marks = Object.entries(markVariants).map(([identifier, variants]) => ({
  element: document.getElementById(identifier), variants
}));
const peachPaper = document.querySelector('#peach-paper');
const bluePaper = document.querySelector('#blue-paper');
const offsets = [[0, 0, 0], [1.5, -1, .35], [-1, 1, -.3]];
let drawing = 0;
let paused = false;
let visible = true;
let timer;
let lastTime = performance.now();
let remainder = 0;

lettering.replaceChildren();
for (const [wordIndex, word] of ['DANIEL', 'AZRAN'].entries()) {
  for (const [letterIndex, letter] of [...word].entries()) {
    const path = document.createElementNS(namespace, 'path');
    path.setAttribute('transform', `translate(${22 + letterIndex * 72 + wordIndex * 72} ${22 + wordIndex * 116})`);
    lettering.append(path);
    letters.push({ element: path, variants: glyphs[letter], phase: letterIndex + wordIndex });
  }
}

function render() {
  for (const letter of letters) {
    letter.element.setAttribute('d', letter.variants[(drawing + letter.phase) % 3]);
  }
  for (const [index, mark] of marks.entries()) {
    mark.element.setAttribute('d', mark.variants[(drawing + index) % 3]);
  }
  const [horizontal, vertical, rotation] = registration.checked ? offsets[drawing % 3] : offsets[0];
  peachPaper.setAttribute('transform', `translate(${horizontal} ${vertical}) rotate(${rotation} 200 110)`);
  bluePaper.setAttribute('transform', `translate(${-horizontal} ${-vertical}) rotate(${-rotation} 160 120)`);
}

function active() {
  return !paused && !motionPreference.matches && visible && !document.hidden;
}

function schedule() {
  clearTimeout(timer);
  lastTime = performance.now();
  remainder = 0;
  pauseButton.disabled = motionPreference.matches;
  cadence.disabled = motionPreference.matches;
  pauseButton.textContent = paused ? 'Play motion' : 'Pause motion';
  pauseButton.setAttribute('aria-pressed', String(paused));
  stepButton.disabled = !paused && !motionPreference.matches;
  status.textContent = motionPreference.matches ? 'System motion reduced' : paused ? 'Paused — inspect a drawing' : 'Playing';
  if (active()) timer = setTimeout(tick, 1000 / Number(cadence.value));
}

function tick() {
  if (!active()) return;
  const now = performance.now();
  const interval = 1000 / Number(cadence.value);
  remainder += now - lastTime;
  lastTime = now;
  const advances = Math.floor(remainder / interval);
  if (advances > 0) {
    drawing += advances;
    remainder %= interval;
    render();
  }
  timer = setTimeout(tick, interval - remainder);
}

pauseButton.addEventListener('click', () => {
  paused = !paused;
  schedule();
});
stepButton.addEventListener('click', () => {
  drawing += 1;
  render();
});
cadence.addEventListener('change', schedule);
registration.addEventListener('change', render);
document.addEventListener('visibilitychange', schedule);
motionPreference.addEventListener('change', () => {
  drawing = 0;
  render();
  schedule();
});
const observer = new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  schedule();
});
observer.observe(document.querySelector('.studies'));
registration.disabled = false;
render();
schedule();
