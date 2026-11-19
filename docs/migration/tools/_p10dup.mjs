import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', String(e).slice(0, 120)));
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku', { waitUntil: 'load' });
await p.waitForTimeout(500);
const join = p.locator('#profile-actions button', { hasText: /Gabung/i }).first();
if (await join.isVisible().catch(() => false)) { await join.click(); await p.waitForTimeout(400); }
await p.goto('http://127.0.0.1:8140/komunitas/community-klub-buku/diskusi/TPC-2026-101', { waitUntil: 'load' });
await p.waitForTimeout(600);
const before = await p.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]')).length);
await p.fill('#reply-input', 'Satu balasan root uji duplikasi.');
await p.click('#reply-submit');
await p.waitForTimeout(900);
const after = await p.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]')));
console.log('before', before, 'after', after.length, 'created:', after.filter((r) => r.body === 'Satu balasan root uji duplikasi.').length);
console.log('listeners?', await p.evaluate(() => document.querySelectorAll('#reply-form').length));
await b.close();
