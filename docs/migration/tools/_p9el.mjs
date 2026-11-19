import { chromium } from 'playwright';
const b = await chromium.launch();
const dump = async (url, vp) => {
  const ctx = await b.newContext({ viewport: vp });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const at = (x, y) => {
      window.scrollTo(0, Math.max(0, y - 300));
      const el = document.elementFromPoint(x, y - Math.max(0, y - 300));
      const q = el ? el.getBoundingClientRect() : null;
      return el ? `${el.tagName}#${el.id || '-'}.${String(el.className).slice(0, 30)}|${Math.round(q.width)}x${Math.round(q.height)}` : null;
    };
    return { y355: at(96, 355), y1726: at(269, 1726) };
  });
  await ctx.close();
  return r;
};
const vp = { width: 390, height: 844 };
console.log('P', JSON.stringify(await dump('http://127.0.0.1:8099/prototype-copy/admin/monitoring_global_desktop.html', vp)));
console.log('B', JSON.stringify(await dump('http://127.0.0.1:8140/admin/monitoring', vp)));
await b.close();
