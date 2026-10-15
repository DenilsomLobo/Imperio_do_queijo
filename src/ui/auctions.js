import {minimumBid,propertyValuation,auctionEligible,serviceKind} from '../domain/auctions.js';
import {DAY} from '../data/game-rules.js';
const cash=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function auctionInfo(s,p){
 if(!auctionEligible(p))return '';
 const a=s.auctions?.[p.id];
 return '<section class="auction-info"><h3>Disputa de propriedade</h3><p>Avaliação atual: <b>'+cash(propertyValuation(p))+'</b> '+(p.type==='farm'?'(propriedade + vacas)':p.type==='factory'?'(propriedade + contratação dos funcionários)':'(valor do contrato, sem unidades)')+'</p>'+
 (a?'<p class="auction-active"><b>Leilão em andamento</b><br>Maior lance: '+cash(a.amount)+' · '+safe(s.companies[a.bidder].name)+'<br>Encerramento: dia '+(Math.floor(a.endsAt/DAY)+1)+' · faltam '+Math.max(0,(a.endsAt-s.time)/DAY).toLocaleString('pt-BR',{maximumFractionDigits:2})+' dias<br>Valor reservado até o encerramento ou até outro lance superá-lo.</p>':'<p>Primeiro lance: avaliação +10%. Prazo fixo de 10 dias de jogo a partir do primeiro lance.</p>')+
 '<p>Cada novo lance deve superar o anterior em pelo menos 10%, sem estender o prazo. Se for superado, sua reserva volta ao caixa. Se o dono vencer, mantém a propriedade e recupera sua reserva. Se o rival vencer, o dono recebe o valor e perde a propriedade com os itens alocados.'+(p.type==='service'?' O antigo titular perde o contrato e a automação; o vencedor assume os benefícios e as taxas atuais.':'')+'</p></section>';
}
export function auctionActions(s,p){
 if(!auctionEligible(p))return '';
 const a=s.auctions?.[p.id];if(!a&&p.owner==='player')return '';
 if(a?.bidder==='player')return '<p>Você tem o maior lance. Aguarde o prazo ou acompanhe novos lances.</p>';
 const minimum=minimumBid(s,p);
 return '<label>Lance em reais · mínimo '+cash(minimum)+'<input id="auction-amount" type="number" min="'+(minimum/100).toFixed(2)+'" step="0.01" value="'+(minimum/100).toFixed(2)+'"></label><button data-action="bidProperty">'+(p.owner==='player'?'Cobrir lance e defender propriedade':'Dar lance e reservar dinheiro')+'</button>';
}
