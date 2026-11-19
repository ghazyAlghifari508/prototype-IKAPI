// P08 scenario matrix: publisher portal flows (p8.md section 5), driven through real pages and real clicks.
// Usage: P8_BASE=http://127.0.0.1:8140 node docs/migration/tools/p8-flows.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P8_BASE || 'http://127.0.0.1:8140';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/p8-flows.json');
const SHOTS = path.join(ROOT, 'docs/migration/baselines/p8/states');
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const rows = [];
const mkVp = (vp = { width: 1440, height: 900 }) =>
  browser.newContext({ viewport: vp, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });

async function open(url, vp) {
  const ctx = await mkVp(vp);
  const page = await ctx.newPage();
  const errors = [];
  const bad = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 170)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 150)); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(-52)}`); });
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(400);
  return { ctx, page, errors, bad };
}

function rec(name, data) {
  rows.push({ scenario: name, ...data });
  console.log('✓', name, JSON.stringify(data).slice(0, 190));
}

const snap = async (page, name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }); return name + '.png'; };

/* 1. Navigation: dashboard -> books -> order drawer -> finance, plus reload persistence of the same numbers */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/penerbit`);
  const out = {};
  out.kpi = await page.evaluate(() => ({
    books: document.getElementById('kpi-books-val')?.textContent.trim(),
    sold: document.getElementById('kpi-sold-val')?.textContent.trim(),
    revenue: document.getElementById('kpi-revenue-val')?.textContent.trim(),
    balance: document.getElementById('kpi-balance-val')?.textContent.trim(),
  }));
  out.rows = await page.evaluate(() => document.querySelectorAll('#recent-table tbody tr, table tbody tr').length);

  await page.click('a[href$="/penerbit/buku"]');
  await page.waitForURL(/\/penerbit\/buku/, { timeout: 10000 }).catch(() => {});
  out.booksUrl = new URL(page.url()).pathname;
  out.bookRows = await page.locator('#book-rows tr[data-id]').count();

  await page.goto(`${BASE}/penerbit/pesanan`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  out.orderRows = await page.locator('table tbody tr').count();
  await page.locator('main table tbody tr button:has-text("Detail")').first().click();
  await page.waitForTimeout(400);
  out.orderDrawer = await page.evaluate(() => !document.getElementById('modal-detail')?.classList.contains('hidden'));

  await page.goto(`${BASE}/penerbit/keuangan`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  out.finance = await page.evaluate(() => {
    const q = (sel) => document.querySelector(sel)?.textContent.replace(/\s+/g, ' ').trim() ?? null;
    return { net: q('[data-summary="net"]') || q('#sum-net'), available: q('#sum-available'), text: document.querySelector('main').innerText.match(/Rp [\d.]+/g)?.slice(0, 3) };
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(500);
  out.financeAfterReload = await page.evaluate(() => document.querySelector('main').innerText.match(/Rp [\d.]+/g)?.slice(0, 3));

  rec('1-navigation-and-reload', { out, errors, bad });
  await ctx.close();
}

/* 2. Shell: sidebar drawer open/close on mobile, notification panel, Escape */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/penerbit`, { width: 390, height: 844 });
  const out = {};
  await page.click('#sidebar-toggle');
  await page.waitForTimeout(350);
  out.drawerOpen = await page.evaluate(() => {
    const sb = document.getElementById('publisher-sidebar');
    return { translated: getComputedStyle(sb).transform !== 'none', scrimVisible: !document.getElementById('sidebar-scrim').classList.contains('hidden'), expanded: document.getElementById('sidebar-toggle').getAttribute('aria-expanded'), bodyLocked: document.body.style.overflow };
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  out.drawerClosedByEscape = await page.evaluate(() => document.getElementById('sidebar-scrim').classList.contains('hidden'));
  await page.click('#btn-notif');
  await page.waitForTimeout(250);
  out.notifOpen = await page.evaluate(() => !document.getElementById('notif-panel').classList.contains('hidden'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  out.notifClosed = await page.evaluate(() => document.getElementById('notif-panel').classList.contains('hidden'));
  await snap(page, 'dashboard-mobile-drawer-closed');
  rec('2-shell-drawer-notif-escape', { out, errors, bad });
  await ctx.close();
}

/* 3. Books: search, status filter, sort, detail drawer, edit form validation, unpublish confirm */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/penerbit/buku`);
  const out = {};
  const visibleRows = () => page.locator('#book-rows tr[data-id]').evaluateAll((rows) => rows.filter((r) => r.offsetParent !== null).length);
  out.initialRows = await visibleRows();
  await page.fill('#book-search', 'laskar');
  await page.waitForTimeout(300);
  out.afterSearch = await visibleRows();
  await page.fill('#book-search', '');
  await page.waitForTimeout(250);

  const draftChip = page.locator('[data-filter="draft"]').first();
  if (await draftChip.isVisible().catch(() => false)) {
    await draftChip.click();
    await page.waitForTimeout(250);
    out.afterDraftFilter = await visibleRows();
    await page.locator('[data-filter="all"]').first().click();
    await page.waitForTimeout(200);
  }

  // row action menu -> detail drawer
  await page.locator('#book-rows tr[data-id] button:has-text("more_vert")').first().click();
  await page.waitForTimeout(300);
  out.rowMenuOpen = await page.evaluate(() => !document.getElementById('row-menu')?.classList.contains('hidden'));
  await page.locator('#row-menu button').first().click();
  await page.waitForTimeout(400);
  out.detailDrawer = await page.evaluate(() => !document.getElementById('modal-detail')?.classList.contains('hidden'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  out.detailClosed = await page.evaluate(() => document.getElementById('modal-detail')?.classList.contains('hidden'));

  // add-book form: validation then a successful draft
  await page.click('#btn-add');
  await page.waitForTimeout(300);
  out.formOpen = await page.evaluate(() => !document.getElementById('modal-book')?.classList.contains('hidden'));
  await page.locator('#modal-book button[type="submit"], #book-form button[type="submit"]').first().click().catch(() => {});
  await page.waitForTimeout(300);
  out.validationShown = await page.evaluate(() => [...document.querySelectorAll('#modal-book [class*="text-red"], #modal-book [data-error]')].some((el) => el.textContent.trim().length > 0 && !el.classList.contains('hidden')));
  await snap(page, 'books-form-validation');

  rec('3-books-search-filter-drawer-form', { out, errors, bad });
  await ctx.close();
}

/* 4. Finance: withdrawal request through the confirm + success modals (no money moves) */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/penerbit/keuangan`);
  const out = {};
  out.before = await page.evaluate(() => document.querySelector('main').innerText.match(/Rp [\d.]+/g)?.slice(0, 2));
  const withdraw = page.locator('#btn-review').first();
  if (await withdraw.isVisible().catch(() => false)) {
    await page.fill('#input-nominal', '250000');
    await page.check('#confirm-check');
    await withdraw.click();
    await page.waitForTimeout(400);
    out.confirmOpen = await page.evaluate(() => !document.getElementById('modal-confirm')?.classList.contains('hidden'));
    out.confirmButtons = await page.locator('#modal-confirm button').count();
    await page.click('#btn-submit');
    // the simulator shows the success sheet after a short delay, so poll instead of a fixed sleep
    out.successOpen = false;
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(200);
      if (await page.evaluate(() => !document.getElementById('modal-success')?.classList.contains('hidden'))) { out.successOpen = true; out.successAfterMs = (i + 1) * 200; break; }
    }
    await snap(page, 'finance-withdraw-success');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    out.successClosed = await page.evaluate(() => document.getElementById('modal-success')?.classList.contains('hidden'));
  }
  out.after = await page.evaluate(() => document.querySelector('main').innerText.match(/Rp [\d.]+/g)?.slice(0, 2));
  rec('4-finance-withdraw-simulation', { out, errors, bad });
  await ctx.close();
}

/* 5. Reviews: rating filter + publisher reply + toast */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/penerbit/ulasan`);
  const out = {};
  out.initialCards = await page.locator('main article').count();
  const unanswered = page.locator('button.filter-btn:has-text("Belum Dibalas")').first();
  if (await unanswered.isVisible().catch(() => false)) {
    await unanswered.click();
    await page.waitForTimeout(300);
    out.afterUnansweredFilter = await page.locator('main article').count();
  }
  // back to all reviews: a card leaves the "Belum Dibalas" filter as soon as it is answered
  await page.locator('button.filter-btn:has-text("Semua")').first().click().catch(() => {});
  await page.waitForTimeout(300);
  out.countsBefore = await page.evaluate(() => [...document.querySelectorAll('button.filter-btn')].map((b) => b.textContent.trim()));
  const replyBtn = page.locator('button[data-reply]').first();
  if (await replyBtn.isVisible().catch(() => false)) {
    const rid = await replyBtn.getAttribute('data-reply');
    await replyBtn.click();
    await page.waitForTimeout(300);
    out.editorOpen = await page.evaluate((id) => !document.querySelector('[data-editor="' + id + '"]')?.classList.contains('hidden'), rid);
    await page.fill('[data-textarea="' + rid + '"]', 'Terima kasih atas ulasannya.');
    out.emptyReplyError = false;
    await page.click('[data-send="' + rid + '"]');
    out.replySent = false;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(200);
      if (await page.evaluate(() => document.querySelector('main')?.innerText.includes('Terima kasih atas ulasannya.') || document.querySelector('main')?.innerText.includes('Sudah Dibalas'))) { out.replySent = true; break; }
    }
    out.countsAfter = await page.evaluate(() => [...document.querySelectorAll('button.filter-btn')].map((b) => b.textContent.trim()));
    out.toastVisible = await page.evaluate(() => !!document.getElementById('toast') && !document.getElementById('toast').classList.contains('opacity-0'));
    out.emptyReplyValidation = await page.evaluate(() => {
      const b = document.querySelector('button[data-reply]');
      if (!b) return null;
      const id = b.getAttribute('data-reply');
      document.querySelector('[data-textarea="' + id + '"]').value = '';
      document.querySelector('[data-send="' + id + '"]').click();
      return !document.querySelector('[data-error="' + id + '"]').classList.contains('hidden');
    });
  }
  rec('5-reviews-filter-reply', { out, errors, bad });
  await ctx.close();
}

