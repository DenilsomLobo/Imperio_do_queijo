# IA rival — 15/10/2026

Implementação em `src/domain/ai.js`, integrada ao tick central em `game.js`. Não usa modelo de linguagem nem dinheiro infinito: é uma estratégia determinística sobre o estado real. Resultados militares continuam probabilísticos pelo sistema comum.

## Decisões

- Reavalia a cada cinco segundos do relógio-base. Modos de velocidade afetam esse intervalo pela simulação central.
- Coleta dinheiro de todas as lojas, contrata vendedores quando pode mantê-los, recolhe queijo e distribui leite entre todas as fábricas com espaço.
- Usa todas as receitas ativas por origem, ocupa linhas e compra embalagens conforme a necessidade imediata. Preserva limites físicos, capacidade e estoque compartilhado. Prioriza retorno por tempo de linha.
- Estima produção considerando ração parcial, meia produção sem ração, linhas, bônus dos funcionários, preço com bônus de lojas/vendedor, insumos e despesas. Alimentar precisa aumentar a margem projetada; não compra ração para produzir mais leite quando o gargalo da fábrica anula esse retorno.
- Reserva pelo menos duas diárias projetadas, mínimo R$ 100, mais dívidas conhecidas. Recolher caixa é transferência, sem nova receita. Projeções nunca entram no ledger.
- Compra uma vaca por ciclo produtivo, priorizando maior produção entre espécies que cabem no orçamento e na capacidade de processamento. Ao lotar fazendas, pode vender vaca antiga por 70% e comprar espécie superior; respeita três dias de aquisição. Funcionário nível 1 é contratado quando há estoque de leite em espera, margem e aceleração que justifiquem salário.
- A partir do segundo dia, compra lojas neutras conectadas diretamente por rua e procura demais imóveis para completar o domínio. Compras diretas têm preferência ao leilão de bens neutros/públicos.
- Adquire qualquer banco livre e a transportadora quando a empresa pode sustentar o serviço. Serviços rivais e imóveis não neutros são disputados pelo mesmo comando de leilão; não toma contratos gratuitamente nem mantém dois bancos.
- Em leilões, verifica caixa após reserva, necessidade operacional/estratégica e teto de avaliação mais 30 dias de margem. Defende bens próprios também pelas mesmas regras. Uma propriedade de domínio pode justificar expansão se a margem da empresa sustentar sua diária; não exige estar com a fábrica anterior lotada para todo objetivo final.
- Contrata equipes de nível 1 ao longo da rede com caixa e reserva operacional, incluindo postos longe da fronteira. Aproveita reservas recuperadas. Paga salários atrasados reais quando possível.
- Na fronteira direta com adversário, compra barricadas se há equipe inimiga, armamento e promoção com orçamento. Promoções que aumentam diária exigem margem. Recalcula candidatos e escolhe a melhor chance disponível, mínimo 55%, lançando no máximo um ataque por ciclo. Respeita rua direta, moral, recuperação, cooldown, missão existente, custo e bônus coletivo. Vitória neutraliza o alvo; compra posterior continua obrigatória.
- Offline mantém operação econômica, sem compra de vacas, funcionários, propriedades, serviços, leilões novos ou novos ataques. Salários, contratos e encerramento dos leilões existentes usam o relógio normal. Proteção de incidentes offline permanece.

## Interface e persistência

Menu Inimigos mostra última decisão, ações, reserva e projeção diária, com aviso de déficit ou caixa insuficiente. Valores são estimativas, não promessa de faturamento. `company.strategy` é metadado opcional salvo; campanhas anteriores passam a recebê-lo na próxima decisão. Nada reseta ou concede recursos ao carregar.

## Validação e limite econômico

Testes isolados cobrem cadeia com cinco receitas, várias propriedades, transferências, insumos, investimentos, salários, alimentação rentável e capacidade, preservação de caixa, fronteiras, offline, save/reload e vitória efetiva contra o jogador em cenário solvente. O cenário de vitória fornece caixa/rebanho explicitamente na fixture, nunca na campanha real.

O primeiro QA Chrome simulou 30 dias com o caixa inicial real de R$ 1.000 e os custos antigos: a empresa esgotava caixa. Com duas Magrelas e uma guarnição, a projeção era receita de R$ 25,25/dia contra R$ 77,50/dia de despesas. O usuário então autorizou ajustar a economia dos dois lados. A regra vigente em `BALANCEAMENTO_INICIAL.md` reduz ração e diárias básicas, preservando caixas R$ 500/R$ 1.000, produção e preços dos queijos. No novo teste de 30 dias, a empresa termina com 10 Magrelas, cinco lojas e R$ 690,58 de caixa, sem dinheiro gratuito (sorteios fixados em 0,99 para tornar a conferência reproduzível). Teste adicional confirma que o jogador inicial paga o ciclo de produção/venda de uma Magrela alimentada. Isso não garante vitória ou dificuldade perfeita em toda campanha.

Próximas evoluções: ajustar dificuldade com campanhas longas e decisões do jogador, planejamento com horizonte de caixa/retorno mais longo, distribuição tática de reservas e níveis adicionais de funcionários quando houver retorno. Não há garantia de vencer toda campanha nem onisciência sobre sorteios futuros.
