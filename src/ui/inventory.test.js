import {it,expect} from 'vitest';
import {createGame,command} from '../domain/game.js';
import {inventoryRows} from './inventory.js';
import {buildingCards} from './buildings.js';
import {minimumBid} from '../domain/auctions.js';
const assets=new Proxy({},{get:(_,id)=>id});
it('inventário soma ração, embalagem, leite e queijo sem repetir estoque por loja nem revelar raros',()=>{
 let s=createGame();s.companies.player.cash=10000000;
 s=command(s,{type:'buyProperty',id:'sale-n6'});
 s.properties['farm-ze'].feed=75;s.properties['factory-ze'].packaging=18;
 s.companies.player.shopStock={'weak:weak':7};
 const html=inventoryRows(s,assets);
 expect(html).toContain('75 un.');expect(html).toContain('18 un.');expect(html).toContain('8 un.');
 expect(html).toContain('1 L');expect(html).not.toContain('Radioativo');expect(html).not.toContain('Mágico');
 expect(html.match(/Queijo Fraco/g)).toHaveLength(2); // alt + nome, uma única linha.
});
it('edifícios mostram arte, preço, manutenção e disputa real com destino navegável, sem nível visual',()=>{
 let s=createGame();s.companies.player.cash=10000000;
 s.companies.coalho.cash=10000000;s=command(s,{type:'bidProperty',id:'factory-ze',amount:minimumBid(s,s.properties['factory-ze'])},'coalho');
 const html=buildingCards(s,assets);
 expect(html).toContain('data-property="factory-ze"');expect(html).not.toContain('data-property="factory-coalho"');expect(html).toContain('icon_disputa.png');
 expect(html).toContain('Em disputa');expect(html).toContain('Manutenção:');expect(html).toContain('Ir ao local');
 expect(html).not.toMatch(/Nível\s+\d/i);expect(html).not.toContain('data-property="sale-ze-control"');
});
