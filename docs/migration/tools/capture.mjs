// P02 baseline capture - full matrix (38 canonical pages x 5 viewports)
// Run from repo root:  node docs/migration/tools/capture.mjs
//
// Environment contract (documented in p2-visual-baseline.md):
//   engine       Chromium (Playwright 1.65.1, chromium-1255)
//   dsf          1, zoom 100%, locale id-ID, timezone Asia/Jakarta
//   colorScheme  light, reducedMotion reduce (stabilises animations/transitions)
//   origin       http://127.0.0.1:8099 (static server over docs/design)
//   readiness    load event -> document.fonts.ready -> all <img> settled -> 300ms settle
//
// Baseline HTML is NEVER modified. Screenshots are written to docs/migration/baselines/.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = 'http://127.0.0.1:8099/prototype-copy';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/baselines';
const MANIFEST = path.join(ROOT, 'manifest.json');
const METRICS = path.join(ROOT, 'metrics.json');
const FULL_PAGE_MAX = 12000; // documented cap; taller pages are clipped and flagged

const VIEWPORTS = [
  { label: '1440x900', width: 1440, height: 900 },
  { label: '1366x768', width: 1366, height: 768 },
  { label: '768x1024', width: 768, height: 1024 },
  { label: '390x844', width: 390, height: 844 },
  { label: '320x700', width: 320, height: 700 },
];

const PAGES = [
  'user/beranda_desktop.html',
  'user/katalog_buku_desktop.html',
  'user/detail_buku_desktop.html',
  'user/preview_buku_desktop.html',
  'user/web_reader_desktop.html',
  'user/keranjang_pembayaran_terpadu_desktop.html',
  'user/riwayat_pesanan_desktop.html',
  'user/perpustakaan_saya_desktop.html',
  'user/riwayat_ulasan_desktop.html',
  'user/akun_saya_profil_dropdown_navigasi_desktop.html',
  'user/pengaturan_akun_desktop.html',
  'user/bantuan_akun_desktop.html',
  'user/agenda_berita_literasi_desktop.html',
  'user/detail_agenda_desktop.html',
  'user/komunitas_literasi_desktop.html',
  'user/chatbot_bantuan_rekomendasi_desktop.html',
  'user/masuk_login_desktop.html',
  'user/daftar_akun_register_desktop.html',
  'user/lupa_kata_sandi_desktop.html',
  'user/verifikasi_email_desktop.html',
  'user/onboarding_preferensi_bacaan_desktop.html',
  'user/status_pendaftaran_penerbit_desktop.html',
  'penerbit/dashboard_penerbit_desktop.html',
  'penerbit/kelola_buku_desktop.html',
  'penerbit/pesanan_masuk_desktop.html',
  'penerbit/pendapatan_dan_pencairan_desktop.html',
  'penerbit/ulasan_pembeli_desktop.html',
  'penerbit/pengaturan_profil_desktop.html',
  'penerbit/invoice_penjualan_pdf_portal_penerbit.html',
  'admin/login_administrator_desktop.html',
  'admin/dashboard_administrasi_utama_desktop.html',
  'admin/kelola_pengguna_desktop.html',
  'admin/pengawasan_katalog_buku_global_desktop.html',
  'admin/moderasi_ulasan_dan_komentar_desktop.html',
  'admin/monitoring_global_desktop.html',
  'admin/kelola_pencairan_dana_desktop.html',
  'admin/kelola_komunitas_desktop.html',
  'admin/moderasi_diskusi_komunitas_desktop.html',
];

const METRIC_SELECTORS = [
  'body',
  'header',
  'nav a',
  'aside',
  'main',
  'h1',
  'h2',
  'footer',
  'table',
  '[role="dialog"]',
  'input',
  'button',
];

