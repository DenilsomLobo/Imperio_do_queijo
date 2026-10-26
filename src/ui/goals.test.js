import { it, expect } from 'vitest';
import { createGame, command } from '../domain/game.js';
import { GOALS, goalProgress } from './goals.js';

const goal = (id) => GOALS.find((g) => g.id === id);

it('nenhuma meta começa cumprida numa campanha nova', () => {
  const s = createGame(0);
  expect(GOALS.filter((g) => goalProgress(g, s).done)).toEqual([]);
});
it('progresso acompanha o estado e trava no alvo', () => {
  let s = createGame(0);
  expect(goalProgress(goal('second-shop'), s)).toMatchObject({ value: 1, done: false, ratio: 0.5 });
  s = command(s, { type: 'buyProperty', id: 'sale-n4' });
  expect(goalProgress(goal('second-shop'), s)).toMatchObject({ value: 2, done: true, ratio: 1 });
  s.companies.player.cash = 999999;
  expect(goalProgress(goal('cash'), s).value).toBe(goal('cash').target);
});
it('metas têm ids únicos e alvos positivos', () => {
  expect(new Set(GOALS.map((g) => g.id)).size).toBe(GOALS.length);
  expect(GOALS.every((g) => g.target > 0 && g.title && g.text)).toBe(true);
});
