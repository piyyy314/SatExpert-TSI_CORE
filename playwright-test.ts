import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[Browser Error] ${error.message}`);
  });

  try {
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(3000);
  } catch (e) {
    console.error(e);
  }

  await browser.close();
})();
