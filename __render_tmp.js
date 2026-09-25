const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  const html = 'file://' + process.argv[2];
  await page.goto(html, {waitUntil:'networkidle0'});
  await page.pdf({path: process.argv[3], format:'A4', printBackground:true, preferCSSPageSize:true});
  await browser.close();
  console.log('PDF written:', process.argv[3]);
})();
