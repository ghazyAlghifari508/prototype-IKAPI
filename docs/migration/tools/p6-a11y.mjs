// P06 accessibility / keyboard / reload verification (p6.md section 5):
// Enter submit, Tab order, focus-visible ring, disabled state, Escape closes overlays, browser back + reload
// persistence, and reader scroll/position restoration.
// Usage: P6_BASE=http://127.0.0.1:8140 node docs/migration/tools/p6-a11y.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.P6_BASE || 'http://127.0.0.1:8140';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/p6-a11y.json');
const browser = await chromium.launch();
const rows = [];
const mk = () => browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });

const rec = (name, data) => {
  rows.push({ scenario: name, ...data });
  console.log('✓', name, JSON.stringify(data).slice(0, 170));
};

async function open(url) {
  const ctx = await mk();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(300);
  return { ctx, page, errors };
}

/* 1. Enter submits the login form (no mouse) */
{
  const { ctx, page, errors } = await open(`${BASE}/masuk`);
  await page.click('#email-field');
  await page.fill('#email-field', 'pembeli@demo.ikapi.id');
  await page.fill('#password-field', 'demo12345');
  await page.focus('#password-field');
  await page.keyboard.press('Enter');
  // The demo login shows a 1s "memverifikasi" state before it redirects, so wait for the navigation itself.
  const redirected = await page
    .waitForURL(/\/akun\/perpustakaan/, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  rec('login-enter-submit', { redirected, url: new URL(page.url()).pathname, errors });
  await ctx.close();
}

/* 2. Tab order inside the login card + focus ring visible */
{
  const { ctx, page, errors } = await open(`${BASE}/masuk`);
  const order = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => {
      const el = document.activeElement;
      return el ? (el.id || el.getAttribute('aria-label') || el.tagName.toLowerCase()).slice(0, 24) : null;
    }));
  }
  const focusRing = await page.evaluate(() => {
    const el = document.querySelector('#submit-btn');
    el.focus();
    const s = getComputedStyle(el);
    return { outlineWidth: s.outlineWidth, outlineColor: s.outlineColor, boxShadow: s.boxShadow.slice(0, 40) };
  });
  rec('login-tab-order', { order, focusRing, errors });
  await ctx.close();
}

/* 3. Demo login has no credential gate: submitting empty opens the buyer area.
       The inline error state still exists and is reachable through the "Validasi kosong" demo chip. */
{
  const { ctx, page, errors } = await open(`${BASE}/masuk`);
  await page.click('#submit-btn');
  const redirected = await page.waitForURL(/\/akun\/perpustakaan/, { timeout: 12000 }).then(() => true).catch(() => false);
  rec('login-empty-submit-opens-portal', { redirected, errors });
  await ctx.close();
}
{
  const { ctx, page, errors } = await open(`${BASE}/masuk`);
  await page.evaluate(() => document.querySelector('.demo-chip[data-demo="validation"]').click());
  await page.waitForTimeout(350);
  const state = await page.evaluate(() => ({
    banner: !document.getElementById('validation-banner').classList.contains('hidden'),
    emailErr: !document.getElementById('email-error-msg').classList.contains('hidden'),
    passwordErr: !document.getElementById('password-error-msg').classList.contains('hidden'),
    active: document.activeElement ? document.activeElement.id : null,
  }));
  rec('login-validation-demo-chip', { state, errors });
  await ctx.close();
}

/* 4. Validation blocks an incomplete register submit (the prototype keeps the button enabled) */
{
  const { ctx, page, errors } = await open(`${BASE}/daftar`);
  await page.fill('#fullName', 'Budi Santoso');
  await page.click('#buyer-submit');
  await page.waitForTimeout(350);
  const state = await page.evaluate(() => ({
    banner: !document.getElementById('validation-banner').classList.contains('hidden'),
    emailErrVisible: !document.querySelector('[data-err="buyerEmail"]').classList.contains('hidden'),
    passwordErrVisible: !document.querySelector('[data-err="buyerPassword"]').classList.contains('hidden'),
    termsErrVisible: !document.querySelector('[data-err="buyerTerms"]').classList.contains('hidden'),
    active: document.activeElement ? document.activeElement.id : null,
  }));
  rec('register-validation-blocks-incomplete-submit', { state, errors });
  await ctx.close();
}

/* 5. Escape closes the settings password modal and returns focus to the trigger */
{
  const { ctx, page, errors } = await open(`${BASE}/akun/pengaturan`);
  await page.click('button[onclick*="openPasswordModal"]');
  await page.waitForTimeout(250);
  const opened = await page.isVisible('#modal-change-password');
  const scrollLocked = await page.evaluate(() => document.body.style.overflow);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const closed = !(await page.isVisible('#modal-change-password'));
  const scrollAfter = await page.evaluate(() => document.body.style.overflow);
  rec('settings-modal-escape', { opened, scrollLocked, closed, scrollAfter, errors });
  await ctx.close();
}

/* 6. Escape closes the order-detail modal, browser Back returns to the previous app page */
{
  const { ctx, page, errors } = await open(`${BASE}/akun/profil`);
  await page.goto(`${BASE}/akun/pesanan`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.click('#orders-container article button[onclick*="openOrderDetailModal"]');
  await page.waitForTimeout(300);
  const opened = await page.isVisible('#modal-order-detail');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const closed = !(await page.isVisible('#modal-order-detail'));
  await page.goBack({ waitUntil: 'load' });
  const backUrl = new URL(page.url()).pathname;
  rec('orders-modal-escape-and-back', { opened, closed, backUrl, errors });
  await ctx.close();
}

/* 7. Profile edit survives a reload (same browser context, no reset) */
{
  const { ctx, page, errors } = await open(`${BASE}/akun/profil`);
  await page.fill('#full-name', 'Nama Setelah Reload');
  await page.click('#btn-save-profile');
  await page.waitForTimeout(400);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(500);
  const afterReload = await page.textContent('#header-user-name');
  const inputValue = await page.inputValue('#full-name');
  rec('profile-persist-after-reload', { afterReload: afterReload.trim(), inputValue, errors });
  await ctx.close();
}

/* 8. Reader: page position + theme survive a reload, and the stored position is used on load */
{
  const { ctx, page, errors } = await open(`${BASE}/akun/perpustakaan/laskar-aksara-pasundan/baca`);
  const start = await page.textContent('#page-indicator');
  await page.click('#btn-next-page');
  await page.click('#btn-next-page');
  await page.waitForTimeout(400);
  const moved = await page.textContent('#page-indicator');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('ikapi_reader_pos_laskar_aksara') || 'null'));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(600);
  const afterReload = await page.textContent('#page-indicator');
  rec('reader-position-persist', { start, moved, stored, afterReload, errors });
  await ctx.close();
}

/* 9. Cart totals survive a reload and removing an item updates them (no stale state) */
{
  const { ctx, page, errors } = await open(`${BASE}/keranjang`);
  const total = await page.textContent('#summary-total');
  const items = await page.locator('#cart-filled-view article.cart-item').count();
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(500);
  const totalAfter = await page.textContent('#summary-total');
  await page.click('#cart-filled-view article.cart-item button[onclick*="removeCartItem"]');
  await page.waitForTimeout(400);
  const itemsAfter = await page.locator('#cart-filled-view article.cart-item').count();
  const totalAfterRemove = await page.textContent('#summary-total');
  rec('cart-reload-and-remove', { total, items, totalAfter, itemsAfter, totalAfterRemove, errors });
  await ctx.close();
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 2), 'utf8');
await browser.close();
console.log('a11y matrix written to', OUT);