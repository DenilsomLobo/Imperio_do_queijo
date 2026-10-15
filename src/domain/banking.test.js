import {it,expect} from 'vitest';
import {createGame,command,advance,migrateSave} from './game.js';
import {rules,DAY} from '../data/game-rules.js';
import {bankingSnapshot} from './banking.js';
function funded(){const s=createGame();s.companies.player.cash=200000000;for(const p of Object.values(s.properties)) if(p.type==='sale'&&p.owner==='player')p.seller=p.sellerActive=false;return s;}
const hire=(s,level=1)=>command(s,{type:'hireBank',id:level===1?'bank-rural':'bank-city'});
it('cobra contratação, só mantém um banco e preserva contrato se a troca falhar',()=>{
 let s=hire(funded());expect(s.companies.player.cash).toBe(199100000);expect(s.companies.player.bank.level).toBe(1);
 expect(()=>hire(s)).toThrow(/já está ativo/);
 s=hire(s,2);expect(s.companies.player.cash).toBe(193100000);expect(s.companies.player.bank.level).toBe(2);
 s.companies.player.cash=0;const before=structuredClone(s);expect(()=>hire(s,1)).toThrow(/Caixa/);expect(s).toEqual(before);
 expect(()=>hire(withoutCash())).toThrow(/Caixa/);
});
it('coleta apenas dinheiro real de lojas próprias sem duplicar receita',()=>{
 let s=hire(funded());s.properties['sale-ze'].till=5000;s.properties['sale-e1'].till=3000;
 const cash=s.companies.player.cash,revenue=s.companies.player.revenue;
 s=advance(s,1000);
 expect(s.companies.player.cash).toBe(cash+5000);expect(s.companies.player.revenue).toBe(revenue);
 expect(s.properties['sale-ze'].till).toBe(0);expect(s.properties['sale-e1'].till).toBe(3000);
 expect(bankingSnapshot(s).collected).toBe(5000);
 s=advance(s,1000);expect(s.companies.player.cash).toBe(cash+5000);
});
it('limite é vendas totais diárias, inclusivo, e banco 2 coleta acima dele',()=>{
 let s=hire(funded());s.companies.player.dailyFinance.revenue=rules.banks[1].salesLimit;s.properties['sale-ze'].till=1000;
 s=advance(s,1000);expect(s.properties['sale-ze'].till).toBe(0);
 s.companies.player.dailyFinance.revenue++;s.properties['sale-ze'].till=2000;
 s=advance(s,1000);expect(s.properties['sale-ze'].till).toBe(2000);expect(bankingSnapshot(s).blocked).toBe(true);
 s=hire(s,2);s=advance(s,1000);expect(s.properties['sale-ze'].till).toBe(0);expect(bankingSnapshot(s).blocked).toBe(false);
});
it('limite do banco 1 volta a liberar automaticamente no próximo dia',()=>{
 let s=hire(funded());s.companies.player.dailyFinance.revenue=rules.banks[1].salesLimit+1;s.properties['sale-ze'].till=1000;
 s=advance(s,DAY,{offline:true});expect(s.properties['sale-ze'].till).toBe(0);expect(bankingSnapshot(s).revenue).toBe(0);
});
it('taxa de 1% usa vendas menos despesas, fecha uma vez e não taxa prejuízo',()=>{
 let s=hire(funded());s=advance(s,DAY,{offline:true});
 s.properties['sale-ze'].sellerActive=true;s.properties['sale-ze'].stock={'weak:weak':40};
 s=advance(s,DAY-1000,{offline:true});
 expect(bankingSnapshot(s).revenue).toBe(47500);
 s=command(s,{type:'buyFeed',id:'farm-ze',quantity:10});expect(bankingSnapshot(s).profit).toBe(42500);
 s=advance(s,1000,{offline:true});
 const fees=s.ledger.filter(e=>e.owner==='player'&&e.kind==='Taxa de coleta bancária');expect(fees).toHaveLength(1);expect(fees[0].expense).toBe(950);
 s=advance(s,1000);expect(s.ledger.filter(e=>e.owner==='player'&&e.kind==='Taxa de coleta bancária')).toHaveLength(1);
 const unprofitable=advance(hire(funded()),DAY,{offline:true});
 expect(unprofitable.ledger.some(e=>e.owner==='player'&&e.kind==='Taxa de coleta bancária')).toBe(false);
});
it('banco 2 cobra 2% e cancelar interrompe coletas sem apagar taxa já gerada',()=>{
 let s=hire(funded(),2);s=advance(s,DAY,{offline:true});
 s.companies.player.dailyFinance.revenue=10000;
 const cash=s.companies.player.cash;
 s=command(s,{type:'cancelBank',id:'bank-city'});
 expect(s.companies.player.cash).toBe(cash-150);expect(s.companies.player.bank).toBeNull();
 s.properties['sale-ze'].till=2000;s=advance(s,1000);expect(s.properties['sale-ze'].till).toBe(2000);
});
it('taxa sem caixa fica pendente e é quitada quando entra dinheiro',()=>{
 let s=hire(funded());s=advance(s,DAY,{offline:true});s.companies.player.dailyFinance.revenue=10000;s.companies.player.cash=0;
 s=command(s,{type:'cancelBank',id:'bank-rural'});expect(s.companies.player.bankDebt).toBe(75);
 s.properties['sale-ze'].till=500;s=command(s,{type:'collectCash',id:'sale-ze'});s=advance(s,1000);
 expect(s.companies.player.bankDebt).toBe(0);expect(s.companies.player.cash).toBe(425);
});
it('migração reconstrói movimento diário, preserva contrato e é idempotente',()=>{
 const old=funded();delete old.companies.player.dailyFinance;delete old.companies.player.bankDebt;
 const migrated=migrateSave(old);expect(bankingSnapshot(migrated).revenue).toBe(0);expect(migrateSave(migrated)).toEqual(migrated);
 const active=hire(migrated,2);expect(migrateSave(active)).toEqual(active);
});

// Cenário de falta de caixa independe do saldo inicial usado para testes.
function withoutCash(){const s=createGame();s.companies.player.cash=0;return s;}
