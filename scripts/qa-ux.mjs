// QA da camada de experiência: tutorial completo, avisos, diário, ajuda, opções e celular.
// Uso: npm run dev (porta 5174) e depois `node scripts/qa-ux.mjs` (ou QA_URL=...).
import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { waitForGame } from './qa-entry-helper.mjs';

const url = process.env.QA_URL ?? 'http://127.0.0.1:5174/';
const out = process.env.QA_SHOTS ?? 'docs';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });

// Converte uma coordenada do mapa em ponto da tela usando os dados expostos pelo canvas.
async function clickWorld(page, x, y) {
  const box = await page.locator('#map canvas').boundingBox();
  const d = await page.locator('#map canvas').evaluate((c) => ({ ...c.dataset }));
  const zoom = Number(d.zoom), w = box.width, h = box.height;
  const viewX = Number(d.scrollX) + (w - w / zoom) / 2, viewY = Number(d.scrollY) + (h - h / zoom) / 2;
  await page.mouse.click(box.x + (x - viewX) * zoom, box.y + (y - viewY) * zoom);
}
async function slotPoint(page, id) {
  return page.evaluate(async (id) => {
    const { ruralMap } = await import('/src/data/world.js');
    const s = ruralMap.slots.find((slot) => slot.id === id);
    return s.type === 'security' ? { x: s.sprite.x, y: s.sprite.y - 25 } : { x: s.sprite.x, y: s.sprite.y - s.sprite.width * 0.3 };
  }, id);
}
async function openOnMap(page, id) {
  const p = await slotPoint(page, id);
  // Garante a construção visível: centraliza aproximando pela gestão quando possível.
  await clickWorld(page, p.x, p.y);
  await page.waitForTimeout(350);
}
const coachText = (page) => page.locator('#coach').innerText();
async function closeDialog(page) {
  await page.locator('#management-dialog [data-close]').click();
  await page.waitForTimeout(350);
}

