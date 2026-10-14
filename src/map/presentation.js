export function collectorPosition(slot) {
  return {
    x: slot.sprite.x,
    y: slot.sprite.y - slot.sprite.width - 38,
  };
}
export function collectionAsset(property) {
  if (property.owner !== "player") return null;
  const sum = stock => Object.values(stock ?? {}).reduce((n,v)=>n+v,0);
  if (property.type === "farm" && sum(property.milk) >= 1) return "icon_leite.png";
  if (property.type === "factory" && sum(property.ready) >= 1) return "icon_queijo.png";
  if (property.type === "sale" && property.till >= 100) return "icon_money.png";
  return null;
}
export function shopAsset(slot, property) {
  if (property.type !== "sale") return slot.building;
  return property.owner === "player" ? "Ponto_de_venda_aliado.png"
    : property.owner === "neutral" ? "Ponto_de_venda_neutro.png" : "Ponto_de_venda_inimiga.png";
}
export function guardAsset(property) {
  if (!property.team) return property.owner === "player" ? "bandeira_capanga_aliado.png"
    : property.owner === "neutral" ? "bandeira_capanga_neutra.png" : "bandeira_capanga_inimiga.png";
  return `capangas_${property.owner === "player" ? "aliado" : "inimigos"}_nivel_${property.team.stars}.png`;
}
export function combatIcons(state, postId) {
  const missions = [...state.missions, ...state.pendingIncidents];
  return [
    ...(missions.some(m=>m.from === postId) ? ["icon_ataque.png"] : []),
    ...(missions.some(m=>m.to === postId) ? ["icon_defesa.png"] : []),
  ];
}
