// P04 shell verification - measures the Blade shells and compares them with the P02 golden measurements.
// Usage: P4_BASE=http://127.0.0.1:8130 node docs/migration/tools/verify-shells.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P4_BASE || 'http://127.0.0.1:8130';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/baselines/shells');
const REPORT = path.join(ROOT, 'docs/migration/p4-verification.json');
const PROTO = 'http://127.0.0.1:8099/prototype-copy';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const mk = (vp) => browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', colorScheme: 'light', reducedMotion: 'reduce' });
const results = { base: BASE, shells: {}, behaviour: {} };

const box = (sel) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), position: s.position, zIndex: s.zIndex, bg: s.backgroundColor, display: s.display, border: s.borderTopWidth + ' ' + s.borderTopColor }; })()`;

async function measure(url, vp, label, selectors, shot) {
  const ctx = await mk(vp);
  const page = await ctx.newPage();
  const errors = [], bad = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 150)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 150)); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(0, 100)}`); });
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.evaluate(async () => { const imgs = [...document.images].filter((i) => !i.complete); await Promise.race([Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 6000))]); });
  await page.waitForTimeout(400);
  const m = {};
  for (const [k, sel] of Object.entries(selectors)) m[k] = await page.evaluate(box(sel));
  m.fonts = await page.evaluate(() => ({ status: document.fonts.status, dm: document.fonts.check('16px "DM Sans"'), icons: document.fonts.check('24px "Material Symbols Outlined"') }));
  m.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  m.errors = errors; m.badResponses = bad;
  if (shot) await page.screenshot({ path: path.join(OUT, shot), fullPage: false });
  await ctx.close();
  return m;
}

const PUBLIC_SEL = { header: 'header', logo: 'header img', search: 'header input', nav: 'header nav', main: 'main', footer: 'footer', cartBadge: '.ikapi-cart-badge', body: 'body' };
const PORTAL_SEL = { topbar: 'header', sidebar: '#publisher-sidebar', banner: '.banner-bleed', workspace: '#workspace', shellMain: '.shell-main', logo: 'header img', body: 'body' };

for (const vp of [{ n: '1440x900', width: 1440, height: 900 }, { n: '390x844', width: 390, height: 844 }]) {
  const v = { width: vp.width, height: vp.height };
  results.shells[`public-guest@${vp.n}`] = await measure(`${BASE}/ui/shell/public`, v, 'public', PUBLIC_SEL, `public-guest-${vp.n}.png`);
  results.shells[`public-member@${vp.n}`] = await measure(`${BASE}/ui/shell/public?akun=member`, v, 'public', PUBLIC_SEL, `public-member-${vp.n}.png`);
  results.shells[`auth@${vp.n}`] = await measure(`${BASE}/ui/shell/auth`, v, 'auth', { main: 'main', card: 'main > div', illustration: 'main img', body: 'body' }, `auth-${vp.n}.png`);
  results.shells[`publisher@${vp.n}`] = await measure(`${BASE}/ui/shell/publisher`, v, 'publisher', PORTAL_SEL, `publisher-${vp.n}.png`);
  results.shells[`admin@${vp.n}`] = await measure(`${BASE}/ui/shell/admin`, v, 'admin', PORTAL_SEL, `admin-${vp.n}.png`);
}

// prototype references measured with the same code (same engine, same viewport)
results.reference = {
  'beranda@1440x900': await measure(`${PROTO}/user/beranda_desktop.html`, { width: 1440, height: 900 }, 'ref', { header: 'header', logo: 'header img', search: 'header input', nav: 'header nav', main: 'main', footer: 'footer', body: 'body' }, null),
  'login@1440x900': await measure(`${PROTO}/user/masuk_login_desktop.html`, { width: 1440, height: 900 }, 'ref', { main: 'main', card: 'main > div', illustration: 'main img', body: 'body' }, null),
  'penerbit@1440x900': await measure(`${PROTO}/penerbit/dashboard_penerbit_desktop.html`, { width: 1440, height: 900 }, 'ref', { topbar: 'header', sidebar: '#publisher-sidebar', banner: '.banner-bleed', workspace: '#workspace', shellMain: '.shell-main', logo: 'header img', body: 'body' }, null),
  'admin@1440x900': await measure(`${PROTO}/admin/dashboard_administrasi_utama_desktop.html`, { width: 1440, height: 900 }, 'ref', { topbar: 'header', sidebar: '#publisher-sidebar', banner: '.banner-bleed', workspace: '#workspace', shellMain: '.shell-main', logo: 'header img', body: 'body' }, null),
  'beranda@390x844': await measure(`${PROTO}/user/beranda_desktop.html`, { width: 390, height: 844 }, 'ref', { header: 'header', nav: 'header nav', footer: 'footer' }, null),
  'penerbit@390x844': await measure(`${PROTO}/penerbit/dashboard_penerbit_desktop.html`, { width: 390, height: 844 }, 'ref', { topbar: 'header', sidebar: '#publisher-sidebar', banner: '.banner-bleed', workspace: '#workspace' }, null),
};

fs.writeFileSync(REPORT, JSON.stringify(results, null, 1));
console.log('measured', Object.keys(results.shells).length, 'shells +', Object.keys(results.reference).length, 'references');
await browser.close();
