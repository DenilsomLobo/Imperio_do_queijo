import { rules, DAY } from "./game-rules.js";
// Compatibilidade com o contrato original; os valores ativos vêm de game-rules.js.
export const RULES_VERSION = rules.version;
export const balance = Object.freeze({
  initialCash: rules.initialCash / 100,
  initialWeakMilk: rules.initialMilk,
  initialPackaging: rules.initialPackaging,
  initialWeakCheese: rules.initialCheese,
  realMsPerDay: DAY,
  offlineLimitMs: rules.offlineLimit,
  speeds: [1, 2, 4],
  farmCapacities: [rules.farmCapacity, 12, 25, 50],
  stars: rules.stars,
  weaponBonus: rules.weaponBonus,
  barricadeBonus: rules.barricadeBonus,
});
