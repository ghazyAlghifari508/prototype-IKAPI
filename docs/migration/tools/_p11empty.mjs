import { chromium } from 'playwright';
import { diff } from './imagediff.mjs';
const b = await chromium.launch();
const shots = {};
for (const [tag, url] of [['blade', 'http://127.0.0.1:8140/komunitas'], ['proto', 'http://127.0.0.1:8099/prototype-copy/user/komunitas_literasi_desktop.html']]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  // Force the empty view instead of driving the QA panel: showView('empty') toggles classes only.
  await p.evaluate(() => {
    const el = document.getElementById('view-empty');
    el.classList.remove('hidden');
    el.classList.add('flex');
    const grid = document.getElementById('directory-grid');
    if (grid) grid.classList.add('hidden');
  });
  await p.waitForTimeout(500);
  const f = `docs/migration/baselines/p11/empty-${tag}.png`;
  await p.screenshot({ path: f, fullPage: true });
  shots[tag] = f;
  console.log(tag, 'empty visible:', await p.evaluate(() => !document.getElementById('view-empty').classList.contains('hidden')));
  await ctx.close();
}
const r = diff(shots.proto, shots.blade, { out: 'docs/migration/baselines/p11/empty-diff.png', threshold: 0 });
console.log('empty-state diff ratio', r.ratio, 'mismatch', r.sizeMismatch || false);
await b.close();
