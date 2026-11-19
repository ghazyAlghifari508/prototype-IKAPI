// P02 final state pass - explicit strategies for states that did not change + DOM assertion per state.
// Usage: node docs/migration/tools/states-final.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const O = 'http://127.0.0.1:8099/prototype-copy';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/baselines';
const OUT = path.join(ROOT, 'states-final.json');
const VP = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

// strategy: array of candidate actions; assert: DOM predicate that proves the state was reached
const CASES = [
  {
    key: 'cart#status-menunggu', page: 'user/keranjang_pembayaran_terpadu_desktop.html', file: 'state-status-menunggu-final.png',
    actions: [
      `(() => { const b = [...document.querySelectorAll('button')].find((x) => /Lanjut ke Pembayaran/i.test(x.textContent)); if (b) b.click(); return 'checkout'; })()`,
      `(() => { const b = [...document.querySelectorAll('button')].find((x) => /Simulasi|Menunggu|Pending/i.test(x.textContent) && x.offsetParent !== null); if (b) { b.click(); return 'sim-btn:' + b.textContent.trim().slice(0, 24); } return 'no-sim-button'; })()`,
    ],
    assert: `(() => { const e = document.querySelector('#status-menunggu'); return e && !e.classList.contains('hidden') ? 'shown' : 'hidden'; })()`,
  },
  {
    key: 'cart#status-gagal', page: 'user/keranjang_pembayaran_terpadu_desktop.html', file: 'state-status-gagal-final.png',
    sameActions: 'cart#status-menunggu',
    assert: `(() => { const e = document.querySelector('#status-gagal'); return e && !e.classList.contains('hidden') ? 'shown' : 'hidden'; })()`,
  },
  {
    key: 'detail#comment-menu', page: 'user/detail_buku_desktop.html', file: 'state-comment-menu-final.png',
    actions: [`(() => { const b = [...document.querySelectorAll('[aria-label], button')].find((x) => /menu|opsi|laporkan/i.test((x.getAttribute('aria-label') ?? '') + ' ' + x.textContent) && x.offsetParent !== null); if (b) { b.click(); return 'clicked:' + (b.getAttribute('aria-label') ?? b.textContent.trim()).slice(0, 30); } return 'no-trigger'; })()`],
    assert: `(() => { const m = [...document.querySelectorAll('[role="menu"], .comment-menu, #comment-menu')].filter((e) => e.offsetParent !== null).length; return 'visible-menus:' + m; })()`,
  },
  {
    key: 'catalog#category-filter', page: 'user/katalog_buku_desktop.html', file: 'state-category-filter-final.png',
    actions: [`(() => { const i = document.querySelector('input[id^="cat-"]:not(#cat-all)'); if (!i) return 'no-input'; i.click(); return 'clicked:' + i.id; })()`],
    assert: `(() => { const boxes = [...document.querySelectorAll('input[id^="cat-"]')]; const checked = boxes.filter((b) => b.checked).map((b) => b.id); const cards = document.querySelectorAll('[data-book-id], .book-card').length; return JSON.stringify({ checked, cards }); })()`,
  },
  {
    key: 'help#faq-open', page: 'user/bantuan_akun_desktop.html', file: 'state-faq-open-final.png',
    actions: [`(() => { const s = document.querySelector('details'); if (!s) return 'no-details'; s.open = true; return 'opened'; })()`],
    assert: `(() => { const d = [...document.querySelectorAll('details')].map((x) => x.open); return JSON.stringify(d.slice(0, 3)); })()`,
  },
  {
    key: 'admin-community#create', page: 'admin/kelola_komunitas_desktop.html', file: 'state-create-final.png',
    actions: [`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Tambah|Buat|Komunitas Baru/i.test(x.textContent) && x.offsetParent !== null); if (b) { b.click(); return 'clicked:' + b.textContent.trim().slice(0, 24); } return 'no-button'; })()`],
    assert: `(() => { const d = document.querySelector('#community-drawer'); if (!d) return 'no-drawer'; const box = d.getBoundingClientRect(); return JSON.stringify({ visible: box.width > 0 && box.right > 0, x: Math.round(box.x) }); })()`,
  },
  {
    key: 'admin-monitoring#reset-filter', page: 'admin/monitoring_global_desktop.html', file: 'state-reset-filter-final.png',
    actions: [`(() => { const b = document.querySelector('#btn-reset-empty'); if (!b) return 'no-button'; b.click(); return 'clicked'; })()`],
    assert: `(() => { const e = document.querySelector('#state-empty'); return e ? (e.classList.contains('hidden') ? 'empty-hidden' : 'empty-shown') : 'no-empty'; })()`,
  },
  {
    key: 'admin-catalog#reports', page: 'admin/pengawasan_katalog_buku_global_desktop.html', file: 'state-reports-final.png',
    actions: [`(() => { const t = [...document.querySelectorAll('.tab-btn')][0]; if (t) { t.click(); return 'tab0:' + t.textContent.trim().slice(0, 20); } return 'no-tab'; })()`],
    assert: `(() => { const r = document.querySelector('#view-reports'), c = document.querySelector('#view-catalog'); return JSON.stringify({ reports: r && !r.classList.contains('hidden'), catalog: c && !c.classList.contains('hidden') }); })()`,
  },
  {
    key: 'admin-payouts#drawer', page: 'admin/kelola_pencairan_dana_desktop.html', file: 'state-drawer-final.png',
    actions: [`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Periksa/i.test(x.textContent) && x.offsetParent !== null); if (b) { b.click(); return 'clicked'; } return 'no-button'; })()`],
    assert: `(() => { const d = document.querySelector('#payout-drawer'); if (!d) return 'no-drawer'; const b = d.getBoundingClientRect(); return JSON.stringify({ w: Math.round(b.width), x: Math.round(b.x), vw: innerWidth }); })()`,
  },
  {
    key: 'penerbit-settings#bank-edit', page: 'penerbit/pengaturan_profil_desktop.html', file: 'state-bank-edit-final.png',
    actions: [`(() => { const b = document.querySelector('#btn-bank-edit'); if (!b) return 'no-button'; b.click(); return 'clicked'; })()`],
    assert: `(() => { const f = document.querySelector('#bank-form, [data-bank-form]'), e = document.querySelector('#bank-empty'); return JSON.stringify({ formVisible: f ? f.offsetParent !== null : 'no-form', emptyState: e ? (e.classList.contains('hidden') ? 'hidden' : 'shown') : 'no-empty' }); })()`,
  },
  {
    key: 'agenda#featured-modal', page: 'user/agenda_berita_literasi_desktop.html', file: 'state-featured-modal-final.png',
    actions: [`(() => { const c = document.querySelector('.event-card'); if (!c) return 'no-card'; c.click(); return 'clicked'; })()`],
    assert: `(() => { const m = document.querySelector('#modal-featured-detail'); return m ? (m.classList.contains('hidden') ? 'hidden' : 'shown') : 'no-modal'; })()`,
  },
  {
    key: 'detail#rating-filled', page: 'user/detail_buku_desktop.html', file: 'state-rating-filled-final.png',
    actions: [`(() => { const s = [...document.querySelectorAll('#section-rating button, #section-rating [data-star], [data-star]')]; if (!s.length) return 'no-stars'; s[s.length - 1].click(); return 'clicked-star:' + s.length; })()`],
    assert: `(() => { const inp = document.querySelector('input[name="rating"]:checked, #section-rating input:checked'); const txt = document.querySelector('#section-rating textarea, #review-text'); return JSON.stringify({ checked: inp ? inp.value : null, hasTextarea: !!txt }); })()`,
  },
  {
    key: 'penerbit/kelola_buku_desktop.html#demo-menu#draft', page: 'penerbit/kelola_buku_desktop.html', file: 'state-demo-draft-final.png',
    actions: [`document.querySelector('#demo-toggle').click()`, `(() => { const c = [...document.querySelectorAll('#demo-menu [data-demo]')].find((x) => x.getAttribute('data-demo') === 'draft'); if (c) { c.click(); return 'clicked'; } return 'no-chip'; })()`],
    assert: `(() => { const r = document.querySelector('#view-table'); return r && !r.classList.contains('hidden') ? 'table-shown' : 'table-hidden'; })()`,
  },
  {
    key: 'admin/kelola_komunitas_desktop.html#demo-menu#inactive', page: 'admin/kelola_komunitas_desktop.html', file: 'state-demo-inactive-final.png',
    actions: [`document.querySelector('#demo-toggle').click()`, `(() => { const cs = [...document.querySelectorAll('#demo-menu [data-demo]')]; const c = cs[cs.length - 1]; if (c) { c.click(); return 'clicked:' + c.getAttribute('data-demo'); } return 'no-chip'; })()`],
    assert: `(() => { const t = document.querySelector('#status-filter'); return t ? t.value : 'no-filter'; })()`,
  },
];

