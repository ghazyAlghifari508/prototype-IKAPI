// P11 dead-handler audit: inline handlers are kept from the prototype, but a Vite module is scoped, so every
// function referenced by onclick/onchange/onsubmit must be published on window. This finds the ones that are not.
// Usage: P11_BASE=http://127.0.0.1:8140 node docs/migration/tools/p11-handlers.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.P11_BASE || 'http://127.0.0.1:8140';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p11-handlers.json';
const ROUTES = [
  '/', '/katalog', '/buku/laskar-aksara-pasundan', '/buku/laskar-aksara-pasundan/cuplikan', '/masuk', '/daftar', '/lupa-kata-sandi',
  '/verifikasi-email', '/onboarding', '/status-pendaftaran-penerbit', '/akun/profil', '/akun/pengaturan', '/akun/bantuan',
  '/akun/bantuan/chatbot', '/keranjang', '/akun/pesanan', '/akun/perpustakaan', '/akun/perpustakaan/laskar-aksara-pasundan/baca',
  '/akun/ulasan', '/agenda', '/agenda/ev-1', '/komunitas', '/komunitas/community-filologi', '/komunitas/community-filologi/diskusi',
  '/komunitas/community-klub-buku/diskusi/TPC-2026-101', '/komunitas/community-klub-buku/diskusi/TPC-2026-101/balas/RPL-2026-201',
  '/penerbit', '/penerbit/buku', '/penerbit/pesanan', '/penerbit/keuangan', '/penerbit/ulasan', '/penerbit/pengaturan', '/penerbit/invoice',
  '/admin', '/admin/pengguna', '/admin/katalog', '/admin/moderasi-ulasan', '/admin/monitoring', '/admin/pencairan', '/admin/komunitas',
  '/admin/moderasi-diskusi', '/admin/masuk',
];

const browser = await chromium.launch();
const rows = [];
for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'id-ID', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(450);
  const res = await page.evaluate(() => {
    const attrs = ['onclick', 'onchange', 'onsubmit', 'oninput', 'onkeydown', 'onblur', 'onfocus'];
    const missing = [];
    let total = 0;
    for (const el of document.querySelectorAll('*')) {
      for (const a of attrs) {
        const v = el.getAttribute(a);
        if (!v) continue;
        total += 1;
        const m = v.trim().match(/^([A-Za-z_$][\w$]*)\s*\(/);
        if (!m) continue; // inline expressions such as `this.classList.toggle(...)` need no global
        if (typeof window[m[1]] !== 'function') missing.push({ el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''), attr: a, fn: m[1] });
      }
    }
    return { total, missing };
  });
  rows.push({ route, inlineHandlers: res.total, missing: res.missing, errors });
  await ctx.close();
  const tag = res.missing.length ? 'MISSING' : 'ok';
  console.log(tag.padEnd(8), route, res.inlineHandlers, res.missing.map((m) => m.fn).slice(0, 4).join(','));
}
fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
const bad = rows.filter((r) => r.missing.length || r.errors.length);
console.log('\nroutes with dead handlers:', bad.length, '->', OUT);