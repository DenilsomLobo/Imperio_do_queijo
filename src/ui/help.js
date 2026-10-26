// Ajuda visual, menu de configurações e dicas flutuantes (mouse, foco e toque longo).
import { rules } from '../data/game-rules.js';

const money = (n) => (n / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: n % 100 ? 2 : 0 });
const pct = (n) => `${Math.round(n * 100)}%`;

// Cadeia produtiva com a arte do jogo. `active` destaca uma etapa (0 a 5).
export function productionChain(assets, active = -1, compact = false) {
  const steps = [
    ['vaca_magrela.png', 'Vaca', '1 L/dia'],
    ['leite_fraco.png', 'Leite', 'coleta'],
    ['fabrica_de_queijo_inicial.png', 'Fábrica', '+ embalagem'],
    ['queijo_fraco.png', 'Queijo', 'envio'],
    ['ponto_de_venda_inicial_seu_ze.png', 'Loja', 'vendedor'],
    ['icon_money.png', 'Lucro', 'recolha'],
  ];
  return `<ol class="production-chain${compact ? ' is-compact' : ''}" aria-label="Cadeia produtiva: vaca, leite, fábrica, queijo, loja e lucro">${steps.map(([img, label, hint], i) => `<li class="${i === active ? 'is-active' : i < active ? 'is-done' : ''}"><img src="${assets[img]}" alt=""><b>${label}</b>${compact ? '' : `<small>${hint}</small>`}</li>`).join('')}</ol>`;
}

function systems() {
  const weak = rules.recipes.weak, magic = rules.recipes.magic;
  return [
    ['vaca_mimosa.png', 'Vacas e leite', ['1 L por vaca/dia', 'Ração dobra a produção', `Revenda: ${pct(rules.cowResaleRatio)} após 3 dias`]],
    ['queijo_nobre.png', 'Queijos', ['1 L + 1 embalagem', 'Mesma origem do leite', `${money(weak.price)} a ${money(magic.price)}`]],
    ['icon_embalagem.png', 'Estoque', [`Fazenda: ${rules.milkCapacity} L`, `Fábrica: ${rules.factoryMilkCapacity} L · ${rules.cheeseCapacity} queijos`, `Lojas: ${rules.shopCapacity} por loja, compartilhado`]],
    ['Ponto_de_venda_aliado.png', 'Lojas e preços', ['Só vende com vendedor', `+${pct(rules.extraShopSaleBonus)} por loja extra`, `Vendedor: +${pct(rules.sellerSaleBonus)}`]],
    ['funcionario_nivel_2.png', 'Funcionários', ['Produzem sozinhos', '+5% a +15% de velocidade', '4 dias sem salário: demissão']],
    ['transportadora_nivel_1.png', 'Transporte', ['Fazenda → fábrica → loja', `${money(rules.logistics.hire)} + ${money(rules.logistics.dailyFee)}/dia`]],
    ['banco_nivel_1.png', 'Banco', ['Recolhe o dinheiro das lojas', `Taxa: ${pct(rules.banks[1].rate)}–${pct(rules.banks[2].rate)} do lucro do dia`]],
    ['icon_disputa.png', 'Leilões', [`Lance mínimo +${pct(rules.auctionIncrement)}`, `${rules.auctionDays} dias de prazo`, 'Valor fica reservado']],
    ['capangas_aliado_nivel_2.png', 'Capangas e território', ['Atacam lojas ligadas por rua', `Barricada: +${pct(rules.barricadeBonus)} defesa`, `+${pct(rules.garrisonBonus)} por loja guarnecida`]],
    ['bandeira_capanga_aliado.png', 'Vitória', ['14 lojas · 4 fazendas · 4 fábricas', 'Um banco + a transportadora', '24 objetivos no total']],
  ];
}

