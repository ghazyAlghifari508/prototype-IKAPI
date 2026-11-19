// P05 source extraction: dumps the rendered containers + JS fixture data of the four buyer pages
// into docs/migration/p5-source/ (reference snapshots; the app never reads these files).
// Usage: node docs/migration/tools/extract-p5.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const PROTO = 'http://127.0.0.1:8099/prototype-copy/user';
const ROOT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT';
const OUT = path.join(ROOT, 'docs/migration/p5-source');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
const page = await ctx.newPage();
const report = {};

async function open(file) {
  await page.goto(`${PROTO}/${file}`, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(500);
}

const dump = (name, html) => { fs.writeFileSync(path.join(OUT, name), html); return html.length; };

// ---------- BERANDA ----------
await open('beranda_desktop.html');
report.beranda = {};
report.beranda.carouselSlides = await page.evaluate(() => {
  const track = document.getElementById('carousel-track');
  return [...track.children].map((s, i) => ({
    i, cls: s.className.slice(0, 80),
    img: s.querySelector('img')?.getAttribute('src') ?? null,
    alt: s.querySelector('img')?.getAttribute('alt') ?? null,
    title: s.querySelector('h1,h2,h3')?.textContent.trim() ?? null,
    texts: [...s.querySelectorAll('p,span')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 6),
    links: [...s.querySelectorAll('a')].map((a) => [a.textContent.replace(/\s+/g, ' ').trim().slice(0, 30), a.getAttribute('href')]),
  }));
});
report.beranda.sections = await page.evaluate(() => [...document.querySelectorAll('main section')].map((s, i) => ({
  i, h2: s.querySelector('h2')?.textContent.trim() ?? null, h3: s.querySelector('h3')?.textContent.trim() ?? null,
  cards: s.querySelectorAll('article').length, chips: s.querySelectorAll('a[class*="rounded-full"], button[class*="rounded-full"]').length,
  html_length: s.outerHTML.length,
})));
report.beranda.shelves = await page.evaluate(() => [...document.querySelectorAll('main section')].map((s, i) => ({
  i, title: s.querySelector('h2')?.textContent.trim() ?? null,
  items: [...s.querySelectorAll('article')].map((a) => ({
    title: a.querySelector('h3')?.textContent.trim() ?? null,
    href: a.querySelector('a')?.getAttribute('href') ?? null,
    price: [...a.querySelectorAll('span')].map((x) => x.textContent.trim()).find((t) => /^Rp/.test(t)) ?? null,
    cover: a.querySelector('img')?.getAttribute('src') ?? null,
    badge: a.querySelector('[class*="uppercase"]')?.textContent.trim() ?? null,
  })),
})).filter((s) => s.items.length));
report.beranda.categoryChips = await page.evaluate(() => [...document.querySelectorAll('main a, main button')].filter((e) => /rounded-full/.test(e.className) && e.textContent.trim()).slice(0, 20).map((e) => [e.textContent.replace(/\s+/g, ' ').trim(), e.getAttribute('href')]));
report.beranda.agenda = await page.evaluate(() => [...document.querySelectorAll('#agenda-scroll-container > *')].map((c) => ({ tag: c.tagName, text: c.textContent.replace(/\s+/g, ' ').trim().slice(0, 90), img: c.querySelector('img')?.getAttribute('src') ?? null, href: c.querySelector('a')?.getAttribute('href') ?? null })));
dump('beranda-main.html', await page.evaluate(() => document.querySelector('main').outerHTML));

// ---------- KATALOG ----------
await open('katalog_buku_desktop.html');
report.katalog = {};
report.katalog.facets = await page.evaluate(() => ({
  aside: document.querySelector('aside')?.outerHTML.length,
  checkboxes: [...document.querySelectorAll('aside input[type="checkbox"]')].map((c) => [c.id, c.name, c.value, c.checked, c.closest('label')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)]),
  selects: [...document.querySelectorAll('select')].map((s) => [s.id, [...s.options].map((o) => [o.value, o.text.trim()])]),
  counters: [...document.querySelectorAll('aside [class*="count"], #cat-all')].map((e) => [e.id || e.className.slice(0, 24), e.textContent.trim().slice(0, 30)]),
  viewButtons: [...document.querySelectorAll('#btn-view-grid, #btn-view-list')].map((b) => b.id),
  searchInputs: [...document.querySelectorAll('input[type="search"], #catalog-search-input')].map((i) => i.id),
  sortSelect: document.querySelector('#catalog-sort-select')?.outerHTML.slice(0, 200) ?? null,
}));
report.katalog.state = await page.evaluate(() => (typeof catalogState !== 'undefined' ? catalogState : null));
report.katalog.books = await page.evaluate(() => (typeof rawCatalogBooks !== 'undefined' ? rawCatalogBooks : null));
report.katalog.renderedCards = await page.evaluate(() => document.querySelectorAll('#catalog-products-container > article').length);
report.katalog.pagination = await page.evaluate(() => document.getElementById('catalog-pagination-bar')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) ?? null);
report.katalog.resultSummary = await page.evaluate(() => document.querySelector('[class*="summary"], #catalog-result-summary')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) ?? null);
dump('katalog-aside.html', await page.evaluate(() => document.querySelector('aside').outerHTML));
dump('katalog-toolbar.html', await page.evaluate(() => document.querySelectorAll('main section')[1]?.outerHTML.slice(0, 20000) ?? ''));

