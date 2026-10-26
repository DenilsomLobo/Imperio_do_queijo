// Tutorial interativo, dicas contextuais e "Próximo passo".
// O progresso fica fora do save da campanha (chave própria por perfil), preservando saves e nuvem.
import { rules } from '../data/game-rules.js';
import { companyShops } from '../domain/shop-stock.js';
import { nextStep } from './advisor.js';

const money = (n) => (n / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const safe = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const selected = (id) => (e) => e.type === 'select' && e.id === id;
const did = (...types) => (e) => e.type === 'command' && types.includes(e.command.type);
const managed = (id) => (e) => e.type === 'manage' && e.id === id;

export const STAGES = [
  { id: 'farm', title: 'Conhecendo sua fazenda', icon: 'vaca_magrela.png', steps: [
    { text: 'Esta é a <b>Fazenda do Seu Zé</b>. Cada vaca produz leite sozinha. Toque na fazenda.', map: 'farm-ze', done: selected('farm-ze') },
    { text: 'Vaca com <b>ração</b> produz o dobro. Compre ração para ela.', map: 'farm-ze', target: '[data-action="buyFeed"]', within: 'farm-ze', done: did('buyFeed') },
  ] },
  { id: 'factory', title: 'Conhecendo a fábrica', icon: 'icon_queijo.png', steps: [
    { text: 'Na queijaria: <b>1 L de leite + 1 embalagem = 1 queijo</b>. Abra a Queijaria do Seu Zé.', map: 'factory-ze', done: selected('factory-ze') },
    { text: 'Toque em <b>Produzir</b> para começar seu primeiro queijo.', map: 'factory-ze', target: '[data-action="produce"]', within: 'factory-ze', done: did('produce') },
  ] },
  { id: 'sale', title: 'Primeira venda', icon: 'icon_money.png', steps: [
    { text: 'Queijo pronto mostra um <b>ícone dourado</b> sobre a queijaria. Toque nele para mandar o queijo às lojas.', map: 'factory-ze', target: '[data-action="collectCheese"]', within: 'factory-ze', done: did('collectCheese') },
    { text: 'O vendedor da Barraquinha vende sozinho. Quando a <b>moeda</b> aparecer, toque nela para recolher o dinheiro.', map: 'sale-ze', target: '[data-action="collectCash"]', within: 'sale-ze', done: did('collectCash') },
  ] },
  { id: 'grow', title: 'Melhorando o negócio', icon: 'funcionario_nivel_1.png', steps: [
    { text: '<b>Mais vacas, mais leite.</b> Visite a Loja de vacas para conhecer as cinco espécies.', map: 'cow-shop', done: selected('cow-shop') },
    { text: '<b>Funcionários</b> produzem sozinhos e aceleram a fábrica. Conheça a Agência de funcionários.', map: 'employee-agency', done: selected('employee-agency') },
  ] },
  { id: 'manage', title: 'Administrando recursos', icon: 'cash.png', steps: [
    { text: 'Acompanhe <b>caixa, receitas e despesas</b>. Abra Finanças na barra de gestão.', target: '[data-manage="cash"]', done: managed('cash') },
    { text: 'Leite, ração, embalagens e queijos ficam em <b>Estoque</b>. Feche a janela e abra Estoque.', target: '[data-manage="milk"]', done: managed('milk') },
  ] },
  { id: 'territory', title: 'Expansão e territórios', icon: 'bandeira_capanga_aliado.png', steps: [
    { text: 'A <b>bandeira</b> diante de cada loja mostra quem a controla. Capangas defendem e atacam lojas ligadas por rua. Toque na bandeira da Barraquinha.', map: 'sale-ze-control', done: selected('sale-ze-control') },
    { text: 'A <b>Família Coalho</b> disputa o mesmo mapa. Em Inimigos você vê o avanço dela e a sua meta: 24 objetivos.', target: '[data-manage="enemies"]', done: managed('enemies') },
  ] },
];

// Dicas que aparecem uma única vez, quando um sistema avançado passa a fazer sentido.
const TIPS = [
  { id: 'second-shop', when: (s) => companyShops(s).length >= 2, icon: 'Ponto_de_venda_aliado.png', text: 'Rede de lojas: cada loja além da primeira soma <b>+10% no preço</b> de todas elas.' },
  { id: 'attack', when: (s) => s.missions.some((m) => m.defender === 'player'), icon: 'icon_defesa.png', text: 'Sob ataque! <b>Capangas</b> defendem e <b>barricadas</b> somam +15% de defesa por nível. Cada loja guarnecida dá +5% à rede.' },
  { id: 'auction', when: (s) => Object.keys(s.auctions ?? {}).length > 0, icon: 'icon_disputa.png', text: '<b>Leilão</b> aberto: lances sobem no mínimo 10% e o prazo é de 10 dias. O valor fica reservado do caixa.' },
  { id: 'rare-milk', when: (s) => (s.companies.player.discoveredMilk ?? []).length > 1, icon: 'leite_nobre.png', text: 'Cada leite faz o <b>queijo da mesma origem</b>. Origens melhores valem bem mais nas lojas.' },
  { id: 'bank', when: (s) => !s.companies.player.bank && s.companies.player.cash >= rules.banks[1].hire, icon: 'banco_nivel_1.png', target: 'bank-rural', text: `Com ${money(rules.banks[1].hire)} você pode contratar um <b>banco</b>: ele recolhe o dinheiro das lojas sozinho.` },
  { id: 'logistics', when: (s) => !s.companies.player.logistics && s.companies.player.cash >= rules.logistics.hire, icon: 'transportadora_nivel_1.png', target: 'transport', text: 'A <b>Transportadora</b> leva leite e queijo entre suas propriedades sem cliques.' },
  { id: 'wages', when: (s) => Object.values(s.properties).some((p) => p.owner === 'player' && ((p.workers ?? []).some((w) => w.missedWages) || p.team?.missedWages)), icon: 'icon_money.png', text: 'Salários atrasados <b>suspendem</b> o trabalho. Após 4 dias sem pagamento, a equipe vai embora.' },
];

export function createTutorial({ sfx, assets, getScene, getState, getSelected, feedback, onFocus, onManage, read, write, profileId, getGoal = () => null, onGoals = () => {} }) {
  const key = 'ui:' + profileId;
  let progress = { stage: 0, step: 0, active: false, finished: false, tips: [], collapsed: false };
  let tip = null, highlighted = null, scrolledFor = null, focusedFor = null, lastAdvice = '';

  const coach = document.createElement('section');
  coach.id = 'coach';
  coach.className = 'coach';
  coach.setAttribute('aria-live', 'polite');
  document.querySelector('main').append(coach);

  const save = () => write(key, progress).catch(() => {});
  async function load(isNewCampaign) {
    let saved = null;
    try { saved = await read(key); } catch { /* sem progresso salvo */ }
    if (saved && typeof saved === 'object') progress = { ...progress, ...saved, tips: Array.isArray(saved.tips) ? saved.tips : [] };
    else if (isNewCampaign) progress.active = true;
    else progress.finished = true; // jogador veterano: tutorial fica disponível na Ajuda
    render();
  }

  const stage = () => STAGES[progress.stage];
  const step = () => stage()?.steps[progress.step];

  function advance(skipped = false) {
    const st = stage();
    progress.step++;
    if (progress.step >= st.steps.length) {
      progress.stage++; progress.step = 0;
      if (!skipped) {
        sfx.play('objective');
        feedback.toast(`Etapa concluída: ${st.title}`, { tone: 'good', icon: st.icon, title: `Tutorial ${progress.stage}/${STAGES.length}`, group: 'tutorial' });
      }
      if (progress.stage >= STAGES.length) finish(false);
    } else if (!skipped) sfx.play('tick');
    save(); render();
  }
  function finish(skipped) {
    progress.active = false; progress.finished = true; progress.stage = 0; progress.step = 0;
    clearHighlight(); getScene()?.pointAt(null);
    if (!skipped) {
      sfx.play('conquest');
      feedback.toast('Agora é com você: siga o “Próximo passo” e domine os 24 objetivos de Queijópolis.', { tone: 'good', title: 'Tutorial concluído!', icon: 'bandeira_capanga_aliado.png', duration: 6000, group: 'tutorial' });
    } else feedback.toast('Você pode rever o tutorial quando quiser no botão Ajuda (?).', { tone: 'info', title: 'Tutorial encerrado' });
    save(); render();
  }

  function notify(event) {
    if (progress.active) {
      const current = step();
      if (current?.done(event)) advance();
    }
  }

  function clearHighlight() {
    highlighted?.classList.remove('tutorial-target');
    highlighted = null;
  }
  // Mantém destaque e seta coerentes com o que está na tela (o painel é redesenhado com frequência).
  function sync() {
    const state = getState();
    if (!state) return;
    if (!progress.active) {
      clearHighlight();
      getScene()?.pointAt(tip?.target ?? null);
      checkTips(state);
      renderAdvice(state);
      return;
    }
    const current = step();
    if (!current) return;
    const selectedId = getSelected();
    const inPlace = !current.within || selectedId === current.within;
    const el = current.target && inPlace ? [...document.querySelectorAll(current.target)].find((n) => n.offsetParent !== null) : null;
    if (el !== highlighted) { clearHighlight(); if (el) { el.classList.add('tutorial-target'); highlighted = el; } }
    if (el && scrolledFor !== current) {
      scrolledFor = current;
      el.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    // A seta do mapa aparece quando o alvo ainda não está visível (ex.: painel fechado).
    const scene = getScene();
    scene?.pointAt(el ? null : current.map ?? null);
    // No início da etapa, a câmera leva o jogador até a construção indicada.
    if (scene && !el && current.map && focusedFor !== current) {
      focusedFor = current;
      // No celular o cartão fica no topo: a construção desce um pouco para não ficar coberta.
      scene.focus(current.map, matchMedia('(max-width: 700px)').matches ? -90 : 0);
    }
  }

  function checkTips(state) {
    if (tip || !progress.finished) return;
    const next = TIPS.find((t) => !progress.tips.includes(t.id) && t.when(state));
    if (!next) return;
    tip = next;
    sfx.play('objective');
    render();
  }

  function renderAdvice(state) {
    if (tip) return;
    const advice = nextStep(state), goal = getGoal();
    const signature = JSON.stringify([advice?.text, progress.collapsed, goal?.goal.id, goal?.label]);
    if (signature === lastAdvice) return;
    lastAdvice = signature;
    if (!advice) { coach.hidden = true; return; }
    coach.hidden = false;
    coach.dataset.mode = 'advice';
    coach.dataset.kind = advice.kind;
    coach.classList.toggle('is-collapsed', progress.collapsed);
    coach.innerHTML = `<button type="button" class="coach-toggle" data-coach="toggle" aria-expanded="${!progress.collapsed}" aria-label="${progress.collapsed ? 'Mostrar próximo passo' : 'Recolher próximo passo'}">${progress.collapsed ? '›' : '‹'}</button><img class="coach-icon" src="${assets[advice.icon] ?? assets['icon_queijo.png']}" alt=""><div class="coach-body"><small>${advice.kind === 'urgent' ? 'ATENÇÃO' : advice.kind === 'warn' ? 'CUIDADO' : 'PRÓXIMO PASSO'}</small><p>${safe(advice.text)}</p>${goal ? `<button type="button" class="coach-goal" data-coach="goals" data-tip="Ver todas as metas e medalhas"><span class="medal is-tiny" aria-hidden="true"><span class="medal-face"><img src="${assets[goal.goal.icon]}" alt=""></span></span><span class="coach-goal-text"><small>META ${goal.index + 1}/${goal.total}</small> ${safe(goal.goal.text)}</span><i class="meter"><b style="width:${(goal.ratio * 100).toFixed(1)}%"></b></i><small class="coach-goal-value">${safe(goal.label)}</small></button>` : ''}</div>${advice.target || advice.manage ? `<button type="button" class="btn-primary coach-go" data-coach="go">Ir</button>` : ''}`;
    coach._advice = advice;
  }

  function render() {
    lastAdvice = '';
    if (progress.active) {
      const st = stage(), current = step();
      coach.hidden = false;
      coach.dataset.mode = 'tutorial';
      coach.classList.remove('is-collapsed');
      coach.innerHTML = `<img class="coach-icon" src="${assets[st.icon]}" alt=""><div class="coach-body"><small>TUTORIAL · ETAPA ${progress.stage + 1} DE ${STAGES.length}</small><strong>${st.title}</strong><p>${current.text}</p><ol class="coach-dots" aria-label="Progresso do tutorial">${STAGES.map((s, i) => `<li class="${i < progress.stage ? 'is-done' : i === progress.stage ? 'is-current' : ''}" title="${s.title}"></li>`).join('')}</ol><div class="coach-actions"><button type="button" class="btn-ghost" data-coach="skip-step">Pular etapa</button><button type="button" class="btn-ghost" data-coach="quit">Sair do tutorial</button></div></div>`;
      sync();
      return;
    }
    if (tip) {
      coach.hidden = false;
      coach.dataset.mode = 'tip';
      coach.classList.remove('is-collapsed');
      coach.innerHTML = `<img class="coach-icon" src="${assets[tip.icon] ?? assets['icon_queijo.png']}" alt=""><div class="coach-body"><small>DICA</small><p>${tip.text}</p><div class="coach-actions">${tip.target ? '<button type="button" class="btn-secondary" data-coach="tip-go">Ver no mapa</button>' : ''}<button type="button" class="btn-primary" data-coach="tip-ok">Entendi</button></div></div>`;
      return;
    }
    const state = getState();
    if (state) renderAdvice(state);
  }

  coach.addEventListener('click', (e) => {
    const action = e.target.closest('[data-coach]')?.dataset.coach;
    if (!action) return;
    if (action === 'skip-step') advance(true);
    if (action === 'quit') finish(true);
    if (action === 'tip-ok' || action === 'tip-go') {
      const target = tip.target;
      progress.tips.push(tip.id); tip = null; save();
      getScene()?.pointAt(null);
      render();
      if (action === 'tip-go' && target) onFocus(target);
    }
    if (action === 'goals') { onGoals(); return; }
    if (action === 'toggle') { progress.collapsed = !progress.collapsed; save(); sfx.play('tick'); render(); }
    if (action === 'go') {
      const advice = coach._advice;
      if (advice?.manage) onManage(advice.manage);
      else if (advice?.target) onFocus(advice.target);
    }
  });

  return {
    load, notify, sync, render,
    get active() { return progress.active; },
    restart() {
      progress = { ...progress, stage: 0, step: 0, active: true, finished: false };
      tip = null; save(); sfx.play('open'); render();
    },
  };
}
