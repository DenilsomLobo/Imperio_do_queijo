import {cheeseStockCards} from "./cheese-stock.js";
import {logisticsInfo} from "./logistics.js";
import {menuIcons} from "../data/assets.js";
import {bankInfo} from "./banking.js";
import {workerCards} from "./staff.js";
import { herdCards } from "./herd.js";
import { management } from "../domain/management.js";
import { total } from "../domain/game.js";
import { ruralMap } from "../data/world.js";

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
const categories = [
  ["properties", "Propriedades", "fazenda_nivel_1.png"],
  ["employees", "Funcionários", "agencia_funcionario_nivel_1.png"],
  ["milk", "Estoque de leite", "icon_leite.png"],
  ["cheese", "Estoque de queijo", "icon_queijo.png"],
  ["cows", "Vacas", "vaca_mimosa.png"],
  ["revenue", "Vendas", "Ponto_de_venda_aliado.png"],
  ["cash", "Dinheiro", "banco_nivel_1.png"],
  ["enemies", "Inimigos", "bandeira_capanga_inimiga.png"],
];
export function managementUI({ getState, assets, onProperty }) {
  const bar = document.querySelector("#management-bar");
  const dialog = document.querySelector("#management-dialog");
  bar.innerHTML = '<div class="sector-heading"><span>CENTRAL DE GESTÃO</span><small>Escolha um setor para administrar</small></div><div class="sector-grid">'+categories.map(([id,label])=>
    '<button type="button" class="metric sector-card" data-manage="'+id+'" aria-haspopup="dialog" aria-controls="management-dialog" aria-expanded="false"><span class="sector-art"><img src="'+menuIcons[id]+'" alt="" width="64" height="64"></span><span class="sector-label">'+label+'</span><strong data-metric="'+id+'">—</strong><span class="sector-open" aria-hidden="true">↗</span></button>'
  ).join('')+'</div>';
  let active = null;
  const row = (p, detail) =>
    `<button class="management-row" data-property="${p.id}"><span>${safe(title(p.id))}</span><strong>${detail}</strong><span class="row-arrow">↗</span></button>`;
  function content(id) {
    const s = getState(),
      m = management(s),
      own = Object.values(s.properties).filter((p) => p.owner === "player");
    if (id === "properties")
      return (
        `<p>${m.properties} propriedades da sua empresa. Círculos de controle e serviços públicos são contabilizados separadamente.</p>` +
        own
          .filter((p) => ["farm", "factory", "sale"].includes(p.type))
          .map((p) => row(p, `Nível ${p.level}`))
          .join("") +
        '<h3>Leilões em andamento</h3>' + Object.keys(s.auctions ?? {}).map(id=>row(s.properties[id],'Disputa · ver lance')).join('')
      );
    if (id === "employees")
      return (
        `<div class="summary-pills"><span>${m.factoryWorkers} funcionários de fábrica</span><span>${m.sellers} vendedores</span><span>${m.guards} capangas</span></div>` +
        own.filter(p=>p.type==="factory").map(p=>row(p,`${(p.workers ?? []).length} funcionários`)+workerCards(p,assets)).join("") +
        own
          .filter(
            (p) =>
              (p.type === "sale" && p.seller) ||
              (p.type === "security" && p.team),
          )
          .map((p) =>
            row(
              p,
              p.team
                ? `${p.team.count} capangas · nível ${p.team.stars}`
                : `Vendedor ${p.sellerActive ? "ativo" : "em atraso"}`,
            ),
          )
          .join("") +
        `<p>Equipes em reserva: ${(s.companies.player.reserveTeams ?? []).length}. Contrate vendedores na agência e equipes na agência de capangas.</p>`
      );
    if (id === "milk")
      return (
        `<p>${number(m.milk)} litros armazenados, separados por origem e qualidade.</p>` +
        own
          .filter((p) => p.milk)
          .map((p) => row(p, `${number(total(p.milk))} L`))
          .join("")
      );
    if (id === "cheese")
      return (
        `<p>${number(m.cheese)} queijos prontos em fábricas e lojas; ${m.making} lotes em fabricação ou maturação.</p>` +
        own
          .filter((p) => p.ready || p.stock)
          .map((p) => '<section class="cheese-property-stock">'+row(p, `${total(p.ready ?? p.stock)} unidades`)+cheeseStockCards(p.ready ?? p.stock,assets)+'</section>')
          .join("")
      );
    if (id === "cows")
      return (
        `<p>${m.cows} vacas alocadas nas suas fazendas.</p>` +
        own
          .filter((p) => p.cows)
          .map((p) => `<section class="farm-herd">${row(p, `${total(p.cows)} vaca(s)`)}${herdCards(p,assets)}</section>`)
          .join("") +
        `<button class="management-row" data-property="cow-shop">Visitar loja de vacas ↗</button>`
      );
    if (id === "revenue")
      return (
        `<div class="summary-pills"><span>${m.sold} queijos vendidos</span><span>${cash(m.revenue)} faturados</span></div>` +
        own
          .filter((p) => p.type === "sale")
          .map((p) => row(p, `${p.sales} vendas · ${cash(p.till)} a coletar`))
          .join("")
      );
    if (id === "cash")
      return (
        bankInfo(s) + logisticsInfo(s) +
        ruralMap.slots.filter(p=>p.service==="logistics").map(p=>row(p,"Transporte automático")).join("") +
        ruralMap.slots.filter(p=>p.service==="bank").map(p=>row(p,`Nível ${p.level}`)).join("") +
        `<div class="finance-total">${cash(m.cash)}</div><p>Caixa disponível. Há ${cash(m.till)} acumulados nas lojas para coleta.</p><div class="summary-pills"><span>Receitas ${cash(m.revenue)}</span><span>Gastos ${cash(s.companies.player.expenses)}</span></div>` +
        own
          .filter((p) => p.type === "sale" && p.till > 0)
          .map((p) => row(p, `Coletar ${cash(p.till)}`))
          .join("")
      );
    if (id === "enemies")
      return Object.entries(s.companies)
        .filter(([id]) => id !== "player")
        .map(([id, c]) => {
          const enemy = management(s, id);
          return (
            `<article class="enemy-card"><img src="${assets["capangas_inimigos_nivel_2.png"]}" alt="Capangas inimigos"><div><h3>${safe(c.name)}</h3><p>${enemy.properties} propriedades · ${enemy.guards} capangas<br>${enemy.cows} vacas · ${cash(c.cash)} de caixa</p></div></article>` +
            Object.values(s.properties)
              .filter((p) => p.owner === id && ["sale","farm","factory","service"].includes(p.type))
              .map((p) => row(p, "Controle inimigo"))
              .join("")
          );
        })
        .join("");
    return "";
  }
  function syncSelection() {
    bar.querySelectorAll('[data-manage]').forEach(button=>{
      const selected=dialog.open&&button.dataset.manage===active;
      button.classList.toggle('is-active',selected);
      button.setAttribute('aria-expanded',String(selected));
    });
  }
  function show(id) {
    active = id;
    document.querySelector("#management-title").textContent =
      categories.find((c) => c[0] === id)?.[1] ?? "Gestão do Império";
    document.querySelector("#management-content").innerHTML = content(id);
    const headingImage=document.querySelector("#management-sector-image");
    headingImage.hidden=!menuIcons[id];
    if(menuIcons[id]) headingImage.src=menuIcons[id];
    if (!dialog.open) dialog.showModal();
    syncSelection();
  }
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
  dialog.querySelector("[data-close]").onclick = () => {
    dialog.close();
    active = null;
  };
  dialog.addEventListener("cancel", () => (active = null));
  dialog.onclick = (e) => {
    const id = e.target.closest("[data-property]")?.dataset.property;
    if (id) {
      dialog.close();
      active = null;
      onProperty(id);
    } else if (e.target === dialog) {
      dialog.close();
      active = null;
    }
  };
  return {
        show,
    refresh() {
      const m = management(getState());
      for (const [id] of categories) {
        const value =
          id === "cash" || id === "revenue"
            ? cash(m[id])
            : id === "milk"
              ? `${number(m[id])} L`
              : id === "enemies"
                ? `${m[id]} empresa(s)`
                : number(m[id]);
        const node = bar.querySelector(`[data-metric="${id}"]`);
        node.textContent = value;
        const button=node.closest("button");
        button.title=categories.find(c=>c[0]===id)[1]+": "+value;
        button.setAttribute("aria-label",categories.find(c=>c[0]===id)[1]+": "+value+". Abrir gestão.");
      }
      if (dialog.open)
        document.querySelector("#management-content").innerHTML =
          content(active);
    },
  };
}
