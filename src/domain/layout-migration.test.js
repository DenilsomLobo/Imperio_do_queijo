import {it,expect} from 'vitest';
import {createGame,migrateSave,validateSave,command} from './game.js';
it('corrige uma vez controles cinza sem perder recursos nem equipes inimigas',()=>{
 const original=createGame(123); original.layoutVersion=2;
 const sale=original.properties['sale-n1'], post=original.properties['sale-n1-control'];
 sale.owner=post.owner='coalho'; sale.stock={'frescal:weak':7};sale.till=1234;
 sale.seller=sale.sellerActive=true;
 post.team=structuredClone(original.properties['sale-e1-control'].team);
 post.team.id='migration-team';post.team.busyUntil=99999;
 const migrated=validateSave(migrateSave(original));
 expect(migrated.properties[sale.id].owner).toBe('neutral');
 expect(migrated.properties[post.id].owner).toBe('neutral');
 expect(migrated.properties[post.id].team).toBeNull();
 expect(migrated.properties[sale.id].stock).toEqual(sale.stock);
 expect(migrated.properties[sale.id].till).toBe(1234);
 expect(migrated.companies.player.cash).toBe(original.companies.player.cash);
 expect(migrated.companies.coalho.reserveTeams[0].id).toBe('migration-team');
 expect(migrateSave(migrated)).toEqual(migrated);
 expect(original.properties[sale.id].owner).toBe('coalho');
});
it('preserva aquisição já realizada pelo jogador nos pontos marcados',()=>{
 let s=command(createGame(),{type:'buyProperty',id:'sale-n1'});
 s.layoutVersion=2;
 expect(migrateSave(s).properties['sale-n1'].owner).toBe('player');
});