const slug = (p) => p.replace(/\.html$/, '').replace(/\//g, '__');
const outDir = (p) => path.join(ROOT, path.dirname(p), path.basename(p, '.html'));

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : [];
const metrics = fs.existsSync(METRICS) ? JSON.parse(fs.readFileSync(METRICS, 'utf8')) : [];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  for (const rel of PAGES) {
    const key = `${rel}@${vp.label}`;
    if (manifest.some((m) => m.key === key && !m.error)) continue; // resume

    // Fresh context per capture: demo pages write localStorage on load (community creates a
    // buyer session), which would make the portal guards redirect later pages in the same profile.
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      locale: 'id-ID',
      timezoneId: 'Asia/Jakarta',
      colorScheme: 'light',
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
    page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));
    page.on('requestfailed', (r) => failedRequests.push(`${r.url().slice(0, 160)} :: ${r.failure()?.errorText ?? 'failed'}`));

    const dir = outDir(rel);
    fs.mkdirSync(dir, { recursive: true });
    const entry = { key, page: rel, viewport: vp.label, dir: path.relative(ROOT, dir).replace(/\\/g, '/') };

    try {
      const t0 = Date.now();
      const resp = await page.goto(`${ORIGIN}/${rel}`, { waitUntil: 'load', timeout: 45000 });
      entry.status = resp ? resp.status() : null;
      await page.evaluate(async () => { await document.fonts.ready; });
      await page.evaluate(async () => {
        const imgs = [...document.images].filter((i) => !i.complete);
        await Promise.race([
          Promise.all(imgs.map((i) => new Promise((res) => { i.onload = i.onerror = res; }))),
          new Promise((res) => setTimeout(res, 8000)),
        ]);
      });
      await page.waitForTimeout(300);

      const dims = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        scrollH: document.documentElement.scrollHeight,
        clientW: document.documentElement.clientWidth,
        clientH: document.documentElement.clientHeight,
        fonts: document.fonts.status,
        images: document.images.length,
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
        materialSymbols: [...document.querySelectorAll('.material-symbols-outlined')].slice(0, 3).map((e) => getComputedStyle(e).fontFamily),
      }));

      const vpFile = path.join(dir, `${vp.label}-viewport.png`);
      await page.screenshot({ path: vpFile });

      let fullFile = path.join(dir, `${vp.label}-full.png`);
      let fullNote = null;
      if (dims.scrollH > FULL_PAGE_MAX) {
        fullFile = fullFile.replace('-full.png', `-full-clipped${FULL_PAGE_MAX}.png`);
        await page.screenshot({ path: fullFile, clip: { x: 0, y: 0, width: vp.width, height: FULL_PAGE_MAX } });
        fullNote = `fullPage ${dims.scrollH}px > cap ${FULL_PAGE_MAX}px, clipped`;
      } else {
        await page.screenshot({ path: fullFile, fullPage: true });
      }

      const styles = await page.evaluate((sels) => {
        const pick = (el) => {
          if (!el) return null;
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return {
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            lineHeight: s.lineHeight,
            color: s.color,
            backgroundColor: s.backgroundColor,
            borderRadius: s.borderRadius,
            border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
            padding: s.padding,
            margin: s.margin,
            zIndex: s.zIndex,
            position: s.position,
            box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          };
        };
        const out = {};
        for (const sel of sels) {
          const el = document.querySelector(sel);
          if (el) out[sel] = pick(el);
        }
        const gridEls = [...document.querySelectorAll('[class*="grid-cols"]')].slice(0, 3);
        out.__grids = gridEls.map((el) => {
          const s = getComputedStyle(el);
          return { cls: el.className.toString().slice(0, 120), columns: s.gridTemplateColumns, gap: s.gap };
        });
        return out;
      }, METRIC_SELECTORS);

      entry.ms = Date.now() - t0;
      entry.dims = dims;
      entry.files = {
        viewport: path.relative(ROOT, vpFile).replace(/\\/g, '/'),
        viewportBytes: fs.statSync(vpFile).size,
        full: path.relative(ROOT, fullFile).replace(/\\/g, '/'),
        fullBytes: fs.statSync(fullFile).size,
        fullNote,
      };
      entry.finalUrl = page.url().replace(ORIGIN, '').replace('http://127.0.0.1:8099', '');
      entry.redirected = !page.url().endsWith(rel);
      entry.storageKeys = await page.evaluate(() => Object.keys(localStorage)).catch(() => []);
      entry.overflowX = dims.scrollW - dims.clientW;
      entry.brokenImages = dims.broken;
      entry.consoleErrors = consoleErrors;
      entry.pageErrors = pageErrors;
      entry.failedRequests = failedRequests;
      entry.styles = styles;
    } catch (e) {
      entry.error = String(e).slice(0, 400);
    } finally {
      await page.close();
      await ctx.close();
    }

    const i = manifest.findIndex((m) => m.key === key);
    if (i >= 0) manifest[i] = entry; else manifest.push(entry);
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
    console.log(`${key} ${entry.error ? 'ERR ' + entry.error.slice(0, 80) : 'ok'} ${entry.ms ?? ''}ms${entry.redirected ? ' REDIRECT->' + entry.finalUrl : ''}`);
  }
}

fs.writeFileSync(METRICS, JSON.stringify(manifest.map((m) => ({ key: m.key, styles: m.styles })), null, 1));
await browser.close();
console.log('DONE', manifest.length, 'entries');