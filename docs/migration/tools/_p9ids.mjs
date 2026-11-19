import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch();
const check = async (url, scriptPath) => {
  const src = fs.readFileSync(scriptPath, 'utf8');
  const ids = [...new Set([...src.matchAll(/(?:getElementById|\$)\(['"]([a-zA-Z0-9_-]+)['"]\)/g)].map((m) => m[1]))];
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('  ERR', String(e).slice(0, 100)));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const missing = await p.evaluate((ids) => ids.filter((id) => !document.getElementById(id)), ids);
  console.log(url.replace('http://127.0.0.1:8140', ''), '| refs', ids.length, '| missing:', missing);
  await ctx.close();
};
await check('http://127.0.0.1:8140/admin', 'docs/migration/p9-source/dashboard_administrasi_utama_desktop/script-01.js');
await check('http://127.0.0.1:8140/admin/monitoring', 'docs/migration/p9-source/monitoring_global_desktop/script-01.js');
await b.close();
