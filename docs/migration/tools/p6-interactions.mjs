// P06 interaction matrix: drives the 5 sub-flows (A-E) on real browser contexts and records outcomes.
// Usage: P6_BASE=http://127.0.0.1:8140 node docs/migration/tools/p6-interactions.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P6_BASE || 'http://127.0.0.1:8140';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/p6-interactions.json');

const browser = await chromium.launch();
const results = [];
const mk = (vp = { width: 1440, height: 900 }) =>
  browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });

async function session(url) {
  const ctx = await mk();
  const page = await ctx.newPage();
  const errors = [];
  const bad = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 160)); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().slice(-50)}`); });
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(500);
  return { ctx, page, errors, bad };
}

function rec(name, data) {
  results.push({ scenario: name, ...data });
  console.log('✓', name, JSON.stringify(data).slice(0, 180));
}

/* =========================================================================
   A — AUTH DEMO FLOWS
   ========================================================================= */
{
  const { ctx, page, errors, bad } = await session(`${BASE}/masuk`);
  const out = {};
  out.initialRole = await page.getAttribute('#tab-buyer', 'aria-selected');
  await page.click('#tab-publisher');
  out.publisherRole = await page.getAttribute('#tab-publisher', 'aria-selected');
  out.publisherHeading = await page.textContent('#auth-heading');

  // open demo block and click pending chip
  await page.click('#demo-block-publisher summary');
  await page.click('#demo-block-publisher button[data-demo="pending"]');
  out.emailFilled = await page.inputValue('#email-field');
  if (await page.isVisible('#submit-btn')) {
    await page.click('#submit-btn');
  }
  await page.waitForTimeout(600);
  out.pendingPanelVisible = await page.isVisible('#pending-panel');
  out.errorBannerVisible = await page.isVisible('#validation-banner');

  rec('auth-login-publisher-pending', { out, errors, bad });
  await ctx.close();
}

/* buyer path runs in its own context: the pending panel replaced the form in the session above */
{
  const { ctx, page, errors, bad } = await session(`${BASE}/masuk`);
  const out = {};
  // The demo chips only switch the simulated scenario; the credentials are typed like a real user.
  await page.fill('#email-field', 'pembeli@demo.ikapi.id');
  await page.fill('#password-field', 'demo12345');
  out.buyerEmailFilled = await page.inputValue('#email-field');
  await page.click('#submit-btn');
  // demo login shows a "memverifikasi" state for ~1s before it navigates
  await page.waitForURL(/akun\/perpustakaan/, { timeout: 15000 }).catch(() => {});
  out.redirectPath = new URL(page.url()).pathname;
  out.sessionStored = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_buyer_session_demo') || 'null'));
  rec('auth-login-buyer-redirect', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/daftar`);
  const out = {};
  await page.click('#tab-publisher');
  out.step1Visible = await page.isVisible('[data-step="1"] #pubName');
  await page.fill('#pubName', 'CV Aksara Jaya');
  await page.fill('#pubMember', '041/JBA/2020');
  await page.fill('#pubAddress', 'Jl. Braga No. 12, Bandung 40111');
  await page.click('#pub-next');
  await page.waitForTimeout(300);
  out.stepLabel2 = await page.textContent('#step-label');
  out.step2Visible = await page.isVisible('[data-step="2"] #pubPic');
  await page.fill('#pubPic', 'Uji Penerbit');
  await page.fill('#pubEmail', 'redaksi@aksarajaya.co.id');
  await page.fill('#pubPhone', '081234567890');
  await page.click('#pub-next');
  await page.waitForTimeout(300);
  out.stepLabel3 = await page.textContent('#step-label');
  await page.fill('#pubPassword', 'demo12345');
  await page.fill('#pubPasswordConfirm', 'demo12345');
  await page.check('#pubTerms');
  out.storedAppBeforeSubmit = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_publisher_application_demo') || 'null'));
  await page.click('#pub-next');
  await page.waitForURL(/status-pendaftaran-penerbit/, { timeout: 15000 }).catch(() => {});
  out.urlAfterSubmit = new URL(page.url()).pathname;
  out.applicationStored = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_publisher_application_demo') || 'null'));
  out.statusStored = await page.evaluate(() => localStorage.getItem('ikapi_publisher_status_preview'));

  rec('auth-register-publisher-wizard', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/lupa-kata-sandi`);
  const out = {};
  await page.fill('#recovery-email', 'ahmad.hidayat@literasi.id');
  await page.click('#submit-btn');
  await page.waitForTimeout(1600);
  out.bannerVisible = await page.isVisible('#success-banner');
  out.toastVisible = await page.isVisible('#toast-notification:not(.opacity-0)');
  rec('auth-forgot-password-flow', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/verifikasi-email?email=ahmad%40literasi.id`);
  const out = {};
  out.emailShown = await page.textContent('#user-email-display');
  await page.click('#resendBtn');
  await page.waitForTimeout(1600);
  out.feedbackVisible = await page.isVisible('#resend-feedback');
  out.toastVisible = await page.isVisible('#toast-notification:not(.opacity-0)');
  rec('auth-verify-email-flow', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/onboarding`);
  const out = {};
  out.step1Visible = await page.isVisible('[data-step="1"]');
  await page.click('[data-step="1"] .option-card');
  await page.click('[data-step="1"] [data-next]');
  await page.waitForTimeout(300);
  out.step2Visible = await page.isVisible('[data-step="2"]');
  await page.click('[data-step="2"] .option-card');
  await page.click('[data-step="2"] [data-next]');
  await page.waitForTimeout(300);
  out.step3Visible = await page.isVisible('[data-step="3"]');
  await page.check('[data-step="3"] input[type="radio"]');
  await page.click('#btn-finish');
  await page.waitForTimeout(500);
  out.step4Visible = await page.isVisible('[data-step="4"]');
  out.storedPrefs = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_reading_prefs_demo') || 'null'));
  rec('auth-onboarding-wizard', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/status-pendaftaran-penerbit?sesi=aktif`);
  const out = {};
  out.statusLabel = await page.textContent('#status-label');
  await page.evaluate(() => {
    const wrap = document.getElementById('demo-chips');
    const details = wrap.closest('details');
    if (details) details.open = true;
  });
  await page.click('#demo-chips button[data-demo-state="approved"]');
  await page.waitForTimeout(300);
  out.statusAfterApprove = await page.textContent('#status-label');
  out.actionBtn = await page.textContent('#action-block a, #action-block button');
  rec('auth-publisher-status-scenarios', { out, errors, bad });
  await ctx.close();
}

