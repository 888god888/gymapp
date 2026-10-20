// npm install; npx playwright install chromium; npm run test:browser
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  let server;
  let BASE = process.env.TEST_URL;
  if (!BASE) {
    const root = path.resolve(__dirname, '..');
    server = http.createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (error, data) => {
        if (error) { res.writeHead(404); res.end(); return; }
        const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
        res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        res.end(data);
      });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    BASE = 'http://127.0.0.1:' + server.address().port;
  }
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // External media is tested independently. The UI must tolerate blocked photos and thumbnails.
  await context.route(/https:\/\/(raw\.githubusercontent\.com|i\.ytimg\.com)\//, route => route.abort());
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.item');
  assert.equal(await page.locator('.item').count(), 71);
  await page.fill('#search', '側平舉');
  assert.equal(await page.locator('.item').count(), 2);
  await page.click('[data-part="leg"]');
  assert.equal(await page.locator('.item').count(), 0);
  await page.click('#reset');
  await page.selectOption('#equipment', 'cable');
  assert.ok(await page.locator('.item').count() > 0);
  await page.selectOption('#media', 'video');
  assert.ok(await page.locator('.item').count() > 0);
  await page.click('#reset');
  await page.fill('#search', 'FACE PULL');
  await page.click('.item');
  await page.waitForSelector('#save');
  assert.equal(await page.locator('h1').textContent(), '臉拉 Face Pull');
  await page.click('#save');
  assert.equal(await page.locator('#save').getAttribute('aria-pressed'), 'true');
  const hash = await page.evaluate(() => location.hash);
  await page.click('[data-scroll="steps"]');
  assert.equal(await page.evaluate(() => location.hash), hash);
  // The video is user initiated and has a direct external fallback.
  assert.equal(await page.locator('iframe').count(), 0);
  await page.route('https://www.youtube-nocookie.com/**', route => route.abort());
  await page.click('[data-video]');
  assert.match(await page.locator('iframe').getAttribute('src'), /eTCBSFlCJ_s/);
  await page.click('.back');
  assert.equal(await page.inputValue('#search'), 'FACE PULL');
  await page.click('.item');
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('#save').getAttribute('aria-pressed'), 'true');
  await page.click('.saved-link');
  await page.click('#reset');
  assert.equal(await page.locator('.item').count(), 1);
  await page.click('.item');
  await page.click('#save');
  await page.click('.back');
  assert.equal(await page.locator('.item').count(), 0);
  await page.goto(BASE + '/#chest/0', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('h1').textContent(), '槓鈴臥推');
  const all = await page.evaluate(() => window.GYM_DATA.flatMap(p => p.x.map(x => ({ id: x.id, name: x.n }))));
  for (const x of all) {
    await page.evaluate(id => { location.hash = 'exercise/' + encodeURIComponent(id); }, x.id);
    await page.waitForFunction(name => document.querySelector('h1')?.textContent === name, x.name);
    assert.ok(await page.locator('.steps li').count() >= 3, x.id);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `mobile overflow: ${x.id}`);
  }
  for (const hash of ['#unknown/0', '#chest/999', '#chest/-1', '#exercise/%E0%A4%A', '#%3Cimg%20src=x%20onerror=alert(1)%3E']) {
    await page.goto(BASE + '/' + hash, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('h1').textContent(), '找不到這個動作');
  }
  assert.equal(await page.locator('[onerror]').count(), 0);
  await page.goto(BASE + '/#exercise/Side_Lateral_Raise', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: '/tmp/gym-detail-mobile.png', fullPage: true });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: '/tmp/gym-home-mobile.png', fullPage: false });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: '/tmp/gym-home-desktop.png', fullPage: false });
  // Corrupted and unavailable storage must not prevent opening an exercise.
  await page.evaluate(() => localStorage.setItem('gym-favorites-v1', '{}'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('.item').count(), 71);
  const restricted = await browser.newContext();
  await restricted.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('disabled'); } }));
  const restrictedPage = await restricted.newPage();
  await restrictedPage.goto(BASE + '/#abs/3', { waitUntil: 'domcontentloaded' });
  await restrictedPage.click('#save');
  assert.match(await restrictedPage.locator('#notice').textContent(), /本次開啟/);
  // After installation, the full text catalogue and controls work offline.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('.item').count(), 71);
  await page.click('.item');
  await page.waitForSelector('.steps');
  assert.equal(errors.length, 0, errors.join('\n'));
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  console.log('PASS: 71 exercise routes, mobile overflow, filters, favorites, media fallbacks, malformed links/storage, offline shell');
})().catch(e => { console.error(e); process.exit(1); });
