import {rules,DAY} from '../data/game-rules.js';
import {shopCapacity} from './shop-stock.js';
const sum=stock=>Object.values(stock ?? {}).reduce((n,v)=>n+v,0);
export function processLogistics(state,act,book) {
 for(const [owner,company] of Object.entries(state.companies)) {
  const contract=company.logistics;if(!contract)continue;
  if(state.time>=contract.nextFeeAt) {
   if(company.cash<rules.logistics.dailyFee){contract.suspended=true;continue;}
   book(owner,-rules.logistics.dailyFee,'Manutenção da transportadora',contract.propertyId,0,rules.logistics.dailyFee);
   contract.nextFeeAt=state.time+DAY;contract.suspended=false;
  }
  const own=Object.values(state.properties).filter(p=>p.owner===owner);
  const factories=own.filter(p=>p.type==='factory').sort((a,b)=>Number((b.workers ?? []).some(w=>!w.missedWages))-Number((a.workers ?? []).some(w=>!w.missedWages)));
  const shops=own.filter(p=>p.type==='sale').sort((a,b)=>Number(b.sellerActive)-Number(a.sellerActive));
  for(const farm of own.filter(p=>p.type==='farm')) for(const factory of factories) {
   if(sum(farm.milk)<1 || sum(factory.milk)>=Math.floor(rules.factoryMilkCapacity-sum(factory.milkProgress))) continue;
   const before=sum(farm.milk);
   act({type:'collectMilk',id:farm.id,target:factory.id},owner);
   contract.milkMoved+=before-sum(farm.milk);
  }
  for(const factory of factories) {
   if(!shops.length || sum(factory.ready)<1 || sum(company.shopStock)>=shopCapacity(state,owner))continue;
   const before=sum(factory.ready);
   act({type:'collectCheese',id:factory.id},owner);
   contract.cheeseMoved+=before-sum(factory.ready);
  }
 }
}
export function validateLogistics(company) {
 const c=company.logistics;
 return c==null || (typeof c.propertyId==='string' && Number.isFinite(c.startedAt) && Number.isFinite(c.nextFeeAt) && typeof c.suspended==='boolean' && [c.milkMoved,c.cheeseMoved].every(n=>Number.isFinite(n)&&n>=0));
}