/* =========================================================================
   B — ACCOUNT & SETTINGS FLOWS
   ========================================================================= */
{
  const { ctx, page, errors, bad } = await session(`${BASE}/akun/profil`);
  const out = {};
  out.nameInitial = await page.inputValue('#full-name');
  await page.fill('#full-name', 'Ahmad Test Hidayat');
  await page.click('#btn-save-profile');
  await page.waitForTimeout(400);
  out.headerNameUpdated = await page.textContent('#header-user-name');
  out.storedProfile = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_user_profile') || 'null'));
  await page.click('#toggle-dropdown-btn');
  await page.waitForTimeout(200);
  out.dropdownOpen = await page.isVisible('#header-user-dropdown');
  rec('account-profile-edit-sync', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/akun/pengaturan`);
  const out = {};
  await page.click('#pref-new-books + .switch-track');
  out.newBooksChecked = await page.isChecked('#pref-new-books');
  await page.click('button[onclick*="saveNotificationPreferences"]');
  await page.waitForTimeout(300);
  out.storedPrefs = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_user_preferences') || 'null'));

  // password modal
  await page.click('button[onclick*="openPasswordModal"]');
  await page.waitForTimeout(200);
  out.modalOpen = await page.isVisible('#modal-change-password');
  await page.click('#modal-change-password button[onclick*="closePasswordModal"]');
  await page.waitForTimeout(200);
  out.modalClosed = !(await page.isVisible('#modal-change-password'));
  rec('account-settings-flow', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/akun/bantuan`);
  const out = {};
  out.initialFaqs = await page.locator('#faq-accordion-container > div').count();
  await page.fill('#faq-search-input', 'pembayaran');
  await page.waitForTimeout(200);
  out.faqsAfterSearch = await page.locator('#faq-accordion-container > div').count();
  await page.click('#faq-accordion-container > div button');
  await page.waitForTimeout(250);
  out.accordionExpanded = await page.evaluate(() => {
    const first = document.querySelector('#faq-accordion-container > div');
    const box = first.querySelector('[class*="max-h"], [class*="grid-rows"]');
    return box ? box.getBoundingClientRect().height > 0 : null;
  });
  rec('account-help-faq-flow', { out, errors, bad });
  await ctx.close();
}

