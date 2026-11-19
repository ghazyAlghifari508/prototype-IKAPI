import { chromium } from 'playwright';
const b = await chromium.launch();
const geo = async (url, prep) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(700);
  if (prep) await prep(p);
  const r = await p.evaluate(() => {
    const box = (el) => { if (!el) return null; const q = el.getBoundingClientRect(); return [Math.round(q.x), Math.round(q.y + window.scrollY), Math.round(q.width), Math.round(q.height)]; };
    const main = document.querySelector('main');
    return {
      scrollH: document.documentElement.scrollHeight,
      hero: box(document.getElementById('hero-section')),
      chrome: box(document.querySelector('main > section:nth-child(2)')),
      shell: box(document.getElementById('community-root') || document.querySelector('main > div')),
      views: [...document.querySelectorAll('[id^="view-"]')].map((v) => [v.id, v.classList.contains('hidden'), box(v)]),
      img: box(document.querySelector('#hero-section img')),
    };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await geo('http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html'), null, 1));
console.log('B', JSON.stringify(await geo('http://127.0.0.1:8140/komunitas'), null, 1));
await b.close();
