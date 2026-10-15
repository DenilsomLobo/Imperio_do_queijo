import {rules,DAY,propertyPurchasePrice,factoryProfile} from '../data/game-rules.js';
import {ruralMap} from '../data/world.js';
const assert=(ok,message)=>{if(!ok)throw Error(message);};
export const serviceKind=p=>ruralMap.slots.find(slot=>slot.id===p?.id)?.service;
export const auctionEligible=p=>p&&(['farm','factory'].includes(p.type)||p.type==='service'&&['bank','logistics'].includes(serviceKind(p)));
export function propertyValuation(p){
 if(!auctionEligible(p))return 0;
 if(p.type==='farm')return propertyPurchasePrice(p)+Object.entries(p.cows).reduce((n,[k,count])=>n+rules.cows[k].price*count,0);
 if(p.type==='factory')return propertyPurchasePrice(p)+(p.workers ?? []).reduce((n,w)=>n+rules.workerTiers[w.level].hire,0);
 return serviceKind(p)==='bank'?rules.banks[p.level].hire:rules.logistics.hire;
}
export const minimumBid=(s,p)=>Math.ceil((s.auctions?.[p.id]?.amount ?? propertyValuation(p))*(100+Math.round(rules.auctionIncrement*100))/100);
export function placeBid(s,id,owner,amount,book){
 const p=s.properties[id];assert(auctionEligible(p),'Esta propriedade não aceita disputa.');assert(s.companies[owner],'Empresa inválida.');
 const current=s.auctions?.[id];assert(current||p.owner!==owner,'Você já possui esta propriedade.');
 assert(!current||s.time<current.endsAt,'O leilão já encerrou.');assert(current?.bidder!==owner,'Sua empresa já tem o maior lance.');
 assert(Number.isSafeInteger(amount)&&amount>=minimumBid(s,p),'Lance abaixo do mínimo: é necessário aumentar 10%.');
 assert(s.companies[owner].cash>=amount,'Caixa insuficiente para reservar o lance.');
 if(current)book(current.bidder,current.amount,'Devolução de lance superado',id,0,0);
 book(owner,-amount,'Reserva de lance',id,0,0);
 s.auctions ??= {};
 s.auctions[id]={id,seller:current?.seller ?? p.owner,bidder:owner,amount,valuation:current?.valuation ?? propertyValuation(p),startedAt:current?.startedAt ?? s.time,endsAt:current?.endsAt ?? s.time+rules.auctionDays*DAY};
}
export function finishAuctions(s,book,transfer,report){
 for(const [id,a] of Object.entries(s.auctions ?? {})){
  if(a.endsAt>s.time)continue;
  const p=s.properties[id];
  if(p.owner!==a.seller){book(a.bidder,a.amount,'Leilão cancelado: devolução',id,0,0);delete s.auctions[id];continue;}
  if(a.bidder===a.seller){book(a.bidder,a.amount,'Defesa de propriedade: devolução',id,0,0);report(id+': dono cobriu o lance e manteve a propriedade.');}
  else{
   book(a.bidder,0,'Aquisição em leilão',id,0,a.amount);
   if(s.companies[a.seller])book(a.seller,a.amount,'Venda de propriedade em leilão',id,a.amount,0);
   transfer(p,a.bidder);report(id+': leilão encerrado. Novo dono: '+s.companies[a.bidder].name+'. Valor: R$ '+(a.amount/100).toLocaleString('pt-BR')+'.');
  }
  delete s.auctions[id];
 }
}
export function validateAuctions(s){
 return Object.entries(s.auctions ?? {}).every(([id,a])=>a.id===id&&auctionEligible(s.properties[id])&&s.properties[id].owner===a.seller&&s.companies[a.bidder]&&Number.isSafeInteger(a.amount)&&a.amount>0&&Number.isFinite(a.startedAt)&&Number.isFinite(a.endsAt)&&a.endsAt>a.startedAt);
}
export function auctionDecision(s,owner='coalho'){
 const c=s.companies[owner],owned=Object.values(s.properties).filter(p=>p.owner===owner),ownFarms=owned.filter(p=>p.type==='farm'),ownFactories=owned.filter(p=>p.type==='factory');
 const daily=owned.reduce((n,p)=>n+(p.type==='factory'?factoryProfile(p).daily+(p.workers ?? []).reduce((v,w)=>v+rules.workerTiers[w.level].salary,0):p.type==='sale'?rules.shopDailyMaintenance+(p.seller?rules.sellerSalary:0):p.type==='farm'?Object.entries(p.cows).reduce((v,[k,count])=>v+rules.cows[k].feed*count*rules.feedPrice,0):0),0);
 const reserve=Math.max(10000,2*daily);
 for(const p of Object.values(s.properties)){
  if(!auctionEligible(p))continue;
  const a=s.auctions?.[p.id];if(a?.bidder===owner||!a&&p.owner===owner)continue;
  const amount=minimumBid(s,p);if(c.cash<amount+reserve)continue;
  let margin=0,needed=false;
  if(p.type==='farm'){
   margin=Object.entries(p.cows).reduce((n,[k,count])=>n+count*Math.max(0,rules.recipes[k].price-rules.cows[k].feed*rules.feedPrice-rules.packagingPrice),0);
   needed=p.owner===owner||!ownFarms.length||ownFarms.every(f=>Object.values(f.cows).reduce((n,v)=>n+v,0)>=rules.farmCapacities[f.level-1]);
  }else if(p.type==='factory'){
   const supply=ownFarms.reduce((n,f)=>n+Object.entries(f.cows).reduce((v,[k,count])=>v+count*rules.recipes[k].price,0),0);
   margin=Math.max(0,supply-factoryProfile(p).daily-(p.workers ?? []).reduce((n,w)=>n+rules.workerTiers[w.level].salary,0));
   needed=p.owner===owner||!ownFactories.length||ownFactories.every(f=>f.batches.length>=factoryProfile(f).lines);
  }else{
   needed=p.owner===owner&&Boolean(serviceKind(p)==='bank'?c.bank:c.logistics);
   const revenue=Math.max(0,c.dailyFinance?.revenue ?? 0);
   margin=serviceKind(p)==='bank'?revenue*0.05:Math.max(0,revenue*0.2-rules.logistics.dailyFee);
  }
  const economicValue=propertyValuation(p)+margin*30;
  if(needed&&margin>0&&amount<=economicValue)return {type:'bidProperty',id:p.id,amount};
 }
 return null;
}
