import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [label, url] of [['blade', 'http://127.0.0.1:8140/'], ['proto', 'http://127.0.0.1:8099/prototype-copy/user/beranda_desktop.html']]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(400);
  const info = await p.evaluate(() => {
    const head = document.querySelector('header');
    const nav = head?.querySelector('nav');
    const visible = (el) => el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
    const links = [...(nav?.querySelectorAll('a') || [])].map((a) => ({ t: a.textContent.trim().slice(0, 18), vis: visible(a) }));
    const btns = [...head.querySelectorAll('button, a')].filter(visible).map((e) => (e.getAttribute('aria-label') || e.textContent.trim()).slice(0, 24));
    return { headerH: head ? Math.round(head.getBoundingClientRect().height) : null, navVis: visible(nav), links, btns: [...new Set(btns)], hasHamburger: !!head.querySelector('[aria-expanded], [aria-controls]') };
  });
  console.log(label, JSON.stringify(info));
  await ctx.close();
}
await b.close();
