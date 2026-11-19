import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const node = document.querySelector('#reply-list .thread-node');
    const out = [];
    const walk = (el, d) => {
      if (d > 3) return;
      const q = el.getBoundingClientRect();
      out.push([d, el.tagName + '.' + String(el.className).slice(0, 30), +q.height.toFixed(2), +q.width.toFixed(2)]);
      [...el.children].forEach((c) => walk(c, d + 1));
    };
    walk(node, 0);
    return out;
  });
  await ctx.close();
  return r;
};
const A = await dump('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-klub-buku&topik=TPC-2026-101');
const B = await dump('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101');
for (let i = 0; i < Math.max(A.length, B.length); i++) {
  const a = A[i], c = B[i];
  if (JSON.stringify(a) !== JSON.stringify(c)) console.log('P', JSON.stringify(a), '| B', JSON.stringify(c));
}
await b.close();
