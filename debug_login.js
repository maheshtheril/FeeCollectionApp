const puppeteer = require('puppeteer');

async function main() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const url = 'https://fee-collection-app.vercel.app/signin';
  console.log("Navigating to " + url);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  console.log("Typing credentials...");
  await page.type('input[name="email"]', 'test1@gmail.com');
  await page.type('input[name="password"]', 'master123');
  
  console.log("Submitting form...");
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  
  const currentUrl = page.url();
  console.log("Current URL:", currentUrl);
  
  if (currentUrl.includes('/signin')) {
    console.log("Login failed! Taking screenshot...");
    await page.screenshot({ path: 'login-failed.png' });
  } else {
    console.log("Login succeeded! Taking screenshot...");
    await page.screenshot({ path: 'login-success.png' });
  }
  
  await browser.close();
}

main().catch(console.error);
