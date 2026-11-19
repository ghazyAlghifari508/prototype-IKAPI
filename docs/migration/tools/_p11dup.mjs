import { chromium } from 'playwright';
const b = await chromium.launch();
for (const url of ['http://127.0.0.1:8140/akun/bantuan/chatbot', 'http://127.0.0.1:8140/', 'http://127.0.0.1:8140/katalog']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  const info = await p.evaluate(() => {
    const ids = ['ikapi-chat-window', 'launcher-button', 'chat-input-field', 'chat-body-scrollable'];
    return ids.map((id) => [id, document.querySelectorAll('#' + id).length]).concat([['scripts', document.querySelectorAll('script[type=module]').length]]);
  });
  console.log(url.replace('http://127.0.0.1:8140', ''), JSON.stringify(info));
  await ctx.close();
}
await b.close();
