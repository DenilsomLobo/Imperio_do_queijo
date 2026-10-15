# IA estratégica e economia inicial — 15/10/2026

Regra posterior vigente: o usuário autorizou ajustar a economia inicial dos dois lados após a simulação demonstrar déficit estrutural. Esta atualização substitui os valores anteriores conflitantes, sem reset, reembolso ou alteração retroativa de saldos/dívidas.

- Preservar caixa inicial do jogador em R$ 500 e rival em R$ 1.000, produção alimentada de um litro/vaca/dia e metade sem ração, consumos por espécie, preços de compra e preços dos queijos.
- Ração: R$ 0,25/unidade, ou R$ 2,50 por dez. Compras manuais e cálculos da IA usam `rules.feedPrice=25` centavos.
- Manutenção de loja: R$ 5/dia (`shopDailyMaintenance=500`).
- Vendedor: contratação permanece R$ 50; salário passa a R$ 5/dia (`sellerSalary=500`).
- Capangas nível 1: contratação permanece R$ 125/equipe; salário passa a R$ 5/dia (`teamSalaries[0]` e alias `teamSalary=500`). Níveis 2/3 mantêm R$ 50/R$ 100 por dia. Funcionários de fábrica e demais contratos não mudam de preço.
- Novos valores valem nas próximas compras/diárias tanto do jogador quanto da IA, inclusive campanhas existentes. Não recalcular dívidas anteriores nem conceder dinheiro gratuito.
- Com uma Magrela alimentada, uma loja com vendedor e equipe nível 1, receita-base potencial é R$ 25,25/dia; ração R$ 2,50, embalagem R$ 2,50 e três diárias de R$ 5 totalizam R$ 20. Margem operacional de R$ 5,25/dia antes de outros gastos, respeitando coleta, processamento e venda efetiva. Sem equipe, margem R$ 10,25. Investimentos de aquisição não são incluídos nessa margem diária.

## Comportamento estratégico vigente

- IA decide a cada cinco segundos-base pelo relógio central, com economia real em todas as fazendas, fábricas e lojas. Fabrica os cinco queijos por origem, compra insumos, recolhe estoques/caixas e contrata vendedores e funcionários com validação de retorno e orçamento.
- Estima receita, despesas, capacidade, alimentação parcial, salários e dívidas; mantém pelo menos duas diárias projetadas, mínimo R$ 100, mais pendências conhecidas antes de investimentos. Compra ração somente se melhorar margem considerando gargalos de fabricação. Projeções não geram lançamentos financeiros.
- Investe em vacas com dinheiro real e vagas; pode substituir vacas por espécies superiores respeitando revenda após três dias e 70% do valor. Uma decisão de investimento no rebanho por ciclo, evitando compra ilimitada instantânea.
- Busca todas as lojas/fazendas/fábricas, qualquer banco e a transportadora para cumprir os 24 objetivos. Expansão de lojas mantém vizinhança por rua. Usa compra direta para neutros e contratação de serviços públicos; disputa bens rivais por leilão com reserva, necessidade operacional/estratégica e teto de avaliação mais 30 dias de margem. Contratos continuam exclusivos e transferidos pelas regras reais.
- Equipa sua rede de lojas, aproveita reservas recuperadas, considera bônus coletivo e paga atrasos quando possível. Melhora armamento, barricadas e estrelas na fronteira se o caixa permite; promoção considera o aumento salarial. Ataca o melhor vizinho disponível com chance mínima central de 55%, máximo um ataque por ciclo; mantém custos, ruas diretas, missões, moral, cooldown, recuperação e neutralização seguida de compra.
- Offline mantém operação econômica e prazos existentes, sem novos investimentos estratégicos, novos lances ou novos ataques. Incidentes militares offline preservam proteção existente.
- Menu Inimigos mostra última decisão e projeção real da IA, distinguindo estimativa de receita garantida. Campanhas antigas passam a usar a estratégia sem reset; metadado `company.strategy` é opcional e persistido.

Detalhes e limitações em `docs/IA_ATUAL.md`. A IA é baseada em regras e orçamento, sem prever sorteios. Evoluções de planejamento de longo prazo continuam no roadmap; não declarar todo o mestre concluído.
