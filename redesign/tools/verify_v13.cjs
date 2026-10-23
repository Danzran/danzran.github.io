/* Browser acceptance checks. Requires Playwright; optional --axe=/path/to/axe.min.js.
 * Serve the repository first, then: node redesign/tools/verify_v13.cjs
 * --base=http://127.0.0.1:8000 --report=/tmp/portfolio-validation.json
 */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const args = Object.fromEntries(process.argv.slice(2).map(arg => arg.replace(/^--/, '').split('=')));
const base = args.base || 'http://127.0.0.1:8000';
const report = {date: new Date().toISOString(), base, layouts: [], accessibility: [], interactions: [], links: [], errors: []};

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.PORTFOLIO_CHROMIUM || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    for (const theme of ['observatory', 'studio', 'skyline']) {
      for (const width of [320, 390, 768, 1024, 1440, 1920]) {
        const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
        page.on('pageerror', error => report.errors.push({theme, width, error: error.message}));
        page.on('response', response => { if (response.status() >= 400) report.errors.push({url: response.url(), status: response.status()}); });
        await page.goto(`${base}/redesign/drafts/v13-${theme}/`, {waitUntil: 'networkidle'});
        const dimensions = await page.evaluate(() => ({width: innerWidth, scroll: document.documentElement.scrollWidth}));
        assert(dimensions.scroll <= width + 1, `${theme} overflows at ${width}: ${dimensions.scroll}`);
        assert.equal(await page.locator('h1').count(), 1);
        assert(await page.locator('h1').innerText());
        await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => null))));
        const broken = await page.locator('img').evaluateAll(images => images.filter(image => !image.naturalWidth).map(image => image.src));
        assert.deepEqual(broken, []);
        report.layouts.push({theme, width, overflow: false, images: 'decoded'});
        if (args.axe && [390, 1440].includes(width)) {
          await page.addScriptTag({path: args.axe});
          const violations = await page.evaluate(async () => (await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}})).violations.map(v => ({id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target)})));
          report.accessibility.push({theme, width, violations});
          assert.deepEqual(violations, [], `${theme} accessibility at ${width}`);
        }
        if (width === 390) {
          const menu = page.locator('.menu-toggle');
          await menu.click(); assert.equal(await menu.getAttribute('aria-expanded'), 'true');
          await page.keyboard.press('Escape'); assert.equal(await menu.getAttribute('aria-expanded'), 'false');
          await menu.click(); await page.locator('#mobile-nav a[href="#work"]').click();
          assert.equal(await menu.getAttribute('aria-expanded'), 'false');
          assert.equal(new URL(page.url()).hash, '#work');
          report.interactions.push(`${theme}: mobile menu, Escape, section navigation`);
        }
        if (width === 1440) {
          const hrefs = await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => a.href));
          for (const href of new Set(hrefs.filter(href => href.startsWith(locationOrigin())))) {
            const url = new URL(href);
            const response = await page.request.get(url.origin + url.pathname);
            assert(response.ok(), `Local link ${href}: ${response.status()}`);
            report.links.push({url: url.pathname, status: response.status()});
          }
          function locationOrigin() { return new URL(base).origin; }
        }
        await page.close();
      }
      for (const kind of ['safe-ship', 'golf']) {
        for (const width of [390, 1440]) {
          const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
          page.on('pageerror', error => report.errors.push({theme, kind, error: error.message}));
          await page.goto(`${base}/redesign/drafts/v13-${theme}/${kind}.html`, {waitUntil: 'networkidle'});
          assert(await page.locator('h1').innerText());
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${theme}/${kind} at ${width} overflows`);
          if (args.axe) {
            await page.addScriptTag({path: args.axe});
            const violations = await page.evaluate(async () => (await axe.run()).violations.map(v => ({id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target)})));
            report.accessibility.push({theme, kind, width, violations});
            assert.deepEqual(violations, [], `${theme}/${kind} accessibility at ${width}`);
          }
          report.layouts.push({theme, kind, width, overflow: false});
          await page.close();
        }
      }
    }
    for (const width of [320, 390, 768, 1440]) {
      const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      page.on('response', response => { if (response.status() >= 400) report.errors.push({url: response.url(), status: response.status()}); });
      await page.goto(base, {waitUntil: 'networkidle'});
      await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => null))));
      assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(image => !image.naturalWidth).map(image => image.currentSrc)), [], 'Root responsive images decode');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      report.layouts.push({theme: 'root', width, overflow: false, images: 'decoded'});
      await page.close();
    }
    const context = await browser.newContext({permissions: ['clipboard-read', 'clipboard-write'], viewport: {width: 1440, height: 1000}});
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push({error: error.message}));
    await page.goto(`${base}/`, {waitUntil: 'networkidle'});
    assert(await page.locator('h1').innerText().then(text => text.includes('wonder')), 'Root uses Observatory');
    const reader = page.locator('.demo-play');
    await reader.scrollIntoViewIfNeeded();
    assert.equal(await reader.getAttribute('aria-pressed'), 'true', 'Reader automatically plays in view');
    const wordBefore = await page.locator('.reader-word').innerText();
    await page.waitForTimeout(800);
    assert.notEqual(await page.locator('.reader-word').innerText(), wordBefore, 'Reader changes words');
    await reader.click();
    const wordPaused = await page.locator('.reader-word').innerText();
    await page.waitForTimeout(450);
    assert.equal(await page.locator('.reader-word').innerText(), wordPaused, 'Reader stays paused');
    await page.locator('[data-answer="wrong"]').click();
    assert((await page.locator('.quiz-feedback').innerText()).includes('Try again'));
    await page.locator('[data-answer="correct"]').click();
    assert((await page.locator('.quiz-feedback').innerText()).includes('Exactly'));
    report.interactions.push('Root: reader play/pause, wrong/correct quiz answers');
    const swing = page.locator('.swing-play');
    await swing.scrollIntoViewIfNeeded(); await page.waitForTimeout(1300);
    assert.equal(await swing.getAttribute('aria-pressed'), 'true');
    assert(!(await page.locator('.swing-frame').getAttribute('src')).endsWith('g00.webp'), 'Swing advances');
    await swing.click();
    const pausedFrame = await page.locator('.swing-frame').getAttribute('src');
    await page.waitForTimeout(300);
    assert.equal(await page.locator('.swing-frame').getAttribute('src'), pausedFrame, 'Swing stays paused');
    report.interactions.push('Root: golf swing loads, animates, and pauses');
    await page.locator('.reel-play').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector('video').paused);
    await page.locator('.reel-play').click();
    assert(await page.locator('video').evaluate(video => video.paused));
    report.interactions.push('Root: original editing reel plays and pauses');
    await page.locator('.copy-email').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'dazran0929@gmail.com');
    report.interactions.push('Root: copy email writes the correct address');
    await page.locator('.motion-toggle').click();
    assert(await page.locator('body').evaluate(body => body.classList.contains('motion-paused')));
    await page.emulateMedia({reducedMotion: 'reduce'});
    assert.equal(await page.locator('.demo-play').getAttribute('aria-pressed'), 'false');
    report.interactions.push('Root: ambient motion pause, dynamic reduced-motion changes');
    await page.goto(`${base}/redesign/drafts/v13-gallery/`, {waitUntil: 'networkidle'});
    await page.locator('[data-theme="studio"]').click();
    assert((await page.locator('iframe').getAttribute('src')).includes('v13-studio'));
    await page.locator('[data-size="phone"]').click();
    assert(await page.locator('.preview-stage').evaluate(stage => stage.classList.contains('phone')));
    report.interactions.push('Gallery: live direction switching and phone preview');
    await context.close();
    const noJS = await browser.newPage({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
    await noJS.goto(base, {waitUntil: 'networkidle'});
    assert(await noJS.locator('h1').isVisible());
    assert(await noJS.locator('#mobile-nav').isVisible());
    assert(await noJS.locator('.email-link').isVisible());
    assert(await noJS.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    report.interactions.push('Root: content, navigation, and contact work without JavaScript');
    assert.deepEqual(report.errors, [], 'No runtime errors or failed responses');
    report.result = 'PASS';
  } catch (error) {
    report.result = 'FAIL'; report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (args.report) fs.writeFileSync(args.report, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({result: report.result, layouts: report.layouts.length, accessibilityAudits: report.accessibility.length, interactions: report.interactions, errors: report.errors, failure: report.failure}, null, 2));
  }
})();
