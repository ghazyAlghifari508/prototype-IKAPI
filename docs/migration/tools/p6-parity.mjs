// P06 parity: screenshot Blade page vs prototype page at the same viewport and diff them.
// Usage: P6_BASE=http://127.0.0.1:8140 P6_GROUP=a|b|c|d|e|all node docs/migration/tools/p6-parity.mjs [name]
//        P6_VIEWPORTS=1440x900,390x844
// Writes docs/migration/baselines/p6/<name>/<viewport>-{blade,proto,diff}.png + docs/migration/p6-parity.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { diff } from './imagediff.mjs';

const BASE = process.env.P6_BASE || 'http://127.0.0.1:8140';
const PROTO = 'http://127.0.0.1:8099/prototype-copy/user';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/baselines/p6');
const GROUP = process.env.P6_GROUP || 'all';
const only = process.argv[2];
const VIEWPORTS = (process.env.P6_VIEWPORTS || '1440x900,390x844').split(',').map((v) => {
  const [w, h] = v.split('x').map(Number);
  return { label: v, width: w, height: h };
});

const PAIRS = [
  // A - auth demo
  { g: 'a', name: 'login', blade: '/masuk', proto: 'masuk_login_desktop.html' },
  { g: 'a', name: 'login-publisher', blade: '/masuk?role=publisher', proto: 'masuk_login_desktop.html?role=publisher' },
  { g: 'a', name: 'register', blade: '/daftar', proto: 'daftar_akun_register_desktop.html' },
  { g: 'a', name: 'register-publisher', blade: '/daftar?role=publisher', proto: 'daftar_akun_register_desktop.html?role=publisher' },
  { g: 'a', name: 'forgot', blade: '/lupa-kata-sandi', proto: 'lupa_kata_sandi_desktop.html' },
  { g: 'a', name: 'verify', blade: '/verifikasi-email', proto: 'verifikasi_email_desktop.html' },
  { g: 'a', name: 'onboarding', blade: '/onboarding', proto: 'onboarding_preferensi_bacaan_desktop.html' },
  { g: 'a', name: 'publisher-status', blade: '/status-pendaftaran-penerbit', proto: 'status_pendaftaran_penerbit_desktop.html' },
  { g: 'a', name: 'publisher-status-aktif', blade: '/status-pendaftaran-penerbit?sesi=aktif', proto: 'status_pendaftaran_penerbit_desktop.html?sesi=aktif' },
  // B - account & settings
  { g: 'b', name: 'profile', blade: '/akun/profil', proto: 'akun_saya_profil_dropdown_navigasi_desktop.html' },
  { g: 'b', name: 'settings', blade: '/akun/pengaturan', proto: 'pengaturan_akun_desktop.html' },
  { g: 'b', name: 'help', blade: '/akun/bantuan', proto: 'bantuan_akun_desktop.html' },
  // C - cart & checkout
  { g: 'c', name: 'cart', blade: '/keranjang', proto: 'keranjang_pembayaran_terpadu_desktop.html' },
  { g: 'c', name: 'orders', blade: '/akun/pesanan', proto: 'riwayat_pesanan_desktop.html' },
  // D - library, reader, reviews
  { g: 'd', name: 'library', blade: '/akun/perpustakaan', proto: 'perpustakaan_saya_desktop.html' },
  { g: 'd', name: 'reader', blade: '/akun/perpustakaan/laskar-aksara-pasundan/baca', proto: 'web_reader_desktop.html' },
  { g: 'd', name: 'reviews', blade: '/akun/ulasan', proto: 'riwayat_ulasan_desktop.html' },
  // E - agenda, help/chatbot
  { g: 'e', name: 'agenda', blade: '/agenda', proto: 'agenda_berita_literasi_desktop.html' },
  { g: 'e', name: 'agenda-detail', blade: '/agenda/ev-1', proto: 'detail_agenda_desktop.html?id=ev-1' },
  { g: 'e', name: 'chatbot', blade: '/akun/bantuan/chatbot', proto: 'chatbot_bantuan_rekomendasi_desktop.html' },
].filter((p) => (GROUP === 'all' || p.g === GROUP) && (!only || p.name === only));

const browser = await chromium.launch();
const results = [];

