import {rules,DAY,factoryProfile} from '../data/game-rules.js';
export const activeWorkers=factory=>(factory.workers ?? []).filter(w=>w.missedWages===0);
export const productionMultiplier=factory=>1+activeWorkers(factory).reduce((n,w)=>n+rules.workerTiers[w.level].speed,0);
export const workerCapacity=factory=>factoryProfile(factory).workers;
export function processWorkerPayroll(state,factory,pay,report) {
 factory.workers=(factory.workers ?? []).filter(worker=>{
  if(worker.nextWageAt>state.time) return true;
  const daily=rules.workerTiers[worker.level].salary;
  const owed=daily*(worker.missedWages+1);
  if(state.companies[factory.owner].cash>=owed) {pay(owed);worker.missedWages=0;}
  else worker.missedWages++;
  worker.nextWageAt+=DAY;
  if(worker.missedWages<rules.unpaidDaysBeforeDeparture) return true;
  const notice={id:worker.id,level:worker.level,time:state.time,text:'Funcionário nível '+worker.level+' pediu demissão após 4 dias sem salário.',unpaid:daily*worker.missedWages};
  (factory.staffNotices ??= []).push(notice);report(notice.text);return false;
 });
}
