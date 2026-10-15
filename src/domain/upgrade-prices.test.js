import {it,expect} from 'vitest';
import {createGame,command} from './game.js';
import {rules,propertyPurchasePrice} from '../data/game-rules.js';
it('armamento e barricada cobram cada nível e bloqueiam o quarto',()=>{
 let s=createGame();s.companies.player.cash=5000000;s=command(s,{type:'hireTeam',id:'sale-ze-control'});
 for(const type of ['upgradeWeapon','upgradeBarricade'])for(const [i,price] of [12500,150000,350000].entries()){
  const cash=s.companies.player.cash;s=command(s,{type,id:'sale-ze-control'});expect(s.companies.player.cash).toBe(cash-price);
  expect(type==='upgradeWeapon'?s.properties['sale-ze-control'].team.weapon:s.properties['sale-ze-control'].barricade).toBe(i+1);
 }
 const cash=s.companies.player.cash;for(const type of ['upgradeWeapon','upgradeBarricade'])expect(()=>command(s,{type,id:'sale-ze-control'})).toThrow();expect(s.companies.player.cash).toBe(cash);
});
it('preços de expansão e salários usam valores solicitados',()=>{
 expect(propertyPurchasePrice({type:'farm',level:2})).toBe(3000000);expect(rules.farmCapacities[1]).toBe(30);expect(rules.banks[1].hire).toBe(900000);expect(rules.logistics).toEqual({hire:1500000,dailyFee:30000});
 expect(rules.teamHirePrices).toEqual([12500,300000,900000]);expect(rules.teamSalaries).toEqual([500,5000,10000]);
 for(const level of [2,3]){let s=createGame();s.companies.player.cash=1000000;const cash=s.companies.player.cash;s=command(s,{type:'hireTeam',id:'sale-ze-control',level});expect(s.companies.player.cash).toBe(cash-rules.teamHirePrices[level-1]);}
});
