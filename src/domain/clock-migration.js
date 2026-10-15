import {DAY} from '../data/game-rules.js';
const OLD_DAY=60*60*1000;
export const CLOCK_VERSION=4;
export function migrateClock(state) {
 if((state.clockVersion ?? 1)>=CLOCK_VERSION) return;
 const oldDay=(state.clockVersion ?? 1)===1?OLD_DAY:state.clockVersion===2?20*60*1000:5*60*1000;
 const oldTime=state.time,ratio=DAY/oldDay,newTime=oldTime*ratio;
 const stamp=value=>value*ratio;
 const deadline=value=>value===Number.MAX_SAFE_INTEGER?value:value>oldTime?newTime+value-oldTime:stamp(value);
 for(const p of Object.values(state.properties)) {
  for(const b of p.batches ?? []) b.due=b.phase==='maturation'?stamp(b.due):deadline(b.due);
  for(const worker of p.workers ?? []) worker.nextWageAt=stamp(worker.nextWageAt);
  for(const ages of Object.values(p.cowAges ?? {})) for(let i=0;i<ages.length;i++) ages[i]=stamp(ages[i]);
  for(const notice of p.staffNotices ?? []) notice.time=stamp(notice.time);
  if(p.saleProgress!=null) p.saleProgress*=ratio;
 }
 const teams=[...Object.values(state.properties).map(p=>p.team).filter(Boolean),...Object.values(state.companies).flatMap(c=>c.reserveTeams ?? [])];
 for(const team of teams) for(const key of ['busyUntil','recoverUntil','cooldownUntil']) team[key]=deadline(team[key]);
 for(const mission of [...state.missions,...state.pendingIncidents]) mission.due=deadline(mission.due);
 for(const company of Object.values(state.companies)) if(company.bank) company.bank.startedAt=stamp(company.bank.startedAt);
 for(const company of Object.values(state.companies)) if(company.logistics) {company.logistics.startedAt=stamp(company.logistics.startedAt);company.logistics.nextFeeAt=stamp(company.logistics.nextFeeAt);}
 for(const a of Object.values(state.auctions ?? {})){a.startedAt=stamp(a.startedAt);a.endsAt=stamp(a.endsAt);}
 for(const entry of state.ledger) entry.time=stamp(entry.time);
 for(const report of state.reports) report.time=stamp(report.time);
 if(state.campaign) state.campaign.finishedAt=stamp(state.campaign.finishedAt);
 state.lastAi=newTime-(oldTime-state.lastAi);
 state.time=newTime;state.clockVersion=CLOCK_VERSION;
}
