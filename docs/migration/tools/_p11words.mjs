import { chromium } from 'playwright';
const b = await chromium.launch();
const out = {};
for (const [tag, url] of [['blade', 'http://127.0.0.1:8140/lupa-kata-sandi'], ['proto', 'http://127.0.0.1:8099/prototype-copy/user/lupa_kata_sandi_desktop.html']]) {
  const ctx = await b.newContext({ viewport: { width: 320, height: 700 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  out[tag] = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
  await ctx.close();
}
const a = out.blade.split(' '), bq = out.proto.split(' ');
const cnt = (arr) => { const m = new Map(); for (const w of arr) m.set(w, (m.get(w) || 0) + 1); return m; };
const ca = cnt(a), cb = cnt(bq);
for (const [w, n] of ca) if ((cb.get(w) || 0) !== n) console.log('blade-only word:', JSON.stringify(w), n, 'vs', cb.get(w) || 0);
for (const [w, n] of cb) if (!ca.has(w)) console.log('proto-only word:', JSON.stringify(w), n);
await b.close();
