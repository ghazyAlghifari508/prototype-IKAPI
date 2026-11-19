import { chromium } from 'playwright';
const b = await chromium.launch();
const check = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(900);
  await p.evaluate(() => {
    const key = 'ikapi_community_replies_demo';
    const list = JSON.parse(localStorage.getItem(key) || 'null') || [];
    const base = { topicId: 'TPC-2026-101', communityId: 'community-klub-buku', authorId: 'USR-PMB-0042', authorName: 'Pembeli Demo', createdAt: '2026-11-18T10:00:00.000Z', removed: false };
    let parent = null;
    for (let l = 1; l <= 6; l++) { const id = 'RPL-CAP-' + l; list.push({ ...base, id, body: 'cap level ' + l, parentReplyId: parent }); parent = id; }
    localStorage.setItem(key, JSON.stringify(list));
  });
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const ownerX = (text) => {
      const body = [...document.querySelectorAll('#reply-list .thread-content')].find((el) => el.textContent.includes(text));
      const node = body ? body.closest('.thread-node') : null;
      return node ? Math.round(node.getBoundingClientRect().x) : null;
    };
    return [1, 2, 3, 4, 5, 6].map((l) => ownerX('cap level ' + l));
  });
  await ctx.close();
  return r;
};
console.log('proto x per level:', await check('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-klub-buku&topik=TPC-2026-101'));
console.log('blade x per level:', await check('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101'));
await b.close();
