import {rules} from '../data/game-rules.js';
export const cash=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function recruitmentCards(kind,assets) {
 return '<div class="recruit-grid">'+[1,2,3].map(level=>'<button class="recruit-card" type="button" data-action="'+(kind==='worker'?'chooseWorker':'chooseGuard')+'" data-level="'+level+'" aria-pressed="'+(level===1)+'"><img src="'+assets[kind==='worker'?'funcionario_nivel_'+level+'.png':'capangas_aliado_nivel_'+level+'.png']+'" alt="'+(kind==='worker'?'Funcionário':'Capangas')+' nível '+level+'"><strong>Nível '+level+'</strong></button>').join('')+'</div>';
}
export function recruitmentDetails(kind,level) {
 const tier=rules.workerTiers[level];
 const hire=kind==='worker'?tier.hire:rules.teamHirePrices[level-1];
 const salary=kind==='worker'?tier.salary:rules.teamSalaries[level-1];
 return '<p><strong>Contratação: '+cash(hire)+'</strong><br>Salário: '+cash(salary)+'/dia'+(kind==='worker'?'<br>Velocidade de produção: +'+Math.round(tier.speed*100)+'%':'<br>Equipe de três capangas para defesa e ataque.')+'</p>';
}
export function workerCards(factory,assets) {
 return '<div class="recruit-grid allocated-workers">'+(factory.workers ?? []).map(w=>'<article class="recruit-card"><img src="'+assets['funcionario_nivel_'+w.level+'.png']+'" alt="Funcionário nível '+w.level+'"><strong>Nível '+w.level+'</strong><small>'+cash(rules.workerTiers[w.level].salary)+'/dia</small><small>'+(w.missedWages ? w.missedWages+' dia(s) sem salário · suspenso':'Trabalhando')+'</small></article>').join('')+'</div>';
}
