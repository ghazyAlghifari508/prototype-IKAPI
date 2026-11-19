import { chromium } from 'playwright';
const b = await chromium.launch();
const probes = [
  ['p8 dashboard 768', 'http://127.0.0.1:8140/penerbit', 'http://127.0.0.1:8099/prototype-copy/penerbit/dashboard_penerbit_desktop.html', { width: 768, height: 1024 }, [279, 318, 1442]],
  ['p9 dashboard 1366', 'http://127.0.0.1:8140/admin', 'http://127.0.0.1:8099/prototype-copy/admin/dashboard_administrasi_utama_desktop.html', { width: 1366, height: 768 }, [246, 342]],
  ['p6 cart 1366', 'http://127.0.0.1:8140/keranjang', 'http://127.0.0.1:8099/prototype-copy/user/keranjang_pembayaran_terpadu_desktop.html', { width: 1366, height: 768 }, [552]],
];
for (const [label, a, p, vp, ys] of probes) {
  const out = {};
  for (const [tag, url] of [['blade', a], ['proto', p]]) {
    const ctx = await b.newContext({ viewport: vp, reducedMotion: 'reduce', locale: 'id-ID' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 4000))]));
    await page.waitForTimeout(500);
    out[tag] = await page.evaluate((ys) => ys.map((y) => {
      const els = [];
      for (const x of [100, 400, 700, 1000, 1200]) {
        const el = document.elementFromPoint(x, y);
        if (el && !els.some((e) => e.sig === el.tagName + String(el.className).slice(0, 24))) {
          els.push({ sig: el.tagName + String(el.className).slice(0, 24), t: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 46), fs: getComputedStyle(el).fontSize, fw: getComputedStyle(el).fontWeight });
        }
      }
      return { y, els };
    }), ys);
    await ctx.close();
  }
  console.log('==', label);
  console.log('blade', JSON.stringify(out.blade));
  console.log('proto', JSON.stringify(out.proto));
}
await b.close();
