import {readFileSync,writeFileSync} from 'node:fs';
const file='src/main.js';
let code=readFileSync(file,'utf8');
code=code.replace('${"★".repeat(t.stars)}','nível ${t.stars}');
writeFileSync(file,code);
const path='docs/assets-inventory.json', rows=JSON.parse(readFileSync(path,'utf8'));
for(const row of rows) if(/^capangas_(aliado|inimigos)_nivel_3/.test(row.file)){
 row.category='team';row.source='Alias sem edição do trio de veteranos fornecido pelo usuário; original preservado';
}
writeFileSync(path,JSON.stringify(rows,null,2)+'\n');
