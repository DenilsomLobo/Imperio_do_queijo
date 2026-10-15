import {readLocal,writeLocal} from './local.js';
import {migrateSave,validateSave} from '../domain/game.js';
export const firebaseConfig={apiKey:import.meta.env.VITE_FIREBASE_API_KEY ?? '',projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID ?? ''};
export const cloudEnabled=()=>!!(firebaseConfig.apiKey&&firebaseConfig.projectId);
export function firebaseClient({config=firebaseConfig,request=fetch,read=readLocal,write=writeLocal,now=Date.now}={}){
 const enabled=()=>!!(config.apiKey&&config.projectId);
 const base=()=>`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents`;
 let chain=Promise.resolve();const authJobs=new Map();
 async function json(url,options){
  const r=await request(url,{...options,signal:AbortSignal.timeout(12000)});const body=await r.json();
  if(!r.ok)throw Error(body.error?.message ?? 'Falha de conexão com Firebase.');return body;
 }
 function auth(profile){
  if(!authJobs.has(profile.id))authJobs.set(profile.id,authorize(profile).finally(()=>authJobs.delete(profile.id)));
  return authJobs.get(profile.id);
 }
 async function authorize(profile){
  if(!enabled())throw Error('Firebase ainda não configurado.');
  const key='firebase-auth:'+config.projectId+':'+profile.id;let a=await read(key);
  if(a?.expiresAt>now()+60000)return a;
  let r;
  if(a?.refreshToken){
   r=await json('https://securetoken.googleapis.com/v1/token?key='+encodeURIComponent(config.apiKey),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:a.refreshToken}).toString()});
   a={uid:r.user_id,idToken:r.id_token,refreshToken:r.refresh_token,expiresAt:now()+Number(r.expires_in)*1000};
  }else{
   r=await json('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+encodeURIComponent(config.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({returnSecureToken:true})});
   a={uid:r.localId,idToken:r.idToken,refreshToken:r.refreshToken,expiresAt:now()+Number(r.expiresIn)*1000};
  }
  if(!a.uid||!a.idToken||!a.refreshToken||!Number.isFinite(a.expiresAt))throw Error('Autenticação Firebase inválida.');
  await write(key,a);return a;
 }
 const headers=a=>({'Content-Type':'application/json',Authorization:'Bearer '+a.idToken});
 const fields=obj=>Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,typeof v==='number'?{integerValue:String(v)}:{stringValue:v}]));
 async function send(state){
  if(!enabled())return {configured:false};
  const profile=state.playerProfile;if(!profile)throw Error('Selecione um perfil antes de sincronizar.');
  validateSave(state);
  const snapshot=JSON.stringify(state);
  if(new TextEncoder().encode(snapshot).length>850000)throw Error('Salvamento excede o tamanho de um documento na nuvem. O progresso local permanece salvo.');
  const a=await auth(profile),root=base().replace('https://firestore.googleapis.com/v1/','');
  const common={displayName:profile.name,campaignId:state.campaignId,rulesVersion:state.rulesVersion,updatedAt:state.savedAt};
  await json(base()+':commit',{method:'POST',headers:headers(a),body:JSON.stringify({writes:[
   {update:{name:root+'/saves/'+a.uid,fields:fields({...common,snapshot})}},
   {update:{name:root+'/ranking/'+a.uid,fields:fields({...common,cash:state.companies.player.cash})}},
  ]})});return {configured:true};
 }
 return {enabled,save(state){const snapshot=structuredClone(state);const job=chain.catch(()=>{}).then(()=>send(snapshot));chain=job;return job;},
  async load(profile){
   if(!enabled())return null;const a=await auth(profile);
   const r=await request(base()+'/saves/'+a.uid,{headers:headers(a),signal:AbortSignal.timeout(12000)});
   if(r.status===404)return null;const b=await r.json();if(!r.ok)throw Error(b.error?.message ?? 'Falha ao carregar nuvem.');
   const s=validateSave(migrateSave(JSON.parse(b.fields.snapshot.stringValue)));
   // The authenticated local profile owns this save; names are not credentials.
   s.playerProfile={id:profile.id,name:profile.name};return s;
  },
  async top(profile,rulesVersion){
   const a=await auth(profile);
   const rows=await json(base()+':runQuery',{method:'POST',headers:headers(a),body:JSON.stringify({structuredQuery:{from:[{collectionId:'ranking'}],where:{fieldFilter:{field:{fieldPath:'rulesVersion'},op:'EQUAL',value:{stringValue:rulesVersion}}},orderBy:[{field:{fieldPath:'cash'},direction:'DESCENDING'}],limit:10}})});
   return rows.filter(r=>r.document).map(r=>{const f=r.document.fields;return {name:f.displayName.stringValue,cash:Number(f.cash.integerValue)};});
  },
 };
}
export const cloud=firebaseClient();
