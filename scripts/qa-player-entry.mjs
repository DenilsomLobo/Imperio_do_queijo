import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date());
 await page.goto(process.env.QA_URL ?? 'http://127.0.0.1:5174/');await page.locator('#entry-form').waitFor();
 assert.equal(await page.locator('canvas').count(),0);
 await page.screenshot({path:'docs/qa-player-entry.png'});
 await page.locator('#player-name').fill('a');await page.locator('#entry-form button').click();assert.equal(await page.locator('canvas').count(),0);
 async function enter(name){await page.locator('#player-name').fill(name);await page.locator('#entry-form button').click();await page.locator('canvas[data-ready="true"]').waitFor();}
 await enter('Jogador QA');
 assert.equal(await page.locator('#player-label').innerText(),'Jogador QA');
 assert.equal(await page.locator('.avatar-placeholder').evaluate(e=>getComputedStyle(e).visibility),'hidden');
 await page.waitForFunction(()=>[...document.querySelectorAll('header img,.sector-art img')].every(n=>n.complete&&n.naturalWidth>0));
 assert.equal(await page.locator('header img').count(),4);
 const initial=await page.evaluate(async()=>{const {load}=await import('/src/persistence/local.js');return load();});assert.equal(initial.companies.player.cash,10000000000);
 assert.equal(await page.locator('[data-metric="cash"]').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
 await page.locator('#ranking').click();await page.locator('#ranking-refresh:enabled').waitFor();
 assert.ok((await page.locator('#ranking-source').innerText()).includes('local'));assert.equal(await page.locator('#ranking-list li').count(),1);assert.ok((await page.locator('#ranking-list').innerText()).includes('100.000.000,00'));
 await page.locator('#ranking-dialog [data-close]').click();await page.screenshot({path:'docs/qa-player-header.png'});
 await page.locator('#reset-campaign').click();await page.locator('#reset-campaign-dialog [data-cancel]').click();
 await page.locator('#home-logo').click();await page.locator('#entry-form').waitFor();await enter('Outra pessoa');
 const second=await page.evaluate(async()=>{const {load}=await import('/src/persistence/local.js');return load();});assert.notEqual(second.playerProfile.id,initial.playerProfile.id);assert.notEqual(second.campaignId,initial.campaignId);
 await page.locator('#home-logo').click();await page.locator('#entry-form').waitFor();
 await page.locator('#saved-profiles button').filter({hasText:'Jogador QA'}).click();await page.locator('#entry-form button').click();await page.locator('canvas[data-ready="true"]').waitFor();
 const resumed=await page.evaluate(async()=>{const {load}=await import('/src/persistence/local.js');return load();});assert.equal(resumed.campaignId,initial.campaignId);
 // Isolated fixtures exercise ordering, limit and current cash rather than peak/revenue.
 await page.evaluate(async()=>{const {enterProfile,save}=await import('/src/persistence/local.js');const {createGame}=await import('/src/domain/game.js');for(let i=0;i<12;i++){const profile=await enterProfile('Ranking QA '+i);const s=createGame(1000+i);s.playerProfile=profile;s.companies.player.cash=i*10000;s.companies.player.revenue=(12-i)*100000;await save(s);}});
 await page.locator('#ranking').click();await page.locator('#ranking-refresh:enabled').waitFor();assert.equal(await page.locator('#ranking-list li').count(),10);
 const scores=await page.locator('#ranking-list li span').allTextContents();assert.ok(scores[0].includes('100.000.000,00'));assert.ok(scores[2].includes('1.100,00'));assert.ok(scores.at(-1).includes('400,00'));
 await page.screenshot({path:'docs/qa-ranking-top10.png'});
 await page.locator('#ranking-dialog [data-close]').click();await page.setViewportSize({width:390,height:844});
 assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth+1),true);
 assert.equal(await page.locator('#ranking').isVisible(),true);await page.screenshot({path:'docs/qa-player-header-mobile.png'});
 await page.locator('#home-logo').click();await page.locator('#entry-form').waitFor();await page.screenshot({path:'docs/qa-player-entry-mobile.png'});
 assert.deepEqual(errors,[]);console.log('Entrada, nomes, 100 milhões em campanha nova, perfis separados, continuidade, logo/home, PNGs, ranking local ordenado/top10 e mobile passaram.');
}finally{await browser.close();}
