// P02 final state pass 2 - cart payment statuses via the real demo buttons, category filter via label,
// plus DOM truth for the controls that still will not move (recorded as limitations/defects).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const O = 'http://127.0.0.1:8099/prototype-copy';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/baselines';
const OUT = path.join(ROOT, 'states-final2.json');
const browser = await chromium.launch();
const results = [];

async function capture({ key, page: p, prepare = [], file, assert, vp = { width: 1440, height: 900 }, wait = 450 }) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  pg.on('console', (m) => { if (m.type() === 'error') errs.push('[console] ' + m.text().slice(0, 160)); });
  const dir = path.join(ROOT, path.dirname(p), path.basename(p, '.html'));
  fs.mkdirSync(dir, { recursive: true });
  const rec = { key, page: p, actions: [] };
  try {
    await pg.goto(`${O}/${p}`, { waitUntil: 'load' });
    await pg.evaluate(async () => { await document.fonts.ready; });
    await pg.waitForTimeout(350);
    rec.before = await pg.evaluate(assert);
    for (const a of prepare) { rec.actions.push(await pg.evaluate(a)); await pg.waitForTimeout(wait); }
    rec.after = await pg.evaluate(assert);
    rec.reached = JSON.stringify(rec.before) !== JSON.stringify(rec.after);
    const out = path.join(dir, file);
    await pg.screenshot({ path: out });
    rec.file = path.relative(ROOT, out).replace(/\\/g, '/');
    rec.bytes = fs.statSync(out).size;
    rec.errors = errs;
  } catch (e) { rec.error = String(e).slice(0, 200); }
  results.push(rec);
  console.log(`${key} reached=${rec.reached} before=${String(rec.before).slice(0, 46)} after=${String(rec.after).slice(0, 46)} actions=${JSON.stringify(rec.actions).slice(0, 80)}${rec.errors?.length ? ' ERRS=' + rec.errors[0].slice(0, 60) : ''}`);
  await ctx.close();
}

const CART = 'user/keranjang_pembayaran_terpadu_desktop.html';
const checkout = `(() => { const b = [...document.querySelectorAll('button')].find((x) => /Lanjut ke Pembayaran/i.test(x.textContent)); if (b) b.click(); return 'checkout'; })()`;
const cartStatus = (label) => `(() => { const b = [...document.querySelectorAll('button')].find((x) => new RegExp(${JSON.stringify(label)}, 'i').test(x.textContent) && x.offsetParent !== null); if (b) { b.click(); return 'clicked:' + b.textContent.trim().slice(0, 22); } return 'no-button'; })()`;
const statusShown = (id) => `(() => { const e = document.querySelector('${id}'); return e && !e.classList.contains('hidden') && e.offsetParent !== null ? 'shown' : 'hidden'; })()`;

// 1) how many payment-status demo controls does the cart actually expose?
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const pg = await ctx.newPage();
  await pg.goto(`${O}/${CART}`, { waitUntil: 'load' });
  await pg.evaluate(checkout);
  await pg.waitForTimeout(600);
  const ctrls = await pg.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null).map((b) => `${b.textContent.replace(/\s+/g, ' ').trim().slice(0, 26)}|${b.id || '-'}`));
  console.log('CART CONTROLS after checkout:', JSON.stringify(ctrls));
  results.push({ key: 'cart#controls-inventory', page: CART, controls: ctrls });
  await ctx.close();
}

for (const [label, id] of [['Berhasil', '#status-berhasil'], ['Menunggu', '#status-menunggu'], ['Gagal', '#status-gagal'], ['Kedaluwarsa', '#status-kedaluwarsa']]) {
  await capture({ key: `cart#status-${label.toLowerCase()}`, page: CART, prepare: [checkout, cartStatus(label)], file: `state-status-${label.toLowerCase()}-final.png`, assert: statusShown(id) });
}

// 2) catalog category filter through the label (checkboxes have no ids)
await capture({
  key: 'catalog#category-filter', page: 'user/katalog_buku_desktop.html', file: 'state-category-filter-final.png',
  prepare: [`(() => { const l = [...document.querySelectorAll('label')].find((x) => /Sastra|Fiksi/i.test(x.textContent)); if (!l) return 'no-label'; const box = l.querySelector('input') ?? l.previousElementSibling; if (box && box.type === 'checkbox') { box.click(); return 'clicked:' + l.textContent.trim().slice(0, 20); } l.click(); return 'clicked-label'; })()`],
  assert: `(() => { const boxes = [...document.querySelectorAll('input[type="checkbox"]')]; return JSON.stringify({ checked: boxes.filter((b) => b.checked).map((b, i) => b.id || 'box' + i), cards: document.querySelectorAll('[data-book-id], article').length }); })()`,
});

