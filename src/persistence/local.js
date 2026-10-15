import { validateSave, migrateSave } from "../domain/game.js";
let connection;
function db() {
  return (connection ??= new Promise((resolve, reject) => {
    const req = indexedDB.open("imperio-do-queijo", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("campaigns");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}
export async function load(profileId) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction("campaigns")
      .objectStore("campaigns")
      .get(profileId ? 'campaign:'+profileId : "current");
    request.onsuccess = () => {
      try {
        resolve(
          request.result ? validateSave(migrateSave(request.result)) : null,
        );
      } catch (e) {
        reject(e);
      }
    };
    request.onerror = () => reject(request.error);
  });
}
export async function save(state) {
  validateSave(state);
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("campaigns", "readwrite");
    tx.objectStore("campaigns").put(structuredClone(state), "current");
    if(state.playerProfile?.id){
      const p=state.playerProfile;
      tx.objectStore('campaigns').put(structuredClone(state),'campaign:'+p.id);
      tx.objectStore('campaigns').put({id:p.id,name:p.name,cash:state.companies.player.cash,updatedAt:state.savedAt},'profile:'+p.id);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function readLocal(key){
 const database=await db();return new Promise((resolve,reject)=>{const r=database.transaction('campaigns').objectStore('campaigns').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
}
export async function writeLocal(key,value){
 const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('campaigns','readwrite');tx.objectStore('campaigns').put(structuredClone(value),key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
}
export async function listProfiles(){
 const database=await db();return new Promise((resolve,reject)=>{const r=database.transaction('campaigns').objectStore('campaigns').openCursor();const profiles=[];r.onsuccess=()=>{const c=r.result;if(!c)return resolve(profiles.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')));if(String(c.key).startsWith('profile:'))profiles.push(c.value);c.continue();};r.onerror=()=>reject(r.error);});
}
export async function enterProfile(name){
 const clean=String(name).trim().replace(/\s+/g,' ');
 if(clean.length<2||clean.length>30||/[\u0000-\u001f<>]/.test(clean))throw Error('Informe um nome de 2 a 30 caracteres, sem < ou >.');
 const profiles=await listProfiles(),existing=profiles.find(p=>p.name.toLocaleLowerCase('pt-BR')===clean.toLocaleLowerCase('pt-BR'));
 if(existing)return {id:existing.id,name:existing.name};
 const profile={id:crypto.randomUUID(),name:clean};
 const legacy=!profiles.length ? await load() : null;
 if(legacy&&!legacy.playerProfile){legacy.playerProfile=profile;await save(legacy);}
 else await writeLocal('profile:'+profile.id,profile);
 return profile;
}
