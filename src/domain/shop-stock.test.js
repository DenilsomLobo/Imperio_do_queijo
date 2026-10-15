import {it,expect} from 'vitest';
import {createGame,command,advance,migrateSave,validateSave} from './game.js';
import {companyShops,shopBonus,salePrice,sharedShopStock,shopCapacity} from './shop-stock.js';
import {DAY,rules} from '../data/game-rules.js';
import {management} from './management.js';
function shops(n=2){let s=createGame();s.companies.player.cash=10000000;for(const id of ['sale-n6','sale-n5'].slice(0,n-1))s=command(s,{type:'buyProperty',id});return s;}
it('envia sem destino e conta o mesmo estoque uma vez apesar de várias lojas',()=>{
 let s=shops();s.companies.player.discoveredMilk=['weak','common'];s.properties['factory-ze'].ready={'weak:weak':3,'common:common':2};
 s=command(s,{type:'collectCheese',id:'factory-ze'});
 expect(sharedShopStock(s)).toEqual({'weak:weak':3,'common:common':2});
 expect(management(s).cheese).toBe(5);expect(s.properties['factory-ze'].ready['weak:weak']).toBe(0);
 expect(companyShops(s).every(p=>Object.keys(p.stock).length===0)).toBe(true);
 expect(validateSave(migrateSave(JSON.parse(JSON.stringify(s))))).toEqual(s);
});
it('bônus aditivo começa na segunda loja e muda ao perder ou comprar loja',()=>{
 let s=shops(1);expect(salePrice(s,'player','weak')).toBe(2525);
 s=command(s,{type:'buyProperty',id:'sale-n6'});expect(salePrice(s,'player','weak')).toBe(2778);
 s=command(s,{type:'buyProperty',id:'sale-n5'});expect(salePrice(s,'player','weak')).toBe(3030);
 s.properties['sale-n6'].owner=s.properties['sale-n6-control'].owner='neutral';
 expect(shopBonus(s)).toBe(.1);expect(salePrice(s,'player','magic')).toBe(44440);
});
it('duas lojas com vendedores nunca vendem duas vezes uma unidade compartilhada',()=>{
 let s=shops();s=command(s,{type:'hireSeller',id:'sale-n6'});
 s.companies.player.shopStock={'weak:weak':1};
 s=advance(s,DAY/rules.sellerDaily,{offline:true});
 expect(companyShops(s).reduce((n,p)=>n+p.sales,0)).toBe(1);
 expect(s.companies.player.revenue).toBe(2778);expect(sharedShopStock(s)['weak:weak']).toBe(0);
});
it('liquidação divide unidades reais entre vendedores, aplica bônus e não repete após reload',()=>{
 let s=shops();s=command(s,{type:'hireSeller',id:'sale-n6'});s.time=DAY-1000;
 s.companies.player.shopStock={'common:common':5};
 s=advance(s,1000,{offline:true});
 expect(companyShops(s).map(p=>p.sales)).toEqual([3,2]);
 expect(s.companies.player.revenue).toBe(27775);
 expect(companyShops(s).reduce((n,p)=>n+p.till,0)).toBe(27775);
 s=advance(migrateSave(JSON.parse(JSON.stringify(s))),DAY,{offline:true});
 expect(s.companies.player.revenue).toBe(27775);
});
it('migração soma estoques antigos e mantém reservas, dinheiro e origem sem duplicar',()=>{
 let s=shops();delete s.companies.player.shopStock;
 s.properties['sale-ze'].stock={'noble:noble':4};s.properties['sale-n6'].stock={'noble:noble':2};
 const cash=s.companies.player.cash;s=migrateSave(s);
 expect(sharedShopStock(s)).toEqual({'noble:noble':6});expect(s.companies.player.cash).toBe(cash);
 expect(migrateSave(s)).toEqual(s);
});
it('capacidade soma lojas e excesso permanece na fábrica; perder loja não apaga estoque',()=>{
 let s=shops();s.companies.player.shopStock={'weak:weak':79};s.properties['factory-ze'].ready={'weak:weak':5};
 expect(shopCapacity(s)).toBe(80);s=command(s,{type:'collectCheese',id:'factory-ze'});
 expect(sharedShopStock(s)['weak:weak']).toBe(80);expect(s.properties['factory-ze'].ready['weak:weak']).toBe(4);
 s.properties['sale-n6'].owner=s.properties['sale-n6-control'].owner='neutral';s.properties['sale-ze'].sellerActive=false;
 expect(()=>command(s,{type:'collectCheese',id:'factory-ze'})).toThrow(/cheio/);
 expect(sharedShopStock(s)['weak:weak']).toBe(80);
});
it('sem loja própria impede envio e preserva a mercadoria',()=>{
 const s=shops(1);s.properties['sale-ze'].owner=s.properties['sale-ze-control'].owner='neutral';
 expect(()=>command(s,{type:'collectCheese',id:'factory-ze'})).toThrow(/Compre uma loja/);
 expect(s.properties['factory-ze'].ready['weak:weak']).toBe(1);
});
it('IA usa o mesmo estoque e bônus, sem compartilhar mercadoria com jogador',()=>{
 let s=shops(1);s.companies.coalho.cash=10000000;
 s=command(s,{type:'buyProperty',id:'sale-n6'},'coalho');
 s=command(s,{type:'collectCheese',id:'factory-coalho'},'coalho');
 expect(sharedShopStock(s,'coalho')['weak:weak']).toBe(1);expect(sharedShopStock(s)).toEqual({});
 expect(salePrice(s,'coalho','weak')).toBe(2778);
});
