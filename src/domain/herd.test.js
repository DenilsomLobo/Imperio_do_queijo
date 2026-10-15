import {it,expect} from 'vitest';
import {createGame,command,advance,validateSave} from './game.js';
import {DAY,rules} from '../data/game-rules.js';
it('venda aguarda três dias, paga 70% e não duplica vacas',()=>{
 let s=command(createGame(),{type:'buyCow',id:'farm-ze',species:'weak'});
 s.time=3*DAY-1;
 expect(()=>command(s,{type:'sellCow',id:'farm-ze',species:'weak',quantity:2})).toThrow(/3 dias/);
 s.time=3*DAY;
 const cash=s.companies.player.cash;
 s=command(s,{type:'sellCow',id:'farm-ze',species:'weak',quantity:2});
 expect(s.properties['farm-ze'].cows.weak).toBe(0);
 expect(s.companies.player.cash).toBe(cash+rules.cows.weak.price*1.4);
 expect(()=>command(s,{type:'sellCow',id:'farm-ze',species:'weak',quantity:1})).toThrow();
 expect(validateSave(JSON.parse(JSON.stringify(s)))).toEqual(s);
});
it('transferência preserva prazo e exige propriedade, vagas e quantidade válida',()=>{
 let s=createGame();
 const target=Object.values(s.properties).find(p=>p.type==='farm'&&p.owner==='neutral');
 target.owner='player';
 s.time=DAY;
 s=command(s,{type:'buyCow',id:'farm-ze',species:'weak'});
 s=command(s,{type:'moveCow',id:'farm-ze',target:target.id,species:'weak',quantity:2});
 expect(s.properties[target.id].cows.weak).toBe(2);
 expect(s.properties['farm-ze'].cows.weak).toBe(0);
 s.time=3*DAY;
 expect(()=>command(s,{type:'sellCow',id:target.id,species:'weak',quantity:2})).toThrow(/3 dias/);
 s=command(s,{type:'sellCow',id:target.id,species:'weak',quantity:1});
 expect(s.properties[target.id].cowAges.weak).toEqual([DAY]);
 expect(()=>command(s,{type:'moveCow',id:target.id,target:'farm-coalho',species:'weak',quantity:1})).toThrow(/empresa/);
});
it('ração parcial melhora produção sem gerar leite além da capacidade',()=>{
 let s=createGame();s.properties['farm-ze'].feed=rules.cows.weak.feed/2;
 s=advance(s,DAY,{offline:true});
 expect(s.properties['farm-ze'].milk.weak).toBe(0);
 expect(s.properties['farm-ze'].milkProgress.weak).toBeCloseTo(0.75,3);
 expect(s.properties['farm-ze'].feed).toBeCloseTo(0);
 s.properties['farm-ze'].milk.weak=99; s.properties['farm-ze'].milkProgress.weak=0.9;
 s=advance(s,DAY,{offline:true});expect(s.properties['farm-ze'].milk.weak).toBeCloseTo(100);
});
