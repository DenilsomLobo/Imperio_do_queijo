import {playerEntry,rankingUI} from './ui/player-entry.js';
import {cloud} from './persistence/firebase.js';
import avatarUrl from '../assets-web/portfolio-avatar.webp';
import {combatUpgradeCards} from './ui/combat-upgrades.js';
import {sharedShopStock,shopCapacity,shopBonus,companyShops,salePrice} from './domain/shop-stock.js';
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
import Phaser from "phaser";
import "./style.css";
import "./game.css";
import "./theme.css";
import "./sector-menu.css";
import "./map-layout.css";
import './campaign.css';
import './player-entry.css';
import './mobile.css';
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
import { load, save } from "./persistence/local.js";
import { mapScene } from "./map/game-scene.js";
import { managementUI } from "./ui/management.js";
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
  clockPaused = document.hidden;
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
document.querySelector("#app").innerHTML =
  `<header><div class="brand"><a id="portfolio-avatar" class="portfolio-avatar" href="https://portifolio-denilsom-lobo.web.app/" aria-label="Voltar à página inicial de Denilsom Lobo"><img src="${avatarUrl}" alt="Denilsom Lobo" width="38" height="38"></a><a id="home-logo" href="./index.html" aria-label="Voltar à página inicial"><img class="brand-logo" src="${assets["text_logo.png"]}" alt="Império do Queijo"></a></div><div class="player-identity"><strong id="player-label"></strong><small id="cloud-state">Salvamento local</small></div><div id="hud"></div><label class="speed">Velocidade <select id="speed" title="Dia: 60 s / 30 s / 10 s"><option value="1">1× · dia em 1 min</option><option value="2">2× · dia em 30 s</option><option value="4">4× · dia em 10 s</option></select></label><button id="save" class="header-action"><img src="${assets["icon_salvar.png"]}" alt="">Salvar</button><button id="reset-campaign" class="header-action danger-button" disabled><img src="${assets["icon_resetar.png"]}" alt="">Resetar</button><button id="ranking" class="header-action"><img src="${assets["icon_ranking.png"]}" alt="">Ranking</button></header><section id="management-bar" aria-label="Gestão da empresa"></section><main><section id="map"></section><aside id="property-menu" aria-label="Gestão da propriedade" hidden><button id="close-property" type="button" aria-label="Fechar menu da propriedade" title="Fechar menu">✕</button><div class="panel-eyebrow">PROPRIEDADE SELECIONADA</div><h2 id="title">Zona rural</h2><div id="property-portrait"></div><p id="intro">Clique nas construções para gerenciar. Os círculos em frente às lojas mostram quem controla cada ponto.</p><div id="panel"></div><p id="status" role="status">Carregando campanha…</p><button id="pending" hidden>Resolver incidentes pendentes</button><details><summary>Relatórios e finanças</summary><div id="reports"></div></details></aside></main><footer>Arraste o mapa · dois dedos ou roda do mouse para zoom · ícones dourados coletam recursos.</footer><dialog id="management-dialog" aria-labelledby="management-title"><div class="dialog-heading"><img id="management-sector-image" alt="" width="64" height="64" hidden><div><small>GESTÃO DO IMPÉRIO</small><h2 id="management-title"></h2></div><button data-close aria-label="Fechar gestão">✕</button></div><div id="management-content"></div></dialog>`;
