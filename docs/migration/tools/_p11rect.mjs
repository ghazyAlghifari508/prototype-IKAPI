import { chromium } from 'playwright';
const b = await chromium.launch();
const CASES = [
  ['cart@1366', 'http://127.0.0.1:8140/keranjang', 'http://127.0.0.1:8099/prototype-copy/user/keranjang_pembayaran_terpadu_desktop.html', { width: 1366, height: 768 }, 'aside, [class*="rounded-3xl"]'],
  ['penerbit@768', 'http://127.0.0.1:8140/penerbit', 'http://127.0.0.1:8099/prototype-copy/penerbit/dashboard_penerbit_desktop.html', { width: 768, height: 1024 }, '[class*="rounded-2xl"], [class*="rounded-xl"]'],
  ['admin@1366', 'http://127.0.0.1:8140/admin', 'http://127.0.0.1:8099/prototype-copy/admin/dashboard_administrasi_utama_desktop.html', { width: 1366, height: 768 }, '[class*="rounded-2xl"], [class*="rounded-xl"]'],
  ['payouts@390', 'http://127.0.0.1:8140/admin/pencairan', 'http://127.0.0.1:8099/prototype-copy/admin/kelola_pencairan_dana_desktop.html', { width: 390, height: 844 }, '[class*="rounded-2xl"], [class*="rounded-xl"]'],
  ['onboarding@390', 'http://127.0.0.1:8140/onboarding', 'http://127.0.0.1:8099/prototype-copy/user/onboarding_preferensi_bacaan_desktop.html', { width: 390, height: 844 }, '[class*="rounded"], button'],
];
for (const [label, a, p, vp, sel] of CASES) {
  const res = {};
  for (const [tag, url] of [['blade', a], ['proto', p]]) {
    const ctx = await b.newContext({ viewport: vp, reducedMotion: 'reduce', locale: 'id-ID' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 4000))]); });
    await page.waitForTimeout(500);
    res[tag] = await page.evaluate((sel) => [...document.querySelectorAll(sel)].slice(0, 14).map((el) => {
      const r = el.getBoundingClientRect();
      return [Math.round(r.x * 100) / 100, Math.round((r.y + window.scrollY) * 100) / 100, Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100];
    }), sel);
    await ctx.close();
  }
  const n = Math.max(res.blade.length, res.proto.length);
  let mismatch = 0;
  for (let i = 0; i < n; i++) {
    const x = res.blade[i], y = res.proto[i];
    if (!x || !y || x.some((v, k) => Math.abs(v - y[k]) > 0.01)) { mismatch++; if (mismatch <= 3) console.log('  ', label, 'rect', i, 'blade', x, 'proto', y); }
  }
  console.log(label, 'elements', n, 'rect mismatches', mismatch);
}
await b.close();
