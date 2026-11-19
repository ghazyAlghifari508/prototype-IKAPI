// Re-extract one page with a query string so the captured fragments are the *visible* state.
import { chromium } from 'playwright';
import fs from 'node:fs';
const [page, query] = process.argv.slice(2);
const SRC = `C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/design/prototype-copy/user/${page}.html`;
const OUT = `C:/Coding/Web Development/Laravel/IKAPI JAWA BARAT/docs/migration/p6-source/${page}`;
const html = fs.readFileSync(SRC, 'utf8');
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto('file://' + SRC + (query || ''), { waitUntil: 'domcontentloaded' });
const kids = await p.evaluate(() => [...document.body.children].map((el) => ({ tag: el.tagName.toLowerCase(), id: el.id, cls: el.className, html: el.outerHTML })));
kids.forEach((c, i) => {
  if (c.tag === 'script') return;
  const files = fs.readdirSync(OUT).filter((f) => f.startsWith(`child-${c.id || c.tag}`));
  if (!files.length) { console.log('skip', c.tag, c.id); return; }
  fs.writeFileSync(`${OUT}/${files[0]}`, c.html, 'utf8');
  console.log('rewrote', files[0], c.html.split('\n').length, 'lines');
});
await b.close();
