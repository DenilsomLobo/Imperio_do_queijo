import {dominanceProgress} from '../domain/campaign.js';
export function dominanceBars(s){
 const bars=[['player','Vitória','victory'],['coalho','Derrota: avanço do rival','defeat']].map(([owner,label,kind])=>{
  const d=dominanceProgress(s,owner);
  return `<div class="dominance-${kind}"><label>${label} · ${d.owned}/${d.total} objetivos · ${Math.round(d.percent)}%<progress aria-label="${label}" value="${d.owned}" max="${d.total}"></progress></label><small>Lojas ${d.shops.owned}/${d.shops.total} · fazendas/fábricas ${d.buildings.owned}/${d.buildings.total} · banco ${d.bank?'✓':'pendente'} · transporte ${d.transport?'✓':'pendente'} · faltam ${d.remaining}</small></div>`;
 }).join('');
 const result=s.campaign?.outcome==='victory'?'Vitória registrada.':s.campaign?.outcome==='defeat'?'Derrota registrada.':Object.keys(s.auctions ?? {}).length?'Disputas abertas devem encerrar antes do resultado final.':'Domine todas as lojas, fazendas e fábricas, qualquer um dos bancos e a transportadora.';
 return '<section class="dominance-bars" aria-label="Progresso da campanha">'+bars+'<p>'+result+'</p></section>';
}
