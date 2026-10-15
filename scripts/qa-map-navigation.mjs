import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.QA_BROWSER,headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.QA_URL);await page.locator('canvas[data-ready="true"]').waitFor();
 assert.equal(await page.locator('#regions,#catalogue,#overview,#zoom-in,#zoom-out').count(),0);
 const canvas=page.locator('#map canvas'),box=await canvas.boundingBox();assert.ok(box.x<15&&box.width>1000);
 assert.ok(await page.locator('.sector-card').first().evaluate(e=>e.getBoundingClientRect().height<65));
 const before=await canvas.screenshot();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+150,box.y+box.height/2+180,{steps:15});await page.mouse.up();await page.waitForTimeout(150);
 assert.notDeepEqual(before,await canvas.screenshot());
 const dragged=await canvas.screenshot();await page.mouse.wheel(0,-700);await page.waitForTimeout(250);assert.notDeepEqual(dragged,await canvas.screenshot());
 for(let i=0;i<30;i++)await page.mouse.wheel(0,500);await page.waitForTimeout(200);
 await page.screenshot({path:'docs/qa-map-navigation.png'});assert.deepEqual(errors,[]);
 console.log('Mapa ampliado, menus compactos, remoções, arraste e zoom passaram.');
}finally{await browser.close();}
