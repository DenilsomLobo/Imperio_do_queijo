import {it,expect} from 'vitest';
import {createGame,command,advance,migrateSave,validateSave} from './game.js';
import {minimumBid,propertyValuation,auctionDecision} from './auctions.js';
import {rules,DAY,factoryProfile} from '../data/game-rules.js';
const bid=(s,id,owner='player',amount=minimumBid(s,s.properties[id]))=>command(s,{type:'bidProperty',id,amount},owner);
function rich(){const s=createGame();s.companies.player.cash=100000000;s.companies.coalho.cash=100000000;return s;}
function close(s,id){const end=s.auctions[id].endsAt;s.time=end-1000;s.lastAi=s.time;return advance(s,1000,{offline:true});}
it('paridade inicial: uma vaca, um leite, um queijo, caixa de R$ 500/1000 e apenas uma loja rival',()=>{
 const s=createGame();expect(s.companies.player.cash).toBe(50000);expect(s.companies.coalho.cash).toBe(100000);
 for(const id of ['farm-ze','farm-coalho'])expect(s.properties[id].cows).toEqual({weak:1});
 for(const id of ['factory-ze','factory-coalho']){expect(s.properties[id].milk).toEqual({weak:1});expect(s.properties[id].ready).toEqual({'weak:weak':1});expect(s.properties[id].packaging).toBe(10);}
 expect(Object.values(s.properties).filter(p=>p.type==='sale'&&p.owner==='coalho')).toHaveLength(1);expect(Object.values(s.properties).filter(p=>p.type==='sale'&&p.owner==='neutral')).toHaveLength(12);expect(Object.values(s.properties).filter(p=>p.team)).toHaveLength(0);
});
it('lance inclui vacas, aumenta 10%, reserva caixa e não estende o prazo',()=>{
 let s=rich();const id='farm-coalho',value=propertyValuation(s.properties[id]);expect(value).toBe(275000);
 const cash=s.companies.player.cash;s=bid(s,id);const a=s.auctions[id];expect(a.amount).toBe(302500);expect(s.companies.player.cash).toBe(cash-a.amount);expect(a.endsAt).toBe(10*DAY);
 expect(()=>bid(s,id,'coalho',a.amount)).toThrow(/10%/);expect(()=>bid(s,id,'player')).toThrow(/maior lance/);
 s.time=DAY;s=bid(s,id,'coalho');expect(s.auctions[id].endsAt).toBe(10*DAY);expect(s.companies.player.cash).toBe(cash);
});
it('dono vencedor recupera reserva e mantém propriedade; reload não repete',()=>{
 let s=rich();const id='farm-ze',cash=s.companies.player.cash;s=bid(s,id,'coalho');s=bid(s,id);s=close(s,id);expect(s.properties[id].owner).toBe('player');expect(s.companies.player.cash).toBe(cash-(rules.sellerSalary+rules.shopDailyMaintenance));expect(s.auctions[id]).toBeUndefined();
 const restored=validateSave(migrateSave(JSON.parse(JSON.stringify(s))));const again=advance(restored,1000,{offline:true});expect(again.companies.player.cash).toBe(cash-(rules.sellerSalary+rules.shopDailyMaintenance));
});
it('rival vencedor paga ao dono e recebe fazenda com vacas; dono pode tentar recomprar',()=>{
 let s=rich(),id='farm-ze';s=bid(s,id,'coalho');const amount=s.auctions[id].amount,before=s.companies.player.cash;s=close(s,id);expect(s.properties[id].owner).toBe('coalho');expect(s.properties[id].cows).toEqual({weak:1});expect(s.companies.player.cash).toBe(before+amount-(rules.sellerSalary+rules.shopDailyMaintenance));expect(s.campaign?.outcome).toBeUndefined();s=bid(s,id);expect(s.auctions[id].bidder).toBe('player');
});
it('avalia funcionários e transfere fábrica sem criar recursos',()=>{
 let s=rich();s=command(s,{type:'hireWorker',id:'factory-ze',level:1});expect(propertyValuation(s.properties['factory-ze'])).toBe(425000);s=bid(s,'factory-ze','coalho');expect(()=>command(s,{type:'hireWorker',id:'factory-ze',level:1})).toThrow(/leilão/);s=close(s,'factory-ze');expect(s.properties['factory-ze'].owner).toBe('coalho');expect(s.properties['factory-ze'].workers).toHaveLength(1);
});
for(const [id,type,key] of [['bank-rural','hireBank','bank'],['transport','hireLogistics','logistics']])it('perder '+id+' remove contrato e transfere benefício, sem recontratação direta',()=>{
 let s=rich();s=command(s,{type,id});s=bid(s,id,'coalho');expect(()=>command(s,{type:key==='bank'?'cancelBank':'cancelLogistics',id})).toThrow(/leilão/);s=close(s,id);expect(s.companies.player[key]).toBeNull();expect(s.companies.coalho[key].propertyId).toBe(id);expect(s.properties[id].owner).toBe('coalho');expect(()=>command(s,{type,id})).toThrow(/outra empresa/);s=bid(s,id);expect(s.auctions[id].bidder).toBe('player');
});
it('não aceita lance inválido, sem caixa ou compra direta durante disputa',()=>{
 let s=createGame();s.companies.player.cash=0;expect(()=>bid(s,'farm-coalho')).toThrow(/Caixa/);s=rich();expect(()=>bid(s,'sale-ze')).toThrow(/disputa/);expect(()=>bid(s,'farm-coalho','player',NaN)).toThrow(/mínimo/);s=bid(s,'factory-level-1');expect(()=>command(s,{type:'buyProperty',id:'factory-level-1'})).toThrow();const corrupt=structuredClone(s);corrupt.auctions['factory-level-1'].amount=-1;expect(()=>validateSave(corrupt)).toThrow(/Leilão/);
});
it('capacidade manual simultânea e vagas são 5, 10 e 20, com manutenção só nas fábricas compradas',()=>{
 for(const [id,n,daily] of [['factory-ze',5,0],['factory-level-1',10,10000],['factory-level-2',20,40000]]){
  let s=rich();const f=s.properties[id];if(f.owner!=='player')s=command(s,{type:'buyProperty',id});s.properties[id].milk={weak:100};s.properties[id].packaging=100;s.properties[id].ready={};expect(factoryProfile(f).workers).toBe(n);
  for(let i=0;i<n;i++)s=command(s,{type:'produce',id,recipe:'weak',quality:'weak'});expect(s.properties[id].batches).toHaveLength(n);expect(()=>command(s,{type:'produce',id,recipe:'weak',quality:'weak'})).toThrow(/Linha/);s=advance(s,DAY,{offline:true});expect(s.properties[id].ready['weak:weak']).toBe(n);expect(s.ledger.filter(e=>e.kind==='Manutenção de queijaria'&&e.property===id).reduce((v,e)=>v+e.expense,0)).toBe(daily);
 }
});
it('IA só disputa expansão útil e rentável mantendo reserva de caixa',()=>{
 let s=rich();s.properties['farm-ze'].cows={magic:10};s.properties['farm-coalho'].cows={weak:10};expect(auctionDecision(s)?.id).toBe('farm-ze');s.companies.coalho.cash=100;expect(auctionDecision(s)).toBeNull();s=rich();expect(auctionDecision(s)).toBeNull();
});

