import {it,expect} from 'vitest';
import {createGame,command,advance} from './game.js';
import {rules,DAY} from '../data/game-rules.js';
it('vende todos os tipos na virada, inclusive acima do teto antigo, sem duplicar ao recarregar',()=>{
 let s=createGame();s.time=DAY-1000;const shop=s.properties['sale-ze'];shop.stock={'weak:weak':10,'common:common':10,'noble:noble':10,'magic:magic':10};shop.till=rules.shopCashCapacity;shop.demandRemaining=0;
 const value=10*(2500+5000+10000+40000),sales=shop.sales;
 s=advance(s,1000,{offline:true});expect(Object.values(s.properties['sale-ze'].stock).every(n=>n===0)).toBe(true);expect(s.properties['sale-ze'].sales).toBe(sales+40);expect(s.properties['sale-ze'].till).toBe(rules.shopCashCapacity+value);
 const revenue=s.companies.player.revenue;
 s=advance(JSON.parse(JSON.stringify(s)),1000,{offline:true});expect(s.companies.player.revenue).toBe(revenue);
 expect(s.ledger.filter(e=>e.owner==='player'&&e.kind==='Venda ao consumidor').every(e=>e.time<DAY)).toBe(true);
});
it('venda final requer vendedor ativo',()=>{
 let s=createGame();s.time=DAY-1000;s.properties['sale-ze'].sellerActive=false;s.properties['sale-ze'].stock={'weak:weak':40};s=advance(s,1000,{offline:true});expect(s.properties['sale-ze'].stock['weak:weak']).toBe(40);
});
it('uma linha manual fabrica cinco fracos em um dia-base',()=>{
 let s=createGame();const f=s.properties['factory-ze'];f.ready={};f.milk={weak:5};f.packaging=5;
 for(let i=0;i<5;i++){s=command(s,{type:'produce',id:f.id,recipe:'weak',quality:'weak'});s=advance(s,60000,{offline:true});}
 expect(s.time).toBe(DAY);expect(s.properties[f.id].ready['weak:weak']).toBe(5);
});
it('fazenda inicial aceita dez vacas, ração e contratações debitam valores novos',()=>{
 let s=createGame();s.companies.player.cash=1000000;s.properties['farm-ze'].cows={weak:9};s=command(s,{type:'buyCow',id:'farm-ze',species:'weak'});expect(()=>command(s,{type:'buyCow',id:'farm-ze',species:'weak'})).toThrow(/vagas/);
 const cash=s.companies.player.cash;s=command(s,{type:'buyFeed',id:'farm-ze',quantity:10});s=command(s,{type:'hireWorker',id:'factory-ze',level:1});s=command(s,{type:'hireTeam',id:'sale-ze-control',level:1});expect(s.companies.player.cash).toBe(cash-2500-25000-12500);
 expect(rules.teamSalaries[0]).toBe(2500);expect(rules.workerTiers[1].salary).toBe(2500);
 expect(['weak','common','noble','radioactive','magic'].map(k=>rules.recipes[k].time)).toEqual([60000,180000,300000,600000,900000]);
});

it('dez embalagens custam R$ 25 e Magrela custa R$ 250',()=>{let s=createGame();const cash=s.companies.player.cash;s=command(s,{type:'buyPackaging',id:'factory-ze',quantity:10});s=command(s,{type:'buyCow',id:'farm-ze',species:'weak'});expect(s.companies.player.cash).toBe(cash-2500-25000);expect(s.properties['factory-ze'].packaging).toBe(rules.initialPackaging+10);});

it('abrir loja custa R$ 500, cada loja cobra R$ 25 por dia sem duplicar no reload',()=>{
 let s=createGame();s.companies.player.cash=1000000;const cash=s.companies.player.cash;s=command(s,{type:'buyProperty',id:'sale-n4'});expect(s.companies.player.cash).toBe(cash-50000);
 s=advance(s,DAY,{offline:true});const entries=s.ledger.filter(e=>e.owner==='player'&&e.kind==='Manutenção de loja');expect(entries).toHaveLength(2);expect(entries.reduce((n,e)=>n+e.expense,0)).toBe(5000);
 s=advance(JSON.parse(JSON.stringify(s)),1000,{offline:true});expect(s.ledger.filter(e=>e.owner==='player'&&e.kind==='Manutenção de loja')).toHaveLength(2);
});
it('falta de caixa mantém manutenção pendente sem saldo negativo',()=>{
 let s=createGame();s.companies.player.cash=1000;s=advance(s,DAY,{offline:true});expect(s.companies.player.cash).toBe(0);expect(s.properties['sale-ze'].maintenanceDebt).toBe(1500);
});
