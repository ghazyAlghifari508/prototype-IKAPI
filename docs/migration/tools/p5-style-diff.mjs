// P05 computed-style compare: reports selectors whose computed styles differ between Blade and prototype.
// Usage: node docs/migration/tools/p5-style-diff.mjs <bladeUrl> <protoUrl> <selector...>
import { chromium } from 'playwright';
const [bladeUrl, protoUrl, ...sels] = process.argv.slice(2);
const PROPS = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'backgroundColor', 'borderTopColor', 'borderTopWidth', 'borderRadius', 'padding', 'margin', 'display', 'position', 'gap', 'textTransform', 'fontVariationSettings', 'width', 'height', 'boxShadow', 'accentColor', 'appearance', 'opacity'];
const browser = await chromium.launch();
const grab = async (url) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(900);
  const out = await page.evaluate(({ sels, PROPS }) => {
    const res = {};
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (!el) { res[sel] = null; continue; }
      const cs = getComputedStyle(el);
      const o = {};
      for (const p of PROPS) o[p] = cs[p];
      res[sel] = o;
    }
    return res;
  }, { sels, PROPS });
  await ctx.close();
  return out;
};
const A = await grab(bladeUrl), P = await grab(protoUrl);
for (const sel of sels) {
  if (!A[sel] || !P[sel]) { console.log('MISSING', sel, !!A[sel], !!P[sel]); continue; }
  const diffs = PROPS.filter((p) => A[sel][p] !== P[sel][p]).map((p) => `${p}: blade=${A[sel][p]} proto=${P[sel][p]}`);
  console.log(diffs.length ? `DIFF ${sel}\n   ` + diffs.join('\n   ') : `SAME ${sel}`);
}
await browser.close();
