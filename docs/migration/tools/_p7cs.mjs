import { chromium } from 'playwright';
const b = await chromium.launch();
const styles = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const m = document.querySelector('main');
    const s = getComputedStyle(m);
    const out = {};
    for (const k of ['marginTop','paddingTop','position','top','transform','display','boxSizing','borderTopWidth','minHeight']) out[k] = s[k];
    out.offsetTop = m.offsetTop;
    out.bodyPad = getComputedStyle(document.body).paddingTop;
    out.bodyTransform = getComputedStyle(document.body).transform;
    out.htmlTransform = getComputedStyle(document.documentElement).transform;
    out.bodyCls = document.body.className;
    return out;
  });
  await ctx.close();
  return r;
};
const a = await styles('http://127.0.0.1:8140/katalog');
const c = await styles('http://127.0.0.1:8140/komunitas');
for (const k of Object.keys(a)) if (JSON.stringify(a[k]) !== JSON.stringify(c[k])) console.log(k, '| katalog:', JSON.stringify(a[k]), '| komunitas:', JSON.stringify(c[k]));
await b.close();
