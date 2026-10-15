import {rules} from '../data/game-rules.js';
import {bankingSnapshot} from '../domain/banking.js';
const money=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function bankInfo(state) {
 const info=bankingSnapshot(state);
 return '<section class="bank-contract"><h3>Serviço da sua empresa</h3><p>'+(info.contract?'Banco nível '+info.contract.level+' contratado':'Nenhum banco contratado · coleta manual')+'</p>'+ (info.blocked?'<p class="staff-notice">Coletas suspensas: vendas da empresa ultrapassaram R$ 500.000 neste dia. Contrate o banco nível 2 ou aguarde o próximo dia.</p>':'')+'<p>Vendas hoje: '+money(info.revenue)+'<br>Despesas hoje: '+money(info.expenses)+'<br>Resultado positivo antes da taxa: '+money(info.profit)+'<br>Coletado automaticamente hoje: '+money(info.collected)+'<br>Taxa estimada a apurar: '+money(info.estimatedFee)+'<br>Taxas pendentes: '+money(info.debt)+'</p></section>';
}
export function bankDescription(level) {
 const plan=rules.banks[level];
 return '<h3>Coleta automática · Banco nível '+level+'</h3><p>Contratação: <strong>'+money(plan.hire)+'</strong><br>Taxa: <strong>'+Math.round(plan.rate*100)+'% do resultado positivo diário</strong><br>'+(plan.salesLimit==null?'Sem limite diário de vendas.':'Administra vendas totais da empresa até '+money(plan.salesLimit)+' por dia. Acima do limite, para de coletar até o próximo dia.')+'</p><p>O dinheiro das suas lojas é transferido automaticamente para o caixa, inclusive offline. A taxa incide sobre vendas menos despesas do dia, antes da própria taxa, somente se esse resultado for positivo.</p><p>Você pode contratar apenas um banco por vez. Trocar de banco encerra o anterior e cobra a nova contratação. Cancelar interrompe a coleta imediatamente; a contratação não é devolvida e a taxa já gerada é apurada. Taxas sem caixa ficam pendentes e são quitadas quando houver dinheiro.</p>';
}
