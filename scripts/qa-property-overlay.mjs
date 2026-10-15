import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.QA_BROWSER,headless:true});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.QA_URL);await page.locator('canvas[data-ready="true"]').waitFor();
 const menu=page.locator('#property-menu'),canvas=page.locator('#map canvas');assert.equal(await menu.isVisible(),false);
 const before=await canvas.boundingBox();assert.ok(before.width>1880);
 await page.locator('[data-manage="properties"]').click();await page.locator('[data-property="farm-ze"]').click();assert.equal(await menu.isVisible(),true);assert.deepEqual(await canvas.boundingBox(),before);
 assert.ok(await menu.evaluate(e=>parseFloat(getComputedStyle(e).borderTopWidth)>=2));
 await page.screenshot({path:'docs/qa-property-overlay-open.png'});
 await page.locator('#close-property').click();assert.equal(await menu.isVisible(),false);assert.deepEqual(await canvas.boundingBox(),before);
 // Clica na construção real após foco da gestão: câmera em 0,85, com centro limitado ao terreno.
 const layout=await page.evaluate(async()=> (await import('/src/data/world.js')).ruralMap);
 const farm=layout.slots.find(s=>s.id==='farm-ze'),z=.85;
 const cx=Math.max(before.width/(2*z),Math.min(layout.width-before.width/(2*z),farm.sprite.x));
 const cy=Math.max(before.height/(2*z),Math.min(layout.height-before.height/(2*z),farm.sprite.y-farm.sprite.width*.4));
 await page.mouse.click(before.x+before.width/2+(farm.sprite.x-cx)*z,before.y+before.height/2+(farm.sprite.y-60-cy)*z);
 assert.equal(await menu.isVisible(),true);await page.keyboard.press('Escape');assert.equal(await menu.isVisible(),false);
 await page.setViewportSize({width:1366,height:768});await page.waitForTimeout(250);assert.ok((await canvas.boundingBox()).width>1330);
 await page.locator('[data-manage="properties"]').click();await page.locator('[data-property="factory-ze"]').click();assert.equal(await menu.isVisible(),true);await page.screenshot({path:'docs/qa-property-overlay-laptop.png'});
 assert.deepEqual(errors,[]);console.log('Mapa completo e painel sobreposto: clique real, menus, borda, X, Escape e duas resoluções passaram.');
}finally{await browser.close();}
