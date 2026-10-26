import {dairy} from '../data/dairy.js';
import {rules} from '../data/game-rules.js';
import {sharedShopStock} from '../domain/shop-stock.js';
const number=n=>n.toLocaleString('pt-BR',{maximumFractionDigits:2});
export function inventoryRows(state,assets){
 const own=Object.values(state.properties).filter(p=>p.owner==='player');
 const entries=[['Ração','icon_racao.png',own.reduce((n,p)=>n+(p.feed ?? 0),0),'un.'],['Embalagens','icon_embalagem.png',own.reduce((n,p)=>n+(p.packaging ?? 0),0),'un.']];
 for(const [key,d] of Object.entries(dairy)){
  const n=own.reduce((n,p)=>n+(p.milk?.[key] ?? 0),0);
  if(n>0)entries.push(['Leite '+d.name,d.milkAsset,n,'L']);
 }
 const cheese=sharedShopStock(state);
 for(const p of own)for(const [key,n] of Object.entries(p.ready ?? {}))cheese[key]=(cheese[key] ?? 0)+n;
 for(const [key,n] of Object.entries(cheese)){
  const [recipe,quality]=key.split(':');
  if(n>0&&rules.recipes[recipe]&&dairy[quality])entries.push([rules.recipes[recipe].name,dairy[quality].cheeseAsset,n,'un.']);
 }
 return '<h3>Quantidades em estoque</h3><div class="inventory-grid">'+entries.map(([name,icon,n,unit])=>`<article class="inventory-item"><img src="${assets[icon]}" alt="${name}"><strong>${number(n)} ${unit}</strong><span>${name}</span></article>`).join('')+'</div><p class="dialog-lede">Ração fica nas fazendas; embalagens, nas queijarias. Lotes em produção aparecem em Estoque de queijo.</p>';
}
