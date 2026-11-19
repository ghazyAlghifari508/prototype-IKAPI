import { chromium } from 'playwright';
const b = await chromium.launch();
const targets = [
  ['app /admin', 'http://127.0.0.1:8140/admin', { width: 1440, height: 900 }],
  ['proto admin', 'http://127.0.0.1:8099/prototype-copy/admin/dashboard_administrasi_utama_desktop.html', { width: 1440, height: 900 }],
  ['app /admin/pengguna', 'http://127.0.0.1:8140/admin/pengguna', { width: 1440, height: 900 }],
  ['proto pengguna', 'http://127.0.0.1:8099/prototype-copy/admin/kelola_pengguna_desktop.html', { width: 1440, height: 900 }],
];
for (const [label, url, vp] of targets) {
  const ctx = await b.newContext({ viewport: vp, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]));
  const meas = async (tag) => p.evaluate((tag) => {
    const h = document.documentElement;
    const vw = h.clientWidth;
    const wide = [...document.querySelectorAll('body *')].map((el) => {
      const r = el.getBoundingClientRect();
      return { t: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''), right: Math.round(r.right), cs: getComputedStyle(el).position, cls: String(el.className).slice(0, 40) };
    }).filter((x) => x.right > vw + 1).slice(0, 5);
    return { tag, vw, scrollW: h.scrollWidth, bodyScrollW: document.body.scrollWidth, scrollH: h.scrollHeight, wide };
  }, tag);
  const a = await meas('t0');
  await p.waitForTimeout(1200);
  const c = await meas('t1.2s');
  console.log(label, '| t0', a.scrollW, 't1.2', c.scrollW, '| vw', c.vw, '| wide:', JSON.stringify(c.wide));
  await ctx.close();
}
await b.close();
