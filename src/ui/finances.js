import {financialSnapshot} from '../domain/finances.js';
import {bankInfo} from './banking.js';
import {logisticsInfo} from './logistics.js';
import {ruralMap} from '../data/world.js';
import {DAY} from '../data/game-rules.js';
const money=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const signed=n=>(n>=0?'+':'−')+money(Math.abs(n));
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const table=(headers,rows)=>'<div class="finance-table-wrap"><table class="finance-table"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const more=(title,html,key)=>`<details class="finance-more" data-keep="${key}"><summary>${title}</summary>${html}</details>`;

// Receitas x despesas dos últimos dias: barras lado a lado, uma só escala, legenda e dica por barra.
function dailyChart(history){
 const days=[...history].reverse(),max=Math.max(1,...days.flatMap(d=>[d.revenue,d.expenses]));
 const h=v=>v>0?Math.max(3,Math.round(v/max*100)):0;
 return `<figure class="finance-chart"><figcaption><span class="legend"><i class="sw-revenue"></i>Receitas</span><span class="legend"><i class="sw-expense"></i>Despesas</span></figcaption><div class="chart-plot" role="img" aria-label="Receitas e despesas dos últimos ${days.length} dias">${days.map(d=>`<div class="chart-day" data-tip="Dia ${d.day+1}: receitas ${money(d.revenue)}, despesas ${money(d.expenses)}, resultado ${signed(d.profit)}"><div class="chart-bars"><b class="bar-revenue" style="height:${h(d.revenue)}%"></b><b class="bar-expense" style="height:${h(d.expenses)}%"></b></div><span class="chart-result ${d.profit<0?'is-down':''}">${signed(d.profit)}</span><small>Dia ${d.day+1}</small></div>`).join('')}</div></figure>`;
}
// Participação de cada categoria no total: barras horizontais com valor escrito.
function breakdown(rows,kind){
 if(!rows.length)return '<p class="finance-empty">Nenhum registro ainda.</p>';
 const sum=rows.reduce((n,[,v])=>n+v,0);
 return `<ul class="finance-breakdown is-${kind}">${rows.slice(0,6).map(([label,v])=>`<li><span>${safe(label)}</span><b>${money(v)}</b><i><em style="width:${(v/sum*100).toFixed(1)}%"></em></i></li>`).join('')}</ul>`;
}
export function financeManagement(s){
 const f=financialSnapshot(s),tile=(label,value,tone='',note='')=>'<article class="'+tone+'"><span>'+label+'</span><strong>'+value+'</strong>'+(note?'<small>'+note+'</small>':'')+'</article>';
 const pending=f.debt;
 let html='<section class="finance-management"><div class="finance-grid">'+
  tile('Caixa disponível',money(f.cash),'is-hero')+
  tile('Resultado hoje',signed(f.today.profit),f.today.profit<0?'is-down':'is-up','receitas '+money(f.today.revenue)+' · despesas '+money(f.today.expenses))+
  tile('Dinheiro nas lojas',money(f.till),'',f.till?'recolha para usar':'')+
  tile('Pendências',money(pending),pending?'is-down':'',pending?'pagas quando houver caixa':'nada em atraso')+
  '</div><div class="finance-grid is-secondary">'+tile('Liquidez: caixa + lojas',money(f.cash+f.till))+tile('Reservado em leilões',money(f.auctionReserve))+tile('Avaliação de imóveis e itens',money(f.propertyValue))+tile('Resultado acumulado',signed(f.profit),f.profit<0?'is-down':'')+'</div>';
 html+='<h3>Últimos dias</h3>'+dailyChart(f.history)+more('Ver em tabela',table(['Período','Receitas','Despesas','Resultado'],[['Acumulado',money(f.revenue),money(f.expenses),money(f.profit)],...f.history.map(d=>['Dia '+(d.day+1)+(d.day===f.today.day?' · hoje':''),money(d.revenue),money(d.expenses),money(d.profit)])]),'history-table');
 html+='<div class="finance-columns"><div><h3>De onde vem o dinheiro</h3>'+breakdown(f.incomeGroups,'revenue')+'</div><div><h3>Para onde vai o dinheiro</h3>'+breakdown(f.expenseGroups,'expense')+'</div></div>';
 const daily=f.daily.salaries+f.daily.maintenance+f.daily.transport;
 html+='<h3>Compromissos por dia</h3><div class="finance-commitments"><span>Salários <b>'+money(f.daily.salaries)+'</b></span><span>Manutenção <b>'+money(f.daily.maintenance)+'</b></span><span>Transporte <b>'+money(f.daily.transport)+'</b></span><span class="is-total">Total <b>'+money(daily)+'/dia</b></span><span>Ração opcional <b>'+money(f.optionalFeed)+'</b></span></div>';
 html+=more('Pendências em detalhe',table(['Compromisso','Valor'],[['Manutenção pendente',money(f.pending.maintenance)],['Salários atrasados',money(f.pending.payroll)],['Taxa bancária pendente',money(f.pending.bank)],['Compensação por defesa pendente',money(f.pending.retaliation)]])+'<p>Vendedores suspensos: '+f.suspendedSellers+'. Atrasos de vendedor não acumulam dívida na regra atual.</p>','pending');
 html+=more('Resultado por estabelecimento',f.propertyResults.length?table(['Estabelecimento','Receitas','Despesas','Resultado'],f.propertyResults.map(r=>[safe(ruralMap.slots.find(p=>p.id===r.id)?.name ?? r.id ?? 'Empresa'),money(r.revenue),money(r.expenses),money(r.revenue-r.expenses)])):'<p>Nenhum registro ainda.</p>','by-property');
 html+=more('Últimos 25 movimentos',f.recent.length?table(['Dia','Estabelecimento / movimento','Caixa','Receita','Despesa'],f.recent.map(e=>[String(Math.floor(e.time/DAY)+1),safe(ruralMap.slots.find(p=>p.id===e.property)?.name ?? 'Empresa')+'<br>'+safe(e.kind),money(e.amount ?? 0),money(e.revenue ?? 0),money(e.expense ?? 0)])):'<p>Nenhuma movimentação registrada.</p>','recent');
 html+='<h3>Banco e transporte</h3>'+bankInfo(s)+logisticsInfo(s)+ruralMap.slots.filter(p=>['bank','logistics'].includes(p.service)).map(p=>`<button class="management-row" data-property="${p.id}">${safe(p.name)} · gerenciar ↗</button>`).join('');
 html+=more('Entenda os números','<p>Resultado = receitas reconhecidas menos despesas registradas. Crédito inicial não é lucro. Recolher dinheiro da loja só transfere valores; lances reservados e devoluções não são receita nem despesa. A reserva de lance não está disponível no caixa. A avaliação de imóveis inclui vacas e contratações conforme o leilão e não é dinheiro disponível. Estoques e lotes não são caixa. Diárias são compromissos nominais, não previsão de lucro; transporte suspenso não acumula diárias e a ração é uma compra opcional.</p>','explain');
 return html+'</section>';
}
