import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({...(process.env.QA_BROWSER?{executablePath:process.env.QA_BROWSER}:{channel:'chrome'}),headless:true});
try {
 const context=await browser.newContext({viewport:{width:1366,height:768}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const now=Date.now();await page.clock.setFixedTime(new Date(now));
 await page.goto(process.env.QA_URL ?? 'http://127.0.0.1:5173');
 await page.locator('canvas[data-ready="true"]').waitFor();
 await page.evaluate(async now=>{
  const {createGame}=await import('/src/domain/game.js');const {save}=await import('/src/persistence/local.js');
  const s=createGame(now);s.campaignId='reset-test-existing';s.companies.player.cash=123456;s.speed=4;
  s.properties['farm-ze'].feed=80;s.properties['farm-ze'].cows.weak=2;s.properties['farm-ze'].cowAges.weak=[0,0];
  await save(s);
  await new Promise((resolve,reject)=>{const r=indexedDB.open('imperio-do-queijo',1);r.onsuccess=()=>{const tx=r.result.transaction('campaigns','readwrite');tx.objectStore('campaigns').put({keep:true},'other-data');tx.oncomplete=resolve;tx.onerror=reject;};});
 },now);
 await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();
 const saved=()=>page.evaluate(async()=>{const {load}=await import('/src/persistence/local.js');return load();});
 const before=await saved();
 assert.equal(await page.locator('header #save + #reset-campaign').count(),1);
 await page.locator('#reset-campaign').click();
 assert.equal(await page.locator('#reset-confirmation').count(),0);
 await page.locator('#reset-campaign-dialog [data-cancel]').click();
 assert.deepEqual(await saved(),before);
 await page.locator('#reset-campaign').click();await page.locator('#reset-continue').click();
 for(const word of ['', 'sair', 'SAIR ', 'SAIR!']) {
  await page.locator('#reset-confirmation').fill(word);assert.equal(await page.locator('#reset-ok').isDisabled(),true);
 }
 await page.locator('#reset-confirmation').fill('SAIR');assert.equal(await page.locator('#reset-ok').isEnabled(),true);
 await page.locator('#reset-confirmation').press('Enter');assert.deepEqual(await saved(),before);
 await page.keyboard.press('Escape');assert.equal(await page.locator('#reset-campaign-dialog').isVisible(),false);
 assert.deepEqual(await saved(),before);
 await page.locator('#save').click();await page.getByText('Jogo salvo.',{exact:true}).waitFor();
 await page.locator('#reset-campaign').click();await page.locator('#reset-continue').click();
 assert.equal(await page.locator('#reset-confirmation').inputValue(),'');
 await page.locator('#reset-confirmation').fill('SAIR');
 await page.evaluate(()=>{window.originalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(key==='current')throw new DOMException('Falha de gravação simulada','QuotaExceededError');return window.originalPut.call(this,value,key);};});
 await page.locator('#reset-ok').click();await page.getByText(/Não foi possível resetar/).waitFor();
 assert.deepEqual(await saved(),before);
 assert.equal(await page.locator('[data-metric="cows"]').innerText(),'2');
 await page.screenshot({path:'docs/qa-reset-protected.png'});
 await page.evaluate(()=>{IDBObjectStore.prototype.put=window.originalPut;delete window.originalPut;});
 await page.locator('#reset-ok').click();await page.getByText('Nova campanha iniciada. Progresso anterior apagado.',{exact:true}).waitFor();
 assert.equal(await page.locator('#reset-campaign-dialog').isVisible(),false);
 const fresh=await saved();
 assert.notEqual(fresh.campaignId,before.campaignId);assert.equal(fresh.time,0);assert.equal(fresh.speed,1);
 assert.equal(fresh.companies.player.cash,150000);assert.equal(fresh.properties['farm-ze'].feed,0);assert.equal(fresh.properties['farm-ze'].cows.weak,1);
 assert.equal(fresh.resetRevision,before.resetRevision);
 const other=await page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('imperio-do-queijo',1);r.onsuccess=()=>{const q=r.result.transaction('campaigns').objectStore('campaigns').get('other-data');q.onsuccess=()=>resolve(q.result);};}));
 assert.deepEqual(other,{keep:true});
 await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();assert.deepEqual(await saved(),fresh);
 assert.deepEqual(errors,[]);console.log('QA reset passou: duas etapas, SAIR exato + clique, cancelar/Escape, falha preserva save, reset persiste e outros dados permanecem.');
} finally {await browser.close();}
