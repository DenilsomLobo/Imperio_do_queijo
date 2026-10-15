import {it,expect} from 'vitest';
import {createGame,command,advance} from './game.js';
import {minimumBid} from './auctions.js';
import {DAY} from '../data/game-rules.js';
function prepareExpansion(s,owner){for(const p of Object.values(s.properties))if(['farm','factory'].includes(p.type)&&!['farm-ze','factory-ze','farm-coalho','factory-coalho'].includes(p.id))p.owner=owner;s.properties['bank-rural'].owner=s.properties.transport.owner=owner;s.companies[owner].bank={level:1,propertyId:'bank-rural',startedAt:s.time};s.companies[owner].logistics={propertyId:'transport',startedAt:s.time,nextFeeAt:s.time+DAY,suspended:false,milkMoved:0,cheeseMoved:0};return s;}
function control(s,owner){for(const p of Object.values(s.properties))if(p.type==='sale'){p.owner=owner;s.properties[p.securityId].owner=owner;}s.companies[owner].cash=100000000;return s;}
function winAuction(s,id,owner){s=command(s,{type:'bidProperty',id,amount:minimumBid(s,s.properties[id])},owner);s.time=s.auctions[id].endsAt-1000;s.lastAi=s.time;return advance(s,1000,{offline:true});}
it('comprar propriedade rival exige leilão; vitória precisa de ambas aquisições e controle de lojas',()=>{
 let s=prepareExpansion(control(createGame(),'player'),'player');expect(()=>command(s,{type:'buyProperty',id:'farm-coalho'})).toThrow();s=winAuction(s,'farm-coalho','player');expect(s.campaign?.outcome).toBeUndefined();s=winAuction(s,'factory-coalho','player');expect(s.campaign.outcome).toBe('victory');expect(advance(s,60000)).toEqual(s);expect(()=>command(s,{type:'buyFeed',id:'farm-ze',quantity:1})).toThrow(/encerrada/);
});
it('perda isolada da fazenda não encerra campanha e permite recompra',()=>{
 let s=createGame();s.companies.coalho.cash=100000000;s=winAuction(s,'farm-ze','coalho');expect(s.properties['farm-ze'].owner).toBe('coalho');expect(s.campaign?.outcome).toBeUndefined();expect(()=>command(s,{type:'bidProperty',id:'farm-ze',amount:minimumBid(s,s.properties['farm-ze'])})).not.toThrow();
});
it('derrota exige perder ambas propriedades iniciais e todas as lojas',()=>{
 let s=prepareExpansion(control(createGame(),'coalho'),'coalho');s=winAuction(s,'farm-ze','coalho');expect(s.campaign?.outcome).toBeUndefined();s=winAuction(s,'factory-ze','coalho');expect(s.campaign.outcome).toBe('defeat');expect(advance(s,60000)).toEqual(s);
});
it('equipes de nível 3 são contratadas com caixa real',()=>{let s=createGame();s.companies.player.cash=2000000;s=command(s,{type:'hireTeam',id:'sale-ze-control',level:3});expect(s.properties['sale-ze-control'].team.stars).toBe(3);expect(s.companies.player.cash).toBe(1100000);});