const dashboard = managementUI({
  getState: () => state,
  assets,
  onProperty: (id) => {
    const changed = current?.id !== "rural";
    current = ruralMap;
    selectProperty(id);
    if (changed) scene?.show();
    scene?.focus(id);
  },
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
    ? `${JSON.stringify(state.auctions?.[p.id] ?? null)}|${p.id}|${p.owner}|${Boolean(state.companies.player.logistics)}|${state.companies.player.bank?.level ?? 0}|${p.team?.id ?? ""}|${p.team?.missedWages ?? 0}|${(p.workers ?? []).map(w=>w.id+":"+w.missedWages).join(",")}|${p.staffNotices?.length ?? 0}|${owned("factory").map(f=>f.id).join(",")}|${discoveredMilk(state).join(",")}|${owned("farm").map(f=>f.id).join(",")}|${owned("sale")
        .map((s) => s.id)
        .join(",")}`
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
        `<option value="${p.id}">${escape(ruralMap.slots.find((s) => s.id === p.id)?.name ?? p.id)}</option>`,
    )
    .join("");
}
function button(action, label, extra = "") {
  return `<button data-action="${action}" ${extra}>${label}</button>`;
}
function supplyControls(kind){
 const feed=kind==='feed',id=kind+'-quantity',name=feed?'ração':'embalagens';
 const value=supplyDrafts.get(selected+':'+kind) ?? '10';
 return `<label>Quantidade de ${name}<input id="${id}" type="number" min="1" max="${rules.supplyPurchaseLimit}" step="1" value="${escape(value)}"></label>`+
 button(feed?'buyFeed':'buyPackaging',`Comprar ${name}`)+`<p id="${kind}-quote" class="supply-quote" role="status"></p>`;
}
function updateSupplyQuote(kind){
 const input=$(kind+'-quantity');if(!input)return;
 const feed=kind==='feed',price=feed?rules.feedPrice:rules.packagingPrice,quantity=Number(input.value);
 const valid=Number.isSafeInteger(quantity)&&quantity>=1&&quantity<=rules.supplyPurchaseLimit;
 const target=$('panel').querySelector(`[data-action="${feed?'buyFeed':'buyPackaging'}"]`);
 target.disabled=!valid;
 target.innerHTML=`<img class="resource-icon" src="${assets[feed?'icon_racao.png':'icon_embalagem.png']}" alt="">Comprar ${valid?amount(quantity)+' ':''}${feed?'rações':'embalagens'}${valid?' · '+money(quantity*price):''}`;
 $(kind+'-quote').textContent=valid?`${money(price)} por unidade · total: ${money(quantity*price)}`:`Informe uma quantidade inteira de 1 a ${amount(rules.supplyPurchaseLimit)}.`;
}
function select(id, label, list) {
  return `<label>${label}<select id="${id}">${options(list)}</select></label>`;
}
function stats() {
  const p = currentProperty();
  if (!p) return "";
  let html = `<p><b>Controle:</b> ${escape(ownerName(p))}</p>`;
  if(ruralMap.slots.find(slot=>slot.id===p.id)?.service==="logistics") html+=logisticsInfo(state);
  if(ruralMap.slots.find(slot=>slot.id===p.id)?.service==="bank") html+=bankInfo(state);
  if (p.type === "farm")
    html += `<p>Leite acumulado: <b>${amount(total(p.milk))} / ${rules.milkCapacity} L</b><br>Ração: ${amount(p.feed)}<br>Consumo com ração: ${amount(Object.entries(p.cows).reduce((n,[k,c])=>n+c*rules.cows[k].feed,0))} rações/dia<br>Vacas: ${total(p.cows)} / ${rules.farmCapacities[p.level - 1]}<br>Produção potencial: ${amount(Object.entries(p.cows).reduce((n, [k, c]) => n + c * rules.cows[k].milk, 0))} L/dia ${p.feed <= 0 ? "· sem ração: 50% da produção" : ""}</p>`;
  if(p.milk) html += '<div class="milk-stocks">'+Object.entries(dairy).filter(([k])=>(p.milk[k] ?? 0)>=1 && discoveredMilk(state).includes(k)).map(([k,c])=>'<div><img src="'+assets[c.milkAsset]+'" alt="Leite '+c.name+'"><span>Leite '+c.name+'<b>'+amount(p.milk[k] ?? 0)+' L</b></span></div>').join('')+'</div>';
  if(p.ready || p.stock) html += cheeseStockCards(p.type==='sale' ? sharedShopStock(state,p.owner) : p.ready,assets,id=>salePrice(state,p.owner,id,p.type==='sale'?p:undefined));
  if (p.type === "factory")
    html += `<p>Linhas de Produzir &amp; embalar: <b>${factoryProfile(p).lines}</b> · em produção: ${p.batches.filter(b=>b.phase==='production').length}<br>Manutenção da queijaria: ${money(factoryProfile(p).daily)}/dia${p.maintenanceDebt ? " · Pendente: "+money(p.maintenanceDebt) : ""}<br>Leite armazenado: <b>${amount(total(p.milk))} / ${rules.factoryMilkCapacity} L</b><br>Embalagens: ${p.packaging}<br>Queijo pronto: <b>${total(p.ready)} / ${rules.cheeseCapacity}</b></p>${p.batches.map((b) => `<p>Queijo ${dairy[b.quality].name} · ${b.phase === "production" ? "Fabricação" : "Maturação"} · ${Math.max(0, Math.ceil((b.due - state.time) / (1000*(b.phase==="production"?productionMultiplier(p):1))))} s restantes</p>`).join("")}`;
  if(p.type==='security') $('intro').textContent='Gerencie o ataque e a defesa desta loja. Armamento aumenta o dano de ataque; barricada aumenta a força de defesa. Consulte abaixo os valores reais, bônus e regras da disputa.';
  if(p.type==='factory') html+='<h3>Equipe da fábrica · '+(p.workers ?? []).length+'/'+workerCapacity(p)+'</h3>'+workerCards(p,assets)+'<p>Produção '+(activeWorkers(p).length?'automática':'manual')+' · velocidade +'+Math.round((productionMultiplier(p)-1)*100)+'%</p>';
  if(p.staffNotices?.length) html+='<div class="staff-notice" role="status">'+p.staffNotices.map(n=>'<p>'+escape(n.text)+'</p>').join('')+'</div>';
  if (p.type === "sale")
    html += `<p>Estoque: <b>${total(sharedShopStock(state,p.owner))} / ${shopCapacity(state,p.owner)} queijos compartilhados</b><br>Disponível em todas as lojas da empresa, sem duplicar unidades.<br>Bônus de venda: +${Math.round(shopBonus(state,p.owner)*100)}% · ${companyShops(state,p.owner).length} loja(s); +10% por loja além da primeira.<br>Saldo para coleta: <b>${money(p.till)}</b><br>Vendas finais: ${p.sales}<br>Manutenção: ${money(rules.shopDailyMaintenance)}/dia${p.maintenanceDebt ? " · Pendente: "+money(p.maintenanceDebt) : ""}<br>Estoque restante vendido no fim do dia (com vendedor ativo)<br>Atividade: ${p.seller && p.sellerActive ? "ativa · vendedor +1% no preço" : "inativa até ter vendedor ativo"}<br>Vendedor: ${p.seller ? (p.sellerActive ? "ativo" : "salário em atraso") : "não contratado"}</p>`;
  if (p.type === "security") {
    const t = p.team;
    html += combatInfo(p,state.time,assets,state);
    if(t) html += '<p>'+ (attackStrength(t,state.time,state,p.owner)>0?'Equipe disponível':'Equipe sem força disponível')+'<br>Recuperação/missão: '+Math.max(0,Math.ceil((Math.max(t.busyUntil,t.recoverUntil)-state.time)/1000))+' s<br>Cooldown para atacar: '+Math.max(0,Math.ceil((t.cooldownUntil-state.time)/1000))+' s</p>';
  }
  html+=auctionInfo(state,p);
  return html;
}
function renderPanel() {
  const p = currentProperty();
  const slot = ruralMap.slots.find((s) => s.id === selected);
  $("panel").innerHTML = "";
  $("property-portrait").innerHTML="";
  if (!p || current.id !== "rural") {
    return;
  }
  $("intro").textContent = p.type === "farm" ? "As vacas produzem automaticamente. Com ração, produção total; sem ração, 50%. Colete o leite e envie à fábrica, ou contrate a transportadora para recolher automaticamente." : "Gerencie a produção e os estoques desta propriedade.";
  if(p.type==='factory') $('intro').textContent='Receba leite da fazenda e transforme 1 litro em um queijo da mesma origem, usando uma embalagem. Sem funcionários, clique em Produzir & embalar para iniciar cada lote; vários lotes podem fabricar ao mesmo tempo. Funcionários automatizam novos lotes e a compra de embalagens com seu caixa, além de acelerar a produção. Recolha o queijo pronto para enviar à loja ou contrate a transportadora para automatizar as entregas. Após 4 dias sem salário, eles pedem demissão.';
  if(slot?.service==='employees') $('intro').textContent='Escolha um dos três níveis para consultar contratação e salário diário. Selecione sua fábrica e contrate: os funcionários automatizam e aceleram a produção. A queijaria inicial tem cinco vagas. Salários são cobrados diariamente; 4 dias sem pagamento causam demissão. Aqui você também contrata vendedores.';
  if(slot?.service==='cows') $('intro').textContent='Escolha uma das cinco vacas para consultar preço e consumo de ração. Todas estão disponíveis para compra, incluindo Radioativa e Mágica. Os produtos de cada vaca são descobertos depois que ela produzir.';
  if(slot?.service==='logistics') $('intro').textContent='Automatize o caminho do leite e do queijo entre suas propriedades. Um único contrato atende fazendas, fábricas e lojas da empresa, sem clicar nos ícones de coleta.';
  if(slot?.service==='bank') $('intro').textContent='Contrate a coleta automática do dinheiro das lojas. Compare o custo, a taxa diária e o limite de vendas de cada banco. Apenas um contrato pode ficar ativo e você pode cancelar a qualquer hora.';
  if(slot?.service==='security') $('intro').textContent='Escolha a equipe de capangas para consultar contratação e salário diário. Aloque em um posto para defender ou atacar. Níveis maiores são mais fortes e têm salários diferentes. Após 4 dias sem pagamento, a equipe pede demissão.';
  $("title").textContent = slot?.name ?? p.id;
  let actions = "";
  if (["farm", "factory"].includes(p.type) && p.owner === "neutral" && !state.auctions?.[p.id])
    actions += button(
      "buyProperty",
      `Comprar ${p.type === "farm" ? "fazenda" : "fábrica"} · ${money(propertyPurchasePrice(p))}`,
    );
  if (p.type === "service") {
    const service = slot.service;
    if (service === 'bank') {
      actions+=bankDescription(p.level) +
        button('hireBank',state.companies.player.bank ? 'Trocar para este banco' : 'Contratar coleta automática',state.companies.player.bank?.level===p.level || state.auctions?.[p.id] || !['player','public','neutral'].includes(p.owner)?'disabled':'') +
        (state.companies.player.bank?.propertyId===p.id ? button('cancelBank','Cancelar serviço bancário',state.auctions?.[p.id]?'disabled':'') : '') +
        button('finance','Abrir gestão financeira');
    }
    if (service === "employees")
      actions += recruitmentCards('worker',assets) +
        '<label>Nível do funcionário<select id="worker-tier">'+[1,2,3].map(level=>'<option value="'+level+'">Nível '+level+'</option>').join('')+'</select></label><div id="recruit-details">'+recruitmentDetails('worker',1)+'</div>' +
        select('employee-factory','Fábrica de destino',owned('factory')) +
        button('hireAtFactory','Contratar e alocar funcionário') +
        '<hr><h3>Vendedores</h3>' + select('service-target','Ponto de venda',owned('sale')) +
        button('hireAtShop','<img class="resource-icon" src="'+assets['icon_vendedor.png']+'" alt="">Contratar vendedor · '+money(rules.sellerHire)+' + '+money(rules.sellerSalary)+'/dia') +
        button('openServiceTarget','Gerenciar ponto de venda');
    if (service === "security")
      actions += recruitmentCards('guard',assets) +
        '<label>Nível da equipe<select id="team-tier">'+[1,2,3].map(level=>'<option value="'+level+'">Nível '+level+'</option>').join('')+'</select></label><div id="recruit-details">'+recruitmentDetails('guard',1)+'</div>' +
        select('service-target','Posto de segurança',owned('security')) +
        button('hireAtPost','Comprar equipe selecionada') +
        button('openServiceTarget','Gerenciar defesa e ataque');
    if (service === 'cows')
      actions+=cowShopCards(assets) +
        '<input id="service-species" type="hidden" value="weak"><p id="cow-shop-choice">'+cowShopChoice('weak')+'</p>' +
        select('service-target','Fazenda de destino',owned('farm')) +
        button('buyAtCowShop','Comprar e alocar vaca') +
        '<p>Escolha uma vaca e uma fazenda com vaga. A compra é debitada do caixa e a vaca começa a produzir na fazenda. As espécies Radioativa e Mágica são compradas diretamente aqui.</p>';
    if (service === 'logistics')
      actions+=logisticsDescription() +
        (state.companies.player.logistics ? button('cancelLogistics','Cancelar transportadora',state.auctions?.[p.id]?'disabled':'') : button('hireLogistics','Contratar transporte automático',state.auctions?.[p.id] || !['player','public','neutral'].includes(p.owner)?'disabled':'')) +
        '<hr><h3>Transferência manual avulsa</h3>' +
        select('service-source','Fábrica de origem',owned('factory')) +
        button('dispatchCheese','Transferir queijo pronto');
  }
  if (p.type === "land")
    actions =
      "<p>Terreno neutro reservado à expansão. Construções serão habilitadas na etapa correspondente.</p>";
  if (p.type === "sale") {
    if (p.owner === "neutral")
      actions += button(
        "buyProperty",
        `Abrir loja · ${money(rules.propertyPrice)} + ${money(rules.shopDailyMaintenance)}/dia`,
      );
    actions += button("control", "Ver círculo de controle");
  }
  if (p.owner === "player") {
    if (p.type === "farm") {
      actions +=
        select("factory-target", "Fábrica de destino", owned("factory")) +
        button("collectMilk", "Coletar todo o leite possível") +
        supplyControls('feed') + button('cowShop','Visitar loja de vacas') +
        '<h3>Gestão de vacas</h3>'+herdCards(p,assets)+'<label>Espécie<select id="manage-cow">'+Object.entries(p.cows).filter(([,n])=>n>0).map(([k,n])=>'<option value="'+k+'">'+rules.cows[k].name+' · '+n+'</option>').join('')+'</select></label><label>Quantidade<input id="cow-quantity" type="number" min="1" step="1" value="1"></label>' +
        select('cow-target','Transferir para fazenda',owned('farm').filter(f=>f.id!==p.id)) +
        button('moveCow','Transferir vacas',owned('farm').length<2 ? 'disabled' : '') +
        button('sellCow','Vender por 70% do preço de compra') +
        '<p>Venda liberada após 3 dias de jogo da compra. Transferir preserva esse prazo.</p>';
    }
    if (p.type === "factory") {
      actions +=
        `<label>Queijo<select id="recipe">${Object.entries(rules.recipes).filter(([k,r])=>r.quality && discoveredMilk(state).includes(r.quality)).map(([k,r])=>`<option value="${k}">${r.name} · ${r.milk} L · ${r.time/1000} s em 1×</option>`).join("")}</select></label>` +
        button("produce", "Produzir & embalar · 1 queijo") +
        button("visitEmployees","Contratar funcionários na agência") +
        ((p.workers ?? []).some(w=>w.missedWages>0) ? button("payWorkerWages","Pagar salários atrasados") : "") +
        supplyControls('packaging') +
        button("collectCheese", "Enviar queijo para todas as lojas");
    }
    if (p.type === "sale")
      actions +=
        button("collectCash", "Coletar saldo da loja") +
        (!p.seller
          ? button(
              "hireSeller",
              `<img class="resource-icon" src="${assets["icon_vendedor.png"]}" alt="">Contratar vendedor · ${money(rules.sellerHire)} + ${money(rules.sellerSalary)}/dia`,
            )
          : "");
    if (p.type === "security") {
      actions +=
        (!p.team
          ? button(
              "hireTeam",
              "Comprar equipe na agência de capangas",
            )
          : button(
              "upgradeStars",
              `Promover equipe · ${money(rules.starUpgrade[p.team.stars] ?? 0)}`,
              p.team.stars === 3 ? "disabled" : "",
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
            select("attack-target", "Postos inimigos próximos", targets) +
            `<p id="estimate"></p>` +
            button("attack", "Confirmar ataque");
        else
          actions +=
            "<p>Não há inimigos ligados diretamente por uma rua a esta loja. Realocando a equipe para uma loja vizinha, você pode avançar pela rede de ruas.</p>";
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
          button("deployReserve", "Alocar equipe recuperada");
      actions += button("sale", "Ver loja protegida");
    }
  }
  if(p.owner==="player" && p.staffNotices?.length) actions+=button("dismissStaffNotices","Dispensar aviso de demissão");
  if(p.owner==="player" && p.type==="security" && p.team?.missedWages>0) actions+=button("payTeamWages","Pagar salários atrasados dos capangas");
  $("property-portrait").innerHTML = ["farm","factory","service"].includes(p.type) ? `<img class="farm-portrait" src="${assets[slot.building]}" alt="${escape(slot.name)}">` : "";
  actions+=auctionActions(state,p);
  $("panel").innerHTML =
    `<div id="property-stats">${stats()}</div><div class="actions">${actions}</div>`;
  updateSupplyQuote('feed');updateSupplyQuote('packaging');
  $("panel").dataset.signature = signature();
  updateEstimate();
  $("attack-target")?.addEventListener("change", updateEstimate);
}
function updateEstimate() {
  const target = $("attack-target")?.value;
  if (!target) return;
  const info = estimate(state, selected, target);
  $("estimate").textContent =
    `Ataque ${amount(info.attack)} · defesa ${amount(info.defense)} · chance ${info.chance.toFixed(1)}% · ${info.duration / 1000}s · ${money(info.cost)}. Pode haver retaliação.`;
}
function refresh() {

  if (current?.id === "rural" && $("panel").dataset.signature !== signature())
    renderPanel();
  const c = state.companies.player;
  dashboard.refresh();
  const mins = Math.floor(((state.time % DAY) / DAY) * 1440);
  $("hud").innerHTML =
    `<b>${money(c.cash)}</b><span>Dia ${Math.floor(state.time / DAY) + 1} · ${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}</span><span>Leite ${amount(
      owned("farm")
        .concat(owned("factory"))
        .reduce((n, p) => n + total(p.milk), 0),
    )} L · Queijo ${owned("factory").reduce((n, p) => n + total(p.ready), 0)}</span>`;
  $("speed").value = state.speed;
  $("speed").title=`Um dia de jogo passa em ${DAY/1000/rules.speedFactors[state.speed]} segundos reais nesta velocidade.`;
  if ($("property-stats")) {
    const rulesOpen=$('property-stats').querySelector('.combat-rules')?.open;
    $('property-stats').innerHTML=stats();
    const combatRules=$('property-stats').querySelector('.combat-rules');
    if(combatRules) combatRules.open=Boolean(rulesOpen);
  }
  $("pending").hidden = !state.pendingIncidents.length;
  updateEstimate();
  $("reports").innerHTML =
    `<p>Faturamento: ${money(c.revenue)}<br>Despesas: ${money(c.expenses)}<br>Vendas menos gastos: ${money(c.revenue - c.expenses)}<br>Saldo nas lojas: ${money(owned("sale").reduce((n, p) => n + p.till, 0))}</p>${state.reports
      .slice(0, 10)
      .map(
        (r) => `<p>Dia ${Math.floor(r.time / DAY) + 1}: ${escape(r.text)}</p>`,
      )
      .join("")}`;
  scene?.refresh();
  if(state.campaign?.outcome) document.querySelectorAll('#panel [data-action]').forEach(button=>button.disabled=true);
}
function selectProperty(id) {
  selected = id;
  $("property-menu").hidden = !state?.properties[id];
  renderPanel();
  refresh();
}
function syncClock() {
  const now = Date.now();
  if(resettingCampaign || clockPaused) {lastReal=now;return;}
  state = advance(state, Math.max(0, now - lastReal) * rules.speedFactors[state.speed]);
  lastReal = now;
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
    $('cloud-state').textContent='Falha ao salvar';$('cloud-state').title=e.message;
  }
}
function execute(c) {
  if(resettingCampaign) return;
  try {
    syncClock();
    state = command(state, c);
    renderPanel();
    refresh();
    status(['buyFeed','buyPackaging'].includes(c.type)?'Compradas '+amount(c.quantity)+' '+(c.type==='buyFeed'?'rações':'embalagens')+' por '+money(c.quantity*(c.type==='buyFeed'?rules.feedPrice:rules.packagingPrice))+'.':'Ação concluída. Estoques e estado atualizados.');
    persist();
  } catch (e) {
    status(e.message);
  }
}
function collect(id) {
  selectProperty(id);
  const p = state.properties[id];
  if (p.type === "farm")
    execute({ type: "collectMilk", id, target: $("factory-target")?.value });
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
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  const p = currentProperty();
  if(action==='selectCow') {
    const species=e.target.closest('[data-species]').dataset.species;
    $('service-species').value=species;$('cow-shop-choice').textContent=cowShopChoice(species);
    document.querySelectorAll('.cow-shop-card').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.species===species)));
    return;
  }
  if(action==='chooseWorker' || action==='chooseGuard') {
    $(action==='chooseWorker'?'worker-tier':'team-tier').value=e.target.closest('[data-level]').dataset.level;
    updateRecruitment();return;
  }
  if(action==='visitEmployees') {selectProperty('employee-agency');$('employee-factory').value=p.id;return;}
  if(action==='hireAtFactory') {
    const id=$('employee-factory').value,level=Number($('worker-tier').value);
    execute({type:'hireWorker',id,level});
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
    return execute({ type: "hireSeller", id: $("service-target").value });
  if (action === "hireAtPost") {
    const target=$('service-target').value, level=Number($('team-tier').value);
    execute({type:'hireTeam',id:target,level});
    $('service-target').value=target;
    $('team-tier').value=String(level);
    updateRecruitment();
    return;
  }
  if (action === 'buyAtCowShop') {
    const target=$('service-target').value,species=$('service-species').value;
    execute({type:'buyCow',id:target,species});
    $('service-target').value=target;$('service-species').value=species;
    $('cow-shop-choice').textContent=cowShopChoice(species);
    document.querySelectorAll('.cow-shop-card').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.species===species)));
    return;
  }
  if (action === "dispatchCheese")
    return execute({
      type: "collectCheese",
      id: $("service-source").value,
    });
  if (action === "control") return selectProperty(p.securityId);
  if (action === "sale") return selectProperty(p.saleId);
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
  execute(c);
};
$('close-property').onclick=()=>{
  $('property-menu').hidden=true;
};
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && !document.querySelector('dialog[open]')) $('property-menu').hidden=true;
});
$("speed").onchange = (e) =>
  execute({ type: "speed", speed: Number(e.target.value) });
