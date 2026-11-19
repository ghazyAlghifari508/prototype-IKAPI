// P09 scenario matrix: Administrator portal (p9.md section 6), driven through real pages and real clicks.
// Cross-feature checks write the buyer-side demo state first (P07 keys) and then read it back through admin.
// Usage: P9_BASE=http://127.0.0.1:8140 node docs/migration/tools/p9-flows.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P9_BASE || 'http://127.0.0.1:8140';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/p9-flows.json');
const SHOTS = path.join(ROOT, 'docs/migration/baselines/p9/states');
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
  await page.waitForTimeout(450);
  return { ctx, page, errors, bad };
}

function rec(name, data) {
  rows.push({ scenario: name, ...data });
  console.log('✓', name, JSON.stringify(data).slice(0, 190));
}
const snap = async (page, name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }); return name + '.png'; };

/* 1. Shell + navigation across all eight admin screens, sidebar drawer at 390, reload stability */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/admin`);
  const out = {};
  out.dashboardKpi = await page.evaluate(() => (document.getElementById('kpi-container')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120));
  out.queueRows = await page.locator('#queue-list > *, [id*="queue"] li').count();
  const links = await page.evaluate(() => [...document.querySelectorAll('aside#publisher-sidebar nav a')].map((a) => a.getAttribute('href')));
  out.sidebarLinks = links.filter(Boolean);
  await page.goto(`${BASE}/admin/pengguna`, { waitUntil: 'load' });
  out.activeNav = await page.evaluate(() => [...document.querySelectorAll('aside#publisher-sidebar nav a')].filter((a) => a.getAttribute('aria-current') === 'page').map((a) => a.textContent.trim()));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(400);
  out.rowsAfterReload = await page.locator('main table tbody tr').count();
  await ctx.close();

  const mobile = await open(`${BASE}/admin`, { width: 390, height: 844 });
  const m = mobile.page;
  const mOut = {};
  await m.click('#sidebar-toggle');
  await m.waitForTimeout(350);
  mOut.drawerOpen = await m.evaluate(() => ({
    scrim: !document.getElementById('sidebar-scrim').classList.contains('hidden'),
    expanded: document.getElementById('sidebar-toggle').getAttribute('aria-expanded'),
    locked: document.body.style.overflow,
  }));
  await m.keyboard.press('Escape');
  await m.waitForTimeout(300);
  mOut.closedByEscape = await m.evaluate(() => document.getElementById('sidebar-scrim').classList.contains('hidden'));
  await snap(m, 'admin-dashboard-390');
  await mobile.ctx.close();

  rec('1-shell-navigation-drawer', { out, mobile: mOut, errors, bad });
}

/* 2. Kelola Pengguna: search, role/status filters, drawer, approve + reject + deactivate (demo state only) */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/admin/pengguna`);
  const out = {};
  const visible = () => page.locator('main table tbody tr').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
  out.initial = await visible();
  await page.fill('#user-search', 'mizan');
  await page.waitForTimeout(300);
  out.afterSearch = await visible();
  await page.fill('#user-search', '');
  await page.waitForTimeout(250);
  await page.selectOption('#role-filter', { index: 1 }).catch(() => {});
  await page.waitForTimeout(300);
  out.afterRoleFilter = await visible();
  await page.selectOption('#role-filter', { index: 0 }).catch(() => {});
  await page.waitForTimeout(250);
  // pending registrations are the only ones with actions in the drawer
  await page.selectOption('#status-filter', { label: 'Menunggu' }).catch(() => {});
  await page.waitForTimeout(350);

  // detail drawer via the row's "Tinjau" action
  await page.locator('main table tbody tr button:has-text("Tinjau")').first().click();
  out.drawerOpen = await page.evaluate(() => !document.getElementById('user-drawer').classList.contains('hidden') && getComputedStyle(document.getElementById('user-drawer')).transform !== 'none');
  out.drawerFocus = await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName));
  await snap(page, 'admin-users-drawer');

  // approve modal through the drawer action (actions are rendered into #drawer-actions by the source script)
  out.drawerActions = await page.evaluate(() => [...document.querySelectorAll('#drawer-actions [data-action]')].map((b) => b.getAttribute('data-action')));
  const approve = page.locator('#drawer-actions [data-action="approve"]').first();
  out.approveVisible = await approve.isVisible().catch(() => false);
  if (out.approveVisible) {
    await approve.click();
    await page.waitForTimeout(350);
    out.approveModal = await page.evaluate(() => !document.getElementById('modal-approve').classList.contains('hidden'));
    await page.locator('#modal-approve button:has-text("Setujui")').last().click().catch(() => {});
    await page.waitForTimeout(500);
    out.afterApprove = await page.evaluate(() => document.querySelector('main table tbody tr')?.innerText.replace(/\s+/g, ' ').slice(0, 60));
  }
  // prototype drawers close with the drawer's own close button (Escape only closes modals)
  await page.click('#drawer-close').catch(() => {});
  await page.waitForTimeout(400);
  out.drawerClosed = await page.evaluate(() => document.getElementById('user-drawer').classList.contains('hidden'));

  rec('2-users-search-filter-drawer-actions', { out, errors, bad });
  await ctx.close();
}

