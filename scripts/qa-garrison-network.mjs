import {chromium} from 'playwright-core';
import {waitForGame} from './qa-entry-helper.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date());
 await page.goto(process.env.QA_URL ?? 'http://127.0.0.1:5174/');await waitForGame(page);
 await page.evaluate(async()=>{const {createGame,command}=await import('/src/domain/game.js');const {load,save}=await import('/src/persistence/local.js');let s=createGame();s.playerProfile=(await load()).playerProfile;s=command(s,{type:'buyProperty',id:'sale-n4'});s=command(s,{type:'hireTeam',id:'sale-ze-control',level:1});await save(s);});
 await page.reload();await waitForGame(page);
 async function post(id){await page.locator('[data-manage="properties"]').click();await page.locator(`.building-card[data-property="${id}"]`).click();await page.locator('[data-action="control"]').click();}
 const values=()=>page.locator('.combat-values strong').allTextContents();
 await post('sale-ze');assert.deepEqual(await values(),['3,15','3,15']);assert.ok((await page.locator('.garrison-network').innerText()).includes('+5%'));
 await post('sale-n4');await page.locator('[data-action="hireTeam"]').click();await page.locator('[data-action="hireAtPost"]').click();
 await post('sale-ze');assert.deepEqual(await values(),['3,3','3,3']);assert.ok((await page.locator('.garrison-network').innerText()).includes('+10%'));
 await page.locator('.garrison-network').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/qa-garrison-network.png'});
 await post('sale-n4');assert.deepEqual(await values(),['3,3','3,3']);
 await page.locator('#save').click();await page.reload();await waitForGame(page);await post('sale-ze');assert.deepEqual(await values(),['3,3','3,3']);
 assert.deepEqual(errors,[]);console.log('Bônus coletivo 5→10%, contratação real na segunda loja, forças em ambos os postos e persistência passaram em contexto isolado.');
}finally{await browser.close();}
