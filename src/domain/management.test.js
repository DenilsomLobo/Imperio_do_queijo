import { it, expect } from "vitest";
import { createGame, command, migrateSave, validateSave } from "./game.js";
import { management } from "./management.js";
import { ruralMap } from "../data/world.js";
it('salvamento incompleto não recupera recursos iniciais por migração',()=>{const s=createGame();s.layoutVersion=1;delete s.properties['factory-ze'];expect(()=>migrateSave(s)).toThrow(/incompleto/);});
it("gestão calcula estoque incluindo lojas, funcionários e propriedades sem contar controles/serviços", () => {
  let s = createGame();
  expect(management(s)).toMatchObject({
    properties: 3,
    employees: 1,
    milk: 10,
    cheese: 5,
    cows: 1,
    revenue: 0,
    cash: 150000,
    enemies: 1,
  });
  s = command(s, {
    type: "collectCheese",
    id: "factory-ze",
    target: "sale-ze",
  });
  expect(management(s).cheese).toBe(5);
  s = command(s, { type: "buyProperty", id: "sale-n6" });
  s = command(s, { type: "hireTeam", id: "sale-n6-control" });
  expect(management(s)).toMatchObject({
    properties: 4,
    employees: 4,
    guards: 3,
    sellers: 1,
  });
});
it("migração preserva campanha antiga e acrescenta serviços/edifícios sem presentear estoque ou vacas", () => {
  const s = createGame(123);
  s.layoutVersion = 1;
  const old = [
    "farm-ze",
    "factory-ze",
    "sale-ze",
    ...Array.from({ length: 8 }, (_, i) => `sale-n${i + 1}`),
    ...Array.from({ length: 5 }, (_, i) => `sale-e${i + 1}`),
    "farm-coalho",
    "factory-coalho",
  ];
  for (const id of Object.keys(s.properties))
    if (
      !old.includes(id) &&
      !old.some((p) => `${p}-control` === id) &&
      !id.startsWith("land-")
    )
      delete s.properties[id];
  s.companies.player.cash = 87654;
  s.time = 5000;
  const updated = validateSave(migrateSave(s));
  expect(updated.campaignId).toBe(s.campaignId);
  expect(updated.companies.player.cash).toBe(87654);
  expect(updated.time).toBe(5000);
  expect(updated.properties["factory-ze"].ready).toEqual(
    s.properties["factory-ze"].ready,
  );
  expect(updated.properties["farm-level-2"].cows).toEqual({});
  expect(updated.properties["bank-rural"].owner).toBe("public");
});
it("todo serviço e construção cadastrados têm sprite em escala legível e loja tem círculo em frente", () => {
  const services = ruralMap.slots.filter((p) => p.type === "service");
  expect(services).toHaveLength(6);
  for (const p of ruralMap.slots.filter(
    (p) => p.building && p.type !== "security",
  ))
    expect(p.sprite.width).toBeGreaterThanOrEqual(200);
  for (const p of ruralMap.slots.filter((p) => p.type === "sale")) {
    const circle = ruralMap.slots.find((s) => s.id === p.securityId);
    expect(circle.sprite.y).toBeGreaterThan(p.sprite.y);
    expect(Math.abs(circle.sprite.x - p.sprite.x)).toBeLessThan(p.sprite.width);
  }
});
