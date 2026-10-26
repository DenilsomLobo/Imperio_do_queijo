// Metas curtas depois do tutorial: guiam a progressão e dão uma medalha visual a cada conquista.
// Não alteram a economia (sem prêmio em dinheiro). O progresso é lido do estado da campanha;
// as medalhas ficam fora do save (chave própria por perfil e campanha).
import { companyShops } from '../domain/shop-stock.js';
import { dominanceProgress } from '../domain/campaign.js';
import { discoveredMilk } from '../data/dairy.js';

const money = (n) => (n / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const safe = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const own = (s) => Object.values(s.properties).filter((p) => p.owner === 'player');
const sum = (stock) => Object.values(stock ?? {}).reduce((n, v) => n + v, 0);

export const GOALS = [
  { id: 'first-sales', title: 'Primeiras vendas', text: 'Fature R$ 200 em vendas', icon: 'icon_money.png', target: 20000, money: true, value: (s) => s.companies.player.revenue },
  { id: 'herd', title: 'Rebanho crescendo', text: 'Tenha 3 vacas', icon: 'vaca_mimosa.png', target: 3, value: (s) => own(s).filter((p) => p.type === 'farm').reduce((n, f) => n + sum(f.cows), 0), place: 'cow-shop' },
  { id: 'second-shop', title: 'Rede de lojas', text: 'Tenha 2 lojas', icon: 'Ponto_de_venda_aliado.png', target: 2, value: (s) => companyShops(s).length, place: 'sale-n4' },
  { id: 'worker', title: 'Fábrica automática', text: 'Contrate 1 funcionário de fábrica', icon: 'funcionario_nivel_1.png', target: 1, value: (s) => own(s).reduce((n, p) => n + (p.workers ?? []).length, 0), place: 'employee-agency' },
  { id: 'guard', title: 'Loja protegida', text: 'Coloque capangas em 1 loja', icon: 'capangas_aliado_nivel_1.png', target: 1, value: (s) => own(s).filter((p) => p.type === 'security' && p.team).length, place: 'security-agency' },
  { id: 'cash', title: 'Caixa forte', text: 'Junte R$ 2.000 no caixa', icon: 'icon_money.png', target: 200000, money: true, value: (s) => s.companies.player.cash },
  { id: 'flavor', title: 'Novo sabor', text: 'Descubra um segundo tipo de leite', icon: 'leite_comum.png', target: 2, value: (s) => discoveredMilk(s).length, place: 'cow-shop' },
  { id: 'four-shops', title: 'Expansão', text: 'Tenha 4 lojas', icon: 'Ponto_de_venda_aliado.png', target: 4, value: (s) => companyShops(s).length },
  { id: 'revenue', title: 'Negócio de verdade', text: 'Fature R$ 5.000 em vendas', icon: 'icon_money.png', target: 500000, money: true, value: (s) => s.companies.player.revenue },
  { id: 'bank', title: 'Cobrança automática', text: 'Contrate um banco', icon: 'banco_nivel_1.png', target: 1, value: (s) => (s.companies.player.bank ? 1 : 0), place: 'bank-rural' },
  { id: 'half', title: 'Meio império', text: 'Domine 12 dos 24 objetivos', icon: 'bandeira_capanga_aliado.png', target: 12, value: (s) => dominanceProgress(s, 'player').owned },
];

export function goalProgress(goal, state) {
  const value = Math.max(0, goal.value(state));
  return { value: Math.min(value, goal.target), done: value >= goal.target, ratio: Math.min(1, value / goal.target) };
}
const show = (goal, v) => (goal.money ? `${money(v)} / ${money(goal.target)}` : `${v} / ${goal.target}`);

export function createGoals({ sfx, assets, feedback, getState, onFocus, read, write, profileId }) {
  const key = 'goals:' + profileId;
  let record = { campaignId: null, done: [] }, loaded = false;
  const save = () => write(key, record).catch(() => {});

  // Medalhas já cumpridas numa campanha em andamento são registradas sem festa.
  async function load(state) {
    try { const saved = await read(key); if (saved?.campaignId) record = { campaignId: saved.campaignId, done: Array.isArray(saved.done) ? saved.done : [] }; } catch { /* sem registro */ }
    if (record.campaignId !== state.campaignId) {
      record = { campaignId: state.campaignId, done: GOALS.filter((g) => goalProgress(g, state).done).map((g) => g.id) };
      save();
    }
    loaded = true;
  }

  function current(state = getState()) {
    const index = GOALS.findIndex((g) => !record.done.includes(g.id));
    if (index < 0 || !state) return null;
    const goal = GOALS[index], p = goalProgress(goal, state);
    return { goal, index, total: GOALS.length, earned: record.done.length, ...p, label: show(goal, p.value) };
  }

  function sync(state) {
    if (!loaded || !state) return;
    if (record.campaignId !== state.campaignId) { record = { campaignId: state.campaignId, done: [] }; save(); }
    if (state.campaign?.outcome) return;
    const fresh = GOALS.filter((g) => !record.done.includes(g.id) && goalProgress(g, state).done);
    if (!fresh.length) return;
    for (const g of fresh) record.done.push(g.id);
    save();
    award(fresh[0], fresh.length);
    for (const g of fresh) feedback.log(`Medalha conquistada: ${g.title}.`, { tone: 'good', icon: g.icon, time: state.time });
  }

  // Medalha no centro do mapa, com confete; some sozinha e não bloqueia o jogo.
  function award(goal, count) {
    sfx.play('conquest');
    document.querySelector('.goal-award')?.remove();
    const node = document.createElement('div');
    node.className = 'goal-award';
    node.setAttribute('role', 'status');
    node.innerHTML = `<div class="confetti" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<i style="--i:${i};--x:${(Math.random() * 100).toFixed(1)}%;--d:${Math.round(Math.random() * 500)}ms"></i>`).join('')}</div><div class="medal" aria-hidden="true"><span class="medal-ribbon"></span><span class="medal-face"><img src="${assets[goal.icon]}" alt=""></span></div><small>META CUMPRIDA${count > 1 ? ` · +${count - 1}` : ''}</small><strong>${safe(goal.title)}</strong><span>${safe(goal.text)}</span><em>Medalha ${record.done.length} de ${GOALS.length}</em>`;
    node.onclick = () => node.remove();
    document.querySelector('main').append(node);
    setTimeout(() => { node.classList.add('is-leaving'); setTimeout(() => node.remove(), 300); }, 3800);
  }

  // Lista de metas e medalhas (menu de opções ou toque na meta atual).
  const dialog = document.createElement('dialog');
  dialog.id = 'goals-dialog';
  dialog.setAttribute('aria-labelledby', 'goals-title');
  document.body.append(dialog);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) { dialog.close(); sfx.play('close'); return; }
    const place = e.target.closest('[data-place]')?.dataset.place;
    if (place) { dialog.close(); onFocus(place); }
  });
  function open() {
    const state = getState();
    dialog.innerHTML = `<div class="dialog-heading"><img src="${assets['bandeira_capanga_aliado.png']}" alt="" width="56" height="56"><div><small>PROGRESSO</small><h2 id="goals-title">Metas e medalhas · ${record.done.length}/${GOALS.length}</h2></div><button type="button" data-close aria-label="Fechar metas">✕</button></div><ol class="goal-list">${GOALS.map((g) => {
      const p = goalProgress(g, state), done = record.done.includes(g.id);
      return `<li class="${done ? 'is-done' : ''}"><span class="medal is-small${done ? '' : ' is-locked'}" aria-hidden="true"><span class="medal-face"><img src="${assets[g.icon]}" alt=""></span></span><div><strong>${safe(g.title)}</strong><span>${safe(g.text)}</span>${done ? '<b>Conquistada</b>' : `<i class="meter"><b style="width:${(p.ratio * 100).toFixed(1)}%"></b></i><small>${show(g, p.value)}</small>`}</div>${!done && g.place ? `<button type="button" class="btn-secondary" data-place="${g.place}">Ir</button>` : ''}</li>`;
    }).join('')}</ol>`;
    if (!dialog.open) { dialog.showModal(); sfx.play('open'); }
  }

  return { load, sync, current, open };
}
