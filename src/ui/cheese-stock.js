import {rules} from '../data/game-rules.js';
import {dairy} from '../data/dairy.js';
const cash=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cheeseStockCards(stock,assets){
 const entries=Object.entries(stock ?? {}).filter(([key,n])=>n>0&&rules.recipes[key.split(':')[0]]&&dairy[key.split(':')[1]]);
 if(!entries.length)return '<p class="cheese-empty">Nenhum queijo pronto em estoque.</p>';
 return '<div class="cheese-stock-grid">'+entries.map(([key,n])=>{
  const [id,quality]=key.split(':'),recipe=rules.recipes[id],cheese=dairy[quality];
  return '<article class="cheese-stock-card" data-cheese="'+safe(key)+'"><img src="'+assets[cheese.cheeseAsset]+'" alt="'+safe(recipe.name)+'"><div><strong>'+safe(recipe.name)+'</strong><span>'+n.toLocaleString('pt-BR')+' un.</span><span class="cheese-unit-price">Venda: '+cash(recipe.price)+'/un.</span><b>Valor do estoque: '+cash(n*recipe.price)+'</b></div></article>';
 }).join('')+'</div>';
}
