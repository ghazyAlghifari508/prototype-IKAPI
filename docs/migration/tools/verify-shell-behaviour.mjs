// P04 behaviour verification: mobile drawer, scrim, Escape, scroll lock, focus return, modal, dropdown, toast,
// active link state, and no duplicate listeners. Usage: P4_BASE=http://127.0.0.1:8130 node docs/migration/tools/verify-shell-behaviour.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P4_BASE || 'http://127.0.0.1:8130';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/baselines/shells');
const REPORT = path.join(ROOT, 'docs/migration/p4-behaviour.json');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const results = {};
const mk = (vp) => browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });

async function page_(url, vp) {
  const ctx = await mk(vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 150)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 150)); });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(350);
  return { ctx, page, errors };
}

const state = (page) => page.evaluate(() => {
  const sb = document.getElementById('publisher-sidebar');
  const scrim = document.querySelector('[data-ikapi-sidebar-scrim]');
  const tg = document.querySelector('[data-ikapi-sidebar-toggle]');
  const r = sb.getBoundingClientRect();
  return {
    open: sb.classList.contains('is-open'), x: Math.round(r.x), scrimHidden: scrim.classList.contains('hidden'),
    expanded: tg.getAttribute('aria-expanded'), bodyOverflow: document.body.style.overflow,
    focusIs: document.activeElement === tg ? 'toggle' : (sb.contains(document.activeElement) ? 'sidebar-link:' + document.activeElement.textContent.trim().slice(0, 20) : document.activeElement.tagName.toLowerCase()),
  };
});

// ---- 1. drawer (publisher + admin) at 390x844 ----
for (const persona of ['publisher', 'admin']) {
  const { ctx, page, errors } = await page_(`${BASE}/ui/shell/${persona}`, { width: 390, height: 844 });
  const r = { before: await state(page) };
  await page.click('[data-ikapi-sidebar-toggle]');
  await page.waitForTimeout(400);
  r.opened = await state(page);
  await page.screenshot({ path: path.join(OUT, `${persona}-390-drawer-open.png`) });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  r.afterEscape = await state(page);
  await page.click('[data-ikapi-sidebar-toggle]'); await page.waitForTimeout(300);
  await page.click('[data-ikapi-sidebar-scrim]', { position: { x: 340, y: 400 } }); await page.waitForTimeout(300);
  r.afterScrim = await state(page);
  // a second toggle must toggle exactly once (duplicate listeners would cancel out)
  await page.click('[data-ikapi-sidebar-toggle]'); await page.waitForTimeout(300);
  r.singleToggleOpens = (await state(page)).open;
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  r.errors = errors;
  results[`drawer-${persona}`] = r;
  await ctx.close();
}

// ---- 2. leak check: items per persona ----
for (const persona of ['publisher', 'admin']) {
  const { ctx, page } = await page_(`${BASE}/ui/shell/${persona}`, { width: 1440, height: 900 });
  results[`menu-${persona}`] = await page.evaluate(() => ({
    nav: document.querySelector('#publisher-sidebar nav').getAttribute('aria-label'),
    items: [...document.querySelectorAll('#publisher-sidebar nav > *')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()),
    links: document.querySelectorAll('#publisher-sidebar nav a').length,
    disabled: document.querySelectorAll('#publisher-sidebar nav [aria-disabled="true"]').length,
    account: document.querySelector('#publisher-sidebar .border-t')?.textContent.replace(/\s+/g, ' ').trim(),
    notif: [...document.querySelectorAll('[data-ikapi-notif-panel] p')].map((p) => p.textContent.trim()),
  }));
  await ctx.close();
}

