import {rules,DAY,factoryProfile,propertyPurchasePrice} from '../data/game-rules.js';
import {propertyValuation} from './auctions.js';
import {sharedShopStock} from './shop-stock.js';
const sum=items=>items.reduce((n,v)=>n+v,0);
export function financialSnapshot(s,owner='player'){
 const company=s.companies[owner],own=Object.values(s.properties).filter(p=>p.owner===owner),entries=s.ledger.filter(e=>e.owner===owner),day=Math.floor(s.time/DAY);
 const period=d=>{const rows=entries.filter(e=>Math.floor(e.time/DAY)===d),revenue=sum(rows.map(e=>e.revenue ?? 0)),expenses=sum(rows.map(e=>e.expense ?? 0));return {day:d,revenue,expenses,profit:revenue-expenses};};
 const grouped=field=>{const groups={};for(const e of entries)if(e[field]>0)groups[e.kind]=(groups[e.kind] ?? 0)+e[field];return Object.entries(groups).sort((a,b)=>b[1]-a[1]);};
 const propertyResults=new Map();for(const e of entries){if(!e.revenue&&!e.expense)continue;const id=e.property ?? null;if(!propertyResults.has(id))propertyResults.set(id,{id,revenue:0,expenses:0});const row=propertyResults.get(id);row.revenue+=e.revenue ?? 0;row.expenses+=e.expense ?? 0;}
 const teams=own.filter(p=>p.type==='security'&&p.team).map(p=>p.team).concat(company.reserveTeams ?? []),workers=own.flatMap(p=>p.workers ?? []);
 const salaries=sum(workers.map(w=>rules.workerTiers[w.level].salary))+sum(teams.map(t=>rules.teamSalaries[t.stars-1]))+own.filter(p=>p.type==='sale'&&p.seller).length*rules.sellerSalary;
 const maintenance=own.filter(p=>p.type==='sale').length*rules.shopDailyMaintenance+sum(own.filter(p=>p.type==='factory').map(p=>factoryProfile(p).daily));
 const pending={maintenance:sum(own.map(p=>p.maintenanceDebt ?? 0)),payroll:sum(workers.map(w=>(w.missedWages ?? 0)*rules.workerTiers[w.level].salary))+sum(teams.map(t=>(t.missedWages ?? 0)*rules.teamSalaries[t.stars-1])),bank:company.bankDebt ?? 0,retaliation:sum((company.retaliationDebts ?? []).map(d=>d.amount))};
 return {propertyResults:[...propertyResults.values()],cash:company.cash,till:sum(own.filter(p=>p.type==='sale').map(p=>p.till)),revenue:company.revenue,expenses:company.expenses,profit:company.revenue-company.expenses,today:period(day),history:Array.from({length:Math.min(7,day+1)},(_,i)=>period(day-i)),incomeGroups:grouped('revenue'),expenseGroups:grouped('expense'),pending,debt:sum(Object.values(pending)),auctionReserve:sum(Object.values(s.auctions ?? {}).filter(a=>a.bidder===owner).map(a=>a.amount)),daily:{salaries,maintenance,transport:company.logistics?rules.logistics.dailyFee:0},optionalFeed:sum(own.filter(p=>p.type==='farm').flatMap(p=>Object.entries(p.cows).map(([id,n])=>n*rules.cows[id].feed*rules.feedPrice))),propertyValue:sum(own.filter(p=>['sale','farm','factory','service'].includes(p.type)).map(p=>p.type==='sale'?propertyPurchasePrice(p):propertyValuation(p))),stock:sharedShopStock(s,owner),recent:entries.slice(-25).reverse(),suspendedSellers:own.filter(p=>p.type==='sale'&&p.seller&&!p.sellerActive).length};
}
