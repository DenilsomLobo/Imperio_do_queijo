import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

process.chdir(fileURLToPath(new URL('../',import.meta.url)));
const files=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8',maxBuffer:20*1024*1024}).split('\0').filter(Boolean))];
const problems=[];
const secretPatterns=[
 ['chave privada',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
 ['token GitHub',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
 ['conta de serviço privada',/"type"\s*:\s*"service_account"/],
];
let bytes=0,count=0,max={file:'',size:0};
for(const file of files){
 if(!fs.existsSync(file))continue; // Tracked deletions are expected in a pending commit.
 const stat=fs.statSync(file);if(!stat.isFile())continue;
 count++;bytes+=stat.size;if(stat.size>max.size)max={file,size:stat.size};
 if(stat.size>=100*1024*1024)problems.push(`${file}: arquivo atinge o limite de 100 MiB do GitHub.`);
 if(/(^|\/)(?:node_modules|dist|\.aws|\.codex|\.agents|\.firebase)(\/|$)/.test(file)||/(^|\/)\.env(?:\..*)?$/.test(file)&&!file.endsWith('/.env.example')&&file!=='.env.example')problems.push(`${file}: arquivo local/gerado não deve entrar no repositório.`);
 if(stat.size<3*1024*1024&&/\.(?:[cm]?js|json|md|ya?ml|rules|html|css|txt|example)$/.test(file)){
  const content=fs.readFileSync(file,'utf8');
  for(const [label,pattern] of secretPatterns)if(pattern.test(content))problems.push(`${file}: possível ${label}; revisar antes do commit.`);
 }
}
if(fs.readFileSync('CODEX_MASTER_SPEC.md','utf8')!==fs.readFileSync('docs/CODEX_MASTER_SPEC.md','utf8'))problems.push('As duas cópias de CODEX_MASTER_SPEC.md diferem.');
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}
else console.log(`Repositório conferido: ${count} arquivos, ${(bytes/1024/1024).toFixed(1)} MiB. Maior arquivo: ${max.file} (${(max.size/1024/1024).toFixed(1)} MiB). Especificações sincronizadas; nenhum padrão de segredo/local proibido detectado nos arquivos candidatos.`);
