const puppeteer = require('puppeteer-core');
const [,, url, out, w = '1440', h = '900'] = process.argv;
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage();
  await p.setViewport({ width: +w, height: +h });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  p.on('console', m => { if (['error', 'warning'].includes(m.type())) console.log('CONSOLE', m.type(), m.text()); });
  p.on('requestfailed', r => console.log('REQFAIL', r.url(), r.failure()?.errorText));
  await p.goto(url, { waitUntil: 'networkidle0' });
  await sleep(4200);
  await p.screenshot({ path: out + '-0-hero.png' });
  // sweep the mouse across the name to trigger the reveal
  for (let i = 0; i <= 40; i++) await p.mouse.move(250 + i * 22, 330 + Math.sin(i / 4) * 120), await sleep(16);
  await sleep(120);
  await p.screenshot({ path: out + '-1-reveal.png' });
  const H = +h; let shot = 2;
  for (const y of [0.55, 1.4, 2.3, 3.6, 5.2, 7, 8.6, 10]) {
    await p.evaluate(y => window.scrollTo(0, y), Math.round(y * H));
    await sleep(1600);
    await p.screenshot({ path: `${out}-${shot++}-scroll${y}.png` });
  }
  console.log('docHeight', await p.evaluate(() => document.documentElement.scrollHeight));
  await b.close();
})().catch(e => { console.log('FATAL', e.message); process.exit(1); });
