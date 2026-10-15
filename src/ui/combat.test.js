import {it,expect} from 'vitest';
import {attackStrength,defenseStrength,chance} from '../domain/game.js';
import {combatInfo} from './combat.js';
const team=()=>({count:3,stars:1,weapon:0,moral:1,busyUntil:0,recoverUntil:0,cooldownUntil:0});
it('armamento muda somente ataque e barricada somente defesa',()=>{
 const p={type:'security',owner:'player',barricade:0,team:team()};
 expect(attackStrength(p.team,0)).toBe(3);expect(defenseStrength(p,0)).toBe(3);
 p.team.weapon=3;expect(attackStrength(p.team,0)).toBeCloseTo(4.08);expect(defenseStrength(p,0)).toBeCloseTo(3);
 p.barricade=3;expect(attackStrength(p.team,0)).toBeCloseTo(4.08);expect(defenseStrength(p,0)).toBeCloseTo(4.35);
 const html=combatInfo(p,0);expect(html).toContain('+36% no ataque');expect(html).toContain('+45% na defesa');expect(html).toContain('4,08');expect(html).toContain('4,35');
});
it('empate dá 50% e posto vazio não ganha defesa por barricada',()=>{
 expect(chance(3,3)).toBe(50);expect(chance(0,0)).toBe(50);expect(defenseStrength({barricade:3,team:null},0)).toBe(0);
 expect(combatInfo({barricade:3,team:null},0)).toContain('Posto sem equipe');
});
it('moral e indisponibilidade afetam forças enquanto cooldown sozinho não remove defesa',()=>{
 const p={barricade:0,team:team()};p.team.moral=.5;p.team.cooldownUntil=1000;expect(defenseStrength(p,0)).toBe(1.5);
 p.team.busyUntil=1000;expect(attackStrength(p.team,0)).toBe(0);expect(defenseStrength(p,0)).toBe(0);
});
