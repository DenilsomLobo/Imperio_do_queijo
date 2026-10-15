import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date());
 await page.goto(process.env.QA_URL ?? 'http://127.0.0.1:5174/');await page.locator('canvas[data-ready="true"]').waitFor();
 await page.evaluate(async()=>{
  const {createGame,command}=await import('/src/domain/game.js');const {save}=await import('/src/persistence/local.js');
  let s=createGame();s.companies.player.cash=2000000;
  s=command(s,{type:'hireTeam',id:'sale-ze-control',level:1});await save(s);
 });
 await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();
 async function openPost(){await page.locator('[data-manage="properties"]').click();await page.locator('.building-card[data-property="sale-ze"]').click();await page.locator('[data-action="control"]').click();}
 await openPost();
 const cards=page.locator('.combat-upgrade-card');assert.equal(await cards.count(),6);
 await page.waitForFunction(()=>[...document.querySelectorAll('.combat-upgrade-card img')].every(n=>n.complete&&n.naturalWidth>0));
 assert.equal(await page.locator('.combat-upgrade-card:enabled').count(),2);
 const values=()=>page.locator('.combat-values strong').allTextContents();assert.deepEqual(await values(),['3','3']);
 await page.locator('.combat-upgrade-cards').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/qa-upgrade-icons-initial.png'});
 const expected=[['3,36','3'],['3,72','3'],['4,08','3'],['4,08','3,45'],['4,08','3,9'],['4,08','4,35']];let index=0;
 for(const action of ['upgradeWeapon','upgradeBarricade'])for(const [i,cost] of [125,1500,3500].entries()){
  const button=page.locator(`[data-action="${action}"][data-upgrade-level="${i+1}"]`);
  assert.equal(await button.isEnabled(),true);assert.ok((await button.innerText()).includes(cost.toLocaleString('pt-BR')+',00'));
  if(i===0){await button.focus();await page.keyboard.press('Enter');}else await button.click();
  assert.deepEqual(await values(),expected[index++]);
  assert.equal(await page.locator(`[data-action="${action}"][data-upgrade-level="${i+1}"]`).isDisabled(),true);
 }
 assert.equal(await page.locator('.combat-upgrade-card:enabled').count(),0);
 assert.equal(await page.locator('.combat-upgrade-card.is-current').count(),2);
 await page.locator('#save').click();
 const s=await page.evaluate(async()=>{const {load}=await import('/src/persistence/local.js');return load();});
 assert.equal(s.companies.player.cash,2000000-12500-2*512500);
 assert.equal(s.properties['sale-ze-control'].team.weapon,3);assert.equal(s.properties['sale-ze-control'].barricade,3);
 await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();await openPost();
 assert.equal(await page.locator('.combat-upgrade-card:enabled').count(),0);assert.deepEqual(await values(),['4,08','4,35']);
 await page.locator('.combat-upgrade-cards').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/qa-upgrade-icons-max.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('.combat-upgrade-cards').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('.combat-upgrade-cards').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
 await page.screenshot({path:'docs/qa-upgrade-icons-mobile.png'});assert.deepEqual(errors,[]);
 console.log('Seis ícones carregados, teclado, compras sequenciais, custos reais, bônus independentes, limite, reload e mobile passaram em contexto isolado.');
}finally{await browser.close();}
