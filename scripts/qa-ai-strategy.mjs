import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {waitForGame} from './qa-entry-helper.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date());
 await page.goto(process.env.QA_URL??'http://127.0.0.1:5174/');await waitForGame(page);
 const audit=await page.evaluate(async()=>{
  const {createGame,advance}=await import('/src/domain/game.js');const {save,load}=await import('/src/persistence/local.js');
  const original=await load();let s=createGame();s.playerProfile=original.playerProfile;
  const initial={player:s.companies.player.cash,rival:s.companies.coalho.cash};s=advance(s,5000);await save(s);
  const long=advance(createGame(),30*60000,{rng:()=>0.99});
  return {initial,strategy:s.companies.coalho.strategy,longRun:{cash:long.companies.coalho.cash,herd:long.properties['farm-coalho'].cows,shops:Object.values(long.properties).filter(p=>p.type==='sale'&&p.owner==='coalho').length,focus:long.companies.coalho.strategy.focus,blocked:long.companies.coalho.strategy.blocked}};
 });
 assert.deepEqual(audit.initial,{player:50000,rival:100000});assert.ok(audit.strategy.actions>0);assert.ok(audit.longRun.cash>0);assert.ok(Object.values(audit.longRun.herd).reduce((n,v)=>n+v,0)>1);
 await page.reload();await waitForGame(page);assert.equal(await page.locator('.dominance-bars').count(),0);
 await page.locator('[data-manage="enemies"]').click();assert.equal(await page.locator('.enemy-strategy').count(),1);
 assert.ok((await page.locator('.enemy-strategy').innerText()).includes('Reserva operacional'));
 assert.equal(await page.locator('#management-content progress').count(),2);
 await page.screenshot({path:'docs/qa-ai-strategy.png'});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#management-content').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await page.screenshot({path:'docs/qa-ai-strategy-mobile.png'});
 assert.deepEqual(errors,[]);console.log(JSON.stringify(audit));console.log('IA: decisão real, save/reload, projeção no menu, barras apenas em Inimigos, mobile e 30 dias sem caixa negativo aprovados.');
}finally{await browser.close();}
