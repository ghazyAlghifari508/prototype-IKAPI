import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runWorkspaceQA() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  const pagesToTest = [
    {
      name: 'Profil Saya',
      file: 'docs/design/prototype-copy/user/akun_saya_profil_dropdown_navigasi_desktop.html'
    },
    {
      name: 'Riwayat Pesanan',
      file: 'docs/design/prototype-copy/user/riwayat_pesanan_desktop.html'
    },
    {
      name: 'Pengaturan Akun',
      file: 'docs/design/prototype-copy/user/pengaturan_akun_desktop.html'
    }
  ];

  const viewports = [
    { width: 1440, height: 900, name: '1440px Desktop' },
    { width: 1024, height: 768, name: '1024px Small Desktop/Tablet' },
    { width: 768, height: 1024, name: '768px Tablet Portrait' },
    { width: 390, height: 844, name: '390px Mobile' },
    { width: 320, height: 568, name: '320px Narrow Mobile' }
  ];

  let allPassed = true;

  for (const pageConfig of pagesToTest) {
    const fullPath = path.resolve(__dirname, pageConfig.file);
    const fileUrl = `file://${fullPath.replace(/\\/g, '/')}`;
    console.log(`\n========================================`);
    console.log(`TESTING PAGE: ${pageConfig.name}`);
    console.log(`URL: ${fileUrl}`);
    console.log(`========================================`);

    // 1. Viewport & Overflow Tests
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(fileUrl, { waitUntil: 'load' });
      await page.waitForTimeout(400);

      const overflow = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const maxScrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
        return maxScrollWidth - window.innerWidth;
      });

      console.log(`[${pageConfig.name} - ${vp.name}] Overflow: ${overflow}px`);
      if (overflow > 1) {
        console.error(`FAILED: Horizontal overflow on ${pageConfig.name} (${vp.name}): ${overflow}px`);
        allPassed = false;
      }
    }

    // Set back to 1440px desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(400);

    // 2. Broken Image Check
    const imageStats = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return {
        total: images.length,
        broken: images.filter(img => img.naturalWidth === 0 || !img.complete).map(img => img.src)
      };
    });

    console.log(`[${pageConfig.name} Images] Total: ${imageStats.total}, Broken: ${imageStats.broken.length}`);
    if (imageStats.broken.length > 0) {
      console.error(`FAILED: Broken images on ${pageConfig.name}:`, imageStats.broken);
      allPassed = false;
    }

    // 3. Dropdown Menu Test
    const dropdownBtn = page.locator('#toggle-dropdown-btn');
    if (await dropdownBtn.count() > 0) {
      await dropdownBtn.click();
      await page.waitForTimeout(200);
      const isDropdownVisible = await page.isVisible('#header-user-dropdown');
      console.log(`[${pageConfig.name}] Header dropdown opened? ${isDropdownVisible}`);
      if (!isDropdownVisible) {
        console.error(`FAILED: Header dropdown did not open on ${pageConfig.name}`);
        allPassed = false;
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      const isDropdownClosed = !(await page.isVisible('#header-user-dropdown'));
      console.log(`[${pageConfig.name}] Header dropdown closed via Escape? ${isDropdownClosed}`);
      if (!isDropdownClosed) {
        console.error(`FAILED: Header dropdown did not close on ${pageConfig.name}`);
        allPassed = false;
      }
    }
  }

  // Specific Functional Test: Profil Saya
  console.log(`\n--- Functional Test: Profil Saya ---`);
  const profileUrl = `file://${path.resolve(__dirname, 'docs/design/prototype-copy/user/akun_saya_profil_dropdown_navigasi_desktop.html').replace(/\\/g, '/')}`;
  await page.goto(profileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  // Type new name in draft
  const nameInput = page.locator('#full-name');
  await nameInput.fill('Ahmad Hidayat Modif');
  await page.waitForTimeout(100);

  // Click Batal
  await page.click('button:has-text("Batal")');
  await page.waitForTimeout(200);
  const revertedName = await nameInput.inputValue();
  console.log(`Name after clicking Batal: "${revertedName}"`);
  if (revertedName !== 'Ahmad Hidayat') {
    console.error(`FAILED: Batal did not revert name. Expected "Ahmad Hidayat", got "${revertedName}"`);
    allPassed = false;
  }

  // Type new name and click Simpan
  await nameInput.fill('Ahmad Hidayat Pratama');
  await page.click('#btn-save-profile');
  await page.waitForTimeout(300);
  const savedSidebarName = await page.textContent('#sidebar-user-name');
  console.log(`Sidebar name after saving: "${savedSidebarName}"`);
  if (!savedSidebarName.includes('Ahmad Hidayat Pratama')) {
    console.error(`FAILED: Name not synced to sidebar after saving`);
    allPassed = false;
  }

  // Specific Functional Test: Riwayat Pesanan
  console.log(`\n--- Functional Test: Riwayat Pesanan ---`);
  const orderUrl = `file://${path.resolve(__dirname, 'docs/design/prototype-copy/user/riwayat_pesanan_desktop.html').replace(/\\/g, '/')}`;
  await page.goto(orderUrl, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  // Check initial order count (5)
  let orderCardsCount = await page.locator('#orders-container .order-card').count();
  console.log(`Initial order cards count: ${orderCardsCount}`);
  if (orderCardsCount !== 5) {
    console.error(`FAILED: Expected 5 order cards, got ${orderCardsCount}`);
    allPassed = false;
  }

  // Filter: Berhasil (2)
  await page.click('#tab-filter-success');
  await page.waitForTimeout(200);
  orderCardsCount = await page.locator('#orders-container .order-card').count();
  console.log(`Order cards count after filter "Berhasil": ${orderCardsCount}`);
  if (orderCardsCount !== 2) {
    console.error(`FAILED: Expected 2 success order cards, got ${orderCardsCount}`);
    allPassed = false;
  }

  // Open Order Detail Modal
  await page.click('.order-card button:has-text("Lihat Rincian")');
  await page.waitForTimeout(300);
  const isOrderDetailVisible = await page.isVisible('#modal-order-detail');
  console.log(`Order detail modal opened? ${isOrderDetailVisible}`);
  if (!isOrderDetailVisible) {
    console.error(`FAILED: Order detail modal did not open`);
    allPassed = false;
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const isOrderDetailClosed = !(await page.isVisible('#modal-order-detail'));
  console.log(`Order detail modal closed via Escape? ${isOrderDetailClosed}`);
  if (!isOrderDetailClosed) {
    console.error(`FAILED: Order detail modal did not close`);
    allPassed = false;
  }

  // Specific Functional Test: Pengaturan Akun
  console.log(`\n--- Functional Test: Pengaturan Akun ---`);
  const settingsUrl = `file://${path.resolve(__dirname, 'docs/design/prototype-copy/user/pengaturan_akun_desktop.html').replace(/\\/g, '/')}`;
  await page.goto(settingsUrl, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  // Open Password Modal
  await page.click('button:has-text("Ubah Kata Sandi")');
  await page.waitForTimeout(300);
  const isPwdModalVisible = await page.isVisible('#modal-change-password');
  console.log(`Password modal opened? ${isPwdModalVisible}`);
  if (!isPwdModalVisible) {
    console.error(`FAILED: Password modal did not open`);
    allPassed = false;
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const isPwdModalClosed = !(await page.isVisible('#modal-change-password'));
  console.log(`Password modal closed via Escape? ${isPwdModalClosed}`);
  if (!isPwdModalClosed) {
    console.error(`FAILED: Password modal did not close`);
    allPassed = false;
  }

  // Save Preferences
  await page.click('#btn-save-preferences');
  await page.waitForTimeout(300);
  const toastText = await page.textContent('#toastMessage');
  console.log(`Toast after saving preferences: "${toastText}"`);
  if (!toastText.includes('Preferensi notifikasi berhasil disimpan')) {
    console.error(`FAILED: Expected toast confirmation for saving preferences`);
    allPassed = false;
  }

  // Console Errors Check
  console.log(`\nTotal Console Errors across all tests: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
    allPassed = false;
  }

  await browser.close();

  if (allPassed) {
    console.log('\n>>> ALL ACCOUNT WORKSPACE QA & AUDIT PASSED! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> WORKSPACE QA CRITERIA FAILED! <<<');
    process.exit(1);
  }
}

runWorkspaceQA().catch(err => {
  console.error('Workspace test error:', err);
  process.exit(1);
});
