import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', String(e).slice(0, 160)));
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(700);
console.log('before', await p.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]')).length));
await p.evaluate(() => {
  const key = 'ikapi_community_replies_demo';
  const list = JSON.parse(localStorage.getItem(key) || 'null') || [];
  const base = { topicId: 'TPC-2026-101', communityId: 'community-klub-buku', authorId: 'USR-DEMO-DINA', authorName: 'Dina', createdAt: '2026-11-18T10:00:00.000Z', removed: false };
  let parent = null;
  for (let l = 1; l <= 5; l++) { const id = 'RPL-DEEP-' + l; list.push({ ...base, id, body: 'Level ' + l, parentReplyId: parent }); parent = id; }
  localStorage.setItem(key, JSON.stringify(list));
});
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(900);
console.log('after', await p.evaluate(() => {
  const list = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
  return { len: list.length, hasDeep: list.some((r) => r.id === 'RPL-DEEP-1'), nodes: document.querySelectorAll('#reply-list .thread-node').length, deepRendered: [...document.querySelectorAll('#reply-list .thread-node')].some((n) => n.textContent.includes('Level 5')) };
}));
await b.close();
