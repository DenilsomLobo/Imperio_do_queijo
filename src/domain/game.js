import {runAi,aiEconomy} from './ai.js';
import {garrisonBonus,militaryReserve} from './security-network.js';
import {companyShops,shopCapacity,salePrice,shopIsActive,migrateShopStock} from './shop-stock.js';
import {placeBid,finishAuctions,validateAuctions,serviceKind} from "./auctions.js";
import {propertyPurchasePrice,factoryProfile} from "../data/game-rules.js";
import {processLogistics,validateLogistics} from "./logistics.js";
import { CLOCK_VERSION, migrateClock } from "./clock-migration.js";
import { bankPlan, validateBankContract, recordDailyEntry, ensureBankState, settleBankFees, payBankDebt, closeBankDays, processBankServices } from "./banking.js";
import { activeWorkers, productionMultiplier, workerCapacity, processWorkerPayroll } from "./workers.js";
import { dairy, discoveredMilk } from "../data/dairy.js";
import { ruralMap } from "../data/world.js";
import { rules, DAY } from "../data/game-rules.js";
import { updateCampaign } from './campaign.js';
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
  const entry = {
    id: s.nextId++,
    time: s.time,
    owner,
    amount,
    kind,
    property,
    revenue,
    expense,
  };
  s.ledger.push(entry);
  recordDailyEntry(c,entry);
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
    clockVersion:CLOCK_VERSION,
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
        shopStock:{},
        bank:null,
        logistics:null,
        bankDebt:0,
        cash: rules.initialCash,
        revenue: 0,
        expenses: 0,
        discoveredMilk: ["weak"],
      },
      coalho: {
        name: "Família Coalho",
        shopStock:{},
        bank:null,
        logistics:null,
        bankDebt:0,
        cash: rules.aiCash,
        discoveredMilk: ["weak"],
        revenue: 0,
        expenses: 0,
      },
    },
    properties: {},
    auctions: {},
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
        milkProgress: {},
        feed: 0,
        cowAges: ["farm-ze", "farm-coalho"].includes(slot.id) ? {weak:[0]} : {},
      });
    if (slot.type === "factory")
      Object.assign(p, {
        milk: { weak: ["factory-ze","factory-coalho"].includes(slot.id) ? rules.initialMilk : 0 },
        milkProgress: {},
        packaging: ["factory-ze","factory-coalho"].includes(slot.id) ? rules.initialPackaging : 0,
        ready:
          ["factory-ze","factory-coalho"].includes(slot.id)
            ? { "weak:weak": rules.initialCheese }
            : {},
        batches: [],
        workers: [],
        staffNotices: [],
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
      Object.assign(p, { saleId: slot.saleId, team: null, barricade: 0, staffNotices: [] });
    s.properties[p.id] = p;
  }
  ledger(s, "player", 0, "Saldo de abertura");
  ledger(s, "coalho", 0, "Saldo de abertura");

  return s;
}
export function attackStrength(t, time, state, owner=t?.owner) {
  return t && t.moral > 0 && t.busyUntil <= time && t.recoverUntil <= time
    ? t.count *
        rules.stars[t.stars - 1] *
        (1 + t.weapon * rules.weaponBonus) *
        t.moral * (1+garrisonBonus(state,owner))
    : 0;
}
export function defenseStrength(post, time, state) {
  const t = post.team;
  return (
    (attackStrength(t, time, state, post.owner) * (1 + post.barricade * rules.barricadeBonus)) /
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
export function roadConnected(from, to) {
  const a=ruralMap.slots.find(p=>p.id===from), b=ruralMap.slots.find(p=>p.id===to);
  const saleA=a?.type==='security'?a.saleId:a?.id, saleB=b?.type==='security'?b.saleId:b?.id;
  return Boolean(saleA && saleB && saleA!==saleB && ruralMap.roads.some(r=>(r.from===saleA&&r.to===saleB)||(r.from===saleB&&r.to===saleA)));
}
export function estimate(s, from, to) {
  const a = s.properties[from],
    d = s.properties[to];
  requireThat(
    a?.type === "security" && d?.type === "security",
    "Selecione postos de segurança.",
  );
  const attack = attackStrength(a.team, s.time, s, a.owner),
    defense = defenseStrength(d, s.time, s);
  return {
    attack,
    defense,
    chance: chance(attack, defense),
    distance: distance(from, to),
    connected: roadConnected(from,to),
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
  if(c.type==='bidProperty') {
    if(p?.type==='service') {
      const contract=serviceKind(p)==='bank'?s.companies[owner]?.bank:s.companies[owner]?.logistics;
      requireThat(!contract||contract.propertyId===p.id||!s.auctions?.[contract.propertyId],'Seu contrato atual está em disputa.');
    }
    placeBid(s,c.id,owner,c.amount,(...args)=>ledger(s,...args));
    report(s,p.id+': novo lance reservado por '+s.companies[owner].name+'.');return;
  }
  if (c.type === "buyProperty") {
    requireThat(
      ["sale", "farm", "factory"].includes(p?.type) && p.owner === "neutral" && !s.auctions?.[p.id],
      "Apenas propriedades neutras podem ser compradas.",
    );
    spend(
      s,
      owner,
      propertyPurchasePrice(p),
      "Compra de propriedade",
      p.id,
    );
    p.owner = owner;
    if (p.securityId) s.properties[p.securityId].owner = owner;
    return;
  }
  if(c.type==='hireBank' || c.type==='cancelBank') {
    const slot=ruralMap.slots.find(slot=>slot.id===c.id);
    requireThat(p?.type==='service' && slot?.service==='bank','Selecione um banco.');
    const company=s.companies[owner];
    requireThat(!s.auctions?.[p.id] && !s.auctions?.[company.bank?.propertyId],'Contrato em leilão: aguarde o encerramento.');
    requireThat(['public','neutral',owner].includes(p.owner),'Serviço de outra empresa: faça um lance.');
    if(c.type==='cancelBank') {
      requireThat(company.bank,'Não há serviço bancário contratado.');
      settleBankFees(s,owner,(...args)=>ledger(s,...args));
      payBankDebt(s,owner,(...args)=>ledger(s,...args));
      if(company.bank && s.properties[company.bank.propertyId]) s.properties[company.bank.propertyId].owner='public';
      company.bank=null;
      report(s,'Serviço bancário cancelado. Novas coletas serão manuais.');
    } else {
      const plan=bankPlan(p.level);
      requireThat(plan,'Plano bancário inválido.');
      requireThat(company.bank?.level!==p.level,'Este serviço bancário já está ativo.');
      const previousDebt=bankPlan(company.bank?.level) ? Math.round(Math.max(0,company.dailyFinance.revenue-company.dailyFinance.expenses+company.dailyFinance.bankFees-company.dailyFinance.taxedProfit)*bankPlan(company.bank.level).rate) : 0;
      requireThat(company.cash>=plan.hire+previousDebt+company.bankDebt,'Caixa insuficiente para contratar e quitar taxas pendentes.');
      settleBankFees(s,owner,(...args)=>ledger(s,...args));
      payBankDebt(s,owner,(...args)=>ledger(s,...args));
      spend(s,owner,plan.hire,'Contratação de serviço bancário',p.id);
      if(company.bank && company.bank.propertyId!==p.id)s.properties[company.bank.propertyId].owner='public';
      p.owner=owner;
      company.bank={level:p.level,propertyId:p.id,startedAt:s.time};
      report(s,'Serviço bancário nível '+p.level+' contratado. Contrato anterior substituído.');
    }
    return;
  }
  if(c.type==='hireLogistics' || c.type==='cancelLogistics') {
    const slot=ruralMap.slots.find(slot=>slot.id===c.id);
    requireThat(p?.type==='service' && slot?.service==='logistics','Selecione a transportadora.');
    const company=s.companies[owner];
    requireThat(!s.auctions?.[p.id],'Contrato em leilão: aguarde o encerramento.');
    requireThat(['public','neutral',owner].includes(p.owner),'Serviço de outra empresa: faça um lance.');
    if(c.type==='hireLogistics') {
      requireThat(!company.logistics,'Transportadora já contratada.');
      spend(s,owner,rules.logistics.hire,'Contratação da transportadora',p.id);
      p.owner=owner;
      company.logistics={propertyId:p.id,startedAt:s.time,nextFeeAt:s.time+DAY,suspended:false,milkMoved:0,cheeseMoved:0};
      report(s,'Transportadora contratada: fazenda → fábrica → loja automaticamente.');
    } else {
      requireThat(company.logistics,'Não há transportadora contratada.');
      company.logistics=null;p.owner='public';report(s,'Serviço da transportadora cancelado.');
    }
    return;
  }
  own(s, c.id, owner);
  if(['buyCow','sellCow','moveCow','hireWorker'].includes(c.type)) requireThat(!s.auctions?.[p.id] && !s.auctions?.[c.target],'Não altere vacas ou funcionários enquanto a propriedade estiver em leilão.');
  switch (c.type) {
    case "buyFeed":
      requireThat(p.type === "farm", "Selecione uma fazenda.");
      requireThat(
        Number.isInteger(c.quantity) && c.quantity > 0 && c.quantity <= rules.supplyPurchaseLimit,
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
      p.cowAges ??= Object.fromEntries(Object.entries(p.cows).map(([k,n]) => [k, Array(n).fill(0)]));
      (p.cowAges[c.species] ??= []).push(s.time);
      p.cows[c.species] = (p.cows[c.species] ?? 0) + 1;
      break;
    }
    case "moveCow":
    case "sellCow": {
      requireThat(p.type === 'farm' && rules.cows[c.species], 'Selecione uma espécie válida.');
      requireThat(Number.isInteger(c.quantity) && c.quantity > 0 && c.quantity <= (p.cows[c.species] ?? 0), 'Quantidade de vacas inválida.');
      p.cowAges ??= Object.fromEntries(Object.entries(p.cows).map(([k,n]) => [k, Array(n).fill(0)]));
      const ages = [...(p.cowAges[c.species] ?? [])].sort((a,b)=>a-b);
      if(c.type === 'sellCow') {
        requireThat(ages.filter(t => s.time-t >= rules.cowResaleDelay).length >= c.quantity, 'Aguarde 3 dias de jogo após a compra para vender.');
        ledger(s, owner, Math.round(rules.cows[c.species].price * rules.cowResaleRatio) * c.quantity, 'Venda de vacas', p.id);
      } else {
        const dest = own(s,c.target,owner);
        requireThat(dest.type === 'farm' && dest.id !== p.id, 'Selecione outra fazenda.');
        requireThat(total(dest.cows)+c.quantity <= rules.farmCapacities[dest.level-1], 'Fazenda de destino sem vagas.');
        dest.cowAges ??= Object.fromEntries(Object.entries(dest.cows).map(([k,n]) => [k, Array(n).fill(0)]));
        (dest.cowAges[c.species] ??= []).push(...ages.slice(0,c.quantity));
        dest.cows[c.species] = (dest.cows[c.species] ?? 0)+c.quantity;
      }
      p.cows[c.species] -= c.quantity;
      p.cowAges[c.species] = ages.slice(c.quantity);
      break;
    }
    case "collectMilk": {
      requireThat(p.type === "farm", "Selecione uma fazenda.");
      const f = own(s, c.target, owner);
      requireThat(f.type === "factory", "Destino deve ser uma fábrica.");
      requireThat(
        transfer(p.milk, f.milk, Math.floor(rules.factoryMilkCapacity-total(f.milkProgress ?? {}))) > 0,
        "Sem leite disponível ou fábrica cheia.",
      );
      // Conserve o progresso anterior sem expor ou transferir frações como estoque pronto.
      f.milkProgress ??= {};
      for(const [k,n] of Object.entries(p.milkProgress ?? {})) {
        const pending=Math.min(n,Math.max(0,rules.factoryMilkCapacity-total(f.milk)-total(f.milkProgress)));
        f.milkProgress[k]=(f.milkProgress[k] ?? 0)+pending;
        p.milkProgress[k]-=pending;
        const completed=Math.floor(f.milkProgress[k]+1e-9);
        f.milk[k]=(f.milk[k] ?? 0)+completed;
        f.milkProgress[k]=Math.max(0,f.milkProgress[k]-completed);
      }
      break;
    }
    case "buyPackaging":
      requireThat(p.type === "factory", "Selecione uma fábrica.");
      requireThat(
        Number.isInteger(c.quantity) && c.quantity > 0 && c.quantity <= rules.supplyPurchaseLimit,
        "Quantidade inválida.",
      );
      spend(s, owner, c.quantity * rules.packagingPrice, "Embalagens", p.id);
      p.packaging += c.quantity;
      break;
    case "produce": {
      const r = rules.recipes[c.recipe];
      requireThat(p.type === "factory" && r, "Receita inválida.");
      requireThat(r.quality, "Receita antiga disponível apenas para lotes já iniciados.");
      requireThat(dairy[c.quality], "Tipo de leite inválido.");
      requireThat(!r.quality || r.quality === c.quality, "Este queijo exige o leite da mesma origem.");
      requireThat(
        p.batches.filter((b) => b.phase === "production").length <
          factoryProfile(p).lines,
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
      requireThat(companyShops(s,owner).length>0, "Compre uma loja para enviar o queijo.");
      requireThat(
        transfer(p.ready, s.companies[owner].shopStock, shopCapacity(s,owner)) > 0,
        "Sem queijo pronto ou estoque compartilhado cheio.",
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
    case 'hireWorker': {
      const tier=rules.workerTiers[c.level];
      requireThat(p.type==='factory' && Number.isInteger(c.level) && tier,'Selecione uma fábrica e nível válido.');
      requireThat((p.workers ?? []).length<workerCapacity(p),'Fábrica sem vagas para funcionários.');
      spend(s,owner,tier.hire,'Contratação de funcionário',p.id);
      (p.workers ??= []).push({id:'worker-'+s.nextId++,level:c.level,missedWages:0,nextWageAt:s.time+DAY});
      break;
    }
    case 'payWorkerWages': {
      requireThat(p.type==='factory','Selecione uma fábrica.');
      const owed=(p.workers ?? []).reduce((n,w)=>n+w.missedWages*rules.workerTiers[w.level].salary,0);
      requireThat(owed>0,'Sem salários em atraso.');
      spend(s,owner,owed,'Salários atrasados de funcionários',p.id);
      p.workers.forEach(w=>w.missedWages=0);
      break;
    }
    case 'payTeamWages': {
      requireThat(p.type==='security' && p.team?.missedWages>0,'Sem salários de capangas em atraso.');
      spend(s,owner,p.team.missedWages*rules.teamSalaries[p.team.stars-1],'Salários atrasados de capangas',p.id);
      p.team.missedWages=0;p.team.moral=Math.min(1,p.team.moral+.25);
      break;
    }
    case 'dismissStaffNotices':
      requireThat(['factory','security'].includes(p.type),'Estabelecimento sem avisos de pessoal.');
      p.staffNotices=[];
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
      spend(s, owner, rules.teamHirePrices[tier-1], "Contratação de capangas", p.id);
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
      spend(s, owner, rules.weaponUpgrade[p.team.weapon], "Armamento", p.id);
      p.team.weapon++;
      break;
    case "upgradeBarricade":
      requireThat(
        p.type === "security" && p.barricade < 3,
        "Barricada máxima.",
      );
      spend(s, owner, rules.barricadeUpgrade[p.barricade], "Barricadas", p.id);
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
        p.team.cooldownUntil <= s.time && attackStrength(p.team, s.time, s, owner) > 0,
        "Equipe ocupada, em recuperação ou cooldown.",
      );
      requireThat(roadConnected(p.id, d.id), "Alvo sem rua direta entre as lojas.");
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
  migrateShopStock(next);
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
function settleRetaliation(s) {
  for(const [owner,company] of Object.entries(s.companies)) {
    company.retaliationDebts=(company.retaliationDebts ?? []).filter(debt=>{
      if(!s.companies[debt.to]) return true;
      const paid=Math.min(company.cash,debt.amount);
      if(paid>0) {
        spend(s,owner,paid,"Retaliação: defesa vencedora",debt.property);
        ledger(s,debt.to,paid,"Prêmio por defesa vencedora",debt.property,paid,0);
        debt.amount-=paid;
      }
      return debt.amount>0;
    });
  }
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
  const probability = chance(m.attack, defenseStrength(to, s.time, s));
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
    if(s.companies[m.owner] && s.companies[to.owner]) {
      const level=to.team?.stars ?? 1;
      const amount=rules.retaliationByLevel[level-1];
      (s.companies[m.owner].retaliationDebts ??= []).push({to:to.owner,amount,property:to.id});
      settleRetaliation(s);
      report(s,`Defesa nível ${level} venceu: ${s.companies[m.owner].name} deve pagar R$ ${amount/100} ao defensor. Saldo não pago permanece pendente.`);
    }
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
function transferAuctionProperty(s,p,owner){
  if(p.type==='service'){
    const kind=serviceKind(p),old=p.owner;
    if(kind==='bank'){
      if(s.companies[old]?.bank?.propertyId===p.id){settleBankFees(s,old,(...args)=>ledger(s,...args));payBankDebt(s,old,(...args)=>ledger(s,...args));s.companies[old].bank=null;}
      const c=s.companies[owner];
      if(c.bank){settleBankFees(s,owner,(...args)=>ledger(s,...args));payBankDebt(s,owner,(...args)=>ledger(s,...args));if(c.bank.propertyId!==p.id)s.properties[c.bank.propertyId].owner='public';}
      c.bank={level:p.level,propertyId:p.id,startedAt:s.time};
    }else{
      if(s.companies[old]?.logistics?.propertyId===p.id)s.companies[old].logistics=null;
      s.companies[owner].logistics={propertyId:p.id,startedAt:s.time,nextFeeAt:s.time+DAY,suspended:false,milkMoved:0,cheeseMoved:0};
    }
  }
  p.owner=owner;
}
function tick(s, dt, offline, rng) {
  if(s.campaign?.outcome) return;
  migrateShopStock(s);
  const previous = s.time;
  if(Math.floor((previous+dt)/DAY)>Math.floor(previous/DAY)) {
    // As vendas finais pertencem ao dia encerrado, antes da apuração bancária.
    s.time=Math.floor((previous+dt)/DAY)*DAY-1;
    for(const [owner,company] of Object.entries(s.companies)) {
      const shops=companyShops(s,owner).filter(shopIsActive);
      if(!shops.length)continue;
      for(const [key,quantity] of Object.entries(company.shopStock)) {
        let remaining=quantity;
        for(let i=0;i<shops.length && remaining>0;i++){
          const shop=shops[i],sold=Math.ceil(remaining/(shops.length-i));
          const price=salePrice(s,owner,key.split(':')[0],shop);
          remaining-=sold;company.shopStock[key]-=sold;shop.sales+=sold;shop.till+=sold*price;
          ledger(s,owner,0,'Venda ao consumidor',shop.id,sold*price,0);
        }
      }
      for(const shop of shops)shop.saleProgress=0;
    }
  }
  s.time = previous+dt;
  closeBankDays(s,(...args)=>ledger(s,...args));
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
      const fed = need ? Math.min(1, Math.max(0,p.feed)/need) : 0;
      const efficiency = rules.unfedProduction + (1-rules.unfedProduction)*fed;
      const progress = (p.milkProgress ??= {});
      const room = Math.max(0,rules.milkCapacity-total(p.milk));
      const capacity = liters ? Math.min(1,room/(liters*efficiency)) : 0;
      p.feed = Math.max(0,p.feed-need*fed*capacity);
      if(p.feed<1e-9) p.feed=0;
      for(const [k,count] of Object.entries(p.cows)) {
        progress[k]=(progress[k] ?? 0)+(count*rules.cows[k].milk*dt/DAY)*efficiency*capacity;
        const completed = Math.min(Math.floor(progress[k]+1e-9),rules.milkCapacity-total(p.milk));
        if(completed>0) {
          progress[k]=Math.max(0,progress[k]-completed);
          p.milk[k]=(p.milk[k] ?? 0)+completed;
          const known=(s.companies[p.owner].discoveredMilk ??= []);
          if(!known.includes(k)) known.push(k);
        }
      }
    }
    if (p.type === 'factory') {
      if(s.companies[p.owner]) processWorkerPayroll(s,p,
        cost=>spend(s,p.owner,cost,'Salário de funcionário',p.id),text=>report(s,p.id+': '+text));
      const bonus=productionMultiplier(p)-1;
      for (const b of [...p.batches]) {
        if(b.phase==='production') b.due-=dt*bonus;
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
      }
      if(activeWorkers(p).length && s.companies[p.owner]) {
        while(p.batches.filter(b=>b.phase==='production').length<factoryProfile(p).lines && total(p.ready)+p.batches.length<rules.cheeseCapacity) {
          const entry=Object.entries(rules.recipes).find(([,r])=>r.quality && (p.milk[r.quality] ?? 0)>=r.milk);
          if(!entry) break;
          if(p.packaging<1) {
            if(s.companies[p.owner].cash<rules.packagingPrice) break;
            act(s,{type:'buyPackaging',id:p.id,quantity:1},p.owner);
          }
          act(s,{type:'produce',id:p.id,recipe:entry[0],quality:entry[1].quality},p.owner);
        }
      }
    }
    if (p.type === "sale" && s.companies[p.owner] && shopIsActive(p)) {
      const stock=s.companies[p.owner].shopStock;
      const key = Object.keys(stock).find((k) => stock[k] > 0);
      if (
        key &&
        p.demandRemaining > 0 &&
        p.till + salePrice(s,p.owner,key.split(':')[0],p) <=
          rules.shopCashCapacity
      ) {
        p.saleProgress += dt;
        const interval = DAY / rules.sellerDaily;
        if (p.saleProgress >= interval) {
          p.saleProgress -= interval;
          stock[key]--;
          p.demandRemaining--;
          p.sales++;
          const price = salePrice(s,p.owner,key.split(':')[0],p);
          p.till += price;
          ledger(s, p.owner, 0, "Venda ao consumidor", p.id, price, 0);
        }
      }
    }
  }
  if (Math.floor(s.time / DAY) > Math.floor(previous / DAY)) {
    for (const p of Object.values(s.properties)) {
      if(p.type==='factory' && s.companies[p.owner] && factoryProfile(p).daily>0) {
        p.maintenanceDebt=(p.maintenanceDebt ?? 0)+factoryProfile(p).daily;
        const paid=Math.min(s.companies[p.owner].cash,p.maintenanceDebt);
        if(paid>0){spend(s,p.owner,paid,"Manutenção de queijaria",p.id);p.maintenanceDebt-=paid;}
        if(p.maintenanceDebt>0)report(s,p.id+": manutenção da queijaria pendente.");
      }
      if (p.type === "sale") {
        if(s.companies[p.owner]) {
          p.maintenanceDebt=(p.maintenanceDebt ?? 0)+rules.shopDailyMaintenance;
          const paid=Math.min(s.companies[p.owner].cash,p.maintenanceDebt);
          if(paid>0) {spend(s,p.owner,paid,"Manutenção de loja",p.id);p.maintenanceDebt-=paid;}
          if(p.maintenanceDebt>0) report(s,p.id+": manutenção da loja pendente.");
        }
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
        if (salary(s, p, rules.teamSalaries[p.team.stars-1]*(p.team.missedWages+1), "Salário de capangas")) {
          p.team.missedWages = 0;
          p.team.moral = Math.min(1, p.team.moral + 0.25);
        } else {
          p.team.missedWages++;
          p.team.moral = Math.max(0, p.team.moral - 0.5);
          if (p.team.missedWages >= rules.unpaidDaysBeforeDeparture) {
            (p.staffNotices ??= []).push({id:p.team.id,time:s.time,text:"Capangas pediram demissão após 4 dias sem salário."});
            p.team = null;
            report(s, `${p.id}: capangas pediram demissão após 4 dias sem salário.`);
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
            rules.teamSalaries[t.stars-1]*(t.missedWages+1),
            "Salário de capangas em reserva",
          )
        ) {
          t.missedWages = 0;
          t.moral = Math.min(1, t.moral + 0.25);
        } else {
          t.missedWages++;
          t.moral = Math.max(0, t.moral - 0.5);
        }
        if(t.missedWages>=rules.unpaidDaysBeforeDeparture) report(s,t.id+": capangas em reserva pediram demissão após 4 dias sem salário.");
        return t.missedWages < rules.unpaidDaysBeforeDeparture;
      });
    }
  }
  processLogistics(s,(c,owner)=>act(s,c,owner),(...args)=>ledger(s,...args));
  processBankServices(s,(...args)=>ledger(s,...args));
  settleRetaliation(s);
  finishAuctions(s,(...args)=>ledger(s,...args),(p,owner)=>transferAuctionProperty(s,p,owner),text=>report(s,text));
  updateCampaign(s);
  if(!offline && !s.campaign?.outcome) staffAiShops(s);
  const due = s.missions.filter((m) => m.due <= s.time);
  s.missions = s.missions.filter((m) => m.due > s.time);
  for (const m of due) resolve(s, m, offline, rng);
  if (s.time - s.lastAi >= rules.aiInterval) {
    s.lastAi = s.time;
    ai(s, offline);
  }
}
function staffAiShops(s,owner='coalho'){
  for(const shop of Object.values(s.properties).filter(p=>p.type==='sale'&&p.owner===owner)){
    const post=s.properties[shop.securityId];if(!post||post.owner!==owner||post.team)continue;
    const reserve=s.companies[owner].reserveTeams?.find(t=>t.count>0&&t.recoverUntil<=s.time&&t.busyUntil<=s.time);
    try{
      if(reserve)act(s,{type:'deployReserve',id:post.id,teamId:reserve.id},owner);
      else if(s.companies[owner].cash>=rules.teamHirePrices[0]+Math.max(militaryReserve(s,owner,rules.teamSalaries[0]),aiEconomy(s,owner).reserve+2*rules.teamSalaries[0]))act(s,{type:'hireTeam',id:post.id,level:1},owner);
    }catch{/* Commands retain their normal ownership, availability and cash checks. */}
  }
}
function ai(s, offline) {
  runAi(s,{act,estimate,roadConnected},offline);
  updateCampaign(s);
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
  migrateClock(s);
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
  s.auctions ??= {};
  for(const company of Object.values(s.companies)){
    if(company.bank && s.properties[company.bank.propertyId]?.owner==='public')s.properties[company.bank.propertyId].owner=Object.keys(s.companies).find(id=>s.companies[id]===company);
    if(company.logistics && s.properties[company.logistics.propertyId]?.owner==='public')s.properties[company.logistics.propertyId].owner=Object.keys(s.companies).find(id=>s.companies[id]===company);
  }
  for(const p of Object.values(s.properties)) if(p.type === "farm" && !p.cowAges)
    p.cowAges=Object.fromEntries(Object.entries(p.cows).map(([k,n])=>[k,Array(n).fill(s.time)]));
  for(const p of Object.values(s.properties)) if(p.milk) {
    p.milkProgress ??= {};
    for(const [k,n] of Object.entries(p.milk)) if(n%1) {
      p.milkProgress[k]=(p.milkProgress[k] ?? 0)+(n-Math.floor(n));
      p.milk[k]=Math.floor(n);
    }
  }
  for(const p of Object.values(s.properties)) {
    const slot=ruralMap.slots.find(slot=>slot.id===p.id);
    if(slot?.service==='bank') p.level=slot.level;
    if(p.type==='factory') {p.workers ??= [];p.staffNotices ??= [];}
    if(p.type==='security') p.staffNotices ??= [];
  }
  for(const owner of Object.keys(s.companies)) {
    s.companies[owner].bank ??= null;
    s.companies[owner].logistics ??= null;
    ensureBankState(s,owner);
    s.companies[owner].discoveredMilk=discoveredMilk(s,owner);
  }
  migrateShopStock(s);
  return s;
}
export function validateSave(s) {
  if(s?.playerProfile)requireThat(
    typeof s.playerProfile.id==='string' && /^[a-z0-9-]{1,100}$/i.test(s.playerProfile.id) &&
    typeof s.playerProfile.name==='string' && s.playerProfile.name.trim().length>=2 && s.playerProfile.name.length<=30 && !/[\u0000-\u001f<>]/.test(s.playerProfile.name),
    'Perfil de jogador inválido.',
  );
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
    if(p.type==='factory') {
      requireThat(Array.isArray(p.workers ?? []) && (p.workers ?? []).length<=workerCapacity(p),'Funcionários inválidos.');
      for(const w of p.workers ?? []) requireThat(rules.workerTiers[w.level] && Number.isInteger(w.missedWages) && w.missedWages>=0 && w.missedWages<rules.unpaidDaysBeforeDeparture && Number.isFinite(w.nextWageAt),'Funcionário inválido.');
    }
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
  requireThat(validateAuctions(s),'Leilão inválido.');
  for (const c of Object.values(s.companies)) {
    requireThat(Object.entries(c.shopStock ?? {}).every(([key,n])=>rules.recipes[key.split(':')[0]]&&dairy[key.split(':')[1]]&&Number.isSafeInteger(n)&&n>=0),'Estoque compartilhado inválido.');
    requireThat(Number.isFinite(c.cash) && c.cash >= 0, "Caixa inválido.");
    requireThat(validateBankContract(c),"Contrato bancário inválido.");
    requireThat(validateLogistics(c),"Contrato de transportadora inválido.");
  }
  return s;
}
