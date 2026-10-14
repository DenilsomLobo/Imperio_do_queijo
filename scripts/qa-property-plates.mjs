import {chromium} from 'playwright-core';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1600,height:1000}});
 const time=Date.now(), errors=[];
 await page.clock.setFixedTime(time);
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.QA_URL??'http://127.0.0.1:5173/');
 await page.locator('canvas[data-ready="true"]').waitFor();
 await page.clock.setFixedTime(time+60000);
 await page.waitForTimeout(1300);
 await page.getByRole('button',{name:'Fazendas',exact:true}).click();
 for(let i=0;i<2;i++) await page.getByRole('button',{name:'Aproximar',exact:true}).click();
 await page.screenshot({path:'docs/qa-property-plates.png'});
 if(errors.length) throw Error(errors.join('\n'));
 console.log('Placas e ícone acima do telhado renderizados sem erros.');
}finally{await browser.close();}
