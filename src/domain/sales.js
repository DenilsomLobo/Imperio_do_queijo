import {DAY} from '../data/game-rules.js';
export function salesOfDay(s,owner='player',property,day=Math.floor(s.time/DAY)){
 return s.ledger.filter(e=>e.owner===owner&&e.kind==='Venda ao consumidor'&&Math.floor(e.time/DAY)===day&&(!property||e.property===property)).reduce((n,e)=>n+e.revenue,0);
}
