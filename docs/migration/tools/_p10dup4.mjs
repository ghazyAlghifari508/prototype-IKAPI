import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', String(e).slice(0, 140)));
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku', { waitUntil: 'load' });
await p.waitForTimeout(400);
const join = p.locator('#profile-actions button', { hasText: /Gabung/i }).first();
if (await join.isVisible().catch(() => false)) { await join.click(); await p.waitForTimeout(400); }
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(500);
await p.evaluate(() => {
  const key = 'ikapi_community_replies_demo';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push({ id: 'RPL-DUP-P2', topicId: 'TPC-2026-101', communityId: 'community-klub-buku', body: 'Induk uji duplikasi 2', authorId: 'USR-PMB-0042', authorName: 'Pembeli Demo', createdAt: new Date().toISOString(), updatedAt: null, removed: false, parentReplyId: null });
  localStorage.setItem(key, JSON.stringify(list));
});
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101/balas/RPL-DUP-P2', { waitUntil: 'load' });
await p.waitForTimeout(700);
await p.evaluate(() => {
  window.__calls = 0;
  const orig = window.submitReplyView;
  if (orig) window.submitReplyView = function (...args) { window.__calls++; return orig.apply(this, args); };
  document.getElementById('reply-view-form')?.addEventListener('submit', () => { window.__calls = (window.__calls || 0) + 100; });
});
await p.fill('#reply-view-input', 'Hitung panggilan submit.');
const before = await p.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]')).length);
await p.click('#reply-view-submit');
await p.waitForTimeout(1200);
const res = await p.evaluate(() => ({
  calls: window.__calls,
  created: (JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]')).filter((r) => r.body === 'Hitung panggilan submit.').length,
  total: (JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]')).length,
}));
console.log('before', before, JSON.stringify(res));
await b.close();
