import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.QA_BROWSER,headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.QA_URL);await page.locator('canvas[data-ready="true"]').waitFor();
 async function openPost(){await page.locator('[data-manage="properties"]').click();await page.locator('[data-property="sale-ze"]').click();await page.locator('[data-action="control"]').click();}
 await openPost();assert.ok((await page.locator('.combat-info').innerText()).includes('Posto sem equipe'));
 await page.locator('[data-action="hireTeam"]').click();await page.locator('[data-action="hireAtPost"]').click();await openPost();
 const values=()=>page.locator('.combat-values strong').allTextContents();assert.deepEqual(await values(),['3','3']);
 await page.locator('[data-action="upgradeWeapon"]').click();assert.deepEqual(await values(),['3,36','3']);
 await page.locator('[data-action="upgradeBarricade"]').click();assert.deepEqual(await values(),['3,36','3,45']);assert.ok((await page.locator('[data-action="upgradeWeapon"]').innerText()).includes('1.500'));assert.ok((await page.locator('[data-action="upgradeBarricade"]').innerText()).includes('1.500'));
 await page.locator('.combat-rules summary').click();await page.waitForTimeout(1300);assert.equal(await page.locator('.combat-rules').getAttribute('open'),'');assert.ok((await page.locator('.combat-rules').innerText()).includes('50%'));
 await page.locator('.combat-rules').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/qa-combat-menu-rules.png'});
 await page.locator('.combat-values').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/qa-combat-menu.png'});assert.deepEqual(errors,[]);console.log('Menu de capangas: contratação, ataque/defesa reais, melhorias independentes e regras persistentes passaram.');
}finally{await browser.close();}