async function shot(url, vp, file) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  const bad = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 160)); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(-60)}`); });
  // `load` can stall on the Google Fonts CDN (baseline D6); fall back to domcontentloaded so the run is not lost.
  await page.goto(url, { waitUntil: 'load', timeout: 20000 }).catch(async () => { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); });
  // Deterministic fonts: the CDN can stall, and a font that arrives late changes text metrics (and page height).
  // Ask for each family explicitly and only capture once every face the pages use is loaded.
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.evaluate(async () => {
      const fams = ['400 16px "DM Sans"', '600 16px "DM Sans"', '700 16px "DM Sans"', '400 16px Literata', '600 16px Literata', '700 16px Literata', '400 16px "Material Symbols Outlined"', '400 16px "Plus Jakarta Sans"'];
      await Promise.all(fams.map((f) => document.fonts.load(f).catch(() => null)));
      await document.fonts.ready;
    }).catch(() => {});
    const ok = await page.evaluate(() => ['DM Sans', 'Literata', 'Material Symbols Outlined'].every((f) => document.fonts.check('16px "' + f + '"')));
    if (ok) break;
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  }

  // A focused input draws a blinking caret (the prototype autofocuses some fields), which made the diff flip
  // between runs. Carets are not part of the visual design, so they are made transparent for the capture only.
  await page.addStyleTag({ content: '*{caret-color:transparent !important}' });
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const imgs = [...document.images].filter((i) => !i.complete);
      if (!imgs.length) break;
      await Promise.race([Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 6000))]);
      await new Promise((r) => setTimeout(r, 200));
    }
  });
  await page.waitForTimeout(450);
  const metrics = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    scrollH: document.documentElement.scrollHeight,
    bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 24),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    h1: [...document.querySelectorAll('h1')].map((h) => ({ t: h.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), fs: getComputedStyle(h).fontSize, box: (() => { const r = h.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; })() })),
    images: document.images.length,
    brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
  }));
  await page.screenshot({ path: file, fullPage: true });
  await ctx.close();
  return { metrics, errors, bad };
}

for (const pair of PAIRS) {
  for (const vp of VIEWPORTS) {
    const dir = path.join(OUT, pair.name);
    fs.mkdirSync(dir, { recursive: true });
    const fileB = path.join(dir, `${vp.label}-blade.png`);
    const fileP = path.join(dir, `${vp.label}-proto.png`);
    const fileD = path.join(dir, `${vp.label}-diff.png`);
    const b = await shot(BASE + pair.blade, vp, fileB);
    const p = await shot(`${PROTO}/${pair.proto}`, vp, fileP);
    const r = diff(fileP, fileB, { out: fileD, threshold: 0 });
    const row = {
      page: pair.name, viewport: vp.label,
      ratio: Number((r.ratio ?? 1).toFixed(6)), diffPixels: r.diffPixels, sizeMismatch: Boolean(r.sizeMismatch) || undefined,
      protoHeight: p.metrics.scrollH, bladeHeight: b.metrics.scrollH,
      protoWidth: p.metrics.scrollW, bladeWidth: b.metrics.scrollW,
      errors: { blade: b.errors, proto: p.errors },
      badResponses: { blade: b.bad, proto: p.bad },
      h1: { blade: b.metrics.h1, proto: p.metrics.h1 },
      brokenImages: { blade: b.metrics.brokenImages, proto: p.metrics.brokenImages },
      body: { blade: [b.metrics.bodyFont, b.metrics.bodyBg], proto: [p.metrics.bodyFont, p.metrics.bodyBg] },
    };
    results.push(row);
    console.log(`${pair.name}@${vp.label} ratio=${row.ratio} sizeMismatch=${row.sizeMismatch ?? false} h=${b.metrics.scrollH}/${p.metrics.scrollH} w=${b.metrics.scrollW}/${p.metrics.scrollW} broken=${b.metrics.brokenImages}/${p.metrics.brokenImages} err=${b.errors.length}/${p.errors.length} bad=${b.bad.length}/${p.bad.length}`);
    const acc = JSON.parse(fs.existsSync(path.join(ROOT, 'docs/migration/p6-parity.json')) ? fs.readFileSync(path.join(ROOT, 'docs/migration/p6-parity.json'), 'utf8') : '[]');
    const merged = acc.filter((x) => !(x.page === row.page && x.viewport === row.viewport)).concat(row);
    fs.writeFileSync(path.join(ROOT, 'docs/migration/p6-parity.json'), JSON.stringify(merged, null, 1));
  }
}

await browser.close();