import { chromium } from 'playwright-core';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:3000,height:2000},deviceScaleFactor:1});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${process.env.QA_URL ?? 'http://127.0.0.1:5173/'}map-preview.html`);
 await page.locator('canvas[data-ready="true"]').waitFor();
 await page.locator('canvas').screenshot({path:'docs/rural-map-complete.png'});
 if(errors.length) throw Error(errors.join('\n'));
 console.log('Mapa completo exportado: docs/rural-map-complete.png');
} finally {await browser.close();}
