import layout from "./rural-layout.json";
import { createSlot, diamond } from "../domain/maps.js";

export function createRuralMap() {
  const slots = [];
  for (const p of layout.properties) {
    const s = {
      ...createSlot("rural", p.x, p.y, p.id),
      name: p.name,
      type: p.type,
      owner: p.owner,
      building:
        p.asset ??
        (p.owner === "coalho"
          ? "Ponto_de_venda_inimiga.png"
          : "Ponto_de_venda_neutro.png"),
      level: p.level ?? 1,
      service: p.service ?? null,
      district: p.district ?? null,
      intersectionId: p.intersectionId ?? null,
      occupation: "occupied",
      polygon: diamond(p.x, p.y, p.width ?? 240, (p.width ?? 240) / 2),
      sprite: {
        x: p.x,
        y: p.y + 32,
        width: p.width ?? 240,
        depth: p.y,
      },
      rules: {
        buy: ["sale", "farm", "factory"].includes(p.type),
        sell: false,
        conquer: p.type === "sale",
      },
      securityId: p.control ? `${p.id}-control` : null,
    };
    slots.push(s);
    if (p.control) {
      const [x, y] = p.control;
      slots.push({
        ...createSlot("rural", x, y, s.securityId),
        name: `Controle de ${p.name}`,
        type: "security",
        owner: p.owner,
        level: 1,
        sprite: { x, y, width: 62, depth: y },
        polygon: diamond(x, y, 70, 40),
        rules: { buy: false, sell: false, conquer: true },
        saleId: s.id,
        district: p.district ?? null,
        intersectionId: p.intersectionId ?? null,
      });
    }
  }
  layout.land.forEach(([x, y], i) =>
    slots.push({
      ...createSlot("rural", x, y, `land-${i + 1}`),
      name: `Terreno rural ${i + 1}`,
      polygon: diamond(x, y, 170, 85),
      rules: { buy: false, sell: false, conquer: false },
    }),
  );
  return {
    version: 1,
    id: "rural",
    background: layout.background,
    width: layout.width,
    height: layout.height,
    layoutVersion: layout.layoutVersion,
    roads: layout.roads ?? [],
    roadTexture: layout.roadTexture ?? null,
    intersections: layout.intersections ?? [],
    slots,
  };
}
export const ruralMap = createRuralMap();
