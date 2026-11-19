import { chromium } from 'playwright';
const ORIGIN = 'http://127.0.0.1:8099/prototype-copy';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
const page = await ctx.newPage();
for (const p of ['admin/kelola_pengguna_desktop.html', 'admin/moderasi_ulasan_dan_komentar_desktop.html']) {
  await page.goto(`${ORIGIN}/${p}`, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(400);
  console.log('##', p, JSON.stringify(await page.evaluate(() => {
    const rows = [...document.querySelectorAll('tr')];
    const r = rows[0];
    const chain = [];
    let a = r;
    while (a && a !== document.documentElement) { const s = getComputedStyle(a); chain.push(`${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}${a.className ? '.' + a.className.toString().slice(0, 20) : ''}:${s.display}/${s.visibility}/${s.overflowX}`); a = a.parentElement; }
    const box = r.getBoundingClientRect();
    return { rows: rows.length, firstText: r.innerText.replace(/\s+/g, ' ').slice(0, 60), box: { w: Math.round(box.width), h: Math.round(box.height), y: Math.round(box.y) }, chain: chain.slice(0, 9), html: r.outerHTML.slice(0, 120) };
  }), null, 1));
}
await browser.close();
