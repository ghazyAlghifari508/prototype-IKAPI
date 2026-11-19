import { chromium } from 'playwright';
const b = await chromium.launch();
const check = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('[c] ' + m.text().slice(0, 160)); });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => ({
    viewsVisible: [...document.querySelectorAll('[id^="view-"]')].filter((e) => !e.classList.contains('hidden')).map((e) => e.id),
    cards: document.querySelectorAll('#directory-grid article').length,
    topics: document.querySelectorAll('#room-topics article, #topics-list article, [id*="topic"] article').length,
    replies: document.querySelectorAll('#reply-tree article, #replies-list article, [class*="reply"]').length,
    title: document.title.slice(0, 40),
  }));
  await ctx.close();
  return { url: new URL(url).pathname, ...r, errs: errs.slice(0, 3) };
};
for (const u of [
  'http://127.0.0.1:8140/komunitas',
  'http://127.0.0.1:8140/komunitas/community-filologi',
  'http://127.0.0.1:8140/komunitas/community-filologi/diskusi',
  'http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101',
  'http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101/balas/RPL-2026-201',
]) console.log(JSON.stringify(await check(u)));
await b.close();