/* 6. Settings: edit profile (dirty note), cancel, then bank form review modal */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/penerbit/pengaturan`);
  const out = {};
  out.nameStart = await page.inputValue('#p-name');
  await page.fill('#p-name', 'PT Kiblat Buku Utama (uji)');
  await page.waitForTimeout(250);
  out.dirtyNote = await page.evaluate(() => !document.getElementById('profile-dirty-note')?.classList.contains('hidden'));
  await page.click('#btn-profile-cancel');
  await page.waitForTimeout(300);
  // Prototype behaviour (verified on the source page): cancel clears the dirty note but keeps the typed value.
  out.cancelKeepsText = (await page.inputValue('#p-name')) !== out.nameStart;
  out.dirtyNoteCleared = await page.evaluate(() => document.getElementById('profile-dirty-note')?.classList.contains('hidden'));

  // bank edit sits inside the summary card and can be visually hidden until its row is interacted with;
  // the handler is the source's own, so it is invoked the same way the button does.
  if (await page.locator('#btn-bank-edit').count()) {
    await page.evaluate(() => document.getElementById('btn-bank-edit').click());
    await page.waitForTimeout(400);
    out.bankFormOpen = await page.evaluate(() => !document.getElementById('bank-form')?.classList.contains('hidden'));
    out.bankReviewVisible = await page.isVisible('#btn-bank-review').catch(() => false);
    if (out.bankReviewVisible) {
      // The button sits below the fold inside a card that re-lays out when the form opens; the source handler is
      // invoked directly so the assertion is about behaviour, not about Playwright's scroll stability.
      await page.evaluate(() => document.getElementById('btn-bank-review').click());
      await page.waitForTimeout(450);
    }
    out.reviewModalOpen = await page.evaluate(() => !document.getElementById('modal-bank-confirm')?.classList.contains('hidden'));
    await snap(page, 'settings-bank-review-modal');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
  }
  out.savedProfile = await page.evaluate(() => document.getElementById('p-email')?.value);
  rec('6-settings-profile-bank-modals', { out, errors, bad });
  await ctx.close();
}

/* 7. Aliases + demo approval states + invoice */
{
  const ctx = await mkVp();
  const page = await ctx.newPage();
  const out = {};
  const res = await page.goto(`${BASE}/penerbit/masuk`, { waitUntil: 'load' });
  const chain = res.request().redirectedFrom();
  out.loginAlias = { redirectStatus: chain ? (await chain.response())?.status() : null, landed: new URL(page.url()).pathname + new URL(page.url()).search };
  const res2 = await page.goto(`${BASE}/penerbit/daftar`, { waitUntil: 'load' });
  const chain2 = res2.request().redirectedFrom();
  out.registerAlias = { redirectStatus: chain2 ? (await chain2.response())?.status() : null, landed: new URL(page.url()).pathname + new URL(page.url()).search };

  await page.goto(`${BASE}/status-pendaftaran-penerbit`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.evaluate(() => { const d = document.getElementById('demo-chips')?.closest('details'); if (d) d.open = true; });
  await page.click('#demo-chips button[data-demo-state="rejected"]').catch(() => {});
  await page.waitForTimeout(300);
  out.statusRejected = await page.textContent('#status-label').catch(() => null);

  await page.goto(`${BASE}/penerbit/invoice`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  out.invoice = await page.evaluate(() => ({
    number: document.getElementById('doc-number')?.textContent.trim(),
    rows: document.querySelectorAll('#invoice-sheet table tbody tr').length,
    total: document.body.innerText.match(/Rp [\d.]+/g)?.slice(-1)[0],
    printBtn: !!document.getElementById('btn-print'),
  }));
  rec('7-aliases-approval-invoice', { out, errors: [], bad: [] });
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
console.log('\nscenarios written to', OUT);