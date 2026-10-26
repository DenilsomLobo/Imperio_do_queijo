import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {waitForGame} from './qa-entry-helper.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1910,height:910}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.QA_URL??'http://127.0.0.1:5174/');await waitForGame(page);
 for(const viewport of [{width:1910,height:910},{width:1000,height:700},{width:390,height:844}]){
  await page.setViewportSize(viewport);await page.waitForTimeout(600);
  const metrics=await page.evaluate(()=>{const rect=q=>{const r=document.querySelector(q).getBoundingClientRect();return {height:r.height,top:r.top,bottom:r.bottom};};return {map:rect('#map'),canvas:rect('#map canvas'),footer:rect('footer'),viewport:innerHeight};});
  assert.equal(metrics.footer.height,27);assert.ok(metrics.map.height>viewport.height*0.5,JSON.stringify(metrics));assert.ok(metrics.canvas.height>metrics.map.height-8,JSON.stringify(metrics));assert.ok(metrics.map.bottom<=metrics.footer.top);assert.equal(Math.round(metrics.footer.bottom),viewport.height);
  await page.screenshot({path:viewport.width===390?'docs/qa-map-footer-mobile.png':'docs/qa-map-footer-desktop.png'});
 }
 await page.setViewportSize({width:1366,height:900});await page.waitForTimeout(400);const before=await page.locator('#map').boundingBox();
 await page.locator('[data-manage="properties"]').click();await page.locator('#management-content [data-property="farm-ze"]').click();assert.ok(await page.locator('#property-menu').isVisible());await page.locator('#close-property').click();const after=await page.locator('#map').boundingBox();assert.equal(after.height,before.height);assert.deepEqual(errors,[]);
 console.log('Mapa ocupa a área disponível, canvas acompanha resize e rodapé tem 27 px em desktop/mobile; painel não redimensiona mapa.');
}finally{await browser.close();}
