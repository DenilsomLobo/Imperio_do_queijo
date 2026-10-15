// IDs de qualidade persistidos; arquivos reais fornecidos em assets/.
export const dairy = {
 weak: {name:'Fraco',cow:'Magrela',cowAsset:'vaca_magrela.png',milkAsset:'leite_fraco.png',cheeseAsset:'queijo_fraco.png'},
 common: {name:'Comum',cow:'Mimosa',cowAsset:'vaca_mimosa.png',milkAsset:'leite_comum.png',cheeseAsset:'queijo_comum.png'},
 noble: {name:'Nobre',cow:'Premiada',cowAsset:'vaca_premiada.png',milkAsset:'leite_nobre.png',cheeseAsset:'queijo_nobre.png'},
 radioactive: {name:'Radioativo',cow:'Radioativa',cowAsset:'vaca_radioativa.png',milkAsset:'Cálice de Leite Radioativo Neon.png',cheeseAsset:'queijo_radioativo.png'},
 magic: {name:'Mágico',cow:'Mágica',cowAsset:'vaca_magica.png',milkAsset:'leite_magico.png',cheeseAsset:'queijo_magico.png'},
};

export function discoveredMilk(state,owner='player') {
 const found=new Set(state.companies[owner]?.discoveredMilk ?? []);
 for(const p of Object.values(state.properties).filter(p=>p.owner===owner)) {
  for(const [k,n] of Object.entries(p.milk ?? {})) if(n>=1) found.add(k);
  for(const stock of [p.ready,p.stock]) for(const [key,n] of Object.entries(stock ?? {})) if(n>0) found.add(key.split(':')[1]);
 }
 return [...found].filter(k=>dairy[k]);
}
