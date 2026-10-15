import paths from '../data/asset-paths.json';
import {it,expect} from 'vitest';
import {existsSync} from 'node:fs';
import {dairy,discoveredMilk} from '../data/dairy.js';
import {rules,DAY} from '../data/game-rules.js';
import {createGame,advance,command,migrateSave} from './game.js';
for(const [quality,chain] of Object.entries(dairy)) {
 it(chain.cow+' mantém a origem do leite até o queijo e usa arquivos existentes',()=>{
  for(const key of ['cowAsset','milkAsset','cheeseAsset']) expect(existsSync(new URL('../../assets/'+paths[chain[key]],import.meta.url))).toBe(true);
  let s=createGame();
  s.properties['farm-ze'].cows={[quality]:1};
  s.properties['farm-ze'].feed=rules.cows[quality].feed;
  s.properties['factory-ze'].milk={};s.properties['factory-ze'].ready={};
  s=advance(s,DAY,{offline:true});
  expect(s.properties['farm-ze'].milk[quality]).toBe(1);
  expect(s.properties['farm-ze'].feed).toBeCloseTo(0);
  s=command(s,{type:'collectMilk',id:'farm-ze',target:'factory-ze'});
  s=command(s,{type:'produce',id:'factory-ze',recipe:quality,quality});
  s=advance(s,rules.recipes[quality].time,{offline:true});
  expect(s.properties['factory-ze'].ready).toEqual({[quality+':'+quality]:1});
  s=command(s,{type:'collectCheese',id:'factory-ze',target:'sale-ze'});
  expect(s.properties['sale-ze'].stock).toEqual({[quality+':'+quality]:1});
 });
}
it('espécies especiais podem ser compradas diretamente, com preços altos e sem revelar produto',()=>{
 let s=createGame();s.companies.player.cash=10000000;
 for(const species of ['radioactive','magic']) {
  s=command(s,{type:'buyCow',id:'farm-ze',species});
  expect(s.properties['farm-ze'].cows[species]).toBe(1);
  expect(discoveredMilk(s)).not.toContain(species);
 }
 expect(s.companies.player.cash).toBe(4600000);
 expect(()=>command(withoutCash(),{type:'buyCow',id:'farm-ze',species:'radioactive'})).toThrow(/Caixa/);
});
it('compra de rara respeita vagas e segue cadeia de leite e queijo correspondente',()=>{
 let s=createGame();s.companies.player.cash=10000000;
 s=command(s,{type:'buyCow',id:'farm-ze',species:'radioactive'});
 s=command(s,{type:'buyFeed',id:'farm-ze',quantity:90});s=advance(s,DAY,{offline:true});
 expect(s.properties['farm-ze'].milk.radioactive).toBe(1);expect(discoveredMilk(s)).toContain('radioactive');
 s=command(s,{type:'collectMilk',id:'farm-ze',target:'factory-ze'});
 s=command(s,{type:'produce',id:'factory-ze',recipe:'radioactive',quality:'radioactive'});
 s=advance(s,rules.recipes.radioactive.time,{offline:true});
 expect(s.properties['factory-ze'].ready['radioactive:radioactive']).toBe(1);
 s.properties['farm-ze'].cows={weak:rules.farmCapacities[0]};const cash=s.companies.player.cash;
 expect(()=>command(s,{type:'buyCow',id:'farm-ze',species:'magic'})).toThrow(/vagas/);expect(s.companies.player.cash).toBe(cash);
});
it('comprar vaca não revela leite, produção completa revela e descoberta persiste',()=>{
 let s=createGame();s.companies.player.cash=1000000;
 s=command(s,{type:'buyCow',id:'farm-ze',species:'common'});
 expect(discoveredMilk(s)).not.toContain('common');
 s.properties['farm-ze'].feed=30;
 s=advance(s,DAY-1000,{offline:true});
 expect(s.properties['farm-ze'].milk.common ?? 0).toBe(0);
 expect(discoveredMilk(s)).not.toContain('common');
 s=advance(s,1000,{offline:true});
 expect(s.properties['farm-ze'].milk.common).toBe(1);
 expect(discoveredMilk(s)).toContain('common');
 s=command(s,{type:'collectMilk',id:'farm-ze',target:'factory-ze'});
 s=command(s,{type:'produce',id:'factory-ze',recipe:'common',quality:'common'});
 expect(discoveredMilk(migrateSave(JSON.parse(JSON.stringify(s))))).toContain('common');
});
it('receitas de origem não aceitam outro leite nem criam queijo sem um litro',()=>{
 let s=createGame();
 expect(()=>command(s,{type:'produce',id:'factory-ze',recipe:'common',quality:'weak'})).toThrow(/origem/);
 s.properties['factory-ze'].milk.weak=0;
 expect(()=>command(s,{type:'produce',id:'factory-ze',recipe:'weak',quality:'weak'})).toThrow(/insuficiente/);
});
it('migração mantém litros completos e guarda fração já produzida sem repetir migração',()=>{
 const old=createGame();old.properties['farm-ze'].milk.weak=4.85;
 const migrated=migrateSave(old);
 expect(migrated.properties['farm-ze'].milk.weak).toBe(4);
 expect(migrated.properties['farm-ze'].milkProgress.weak).toBeCloseTo(.85);
 expect(migrateSave(migrated)).toEqual(migrated);
 const resumed=advance(migrated,DAY,{offline:true});
 expect(resumed.properties['farm-ze'].milk.weak).toBe(5);
 expect(resumed.properties['farm-ze'].milkProgress.weak).toBeCloseTo(.35);
});

it('coleta conserva frações antigas como progresso e libera somente litros completos',()=>{
 const old=createGame();old.properties['factory-ze'].milk.weak=10.5;
 old.properties['farm-ze'].milk.weak=1.5;
 let s=migrateSave(old);
 s=command(s,{type:'collectMilk',id:'farm-ze',target:'factory-ze'});
 expect(s.properties['factory-ze'].milk.weak).toBe(12);
 expect(s.properties['farm-ze'].milk.weak).toBe(0);
 expect(s.properties['farm-ze'].milkProgress.weak).toBe(0);
 expect(s.properties['factory-ze'].milkProgress.weak).toBe(0);
});

// Cenário de falta de caixa independe do saldo inicial usado para testes.
function withoutCash(){const s=createGame();s.companies.player.cash=0;return s;}