// ---------- DETAIL ----------
await open('detail_buku_desktop.html');
report.detail = {};
report.detail.sections = await page.evaluate(() => [...document.querySelectorAll('main section')].map((s, i) => ({ i, id: s.id || null, h2: [...s.querySelectorAll('h2')].map((h) => h.textContent.trim()), articles: s.querySelectorAll('article').length, len: s.outerHTML.length })));
report.detail.book = await page.evaluate(() => { const sec = document.getElementById('book-detail'); return { dataBookId: sec.getAttribute('data-book-id'), h1: sec.querySelector('h1')?.textContent.trim(), texts: [...sec.querySelectorAll('p,span,li,dd,dt')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter((t) => t.length > 1 && t.length < 90).slice(0, 40) }; });
report.detail.related = await page.evaluate(() => [...document.querySelectorAll('main section')].filter((s) => /Buku Terkait|Terkait/i.test(s.textContent.slice(0, 200))).flatMap((s) => [...s.querySelectorAll('article')].map((a) => ({ title: a.querySelector('h3')?.textContent.trim(), author: a.querySelector('p')?.textContent.trim(), price: [...a.querySelectorAll('span')].map((x) => x.textContent.trim()).find((t) => /^Rp/.test(t)), cover: a.querySelector('img')?.getAttribute('src'), href: a.querySelector('a')?.getAttribute('href') }))));
report.detail.reviews = await page.evaluate(() => [...document.querySelectorAll('#reviews-list-container > *')].slice(0, 12).map((r) => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)));
report.detail.ratingLabels = await page.evaluate(() => (typeof RATING_LABELS !== 'undefined' ? RATING_LABELS : null));
report.detail.reasons = await page.evaluate(() => ({ comment: typeof REASONS !== 'undefined' ? REASONS : null }));
dump('detail-main.html', await page.evaluate(() => document.querySelector('main').outerHTML));

// ---------- PREVIEW ----------
await open('preview_buku_desktop.html');
report.preview = await page.evaluate(() => ({
  samplePages: typeof samplePages !== 'undefined' ? samplePages : null,
  progress: document.getElementById('preview-progress-bar')?.style.width ?? null,
  controls: [...document.querySelectorAll('button')].map((b) => [b.id || null, b.getAttribute('aria-label'), b.textContent.replace(/\s+/g, ' ').trim().slice(0, 24)]),
  header: document.querySelector('header, nav')?.outerHTML.slice(0, 600) ?? null,
}));
dump('preview-main.html', await page.evaluate(() => document.body.outerHTML));

fs.writeFileSync(path.join(ROOT, 'docs/migration/p5-source.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify({
  beranda: { slides: report.beranda.carouselSlides.length, sections: report.beranda.sections.length, shelves: report.beranda.shelves.length, agenda: report.beranda.agenda.length, chips: report.beranda.categoryChips.length },
  katalog: { facets: report.katalog.facets.checkboxes.length, selects: report.katalog.facets.selects.length, books: report.katalog.books?.length, cards: report.katalog.renderedCards },
  detail: { sections: report.detail.sections, related: report.detail.related.length, reasons: report.detail.reasons.comment?.length },
  preview: { pages: report.preview.samplePages?.length, controls: report.preview.controls.length },
}, null, 1));
await browser.close();
