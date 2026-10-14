import {it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import regions from './regions.json';
const root=new URL('../../',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('docs/assets-inventory.json',root),'utf8').replace(/^\uFEFF/,''));
it('catálogo cobre todos os PNGs originais, dimensões e hashes',()=>{
 const files=readdirSync(new URL('assets/',root)).filter(n=>n.endsWith('.png'));
 expect(new Set(manifest.map(a=>a.file))).toEqual(new Set(files));
 for(const entry of manifest){const bytes=readFileSync(new URL(`assets/${entry.file}`,root));expect(bytes.subarray(1,4).toString()).toBe('PNG');expect(bytes.readUInt32BE(16)).toBe(entry.width);expect(bytes.readUInt32BE(20)).toBe(entry.height);expect(createHash('sha256').update(bytes).digest('hex').toUpperCase()).toBe(entry.sha256);}
});
it('todas as regiões referenciam fundos existentes e IDs exclusivos',()=>{
 expect(new Set(regions.map(r=>r.id)).size).toBe(5);
 for(const region of regions)expect(manifest.some(a=>a.file===region.background)).toBe(true);
});
it('especificação canônica preserva o documento fornecido na raiz',()=>{
 expect(readFileSync(new URL('docs/CODEX_MASTER_SPEC.md',root),'utf8')).toBe(readFileSync(new URL('CODEX_MASTER_SPEC.md',root),'utf8'));
});
