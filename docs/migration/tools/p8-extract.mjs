// P08 extraction: split each Portal Penerbit page into verbatim top-level fragments + inline scripts.
// JS disabled: the fragments must be the pristine markup, not a state the page script already painted.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/design/prototype-copy/penerbit';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p8-source';
const pages = [
  'dashboard_penerbit_desktop',
  'kelola_buku_desktop',
  'pesanan_masuk_desktop',
  'pendapatan_dan_pencairan_desktop',
  'ulasan_pembeli_desktop',
  'pengaturan_profil_desktop',
  'invoice_penjualan_pdf_portal_penerbit',
];

const browser = await chromium.launch();
const index = {};
for (const page of pages) {
  const html = fs.readFileSync(path.join(SRC, page + '.html'), 'utf8');
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.setContent(html, { waitUntil: 'domcontentloaded' });
  const data = await p.evaluate(() => ({
    bodyClass: document.body.className,
    title: document.title,
    children: [...document.body.children].map((el) => ({
      tag: el.tagName.toLowerCase(),
      id: el.id,
      cls: String(el.className),
      html: el.outerHTML,
      text: (el.textContent || '').trim().slice(0, 50),
    })),
  }));
  const dir = path.join(OUT, page);
  fs.mkdirSync(dir, { recursive: true });
  const rows = [];
  data.children.forEach((c, i) => {
    const slug = (c.id || c.tag + '-' + (c.cls.split(/\s+/)[0] || 'x')).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) + '-' + String(i).padStart(2, '0');
    fs.writeFileSync(path.join(dir, `child-${slug}.html`), c.html, 'utf8');
    rows.push({ file: `child-${slug}.html`, tag: c.tag, id: c.id, cls: c.cls.slice(0, 100), loc: c.html.split('\n').length, bytes: c.html.length });
  });
  // scripts: inline only (CDN config + page logic)
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)].map((m) => m[2]);
  scripts.forEach((s, i) => fs.writeFileSync(path.join(dir, `script-${String(i).padStart(2, '0')}.js`), s.trim() + '\n', 'utf8'));
  fs.writeFileSync(path.join(dir, 'head.json'), JSON.stringify({ title: data.title, bodyClass: data.bodyClass }, null, 1), 'utf8');

  const keys = [...new Set(html.match(/ikapi_[a-z0-9_]+/g) || [])].sort();
  const ids = [...new Set((html.match(/\bid="([^"]+)"/g) || []).map((x) => x.slice(4, -1)))];
  index[page] = { bodyClass: data.bodyClass, title: data.title, children: rows, scripts: scripts.map((s) => s.trim().split('\n').length), keys, ids: ids.slice(0, 60) };
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1), 'utf8');
for (const [k, v] of Object.entries(index)) {
  console.log(`\n## ${k}  (${v.title})`);
  v.children.forEach((c) => console.log(`  ${c.file.padEnd(44)} ${String(c.loc).padStart(4)}l ${String(c.text || "").replace(/\s+/g, " ").slice(0, 40)}`));
  console.log('  scripts:', v.scripts.join(', '), '| keys:', v.keys.join(', ') || '-');
}