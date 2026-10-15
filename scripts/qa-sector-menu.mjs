import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({...(process.env.QA_BROWSER?{executablePath:process.env.QA_BROWSER}:{channel:'chrome'}),headless:true});
try {
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.QA_URL ?? 'http://127.0.0.1:5173');await page.locator('canvas[data-ready="true"]').waitFor();
 await page.waitForFunction(()=>[...document.querySelectorAll('.sector-art img')].every(img=>img.complete&&img.naturalWidth>0));
 assert.equal(await page.locator('.sector-card').count(),8);
 for(const id of ['properties','employees','milk','cheese','cows','revenue','cash','enemies']) {
  const button=page.locator('[data-manage="'+id+'"]');await button.click();
  assert.equal(await button.getAttribute('aria-expanded'),'true');assert.equal(await page.locator('#management-sector-image').isVisible(),true);
  assert.ok((await page.locator('#management-content').innerText()).length>20);
  await page.locator('[data-close]').click();await page.waitForFunction(()=>document.querySelectorAll('.sector-card[aria-expanded="true"]').length===0);
 }
 await page.locator('[data-manage="properties"]').focus();await page.keyboard.press('ArrowRight');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.manage),'employees');
 await page.keyboard.press('Enter');assert.equal(await page.locator('#management-dialog').isVisible(),true);await page.keyboard.press('Escape');
 await page.screenshot({path:'docs/qa-sector-menu-wide.png'});
 await page.setViewportSize({width:1366,height:768});await page.waitForTimeout(300);
 await page.screenshot({path:'docs/qa-sector-menu-laptop.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight),false);
 await page.setViewportSize({width:900,height:900});
 assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.sector-grid')).gridTemplateColumns.split(' ').length),4);
 await page.screenshot({path:'docs/qa-sector-menu-tablet.png'});
 await page.setViewportSize({width:1366,height:768});
 await page.evaluate(()=>document.querySelector('[data-metric="cash"]').textContent='R$ 1.234.567.890,00');
 assert.equal(await page.locator('[data-metric="cash"]').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
 assert.deepEqual(errors,[]);console.log('QA menu passou: 8 SVGs, painéis reais, estado ativo, teclado, três larguras e valores longos.');
} finally {await browser.close();}
