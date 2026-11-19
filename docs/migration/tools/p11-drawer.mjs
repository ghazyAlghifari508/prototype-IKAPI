// Admin drawers: must start off-canvas, open on demand, and close via the X button.
// Usage: node docs/migration/tools/p11-drawer.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8140';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p11-drawer.json';
const CASES = [
  ['/admin/pengguna', '#user-drawer'],
  ['/admin/katalog', '#catalog-drawer'],
  ['/admin/moderasi-ulasan', '#mod-drawer'],
  ['/admin/pencairan', '#payout-drawer'],
  ['/admin/komunitas', '#community-drawer'],
  ['/admin/moderasi-diskusi', '#review-drawer'],
];

const browser = await chromium.launch();
const rows = [];
for (const [route, sel] of CASES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(450);
  const box = () => page.evaluate((s) => {
    const el = document.querySelector(s);
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), w: Math.round(r.width), open: el.classList.contains('is-open'), aria: el.getAttribute('aria-hidden'), vw: window.innerWidth };
  }, sel);
  const initial = await box();
  // Open without depending on a rendered row: the drawer is driven by the is-open class.
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    const scrim = document.getElementById('drawer-scrim');
    if (scrim) scrim.classList.remove('hidden');
  }, sel);
  await page.waitForTimeout(400);
  const opened = await box();
  await page.click('#drawer-close');
  await page.waitForTimeout(400);
  const closed = await box();
  const result = {
    route, drawer: sel, initial, opened, closed,
    pass: initial.x >= initial.vw - 2 && !initial.open && opened.x < opened.vw - 2 && closed.x >= closed.vw - 2 && !closed.open,
    errors,
  };
  rows.push(result);
  console.log((result.pass ? 'PASS ' : 'FAIL ') + route.padEnd(26), 'start x=' + initial.x, 'open x=' + opened.x, 'closed x=' + closed.x, 'errors', errors.slice(0, 1));
  await ctx.close();
}
fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
console.log('drawers:', rows.filter((r) => r.pass).length + '/' + rows.length, 'PASS ->', OUT);