import { chromium } from 'playwright';
const b = await chromium.launch();
const tree = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const list = document.getElementById('reply-list');
    if (!list) return null;
    return [...list.querySelectorAll('.thread-node')].map((n) => {
      const q = n.getBoundingClientRect();
      return { depth: (n.className.match(/thread-depth-(\d)/) || [])[1] || (n.closest('[data-depth]') ? 'x' : '0'), x: Math.round(q.x), w: Math.round(q.width), h: Math.round(q.height), cls: n.className.slice(0, 40) };
    });
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await tree('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-klub-buku&topik=TPC-2026-101')));
console.log('B', JSON.stringify(await tree('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101')));
await b.close();
