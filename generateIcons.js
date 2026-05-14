const puppeteer = require('puppeteer-core');
const path = require('path');
const os = require('os');
const fs = require('fs');

async function run() {
  const browserPaths = {
    win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  };
  
  const executablePath = browserPaths[os.platform()];
  
  const browser = await puppeteer.launch({ executablePath });
  const page = await browser.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>body { margin: 0; background: transparent; }</style></head>
    <body>
      <div id="icon" style="width: 1024px; height: 1024px; display: flex; align-items: center; justify-content: center; background: #6366f1;">
        <svg xmlns="http://schemas.w3.org/2000/svg" width="800" height="800" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M12,3L1,9l11,6l9,-4.91V17h2V9L12,3zM18.82,11L12,14.72L5.18,11L12,7.28L18.82,11zM7,14.15V18c0,1.1 2.24,2 5,2s5,-0.9 5,-2v-3.85l-5,2.73L7,14.15z"/>
        </svg>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  
  const icon = await page.$('#icon');
  
  await icon.screenshot({ path: path.join(__dirname, 'assets', 'icon.png') });
  await icon.screenshot({ path: path.join(__dirname, 'assets', 'adaptive-icon.png') });
  
  await page.setViewport({ width: 192, height: 192 });
  const htmlSmall = html.replace('1024px', '192px').replace('1024px', '192px').replace('800', '150').replace('800', '150');
  await page.setContent(htmlSmall);
  const iconSmall = await page.$('#icon');
  await iconSmall.screenshot({ path: path.join(__dirname, 'assets', 'favicon.png') });

  await browser.close();
  console.log('Done rendering PNGs with puppeteer!');
}

run().catch(console.error);
