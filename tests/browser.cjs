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
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE, args:['--no-sandbox','--disable-dev-shm-usage'] } : {}) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  await context.route('https://www.youtube-nocookie.com/**', route=>route.fulfill({contentType:'text/html',body:'<html><body>Embedded player test double</body></html>'}));
  await context.route('https://www.youtube.com/iframe_api', route=>route.fulfill({contentType:'text/javascript',body:`
    window.__mockPlayers=[];
    window.YT={ Player:function(frame,opts){
      this.time=0;this.state=2;this.rate=1;this.destroyed=false;
      this.getDuration=()=>26;this.getCurrentTime=()=>this.time;
      this.getPlayerState=()=>this.state;this.getAvailablePlaybackRates=()=>[0.5,0.75,1];
      this.setPlaybackRate=r=>this.rate=r;this.getPlaybackRate=()=>this.rate;
      this.seekTo=t=>this.time=t;this.playVideo=()=>{this.state=1;setTimeout(()=>opts.events.onStateChange({data:1}),0);};
      this.destroy=()=>{this.destroyed=true;frame.remove();};
      window.__mockPlayers.push(this);setTimeout(()=>opts.events.onReady({target:this}),0);
    }};
    window.onYouTubeIframeAPIReady();
  `}));
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
  // Embedded video is present immediately; playback still requires a user action.
  assert.equal(await page.locator('iframe').count(), 1);
  assert.match(await page.locator('iframe').getAttribute('src'), /eTCBSFlCJ_s/);
  await page.waitForFunction(() => !document.querySelector('[data-player-action="replay"]').disabled);
  await page.check('[data-prep="0"]');
  assert.match(await page.locator('#prep-status').textContent(), /1 \/ 3/);
  await page.click('#practice-toggle');
  assert.equal(await page.locator('.step-card:visible').count(),1);
  await page.click('#practice-next');
  assert.match(await page.locator('#practice-progress').textContent(), /2 \/ 5/);
  await page.click('#practice-toggle');
  assert.equal(await page.locator('.step-card:visible').count(),5);
  await page.click('.clip-editor summary');
  await page.fill('[data-clip-start]','8'); await page.fill('[data-clip-end]','4');
  await page.click('[data-player-action="apply"]');
  assert.match(await page.locator('[data-player-status]').textContent(), /終點需晚/);
  await page.fill('[data-clip-start]','3'); await page.fill('[data-clip-end]','13');
  await page.click('[data-player-action="apply"]');
  assert.match(await page.locator('[data-player-status]').textContent(), /3.0–13.0/);
  await page.selectOption('[data-rate]','0.5');
  assert.equal(await page.evaluate(()=>window.__mockPlayers.at(-1).rate),0.5);
  await page.evaluate(()=>{const p=window.__mockPlayers.at(-1);p.time=13.5;p.state=1;});
  await page.waitForFunction(()=>window.__mockPlayers.at(-1).time===3);
  await page.uncheck('[data-repeat]');
  await page.evaluate(()=>{const p=window.__mockPlayers.at(-1);p.time=14;p.state=1;});
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>window.__mockPlayers.at(-1).time),14);
  await page.click('[data-player-action="last-ten"]');
  assert.match(await page.locator('[data-player-status]').textContent(), /4.0–14.0/);
  await page.click('[data-player-action="full"]');
  assert.equal(await page.evaluate(()=>window.__mockPlayers.at(-1).time),0);
  await page.click('.back');
  assert.equal(await page.inputValue('#search'), 'FACE PULL');
  assert.ok(await page.evaluate(()=>window.__mockPlayers.every(p=>p.destroyed)));
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
    assert.equal(await page.locator('.steps li').count(),5,x.id);
    assert.equal(await page.locator('[data-prep]').count(),3,x.id);
    assert.equal(await page.locator('.corrections h3').count(),2,x.id);
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
  console.log('PASS: 71 detailed routes, 390px layout, prep checklist, step mode, embedded player controls (mock API), AB validation/loop/reset/cleanup, favorites and offline shell');
})().catch(e => { console.error(e); process.exit(1); });
