// P07 extraction: split the community SPA into its views/modals and dump the seeded demo data.
// JS is disabled so the fragments are the pristine markup, not a state the page script already painted.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const PROTO = `${ROOT}/docs/design/prototype-copy/user/komunitas_literasi_desktop.html`;
const OUT = `${ROOT}/docs/migration/p7-source`;
const DATA = `${ROOT}/resources/data/ikapi`;

const browser = await chromium.launch();

/* ---------- 1. pristine fragments (no JS) ---------- */
fs.mkdirSync(OUT, { recursive: true });
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('file://' + PROTO, { waitUntil: 'domcontentloaded' });
  const kids = await page.evaluate(() => [...document.body.children].map((el) => ({ tag: el.tagName.toLowerCase(), id: el.id, cls: String(el.className).slice(0, 60), html: el.outerHTML })));
  const index = [];
  kids.forEach((c, i) => {
    if (c.tag === 'script') return;
    const slug = (c.id || c.tag + '-' + String(c.cls).split(' ')[0]).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 44) + '-' + String(i).padStart(2, '0');
    fs.writeFileSync(path.join(OUT, `child-${slug}.html`), c.html, 'utf8');
    index.push({ file: `child-${slug}.html`, tag: c.tag, id: c.id, cls: c.cls, loc: c.html.split('\n').length, bytes: c.html.length });
  });
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1), 'utf8');
  console.log('fragments:', index.map((r) => `${r.file} ${r.loc}l`).join('\n           '));

  // also dump each SPA view + modal on its own, so the Blade views can be assembled per page
  const views = await page.evaluate(() => {
    const grab = (sel) => { const el = document.querySelector(sel); return el ? { sel, html: el.outerHTML } : null; };
    return ['#view-explore', '#view-noresults', '#view-empty', '#view-profile', '#view-room', '#view-topic', '#view-reply']
      .map(grab).filter(Boolean)
      .concat(['#leave-modal', '#delete-modal', '#report-modal', '#content-menu', '#topic-composer'].map(grab).filter(Boolean));
  });
  views.forEach((v) => {
    const name = v.sel.replace(/[#]/g, '').replace(/[^a-zA-Z0-9_-]/g, '');
    fs.writeFileSync(path.join(OUT, `view-${name}.html`), v.html, 'utf8');
    console.log('view    ', `view-${name}.html`, v.html.split('\n').length + 'l');
  });
  await ctx.close();
}

/* ---------- 2. seeded demo data (JS on, read the store the page itself seeds) ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('file://' + PROTO, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => {
    const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
    return {
      communities: read('ikapi_communities_demo'),
      topics: read('ikapi_community_topics_demo'),
      replies: read('ikapi_community_replies_demo'),
      memberships: read('ikapi_community_memberships_demo'),
      reports: read('ikapi_discussion_reports_demo'),
      seedVersion: read('ikapi_community_seed_version'),
      cards: [...document.querySelectorAll('#community-grid article, #community-grid > *')].map((c) => ({
        name: c.querySelector('h3, h2') ? c.querySelector('h3, h2').textContent.trim() : null,
        img: c.querySelector('img') ? c.querySelector('img').getAttribute('src') : null,
      })).slice(0, 6),
    };
  });
  fs.writeFileSync(path.join(DATA, 'community-seed.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('\nseed keys:', Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.length : typeof v])));
  await ctx.close();
}

await browser.close();