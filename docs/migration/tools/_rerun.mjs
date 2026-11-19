import { chromium } from 'playwright';
import fs from 'node:fs';
const ORIGIN = 'http://127.0.0.1:8099/prototype-copy';
const PAGES = ['penerbit/dashboard_penerbit_desktop.html','admin/kelola_pengguna_desktop.html','penerbit/pengaturan_profil_desktop.html','penerbit/kelola_buku_desktop.html'];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
for (const p of PAGES) {
  const page = await ctx.newPage();
  const r = await page.goto(`${ORIGIN}/${p}`, { waitUntil: 'load', timeout: 45000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(300);
  const diag = await page.evaluate(() => ({
    url: location.href, title: document.title, len: document.documentElement.outerHTML.length,
    toggle: !!document.querySelector('#demo-toggle'), bodyClass: document.body.className.slice(0, 40),
    scripts: document.scripts.length, firstScriptSrc: document.scripts[0]?.src?.slice(-40) ?? null,
  }));
  console.log(p, r.status(), JSON.stringify(diag));
  await page.close();
}
await b.close();
