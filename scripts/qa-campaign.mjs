import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1900,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.QA_URL??'http://127.0.0.1:5173/');
 await page.locator('canvas[data-ready="true"]').waitFor();
 async function seed(owner,legacy=false){
  await page.evaluate(async({owner,legacy})=>{
   const {createGame,command}=await import('/src/domain/game.js');
   const {save}=await import('/src/persistence/local.js');
   let s=createGame();
   if(legacy){s.resetRevision='old';s.companies.player.cash=123;}
   else {
    for(const p of Object.values(s.properties))if(p.type==='sale') {p.owner=owner;s.properties[p.securityId].owner=owner;}
    s.companies[owner].cash=10000000;
    if(owner==='coalho')s=command(s,{type:'buyProperty',id:'farm-ze'},owner);
   }
   await save(s);
  },{owner,legacy});
  await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();
 }
 await seed('player',true);
 assert.match(await page.locator('[data-metric="cash"]').textContent(),/1\.500/);
 await page.locator('[data-action="buyFeed"]').click();
 await page.waitForTimeout(200);await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();
 assert.match(await page.locator('[data-metric="cash"]').textContent(),/1\.480/);
 await seed('player');
 async function click(id){
  const p=await page.evaluate(async id=>{
   const {ruralMap:m}=await import('/src/data/world.js');const s=m.slots.find(s=>s.id===id);
   const r=document.querySelector('canvas').getBoundingClientRect(),z=Math.min(r.width/m.width,r.height/m.height);
   return {x:r.x+(r.width-m.width*z)/2+s.sprite.x*z,y:r.y+(r.height-m.height*z)/2+(s.sprite.y-80)*z};
  },id);
  await page.mouse.click(p.x,p.y);
 }
 await click('security-agency');
 await page.locator('#service-target').selectOption('sale-n6-control');
 await page.locator('#team-tier').selectOption('3');
 await page.locator('[data-action="hireAtPost"]').click();
 await page.locator('#save').click();await page.waitForTimeout(200);
 const tier=await page.evaluate(async()=>{const {load}=await import('/src/persistence/local.js');return (await load()).properties['sale-n6-control'].team.stars;});
 assert.equal(tier,3);
 await click('farm-coalho');await page.locator('[data-action="buyProperty"]').click();
 await click('factory-coalho');await page.locator('[data-action="buyProperty"]').click();
 assert.match(await page.locator('#campaign-status').textContent(),/VITÓRIA/);
 await page.locator('#save').click();await page.waitForTimeout(200);await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();
 assert.match(await page.locator('#campaign-status').textContent(),/VITÓRIA/);
 await page.screenshot({path:'docs/qa-campaign-victory.png'});
 await seed('coalho');assert.match(await page.locator('#campaign-status').textContent(),/DERROTA/);
 await page.screenshot({path:'docs/qa-campaign-defeat.png'});
 assert.deepEqual(errors,[]);console.log('QA campanha passou: reset único, progresso preservado no reload, compras finais, vitória e derrota persistidas.');
}finally{await browser.close();}
