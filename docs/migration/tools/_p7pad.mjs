import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const n = document.querySelector('#reply-list .thread-node');
    const s = getComputedStyle(n);
    const kids = [...n.children].map((c) => [c.className.slice(0, 20), +c.getBoundingClientRect().height.toFixed(2)]);
    return { h: +n.getBoundingClientRect().height.toFixed(3), pt: s.paddingTop, pb: s.paddingBottom, bt: s.borderTopWidth, bb: s.borderBottomWidth, mt: s.marginTop, mb: s.marginBottom, kids };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await dump('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html?komunitas=community-klub-buku&topik=TPC-2026-101')));
console.log('B', JSON.stringify(await dump('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101')));
await b.close();
