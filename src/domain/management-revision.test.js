import {it,expect} from 'vitest';
import {createGame as freshGame,command,advance,validateSave,migrateSave} from './game.js';
import {rules,DAY} from '../data/game-rules.js';
import {salePrice,shopIsActive} from './shop-stock.js';
import {financialSnapshot} from './finances.js';
import {dominanceProgress,updateCampaign} from './campaign.js';
import {financeManagement} from '../ui/finances.js';
import {enemyManagement} from '../ui/enemies.js';
import {minimumBid} from './auctions.js';
function createGame(){const s=freshGame();s.companies.player.cash=100000000;return s;}
const assets=new Proxy({},{get:(_,key)=>key});
for(const [type,id,key,unit] of [['buyFeed','farm-ze','feed',rules.feedPrice],['buyPackaging','factory-ze','packaging',rules.packagingPrice]]){
 it(`${type} compra 1000 unidades com débito exato e persiste o excedente`,()=>{
  let s=createGame();const cash=s.companies.player.cash,before=s.properties[id][key];
  s=command(s,{type,id,quantity:1000});expect(s.properties[id][key]).toBe(before+1000);expect(s.companies.player.cash).toBe(cash-1000*unit);
  expect(validateSave(migrateSave(JSON.parse(JSON.stringify(s))))).toEqual(s);
 });
 it(`${type} rejeita falta de caixa e quantidades inválidas sem mutação`,()=>{
  const s=createGame(),before=structuredClone(s);
  for(const quantity of [0,-1,1.5,1001,NaN,Infinity])expect(()=>command(s,{type,id,quantity})).toThrow(/Quantidade/);
  expect(s).toEqual(before);s.companies.player.cash=unit-1;const poor=structuredClone(s);
  expect(()=>command(s,{type,id,quantity:1})).toThrow(/Caixa/);expect(s).toEqual(poor);
 });
}
it('loja sem vendedor não vende, mesmo com flag ativa antiga; vendedor contratado acrescenta 1% real',()=>{
 let s=createGame();const shop=s.properties['sale-ze'];shop.seller=false;shop.sellerActive=true;s.companies.player.shopStock={'weak:weak':2};
 s=advance(s,DAY,{offline:true});expect(s.companies.player.revenue).toBe(0);expect(shopIsActive(s.properties['sale-ze'])).toBe(false);
 s=command(s,{type:'hireSeller',id:shop.id});expect(salePrice(s,'player','weak',s.properties[shop.id])).toBe(2525);
 s=advance(s,DAY,{offline:true});expect(s.companies.player.revenue).toBe(5050);expect(s.properties[shop.id].till).toBe(5050);
});
it('vendedor suspenso não vende nem gera bônus; dois vendedores não multiplicam o 1% por empresa',()=>{
 let s=createGame();s=command(s,{type:'buyProperty',id:'sale-n4'});s=command(s,{type:'hireSeller',id:'sale-n4'});
 expect(salePrice(s,'player','weak',s.properties['sale-n4'])).toBe(2778);
 s.properties['sale-n4'].sellerActive=false;expect(salePrice(s,'player','weak',s.properties['sale-n4'])).toBe(2750);
 s.properties['sale-ze'].sellerActive=false;s.companies.player.shopStock={'weak:weak':5};s=advance(s,DAY,{offline:true});expect(s.companies.player.revenue).toBe(0);
});
it('finanças distinguem crédito inicial, venda, coleta, despesa, reserva de leilão e dívida',()=>{
 let s=createGame();s.companies.player.shopStock={'weak:weak':2};s=advance(s,DAY/rules.sellerDaily,{offline:true});
 expect(financialSnapshot(s).today.revenue).toBe(2525);expect(financialSnapshot(s).profit).toBe(2525);
 s=command(s,{type:'collectCash',id:'sale-ze'});const after=financialSnapshot(s);expect(after.revenue).toBe(2525);expect(after.till).toBe(0);
 s=command(s,{type:'buyFeed',id:'farm-ze',quantity:1000});s=command(s,{type:'bidProperty',id:'farm-level-2',amount:minimumBid(s,s.properties['farm-level-2'])});
 s.properties['farm-ze'].maintenanceDebt=500;s.companies.player.bankDebt=100;s.companies.player.retaliationDebts=[{amount:250,to:'coalho',property:'sale-ze'}];
 const f=financialSnapshot(s);expect(f.expenses).toBe(25000);expect(f.profit).toBe(2525-25000);expect(f.auctionReserve).toBe(s.auctions['farm-level-2'].amount);expect(f.debt).toBe(850);
 expect(f.propertyResults.find(p=>p.id==='farm-ze').expenses).toBe(25000);const html=financeManagement(s);expect(html).toContain('Resultado por estabelecimento');expect(html).toContain('Crédito inicial não é lucro');expect(html).toContain('Reservado em leilões');
});
function dominate(owner='player',bankId='bank-city'){
 const s=createGame();for(const p of Object.values(s.properties)){if(['sale','farm','factory'].includes(p.type)){p.owner=owner;if(p.securityId)s.properties[p.securityId].owner=owner;}}
 const level=bankId==='bank-city'?2:1;s.properties[bankId].owner=owner;s.companies[owner].bank={propertyId:bankId,level,startedAt:0};s.properties.transport.owner=owner;s.companies[owner].logistics={propertyId:'transport',startedAt:0,nextFeeAt:DAY,suspended:false,milkMoved:0,cheeseMoved:0};return s;
}
it('dominância tem 24 objetivos: 14 lojas, 8 imóveis, um banco e transportadora',()=>{
 const s=createGame(),p=dominanceProgress(s,'player');expect(p).toMatchObject({owned:3,total:24,remaining:21,shops:{owned:1,total:14},buildings:{owned:2,total:8},bank:false,transport:false});
 for(const bank of ['bank-rural','bank-city']){const full=dominate('player',bank);expect(dominanceProgress(full,'player').percent).toBe(100);updateCampaign(full);expect(full.campaign.outcome).toBe('victory');}
});
it('faltando imóvel neutro ou contrato não encerra; derrota é simétrica',()=>{
 const s=dominate();s.properties['farm-level-2'].owner='neutral';updateCampaign(s);expect(s.campaign).toBeUndefined();expect(dominanceProgress(s,'player').remaining).toBe(1);
 s.properties['farm-level-2'].owner='player';s.companies.player.logistics=null;updateCampaign(s);expect(s.campaign).toBeUndefined();
 const enemy=dominate('coalho');updateCampaign(enemy);expect(enemy.campaign.outcome).toBe('defeat');
});
it('100% com disputa aberta aguarda encerramento e não duplica resultado após reload',()=>{
 let s=dominate();s.companies.coalho.cash=100000000;
 s=command(s,{type:'bidProperty',id:'farm-ze',amount:minimumBid(s,s.properties['farm-ze'])},'coalho');
 s=command(s,{type:'bidProperty',id:'farm-ze',amount:minimumBid(s,s.properties['farm-ze'])});
 expect(dominanceProgress(s,'player').percent).toBe(100);expect(s.campaign).toBeUndefined();
 s.time=s.auctions['farm-ze'].endsAt-1000;s=advance(s,1000,{offline:true});expect(s.campaign.outcome).toBe('victory');expect(advance(migrateSave(s),DAY)).toEqual(migrateSave(s));
});
it('inimigos exibem somente posses rivais, lojas e capangas em cartões com navegação',()=>{
 let s=createGame();s.companies.coalho.cash=1000000;s=command(s,{type:'hireTeam',id:'sale-e1-control',level:1},'coalho');const html=enemyManagement(s,assets);
 expect(html).toContain('data-property="factory-coalho"');expect(html).toContain('data-property="sale-e1"');expect(html).toContain('data-resource-kind="enemy-guard"');expect(html).toContain('capangas_inimigos_nivel_1.png');expect(html).not.toContain('data-property="factory-ze"');expect(html).toContain('aria-label="Vitória"');expect(html).toContain('aria-label="Derrota: avanço do rival"');
});
