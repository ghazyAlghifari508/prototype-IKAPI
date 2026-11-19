import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', String(e).slice(0, 160)));
await p.goto('http://127.0.0.1:8140/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(600);
console.log(await p.evaluate(() => {
  const w = document.getElementById('ikapi-chat-window');
  const out = { hasFn: typeof window.toggleWidgetPanel, wrapped: String(window.toggleWidgetPanel).slice(0, 60), before: w.className.slice(0, 30) };
  window.toggleWidgetPanel();
  out.after1 = document.getElementById('ikapi-chat-window').className.slice(0, 40);
  window.toggleWidgetPanel();
  out.after2 = document.getElementById('ikapi-chat-window').className.slice(0, 40);
  out.sameNode = document.getElementById('ikapi-chat-window') === w;
  return out;
}));
await ctx.close();
await b.close();
