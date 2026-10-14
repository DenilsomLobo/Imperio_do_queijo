export function territoryControl(s,owner) {
 const shops=Object.values(s.properties).filter(p=>p.type==='sale');
 return {owned:shops.filter(p=>p.owner===owner).length,total:shops.length};
}
export function finalPurchaseAllowed(s,id,owner) {
 const targets=owner==='player'?['farm-coalho','factory-coalho']:['farm-ze'];
 const control=territoryControl(s,owner);
 return targets.includes(id) && control.owned===control.total && control.total>0 && s.properties[id].owner!==owner;
}
export function updateCampaign(s) {
 if(s.campaign?.outcome) return;
 if(s.properties['farm-coalho'].owner==='player' && s.properties['factory-coalho'].owner==='player'
  && territoryControl(s,'player').owned===territoryControl(s,'player').total)
  s.campaign={outcome:'victory',finishedAt:s.time};
 else if(s.properties['farm-ze'].owner==='coalho') s.campaign={outcome:'defeat',finishedAt:s.time};
 if(s.campaign?.outcome) {
  s.missions=[];s.pendingIncidents=[];
  for(const p of Object.values(s.properties)) if(p.team) p.team.busyUntil=0;
 }
}
