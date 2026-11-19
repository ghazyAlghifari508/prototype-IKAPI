// P10 failure modes: empty store, corrupt JSON, blocked storage, conflicting role flags, double submit.
// Usage: P10_BASE=http://127.0.0.1:8140 node docs/migration/tools/p10-failures.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P10_BASE || 'http://127.0.0.1:8140';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/p10-failures.json');

const browser = await chromium.launch();
const rows = [];
const rec = (name, data) => { rows.push({ scenario: name, ...data }); console.log('✓', name, JSON.stringify(data).slice(0, 190)); };

async function newPage(initScript, vp = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport: vp, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
  if (initScript) await ctx.addInitScript(initScript);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 150)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 120)); });
  return { ctx, page, errors };
}

const goto = async (page, url) => {
  await page.goto(BASE + url, { waitUntil: 'load', timeout: 45000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(450);
};

/* 1. empty store: every demo screen must seed itself, not crash */
{
  const { ctx, page, errors } = await newPage();
  const out = {};
  await goto(page, '/komunitas');
  out.communities = await page.locator('#directory-grid article').count();
  await goto(page, '/komunitas/community-klub-buku/diskusi/TPC-2026-101');
  out.replies = await page.locator('#reply-list .thread-node').count();
  out.seededStore = await page.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]')).length);
  await goto(page, '/katalog');
  out.catalog = await page.locator('#catalog-products-container article').count();
  await goto(page, '/akun/pesanan');
  out.orders = await page.locator('#orders-container article').count();
  await goto(page, '/penerbit/buku');
  out.publisherBooks = await page.locator('#book-rows tr[data-id]').count();
  await goto(page, '/admin/pengguna');
  out.adminUsers = await page.locator('main table tbody tr').evaluateAll((r) => r.filter((x) => x.offsetParent !== null).length);
  rec('1-empty-store-seeds-everywhere', { out, errors });
  await ctx.close();
}

/* 2. corrupt JSON in every known key: pages must still render (graceful parse) */
{
  const { ctx, page, errors } = await newPage();
  await goto(page, '/');
  await page.evaluate(() => {
    for (const key of ['ikapi_community_replies_demo', 'ikapi_community_topics_demo', 'ikapi_communities_demo', 'ikapi_memberships_demo', 'ikapi_community_memberships_demo', 'ikapi_discussion_reports_demo', 'ikapi_user_profile', 'ikapi_user_preferences', 'ikapi_user_review_history', 'ikapi_reader_settings', 'ikapi_reader_bookmarks']) {
      localStorage.setItem(key, '{not valid json');
    }
  });
  const out = {};
  await goto(page, '/komunitas');
  out.directoryCards = await page.locator('#directory-grid article').count();
  await goto(page, '/komunitas/community-klub-buku/diskusi/TPC-2026-101');
  out.topicNodes = await page.locator('#reply-list .thread-node').count();
  out.topicUnavailable = await page.evaluate(() => !document.getElementById('topic-unavailable')?.classList.contains('hidden'));
  await goto(page, '/akun/profil');
  out.profileRendered = await page.inputValue('#full-name').then((v) => v.length > 0).catch(() => false);
  await goto(page, '/akun/perpustakaan/laskar-aksara-pasundan/baca');
  out.readerPage = await page.evaluate(() => (document.getElementById('page-indicator')?.textContent || '').trim().slice(0, 24));
  rec('2-corrupt-json-graceful', { out, errors });
  await ctx.close();
}

/* 3. storage blocked (quota / private mode): actions must fail with feedback, not white screen */
{
  const { ctx, page, errors } = await newPage(() => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k) {
      if (String(k).startsWith('ikapi_')) throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      return orig.apply(this, arguments);
    };
  });
  const out = {};
  await goto(page, '/komunitas/community-klub-buku');
  const join = page.locator('#profile-actions button', { hasText: /Gabung/i }).first();
  out.joinVisible = await join.isVisible().catch(() => false);
  if (out.joinVisible) await join.click();
  await page.waitForTimeout(500);
  out.pageAlive = await page.evaluate(() => !!document.getElementById('profile-name'));
  // with storage blocked the demo must not pretend the join happened
  out.actionsText = await page.evaluate(() => (document.getElementById('profile-actions')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40));
  out.joinedShown = /Keluar|Anggota/i.test(out.actionsText || '');
  await goto(page, '/penerbit/keuangan');
  out.financeAlive = await page.evaluate(() => !!document.getElementById('btn-review'));
  out.financeBalance = await page.evaluate(() => (document.body.innerText.match(/Rp [\d.]+/g) || []).slice(0, 2));
  rec('3-storage-blocked', { out, errors });
  await ctx.close();
}

/* 4. conflicting role flags in one browser: buyer session + admin preview session */
{
  const { ctx, page, errors } = await newPage();
  await goto(page, '/');
  await page.evaluate(() => {
    localStorage.setItem('ikapi_buyer_session_demo', JSON.stringify({ id: 'USR-PMB-0042', email: 'pembeli@demo.ikapi.id', name: 'Pembeli Demo', role: 'buyer' }));
    localStorage.setItem('ikapi_admin_session_demo', JSON.stringify({ role: 'admin', preview: true, email: 'admin@ikapi-jabar.id' }));
    localStorage.setItem('ikapi_publisher_application_demo', JSON.stringify({ name: 'CV Uji', status: 'pending' }));
    localStorage.setItem('ikapi_publisher_status_preview', JSON.stringify('approved'));
  });
  const out = {};
  await goto(page, '/admin');
  out.adminOk = await page.evaluate(() => !!document.getElementById('activity-list'));
  await goto(page, '/penerbit/keuangan');
  out.publisherOk = await page.evaluate(() => !!document.getElementById('bank-summary'));
  await goto(page, '/akun/profil');
  out.buyerHeaderName = await page.evaluate(() => (document.getElementById('header-user-name')?.textContent || '').trim());
  await goto(page, '/status-pendaftaran-penerbit');
  out.statusLabel = await page.evaluate(() => (document.getElementById('status-label')?.textContent || '').trim());
  out.noRedirectLoop = true;
  rec('4-conflicting-role-flags', { out, errors });
  await ctx.close();
}

/* 5. double submit race: two fast submits must create one reply, not two */
{
  const { ctx, page, errors } = await newPage();
  await goto(page, '/komunitas/community-klub-buku');
  const join = page.locator('#profile-actions button', { hasText: /Gabung/i }).first();
  if (await join.isVisible().catch(() => false)) { await join.click(); await page.waitForTimeout(400); }
  await goto(page, '/komunitas/community-klub-buku/diskusi/TPC-2026-101');
  await page.fill('#reply-input', 'Uji double submit P10.');
  const before = await page.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]')).length);
  await page.evaluate(() => {
    const btn = document.getElementById('reply-submit');
    btn.click();
    btn.click();
  });
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_community_replies_demo') || '[]')).filter((r) => r.body === 'Uji double submit P10.').length);
  rec('5-double-submit', { out: { before, created: after }, errors });
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
console.log('\nfailure modes written to', OUT);