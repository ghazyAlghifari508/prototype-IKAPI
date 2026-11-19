import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(700);
const info = await p.evaluate(() => {
  const key = 'ikapi_community_replies_demo';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const base = { topicId: 'TPC-2026-101', communityId: 'community-klub-buku', authorId: 'USR-PMB-0042', authorName: 'Pembeli Demo', createdAt: new Date().toISOString(), removed: false };
  list.push({ ...base, id: 'RPL-P09-P', body: 'Induk uji moderasi admin', parentReplyId: null });
  list.push({ ...base, id: 'RPL-P09-C', body: 'Anak dari induk yang dimoderasi', parentReplyId: 'RPL-P09-P' });
  localStorage.setItem(key, JSON.stringify(list));
  return { parent: 'RPL-P09-P', child: 'RPL-P09-C' };
});
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(800);
// admin-side moderation action (same write the admin page performs)
await p.evaluate(() => {
  const key = 'ikapi_community_replies_demo';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const t = list.find((r) => r.id === 'RPL-P09-P');
  t.removed = true; t.removedAt = new Date().toISOString();
  localStorage.setItem(key, JSON.stringify(list));
});
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(900);
console.log('target', JSON.stringify(info));
console.log('thread:', await p.evaluate(() => ({
  nodes: document.querySelectorAll('#reply-list .thread-node').length,
  placeholders: [...document.querySelectorAll('#reply-list .thread-node')].filter((n) => /dihapus/i.test(n.textContent)).length,
  childAlive: [...document.querySelectorAll('#reply-list .thread-content')].some((el) => el.textContent.includes('Anak dari induk yang dimoderasi')),
})));
await b.close();
