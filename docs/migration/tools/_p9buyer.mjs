import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(700);
// mark a parent reply as removed, the way the admin moderation action does
const info = await p.evaluate(() => {
  const list = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
  const parent = list.find((r) => list.some((c) => c.parentReplyId === r.id));
  if (!parent) return null;
  parent.removed = true; parent.removedAt = new Date().toISOString();
  localStorage.setItem('ikapi_community_replies_demo', JSON.stringify(list));
  return { id: parent.id, children: list.filter((r) => r.parentReplyId === parent.id).length };
});
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(800);
console.log('target', JSON.stringify(info));
console.log('thread:', await p.evaluate(() => ({
  nodes: document.querySelectorAll('#reply-list .thread-node').length,
  placeholders: [...document.querySelectorAll('#reply-list .thread-node')].filter((n) => /dihapus/i.test(n.textContent)).length,
  childRendered: [...document.querySelectorAll('#reply-list .thread-content')].length,
})));
await b.close();
