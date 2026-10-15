import {rules} from '../data/game-rules.js';
const money=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function combatUpgradeCards(post,assets){
 return '<section class="combat-upgrade-cards" aria-label="Melhorias de armamento e barricada">'+[
  {name:'Armamento',id:'armamento',action:'upgradeWeapon',current:post.team?.weapon ?? 0,prices:rules.weaponUpgrade,bonus:rules.weaponBonus,effect:'ataque',available:!!post.team},
  {name:'Barricada',id:'barricada',action:'upgradeBarricade',current:post.barricade ?? 0,prices:rules.barricadeUpgrade,bonus:rules.barricadeBonus,effect:'defesa',available:true},
 ].map(u=>'<h3>'+u.name+' · '+u.current+'/3'+(u.current===3?' · máximo':'')+'</h3><div class="combat-upgrade-grid">'+[1,2,3].map(level=>{
  const purchased=level<=u.current,next=u.available&&level===u.current+1;
  const status=purchased?(level===u.current?'Atual':'Adquirido'):!u.available?'Requer equipe':next?'Comprar':'Exige nível '+(level-1);
  const label=`${u.name} nível ${level}, +${Math.round(level*u.bonus*100)}% ${u.effect}, ${money(u.prices[level-1])}. ${status}.`;
  return `<button type="button" class="combat-upgrade-card${purchased?' is-purchased':''}${level===u.current?' is-current':''}${next?' is-next':''}" data-action="${u.action}" data-upgrade-level="${level}" aria-label="${label}" ${next?'':'disabled'}><img src="${assets['icon_'+u.id+'_'+level+'.png']}" alt="${u.name} com ${level} estrela${level===1?'':'s'}"><strong>Nível ${level}</strong><span>+${Math.round(level*u.bonus*100)}% ${u.effect}</span><span>${money(u.prices[level-1])}</span><b>${status}</b></button>`;
 }).join('')+'</div>').join('')+'<p class="upgrade-help">Clique no próximo nível para comprar. Custos por etapa; bônus acumulados. Armamento acompanha a equipe; barricada protege este posto.</p></section>';
}
