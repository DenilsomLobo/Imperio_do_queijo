import {buildingCards} from './buildings.js';
import {shopManagementCards,resourceCard} from './owned-resources.js';
import {dominanceBars} from './dominance.js';
import {attackStrength,defenseStrength} from '../domain/game.js';
import {rules} from '../data/game-rules.js';
import {ruralMap} from '../data/world.js';
const money=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=id=>ruralMap.slots.find(p=>p.id===id)?.name ?? id;
const number=n=>n.toLocaleString('pt-BR',{maximumFractionDigits:2});
export function enemyManagement(s,assets){
 return dominanceBars(s)+Object.entries(s.companies).filter(([owner])=>owner!=='player').map(([owner,company])=>{
  const posts=Object.values(s.properties).filter(p=>p.type==='security'&&p.owner===owner&&p.team);
  const plan=company.strategy;
  const strategy=plan?`<section class="enemy-strategy"><h3>Estratégia do rival</h3><p>${safe(plan.focus)}. Ações no último ciclo: ${plan.actions}.</p><p>Estimativa por dia: receita ${money(plan.projectedRevenue)}, despesas ${money(plan.projectedExpenses)}. Reserva operacional: ${money(plan.reserve)}.</p>${plan.blocked?`<p>${safe(plan.blocked)}.</p>`:''}<small>Projeção com rebanho, alimentação e capacidade atuais; não é dinheiro garantido nem lançamento financeiro.</small></section>`:'<p>Aguardando a primeira decisão estratégica do rival.</p>';
  const cards=posts.map(p=>{const t=p.team;return resourceCard(assets,{kind:'enemy-guard',target:p.saleId,image:`capangas_inimigos_nivel_${t.stars}.png`,name:`${t.count} capangas · nível ${t.stars}`,lines:[`Alocados: ${title(p.saleId)}`,`Contratação atual: ${money(rules.teamHirePrices[t.stars-1])}`,`Salário: ${money(rules.teamSalaries[t.stars-1])}/dia`,`Ataque: ${number(attackStrength(t,s.time,s,owner))} · defesa: ${number(defenseStrength(p,s.time,s))}`,`Moral: ${Math.round(t.moral*100)}%`,t.busyUntil>s.time?'Em missão':t.recoverUntil>s.time?'Em recuperação':'Alocados no posto']});});
  for(const t of company.reserveTeams ?? [])cards.push(resourceCard(assets,{kind:'enemy-reserve',image:`capangas_inimigos_nivel_${t.stars}.png`,name:`${t.count} capangas · nível ${t.stars}`,lines:['Em reserva · sem loja',`Salário: ${money(rules.teamSalaries[t.stars-1])}/dia`]}));
  return `<section class="enemy-management"><h3>${safe(company.name)}</h3><p>Caixa real: ${money(company.cash)}. Clique em um cartão para visitar o estabelecimento.</p>${strategy}<h3>Fazendas, fábricas e contratos do rival</h3>${buildingCards(s,assets,owner,['farm','factory','service'])}<h3>Pontos de venda do rival</h3>${shopManagementCards(s,assets,owner)}<h3>Capangas do rival</h3>${cards.length?'<div class="owned-resource-grid">'+cards.join('')+'</div>':'<p>Nenhuma equipe contratada.</p>'}</section>`;
 }).join('');
}
