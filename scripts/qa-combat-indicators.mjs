import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1900,height:1080}}), errors=[];
 let time=Date.now(); await page.clock.setFixedTime(new Date(time));
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.QA_URL??'http://127.0.0.1:5173/');
 await page.locator('canvas[data-ready="true"]').waitFor();
 await page.evaluate(async()=>{
  const {createGame,command}=await import('/src/domain/game.js');
  const {save}=await import('/src/persistence/local.js');
  let s=createGame();s.rng=1;
  s=command(s,{type:'buyProperty',id:'sale-n6'});
  s=command(s,{type:'hireTeam',id:'sale-n6-control'});
  s=command(s,{type:'attack',id:'sale-n6-control',target:'sale-e1-control'});
  await save(s);
 });
 await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();
 await page.screenshot({path:'docs/qa-combat-active.png'});
 time+=61000;await page.clock.setFixedTime(new Date(time));await page.waitForTimeout(1300);
 await page.locator('#save').click();await page.waitForTimeout(200);
 const result=await page.evaluate(async()=>{
  const {load}=await import('/src/persistence/local.js');
  const {combatIcons,shopAsset}=await import('/src/map/presentation.js');
  const s=await load();
  return {icons:combatIcons(s,'sale-e1-control'),missions:s.missions.length,
   owner:s.properties['sale-e1'].owner,postOwner:s.properties['sale-e1-control'].owner,
   asset:shopAsset({},s.properties['sale-e1'])};
 });
 assert.deepEqual(result,{icons:[],missions:0,owner:'neutral',postOwner:'neutral',asset:'Ponto_de_venda_neutro.png'});
 assert.deepEqual(errors,[]);
 await page.screenshot({path:'docs/qa-combat-resolved.png'});
 console.log('QA combate: missão, neutralização sincronizada, arte neutra e remoção de ícones passaram.');
}finally{await browser.close();}
