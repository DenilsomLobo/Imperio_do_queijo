import {it,expect} from 'vitest';
import {createGame,migrateSave,advance,command} from './game.js';
import {DAY,rules} from '../data/game-rules.js';
const OLD_DAY=3600000;
it('dia em 5 minutos produz um litro, consome ração e paga salário uma vez',()=>{
 let s=createGame();s=command(s,{type:'buyFeed',id:'farm-ze',quantity:10});
 s=advance(s,DAY-1000,{offline:true});expect(s.properties['farm-ze'].milk.weak).toBe(0);
 s=advance(s,1000,{offline:true});expect(s.properties['farm-ze'].milk.weak).toBe(1);expect(s.properties['farm-ze'].feed).toBeCloseTo(0);
 expect(s.ledger.filter(e=>e.owner==='player'&&e.kind==='Salário de vendedor')).toHaveLength(1);
 expect(DAY).toBe(300000);expect(rules.offlineLimit/DAY).toBe(96);
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
 expect(next.properties['sale-ze'].saleProgress).toBe(7500);expect(next.ledger.at(-1).time/DAY).toBeCloseTo(2.2);
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

it('velocidades correspondem exatamente a 5, 3 e 1 minuto por dia',()=>{
 for(const [speed,minutes] of [[1,5],[2,3],[4,1]]) expect(minutes*60000*rules.speedFactors[speed]).toBe(DAY);
 const s=createGame();s.clockVersion=2;s.time=1200000*2.5;
 expect(migrateSave(s).time/DAY).toBe(2.5);
});
