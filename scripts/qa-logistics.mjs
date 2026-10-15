import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({...(process.env.QA_BROWSER?{executablePath:process.env.QA_BROWSER}:{channel:'chrome'}),headless:true});
try {
 const page=await browser.newPage({viewport:{width:1500,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let now=Date.now();await page.clock.setFixedTime(new Date(now));
 const url=process.env.QA_URL ?? 'http://127.0.0.1:5173';await page.goto(new URL('/map-preview.html',url).href);await page.locator('canvas[data-ready="true"]').waitFor();
 await page.evaluate(async now=>{const {createGame,command}=await import('/src/domain/game.js');const {save}=await import('/src/persistence/local.js');let s=createGame(now);s.companies.player.cash=200000000;s.properties['farm-ze'].milk={weak:3};s.properties['factory-ze'].milk={};s.properties['factory-ze'].ready={};s=command(s,{type:'hireWorker',id:'factory-ze',level:1});await save(s);},now);
 await page.goto(url);await page.locator('canvas[data-ready="true"]').waitFor();
 const save=async()=>{await page.locator('#save').click();await page.getByText('Jogo salvo.',{exact:true}).waitFor();return page.evaluate(async()=>{const {load}=await import('/src/persistence/local.js');return load();});};
 const open=async()=>{await page.locator('[data-manage="cash"]').click();await page.locator('[data-property="transport"]').click();};
 await open();assert.match(await page.locator('#panel').innerText(),/500.000,00/);assert.match(await page.locator('#panel').innerText(),/200,00/);
 await page.waitForFunction(()=>document.querySelector('.farm-portrait')?.naturalWidth>0);
 await page.locator('[data-action="hireLogistics"]').click();
 now+=150000;await page.clock.setFixedTime(new Date(now));await page.waitForTimeout(1200);
 let s=await save();assert.equal(s.companies.player.logistics.milkMoved,3);assert.ok(s.companies.player.logistics.cheeseMoved>=1);assert.ok(s.properties['sale-ze'].sales>=1);assert.ok(s.properties['sale-ze'].till>=2500);
 await page.locator('aside').evaluate(el=>el.scrollTop=0);await page.screenshot({path:'docs/qa-logistics.png'});
 for(const [speed,minutes] of [[2,3],[4,1],[1,5]]) {
  await page.locator('#speed').selectOption(String(speed));const before=(await save()).time;
  now+=minutes*60000;await page.clock.setFixedTime(new Date(now));await page.waitForTimeout(1200);
  const after=await save();assert.equal(after.time-before,300000);assert.match(await page.locator('#speed').getAttribute('title'),new RegExp(minutes+' minutos'));
 }
 await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();await open();assert.match(await page.locator('#panel .logistics-contract').innerText(),/ativo/);
 await page.locator('[data-action="cancelLogistics"]').click();assert.equal((await save()).companies.player.logistics,null);
 await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();assert.equal((await save()).companies.player.logistics,null);
 assert.deepEqual(errors,[]);console.log('QA transportadora passou: contratação, cadeia sem cliques, 5/3/1 minutos por dia, manutenção, cancelamento e reload.');
} finally {await browser.close();}