const browser = await chromium.launch();
const results = [];
for (const c of CASES) {
  const ctx = await browser.newContext({ viewport: VP.desktop, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('[console] ' + m.text().slice(0, 160)); });
  const dir = path.join(ROOT, path.dirname(c.page), path.basename(c.page, '.html'));
  fs.mkdirSync(dir, { recursive: true });
  const rec = { key: c.key, page: c.page, actions: [] };
  try {
    await page.goto(`${O}/${c.page}`, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(350);
    const before = await page.evaluate(c.assert);
    for (const a of c.actions) { const r = await page.evaluate(a); rec.actions.push(r); await page.waitForTimeout(450); }
    const after = await page.evaluate(c.assert);
    rec.before = before; rec.after = after; rec.reached = JSON.stringify(before) !== JSON.stringify(after);
    const file = path.join(dir, c.file);
    await page.screenshot({ path: file });
    rec.file = path.relative(ROOT, file).replace(/\\/g, '/');
    rec.bytes = fs.statSync(file).size;
    rec.errors = errs;
  } catch (e) { rec.error = String(e).slice(0, 200); }
  results.push(rec);
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  console.log(`${c.key} reached=${rec.reached} assert=${String(rec.after).slice(0, 70)} actions=${JSON.stringify(rec.actions).slice(0, 90)}`);
  await ctx.close();
}
await browser.close();
console.log('FINAL DONE', results.filter((r) => r.reached).length, '/', results.length);