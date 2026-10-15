import { it, expect } from "vitest";
import { ruralMap } from "../data/world.js";
import { clipRoad } from "./streets.js";
it("quantidades por distrito correspondem ao pedido, com apenas um banco nível 2", () => {
  const buildings = ruralMap.slots.filter(p => p.building);
  const shops = district => buildings.filter(p => p.type === "sale" && p.district === district);
  expect(buildings).toHaveLength(28);
  expect(shops("town")).toHaveLength(5);
  expect(shops("town").filter(p => p.owner === "coalho")).toHaveLength(0);
  expect(shops("countryside")).toHaveLength(5);
  expect(shops("countryside").filter(p => p.owner === "neutral")).toHaveLength(4);
  expect(shops("north")).toHaveLength(4);
  expect(shops("north").filter(p => p.owner === "coalho")).toHaveLength(1);
  expect(buildings.filter(p => p.building === "banco_nivel_2.png")).toHaveLength(1);
  expect(buildings.filter(p => p.type === "factory")).toHaveLength(4);
  expect(buildings.filter(p => p.type === "farm")).toHaveLength(4);
  expect(buildings.find(p => p.service === "cows").district).toBe("countryside");
});
function lineDistance(p, a, b) {
  return (
    Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) /
    Math.hypot(b.x - a.x, b.y - a.y)
  );
}
it("todos os caminhos chegam a um destino e a rede inteira é conectada", () => {
  const physical = ruralMap.slots.filter(p => p.building);
  const visited = new Set([physical[0].id]);
  for (const road of ruralMap.roads) {
    expect(physical.some(p => p.id === road.from)).toBe(true);
    expect(physical.some(p => p.id === road.to)).toBe(true);
    for (const [index,id] of [road.from,road.to].entries()) {
      const property = physical.find(p => p.id === id);
      const endpoint = road.points[index];
      const control = ruralMap.slots.find(p => p.id === property.securityId);
      if (control) expect(endpoint).toEqual({x:control.sprite.x,y:control.sprite.y});
      else {
        expect(endpoint.x).toBe(property.sprite.x);
        expect(Math.abs(endpoint.y-property.sprite.y)).toBeLessThan(5);
      }
    }
  }
  let changed = true;
  while(changed) {
    changed = false;
    for (const r of ruralMap.roads) if(visited.has(r.from) || visited.has(r.to))
      for (const id of [r.from,r.to]) if(!visited.has(id)){visited.add(id);changed=true;}
  }
  expect(visited.size).toBe(physical.length);
});
it("as 14 lojas e equipes compartilham uma esquina real de duas ruas", () => {
  expect(ruralMap.intersections).toHaveLength(14);
  expect(ruralMap.roads.length).toBeGreaterThan(28);
  for (const sale of ruralMap.slots.filter((s) => s.type === "sale")) {
    const corner = ruralMap.intersections.find(
        (c) => c.id === sale.intersectionId,
      ),
      post = ruralMap.slots.find((s) => s.id === sale.securityId);
    expect(corner.saleId).toBe(sale.id);
    expect(post.intersectionId).toBe(corner.id);
    expect(post.sprite.x).toBe(corner.x);
    expect(post.sprite.y).toBe(corner.y);
    expect(corner.roadIds.length).toBeGreaterThanOrEqual(2);
    for (const id of corner.roadIds) {
      const road = ruralMap.roads.find((r) => r.id === id);
      expect(lineDistance(corner, ...road.points)).toBeLessThan(0.001);
    }
  }
});
it("ruas nas bordas ficam limitadas ao terreno sem extrapolar o cenário", () => {
  for (const road of ruralMap.roads) {
    const clipped = clipRoad(...road.points, ruralMap.width, ruralMap.height);
    if (clipped)
      for (const p of clipped) {
        expect(p.x).toBeGreaterThanOrEqual(120);
        expect(p.x).toBeLessThanOrEqual(ruralMap.width - 120);
        expect(p.y).toBeGreaterThanOrEqual(120);
        expect(p.y).toBeLessThanOrEqual(ruralMap.height - 120);
      }
  }
});
it("fazendas próprias/neutras ficam fora do núcleo de serviços e inimigos ao norte", () => {
  const farms = ruralMap.slots.filter(
    (p) => p.type === "farm" && p.owner !== "coalho",
  );
  expect(farms.every((p) => p.sprite.x < 500)).toBe(true);
  expect(
    ruralMap.slots
      .filter((p) => p.type === "service" && p.service !== "cows")
      .every((p) => p.district === "town"),
  ).toBe(true);
  expect(
    ruralMap.slots
      .filter((p) => p.owner === "coalho" && p.type !== "sale" && p.type !== "security")
      .every((p) => p.sprite.y < 700),
  ).toBe(true);
});
