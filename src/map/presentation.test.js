import {it,expect} from 'vitest';
import {collectionAsset,guardAsset,shopAsset,combatIcons} from './presentation.js';
import {createGame,command,advance} from '../domain/game.js';
import {rules} from '../data/game-rules.js';
it('coleta aparece apenas a partir de uma unidade e desaparece ao zerar',()=>{
 expect(collectionAsset({owner:'player',type:'farm',milk:{weak:.99}})).toBeNull();
 expect(collectionAsset({owner:'player',type:'farm',milk:{weak:.5,common:.5}})).toBe('icon_leite.png');
 expect(collectionAsset({owner:'player',type:'factory',ready:{'weak:weak':1}})).toBe('icon_queijo.png');
 expect(collectionAsset({owner:'player',type:'sale',till:99})).toBeNull();
 expect(collectionAsset({owner:'player',type:'sale',till:100})).toBe('icon_money.png');
 expect(collectionAsset({owner:'neutral',type:'sale',till:1000})).toBeNull();
});
it('bandeira é substituída pela equipe mesmo ocupada e loja segue controle',()=>{
 expect(guardAsset({owner:'neutral',team:null})).toBe('bandeira_capanga_neutra.png');
 expect(guardAsset({owner:'player',team:{stars:2,busyUntil:999999}})).toBe('capangas_aliado_nivel_2.png');
 expect(shopAsset({}, {type:'sale',owner:'player'})).toBe('Ponto_de_venda_aliado.png');
 expect(shopAsset({}, {type:'sale',owner:'coalho'})).toBe('Ponto_de_venda_inimiga.png');
 expect(shopAsset({}, {type:'sale',owner:'neutral'})).toBe('Ponto_de_venda_neutro.png');
});
it('missão mostra ataque e defesa, depois neutraliza loja/posto e remove ícones',()=>{
 let s=createGame();
 s.companies.player.cash=1000000;s.companies.coalho.cash=1000000;
 s=command(s,{type:'buyProperty',id:'sale-n6'});
 s=command(s,{type:'hireTeam',id:'sale-n6-control'});
 s=command(s,{type:'attack',id:'sale-n6-control',target:'sale-e1-control'});
 expect(combatIcons(s,'sale-n6-control')).toEqual(['icon_ataque.png']);
 expect(combatIcons(s,'sale-e1-control')).toEqual(['icon_defesa.png']);
 s=advance(s,rules.attackDuration,{rng:()=>0});
 expect(combatIcons(s,'sale-e1-control')).toEqual([]);
 expect(combatIcons(s,'sale-n6-control')).toEqual([]);
 expect(s.properties['sale-e1'].owner).toBe('neutral');
 expect(s.properties['sale-e1-control'].owner).toBe('neutral');
 expect(s.properties['sale-e1-control'].team).toBeNull();
 s.companies.coalho.cash=100000;
 const cash=s.companies.coalho.cash;
 s=command(s,{type:'buyProperty',id:'sale-e1'},'coalho');
 expect(s.companies.coalho.cash).toBe(cash-rules.propertyPrice);
 expect(s.properties['sale-e1-control'].owner).toBe('coalho');
});
it('inimigo também compra pontos neutros e não pode atacá-los',()=>{
 let s=createGame();s=command(s,{type:'hireTeam',id:'sale-e1-control'},'coalho');
 expect(()=>command(s,{type:'attack',id:'sale-e1-control',target:'sale-n6-control'},'coalho')).toThrow(/comprados/);
});

it('barraquinha inicial preserva arte do Seu Zé quando pertence ao jogador',()=>{
 const slot={id:'sale-ze',building:'ponto_de_venda_inicial_seu_ze.png'};
 expect(shopAsset(slot,{type:'sale',owner:'player'})).toBe(slot.building);
 expect(shopAsset(slot,{type:'sale',owner:'neutral'})).toBe('Ponto_de_venda_neutro.png');
});

it('ponto inicial mostra equipe contratada; outras lojas usam arte aliada',()=>{
 expect(guardAsset({id:'sale-ze-control',owner:'player',team:{stars:3}})).toBe('capangas_aliado_nivel_3.png');
 expect(shopAsset({id:'sale-n1'},{owner:'player',type:'sale'})).toBe('Ponto_de_venda_aliado.png');
 expect(guardAsset({id:'sale-n1-control',owner:'player',team:{stars:1}})).toBe('capangas_aliado_nivel_1.png');
});
