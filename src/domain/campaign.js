import {ruralMap} from '../data/world.js';
import {rules,DAY} from '../data/game-rules.js';
import {companyShops,shopIsActive,sharedShopStock} from './shop-stock.js';
// Tempo de tolerância antes de declarar falência: o jogador é avisado e pode reagir.
export const BANKRUPTCY_GRACE = DAY;
const sum=stock=>Object.values(stock ?? {}).reduce((n,v)=>n+v,0);
// Insolvência: sem caixa, sem dinheiro a receber e sem nenhum caminho para voltar a vender.
// É conservadora de propósito: na dúvida, a partida continua.
export function insolvent(s,owner='player'){
 const company=s.companies[owner];
 if(!company)return false;
 const own=Object.values(s.properties).filter(p=>p.owner===owner);
 // Vacas produzem leite sem custo e podem ser revendidas: sempre há saída.
 if(own.some(p=>p.type==='farm'&&sum(p.cows)>0))return false;
 // Dinheiro parado nas lojas, leilões, ataques em curso e compensações ainda podem trazer caixa.
 if(own.some(p=>p.type==='sale'&&p.till>0))return false;
 if(Object.entries(s.auctions ?? {}).some(([id,a])=>a.bidder===owner||s.properties[id]?.owner===owner))return false;
 if(s.missions.some(m=>m.owner===owner||m.defender===owner)||s.pendingIncidents.some(m=>m.owner===owner||m.defender===owner))return false;
 if(Object.values(s.companies).some(c=>(c.retaliationDebts ?? []).some(d=>d.to===owner&&d.amount>0)))return false;
 const cash=company.cash;
 const factories=own.filter(p=>p.type==='factory');
 const packaging=factories.reduce((n,f)=>n+(f.packaging ?? 0),0);
 const canPack=packaging>=1||cash>=rules.packagingPrice||factories.some(f=>(f.workers ?? []).length&&cash>=rules.packagingPrice);
 const milk=own.filter(p=>p.type==='farm'||p.type==='factory').reduce((n,p)=>n+sum(p.milk),0);
 const goods=sum(sharedShopStock(s,owner))>0||factories.some(f=>sum(f.ready)>0||f.batches.length>0)||(milk>=1&&factories.length>0&&canPack);
 if(goods){
  const shops=companyShops(s,owner);
  if(shops.some(shopIsActive))return false;
  // Vendedor contratado volta ao trabalho se houver caixa para manutenção e salário no fechamento do dia.
  if(shops.some(p=>p.seller)&&cash>=rules.sellerSalary+shops.length*rules.shopDailyMaintenance)return false;
  if(shops.some(p=>!p.seller)&&cash>=rules.sellerHire)return false;
  if(!shops.length&&cash>=rules.propertyPrice)return false;
  return true;
 }
 // Sem mercadoria e sem vacas: só recomeça se puder comprar a vaca mais barata.
 return cash<rules.cows.weak.price;
}
export function territoryControl(s,owner) {
 const shops=Object.values(s.properties).filter(p=>p.type==='sale');
 return {owned:shops.filter(p=>p.owner===owner).length,total:shops.length};
}
export function dominanceProgress(s,owner){
 const properties=Object.values(s.properties).filter(p=>['sale','farm','factory'].includes(p.type));
 const shops=properties.filter(p=>p.type==='sale'),buildings=properties.filter(p=>p.type!=='sale');
 const company=s.companies[owner],bank=company?.bank,transport=company?.logistics;
 const bankOwned=Boolean(bank&&s.properties[bank.propertyId]?.owner===owner&&ruralMap.slots.find(p=>p.id===bank.propertyId)?.service==='bank');
 const transportOwned=Boolean(transport&&s.properties[transport.propertyId]?.owner===owner&&ruralMap.slots.find(p=>p.id===transport.propertyId)?.service==='logistics');
 const owned=properties.filter(p=>p.owner===owner).length+Number(bankOwned)+Number(transportOwned),total=properties.length+2;
 return {owned,total,remaining:total-owned,percent:100*owned/total,shops:{owned:shops.filter(p=>p.owner===owner).length,total:shops.length},buildings:{owned:buildings.filter(p=>p.owner===owner).length,total:buildings.length},bank:bankOwned,transport:transportOwned};
}
export function finalPurchaseAllowed(s,id,owner) {
 const targets=owner==='player'?['farm-coalho','factory-coalho']:['farm-ze'];
 const control=territoryControl(s,owner);
 return targets.includes(id) && control.owned===control.total && control.total>0 && s.properties[id].owner!==owner;
}
export function updateCampaign(s) {
 if(s.campaign?.outcome) return;
 // Falência do jogador: avisada ao entrar em insolvência e confirmada após o prazo de tolerância.
 if(insolvent(s,'player')) {
  s.insolventSince ??= s.time;
  if(s.time-s.insolventSince>=BANKRUPTCY_GRACE) {
   s.campaign={outcome:'defeat',reason:'bankruptcy',finishedAt:s.time};
   s.missions=[];s.pendingIncidents=[];
   for(const p of Object.values(s.properties)) if(p.team) p.team.busyUntil=0;
   return;
  }
 } else delete s.insolventSince;
 if(Object.keys(s.auctions ?? {}).length) return;
 if(dominanceProgress(s,'player').remaining===0)
  s.campaign={outcome:'victory',finishedAt:s.time};
 else if(dominanceProgress(s,'coalho').remaining===0) s.campaign={outcome:'defeat',finishedAt:s.time};
 if(s.campaign?.outcome) {
  s.missions=[];s.pendingIncidents=[];
  for(const p of Object.values(s.properties)) if(p.team) p.team.busyUntil=0;
 }
}
