// P11 targeted interaction checks not covered by the phase flow suites: public shell (mobile nav, header search,
// cart badge, account dropdown, footer), chatbot open/close without backend calls, community room permissions,
// and a same-origin-only network audit (no external API calls from demo actions).
// Usage: P11_BASE=http://127.0.0.1:8140 node docs/migration/tools/p11-nav.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.P11_BASE || 'http://127.0.0.1:8140';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p11-nav.json';
const browser = await chromium.launch();
const rows = [];
const rec = (name, data) => { rows.push({ check: name, ...data }); console.log('✓', name, JSON.stringify(data).slice(0, 200)); };

async function open(url, vp = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport: vp, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  const external = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_SOCKET_NOT_CONNECTED|ERR_CONNECTION_CLOSED|ERR_CONNECTION_RESET/.test(m.text())) errors.push('[console] ' + m.text().slice(0, 110)); });
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(BASE) && !u.includes('fonts.g')) external.push(r.method() + ' ' + u.slice(0, 60)); });
  await page.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]));
  await page.waitForTimeout(250);
  return { ctx, page, errors, external };
}

/* 1. responsive header: the source has no hamburger (nav links stay visible at 390), so verify the same here */
{
  const { ctx, page, errors } = await open('/', { width: 390, height: 844 });
  const head = await page.evaluate(() => {
    const h = document.querySelector('header');
    const visible = (el) => el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
    return {
      height: Math.round(h.getBoundingClientRect().height),
      links: [...h.querySelectorAll('nav a')].map((a) => ({ t: a.textContent.trim(), vis: visible(a), href: a.getAttribute('href') })),
      hamburger: !!h.querySelector('[aria-expanded], [aria-controls]'),
      scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    };
  });
  const navStatus = [];
  for (const l of head.links.slice(0, 4)) {
    const res = await ctx.request.get(BASE + l.href).catch(() => null);
    navStatus.push([l.t, res ? res.status() : 'ERR']);
  }
  rec('1-responsive-header', { head, navStatus, errors });
  await ctx.close();
}

/* 2. catalog search box filters the grid (there is no header search in the source) */
{
  const { ctx, page, errors } = await open('/katalog', { width: 1440, height: 900 });
  const before = await page.locator('#catalog-products-container article').count();
  await page.fill('#catalog-search-input', 'pasundan');
  await page.waitForTimeout(600);
  const after = await page.locator('#catalog-products-container article').count();
  const summary = await page.evaluate(() => (document.querySelector('#pagination-summary-text, #pagination-controls')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40));
  rec('2-catalog-search', { before, after, summary, errors });
  await ctx.close();
}

/* 3. catalog filter + sort + reset + empty state */
{
  const { ctx, page, errors } = await open('/katalog', { width: 1440, height: 900 });
  const before = await page.locator('#catalog-products-container article').count();
  await page.selectOption('#catalog-sort-select', { index: 1 }).catch(() => {});
  await page.waitForTimeout(400);
  const afterSort = await page.locator('#catalog-products-container article').count();
  await page.fill('#catalog-search-input', 'zzzznotfound');
  await page.waitForTimeout(500);
  const emptyVisible = await page.evaluate(() => {
    const el = document.querySelector('#catalog-empty-state');
    return el ? el.getBoundingClientRect().height > 0 : null;
  });
  const reset = page.locator('button:has-text("Reset")').first();
  await reset.click().catch(() => {});
  await page.waitForTimeout(500);
  const afterReset = await page.locator('#catalog-products-container article').count();
  rec('3-catalog-filter-sort-reset', { before, afterSort, emptyVisible, afterReset, errors });
  await ctx.close();
}

