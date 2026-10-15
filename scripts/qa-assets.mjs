import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({...(process.env.QA_BROWSER?{executablePath:process.env.QA_BROWSER}:{channel:'chrome'}),headless:true});
try {
 const context=await browser.newContext();
 for(const path of ['/', '/editor.html', '/map-preview.html']) {
  const page=await context.newPage(),errors=[],missing=[];const loaded=new Set();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)missing.push(r.url());if(r.url().includes('/assets/')&&r.url().includes('.png'))loaded.add(r.url().split('?')[0]);});
  await page.goto(new URL(path,process.env.QA_URL ?? 'http://127.0.0.1:5173').href);
  await page.locator('canvas').waitFor();await page.waitForTimeout(1000);
  assert.deepEqual(errors,[],path);assert.deepEqual(missing,[],path);
  assert.ok(loaded.size>=60,path+' deve carregar todas as 60 artes');
  await page.close();
 }
 console.log('QA assets passou: jogo, editor e preview carregam as 60 imagens das subpastas sem erros.');
} finally {await browser.close();}
