import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8140/penerbit/keuangan', { waitUntil: 'load' });
await p.waitForTimeout(400);
await p.fill('#input-nominal', '250000');
await p.check('#confirm-check');
await p.click('#btn-review');
await p.waitForTimeout(300);
await p.click('#btn-submit');
for (let i = 0; i < 6; i++) {
  await p.waitForTimeout(300);
  const st = await p.evaluate(() => ({ s: !document.getElementById('modal-success').classList.contains('hidden'), c: !document.getElementById('modal-confirm').classList.contains('hidden') }));
  if (st.s) { console.log('success appeared after', (i + 1) * 300, 'ms'); break; }
  if (i === 5) console.log('never appeared', st);
}
await p.goto('http://127.0.0.1:8140/penerbit/ulasan', { waitUntil: 'load' });
await p.waitForTimeout(400);
const rid = await p.getAttribute('button[data-reply]', 'data-reply').catch(() => null);
console.log('rid', rid);
if (rid) {
  await p.click('button[data-reply]');
  await p.waitForTimeout(200);
  await p.fill('[data-textarea="' + rid + '"]', 'Terima kasih atas ulasannya.');
  await p.click('[data-send="' + rid + '"]');
  await p.waitForTimeout(700);
  console.log('reply text present:', await p.evaluate(() => document.querySelector('main').innerText.includes('Terima kasih atas ulasannya.')));
  console.log('card text:', await p.evaluate(() => document.querySelector('main article')?.innerText.replace(/\s+/g, ' ').slice(0, 160)));
}
await p.goto('http://127.0.0.1:8140/penerbit/pengaturan', { waitUntil: 'load' });
await p.waitForTimeout(500);
console.log('settings buttons:', await p.evaluate(() => [...document.querySelectorAll('main button')].map((b) => b.id || '-').filter((x) => x !== '-')));
await b.close();
