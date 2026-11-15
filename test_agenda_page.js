import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPage() {
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

  const filePath = path.resolve(__dirname, 'docs/design/prototype-copy/user/agenda_berita_literasi_desktop.html');
  const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;

  console.log(`Loading page: ${fileUrl}`);

  const viewports = [
    { width: 1440, height: 900, name: '1440px Desktop' },
    { width: 1024, height: 768, name: '1024px Small Desktop/Tablet Landscape' },
    { width: 768, height: 1024, name: '768px Tablet Portrait' },
    { width: 390, height: 844, name: '390px Mobile' },
    { width: 320, height: 568, name: '320px Narrow Mobile' }
  ];

  let allPassed = true;

  // 1. Check Responsiveness & Overflow
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(500);

    const overflow = await page.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;
      const maxScrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
      return maxScrollWidth - window.innerWidth;
    });

    console.log(`[Viewport ${vp.name}] Horizontal overflow: ${overflow}px`);
    if (overflow > 1) { // 1px threshold for subpixel rounding
      console.error(`FAILED: Horizontal overflow detected on ${vp.name}: ${overflow}px`);
      allPassed = false;
    }
  }

  // Set back to desktop for functional checks
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // 2. Check Broken Images
  const imageStats = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    const results = images.map(img => ({
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete
    }));
    return {
      total: results.length,
      broken: results.filter(img => img.naturalWidth === 0 || !img.complete)
    };
  });

  console.log(`[Images] Total: ${imageStats.total}, Broken: ${imageStats.broken.length}`);
  if (imageStats.broken.length > 0) {
    console.error('Broken images found:', imageStats.broken);
    allPassed = false;
  }

  // 3. Functional: Month Navigation
  const monthBefore = await page.textContent('#calendar-month-label');
  console.log(`Initial month label: ${monthBefore}`);
  await page.click('button[aria-label="Bulan Berikutnya"]');
  await page.waitForTimeout(200);
  const monthNext = await page.textContent('#calendar-month-label');
  console.log(`After next month click: ${monthNext}`);
  if (monthNext === monthBefore) {
    console.error('FAILED: Month did not change after next click');
    allPassed = false;
  }
  await page.click('button[aria-label="Bulan Sebelumnya"]');
  await page.waitForTimeout(200);
  const monthBack = await page.textContent('#calendar-month-label');
  console.log(`After prev month click: ${monthBack}`);

  // 4. Functional: Date Selection (Nov 18)
  const dateBtn18 = page.locator('#date-btn-18');
  await dateBtn18.click();
  await page.waitForTimeout(200);
  const visibleCardsCount18 = await page.evaluate(() => {
    return document.querySelectorAll('#events-container .event-card:not(.hidden)').length;
  });
  console.log(`Visible event cards after clicking 18 Nov: ${visibleCardsCount18}`);
  if (visibleCardsCount18 !== 1) {
    console.error(`FAILED: Expected 1 visible event card on Nov 18, got ${visibleCardsCount18}`);
    allPassed = false;
  }

  // 5. Functional: Reset Calendar via normal mode
  await page.click('#qa-simulation-panel summary');
  await page.waitForTimeout(200);
  await page.click('#btn-state-normal');
  await page.waitForTimeout(200);
  const visibleCardsCountReset = await page.evaluate(() => {
    return document.querySelectorAll('#events-container .event-card:not(.hidden)').length;
  });
  console.log(`Visible event cards after reset: ${visibleCardsCountReset}`);
  if (visibleCardsCountReset !== 3) {
    console.error(`FAILED: Expected 3 visible event cards after reset, got ${visibleCardsCountReset}`);
    allPassed = false;
  }

  // 6. Functional: Simulation Modes

  // Mode: empty-events
  await page.click('#btn-state-empty-events');
  await page.waitForTimeout(200);
  const isEventsEmptyVisible = await page.isVisible('#events-empty-state');
  console.log(`Mode empty-events: Empty state visible? ${isEventsEmptyVisible}`);
  if (!isEventsEmptyVisible) {
    console.error('FAILED: Events empty state not visible in empty-events mode');
    allPassed = false;
  }

  // Mode: empty-news
  await page.click('#btn-state-empty-news');
  await page.waitForTimeout(200);
  const isNewsEmptyVisible = await page.isVisible('#articles-empty-state');
  console.log(`Mode empty-news: Empty state visible? ${isNewsEmptyVisible}`);
  if (!isNewsEmptyVisible) {
    console.error('FAILED: Articles empty state not visible in empty-news mode');
    allPassed = false;
  }

  // Mode: normal
  await page.click('#btn-state-normal');
  await page.waitForTimeout(200);
  const isNormalEventsVisible = await page.isVisible('#events-container');
  const isNormalArticlesVisible = await page.isVisible('#articles-container');
  console.log(`Mode normal restored: Events visible? ${isNormalEventsVisible}, Articles visible? ${isNormalArticlesVisible}`);
  if (!isNormalEventsVisible || !isNormalArticlesVisible) {
    console.error('FAILED: Containers not restored in normal mode');
    allPassed = false;
  }

  // 7. Functional: Featured Event Detail Modal
  await page.click('button:has-text("Lihat Detail Acara")');
  await page.waitForTimeout(300);
  const isFeaturedModalVisible = await page.isVisible('#modal-featured-detail');
  console.log(`Featured modal opened? ${isFeaturedModalVisible}`);
  if (!isFeaturedModalVisible) {
    console.error('FAILED: Featured event modal did not open');
    allPassed = false;
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const isFeaturedModalClosed = !(await page.isVisible('#modal-featured-detail'));
  console.log(`Featured modal closed via Escape? ${isFeaturedModalClosed}`);
  if (!isFeaturedModalClosed) {
    console.error('FAILED: Featured event modal did not close on Escape');
    allPassed = false;
  }

  // 8. Functional: Article Modal
  await page.click('button:has-text("Baca Artikel")');
  await page.waitForTimeout(300);
  const isArticleModalVisible = await page.isVisible('#modal-article-preview');
  console.log(`Article modal opened? ${isArticleModalVisible}`);
  if (!isArticleModalVisible) {
    console.error('FAILED: Article modal did not open');
    allPassed = false;
  }
  await page.click('#modal-article-preview button[aria-label="Tutup Artikel"]');
  await page.waitForTimeout(300);
  const isArticleModalClosed = !(await page.isVisible('#modal-article-preview'));
  console.log(`Article modal closed? ${isArticleModalClosed}`);
  if (!isArticleModalClosed) {
    console.error('FAILED: Article modal did not close');
    allPassed = false;
  }

  // 9. Check Console Errors
  console.log(`[Console Errors] Count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
    allPassed = false;
  }

  await browser.close();

  if (allPassed) {
    console.log('\n>>> ALL AUDIT AND ACCEPTANCE CRITERIA PASSED! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> SOME CRITERIA FAILED! <<<');
    process.exit(1);
  }
}

testPage().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
