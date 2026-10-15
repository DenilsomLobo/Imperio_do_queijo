import {rules} from '../data/game-rules.js';
import {dairy} from '../data/dairy.js';
const money=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function cowShopCards(assets) {
 return '<div class="cow-shop-grid">'+Object.entries(rules.cows).map(([id,cow])=>'<button type="button" class="cow-shop-card" data-action="selectCow" data-species="'+id+'" aria-pressed="'+(id==='weak')+'"><img src="'+assets[dairy[id].cowAsset]+'" alt="Vaca '+cow.name+'"><strong>'+cow.name+'</strong><span>'+money(cow.price)+'</span><small>'+cow.feed+' rações/dia</small></button>').join('')+'</div>';
}
export const cowShopChoice=species=>'Selecionada: '+rules.cows[species].name+' · '+money(rules.cows[species].price);
