import { describe, it, expect } from 'vitest';
import { createGame, command, advance } from '../domain/game.js';
import { DAY } from '../data/game-rules.js';
import { diffEvents, humanize, reportTone } from './events.js';
import { nextStep } from './advisor.js';

describe('diffEvents', () => {
  it('detecta gasto de caixa em uma compra', () => {
    const s = createGame(0);
    const next = command(s, { type: 'buyFeed', id: 'farm-ze', quantity: 10 });
    const events = diffEvents(s, next);
    expect(events).toContainEqual({ type: 'cash', delta: -250 });
  });

  it('detecta queijo concluído e vendas da loja', () => {
    let s = createGame(0);
    s = command(s, { type: 'collectCheese', id: 'factory-ze' });
    s = command(s, { type: 'produce', id: 'factory-ze', recipe: 'weak', quality: 'weak' });
    const later = advance(s, 12000);
    const events = diffEvents(s, later);
    expect(events.find((e) => e.type === 'cheese-done')).toMatchObject({ id: 'factory-ze', count: 1, rare: false });
    expect(events.find((e) => e.type === 'sale')).toMatchObject({ id: 'sale-ze', count: 1 });
  });

  it('anuncia a virada do dia com receitas e despesas', () => {
    const s = command(createGame(0), { type: 'buyFeed', id: 'farm-ze', quantity: 10 });
    const next = advance(s, DAY + 1000);
    const day = diffEvents(s, next).find((e) => e.type === 'day');
    expect(day).toMatchObject({ day: 0 });
    expect(day.expenses).toBe(250);
  });

  it('detecta conquista ao comprar propriedade', () => {
    const s = createGame(0);
    const next = command(s, { type: 'buyProperty', id: 'sale-n4' });
    expect(diffEvents(s, next)).toContainEqual({ type: 'gained', id: 'sale-n4', ptype: 'sale', from: 'neutral' });
  });

  it('não gera eventos sem mudança', () => {
    const s = createGame(0);
    expect(diffEvents(s, s)).toEqual([]);
  });
});

describe('relatórios legíveis', () => {
  it('troca IDs internos por nomes', () => {
    expect(humanize('sale-n1-control: salário não pago.')).toBe('Ponto do moinho: salário não pago.');
    expect(humanize('factory-ze: manutenção pendente.')).toBe('Queijaria rudimentar do seu Zé: manutenção pendente.');
  });
  it('classifica vitórias e derrotas pelo ponto de vista do jogador', () => {
    const s = createGame(0);
    expect(reportTone('Império do Queijo venceu (55.0%).', s)).toBe('good');
    expect(reportTone('Família Coalho venceu (55.0%).', s)).toBe('bad');
    expect(reportTone('Família Coalho perdeu (40.0%).', s)).toBe('good');
  });
});

describe('nextStep', () => {
  it('começa sugerindo enviar o queijo inicial às lojas', () => {
    const step = nextStep(createGame(0));
    expect(step).toMatchObject({ target: 'factory-ze', collect: true });
  });
  it('sugere ração quando as vacas estão sem alimento', () => {
    let s = createGame(0);
    s = command(s, { type: 'collectCheese', id: 'factory-ze' });
    expect(nextStep(s)).toMatchObject({ target: 'farm-ze', kind: 'warn' });
  });
  it('não sugere nada com a campanha encerrada', () => {
    const s = createGame(0);
    s.campaign = { outcome: 'victory' };
    expect(nextStep(s)).toBeNull();
  });
});
