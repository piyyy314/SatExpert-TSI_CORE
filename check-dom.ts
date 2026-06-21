import fs from 'fs';
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[PAGE ERROR]: ${err.message}\n${err.stack}`);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log("Navigated to root.");
    
    const html = await page.content();
    if(html.includes("React Render Error") || html.includes("Uncaught Runtime Error")) {
       console.log("React Crash found in HTML");
       console.log(html);
    }
  } catch (e) {
    console.log(`Exception: ${e}`);
  }

  await browser.close();
})();




