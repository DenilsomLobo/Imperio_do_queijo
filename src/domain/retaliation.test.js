import {it,expect} from 'vitest';
import {createGame,command,advance,resolvePending} from './game.js';
import {rules} from '../data/game-rules.js';
function ready(owner='player',level=1){
 let s=createGame();const other=owner==='player'?'coalho':'player';
 s.properties['sale-n6'].owner=owner;s.properties['sale-n6-control'].owner=owner;
 s.properties['sale-n6-control'].team={id:900,count:3,stars:1,moral:1,weapon:0,busyUntil:0,recoverUntil:0,cooldownUntil:0,missedWages:0};
 s.properties['sale-e1'].owner=other;s.properties['sale-e1-control'].owner=other;s.properties['sale-e1-control'].team={...s.properties['sale-n6-control'].team,id:901,stars:level};
 s.companies[owner].cash=100000;s.companies[other].cash=100000;
 s=command(s,{type:'attack',id:'sale-n6-control',target:'sale-e1-control'},owner);
 s.missions[0].due=s.time+1000; // Isola compensacao de despesas do fechamento diario.
 return s;
}
for(const owner of ['player','coalho'])for(const level of [1,2,3])it('derrota de '+owner+' paga defesa nível '+level+' sem criar dinheiro',()=>{
 let s=ready(owner,level);const other=owner==='player'?'coalho':'player',a=s.companies[owner].cash,b=s.companies[other].cash;
 s=advance(s,1000,{rng:()=>.999});expect(s.companies[owner].cash).toBe(a-5000*level);expect(s.companies[other].cash).toBe(b+5000*level);
 expect(s.companies[owner].retaliationDebts).toHaveLength(0);
});
it('vitória do atacante não gera compensação por defesa',()=>{
 let s=ready();const cash=s.companies.player.cash;s=advance(s,1000,{rng:()=>0});expect(s.companies.player.cash).toBe(cash);expect(s.ledger.some(e=>e.kind==='Prêmio por defesa vencedora')).toBe(false);
});
it('sem caixa mantém dívida e reload não duplica o prêmio',()=>{
 let s=ready('player',3);s.companies.player.cash=2000;const enemy=s.companies.coalho.cash;
 s=advance(s,1000,{rng:()=>.999});expect(s.companies.player.cash).toBe(0);expect(s.companies.player.retaliationDebts[0].amount).toBe(13000);expect(s.companies.coalho.cash).toBe(enemy+2000);
 s=JSON.parse(JSON.stringify(s));s.companies.player.cash=13000;s=advance(s,1000);expect(s.companies.coalho.cash).toBe(enemy+15000);expect(s.companies.player.retaliationDebts).toHaveLength(0);
 s=advance(s,1000);expect(s.companies.coalho.cash).toBe(enemy+15000);
});
it('incidente offline paga somente ao resolver resultado',()=>{
 let s=ready();const cash=s.companies.player.cash;s=advance(s,1000,{offline:true});expect(s.companies.player.cash).toBe(cash);expect(s.pendingIncidents).toHaveLength(1);
 s=resolvePending(s,{rng:()=>.999});expect(s.companies.player.cash).toBe(cash-5000);s=resolvePending(s,{rng:()=>.999});expect(s.companies.player.cash).toBe(cash-5000);
});
it('preços novos e capacidade da fazenda 2 são aplicados na compra',()=>{
 let s=createGame();s.companies.player.cash=3500000;s=command(s,{type:'buyProperty',id:'farm-level-2'});expect(s.companies.player.cash).toBe(500000);expect(rules.farmCapacities[1]).toBe(30);
 s=command(s,{type:'buyCow',id:'farm-level-2',species:'common'});s=command(s,{type:'buyCow',id:'farm-level-2',species:'noble'});expect(s.companies.player.cash).toBe(125000);expect(rules.cows.noble.name).toBe('Premiada');expect(rules.recipes.common.price).toBe(5000);expect(rules.recipes.noble.price).toBe(10000);
});
