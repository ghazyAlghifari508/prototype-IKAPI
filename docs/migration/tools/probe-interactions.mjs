// P02 interaction diagnostics - what really happens after each action (DOM truth, not pixels)
import { chromium } from 'playwright';
const O = 'http://127.0.0.1:8099/prototype-copy';
const browser = await chromium.launch();

async function run(label, url, viewport, action, check) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await page.goto(`${O}/${url}`, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(350);
  const before = await page.evaluate(check);
  let actionResult = null;
  try { actionResult = await page.evaluate(action); } catch (e) { actionResult = 'THREW: ' + String(e).slice(0, 90); }
  await page.waitForTimeout(400);
  const after = await page.evaluate(check);
  console.log(JSON.stringify({ label, actionResult, before, after, changed: JSON.stringify(before) !== JSON.stringify(after), errs }));
  await ctx.close();
}

const visible = (sel) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return 'NONE'; const s = getComputedStyle(e); return s.display !== 'none' && !e.classList.contains('hidden') ? 'visible' : 'hidden'; })()`;
const anyVisible = (sels) => `(() => { const out = {}; for (const s of ${JSON.stringify(sels)}) { const e = document.querySelector(s); out[s] = !e ? 'NONE' : (getComputedStyle(e).display !== 'none' && !e.classList.contains('hidden') ? 'visible' : 'hidden'); } return out; })()`;

await run('penerbit-books openDetail', 'penerbit/kelola_buku_desktop.html', { width: 1440, height: 900 },
  `(() => { if (typeof openDetail !== 'function') return 'no-fn'; return String(openDetail.length); })()`,
  visible('#modal-detail'));
await run('penerbit-books openDetail(BK-01)', 'penerbit/kelola_buku_desktop.html', { width: 1440, height: 900 },
  `(() => { try { openDetail('BK-01'); return 'called'; } catch (e) { return 'err:' + e.message; } })()`,
  visible('#modal-detail'));
await run('penerbit-books row click', 'penerbit/kelola_buku_desktop.html', { width: 1440, height: 900 },
  `(() => { const b = document.querySelector('#book-rows tr button, #book-rows tr a'); if (!b) return 'no-button'; b.click(); return 'clicked:' + (b.getAttribute('aria-label') ?? b.textContent.trim().slice(0, 20)); })()`,
  visible('#modal-detail'));
await run('penerbit-payouts openModal', 'penerbit/pendapatan_dan_pencairan_desktop.html', { width: 1440, height: 900 },
  `(() => { if (typeof openModal !== 'function') return 'no-fn'; openModal('modal-confirm'); return 'called'; })()`,
  anyVisible(['#modal-confirm', '#modal-detail', '#modal-success']));
await run('penerbit-payouts request button', 'penerbit/pendapatan_dan_pencairan_desktop.html', { width: 1440, height: 900 },
  `(() => { const b = [...document.querySelectorAll('button')].find((x) => /Pencairan|Cairkan|Ajukan/i.test(x.textContent) && x.offsetParent !== null); if (!b) return 'no-visible-button'; b.click(); return 'clicked:' + b.textContent.trim().slice(0, 24); })()`,
  anyVisible(['#modal-confirm', '#modal-detail']));
await run('admin-payouts drawer', 'admin/kelola_pencairan_dana_desktop.html', { width: 1440, height: 900 },
  `(() => { const b = document.querySelector('#payout-rows tr button, #payout-rows tr a'); if (!b) return 'no-button'; b.click(); return 'clicked'; })()`,
  anyVisible(['#payout-drawer', '#detail-drawer']));
await run('admin-community create', 'admin/kelola_komunitas_desktop.html', { width: 1440, height: 900 },
  `(() => { if (typeof startCreate !== 'function') return 'no-fn'; startCreate(); return 'called'; })()`,
  anyVisible(['#community-drawer']));
await run('admin-discussion seed', 'admin/moderasi_diskusi_komunitas_desktop.html', { width: 1440, height: 900 },
  `(() => { if (typeof seedDemoReports !== 'function') return 'no-fn'; seedDemoReports(); return 'called'; })()`,
  `(() => ({ rows: document.querySelectorAll('#report-rows tr').length, empty: (() => { const e = document.querySelector('#state-empty'); return e ? (e.classList.contains('hidden') ? 'hidden' : 'visible') : 'NONE'; })() }))()`);
await run('admin-catalog reports tab', 'admin/pengawasan_katalog_buku_global_desktop.html', { width: 1440, height: 900 },
  `(() => { const t = [...document.querySelectorAll('.tab-btn')]; if (!t.length) return 'no-tab'; t[1].click(); return 'clicked:' + t[1].textContent.trim().slice(0, 20); })()`,
  `(() => ({ reports: (() => { const e = document.querySelector('#view-reports'); return e ? (e.classList.contains('hidden') ? 'hidden' : 'visible') : 'NONE'; })(), catalog: (() => { const e = document.querySelector('#view-catalog'); return e ? (e.classList.contains('hidden') ? 'hidden' : 'visible') : 'NONE'; })() }))()`);
await run('katalog mobile nav', 'user/katalog_buku_desktop.html', { width: 390, height: 844 },
  `(() => { const b = document.querySelector('#btn-menu, [aria-controls], [data-mobile-nav-toggle]'); if (!b) return 'no-button'; b.click(); return 'clicked:' + JSON.stringify({ id: b.id, aria: b.getAttribute('aria-label'), expanded: b.getAttribute('aria-expanded') }); })()`,
  `(() => ({ navs: [...document.querySelectorAll('nav, aside, [id*="sidebar"], [id*="mobile"]')].filter((e) => e.offsetParent !== null).length, menuExpanded: document.querySelector('#btn-menu, [aria-controls]')?.getAttribute('aria-expanded') ?? null }))()`);
await run('cart empty (removeCartItem)', 'user/keranjang_pembayaran_terpadu_desktop.html', { width: 1440, height: 900 },
  `(() => { if (typeof removeCartItem !== 'function') return 'no-fn'; ['cart-item-1', 'cart-item-2'].forEach(removeCartItem); return 'called'; })()`,
  `(() => ({ filled: (() => { const e = document.querySelector('#cart-filled-view'); return e ? (e.classList.contains('hidden') ? 'hidden' : 'visible') : 'NONE'; })(), empty: (() => { const e = document.querySelector('#cart-empty-view'); return e ? (e.classList.contains('hidden') ? 'hidden' : 'visible') : 'NONE'; })() }))()`);
await run('onboarding next', 'user/onboarding_preferensi_bacaan_desktop.html', { width: 1440, height: 900 },
  `(() => { const b = document.querySelectorAll('[data-next]'); if (!b.length) return 'no-btn'; b[0].click(); return 'clicked'; })()`,
  `(() => { const vis = [...document.querySelectorAll('[data-step]')].filter((e) => e.offsetParent !== null).map((e) => e.getAttribute('data-step')); return { visibleSteps: vis, label: document.querySelector('#step-label')?.textContent?.trim() ?? null }; })()`);
await run('reviews edit modal', 'user/riwayat_ulasan_desktop.html', { width: 1440, height: 900 },
  `(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Edit$/i.test(x.textContent.trim())); if (!b) return 'no-button'; b.click(); return 'clicked'; })()`,
  visible('#modal-edit-review'));
await run('orders detail modal', 'user/riwayat_pesanan_desktop.html', { width: 1440, height: 900 },
  `(() => { const b = [...document.querySelectorAll('button')].find((x) => /detail/i.test(x.getAttribute('aria-label') ?? '') || /Detail/i.test(x.textContent)); if (!b) return 'no-button'; b.click(); return 'clicked:' + JSON.stringify({ id: b.id, aria: b.getAttribute('aria-label'), text: b.textContent.trim().slice(0, 20) }); })()`,
  visible('#modal-order-detail'));
await run('catalog filter', 'user/katalog_buku_desktop.html', { width: 1440, height: 900 },
  `(() => { const b = [...document.querySelectorAll('button')].find((x) => /Sastra|Fiksi/i.test(x.textContent)); if (!b) return 'no-button'; b.click(); return 'clicked:' + b.textContent.trim().slice(0, 20); })()`,
  `(() => ({ count: document.querySelectorAll('#book-grid > *, #catalog-grid > *').length, active: [...document.querySelectorAll('button')].filter((b) => /Sastra|Fiksi/i.test(b.textContent) && /bg-primary/.test(b.className)).length }))()`);
await run('help faq open', 'user/bantuan_akun_desktop.html', { width: 1440, height: 900 },
  `(() => { const b = document.querySelector('details summary, .faq-item button, .faq-question'); if (!b) return 'no-button'; b.click(); return 'clicked'; })()`,
  `(() => ({ open: document.querySelectorAll('details[open]').length, hidden: document.querySelectorAll('.faq-answer:not(.hidden)').length }))()`);

await browser.close();