import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', String(e).slice(0, 150)));
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi', { waitUntil: 'load' });
await p.waitForTimeout(700);
console.log('enabled initially', await p.locator('#btn-new-topic').isEnabled());
const join = p.locator('#profile-actions button', { hasText: /Gabung/i }).first();
console.log('join visible?', await join.isVisible().catch(() => false));
if (await p.locator('#btn-new-topic').isEnabled()) {
  await p.click('#btn-new-topic');
  await p.waitForTimeout(250);
  await p.fill('#topic-title-input', 'Topik nol balasan');
  await p.fill('#topic-body-input', 'Uji label 0 balasan.');
  await p.click('#composer-submit');
  await p.waitForTimeout(900);
  console.log('url after create', new URL(p.url()).pathname);
  await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi', { waitUntil: 'load' });
  await p.waitForTimeout(700);
}
console.log(await p.evaluate(() => [...document.querySelectorAll('#view-room a[aria-label*="balasan"]')].map((a) => a.textContent.trim())));
console.log('topics', await p.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_community_topics_demo') || '[]')).map((t) => [t.id, t.title.slice(0, 24), t.communityId])));
await b.close();
