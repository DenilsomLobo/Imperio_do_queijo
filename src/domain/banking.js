import {rules,DAY} from '../data/game-rules.js';
export const bankPlan=level=>rules.banks[level];
const newDay=day=>({day,revenue:0,expenses:0,bankFees:0,taxedProfit:0,collected:0});
export function recordDailyEntry(company,entry) {
 const day=Math.floor(entry.time/DAY);
 if(company.dailyFinance?.day!==day) company.dailyFinance=newDay(day);
 company.dailyFinance.revenue+=entry.revenue;
 company.dailyFinance.expenses+=entry.expense;
 if(entry.kind==='Taxa de coleta bancária') company.dailyFinance.bankFees+=entry.expense;
 if(entry.kind==='Coleta bancária automática') company.dailyFinance.collected+=entry.amount;
}
export function ensureBankState(state,owner) {
 const company=state.companies[owner],day=Math.floor(state.time/DAY);
 company.bankDebt ??= 0;
 if(!company.dailyFinance) {
  company.dailyFinance=newDay(day);
  for(const entry of state.ledger.filter(e=>e.owner===owner&&Math.floor(e.time/DAY)===day)) recordDailyEntry(company,entry);
 }
 return company;
}
export function bankingSnapshot(state,owner='player') {
 const company=state.companies[owner],daily=company.dailyFinance ?? newDay(Math.floor(state.time/DAY));
 const profit=Math.max(0,daily.revenue-daily.expenses+daily.bankFees);
 const plan=company.bank ? bankPlan(company.bank.level) : null;
 return {contract:company.bank,day:daily.day,revenue:daily.revenue,expenses:daily.expenses,profit,collected:daily.collected,debt:company.bankDebt ?? 0,
  estimatedFee:plan?Math.round(Math.max(0,profit-daily.taxedProfit)*plan.rate):0,
  blocked:Boolean(plan&&plan.salesLimit!=null&&daily.revenue>plan.salesLimit)};
}
export function settleBankFees(state,owner,book) {
 const company=ensureBankState(state,owner);
 if(!company.bank) return;
 const daily=company.dailyFinance,profit=Math.max(0,daily.revenue-daily.expenses+daily.bankFees);
 const untaxed=Math.max(0,profit-daily.taxedProfit);
 const fee=Math.round(untaxed*bankPlan(company.bank.level).rate);
 company.bankDebt+=fee;
 daily.taxedProfit=Math.max(daily.taxedProfit,profit);
 if(fee) book(owner,0,'Taxa bancária a pagar',company.bank.propertyId,0,0);
}
export function payBankDebt(state,owner,book) {
 const company=ensureBankState(state,owner),paid=Math.min(company.cash,company.bankDebt);
 if(paid>0) {
  book(owner,-paid,'Taxa de coleta bancária',company.bank?.propertyId ?? null,0,paid);
  company.bankDebt-=paid;
 }
}
export function closeBankDays(state,book) {
 const day=Math.floor(state.time/DAY);
 for(const owner of Object.keys(state.companies)) {
  const company=ensureBankState(state,owner);
  if(company.dailyFinance.day===day) continue;
  settleBankFees(state,owner,book);
  // Fecha o dia antes das vendas/despesas do próximo, sem reiniciar contratos.
  company.dailyFinance=newDay(day);
  payBankDebt(state,owner,book);
 }
}
export function processBankServices(state,book) {
 for(const owner of Object.keys(state.companies)) {
  const company=ensureBankState(state,owner);
  if(company.bank && !bankingSnapshot(state,owner).blocked) {
   for(const shop of Object.values(state.properties).filter(p=>p.type==='sale'&&p.owner===owner&&p.till>0)) {
    book(owner,shop.till,'Coleta bancária automática',shop.id,0,0);
    shop.till=0;
   }
  }
  payBankDebt(state,owner,book);
 }
}
export function validateBankContract(company) {
 const contract=company.bank,daily=company.dailyFinance;
 return (contract==null || (Boolean(bankPlan(contract.level)) && typeof contract.propertyId==='string' && Number.isFinite(contract.startedAt)))
  && Number.isFinite(company.bankDebt ?? 0) && (company.bankDebt ?? 0)>=0
  && (!daily || Number.isInteger(daily.day)&&['revenue','expenses','bankFees','taxedProfit','collected'].every(k=>Number.isFinite(daily[k])&&daily[k]>=0));
}
