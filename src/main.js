// O motor do mapa (Phaser) é o maior arquivo do jogo: começa a baixar já, em paralelo à tela de entrada.
const mapEngine = Promise.all([import("phaser"), import("./map/game-scene.js")]);
import './fonts.css';
import {playerEntry,rankingUI} from './ui/player-entry.js';
import {cloud} from './persistence/firebase.js';
import avatarUrl from '../assets-web/portfolio-avatar.webp';
import {combatUpgradeCards} from './ui/combat-upgrades.js';
import {sharedShopStock,shopCapacity,shopBonus,companyShops,salePrice,shopIsActive} from './domain/shop-stock.js';
import {auctionInfo,auctionActions} from "./ui/auctions.js";
import {factoryProfile} from "./data/game-rules.js";
import {cheeseStockCards} from "./ui/cheese-stock.js";
import {propertyPurchasePrice} from "./data/game-rules.js";
import {combatInfo} from "./ui/combat.js";
import {cowShopCards,cowShopChoice} from "./ui/cow-shop.js";
import {logisticsInfo,logisticsDescription} from "./ui/logistics.js";
import { bankInfo, bankDescription } from "./ui/banking.js";
import { recruitmentCards, recruitmentDetails, workerCards } from "./ui/staff.js";
import { productionMultiplier, activeWorkers, workerCapacity } from "./domain/workers.js";
import { resetCampaignUI } from "./ui/reset-campaign.js";
import { assets } from "./data/assets.js";
import { herdCards } from "./ui/herd.js";
import { dairy, discoveredMilk } from "./data/dairy.js";
import { salesOfDay } from './domain/sales.js';
import { dominanceProgress } from './domain/campaign.js';
import "./style.css";
import "./game.css";
import "./theme.css";
import "./sector-menu.css";
import "./map-layout.css";
import './campaign.css';
import './player-entry.css';
import './mobile.css';
import './ux.css';
import { ruralMap } from "./data/world.js";
import { rules, DAY } from "./data/game-rules.js";
import {
  createGame,
  command,
  advance,
  resolvePending,
  total,
  estimate,
  attackStrength,
} from "./domain/game.js";
import { load, save, readLocal, writeLocal } from "./persistence/local.js";
import { managementUI } from "./ui/management.js";
import { createSfx } from './audio/sfx.js';
import { createMusic } from './audio/music.js';
import { createGoals } from './ui/goals.js';
import { createFeedback } from './ui/feedback.js';
import { createTutorial } from './ui/tutorial.js';
import { createHelp, installTooltips, productionChain, closeDialog } from './ui/help.js';
import { meter, tile, tiles, chip, chips, group, howItWorks, batchBar } from './ui/panel-kit.js';
import reset from './data/session-reset.json';


let state,
  scene,
  current = ruralMap,
  selected = "farm-ze",
  lastReal = Date.now(),
  lastSave = 0,
  saveChain = Promise.resolve(),
  storageFailed = false,
  resettingCampaign = false,
  clockPaused = document.hidden,
  feedbackReady = false;
