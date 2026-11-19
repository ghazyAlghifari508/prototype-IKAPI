import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 90)));
await p.goto('http://127.0.0.1:8140/daftar?role=publisher', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(400);
await p.fill('#pubName', 'x'); await p.fill('#pubMember', 'y'); await p.fill('#pubAddress', 'z');
await p.click('#pub-next'); await p.waitForTimeout(300);
await p.fill('#pubPic', 'a'); await p.fill('#pubEmail', 'q'); await p.fill('#pubPhone', '1');
await p.click('#pub-next'); await p.waitForTimeout(300);
await p.fill('#pubPassword', 'p'); await p.fill('#pubPasswordConfirm', 'different');
await p.click('#pub-next'); await p.waitForTimeout(2600);
console.log('publisher wizard junk ->', new URL(p.url()).pathname, '| errors', errs.slice(0, 2));
// validation demo chip still shows field errors on login
const ctx2 = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p2 = await ctx2.newPage();
await p2.goto('http://127.0.0.1:8140/masuk', { waitUntil: 'domcontentloaded' });
await p2.waitForTimeout(300);
const chip = p2.locator('.demo-chip[data-demo="validation"]').first();
if (await chip.count()) { await chip.click(); await p2.waitForTimeout(400); }
console.log('validation chip banner:', await p2.evaluate(() => !document.getElementById('validation-banner').classList.contains('hidden')));
await b.close();
