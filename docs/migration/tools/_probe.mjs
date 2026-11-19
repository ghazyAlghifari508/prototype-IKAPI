import { chromium } from 'playwright';
const b = await chromium.launch();
const cards = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => [...document.querySelectorAll('.event-card')].map((c) => {
    const badge = c.querySelector('span[class*="bg-"], div[class*="bg-"]');
    return `${c.querySelector('h3')?.textContent.trim().slice(0, 26)} | badge=${badge ? badge.className.match(/bg-\S+/)?.[0] : '-'} | dateBadge=${c.querySelector('.absolute')?.className.match(/bg-\S+/)?.[0] ?? '-'}`;
  }));
  await ctx.close();
  return r;
};
console.log('P', await cards('http://127.0.0.1:8099/prototype-copy/user/agenda_berita_literasi_desktop.html'));
console.log('B', await cards('http://127.0.0.1:8140/agenda'));
await b.close();
