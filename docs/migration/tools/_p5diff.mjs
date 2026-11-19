import { chromium } from 'playwright';
const VIEW = process.argv[2] === '390' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const bands = process.argv[2] === '390' ? [[5100, 5250]] : [[950, 1000], [1290, 1340], [3100, 3230]];
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: VIEW, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); await p.goto(url, { waitUntil: 'load' }); await p.evaluate(async () => { await document.fonts.ready; }); await p.waitForTimeout(700);
  const out = await p.evaluate((bands) => {
    const res = {};
    for (const [a, z] of bands) {
      const items = [];
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walk.nextNode())) {
        const t = n.textContent.replace(/\s+/g, ' ').trim();
        if (t.length < 2) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        for (const rect of r.getClientRects()) {
          if (rect.top + scrollY >= a && rect.top + scrollY <= z && rect.width > 1) { items.push(`${Math.round(rect.top + scrollY)}|x${Math.round(rect.left)}w${Math.round(rect.width)}|${t.slice(0, 46)}`); break; }
        }
      }
      res[a] = [...new Set(items)].slice(0, 10);
    }
    return res;
  }, bands);
  await ctx.close(); return out;
};
const A = await dump('http://127.0.0.1:8140/'), P = await dump('http://127.0.0.1:8099/prototype-copy/user/beranda_desktop.html');
for (const k of Object.keys(P)) {
  console.log('=== band', k, '===');
  console.log('  blade-only:', A[k].filter((x) => !P[k].includes(x)));
  console.log('  proto-only:', P[k].filter((x) => !A[k].includes(x)));
}
await b.close();
