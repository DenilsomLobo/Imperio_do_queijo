import {it,expect,vi} from 'vitest';
import {firebaseClient} from './firebase.js';
import {createGame} from '../domain/game.js';
const response=(body,status=200)=>({ok:status<400,status,json:async()=>body});
const config={apiKey:'test-key',projectId:'test-project'};
function setup(handler){
 const stored=new Map(),request=vi.fn(handler),client=firebaseClient({config,request,read:async k=>stored.get(k),write:async(k,v)=>stored.set(k,v),now:()=>1000});
 return {stored,request,client};
}
const state=()=>({...createGame(1000),playerProfile:{id:'profile-a',name:'Jogador A'}});
it('sem configuração não faz chamadas de rede nem inventa sincronização',async()=>{
 const request=vi.fn();const c=firebaseClient({config:{},request});expect(await c.save(state())).toEqual({configured:false});expect(await c.load(state().playerProfile)).toBeNull();expect(request).not.toHaveBeenCalled();
});
it('autentica uma vez e grava snapshot privado e caixa atual no ranking em commit único por save',async()=>{
 const {client,request}=setup(async url=>url.includes('signUp')?response({localId:'uid-a',idToken:'id',refreshToken:'refresh',expiresIn:'3600'}):response({}));
 const a=state();a.companies.player.cash=32100;await client.save(a);a.companies.player.cash=12000;await client.save(a);
 expect(request).toHaveBeenCalledTimes(3);
 const [,options]=request.mock.calls.at(-1),body=JSON.parse(options.body);expect(options.headers.Authorization).toBe('Bearer id');
 expect(body.writes).toHaveLength(2);expect(body.writes[0].update.name).toContain('/saves/uid-a');expect(body.writes[1].update.name).toContain('/ranking/uid-a');
 expect(body.writes[1].update.fields.cash.integerValue).toBe('12000');expect(JSON.parse(body.writes[0].update.fields.snapshot.stringValue).playerProfile.name).toBe('Jogador A');
});
it('falha de rede não altera snapshot e fila permite tentar novamente',async()=>{
 let fail=true;const {client}=setup(async url=>{if(url.includes('signUp'))return response({localId:'uid-a',idToken:'id',refreshToken:'r',expiresIn:'3600'});if(fail)throw Error('offline');return response({});});
 const s=state(),before=structuredClone(s);await expect(client.save(s)).rejects.toThrow('offline');expect(s).toEqual(before);fail=false;await expect(client.save(s)).resolves.toEqual({configured:true});
});
it('refresh preserva UID e top 10 consulta caixa descendente separado por versão de regras',async()=>{
 const {client,stored,request}=setup(async url=>url.includes('securetoken')?response({user_id:'uid-a',id_token:'new-id',refresh_token:'new-r',expires_in:'3600'}):response([{document:{fields:{displayName:{stringValue:'A'},cash:{integerValue:'12345'}}}}]));
 stored.set('firebase-auth:test-project:profile-a',{uid:'uid-a',refreshToken:'old',expiresAt:0});
 expect(await client.top(state().playerProfile,'rural-0.2')).toEqual([{name:'A',cash:12345}]);
 const query=JSON.parse(request.mock.calls[1][1].body).structuredQuery;expect(query.limit).toBe(10);expect(query.orderBy[0]).toEqual({field:{fieldPath:'cash'},direction:'DESCENDING'});expect(query.where.fieldFilter.value.stringValue).toBe('rural-0.2');
});
it('carrega save da identidade autenticada com migração e não existe campanha recebe null',async()=>{
 const s=state();let missing=false;const {client}=setup(async url=>url.includes('signUp')?response({localId:'uid-a',idToken:'id',refreshToken:'r',expiresIn:'3600'}):missing?response({},404):response({fields:{snapshot:{stringValue:JSON.stringify(s)}}}));
 expect(await client.load(s.playerProfile)).toEqual(s);missing=true;expect(await client.load(s.playerProfile)).toBeNull();
});
