import { describe, it, expect } from "vitest";
import {
  createGame,
  command,
  advance,
  total,
  chance,
  estimate,
  validateSave,
  resolvePending,
} from "./game.js";
import { ruralMap } from "../data/world.js";
import { rules, DAY } from "../data/game-rules.js";

const cmd = (s, type, id, extra = {}) => command(s, { type, id, ...extra });
describe("mapa fixo", () => {
  it("possui 14 lojas com 14 controles: 1 aliada, 8 neutras, 5 inimigas ao norte e fazenda ao sul", () => {
    const sales = ruralMap.slots.filter((p) => p.type === "sale");
    expect(sales).toHaveLength(14);
    expect(sales.filter((p) => p.owner === "player")).toHaveLength(1);
    expect(sales.filter((p) => p.owner === "neutral")).toHaveLength(8);
    expect(sales.filter((p) => p.owner === "coalho")).toHaveLength(5);
    for (const sale of sales)
      expect(ruralMap.slots.find((p) => p.id === sale.securityId)?.saleId).toBe(
        sale.id,
      );
    expect(
      ruralMap.slots.find((p) => p.id === "farm-ze").sprite.y,
    ).toBeGreaterThan(800);
    expect(
      sales.filter((p) => p.owner === "coalho" && p.district === "north").every((p) => p.sprite.y < 800),
    ).toBe(true);
  });
  it("comprar e produzir não alteram geometrias ou edifícios", () => {
    const before = JSON.stringify(ruralMap);
    let s = createGame();
    s = cmd(s, "buyProperty", "sale-n1");
    s = cmd(s, "produce", "factory-ze", { recipe: "frescal", quality: "weak" });
    s = advance(s, 120000);
    expect(JSON.stringify(ruralMap)).toBe(before);
  });
});
describe("cadeia econômica integrada", () => {
  it("compra vaca, produz consumindo ração, transfere, fabrica, vende, coleta, paga e recarrega", () => {
    let s = createGame(1);
    s = cmd(s, "buyCow", "farm-ze", { species: "weak" });
    s = cmd(s, "buyFeed", "farm-ze", { quantity: 10 });
    s = advance(s, DAY);
    expect(s.properties["farm-ze"].milk.weak).toBeCloseTo(16);
    expect(s.properties["farm-ze"].feed).toBeCloseTo(4);
    s = cmd(s, "collectMilk", "farm-ze", { target: "factory-ze" });
    expect(s.properties["farm-ze"].milk.weak).toBe(0);
    expect(s.properties["factory-ze"].milk.weak).toBeCloseTo(26);
    s = cmd(s, "produce", "factory-ze", { recipe: "frescal", quality: "weak" });
    expect(s.properties["factory-ze"].milk.weak).toBeCloseTo(21);
    expect(s.properties["factory-ze"].packaging).toBe(9);
    s = advance(s, 119000);
    expect(s.properties["factory-ze"].ready["frescal:weak"]).toBe(5);
    s = advance(s, 1000);
    expect(s.properties["factory-ze"].ready["frescal:weak"]).toBe(6);
    s = cmd(s, "collectCheese", "factory-ze", { target: "sale-ze" });
    expect(total(s.properties["factory-ze"].ready)).toBe(0);
    const before = s.companies.player.cash;
    s = advance(s, DAY / rules.sellerDaily);
    expect(s.properties["sale-ze"].till).toBe(2500);
    expect(s.companies.player.cash).toBe(before);
    s = cmd(s, "collectCash", "sale-ze");
    expect(s.companies.player.cash).toBe(before + 2500);
    expect(s.companies.player.revenue).toBe(2500);
    expect(s.properties["sale-ze"].till).toBe(0);
    const restored = validateSave(JSON.parse(JSON.stringify(s)));
    expect(restored).toEqual(s);
    expect(restored.ledger.some((l) => l.kind === "Salário de vendedor")).toBe(
      true,
    );
  });
  it("falta de ração suspende produção, capacidade limita sem destruir excedente", () => {
    let s = advance(createGame(), DAY);
    expect(total(s.properties["farm-ze"].milk)).toBe(0);
    s.properties["farm-ze"].milk.weak = 15;
    s.properties["factory-ze"].milk.weak = 98;
    s = cmd(s, "collectMilk", "farm-ze", { target: "factory-ze" });
    expect(s.properties["farm-ze"].milk.weak).toBe(13);
    expect(s.properties["factory-ze"].milk.weak).toBe(100);
  });
  it("não mistura qualidade e queijo maturando não é coletável", () => {
    let s = createGame();
    s.properties["factory-ze"].ready = {};
    s = cmd(s, "produce", "factory-ze", { recipe: "meia", quality: "weak" });
    s = advance(s, 180000);
    expect(s.properties["factory-ze"].batches[0].phase).toBe("maturation");
    expect(() =>
      cmd(s, "collectCheese", "factory-ze", { target: "sale-ze" }),
    ).toThrow(/Sem queijo/);
    s = advance(s, 2 * DAY);
    expect(s.properties["factory-ze"].ready["meia:weak"]).toBe(1);
  });
  it("caixa, ocupação de linha, vagas e estoque não podem ser contornados", () => {
    let s = createGame();
    expect(() => cmd(s, "buyCow", "farm-ze", { species: "noble" })).toThrow(
      /Caixa/,
    );
    s = cmd(s, "produce", "factory-ze", { recipe: "frescal", quality: "weak" });
    expect(() =>
      cmd(s, "produce", "factory-ze", { recipe: "frescal", quality: "weak" }),
    ).toThrow(/Linha/);
    expect(() =>
      cmd(s, "produce", "factory-ze", { recipe: "frescal", quality: "common" }),
    ).toThrow();
    s.properties["farm-ze"].cows.weak = 5;
    expect(() => cmd(s, "buyCow", "farm-ze", { species: "weak" })).toThrow(
      /vagas/,
    );
    const before = JSON.stringify(s);
    expect(() => cmd(s, "buyFeed", "farm-ze", { quantity: -1 })).toThrow();
    expect(JSON.stringify(s)).toBe(before);
  });
  it("demanda e caixa da loja são finitos e receita não é duplicada na coleta", () => {
    let s = createGame();
    s.properties["sale-ze"].stock = { "frescal:weak": 40 };
    s = advance(s, DAY - 1000);
    expect(s.properties["sale-ze"].sales).toBe(19);
    s = cmd(s, "collectCash", "sale-ze");
    expect(s.companies.player.revenue).toBe(19 * 2500);
    expect(() => cmd(s, "collectCash", "sale-ze")).toThrow();
  });
  it("velocidades mantêm um relógio sem duplicar produção", () => {
    let a = createGame(),
      b = createGame();
    a = cmd(a, "buyFeed", "farm-ze", { quantity: 10 });
    b = cmd(b, "buyFeed", "farm-ze", { quantity: 10 });
    a = advance(a, 1000);
    a = cmd(a, "speed", null, { speed: 4 });
    a = advance(a, 4000);
    b = advance(b, 5000);
    expect(a.properties["farm-ze"].milk).toEqual(b.properties["farm-ze"].milk);
    expect(a.time).toBe(b.time);
  });
});
function army() {
  let s = createGame();
  s = cmd(s, "buyProperty", "sale-n6");
  s = cmd(s, "hireTeam", "sale-n6-control");
  return s;
}
describe("combate e conquista", () => {
  it("inimigo pode atacar aliado, sem perdas enquanto offline", () => {
    let s = army();
    s = command(
      s,
      { type: "attack", id: "sale-e1-control", target: "sale-n6-control" },
      "coalho",
    );
    s = advance(s, rules.attackDuration, { offline: true, rng: () => 0 });
    expect(s.properties["sale-n6"].owner).toBe("player");
    expect(s.pendingIncidents).toHaveLength(1);
    s = resolvePending(s, { rng: () => 0 });
    expect(s.properties["sale-n6"].owner).toBe("neutral");
    expect(s.properties["sale-n6-control"].owner).toBe("neutral");
  });
  it("defensores derrotados ficam em reserva e podem ser alocados após recuperação", () => {
    let s = army();
    s = cmd(s, "attack", "sale-n6-control", { target: "sale-e1-control" });
    s = advance(s, rules.attackDuration, { rng: () => 0 });
    const t = s.companies.coalho.reserveTeams[0];
    expect(t.recoverUntil).toBeGreaterThan(s.time);
    s = command(s, { type: "buyProperty", id: "sale-e1" }, "coalho");
    expect(() =>
      command(
        s,
        { type: "deployReserve", id: "sale-e1-control", teamId: t.id },
        "coalho",
      ),
    ).toThrow(/indisponível/);
    s = advance(s, rules.recovery);
    s = command(
      s,
      { type: "deployReserve", id: "sale-e1-control", teamId: t.id },
      "coalho",
    );
    expect(s.properties["sale-e1-control"].team.id).toBe(t.id);
  });
  it("forças iguais = 50% e chance permanece limitada", () => {
    expect(chance(3, 3)).toBe(50);
    expect(chance(100, 0)).toBeLessThanOrEqual(95);
    expect(chance(0, 100)).toBeGreaterThanOrEqual(5);
  });
  it("compra, promove, arma, ataca barricadas, neutraliza e permite compra sem mover propriedades", () => {
    let s = army();
    s = cmd(s, "upgradeStars", "sale-n6-control");
    s = cmd(s, "upgradeWeapon", "sale-n6-control");
    s.properties["sale-e1-control"].barricade = 2;
    const info = estimate(s, "sale-n6-control", "sale-e1-control");
    expect(info.attack).toBeCloseTo(3 * 1.4 * 1.12);
    expect(info.defense).toBeCloseTo(3 * 1.3);
    const rng = [];
    s = cmd(s, "attack", "sale-n6-control", { target: "sale-e1-control" });
    expect(rng).toHaveLength(0);
    s = advance(s, rules.attackDuration, {
      rng: () => {
        rng.push(1);
        return 0;
      },
    });
    expect(rng).toHaveLength(1);
    expect(s.properties["sale-e1"].owner).toBe("neutral");
    expect(s.properties["sale-e1-control"].owner).toBe("neutral");
    expect(s.properties["sale-e1-control"].barricade).toBe(2);
    s = cmd(s, "collectCheese", "factory-ze", { target: "sale-ze" });
    s = advance(s, 900000);
    s = cmd(s, "collectCash", "sale-ze");
    s = cmd(s, "buyProperty", "sale-e1");
    expect(s.properties["sale-e1-control"].owner).toBe("player");
    expect(validateSave(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
  it("derrota gera recuperação e bloqueia ataques simultâneos ou fora do alcance", () => {
    let s = army();
    s = cmd(s, "attack", "sale-n6-control", { target: "sale-e1-control" });
    expect(() =>
      cmd(s, "attack", "sale-n6-control", { target: "sale-e2-control" }),
    ).toThrow(/ocupada/);
    s = advance(s, rules.attackDuration, { rng: () => 0.99 });
    expect(s.properties["sale-e1"].owner).toBe("coalho");
    expect(s.properties["sale-n6-control"].team.recoverUntil).toBeGreaterThan(
      s.time,
    );
    expect(() =>
      cmd(s, "attack", "sale-n6-control", { target: "sale-e1-control" }),
    ).toThrow();
    s = advance(s, rules.recovery);
    expect(
      s.properties["sale-n6-control"].team.recoverUntil,
    ).toBeLessThanOrEqual(s.time);
  });
  it("offline limita oito dias e mantém ataques pendentes sem perda territorial", () => {
    let s = army();
    s = cmd(s, "attack", "sale-n6-control", { target: "sale-e1-control" });
    s = advance(s, rules.attackDuration, { offline: true });
    expect(s.pendingIncidents).toHaveLength(1);
    expect(s.properties["sale-e1"].owner).toBe("coalho");
    s = resolvePending(s, { rng: () => 0 });
    expect(s.properties["sale-e1"].owner).toBe("neutral");
    const capped = advance(createGame(), 20 * DAY, { offline: true });
    expect(capped.time).toBe(rules.offlineLimit);
  });
  it("IA usa recursos finitos, mesmas regras e expansão com progressão", () => {
    let s = createGame();
    const initial = s.companies.coalho.cash;
    s = advance(s, DAY);
    expect(s.companies.coalho.cash).toBeLessThan(initial);
    expect(s.missions).toHaveLength(0);
    s = advance(s, DAY + rules.aiInterval + rules.attackDuration, {
      rng: () => 0,
    });
    expect(s.companies.coalho.cash).toBeGreaterThanOrEqual(0);
    expect(
      Object.values(s.properties).some(
        (p) => p.id.startsWith("sale-n") && p.owner === "coalho",
      ),
    ).toBe(true);
  });
});
