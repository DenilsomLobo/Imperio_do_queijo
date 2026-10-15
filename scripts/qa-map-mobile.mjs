import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

const root=fileURLToPath(new URL('../',import.meta.url));
const server=http.createServer(async(req,res)=>{
 try{let file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));if((await stat(file)).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'})[path.extname(file)]??'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=process.env.QA_BASE??`http://127.0.0.1:${server.address().port}/play/`;
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 await mkdir(path.join(root,'.browser-preview-mobile'),{recursive:true});
 for(const width of [390,320,1440]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:true,isMobile:width<700});
  const page=await context.newPage(),errors=[];let failRanking=false;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://identitytoolkit.googleapis.com/**',route=>route.fulfill({status:400,contentType:'application/json',body:'{"error":{"message":"Offline QA"}}'}));
  await page.route('**/documents:runQuery',route=>route.fulfill({status:failRanking?503:200,contentType:'application/json',body:failRanking?'[{"error":{"message":"unavailable"}}]':JSON.stringify(['Outro celular','Outro navegador'].map((name,i)=>({document:{fields:{displayName:{stringValue:name},cash:{integerValue:String(60000-i*10000)}}}})))}));
  await page.goto(base);
  await page.locator('#entry-ranking').click();
  await page.getByText('Outro celular',{exact:true}).waitFor();
  assert.match(await page.locator('#ranking-source').textContent(),/Ranking global/);
  failRanking=true;await page.locator('#ranking-refresh').click();
  await page.getByText(/Ranking global indisponível/).waitFor();
  assert.equal(await page.locator('#ranking-list li').count(),0,'No local substitute when the global service fails');
  await page.getByRole('button',{name:'Fechar ranking'}).click();
  await page.locator('#player-name').fill('Layout QA');
  const began=Date.now();await page.locator('#entry-form button').click();
  await page.locator('canvas[data-ready="true"]').waitFor({timeout:60000});
  const camera=()=>page.locator('canvas').evaluate(c=>({zoom:Number(c.dataset.zoom),min:Number(c.dataset.minimumZoom),x:Number(c.dataset.scrollX),y:Number(c.dataset.scrollY)}));
  const initial=await camera();assert.ok(Math.abs(initial.zoom-initial.min)<.0001,'Start at the minimum zoom');
  const map=await page.locator('canvas').boundingBox();
  assert.ok(map.height>300,'Header leaves space for the map');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  if(width<700){
   const boxes=await Promise.all(['#save','#reset-campaign','#ranking'].map(q=>page.locator(q).boundingBox()));
   assert.ok(boxes.every(b=>Math.abs(b.y-boxes[0].y)<1&&Math.abs(b.width-boxes[0].width)<1),'Action buttons align');
   const cdp=await context.newCDPSession(page),cx=map.x+map.width/2,cy=map.y+map.height/2;
   const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y],id)=>({x,y,id,radiusX:4,radiusY:4}))});
   await touch('touchStart',[[cx-35,cy],[cx+35,cy]]);
   for(let d=45;d<=105;d+=15)await touch('touchMove',[[cx-d,cy],[cx+d,cy]]);
   await touch('touchEnd',[]);
   const enlarged=await camera();assert.ok(enlarged.zoom>initial.zoom*2,'Pinch out enlarges');
   await touch('touchStart',[[cx,cy]]);await touch('touchMove',[[cx+45,cy+35]]);await touch('touchEnd',[]);
   const dragged=await camera();assert.ok(Math.abs(dragged.x-enlarged.x)>5||Math.abs(dragged.y-enlarged.y)>5,'One finger pans');
   await touch('touchStart',[[cx-105,cy],[cx+105,cy]]);
   for(let d=90;d>=15;d-=15)await touch('touchMove',[[cx-d,cy],[cx+d,cy]]);
   await touch('touchEnd',[]);
   const reduced=await camera();assert.ok(Math.abs(reduced.zoom-initial.min)<.001,'Pinch in returns to minimum');
   assert.ok(await page.locator('#property-menu').isHidden(),'Gestures do not select a property');
  }else{
   await page.mouse.move(map.x+map.width/2,map.y+map.height/2);await page.mouse.wheel(0,-350);
   await page.waitForTimeout(100);assert.ok((await camera()).zoom>initial.zoom,'Mouse wheel still zooms');
   await page.mouse.wheel(0,5000);await page.waitForTimeout(100);
  }
  await page.screenshot({path:path.join(root,`.browser-preview-mobile/map-${width}.png`)});
  await page.locator('[data-manage="enemies"]').click();
  const enemyArt=await page.locator('.enemy-management .owned-resource-art,.enemy-management .building-art').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));
  assert.ok(enemyArt.length>0&&enemyArt.every(height=>height<=129),'Enemy card artwork stays proportional');
  await page.locator('.enemy-management .owned-resource-art').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(root,`.browser-preview-mobile/enemies-${width}.png`)});
  await page.locator('#management-dialog [data-close]').click();
  assert.deepEqual(errors,[]);
  console.log(`OK ${width}px: map ready in ${Date.now()-began} ms; minimum zoom ${initial.min.toFixed(3)}; gestures/layout/global-ranking checks passed.`);
  await context.close();
 }
}finally{await browser.close();server.close();}
