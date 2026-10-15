import {rules,factoryProfile} from '../data/game-rules.js';
export function garrisonCount(state,owner){
 if(!state?.companies[owner])return 0;
 return Object.values(state.properties).filter(shop=>{
  if(shop.type!=='sale'||shop.owner!==owner)return false;
  const post=state.properties[shop.securityId];
  return post?.owner===owner&&post.team?.count>0;
 }).length;
}
export const garrisonBonus=(state,owner)=>garrisonCount(state,owner)*rules.garrisonBonus;
export function militaryReserve(state,owner,extraDaily=0){
 let daily=extraDaily;
 for(const p of Object.values(state.properties).filter(p=>p.owner===owner)){
  if(p.type==='sale')daily+=rules.shopDailyMaintenance+(p.seller?rules.sellerSalary:0);
  if(p.type==='security'&&p.team)daily+=rules.teamSalaries[p.team.stars-1];
  if(p.type==='factory')daily+=factoryProfile(p).daily+(p.workers ?? []).reduce((n,w)=>n+rules.workerTiers[w.level].salary,0);
 }
 for(const t of state.companies[owner].reserveTeams ?? [])daily+=rules.teamSalaries[t.stars-1];
 if(state.companies[owner].logistics)daily+=rules.logistics.dailyFee;
 return Math.max(10000,2*daily);
}
