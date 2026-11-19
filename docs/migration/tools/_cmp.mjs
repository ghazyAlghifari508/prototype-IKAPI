import { chromium } from 'playwright';
const b = await chromium.launch();
const run = async (url, isBlade) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(400);
  // enter submit on login
  await p.fill('#email-field', 'pembeli@demo.ikapi.id');
  await p.fill('#password-field', 'demo12345');
  await p.focus('#password-field');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(900);
  const after = { url: new URL(p.url()).pathname, banner: await p.evaluate(() => { const el = document.getElementById('validation-banner'); return el ? !el.classList.contains('hidden') : null; }) };
  await ctx.close();
  return after;
};
console.log('LOGIN proto', JSON.stringify(await run('http://127.0.0.1:8099/prototype-copy/user/masuk_login_desktop.html')));
console.log('LOGIN blade', JSON.stringify(await run('http://127.0.0.1:8140/masuk')));
const dis = async (url) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const btn = document.querySelector('#buyer-submit');
    return { disabledAttr: btn ? btn.hasAttribute('disabled') : null, cls: btn ? btn.className.includes('opacity') : null };
  });
  await ctx.close();
  return r;
};
console.log('REG proto', JSON.stringify(await dis('http://127.0.0.1:8099/prototype-copy/user/daftar_akun_register_desktop.html')));
console.log('REG blade', JSON.stringify(await dis('http://127.0.0.1:8140/daftar')));
await b.close();
