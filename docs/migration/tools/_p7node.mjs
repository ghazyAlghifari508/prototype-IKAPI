import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const list = document.getElementById('reply-list');
    const first = list.querySelector('.thread-node');
    const walk = (el, d = 0, out = []) => {
      if (d > 2) return out;
      [...el.children].forEach((c) => {
        const q = c.getBoundingClientRect();
        out.push([d, c.tagName + '.' + String(c.className).slice(0, 26), Math.round(q.height)]);
        walk(c, d + 1, out);
      });
      return out;
    };
    return walk(first);
  });
  await ctx.close();
  return r;
};
const A = await dump('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-klub-buku&topik=TPC-2026-101');
const B = await dump('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101');
for (let i = 0; i < Math.max(A.length, B.length); i++) if (JSON.stringify(A[i]) !== JSON.stringify(B[i])) console.log('P', JSON.stringify(A[i]), '| B', JSON.stringify(B[i]));
await b.close();
