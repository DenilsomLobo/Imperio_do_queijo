import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

const root=fileURLToPath(new URL('../',import.meta.url));
const server=http.createServer(async(req,res)=>{
 try {
  let file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png'})[path.extname(file)]??'application/octet-stream');
  res.end(await readFile(file));
 }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
 browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();
 // Exercise the built game without creating production Firebase test records.
 await page.route('https://identitytoolkit.googleapis.com/**',route=>route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:{message:'Offline QA'}})}));
 await page.route('**/*.png',route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1cAAAAASUVORK5CYII=','base64')}));
 await page.goto(`http://127.0.0.1:${server.address().port}/play/`);
 async function enter(){
  await page.locator('#player-name').fill('Pause QA');
  await page.locator('#entry-form button').click();
  await page.waitForFunction(()=>document.querySelector('#app')?.inert===false && !!document.querySelector('#save'));
 }
 await enter();
 await page.clock.install();
 async function saved(){return page.evaluate(async()=>{
  await document.querySelector('#save').onclick();
  const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('imperio-do-queijo',1);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
  return new Promise((resolve,reject)=>{const q=db.transaction('campaigns').objectStore('campaigns').get('current');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
 });}
 async function visibility(hidden){await page.evaluate(hidden=>{
  Object.defineProperty(document,'hidden',{configurable:true,value:hidden});
  Object.defineProperty(document,'visibilityState',{configurable:true,value:hidden?'hidden':'visible'});
  document.dispatchEvent(new Event('visibilitychange'));
 },hidden);}
 await page.clock.runFor(2000);
 await visibility(true);
 const paused=await saved();
 await page.clock.fastForward(5*60*1000);
 const hidden=await saved();
 delete paused.savedAt;delete hidden.savedAt;
 assert.deepEqual(hidden,paused,'Hidden time must not change production, finances, AI or deadlines');
 await visibility(false);
 await page.clock.runFor(2000);
 const resumed=await saved();
 assert.equal(resumed.time,paused.time+2000,'Only visible time should advance');
 await page.evaluate(async()=>{
  const db=await new Promise(resolve=>{const q=indexedDB.open('imperio-do-queijo',1);q.onsuccess=()=>resolve(q.result);});
  await new Promise((resolve,reject)=>{const tx=db.transaction('campaigns','readwrite'),store=tx.objectStore('campaigns'),q=store.get('current');q.onsuccess=()=>{const s=q.result;s.savedAt-=6*60*60*1000;store.put(s,'current');store.put(s,'campaign:'+s.playerProfile.id);};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
 });
 await page.reload();
 await enter();
 const reopened=await saved();
 assert.equal(reopened.time,resumed.time,'Reopening a six-hour-old save must not simulate offline time');
 console.log('OK: five minutes hidden preserve the campaign, visible play resumes, and reopening adds no offline progress.');
}finally{
 if(browser)await browser.close();
 server.close();
}
