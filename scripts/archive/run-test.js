const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  console.log('Navigating to test page...');
  await page.goto('http://localhost:3000/test-xmtp', { timeout: 120000, waitUntil: 'domcontentloaded' });
  
  // Wait up to 60s for the test to complete
  try {
    await page.waitForFunction(
      () => document.body.innerText.includes('TEST COMPLETE') || document.body.innerText.includes('ERROR:'),
      { timeout: 60000 }
    );
  } catch (e) {
    console.log('Test timed out');
  }

  const logs = await page.evaluate(() => document.body.innerText);
  console.log('--- FINAL TEST PAGE TEXT ---');
  console.log(logs);
  console.log('----------------------------');

  await browser.close();
})();
