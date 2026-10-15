import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.QA_BROWSER,headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.QA_URL);await page.locator('canvas[data-ready="true"]').waitFor();
 await page.evaluate(async()=>{const {createGame}=await import('/src/domain/game.js');const {save}=await import('/src/persistence/local.js');const s=createGame();s.properties['sale-ze'].stock={'weak:weak':2,'common:common':3,'radioactive:radioactive':4,'magic:magic':1,'noble:noble':0};s.properties['factory-ze'].ready={};await save(s);});
 await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();await page.locator('[data-manage="cheese"]').click();
 assert.equal(await page.locator('#management-content .cheese-stock-card').count(),4);assert.equal(await page.locator('#management-content [data-cheese="noble:noble"]').count(),0);
 const content=await page.locator('#management-content').innerText();for(const value of ['200,00','400,00','800,00','150,00'])assert.ok(content.includes(value));
 await page.waitForFunction(()=>[...document.querySelectorAll('.cheese-stock-card img')].every(i=>i.complete&&i.naturalWidth>0));await page.screenshot({path:'docs/qa-cheese-stock.png'});
 await page.locator('#management-content [data-property="sale-ze"]').click();assert.equal(await page.locator('#property-stats .cheese-stock-card').count(),4);assert.ok((await page.locator('#property-stats').innerText()).includes('400,00'));await page.screenshot({path:'docs/qa-cheese-shop.png'});
 const rules=await page.evaluate(async()=>(await import('/src/data/game-rules.js')).rules);assert.equal(rules.banks[2].hire,6000000);assert.equal(rules.cows.radioactive.price,1800000);assert.equal(rules.cows.magic.price,3600000);assert.deepEqual(errors,[]);console.log('Ícones, quantidades, preços e totais em estoque/loja, tipos ocultos sem estoque e preços raros passaram.');
}finally{await browser.close();}
