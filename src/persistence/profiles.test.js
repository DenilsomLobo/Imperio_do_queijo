import 'fake-indexeddb/auto';
import {it,expect} from 'vitest';
import {createGame} from '../domain/game.js';
import {save,load,enterProfile,listProfiles,readLocal} from './local.js';
it('primeiro nome adota campanha antiga sem alterar dinheiro; perfis isolam saves e reset',async()=>{
 const legacy=createGame(123);legacy.companies.player.cash=12345;await save(legacy);
 const a=await enterProfile('  Seu   Zé  ');expect(a.name).toBe('Seu Zé');
 const restored=await load(a.id);expect(restored.companies.player.cash).toBe(12345);expect(restored.campaignId).toBe('rural-123');
 expect(await enterProfile('seu zé')).toEqual(a);
 const b=await enterProfile('Maria');expect(b.id).not.toBe(a.id);expect(await load(b.id)).toBeNull();
 const other=createGame(456);other.playerProfile=b;other.companies.player.cash=999;await save(other);
 const fresh=createGame(789);fresh.playerProfile=a;await save(fresh);
 expect((await load(a.id)).campaignId).toBe('rural-789');expect((await load(b.id)).companies.player.cash).toBe(999);
 expect((await listProfiles()).map(p=>[p.name,p.cash])).toEqual([['Maria',999],['Seu Zé',50000]]);
 expect((await readLocal('profile:'+a.id)).cash).toBe(50000);
});
it('nome vazio, muito curto ou marcação não cria perfil nem altera campanha',async()=>{
 const before=await listProfiles();
 for(const name of ['',' ','a','<script>','a'.repeat(31)])await expect(enterProfile(name)).rejects.toThrow(/nome/);
 expect(await listProfiles()).toEqual(before);
});
