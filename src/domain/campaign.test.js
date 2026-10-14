import {it,expect} from 'vitest';
import {createGame,command,advance} from './game.js';
import {finalPurchaseAllowed} from './campaign.js';
import {DAY,rules} from '../data/game-rules.js';
function control(s,owner) {
 for(const p of Object.values(s.properties)) if(p.type==='sale'){
  p.owner=owner;s.properties[p.securityId].owner=owner;
 }
 s.companies[owner].cash=10000000;
 return s;
}
it('somente controle de todos os pontos libera compra final; ambas aquisições são necessárias',()=>{
 let s=createGame();
 expect(()=>command(s,{type:'buyProperty',id:'farm-coalho'})).toThrow();
 s=control(s,'player');
 expect(finalPurchaseAllowed(s,'farm-coalho','player')).toBe(true);
 s=command(s,{type:'buyProperty',id:'farm-coalho'});
 expect(s.campaign?.outcome).toBeUndefined();
 s=command(s,{type:'buyProperty',id:'factory-coalho'});
 expect(s.campaign.outcome).toBe('victory');
 expect(advance(s,60000)).toEqual(s);
 expect(()=>command(s,{type:'buyFeed',id:'farm-ze',quantity:1})).toThrow(/encerrada/);
});
it('rival só pode comprar fazenda inicial após controlar todas as lojas e então provoca derrota',()=>{
 let s=control(createGame(),'coalho');
 s=command(s,{type:'buyProperty',id:'farm-ze'},'coalho');
 expect(s.properties['farm-ze'].owner).toBe('coalho');
 expect(s.campaign.outcome).toBe('defeat');
 expect(advance(s,60000)).toEqual(s);
});
it('equipes de nível 3 compradas têm custo real e atributo correto',()=>{
 let s=command(createGame(),{type:'buyProperty',id:'sale-n6'});
 s.companies.player.cash=200000;
 s=command(s,{type:'hireTeam',id:'sale-n6-control',level:3});
 expect(s.properties['sale-n6-control'].team.stars).toBe(3);
 expect(s.companies.player.cash).toBe(85000);
});
it('IA efetivamente compra a fazenda liberada e encerra a partida com derrota',()=>{
 let s=control(createGame(),'coalho');s.time=2*DAY;s.lastAi=s.time-rules.aiInterval;
 s=advance(s,1000);
 expect(s.campaign.outcome).toBe('defeat');
 expect(s.properties['farm-ze'].owner).toBe('coalho');
});
