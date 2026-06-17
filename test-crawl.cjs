const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('PAGE_ERROR:', err.toString());
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE_ERROR:', msg.text());
  });
  
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle2'});
  
  const links = await page.$$eval('a', as => as.map(a => a.href));
  
  for (let url of new Set(links)) {
    if (url.startsWith('http://localhost:5173')) {
      console.log('Visiting', url);
      await page.goto(url, {waitUntil: 'networkidle2'});
    }
  }
  
  await browser.close();
})();
