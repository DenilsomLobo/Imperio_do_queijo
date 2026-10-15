import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {waitForGame} from './qa-entry-helper.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date());
 await page.goto(process.env.QA_URL??'http://127.0.0.1:5174/');await waitForGame(page);
 await page.evaluate(async()=>{const {load,save}=await import('/src/persistence/local.js');const s=await load();s.companies.player.cash=100000000;await save(s);});await page.reload();await waitForGame(page);
 const open=async id=>{await page.locator('[data-manage="properties"]').click();await page.locator(`#management-content [data-property="${id}"]`).click();};
 const state=()=>page.evaluate(async()=> (await import('/src/persistence/local.js')).load());
 await open('farm-ze');let before=await state();
 await page.locator('#feed-quantity').fill('1000');assert.match(await page.locator('#feed-quote').innerText(),/250,00/);
 await page.locator('[data-action="buyFeed"]').click();await page.waitForTimeout(400);
 let after=await state();assert.equal(after.properties['farm-ze'].feed,before.properties['farm-ze'].feed+1000);assert.equal(after.companies.player.cash,before.companies.player.cash-25000);assert.equal(await page.locator('#feed-quantity').inputValue(),'1000');
 await page.locator('#feed-quantity').fill('1001');assert.equal(await page.locator('[data-action="buyFeed"]').isDisabled(),true);
 await page.locator('#close-property').click();await open('factory-ze');before=await state();
 await page.locator('#packaging-quantity').fill('1000');await page.locator('[data-action="buyPackaging"]').click();await page.waitForTimeout(400);after=await state();assert.equal(after.properties['factory-ze'].packaging,before.properties['factory-ze'].packaging+1000);assert.equal(after.companies.player.cash,before.companies.player.cash-250000);assert.equal(await page.locator('#packaging-quantity').inputValue(),'1000');
 await page.reload();await waitForGame(page);after=await state();assert.ok(after.properties['factory-ze'].packaging>=1000);
 await page.locator('[data-manage="cash"]').click();assert.equal(await page.locator('#management-title').innerText(),'Finanças');assert.equal(await page.locator('.finance-management').count(),1);assert.ok(!(await page.locator('#management-content').innerText()).includes('NaN'));await page.screenshot({path:'docs/qa-finances.png'});
 await page.locator('#management-dialog [data-close]').click();await page.locator('[data-manage="enemies"]').click();assert.ok(await page.locator('#management-content [data-property="sale-e1"]').count());assert.equal(await page.locator('#management-content [data-property="farm-ze"]').count(),0);assert.equal(await page.locator('#management-content progress').first().getAttribute('max'),'24');await page.screenshot({path:'docs/qa-enemies-dominance.png'});
 await page.locator('#management-dialog [data-close]').click();await page.setViewportSize({width:390,height:844});await page.locator('[data-manage="cash"]').click();assert.equal(await page.locator('#management-content').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await page.screenshot({path:'docs/qa-finances-mobile.png'});assert.deepEqual(errors,[]);
 console.log('Compras de 1000, débito, quantidade preservada, validação, reload, Finanças, inimigos, 24 objetivos e mobile aprovados.');
}finally{await browser.close();}