// Criados depois do carregamento do save; as funções abaixo os usam só após isso.
let feedback = null, tutorial = null, goals = null;
const $ = (id) => document.getElementById(id);
const supplyDrafts=new Map();
const money = (n) =>
  (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const amount = (n) =>
  Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const ownerName = (p) =>
  p.owner === "neutral"
    ? "Neutro"
    : p.owner === "public"
      ? "Serviço de Queijópolis"
      : state.companies[p.owner].name;
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const slotOf = (id) => ruralMap.slots.find((s) => s.id === id);
const sfx = createSfx();
const music = createMusic(sfx);
const ICON = {
  bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v3.6L4.3 16a1 1 0 0 0 .9 1.5h13.6a1 1 0 0 0 .9-1.5L18 12.6V9a6 6 0 0 0-6-6Zm-2.4 16a2.5 2.5 0 0 0 4.8 0Z"/></svg>',
  help: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 16.2a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm1.6-5.6c-.8.5-1 .8-1 1.6h-2.3c0-1.7.6-2.5 1.8-3.3.8-.5 1.2-.9 1.2-1.6 0-.8-.6-1.3-1.4-1.3-.9 0-1.5.6-1.6 1.6H8c.1-2.4 1.7-3.8 4.1-3.8 2.3 0 3.9 1.3 3.9 3.3 0 1.4-.7 2.3-2.4 3.5Z"/></svg>',
  gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4ZM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" transform="translate(-1 0)"/></svg>',
};
let activeProfile;
const ranking=rankingUI(assets);
activeProfile=await playerEntry(assets,ranking);
function freshCampaign(){const s=createGame();s.campaignId='rural-'+crypto.randomUUID();s.playerProfile={...activeProfile};return s;}
document.querySelector('#app').classList.remove('entry-mode');
document.querySelector('#app').inert=true;
let lastCloudSave=0;
function queueCloud(snapshot,force=false){
 if(!cloud.enabled())return;
 if(!force && Date.now()-lastCloudSave<60000)return;
 lastCloudSave=Date.now();
 $('cloud-state').textContent='Sincronizando…';
 return cloud.save(snapshot).then(()=>{$('cloud-state').textContent='Salvo na nuvem';}).catch(e=>{$('cloud-state').textContent='Salvo localmente · nuvem pendente';$('cloud-state').title=e.message;});
}
const speedTip = (speed) => `Um dia de jogo dura ${DAY/1000/rules.speedFactors[speed]} segundos reais`;
document.querySelector("#app").innerHTML =
  `<header><div class="brand"><a id="portfolio-avatar" class="portfolio-avatar" href="https://portifolio-denilsom-lobo.web.app/" aria-label="Voltar à página inicial de Denilsom Lobo"><img src="${avatarUrl}" alt="Denilsom Lobo" width="38" height="38"></a><a id="home-logo" href="./index.html" aria-label="Voltar à página inicial"><img class="brand-logo" src="${assets["text_logo.png"]}" alt="Império do Queijo"></a></div><div class="player-identity"><strong id="player-label"></strong><small id="cloud-state">Salvamento local</small></div>`+
  `<div id="hud" class="hud"><div class="hud-clock" id="hud-clock"><span class="hud-day" id="hud-day">Dia 1</span><span class="hud-time" id="hud-time">00:00</span><i class="hud-day-bar" aria-hidden="true"><b id="hud-day-progress"></b></i></div><button type="button" class="hud-domain" id="hud-domain" data-tip="Objetivos dominados: lojas, fazendas, fábricas, banco e transportadora. A barra vermelha é o avanço do rival."><span>Domínio</span><strong id="hud-domain-value">0/24</strong><i class="hud-domain-bar" aria-hidden="true"><b id="hud-domain-player"></b><em id="hud-domain-rival"></em></i></button><button type="button" class="hud-alert" id="hud-alert" hidden></button></div>`+
  `<div class="speed-control" role="group" aria-label="Velocidade do tempo">${[1,2,4].map(v=>`<button type="button" data-speed="${v}" aria-pressed="false" data-tip="${speedTip(v)}">${v}×</button>`).join('')}</div>`+
  `<div class="header-tools"><button type="button" id="journal-button" class="icon-button" aria-expanded="false" aria-controls="journal-panel" data-tip="Acontecimentos recentes">${ICON.bell}<span class="badge"></span></button><button type="button" id="help-button" class="icon-button" data-tip="Como jogar">${ICON.help}</button><button type="button" id="settings-button" class="icon-button" aria-expanded="false" aria-controls="settings-menu" data-tip="Som e opções">${ICON.gear}<span class="mute-mark" aria-hidden="true"></span></button><button id="save" class="header-action" data-tip="O jogo também salva sozinho a cada 15 segundos"><img src="${assets["icon_salvar.png"]}" alt=""><span>Salvar</span></button><button id="ranking" class="header-action" data-tip="Ranking global pelo caixa da empresa"><img src="${assets["icon_ranking.png"]}" alt=""><span>Ranking</span></button></div>`+
  `<div id="journal-panel" class="popover journal" data-open="false" role="region" aria-label="Acontecimentos"><div class="popover-head"><strong>Acontecimentos</strong><button type="button" class="icon-close" data-close-journal aria-label="Fechar">✕</button></div><ol></ol></div>`+
  `<div id="settings-menu" class="popover settings" data-open="false" role="region" aria-label="Opções"><div class="popover-head"><strong>Opções</strong></div><label class="setting-row switch"><input type="checkbox" id="mute"><span>Efeitos sonoros</span></label><label class="setting-row"><span>Volume <b id="volume-value"></b></span><input id="volume" type="range" min="0" max="100" step="5"></label><label class="setting-row switch"><input type="checkbox" id="music-on"><span>Música ambiente</span></label><label class="setting-row"><span>Música <b id="music-value"></b></span><input id="music-volume" type="range" min="0" max="100" step="5"></label><button type="button" class="menu-item" data-menu="help">Como jogar</button><button type="button" class="menu-item" data-menu="goals">Metas e medalhas</button><button type="button" class="menu-item" data-menu="tutorial">Rever tutorial</button><button type="button" id="reset-campaign" class="menu-item danger-button" disabled><img src="${assets["icon_resetar.png"]}" alt="">Resetar campanha</button></div></header>`+
  `<section id="management-bar" aria-label="Gestão da empresa"></section><main><section id="map"></section><aside id="property-menu" aria-label="Gestão da propriedade" hidden><span class="sheet-handle" aria-hidden="true"></span><button id="close-property" type="button" aria-label="Fechar menu da propriedade" title="Fechar menu">✕</button><div class="panel-eyebrow" id="panel-eyebrow">PROPRIEDADE SELECIONADA</div><h2 id="title">Zona rural</h2><div id="property-portrait"></div><p id="intro">Clique nas construções para gerenciar.</p><div id="panel"></div><p id="status" role="status">Carregando campanha…</p><button id="pending" hidden>Resolver incidentes pendentes</button></aside></main><footer>Arraste o mapa · dois dedos ou roda do mouse para zoom · ícones dourados coletam recursos · segure um botão para ver a dica.</footer><dialog id="management-dialog" aria-labelledby="management-title"><div class="dialog-heading"><img id="management-sector-image" alt="" width="64" height="64" hidden><div><small>GESTÃO DO IMPÉRIO</small><h2 id="management-title"></h2></div><button data-close aria-label="Fechar gestão">✕</button></div><div id="management-content"></div></dialog>`;
installTooltips();
const dashboard = managementUI({
  getState: () => state,
  assets,
  sfx,
  onShow: (id) => tutorial?.notify({ type: 'manage', id }),
  onProperty: (id) => focusProperty(id),
});
function status(text) {
  $("status").textContent = text;
}
function currentProperty() {
  return state?.properties[selected];
}
function signature() {
  const p = currentProperty();
  return p
    ? `${JSON.stringify(state.auctions?.[p.id] ?? null)}|${p.id}|${p.owner}|${Boolean(state.companies.player.logistics)}|${state.companies.player.bank?.level ?? 0}|${p.team?.id ?? ""}|${p.team?.missedWages ?? 0}|${p.team?.stars ?? 0}|${p.team?.weapon ?? 0}|${p.barricade ?? 0}|${p.seller ?? ''}|${(p.workers ?? []).map(w=>w.id+":"+w.missedWages).join(",")}|${p.staffNotices?.length ?? 0}|${owned("factory").map(f=>f.id).join(",")}|${discoveredMilk(state).join(",")}|${owned("farm").map(f=>f.id).join(",")}|${owned("sale")
        .map((s) => s.id)
        .join(",")}|${state.campaign?.outcome ?? ''}|${total(p.milk ?? {})>=1}|${total(p.ready ?? {})>0}|${(p.till ?? 0)>0}`
    : "";
}
function owned(type) {
  return Object.values(state.properties).filter(
    (p) => p.owner === "player" && p.type === type,
  );
}
function options(list) {
  return list
    .map(
      (p) =>
        `<option value="${p.id}">${escape(slotOf(p.id)?.name ?? p.id)}</option>`,
    )
    .join("");
}
// Botões: primário destaca a ação principal; secundário navega; perigo desfaz ou vende.
function button(action, label, extra = "", kind = "secondary", tip = "") {
  return `<button data-action="${action}" class="btn-${kind}" ${tip ? `data-tip="${escape(tip)}"` : ''} ${extra}>${label}</button>`;
}
const icon = (file) => `<img class="resource-icon" src="${assets[file]}" alt="">`;
function dailyFeed(p) {
  return Object.entries(p.cows ?? {}).reduce((n,[k,c])=>n+c*rules.cows[k].feed,0);
}
function supplyControls(kind){
 const feed=kind==='feed',id=kind+'-quantity',name=feed?'ração':'embalagens';
 const value=supplyDrafts.get(selected+':'+kind) ?? '10';
 const need=feed?dailyFeed(currentProperty()):0;
 const quick=[[10,'10'],[50,'50'],[100,'100']];
 if(need) quick.push([need,'1 dia'],[need*3,'3 dias']);
 return `<div class="qty-row"><label class="qty-input">Quantidade<input id="${id}" type="number" inputmode="numeric" min="1" max="${rules.supplyPurchaseLimit}" step="1" value="${escape(value)}"></label><div class="qty-chips" role="group" aria-label="Quantidades rápidas">${quick.filter(([q])=>q<=rules.supplyPurchaseLimit).map(([q,label])=>`<button type="button" class="chip-button" data-action="setQty" data-kind="${kind}" data-qty="${q}" data-tip="${label.includes('dia')?`${amount(q)} ${name}`:`${label} ${name}`}">${label}</button>`).join('')}</div></div>`+
 button(feed?'buyFeed':'buyPackaging',`Comprar ${name}`,'','primary')+`<p id="${kind}-quote" class="supply-quote" role="status"></p>`;
}
function updateSupplyQuote(kind){
 const input=$(kind+'-quantity');if(!input)return;
 const feed=kind==='feed',price=feed?rules.feedPrice:rules.packagingPrice,quantity=Number(input.value);
 const valid=Number.isSafeInteger(quantity)&&quantity>=1&&quantity<=rules.supplyPurchaseLimit;
 const target=$('panel').querySelector(`[data-action="${feed?'buyFeed':'buyPackaging'}"]`);
 target.disabled=!valid;
 target.innerHTML=`<img class="resource-icon" src="${assets[feed?'icon_racao.png':'icon_embalagem.png']}" alt="">Comprar ${valid?amount(quantity)+' ':''}${feed?'rações':'embalagens'}${valid?' · '+money(quantity*price):''}`;
 $(kind+'-quote').textContent=valid?`${money(price)} por unidade`:`Informe uma quantidade inteira de 1 a ${amount(rules.supplyPurchaseLimit)}.`;
 $(kind+'-quote').classList.toggle('is-error',!valid);
}
function select(id, label, list) {
  return `<label>${label}<select id="${id}">${options(list)}</select></label>`;
}
const milkStocks = (p) => {
  const rows = Object.entries(dairy).filter(([k])=>(p.milk?.[k] ?? 0)>=1 && discoveredMilk(state).includes(k));
  return rows.length ? '<div class="milk-stocks">'+rows.map(([k,c])=>'<div><img src="'+assets[c.milkAsset]+'" alt="Leite '+c.name+'"><span>Leite '+c.name+'<b>'+amount(p.milk[k] ?? 0)+' L</b></span></div>').join('')+'</div>' : '';
};
function farmStats(p) {
  const cows=total(p.cows), cap=rules.farmCapacities[p.level-1], need=dailyFeed(p);
  const potential=Object.entries(p.cows).reduce((n,[k,c])=>n+c*rules.cows[k].milk,0);
  const hungry=need>0&&p.feed<=0, days=need?p.feed/need:0, milk=total(p.milk);
  return tiles([
    tile({label:'Produção',value:amount(potential*(hungry?rules.unfedProduction:1))+' L/dia',icon:assets['icon_leite.png'],tone:hungry?'warn':cows?'good':'neutral',tip:'Cada vaca alimentada produz 1 L por dia; sem ração, metade.'}),
    tile({label:'Ração',value:amount(p.feed),icon:assets['icon_racao.png'],tone:hungry?'bad':need&&days<1?'warn':'neutral',note:need?(hungry?'Sem ração: produção 50%':'dura ~'+amount(Math.floor(days*10)/10)+' dia(s)'):'',tip:`Consumo do rebanho: ${amount(need)} rações por dia.`}),
  ])+
  meter({label:'Leite na fazenda',value:milk,max:rules.milkCapacity,unit:'L',icon:assets['icon_leite.png'],note:milk>=rules.milkCapacity?'Cheio: a produção para até você coletar.':''})+
  meter({label:'Vacas',value:cows,max:cap,icon:assets['vaca_magrela.png'],tone:'ok',note:cows>=cap?'Fazenda lotada.':''});
}
function factoryStats(p) {
  const profile=factoryProfile(p), lines=p.batches.filter(b=>b.phase==='production'), workers=p.workers ?? [];
  const speed=rules.speedFactors[state.speed]*productionMultiplier(p), ready=total(p.ready), milk=total(p.milk);
  const batches=[...p.batches].sort((a,b)=>a.due-b.due);
  const bars=batches.slice(0,6).map(b=>{
    const recipe=rules.recipes[b.recipe], length=b.phase==='production'?recipe.time:recipe.maturity||recipe.time;
    return batchBar({icon:assets[dairy[b.quality]?.cheeseAsset ?? 'icon_queijo.png'],name:recipe.name,phase:b.phase==='production'?'Fabricando':'Maturando',progress:1-(b.due-state.time)/length,seconds:Math.max(0,Math.ceil((b.due-state.time)/(1000*(b.phase==='production'?speed:rules.speedFactors[state.speed]))))});
  }).join('');
  return tiles([
    tile({label:'Embalagens',value:amount(p.packaging),icon:assets['icon_embalagem.png'],tone:p.packaging<1?'bad':p.packaging<5?'warn':'neutral',tip:'Cada queijo usa 1 embalagem.'}),
    tile({label:'Equipe',value:`${workers.length}/${workerCapacity(p)}`,icon:assets['funcionario_nivel_1.png'],tone:activeWorkers(p).length?'good':'neutral',note:activeWorkers(p).length?`automática · +${Math.round((productionMultiplier(p)-1)*100)}%`:'produção manual',tip:'Funcionários iniciam lotes sozinhos e aceleram a produção.'}),
  ])+
  meter({label:'Linhas em uso',value:lines.length,max:profile.lines,icon:assets['icon_queijo.png'],tone:'ok'})+
  meter({label:'Leite armazenado',value:milk,max:rules.factoryMilkCapacity,unit:'L',icon:assets['icon_leite.png'],tone:milk<1?'warn':undefined,note:milk<1?'Sem leite: colete na fazenda.':''})+
  meter({label:'Queijo pronto',value:ready,max:rules.cheeseCapacity,icon:assets['icon_queijo.png'],note:ready>=rules.cheeseCapacity?'Cheio: envie às lojas.':''})+
  (bars?`<div class="batch-list" aria-label="Lotes em produção">${bars}${batches.length>6?`<small class="batch-more">+${batches.length-6} lote(s)</small>`:''}</div>`:'');
}
function factoryDetails(p) {
  const profile=factoryProfile(p), workers=p.workers ?? [];
  return (total(p.ready)?'<h3 class="panel-subtitle">Queijo pronto na fábrica</h3>'+cheeseStockCards(p.ready,assets,id=>salePrice(state,p.owner,id)):'')+
  (profile.daily||p.maintenanceDebt?chips([chip(`Manutenção ${money(profile.daily)}/dia`,'neutral'),p.maintenanceDebt?chip('Pendente '+money(p.maintenanceDebt),'bad'):'']):'')+
  (workers.length?'<h3 class="panel-subtitle">Equipe da fábrica · '+workers.length+'/'+workerCapacity(p)+'</h3>'+workerCards(p,assets):'');
}
function saleStats(p) {
  const stock=sharedShopStock(state,p.owner), active=shopIsActive(p), cap=shopCapacity(state,p.owner);
  const sellerChip=!p.seller?chip('Sem vendedor: não vende','bad','Contrate um vendedor para esta loja começar a vender.'):p.sellerActive?chip('Vendedor ativo · +1% no preço','good'):chip('Vendedor com salário atrasado','warn');
  return tiles([
    tile({label:'Saldo para coleta',value:money(p.till),icon:assets['icon_money.png'],tone:p.till>0?'good':'neutral',tip:'Dinheiro das vendas que ainda está na loja. Recolha para o caixa.'}),
    tile({label:'Vendas hoje',value:money(salesOfDay(state,p.owner,p.id)),icon:assets['icon_money.png'],tone:'neutral'}),
  ])+
  chips([sellerChip,chip(`Rede: +${Math.round(shopBonus(state,p.owner)*100)}%`,'neutral',`${companyShops(state,p.owner).length} loja(s). Cada loja além da primeira soma +10% no preço.`),chip(`Manutenção ${money(rules.shopDailyMaintenance)}/dia`,'neutral'),p.maintenanceDebt?chip('Pendente '+money(p.maintenanceDebt),'bad'):''])+
  meter({label:'Caixa da loja',value:p.till/100,max:rules.shopCashCapacity/100,unit:'R$',icon:assets['icon_money.png'],note:p.till>=rules.shopCashCapacity*0.9?'Quase cheio: as vendas param até coletar.':''});
}
function saleDetails(p) {
  const stock=sharedShopStock(state,p.owner), active=shopIsActive(p), cap=shopCapacity(state,p.owner);
  return meter({label:'Estoque compartilhado',value:total(stock),max:cap,icon:assets['icon_queijo.png'],tone:active&&!total(stock)?'warn':undefined,note:active&&!total(stock)?'Sem queijo para vender: envie da queijaria.':'Disponível em todas as suas lojas.'})+
  cheeseStockCards(stock,assets,id=>salePrice(state,p.owner,id,p));
}
function securityStats(p) {
  const t=p.team;
  let html=combatInfo(p,state.time,assets,state);
  if(t) {
    const recover=Math.max(0,Math.ceil((Math.max(t.busyUntil,t.recoverUntil)-state.time)/1000/rules.speedFactors[state.speed]));
    const cooldown=Math.max(0,Math.ceil((t.cooldownUntil-state.time)/1000/rules.speedFactors[state.speed]));
    html+=chips([attackStrength(t,state.time,state,p.owner)>0?chip('Equipe pronta','good'):chip('Equipe sem força agora','warn'),recover?chip(`Missão/recuperação: ${recover} s`,'warn'):'',cooldown?chip(`Recarga de ataque: ${cooldown} s`,'warn'):'']);
  }
  return html;
}
function stats() {
  const p = currentProperty();
  if (!p) return "";
  const slot = slotOf(p.id);
  let html = "";
  if(slot?.service==="logistics") html+=logisticsInfo(state);
  if(slot?.service==="bank") html+=bankInfo(state);
  if (p.type === "farm") html += farmStats(p);
  if (p.type === "factory") html += factoryStats(p);
  if (p.type === "sale") html += saleStats(p);
  if (p.type === "security") html += securityStats(p);
  if(p.staffNotices?.length) html+='<div class="staff-notice" role="status">'+p.staffNotices.map(n=>'<p>'+escape(n.text)+'</p>').join('')+'</div>';
  const auction=auctionInfo(state,p);
  if(auction && state.auctions?.[p.id]) html += auction;
  return html;
}
// Listas e informações de apoio, exibidas depois das ações.
function details() {
  const p = currentProperty();
  if (!p) return "";
  let html = "";
  if (p.type === "farm") html += milkStocks(p);
  if (p.type === "factory") html += milkStocks(p) + factoryDetails(p);
  if (p.type === "sale") html += saleDetails(p);
  const auction=auctionInfo(state,p);
  if(auction && !state.auctions?.[p.id]) html += `<details class="auction-details" data-keep="auction"><summary>${icon('icon_disputa.png')}Leilão e avaliação</summary>${auction}</details>`;
  return html;
}
const TYPE_LABEL = { farm: 'Fazenda', factory: 'Queijaria', sale: 'Ponto de venda', security: 'Posto de capangas', land: 'Terreno' };
const SERVICE_LABEL = { bank: 'Banco', employees: 'Agência de funcionários', security: 'Agência de capangas', cows: 'Loja de vacas', logistics: 'Transportadora' };
function ownerTag(p) {
  if (p.owner === 'player') return '<span class="owner-tag is-player">SUA</span>';
  if (p.owner === 'neutral') return `<span class="owner-tag is-neutral">${['farm','factory','sale'].includes(p.type)?'À VENDA':'NEUTRA'}</span>`;
  if (p.owner === 'public') return '<span class="owner-tag is-public">SERVIÇO</span>';
  return `<span class="owner-tag is-rival">${escape(ownerName(p).toUpperCase())}</span>`;
}
// Frase curta no topo; os detalhes completos ficam em "Como funciona".
function lede(p, slot) {
  if (slot?.service === 'employees') return 'Contrate funcionários para fábricas e vendedores para lojas.';
  if (slot?.service === 'cows') return 'Escolha a vaca e a fazenda de destino.';
  if (slot?.service === 'logistics') return 'Automatize o caminho fazenda → fábrica → loja.';
  if (slot?.service === 'bank') return 'Contrate a coleta automática do dinheiro das lojas.';
  if (slot?.service === 'security') return 'Escolha a equipe de capangas e o posto de destino.';
  if (p.owner !== 'player' && p.owner !== 'public' && p.owner !== 'neutral') return `Propriedade da ${ownerName(p)}.`;
  if (p.type === 'farm') return p.owner === 'player' ? 'Vacas produzem leite sozinhas. Leve o leite à queijaria.' : 'Fazenda disponível para compra.';
  if (p.type === 'factory') return p.owner === 'player' ? '1 L de leite + 1 embalagem = 1 queijo da mesma origem.' : 'Queijaria disponível para compra.';
  if (p.type === 'sale') return p.owner === 'player' ? 'Com vendedor ativo, a loja vende o estoque compartilhado.' : 'Loja disponível: amplia sua rede e seus preços.';
  if (p.type === 'security') return 'Capangas defendem esta loja e atacam vizinhas ligadas por rua.';
  return 'Gerencie esta propriedade.';
}
const HOW = {
  farm: 'As vacas produzem automaticamente: 1 L por vaca e por dia de jogo. Com ração, produção total; sem ração, 50%. A fazenda guarda até '+rules.milkCapacity+' L. Colete o leite e envie à fábrica, ou contrate a transportadora para recolher automaticamente. A revenda de vacas paga 70% do preço de compra após 3 dias de jogo; transferir preserva esse prazo.',
  factory: 'Receba leite da fazenda e transforme 1 litro em um queijo da mesma origem, usando uma embalagem. Sem funcionários, clique em Produzir para iniciar cada lote; vários lotes podem fabricar ao mesmo tempo, um por linha. Funcionários automatizam novos lotes e a compra de embalagens com seu caixa, além de acelerar a produção. Envie o queijo pronto às lojas ou contrate a transportadora. Após 4 dias sem salário, os funcionários pedem demissão.',
  sale: 'Queijos enviados ficam em um estoque compartilhado por todas as suas lojas, sem duplicar unidades. A loja só vende com vendedor ativo, que soma +1% ao preço. Cada loja além da primeira soma +10% ao preço-base. O estoque restante é vendido no fim do dia. O dinheiro fica na loja até ser recolhido por você ou pelo banco.',
  employees: 'Escolha um dos três níveis para ver contratação e salário diário. Selecione a fábrica de destino e contrate: funcionários automatizam e aceleram a produção. A queijaria inicial tem cinco vagas. Salários são cobrados diariamente; 4 dias sem pagamento causam demissão. Aqui você também contrata vendedores.',
  cows: 'Todas as cinco vacas estão à venda, incluindo Radioativa e Mágica. A compra é debitada do caixa e a vaca começa a produzir na fazenda escolhida, se houver vaga. Os produtos de cada espécie são descobertos depois que ela produzir o primeiro litro.',
  security: 'Níveis maiores são mais fortes e têm salários maiores. Aloque a equipe em um posto para defender ou atacar. Após 4 dias sem pagamento, a equipe pede demissão.',
};
let renderedFor = null;
function renderPanel() {
  const p = currentProperty();
  const slot = slotOf(selected);
  // Escolhas feitas nos menus sobrevivem ao redesenho automático da mesma propriedade.
  const kept = renderedFor === selected ? new Map([...$('panel').querySelectorAll('select[id]')].map((e) => [e.id, e.value])) : new Map();
  renderedFor = selected;
  $("panel").innerHTML = "";
  $("property-portrait").innerHTML="";
  if (!p || current.id !== "rural") {
    return;
  }
  $("title").textContent = slot?.name ?? p.id;
  $("panel-eyebrow").innerHTML = `${escape((slot?.service ? SERVICE_LABEL[slot.service] : TYPE_LABEL[p.type]) ?? 'Propriedade').toUpperCase()} ${ownerTag(p)}`;
  $("intro").textContent = lede(p, slot);
  let actions = "", how = HOW[slot?.service] ?? (p.owner === 'player' ? HOW[p.type] : '');
  if (["farm", "factory"].includes(p.type) && p.owner === "neutral" && !state.auctions?.[p.id])
    actions += button(
      "buyProperty",
      `Comprar ${p.type === "farm" ? "fazenda" : "fábrica"} · ${money(propertyPurchasePrice(p))}`,'','primary',
    );
  if (p.type === "service") {
    const service = slot.service;
    if (service === 'bank') {
      actions+=bankDescription(p.level) +
        button('hireBank',state.companies.player.bank ? 'Trocar para este banco' : 'Contratar coleta automática',state.companies.player.bank?.level===p.level || state.auctions?.[p.id] || !['player','public','neutral'].includes(p.owner)?'disabled':'','primary') +
        (state.companies.player.bank?.propertyId===p.id ? button('cancelBank','Cancelar serviço bancário',state.auctions?.[p.id]?'disabled':'','danger') : '') +
        button('finance','Abrir gestão financeira');
    }
    if (service === "employees")
      actions += group('Funcionários de fábrica', recruitmentCards('worker',assets) +
        '<label class="visually-hidden-label">Nível do funcionário<select id="worker-tier">'+[1,2,3].map(level=>'<option value="'+level+'">Nível '+level+'</option>').join('')+'</select></label><div id="recruit-details">'+recruitmentDetails('worker',1)+'</div>' +
        select('employee-factory','Fábrica de destino',owned('factory')) +
        button('hireAtFactory',icon('funcionario_nivel_1.png')+'Contratar e alocar funcionário','','primary'), {icon:assets['funcionario_nivel_1.png']}) +
        group('Vendedores', select('service-target','Ponto de venda',owned('sale')) +
        button('hireAtShop',icon('icon_vendedor.png')+'Contratar vendedor · '+money(rules.sellerHire)+' + '+money(rules.sellerSalary)+'/dia','','primary') +
        button('openServiceTarget','Ir ao ponto de venda'), {icon:assets['icon_vendedor.png']});
    if (service === "security")
      actions += recruitmentCards('guard',assets) +
        '<label class="visually-hidden-label">Nível da equipe<select id="team-tier">'+[1,2,3].map(level=>'<option value="'+level+'">Nível '+level+'</option>').join('')+'</select></label><div id="recruit-details">'+recruitmentDetails('guard',1)+'</div>' +
        select('service-target','Posto de segurança',owned('security')) +
        button('hireAtPost','Comprar equipe selecionada','','primary') +
        button('openServiceTarget','Ir ao posto: defesa e ataque');
    if (service === 'cows')
      actions+=cowShopCards(assets) +
        '<input id="service-species" type="hidden" value="weak"><p id="cow-shop-choice" class="choice-line">'+cowShopChoice('weak')+'</p>' +
        select('service-target','Fazenda de destino',owned('farm')) +
        button('buyAtCowShop','Comprar e alocar vaca','','primary');
    if (service === 'logistics')
      actions+=logisticsDescription() +
        (state.companies.player.logistics ? button('cancelLogistics','Cancelar transportadora',state.auctions?.[p.id]?'disabled':'','danger') : button('hireLogistics','Contratar transporte automático',state.auctions?.[p.id] || !['player','public','neutral'].includes(p.owner)?'disabled':'','primary')) +
        group('Transferência manual avulsa', select('service-source','Fábrica de origem',owned('factory')) +
        button('dispatchCheese',icon('icon_queijo.png')+'Transferir queijo pronto'));
  }
  if (p.type === "land")
    actions =
      "<p>Terreno neutro reservado à expansão. Construções serão habilitadas na etapa correspondente.</p>";
  if (p.type === "sale") {
    if (p.owner === "neutral")
      actions += button(
        "buyProperty",
        `Abrir loja · ${money(rules.propertyPrice)} + ${money(rules.shopDailyMaintenance)}/dia`,'','primary',
        'Cada loja própria além da primeira soma +10% no preço de venda de toda a rede.',
      );
    actions += button("control", icon(p.owner==='player'?'bandeira_capanga_aliado.png':'bandeira_capanga_neutra.png')+"Defesa da loja (capangas)");
  }
  if (p.owner === "player") {
    if (p.type === "farm") {
      const others=owned('farm').filter(f=>f.id!==p.id);
      actions +=
        group('Leite', select("factory-target", "Fábrica de destino", owned("factory")) +
        button("collectMilk", icon('icon_leite.png')+"Coletar leite → queijaria",total(p.milk)<1?'disabled':'','primary','Leva todo o leite possível para a fábrica escolhida.'), {icon:assets['icon_leite.png']}) +
        group('Ração', supplyControls('feed'), {icon:assets['icon_racao.png']}) +
        group('Rebanho', herdCards(p,assets) + button('cowShop',icon('vaca_mimosa.png')+'Comprar vacas na loja') +
        '<details class="panel-more" data-keep="herd"><summary>Transferir ou vender vacas</summary><label>Espécie<select id="manage-cow">'+Object.entries(p.cows).filter(([,n])=>n>0).map(([k,n])=>'<option value="'+k+'">'+rules.cows[k].name+' · '+n+'</option>').join('')+'</select></label><label>Quantidade<input id="cow-quantity" type="number" inputmode="numeric" min="1" step="1" value="1"></label>' +
        select('cow-target','Transferir para fazenda',others) +
        button('moveCow','Transferir vacas',others.length ? '' : 'disabled') +
        button('sellCow','Vender por 70% do preço de compra','','danger','Liberado 3 dias de jogo após a compra.') + '</details>', {icon:assets['vaca_magrela.png']});
    }
    if (p.type === "factory") {
      const recipes=Object.entries(rules.recipes).filter(([k,r])=>r.quality && discoveredMilk(state).includes(r.quality));
      actions +=
        group('Produção', `<label>Queijo<select id="recipe">${recipes.map(([k,r])=>`<option value="${k}">${r.name} · ${r.milk} L · ${r.time/1000} s em 1×</option>`).join("")}</select></label>` +
        `<div class="button-pair">${button("produce", icon('icon_queijo.png')+"Produzir 1",'','primary','Usa 1 L de leite e 1 embalagem.')}${button("produceMax", "Produzir o máximo",'','secondary','Ocupa todas as linhas livres com o leite e as embalagens disponíveis.')}</div>` +
        button("collectCheese", icon('icon_queijo.png')+"Enviar queijo às lojas",total(p.ready)<1?'disabled':'','primary','Leva o queijo pronto para o estoque compartilhado das lojas.'), {icon:assets['icon_queijo.png']}) +
        group('Embalagens', supplyControls('packaging'), {icon:assets['icon_embalagem.png']}) +
        group('Equipe', button("visitEmployees",icon('funcionario_nivel_1.png')+"Contratar funcionários na agência") +
        ((p.workers ?? []).some(w=>w.missedWages>0) ? button("payWorkerWages","Pagar salários atrasados",'','primary') : ""), {icon:assets['funcionario_nivel_1.png']});
    }
    if (p.type === "sale")
      actions =
        button("collectCash", icon('icon_money.png')+"Coletar saldo da loja",p.till<=0?'disabled':'','primary') +
        (!p.seller
          ? button(
              "hireSeller",
              `${icon('icon_vendedor.png')}Contratar vendedor · ${money(rules.sellerHire)} + ${money(rules.sellerSalary)}/dia`,'','primary',
            )
          : "") + actions;
    if (p.type === "security") {
      actions +=
        (!p.team
          ? button(
              "hireTeam",
              "Comprar equipe na agência de capangas",'','primary',
            )
          : button(
              "upgradeStars",
              `Promover equipe · ${money(rules.starUpgrade[p.team.stars] ?? 0)}`,
              p.team.stars === 3 ? "disabled" : "",'secondary','Mais estrelas aumentam a força base da equipe.',
            )) + combatUpgradeCards(p,assets);
      if (p.team) {
        const empty = owned("security").filter((s) => s.id !== p.id && !s.team);
        if (empty.length)
          actions +=
            select("move-target", "Realocar equipe", empty) +
            button("moveTeam", "Mover equipe para o posto");
        const targets = Object.values(state.properties).filter(
          (t) =>
            t.type === "security" &&
            t.owner === "coalho" &&
            estimate(state, p.id, t.id).connected,
        );
        if (targets.length)
          actions +=
            group('Ataque', select("attack-target", "Postos inimigos próximos", targets) +
            `<div id="estimate" class="attack-estimate"></div>` +
            button("attack", icon('icon_ataque.png')+"Confirmar ataque",'','primary'), {icon:assets['icon_ataque.png'],tone:'danger'});
        else
          actions +=
            "<p class=\"hint\">Nenhum inimigo ligado por rua a esta loja. Mova a equipe para uma loja vizinha para avançar.</p>";
      }
      const reserve = state.companies.player.reserveTeams ?? [];
      if (!p.team && reserve.length)
        actions +=
          "<label>Equipes em reserva<select id=reserve-team>" +
          reserve
            .map(
              (t) =>
                "<option value=" +
                t.id +
                ">" +
                t.id +
                " · " +
                t.stars +
                " estrelas</option>",
            )
            .join("") +
          "</select></label>" +
          button("deployReserve", "Alocar equipe recuperada",'','primary');
      actions += button("sale", "Ver loja protegida");
    }
  }
  if(p.owner==="player" && p.staffNotices?.length) actions+=button("dismissStaffNotices","Dispensar aviso de demissão");
  if(p.owner==="player" && p.type==="security" && p.team?.missedWages>0) actions=button("payTeamWages","Pagar salários atrasados dos capangas",'','primary')+actions;
  $("property-portrait").innerHTML = ["farm","factory","service"].includes(p.type) ? `<img class="farm-portrait" src="${assets[slot.building]}" alt="${escape(slot.name)}">` : "";
  if (p.owner === 'player' && ['farm','factory','sale'].includes(p.type)) $("property-portrait").innerHTML += productionChain(assets, {farm:1,factory:2,sale:4}[p.type], true);
  actions+=auctionActions(state,p);
  $("panel").innerHTML =
    `<div id="property-stats">${stats()}</div><div class="actions">${actions}</div><div id="property-details">${details()}</div>${how?howItWorks(escape(how)):''}`;
  kept.forEach((value, id) => { const el = $(id); if (el && [...el.options].some((o) => o.value === value)) el.value = value; });
  updateSupplyQuote('feed');updateSupplyQuote('packaging');
  $("panel").dataset.signature = signature();
  updateEstimate();
  $("attack-target")?.addEventListener("change", updateEstimate);
  if(state.campaign?.outcome) document.querySelectorAll('#panel [data-action]').forEach(button=>button.disabled=true);
}
function updateEstimate() {
  const target = $("attack-target")?.value;
  if (!target) return;
  const info = estimate(state, selected, target);
  const tone = info.chance >= 60 ? 'good' : info.chance >= 40 ? 'warn' : 'bad';
  $("estimate").innerHTML =
    `<div class="chance-meter tone-${tone}"><span>Chance de vitória <b>${info.chance.toFixed(1)}%</b></span><i class="meter"><b style="width:${info.chance}%"></b></i></div>`+
    chips([chip(`Ataque ${amount(info.attack)}`,'neutral'),chip(`Defesa ${amount(info.defense)}`,'neutral'),chip(`${info.duration / 1000}s`,'neutral'),chip(money(info.cost),'neutral')])+
    `<small>Pode haver retaliação se perder.</small>`;
}
// Atualiza os dados vivos do cabeçalho sem recriar os elementos.
function updateHud() {
  const mins = Math.floor(((state.time % DAY) / DAY) * 1440);
  $('hud-day').textContent = `Dia ${Math.floor(state.time / DAY) + 1}`;
  $('hud-time').textContent = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  $('hud-day-progress').style.width = `${((state.time % DAY) / DAY) * 100}%`;
  $('hud-clock').dataset.tip = `${speedTip(state.speed)} nesta velocidade.`;
  const me = dominanceProgress(state, 'player'), rival = dominanceProgress(state, 'coalho');
  $('hud-domain-value').textContent = `${me.owned}/${me.total}`;
  $('hud-domain-player').style.width = `${me.percent}%`;
  $('hud-domain-rival').style.width = `${rival.percent}%`;
  $('hud-domain').setAttribute('aria-label', `Domínio: ${me.owned} de ${me.total} objetivos. Rival: ${rival.owned}.`);
  document.querySelectorAll('[data-speed]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.speed) === state.speed)));
  const attacks = state.missions.filter((m) => m.defender === 'player');
  const alert = $('hud-alert');
  alert.hidden = !attacks.length;
  if (attacks.length) {
    alert.innerHTML = `<img src="${assets['icon_defesa.png']}" alt="">${attacks.length} ataque${attacks.length > 1 ? 's' : ''}`;
    alert.dataset.target = attacks[0].to;
    alert.dataset.tip = 'Capangas rivais a caminho. Toque para ver o posto atacado.';
  }
}
// Mantém aberto o que o jogador expandiu, mesmo com o painel redesenhado a cada segundo.
function keepOpenDetails(container, render) {
  const open = new Set([...container.querySelectorAll('details[open]')].map((d) => d.dataset.keep ?? d.className));
  render();
  container.querySelectorAll('details').forEach((d) => { if (open.has(d.dataset.keep ?? d.className)) d.open = true; });
}
function refresh() {
  if (current?.id === "rural" && $("panel").dataset.signature !== signature())
    renderPanel();
  dashboard.refresh();
  updateHud();
  if ($("property-stats")) keepOpenDetails($('property-stats'), () => { $('property-stats').innerHTML = stats(); });
  if ($("property-details")) keepOpenDetails($('property-details'), () => { $('property-details').innerHTML = details(); });
  $("pending").hidden = !state.pendingIncidents.length;
  updateEstimate();
  scene?.refresh();
  // Medalhas primeiro: o cartão "Próximo passo" já mostra a meta seguinte.
  if (tutorial && !tutorial.active) goals?.sync(state);
  tutorial?.sync();
  if(state.campaign?.outcome) document.querySelectorAll('#panel [data-action]').forEach(button=>button.disabled=true);
}
const sheetLayout = () => matchMedia('(max-width: 700px)').matches;
// Se o painel cobrir a construção escolhida, a câmera desliza para mostrá-la.
function reveal(id) {
  const menu = $('property-menu');
  if (!scene || !id || menu.hidden) return;
  const at = scene.slotTop(id), c = scene.cameras.main;
  if (!at) return;
  const canvas = scene.game.canvas.getBoundingClientRect(), m = menu.getBoundingClientRect();
  const x = canvas.left + (at.x - c.worldView.x) * c.zoom, y = canvas.top + (at.y + at.slot.sprite.width * 0.3 - c.worldView.y) * c.zoom;
  if (x < m.left - 30 || x > m.right + 30 || y < m.top - 30 || y > m.bottom + 30) return;
  if (sheetLayout()) scene.glideTo(id, (canvas.bottom - m.top) / 2);
  else scene.glideTo(id, 0, (canvas.right - m.left) / 2);
}
function selectProperty(id, { notify = true } = {}) {
  const menu = $("property-menu"), wasHidden = menu.hidden;
  selected = id;
  const show = Boolean(state?.properties[id]);
  if (show) { menu.classList.remove('is-closing'); menu.hidden = false; if (wasHidden) sfx.play('open'); }
  else closeProperty();
  renderPanel();
  if (show) menu.scrollTop = 0;
  refresh();
  if (notify && show) tutorial?.notify({ type: 'select', id });
}
function closeProperty() {
  const menu = $('property-menu');
  if (menu.hidden || menu.classList.contains('is-closing')) return;
  sfx.play('close');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { menu.hidden = true; return; }
  menu.classList.add('is-closing');
  setTimeout(() => { if (menu.classList.contains('is-closing')) { menu.hidden = true; menu.classList.remove('is-closing'); } }, 180);
}
// Abre uma propriedade a partir de avisos, do diário, da gestão ou do "Próximo passo".
function focusProperty(id) {
  const dialog = $('management-dialog');
  if (dialog.open) dialog.close();
  current = ruralMap;
  selectProperty(id);
  scene?.focus(id);
  requestAnimationFrame(() => reveal(id));
}
function syncClock() {
  const now = Date.now();
  if(resettingCampaign || clockPaused) {lastReal=now;return;}
  const previous = state;
  state = advance(state, Math.max(0, now - lastReal) * rules.speedFactors[state.speed]);
  lastReal = now;
  if (feedbackReady && previous !== state) feedback.handle(previous, state, { source: 'tick' });
}
async function persist(forceCloud=false) {
  if (storageFailed || resettingCampaign) return;
  state.savedAt = Date.now();
  const snapshot = structuredClone(state);
  saveChain = saveChain.catch(() => {}).then(() => save(snapshot));
  try {
    await saveChain;
    $("save").title = "Jogo salvo";
    if(!cloud.enabled())$('cloud-state').textContent='Salvo neste navegador';
    const cloudSave=queueCloud(snapshot,forceCloud);
    if(forceCloud)await cloudSave;
    return true;
  } catch (e) {
    status(`Falha ao salvar: ${e.message}`);
    feedback?.error(`Falha ao salvar: ${e.message}`);
    $('cloud-state').textContent='Falha ao salvar';$('cloud-state').title=e.message;
  }
}
// Mensagens específicas por ação; as demais usam o texto genérico.
function describe(c, prev, next) {
  const gained = next.companies.player.cash - prev.companies.player.cash;
  const name = (id) => slotOf(id)?.name ?? id;
  switch (c.type) {
    case 'buyFeed': case 'buyPackaging': return 'Compradas '+amount(c.quantity)+' '+(c.type==='buyFeed'?'rações':'embalagens')+' por '+money(c.quantity*(c.type==='buyFeed'?rules.feedPrice:rules.packagingPrice))+'.';
    case 'collectCash': return `Ação concluída: ${money(gained)} levados ao caixa.`;
    case 'collectMilk': return `Ação concluída: leite enviado à ${name(c.target)}.`;
    case 'collectCheese': return 'Ação concluída: queijo enviado ao estoque das lojas.';
    case 'produce': return c.batch ? `Ação concluída: ${c.batch} queijo(s) em produção.` : 'Ação concluída: queijo em produção.';
    case 'attack': return `Ação concluída: ataque a caminho de ${name(next.properties[c.target]?.saleId)}.`;
    default: return 'Ação concluída. Estoques e estado atualizados.';
  }
}
function execute(c, element) {
  if(resettingCampaign) return false;
  try {
    syncClock();
    const previous = state;
    state = command(state, c);
    feedback.handle(previous, state, { source: 'command', command: c, element });
    tutorial?.notify({ type: 'command', command: c });
    renderPanel();
    refresh();
    status(describe(c, previous, state));
    persist();
    return true;
  } catch (e) {
    status(e.message);
    feedback.error(e.message, element);
    return false;
  }
}
// Repete um comando enquanto as regras permitirem (ex.: ocupar todas as linhas da fábrica).
function executeRepeated(c, element, limit = 100) {
  if (resettingCampaign) return;
  syncClock();
  const previous = state;
  let next = state, count = 0, error = null;
  while (count < limit) {
    try { next = command(next, c); count++; } catch (e) { error = e; break; }
  }
  if (!count) { status(error.message); feedback.error(error.message, element); return; }
  state = next;
  const done = { ...c, batch: count };
  feedback.handle(previous, state, { source: 'command', command: done, element });
  tutorial?.notify({ type: 'command', command: done });
  renderPanel(); refresh();
  status(describe(done, previous, state));
  persist();
}
// Coleta pelos ícones dourados do mapa, sem abrir o painel (menos cliques, mapa visível).
function collect(id) {
  const p = state.properties[id];
  if (p.type === "farm") {
    const chosen = selected === id && !$('property-menu').hidden ? $("factory-target")?.value : null;
    const room = (f) => rules.factoryMilkCapacity - total(f.milk);
    const target = chosen ?? owned('factory').sort((a, b) => room(b) - room(a))[0]?.id;
    execute({ type: "collectMilk", id, target });
  }
  if (p.type === "factory")
    execute({ type: "collectCheese", id });
  if (p.type === "sale") execute({ type: "collectCash", id });
}
function updateRecruitment() {
  const input=$('worker-tier') ?? $('team-tier');
  if(!input) return;
  const kind=input.id==='worker-tier'?'worker':'guard';
  $('recruit-details').innerHTML=recruitmentDetails(kind,Number(input.value));
  document.querySelectorAll('.recruit-card[data-level]').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.level===input.value)));
}
$('panel').oninput=e=>{const kind=e.target.id==='feed-quantity'?'feed':e.target.id==='packaging-quantity'?'packaging':null;if(kind){supplyDrafts.set(selected+':'+kind,e.target.value);updateSupplyQuote(kind);}};
$('panel').onchange=e=>{if(['worker-tier','team-tier'].includes(e.target.id)) updateRecruitment();};
$("panel").onclick = (e) => {
  const element = e.target.closest("[data-action]");
  const action = element?.dataset.action;
  if (!action || element.disabled) return;
  const p = currentProperty();
  if(action==='setQty') {
    const kind=element.dataset.kind,input=$(kind+'-quantity');
    input.value=element.dataset.qty;supplyDrafts.set(selected+':'+kind,input.value);updateSupplyQuote(kind);sfx.play('tick');
    return;
  }
  if(action==='selectCow') {
    const species=e.target.closest('[data-species]').dataset.species;
    $('service-species').value=species;$('cow-shop-choice').textContent=cowShopChoice(species);
    document.querySelectorAll('.cow-shop-card').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.species===species)));
    sfx.play('tick');
    return;
  }
  if(action==='chooseWorker' || action==='chooseGuard') {
    $(action==='chooseWorker'?'worker-tier':'team-tier').value=e.target.closest('[data-level]').dataset.level;
    updateRecruitment();sfx.play('tick');return;
  }
  if(action==='visitEmployees') {selectProperty('employee-agency');$('employee-factory').value=p.id;return;}
  if(action==='hireAtFactory') {
    const id=$('employee-factory').value,level=Number($('worker-tier').value);
    execute({type:'hireWorker',id,level},element);
    $('employee-factory').value=id;$('worker-tier').value=String(level);updateRecruitment();return;
  }
  if(action === 'hireTeam') {
    selectProperty('security-agency');
    $('service-target').value=p.id;
    return;
  }
  if(action === 'cowShop') { selectProperty('cow-shop'); $('service-target').value=p.id; return; }
  if (action === "finance") return dashboard.show("cash");
  if (action === "openServiceTarget")
    return selectProperty($("service-target").value);
  if (action === "hireAtShop")
    return execute({ type: "hireSeller", id: $("service-target").value }, element);
  if (action === "hireAtPost") {
    const target=$('service-target').value, level=Number($('team-tier').value);
    execute({type:'hireTeam',id:target,level},element);
    $('service-target').value=target;
    $('team-tier').value=String(level);
    updateRecruitment();
    return;
  }
  if (action === 'buyAtCowShop') {
    const target=$('service-target').value,species=$('service-species').value;
    execute({type:'buyCow',id:target,species},element);
    $('service-target').value=target;$('service-species').value=species;
    $('cow-shop-choice').textContent=cowShopChoice(species);
    document.querySelectorAll('.cow-shop-card').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.species===species)));
    return;
  }
  if (action === "dispatchCheese")
    return execute({
      type: "collectCheese",
      id: $("service-source").value,
    }, element);
  if (action === "control") return selectProperty(p.securityId);
  if (action === "sale") return selectProperty(p.saleId);
  if (action === 'produceMax') {
    const recipe = $("recipe").value;
    return executeRepeated({ type: 'produce', id: selected, recipe, quality: rules.recipes[recipe]?.quality }, element);
  }
  const c = { type: action, id: selected };
  if(action==='bidProperty')c.amount=Math.round(Number($('auction-amount').value)*100);
  if (action === "deployReserve") c.teamId = $("reserve-team").value;
  if (action === "collectMilk") c.target = $("factory-target").value;
  if(action === 'buyFeed') c.quantity=Number($('feed-quantity').value);
  if(action === 'buyPackaging') c.quantity=Number($('packaging-quantity').value);
  if(action === 'moveCow' || action === 'sellCow') { c.quantity=Number($('cow-quantity').value); c.species=$('manage-cow').value; c.target=$('cow-target').value; }
  if (action === "buyCow") c.species = $("cow-species").value;
  if (action === "produce") {
    c.recipe = $("recipe").value;
    c.quality = rules.recipes[c.recipe]?.quality;
  }
  if (action === "attack") c.target = $("attack-target").value;
  if (action === "moveTeam") c.target = $("move-target").value;
  execute(c, element);
};
$('close-property').onclick=()=>closeProperty();
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && !document.querySelector('dialog[open]')) closeProperty();
});
document.querySelector('.speed-control').onclick = (e) => {
  const speed = Number(e.target.closest('[data-speed]')?.dataset.speed);
  if (speed && speed !== state.speed) execute({ type: "speed", speed }, e.target.closest('[data-speed]'));
};
$('hud-domain').onclick = () => dashboard.show('enemies');
$('hud-alert').onclick = (e) => { const id = e.currentTarget.dataset.target; if (id) focusProperty(id); };
$("pending").onclick = () => {
  syncClock();
  const previous = state;
  state = resolvePending(state);
  feedback.handle(previous, state, { source: 'tick' });
  renderPanel();
  refresh();
  persist();
};

