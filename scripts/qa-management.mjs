import { chromium } from "playwright-core";
import assert from "node:assert/strict";
const browser = await chromium.launch({ ...(process.env.QA_BROWSER ? {executablePath:process.env.QA_BROWSER} : {channel:"chrome"}), headless: true });
try {
  const context = await browser.newContext({
      viewport: { width: 1900, height: 1080 },
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.QA_URL ?? "http://127.0.0.1:5173/");
  await page.locator('canvas[data-ready="true"]').waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Mapa-múndi", exact: true }).count(),
    0,
  );
  assert.equal(
    await page.getByRole("button", { name: "Editor", exact: true }).count(),
    0,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Distrito industrial", exact: true })
      .count(),
    0,
  );
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.querySelector("header")).backgroundColor,
    ),
    "rgb(92, 64, 48)",
  );
  await page.waitForTimeout(500);
  assert.equal(
    await page.locator('[data-metric="properties"]').textContent(),
    "3",
  );
  assert.equal(
    await page.locator('[data-metric="employees"]').textContent(),
    "1",
  );
  assert.equal(await page.locator('[data-metric="cheese"]').textContent(), "5");
  await page.screenshot({ path: "docs/qa-management-map.png" });
  for (const section of [
    "properties",
    "employees",
    "milk",
    "cheese",
    "cows",
    "revenue",
    "cash",
    "enemies",
  ]) {
    await page.locator(`[data-manage="${section}"]`).click();
    assert.equal(await page.locator("#management-dialog").isVisible(), true);
    assert.ok(
      (await page.locator("#management-content").textContent()).length > 20,
    );
    await page.locator("[data-close]").click();
  }
  await page.locator("#catalogue").click();
  assert.equal(await page.locator(".catalogue-grid article").count(), 52);
  assert.equal(await page.locator('.catalogue-grid img[alt="leite magico"]').count(),0);
  await page.screenshot({ path: "docs/qa-catalogue.png" });
  await page.locator("[data-close]").click();
  await page.locator('[data-manage="cows"]').click();
  await page.locator('[data-property="cow-shop"]').click();
  assert.match(await page.locator("#title").textContent(), /Loja de vacas/);
  await page.locator('[data-action="buyAtCowShop"]').click();
  assert.equal(await page.locator('[data-metric="cows"]').textContent(), "2");
  await page.locator('[data-manage="properties"]').click();
  await page.locator('[data-property="factory-ze"]').click();
  await page.locator('[data-action="collectCheese"]').click();
  assert.equal(await page.locator('[data-metric="cheese"]').textContent(), "5");
  await page.locator("#overview").click();
  await page.locator("#zoom-in").click();
  await page.locator("#zoom-out").click();
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.locator("#overview").click();
  await page.waitForTimeout(300);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollHeight > innerHeight,
    ),
    false,
  );
  await page.screenshot({ path: "docs/qa-management-laptop.png" });
  assert.deepEqual(errors, []);
  console.log(
    "QA gestão passou: 8 menus, catálogo completo, compra pela loja de vacas, estoque conservado e viewport 1366x768 sem scroll externo.",
  );
} finally {
  await browser.close();
}
