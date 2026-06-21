import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR]: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`[PAGE ERROR]: ${err.message}\n${err.stack}`);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Evaluate if any error overlay exists
    const reactError = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root ? root.innerHTML : 'No root';
    });
    console.log("Root Content:");
    console.log(reactError.slice(0, 1000));
    
    const errBox = await page.evaluate(() => {
        return document.getElementById('error-box')?.style.display;
    });
    console.log("Error Box display:", errBox);
  } catch (e) {
    console.log(`Exception: ${e}`);
  }
  await browser.close();
})();
