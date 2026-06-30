const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/kol', { waitUntil: 'networkidle2' });
  
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:", bodyText.substring(0, 500));
  
  await browser.close();
})();
