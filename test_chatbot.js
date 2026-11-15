import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testChatbot() {
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

  const fullPath = path.resolve(__dirname, 'docs/design/prototype-copy/user/chatbot_bantuan_rekomendasi_desktop.html');
  const fileUrl = `file://${fullPath.replace(/\\/g, '/')}`;

  console.log(`Loading chatbot page: ${fileUrl}`);

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

  // Set to 1440px Desktop for detailed component checks
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

  console.log(`[Images] Total: ${imageStats.total}, Broken: ${imageStats.broken.length}`);
  if (imageStats.broken.length > 0) {
    console.error('FAILED: Broken images on page:', imageStats.broken);
    allPassed = false;
  }

  // 3. Welcome Initial State Verification (0 chat bubbles initially)
  console.log('\n--- Testing Welcome Initial State ---');
  const isWidgetVisible = await page.isVisible('#ikapi-chat-window');
  console.log(`Chat widget visible by default? ${isWidgetVisible}`);
  if (!isWidgetVisible) {
    console.error('FAILED: Chat widget should be visible initially');
    allPassed = false;
  }

  // Verify ZERO chat bubbles initially
  const initialBubbleCount = await page.locator('#chat-body-scrollable .ikapi-user-message').count();
  console.log(`Initial user bubble count: ${initialBubbleCount}`);
  if (initialBubbleCount !== 0) {
    console.error(`FAILED: Expected 0 user bubbles initially, got ${initialBubbleCount}`);
    allPassed = false;
  }

  const welcomeText = await page.textContent('#chat-body-scrollable');
  console.log(`Welcome text contains "Ada yang bisa dibantu?"? ${welcomeText.includes('Ada yang bisa dibantu?')}`);
  if (!welcomeText.includes('Ada yang bisa dibantu?')) {
    console.error('FAILED: Initial welcome screen not displayed');
    allPassed = false;
  }

  // 4. User Message Bubble & Z.ai Corner Radius Verification
  console.log('\n--- Testing User Message & Z.ai Sharp Corner ---');
  const inputField = page.locator('#chat-input-field');
  await inputField.fill('halo min mau tanya');
  await page.click('#chat-send-btn');
  await page.waitForTimeout(300);

  const userBubble = page.locator('.ikapi-user-message').last();
  const userBubbleText = await userBubble.textContent();
  console.log(`User bubble sent text: "${userBubbleText.trim()}"`);

  const userBubbleRadius = await userBubble.evaluate(el => {
    const cs = window.getComputedStyle(el);
    return {
      topLeft: cs.borderTopLeftRadius,
      topRight: cs.borderTopRightRadius,
      bottomRight: cs.borderBottomRightRadius,
      bottomLeft: cs.borderBottomLeftRadius
    };
  });
  console.log('User bubble border radii:', userBubbleRadius);

  // Bottom right should be 4px (sharp) while others are 18px!
  if (userBubbleRadius.bottomRight !== '4px' || userBubbleRadius.topLeft !== '18px') {
    console.error(`FAILED: Expected sharp bottom right (4px) and rounded top left (18px), got:`, userBubbleRadius);
    allPassed = false;
  } else {
    console.log('>>> PASSED: User bubble corner is sharp on bottom right (4px) and rounded elsewhere (18px)!');
  }

  // 5. Quick Prompts & Book Recommendation Test
  console.log('\n--- Testing Quick Prompt (Recommendation) ---');
  await page.click('button:has-text("Cari buku sejarah Sunda")');
  await page.waitForTimeout(400);

  const recommendationVisible = await page.isVisible('h4:has-text("Laskar Aksara Pasundan")');
  console.log(`Book recommendation card displayed? ${recommendationVisible}`);
  if (!recommendationVisible) {
    console.error('FAILED: Book recommendation card not displayed');
    allPassed = false;
  }

  // 6. Copy Action Test
  console.log('\n--- Testing Copy Action ---');
  const copyBtn = page.locator('button:has-text("Salin")').last();
  if (await copyBtn.count() > 0) {
    await copyBtn.click();
    await page.waitForTimeout(300);
    const toastMsg = await page.textContent('#toastMessage');
    console.log(`Toast message after copy: "${toastMsg}"`);
    if (!toastMsg.includes('Pesan berhasil disalin') && !toastMsg.includes('Teks siap disalin')) {
      console.error('FAILED: Copy toast not displayed properly');
      allPassed = false;
    }
  }

  // 7. Scenarios Test (Reviewer Simulator)
  console.log('\n--- Testing Reviewer Scenarios ---');
  // Open details simulator panel
  await page.click('#qa-simulation-panel summary');
  await page.waitForTimeout(200);

  // Scenario: Pembayaran
  await page.click('#btn-state-pembayaran');
  await page.waitForTimeout(300);
  const paymentContent = await page.textContent('#chat-body-scrollable');
  if (!paymentContent.includes('Cara Membeli & Membayar E-Book')) {
    console.error('FAILED: Payment guidance scenario failed');
    allPassed = false;
  }

  // Scenario: Eskalasi
  await page.click('#btn-state-eskalasi');
  await page.waitForTimeout(300);
  const escalationContent = await page.textContent('#chat-body-scrollable');
  if (!escalationContent.includes('sekretariat@ikapi-jabar.id')) {
    console.error('FAILED: Escalation scenario failed');
    allPassed = false;
  }

  // Scenario: Loading
  await page.click('#btn-state-loading');
  await page.waitForTimeout(300);
  const loadingContent = await page.textContent('#chat-body-scrollable');
  if (!loadingContent.includes('Menyiapkan jawaban...')) {
    console.error('FAILED: Loading scenario failed');
    allPassed = false;
  }

  // 8. Toggle Widget Panel Test
  console.log('\n--- Testing Toggle Widget ---');
  await page.click('button[aria-label="Tutup Jendela Bantuan"]');
  await page.waitForTimeout(300);
  const isWidgetClosed = !(await page.isVisible('#ikapi-chat-window'));
  console.log(`Widget closed via close button? ${isWidgetClosed}`);
  if (!isWidgetClosed) {
    console.error('FAILED: Widget did not close');
    allPassed = false;
  }

  // Re-open via launcher
  await page.click('#launcher-button');
  await page.waitForTimeout(300);
  const isWidgetReopened = await page.isVisible('#ikapi-chat-window');
  console.log(`Widget re-opened via launcher? ${isWidgetReopened}`);
  if (!isWidgetReopened) {
    console.error('FAILED: Widget did not re-open');
    allPassed = false;
  }

  // Reset conversation to 0 bubbles
  await page.click('button[aria-label="Bersihkan Percakapan"]');
  await page.waitForTimeout(300);
  const resetContent = await page.textContent('#chat-body-scrollable');
  const resetBubbleCount = await page.locator('#chat-body-scrollable .ikapi-user-message').count();
  if (!resetContent.includes('Ada yang bisa dibantu?') || resetBubbleCount !== 0) {
    console.error('FAILED: Conversation reset failed to restore clean initial zero-bubble state');
    allPassed = false;
  }

  // 9. Console Errors Check
  console.log(`\nTotal Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
    allPassed = false;
  }

  await browser.close();

  if (allPassed) {
    console.log('\n>>> ALL CHATBOT ACCEPTANCE CRITERIA PASSED! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> SOME CHATBOT CRITERIA FAILED! <<<');
    process.exit(1);
  }
}

testChatbot().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