export function createHelp({ assets, sfx, onTutorial, onReset, onGoals }) {
  const dialog = document.createElement('dialog');
  dialog.id = 'help-dialog';
  dialog.setAttribute('aria-labelledby', 'help-title');
  dialog.innerHTML = `<div class="dialog-heading"><img src="${assets['comece_flag.png']}" alt="" width="64" height="64"><div><small>AJUDA</small><h2 id="help-title">Como jogar</h2></div><button type="button" data-close aria-label="Fechar ajuda">✕</button></div>
  <section><h3>O ciclo do império</h3>${productionChain(assets)}<p class="help-lede">Produza, venda, recolha o dinheiro e reinvista. A Família Coalho faz o mesmo: quem dominar os 24 objetivos vence.</p></section>
  <section><h3>Sistemas</h3><div class="help-systems">${systems().map(([img, title, facts]) => `<article><img src="${assets[img]}" alt=""><div><strong>${title}</strong><ul>${facts.map((f) => `<li>${f}</li>`).join('')}</ul></div></article>`).join('')}</div></section>
  <section><h3>Controles</h3><ul class="help-controls"><li><b>Arrastar</b> move o mapa</li><li><b>Roda</b> ou <b>pinça</b> dá zoom</li><li><b>Toque</b> numa construção para gerenciá-la</li><li><b>Ícones dourados</b> coletam leite, queijo e dinheiro</li><li><b>Segure</b> um botão para ver a dica</li></ul></section>
  <div class="reset-actions"><button type="button" class="btn-secondary" data-help="tutorial">Rever tutorial</button><button type="button" class="btn-primary" data-close>Voltar ao jogo</button></div>`;
  document.body.append(dialog);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) closeDialog(dialog, sfx);
    if (e.target.closest('[data-help="tutorial"]')) { closeDialog(dialog, sfx); onTutorial(); }
  });

  // Menu de configurações: som, tutorial e reset.
  const button = document.querySelector('#settings-button');
  const menu = document.querySelector('#settings-menu');
  const volume = menu.querySelector('#volume');
  const mute = menu.querySelector('#mute');
  const musicOn = menu.querySelector('#music-on'), musicVolume = menu.querySelector('#music-volume');
  const sync = (s) => {
    musicOn.checked = s.musicOn;
    musicVolume.value = String(Math.round(s.musicVolume * 100));
    menu.querySelector('#music-value').textContent = s.musicOn ? `${Math.round(s.musicVolume * 100)}%` : 'desligada';
    volume.value = String(Math.round(s.volume * 100));
    mute.checked = !s.muted;
    button.classList.toggle('is-muted', s.muted || s.volume === 0);
    menu.querySelector('#volume-value').textContent = s.muted ? 'mudo' : `${Math.round(s.volume * 100)}%`;
  };
  sync(sfx.settings);
  sfx.onChange(sync);
  volume.oninput = () => sfx.setVolume(Number(volume.value) / 100);
  volume.onchange = () => sfx.play('coin');
  mute.onchange = () => { sfx.setMuted(!mute.checked); sfx.play('tick'); };
  musicOn.onchange = () => sfx.setMusic(musicOn.checked);
  musicVolume.oninput = () => sfx.setMusicVolume(Number(musicVolume.value) / 100);
  const setOpen = (open) => { menu.dataset.open = String(open); button.setAttribute('aria-expanded', String(open)); };
  button.onclick = () => { const open = menu.dataset.open !== 'true'; setOpen(open); sfx.play(open ? 'open' : 'close'); };
  menu.addEventListener('click', (e) => {
    const action = e.target.closest('[data-menu]')?.dataset.menu;
    if (!action) return;
    setOpen(false);
    if (action === 'help') open();
    if (action === 'tutorial') onTutorial();
    if (action === 'goals') onGoals?.();
    if (action === 'reset') onReset();
  });
  document.addEventListener('pointerdown', (e) => { if (menu.dataset.open === 'true' && !menu.contains(e.target) && !button.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.dataset.open === 'true') { setOpen(false); button.focus(); } });

  function open() { if (!dialog.open) { dialog.showModal(); sfx.play('open'); } }
  return { open };
}

// Fecha um <dialog> com animação curta (quando o navegador permite).
export function closeDialog(dialog, sfx) {
  if (!dialog.open || dialog.classList.contains('is-closing')) return;
  sfx?.play('close');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { dialog.close(); return; }
  dialog.classList.add('is-closing');
  const done = () => { dialog.classList.remove('is-closing'); if (dialog.open) dialog.close(); };
  dialog.addEventListener('animationend', done, { once: true });
  setTimeout(done, 260);
}

// Dicas curtas em [data-tip]: aparecem com mouse, foco do teclado ou toque longo.
export function installTooltips() {
  const tip = document.createElement('div');
  tip.className = 'tooltip';
  tip.setAttribute('role', 'tooltip');
  tip.id = 'game-tooltip';
  document.body.append(tip);
  let timer = null, owner = null, pressTimer = null, suppressClick = false;
  function show(el) {
    const text = el.dataset.tip;
    if (!text) return;
    owner = el;
    tip.textContent = text;
    tip.dataset.show = 'true';
    el.setAttribute('aria-describedby', 'game-tooltip');
    const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
    let top = r.top - t.height - 8, place = 'top';
    if (top < 6) { top = r.bottom + 8; place = 'bottom'; }
    const left = Math.min(innerWidth - t.width - 8, Math.max(8, r.left + r.width / 2 - t.width / 2));
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    tip.dataset.place = place;
  }
  function hide() {
    clearTimeout(timer);
    tip.dataset.show = 'false';
    owner?.removeAttribute('aria-describedby');
    owner = null;
  }
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest('[data-tip]');
    if (el === owner) return;
    hide();
    if (el) timer = setTimeout(() => show(el), 380);
  });
  document.addEventListener('pointerout', (e) => { if (e.pointerType === 'mouse' && owner && !owner.contains(e.relatedTarget)) hide(); });
  document.addEventListener('focusin', (e) => { const el = e.target.closest?.('[data-tip]'); if (el && el.matches(':focus-visible')) show(el); });
  document.addEventListener('focusout', hide);
  // Toque longo mostra a dica sem disparar o clique.
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') { hide(); return; }
    const el = e.target.closest('[data-tip]');
    clearTimeout(pressTimer);
    if (el) pressTimer = setTimeout(() => { show(el); suppressClick = true; setTimeout(hide, 2200); }, 480);
  });
  for (const type of ['pointerup', 'pointercancel', 'pointermove']) document.addEventListener(type, (e) => { if (type !== 'pointermove' || Math.abs(e.movementX) + Math.abs(e.movementY) > 6) clearTimeout(pressTimer); });
  document.addEventListener('click', (e) => { if (suppressClick) { suppressClick = false; e.preventDefault(); e.stopPropagation(); } }, true);
  window.addEventListener('scroll', hide, true);
}
