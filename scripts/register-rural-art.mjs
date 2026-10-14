import { readFileSync,writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const file=process.argv[2] ?? 'rural-village-v2.png', data=readFileSync(`assets/${file}`);
const inventory=JSON.parse(readFileSync('docs/assets-inventory.json','utf8'));
if(!inventory.some(a=>a.file===file)) inventory.push({id:inventory.length+1,file,width:data.readUInt32BE(16),height:data.readUInt32BE(20),bytes:data.length,
 pixelFormat:data[25]===6?'Format32bppArgb':'Format24bppRgb',sha256:createHash('sha256').update(data).digest('hex').toUpperCase(),category:'map',source:'image_gen built-in 2026-10-14'});
writeFileSync('docs/assets-inventory.json',JSON.stringify(inventory,null,2)+'\n');
if(file.startsWith('icon_')) {
 const icon=inventory.find(a=>a.file===file);
 icon.category='icon'; icon.source='PNG fornecido pelo usuário, assets/';
 writeFileSync('docs/assets-inventory.json',JSON.stringify(inventory,null,2)+'\n');
}
