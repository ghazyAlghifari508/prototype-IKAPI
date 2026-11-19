// P05 fixture builder: turns the prototype's own data into app fixtures (no invented rows).
// Usage: node docs/migration/tools/build-fixtures-p5.mjs
//
// Sources (all read from the reference pages):
//   user/katalog_buku_desktop.html   -> rawCatalogBooks (12) + catalog facets + sort options + price range
//   user/beranda_desktop.html        -> hero slides, 5 category tiles, 3 shelves (5 books each), 4 agenda cards
//   user/detail_buku_desktop.html    -> reference book BK-01: synopsis, detail table, 3 reviews, related ids
//   user/preview_buku_desktop.html   -> 4 sample pages of the reference book
//
// Output: resources/data/ikapi/{books,home,catalog,preview}.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const PROTO = 'http://127.0.0.1:8099/prototype-copy/user';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/resources/data/ikapi';
fs.mkdirSync(OUT, { recursive: true });

const slugify = (s) => s
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, 'dan').replace(/[’'"]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
const page = await ctx.newPage();
const open = async (file) => { await page.goto(`${PROTO}/${file}`, { waitUntil: 'load' }); await page.evaluate(async () => { await document.fonts.ready; }); await page.waitForTimeout(500); };

// ---------------------------------------------------------------- katalog
await open('katalog_buku_desktop.html');
const catalogBooks = await page.evaluate(() => rawCatalogBooks);
const catalogState = await page.evaluate(() => catalogState);
const facets = await page.evaluate(() => ({
  // the count is the label's own trailing span; a plain span:last-child would pick the label text span instead
  categories: [...document.querySelectorAll('.cat-filter-checkbox')].map((c) => ({ label: c.getAttribute('data-category'), count: Number(c.closest('label').querySelector(':scope > span:last-child').textContent.replace(/\D/g, '')) })),
  allCount: Number(document.querySelector('#cat-all').closest('label').querySelector(':scope > span:last-child').textContent.replace(/\D/g, '')),
  publishers: [...document.querySelectorAll('.pub-filter-checkbox')].map((c) => ({ label: c.getAttribute('data-publisher'), count: Number(c.closest('label').querySelector(':scope > span:last-child').textContent.replace(/\D/g, '')) })),
  sortOptions: [...document.querySelectorAll('#catalog-sort-select option')].map((o) => ({ value: o.value, label: o.textContent.trim() })),
  priceMin: Number(document.querySelector('#price-min-input').getAttribute('placeholder')),
  priceMax: Number(document.querySelector('#price-max-input').getAttribute('placeholder')),
}));

// ---------------------------------------------------------------- beranda
await open('beranda_desktop.html');
const home = await page.evaluate(() => {
  const img = (el) => el?.querySelector('img');
  const slides = [...document.getElementById('carousel-track').children].map((s) => {
    const i = img(s);
    return { image: i.getAttribute('src'), alt: i.getAttribute('alt'), href: s.querySelector('a').getAttribute('href') };
  });
  const sections = [...document.querySelectorAll('main section')];
  const cats = [...sections[1].querySelectorAll('a')].map((a) => ({ label: a.querySelector('span').textContent.trim(), image: img(a).getAttribute('src'), alt: img(a).getAttribute('alt'), href: a.getAttribute('href') }));
  const shelves = sections.slice(2, 5).map((s) => ({
    title: s.querySelector('h2').textContent.trim(),
    seeAllHref: s.querySelector('a[href]').getAttribute('href'),
    books: [...s.querySelectorAll('article')].map((a) => {
      const btn = a.querySelector('button');
      const i = img(a);
      return {
        title: a.querySelector('h3').textContent.trim(),
        author: a.querySelector('p').textContent.trim(),
        price: Number((a.querySelector('span.text-\\[16px\\]')?.textContent ?? '').replace(/\D/g, '')),
        cover: i.getAttribute('src'),
        alt: i.getAttribute('alt'),
        href: a.querySelector('a').getAttribute('href'),
        bookId: btn?.getAttribute('data-book-id') ?? null,
      };
    }),
  }));
  const agenda = [...sections[5].querySelectorAll('article')].map((a) => {
    const i = img(a);
    // Each meta row is [icon span][text span]; the icon's ligature name must not leak into the value.
    const rows = [...a.querySelectorAll('div.flex.items-center')].map((r) => {
      const spans = [...r.querySelectorAll('span')];
      return { icon: spans[0]?.textContent.trim() ?? '', value: spans[spans.length - 1]?.textContent.replace(/\s+/g, ' ').trim() ?? '' };
    });
    return {
      title: a.querySelector('h3').textContent.trim(),
      href: a.querySelector('a').getAttribute('href'),
      image: i.getAttribute('src'), alt: i.getAttribute('alt'),
      date: rows.find((r) => r.icon === 'calendar_today')?.value ?? null,
      location: rows.find((r) => r.icon === 'location_on')?.value ?? null,
      price: a.querySelector('span.text-\\[14px\\]')?.textContent.trim() ?? null,
      // The reference marks agenda card 3's price with `text-ink-body` instead of `text-primary`;
      // the class is carried through verbatim so the card looks exactly like the prototype.
      priceClass: a.querySelector('div.pt-3 span')?.className.trim().replace(/\s*truncate\s*/g, '') ?? 'text-[14px] font-bold text-primary',
      shareTitle: a.querySelector('.btn-share-event')?.getAttribute('data-title') ?? null,
    };
  });
  return { slides, categories: cats, shelves, agenda };
});

// ---------------------------------------------------------------- detail (reference book)
await open('detail_buku_desktop.html');
const detail = await page.evaluate(() => {
  const sec = document.getElementById('book-detail');
  const clean = (t) => t.replace(/\s+/g, ' ').trim();
  const rows = [...document.querySelectorAll('section:nth-of-type(2) dl > div')].map((d) => ({ label: clean(d.querySelector('dt').textContent), value: clean(d.querySelector('dd').textContent) }));
  const synopsis = [...document.querySelectorAll('section:nth-of-type(2) .lg\\:col-span-7 p')].map((p) => clean(p.textContent));
  const reviews = [...document.querySelectorAll('#reviews-list-container > article')].map((a) => ({
    commentId: a.getAttribute('data-comment-id'),
    author: clean(a.querySelector('.review-author').textContent),
    date: clean(a.querySelector('time').textContent),
    datetime: a.querySelector('time').getAttribute('datetime'),
    body: clean(a.querySelector('.review-body').textContent),
  }));
  const related = [...document.querySelectorAll('section:nth-of-type(4) article')].map((a) => ({
    title: clean(a.querySelector('h3').textContent),
    author: clean(a.querySelector('p').textContent),
    price: Number(a.querySelector('span.text-\\[16px\\]').textContent.replace(/\D/g, '')),
    cover: a.querySelector('img').getAttribute('src'),
    alt: a.querySelector('img').getAttribute('alt'),
  }));
  const meta = {
    bookId: sec.getAttribute('data-book-id'),
    title: clean(document.getElementById('book-title').textContent),
    author: clean(document.getElementById('book-author').textContent),
    publisher: clean(document.getElementById('book-publisher').textContent).replace(/^Penerbit\s+/i, ''),
    year: Number(clean(document.querySelector('#book-detail .text-\\[13px\\].text-ink-muted span:not([id])').textContent).replace(/\D/g, '')),
    language: clean(sec.querySelectorAll('span.rounded-full')[0].textContent),
    pages: Number(clean(sec.querySelectorAll('span.rounded-full')[1].textContent).replace(/\D/g, '')),
    price: Number(document.querySelector('#book-detail .text-\\[32px\\]')?.textContent.replace(/\D/g, '') ?? 0),
    cover: document.getElementById('book-cover').getAttribute('src'),
    coverAlt: document.getElementById('book-cover').getAttribute('alt'),
  };
  return { meta, synopsis, rows, reviews, related };
});

// ---------------------------------------------------------------- preview
await open('preview_buku_desktop.html');
const preview = await page.evaluate(() => ({
  pages: samplePages.map((p) => ({ num: p.num, chapter: p.chapter, title: p.title, paragraphs: p.paragraphs })),
  counter: document.getElementById('preview-counter-badge')?.textContent.trim(),
  price: document.querySelector('#btnAddToCartText')?.textContent.replace(/[^\d]/g, '') ?? null,
  bookHref: document.querySelector('a[data-path="detail-buku"]')?.getAttribute('href') ?? null,
}));

// ---------------------------------------------------------------- assemble books.json
const books = [];
const bySlug = new Map();
const pushBook = (b, source) => {
  const slug = slugify(b.title);
  if (bySlug.has(slug)) { const e = bySlug.get(slug); if (!e.sources.includes(source)) e.sources.push(source); return e; }
  const entry = {
    id: b.id ?? b.bookId ?? null,
    slug,
    title: b.title, author: b.author, publisher: b.publisher ?? null,
    category: b.category ?? null, year: b.year ?? null,
    price: b.price, cover: b.cover.replace('../../assets/', ''), coverAlt: b.alt ?? `Sampul buku ${b.title}`,
    sources: [source],
  };
  bySlug.set(slug, entry); books.push(entry); return entry;
};

catalogBooks.forEach((b) => pushBook({ id: b.id, title: b.title, author: b.author, publisher: b.publisher, category: b.category, year: b.year, price: b.price, cover: b.cover, alt: `Sampul ${b.title}` }, 'catalog'));
home.shelves.forEach((s) => s.books.forEach((b) => pushBook({ id: b.bookId, title: b.title, author: b.author, price: b.price, cover: b.cover, alt: b.alt }, 'shelf')));

const reference = bySlug.get(slugify(detail.meta.title));

// The reference page's "Buku Terkait" cards use their own titles, which are prefixes/short forms of the
// catalog titles ("Bumi Parahyangan: Narasi Tanah Pasundan" vs catalog "Bumi Parahyangan: Narasi Alam").
// Link by longest common title prefix (>= 12 chars) so the card keeps the reference copy while the link
// still resolves to a real book; unmatched cards keep the copy but are rendered without a link (no fake href).
const resolveRelated = (title) => {
  const t = title.toLowerCase();
  let best = null;
  for (const b of books) {
    const c = b.title.toLowerCase();
    let n = 0;
    while (n < Math.min(t.length, c.length) && t[n] === c[n]) n++;
    if ((c === t || n >= 12) && (!best || n > best.n)) best = { slug: b.slug, n };
  }
  return best?.slug ?? null;
};

Object.assign(reference, {
  publisher: detail.meta.publisher, year: detail.meta.year, price: detail.meta.price,
  cover: detail.meta.cover.replace('../../assets/', ''), coverAlt: detail.meta.coverAlt,
  detail: {
    bookId: detail.meta.bookId,
    synopsis: detail.synopsis,
    rows: detail.rows,
    reviews: detail.reviews,
    related: detail.related.map((r) => ({
      title: r.title, author: r.author, price: r.price,
      cover: r.cover.replace('../../assets/', ''), coverAlt: r.alt,
      bookSlug: resolveRelated(r.title),
    })),
  },
});

const relatedIdx = reference.detail.related.map((r) => ({ title: r.title, bookSlug: r.bookSlug }));

// ---------------------------------------------------------------- write
const write = (name, data) => { fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n'); console.log(name, JSON.stringify(data).length, 'bytes'); };

write('books.json', books);
write('home.json', {
  slides: home.slides.map((s) => ({ image: s.image.replace('../../assets/', ''), alt: s.alt, bookSlug: null })),
  categories: home.categories.map((c) => ({ label: c.label, image: c.image.replace('../../assets/', ''), alt: c.alt })),
  shelves: home.shelves.map((s) => ({ title: s.title, bookSlugs: s.books.map((b) => slugify(b.title)) })),
  agenda: home.agenda.map((a) => ({
    title: a.title, image: a.image.replace('../../assets/', ''), alt: a.alt,
    date: a.date, location: a.location, price: a.price, priceClass: a.priceClass, shareTitle: a.shareTitle,
  })),
});
write('catalog.json', {
  facets,
  defaults: {
    sort: catalogState.sortBy, viewMode: catalogState.viewMode,
    pageSize: catalogState.pageSize, minPrice: catalogState.minPrice, maxPrice: catalogState.maxPrice,
  },
});
write('preview.json', { pages: preview.pages, counter: preview.counter, price: Number(preview.price), bookSlug: slugify(detail.meta.title) });

console.log(JSON.stringify({
  books: books.length,
  catalogBooks: books.filter((b) => b.sources.includes('catalog')).length,
  shelfBooks: books.filter((b) => b.sources.includes('shelf')).length,
  withDetail: books.filter((b) => b.detail).length,
  shelves: home.shelves.map((s) => [s.title, s.books.length]),
  agenda: home.agenda.length, slides: home.slides.length, categories: home.categories.length,
  previewPages: preview.pages.length,
  relatedResolved: relatedIdx,
}, null, 1));
await browser.close();
