import {it,expect} from 'vitest';
import {createGame,command,advance,attackStrength,defenseStrength,estimate,migrateSave} from './game.js';
import {garrisonCount,garrisonBonus} from './security-network.js';
import {combatInfo} from '../ui/combat.js';
import {rules} from '../data/game-rules.js';
const team=(owner,id)=>({owner,id,count:3,stars:1,weapon:0,moral:1,busyUntil:0,recoverUntil:0,cooldownUntil:0,missedWages:0});
function occupy(s,id,owner='player',allocated=true){const shop=s.properties[id],post=s.properties[shop.securityId];shop.owner=post.owner=owner;post.team=allocated?team(owner,id):null;return post;}
it('12 lojas com equipes dão 60% a todas, sem multiplicar pelos três integrantes',()=>{
 const s=createGame();const shops=Object.values(s.properties).filter(p=>p.type==='sale'&&p.id!=='sale-e1').slice(0,12);
 for(const shop of shops)occupy(s,shop.id);
 expect(garrisonCount(s,'player')).toBe(12);expect(garrisonBonus(s,'player')).toBeCloseTo(.6);
 for(const shop of shops){const p=s.properties[shop.securityId];expect(attackStrength(p.team,0,s,'player')).toBeCloseTo(4.8);expect(defenseStrength(p,0,s)).toBeCloseTo(4.8);}
 expect(combatInfo(s.properties[shops[0].securityId],0,{},s)).toContain('+60% no ataque e na defesa');
});
it('loja vazia, reserva, propriedade rival e posto sem loja própria não dão bônus',()=>{
 const s=createGame();const a=occupy(s,'sale-ze'),b=occupy(s,'sale-n4','player',false);occupy(s,'sale-e1','coalho');
 s.companies.player.reserveTeams=[team('player','reserve')];b.team=team('player','bad');s.properties['sale-n4'].owner='neutral';
 expect(garrisonCount(s,'player')).toBe(1);expect(garrisonCount(s,'coalho')).toBe(1);
 a.team.count=0;expect(garrisonCount(s,'player')).toBe(0);
});
it('rede multiplica bônus locais, mas não cria força sem equipe/moral nem em missão ou recuperação',()=>{
 const s=createGame(),p=occupy(s,'sale-ze');occupy(s,'sale-n4');p.team.weapon=3;p.barricade=3;
 expect(attackStrength(p.team,0,s,'player')).toBeCloseTo(3*1.36*1.1);expect(defenseStrength(p,0,s)).toBeCloseTo(3*1.45*1.1);
 p.team.busyUntil=1000;expect(garrisonCount(s,'player')).toBe(2);expect(defenseStrength(p,0,s)).toBe(0);
 p.team.busyUntil=0;p.team.moral=0;expect(attackStrength(p.team,0,s,'player')).toBe(0);
 p.team=null;expect(defenseStrength(p,0,s)).toBe(0);expect(garrisonCount(s,'player')).toBe(1);
});
it('desalocar, mover e perder loja recalculam a rede; salvar/recarregar não acumula bônus',()=>{
 let s=createGame();const p=occupy(s,'sale-ze');occupy(s,'sale-n4','player',false);
 s=command(s,{type:'moveTeam',id:p.id,target:'sale-n4-control'});expect(garrisonCount(s,'player')).toBe(1);
 s=migrateSave(JSON.parse(JSON.stringify(s)));expect(garrisonCount(s,'player')).toBe(1);
 s.properties['sale-n4'].owner=s.properties['sale-n4-control'].owner='neutral';expect(garrisonCount(s,'player')).toBe(0);
});
it('ataque guarda bônus na partida e defesa recalcula reforço na chegada',()=>{
 let s=createGame();s.companies.player.cash=1000000;
 const a=occupy(s,'sale-n6'),d=occupy(s,'sale-e1','coalho');const before=estimate(s,a.id,d.id);expect(before.chance).toBe(50);
 s=command(s,{type:'attack',id:a.id,target:d.id});const snapshot=s.missions[0].attack;
 occupy(s,'sale-n5','coalho');expect(defenseStrength(s.properties[d.id],0,s)).toBeCloseTo(3.3);
 expect(snapshot).toBeCloseTo(3.15);expect(s.missions[0].attack).toBe(snapshot);
 s.missions[0].due=1000;s=advance(s,1000,{rng:()=>.499,offline:false});
 expect(s.properties['sale-e1'].owner).toBe('coalho'); // .499 venceria na prévia de 50%, mas perde para defesa reforçada.
});
it('IA aloca equipes fora da fronteira com dinheiro real e recusa sem caixa para manter pessoal',()=>{
 let s=createGame();s.companies.coalho.cash=1000000;occupy(s,'sale-e1','coalho',false);occupy(s,'sale-n4','coalho',false);
 s.lastAi=-rules.aiInterval;s=advance(s,1000);
 expect(garrisonCount(s,'coalho')).toBe(2);expect(s.ledger.filter(e=>e.owner==='coalho'&&e.kind==='Contratação de capangas')).toHaveLength(2);
 const poor=createGame();poor.companies.coalho.cash=rules.teamHirePrices[0];poor.lastAi=-rules.aiInterval;
 expect(garrisonCount(advance(poor,1000),'coalho')).toBe(0);
});
