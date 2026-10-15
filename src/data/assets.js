import menuPaths from './menu-icons.json';
import paths from './asset-paths.json';
const files=import.meta.glob('../../assets/**/*.{png,svg}',{eager:true,query:'?url',import:'default'});
// IDs estáveis preservam mapas e saves; caminhos físicos acompanham as subpastas.
export const assets=Object.fromEntries(Object.entries(paths).map(([id,path])=>{
 const url=files['../../assets/'+path];
 if(!url) throw Error('Imagem ausente no manifesto: '+path);
 return [id,url];
}));

export const menuIcons=Object.fromEntries(Object.entries(menuPaths).map(([id,path])=>{
 const url=files['../../assets/'+path];
 if(!url) throw Error('Ícone de menu ausente: '+path);
 return [id,url];
}));
