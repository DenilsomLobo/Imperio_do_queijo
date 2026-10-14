import {describe,it,expect} from 'vitest';
import {createSlot,contains,validateMap} from './maps.js';
const fixture=()=>({version:1,id:'rural',background:'map',slots:[createSlot('rural',100,100,'one')]});
describe('cadastro territorial',()=>{
 it('seleciona apenas dentro do polígono',()=>{const s=fixture().slots[0];expect(contains(s.polygon,100,100)).toBe(true);expect(contains(s.polygon,10,10)).toBe(false);});
 it('aceita roundtrip JSON preservando proprietário e regras',()=>{const m=fixture();expect(validateMap(JSON.parse(JSON.stringify(m)),['map'])).toEqual(m);});
 it('rejeita IDs duplicados',()=>{const m=fixture();m.slots.push({...m.slots[0]});expect(()=>validateMap(m,['map'])).toThrow(/únicos/);});
 it('rejeita asset e coordenadas inválidos',()=>{const m=fixture();m.slots[0].building='missing';expect(()=>validateMap(m,['map'])).toThrow(/Asset/);m.slots[0].building=null;m.slots[0].polygon[0].x=NaN;expect(()=>validateMap(m,['map'])).toThrow(/Polígono/);});
 it('exige vínculo com posto real',()=>{const m=fixture();m.slots[0].securityId='missing';expect(()=>validateMap(m,['map'])).toThrow(/segurança/);});
});
