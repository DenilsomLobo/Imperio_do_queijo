import { total } from "./game.js";
import {sharedShopStock} from './shop-stock.js';
import {salesOfDay} from './sales.js';
export function management(state, owner = "player") {
  const own = Object.values(state.properties).filter((p) => p.owner === owner);
  const properties = own.filter((p) =>
    ["farm", "factory", "sale"].includes(p.type),
  );
  const farms = own.filter((p) => p.type === "farm");
  const factories = own.filter((p) => p.type === "factory");
  const shops = own.filter((p) => p.type === "sale");
  const teams = own
    .filter((p) => p.type === "security" && p.team)
    .map((p) => p.team)
    .concat(state.companies[owner]?.reserveTeams ?? []);
  return {
    properties: properties.length,
    propertyIds: properties.map((p) => p.id),
    employees:
      factories.reduce((n,p)=>n+(p.workers ?? []).length,0) +
      shops.filter((p) => p.seller).length +
      teams.reduce((n, t) => n + t.count, 0),
    factoryWorkers: factories.reduce((n,p)=>n+(p.workers ?? []).length,0),
    sellers: shops.filter((p) => p.seller).length,
    guards: teams.reduce((n, t) => n + t.count, 0),
    cows: farms.reduce((n, p) => n + total(p.cows), 0),
    milk: farms.concat(factories).reduce((n, p) => n + total(p.milk), 0),
    cheese:
      factories.reduce((n, p) => n + total(p.ready), 0) +
      total(sharedShopStock(state,owner)),
    feed:farms.reduce((n,p)=>n+p.feed,0),
    packaging:factories.reduce((n,p)=>n+p.packaging,0),
    making: factories.reduce((n, p) => n + p.batches.length, 0),
    sold: state.ledger.filter(entry=>entry.owner===owner&&entry.kind==='Venda ao consumidor').length,
    revenue: state.companies[owner]?.revenue ?? 0,
    dailySales:salesOfDay(state,owner),
    cash: state.companies[owner]?.cash ?? 0,
    till: shops.reduce((n, p) => n + p.till, 0),
    enemies: Object.keys(state.companies).filter((id) => id !== owner).length,
  };
}