// 3) agenda: open the article/featured modal through a real trigger
await capture({
  key: 'agenda#article-modal', page: 'user/agenda_berita_literasi_desktop.html', file: 'state-article-modal-final.png',
  prepare: [`(() => { const b = [...document.querySelectorAll('button, a')].find((x) => /Baca|Selengkapnya|Lihat/i.test(x.textContent) && x.offsetParent !== null); if (b) { b.click(); return 'clicked:' + b.textContent.trim().slice(0, 22); } return 'no-trigger'; })()`],
  assert: `(() => { const f = document.querySelector('#modal-featured-detail'), a = document.querySelector('#modal-article-preview'); return JSON.stringify({ featured: f && !f.classList.contains('hidden'), article: a && !a.classList.contains('hidden') }); })()`,
});

// 4) admin payout drawer: click Periksa and let the transition settle
await capture({
  key: 'admin-payouts#drawer', page: 'admin/kelola_pencairan_dana_desktop.html', file: 'state-drawer-final.png', wait: 900,
  prepare: [`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Periksa/i.test(x.textContent) && x.offsetParent !== null); if (b) { b.click(); return 'clicked'; } return 'no-button'; })()`],
  assert: `(() => { const d = document.querySelector('#payout-drawer'); if (!d) return 'no-drawer'; const b = d.getBoundingClientRect(); return JSON.stringify({ x: Math.round(b.x), w: Math.round(b.width), vw: innerWidth, onscreen: b.x < innerWidth - 10 }); })()`,
});

// 5) admin community drawer: is it on screen at default (i.e. always visible)?
await capture({
  key: 'admin-community#drawer-default', page: 'admin/kelola_komunitas_desktop.html', file: 'state-drawer-default-final.png',
  assert: `(() => { const d = document.querySelector('#community-drawer'); if (!d) return 'no-drawer'; const b = d.getBoundingClientRect(); return JSON.stringify({ x: Math.round(b.x), w: Math.round(b.width), vw: innerWidth, onscreen: b.x < innerWidth - 10, cls: d.className.slice(0, 40) }); })()`,
});
await capture({
  key: 'admin-community#create', page: 'admin/kelola_komunitas_desktop.html', file: 'state-create-final.png', wait: 700,
  prepare: [`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Tambah|Komunitas Baru/i.test(x.textContent) && x.offsetParent !== null); if (b) { b.click(); return 'clicked:' + b.textContent.trim().slice(0, 22); } return 'no-button'; })()`],
  assert: `(() => { const h = document.querySelector('#form-error'), f = document.querySelector('#community-drawer input'); return JSON.stringify({ drawerInputVisible: f ? f.offsetParent !== null : 'no-input' }); })()`,
});

// 6) detail book: rating stars markup truth
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const pg = await ctx.newPage();
  await pg.goto(`${O}/user/detail_buku_desktop.html`, { waitUntil: 'load' });
  await pg.evaluate(async () => { await document.fonts.ready; });
  await pg.waitForTimeout(300);
  const info = await pg.evaluate(() => {
    const sec = document.querySelector('#section-rating');
    const stars = [...(sec?.querySelectorAll('[data-star], button, span') ?? [])].filter((e) => /star/i.test(e.className) || e.hasAttribute('data-star'));
    const clicked = stars[4];
    if (clicked) clicked.click();
    return { starCount: stars.length, sampleClass: clicked?.className?.slice(0, 60) ?? null, inputs: document.querySelectorAll('#section-rating input').length, afterClickVisual: document.querySelectorAll('#section-rating .text-amber-400, #section-rating .text-yellow-400, #section-rating [fill]').length };
  });
  console.log('DETAIL RATING DOM:', JSON.stringify(info));
  results.push({ key: 'detail#rating-dom', page: 'user/detail_buku_desktop.html', dom: info });
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
await browser.close();
console.log('FINAL2 DONE');