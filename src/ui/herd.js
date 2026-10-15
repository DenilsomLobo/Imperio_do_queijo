import { dairy } from '../data/dairy.js';
import { rules } from '../data/game-rules.js';
export function herdCards(farm,assets) {
 return '<div class="herd-grid">'+Object.entries(farm.cows).filter(([,n])=>n>0).map(([k,n])=>'<article class="cow-card"><img src="'+assets[dairy[k].cowAsset]+'" alt="Vaca '+rules.cows[k].name+'"><strong>'+rules.cows[k].name+' × '+n+'</strong><small>'+rules.cows[k].feed+' rações/dia por vaca</small></article>').join('')+'</div>';
}
