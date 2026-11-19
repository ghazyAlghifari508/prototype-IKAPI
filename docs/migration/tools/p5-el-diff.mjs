// P05 element compare: diff one element's markup between the Blade page and the prototype page.
// Usage: node docs/migration/tools/p5-el-diff.mjs <bladeUrl> <protoUrl> <selector> [normaliseMode]
// normaliseMode: 'card' (strip hrefs/srcs/ids/data-attrs) or 'raw'
import { chromium } from 'playwright';

const [bladeUrl, protoUrl, selector, mode = 'card'] = process.argv.slice(2);
const browser = await chromium.launch();

async function grab(url) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(500);
  const html = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? el.outerHTML : null;
  }, selector);
  await ctx.close();
  return html;
}

const norm = (html) => {
  let s = html.replace(/\s+/g, ' ');
  if (mode === 'card') {
    s = s.replace(/href="[^"]*"/g, 'href="#"')
      .replace(/src="[^"]*"/g, 'src="#"')
      .replace(/alt="[^"]*"/g, 'alt="#"')
      .replace(/data-[a-z-]+="[^"]*"/g, '')
      .replace(/aria-label="[^"]*"/g, 'aria-label="#"')
      .replace(/id="[^"]*"/g, 'id="#"');
  }
  return s.replace(/>\s+</g, '><').trim();
};

const a = await grab(bladeUrl);
const b = await grab(protoUrl);
if (!a || !b) {
  console.log(JSON.stringify({ selector, blade: a ? a.length : null, proto: b ? b.length : null, note: 'element missing on one side' }));
} else {
  const A = norm(a), B = norm(b);
  if (A === B) {
    console.log(`IDENTICAL (${A.length} chars) for ${selector}`);
  } else {
    // token-level diff: split on spaces and report the differing tokens around the first mismatch
    const ta = A.split(/(?<=>)(?=<)| /), tb = B.split(/(?<=>)(?=<)| /);
    let i = 0;
    while (i < Math.min(ta.length, tb.length) && ta[i] === tb[i]) i++;
    console.log(`DIFF at token ${i} of ${ta.length}/${tb.length} for ${selector}`);
    console.log('  blade:', ta.slice(Math.max(0, i - 3), i + 12).join(' ').slice(0, 320));
    console.log('  proto:', tb.slice(Math.max(0, i - 3), i + 12).join(' ').slice(0, 320));
  }
}
await browser.close();