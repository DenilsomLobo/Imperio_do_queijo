import {it,expect} from 'vitest';
import {createGame as freshGame,command,advance,migrateSave} from '../domain/game.js';
import {employeeCards,cowManagementCards,shopManagementCards,productionCards} from './owned-resources.js';
import {salesOfDay} from '../domain/sales.js';
import {rules,DAY} from '../data/game-rules.js';
import {buildingCards} from './buildings.js';
import {guardAsset} from '../map/presentation.js';
function createGame(){const s=freshGame();s.companies.player.cash=100000000;return s;}
const assets=new Proxy({},{get:(_,id)=>id});
it('propriedades lista somente próprias e inclui compra nova, sem catálogo neutro/rival',()=>{
 let s=createGame();let html=buildingCards(s,assets);expect(html).not.toContain('data-property="farm-coalho"');expect(html).not.toContain('data-property="farm-level-2"');
 s=command(s,{type:'buyProperty',id:'farm-level-2'});expect(buildingCards(s,assets)).toContain('data-property="farm-level-2"');
});
it('funcionários mostram apenas contratados com imagem, custo, diária e destino de alocação',()=>{
 let s=createGame();s=command(s,{type:'hireWorker',id:'factory-ze',level:2});s=command(s,{type:'hireTeam',id:'sale-ze-control',level:1});
 const html=employeeCards(s,assets);expect(html.match(/data-resource-kind=/g)).toHaveLength(3);
 expect(html).toContain('funcionario_nivel_2.png');expect(html).not.toContain('funcionario_nivel_3.png');expect(html).toContain('icon_vendedor.png');
 expect(html).toContain('4.000,00');expect(html).toContain('350,00');expect(html).toContain('data-property="factory-ze"');expect(html).toContain('data-property="sale-ze"');
});
it('vacas agrupam somente rebanho real e custo diário corresponde à ração opcional',()=>{
 const s=createGame();s.properties['farm-ze'].cows={common:2};
 const html=cowManagementCards(s,assets);expect(html).toContain('Mimosa × 2');expect(html).toContain('40 un./dia');expect(html).toContain('10,00/dia');
 expect(html).toContain('data-property="farm-ze"');expect(html).not.toContain('vaca_magica.png');expect(html).not.toContain('vaca_magrela.png');
});
it('produção mostra tipo real, preço com bônus e fábrica, sem marcar lote como pronto',()=>{
 let s=createGame();s=command(s,{type:'buyProperty',id:'sale-n4'});s=command(s,{type:'produce',id:'factory-ze',recipe:'weak',quality:'weak'});
 const html=productionCards(s,assets);expect(html).toContain('queijo_fraco.png');expect(html).toContain('27,78');expect(html).toContain('1 unidade(s) em fabricação');expect(html).toContain('data-property="factory-ze"');expect(html).not.toContain('queijo_magico.png');
});
it('vendas diárias somam somente vendas reais do dia e propriedade, excluindo coleta/leilão',()=>{
 const s=createGame();s.time=DAY+1000;s.ledger=[
  {time:1000,owner:'player',kind:'Venda ao consumidor',property:'sale-ze',revenue:2500},
  {time:DAY,owner:'player',kind:'Venda ao consumidor',property:'sale-ze',revenue:7500},
  {time:DAY,owner:'player',kind:'Venda ao consumidor',property:'sale-n4',revenue:5000},
  {time:DAY,owner:'player',kind:'Coleta da loja',property:'sale-ze',revenue:0,amount:7500},
  {time:DAY,owner:'player',kind:'Venda de propriedade em leilão',property:'farm-ze',revenue:999999},
 ];expect(salesOfDay(s)).toBe(12500);expect(salesOfDay(s,'player','sale-ze')).toBe(7500);expect(salesOfDay(s,'player','sale-ze',0)).toBe(2500);
 const html=shopManagementCards(s,assets);expect(html).toContain('75,00');expect(html).toContain('Sem capangas');expect(html).toContain('Manutenção total: R$');expect(html).toContain('10,00/dia');
});
it('vendedor custa R$ 50 e diária R$ 5; lojas mostram manutenção com proteção',()=>{
 let s=createGame();s=command(s,{type:'buyProperty',id:'sale-n4'});const cash=s.companies.player.cash;
 s=command(s,{type:'hireSeller',id:'sale-n4'});expect(s.companies.player.cash).toBe(cash-5000);expect(rules.sellerSalary).toBe(500);
 s=command(s,{type:'hireTeam',id:'sale-n4-control',level:1});const html=shopManagementCards(s,assets);expect(html).toContain('15,00/dia');expect(html).toContain('Proteção: 3 capangas');
 const restored=migrateSave(s),before=restored.companies.player.cash;s=advance(restored,DAY,{offline:true});expect(s.ledger.filter(e=>e.kind==='Salário de vendedor').every(e=>e.expense===500)).toBe(true);expect(s.companies.player.cash).toBeLessThan(before);
});
it('liquidação diária pertence ao dia encerrado; coleta não infla vendas de hoje nem de ontem',()=>{
 let s=createGame();s.time=DAY-1000;s.companies.player.shopStock={'weak:weak':2};
 s=advance(s,1000,{offline:true});expect(salesOfDay(s)).toBe(0);expect(salesOfDay(s,'player','sale-ze',0)).toBe(5050);
 s=command(s,{type:'collectCash',id:'sale-ze'});expect(salesOfDay(s)).toBe(0);expect(salesOfDay(s,'player','sale-ze',0)).toBe(5050);
});
it('IA contrata quando pode e arte do posto troca bandeira pela equipe real, persistida',()=>{
 let s=createGame();const id='sale-e1-control';expect(guardAsset(s.properties[id])).toBe('bandeira_capanga_inimiga.png');
 s.companies.coalho.cash=1000000;s=advance(s,1000);expect(s.lastAi).toBe(0);
 expect(s.properties[id].team).not.toBeNull();expect(guardAsset(s.properties[id])).toBe('capangas_inimigos_nivel_1.png');
 expect(guardAsset(migrateSave(s).properties[id])).toBe('capangas_inimigos_nivel_1.png');
 expect(s.ledger.some(e=>e.owner==='coalho'&&e.kind==='Contratação de capangas'&&e.expense===12500)).toBe(true);
 const offline=createGame();expect(advance(offline,1000,{offline:true}).properties[id].team).toBeNull();
});
