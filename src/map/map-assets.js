export function mapAssetIds(map){
 return [...new Set([
  map.background,map.roadTexture,...map.slots.map(s=>s.building),
  'comece_flag.png','icon_leite.png','icon_queijo.png','icon_money.png','icon_ataque.png','icon_defesa.png',
  'ponto_de_venda_inicial_seu_ze.png','Ponto_de_venda_aliado.png','Ponto_de_venda_neutro.png','Ponto_de_venda_inimiga.png',
  ...['aliado','inimiga','neutra'].map(owner=>`bandeira_capanga_${owner}.png`),
  ...['aliado','inimigos'].flatMap(owner=>[1,2,3].map(level=>`capangas_${owner}_nivel_${level}.png`)),
 ].filter(Boolean))];
}
