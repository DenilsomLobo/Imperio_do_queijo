import sharp from 'sharp';
import {readFile, mkdir, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const paths=JSON.parse(await readFile(path.join(root,'src/data/asset-paths.json'),'utf8'));
let originalBytes=0,webBytes=0;
const rows=Object.entries(paths);
// Keep the original art and stable game IDs; only the delivered images change.
for(let offset=0;offset<rows.length;offset+=4){
 await Promise.all(rows.slice(offset,offset+4).map(async([id,relative])=>{
  const source=path.join(root,'assets',relative);
  const target=path.join(root,'assets-web',relative.replace(/\.png$/i,'.webp'));
  const limit=relative.startsWith('mapas/')?2048:relative==='text_logo.png'?768:relative.startsWith('icones/')?192:512;
  await mkdir(path.dirname(target),{recursive:true});
  const info=await stat(source),cached=await stat(target).catch(()=>null);
  if(!cached||cached.mtimeMs<info.mtimeMs)await sharp(source).resize({width:limit,height:limit,fit:'inside',withoutEnlargement:true}).webp({quality:84,alphaQuality:92,effort:5}).toFile(target);
  const output=await stat(target);
  originalBytes+=info.size;webBytes+=output.size;
 }));
}
await sharp(path.join(root,'../../images/avatar.png')).resize(96,96,{fit:'cover'}).webp({quality:85}).toFile(path.join(root,'assets-web/portfolio-avatar.webp'));
await writeFile(path.join(root,'assets-web/report.json'),JSON.stringify({images:rows.length,originalBytes,webBytes},null,2)+'\n');
console.log(`Assets: ${(originalBytes/1e6).toFixed(1)} MB -> ${(webBytes/1e6).toFixed(1)} MB (${Math.round((1-webBytes/originalBytes)*100)}% smaller).`);