try {
  // ---------- Desktop: tutorial completo ----------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url);
  const profile = 'QA UX ' + Date.now();
  await waitForGame(page, profile);
  await page.waitForTimeout(800);

  assert.match(await coachText(page), /ETAPA 1 DE 6/);
  await page.screenshot({ path: `${out}/qa-ux-tutorial-start.png` });

  // Etapa 1: fazenda e ração.
  await openOnMap(page, 'farm-ze');
  assert.equal(await page.locator('#title').textContent(), 'Fazenda do Seu Zé');
  assert.match(await coachText(page), /ração/);
  await page.waitForTimeout(300);
  assert.equal(await page.locator('[data-action="buyFeed"].tutorial-target').count(), 1, 'botão de ração destacado');
  await page.locator('[data-action="setQty"][data-qty="50"]').click();
  assert.equal(await page.locator('#feed-quantity').inputValue(), '50');
  await page.locator('[data-action="buyFeed"]').click();
  await page.waitForTimeout(300);
  assert.match(await coachText(page), /ETAPA 2 DE 6/);
  assert.ok(await page.locator('.toast').count() >= 1, 'aviso de etapa concluída');

  // Etapa 2: fábrica e produção.
  await openOnMap(page, 'factory-ze');
  assert.match(await page.locator('#title').textContent(), /Queijaria/);
  await page.waitForTimeout(300);
  assert.equal(await page.locator('[data-action="produce"].tutorial-target').count(), 1);
  await page.locator('[data-action="produce"]').click();
  await page.waitForTimeout(300);
  assert.match(await coachText(page), /ETAPA 3 DE 6/);
  assert.ok(await page.locator('.batch-row').count() >= 1, 'barra do lote em produção');
  await page.screenshot({ path: `${out}/qa-ux-factory.png` });

  // Erro: produzir sem leite mostra aviso e não quebra nada.
  await page.locator('[data-action="produce"]').click();
  await page.waitForTimeout(200);
  assert.ok(await page.locator('.toast-bad').count() >= 1, 'aviso de erro');

  // Etapa 3: enviar queijo e recolher dinheiro (acelerando o tempo).
  await page.locator('[data-action="collectCheese"]').click();
  await page.waitForTimeout(300);
  assert.match(await coachText(page), /moeda/);
  await page.locator('[data-speed="4"]').click();
  assert.equal(await page.locator('[data-speed="4"]').getAttribute('aria-pressed'), 'true');
  await openOnMap(page, 'sale-ze');
  await page.waitForFunction(() => !document.querySelector('[data-action="collectCash"]')?.disabled, null, { timeout: 20000 });
  await page.locator('[data-action="collectCash"]').click();
  await page.waitForTimeout(300);
  assert.match(await coachText(page), /ETAPA 4 DE 6/);
  await page.locator('[data-speed="1"]').click();

  // Etapa 4: loja de vacas e agência (pelo mapa).
  await page.locator('#close-property').click();
  await page.waitForTimeout(250);
  await openOnMap(page, 'cow-shop');
  assert.match(await page.locator('#title').textContent(), /Loja de vacas/);
  await page.locator('#close-property').click();
  await page.waitForTimeout(250);
  await openOnMap(page, 'employee-agency');
  assert.match(await page.locator('#title').textContent(), /Agência de funcionários/);
  assert.match(await coachText(page), /ETAPA 5 DE 6/);
  await page.locator('#close-property').click();

  // Etapa 5: finanças e estoque.
  await page.locator('[data-manage="cash"]').click();
  await page.waitForTimeout(400);
  assert.ok(await page.locator('.finance-chart').isVisible(), 'gráfico de finanças');
  await page.screenshot({ path: `${out}/qa-ux-finances.png` });
  await closeDialog(page);
  await page.locator('[data-manage="milk"]').click();
  await page.waitForTimeout(300);
  await closeDialog(page);
  assert.match(await coachText(page), /ETAPA 6 DE 6/);

  // Etapa 6: bandeira e inimigos.
  await openOnMap(page, 'sale-ze-control');
  assert.match(await page.locator('#title').textContent(), /Controle/);
  await page.locator('#close-property').click();
  await page.locator('[data-manage="enemies"]').click();
  await page.waitForTimeout(300);
  await closeDialog(page);
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#coach').getAttribute('data-mode'), 'advice', 'tutorial concluído vira próximo passo: ' + await coachText(page));
  assert.ok(await page.locator('#coach .coach-goal').isVisible(), 'meta atual aparece no próximo passo');
  assert.match(await page.locator('#coach .coach-goal').innerText(), /META 1\/11/);
  await page.screenshot({ path: `${out}/qa-ux-advice.png` });
  await page.locator('#coach .coach-goal').click();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#goals-dialog .goal-list li').count(), 11);
  await page.screenshot({ path: `${out}/qa-ux-goals.png` });
  await page.locator('#goals-dialog [data-close]').click();
  // Fontes do jogo carregadas e música tocando após o gesto do jogador.
  assert.ok(await page.evaluate(() => document.fonts.check('16px "Lilita One"') && document.fonts.check('16px "Nunito Variable"')), 'fontes carregadas');

  // Diário, ajuda e opções.
  await page.locator('#journal-button').click();
  assert.equal(await page.locator('#journal-panel').getAttribute('data-open'), 'true');
  await page.locator('#journal-button').click();
  await page.locator('#help-button').click();
  await page.waitForTimeout(300);
  assert.ok(await page.locator('#help-dialog .production-chain').isVisible());
  assert.ok(await page.locator('#help-dialog .help-systems article').count() >= 8);
  await page.screenshot({ path: `${out}/qa-ux-help.png` });
  await page.locator('#help-dialog [data-close]').first().click();
  await page.waitForTimeout(350);
  await page.locator('#settings-button').click();
  await page.locator('#mute').uncheck();
  assert.ok(await page.locator('#settings-button.is-muted').count());
  await page.locator('#mute').check();
  await page.locator('#settings-button').click();

  // Progresso do tutorial sobrevive ao recarregar (perfil existente não reinicia).
  await page.locator('#save').click();
  await page.waitForTimeout(500);
  await page.reload();
  await waitForGame(page, profile);
  await page.waitForTimeout(800);
  assert.equal(await page.locator('#coach').getAttribute('data-mode'), 'advice');
  assert.deepEqual(errors, []);
  await ctx.close();

  // ---------- Celular ----------
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const phone = await mobile.newPage();
  const phoneErrors = [];
  phone.on('pageerror', (e) => phoneErrors.push(e.message));
  await phone.goto(url);
  await waitForGame(phone, 'QA UX celular ' + Date.now());
  await phone.waitForTimeout(800);
  assert.ok(await phone.locator('#hud-day').isVisible(), 'relógio visível no celular');
  const zoom = Number(await phone.locator('#map canvas').getAttribute('data-zoom'));
  assert.ok(zoom >= 0.4, 'mapa começa aproximado no celular: ' + zoom);
  await phone.screenshot({ path: `${out}/qa-ux-mobile-start.png` });
  await openOnMap(phone, 'farm-ze');
  await phone.waitForTimeout(600);
  const sheet = await phone.locator('#property-menu').boundingBox();
  assert.ok(sheet.y > 844 * 0.3, 'painel abre como gaveta inferior');
  await phone.screenshot({ path: `${out}/qa-ux-mobile-sheet.png` });
  const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(overflow <= 1, 'sem rolagem horizontal');
  assert.deepEqual(phoneErrors, []);
  await mobile.close();
  // ---------- Medalha: meta cumprida durante a partida ----------
  const gctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const gpage = await gctx.newPage();
  const gErrors = [];
  gpage.on('pageerror', (e) => gErrors.push(e.message));
  await gpage.goto(url);
  await gpage.waitForSelector('#entry-form');
  const gname = 'QA medalha ' + Date.now();
  await gpage.evaluate(async (name) => {
    const { enterProfile, save, writeLocal } = await import('/src/persistence/local.js');
    const { createGame, command } = await import('/src/domain/game.js');
    const profile = await enterProfile(name);
    let s = createGame();
    s.playerProfile = profile;
    s = command(s, { type: 'buyProperty', id: 'sale-n4' });
    await save(s);
    await writeLocal('ui:' + profile.id, { stage: 0, step: 0, active: false, finished: true, tips: ['second-shop'], collapsed: false });
    // Registro de metas da mesma campanha, ainda sem medalhas: a loja comprada vale a medalha.
    await writeLocal('goals:' + profile.id, { campaignId: s.campaignId, done: ['first-sales', 'herd'] });
  }, gname);
  await gpage.reload();
  await waitForGame(gpage, gname);
  await gpage.waitForSelector('.goal-award', { timeout: 8000 });
  assert.match(await gpage.locator('.goal-award').innerText(), /Rede de lojas/);
  await gpage.screenshot({ path: `${out}/qa-ux-medal.png` });
  assert.deepEqual(gErrors, []);
  await gctx.close();

  // ---------- Falência: aviso, contagem e game over ----------
  const bctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const bpage = await bctx.newPage();
  const bErrors = [];
  bpage.on('pageerror', (e) => bErrors.push(e.message));
  await bpage.goto(url);
  await bpage.waitForSelector('#entry-form');
  const bname = 'QA falência ' + Date.now();
  await bpage.evaluate(async (name) => {
    const { enterProfile, save } = await import('/src/persistence/local.js');
    const { createGame } = await import('/src/domain/game.js');
    const profile = await enterProfile(name);
    const s = createGame();
    s.playerProfile = profile;
    for (const p of Object.values(s.properties)) {
      if (p.owner !== 'player') continue;
      if (p.type === 'farm') { p.cows = {}; p.cowAges = {}; p.milk = {}; p.milkProgress = {}; }
      if (p.type === 'factory') { p.ready = {}; p.milk = {}; p.milkProgress = {}; p.batches = []; }
    }
    s.companies.player.cash = 0;
    s.speed = 4;
    await save(s);
    // Tutorial já visto para este perfil.
    const { writeLocal } = await import('/src/persistence/local.js');
    await writeLocal('ui:' + profile.id, { stage: 0, step: 0, active: false, finished: true, tips: [], collapsed: false });
  }, bname);
  await bpage.reload();
  await waitForGame(bpage, bname);
  await bpage.waitForSelector('.toast-bad', { timeout: 10000 });
  assert.match(await bpage.locator('.toast-bad').first().innerText(), /Falência iminente/);
  assert.match(await coachText(bpage), /Falência em/);
  assert.equal(await bpage.locator('[data-manage="cash"]').getAttribute('data-alert'), 'bad');
  await bpage.screenshot({ path: `${out}/qa-ux-bankruptcy-warning.png` });
  await bpage.waitForSelector('#outcome-dialog[open]', { timeout: 30000 });
  assert.match(await bpage.locator('#outcome-dialog').innerText(), /faliu/);
  await bpage.screenshot({ path: `${out}/qa-ux-bankruptcy.png` });
  assert.deepEqual(bErrors, []);
  await bctx.close();
  console.log('UX OK: tutorial de 6 etapas, avisos, erro, diário, ajuda, opções, persistência do tutorial, layout de celular, metas, medalha, fontes e falência.');
} finally {
  await browser.close();
}