// ---- 3. notification panel + toast + modal (publisher, desktop) ----
{
  const { ctx, page, errors } = await page_(`${BASE}/ui/shell/publisher`, { width: 1440, height: 900 });
  const r = {};
  const notif = () => page.evaluate(() => ({ hidden: document.querySelector('[data-ikapi-notif-panel]').classList.contains('hidden'), expanded: document.querySelector('[data-ikapi-notif-toggle]').getAttribute('aria-expanded') }));
  r.notifClosed = await notif();
  await page.click('[data-ikapi-notif-toggle]'); r.notifOpen = await notif();
  await page.screenshot({ path: path.join(OUT, 'publisher-1440-notif-open.png') });
  await page.click('h1'); r.notifAfterOutside = await notif();
  await page.click('[data-ikapi-notif-toggle]'); await page.keyboard.press('Escape'); r.notifAfterEscape = await notif();

  // toast
  await page.click('#demo-toast'); await page.waitForTimeout(250);
  r.toastShown = await page.evaluate(() => { const t = document.querySelector('[data-ikapi-toast]'); const cs = getComputedStyle(t); const b = t.getBoundingClientRect(); return { hidden: t.classList.contains('hidden'), text: t.textContent.trim(), z: cs.zIndex, position: cs.position, centerX: Math.round(b.x + b.width / 2), bottom: Math.round(innerHeight - b.bottom), role: t.getAttribute('role') }; });
  await page.waitForTimeout(3000);
  r.toastAfter3s = await page.evaluate(() => document.querySelector('[data-ikapi-toast]').classList.contains('hidden'));

  // modal
  const modal = () => page.evaluate(() => { const m = document.getElementById('demo-modal'); const p = m.querySelector('[role="dialog"]'); return { hidden: m.classList.contains('hidden'), z: getComputedStyle(m).zIndex, bodyOverflow: document.body.style.overflow, focusInside: p.contains(document.activeElement), labelledby: p.getAttribute('aria-labelledby'), titleId: document.getElementById(p.getAttribute('aria-labelledby'))?.textContent.trim(), ariaModal: p.getAttribute('aria-modal') }; });
  r.modalClosed = await modal();
  await page.click('[data-ikapi-modal-open="demo-modal"]'); await page.waitForTimeout(250);
  r.modalOpen = await modal();
  await page.screenshot({ path: path.join(OUT, 'publisher-1440-modal-open.png') });
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  r.modalAfterEscape = await modal();
  r.focusReturnedToTrigger = await page.evaluate(() => document.activeElement === document.querySelector('[data-ikapi-modal-open="demo-modal"]'));
  await page.click('[data-ikapi-modal-open="demo-modal"]'); await page.waitForTimeout(150);
  await page.mouse.click(30, 450); await page.waitForTimeout(200);
  r.modalAfterBackdrop = await modal();
  await page.click('[data-ikapi-modal-open="demo-modal"]'); await page.waitForTimeout(150);
  await page.click('[data-ikapi-modal-close]:not(.absolute)'); await page.waitForTimeout(150);
  r.modalAfterCloseButton = await modal();
  r.errors = errors;
  results.interactions = r;
  await ctx.close();
}

// ---- 4. buyer: account dropdown + keyboard focus order ----
{
  const { ctx, page, errors } = await page_(`${BASE}/ui/shell/public?akun=member`, { width: 1440, height: 900 });
  const dd = () => page.evaluate(() => ({ hidden: document.querySelector('[data-ikapi-dropdown-menu]').classList.contains('hidden'), expanded: document.querySelector('[data-ikapi-dropdown-toggle]').getAttribute('aria-expanded') }));
  const r = { closed: await dd() };
  await page.click('[data-ikapi-dropdown-toggle]'); r.open = await dd();
  await page.screenshot({ path: path.join(OUT, 'public-member-1440-dropdown-open.png') });
  r.items = await page.evaluate(() => [...document.querySelectorAll('[data-ikapi-dropdown-menu] a')].map((a) => ({ t: a.textContent.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') })));
  await page.keyboard.press('Escape'); r.afterEscape = await dd();
  await page.click('[data-ikapi-dropdown-toggle]'); await page.click('h1'); r.afterOutside = await dd();
  // keyboard: Tab order from the top
  await page.evaluate(() => document.body.focus());
  const order = [];
  for (let i = 0; i < 9; i++) { await page.keyboard.press('Tab'); order.push(await page.evaluate(() => { const e = document.activeElement; return (e.getAttribute('aria-label') || e.textContent || e.placeholder || e.tagName).replace(/\s+/g, ' ').trim().slice(0, 26); })); }
  r.tabOrder = order;
  r.errors = errors;
  results.dropdown = r;
  await ctx.close();
}

// ---- 5. active state derived from the route name ----
{
  const { ctx, page } = await page_(`${BASE}/ui/shell/public`, { width: 1440, height: 900 });
  results.activeNav = await page.evaluate(() => [...document.querySelectorAll('header nav > *')].map((e) => ({ tag: e.tagName.toLowerCase(), text: e.textContent.trim(), current: e.getAttribute('aria-current'), disabled: e.getAttribute('aria-disabled'), href: e.getAttribute('href'), cls: e.className.includes('border-primary') })));
  await ctx.close();
}

fs.writeFileSync(REPORT, JSON.stringify(results, null, 1));
console.log('behaviour measured:', Object.keys(results).join(', '));
await browser.close();
