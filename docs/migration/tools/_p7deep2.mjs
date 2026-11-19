import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', String(e).slice(0, 200)));
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(700);
await p.evaluate(() => {
  const key = 'ikapi_community_replies_demo';
  const list = JSON.parse(localStorage.getItem(key) || 'null') || [];
  const base = { topicId: 'TPC-2026-101', communityId: 'community-klub-buku', authorId: 'USR-PMB-0042', authorName: 'Pembeli Demo', createdAt: '2026-11-18T10:00:00.000Z', removed: false };
  let parent = null;
  for (let l = 1; l <= 5; l++) { const id = 'RPL-DEEP-' + l; list.push({ ...base, id, body: 'Level ' + l, parentReplyId: parent }); parent = id; }
  localStorage.setItem(key, JSON.stringify(list));
  return list.length;
});
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(900);
console.log(JSON.stringify(await p.evaluate(() => {
  const store = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
  const deep = store.filter((r) => r.id.startsWith('RPL-DEEP')).map((r) => [r.id, r.parentReplyId, r.topicId]);
  const nodes = [...document.querySelectorAll('#reply-list .thread-node')];
  return {
    deepInStore: deep,
    nodeCount: nodes.length,
    text5: nodes.filter((n) => n.textContent.includes('Level 5')).map((n) => [Math.round(n.getBoundingClientRect().x), n.className.slice(0, 30)]),
    childrenContainers: document.querySelectorAll('#reply-list .thread-children').length,
  };
}), null, 1));
await b.close();
