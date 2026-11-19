// P03 foundation verification - measures the built page against the prototype reference values (P02).
// Usage: node docs/migration/tools/verify-foundation.mjs      (expects the dev server with file/sync drivers)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P3_BASE || 'http://127.0.0.1:8124';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/baselines/foundation');
const REPORT = path.join(ROOT, 'docs/migration/p3-verification.json');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const results = { base: BASE, captures: [], checks: {} };

for (const [label, vp] of [['1440x900', { width: 1440, height: 900 }], ['390x844', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  const responses = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 160)); });
  page.on('response', (r) => responses.push({ url: r.url(), status: r.status() }));
  await page.goto(`${BASE}/ui/foundation`, { waitUntil: 'load', timeout: 45000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(400);

  if (label === '1440x900') {
    results.checks = await page.evaluate(() => {
      const cs = (el, pseudo) => el ? getComputedStyle(el, pseudo) : null;
      const body = getComputedStyle(document.body);
      const swatch = document.querySelector('.bg-primary');
      const bordered = document.querySelector('#preflight-parity li.rounded-xl.border');
      const shadowSm = document.querySelector('.shadow-sm');
      const shadowXs = [...document.querySelectorAll('.shadow-xs')].pop();
      const input = document.querySelector('input[type="text"]');
      const h1 = document.querySelector('h1');
      const radius2xl = document.querySelector('.rounded-2xl');
      const icon = document.querySelector('.material-symbols-outlined');
      return {
        body: { fontFamily: body.fontFamily, fontSize: body.fontSize, color: body.color, background: body.backgroundColor, lineHeight: body.lineHeight },
        h1: { fontSize: h1 && getComputedStyle(h1).fontSize, lineHeight: h1 && getComputedStyle(h1).lineHeight, fontWeight: h1 && getComputedStyle(h1).fontWeight },
        primarySwatch: swatch && getComputedStyle(swatch).backgroundColor,
        primaryText: (() => { const p = [...document.querySelectorAll('p')].find((x) => /Rp /.test(x.textContent)); return p ? getComputedStyle(p).color : null; })(),
        borderDefault: bordered && getComputedStyle(bordered).borderTopColor,
        borderWidth: bordered && getComputedStyle(bordered).borderTopWidth,
        placeholderColor: input && getComputedStyle(input, '::placeholder').color,
        inputRadius: input && getComputedStyle(input).borderRadius,
        inputBorderColor: input && getComputedStyle(input).borderTopColor,
        shadowSm: shadowSm && getComputedStyle(shadowSm).boxShadow,
        shadowXs: shadowXs && getComputedStyle(shadowXs).boxShadow,
        radius2xl: radius2xl && getComputedStyle(radius2xl).borderTopLeftRadius,
        iconFont: icon && getComputedStyle(icon).fontFamily,
        fonts: {
          dmSans: document.fonts.check('16px "DM Sans"'),
          literata: document.fonts.check('16px "Literata"'),
          material: document.fonts.check('24px "Material Symbols Outlined"'),
          status: document.fonts.status,
          loadedFamilies: [...new Set([...document.fonts].map((f) => f.family))].slice(0, 8),
        },
        // Colour tokens are declared `@theme inline` (P04): they are NOT published as :root custom properties,
        // so token verification reads the rendered elements (swatch, bordered sample, input) instead.
        cssVars: (() => { const s = getComputedStyle(document.documentElement); return { fontSans: s.getPropertyValue('--font-sans').trim(), colorVarsPublished: ['--color-primary', '--color-ink-body', '--color-border'].some((v) => s.getPropertyValue(v).trim() !== '') }; })(),
        demo: {
          available: window.IkapiDemo.available(),
          keys: Object.keys(window.IkapiDemo.keys).length,
          mutable: window.IkapiDemo.mutableKeys.length,
          guardBefore: { admin: window.IkapiSession.adminPortalBlocked(), publisher: window.IkapiSession.publisherPortalBlocked() },
          safeNextOk: window.IkapiSession.safeNext('perpustakaan_saya_desktop.html?tab=reading'),
          safeNextRejected: window.IkapiSession.safeNext('https://example.com/x'),
          idParamValid: window.IkapiSession.isValidId('community-filologi'),
          idParamInvalid: window.IkapiSession.isValidId('../../etc/passwd'),
        },
      };
    });
    // exercise the demo widget end to end
    await page.click('#demo-write');
    await page.waitForTimeout(250);
    results.checks.demoAfterWrite = await page.evaluate(() => ({
      out: document.getElementById('demo-out').textContent,
      guardAfter: { admin: window.IkapiSession.adminPortalBlocked(), publisher: window.IkapiSession.publisherPortalBlocked() },
      stored: localStorage.getItem(window.IkapiDemo.keys.buyerSession),
    }));
    // notice renderer: proves classes that only exist inside resources/js are in the built bundle
    await page.click('#demo-notice');
    await page.waitForTimeout(250);
    results.checks.notice = await page.evaluate(() => {
      const el = document.getElementById('ikapi-demo-notice');
      if (!el) return { rendered: false };
      const cs = getComputedStyle(el);
      const icon = getComputedStyle(el.firstElementChild);
      return { rendered: true, position: cs.position, zIndex: cs.zIndex, boxShadow: cs.boxShadow, iconColor: icon.color, text: el.textContent.trim() };
    });
    await page.screenshot({ path: path.join(OUT, '1440x900-notice.png'), fullPage: false });

    await page.click('#demo-clear');
    await page.waitForTimeout(250);
    results.checks.demoAfterClear = await page.evaluate(() => ({ session: window.IkapiSession.session('buyer'), out: document.getElementById('demo-out').textContent }));
  }

  const file = path.join(OUT, `${label}.png`);
  await page.screenshot({ path: file, fullPage: true });
  results.captures.push({ viewport: label, file: path.relative(ROOT, file).replace(/\\/g, '/'), bytes: fs.statSync(file).size, errors, network: responses.filter((r) => r.status !== 200) });
  await ctx.close();
}

// every published asset must answer 200 through the app origin
const assets = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/migration/p3-assets.json'), 'utf8')).files;
const assetChecks = [];
for (const a of assets) {
  const res = await fetch(`${BASE}/${encodeURI(a.url)}`);
  assetChecks.push({ url: a.url, status: res.status, bytes: (await res.arrayBuffer()).byteLength, expected: a.bytes });
}
results.assets = {
  total: assetChecks.length,
  ok: assetChecks.filter((a) => a.status === 200).length,
  failed: assetChecks.filter((a) => a.status !== 200),
  sizeMismatch: assetChecks.filter((a) => a.bytes !== a.expected),
};

fs.writeFileSync(REPORT, JSON.stringify(results, null, 1));
console.log(JSON.stringify({
  captures: results.captures.map((c) => ({ vp: c.viewport, bytes: c.bytes, errors: c.errors.length, nonOk: c.network })),
  assets: { total: results.assets.total, ok: results.assets.ok, failed: results.assets.failed.length, sizeMismatch: results.assets.sizeMismatch.length },
}, null, 1));
await browser.close();