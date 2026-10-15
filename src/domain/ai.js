import {rules,DAY,factoryProfile,propertyPurchasePrice} from '../data/game-rules.js';
import {salePrice,shopIsActive} from './shop-stock.js';
import {militaryReserve} from './security-network.js';
import {auctionDecision,serviceKind} from './auctions.js';
import {activeWorkers,productionMultiplier} from './workers.js';
import {ruralMap} from '../data/world.js';

const sum=stock=>Object.values(stock ?? {}).reduce((n,v)=>n+v,0);
const owned=(s,owner,type)=>Object.values(s.properties).filter(p=>p.owner===owner&&p.type===type);
const kinds=Object.keys(rules.cows);
const title=id=>ruralMap.slots.find(p=>p.id===id)?.name ?? id;

// Forecast is a planning estimate, never an entry in the financial ledger.
export function aiEconomy(s,owner='coalho',feedOverrides={}){
 const c=s.companies[owner],farms=owned(s,owner,'farm'),factories=owned(s,owner,'factory'),shops=owned(s,owner,'sale');
 const feedNeed=f=>Object.entries(f.cows).reduce((n,[k,count])=>n+count*rules.cows[k].feed,0);
 const food=f=>feedOverrides[f.id] ?? f.feed;
 const efficiency=f=>rules.unfedProduction+(1-rules.unfedProduction)*Math.min(1,food(f)/Math.max(1,feedNeed(f)));
 const daily=Object.fromEntries(kinds.map(k=>[k,farms.reduce((n,f)=>n+(f.cows[k]??0)*efficiency(f),0)]));
 const capacity=factories.reduce((n,f)=>n+factoryProfile(f).lines*productionMultiplier(f),0);
 const demand=kinds.reduce((n,k)=>n+daily[k]*rules.recipes[k].time/DAY,0);
 const throughput=demand?Math.min(1,capacity/demand):0;
 const selling=shops.some(shopIsActive);
 const revenue=selling?kinds.reduce((n,k)=>n+daily[k]*throughput*salePrice(s,owner,k),0):0;
 let expenses=shops.reduce((n,p)=>n+rules.shopDailyMaintenance+(p.seller?rules.sellerSalary:0),0);
 expenses+=factories.reduce((n,p)=>n+factoryProfile(p).daily+(p.workers??[]).reduce((v,w)=>v+rules.workerTiers[w.level].salary,0),0);
 expenses+=owned(s,owner,'security').reduce((n,p)=>n+(p.team?rules.teamSalaries[p.team.stars-1]:0),0);
 expenses+=(c.reserveTeams??[]).reduce((n,t)=>n+rules.teamSalaries[t.stars-1],0);
 expenses+=farms.reduce((n,f)=>n+Math.min(food(f),feedNeed(f))*rules.feedPrice,0);
 expenses+=sum(daily)*throughput*rules.packagingPrice+(c.logistics?rules.logistics.dailyFee:0);
 if(c.bank)expenses+=Math.max(0,revenue-expenses)*rules.banks[c.bank.level].rate;
 const debts=(c.bankDebt??0)+(c.retaliationDebts??[]).reduce((n,d)=>n+d.amount,0)+Object.values(s.properties).filter(p=>p.owner===owner).reduce((n,p)=>n+(p.maintenanceDebt??0)+(p.workers??[]).reduce((v,w)=>v+(w.missedWages??0)*rules.workerTiers[w.level].salary,0)+(p.team?(p.team.missedWages??0)*rules.teamSalaries[p.team.stars-1]:0),0);
 return {revenue,expenses,margin:revenue-expenses,reserve:Math.max(militaryReserve(s,owner),Math.ceil(2*expenses))+debts,daily,demand,capacity};
}

