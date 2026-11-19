import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', String(e).slice(0, 160)));
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(700);
await p.evaluate(() => {
  const key = 'ikapi_community_replies_demo';
  const list = JSON.parse(localStorage.getItem(key) || 'null') || [];
  const base = { topicId: 'TPC-2026-101', communityId: 'community-klub-buku', authorId: 'USR-PMB-0042', authorName: 'Pembeli Demo', createdAt: '2026-11-18T10:00:00.000Z', removed: false };
  list.push({ ...base, id: 'RPL-MINE-P', body: 'Induk milik saya', parentReplyId: null });
  list.push({ ...base, id: 'RPL-MINE-C1', body: 'Anak pertama milik saya', parentReplyId: 'RPL-MINE-P' });
  list.push({ ...base, id: 'RPL-MINE-C2', body: 'Anak kedua milik saya', parentReplyId: 'RPL-MINE-P' });
  localStorage.setItem(key, JSON.stringify(list));
});
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(900);
// find the node whose own body is the parent, open its menu, delete
const target = await p.evaluateHandle(() => {
  const body = [...document.querySelectorAll('#reply-list .thread-content')].find((el) => el.textContent.includes('Induk milik saya'));
  return body ? body.closest('.thread-node') : null;
});
const el = target.asElement();
if (!el) { console.log('parent node not found'); await b.close(); process.exit(0); }
const menuBtn = await el.$('button[aria-haspopup="menu"], button[aria-label*="Aksi"]');
console.log('menu btn found:', !!menuBtn);
await menuBtn.click();
await p.waitForTimeout(300);
console.log('menu visible:', await p.isVisible('#content-menu'));
await p.locator('#content-menu button', { hasText: /Hapus/i }).first().click();
await p.waitForTimeout(300);
console.log('delete modal:', await p.isVisible('#delete-modal'));
await p.locator('#delete-modal button', { hasText: /Hapus/i }).first().click();
await p.waitForTimeout(900);
console.log(JSON.stringify(await p.evaluate(() => {
  const store = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
  const parent = store.find((r) => r.id === 'RPL-MINE-P');
  const kids = store.filter((r) => r.parentReplyId === 'RPL-MINE-P');
  return {
    parentRemovedFlag: parent ? parent.removed : 'gone',
    children: kids.map((k) => [k.id, k.removed || false]),
    placeholderText: [...document.querySelectorAll('#reply-list .thread-node')].filter((n) => /dihapus|tidak tersedia/i.test(n.textContent)).map((n) => n.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)),
    childrenRendered: [...document.querySelectorAll('#reply-list .thread-content')].filter((el) => /Anak (pertama|kedua) milik saya/.test(el.textContent)).length,
  };
}), null, 1));
await b.close();
