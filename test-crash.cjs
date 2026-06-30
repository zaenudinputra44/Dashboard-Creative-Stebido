const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  try {
    await page.goto('https://dashboard-creative-stebido.vercel.app', { waitUntil: 'load', timeout: 15000 });
    console.log("Navigation complete.");
  } catch(e) {
    console.log('Goto error:', e.message);
  }
  
  await browser.close();
  process.exit(0);
})();
