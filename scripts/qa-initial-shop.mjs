import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({...(process.env.QA_BROWSER?{executablePath:process.env.QA_BROWSER}:{channel:'chrome'}),headless:true});
try {
 const page=await browser.newPage({viewport:{width:1700,height:1080}}), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.QA_URL ?? 'http://127.0.0.1:5173');
 await page.locator('canvas[data-ready="true"]').waitFor();
 await page.evaluate(async()=>{
  const {createGame,command}=await import('/src/domain/game.js');
  const {save}=await import('/src/persistence/local.js');
  let s=createGame();s=command(s,{type:'hireTeam',id:'sale-ze-control'});
  s=command(s,{type:'buyProperty',id:'sale-n1'});await save(s);
 });
 await page.reload();await page.locator('canvas[data-ready="true"]').waitFor();
 const data=await page.evaluate(async()=>{
  const {ruralMap}=await import('/src/data/world.js');const {shopAsset,guardAsset}=await import('/src/map/presentation.js');
  const sale=ruralMap.slots.find(p=>p.id==='sale-ze');const factory=ruralMap.slots.find(p=>p.id==='factory-ze');
  return {sale,factory,asset:shopAsset(sale,{type:'sale',owner:'player'}),flag:guardAsset({id:'sale-ze-control',owner:'player',team:{stars:1}}),second:shopAsset({id:'sale-n1'},{type:'sale',owner:'player'})};
 });
 assert.equal(data.flag,'capangas_aliado_nivel_1.png');assert.equal(data.second,'Ponto_de_venda_aliado.png');
 assert.equal(data.asset,'ponto_de_venda_inicial_seu_ze.png');
 assert.equal(data.sale.sprite.x,660);assert.equal(data.sale.sprite.y,1872);
 assert.ok(data.sale.sprite.y-data.sale.sprite.width > data.factory.sprite.y+50);
 await page.locator('[data-manage="properties"]').click();await page.locator('[data-property="farm-ze"]').click();
 await page.waitForTimeout(250);await page.screenshot({path:'docs/qa-initial-shop-position.png'});
 await page.locator('#overview').click();
 const canvas=await page.locator('canvas').boundingBox();
 const point=await page.evaluate(async()=>{const {ruralMap}=await import('/src/data/world.js');return {w:ruralMap.width,h:ruralMap.height};});
 const zoom=Math.min(canvas.width/point.w,canvas.height/point.h);
 const x=canvas.x+(canvas.width-point.w*zoom)/2+data.sale.sprite.x*zoom;
 const y=canvas.y+(canvas.height-point.h*zoom)/2+(data.sale.sprite.y-70)*zoom;
 await page.mouse.click(x,y);assert.match(await page.locator('#title').innerText(),/Barraquinha do Seu Zé/);
 assert.deepEqual(errors,[]);console.log('QA barraquinha passou: arte inicial, posição, separação da placa da fábrica e clique.');
} finally {await browser.close();}
