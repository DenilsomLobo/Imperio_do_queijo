import {chromium} from 'playwright-core';
import {waitForGame} from './qa-entry-helper.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date());
 await page.goto(process.env.QA_URL ?? 'http://127.0.0.1:5174/');await waitForGame(page);
 await page.evaluate(async()=>{
  const {createGame,command,advance}=await import('/src/domain/game.js');const {load,save}=await import('/src/persistence/local.js');
  let s=createGame();s.playerProfile=(await load()).playerProfile;
  s.companies.player.cash=100000000;
  for(const c of [{type:'buyProperty',id:'sale-n4'},{type:'hireSeller',id:'sale-n4'},{type:'hireWorker',id:'factory-ze',level:1},{type:'buyCow',id:'farm-ze',species:'common'},{type:'hireTeam',id:'sale-ze-control',level:1}])s=command(s,c);
  s.properties['farm-ze'].milk={weak:3,common:2};s.properties['factory-ze'].milk={weak:3,common:1};s.properties['factory-ze'].packaging=17;s.properties['factory-ze'].ready={'weak:weak':4};
  for(const recipe of ['weak','common'])s=command(s,{type:'produce',id:'factory-ze',recipe,quality:recipe});
  s.companies.player.shopStock={'common:common':2};s.companies.coalho.cash=1000000;
  s=advance(s,1000);await save(s);
 });
 await page.reload();await waitForGame(page);
 async function menu(id){await page.locator(`[data-manage="${id}"]`).click();}
 async function close(){await page.locator('#management-dialog [data-close]').click();}
 await menu('properties');assert.equal(await page.locator('.building-card').count(),4);assert.equal(await page.locator('.building-card[data-property="factory-coalho"]').count(),0);assert.equal(await page.locator('.building-card[data-property="farm-level-2"]').count(),0);await close();
 await menu('employees');assert.equal(await page.locator('[data-resource-kind="worker"]').count(),1);assert.equal(await page.locator('[data-resource-kind="seller"]').count(),2);assert.equal(await page.locator('[data-resource-kind="guard"]').count(),1);
 await page.waitForFunction(()=>[...document.querySelectorAll('.owned-resource-card img')].every(n=>n.complete&&n.naturalWidth>0));await page.screenshot({path:'docs/qa-owned-employees.png'});
 await page.locator('[data-resource-kind="worker"]').click();assert.ok((await page.locator('#title').innerText()).includes('Queijaria'));await page.locator('#close-property').click();
 await menu('cows');assert.equal(await page.locator('[data-resource-kind="cow"]').count(),2);assert.ok((await page.locator('#management-content').innerText()).includes('Ração opcional'));await page.screenshot({path:'docs/qa-owned-cows.png'});await page.locator('[data-resource-kind="cow"]').first().click();assert.ok((await page.locator('#title').innerText()).includes('Fazenda'));
 await menu('milk');const stock=await page.locator('#management-content').innerText();for(const label of ['Leite Fraco','Leite Comum','Queijo Fraco','Queijo Comum'])assert.ok(stock.includes(label));assert.ok(!stock.includes('R$'));await close();
 await menu('cheese');assert.equal(await page.locator('[data-resource-kind="production"]').count(),2);assert.ok((await page.locator('[data-resource-kind="production"]').first().innerText()).includes('27,78'));await page.screenshot({path:'docs/qa-owned-production.png'});await page.locator('[data-resource-kind="production"]').first().click();assert.ok((await page.locator('#title').innerText()).includes('Queijaria'));
 await menu('revenue');assert.equal(await page.locator('#management-title').innerText(),'Pontos de venda');assert.equal(await page.locator('[data-resource-kind="shop"]').count(),2);const shops=await page.locator('#management-content').innerText();assert.ok(shops.includes('15,00/dia'));assert.ok(shops.includes('10,00/dia'));assert.ok(shops.includes('Sem capangas'));await page.screenshot({path:'docs/qa-owned-shops.png'});await close();
 await page.locator('[data-manage="enemies"]').click();await page.locator('#management-content [data-resource-kind="shop"][data-property="sale-e1"]').click();await page.locator('[data-action="control"]').click();
 assert.equal(await page.locator('.combat-team-art').evaluate(n=>n.getAttribute('src').includes('capangas_inimigos_nivel_1')),true);await page.screenshot({path:'docs/qa-enemy-hired-guards.png'});
 await page.locator('#close-property').click();await page.setViewportSize({width:390,height:844});await menu('employees');assert.equal(await page.locator('#management-content').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await page.screenshot({path:'docs/qa-owned-mobile.png'});
 assert.deepEqual(errors,[]);console.log('Propriedades próprias, cartões adquiridos/alocação, inventário sem preços, produção com valor/fábrica, pontos de venda/manutenção, IA com capangas e mobile passaram.');
}finally{await browser.close();}
