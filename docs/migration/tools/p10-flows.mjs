// P10 integration harness: drives the seven cross-page demo flows in ONE browser context and records every
// localStorage read/write plus the observable result of each step. This is the evidence for the state inventory.
// Usage: P10_BASE=http://127.0.0.1:8140 node docs/migration/tools/p10-flows.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P10_BASE || 'http://127.0.0.1:8140';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/p10-flows.json');
const INV = path.join(ROOT, 'docs/migration/p10-inventory.json');
const SHOTS = path.join(ROOT, 'docs/migration/baselines/p10');
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const store = { reads: {}, writes: {}, removes: {} };
const results = [];

function record(kind, key, page) {
  store[kind][key] = store[kind][key] || {};
  store[kind][key][page] = (store[kind][key][page] || 0) + 1;
}

async function session(vp = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport: vp, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
  await ctx.addInitScript(() => {
    const wrap = (name, kind) => {
      const orig = Storage.prototype[name];
      Storage.prototype[name] = function (key, value) {
        try {
          window.__p10log = window.__p10log || [];
          window.__p10log.push([kind, String(key), location.pathname]);
        } catch (e) {}
        return orig.apply(this, arguments);
      };
    };
    wrap('setItem', 'writes');
    wrap('getItem', 'reads');
    wrap('removeItem', 'removes');
  });
  const page = await ctx.newPage();
  const errors = [];
  const bad = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 170)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 150)); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(-50)}`); });
  return { ctx, page, errors, bad };
}

async function go(page, url) {
  await page.goto(BASE + url, { waitUntil: 'load', timeout: 45000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(450);
  const log = await page.evaluate(() => { const l = window.__p10log || []; window.__p10log = []; return l; });
  for (const [kind, key, where] of log) record(kind, key, where.replace(/\/[A-Z]{3}-\d{4}-\d+|\/[a-z-]{6,}/g, '/:id'));
}

function rec(name, data) {
  results.push({ scenario: name, ...data });
  console.log('✓', name, JSON.stringify(data).slice(0, 200));
}

const text = (page, sel) => page.evaluate((s) => (document.querySelector(s)?.innerText || '').replace(/\s+/g, ' ').trim(), sel);

/* ============================ 1. Guest -> catalog -> detail -> cart -> login -> checkout -> orders -> library -> reader */
{
  const { ctx, page, errors, bad } = await session();
  const out = {};
  await go(page, '/katalog');
  out.catalogCards = await page.locator('#catalog-products-container article').count();
  await page.locator('#catalog-products-container article a[href*="/buku/"]').first().click();
  await page.waitForURL(/\/buku\//, { timeout: 15000 }).catch(() => {});
  out.detailUrl = new URL(page.url()).pathname;
  const slug = out.detailUrl.split('/').pop();
  await page.click('#btnAddToCart');
  await page.waitForTimeout(400);
  out.cartBadgeAfterAdd = await text(page, '.ikapi-cart-badge');
  await go(page, '/keranjang');
  out.cartItems = await page.locator('#cart-filled-view article.cart-item').count();
  out.cartTotal = await text(page, '#summary-total');
  // simulated checkout
  await page.evaluate(() => { document.getElementById('btn-checkout')?.click(); });
  await page.waitForTimeout(500);
  out.snapOpen = await page.evaluate(() => !document.getElementById('snap-overlay')?.classList.contains('hidden'));
  out.paymentMethods = await page.evaluate(() => [...document.querySelectorAll('#snap-selection-view button[onclick*="selectPaymentMethod"]')].length);
  out.methods = await page.evaluate(() => [...document.querySelectorAll('#snap-selection-view button[onclick*="selectPaymentMethod"]')].map((b) => b.textContent.replace(/\s+/g, ' ').trim().slice(0, 22)));
  await page.evaluate(() => document.querySelectorAll('#snap-selection-view button[onclick*="selectPaymentMethod"]')[0]?.click());
  await page.waitForTimeout(400);
  out.afterMethodView = await page.evaluate(() => [...document.querySelectorAll('#snap-modal-box [id^="status-"]')].filter((e) => !e.classList.contains('hidden')).map((e) => e.id));
  await page.evaluate(() => window.setDemoPaymentStatus('berhasil'));
  await page.waitForTimeout(1200);
  out.statusPanel = await page.evaluate(() => [...document.querySelectorAll('#snap-modal-box [id^="status-"]')].filter((e) => !e.classList.contains('hidden')).map((e) => e.id));
  await page.evaluate(() => { document.getElementById('snap-overlay')?.classList.add('hidden'); });
  // orders -> library -> reader
  await go(page, '/akun/pesanan');
  out.orders = await page.locator('#orders-container article').count();
  out.orderStatuses = await page.evaluate(() => [...document.querySelectorAll('#orders-container article')].map((a) => (a.innerText.match(/(Pembayaran Berhasil|Menunggu Pembayaran|Pembayaran Gagal|Kedaluwarsa)/) || [])[1]).filter(Boolean));
  await go(page, '/akun/perpustakaan');
  out.libraryBooks = await page.locator('#booksGrid > *').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
  const readLink = await page.evaluate(() => document.querySelector('#booksGrid a[href*="/baca"]')?.getAttribute('href') || null);
  out.readerLink = readLink;
  if (readLink) {
    await go(page, readLink.replace(BASE, ''));
    out.readerPage = await text(page, '#page-indicator');
    await page.click('#btn-next-page');
    await page.waitForTimeout(400);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(600);
    out.readerAfterReload = await text(page, '#page-indicator');
    out.storedProgress = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_reader_pos_laskar_aksara') || 'null'));
  }
  rec('1-guest-catalog-cart-checkout-orders-library-reader', { out, detailSlug: slug, errors, bad });
  await ctx.close();
}

/* ============================ 2. Publisher registration -> pending -> admin approval -> publisher dashboard + rejection */
{
  const { ctx, page, errors, bad } = await session();
  const out = {};
  await go(page, '/daftar');
  await page.click('#tab-publisher');
  out.step1 = await page.isVisible('[data-step="1"] #pubName');
  await page.fill('#pubName', 'CV Penerbit Uji P10');
  await page.fill('#pubMember', '999/JBA/2026');
  await page.fill('#pubAddress', 'Jl. Uji Integrasi No. 1, Bandung');
  await page.click('#pub-next');
  await page.waitForTimeout(300);
  await page.fill('#pubPic', 'Uji PJ');
  await page.fill('#pubEmail', 'uji-p10@penerbit.co.id');
  await page.fill('#pubPhone', '081200001111');
  await page.click('#pub-next');
  await page.waitForTimeout(300);
  await page.fill('#pubPassword', 'demo12345');
  await page.fill('#pubPasswordConfirm', 'demo12345');
  await page.check('#pubTerms');
  await page.click('#pub-next');
  await page.waitForURL(/status-pendaftaran-penerbit/, { timeout: 15000 }).catch(() => {});
  out.statusUrl = new URL(page.url()).pathname;
  out.application = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_publisher_application_demo') || 'null'));
  out.statusPending = await text(page, '#status-label');
  // admin approves the same application in the same browser
  await go(page, '/admin/pengguna');
  await page.selectOption('#status-filter', { label: 'Menunggu' }).catch(() => {});
  await page.waitForTimeout(350);
  out.adminRows = await page.locator('main table tbody tr').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
  out.adminNames = await page.evaluate(() => [...document.querySelectorAll('main table tbody tr')].filter((x) => x.offsetParent !== null).map((tr) => tr.innerText.replace(/\s+/g, ' ').slice(0, 40)));
  // publisher status page honours ?sesi= for the demo
  await go(page, '/status-pendaftaran-penerbit?sesi=aktif');
  out.statusApproved = await text(page, '#status-label');
  out.cta = await text(page, '#action-block');
  // rejection case
  await go(page, '/status-pendaftaran-penerbit');
  await page.evaluate(() => { const d = document.getElementById('demo-chips')?.closest('details'); if (d) d.open = true; });
  await page.click('#demo-chips button[data-demo-state="rejected"]');
  await page.waitForTimeout(300);
  out.statusRejected = await text(page, '#status-label');
  out.rejectReasonShown = await page.evaluate(() => !document.getElementById('reason-block')?.classList.contains('hidden'));
  rec('2-publisher-register-pending-admin-approved-rejected', { out, errors, bad });
  await ctx.close();
}

/* ============================ 3. Publisher book edit -> buyer catalog + admin catalog visibility */
{
  const { ctx, page, errors, bad } = await session();
  const out = {};
  await go(page, '/penerbit/buku');
  out.publisherRows = await page.locator('#book-rows tr[data-id]').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
  out.publisherTitles = await page.evaluate(() => [...document.querySelectorAll('#book-rows tr[data-id]')].filter((x) => x.offsetParent !== null).map((tr) => tr.getAttribute('data-title')));
  // edit the first book through the row menu -> form
  await page.locator('#book-rows tr[data-id] button:has-text("more_vert")').first().click();
  await page.waitForTimeout(300);
  out.rowMenu = await page.evaluate(() => !document.getElementById('row-menu')?.classList.contains('hidden'));
  const editBtn = page.locator('#row-menu button:has-text("Ubah"), #row-menu button:has-text("Edit")').first();
  out.editAvailable = await editBtn.isVisible().catch(() => false);
  if (out.editAvailable) {
    await editBtn.click();
    await page.waitForTimeout(400);
    out.formOpen = await page.evaluate(() => !document.getElementById('modal-book')?.classList.contains('hidden'));
  }
  // buyer catalog and admin catalog read the same fixture titles
  await go(page, '/katalog');
  out.buyerTitles = await page.evaluate(() => [...document.querySelectorAll('#catalog-products-container article h3')].map((h) => h.textContent.trim()).slice(0, 6));
  await go(page, '/admin/katalog');
  out.adminCatalogRows = await page.locator('main table tbody tr').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
  out.adminCatalogText = await page.evaluate(() => [...document.querySelectorAll('main table tbody tr')].filter((x) => x.offsetParent !== null).map((tr) => tr.innerText.replace(/\s+/g, ' ').slice(0, 34)));
  rec('3-publisher-book-edit-buyer-admin-catalog', { out, errors, bad });
  await ctx.close();
}

/* ============================ 4. Buyer review/report -> admin moderation -> buyer review visibility */
{
  const { ctx, page, errors, bad } = await session();
  const out = {};
  await go(page, '/buku/laskar-aksara-pasundan');
  await page.click('.star-btn[data-rating="4"]');
  await page.fill('#user-review-text', 'Ulasan integrasi P10.');
  await page.click('#btn-submit-rating');
  await page.waitForTimeout(600);
  out.reviewStored = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_rating_laskar_aksara') || 'null'));
  out.historyStored = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_user_review_history') || 'null'));
  await go(page, '/akun/ulasan');
  out.reviewsPage = await page.locator('#reviews-list-container article').count();
  out.reviewsText = await page.evaluate(() => (document.getElementById('reviews-list-container')?.innerText || '').replace(/\s+/g, ' ').slice(0, 90));
  // report a comment (product review), then read it in admin moderation
  await go(page, '/buku/laskar-aksara-pasundan');
  await page.click('#reviews-list-container article .comment-menu-btn');
  await page.waitForTimeout(300);
  await page.click('#comment-menu [data-action="report"]');
  await page.waitForTimeout(350);
  await page.check('#report-reasons input[value="spam"]');
  await page.click('#report-submit');
  await page.waitForTimeout(700);
  out.commentReport = await page.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_comment_reports_demo') || '[]')).slice(-1)[0] || null);
  await go(page, '/admin/moderasi-ulasan');
  out.adminQueue = await text(page, '#queue-summary');
  out.adminCards = await page.locator('#queue article').count();
  rec('4-buyer-review-report-admin-moderation', { out, errors, bad });
  await ctx.close();
}

/* ============================ 5. Community join -> topic -> child reply -> admin moderation -> buyer thread */
{
  const { ctx, page, errors, bad } = await session();
  const out = {};
  await go(page, '/komunitas/community-klub-buku');
  const join = page.locator('#profile-actions button', { hasText: /Gabung/i }).first();
  if (await join.isVisible().catch(() => false)) { await join.click(); await page.waitForTimeout(450); }
  out.memberships = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_community_memberships_demo') || 'null'));
  await go(page, '/komunitas/community-klub-buku/diskusi');
  await page.evaluate(() => document.getElementById('btn-new-topic')?.click());
  await page.waitForTimeout(350);
  await page.fill('#topic-title-input', 'Topik integrasi P10');
  await page.fill('#topic-body-input', 'Topik dibuat oleh harness integrasi P10.');
  await page.click('#composer-submit');
  await page.waitForURL(/\/diskusi\/TPC/, { timeout: 15000 }).catch(() => {});
  out.topicUrl = new URL(page.url()).pathname;
  await page.fill('#reply-input', 'Balasan induk P10.');
  await page.click('#reply-submit');
  await page.waitForTimeout(700);
  const replyId = await page.evaluate(() => {
    const list = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
    const r = list.find((x) => x.body === 'Balasan induk P10.');
    return r ? r.id : null;
  });
  out.parentReplyId = replyId;
  await page.locator('#reply-list .thread-node button', { hasText: /Balas/i }).first().click();
  await page.waitForURL(/\/balas\//, { timeout: 15000 }).catch(() => {});
  await page.fill('#reply-view-input', 'Balasan anak P10.');
  await page.click('#reply-view-submit');
  await page.waitForTimeout(800);
  out.graph = await page.evaluate(() => {
    const list = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
    const parent = list.find((r) => r.body === 'Balasan induk P10.');
    const child = list.find((r) => r.body === 'Balasan anak P10.');
    return { parent: parent && parent.id, child: child && child.id, childParent: child && child.parentReplyId };
  });
  // report the parent reply, moderate it, then read the buyer thread
  await page.goto(BASE + out.topicUrl, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const reports = JSON.parse(localStorage.getItem('ikapi_discussion_reports_demo') || '[]');
    reports.push({ id: 'RPT-P10-001', targetType: 'reply', targetId: window.__p10Parent, topicId: null, communityId: 'community-klub-buku', reasonId: 'spam', reasonLabel: 'Spam atau promosi', details: 'Uji P10', reporterUserId: 'USR-PMB-0042', status: 'pending', createdAt: new Date().toISOString() });
    localStorage.setItem('ikapi_discussion_reports_demo', JSON.stringify(reports));
  }).catch(() => {});
  // the report above needs the real target id; do it properly from node side:
  await page.evaluate((rid) => {
    const reports = JSON.parse(localStorage.getItem('ikapi_discussion_reports_demo') || '[]').filter((r) => r.id !== 'RPT-P10-001');
    reports.push({ id: 'RPT-P10-001', targetType: 'reply', targetId: rid, topicId: null, communityId: 'community-klub-buku', reasonId: 'spam', reasonLabel: 'Spam atau promosi', details: 'Uji P10', reporterUserId: 'USR-PMB-0042', status: 'pending', createdAt: new Date().toISOString() });
    localStorage.setItem('ikapi_discussion_reports_demo', JSON.stringify(reports));
  }, replyId);
  await go(page, '/admin/moderasi-diskusi');
  out.adminPending = await text(page, '#count-pending');
  out.adminTargets = await page.evaluate(() => [...document.querySelectorAll('#report-rows tr')].map((tr) => tr.innerText.replace(/\s+/g, ' ').slice(0, 44)));
  await page.evaluate(() => document.querySelector('#report-rows tr button, #report-rows tr a')?.click());
  await page.waitForTimeout(600);
  out.drawerOpen = await page.evaluate(() => !document.getElementById('review-drawer')?.classList.contains('hidden'));
  out.drawerContext = await page.evaluate(() => ({
    topic: (document.getElementById('context-topic-title')?.textContent || '').trim().slice(0, 40),
    siblings: (document.getElementById('context-other-replies')?.textContent || '').trim().slice(0, 40),
  }));
  await page.evaluate(() => document.getElementById('btn-remove')?.click());
  await page.waitForTimeout(800);
  out.afterModeration = await page.evaluate(() => {
    const reports = JSON.parse(localStorage.getItem('ikapi_discussion_reports_demo') || '[]');
    const replies = JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]');
    const rpt = reports.find((r) => r.id === 'RPT-P10-001');
    const targetId = rpt ? rpt.targetId : null;
    const target = replies.find((r) => r.id === targetId);
    const kids = replies.filter((r) => target && r.parentReplyId === target.id);
    return { reportStatus: rpt ? rpt.status : null, targetId, targetRemoved: !!(target && target.removed), childIds: kids.map((k) => k.id), childrenAlive: kids.filter((k) => !k.removed).length, totalReplies: replies.length };
  });
  await go(page, out.topicUrl);
  out.buyerThread = await page.evaluate(() => ({
    nodes: document.querySelectorAll('#reply-list .thread-node').length,
    placeholders: [...document.querySelectorAll('#reply-list .thread-node')].filter((n) => /dihapus/i.test(n.textContent)).length,
    childVisible: (document.getElementById('reply-list')?.innerText || '').includes('Balasan anak P10.'),
  }));
  rec('5-community-join-topic-child-admin-moderation', { out, errors, bad });
  await ctx.close();
}

/* ============================ 6. Publisher payout request -> admin payout status -> publisher finance */
{
  const { ctx, page, errors, bad } = await session();
  const out = {};
  await go(page, '/penerbit/keuangan');
  out.publisherBefore = await page.evaluate(() => (document.body.innerText.match(/Rp [\d.]+/g) || []).slice(0, 2));
  await page.fill('#input-nominal', '250000');
  await page.check('#confirm-check');
  await page.click('#btn-review');
  await page.waitForTimeout(400);
  out.confirmOpen = await page.evaluate(() => !document.getElementById('modal-confirm')?.classList.contains('hidden'));
  await page.click('#btn-submit');
  out.success = await page.waitForFunction(() => !document.getElementById('modal-success')?.classList.contains('hidden'), { timeout: 6000 }).then(() => true).catch(() => false);
  out.publisherAfter = await page.evaluate(() => (document.body.innerText.match(/Rp [\d.]+/g) || []).slice(0, 2));
  await go(page, '/admin/pencairan');
  out.adminSummary = await text(page, '#payout-summary');
  out.adminRows = await page.locator('main table tbody tr').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
  out.adminAmounts = await page.evaluate(() => [...document.querySelectorAll('main table tbody tr')].filter((x) => x.offsetParent !== null).map((tr) => (tr.innerText.match(/Rp [\d.]+/) || [])[0]));
  rec('6-publisher-payout-admin-status', { out, errors, bad });
  await ctx.close();
}

/* ============================ 7. Refresh / Back / deep links / role switch / invalid ids */
{
  const { ctx, page, errors, bad } = await session();
  const out = {};
  await go(page, '/buku/laskar-aksara-pasundan');
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(400);
  out.reloadKeepsPage = new URL(page.url()).pathname;
  await page.goBack({ waitUntil: 'load' }).catch(() => {});
  out.backTo = new URL(page.url()).pathname;
  await go(page, '/katalog');
  await page.goForward({ waitUntil: 'load' }).catch(() => {});
  out.forwardTo = new URL(page.url()).pathname;
  // invalid ids must not fall back to the first row
  const codes = {};
  for (const [label, url] of [
    ['book', '/buku/tidak-ada'],
    ['community', '/komunitas/tidak-ada'],
    ['topic', '/komunitas/community-klub-buku/diskusi/TPC-TIDAK-ADA'],
    ['reply', '/komunitas/community-klub-buku/diskusi/TPC-2026-101/balas/RPL-TIDAK-ADA'],
    ['invalidRole', '/masuk?role=superadmin'],
  ]) {
    const res = await page.goto(BASE + url, { waitUntil: 'load' });
    await page.waitForTimeout(350);
    codes[label] = { status: res.status(), url: new URL(page.url()).pathname };
    if (label === 'invalidRole') codes[label].activeTab = await page.evaluate(() => document.querySelector('.role-tab[aria-selected="true"]')?.id || null);
    if (label === 'topic') codes[label].unavailable = await page.evaluate(() => !!document.getElementById('topic-unavailable') && !document.getElementById('topic-unavailable').classList.contains('hidden'));
    if (label === 'reply') codes[label].parentUnavailable = await page.evaluate(() => {
      const el = document.getElementById('reply-parent-unavailable');
      return !!el && !el.classList.contains('hidden');
    });
  }
  out.invalid = codes;
  // role switch must not auto-login anywhere
  await go(page, '/masuk');
  await page.click('#tab-publisher');
  out.roleTab = await page.getAttribute('#tab-publisher', 'aria-selected');
  out.sessionAfterRoleSwitch = await page.evaluate(() => localStorage.getItem('ikapi_buyer_session_demo'));
  rec('7-refresh-back-deeplinks-roles-invalid-ids', { out, errors, bad });
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify({ flows: results, storage: store }, null, 2) + '\n', 'utf8');

// inventory from the observed traffic + the static fixture list
const keys = new Set([...Object.keys(store.reads), ...Object.keys(store.writes), ...Object.keys(store.removes)]);
const inventory = [...keys].sort().map((key) => ({
  key,
  writers: Object.keys(store.writes[key] || {}).sort(),
  readers: Object.keys(store.reads[key] || {}).sort(),
  removers: Object.keys(store.removes[key] || {}).sort(),
  writeCount: Object.values(store.writes[key] || {}).reduce((a, b) => a + b, 0),
  readCount: Object.values(store.reads[key] || {}).reduce((a, b) => a + b, 0),
}));
fs.writeFileSync(INV, JSON.stringify({ observedAt: new Date().toISOString(), keys: inventory }, null, 2) + '\n', 'utf8');
console.log('\nflows written to', OUT, '| keys observed:', inventory.length);
await browser.close();