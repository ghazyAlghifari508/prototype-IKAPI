// P06 fixtures: pull the prototype's seed data out of the page scripts into resources/data/ikapi/*.json.
// Data is read from a live prototype page (the same lexical globals the page itself uses), never retyped.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const PROTO = 'http://127.0.0.1:8099/prototype-copy/user';
const OUT = 'C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/resources/data/ikapi';

const jobs = [
  {
    page: 'agenda_berita_literasi_desktop.html',
    file: 'agenda',
    pick: { events: () => eventsData, articles: () => articlesData },
  },
  {
    page: 'detail_agenda_desktop.html',
    file: 'agenda-detail',
    pick: { events: () => EVENTS },
  },
  {
    page: 'riwayat_pesanan_desktop.html',
    file: 'orders-p6',
    pick: { orders: () => ordersData },
  },
  {
    page: 'riwayat_ulasan_desktop.html',
    file: 'reviews',
    pick: { reviews: () => initialUserReviews },
  },
  {
    page: 'bantuan_akun_desktop.html',
    file: 'faq',
    pick: { faqs: () => faqData },
  },
  {
    page: 'web_reader_desktop.html',
    file: 'reader',
    pick: { pages: () => bookPagesData, bookmarks: () => bookmarksData },
  },
  {
    page: 'akun_saya_profil_dropdown_navigasi_desktop.html',
    file: 'profile',
    pick: { profile: () => DEFAULT_PROFILE },
  },
];

const browser = await chromium.launch();
for (const job of jobs) {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto(`${PROTO}/${job.page}`, { waitUntil: 'load' });
  const data = await p.evaluate((pickSrc) => {
    const out = {};
    for (const [key, src] of Object.entries(pickSrc)) {
      try {
        // eslint-disable-next-line no-new-func
        out[key] = new Function('return (' + src + ')')();
      } catch (e) {
        out[key] = { error: String(e) };
      }
    }
    return out;
  }, Object.fromEntries(Object.entries(job.pick).map(([k, fn]) => [k, fn.toString().replace(/^\(\) => /, '')])));
  fs.writeFileSync(path.join(OUT, job.file + '.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
  const sizes = Object.entries(data).map(([k, v]) => `${k}=${Array.isArray(v) ? v.length : Object.keys(v || {}).length}`).join(' ');
  console.log(job.file.padEnd(14), sizes);
  await ctx.close();
}
await browser.close();