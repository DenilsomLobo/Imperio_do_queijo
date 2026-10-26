// Compara dois estados e descreve o que aconteceu, sem alterar regras nem o save.
// A interface usa estes eventos para sons, avisos, números flutuantes e o diário.
import { DAY } from '../data/game-rules.js';
import { ruralMap } from '../data/world.js';
import { discoveredMilk } from '../data/dairy.js';

const RARE = new Set(['radioactive', 'magic']);
const names = new Map(ruralMap.slots.map((s) => [s.id, s.name]));
const sum = (stock) => Object.values(stock ?? {}).reduce((n, v) => n + v, 0);

export const slotName = (id) => names.get(id) ?? id;

// Troca IDs internos ("sale-n1-control", "team-12") por nomes legíveis nos relatórios.
export function humanize(text) {
  return String(text)
    .replace(/\b[a-z]+(?:-[a-z0-9]+)+\b/g, (id) => {
      const shop = id.replace(/-control$/, '');
      if (id !== shop && names.has(shop)) return names.get(shop);
      if (names.has(id)) return names.get(id);
      if (/^team-\d+$/.test(id)) return 'Equipe';
      if (/^worker-\d+$/.test(id)) return 'Funcionário';
      return id;
    })
    .replace(/^Controle de /, '');
}

export function reportTone(text, state, owner = 'player') {
  const mine = state.companies[owner]?.name ?? '';
  const rivals = Object.entries(state.companies).filter(([id]) => id !== owner).map(([, c]) => c.name);
  if (mine && text.startsWith(mine + ' venceu')) return 'good';
  if (mine && text.startsWith(mine + ' perdeu')) return 'bad';
  if (rivals.some((n) => text.startsWith(n + ' venceu'))) return 'bad';
  if (rivals.some((n) => text.startsWith(n + ' perdeu'))) return 'good';
  if (/pendente|não pago|demiss|suspens|deve pagar/i.test(text)) return 'warn';
  return 'info';
}

function newLedgerEntries(prev, next) {
  const out = [];
  for (let i = next.ledger.length - 1; i >= 0; i--) {
    const e = next.ledger[i];
    if (e.id < prev.nextId) break;
    out.push(e);
  }
  return out.reverse();
}

function newReports(prev, next) {
  const top = prev.reports[0];
  if (!top) return next.reports.slice(0, 5);
  const index = next.reports.findIndex((r) => r.time === top.time && r.text === top.text);
  return index < 0 ? next.reports.filter((r) => r.time >= prev.time).slice(0, 5) : next.reports.slice(0, index);
}

function dayTotals(state, owner, day) {
  let revenue = 0, expenses = 0;
  for (let i = state.ledger.length - 1; i >= 0; i--) {
    const e = state.ledger[i], d = Math.floor(e.time / DAY);
    if (d < day) break;
    if (d === day && e.owner === owner) { revenue += e.revenue ?? 0; expenses += e.expense ?? 0; }
  }
  return { revenue, expenses };
}

export function diffEvents(prev, next, owner = 'player') {
  if (!prev || !next || prev === next) return [];
  const events = [];
  const before = prev.companies[owner], after = next.companies[owner];
  if (!before || !after) return events;

  const delta = after.cash - before.cash;
  if (delta) events.push({ type: 'cash', delta });

  // Vendas e coletas registradas no livro-caixa desde o último estado.
  const sales = new Map();
  let bank = 0;
  for (const e of newLedgerEntries(prev, next)) {
    if (e.owner !== owner) continue;
    if (e.kind === 'Venda ao consumidor' && e.revenue > 0) {
      const row = sales.get(e.property) ?? { amount: 0, count: 0 };
      row.amount += e.revenue; row.count++;
      sales.set(e.property, row);
    }
    if (e.kind === 'Coleta bancária automática' && e.amount > 0) bank += e.amount;
  }
  for (const [id, row] of sales) events.push({ type: 'sale', id, ...row });
  if (bank) events.push({ type: 'bank-collect', amount: bank });

  for (const [id, p] of Object.entries(next.properties)) {
    const old = prev.properties[id];
    if (!old) continue;
    if (old.owner !== p.owner && p.type !== 'security') {
      if (p.owner === owner) events.push({ type: 'gained', id, ptype: p.type, from: old.owner });
      else if (old.owner === owner) events.push({ type: 'lost', id, ptype: p.type, to: p.owner });
      else if (p.owner !== 'neutral' && p.owner !== 'public' && old.owner === 'neutral') events.push({ type: 'rival-gained', id, ptype: p.type, rival: p.owner });
    }
    if (p.owner !== owner || old.owner !== owner) continue;
    if (p.type === 'farm') {
      const liters = sum(p.milk) - sum(old.milk);
      if (liters > 0) events.push({ type: 'milk-produced', id, liters });
    }
    if (p.type === 'factory') {
      const still = new Set(p.batches.map((b) => b.id));
      const done = old.batches.filter((b) => !still.has(b.id));
      if (done.length) {
        events.push({ type: 'cheese-done', id, count: done.length, quality: done[done.length - 1].quality, rare: done.some((b) => RARE.has(b.quality)) });
      }
    }
    if (p.staffNotices?.length > (old.staffNotices?.length ?? 0)) events.push({ type: 'staff-quit', id });
  }

  const known = new Set(prev.missions.map((m) => m.id));
  for (const m of next.missions) {
    if (known.has(m.id)) continue;
    if (m.defender === owner) events.push({ type: 'incoming-attack', id: m.to, saleId: next.properties[m.to]?.saleId, from: m.from });
  }

  const found = new Set(discoveredMilk(prev, owner));
  for (const quality of discoveredMilk(next, owner)) if (!found.has(quality)) events.push({ type: 'discovery', quality, rare: RARE.has(quality) });

  for (const r of newReports(prev, next).reverse()) {
    events.push({ type: 'report', text: humanize(r.text), tone: reportTone(r.text, next, owner), time: r.time });
  }

  const dayBefore = Math.floor(prev.time / DAY), dayAfter = Math.floor(next.time / DAY);
  if (dayAfter > dayBefore) events.push({ type: 'day', day: dayBefore, ...dayTotals(next, owner, dayBefore) });

  if (next.insolventSince != null && prev.insolventSince == null && !next.campaign?.outcome) events.push({ type: 'insolvency' });
  if (next.insolventSince == null && prev.insolventSince != null && !next.campaign?.outcome) events.push({ type: 'solvent' });
  if (next.campaign?.outcome && !prev.campaign?.outcome) events.push({ type: 'outcome', outcome: next.campaign.outcome, reason: next.campaign.reason });
  return events;
}
