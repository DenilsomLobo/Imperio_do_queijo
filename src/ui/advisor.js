// "Próximo passo": sugere a ação mais útil agora, com base apenas no estado atual.
import { rules, factoryProfile } from '../data/game-rules.js';
import { shopCapacity, sharedShopStock, companyShops, shopIsActive } from '../domain/shop-stock.js';
import { activeWorkers } from '../domain/workers.js';
import { slotName } from './events.js';
import { BANKRUPTCY_GRACE } from '../domain/campaign.js';
import { DAY } from '../data/game-rules.js';

const sum = (stock) => Object.values(stock ?? {}).reduce((n, v) => n + v, 0);
const money = (n) => (n / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function nextStep(s, owner = 'player') {
  if (s.campaign?.outcome) return null;
  const company = s.companies[owner];
  const own = Object.values(s.properties).filter((p) => p.owner === owner);
  const farms = own.filter((p) => p.type === 'farm');
  const factories = own.filter((p) => p.type === 'factory');
  const shops = companyShops(s, owner);
  const step = (kind, icon, text, target, extra = {}) => ({ kind, icon, text, target, ...extra });

  if (s.insolventSince != null) {
    const hours = Math.max(0, Math.ceil(((BANKRUPTCY_GRACE - (s.time - s.insolventSince)) / DAY) * 24));
    return step('urgent', 'icon_money.png', `Falência em ${hours} h de jogo: sem caixa e sem como vender. Junte dinheiro para uma vaca (${money(rules.cows.weak.price)}) ou para reativar um vendedor.`, 'cow-shop');
  }
  const attacked = s.missions.find((m) => m.defender === owner);
  if (attacked) return step('urgent', 'icon_defesa.png', `Ataque a caminho de ${slotName(s.properties[attacked.to]?.saleId)}. Reforce a defesa!`, attacked.to);

  const late = own.find((p) => (p.workers ?? []).some((w) => w.missedWages > 0) || p.team?.missedWages > 0);
  if (late) return step('urgent', 'icon_money.png', `Salários atrasados em ${slotName(late.saleId ?? late.id)}. Pague antes que peçam demissão.`, late.id);

  const room = shopCapacity(s, owner) - sum(sharedShopStock(s, owner));
  const ready = factories.find((f) => sum(f.ready) > 0);
  if (ready && shops.length && room > 0) return step('action', 'icon_queijo.png', `Envie o queijo pronto da ${slotName(ready.id)} às lojas.`, ready.id, { collect: true });

  const till = shops.filter((p) => p.till >= 5000 || p.till >= rules.shopCashCapacity * 0.8).sort((a, b) => b.till - a.till)[0];
  if (till && !company.bank) return step('action', 'icon_money.png', `Recolha ${money(till.till)} da ${slotName(till.id)}.`, till.id, { collect: true });

  const factoryRoom = factories.some((f) => sum(f.milk) < rules.factoryMilkCapacity);
  const milky = farms.find((f) => sum(f.milk) >= 1);
  if (milky && factoryRoom && !company.logistics) return step('action', 'icon_leite.png', `Leve o leite da ${slotName(milky.id)} à queijaria.`, milky.id, { collect: true });

  const hungry = farms.find((f) => sum(f.cows) > 0 && f.feed < Object.entries(f.cows).reduce((n, [k, c]) => n + c * rules.cows[k].feed, 0) * 0.25);
  if (hungry) return step('warn', 'icon_racao.png', `Pouca ração na ${slotName(hungry.id)}: sem ela, as vacas produzem só 50%.`, hungry.id);

  const idle = factories.find((f) => !activeWorkers(f).length && sum(f.milk) >= 1 && f.packaging >= 1 && f.batches.filter((b) => b.phase === 'production').length < factoryProfile(f).lines);
  if (idle) return step('action', 'icon_queijo.png', `Produza queijo na ${slotName(idle.id)}: há leite e embalagens.`, idle.id);

  const noPack = factories.find((f) => f.packaging < 1 && sum(f.milk) >= 1);
  if (noPack) return step('warn', 'icon_embalagem.png', `Sem embalagens na ${slotName(noPack.id)}. Compre algumas para produzir.`, noPack.id);

  const noSeller = shops.find((p) => !shopIsActive(p));
  if (noSeller) return step('warn', 'icon_vendedor.png', `A ${slotName(noSeller.id)} não vende sem vendedor ativo.`, noSeller.id);

  const reserve = 20000;
  const cowRoom = farms.some((f) => sum(f.cows) < rules.farmCapacities[f.level - 1]);
  if (cowRoom && company.cash >= rules.cows.weak.price + reserve && farms.reduce((n, f) => n + sum(f.cows), 0) < 4)
    return step('grow', 'vaca_magrela.png', 'Mais vacas, mais leite: visite a Loja de vacas.', 'cow-shop');

  const manual = factories.find((f) => !(f.workers ?? []).length);
  if (manual && company.cash >= rules.workerTiers[1].hire + reserve)
    return step('grow', 'funcionario_nivel_1.png', 'Contrate um funcionário: a fábrica passa a produzir sozinha.', 'employee-agency');

  const neutral = Object.values(s.properties).find((p) => p.type === 'sale' && p.owner === 'neutral' && !s.auctions?.[p.id]);
  if (neutral && company.cash >= rules.propertyPrice + reserve)
    return step('grow', 'Ponto_de_venda_neutro.png', 'Abra outra loja: cada loja extra soma +10% no preço.', neutral.id);

  return step('grow', 'bandeira_capanga_aliado.png', 'Expanda o império: domine lojas, fazendas, fábricas, banco e transporte.', null, { manage: 'enemies' });
}
