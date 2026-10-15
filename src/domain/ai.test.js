import {it,expect} from 'vitest';
import {createGame,advance,command,migrateSave,validateSave,roadConnected} from './game.js';
import {rules,DAY} from '../data/game-rules.js';
import {aiEconomy} from './ai.js';
import {dominanceProgress} from './campaign.js';
const rich=()=>{const s=createGame();s.companies.coalho.cash=1000000000;return s;};
const decide=s=>{s.lastAi=s.time-rules.aiInterval;return advance(s,1000);};
function give(s,id){const p=s.properties[id];p.owner='coalho';if(p.securityId)s.properties[p.securityId].owner='coalho';return p;}

it('opera todas as fazendas/fábricas e receitas por origem sem criar mercadoria',()=>{
 let s=rich();give(s,'farm-level-2');give(s,'factory-level-1');
 for(const f of ['factory-coalho','factory-level-1']){s.properties[f].milk={weak:0};s.properties[f].ready={};s.properties[f].batches=[];}
 s.properties['farm-coalho'].milk={common:2,noble:1};s.properties['farm-level-2'].milk={radioactive:1,magic:1};
 s=decide(s);
 const batches=Object.values(s.properties).filter(p=>p.owner==='coalho'&&p.type==='factory').flatMap(p=>p.batches);
 expect(batches.map(b=>b.recipe).sort()).toEqual(['common','common','magic','noble','radioactive']);
 expect(batches.every(b=>b.recipe===b.quality)).toBe(true);
 expect(s.properties['farm-coalho'].milk.common).toBe(0);expect(s.properties['farm-level-2'].milk.magic).toBe(0);
 expect(s.companies.player.cash).toBe(50000);expect(validateSave(migrateSave(JSON.parse(JSON.stringify(s))))).toEqual(s);
});
it('recolhe todos os caixas, contrata vendedores em lojas adicionais e compra insumo exato',()=>{
 let s=rich();const extra=give(s,'sale-n4');extra.till=1234;extra.seller=false;extra.sellerActive=false;s.properties['sale-e1'].till=5678;
 s.properties['factory-coalho'].milk={magic:2};s.properties['factory-coalho'].packaging=0;s.properties['factory-coalho'].ready={};
 s=decide(s);expect(s.properties['sale-n4'].seller).toBe(true);
 expect(s.ledger.filter(e=>e.owner==='coalho'&&e.kind==='Coleta da loja').reduce((n,e)=>n+e.amount,0)).toBe(6912);
 expect(s.ledger.filter(e=>e.owner==='coalho'&&e.kind==='Embalagens').reduce((n,e)=>n+e.expense,0)).toBe(500);
 expect(s.properties['factory-coalho'].batches.filter(b=>b.recipe==='magic')).toHaveLength(2);
});
it('reinveste em vacas reais, diversifica e compra ração com retorno',()=>{
 let s=rich();s.properties['farm-coalho'].feed=0;const before=s.companies.coalho.cash;s=decide(s);
 expect(s.properties['farm-coalho'].cows.magic).toBe(1);
 expect(s.ledger.some(e=>e.owner==='coalho'&&e.kind==='Ração')).toBe(true);
 expect(s.companies.coalho.cash).toBeLessThan(before-rules.cows.magic.price);
 expect(aiEconomy(s).reserve).toBeGreaterThanOrEqual(10000);
});
it('substitui vaca antiga por espécie mais produtiva preservando prazo e débito real',()=>{
 let s=rich();s.time=4*DAY;s.properties['farm-coalho'].cows={weak:10};s.properties['farm-coalho'].cowAges={weak:Array(10).fill(0)};s=decide(s);
 expect(s.properties['farm-coalho'].cows.weak).toBe(9);expect(s.properties['farm-coalho'].cows.magic).toBe(1);
 expect(s.ledger.find(e=>e.owner==='coalho'&&e.kind==='Venda de vacas').amount).toBe(rules.cows.weak.price*rules.cowResaleRatio);
 expect(s.properties['farm-coalho'].cowAges.magic).toEqual([s.time]);
});
it('compra ração quando bônus de lojas torna alimentação rentável e contrata funcionário com retorno',()=>{
 let s=rich();for(const p of Object.values(s.properties))if(p.type==='sale'){give(s,p.id);p.seller=p.sellerActive=true;}
 give(s,'factory-level-1');give(s,'factory-level-2');
 s.properties['farm-coalho'].cows={magic:10};s.properties['farm-coalho'].cowAges={magic:Array(10).fill(0)};s.properties['factory-coalho'].milk={magic:100};
 s=decide(s);expect(s.ledger.some(e=>e.owner==='coalho'&&e.kind==='Ração'&&e.expense>0)).toBe(true);
 expect(s.properties['factory-coalho'].workers).toHaveLength(1);expect(s.properties['factory-coalho'].workers[0].level).toBe(1);
});
it('caixa inicial finito sustenta crescimento real sem criar bens ou dinheiro grátis',()=>{
 let s=createGame();s=advance(s,15*DAY,{rng:()=>0.99});
 expect(s.companies.coalho.cash).toBeGreaterThan(0);expect(s.companies.coalho.strategy).toBeDefined();
 expect(Object.values(s.properties['farm-coalho'].cows).reduce((n,v)=>n+v,0)).toBeGreaterThan(1);
 const positive=s.ledger.filter(e=>e.owner==='coalho'&&e.amount>0);
 expect(positive.every(e=>['Coleta da loja','Devolução de lance superado','Defesa de propriedade: devolução','Leilão cancelado: devolução','Venda de vacas','Compensação por defesa'].includes(e.kind))).toBe(true);
 expect(Object.keys(s.auctions)).toHaveLength(0);expect(validateSave(migrateSave(s))).toEqual(s);
});
it('jogador inicial também consegue pagar o ciclo básico de uma Magrela alimentada',()=>{
 let s=createGame();s.properties['factory-ze'].milk={};s.properties['factory-ze'].ready={};
 s=command(s,{type:'buyFeed',id:'farm-ze',quantity:10});s=command(s,{type:'buyPackaging',id:'factory-ze',quantity:1});
 s=advance(s,DAY,{offline:true});s=command(s,{type:'collectMilk',id:'farm-ze',target:'factory-ze'});s=command(s,{type:'produce',id:'factory-ze',recipe:'weak',quality:'weak'});
 s=advance(s,rules.recipes.weak.time,{offline:true});s=command(s,{type:'collectCheese',id:'factory-ze'});s=advance(s,DAY-rules.recipes.weak.time,{offline:true});s=command(s,{type:'collectCash',id:'sale-ze'});
 expect(s.companies.player.cash).toBeGreaterThan(50000);expect(s.properties['sale-ze'].sellerActive).toBe(true);expect(s.properties['sale-ze'].maintenanceDebt).toBe(0);
});
it('não compra ração quando o gargalo de fabricação elimina seu retorno',()=>{
 let s=rich();s.properties['farm-coalho'].cows={magic:20};s.properties['farm-coalho'].cowAges={magic:Array(20).fill(0)};s=decide(s);
 expect(s.ledger.some(e=>e.owner==='coalho'&&e.kind==='Ração')).toBe(false);
});
it('desenvolve militares da fronteira e só ataca vizinho com orçamento e chance mínima',()=>{
 let s=rich();give(s,'sale-n6');s=command(s,{type:'hireTeam',id:'sale-n6-control'},'coalho');
 // sale-ze is not adjacent to sale-n6; use the real road endpoints for targets.
 const adjacent=Object.values(s.properties).find(p=>p.type==='security'&&p.owner==='neutral'&&roadConnected('sale-n6-control',p.id));
 expect(adjacent).toBeDefined();adjacent.owner='player';s.properties[adjacent.saleId].owner='player';
 s.time=2*DAY;s=decide(s);
 expect(s.properties['sale-n6-control'].team.weapon).toBeGreaterThan(0);
 const mission=s.missions.find(m=>m.from==='sale-n6-control');expect(mission).toBeDefined();expect(roadConnected(mission.from,mission.to)).toBe(true);
 const poor=createGame();poor.companies.coalho.cash=0;poor.time=2*DAY;expect(decide(poor).missions).toHaveLength(0);
});
it('não faz investimentos territoriais/militares offline e respeita campanha encerrada',()=>{
 const s=rich();const next=advance(s,3*DAY,{offline:true});expect(next.companies.coalho.bank).toBeNull();expect(next.companies.coalho.logistics).toBeNull();expect(next.missions).toHaveLength(0);expect(next.properties['farm-coalho'].cows).toEqual({weak:1});
 s.campaign={outcome:'victory',finishedAt:0};expect(advance(s,DAY)).toEqual(s);
});
it('busca qualquer banco, transportadora e último imóvel até vencer com recursos reais',()=>{
 let s=rich();for(const p of Object.values(s.properties))if(['sale','farm','factory'].includes(p.type)&&p.id!=='farm-ze')give(s,p.id);
 s.properties['farm-coalho'].cows={magic:20};s.properties['farm-coalho'].cowAges={magic:Array(20).fill(0)};
 for(const p of Object.values(s.properties))if(p.type==='sale'){p.seller=true;p.sellerActive=true;}
 s.time=2*DAY;s=decide(s);
 expect(s.companies.coalho.bank).not.toBeNull();expect(s.companies.coalho.logistics).not.toBeNull();
 expect(s.auctions['farm-ze']?.bidder).toBe('coalho');expect(s.campaign).toBeUndefined();
 s=advance(s,10*DAY,{rng:()=>0});expect(dominanceProgress(s,'coalho').remaining).toBe(0);expect(s.campaign.outcome).toBe('defeat');
 expect(s.companies.coalho.cash).toBeGreaterThanOrEqual(0);expect(advance(migrateSave(s),DAY)).toEqual(migrateSave(s));
});
