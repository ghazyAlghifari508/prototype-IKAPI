import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return null;
    const q = c.getBoundingClientRect();
    return { cssBox: [+q.x.toFixed(2), +q.y.toFixed(2), +q.width.toFixed(2), +q.height.toFixed(2)], attrW: c.width, attrH: c.height, dpr: window.devicePixelRatio };
  });
  await ctx.close();
  return r;
};
console.log('P', JSON.stringify(await dump('http://127.0.0.1:8099/prototype-copy/admin/monitoring_global_desktop.html')));
console.log('B', JSON.stringify(await dump('http://127.0.0.1:8140/admin/monitoring')));
await b.close();
