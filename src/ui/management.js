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
const name = (file) => file.replace(".png", "").replaceAll("_", " ");
const categories = [
  ["properties", "Propriedades", "fazenda_nivel_1.png"],
  ["employees", "Funcionários", "agencia_funcionario_nivel_1.png"],
  ["milk", "Estoque de leite", "leite_comum.png"],
  ["cheese", "Estoque de queijo", "queijo_comum.png"],
  ["cows", "Vacas", "vaca_mimosa.png"],
  ["revenue", "Vendas", "Ponto_de_venda_aliado.png"],
  ["cash", "Dinheiro", "banco_nivel_1.png"],
  ["enemies", "Inimigos", "bandeira_capanga_inimiga.png"],
];
export function managementUI({ getState, assets, onProperty }) {
  const bar = document.querySelector("#management-bar");
  const dialog = document.querySelector("#management-dialog");
  bar.innerHTML = categories
    .map(
      ([id, label, asset]) =>
        `<button class="metric" data-manage="${id}"><img src="${assets[asset]}" alt=""><span>${label}<strong data-metric="${id}">—</strong></span></button>`,
    )
    .join("");
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
          .join("")
      );
    if (id === "employees")
      return (
        `<div class="summary-pills"><span>${m.sellers} vendedores</span><span>${m.guards} capangas</span></div>` +
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
          .map((p) => row(p, `${total(p.ready ?? p.stock)} unidades`))
          .join("")
      );
    if (id === "cows")
      return (
        `<p>${m.cows} vacas alocadas nas suas fazendas.</p>` +
        own
          .filter((p) => p.cows)
          .map((p) => row(p, `${total(p.cows)} vaca(s)`))
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
              .filter((p) => p.owner === id && p.type === "sale")
              .map((p) => row(p, "Controle inimigo"))
              .join("")
          );
        })
        .join("");
    if (id === "catalogue")
      return `<p>Artes, construções, variedades e equipamentos disponíveis no projeto. As espécies radioativa e mágica dependem de pesquisa; não são concedidas pela galeria.</p><div class="catalogue-grid">${Object.entries(
        assets,
      )
        .map(
          ([file, url]) =>
            `<article><img src="${url}" alt="${safe(name(file))}" loading="lazy"><span>${safe(name(file))}</span></article>`,
        )
        .join("")}</div>`;
    return "";
  }
  function show(id) {
    active = id;
    document.querySelector("#management-title").textContent =
      categories.find((c) => c[0] === id)?.[1] ?? "Catálogo do Império";
    document.querySelector("#management-content").innerHTML = content(id);
    if (!dialog.open) dialog.showModal();
  }
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
    showCatalogue: () => show("catalogue"),
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
        node.closest("button").title = value;
      }
      if (dialog.open && active !== "catalogue")
        document.querySelector("#management-content").innerHTML =
          content(active);
    },
  };
}
