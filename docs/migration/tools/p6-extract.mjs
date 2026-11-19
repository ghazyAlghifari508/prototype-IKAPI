// P06 extraction: splits every target page into verbatim top-level body fragments + inline scripts.
// Output: docs/migration/p6-source/<page>/{child-NN-<slug>.html, script-NN.js, head.json, index.json}
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/design/prototype-copy/user';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p6-source';
const pages = [
  'masuk_login_desktop',
  'daftar_akun_register_desktop',
  'lupa_kata_sandi_desktop',
  'verifikasi_email_desktop',
  'onboarding_preferensi_bacaan_desktop',
  'status_pendaftaran_penerbit_desktop',
  'akun_saya_profil_dropdown_navigasi_desktop',
  'pengaturan_akun_desktop',
  'bantuan_akun_desktop',
  'keranjang_pembayaran_terpadu_desktop',
  'riwayat_pesanan_desktop',
  'perpustakaan_saya_desktop',
  'web_reader_desktop',
  'riwayat_ulasan_desktop',
  'agenda_berita_literasi_desktop',
  'detail_agenda_desktop',
  'chatbot_bantuan_rekomendasi_desktop',
];

const browser = await chromium.launch();
const index = {};
for (const page of pages) {
  const html = fs.readFileSync(path.join(SRC, page + '.html'), 'utf8');
  // JS disabled: the prototype's inline scripts run on load and mutate the DOM (detail_agenda even adds `hidden`
  // to the content section when ?id= is missing). The Blade views must start from the pristine markup and let the
  // migrated module paint the same state the prototype paints.
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.setContent(html, { waitUntil: 'domcontentloaded' });
  const data = await p.evaluate(() => ({
    bodyClass: document.body.className,
    title: document.title,
    children: [...document.body.children].map((el) => ({
      tag: el.tagName.toLowerCase(),
      id: el.id,
      cls: el.className,
      html: el.outerHTML,
      text: (el.textContent || '').trim().slice(0, 60),
    })),
  }));
  const dir = path.join(OUT, page);
  fs.mkdirSync(dir, { recursive: true });
  const rows = [];
  data.children.forEach((c, i) => {
    const slug = (c.id || c.tag + '-' + (c.cls.split(/\s+/)[0] || 'x')).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) + '-' + String(i).padStart(2, '0');
    fs.writeFileSync(path.join(dir, `child-${slug}.html`), c.html, 'utf8');
    rows.push({ file: `child-${slug}.html`, tag: c.tag, id: c.id, cls: c.cls.slice(0, 110), loc: c.html.split('\n').length, bytes: c.html.length, text: c.text });
  });
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)].map((m) => m[2]);
  scripts.forEach((s, i) => {
    fs.writeFileSync(path.join(dir, `script-${String(i).padStart(2, '0')}.js`), s.trim() + '\n', 'utf8');
  });
  fs.writeFileSync(path.join(dir, 'head.json'), JSON.stringify({ title: data.title, bodyClass: data.bodyClass }, null, 1), 'utf8');
  index[page] = { bodyClass: data.bodyClass, title: data.title, children: rows, scripts: scripts.map((s) => s.trim().split('\n').length) };
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1), 'utf8');
for (const [k, v] of Object.entries(index)) {
  console.log(`\n## ${k}  (body: ${v.bodyClass.slice(0, 70)})`);
  v.children.forEach((c) => console.log(`  ${c.file.padEnd(46)} ${String(c.loc).padStart(4)}l  ${c.text.replace(/\s+/g, ' ').slice(0, 50)}`));
  console.log('  scripts:', v.scripts.join(', '));
}