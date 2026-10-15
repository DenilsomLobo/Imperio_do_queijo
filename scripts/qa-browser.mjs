import {waitForGame} from './qa-entry-helper.mjs';
import { chromium } from "playwright-core";
import assert from "node:assert/strict";

const browser = await chromium.launch({ ...(process.env.QA_BROWSER ? {executablePath:process.env.QA_BROWSER} : {channel:"chrome"}), headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let time = Date.now();
  await page.clock.setFixedTime(new Date(time));
  await page.goto(process.env.QA_URL ?? "http://127.0.0.1:5174/");
  await waitForGame(page);
  await page.waitForFunction(
    () =>
      document.querySelector("#status").textContent !== "Carregando campanha…",
  );
  const layout = await page.evaluate(async () => {
    const { ruralMap } = await import("/src/data/world.js");
    const { collectorPosition } = await import("/src/map/presentation.js");
    return {
      day:(await import("/src/data/game-rules.js")).DAY,
      slots: ruralMap.slots,
      width: ruralMap.width,
      height: ruralMap.height,
      collectors: Object.fromEntries(
        ruralMap.slots.map((s) => [s.id, collectorPosition(s)]),
      ),
    };
  });
  const { slots } = layout;
  const canvas = await page.locator("canvas").boundingBox();
  const zoom = Math.min(
    canvas.width / layout.width,
    canvas.height / layout.height,
  );
  const offset = {
    x: canvas.x + (canvas.width - layout.width * zoom) / 2,
    y: canvas.y + (canvas.height - layout.height * zoom) / 2,
  };
  const clickPoint = async (x, y) =>
    page.mouse.click(offset.x + x * zoom, offset.y + y * zoom);
  const clickSlot = async (id) => {
    const s = slots.find((s) => s.id === id);
    const x = s.polygon.reduce((n, p) => n + p.x, 0) / s.polygon.length,
      y = s.polygon.reduce((n, p) => n + p.y, 0) / s.polygon.length;
    await clickPoint(x, y);
  };
  const advance = async (ms) => {
    time += ms;
    await page.clock.setFixedTime(new Date(time));
    await page.waitForTimeout(1200);
  };
  const saved = async () => {
    await page.locator("#save").click();
    await page.waitForTimeout(100);
    return page.evaluate(
      () =>
        new Promise((resolve, reject) => {
          const r = indexedDB.open("imperio-do-queijo", 1);
          r.onsuccess = () => {
            const q = r.result
              .transaction("campaigns")
              .objectStore("campaigns")
              .get("current");
            q.onsuccess = () => resolve(q.result);
            q.onerror = () => reject(q.error);
          };
        }),
    );
  };
  await page.waitForTimeout(300);
  await page.screenshot({ path: "docs/qa-rural-map.png" });
  await page.locator('[data-action="buyFeed"]').click();
  await advance(layout.day);
  const farm = slots.find((s) => s.id === "farm-ze");
  await clickPoint(layout.collectors[farm.id].x, layout.collectors[farm.id].y);
  assert.match(await page.locator("#status").textContent(), /Ação concluída/);
  await clickSlot("factory-ze");
  assert.match(await page.locator("#title").textContent(), /Queijaria/);
  await page.locator('[data-action="produce"]').click();
  await advance(121000);
  const factory = slots.find((s) => s.id === "factory-ze");
  await clickPoint(
    layout.collectors[factory.id].x,
    layout.collectors[factory.id].y,
  );
  const before = await saved();
  assert.equal(before.properties["sale-ze"].stock["weak:weak"], 6);
  assert.equal(before.properties["factory-ze"].ready["weak:weak"], 0);
  await advance(layout.day / 20 + 1000);
  const shop = slots.find((s) => s.id === "sale-ze");
  await clickPoint(layout.collectors[shop.id].x, layout.collectors[shop.id].y);
  const collected = await saved();
  assert.equal(collected.properties["sale-ze"].till, 0);
  assert.equal(collected.companies.player.revenue, 2500);
  assert.equal(
    collected.companies.player.cash,
    before.companies.player.cash + 2500,
  );
  await clickSlot("sale-n6");
  await page.locator('[data-action="buyProperty"]').click();
  await page.locator('[data-action="control"]').click();
  await page.locator('[data-action="hireTeam"]').click();
  await page.locator('[data-action="hireAtPost"]').click();
  await page.locator('[data-action="openServiceTarget"]').click();
  await page.locator('[data-action="upgradeStars"]').click();
  await page.locator('[data-action="upgradeWeapon"]:enabled').click();
  assert.match(await page.locator("#estimate").textContent(), /chance/);
  await page.locator('[data-action="attack"]').click();
  await advance(61000);
  const final = await saved();
  assert.equal(final.missions.length, 0);
  assert.ok(
    final.reports.some(
      (r) => r.text.includes("venceu") || r.text.includes("perdeu"),
    ),
  );
  await page.reload();
  await waitForGame(page);
  await page.waitForFunction(() =>
    document.querySelector("#status").textContent.includes("carregada"),
  );
  const restored = await saved();
  assert.equal(restored.campaignId, final.campaignId);
  assert.equal(restored.companies.player.cash, final.companies.player.cash);
  assert.equal(restored.properties["sale-n6-control"].team.stars, 2);
  await page.screenshot({ path: "docs/qa-rural-reloaded.png" });
  assert.deepEqual(errors, []);
  console.log(
    "QA navegador passou: leite → queijo → venda → coleta; compra/equipe/combate; IndexedDB/reload; zero pageerrors.",
  );
} finally {
  await browser.close();
}
