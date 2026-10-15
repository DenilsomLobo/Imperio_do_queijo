import {it,expect} from 'vitest';
import {createGame,migrateSave,advance,command} from './game.js';
import {DAY,rules} from '../data/game-rules.js';
const OLD_DAY=3600000;
it('dia em 1 minuto produz um litro, consome ração e paga salário uma vez',()=>{
 let s=createGame();s=command(s,{type:'buyFeed',id:'farm-ze',quantity:10});
 s=advance(s,DAY-1000,{offline:true});expect(s.properties['farm-ze'].milk.weak).toBe(0);
 s=advance(s,1000,{offline:true});expect(s.properties['farm-ze'].milk.weak).toBe(1);expect(s.properties['farm-ze'].feed).toBeCloseTo(0);
 expect(s.ledger.filter(e=>e.owner==='player'&&e.kind==='Salário de vendedor')).toHaveLength(1);
 expect(DAY).toBe(60000);expect(rules.offlineLimit/DAY).toBe(480);
});
it('migração mantém dia, hora, idades e vencimentos diários sem conceder produção',()=>{
 const s=createGame();delete s.clockVersion;s.time=2.5*OLD_DAY;s.properties['farm-ze'].cowAges.weak=[OLD_DAY];
 s.properties['farm-ze'].milk={weak:4};s.properties['farm-ze'].milkProgress={weak:.7};
 s.properties['factory-ze'].workers=[{id:'worker-old',level:1,missedWages:0,nextWageAt:3*OLD_DAY}];
 s.properties['sale-ze'].saleProgress=90000;
 s.ledger.push({id:s.nextId++,time:2.2*OLD_DAY,owner:'player',amount:0,kind:'Venda ao consumidor',revenue:2500,expense:0,property:'sale-ze'});
 s.companies.player.dailyFinance={day:2,revenue:2500,expenses:0,bankFees:0,taxedProfit:0,collected:0};
 const next=migrateSave(s);
 expect(next.time/DAY).toBe(2.5);expect(next.properties['farm-ze'].cowAges.weak).toEqual([DAY]);
 expect(next.properties['factory-ze'].workers[0].nextWageAt).toBe(3*DAY);
 expect(next.properties['farm-ze'].milk.weak).toBe(4);expect(next.properties['farm-ze'].milkProgress.weak).toBe(.7);
 expect(next.properties['sale-ze'].saleProgress).toBe(1500);expect(next.ledger.at(-1).time/DAY).toBeCloseTo(2.2);
 expect(next.companies.player.dailyFinance.day).toBe(2);expect(migrateSave(next)).toEqual(next);
});
it('receitas e missões preservam segundos restantes; maturação preserva dias',()=>{
 const s=createGame();delete s.clockVersion;s.time=OLD_DAY;
 s.properties['factory-ze'].batches=[{id:90,recipe:'weak',quality:'weak',phase:'production',due:s.time+60000},{id:91,recipe:'meia',quality:'weak',phase:'maturation',due:s.time+2*OLD_DAY}];
 s.missions=[{due:s.time+30000}];s.pendingIncidents=[{due:s.time+50000}];
 s.properties['sale-ze-control'].team={busyUntil:Number.MAX_SAFE_INTEGER,recoverUntil:s.time+120000,cooldownUntil:s.time+60000};
 const next=migrateSave(s);expect(next.properties['factory-ze'].batches[0].due-next.time).toBe(60000);
 expect(next.properties['factory-ze'].batches[1].due-next.time).toBe(2*DAY);
 expect(next.missions[0].due-next.time).toBe(30000);expect(next.pendingIncidents[0].due-next.time).toBe(50000);
 expect(next.properties['sale-ze-control'].team.busyUntil).toBe(Number.MAX_SAFE_INTEGER);
 expect(next.properties['sale-ze-control'].team.recoverUntil-next.time).toBe(120000);
});

it('velocidades correspondem exatamente a 60, 30 e 10 segundos por dia',()=>{
 for(const [speed,seconds] of [[1,60],[2,30],[4,10]]) expect(seconds*1000*rules.speedFactors[speed]).toBe(DAY);
 const s=createGame();s.clockVersion=2;s.time=1200000*2.5;
 expect(migrateSave(s).time/DAY).toBe(2.5);
});

it('migra escala de cinco minutos preservando calendário, contratos, lotes e progresso sem repetir migração',()=>{
 const s=createGame();s.clockVersion=3;s.time=750000;
 s.properties['farm-ze'].milkProgress={weak:.75};
 s.properties['farm-ze'].cowAges.weak=[300000];
 s.properties['factory-ze'].batches=[{id:90,recipe:'weak',quality:'weak',phase:'production',due:790000}];
 s.properties['factory-ze'].workers=[{id:'old',level:1,missedWages:0,nextWageAt:900000}];
 s.companies.player.logistics={propertyId:'transport',startedAt:600000,nextFeeAt:900000,suspended:false,milkMoved:2,cheeseMoved:1};
 s.auctions={'farm-level-2':{startedAt:600000,endsAt:3600000}};
 const n=migrateSave(s);
 expect(n.time).toBe(150000);expect(n.clockVersion).toBe(4);
 expect(n.properties['farm-ze'].milkProgress.weak).toBe(.75);
 expect(n.properties['farm-ze'].cowAges.weak).toEqual([60000]);
 expect(n.properties['factory-ze'].batches[0].due-n.time).toBe(40000);
 expect(n.properties['factory-ze'].workers[0].nextWageAt).toBe(180000);
 expect(n.companies.player.logistics.nextFeeAt).toBe(180000);
 expect(n.auctions['farm-level-2'].endsAt).toBe(720000);
 expect(migrateSave(n)).toEqual(n);
});

for(const speed of [1,2,4]) for(const recipe of ['weak','common','noble','radioactive','magic'])
it(`fabrica ${recipe} no modo ${speed} no prazo novo e sem antecipar`,()=>{
 let s=createGame();const f=s.properties['factory-ze'];f.milk={[recipe]:1};f.ready={};
 s=command(s,{type:'produce',id:f.id,recipe,quality:recipe});
 const realDuration=rules.recipes[recipe].time/rules.speedFactors[speed];
 s=advance(s,(realDuration-1000/rules.speedFactors[speed])*rules.speedFactors[speed],{offline:true});
 expect(s.properties[f.id].ready[`${recipe}:${recipe}`] ?? 0).toBe(0);
 s=advance(s,1000,{offline:true});
 expect(s.properties[f.id].ready[`${recipe}:${recipe}`]).toBe(1);
 expect(s.properties[f.id].packaging).toBe(rules.initialPackaging-1);
});
