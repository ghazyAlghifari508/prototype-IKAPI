import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [label, url] of [['blade', 'http://127.0.0.1:8140/agenda'], ['proto', 'http://127.0.0.1:8099/prototype-copy/user/agenda_berita_literasi_desktop.html']]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 4000))]));
  await p.waitForTimeout(600);
  const out = await p.evaluate(() => {
    const pts = [[580, 1063], [560, 853], [600, 1272]];
    return pts.map(([x, y]) => {
      window.scrollTo(0, Math.max(0, y - 400));
      const yy = y - window.scrollY;
      const el = document.elementFromPoint(x, yy);
      return { pt: [x, y], el: el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '.' + String(el.className).slice(0, 30) : null, text: el ? (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) : null, rect: el ? (() => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + window.scrollY), Math.round(r.width), Math.round(r.height)]; })() : null };
    });
  });
  console.log(label, JSON.stringify(out, null, 1));
  await ctx.close();
}
await b.close();
