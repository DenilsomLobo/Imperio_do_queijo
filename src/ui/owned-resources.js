import {rules,DAY} from '../data/game-rules.js';
import {dairy} from '../data/dairy.js';
import {ruralMap} from '../data/world.js';
import {shopAsset} from '../map/presentation.js';
import {salePrice,shopIsActive} from '../domain/shop-stock.js';
import {salesOfDay} from '../domain/sales.js';
const cash=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=id=>ruralMap.slots.find(p=>p.id===id)?.name ?? id;
const own=(s,owner='player')=>Object.values(s.properties).filter(p=>p.owner===owner);
export function resourceCard(assets,{image,name,target,lines,kind}){
 const tag=target?'button':'article';
 return `<${tag} ${target?`type="button" data-property="${target}"`:''} class="owned-resource-card" data-resource-kind="${kind}"><span class="owned-resource-art"><img src="${assets[image]}" alt="${safe(name)}"></span><strong>${safe(name)}</strong>${lines.map(line=>'<span>'+safe(line)+'</span>').join('')}${target?'<b>Ir para '+safe(title(target))+' ↗</b>':''}</${tag}>`;
}
const card=resourceCard;
export function employeeCards(s,assets){
 const cards=[];
 for(const p of own(s)){
  for(const w of p.workers ?? []){const tier=rules.workerTiers[w.level];cards.push(card(assets,{kind:'worker',target:p.id,image:`funcionario_nivel_${w.level}.png`,name:`Funcionário nível ${w.level}`,lines:[`Contratação atual: ${cash(tier.hire)}`,`Salário: ${cash(tier.salary)}/dia`,`Alocado: ${title(p.id)}`,w.missedWages?`${w.missedWages} dia(s) em atraso · suspenso`:'Ativo']}));}
  if(p.type==='sale'&&p.seller)cards.push(card(assets,{kind:'seller',target:p.id,image:'icon_vendedor.png',name:'Vendedor',lines:[`Contratação: ${cash(rules.sellerHire)}`,`Salário: ${cash(rules.sellerSalary)}/dia`,`Alocado: ${title(p.id)}`,p.sellerActive?'Ativo':'Salário em atraso · suspenso']}));
  if(p.type==='security'&&p.team){const t=p.team;cards.push(card(assets,{kind:'guard',target:p.saleId,image:`capangas_aliado_nivel_${t.stars}.png`,name:`Equipe de ${t.count} capangas · nível ${t.stars}`,lines:[`Contratação da equipe: ${cash(rules.teamHirePrices[t.stars-1])}`,`Salário da equipe: ${cash(rules.teamSalaries[t.stars-1])}/dia`,`Alocada: ${title(p.saleId)}`,t.missedWages?`${t.missedWages} dia(s) em atraso`:'Contratada']}));}
 }
 for(const t of s.companies.player.reserveTeams ?? [])cards.push(card(assets,{kind:'reserve',image:`capangas_aliado_nivel_${t.stars}.png`,name:`Equipe de ${t.count} capangas · nível ${t.stars}`,lines:[`Contratação: ${cash(rules.teamHirePrices[t.stars-1])}`,`Salário: ${cash(rules.teamSalaries[t.stars-1])}/dia`,'Em reserva · sem loja alocada']}));
 return cards.length?'<div class="owned-resource-grid">'+cards.join('')+'</div>':'<p>Nenhum funcionário contratado.</p>';
}
export function cowManagementCards(s,assets){
 const cards=[];
 for(const farm of own(s).filter(p=>p.type==='farm'))for(const [id,n] of Object.entries(farm.cows).filter(([,n])=>n>0)){
  const cow=rules.cows[id];cards.push(card(assets,{kind:'cow',target:farm.id,image:dairy[id].cowAsset,name:`${cow.name} × ${n}`,lines:[`Compra atual: ${cash(cow.price)} por vaca`,`Valor de compra do grupo: ${cash(cow.price*n)}`,`Ração opcional: ${cow.feed*n} un./dia · ${cash(cow.feed*n*rules.feedPrice)}/dia`,`Alocadas: ${title(farm.id)}`]}));
 }
 return '<p class="dialog-lede">Custo diário de ração de cada grupo. Sem ração, as vacas produzem metade.</p>'+(cards.length?'<div class="owned-resource-grid">'+cards.join('')+'</div>':'<p>Nenhuma vaca adquirida.</p>');
}
export function shopManagementCards(s,assets,owner='player'){
 const cards=own(s,owner).filter(p=>p.type==='sale').map(shop=>{
  const t=s.properties[shop.securityId]?.team,guardDaily=t?rules.teamSalaries[t.stars-1]:0,sellerDaily=shop.seller?rules.sellerSalary:0,slot=ruralMap.slots.find(p=>p.id===shop.id);
  return card(assets,{kind:'shop',target:shop.id,image:shopAsset(slot,shop),name:title(shop.id),lines:[shopIsActive(shop)?'Loja ativa · vendedor concede +1% no preço':'Loja inativa · precisa de vendedor ativo',`Valor de compra: ${cash(rules.propertyPrice)}`,`Vendas hoje: ${cash(salesOfDay(s,owner,shop.id))}`,`Vendas ontem: ${cash(salesOfDay(s,owner,shop.id,Math.floor(s.time/DAY)-1))}`,t?`Proteção: ${t.count} capangas · nível ${t.stars}`:'Sem capangas alocados',`Loja: ${cash(rules.shopDailyMaintenance)}/dia`,`Vendedor: ${shop.seller?cash(sellerDaily)+'/dia'+(shop.sellerActive?' · ativo':' · suspenso'):'não contratado'}`,`Capangas: ${cash(guardDaily)}/dia`,`Manutenção total: ${cash(rules.shopDailyMaintenance+sellerDaily+guardDaily)}/dia`,`Saldo para coleta: ${cash(shop.till)}`]});
 });
 return `<p>Vendas do dia ${Math.floor(s.time/DAY)+1}: <strong>${cash(salesOfDay(s,owner))}</strong>. Faturamento real; transferir dinheiro da loja não gera nova venda.</p>`+(cards.length?'<div class="owned-resource-grid">'+cards.join('')+'</div>':'<p>Nenhum ponto de venda adquirido.</p>');
}
export function productionCards(s,assets){
 const cards=[];
 for(const factory of own(s).filter(p=>p.type==='factory')){
  const groups=new Map();
  for(const b of factory.batches){const key=[b.recipe,b.quality,b.phase].join(':');if(!groups.has(key))groups.set(key,{...b,count:0});groups.get(key).count++;}
  for(const b of groups.values()){const recipe=rules.recipes[b.recipe];cards.push(card(assets,{kind:'production',target:factory.id,image:dairy[b.quality].cheeseAsset,name:recipe.name,lines:[`${b.count} unidade(s) em ${b.phase==='production'?'fabricação':'maturação'}`,`Venda por unidade pronta: ${cash(salePrice(s,'player',b.recipe))}`,`Valor após concluir: ${cash(b.count*salePrice(s,'player',b.recipe))}`,`Fábrica: ${title(factory.id)}`]}));}
 }
 return '<h3>Queijos em produção</h3>'+(cards.length?'<div class="owned-resource-grid">'+cards.join('')+'</div>':'<p>Nenhum queijo em produção.</p>');
}
