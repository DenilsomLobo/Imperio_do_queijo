import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({...(process.env.QA_BROWSER?{executablePath:process.env.QA_BROWSER}:{channel:'chrome'}),headless:true});
try {
 const page=await browser.newPage({viewport:{width:1600,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.QA_URL ?? 'http://127.0.0.1:5173',now=Date.now();await page.clock.setFixedTime(new Date(now));
 await page.goto(new URL('/map-preview.html',url).href);await page.locator('canvas[data-ready="true"]').waitFor();
 await page.evaluate(async now=>{const {createGame}=await import('/src/domain/game.js');const {save}=await import('/src/persistence/local.js');const s=createGame(now);s.companies.player.cash=10000000;await save(s);},now);
 await page.goto(url);await page.locator('canvas[data-ready="true"]').waitFor();
 await page.locator('[data-manage="cows"]').click();await page.locator('[data-property="cow-shop"]').click();
 assert.equal(await page.locator('.cow-shop-card').count(),5);assert.equal(await page.locator('#service-species').isVisible(),false);
 await page.waitForFunction(()=>[...document.querySelectorAll('.cow-shop-card img')].every(i=>i.complete&&i.naturalWidth>0));
 assert.match(await page.locator('[data-species="radioactive"]').innerText(),/35.000,00/);assert.match(await page.locator('[data-species="radioactive"]').innerText(),/80 rações/);
 assert.match(await page.locator('[data-species="magic"]').innerText(),/60.000,00/);assert.match(await page.locator('[data-species="magic"]').innerText(),/100 rações/);
 for(const species of ['radioactive','magic']) {
  await page.locator('[data-species="'+species+'"]').click();await page.locator('[data-action="buyAtCowShop"]').click();
  assert.equal(await page.locator('[data-species="'+species+'"]').getAttribute('aria-pressed'),'true');
 }
 await page.locator('aside').evaluate(el=>el.scrollTop=0);await page.screenshot({path:'docs/qa-cow-shop.png'});
 await page.locator('#save').click();await page.getByText('Jogo salvo.',{exact:true}).waitFor();
 const s=await page.evaluate(async()=>{const {load}=await import('/src/persistence/local.js');return load();});
 assert.equal(s.companies.player.cash,500000);assert.equal(s.properties['farm-ze'].cows.radioactive,1);assert.equal(s.properties['farm-ze'].cows.magic,1);
 assert.deepEqual(s.companies.player.discoveredMilk,['weak']);
 await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();
 await page.locator('[data-manage="cows"]').click();assert.equal(await page.locator('#management-content .herd-grid img[alt="Vaca Radioativa"]').count(),1);assert.equal(await page.locator('#management-content .herd-grid img[alt="Vaca Mágica"]').count(),1);
 assert.deepEqual(errors,[]);console.log('QA loja de vacas passou: cinco retratos, preços/ração, compra direta das raras, seleção preservada, descoberta oculta e reload.');
} finally {await browser.close();}
