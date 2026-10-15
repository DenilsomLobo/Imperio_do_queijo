import {it,expect} from 'vitest';
import {createGame,command,advance,migrateSave} from './game.js';
import {DAY,rules} from '../data/game-rules.js';
function funded(){const s=createGame();s.companies.player.cash=200000000;s.properties['factory-ze'].milk={};s.properties['factory-ze'].ready={};return s;}
const hire=s=>command(s,{type:'hireLogistics',id:'transport'});
it('contratação custa R$ 15 mil, é única e não concede recursos',()=>{
 let s=funded();s=hire(s);expect(s.companies.player.cash).toBe(198500000);
 expect(()=>hire(s)).toThrow(/já contratada/);expect(()=>hire(withoutCash())).toThrow(/Caixa/);
 expect(s.companies.player.logistics.milkMoved).toBe(0);
});
it('transfere leite e queijo próprios preservando tipos e limites; excedente fica na origem',()=>{
 let s=hire(funded());s.properties['farm-ze'].milk={weak:3,common:2};s.properties['factory-ze'].milk={weak:98};
 s.properties['factory-ze'].ready={'weak:weak':4};s.properties['sale-ze'].stock={'weak:weak':39};s.properties['sale-ze'].sellerActive=false;
 s=advance(s,1000);
 expect(s.properties['factory-ze'].milk.weak).toBe(100);expect(s.properties['farm-ze'].milk).toEqual({weak:1,common:2});
 expect(s.companies.player.shopStock['weak:weak']).toBe(40);expect(s.properties['factory-ze'].ready['weak:weak']).toBe(3);
 expect(s.companies.player.logistics.milkMoved).toBe(2);expect(s.companies.player.logistics.cheeseMoved).toBe(1);
 expect(s.properties['factory-coalho'].milk.weak).toBe(1);
});
it('sem funcionário não fabrica; com funcionário completa leite → queijo → loja → venda sem cliques',()=>{
 let s=hire(funded());s.properties['farm-ze'].milk={weak:3};
 s=advance(s,1000);expect(s.properties['factory-ze'].milk.weak).toBe(3);expect(s.properties['factory-ze'].batches).toHaveLength(0);
 s=command(s,{type:'hireWorker',id:'factory-ze',level:1});s=advance(s,DAY);
 expect(s.companies.player.logistics.cheeseMoved).toBe(3);expect(s.properties['sale-ze'].sales).toBe(3);
 expect(s.properties['sale-ze'].till).toBe(7575);expect(s.companies.player.revenue).toBe(7575);
});
it('cobra R$ 300 após um dia, suspende sem caixa e retoma sem acumular dias parados',()=>{
 let s=hire(funded());const cash=s.companies.player.cash;s=advance(s,DAY-1000,{offline:true});expect(s.companies.player.cash).toBe(cash);
 s=advance(s,1000,{offline:true});expect(s.ledger.filter(e=>e.kind==='Manutenção da transportadora')).toHaveLength(1);
 expect(s.ledger.find(e=>e.kind==='Manutenção da transportadora').expense).toBe(30000);
 s.companies.player.cash=0;s.properties['farm-ze'].milk={weak:1};s.properties['factory-ze'].milk={weak:100};
 s=advance(s,2*DAY,{offline:true});expect(s.companies.player.logistics.suspended).toBe(true);
 s.properties['factory-ze'].milk={};s.companies.player.cash=30000;s=advance(s,1000);
 expect(s.companies.player.logistics.suspended).toBe(false);expect(s.companies.player.cash).toBe(0);
 expect(s.properties['farm-ze'].milk.weak).toBe(0);expect(s.companies.player.logistics.nextFeeAt).toBe(s.time+DAY);
});
it('cancelar interrompe transferências e save/reload mantém contrato e contadores',()=>{
 let s=hire(funded());expect(migrateSave(s)).toEqual(s);
 s=command(s,{type:'cancelLogistics',id:'transport'});s.properties['farm-ze'].milk={weak:2};s=advance(s,1000);
 expect(s.properties['farm-ze'].milk.weak).toBe(2);expect(s.companies.player.logistics).toBeNull();
});
it('offline e passos menores conservam os mesmos recursos sem duplicar transferência',()=>{
 let s=hire(funded());s.properties['farm-ze'].milk={weak:5};
 const a=advance(s,DAY,{offline:true});let b=s;for(let i=0;i<5;i++) b=advance(b,DAY/5,{offline:true});
 expect(a).toEqual(b);expect(a.companies.player.logistics.milkMoved).toBe(5);
});

// Cenário de falta de caixa independe do saldo inicial usado para testes.
function withoutCash(){const s=createGame();s.companies.player.cash=0;return s;}
