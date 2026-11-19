import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [label, url] of [['blade', 'http://127.0.0.1:8140/agenda'], ['proto', 'http://127.0.0.1:8099/prototype-copy/user/agenda_berita_literasi_desktop.html']]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', locale: 'id-ID' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]));
  await p.waitForTimeout(700);
  const info = await p.evaluate(() => ({
    imgs: [...document.images].map((i) => { const r = i.getBoundingClientRect(); return { src: (i.currentSrc || i.src).split('/').slice(-2).join('/'), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), fit: getComputedStyle(i).objectFit, op: getComputedStyle(i).objectPosition, nat: [i.naturalWidth, i.naturalHeight] }; }),
    sections: [...document.querySelectorAll('section, article')].slice(0, 8).map((s) => { const r = s.getBoundingClientRect(); return { cls: String(s.className).slice(0, 34), y: Math.round(r.y + window.scrollY), h: Math.round(r.height) }; }),
  }));
  console.log('==', label, 'scrollH', await p.evaluate(() => document.documentElement.scrollHeight));
  console.log(JSON.stringify(info.imgs.slice(0, 6)));
  console.log(JSON.stringify(info.sections));
  await ctx.close();
}
await b.close();