export function runAi(s,{act,estimate,roadConnected},offline=false,owner='coalho'){
 const c=s.companies[owner];if(!c||s.campaign?.outcome)return;
 let actions=0;
 const safe=command=>{try{act(s,command,owner);actions++;return true;}catch{return false;}};
 const afford=(cost,extraDaily=0)=>c.cash>=cost+aiEconomy(s,owner).reserve+2*extraDaily;
 const farms=()=>owned(s,owner,'farm'),factories=()=>owned(s,owner,'factory'),shops=()=>owned(s,owner,'sale');
 // Collect every real till, rather than only the first shop's cash.
 for(const shop of shops())if(shop.till>0)safe({type:'collectCash',id:shop.id});
 for(const shop of shops())if(!shop.seller&&afford(rules.sellerHire,rules.sellerSalary))safe({type:'hireSeller',id:shop.id});
 for(const f of factories()){
  const debt=(f.workers??[]).reduce((n,w)=>n+(w.missedWages??0)*rules.workerTiers[w.level].salary,0);
  if(debt&&c.cash>=debt)safe({type:'payWorkerWages',id:f.id});
  if(sum(f.ready)>0)safe({type:'collectCheese',id:f.id});
 }
 for(const farm of farms()){
  // Feeding is optional: buy it only when the extra half litre pays its cost.
  const target=Object.entries(farm.cows).reduce((n,[k,count])=>n+count*rules.cows[k].feed,0);
  const quantity=Math.min(rules.supplyPurchaseLimit,Math.max(0,Math.ceil(target-farm.feed)));
  const profitable=quantity&&aiEconomy(s,owner,{[farm.id]:farm.feed+quantity}).margin>aiEconomy(s,owner).margin;
  if(profitable&&quantity&&afford(quantity*rules.feedPrice))safe({type:'buyFeed',id:farm.id,quantity});
  for(const f of factories().sort((a,b)=>sum(a.milk)-sum(b.milk)))if(sum(farm.milk)>0&&sum(f.milk)<rules.factoryMilkCapacity)safe({type:'collectMilk',id:farm.id,target:f.id});
 }
 for(const f of factories()){
  const room=Math.max(0,Math.min(factoryProfile(f).lines-f.batches.filter(b=>b.phase==='production').length,rules.cheeseCapacity-sum(f.ready)-f.batches.length));
  const quantity=Math.min(rules.supplyPurchaseLimit,Math.max(0,Math.min(sum(f.milk),room)-f.packaging));
  if(quantity&&c.cash>=quantity*rules.packagingPrice)safe({type:'buyPackaging',id:f.id,quantity});
  const recipes=kinds.filter(k=>(f.milk[k]??0)>0).sort((a,b)=>rules.recipes[b].price/rules.recipes[b].time-rules.recipes[a].price/rules.recipes[a].time);
  for(let line=0;line<room&&f.packaging>0;line++){
   const k=recipes.find(k=>(f.milk[k]??0)>=rules.recipes[k].milk);if(!k)break;
   if(!safe({type:'produce',id:f.id,recipe:k,quality:k}))break;
  }
 }
 // Offline maintains production, but does not buy territory or launch military actions.
 if(offline)return;
 for(const p of owned(s,owner,'security'))if(p.team?.missedWages&&c.cash>=p.team.missedWages*rules.teamSalaries[p.team.stars-1])safe({type:'payTeamWages',id:p.id});
 let economy=aiEconomy(s,owner),focus='Produzir e preservar caixa';
 // One productive investment per cycle. Fill real capacity, then replace low-output cows.
 const farm=farms().find(f=>!s.auctions?.[f.id]&&sum(f.cows)<rules.farmCapacities[f.level-1]);
 if(farm&&factories().length&&shops().some(shopIsActive)&&economy.demand<economy.capacity){
  const species=kinds.filter(k=>afford(rules.cows[k].price)&&economy.demand+rules.recipes[k].time/DAY*rules.unfedProduction<=economy.capacity).sort((a,b)=>rules.recipes[b].price-rules.recipes[a].price)[0];
  if(species&&safe({type:'buyCow',id:farm.id,species}))focus='Ampliar rebanho: '+rules.cows[species].name;
 }else if(!farm){
  const candidate=farms().filter(f=>!s.auctions?.[f.id]).flatMap(f=>kinds.flatMap(old=>[...kinds].sort((a,b)=>rules.recipes[b].price-rules.recipes[a].price).filter(k=>rules.recipes[k].price>rules.recipes[old].price&&afford(rules.cows[k].price)&&economy.demand+(rules.recipes[k].time-rules.recipes[old].time)/DAY*rules.unfedProduction<=economy.capacity).map(k=>({f,old,k})))).find(({f,old})=>(f.cows[old]??0)>0&&(f.cowAges?.[old]??[]).some(at=>s.time-at>=rules.cowResaleDelay));
  if(candidate){const {f,old,k}=candidate;if(safe({type:'sellCow',id:f.id,species:old,quantity:1}))safe({type:'buyCow',id:f.id,species:k});}
 }
 economy=aiEconomy(s,owner);
 // Employees only pay off when acceleration can unlock enough daily output.
 for(const f of factories()){
  const pending=kinds.reduce((n,k)=>n+(f.milk[k]??0)*rules.recipes[k].price,0);
  if(!s.auctions?.[f.id]&&!activeWorkers(f).length&&aiEconomy(s,owner).margin>rules.workerTiers[1].salary&&pending*rules.workerTiers[1].speed>rules.workerTiers[1].salary&&afford(rules.workerTiers[1].hire,rules.workerTiers[1].salary))safe({type:'hireWorker',id:f.id,level:1});
 }
 if(s.time>=rules.aiAggressionAfter){
  const bid=auctionDecision(s,owner,{economy:aiEconomy(s,owner),dominance:true});
  if(bid&&safe(bid))focus='Disputar '+title(bid.id);
  // Buy missing objectives progressively, never with money reserved in a bid.
  const missing=Object.values(s.properties).filter(p=>['sale','farm','factory'].includes(p.type)&&p.owner==='neutral'&&!s.auctions?.[p.id]);
  const opportunities=missing.filter(p=>p.type!=='sale'||owned(s,owner,'security').some(home=>roadConnected(home.id,p.securityId)));
  opportunities.sort((a,b)=>propertyPurchasePrice(a)-propertyPurchasePrice(b));
  for(const p of opportunities){
   const daily=p.type==='sale'?rules.shopDailyMaintenance+rules.sellerSalary+rules.teamSalaries[0]:p.type==='factory'?factoryProfile(p).daily:0;
   const margin=aiEconomy(s,owner).margin;
   const recovery=p.type==='farm'&&!farms().length||p.type==='factory'&&!factories().length||p.type==='sale'&&!shops().length;
   if((recovery||margin>daily)&&afford(propertyPurchasePrice(p),daily)&&safe({type:'buyProperty',id:p.id})){focus='Expandir: '+title(p.id);break;}
  }
  for(const p of Object.values(s.properties).filter(p=>p.type==='service'&&['public','neutral'].includes(p.owner)&&!s.auctions?.[p.id])){
   const kind=serviceKind(p),bank=kind==='bank';if(!['bank','logistics'].includes(kind)||c[bank?'bank':'logistics'])continue;
   const daily=bank?0:rules.logistics.dailyFee,cost=bank?rules.banks[p.level].hire:rules.logistics.hire;
   if(aiEconomy(s,owner).margin>daily&&afford(cost,daily)&&safe({type:bank?'hireBank':'hireLogistics',id:p.id}))focus='Controlar serviço: '+title(p.id);
  }
  const frontier=owned(s,owner,'security').map(post=>({post,targets:Object.values(s.properties).filter(p=>p.type==='security'&&p.owner!==owner&&p.owner!=='neutral'&&roadConnected(post.id,p.id))})).filter(f=>f.targets.length&&f.post.team);
  for(const {post,targets} of frontier){
   if(post.team.busyUntil>s.time||post.team.recoverUntil>s.time)continue;
   const threatened=targets.some(p=>p.team?.count>0);
   if(threatened&&post.barricade<3&&afford(rules.barricadeUpgrade[post.barricade]))safe({type:'upgradeBarricade',id:post.id});
   if(post.team.weapon<3&&afford(rules.weaponUpgrade[post.team.weapon]))safe({type:'upgradeWeapon',id:post.id});
   if(post.team.stars<3){const extra=rules.teamSalaries[post.team.stars]-rules.teamSalaries[post.team.stars-1];if(aiEconomy(s,owner).margin>extra&&afford(rules.starUpgrade[post.team.stars],extra))safe({type:'upgradeStars',id:post.id});}
  }
  const attacks=frontier.flatMap(({post,targets})=>targets.filter(p=>!s.missions.some(m=>m.to===p.id)).map(target=>({post,target,info:estimate(s,post.id,target.id)}))).filter(a=>a.post.team.cooldownUntil<=s.time&&a.info.attack>0&&a.info.chance>=rules.aiAttackChance).sort((a,b)=>b.info.chance-a.info.chance);
  const next=attacks[0];if(next&&afford(rules.attackCost)&&safe({type:'attack',id:next.post.id,target:next.target.id}))focus='Atacar '+title(next.target.saleId);
 }
 economy=aiEconomy(s,owner);
 c.strategy={at:s.time,focus,actions,projectedRevenue:Math.round(economy.revenue),projectedExpenses:Math.round(economy.expenses),reserve:Math.ceil(economy.reserve),blocked:c.cash<economy.reserve?'Caixa abaixo da reserva operacional':economy.margin<=0?'Produção projetada ainda não cobre as diárias':null};
}
