// P02 baseline capture - probe (single page, to measure size/time)
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8099/prototype-copy';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/baselines/_probe';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  locale: 'id-ID',
  timezoneId: 'Asia/Jakarta',
  colorScheme: 'light',
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();
const t0 = Date.now();
await page.goto(`${BASE}/user/beranda_desktop.html`, { waitUntil: 'networkidle' });
await page.evaluate(async () => { await document.fonts.ready; });
await page.waitForTimeout(600);
const full = `${OUT}/home-1440-full.png`;
const vp = `${OUT}/home-1440-viewport.png`;
await page.screenshot({ path: vp });
await page.screenshot({ path: full, fullPage: true });
const dims = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
console.log(JSON.stringify({ ms: Date.now() - t0, dims, vp: fs.statSync(vp).size, full: fs.statSync(full).size }));
await browser.close();