import { chromium } from 'playwright';
const O = 'http://127.0.0.1:8099/prototype-copy';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
const p = await ctx.newPage();
const keysAfter = async () => p.evaluate(() => Object.keys(localStorage));
// 1) does an innocent user page write demo session storage?
for (const u of ['user/beranda_desktop.html', 'user/komunitas_literasi_desktop.html', 'user/katalog_buku_desktop.html', 'user/masuk_login_desktop.html']) {
  await p.goto(`${O}/${u}`, { waitUntil: 'load' });
  await p.waitForTimeout 
  await p.waitForTimeout(500);
  console.log(u, '->', JSON.stringify(await keysAfter()));
}
// 2) in the same context, do portal pages still render (or redirect)?
for (const u of ['admin/kelola_pengguna_desktop.html', 'penerbit/kelola_buku_desktop.html']) {
  await p.goto(`${O}/${u}`, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  console.log(u, '-> final url:', await p.evaluate(() => location.pathname.split('/').slice(-2).join('/')), '| toggle:', await p.evaluate(() => !!document.querySelector('#demo-toggle')));
}
// 3) fresh context: portal renders
const ctx2 = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const p2 = await ctx2.newPage();
for (const u of ['admin/kelola_pengguna_desktop.html', 'penerbit/kelola_buku_desktop.html']) {
  await p2.goto(`${O}/${u}`, { waitUntil: 'load' });
  await p2.waitForTimeout(600);
  console.log('fresh', u, '-> final url:', await p2.evaluate(() => location.pathname.split('/').slice(-2).join('/')), '| toggle:', await p2.evaluate(() => !!document.querySelector('#demo-toggle')));
}
await b.close();
