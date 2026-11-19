import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku', { waitUntil: 'load' });
await p.waitForTimeout(400);
const join = p.locator('#profile-actions button', { hasText: /Gabung/i }).first();
if (await join.isVisible().catch(() => false)) { await join.click(); await p.waitForTimeout(400); }
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(500);
await p.evaluate(() => {
  const key = 'ikapi_community_replies_demo';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push({ id: 'RPL-DUP-P3', topicId: 'TPC-2026-101', communityId: 'community-klub-buku', body: 'Induk uji trace', authorId: 'USR-PMB-0042', authorName: 'Pembeli Demo', createdAt: new Date().toISOString(), updatedAt: null, removed: false, parentReplyId: null });
  localStorage.setItem(key, JSON.stringify(list));
});
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101/balas/RPL-DUP-P3', { waitUntil: 'load' });
await p.waitForTimeout(700);
p.on('console', (m) => { if (m.text().includes('WRITE')) console.log(m.text().slice(0, 400)); });
await p.evaluate(() => {
  const orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    if (k === 'ikapi_community_replies_demo') {
      const len = (JSON.parse(v) || []).length;
      console.log('WRITE len=' + len + ' ' + new Error().stack.split('\n').slice(1, 4).join(' | '));
    }
    return orig.apply(this, arguments);
  };
});
await p.fill('#reply-view-input', 'Trace submit sekali.');
await p.click('#reply-view-submit');
await p.waitForTimeout(1500);
await b.close();
