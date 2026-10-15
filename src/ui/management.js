import {financeManagement} from './finances.js';
import {enemyManagement} from './enemies.js';
import {employeeCards,cowManagementCards,shopManagementCards,productionCards} from './owned-resources.js';
import {inventoryRows} from './inventory.js';
import {buildingCards} from './buildings.js';
import {sharedShopStock,salePrice,shopBonus} from '../domain/shop-stock.js';
import {cheeseStockCards} from "./cheese-stock.js";

import {menuIcons} from "../data/assets.js";



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
  ["milk", "Estoque", "icon_leite.png"],
  ["cheese", "Estoque de queijo", "icon_queijo.png"],
  ["cows", "Vacas", "vaca_mimosa.png"],
  ["revenue", "Pontos de venda", "Ponto_de_venda_aliado.png"],
  ["cash", "Finanças", "banco_nivel_1.png"],
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
    if (id === "properties") return '<p>Somente suas propriedades e contratos adquiridos. Clique para visitar no mapa.</p>'+buildingCards(s,assets);
    if (id === "employees") return `<p>${m.factoryWorkers} funcionários de fábrica · ${m.sellers} vendedores · ${m.guards} capangas. Preços atuais de contratação e salários diários.</p>`+employeeCards(s,assets);
    if (id === "milk") return inventoryRows(s,assets);
    if (id === "cheese") return productionCards(s,assets)+'<p>'+m.cheese+' queijos prontos; '+m.making+' lotes em produção. Bônus das lojas: +'+Math.round(shopBonus(s)*100)+'%.</p><h3>Compartilhado entre todas as lojas</h3>'+cheeseStockCards(sharedShopStock(s),assets,id=>salePrice(s,'player',id))+own.filter(p=>p.type==='factory').map(p=>'<section class="cheese-property-stock">'+row(p,total(p.ready)+' unidades na fábrica')+cheeseStockCards(p.ready,assets,id=>salePrice(s,'player',id))+'</section>').join('');
    if (id === "cows") return `<p>${m.cows} vacas adquiridas, agrupadas por espécie e fazenda.</p>`+cowManagementCards(s,assets);
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
            ? cash(id === "revenue" ? m.dailySales : m[id])
            : id === "milk"
              ? `${number(m.milk)} L · ${number(m.cheese)} queijos`
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
