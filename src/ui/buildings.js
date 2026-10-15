import {ruralMap} from '../data/world.js';
import {rules,propertyPurchasePrice,factoryProfile} from '../data/game-rules.js';
import {shopAsset} from '../map/presentation.js';
import {serviceKind} from '../domain/auctions.js';
const money=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function buildingCards(s,assets,owner='player',types=['farm','factory','sale','service']){
 const buildings=Object.values(s.properties).filter(p=>p.owner===owner&&types.includes(p.type));
 if(!buildings.length)return '<p>Nenhuma propriedade adquirida.</p>';
 return '<div class="building-grid">'+buildings.map(p=>{
  const slot=ruralMap.slots.find(slot=>slot.id===p.id),kind=serviceKind(p),auction=s.auctions?.[p.id];
  const price=kind==='bank'?rules.banks[p.level].hire:kind==='logistics'?rules.logistics.hire:propertyPurchasePrice(p);
  const daily=p.type==='sale'?rules.shopDailyMaintenance:p.type==='factory'?factoryProfile(p).daily:kind==='logistics'?rules.logistics.dailyFee:0;
  const available=['farm','factory','sale'].includes(p.type)||['bank','logistics'].includes(kind);
  const owner=s.companies[p.owner]?.name ?? (p.owner==='neutral'?'Disponível':'Serviço público');
  const maintenance=kind==='bank'?`${rules.banks[p.level].rate*100}% do resultado positivo/dia`:money(daily)+'/dia';
  return `<button type="button" class="building-card${auction?' is-disputed':''}" data-property="${p.id}"><span class="building-art"><img src="${assets[shopAsset(slot,p)]}" alt="${safe(slot.name)}"></span><strong>${safe(slot.name)}</strong><span>${safe(owner)}</span><span>${available?(kind?'Contrato: ':'Compra: ')+money(price):'Atendimento no local'}</span><span>Manutenção: ${available?maintenance:'sem diária do edifício'}</span>${p.maintenanceDebt?'<span>Pendente: '+money(p.maintenanceDebt)+'</span>':''}${auction?`<span class="building-dispute"><img src="${assets['icon_disputa.png']}" alt="Casa com duas espadas">Em disputa · ${money(auction.amount)}</span>`:'<span class="building-peace">Sem disputa</span>'}<span class="building-visit">Ir ao local ↗</span></button>`;
 }).join('')+'</div>';
}
