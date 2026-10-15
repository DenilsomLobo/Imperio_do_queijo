import {rules} from '../data/game-rules.js';
import {attackStrength,defenseStrength,chance} from '../domain/game.js';
const number=n=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:2});
export function combatInfo(post,time,assets={}) {
 const team=post.team,base=team?team.count*rules.stars[team.stars-1]:0;
 const attack=attackStrength(team,time),defense=defenseStrength(post,time);
 const weapon=(team?.weapon ?? 0)*rules.weaponBonus*100,barricade=post.barricade*rules.barricadeBonus*100;
 const art=team?assets['capangas_'+(post.owner==='player'?'aliado':'inimigos')+'_nivel_'+team.stars+'.png']:null;
 return '<section class="combat-info" aria-label="Ataque e defesa do posto">'+
 (art?'<img class="combat-team-art" src="'+art+'" alt="Equipe de capangas nível '+team.stars+'">':'')+
 '<div class="combat-values"><div><span>Dano de ataque</span><strong>'+number(attack)+'</strong></div><div><span>Força de defesa</span><strong>'+number(defense)+'</strong></div></div>'+
 '<p>'+(team?'Equipe: '+team.count+' capangas · nível '+team.stars+'<br>Força base: '+number(base)+' · Moral: '+Math.round(team.moral*100)+'%':'Posto sem equipe: ataque e defesa são zero.')+'</p>'+
 '<div class="combat-upgrade"><b>Armamento '+(team?.weapon ?? 0)+'/3 · +'+number(weapon)+'% no ataque</b><p>Cada melhoria soma +'+number(rules.weaponBonus*100)+'% à força base de ataque, até +'+number(3*rules.weaponBonus*100)+'%. Não aumenta a defesa.</p></div>'+
 '<div class="combat-upgrade"><b>Barricada '+post.barricade+'/3 · +'+number(barricade)+'% na defesa</b><p>Cada melhoria soma +'+number(rules.barricadeBonus*100)+'% à força base de defesa, até +'+number(3*rules.barricadeBonus*100)+'%. Protege somente este posto e precisa de equipe; não aumenta o ataque.</p></div>'+
 '<p class="retaliation-info"><b>Retaliação por defesa vencedora</b><br>O atacante derrotado paga ao defensor: R$ 50 no nível 1, R$ 100 no nível 2 ou R$ 150 no nível 3 da equipe defensora. Neste posto: R$ '+(rules.retaliationByLevel[(team?.stars ?? 1)-1]/100)+'. É separado do custo de iniciar ataque. Se faltar caixa, a diferença fica pendente e será transferida quando houver saldo.</p>'+
 '<details class="combat-rules"><summary>Como a disputa é decidida</summary><p>Força base = quantidade de capangas × fator do nível. Fatores: nível 1 = '+number(rules.stars[0])+', nível 2 = '+number(rules.stars[1])+', nível 3 = '+number(rules.stars[2])+'.</p><p>Ataque = base × moral × bônus de armamento. Defesa = base × moral × bônus de barricada. Sem moral, durante missão ou recuperação, a força fica zerada.</p><p>Forças iguais dão '+chance(3,3)+'% de chance para cada lado. O desempate é um sorteio: um número de 0 a 100 menor que a chance do atacante significa vitória dele; se igual ou maior, a defesa vence. O nível não desempata automaticamente.</p><p>Chance do atacante = 50 + 40 × (ataque − defesa) ÷ (ataque + defesa), limitada entre 5% e 95%. Com ambas as forças zeradas, a chance é 50%. A defesa é calculada na chegada da missão; a prévia pode mudar.</p><p>Ataques exigem uma rua direta entre as lojas. Vitória torna a loja neutra para compra; derrota mantém o controle atual. Cooldown impede novos ataques, sem remover por si só a defesa.</p></details></section>';
}
