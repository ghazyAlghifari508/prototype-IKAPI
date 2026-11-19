import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(700);
console.log(JSON.stringify(await p.evaluate(() => {
  const list = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
  const byId = Object.fromEntries(list.map((r) => [r.id, r]));
  return list.map((r) => `${r.id} topic=${r.topicId} parent=${r.parentReplyId} removed=${!!r.removed} body=${(r.body || '').slice(0, 24)}`);
}), null, 1));
await b.close();
