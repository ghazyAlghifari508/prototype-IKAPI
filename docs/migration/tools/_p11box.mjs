import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [url, vp] of [['http://127.0.0.1:8140/admin/pengguna', { width: 390, height: 844 }], ['http://127.0.0.1:8099/prototype-copy/admin/kelola_pengguna_desktop.html', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(600);
  const out = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const rows = [...document.querySelectorAll('body *')].map((el) => {
      const r = el.getBoundingClientRect();
      return { el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '.' + String(el.className).split(' ').slice(0, 3).join('.'), right: Math.round(r.right), w: Math.round(r.width), sw: el.scrollWidth };
    }).filter((x) => x.right > vw + 1).slice(0, 8);
    return { vw, scrollW: document.documentElement.scrollWidth, rows };
  });
  console.log(url.split('/').slice(-2).join('/'), JSON.stringify(out, null, 1).slice(0, 1200));
  await ctx.close();
}
await b.close();