it('prazo real de dez dias encerra uma única vez, inclusive offline e com contraproposta',()=>{
 let s=rich();s=bid(s,'farm-ze','coalho');const end=s.auctions['farm-ze'].endsAt;
 s=advance(s,9*DAY,{offline:true});expect(s.properties['farm-ze'].owner).toBe('player');expect(s.auctions['farm-ze'].endsAt).toBe(end);
 s=bid(s,'farm-ze','player');const refund=s.auctions['farm-ze'].amount;s=advance(s,DAY,{offline:true});expect(s.properties['farm-ze'].owner).toBe('player');expect(s.auctions['farm-ze']).toBeUndefined();
 const refunds=s.ledger.filter(e=>e.kind==='Defesa de propriedade: devolução'&&e.property==='farm-ze');expect(refunds).toHaveLength(1);expect(refunds[0].amount).toBe(refund);
 s=advance(validateSave(migrateSave(JSON.parse(JSON.stringify(s)))),DAY,{offline:true});expect(s.ledger.filter(e=>e.kind==='Defesa de propriedade: devolução'&&e.property==='farm-ze')).toHaveLength(1);
});
it('perder transporte impede coletas antigas e o contrato novo atende apenas o novo dono',()=>{
 let s=rich();s=command(s,{type:'hireLogistics',id:'transport'});s=bid(s,'transport','coalho');s=close(s,'transport');s.properties['farm-ze'].milk={weak:2};s.properties['factory-ze'].milk={weak:0};s.properties['farm-coalho'].milk={weak:2};s.properties['factory-coalho'].milk={weak:0};s=advance(s,1000,{offline:true});expect(s.properties['farm-ze'].milk.weak).toBe(2);expect(s.properties['factory-ze'].milk.weak).toBe(0);expect(s.properties['factory-coalho'].milk.weak).toBe(2);expect(s.companies.player.logistics).toBeNull();
});

it('IA inicia um lance real apenas quando a oportunidade atende critérios e caixa',()=>{
 let s=rich();s.properties['farm-ze'].cows={magic:10};s.properties['farm-coalho'].cows={weak:10};s.time=2*DAY;s.lastAi=s.time-rules.aiInterval;s=advance(s,1000);expect(s.auctions['farm-ze'].bidder).toBe('coalho');expect(s.ledger.some(e=>e.owner==='coalho'&&e.kind==='Reserva de lance')).toBe(true);
 let poor=createGame();poor.time=2*DAY;poor.lastAi=poor.time-rules.aiInterval;poor=advance(poor,1000);expect(Object.keys(poor.auctions)).toHaveLength(0);expect(poor.companies.coalho.cash).toBeGreaterThanOrEqual(0);
});
