import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [label, url] of [['blade', 'http://127.0.0.1:8140/agenda'], ['proto', 'http://127.0.0.1:8099/prototype-copy/user/agenda_berita_literasi_desktop.html']]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 4; i++) {
    await p.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 4000))]));
    const st = await p.evaluate(() => ({
      dm: document.fonts.check('16px "DM Sans"'), lit: document.fonts.check('16px Literata'),
      ms: document.fonts.check('16px "Material Symbols Outlined"'),
      faces: document.fonts.size,
      status: [...document.fonts].map((f) => f.family + ':' + f.status).slice(0, 8),
      h: document.documentElement.scrollHeight,
    }));
    console.log(label, 'try', i, JSON.stringify(st));
    if (st.dm && st.lit && st.ms) break;
    await p.reload({ waitUntil: 'domcontentloaded' });
  }
  await ctx.close();
}
await b.close();
