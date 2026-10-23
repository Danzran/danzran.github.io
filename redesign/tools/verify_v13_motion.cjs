/* Measure actual motion and local-file compatibility, not just control state.
 * Run with Playwright available: node redesign/tools/verify_v13_motion.cjs
 */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname, '../..');
const base = process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:8000';
const report = {date: new Date().toISOString(), checks: [], errors: []};

(async () => {
  const browser = await chromium.launch({executablePath: process.env.PORTFOLIO_CHROMIUM || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  try {
    const p = await browser.newPage({viewport: {width: 1440, height: 1000}, reducedMotion: 'no-preference'});
    p.on('pageerror', error => report.errors.push(error.message));
    await p.goto(base, {waitUntil: 'networkidle'});
    const pixels = () => p.locator('.atmosphere').evaluate(canvas => canvas.toDataURL());
    const a = await pixels(); await p.waitForTimeout(350);
    assert.notEqual(await pixels(), a, 'Star canvas pixels advance');
    report.checks.push('Observatory canvas pixels change over time');

    await p.locator('.spreed-screen').scrollIntoViewIfNeeded();
    const firstWord = await p.locator('.reader-word').innerText(); await p.waitForTimeout(470);
    assert.notEqual(await p.locator('.reader-word').innerText(), firstWord, 'Reader starts without clicking');
    await p.locator('.demo-play').click();
    const pausedWord = await p.locator('.reader-word').innerText(); await p.waitForTimeout(350);
    assert.equal(await p.locator('.reader-word').innerText(), pausedWord, 'Pause holds the reader');
    report.checks.push('Reader autoplays and visibly pauses');

    await p.locator('.golf-frame').scrollIntoViewIfNeeded();
    await p.waitForFunction(() => document.querySelector('.swing-frame').src.includes('/golf/g') && !document.querySelector('.swing-frame').src.endsWith('g00.webp'));
    const frame = await p.locator('.swing-frame').getAttribute('src'); await p.waitForTimeout(350);
    assert.notEqual(await p.locator('.swing-frame').getAttribute('src'), frame, 'Swing frames advance');
    await p.locator('.swing-play').click();
    const held = await p.locator('.swing-frame').getAttribute('src'); await p.waitForTimeout(300);
    assert.equal(await p.locator('.swing-frame').getAttribute('src'), held);
    report.checks.push('Swing frames automatically advance, then hold on pause');

    await p.locator('.reel-wrap').scrollIntoViewIfNeeded();
    await p.waitForFunction(() => document.querySelector('video').currentTime > .1);
    const t = await p.locator('video').evaluate(video => video.currentTime); await p.waitForTimeout(350);
    assert((await p.locator('video').evaluate(video => video.currentTime)) > t, 'Reel time advances');
    await p.locator('.reel-play').click();
    assert(await p.locator('video').evaluate(video => video.paused));
    report.checks.push('Muted reel autoplays, currentTime advances, pause works');

    await p.goto(`${base}/redesign/drafts/v13-studio/`, {waitUntil: 'networkidle'});
    const wave = () => p.locator('.signal-wave i').first().evaluate(el => getComputedStyle(el).transform);
    const w = await wave(); await p.waitForTimeout(350);
    assert.notEqual(await wave(), w, 'Wave transforms advance');
    report.checks.push('Studio waveform transform changes over time');

    await p.goto(`${base}/redesign/drafts/v13-skyline/`, {waitUntil: 'networkidle'});
    await p.waitForFunction(() => window.SF?.sky?.t > 0);
    const sky = await p.evaluate(() => window.SF.sky.t); await p.waitForTimeout(600);
    assert((await p.evaluate(() => window.SF.sky.t)) > sky, 'Sky shader advances');
    const horizon = await p.evaluate(() => window.SF.sky.horizonY());
    await p.evaluate(() => window.scrollTo(0, 700)); await p.waitForTimeout(300);
    assert.notEqual(await p.evaluate(() => window.SF.sky.horizonY()), horizon, 'Sky responds to scrolling');
    report.checks.push('Sky shader advances with time and camera responds to scroll');

    await p.emulateMedia({reducedMotion: 'reduce'});
    await p.goto(base, {waitUntil: 'networkidle'});
    const still = await pixels(); await p.waitForTimeout(350);
    assert.equal(await pixels(), still, 'Reduced-motion stars stay still');
    await p.locator('.spreed-screen').scrollIntoViewIfNeeded();
    const stillWord = await p.locator('.reader-word').innerText(); await p.waitForTimeout(350);
    assert.equal(await p.locator('.reader-word').innerText(), stillWord);
    report.checks.push('Reduced-motion stars and reader remain static');

    // Check the actual file delivery graph; do not exempt the root's rebased paths.
    for (const relative of ['index.html', ...['observatory', 'studio', 'skyline'].flatMap(theme => ['index', 'golf', 'safe-ship'].map(page => `redesign/drafts/v13-${theme}/${page}.html`))]) {
      const file = path.join(root, relative), html = fs.readFileSync(file, 'utf8');
      assert(!/<script[^>]*type=["']module/.test(html), `${relative} must not require ES modules`);
      for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)/g)) {
        assert(fs.existsSync(path.resolve(path.dirname(file), match[1])), `${relative}: script exists`);
      }
    }
    const source = fs.readFileSync(path.join(root, 'redesign/drafts/v13-shared/app.js'), 'utf8');
    assert(!source.includes('import.meta') && !/\bfetch\s*\(/.test(source), 'Shared runtime has no module or file-fetch requirement');
    assert(fs.existsSync(path.join(root, 'redesign/assets/golf/swing.js')));
    report.checks.push('All ten pages use existing classic scripts; golf uses file-compatible JS data');

    const local = await browser.newPage({viewport: {width: 390, height: 844}});
    try {
      await local.goto(pathToFileURL(path.join(root, 'index.html')).href);
      await local.waitForSelector('.motion-toggle');
      await local.locator('.menu-toggle').click();
      assert.equal(await local.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
      report.fileBrowser = 'PASS: direct file page initializes and menu works';
    } catch (error) {
      if (error.message.includes('ERR_BLOCKED_BY_ADMINISTRATOR')) report.fileBrowser = 'NOT VERIFIED: managed Chromium blocks file:// navigation before loading HTML';
      else throw error;
    }
    assert.deepEqual(report.errors, []);
    report.result = 'PASS';
  } catch (error) { report.result = 'FAIL'; report.failure = error.stack; process.exitCode = 1; }
  finally {
    await browser.close();
    fs.writeFileSync(path.join(root, 'redesign/shots/v13/motion-validation.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  }
})();
