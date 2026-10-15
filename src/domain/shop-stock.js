import {rules} from '../data/game-rules.js';
export const companyShops=(s,owner='player')=>Object.values(s.properties).filter(p=>p.type==='sale'&&p.owner===owner);
export const shopBonus=(s,owner='player')=>s.companies[owner]?Math.max(0,companyShops(s,owner).length-1)*rules.extraShopSaleBonus:0;
export const shopIsActive=shop=>Boolean(shop?.seller&&shop.sellerActive);
export const salePrice=(s,owner,recipe,shop)=>Math.round(rules.recipes[recipe].price*(1+shopBonus(s,owner))*(1+((shop?shopIsActive(shop):companyShops(s,owner).some(shopIsActive))?rules.sellerSaleBonus:0)));
export const shopCapacity=(s,owner='player')=>companyShops(s,owner).length*rules.shopCapacity;
// Only company storage owns merchandise. Property stocks are imported once and cleared.
export function migrateShopStock(s){
 for(const c of Object.values(s.companies))c.shopStock ??= {};
 for(const p of Object.values(s.properties)){
  if(p.type!=='sale'||!s.companies[p.owner])continue;
  const stock=s.companies[p.owner].shopStock;
  for(const [key,n] of Object.entries(p.stock ?? {}))stock[key]=(stock[key] ?? 0)+n;
  p.stock={};
 }
}
export function sharedShopStock(s,owner='player'){
 const stock={...s.companies[owner]?.shopStock};
 for(const p of companyShops(s,owner))for(const [key,n] of Object.entries(p.stock ?? {}))stock[key]=(stock[key] ?? 0)+n;
 return stock;
}
