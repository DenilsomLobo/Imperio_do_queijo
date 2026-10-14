import Phaser from "phaser";
import "./style.css";
import "./game.css";
import "./theme.css";
import './campaign.css';
import regions from "./data/regions.json";
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
import {finalPurchaseAllowed, territoryControl} from './domain/campaign.js';

const files = import.meta.glob("../assets/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const assets = Object.fromEntries(
  Object.entries(files).map(([p, url]) => [p.split("/").pop(), url]),
);
const maps = Object.fromEntries(
  regions.map((r) => [
    r.id,
    r.id === "rural"
      ? ruralMap
      : { version: 1, id: r.id, background: r.background, slots: [] },
  ]),
);
let state,
  scene,
  current = ruralMap,
  selected = "farm-ze",
  lastReal = Date.now(),
  lastSave = 0,
  saveChain = Promise.resolve(),
  storageFailed = false;
const $ = (id) => document.getElementById(id);
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
document.querySelector("#app").innerHTML =
  `<header><div class="brand"><strong>IMPÉRIO DO QUEIJO</strong><span>Queijópolis · gestão e conquista</span></div><div id="hud"></div><label class="speed">Velocidade <select id="speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label><button id="catalogue">Catálogo</button></header><section id="management-bar" aria-label="Gestão da empresa"></section><main><nav id="regions"><div class="nav-title">ZONAS</div><div class="map-tools"><button id="overview">Ver todo o mapa</button><div><button id="zoom-in" aria-label="Aproximar">＋</button><button id="zoom-out" aria-label="Afastar">−</button></div></div></nav><section id="map"></section><aside><div class="panel-eyebrow">PROPRIEDADE SELECIONADA</div><h2 id="title">Zona rural</h2><p id="intro">Clique nas construções para gerenciar. Os círculos em frente às lojas mostram quem controla cada ponto.</p><div id="panel"></div><p id="status" role="status">Carregando campanha…</p><button id="save">Salvar agora</button><button id="pending" hidden>Resolver incidentes pendentes</button><details><summary>Relatórios e finanças</summary><div id="reports"></div></details></aside></main><footer>Arraste para explorar · roda do mouse para zoom · ícones dourados coletam recursos.</footer><dialog id="management-dialog"><div class="dialog-heading"><div><small>GESTÃO DO IMPÉRIO</small><h2 id="management-title"></h2></div><button data-close aria-label="Fechar gestão">✕</button></div><div id="management-content"></div></dialog>`;
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
    ? `${p.id}|${p.owner}|${p.team?.id ?? ""}|${owned("sale")
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
function select(id, label, list) {
  return `<label>${label}<select id="${id}">${options(list)}</select></label>`;
}
function stats() {
  const p = currentProperty();
  if (!p) return "";
  let html = `<p><b>Controle:</b> ${escape(ownerName(p))}</p>`;
  if (p.type === "farm")
    html += `<p>Leite acumulado: <b>${amount(total(p.milk))} / ${rules.milkCapacity} L</b><br>Ração: ${amount(p.feed)}<br>Vacas: ${total(p.cows)} / ${rules.farmCapacities[p.level - 1]}<br>Produção: ${amount(Object.entries(p.cows).reduce((n, [k, c]) => n + c * rules.cows[k].milk, 0))} L/dia ${p.feed <= 0 ? "· sem ração" : ""}</p>`;
  if (p.type === "factory")
    html += `<p>Leite armazenado: <b>${amount(total(p.milk))} / ${rules.factoryMilkCapacity} L</b><br>Embalagens: ${p.packaging}<br>Queijo pronto: <b>${total(p.ready)} / ${rules.cheeseCapacity}</b></p>${p.batches.map((b) => `<p>${rules.recipes[b.recipe].name} (${b.quality}) · ${b.phase === "production" ? "Fabricação" : "Maturação"} · ${Math.max(0, Math.ceil((b.due - state.time) / 1000))} s restantes</p>`).join("")}`;
  if (p.type === "sale")
    html += `<p>Estoque: <b>${total(p.stock)} / ${rules.shopCapacity} queijos</b><br>Saldo para coleta: <b>${money(p.till)}</b><br>Vendas finais: ${p.sales}<br>Demanda restante hoje: ${p.demandRemaining}<br>Vendedor: ${p.seller ? (p.sellerActive ? "ativo" : "salário em atraso") : "não contratado"}</p>`;
  if (p.type === "security") {
    const t = p.team;
    html += `<p>Barricadas: ${p.barricade}/3<br>${t ? `Equipe: ${t.count} capangas · nível ${t.stars}<br>Armamento: ${t.weapon}/3 · Moral: ${Math.round(t.moral * 100)}%<br>${attackStrength(t, state.time) > 0 ? "Disponível" : `Indisponível · ${Math.max(0, Math.ceil((Math.max(t.busyUntil, t.recoverUntil) - state.time) / 1000))} s`}<br>Cooldown: ${Math.max(0, Math.ceil((t.cooldownUntil - state.time) / 1000))} s` : "Posto sem equipe"}</p>`;
  }
  return html;
}
function renderPanel() {
  const p = currentProperty();
  const slot = ruralMap.slots.find((s) => s.id === selected);
  $("panel").innerHTML = "";
  if (!p || current.id !== "rural") {
    return;
  }
  $("title").textContent = slot?.name ?? p.id;
  let actions = "";
  if (["farm", "factory"].includes(p.type) && (p.owner === "neutral" || finalPurchaseAllowed(state,p.id,'player')))
    actions += button(
      "buyProperty",
      `Comprar ${p.type === "farm" ? "fazenda" : "fábrica"} · ${money(rules.propertyPrices[p.type] * p.level)}`,
    );
  if (p.type === "service") {
    const service = slot.service;
    if (service === "bank")
      actions +=
        "<p>Acompanhe o caixa da empresa, faturamento, gastos e saldos das lojas.</p>" +
        button("finance", "Abrir gestão financeira");
    if (service === "employees")
      actions +=
        select("service-target", "Ponto de venda", owned("sale")) +
        button(
          "hireAtShop",
          `Contratar vendedor · ${money(rules.sellerHire)}`,
        ) +
        button("openServiceTarget", "Gerenciar ponto de venda");
    if (service === "security")
      actions +=
        select("service-target", "Posto de segurança", owned("security")) +
        `<label>Nível da equipe<select id="team-tier">${[1,2,3].map(level=>`<option value="${level}">Nível ${level} · ${money(rules.teamHire+rules.starUpgrade.slice(1,level).reduce((n,v)=>n+v,0))}</option>`).join('')}</select></label>` +
        button("hireAtPost", "Comprar equipe selecionada") +
        button("openServiceTarget", "Gerenciar defesa e ataque");
    if (service === "cows")
      actions +=
        select("service-target", "Fazenda de destino", owned("farm")) +
        `<label>Espécie<select id="service-species">${Object.entries(rules.cows)
          .map(
            ([id, c]) =>
              `<option value="${id}">${c.name} · ${money(c.price)}</option>`,
          )
          .join("")}</select></label>` +
        button("buyAtCowShop", "Comprar e alocar vaca") +
        `<div class="special-cows"><img src="${assets["vaca_radioativa.png"]}" alt="Vaca Radioativa"><img src="${assets["vaca_magica.png"]}" alt="Vaca Mágica"><span>Radioativa e Mágica: exigem pesquisa.</span></div>`;
    if (service === "logistics")
      actions +=
        select("service-source", "Fábrica de origem", owned("factory")) +
        select("service-target", "Loja de destino", owned("sale")) +
        button("dispatchCheese", "Transferir queijo pronto") +
        "<p>Transferência manual entre propriedades. Veículos e contratos serão integrados à logística.</p>";
  }
  if (p.type === "land")
    actions =
      "<p>Terreno neutro reservado à expansão. Construções serão habilitadas na etapa correspondente.</p>";
  if (p.type === "sale") {
    if (p.owner === "neutral")
      actions += button(
        "buyProperty",
        `Comprar ponto · ${money(rules.propertyPrice)}`,
      );
    actions += button("control", "Ver círculo de controle");
  }
  if (p.owner === "player") {
    if (p.type === "farm") {
      actions +=
        select("factory-target", "Fábrica de destino", owned("factory")) +
        button("collectMilk", "Coletar todo o leite possível") +
        button(
          "buyFeed",
          `Comprar 10 rações · ${money(rules.feedPrice * 10)}`,
        ) +
        `<label>Comprar e alocar vaca<select id="cow-species">${Object.entries(
          rules.cows,
        )
          .map(
            ([k, c]) =>
              `<option value="${k}">${c.name} · ${money(c.price)}</option>`,
          )
          .join("")}</select></label>` +
        button("buyCow", "Comprar vaca");
    }
    if (p.type === "factory") {
      actions +=
        `<label>Receita<select id="recipe">${Object.entries(rules.recipes)
          .map(
            ([k, r]) =>
              `<option value="${k}">${r.name} · ${r.milk} L · ${r.time / 60000} min</option>`,
          )
          .join(
            "",
          )}</select></label><label>Qualidade do leite<select id="quality"><option value="weak">Fraco</option><option value="common">Comum</option><option value="noble">Nobre</option></select></label>` +
        button("produce", "Iniciar lote · 1 embalagem") +
        button(
          "buyPackaging",
          `Comprar 10 embalagens · ${money(rules.packagingPrice * 10)}`,
        ) +
        select("shop-target", "Loja de destino", owned("sale")) +
        button("collectCheese", "Levar todo o queijo pronto possível");
    }
    if (p.type === "sale")
      actions +=
        button("collectCash", "Coletar saldo da loja") +
        (!p.seller
          ? button(
              "hireSeller",
              `Contratar vendedor · ${money(rules.sellerHire)} + ${money(rules.sellerSalary)}/dia`,
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
            ) +
            button(
              "upgradeWeapon",
              `Armamento +1 · ${money(rules.weaponUpgrade)}`,
              p.team.weapon === 3 ? "disabled" : "",
            )) +
        button(
          "upgradeBarricade",
          `Barricadas +1 · ${money(rules.barricadeUpgrade)}`,
          p.barricade === 3 ? "disabled" : "",
        );
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
            estimate(state, p.id, t.id).distance <= rules.range,
        );
        if (targets.length)
          actions +=
            select("attack-target", "Postos inimigos próximos", targets) +
            `<p id="estimate"></p>` +
            button("attack", "Confirmar ataque");
        else
          actions +=
            "<p>Não há inimigos no alcance deste posto. Compre pontos mais próximos e realoque a equipe.</p>";
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
  $("panel").innerHTML =
    `<div id="property-stats">${stats()}</div><div class="actions">${actions}</div>`;
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
  const territory=territoryControl(state,'player');
  let campaignBar=document.getElementById('campaign-status');
  if(!campaignBar) {
    campaignBar=document.createElement('div');campaignBar.id='campaign-status';
    $('management-bar').after(campaignBar);
  }
  campaignBar.textContent=state.campaign?.outcome==='victory' ? 'VITÓRIA — todos os pontos controlados e fazenda/fábrica inimigas adquiridas. Campanha encerrada.'
    :state.campaign?.outcome==='defeat' ? 'DERROTA — o rival controlou todos os pontos e comprou sua fazenda. Campanha encerrada.'
    :`${territory.owned}/${territory.total} pontos de venda controlados · ${territory.owned===territory.total ? 'Fazenda e fábrica inimigas liberadas para compra: adquira ambas para vencer.' : 'Controle todos os pontos para liberar a compra da fazenda e fábrica inimigas.'}`;
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
  if ($("property-stats")) $("property-stats").innerHTML = stats();
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
  renderPanel();
  refresh();
}
function syncClock() {
  const now = Date.now();
  state = advance(state, Math.max(0, now - lastReal) * state.speed);
  lastReal = now;
}
async function persist() {
  if (storageFailed) return;
  state.savedAt = Date.now();
  const snapshot = structuredClone(state);
  saveChain = saveChain.catch(() => {}).then(() => save(snapshot));
  try {
    await saveChain;
    $("save").textContent = "Salvo localmente";
  } catch (e) {
    status(`Falha ao salvar: ${e.message}`);
  }
}
function execute(c) {
  try {
    syncClock();
    state = command(state, c);
    renderPanel();
    refresh();
    status("Ação concluída. Estoques e estado atualizados.");
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
    execute({ type: "collectCheese", id, target: $("shop-target")?.value });
  if (p.type === "sale") execute({ type: "collectCash", id });
}
$("panel").onclick = (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  const p = currentProperty();
  if(action === 'hireTeam') {
    selectProperty('security-agency');
    $('service-target').value=p.id;
    return;
  }
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
    return;
  }
  if (action === "buyAtCowShop")
    return execute({
      type: "buyCow",
      id: $("service-target").value,
      species: $("service-species").value,
    });
  if (action === "dispatchCheese")
    return execute({
      type: "collectCheese",
      id: $("service-source").value,
      target: $("service-target").value,
    });
  if (action === "control") return selectProperty(p.securityId);
  if (action === "sale") return selectProperty(p.saleId);
  const c = { type: action, id: selected };
  if (action === "deployReserve") c.teamId = $("reserve-team").value;
  if (action === "collectMilk") c.target = $("factory-target").value;
  if (action === "collectCheese") c.target = $("shop-target").value;
  if (action === "buyFeed" || action === "buyPackaging") c.quantity = 10;
  if (action === "buyCow") c.species = $("cow-species").value;
  if (action === "produce") {
    c.recipe = $("recipe").value;
    c.quality = $("quality").value;
  }
  if (action === "attack") c.target = $("attack-target").value;
  if (action === "moveTeam") c.target = $("move-target").value;
  execute(c);
};
$("speed").onchange = (e) =>
  execute({ type: "speed", speed: Number(e.target.value) });
$("save").onclick = () => {
  syncClock();
  persist();
};
$("pending").onclick = () => {
  syncClock();
  state = resolvePending(state);
  renderPanel();
  refresh();
  persist();
};

$("catalogue").onclick = () => dashboard.showCatalogue();
$("overview").onclick = () => scene?.fit();
$("zoom-in").onclick = () => scene?.zoomBy(1.2);
$("zoom-out").onclick = () => scene?.zoomBy(1 / 1.2);
const shortcuts = document.createElement("div");
shortcuts.className = "zone-shortcuts";
for (const [label, id] of [
  ["Centro", "bank-rural"],
  ["Fazendas", "farm-ze"],
  ["Fronteira norte", "factory-coalho"],
]) {
  const button = document.createElement("button");
  button.textContent = label;
  button.onclick = () => scene?.focus(id);
  shortcuts.append(button);
}
$("regions").append(shortcuts);
regions
  .filter((r) => r.id === "rural")
  .forEach((r) => {
    const b = document.createElement("button");
    b.textContent = r.name;
    b.classList.add("zone-active");
    b.onclick = () => {
      current = maps[r.id];
      selected = r.id === "rural" ? "farm-ze" : null;
      $("title").textContent = r.name;
      $("intro").textContent =
        r.id === "rural"
          ? "Clique em propriedades e ícones de coleta. Os círculos representam o controle de cada loja."
          : "Distrito em preparação: o cadastro e a campanha desta região ainda não foram implementados.";
      renderPanel();
      scene?.show();
    };
    $("regions").append(b);
  });
try {
  state = await load();
  if(state?.resetRevision !== reset.revision) {
    state=createGame();
    await save(state);
  }
  if (state) {
    state = advance(state, Math.max(0, Date.now() - state.savedAt), {
      offline: true,
    });
    status("Campanha local carregada. Progresso offline calculado em 1×.");
  } else {
    state = createGame();
    status(
      "Comece levando os 5 queijos iniciais da fábrica à barraquinha. Compre ração para produzir leite.",
    );
  }
} catch (e) {
  state = createGame();
  storageFailed = true;
  status(
    `Não foi possível carregar o salvamento: ${e.message}. A sessão atual não substituirá o arquivo anterior.`,
  );
}
lastReal = Date.now();
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
  syncClock();
  refresh();
  if (Date.now() - lastSave > 15000) {
    lastSave = Date.now();
    persist();
  }
}, 1000);
document.addEventListener("visibilitychange", () => {
  syncClock();
  persist();
});