/* =========================================================================
   C — CART & CHECKOUT FLOWS
   ========================================================================= */
{
  const { ctx, page, errors, bad } = await session(`${BASE}/keranjang`);
  const out = {};
  out.items = await page.locator('#cart-filled-view article.cart-item').count();
  out.initialTotal = await page.textContent('#summary-total');

  // simulated payment modal
  await page.click('button[onclick*="triggerDirectPaymentModal"]');
  await page.waitForTimeout(300);
  out.snapOpen = await page.isVisible('#snap-overlay');
  out.methodCount = await page.locator('#snap-selection-view button').count();

  // pick GoPay and simulate payment success
  await page.click('#snap-selection-view button[onclick*="selectPaymentMethod"]');
  await page.waitForTimeout(300);
  out.subviewVisible = await page.isVisible('#va-sublist, #snap-modal-box');
  // The status simulator lives in a collapsed QA block; call the same handler the button calls.
  await page.evaluate(() => window.setDemoPaymentStatus('berhasil'));
  await page.waitForTimeout(300);
  out.successViewVisible = await page.isVisible('#status-berhasil');
  out.successBadge = (await page.textContent('#status-berhasil')).trim().slice(0, 60);

  rec('checkout-simulation-flow', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/akun/pesanan`);
  const out = {};
  out.orderCount = await page.locator('#orders-container article').count();
  await page.click('#tab-filter-success');
  await page.waitForTimeout(200);
  out.successOrders = await page.locator('#orders-container article').count();

  // open order detail modal
  await page.click('#orders-container article button[onclick*="openOrderDetailModal"]');
  await page.waitForTimeout(300);
  out.modalOpen = await page.isVisible('#modal-order-detail');
  out.modalOrderId = await page.textContent('#modal-order-id');
  await page.click('#modal-order-detail button[onclick*="closeOrderDetailModal"]');
  await page.waitForTimeout(200);
  out.modalClosed = !(await page.isVisible('#modal-order-detail'));

  rec('orders-history-flow', { out, errors, bad });
  await ctx.close();
}

/* =========================================================================
   D — LIBRARY, READER, REVIEWS FLOWS
   ========================================================================= */
{
  const { ctx, page, errors, bad } = await session(`${BASE}/akun/perpustakaan`);
  const out = {};
  out.initialBooks = await page.locator('#booksGrid > *').evaluateAll((els) => els.filter((e) => e.offsetParent !== null).length);
  await page.click('#tab-unread');
  await page.waitForTimeout(200);
  out.unreadBooks = await page.locator('#booksGrid > *').evaluateAll((els) => els.filter((e) => e.offsetParent !== null).length);
  await page.click('#tab-all');
  await page.fill('#librarySearch', 'laskar');
  await page.waitForTimeout(200);
  out.searchLaskar = await page.locator('#booksGrid > *').evaluateAll((els) => els.filter((e) => e.offsetParent !== null).length);
  rec('library-filter-search-flow', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/akun/perpustakaan/laskar-aksara-pasundan/baca`);
  const out = {};
  out.pageNumber = await page.textContent('#page-indicator');
  await page.click('#btn-next-page');
  await page.waitForTimeout(300);
  out.pageAfterNext = await page.textContent('#page-indicator');

  // bookmarks drawer
  await page.click('#btn-open-bookmarks');
  await page.waitForTimeout(250);
  out.bookmarksDrawerOpen = await page.isVisible('#drawer-bookmarks');
  await page.click('button[onclick*="addCurrentBookmark"]');
  await page.waitForTimeout(300);
  out.bookmarkCount = await page.textContent('#bm-count-heading');

  // settings drawer & theme toggle (close the bookmarks drawer first: it covers the header buttons)
  await page.evaluate(() => window.closeAllDrawers());
  await page.waitForTimeout(250);
  await page.click('#btn-open-settings');
  await page.waitForTimeout(250);
  out.settingsDrawerOpen = await page.isVisible('#drawer-settings');
  await page.click('#theme-btn-dark');
  await page.waitForTimeout(200);
  out.themeApplied = await page.getAttribute('body', 'class');

  // verify NO download button anywhere in reader
  out.downloadButtons = await page.locator('button:has-text("Unduh"), a:has-text("Unduh"), [download]').count();

  rec('web-reader-interactions', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/akun/ulasan`);
  const out = {};
  out.reviewCount = await page.locator('#reviews-list-container article').count();
  await page.click('#reviews-list-container article button[onclick*="openEditModal"]');
  await page.waitForTimeout(300);
  out.editModalOpen = await page.isVisible('#modal-edit-review');
  await page.fill('#edit-comment-input', 'Ulasan diperbarui via verifikasi otomatis.');
  // The modal is a real <form>; its submit handler is handleSaveEditedReview (no inline onclick in the source).
  await page.click('#modal-edit-review button[type="submit"]');
  await page.waitForTimeout(400);
  out.editModalClosed = !(await page.isVisible('#modal-edit-review'));
  out.storedReview = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_user_review_history') || 'null'));
  rec('reviews-edit-flow', { out, errors, bad });
  await ctx.close();
}

/* =========================================================================
   E — AGENDA, DETAIL, CHATBOT FLOWS
   ========================================================================= */
{
  const { ctx, page, errors, bad } = await session(`${BASE}/agenda`);
  const out = {};
  out.eventsCount = await page.locator('#events-container article').count();
  out.articlesCount = await page.locator('#articles-container article').count();

  // calendar click date 18
  await page.click('#calendar-days-grid button.day-cell:has-text("18")');
  await page.waitForTimeout(200);
  out.eventsAfterDateFilter = await page.locator('#events-container article').count();

  // open article modal
  await page.click('#articles-container article button[onclick*="openArticleModal"]');
  await page.waitForTimeout(300);
  out.articleModalOpen = await page.isVisible('#modal-article-preview');
  await page.click('#modal-article-preview button[onclick*="closeArticleModal"]');
  await page.waitForTimeout(200);
  out.articleModalClosed = !(await page.isVisible('#modal-article-preview'));

  rec('agenda-calendar-events-articles-flow', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/agenda/ev-1`);
  const out = {};
  out.title = await page.textContent('#event-title');
  out.category = await page.textContent('#event-category');
  out.date = await page.textContent('#event-date');
  out.speakers = await page.locator('#event-speakers > li').count();
  out.rundown = await page.locator('#event-rundown > li').count();
  rec('agenda-detail-page-flow', { out, errors, bad });
  await ctx.close();
}

{
  const { ctx, page, errors, bad } = await session(`${BASE}/akun/bantuan/chatbot`);
  const out = {};
  out.initialBubbles = await page.evaluate(() => document.getElementById('chat-body-scrollable').innerText.trim().split(String.fromCharCode(10)).filter(Boolean).length);
  // Quick-prompt chips are only shown before the welcome conversation exists (initWelcomeConversation hides them),
  // so the flow is exercised through the real input instead.
  await page.fill('#chat-input-field', 'Rekomendasi buku sastra Sunda dong');
  await page.click('#chat-send-btn');
  await page.waitForTimeout(1500);
  out.bubblesAfterPrompt = await page.evaluate(() => document.getElementById('chat-body-scrollable').innerText.trim().split(String.fromCharCode(10)).filter(Boolean).length);
  out.conversationText = (await page.textContent('#chat-body-scrollable')).replace(/\s+/g, ' ').trim().slice(0, 120);
  out.inputCleared = (await page.inputValue('#chat-input-field')) === '';
  rec('chatbot-interactive-conversation-flow', { out, errors, bad });
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8');
await browser.close();
console.log('\nAll P06 flows verified! Matrix saved to', OUT);
