const puppeteer = require('puppeteer');

async function main() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  const url = 'https://fee-collection-app.vercel.app/magic-login';
  console.log("Navigating to " + url);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  console.log("Current URL:", page.url());
  await page.screenshot({ path: 'magic-screenshot.png' });
  
  // wait 3 seconds to see if it redirects
  await new Promise(r => setTimeout(r, 3000));
  console.log("After 3s URL:", page.url());
  await page.screenshot({ path: 'magic-screenshot-after.png' });
  
  await browser.close();
}

main().catch(console.error);