$("pending").onclick = () => {
  syncClock();
  state = resolvePending(state);
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
    status('Nova campanha iniciada. Progresso anterior apagado.');
  } finally {resettingCampaign=false;lastReal=Date.now();}
}});
$('reset-campaign').onclick=()=>resetDialog.open();
$("save").onclick = async () => { syncClock(); if(await persist(true)) status("Jogo salvo no perfil "+activeProfile.name+"."); };
try {
  state = await load(activeProfile.id);
  if(cloud.enabled()){try{const remote=await cloud.load(activeProfile);if(remote && (!state || remote.savedAt>state.savedAt))state=remote;}catch(e){$("cloud-state").textContent="Nuvem indisponível · progresso local";$("cloud-state").title=e.message;}}
  if(state && state.resetRevision !== reset.revision) {
    state=freshCampaign();
    await save(state);
  }
  if (state) {
    status("Campanha carregada. O tempo ficou pausado enquanto você estava fora.");
  } else {
    state = freshCampaign();
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
$("ranking").onclick=async()=>{await persist(true);ranking.open();};
for(const link of [$("home-logo"),$("portfolio-avatar")])link.onclick=async e=>{
  e.preventDefault();const destination=e.currentTarget.href;syncClock();
  clockPaused=true;
  if(await persist(true))window.location.assign(destination);
  else {lastReal=Date.now();clockPaused=document.hidden;}
};
await persist();
document.querySelector('#app').inert=false;
lastReal = Date.now();
$("reset-campaign").disabled=false;
renderPanel();
refresh();
const Scene = mapScene({
  assets,
  getMap: () => current,
  getState: () => state,
  getSelected: () => selected,
  onSelect: selectProperty,
  onCollect: collect,
  onReady: (s) => (scene = s),
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
