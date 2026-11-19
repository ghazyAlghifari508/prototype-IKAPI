import { chromium } from 'playwright';
const b = await chromium.launch();
const out = {};
for (const [tag, url] of [['blade', 'http://127.0.0.1:8140/komunitas'], ['proto', 'http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html']]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  out[tag] = await p.evaluate(() => {
    const el = document.getElementById('view-empty');
    el.classList.remove('hidden'); el.classList.add('flex');
    const img = el.querySelector('img');
    const r = img.getBoundingClientRect();
    return { src: (img.currentSrc || img.src).split('/').pop(), alt: img.getAttribute('alt'), cls: img.className, w: Math.round(r.width), h: Math.round(r.height), nat: [img.naturalWidth, img.naturalHeight], text: el.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) };
  });
  await ctx.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
