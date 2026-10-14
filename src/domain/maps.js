export function diamond(x,y,width=120,height=60) { return [{x,y:y-height/2},{x:x+width/2,y},{x,y:y+height/2},{x:x-width/2,y}]; }
export function contains(points,x,y) {
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++) {
    const a=points[i],b=points[j];
    if(((a.y>y)!==(b.y>y)) && x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x) inside=!inside;
  }
  return inside;
}
export function validateMap(map,assetIds) {
  if(map.version!==1 || !map.id || !assetIds.includes(map.background) || !Array.isArray(map.slots)) throw Error('Mapa ou versão inválida.');
  const ids=new Set();
  for(const s of map.slots) {
    if(!s.id || ids.has(s.id)) throw Error('IDs de terrenos devem ser únicos.');
    ids.add(s.id);
    if(s.region!==map.id || !['land','farm','factory','sale','security','service'].includes(s.type) || !['empty','occupied'].includes(s.occupation) || typeof s.owner!=='string' || !Number.isInteger(s.level) || s.level<0) throw Error('Estado do terreno inválido.');
    if(!s.rules || !['buy','sell','conquer'].every(k=>typeof s.rules[k]==='boolean')) throw Error('Regras inválidas.');
    if(!Array.isArray(s.polygon)||s.polygon.length<3||s.polygon.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y))) throw Error('Polígono inválido.');
    if(!s.sprite || ![s.sprite.x,s.sprite.y,s.sprite.width,s.sprite.depth].every(Number.isFinite) || s.sprite.width<=0) throw Error('Posição visual inválida.');
    if(s.building && !assetIds.includes(s.building)) throw Error('Asset desconhecido.');
  }
  for(const s of map.slots) if(s.securityId && !map.slots.some(p=>p.id===s.securityId&&p.type==='security')) throw Error('Posto de segurança inexistente.');
  return map;
}
export function createSlot(region,x,y,id) {
  return {id,region,type:'land',owner:'neutral',building:null,level:0,occupation:'empty',rules:{buy:true,sell:false,conquer:false},polygon:diamond(x,y),sprite:{x,y,width:120,depth:y},securityId:null};
}
