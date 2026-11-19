import { chromium } from 'playwright';
const b = await chromium.launch();
for (const url of ['http://127.0.0.1:8099/prototype-copy/user/beranda_desktop.html', 'http://127.0.0.1:8099/prototype-copy/user/katalog_buku_desktop.html']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  const state = () => p.evaluate(() => {
    const w = document.getElementById('ikapi-chat-window');
    return { cls: w.className.slice(0, 40), hidden: w.classList.contains('hidden'), h: Math.round(w.getBoundingClientRect().height), ariaExpanded: document.getElementById('launcher-button')?.getAttribute('aria-expanded') };
  });
  console.log(url.replace('http://127.0.0.1:8140', '') || '/', 'initial', JSON.stringify(await state()));
  // count how many times toggleWidgetPanel runs per click
  await p.evaluate(() => { window.__calls = 0; const orig = window.toggleWidgetPanel; window.toggleWidgetPanel = function (...a) { window.__calls++; return orig.apply(this, a); }; });
  await p.click('#launcher-button');
  await p.waitForTimeout(600);
  console.log(' after click', JSON.stringify(await state()), 'calls', await p.evaluate(() => window.__calls));
  await p.click('#launcher-button');
  await p.waitForTimeout(600);
  console.log(' second click', JSON.stringify(await state()), 'calls', await p.evaluate(() => window.__calls));
  await ctx.close();
}
await b.close();
