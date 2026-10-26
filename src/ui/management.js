import {financeManagement} from './finances.js';
import {enemyManagement} from './enemies.js';
import {employeeCards,cowManagementCards,shopManagementCards,productionCards} from './owned-resources.js';
import {inventoryRows} from './inventory.js';
import {buildingCards} from './buildings.js';
import {sharedShopStock,salePrice,shopBonus,shopIsActive} from '../domain/shop-stock.js';
import {cheeseStockCards} from "./cheese-stock.js";
import {closeDialog} from './help.js';
import {menuIcons} from "../data/assets.js";
import { management } from "../domain/management.js";
import { dominanceProgress } from '../domain/campaign.js';
import { total } from "../domain/game.js";
import { ruralMap } from "../data/world.js";
import { rules, DAY } from "../data/game-rules.js";

const cash = (n) =>
  (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const number = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const safe = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const title = (id) => ruralMap.slots.find((p) => p.id === id)?.name ?? id;
// Finanças primeiro: o caixa é o número mais consultado em um jogo de gestão.
const categories = [
  ["cash", "Finanças", "Caixa disponível e resultado de hoje (receitas menos despesas)."],
  ["properties", "Propriedades", "Fazendas, queijarias, lojas e contratos da empresa."],
  ["employees", "Funcionários", "Funcionários de fábrica, vendedores e capangas."],
  ["milk", "Estoque", "Leite, ração, embalagens e queijos guardados."],
  ["cheese", "Estoque de queijo", "Queijos prontos e lotes em produção."],
  ["cows", "Vacas", "Rebanho por espécie e fazenda."],
  ["revenue", "Pontos de venda", "Vendas de hoje nas suas lojas."],
  ["enemies", "Inimigos", "Rival, territórios e progresso da campanha."],
];
// Alertas por setor: o que precisa de atenção aparece como um selo no cartão.
function alerts(s) {
  const own = Object.values(s.properties).filter((p) => p.owner === 'player');
  const late = own.some((p) => (p.workers ?? []).some((w) => w.missedWages) || p.team?.missedWages);
  const hungry = own.some((p) => p.type === 'farm' && total(p.cows) > 0 && p.feed <= 0);
  const noPack = own.some((p) => p.type === 'factory' && p.packaging < 1 && total(p.milk) >= 1 && !(p.workers ?? []).length);
  const noSeller = own.some((p) => p.type === 'sale' && !shopIsActive(p));
  const attacked = s.missions.some((m) => m.defender === 'player');
  const debt = own.some((p) => p.maintenanceDebt > 0);
  return {
    cash: s.insolventSince != null ? ['bad', 'Falência iminente!'] : debt ? ['warn', 'Há manutenção pendente.'] : null,
    employees: late ? ['bad', 'Salários atrasados.'] : null,
    milk: hungry ? ['warn', 'Fazenda sem ração.'] : noPack ? ['warn', 'Fábrica sem embalagens.'] : null,
    revenue: noSeller ? ['warn', 'Loja sem vendedor ativo.'] : null,
    enemies: attacked ? ['bad', 'Ataque inimigo a caminho!'] : null,
  };
}
export function managementUI({ getState, assets, onProperty, sfx, onShow }) {
  const bar = document.querySelector("#management-bar");
  const dialog = document.querySelector("#management-dialog");
  bar.innerHTML = '<div class="sector-heading"><span>CENTRAL DE GESTÃO</span><small>Escolha um setor para administrar</small></div><div class="sector-grid">'+categories.map(([id,label,tip])=>
    '<button type="button" class="metric sector-card" data-manage="'+id+'" data-tip="'+safe(tip)+'" aria-haspopup="dialog" aria-controls="management-dialog" aria-expanded="false"><span class="sector-art"><img src="'+menuIcons[id]+'" alt="" width="64" height="64"></span><span class="sector-label">'+label+'</span><strong data-metric="'+id+'">—</strong><small class="sector-sub" data-sub="'+id+'"></small><span class="sector-badge" data-badge="'+id+'" hidden>!</span><span class="sector-open" aria-hidden="true">↗</span></button>'
  ).join('')+'</div>';
  let active = null;
  const row = (p, detail) =>
    `<button class="management-row" data-property="${p.id}"><span>${safe(title(p.id))}</span><strong>${detail}</strong><span class="row-arrow">↗</span></button>`;
  function content(id) {
    const s = getState(),
      m = management(s),
      own = Object.values(s.properties).filter((p) => p.owner === "player");
    if (id === "properties") return '<p class="dialog-lede">Suas propriedades e contratos. Toque para visitar no mapa.</p>'+buildingCards(s,assets);
    if (id === "employees") return `<div class="summary-pills"><span>${m.factoryWorkers} funcionário(s) de fábrica</span><span>${m.sellers} vendedor(es)</span><span>${m.guards} capanga(s)</span></div>`+employeeCards(s,assets);
    if (id === "milk") return inventoryRows(s,assets);
    if (id === "cheese") return productionCards(s,assets)+`<div class="summary-pills"><span>${m.cheese} queijo(s) prontos</span><span>${m.making} lote(s) em produção</span><span>Bônus das lojas: +${Math.round(shopBonus(s)*100)}%</span></div><h3>Compartilhado entre todas as lojas</h3>`+cheeseStockCards(sharedShopStock(s),assets,id=>salePrice(s,'player',id))+own.filter(p=>p.type==='factory').map(p=>'<section class="cheese-property-stock">'+row(p,total(p.ready)+' unidades na fábrica')+cheeseStockCards(p.ready,assets,id=>salePrice(s,'player',id))+'</section>').join('');
    if (id === "cows") return cowManagementCards(s,assets);
    if (id === "revenue") return shopManagementCards(s,assets);
    if (id === "cash") return financeManagement(s);
    if (id === "enemies") return enemyManagement(s,assets);
    return "";
  }
  function syncSelection() {
    bar.querySelectorAll('[data-manage]').forEach(button=>{
      const selected=dialog.open&&button.dataset.manage===active;
      button.classList.toggle('is-active',selected);
      button.setAttribute('aria-expanded',String(selected));
    });
  }
  // Mantém abertos os blocos que o jogador expandiu durante a atualização automática.
  function renderContent() {
    const box = document.querySelector("#management-content");
    const open = new Set([...box.querySelectorAll('details[open]')].map((d) => d.dataset.keep ?? d.className));
    box.innerHTML = content(active);
    box.querySelectorAll('details').forEach((d) => { if (open.has(d.dataset.keep ?? d.className)) d.open = true; });
  }
  function show(id) {
    const switching = dialog.open && active !== id;
    active = id;
    document.querySelector("#management-title").textContent =
      categories.find((c) => c[0] === id)?.[1] ?? "Gestão do Império";
    document.querySelector("#management-content").innerHTML = content(id);
    const headingImage=document.querySelector("#management-sector-image");
    headingImage.hidden=!menuIcons[id];
    if(menuIcons[id]) headingImage.src=menuIcons[id];
    if (!dialog.open) { dialog.classList.remove('is-closing'); dialog.showModal(); sfx?.play('open'); }
    else if (switching) sfx?.play('tick');
    dialog.scrollTop = 0;
    syncSelection();
    onShow?.(id);
  }
  const close = () => { closeDialog(dialog, sfx); active = null; };
  bar.onkeydown=e=>{
    const buttons=[...bar.querySelectorAll('[data-manage]')],index=buttons.indexOf(document.activeElement);
    if(index<0) return;
    let next;
    if(e.key==='ArrowRight') next=(index+1)%buttons.length;
    if(e.key==='ArrowLeft') next=(index+buttons.length-1)%buttons.length;
    if(e.key==='Home') next=0;
    if(e.key==='End') next=buttons.length-1;
    if(next!==undefined){e.preventDefault();buttons[next].focus();}
  };
  dialog.addEventListener('close',()=>{active=null;syncSelection();});
  bar.onclick = (e) => {
    const id = e.target.closest("[data-manage]")?.dataset.manage;
    if (id) show(id);
  };
  dialog.querySelector("[data-close]").onclick = close;
  dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  dialog.onclick = (e) => {
    const id = e.target.closest("[data-property]")?.dataset.property;
    if (id) {
      dialog.close();
      active = null;
      onProperty(id);
    } else if (e.target === dialog) {
      close();
    }
  };
  return {
    show,
    refresh() {
      const s = getState(), m = management(s), warn = alerts(s), company = s.companies.player;
      const today = company.dailyFinance?.day === Math.floor(s.time / DAY) ? company.dailyFinance.revenue - company.dailyFinance.expenses : 0;
      const rival = dominanceProgress(s, 'coalho'), attacks = s.missions.filter((x) => x.defender === 'player').length;
      const shops = Object.values(s.properties).filter((p) => p.owner === 'player' && p.type === 'sale');
      const farms = Object.values(s.properties).filter((p) => p.owner === 'player' && p.type === 'farm');
      const sub = {
        cash: `hoje ${today >= 0 ? '+' : '−'}${cash(Math.abs(today))}`,
        properties: `${shops.length} loja(s) · ${farms.length} fazenda(s)`,
        employees: [[m.factoryWorkers,'fábrica'],[m.sellers,'vendedor(es)'],[m.guards,'capanga(s)']].filter(([n])=>n).map(([n,l])=>`${n} ${l}`).join(' · ') || 'ninguém contratado',
        milk: `${number(m.feed)} ração · ${number(m.packaging)} emb.`,
        cheese: m.making ? `${m.making} em produção` : 'nenhum em produção',
        cows: `${m.cows}/${farms.reduce((n, f) => n + rules.farmCapacities[f.level - 1], 0)} vagas`,
        revenue: `${shops.length} loja(s)`,
        enemies: `${m.enemies} empresa rival`,
      };
      for (const [id, label] of categories) {
        const value =
          id === "cash" || id === "revenue"
            ? cash(id === "revenue" ? m.dailySales : m[id])
            : id === "milk"
              ? `${number(m.milk)} L · ${number(m.cheese)} queijos`
              : id === "enemies"
                ? (attacks ? `${attacks} ataque(s)!` : `Rival ${rival.owned}/${rival.total}`)
                : number(m[id]);
        const node = bar.querySelector(`[data-metric="${id}"]`);
        if (node.textContent !== value) node.textContent = value;
        const subNode = bar.querySelector(`[data-sub="${id}"]`);
        if (subNode.textContent !== sub[id]) subNode.textContent = sub[id];
        subNode.classList.toggle('is-down', id === 'cash' && today < 0);
        const badge = bar.querySelector(`[data-badge="${id}"]`), alert = warn[id];
        badge.hidden = !alert;
        const button=node.closest("button");
        button.classList.toggle('has-alert', Boolean(alert));
        button.dataset.alert = alert?.[0] ?? '';
        button.dataset.tip = categories.find(c=>c[0]===id)[2] + (alert ? ' ' + alert[1] : '');
        button.setAttribute("aria-label",label+": "+value+". "+sub[id]+(alert?'. Atenção: '+alert[1]:'')+". Abrir gestão.");
      }
      if (dialog.open && active) renderContent();
    },
  };
}
