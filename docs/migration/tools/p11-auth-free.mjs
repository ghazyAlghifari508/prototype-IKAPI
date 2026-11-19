// Verify the "no blocking" auth demo: arbitrary credentials must land on the role's pages.
import { chromium } from 'playwright';

const BASE = process.env.P11_BASE || 'http://127.0.0.1:8140';
const browser = await chromium.launch();
const rows = [];

async function submit(route, fields, submitSel, viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport, locale: 'id-ID', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  for (const [sel, value] of fields) await page.fill(sel, value).catch(() => {});
  await page.click(submitSel).catch(() => {});
  await page.waitForTimeout(2600);
  const state = {
    url: new URL(page.url()).pathname + new URL(page.url()).search,
    status: 'done',
    feedback: await page.evaluate(() => ['#info-banner', '#validation-banner', '#preview-note', '#toast'].map((s) => { const el = document.querySelector(s); return el && !el.classList.contains('hidden') ? (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 46) : null; }).filter(Boolean)),
    errors,
  };
  state.blocked = await page.evaluate(() => {
    const banner = document.querySelector('#validation-banner');
    const visibleBanner = banner && !banner.classList.contains('hidden');
    const emailErr = document.querySelector('#email-error-msg');
    return { visibleBanner: !!visibleBanner, emailErr: !!(emailErr && !emailErr.classList.contains('hidden')) };
  });
  await ctx.close();
  return state;
}

rows.push({ case: 'buyer login, junk email', ...(await submit('/masuk', [['#email-field', 'asd'], ['#password-field', 'x']], '#submit-btn')) });
rows.push({ case: 'buyer login, empty fields', ...(await submit('/masuk', [], '#submit-btn')) });
rows.push({ case: 'publisher login, junk', ...(await submit('/masuk?role=publisher', [['#email-field', 'bukan-email'], ['#password-field', '1']], '#submit-btn')) });
rows.push({ case: 'buyer register, junk', ...(await submit('/daftar', [['#fullName', 'a'], ['#buyerEmail', 'asd'], ['#buyerPhone', '1'], ['#buyerPassword', 'x'], ['#buyerPasswordConfirm', 'y']], '#buyer-submit')) });
rows.push({ case: 'admin login, junk', ...(await submit('/admin/masuk', [['#admin-email', 'asd'], ['#admin-password', 'x']], '#submit-btn')) });

for (const r of rows) console.log('ok ' + r.case.padEnd(28), '->', r.url, '| banner', r.blocked.visibleBanner, '| feedback', JSON.stringify(r.feedback), '| errors', r.errors.slice(0, 1));
await browser.close();