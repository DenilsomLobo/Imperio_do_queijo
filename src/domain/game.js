import { ruralMap } from "../data/world.js";
import { rules, DAY } from "../data/game-rules.js";
import { finalPurchaseAllowed, updateCampaign } from './campaign.js';
import reset from '../data/session-reset.json';

export const total = (stock) =>
  Object.values(stock).reduce((sum, n) => sum + n, 0);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const requireThat = (ok, message) => {
  if (!ok) throw Error(message);
};
function ledger(
  s,
  owner,
  amount,
  kind,
  property = null,
  revenue = 0,
  expense = 0,
) {
  const c = s.companies[owner];
  requireThat(c && c.cash + amount >= 0, "Caixa insuficiente.");
  c.cash += amount;
  c.revenue += revenue;
  c.expenses += expense;
  s.ledger.push({
    id: s.nextId++,
    time: s.time,
    owner,
    amount,
    kind,
    property,
    revenue,
    expense,
  });
}
function spend(s, owner, cents, kind, id) {
  ledger(s, owner, -cents, kind, id, 0, cents);
}
function team(s, owner) {
  return {
    id: `team-${s.nextId++}`,
    owner,
    count: 3,
    stars: 1,
    weapon: 0,
    moral: 1,
    busyUntil: 0,
    recoverUntil: 0,
    cooldownUntil: 0,
    missedWages: 0,
  };
}
export function createGame(now = Date.now()) {
  const s = {
    version: 1,
    resetRevision: reset.revision,
    layoutVersion: 3,
    rulesVersion: rules.version,
    campaignId: `rural-${now}`,
    savedAt: now,
    time: 0,
    remainder: 0,
    speed: 1,
    nextId: 1,
    rng: 123456789,
    companies: {
      player: {
        name: "Império do Queijo",
        cash: rules.initialCash,
        revenue: 0,
        expenses: 0,
      },
      coalho: {
        name: "Família Coalho",
        cash: rules.aiCash,
        revenue: 0,
        expenses: 0,
      },
    },
    properties: {},
    missions: [],
    reports: [],
    ledger: [],
    pendingIncidents: [],
    lastAi: 0,
  };
  for (const slot of ruralMap.slots) {
    const p = {
      id: slot.id,
      type: slot.type,
      owner: slot.owner,
      level: slot.level,
    };
    if (slot.type === "farm")
      Object.assign(p, {
        cows: ["farm-ze", "farm-coalho"].includes(slot.id) ? { weak: 1 } : {},
        milk: { weak: 0 },
        feed: 0,
      });
    if (slot.type === "factory")
      Object.assign(p, {
        milk: { weak: slot.id === "factory-ze" ? rules.initialMilk : 0 },
        packaging: slot.id === "factory-ze" ? rules.initialPackaging : 0,
        ready:
          slot.id === "factory-ze"
            ? { "frescal:weak": rules.initialCheese }
            : {},
        batches: [],
      });
    if (slot.type === "sale")
      Object.assign(p, {
        stock: {},
        till: 0,
        sales: 0,
        seller: slot.owner !== "neutral",
        sellerActive: slot.owner !== "neutral",
        saleProgress: 0,
        demandRemaining: rules.sellerDaily,
        securityId: slot.securityId,
      });
    if (slot.type === "security")
      Object.assign(p, { saleId: slot.saleId, team: null, barricade: 0 });
    s.properties[p.id] = p;
  }
  ledger(s, "player", 0, "Saldo de abertura");
  ledger(s, "coalho", 0, "Saldo de abertura");
  for (const p of Object.values(s.properties))
    if (p.owner === "coalho" && p.type === "security") {
      spend(s, "coalho", rules.teamHire, "Equipe inicial", p.id);
      p.team = team(s, "coalho");
    }
  return s;
}
export function attackStrength(t, time) {
  return t && t.moral > 0 && t.busyUntil <= time && t.recoverUntil <= time
    ? t.count *
        rules.stars[t.stars - 1] *
        (1 + t.weapon * rules.weaponBonus) *
        t.moral
    : 0;
}
export function defenseStrength(post, time) {
  const t = post.team;
  return (
    (attackStrength(t, time) * (1 + post.barricade * rules.barricadeBonus)) /
    (1 + (t?.weapon ?? 0) * rules.weaponBonus)
  );
}
export function chance(attack, defense) {
  return attack + defense === 0
    ? 50
    : clamp(50 + (40 * (attack - defense)) / (attack + defense), 5, 95);
}
export function distance(a, b) {
  const x = ruralMap.slots.find((p) => p.id === a),
    y = ruralMap.slots.find((p) => p.id === b);
  requireThat(x && y, "Posto inexistente.");
  return Math.hypot(x.sprite.x - y.sprite.x, x.sprite.y - y.sprite.y);
}
export function estimate(s, from, to) {
  const a = s.properties[from],
    d = s.properties[to];
  requireThat(
    a?.type === "security" && d?.type === "security",
    "Selecione postos de segurança.",
  );
  const attack = attackStrength(a.team, s.time),
    defense = defenseStrength(d, s.time);
  return {
    attack,
    defense,
    chance: chance(attack, defense),
    distance: distance(from, to),
    cost: rules.attackCost,
    duration: rules.attackDuration,
  };
}
function changeOwner(s, postId, owner) {
  const post = s.properties[postId],
    sale = s.properties[post.saleId];
  post.owner = owner;
  sale.owner = owner;
  sale.seller = false;
  sale.sellerActive = false;
  post.team = null;
}
function transfer(stock, target, capacity) {
  let moved = 0;
  for (const key of Object.keys(stock)) {
    const n = Math.min(stock[key], Math.max(0, capacity - total(target)));
    if (n > 0) {
      stock[key] -= n;
      target[key] = (target[key] ?? 0) + n;
      moved += n;
    }
  }
  return moved;
}
function own(s, id, owner) {
  const p = s.properties[id];
  requireThat(
    p && p.owner === owner,
    "Esta propriedade não pertence à sua empresa.",
  );
  return p;
}
function act(s, c, owner = "player") {
  const p = c.id ? s.properties[c.id] : null;
  if (c.type === "speed") {
    requireThat([1, 2, 4].includes(c.speed), "Velocidade inválida.");
    s.speed = c.speed;
    return;
  }
  if (c.type === "buyProperty") {
    requireThat(
      ["sale", "farm", "factory"].includes(p?.type) && (p.owner === "neutral" || finalPurchaseAllowed(s,p.id,owner)),
      "Apenas propriedades neutras podem ser compradas.",
    );
    spend(
      s,
      owner,
      (rules.propertyPrices[p.type] ?? rules.propertyPrice) *
        (p.type === "sale" ? 1 : p.level),
      "Compra de propriedade",
      p.id,
    );
    p.owner = owner;
    if (p.securityId) s.properties[p.securityId].owner = owner;
    return;
  }
  own(s, c.id, owner);
  switch (c.type) {
    case "buyFeed":
      requireThat(p.type === "farm", "Selecione uma fazenda.");
      requireThat(
        Number.isInteger(c.quantity) && c.quantity > 0 && c.quantity <= 1000,
        "Quantidade inválida.",
      );
      spend(s, owner, c.quantity * rules.feedPrice, "Ração", p.id);
      p.feed += c.quantity;
      break;
    case "buyCow": {
      requireThat(
        p.type === "farm" && rules.cows[c.species],
        "Espécie indisponível.",
      );
      requireThat(
        total(p.cows) < rules.farmCapacities[p.level - 1],
        "Fazenda sem vagas.",
      );
      spend(s, owner, rules.cows[c.species].price, "Compra de vaca", p.id);
      p.cows[c.species] = (p.cows[c.species] ?? 0) + 1;
      break;
    }
    case "collectMilk": {
      requireThat(p.type === "farm", "Selecione uma fazenda.");
      const f = own(s, c.target, owner);
      requireThat(f.type === "factory", "Destino deve ser uma fábrica.");
      requireThat(
        transfer(p.milk, f.milk, rules.factoryMilkCapacity) > 0,
        "Sem leite disponível ou fábrica cheia.",
      );
      break;
    }
    case "buyPackaging":
      requireThat(p.type === "factory", "Selecione uma fábrica.");
      requireThat(
        Number.isInteger(c.quantity) && c.quantity > 0 && c.quantity <= 1000,
        "Quantidade inválida.",
      );
      spend(s, owner, c.quantity * rules.packagingPrice, "Embalagens", p.id);
      p.packaging += c.quantity;
      break;
    case "produce": {
      const r = rules.recipes[c.recipe];
      requireThat(p.type === "factory" && r, "Receita inválida.");
      requireThat(
        p.batches.filter((b) => b.phase === "production").length <
          rules.factoryLines[p.level - 1],
        "Linha ocupada.",
      );
      requireThat(
        p.packaging >= 1 && (p.milk[c.quality] ?? 0) >= r.milk,
        "Leite ou embalagem insuficiente.",
      );
      requireThat(
        total(p.ready) + p.batches.length < rules.cheeseCapacity,
        "Estoque de queijo cheio.",
      );
      requireThat(
        !r.maturity ||
          p.batches.filter((b) => rules.recipes[b.recipe].maturity > 0).length <
            rules.maturityCapacities[p.level - 1],
        "Maturação cheia.",
      );
      p.milk[c.quality] -= r.milk;
      p.packaging--;
      p.batches.push({
        id: s.nextId++,
        recipe: c.recipe,
        quality: c.quality,
        phase: "production",
        due: s.time + r.time,
      });
      break;
    }
    case "collectCheese": {
      requireThat(p.type === "factory", "Selecione uma fábrica.");
      const shop = own(s, c.target, owner);
      requireThat(shop.type === "sale", "Destino deve ser uma loja.");
      requireThat(
        transfer(p.ready, shop.stock, rules.shopCapacity) > 0,
        "Sem queijo pronto ou loja cheia.",
      );
      break;
    }
    case "collectCash":
      requireThat(
        p.type === "sale" && p.till > 0,
        "Sem dinheiro para coletar.",
      );
      ledger(s, owner, p.till, "Coleta da loja", p.id);
      p.till = 0;
      break;
    case "hireSeller":
      requireThat(p.type === "sale" && !p.seller, "Loja já possui vendedor.");
      spend(s, owner, rules.sellerHire, "Contratação de vendedor", p.id);
      p.seller = true;
      p.sellerActive = true;
      break;
    case "hireTeam":
      requireThat(p.type === "security" && !p.team, "Posto já possui equipe.");
      const tier = c.level ?? 1;
      requireThat([1,2,3].includes(tier), "Nível de equipe inválido.");
      spend(s, owner, rules.teamHire + rules.starUpgrade.slice(1,tier).reduce((n,v)=>n+v,0), "Contratação de capangas", p.id);
      p.team = team(s, owner);
      p.team.stars = tier;
      break;
    case "deployReserve": {
      requireThat(p.type === "security" && !p.team, "Posto já possui equipe.");
      const reserve = s.companies[owner].reserveTeams ?? [];
      const t = reserve.find((t) => t.id === c.teamId);
      requireThat(
        t && t.recoverUntil <= s.time && t.busyUntil <= s.time,
        "Equipe em reserva indisponível.",
      );
      p.team = t;
      s.companies[owner].reserveTeams = reserve.filter((v) => v !== t);
      break;
    }
    case "moveTeam": {
      requireThat(p.type === "security" && p.team, "Selecione uma equipe.");
      const dest = own(s, c.target, owner);
      requireThat(
        dest.type === "security" && !dest.team,
        "Posto destino ocupado.",
      );
      requireThat(
        p.team.busyUntil <= s.time && p.team.recoverUntil <= s.time,
        "Equipe indisponível.",
      );
      dest.team = p.team;
      p.team = null;
      break;
    }
    case "upgradeStars":
      requireThat(
        p.type === "security" && p.team && p.team.stars < 3,
        "Equipe ausente ou já veterana.",
      );
      requireThat(
        p.team.busyUntil <= s.time && p.team.recoverUntil <= s.time,
        "Equipe indisponível.",
      );
      spend(
        s,
        owner,
        rules.starUpgrade[p.team.stars],
        "Promoção de capangas",
        p.id,
      );
      p.team.stars++;
      break;
    case "upgradeWeapon":
      requireThat(
        p.type === "security" && p.team && p.team.weapon < 3,
        "Equipe ausente ou armamento máximo.",
      );
      requireThat(
        p.team.busyUntil <= s.time && p.team.recoverUntil <= s.time,
        "Equipe indisponível.",
      );
      spend(s, owner, rules.weaponUpgrade, "Armamento", p.id);
      p.team.weapon++;
      break;
    case "upgradeBarricade":
      requireThat(
        p.type === "security" && p.barricade < 3,
        "Barricada máxima.",
      );
      spend(s, owner, rules.barricadeUpgrade, "Barricadas", p.id);
      p.barricade++;
      break;
    case "attack": {
      const d = s.properties[c.target];
      requireThat(
        p.type === "security" &&
          p.team &&
          d?.type === "security" &&
          d.owner !== owner,
        "Alvo ou equipe inválidos.",
      );
      requireThat(
        d.owner !== "neutral",
        "Pontos neutros devem ser comprados.",
      );
      requireThat(
        p.team.cooldownUntil <= s.time && attackStrength(p.team, s.time) > 0,
        "Equipe ocupada, em recuperação ou cooldown.",
      );
      requireThat(distance(p.id, d.id) <= rules.range, "Alvo fora de alcance.");
      requireThat(
        !s.missions.some((m) => m.to === d.id),
        "Alvo já está sob ataque.",
      );
      spend(s, owner, rules.attackCost, "Missão de ataque", p.id);
      const info = estimate(s, p.id, d.id);
      p.team.busyUntil = s.time + rules.attackDuration;
      s.missions.push({
        id: s.nextId++,
        owner,
        from: p.id,
        to: d.id,
        teamId: p.team.id,
        defender: d.owner,
        due: s.time + rules.attackDuration,
        attack: info.attack,
        estimate: info.chance,
      });
      break;
    }
    default:
      throw Error("Comando desconhecido.");
  }
}
export function command(s, c, owner = "player") {
  requireThat(!s.campaign?.outcome, "Campanha encerrada.");
  const next = structuredClone(s);
  act(next, c, owner);
  updateCampaign(next);
  return next;
}
function random(s) {
  s.rng ^= s.rng << 13;
  s.rng ^= s.rng >>> 17;
  s.rng ^= s.rng << 5;
  return (s.rng >>> 0) / 4294967296;
}
function report(s, text) {
  s.reports.unshift({ time: s.time, text });
  s.reports = s.reports.slice(0, 100);
}
function resolve(s, m, offline, rng) {
  const from = s.properties[m.from],
    to = s.properties[m.to],
    t = from.team;
  if (!t || t.id !== m.teamId) return;
  t.busyUntil = 0;
  t.cooldownUntil = s.time + rules.cooldown;
  if (to.owner !== m.defender) {
    report(s, "Missão encerrada: o controle do alvo mudou.");
    return;
  }
  if (offline) {
    s.pendingIncidents.push(m);
    t.busyUntil = Number.MAX_SAFE_INTEGER;
    return;
  }
  const probability = chance(m.attack, defenseStrength(to, s.time));
  const won = (rng ? rng() : random(s)) * 100 < probability;
  if (won) {
    const old = to.owner;
    if (to.team) {
      const defenseTeam = to.team;
      defenseTeam.recoverUntil = s.time + rules.recovery;
      const home = Object.values(s.properties).find(
        (p) =>
          p.type === "security" && p.owner === old && !p.team && p.id !== to.id,
      );
      if (home) home.team = defenseTeam;
      else
        s.companies[old] &&
          (s.companies[old].reserveTeams ??= []).push(defenseTeam);
    }
    const newOwner = "neutral";
    changeOwner(s, to.id, newOwner);
    report(
      s,
      `${s.companies[m.owner].name} venceu (${probability.toFixed(1)}%). ${s.properties[to.saleId].id}: ${newOwner === "neutral" ? "ponto neutro" : "ocupação inimiga"}.`,
    );
  } else {
    t.recoverUntil = s.time + rules.recovery;
    report(
      s,
      `${s.companies[m.owner].name} perdeu (${probability.toFixed(1)}%). Equipe em recuperação.`,
    );
  }
}
function salary(s, p, cost, kind) {
  if (s.companies[p.owner].cash >= cost) {
    spend(s, p.owner, cost, kind, p.id);
    return true;
  }
  report(s, `${p.id}: salário não pago.`);
  return false;
}
function tick(s, dt, offline, rng) {
  if(s.campaign?.outcome) return;
  const previous = s.time;
  s.time += dt;
  for (const p of Object.values(s.properties)) {
    if (p.type === "farm" && s.companies[p.owner]) {
      const need = Object.entries(p.cows).reduce(
        (n, [k, count]) => n + (count * rules.cows[k].feed * dt) / DAY,
        0,
      );
      const liters = Object.entries(p.cows).reduce(
        (n, [k, count]) => n + (count * rules.cows[k].milk * dt) / DAY,
        0,
      );
      const factor = Math.min(
        1,
        need ? Math.max(0, p.feed) / need : 0,
        liters ? Math.max(0, rules.milkCapacity - total(p.milk)) / liters : 0,
      );
      p.feed = Math.max(0, p.feed - need * factor);
      for (const [k, count] of Object.entries(p.cows))
        p.milk[k] =
          (p.milk[k] ?? 0) + ((count * rules.cows[k].milk * dt) / DAY) * factor;
    }
    if (p.type === "factory")
      for (const b of [...p.batches])
        if (b.due <= s.time) {
          const r = rules.recipes[b.recipe];
          if (b.phase === "production" && r.maturity) {
            b.phase = "maturation";
            b.due += r.maturity;
          } else {
            const key = `${b.recipe}:${b.quality}`;
            p.ready[key] = (p.ready[key] ?? 0) + 1;
            p.batches = p.batches.filter((v) => v !== b);
          }
        }
    if (p.type === "sale" && s.companies[p.owner] && p.sellerActive) {
      const key = Object.keys(p.stock).find((k) => p.stock[k] > 0);
      if (
        key &&
        p.demandRemaining > 0 &&
        p.till + rules.recipes[key.split(":")[0]].price <=
          rules.shopCashCapacity
      ) {
        p.saleProgress += dt;
        const interval = DAY / rules.sellerDaily;
        if (p.saleProgress >= interval) {
          p.saleProgress -= interval;
          p.stock[key]--;
          p.demandRemaining--;
          p.sales++;
          const price = rules.recipes[key.split(":")[0]].price;
          p.till += price;
          ledger(s, p.owner, 0, "Venda ao consumidor", p.id, price, 0);
        }
      }
    }
  }
  if (Math.floor(s.time / DAY) > Math.floor(previous / DAY)) {
    for (const p of Object.values(s.properties)) {
      if (p.type === "sale") {
        p.demandRemaining = rules.sellerDaily;
        if (p.seller && s.companies[p.owner])
          p.sellerActive = salary(
            s,
            p,
            rules.sellerSalary,
            "Salário de vendedor",
          );
      }
      if (p.type === "security" && p.team && s.companies[p.owner]) {
        if (salary(s, p, rules.teamSalary, "Salário de capangas")) {
          p.team.missedWages = 0;
          p.team.moral = Math.min(1, p.team.moral + 0.25);
        } else {
          p.team.missedWages++;
          p.team.moral = Math.max(0, p.team.moral - 0.5);
          if (p.team.missedWages >= 3) {
            p.team = null;
            report(s, `${p.id}: equipe abandonou o posto.`);
          }
        }
      }
    }
    for (const [owner, c] of Object.entries(s.companies)) {
      c.reserveTeams = (c.reserveTeams ?? []).filter((t) => {
        if (
          salary(
            s,
            { owner, id: t.id },
            rules.teamSalary,
            "Salário de capangas em reserva",
          )
        ) {
          t.missedWages = 0;
          t.moral = Math.min(1, t.moral + 0.25);
        } else {
          t.missedWages++;
          t.moral = Math.max(0, t.moral - 0.5);
        }
        return t.missedWages < 3;
      });
    }
  }
  const due = s.missions.filter((m) => m.due <= s.time);
  s.missions = s.missions.filter((m) => m.due > s.time);
  for (const m of due) resolve(s, m, offline, rng);
  if (s.time - s.lastAi >= rules.aiInterval) {
    s.lastAi = s.time;
    ai(s, offline);
  }
}
function ai(s, offline) {
  const owner = "coalho";
  const safe = (c) => {
    try {
      act(s, c, owner);
      updateCampaign(s);
    } catch {
      /* Mesmas regras e caixa finito; ação recusada não fornece recursos. */
    }
  };
  const farm = Object.values(s.properties).find(
      (p) => p.type === "farm" && p.owner === owner,
    ),
    factory = Object.values(s.properties).find(
      (p) => p.type === "factory" && p.owner === owner,
    ),
    shop = Object.values(s.properties).find(
      (p) => p.type === "sale" && p.owner === owner,
    );
  if (farm && factory) {
    if (farm.feed < 3) safe({ type: "buyFeed", id: farm.id, quantity: 3 });
    if (total(farm.milk) > 0)
      safe({ type: "collectMilk", id: farm.id, target: factory.id });
    if (factory.packaging < 1)
      safe({ type: "buyPackaging", id: factory.id, quantity: 5 });
    if (
      factory.milk.weak >= 5 &&
      !factory.batches.some((b) => b.phase === "production")
    )
      safe({
        type: "produce",
        id: factory.id,
        recipe: "frescal",
        quality: "weak",
      });
    if (shop) {
      if (!shop.seller) safe({ type: "hireSeller", id: shop.id });
      if (total(factory.ready) > 0)
        safe({ type: "collectCheese", id: factory.id, target: shop.id });
      if (shop.till > 0) safe({ type: "collectCash", id: shop.id });
    }
  }
  if (offline || s.time < rules.aiAggressionAfter) return;
  if(finalPurchaseAllowed(s,'farm-ze',owner)) {
    safe({type:'buyProperty',id:'farm-ze'});
    if(s.campaign?.outcome) return;
  }
  // Neutral territory is acquired with real money, never by an attack.
  const purchase = Object.values(s.properties).find(p =>
    p.type === "sale" && p.owner === "neutral" &&
    s.companies[owner].cash >= rules.propertyPrice &&
    Object.values(s.properties).some(home => home.type === "security" && home.owner === owner &&
      distance(home.id,p.securityId) <= rules.range));
  if (purchase) safe({type:"buyProperty",id:purchase.id});
  for (const post of Object.values(s.properties).filter(
    (p) => p.type === "security" && p.owner === owner,
  )) {
    if (!post.team) {
      const reserve = s.companies[owner].reserveTeams?.find(
        (t) => t.recoverUntil <= s.time && t.busyUntil <= s.time,
      );
      if (reserve)
        safe({ type: "deployReserve", id: post.id, teamId: reserve.id });
      else safe({ type: "hireTeam", id: post.id });
      continue;
    }
    if (!attackStrength(post.team, s.time) || post.team.cooldownUntil > s.time)
      continue;
    const candidates = Object.values(s.properties)
      .filter(
        (p) =>
          p.type === "security" &&
          p.owner !== owner &&
          p.owner !== "neutral" &&
          distance(post.id, p.id) <= rules.range &&
          !s.missions.some((m) => m.to === p.id),
      )
      .sort((a, b) => distance(post.id, a.id) - distance(post.id, b.id));
    const target = candidates[0];
    if (!target) continue;
    if (estimate(s, post.id, target.id).chance >= 45)
      safe({ type: "attack", id: post.id, target: target.id });
    break;
  }
}
export function advance(s, elapsed, { offline = false, rng } = {}) {
  requireThat(Number.isFinite(elapsed) && elapsed >= 0, "Tempo inválido.");
  const next = structuredClone(s);
  if(next.campaign?.outcome) return next;
  next.remainder += offline ? Math.min(elapsed, rules.offlineLimit) : elapsed;
  while (next.remainder >= rules.step) {
    if(next.campaign?.outcome) { next.remainder=0; break; }
    tick(next, rules.step, offline, rng);
    next.remainder -= rules.step;
  }
  return next;
}
export function resolvePending(s, { rng } = {}) {
  const next = structuredClone(s);
  const pending = next.pendingIncidents;
  next.pendingIncidents = [];
  for (const m of pending) resolve(next, m, false, rng);
  return next;
}
export function migrateSave(saved) {
  requireThat(
    saved?.version === 1 && saved.rulesVersion === rules.version,
    "Salvamento incompatível com esta versão de regras.",
  );
  const s = structuredClone(saved);
  if ((s.layoutVersion ?? 1) < 2) {
    const defaults = createGame(s.savedAt);
    for (const slot of ruralMap.slots) {
      const legacy = /^(farm-ze|factory-ze|farm-coalho|factory-coalho|sale-ze|sale-[ne]\d+)(-control)?$/.test(slot.id);
      requireThat(!legacy || s.properties?.[slot.id], 'Salvamento antigo incompleto.');
      if (!s.properties[slot.id])
        s.properties[slot.id] = defaults.properties[slot.id];
    }
    for (const [id, p] of Object.entries(s.properties))
      if (p.type === "land" && !ruralMap.slots.some((slot) => slot.id === id))
        delete s.properties[id];
    s.layoutVersion = 2;
  }
  if ((s.layoutVersion ?? 1) < 3) {
    // User-requested one-time correction of the two grey-marked town controls.
    const corrected = new Set();
    for (const id of ["sale-n1", "sale-n2"]) {
      const sale = s.properties[id], post = s.properties[`${id}-control`];
      if (!sale || !post || sale.owner === "player") continue;
      if (post.team) {
        const reserve = (s.companies[post.team.owner].reserveTeams ??= []);
        if (!reserve.some(t => t.id === post.team.id)) {
          post.team.busyUntil = 0;
          reserve.push(post.team);
        }
      }
      sale.owner = post.owner = "neutral";
      sale.seller = sale.sellerActive = false;
      post.team = null;
      corrected.add(post.id);
    }
    for (const collection of ["missions", "pendingIncidents"]) {
      s[collection] = s[collection].filter(m => {
        if (!corrected.has(m.from) && !corrected.has(m.to)) return true;
        const team = s.properties[m.from]?.team;
        if (team) team.busyUntil = 0;
        return false;
      });
    }
    s.layoutVersion = 3;
  }
  return s;
}
export function validateSave(s) {
  requireThat(
    s?.version === 1 && s.rulesVersion === rules.version,
    "Salvamento incompatível com esta versão de regras.",
  );
  requireThat(
    [1, 2, 4].includes(s.speed) &&
      Number.isFinite(s.time) &&
      s.time >= 0 &&
      Number.isFinite(s.savedAt),
    "Relógio inválido.",
  );
  requireThat(
    Array.isArray(s.missions) &&
      Array.isArray(s.ledger) &&
      Array.isArray(s.pendingIncidents) &&
      s.companies?.player &&
      s.companies?.coalho,
    "Estado incompleto.",
  );
  for (const slot of ruralMap.slots) {
    const p = s.properties?.[slot.id];
    requireThat(
      p &&
        p.type === slot.type &&
        ["player", "coalho", "neutral", "public"].includes(p.owner),
      "Propriedade inválida.",
    );
    if (p.type === "sale")
      requireThat(
        s.properties[p.securityId]?.owner === p.owner,
        "Controle territorial inconsistente.",
      );
    for (const stock of [p.milk, p.ready, p.stock, p.cows])
      if (stock)
        requireThat(
          Object.values(stock).every((n) => Number.isFinite(n) && n >= 0),
          "Estoque inválido.",
        );
  }
  for (const c of Object.values(s.companies))
    requireThat(Number.isFinite(c.cash) && c.cash >= 0, "Caixa inválido.");
  return s;
}
