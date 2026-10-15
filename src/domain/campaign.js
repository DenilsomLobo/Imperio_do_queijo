import {ruralMap} from '../data/world.js';
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
 if(s.campaign?.outcome || Object.keys(s.auctions ?? {}).length) return;
 if(dominanceProgress(s,'player').remaining===0)
  s.campaign={outcome:'victory',finishedAt:s.time};
 else if(dominanceProgress(s,'coalho').remaining===0) s.campaign={outcome:'defeat',finishedAt:s.time};
 if(s.campaign?.outcome) {
  s.missions=[];s.pendingIncidents=[];
  for(const p of Object.values(s.properties)) if(p.team) p.team.busyUntil=0;
 }
}