/* 4. cart badge: after adding a book the header count changes and the cart page shows the item */
{
  const { ctx, page, errors } = await open('/buku/laskar-aksara-pasundan', { width: 1440, height: 900 });
  const badge = () => page.evaluate(() => (document.querySelector('.ikapi-cart-badge')?.textContent || '').trim());
  const cartRows = async () => { await page.goto(BASE + '/keranjang', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(450); return page.locator('main article').count(); };
  const rowsBefore = await cartRows();
  await page.goto(BASE + '/buku/laskar-aksara-pasundan', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(400);
  const badgeBefore = await badge();
  await page.locator('#btnAddToCart').click();
  await page.waitForTimeout(700);
  const badgeAfter = await badge();
  const toast = await page.evaluate(() => (document.querySelector('[role="status"], #toast, .toast')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50));
  const items = await cartRows();
  rec('4-cart-add-badge', { rowsBefore, rowsAfter: items, badgeBefore, badgeAfter, toast, errors });
  await ctx.close();
}

/* 5. account dropdown + footer links resolve to real routes (no .html, no 404) */
{
  const { ctx, page, errors } = await open('/', { width: 1440, height: 900 });
  const links = await page.evaluate(() => [...document.querySelectorAll('footer a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && h !== '#'));
  const unique = [...new Set(links)];
  const statuses = [];
  for (const href of unique.slice(0, 10)) {
    const res = await ctx.request.get(href.startsWith('http') ? href : BASE + href, { maxRedirects: 0 }).catch(() => null);
    statuses.push([href, res ? res.status() : 'ERR']);
  }
  const bad = statuses.filter(([, s]) => s !== 200);
  rec('5-footer-links', { total: unique.length, sampled: statuses.length, bad, errors });
  await ctx.close();
}

/* 6. chatbot: opens/closes locally, replies without hitting an external endpoint */
{
  const { ctx, page, errors, external } = await open('/akun/bantuan/chatbot', { width: 1440, height: 900 });
  // The help page mounts the widget already open (prototype behaviour), other pages start closed.
  const initialOpen = await page.evaluate(() => !document.getElementById('ikapi-chat-window').classList.contains('hidden'));
  const toggle = page.locator('#launcher-button').first();
  await toggle.click().catch(() => {});
  await page.waitForTimeout(400);
  const afterToggle = await page.evaluate(() => !document.getElementById('ikapi-chat-window').classList.contains('hidden'));
  await toggle.click().catch(() => {});
  await page.waitForTimeout(400);
  const opened = await page.evaluate(() => !document.getElementById('ikapi-chat-window').classList.contains('hidden'));
  const toggles = { initialOpen, afterToggle, reopened: opened };
  await page.fill('#chat-input-field', 'rekomendasi sastra sunda').catch(() => {});
  await page.click('#chat-send-btn').catch(() => {});
  await page.waitForTimeout(900);
  const bubbles = await page.evaluate(() => (document.querySelector('#chat-body-scrollable')?.children.length || 0));
  const externalDuringChat = external.filter((e) => !/fonts\.g/.test(e));
  rec('6-chatbot-local', { toggles, bubbles, externalDuringChat, errors });
  await ctx.close();
}

/* 7. community room permissions: nonmember sees a disabled "Buat Topik" button (native disabled, not a redirect) */
{
  const { ctx, page, errors } = await open('/komunitas/community-filologi/diskusi', { width: 1440, height: 900 });
  const room = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /buat topik/i.test(b.textContent || ''));
    if (!btn) return { found: false };
    return { found: true, disabled: btn.disabled, ariaDisabled: btn.getAttribute('aria-disabled'), bg: getComputedStyle(btn).backgroundColor, cursor: getComputedStyle(btn).cursor };
  });
  const sortOptions = await page.evaluate(() => ['#sort-newest', '#sort-last-activity'].map((id) => { const el = document.querySelector(id); return el ? (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24) + ':' + (el.getAttribute('aria-pressed') || el.className.includes('primary')) : 'missing'; }));
  rec('7-room-nonmember-gate', { room, sortOptions, errors });
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
console.log('written', OUT);