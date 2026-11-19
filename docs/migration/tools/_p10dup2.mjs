import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', String(e).slice(0, 120)));
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku', { waitUntil: 'load' });
await p.waitForTimeout(400);
const join = p.locator('#profile-actions button', { hasText: /Gabung/i }).first();
if (await join.isVisible().catch(() => false)) { await join.click(); await p.waitForTimeout(400); }
// seed a parent reply owned by the demo user, then open its reply page
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(500);
await p.evaluate(() => {
  const key = 'ikapi_community_replies_demo';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push({ id: 'RPL-DUP-P', topicId: 'TPC-2026-101', communityId: 'community-klub-buku', body: 'Induk uji duplikasi', authorId: 'USR-PMB-0042', authorName: 'Pembeli Demo', createdAt: new Date().toISOString(), updatedAt: null, removed: false, parentReplyId: null });
  localStorage.setItem(key, JSON.stringify(list));
});
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101/balas/RPL-DUP-P', { waitUntil: 'load' });
await p.waitForTimeout(700);
const before = await p.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]')).length);
await p.fill('#reply-view-input', 'Satu balasan anak uji duplikasi.');
await p.click('#reply-view-submit');
await p.waitForTimeout(1000);
const list = await p.evaluate(() => JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]'));
console.log('before', before, 'after', list.length, 'created:', list.filter((r) => r.body === 'Satu balasan anak uji duplikasi.').length);
await b.close();
