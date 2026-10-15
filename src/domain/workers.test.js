import {it,expect} from 'vitest';
import {createGame,command,advance,migrateSave,validateSave} from './game.js';
import {productionMultiplier} from './workers.js';
import {rules,DAY} from '../data/game-rules.js';
import {management} from './management.js';
const hire=(s,level=1)=>command(s,{type:'hireWorker',id:'factory-ze',level});
function funded(){const s=createGame();s.companies.player.cash=10000000;s.properties['factory-ze'].ready={};return s;}
it('contrata por valor real, soma bônus e respeita cinco vagas na inicial',()=>{
 let s=funded();const cash=s.companies.player.cash;
 s=hire(s,1);s=hire(s,2);s=hire(s,3);s=hire(s,1);s=hire(s,1);
 expect(s.properties['factory-ze'].workers).toHaveLength(5);
 expect(productionMultiplier(s.properties['factory-ze'])).toBeCloseTo(1.4);
 expect(s.companies.player.cash).toBe(cash-1275000);
 expect(management(s).factoryWorkers).toBe(5);
 expect(()=>hire(s)).toThrow(/vagas/);
 expect(()=>command(s,{type:'hireWorker',id:'factory-coalho',level:1})).toThrow(/empresa/);
 expect(()=>hire(withoutCash())).toThrow(/Caixa/);
});
it('funcionários iniciam novos lotes, embalam e aceleram sem criar insumos',()=>{
 let s=hire(funded(),3);s.properties['factory-ze'].milk={weak:2};s.properties['factory-ze'].packaging=0;
 const cash=s.companies.player.cash;
 s=advance(s,1000);expect(s.properties['factory-ze'].batches).toHaveLength(2);
 expect(s.properties['factory-ze'].milk.weak).toBe(0);
 expect(s.companies.player.cash).toBe(cash-2*rules.packagingPrice);
 s=advance(s,105000);
 expect(s.properties['factory-ze'].ready['weak:weak']).toBe(2);
 expect(s.properties['factory-ze'].batches).toHaveLength(0);
 expect(s.properties['factory-ze'].milk.weak).toBe(0);
 s=advance(s,105000);expect(s.properties['factory-ze'].ready['weak:weak']).toBe(2);
 expect(s.properties['factory-ze'].batches).toHaveLength(0);
});
it('sem funcionário produção é manual; automação respeita caixa, estoque e linhas',()=>{
 let s=advance(funded(),5000);expect(s.properties['factory-ze'].batches).toHaveLength(0);
 s=hire(s);s.properties['factory-ze'].packaging=0;s.companies.player.cash=0;
 s=advance(s,1000);expect(s.properties['factory-ze'].batches).toHaveLength(0);
 s.properties['factory-ze'].packaging=1;s.properties['factory-ze'].ready={'weak:weak':40};
 s=advance(s,1000);expect(s.properties['factory-ze'].batches).toHaveLength(0);
 s.properties['factory-ze'].ready={};s=advance(s,1000);expect(s.properties['factory-ze'].batches).toHaveLength(1);
});
it('cobra salário um dia após contratação e registra despesa por nível',()=>{
 let s=funded();s.time=10000;s=hire(s,2);s.properties['factory-ze'].milk={};
 const cash=s.companies.player.cash;s=advance(s,DAY-1000,{offline:true});
 expect(s.companies.player.cash).toBe(cash-rules.sellerSalary-rules.shopDailyMaintenance); // vendedor: virada global do dia
 s=advance(s,1000,{offline:true});
 expect(s.companies.player.cash).toBe(cash-rules.sellerSalary-rules.shopDailyMaintenance-rules.workerTiers[2].salary);
 expect(s.ledger.some(l=>l.kind==='Salário de funcionário'&&l.amount===-35000)).toBe(true);
});
it('quatro dias sem pagamento removem trabalhador e deixam placa persistida',()=>{
 let s=hire(funded());s.companies.player.cash=0;s.properties['factory-ze'].milk={};
 s=advance(s,3*DAY,{offline:true});
 expect(s.properties['factory-ze'].workers[0].missedWages).toBe(3);
 expect(productionMultiplier(s.properties['factory-ze'])).toBe(1);
 s=advance(s,DAY,{offline:true});expect(s.properties['factory-ze'].workers).toHaveLength(0);
 expect(s.properties['factory-ze'].staffNotices[0].text).toMatch(/pediu demissão/);
 const restored=validateSave(migrateSave(JSON.parse(JSON.stringify(s))));expect(restored).toEqual(s);
});
it('pagamento de atrasados reativa trabalho sem zerar dívida gratuitamente',()=>{
 let s=hire(funded());s.companies.player.cash=0;s=advance(s,DAY,{offline:true});
 s.companies.player.cash=rules.workerTiers[1].salary;
 s=command(s,{type:'payWorkerWages',id:'factory-ze'});
 expect(s.companies.player.cash).toBe(0);expect(s.properties['factory-ze'].workers[0].missedWages).toBe(0);
 expect(productionMultiplier(s.properties['factory-ze'])).toBe(1.05);
});
it('cada capanga tem salário por nível e só sai no quarto dia sem pagar',()=>{
 let s=funded();s=command(s,{type:'hireTeam',id:'sale-ze-control',level:3});s.companies.player.cash=0;
 s=advance(s,3*DAY,{offline:true});expect(s.properties['sale-ze-control'].team.missedWages).toBe(3);
 s=advance(s,DAY,{offline:true});expect(s.properties['sale-ze-control'].team).toBeNull();
 expect(s.properties['sale-ze-control'].staffNotices).toHaveLength(1);
});
it('migração não concede funcionários e não altera funcionários já contratados',()=>{
 const old=funded();delete old.properties['factory-ze'].workers;delete old.properties['factory-ze'].staffNotices;
 const s=migrateSave(old);expect(s.properties['factory-ze'].workers).toEqual([]);
 const staffed=hire(s,3);expect(migrateSave(staffed)).toEqual(staffed);
});

// Cenário de falta de caixa independe do saldo inicial usado para testes.
function withoutCash(){const s=createGame();s.companies.player.cash=0;return s;}
