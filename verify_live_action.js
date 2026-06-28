const puppeteer = require('puppeteer');

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Intercept network requests
  await page.setRequestInterception(true);
  page.on('request', request => {
    request.continue();
  });
  page.on('response', response => {
    if (response.status() === 404) {
      console.log(`404 ERROR ON: ${response.url()}`);
    }
  });

  console.log("Navigating to signin...");
  await page.goto('https://fee-collection-app.vercel.app/signin', { waitUntil: 'networkidle0' });
  
  console.log("Typing credentials...");
  await page.type('input[name="email"]', 'test1@gmail.com');
  await page.type('input[name="password"]', 'password123');
  
  console.log("Submitting...");
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(e => console.log("Navigation timeout"))
  ]);
  
  console.log("Current URL:", page.url());
  await page.screenshot({ path: 'live-test-after-action.png' });
  
  await browser.close();
}
main().catch(console.error);
