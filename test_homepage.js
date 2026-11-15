import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testHomepage() {
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

  const fullPath = path.resolve(__dirname, 'docs/design/prototype-copy/user/beranda_desktop.html');
  const fileUrl = `file://${fullPath.replace(/\\/g, '/')}`;

  console.log(`Loading homepage: ${fileUrl}`);

  const viewports = [
    { width: 1440, height: 900, name: '1440px Desktop' },
    { width: 1024, height: 768, name: '1024px Small Desktop/Tablet' },
    { width: 768, height: 1024, name: '768px Tablet Portrait' },
    { width: 390, height: 844, name: '390px Mobile' },
    { width: 320, height: 568, name: '320px Narrow Mobile' }
  ];

  let allPassed = true;

  // 1. Responsive & Overflow Checks
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

    console.log(`[Viewport ${vp.name}] Overflow: ${overflow}px`);
    if (overflow > 1) {
      console.error(`FAILED: Horizontal overflow detected on ${vp.name}: ${overflow}px`);
      allPassed = false;
    }
  }

  // Set to 1440px Desktop for component tests
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  // Scroll to bottom and back to trigger lazy loaded images
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 600));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 300));
  });

  // 2. Broken Image Check
  const imageStats = await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img'));
    // Wait for all images to complete loading
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = img.onerror = resolve;
      });
    }));
    return {
      total: images.length,
      broken: images.filter(img => img.naturalWidth === 0).map(img => img.src)
    };
  });

  console.log(`[Images] Total: ${imageStats.total}, Broken: ${imageStats.broken.length}`);
  if (imageStats.broken.length > 0) {
    console.error('FAILED: Broken images on homepage:', imageStats.broken);
    allPassed = false;
  }

  // 3. Section Verification
  const sectionCounts = await page.evaluate(() => {
    return {
      categories: document.querySelectorAll('section:nth-of-type(2) a').length,
      recommendationBooks: document.querySelectorAll('section:nth-of-type(3) article').length,
      newBooks: document.querySelectorAll('section:nth-of-type(4) article').length,
      bestsellerBooks: document.querySelectorAll('section:nth-of-type(5) article').length,
      agendaCards: document.querySelectorAll('#agenda-scroll-container article').length
    };
  });
  console.log('Section counts:', sectionCounts);
  if (sectionCounts.categories !== 5) {
    console.error(`FAILED: Expected 5 categories, got ${sectionCounts.categories}`);
    allPassed = false;
  }
  if (sectionCounts.recommendationBooks !== 5) {
    console.error(`FAILED: Expected 5 recommendation books, got ${sectionCounts.recommendationBooks}`);
    allPassed = false;
  }
  if (sectionCounts.newBooks !== 5) {
    console.error(`FAILED: Expected 5 new books, got ${sectionCounts.newBooks}`);
    allPassed = false;
  }
  if (sectionCounts.bestsellerBooks !== 5) {
    console.error(`FAILED: Expected 5 bestseller books, got ${sectionCounts.bestsellerBooks}`);
    allPassed = false;
  }
  if (sectionCounts.agendaCards !== 4) {
    console.error(`FAILED: Expected 4 agenda cards, got ${sectionCounts.agendaCards}`);
    allPassed = false;
  }

  // 4. Hero Carousel Interaction Test
  console.log('\n--- Testing Hero Carousel ---');
  const initialActiveDot = await page.locator('#carousel-dot-0').getAttribute('aria-selected');
  console.log(`Initial slide dot 0 selected: ${initialActiveDot}`);

  await page.click('#carousel-next');
  await page.waitForTimeout(400);
  const nextActiveDot = await page.locator('#carousel-dot-1').getAttribute('aria-selected');
  console.log(`After next click, dot 1 selected: ${nextActiveDot}`);
  if (nextActiveDot !== 'true') {
    console.error('FAILED: Carousel did not advance to slide 1');
    allPassed = false;
  }

  await page.click('#carousel-dot-2');
  await page.waitForTimeout(400);
  const dot2Selected = await page.locator('#carousel-dot-2').getAttribute('aria-selected');
  console.log(`After clicking dot 2, dot 2 selected: ${dot2Selected}`);
  if (dot2Selected !== 'true') {
    console.error('FAILED: Clicking dot 2 did not activate slide 2');
    allPassed = false;
  }

  // 5. Add to Cart Interaction Test
  console.log('\n--- Testing Add to Cart ---');
  const cartBadge = page.locator('#cart-badge');
  const initialCartCount = parseInt(await cartBadge.textContent(), 10);
  console.log(`Initial cart count: ${initialCartCount}`);

  const firstCartBtn = page.locator('.btn-add-to-cart').first();
  await firstCartBtn.click();
  await page.waitForTimeout(300);

  const updatedCartCount = parseInt(await cartBadge.textContent(), 10);
  console.log(`Updated cart count: ${updatedCartCount}`);
  if (updatedCartCount !== initialCartCount + 1) {
    console.error(`FAILED: Cart count did not increment. Expected ${initialCartCount + 1}, got ${updatedCartCount}`);
    allPassed = false;
  }

  const isToastVisible = await page.isVisible('#toast');
  const toastText = await page.textContent('#toast-message');
  console.log(`Toast visible? ${isToastVisible}, message: "${toastText}"`);
  if (!isToastVisible || !toastText.includes('berhasil ditambahkan ke keranjang')) {
    console.error('FAILED: Add to cart toast did not show correctly');
    allPassed = false;
  }

  // 6. Agenda Horizontal Scroll Test
  console.log('\n--- Testing Agenda Horizontal Scroll ---');
  const scrollContainer = page.locator('#agenda-scroll-container');
  const initialScrollLeft = await scrollContainer.evaluate(el => el.scrollLeft);
  await page.click('#agenda-scroll-next');
  await page.waitForTimeout(500);
  const scrolledLeft = await scrollContainer.evaluate(el => el.scrollLeft);
  console.log(`Agenda scrollLeft before: ${initialScrollLeft}, after next: ${scrolledLeft}`);

  // 7. Console Errors Check
  console.log(`\nTotal Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
    allPassed = false;
  }

  await browser.close();

  if (allPassed) {
    console.log('\n>>> ALL HOMEPAGE ACCEPTANCE CRITERIA PASSED! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> SOME HOMEPAGE CRITERIA FAILED! <<<');
    process.exit(1);
  }
}

testHomepage().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
