import { chromium } from 'playwright';
const b = await chromium.launch();
for (const route of ['/', '/katalog', '/agenda', '/agenda/ev-1', '/buku/laskar-aksara-pasundan', '/komunitas']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 90)));
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_SOCKET|ERR_CONNECTION/.test(m.text())) errs.push(m.text().slice(0, 90)); });
  await p.goto('http://127.0.0.1:8140' + route, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(400);
  const launcher = p.locator('#launcher-button');
  const has = await launcher.count();
  let opened = null, closed = null;
  if (has) {
    await launcher.click();
    await p.waitForTimeout(350);
    opened = await p.evaluate(() => !document.getElementById('ikapi-chat-window').classList.contains('hidden'));
    await p.keyboard.press('Escape');
    await p.waitForTimeout(350);
    closed = await p.evaluate(() => document.getElementById('ikapi-chat-window').classList.contains('hidden'));
  }
  console.log(route.padEnd(30), 'widget', has, 'open', opened, 'escape-close', closed, 'errors', errs.slice(0, 2));
  await ctx.close();
}
await b.close();
