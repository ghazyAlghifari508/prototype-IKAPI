// P05 interaction matrix: drives the four buyer pages and records what actually happens.
// Usage: P5_BASE=http://127.0.0.1:8140 node docs/migration/tools/p5-interactions.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P5_BASE || 'http://127.0.0.1:8140';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/p5-interactions.json');

const browser = await chromium.launch();
const results = [];
const mk = (vp = { width: 1440, height: 900 }) => browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });

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
  await page.waitForTimeout(600);
  return { ctx, page, errors, bad };
}

function rec(name, data) {
  results.push({ scenario: name, ...data });
  console.log(name, JSON.stringify(data).slice(0, 200));
}

/* 1. navigation chain: home -> catalog -> detail -> preview -> back */
{
  const { ctx, page, errors, bad } = await session(`${BASE}/`);
  const chain = [];
  await page.click('header nav a[href*="/katalog"]');
  await page.waitForLoadState('load');
  chain.push({ step: 'home -> catalog', url: new URL(page.url()).pathname, cards: await page.locator('#catalog-products-container article').count() });
  await page.click('#catalog-products-container article a[href*="/buku/"]');
  await page.waitForLoadState('load');
  chain.push({ step: 'catalog -> detail', url: new URL(page.url()).pathname, title: await page.locator('#book-title').textContent() });
  await page.click('#btnSamplePreview');
  await page.waitForLoadState('load');
  chain.push({ step: 'detail -> preview', url: new URL(page.url()).pathname, counter: await page.locator('#preview-counter-badge').textContent() });
  await page.goBack();
  await page.waitForLoadState('load');
  chain.push({ step: 'preview -> back to detail', url: new URL(page.url()).pathname, title: await page.locator('#book-title').textContent() });
  await page.goBack();
  await page.waitForLoadState('load');
  chain.push({ step: 'detail -> back to catalog', url: new URL(page.url()).pathname, cards: await page.locator('#catalog-products-container article').count() });
  rec('nav-chain', { chain, errors, bad });
  await ctx.close();
}

/* 2. catalog pipeline: search, category, publisher, price, sort, view, reset, empty state */
{
  const { ctx, page, errors, bad } = await session(`${BASE}/katalog`);
  const counts = {};
  counts.initial = await page.locator('#catalog-products-container article').count();
  counts.initialOrder = await page.locator('#catalog-products-container article h3').first().textContent();

  await page.fill('#catalog-search-input', 'laskar');
  await page.waitForTimeout(250);
  counts.searchLaskar = await page.locator('#catalog-products-container article').count();

  await page.fill('#catalog-search-input', '');
  await page.check('.cat-filter-checkbox[data-category="Pendidikan"]');
  await page.waitForTimeout(200);
  counts.categoryPendidikan = await page.locator('#catalog-products-container article').count();
  counts.allCheckboxUnchecked = !(await page.isChecked('#cat-all'));

  await page.uncheck('.cat-filter-checkbox[data-category="Pendidikan"]');
  await page.check('.pub-filter-checkbox[data-publisher="UPI Press"]');
  await page.waitForTimeout(200);
  counts.publisherUpi = await page.locator('#catalog-products-container article').count();

  await page.selectOption('#catalog-sort-select', 'price_high');
  await page.waitForTimeout(200);
  counts.firstAfterSortDesc = await page.locator('#catalog-products-container article h3').first().textContent();
  const prices = await page.locator('#catalog-products-container article span.text-\\[17px\\]').allTextContents();

  await page.click('[data-catalog-view="list"]');
  await page.waitForTimeout(200);
  counts.listClass = await page.getAttribute('#catalog-products-container', 'class');
  await page.click('[data-catalog-view="grid"]');
  await page.waitForTimeout(200);
  counts.gridClass = await page.getAttribute('#catalog-products-container', 'class');

  await page.click('[data-catalog-reset]');
  await page.waitForTimeout(250);
  counts.afterReset = await page.locator('#catalog-products-container article').count();
  counts.afterResetSort = await page.inputValue('#catalog-sort-select');

  await page.fill('#catalog-search-input', 'zzzznotfound');
  await page.waitForTimeout(250);
  counts.emptyVisible = await page.isVisible('#catalog-empty-state');
  counts.gridHidden = !(await page.isVisible('#catalog-products-container'));
  rec('catalog-pipeline', { counts, prices: prices.slice(0, 4), errors, bad });
  await ctx.close();
}

