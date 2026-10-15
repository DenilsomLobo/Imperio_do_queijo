import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {basename} from 'node:path';
const manifestFile=new URL('../src/data/asset-paths.json',import.meta.url);
const paths=JSON.parse(readFileSync(manifestFile,'utf8'));
const requested=process.argv[2] ?? 'rural-village-v2.png';
const file=basename(requested), path=paths[file] ?? requested;
const assetUrl=new URL('../assets/'+path,import.meta.url);
if(!existsSync(assetUrl)) throw Error('Informe o caminho relativo existente em assets: '+path);
const data=readFileSync(assetUrl);
const inventoryFile=new URL('../docs/assets-inventory.json',import.meta.url);
const inventory=JSON.parse(readFileSync(inventoryFile,'utf8'));
const row=inventory.find(a=>a.file===file) ?? {id:Math.max(0,...inventory.map(a=>a.id))+1,file};
Object.assign(row,{path,width:data.readUInt32BE(16),height:data.readUInt32BE(20),bytes:data.length,
 pixelFormat:data[25]===6?'Format32bppArgb':'Format24bppRgb',sha256:createHash('sha256').update(data).digest('hex').toUpperCase(),category:file.startsWith('icon_')?'icon':'map'});
if(!inventory.includes(row)) inventory.push(row);
paths[file]=path;
writeFileSync(inventoryFile,JSON.stringify(inventory,null,2)+'\n');
writeFileSync(manifestFile,JSON.stringify(paths,null,2)+'\n');
