import {rules} from '../data/game-rules.js';
import {dairy} from '../data/dairy.js';
const cash=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cheeseStockCards(stock,assets,priceFor=id=>rules.recipes[id].price){
 const entries=Object.entries(stock ?? {}).filter(([key,n])=>n>0&&rules.recipes[key.split(':')[0]]&&dairy[key.split(':')[1]]);
 if(!entries.length)return '<p class="cheese-empty">Nenhum queijo pronto em estoque.</p>';
 return '<div class="cheese-stock-grid">'+entries.map(([key,n])=>{
  const [id,quality]=key.split(':'),recipe=rules.recipes[id],cheese=dairy[quality],price=priceFor(id);
  return '<article class="cheese-stock-card" data-cheese="'+safe(key)+'"><img src="'+assets[cheese.cheeseAsset]+'" alt="'+safe(recipe.name)+'"><div><strong>'+n.toLocaleString('pt-BR')+' un. · '+safe(recipe.name)+'</strong><span class="cheese-unit-price">Venda: '+cash(price)+'/un.</span><b>Valor do estoque: '+cash(n*price)+'</b></div></article>';
 }).join('')+'</div>';
}
