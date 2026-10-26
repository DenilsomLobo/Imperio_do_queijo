// Feedback de ações e acontecimentos: sons, avisos curtos, números no mapa e diário.
import { dairy } from '../data/dairy.js';
import { DAY } from '../data/game-rules.js';
import { dominanceProgress } from '../domain/campaign.js';
import { diffEvents, slotName, humanize, reportTone } from './events.js';

const money = (n) => (n / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const signed = (n) => (n >= 0 ? '+' : '−') + money(Math.abs(n));
const safe = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clock = (t) => { const m = Math.floor(((t % DAY) / DAY) * 1440); return `Dia ${Math.floor(t / DAY) + 1} · ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
const TONE_ICON = { good: 'icon_money.png', bad: 'icon_ataque.png', warn: 'icon_disputa.png', info: 'icon_queijo.png' };

// Som e ícone de cada comando concluído pelo jogador.
const COMMAND_FX = {
  collectMilk: ['milk', 'icon_leite.png'], collectCheese: ['cheese', 'icon_queijo.png'], dispatchCheese: ['cheese', 'icon_queijo.png'],
  collectCash: ['coin', 'icon_money.png'], buyFeed: ['purchase', 'icon_racao.png'], buyPackaging: ['purchase', 'icon_embalagem.png'],
  buyCow: ['purchase', null], hireWorker: ['hire', 'funcionario_nivel_1.png'], hireSeller: ['hire', 'icon_vendedor.png'],
  hireTeam: ['hire', null], upgradeStars: ['upgrade', null], upgradeWeapon: ['upgrade', null], upgradeBarricade: ['upgrade', null],
  produce: ['produce', 'icon_queijo.png'], attack: ['attack', 'icon_ataque.png'], bidProperty: ['purchase', 'icon_disputa.png'],
  hireBank: ['hire', 'icon_money.png'], hireLogistics: ['hire', null], sellCow: ['coin', 'icon_money.png'],
  payWorkerWages: ['purchase', 'icon_money.png'], payTeamWages: ['purchase', 'icon_money.png'], buyProperty: ['purchase', null],
  moveCow: ['tick', null], moveTeam: ['tick', null], deployReserve: ['hire', null], speed: ['tick', null],
  cancelBank: ['close', null], cancelLogistics: ['close', null], dismissStaffNotices: ['close', null],
};

export function createFeedback({ sfx, getScene, assets, onFocus, onManage, onNewCampaign }) {
  const main = document.querySelector('main');
  const stack = document.createElement('div');
  stack.className = 'toast-stack';
  stack.setAttribute('aria-live', 'polite');
  main.append(stack);

  const journal = [];
  let unread = 0, lastToastText = '', lastToastAt = 0, pendingCash = 0, cashTimer = null, lastDayToast = -Infinity;
  const recentReports = new Map();

  function toast(text, { tone = 'info', icon = TONE_ICON[tone], title = '', action = null, duration = 3800, group = '' } = {}) {
    const now = performance.now();
    if (text === lastToastText && now - lastToastAt < 4000) return;
    lastToastText = text; lastToastAt = now;
    const node = document.createElement('div');
    node.className = `toast toast-${tone}`;
    node.setAttribute('role', tone === 'bad' ? 'alert' : 'status');
    node.style.setProperty('--life', `${duration}ms`);
    node.innerHTML = `${icon && assets[icon] ? `<img class="toast-icon" src="${assets[icon]}" alt="">` : ''}<div class="toast-body">${title ? `<strong>${safe(title)}</strong>` : ''}<span>${safe(text)}</span></div>${action ? `<button type="button" class="toast-action">${safe(action.label)}</button>` : ''}<button type="button" class="toast-close" aria-label="Fechar aviso">✕</button><i class="toast-life" aria-hidden="true"></i>`;
    const remove = () => { if (!node.isConnected) return; node.classList.add('is-leaving'); setTimeout(() => node.remove(), 220); };
    let timer = setTimeout(remove, duration);
    node.addEventListener('pointerenter', () => { clearTimeout(timer); node.classList.add('is-paused'); });
    node.addEventListener('pointerleave', () => { node.classList.remove('is-paused'); timer = setTimeout(remove, 1500); });
    node.querySelector('.toast-close').onclick = remove;
    if (action) node.querySelector('.toast-action').onclick = () => { action.run(); remove(); };
    // Avisos do mesmo grupo (ex.: tutorial, fim do dia) substituem o anterior em vez de empilhar.
    if (group) { node.dataset.group = group; stack.querySelectorAll(`[data-group="${group}"]`).forEach((old) => old.remove()); }
    stack.prepend(node);
    while (stack.children.length > 4) stack.lastElementChild.remove();
  }

  // Diário de acontecimentos acessível pelo sino do cabeçalho.
  const bell = document.querySelector('#journal-button');
  const panel = document.querySelector('#journal-panel');
  function renderJournal() {
    const list = panel.querySelector('ol');
    list.innerHTML = journal.length
      ? journal.map((e, i) => `<li class="journal-${e.tone}"><button type="button" data-journal="${i}" ${e.target ? '' : 'disabled'}><img src="${assets[e.icon ?? TONE_ICON[e.tone]]}" alt=""><span><small>${safe(e.when)}</small>${safe(e.text)}</span></button></li>`).join('')
      : '<li class="journal-empty">Nada novo por aqui. Os acontecimentos importantes aparecem nesta lista.</li>';
    bell.querySelector('.badge').textContent = unread > 9 ? '9+' : String(unread);
    bell.classList.toggle('has-unread', unread > 0);
    bell.setAttribute('aria-label', `Acontecimentos${unread ? `: ${unread} novo(s)` : ''}`);
  }
  function log(text, { tone = 'info', icon, target = null, time, count = true } = {}) {
    journal.unshift({ text, tone, icon, target, when: time != null ? clock(time) : '' });
    journal.length = Math.min(journal.length, 40);
    if (count && panel.dataset.open !== 'true') unread++;
    renderJournal();
  }
  bell.onclick = () => {
    const open = panel.dataset.open !== 'true';
    panel.dataset.open = String(open);
    bell.setAttribute('aria-expanded', String(open));
    sfx.play(open ? 'open' : 'close');
    if (open) { unread = 0; renderJournal(); panel.querySelector('button:not([disabled])')?.focus({ preventScroll: true }); }
  };
  panel.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-journal]')) { panel.dataset.open = 'false'; bell.setAttribute('aria-expanded', 'false'); return; }
    const entry = journal[e.target.closest('[data-journal]')?.dataset.journal];
    if (entry?.target) { panel.dataset.open = 'false'; bell.setAttribute('aria-expanded', 'false'); onFocus(entry.target); }
  });
  document.addEventListener('pointerdown', (e) => {
    if (panel.dataset.open === 'true' && !panel.contains(e.target) && !bell.contains(e.target)) { panel.dataset.open = 'false'; bell.setAttribute('aria-expanded', 'false'); }
  });

  // Variação do caixa aparece junto ao cartão de Finanças, agrupada para não piscar demais.
  function cashDelta(delta) {
    pendingCash += delta;
    clearTimeout(cashTimer);
    cashTimer = setTimeout(() => {
      const card = document.querySelector('[data-manage="cash"]'), amount = pendingCash;
      pendingCash = 0;
      if (!card || !amount) return;
      const chip = document.createElement('span');
      chip.className = `cash-delta ${amount > 0 ? 'is-up' : 'is-down'}`;
      chip.textContent = signed(amount);
      card.append(chip);
      card.classList.remove('cash-up', 'cash-down');
      void card.offsetWidth;
      card.classList.add(amount > 0 ? 'cash-up' : 'cash-down');
      setTimeout(() => chip.remove(), 1600);
    }, 250);
  }

  const scene = () => getScene();
  let lastBankFloat = 0, floatsThisTick = 0;
  function float(id, text, opts) { if (floatsThisTick++ < 8) scene()?.floatText(id, text, opts); }

  function handleEvent(e, state, source) {
    switch (e.type) {
      case 'cash': cashDelta(e.delta); break;
      case 'sale':
        float(e.id, '+' + money(e.amount), { icon: 'icon_money.png' });
        sfx.play('sale');
        break;
      case 'bank-collect':
        if (performance.now() - lastBankFloat > 5000 && state.companies.player.bank) { lastBankFloat = performance.now(); float(state.companies.player.bank.propertyId, '+' + money(e.amount), { icon: 'icon_money.png', color: '#1f5c7a' }); }
        break;
      case 'milk-produced':
        if (source === 'tick') { float(e.id, `+${e.liters} L`, { icon: dairy.weak.milkAsset, color: '#2b5f8a' }); sfx.play('milk'); }
        break;
      case 'cheese-done': {
        const cheese = dairy[e.quality];
        float(e.id, `+${e.count}`, { icon: cheese?.cheeseAsset ?? 'icon_queijo.png', color: '#a8641a' });
        if (e.rare) {
          sfx.play('rare'); scene()?.burst(e.id, cheese.cheeseAsset, 8);
          toast(`Queijo ${cheese.name} pronto na ${slotName(e.id)}!`, { tone: 'good', icon: cheese.cheeseAsset, title: 'Produto especial' });
        } else sfx.play('cheese');
        break;
      }
      case 'gained':
        sfx.play('conquest'); scene()?.flash(e.id); scene()?.burst(e.id, 'icon_money.png', 6);
        toast(`${slotName(e.id)} agora é sua.`, { tone: 'good', title: 'Nova propriedade', icon: 'bandeira_capanga_aliado.png' });
        log(`${slotName(e.id)} passou para o seu império.`, { tone: 'good', icon: 'bandeira_capanga_aliado.png', target: e.id, time: state.time });
        break;
      case 'lost':
        sfx.play('defeat');
        toast(`Você perdeu ${slotName(e.id)}.`, { tone: 'bad', title: 'Território perdido', action: { label: 'Ver', run: () => onFocus(e.id) }, duration: 6000 });
        log(`Perdemos ${slotName(e.id)}.`, { tone: 'bad', target: e.id, time: state.time });
        break;
      case 'rival-gained':
        log(`${state.companies[e.rival]?.name ?? 'Rival'} assumiu ${slotName(e.id)}.`, { tone: 'warn', icon: 'bandeira_capanga_inimiga.png', target: e.id, time: state.time });
        break;
      case 'incoming-attack':
        sfx.play('alert');
        toast(`Capangas rivais a caminho de ${slotName(e.saleId)}!`, { tone: 'bad', title: 'Ataque inimigo', icon: 'icon_defesa.png', action: { label: 'Defender', run: () => onFocus(e.id) }, duration: 7000 });
        log(`Ataque inimigo contra ${slotName(e.saleId)}.`, { tone: 'bad', icon: 'icon_defesa.png', target: e.id, time: state.time });
        break;
      case 'discovery': {
        const d = dairy[e.quality];
        sfx.play(e.rare ? 'rare' : 'objective');
        toast(`Você descobriu o Leite ${d.name} e o Queijo ${d.name}.`, { tone: 'good', title: 'Nova descoberta', icon: d.milkAsset, duration: 5000 });
        log(`Descoberta: Leite ${d.name}.`, { tone: 'good', icon: d.milkAsset, time: state.time });
        break;
      }
      case 'staff-quit':
        sfx.play('error');
        toast(`Equipe pediu demissão em ${slotName(e.id)} por falta de salário.`, { tone: 'warn', title: 'Pessoal', action: { label: 'Ver', run: () => onFocus(e.id) }, duration: 6000 });
        break;
      case 'report': {
        const key = e.text, now = performance.now();
        const repeat = now - (recentReports.get(key) ?? -Infinity) < 20000;
        recentReports.set(key, now);
        if (!repeat) log(e.text, { tone: e.tone, time: e.time, count: e.tone !== 'info' || /lance|leil/i.test(e.text) });
        if (repeat) break;
        if (e.tone === 'good') { sfx.play('conquest'); toast(e.text, { tone: 'good', title: 'Disputa' }); }
        else if (e.tone === 'bad') { sfx.play('defeat'); toast(e.text, { tone: 'bad', title: 'Disputa', duration: 6000 }); }
        else if (/lance|leil/i.test(e.text)) toast(e.text, { tone: 'info', icon: 'icon_disputa.png', title: 'Leilão' });
        break;
      }
      case 'day': {
        const profit = e.revenue - e.expenses;
        // Em velocidade alta os dias passam rápido: o resumo aparece no máximo a cada 25 s.
        if (performance.now() - lastDayToast > 25000) {
          lastDayToast = performance.now();
          sfx.play('day');
          toast(`Receitas ${money(e.revenue)} · despesas ${money(e.expenses)}`, { tone: profit >= 0 ? 'good' : 'warn', title: `Fim do dia ${e.day + 1}: ${signed(profit)}`, icon: 'icon_money.png', duration: 4500, group: 'day' });
        }
        log(`Fim do dia ${e.day + 1}: resultado ${signed(profit)}.`, { tone: profit >= 0 ? 'info' : 'warn', icon: 'icon_money.png', count: false, time: state.time });
        break;
      }
      case 'insolvency':
        sfx.play('alert');
        toast('Sem caixa, sem vacas e sem como vender. Se nada mudar em 1 dia de jogo, a empresa vai à falência.', { tone: 'bad', title: 'Falência iminente!', icon: 'icon_money.png', duration: 9000, group: 'bankruptcy' });
        log('Empresa insolvente: falência em 1 dia de jogo se nada mudar.', { tone: 'bad', icon: 'icon_money.png', time: state.time });
        break;
      case 'solvent':
        sfx.play('objective');
        toast('A empresa voltou a ter como se manter.', { tone: 'good', title: 'Falência evitada', icon: 'icon_money.png', group: 'bankruptcy' });
        log('Falência evitada.', { tone: 'good', icon: 'icon_money.png', time: state.time });
        break;
      case 'outcome': showOutcome(state); break;
    }
  }

  function handle(prev, next, { source = 'tick', command = null, element = null } = {}) {
    const events = diffEvents(prev, next);
    floatsThisTick = 0;
    if (source === 'command' && command) commandFx(command, prev, next, events, element);
    for (const e of events) {
      if (source === 'command' && !['cash', 'gained', 'lost', 'discovery', 'outcome', 'report'].includes(e.type)) continue;
      handleEvent(e, next, source);
    }
    return events;
  }

  function commandFx(c, prev, next, events, element) {
    const [sound, icon] = COMMAND_FX[c.type] ?? ['tick', null];
    if (!events.some((e) => e.type === 'gained')) sfx.play(sound);
    element?.classList.add('did-succeed');
    setTimeout(() => element?.classList.remove('did-succeed'), 500);
    const id = c.id, sc = scene();
    const delta = next.companies.player.cash - prev.companies.player.cash;
    if (c.type === 'collectCash') { sc?.floatText(id, '+' + money(delta), { icon: 'icon_money.png' }); sc?.burst(id, 'icon_money.png', 7); }
    if (c.type === 'collectMilk') {
      const moved = Object.values(prev.properties[id].milk).reduce((n, v) => n + v, 0) - Object.values(next.properties[id].milk).reduce((n, v) => n + v, 0);
      sc?.floatText(id, `${moved} L → queijaria`, { icon: 'icon_leite.png', color: '#2b5f8a' });
      sc?.floatText(c.target, `+${moved} L`, { icon: 'icon_leite.png', color: '#2b5f8a', delay: 250 });
    }
    if (c.type === 'collectCheese') {
      const moved = Object.values(prev.properties[id].ready).reduce((n, v) => n + v, 0) - Object.values(next.properties[id].ready).reduce((n, v) => n + v, 0);
      sc?.floatText(id, `${moved} → lojas`, { icon: 'icon_queijo.png', color: '#a8641a' });
    }
    if (['buyFeed', 'buyPackaging'].includes(c.type)) sc?.floatText(id, `+${c.quantity}`, { icon, color: '#5c4030' });
    if (c.type === 'buyCow') sc?.floatText(id, '+1 vaca', { icon: dairy[c.species]?.cowAsset, color: '#5c4030' });
    if (['hireWorker', 'hireSeller', 'hireTeam', 'upgradeStars', 'upgradeWeapon', 'upgradeBarricade', 'hireBank', 'hireLogistics', 'deployReserve'].includes(c.type)) sc?.flash(c.type === 'hireTeam' || c.type.startsWith('upgrade') ? (next.properties[id]?.saleId ?? id) : id, c.type.startsWith('upgrade') ? 0x52734d : 0xf2c14e);
    if (c.type === 'produce') sc?.floatText(id, c.batch ? `${c.batch} em produção` : 'Produzindo…', { icon: 'icon_queijo.png', color: '#a8641a' });
    if (c.type === 'attack') toast(`Equipe a caminho de ${slotName(next.properties[c.target]?.saleId)}. Resultado em instantes.`, { tone: 'info', icon: 'icon_ataque.png', title: 'Ataque iniciado' });
  }

  function error(message, element) {
    sfx.play('error');
    toast(message, { tone: 'bad', title: 'Não foi possível', icon: 'icon_disputa.png', duration: 4500 });
    if (element) { element.classList.remove('did-fail'); void element.offsetWidth; element.classList.add('did-fail'); }
  }

  // Tela de resultado da campanha.
  const outcome = document.createElement('dialog');
  outcome.id = 'outcome-dialog';
  document.body.append(outcome);
  function showOutcome(state) {
    const win = state.campaign?.outcome === 'victory', broke = state.campaign?.reason === 'bankruptcy';
    const d = dominanceProgress(state, 'player');
    sfx.play(win ? 'conquest' : 'defeat');
    outcome.className = win ? 'is-victory' : 'is-defeat';
    outcome.innerHTML = `${win ? '<div class="confetti" aria-hidden="true">' + Array.from({ length: 40 }, (_, i) => `<i style="--i:${i};--x:${(Math.random() * 100).toFixed(1)}%;--d:${Math.round(Math.random() * 900)}ms"></i>`).join('') + '</div>' : ''}<img class="outcome-art${broke ? ' is-broke' : ''}" src="${assets[win ? 'capangas_aliado_nivel_3.png' : broke ? 'ponto_de_venda_inicial_seu_ze.png' : 'capangas_inimigos_nivel_3.png']}" alt=""><p class="panel-eyebrow">${win ? 'VITÓRIA' : broke ? 'GAME OVER · FALÊNCIA' : 'DERROTA'}</p><h2>${win ? 'Queijópolis é sua!' : broke ? 'O Império do Queijo faliu!' : 'A Família Coalho dominou Queijópolis'}</h2><div class="outcome-stats"><div><span>Dia</span><strong>${Math.floor(state.time / DAY) + 1}</strong></div><div><span>Caixa</span><strong>${money(state.companies.player.cash)}</strong></div><div><span>Objetivos</span><strong>${d.owned}/${d.total}</strong></div></div><p>${win ? 'Do queijo do Seu Zé a um império: todas as lojas, fazendas, fábricas, banco e transporte estão sob seu comando.' : broke ? 'O caixa secou, não sobrou vaca nem queijo para vender e os credores fecharam as portas. Dica: guarde uma reserva para ração, embalagens e salários antes de investir.' : 'O rival controlou todos os objetivos. Recomece com o que aprendeu: proteja as lojas e expanda mais cedo.'}</p><div class="reset-actions"><button type="button" data-outcome="map" class="btn-secondary">Ver o mapa</button><button type="button" data-outcome="new" class="btn-primary">Nova campanha</button></div>`;
    outcome.querySelector('[data-outcome="map"]').onclick = () => outcome.close();
    outcome.querySelector('[data-outcome="new"]').onclick = () => { outcome.close(); onNewCampaign(); };
    if (!outcome.open) outcome.showModal();
  }

  return {
    toast, log, handle, error, showOutcome,
    seed(state) {
      journal.length = 0; unread = 0;
      for (const r of state.reports.slice(0, 15).reverse()) log(humanize(r.text), { tone: reportTone(r.text, state), time: r.time, count: false });
      renderJournal();
    },
  };
}
