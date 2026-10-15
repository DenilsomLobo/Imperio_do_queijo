export async function waitForGame(page,name='QA de desenvolvimento'){
 await page.waitForSelector('#entry-form, canvas[data-ready="true"]');
 if(await page.locator('#entry-form').count()){
  await page.locator('#player-name').fill(name);await page.locator('#entry-form button').click();
 }
 await page.locator('canvas[data-ready="true"]').waitFor();
}