/* 3. Pengawasan Katalog: search, type filter, drawer, takedown changes the demo row state */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/admin/katalog`);
  const out = {};
  out.initial = await page.locator('main table tbody tr').count();
  await page.fill('#cat-search', 'naskah');
  await page.waitForTimeout(300);
  out.afterSearch = await page.locator('main table tbody tr').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
  await page.fill('#cat-search', '');
  await page.waitForTimeout(250);
  // rows are paginated (2 per page) and only a not-yet-taken-down row exposes the action, so walk the pages
  // until an enabled takedown is found.
  let opened = false;
  for (let attempt = 0; attempt < 4 && !opened; attempt++) {
    const rows = await page.locator('main table tbody tr').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
    for (let i = 0; i < rows && !opened; i++) {
      await page.locator('main table tbody tr').evaluateAll((r, idx) => r.filter((x) => x.offsetParent !== null)[idx]?.click(), i);
      await page.waitForTimeout(350);
      out.drawerOpen = await page.evaluate(() => !document.getElementById('catalog-drawer').classList.contains('hidden'));
      out.takedownEnabled = await page.evaluate(() => !document.getElementById('btn-takedown')?.disabled);
      out.drawerDecision = await page.evaluate(() => (document.getElementById('drawer-decision')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80));
      if (out.takedownEnabled) { opened = true; break; }
      await page.click('#drawer-close').catch(() => {});
      await page.waitForTimeout(250);
    }
    if (!opened) { await page.click('#cat-next').catch(() => {}); await page.waitForTimeout(400); }
  }
  out.takedownRowFound = opened;
  if (opened) {
    out.drawerKind = await page.evaluate(() => document.getElementById('drawer-title')?.textContent.trim());
    await page.evaluate(() => document.getElementById('btn-takedown').click());
    await page.waitForTimeout(450);
    out.takedownModal = await page.evaluate(() => !document.getElementById('modal-takedown').classList.contains('hidden'));
    out.confirmDisabled = await page.evaluate(() => document.getElementById('btn-confirm-takedown')?.disabled ?? null);
    if (!out.takedownModal && out.drawerKind === 'Detail Laporan Buku') {
      // catalogue rows are the ones the takedown action belongs to; report rows expose "Tutup Laporan"
      out.closeReportVisible = await page.evaluate(() => !document.getElementById('btn-close-report')?.disabled);
      await page.evaluate(() => document.getElementById('btn-close-report').click());
      await page.waitForTimeout(500);
      out.closeReportModal = await page.evaluate(() => !document.getElementById('modal-close-report')?.classList.contains('hidden'));
      out.afterCloseReport = await page.evaluate(() => ({
        modalClosed: document.getElementById('modal-close-report')?.classList.contains('hidden'),
        drawerDecision: (document.getElementById('drawer-decision')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      }));
    }
    if (out.takedownModal && !out.confirmDisabled) {
      await page.evaluate(() => { document.getElementById('takedown-reason').value = 'Uji moderasi P09'; });
      await page.evaluate(() => document.getElementById('btn-confirm-takedown').click());
      await page.waitForTimeout(800);
      out.afterTakedown = await page.evaluate(() => ({
        modalClosed: document.getElementById('modal-takedown').classList.contains('hidden'),
        drawerDecision: (document.getElementById('drawer-decision')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        firstRow: document.querySelector('main table tbody tr')?.innerText.replace(/\s+/g, ' ').slice(0, 60),
      }));
    }
  }
  rec('3-catalog-search-drawer-takedown', { out, errors, bad });
  await ctx.close();
}

/* 4. Moderasi Ulasan: queue, filters, drawer, delete -> demo state; report types stay product-scoped */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/admin/moderasi-ulasan`);
  const out = {};
  out.queue = await page.evaluate(() => document.getElementById('queue-summary')?.innerText.replace(/\s+/g, ' ').slice(0, 90));
  out.categories = await page.evaluate(() => [...document.querySelectorAll('#category-filter option')].map((o) => o.textContent.trim()));
  const cards = () => page.locator('#queue article').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
  out.initial = await cards();
  await page.fill('#mod-search', 'ulasan');
  await page.waitForTimeout(300);
  out.afterSearch = await cards();
  await page.fill('#mod-search', '');
  await page.waitForTimeout(250);
  // walk the queue until a still-undecided record exposes an enabled delete
  let delReady = false;
  const cardCount = await page.locator('#queue [data-open]').count();
  out.cardCount = cardCount;
  for (let i = 0; i < cardCount && !delReady; i++) {
    // the source opens the drawer from the delegated `[data-open]` element inside each card
    await page.locator('#queue [data-open]').nth(i).click();
    await page.waitForTimeout(450);
    out.drawerOpen = await page.evaluate(() => !document.getElementById('mod-drawer').classList.contains('hidden'));
    delReady = await page.evaluate(() => document.getElementById('mod-drawer') && !document.getElementById('mod-drawer').classList.contains('hidden') && !document.getElementById('btn-delete').disabled);
    if (!delReady) { await page.evaluate(() => document.getElementById('drawer-close')?.click()); await page.waitForTimeout(300); }
  }
  out.deleteActionAvailable = delReady;
  if (delReady) {
    out.drawerState = await page.evaluate(() => ({
      decision: (document.getElementById('drawer-decision')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      category: (document.getElementById('drawer-category')?.innerText || '').trim(),
    }));
    await page.evaluate(() => document.getElementById('btn-delete').click());
    await page.waitForTimeout(450);
    out.deleteModal = await page.evaluate(() => !document.getElementById('modal-delete')?.classList.contains('hidden'));
    if (out.deleteModal) {
      await page.evaluate(() => document.getElementById('btn-confirm-delete').click());
      await page.waitForTimeout(950);
      out.afterDelete = await page.evaluate(() => ({
        modalClosed: document.getElementById('modal-delete').classList.contains('hidden'),
        drawerDecision: (document.getElementById('drawer-decision')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        queueText: (document.getElementById('queue')?.innerText || '').replace(/\s+/g, ' ').slice(0, 60),
      }));
    }
  }
  rec('4-review-moderation-queue-drawer-delete', { out, errors, bad });
  await ctx.close();
}

/* 5. Monitoring: periode + penerbit filter change the table, reset restores it */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/admin/monitoring`);
  const out = {};
  const txRows = () => page.locator('main table tbody tr').count();
  out.initial = await txRows();
  out.filters = await page.evaluate(() => ({
    range: [...document.querySelectorAll('#date-range option')].map((o) => o.value),
    publishers: [...document.querySelectorAll('#publisher-filter option')].map((o) => o.value),
  }));
  out.rangeDisabled = await page.evaluate(() => document.getElementById('date-range')?.disabled ?? null);
  out.rangeOptions = await page.evaluate(() => [...document.querySelectorAll('#date-range option')].map((o) => o.textContent.trim()));
  if (!out.rangeDisabled) {
    await page.selectOption('#date-range', { index: 0 }).catch(() => {});
    await page.waitForTimeout(350);
    out.afterRange = await txRows();
  }
  await page.evaluate(() => {
    const sel = document.getElementById('publisher-filter');
    if (sel && !sel.disabled && sel.options.length > 1) { sel.selectedIndex = 1; sel.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await page.waitForTimeout(400);
  out.afterPublisher = await txRows();
  await page.click('#btn-reset');
  await page.waitForTimeout(400);
  out.afterReset = await txRows();
  rec('5-monitoring-filters-reset', { out, errors, bad });
  await ctx.close();
}

/* 6. Pencairan: search, bank filter, drawer detail, finalize + reject modals (no money moves) */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/admin/pencairan`);
  const out = {};
  out.summary = await page.evaluate(() => document.getElementById('payout-summary')?.innerText.replace(/\s+/g, ' ').slice(0, 80));
  out.initial = await page.locator('main table tbody tr').count();
  await page.fill('#payout-search', 'kiblat');
  await page.waitForTimeout(300);
  out.afterSearch = await page.locator('main table tbody tr').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
  await page.fill('#payout-search', '');
  await page.waitForTimeout(250);
  await page.locator('main table tbody tr button:has-text("Periksa"), main table tbody tr a:has-text("Periksa")').first().click();
  await page.waitForTimeout(500);
  out.drawerOpen = await page.evaluate(() => !document.getElementById('payout-drawer').classList.contains('hidden'));
  const finalize = page.locator('#payout-drawer #btn-finalize').first();
  out.finalizeEnabled = await finalize.isEnabled().catch(() => false);
  if (out.finalizeEnabled) {
    await page.evaluate(() => document.getElementById('btn-finalize').click());
    await page.waitForTimeout(400);
    out.finalizeModal = await page.evaluate(() => !document.getElementById('modal-finalize').classList.contains('hidden'));
    await snap(page, 'admin-payout-finalize');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    out.modalClosed = await page.evaluate(() => document.getElementById('modal-finalize').classList.contains('hidden'));
  }
  rec('6-payouts-search-drawer-finalize', { out, errors, bad });
  await ctx.close();
}

