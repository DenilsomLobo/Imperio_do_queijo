import {garrisonBonus,garrisonCount} from '../domain/security-network.js';
import {rules} from '../data/game-rules.js';
import {attackStrength,defenseStrength,chance} from '../domain/game.js';
const number=n=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:2});
const bar=(value,max,tone)=>`<i class="meter tone-${tone}"><b style="width:${Math.min(100,max?value/max*100:0).toFixed(1)}%"></b></i>`;
export function combatInfo(post,time,assets={},state) {
 const team=post.team,base=team?team.count*rules.stars[team.stars-1]:0;
 const attack=attackStrength(team,time,state,post.owner),defense=defenseStrength(post,time,state);
 const weapon=(team?.weapon ?? 0)*rules.weaponBonus*100,barricade=post.barricade*rules.barricadeBonus*100;
 const art=team?assets['capangas_'+(post.owner==='player'?'aliado':'inimigos')+'_nivel_'+team.stars+'.png']:null;
 // Referência visual: força de uma equipe nível 3 completa e equipada.
 const scale=Math.max(attack,defense,3*rules.stars[2]*(1+3*rules.weaponBonus)*1.6);
 return '<section class="combat-info" aria-label="Ataque e defesa do posto">'+
 (art?'<img class="combat-team-art" src="'+art+'" alt="Equipe de capangas nível '+team.stars+'">':'')+
 '<div class="combat-values"><div><span>Dano de ataque</span><strong>'+number(attack)+'</strong>'+bar(attack,scale,'attack')+'</div><div><span>Força de defesa</span><strong>'+number(defense)+'</strong>'+bar(defense,scale,'defense')+'</div></div>'+
 (team?'<div class="chip-row"><span class="chip">'+team.count+' capangas · '+'★'.repeat(team.stars)+'</span><span class="chip">Força base '+number(base)+'</span><span class="chip tone-'+(team.moral<0.5?'bad':team.moral<1?'warn':'good')+'">Moral '+Math.round(team.moral*100)+'%</span></div>':'<p class="hint">Posto sem equipe: ataque e defesa são zero.</p>')+
 '<div class="chip-row"><span class="chip tone-neutral">Armamento '+(team?.weapon ?? 0)+'/3 · +'+number(weapon)+'% no ataque</span><span class="chip tone-neutral">Barricada '+post.barricade+'/3 · +'+number(barricade)+'% na defesa</span></div>'+
 '<p class="garrison-network" data-tip="Cada loja com equipe soma +'+number(rules.garrisonBonus*100)+'% para toda a empresa. Reservas não contam."><b>Rede de proteção: +'+number(garrisonBonus(state,post.owner)*100)+'% no ataque e na defesa</b> · '+garrisonCount(state,post.owner)+' loja(s) com equipe</p>'+
 '<details class="combat-rules" data-keep="combat-rules"><summary>Regras da disputa</summary>'+
 '<p><b>Rede de proteção.</b> +'+number(rules.garrisonBonus*100)+'% por loja com equipe. Uma equipe conta uma vez, independentemente de quantidade ou estrelas. Reservas não contam. Equipes alocadas continuam contando durante missão, recuperação ou atraso salarial; sua própria força permanece sujeita à moral e disponibilidade.</p>'+
 '<p><b>Armamento</b> soma +'+number(rules.weaponBonus*100)+'% à força base de ataque por melhoria, até +'+number(3*rules.weaponBonus*100)+'%, e acompanha a equipe. <b>Barricada</b> soma +'+number(rules.barricadeBonus*100)+'% à defesa por melhoria, até +'+number(3*rules.barricadeBonus*100)+'%, protege somente este posto e precisa de equipe.</p>'+
 '<p class="retaliation-info"><b>Retaliação por defesa vencedora.</b> O atacante derrotado paga ao defensor R$ 50 (nível 1), R$ 100 (nível 2) ou R$ 150 (nível 3) da equipe defensora. Neste posto: R$ '+(rules.retaliationByLevel[(team?.stars ?? 1)-1]/100)+'. É separado do custo de iniciar o ataque; sem caixa, a diferença fica pendente.</p>'+
 '<p>Força base = quantidade de capangas × fator do nível. Fatores: nível 1 = '+number(rules.stars[0])+', nível 2 = '+number(rules.stars[1])+', nível 3 = '+number(rules.stars[2])+'.</p><p>Ataque = base × moral × (1 + bônus de armamento) × (1 + bônus da rede). Defesa = base × moral × (1 + bônus de barricada) × (1 + bônus da rede). O ataque é registrado na partida e a defesa, inclusive a rede, recalculada na chegada. Sem moral, durante missão ou recuperação, a força fica zerada.</p><p>Forças iguais dão '+chance(3,3)+'% de chance para cada lado. O desempate é um sorteio: um número de 0 a 100 menor que a chance do atacante significa vitória dele; se igual ou maior, a defesa vence. O nível não desempata automaticamente.</p><p>Chance do atacante = 50 + 40 × (ataque − defesa) ÷ (ataque + defesa), limitada entre 5% e 95%. Com ambas as forças zeradas, a chance é 50%.</p><p>Ataques exigem uma rua direta entre as lojas. Vitória torna a loja neutra para compra; derrota mantém o controle atual. Cooldown impede novos ataques, sem remover por si só a defesa.</p></details></section>';
}
