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
await p.waitForTimeout(900);
console.log('after submit:', await p.evaluate(() => ({
  success: !document.getElementById('modal-success').classList.contains('hidden'),
  confirm: !document.getElementById('modal-confirm').classList.contains('hidden'),
  error: document.querySelector('[id*="error"]:not(.hidden)')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) || null,
  balance: (document.body.innerText.match(/Rp [\d.]+/g) || []).slice(0, 2),
})));
await p.goto('http://127.0.0.1:8140/penerbit/ulasan', { waitUntil: 'load' });
await p.waitForTimeout(500);
console.log('reply block:', await p.evaluate(() => {
  const btn = [...document.querySelectorAll('main button')].find((b) => b.textContent.trim() === 'Kirim Balasan');
  if (!btn) return null;
  const box = btn.closest('div, section, article');
  return { btnClass: btn.className.slice(0, 40), parentChain: [btn.parentElement.className.slice(0, 30), btn.parentElement.parentElement.className.slice(0, 40)], textarea: box?.querySelector('textarea')?.className.slice(0, 30) };
}));
await b.close();