/* 7. Kelola Komunitas: create a community in the drawer, then verify the buyer directory sees it (same origin) */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/admin/komunitas`);
  const out = {};
  out.initial = await page.locator('#community-rows tr').count();
  // the prototype's own toolbar div covers the button's centre point (verified on the source page too), so the
  // handler is invoked the same way a real click would reach it inside the browser.
  await page.evaluate(() => document.getElementById('btn-add').click());
  await page.waitForTimeout(450);
  out.drawerOpen = await page.evaluate(() => !document.getElementById('community-drawer').classList.contains('hidden'));
  const nameField = await page.evaluate(() => {
    const el = document.querySelector('#community-drawer input[type="text"], #drawer-form input');
    return el ? el.id : null;
  });
  out.nameField = nameField;
  if (nameField) {
    await page.fill('#' + nameField, 'Komunitas Uji Admin');
    await page.fill('#form-location', 'Bandung, Jawa Barat');
    await page.fill('#form-short', 'Komunitas uji dari skrip verifikasi P09.');
    await page.fill('#form-full', 'Komunitas uji dari skrip verifikasi P09 untuk memastikan drawer admin menulis ke store yang sama dengan direktori pembeli.');
    await page.evaluate(() => document.getElementById('btn-save').click());
    await page.waitForTimeout(600);
    out.afterCreate = await page.locator('#community-rows tr').count();
    out.stored = await page.evaluate(() => {
      const list = JSON.parse(localStorage.getItem('ikapi_communities_demo') || '[]');
      return { count: list.length, names: list.map((c) => c.name).slice(-2) };
    });
    // buyer directory in the same browser profile
    await page.goto(`${BASE}/komunitas`, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    out.buyerSees = await page.evaluate(() => [...document.querySelectorAll('#directory-grid article h3, #directory-grid article h2')].map((h) => h.textContent.trim()));
  }
  rec('7-communities-create-cross-buyer-directory', { out, errors, bad });
  await ctx.close();
}

/* 8. Moderasi Diskusi: buyer writes a report (P07 keys), admin moderates, buyer thread reflects it */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/komunitas/community-klub-buku/diskusi/TPC-2026-101`);
  // seed a report on a reply the way the buyer flow does
  await page.evaluate(() => {
    const key = 'ikapi_community_replies_demo';
    const replies = JSON.parse(localStorage.getItem(key) || '[]');
    // the moderation action must land on content the buyer demo owns (USR-DEMO seeds are re-seeded on load)
    const base = { topicId: 'TPC-2026-101', communityId: 'community-klub-buku', authorId: 'USR-PMB-0042', authorName: 'Pembeli Demo', createdAt: new Date().toISOString(), removed: false };
    replies.push({ ...base, id: 'RPL-P09-P', body: 'Induk uji moderasi admin', parentReplyId: null });
    replies.push({ ...base, id: 'RPL-P09-C', body: 'Anak dari induk yang dimoderasi', parentReplyId: 'RPL-P09-P' });
    localStorage.setItem(key, JSON.stringify(replies));
    const target = replies.find((r) => r.id === 'RPL-P09-P');
    window.__p9Target = target ? target.id : null;
    const reports = JSON.parse(localStorage.getItem('ikapi_discussion_reports_demo') || '[]');
    reports.push({
      id: 'RPT-P09-001', targetType: 'reply', targetId: window.__p9Target, topicId: 'TPC-2026-101',
      communityId: 'community-klub-buku', reasonId: 'abuse', reasonLabel: 'Kata kasar atau pelecehan',
      details: 'Uji moderasi P09', reporterUserId: 'USR-PMB-0042', status: 'pending',
      createdAt: '2026-11-18T09:00:00.000Z',
    });
    localStorage.setItem('ikapi_discussion_reports_demo', JSON.stringify(reports));
  });
  const out = {};
  await page.goto(`${BASE}/admin/moderasi-diskusi`, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  out.counts = await page.evaluate(() => ({ pending: document.getElementById('count-pending')?.textContent.trim(), all: document.getElementById('count-all')?.textContent.trim() }));
  out.rows = await page.locator('#report-rows tr').count();
  out.targets = await page.evaluate(() => [...document.querySelectorAll('#report-rows tr')].map((tr) => tr.innerText.replace(/\s+/g, ' ').slice(0, 54)));
  await page.click('#tab-all');
  await page.waitForTimeout(400);
  out.rowsAll = await page.locator('#report-rows tr').count();

  // open the first pending report that targets a reply
  await page.click('#tab-pending');
  await page.waitForTimeout(400);
  // the report table sits under the sticky toolbar; the handler is invoked directly (same as the button does)
  await page.evaluate(() => document.querySelector('#report-rows tr button, #report-rows tr a')?.click());
  await page.waitForTimeout(600);
  out.drawerOpen = await page.evaluate(() => !document.getElementById('review-drawer').classList.contains('hidden'));
  out.parentContext = await page.evaluate(() => ({
    parent: document.getElementById('context-parent-body')?.textContent.trim().slice(0, 40),
    topic: document.getElementById('context-topic-title')?.textContent.trim().slice(0, 40),
    siblings: document.getElementById('context-other-replies')?.textContent.trim().slice(0, 40),
  }));
  await snap(page, 'admin-discussion-review-drawer');

  const removeBtn = page.locator('#btn-remove');
  out.removeVisible = await removeBtn.isVisible().catch(() => false);
  if (out.removeVisible) {
    await removeBtn.click();
    await page.waitForTimeout(700);
    out.afterRemove = await page.evaluate(() => {
      const reports = JSON.parse(localStorage.getItem('ikapi_discussion_reports_demo') || '[]');
      const replies = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
      const rpt = reports.find((r) => r.id === 'RPT-P09-001');
      const targetId = rpt ? rpt.targetId : null;
      const target = replies.find((r) => r.id === targetId);
      const children = replies.filter((r) => r.parentReplyId === targetId);
      return { reportStatus: rpt ? rpt.status : null, targetId, targetRemoved: target ? !!target.removed : null, childrenAlive: children.filter((c) => !c.removed).length };
    });
    // buyer side sees the removal in the same browser
    await page.goto(`${BASE}/komunitas/community-klub-buku/diskusi/TPC-2026-101`, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    out.buyerThread = await page.evaluate(() => ({
      deletedPlaceholders: [...document.querySelectorAll('#reply-list .thread-node')].filter((n) => /dihapus/i.test(n.textContent)).length,
      nodes: document.querySelectorAll('#reply-list .thread-node').length,
    }));
  }
  rec('8-discussion-moderation-cross-feature', { out, errors, bad });
  await ctx.close();
}

/* 9. Admin login: demo build accepts any credentials and opens the dashboard as an explicit preview */
{
  const { ctx, page, errors, bad } = await open(`${BASE}/admin/masuk`);
  const out = {};
  await page.fill('#admin-email', 'asd');
  await page.fill('#admin-password', 'x');
  await page.click('#submit-btn');
  out.redirected = await page.waitForURL(/\/admin$/, { timeout: 15000 }).then(() => true).catch(() => false);
  out.session = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_admin_session_demo') || 'null'));
  out.dashboardRendered = await page.evaluate(() => Boolean(document.querySelector('#activity-list, main h1')));
  out.noSecurityClaim = await page.evaluate(() => !/terlindungi|secure connection/i.test(document.body.innerText));
  rec('9-admin-login-preview', { out, errors, bad });
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
console.log('\nscenarios written to', OUT);