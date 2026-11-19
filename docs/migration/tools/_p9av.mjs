import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const avs = [...document.querySelectorAll('main table tbody tr td div, main table tbody tr td span')].filter((el) => el.className.includes('rounded-full')).slice(0, 4);
    return avs.map((el) => {
      const s = getComputedStyle(el);
      return `${String(el.className).slice(0, 44)}|bg=${s.backgroundColor}|txt=${el.textContent.trim().slice(0, 2)}`;
    });
  });
  await ctx.close();
  return r;
};
console.log('P', await dump('http://127.0.0.1:8099/prototype-copy/admin/kelola_pengguna_desktop.html'));
console.log('B', await dump('http://127.0.0.1:8140/admin/pengguna'));
await b.close();