/* 3. detail: rating, wishlist, comment report, book report */
{
  const { ctx, page, errors, bad } = await session(`${BASE}/buku/laskar-aksara-pasundan`);
  const out = {};
  out.stars = await page.locator('.star-btn').count();
  await page.click('.star-btn[data-rating="5"]');
  out.labelAfterSelect = await page.textContent('#star-rating-label');
  await page.fill('#user-review-text', 'Catatan uji integrasi.');
  await page.click('#btn-submit-rating');
  await page.waitForTimeout(300);
  out.userReviewInjected = await page.locator('#user-submitted-review').count();
  out.badgeAfter = await page.textContent('#review-count-badge');
  out.storedRating = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_rating_laskar_aksara') || 'null'));
  await page.click('#btn-cancel-rating');
  await page.waitForTimeout(200);
  out.userReviewAfterReset = await page.locator('#user-submitted-review').count();

  await page.click('#btnWishlist');
  out.wishlistIcon = await page.textContent('#wishlistIcon');
  await page.click('#btnAddToCart');
  await page.waitForTimeout(200);
  out.cartBadge = await page.textContent('.ikapi-cart-badge');
  out.toastVisible = await page.isVisible('[data-ikapi-buyer-toast]:not(.opacity-0)');

  // comment report flow
  await page.click('#reviews-list-container article .comment-menu-btn');
  await page.waitForTimeout(200);
  out.menuVisible = await page.isVisible('#comment-menu');
  await page.click('#comment-menu [data-action="like"]');
  await page.waitForTimeout(200);
  out.reactionBadge = await page.isVisible('#reviews-list-container article .review-reaction');
  out.storedReactions = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('ikapi_comment_reactions_demo') || '{}')).length);

  await page.click('#reviews-list-container article:nth-child(2) .comment-menu-btn');
  await page.waitForTimeout(200);
  await page.click('#comment-menu [data-action="report"]');
  await page.waitForTimeout(250);
  out.reportModalVisible = await page.isVisible('#report-modal');
  out.reportReasons = await page.locator('#report-reasons input[name="report-reason"]').count();
  await page.click('#report-submit');
  await page.waitForTimeout(200);
  out.reportErrorShown = await page.isVisible('#report-error');
  await page.check('#report-reasons input[value="spam"]');
  await page.click('#report-submit');
  await page.waitForTimeout(700);
  out.reportStored = await page.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_comment_reports_demo') || '[]')).length);
  out.reportClosed = !(await page.isVisible('#report-modal'));

  // book report flow
  await page.click('#btn-report-book');
  await page.waitForTimeout(250);
  out.bookModalVisible = await page.isVisible('#book-report-modal');
  out.bookTypes = await page.locator('#book-report-types input[name="book-report-type"]').count();
  out.coverFilled = await page.getAttribute('#book-report-cover', 'src');
  await page.click('#book-report-submit');
  await page.waitForTimeout(200);
  out.bookErrorShown = await page.isVisible('#book-report-error');
  await page.check('#book-report-types input[value="file"]');
  await page.waitForTimeout(200);
  out.sectionFieldShown = await page.isVisible('#book-report-section-field');
  await page.click('#book-report-submit');
  await page.waitForTimeout(700);
  out.bookReportStored = await page.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_book_reports_demo') || '[]')).length);
  out.bookReportRecord = await page.evaluate(() => (JSON.parse(localStorage.getItem('ikapi_book_reports_demo') || '[]')).slice(-1)[0]);
  out.bookModalClosed = !(await page.isVisible('#book-report-modal'));
  rec('detail-interactions', { out, errors, bad });
  await ctx.close();
}

/* 4. preview: paging, progress, end box */
{
  const { ctx, page, errors, bad } = await session(`${BASE}/buku/laskar-aksara-pasundan/cuplikan`);
  const out = {};
  out.counter = await page.textContent('#preview-counter-badge');
  out.progress = await page.getAttribute('#preview-progress-bar', 'style');
  out.prevDisabled = await page.isDisabled('#btn-prev');
  await page.click('#btn-next');
  await page.waitForTimeout(300);
  out.counter2 = await page.textContent('#preview-counter-badge');
  out.title2 = await page.textContent('#preview-title');
  out.progress2 = await page.getAttribute('#preview-progress-bar', 'style');
  await page.click('#btn-next');
  await page.click('#btn-next');
  await page.waitForTimeout(400);
  out.counterLast = await page.textContent('#preview-counter-badge');
  out.nextDisabled = await page.isDisabled('#btn-next');
  out.endBox = await page.locator('#preview-end-box').count();
  out.paragraphs = await page.locator('#preview-paragraphs p').count();
  await page.click('#btnAddToCart');
  await page.waitForTimeout(200);
  out.toastVisible = await page.isVisible('[data-ikapi-buyer-toast]:not(.opacity-0)');
  out.addLabel = await page.textContent('#btnAddToCartText');
  rec('preview-interactions', { out, errors, bad });
  await ctx.close();
}

/* 5. direct URL + reload on all four routes */
{
  for (const route of ['/', '/katalog', '/buku/laskar-aksara-pasundan', '/buku/laskar-aksara-pasundan/cuplikan', '/buku/tidak-ada']) {
    const ctx = await mk();
    const page = await ctx.newPage();
    const resp = await page.goto(BASE + route, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const status = resp.status();
    const h1 = await page.locator('h1, h2').first().textContent().catch(() => null);
    await page.reload({ waitUntil: 'load' });
    const afterReload = await page.locator('h1, h2').first().textContent().catch(() => null);
    rec('route-reload ' + route, { status, h1: (h1 || '').trim().slice(0, 40), stable: (h1 || '') === (afterReload || '') });
    await ctx.close();
  }
}

fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
await browser.close();
console.log('interaction matrix written to', OUT);
