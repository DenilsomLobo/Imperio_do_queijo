import {it,expect} from 'vitest';
import {roadConnected,createGame,command} from './game.js';
it('ruas permitem apenas vizinhos diretos nos dois sentidos',()=>{
 for(const id of ['sale-n4','sale-n5']){expect(roadConnected('sale-ze-control',id+'-control')).toBe(true);expect(roadConnected(id+'-control','sale-ze-control')).toBe(true);}
 expect(roadConnected('sale-ze-control','sale-e1-control')).toBe(false);
 expect(roadConnected('sale-ze-control','sale-ze-control')).toBe(false);
});
it('jogador e inimigo não podem iniciar ataque remoto nem gastar dinheiro',()=>{
 for(const owner of ['player','coalho']){
  const s=createGame();const p=s.properties['sale-ze-control'];p.owner=owner;p.team={id:'test',count:5,stars:1,moral:1,weapon:0,cooldownUntil:0,busyUntil:0,recoverUntil:0};s.companies[owner].cash=1000000;
  s.properties['sale-e1-control'].owner=owner==='player'?'coalho':'player';
  expect(()=>command(s,{type:'attack',id:p.id,target:'sale-e1-control',company:owner},owner)).toThrow(/rua direta/);expect(s.companies[owner].cash).toBe(1000000);expect(s.missions).toHaveLength(0);
 }
});