const resetDialog=resetCampaignUI({onReset:async()=>{
  if(resettingCampaign) return;
  resettingCampaign=true;
  try {
    const fresh=createGame();
    fresh.campaignId='rural-'+crypto.randomUUID();
    fresh.playerProfile={...activeProfile};
    // Substituição atômica: mantém o save anterior caso a gravação falhe.
    saveChain=saveChain.catch(()=>{}).then(()=>save(fresh));
    await saveChain;
    state=fresh;
    queueCloud(fresh,true);
    storageFailed=false;
    lastReal=lastSave=Date.now();
    current=ruralMap;selected='farm-ze';
    renderPanel();refresh();scene?.show();$("property-menu").hidden=true;
    feedback.seed(state);
    status('Nova campanha iniciada. Progresso anterior apagado.');
    feedback.toast('Nova campanha iniciada. Quer rever o passo a passo?', { tone: 'info', title: 'Recomeço', icon: 'comece_flag.png', action: { label: 'Tutorial', run: () => tutorial.restart() }, duration: 7000 });
  } finally {resettingCampaign=false;lastReal=Date.now();}
}});
const openReset = () => { $('settings-menu').dataset.open = 'false'; resetDialog.open(); };
$('reset-campaign').onclick=openReset;
$("save").onclick = async (e) => { syncClock(); if(await persist(true)) { status("Jogo salvo no perfil "+activeProfile.name+"."); sfx.play('objective'); feedback.toast('Progresso salvo.', { tone: 'good', icon: 'icon_salvar.png', duration: 2200 }); } };
let isNewCampaign = false;
try {
  state = await load(activeProfile.id);
  if(cloud.enabled()){try{const remote=await cloud.load(activeProfile);if(remote && (!state || remote.savedAt>state.savedAt))state=remote;}catch(e){$("cloud-state").textContent="Nuvem indisponível · progresso local";$("cloud-state").title=e.message;}}
  if(state && state.resetRevision !== reset.revision) {
    state=freshCampaign();
    isNewCampaign = true;
    await save(state);
  }
  if (state) {
    status("Campanha carregada. O tempo ficou pausado enquanto você estava fora.");
  } else {
    state = freshCampaign();
    isNewCampaign = true;
    status(
      "Comece levando o queijo inicial da fábrica à barraquinha. Compre ração para produzir leite.",
    );
  }
} catch (e) {
  state = freshCampaign();
  storageFailed = true;
  status(
    `Não foi possível carregar o salvamento: ${e.message}. A sessão atual não substituirá o arquivo anterior.`,
  );
}
state.playerProfile={...activeProfile};
$("player-label").textContent=activeProfile.name;
if(storageFailed)$('cloud-state').textContent='Sessão sem gravação · erro no save';
else if(!cloud.enabled())$("cloud-state").textContent='Local · Firebase não configurado';
$("ranking").onclick=async()=>{sfx.play('open');await persist(true);ranking.open();};
for(const link of [$("home-logo"),$("portfolio-avatar")])link.onclick=async e=>{
  e.preventDefault();const destination=e.currentTarget.href;syncClock();
  clockPaused=true;
  if(await persist(true))window.location.assign(destination);
  else {lastReal=Date.now();clockPaused=document.hidden;}
};
feedback = createFeedback({
  sfx, assets,
  getScene: () => scene,
  onFocus: focusProperty,
  onManage: (id) => dashboard.show(id),
  onNewCampaign: openReset,
});
goals = createGoals({
  sfx, assets, feedback,
  getState: () => state,
  onFocus: focusProperty,
  read: readLocal, write: writeLocal,
  profileId: activeProfile.id,
});
tutorial = createTutorial({
  sfx, assets, feedback,
  getScene: () => scene,
  getState: () => state,
  getSelected: () => ($('property-menu').hidden ? null : selected),
  onFocus: focusProperty,
  onManage: (id) => dashboard.show(id),
  read: readLocal, write: writeLocal,
  profileId: activeProfile.id,
  getGoal: () => goals.current(),
  onGoals: () => goals.open(),
});
const help = createHelp({ assets, sfx, onTutorial: () => { closeProperty(); tutorial.restart(); }, onReset: openReset, onGoals: () => goals.open() });
$('help-button').onclick = () => help.open();
if (storageFailed) feedback.toast('Não foi possível carregar o salvamento. Esta sessão não será gravada.', { tone: 'bad', title: 'Salvamento', duration: 8000 });
await persist();
document.querySelector('#app').inert=false;
lastReal = Date.now();
$("reset-campaign").disabled=false;
feedback.seed(state);
feedbackReady = true;
renderPanel();
refresh();
await goals.load(state);
await tutorial.load(isNewCampaign);
music.play();
if (state.campaign?.outcome) feedback.showOutcome(state);
const [{ default: Phaser }, { mapScene }] = await mapEngine;
const Scene = mapScene({
  assets,
  getMap: () => current,
  getState: () => state,
  getSelected: () => ($('property-menu').hidden ? null : selected),
  onSelect: (id) => { selectProperty(id); requestAnimationFrame(() => reveal(id)); },
  onCollect: collect,
  onReady: (s) => { scene = s; tutorial.sync(); },
});
new Phaser.Game({
  type: Phaser.CANVAS,
  parent: "map",
  backgroundColor: "#FFF8E7",
  scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" },
  scene: Scene,
});
setInterval(() => {
  if(resettingCampaign || clockPaused) return;
  syncClock();
  refresh();
  if (Date.now() - lastSave > 15000) {
    lastSave = Date.now();
    persist();
  }
}, 1000);
function pauseSession() {
  if(clockPaused)return;
  syncClock();
  clockPaused=true;
  void persist(true);
}
function resumeSession() {
  lastReal=Date.now();
  clockPaused=document.hidden;
}
document.addEventListener("visibilitychange", () => {
  if(document.hidden)pauseSession();
  else resumeSession();
});
window.addEventListener("pagehide",pauseSession);
window.addEventListener("pageshow",resumeSession);
