const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      fs.appendFileSync('browser_errors.txt', 'BROWSER ERROR: ' + msg.text() + '\n');
    }
  });

  page.on('pageerror', error => {
    fs.appendFileSync('browser_errors.txt', 'PAGE ERROR: ' + error.message + '\n');
  });

  try {
    await page.goto('https://dashboard-creative-stebido.vercel.app', { waitUntil: 'domcontentloaded', timeout: 15000 });
    fs.appendFileSync('browser_errors.txt', 'Navigated successfully.\n');
  } catch(e) {
    fs.appendFileSync('browser_errors.txt', 'Goto error: ' + e.message + '\n');
  }
  
  await browser.close();
  process.exit(0);
})();
