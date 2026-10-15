# Economia atual — 14/10/2026

Dinheiro inicial de novas campanhas: R$ 500. Saves existentes preservados.

| Vaca | Compra | Rações/dia | Custo da ração/dia |
|---|---:|---:|---:|
| Magrela | R$ 250 | 10 | R$ 25 |
| Mimosa | R$ 1.250 | 20 | R$ 50 |
| Premiada | R$ 2.500 | 40 | R$ 100 |
| Radioativa | R$ 18.000 | 80 | R$ 200 |
| Mágica | R$ 36.000 | 100 | R$ 250 |

Ração R$ 2,50/unidade (R$ 25 por 10). Cada vaca alimentada produz 1 L/dia; sem ração produz metade.

| Queijo | Produção base em 1× | Venda por unidade |
|---|---:|---:|
| Fraco | 1 min | R$ 25 |
| Comum | 3 min | R$ 50 |
| Nobre | 5 min | R$ 100 |
| Radioativo | 10 min | R$ 200 |
| Mágico | 15 min | R$ 400 |

Cada receita produz uma unidade, usa 1 L do leite correspondente e uma embalagem (R$ 2,50; pacote de 10 por R$ 25), sem maturação adicional. Funcionários ativos aceleram fabricação: tempo base / (1 + soma dos bônus de 5%, 10% ou 15% por nível). Modo 2× divide tempos-base por 5/3; modo 4× divide por 5.

Vendas graduais durante o dia: uma unidade por vez a cada 1/20 de dia. Ao final do dia, todo estoque restante é vendido, com vendedor ativo, independentemente do limite gradual e do teto de caixa. Vendedor custa R$ 150 para contratar e R$ 35/dia. Abrir loja custa R$ 500, manutenção R$ 25/dia por loja, separada do vendedor.

| Equipe de capangas (3 integrantes) | Contratação | Salário da equipe/dia |
|---|---:|---:|
| Nível 1 | R$ 125 | R$ 25 |
| Nível 2 | R$ 3.000 | R$ 50 |
| Nível 3 | R$ 9.000 | R$ 100 |

Contratação e salário são por equipe, sem compra individual.

| Funcionário | Contratação | Salário/dia | Bônus individual |
|---|---:|---:|---:|
| Nível 1 | R$ 250 | R$ 25 | +5% |
| Nível 2 | R$ 4.000 | R$ 350 | +10% |
| Nível 3 | R$ 8.000 | R$ 600 | +15% |

Salários seguem dias de jogo: 5 min em 1×, 3 min em 2×, 1 min em 4×. Após quatro dias sem salário funcionários/capangas se demitem.


## Produção, venda e custos revisados — 14/10/2026
- Receita por unidade em tempo-base 1×: Fraco 1 min, Comum 3 min, Nobre 5 min, Radioativo 10 min e Mágico 15 min. Relógio central escala fabricação com os modos 1×/2×/4× (dias de 5/3/1 min). Bônus dos funcionários continuam acelerando. Sem bônus e com insumos, uma linha fabrica 5 Fracos por dia. Lotes já iniciados preservam seu prazo; novos lotes usam tempos revisados.
- Loja com vendedor ativo vende todo estoque restante no fechamento diário, sem limite de 20 unidades nem bloqueio pelo teto de caixa nessa liquidação. Vendas graduais durante o dia permanecem; fechamento esvazia as sobras, registra receita real no dia encerrado antes da taxa bancária e mantém dinheiro na loja para coleta manual/banco. Sem vendedor ativo não vende. Não criar dinheiro sem estoque nem duplicar venda ao recarregar.
- Capacidade da fazenda nível 1, inclusive inicial: 10 vacas. Saves existentes passam a usar o novo limite sem reset.
- Capangas nível 1: contratação R$ 125 por equipe de 3 e manutenção R$ 25/dia. Contratação dos níveis superiores preservada em R$ 550 e R$ 1.150; diárias níveis 2/3 seguem R$ 80/120.
- Funcionário nível 1: contratação R$ 250, manutenção R$ 25/dia. Níveis 2/3 preservados.
- Ração: R$ 25 a cada 10, equivalente a R$ 2,50/unidade. Consumos de cada espécie permanecem 10/20/40/80/100 por dia.


## Embalagens e Magrela — atualização posterior de 14/10/2026
Pacote de 10 embalagens custa R$ 25 (R$ 2,50/unidade, inclusive compra automática). Vaca Magrela custa R$ 250. Substitui preços anteriores; consumo e produção permanecem. Aplicar em novas compras sem reembolsos nem reset de campanhas.


## Abertura e manutenção de lojas — 14/10/2026
Abrir/comprar uma loja neutra custa R$ 500. Cada loja de empresa (incluindo inicial e lojas já possuídas) cobra R$ 25 por dia no fechamento central, inclusive offline, separadamente do vendedor. Registrar despesa real no ledger. Sem saldo suficiente, pagar o disponível e manter restante como manutenção pendente, sem caixa negativo nem fechamento automático. Cobrar pendência nas próximas viradas com caixa disponível; neutras não geram manutenção. Menu informa abertura, diária e pendência. Preservar saves e estoques.


## Caixa inicial definitivo solicitado — 14/10/2026
Jogador começa novas campanhas com R$ 500 (50.000 centavos). Esta regra substitui os R$ 100.000.000 temporários de testes. Preservar campanhas já salvas, sem reset nem substituição de saldo retroativa.


## Premiada, economia e retaliação — 14/10/2026
Mimosa custa R$ 1.250 e Queijo Comum vende por R$ 50/unidade. Renomear De Luxo/Premiada para apenas Premiada na interface, preservando ID noble e PNG vaca_premiada; compra R$ 2.500 e Queijo Nobre vende por R$ 100. Fazenda nível 2 custa R$ 5.000 (fórmula existente R$ 2.500 × nível 2) e aceita 20 vacas.
Quando atacante perde, paga ao defensor vencedor conforme nível da equipe defensora: 1=R$ 50, 2=R$ 100, 3=R$ 150; mesma regra para IA e jogador. Não executar contra-ataque remoto. Prêmio é transferência real entre empresas, separado do custo de missão, despesa do perdedor e receita do defensor. Se faltar caixa, transferir disponível e persistir dívida restante, quitada ao entrar saldo nos ticks seguintes sem saldo negativo nem dinheiro criado. Somente resolver a compensação no resultado definitivo; incidentes offline pendentes não pagam antes da resolução. Mostrar regra/valor no menu de capangas e registrar resultado/ledger.


## Revisão de custos de expansão — 14/10/2026
Fazenda nível 2 custa R$ 30.000 e comporta 30 vacas; demais níveis preservados. Preço específico de nível 2 centralizado e compartilhado entre compra e menu, sem multiplicar R$ 30 mil pelo nível. Banco nível 1 contratação R$ 9.000, mantendo taxa e limite. Transportadora contratação R$ 15.000, manutenção R$ 300/dia. Equipe de capangas nível 2 contratação R$ 3.000 e manutenção R$ 50/dia; nível 3 contratação R$ 9.000 e manutenção R$ 100/dia; nível 1 preservado.
Armamento e barricada têm preços por melhoria comprada: 0→1 R$ 125, 1→2 R$ 1.500, 2→3 R$ 3.500. São custos incrementais (total R$ 5.125 por sequência completa), não preço fixo nem total acumulado. Preservar bônus e máximo de três níveis. Exibir e cobrar a mesma tabela; atualizar valor após cada compra, bloquear nível máximo. Novos preços valem para compras/manutenções futuras, sem reset, reembolso nem substituição de níveis já comprados.


## Banco 2 e produtos raros — 14/10/2026
Banco nível 2 custa R$ 60.000 para contratar; taxa diária de 2% e coleta sem limite preservadas. Vaca Radioativa custa R$ 18.000 e Queijo Radioativo vende por R$ 200/unidade. Vaca Mágica custa R$ 36.000 e Queijo Mágico vende por R$ 400/unidade. Preservar consumo, produção, tempos, descoberta e demais regras. Aplicar valores às compras e vendas futuras, inclusive estoque existente, sem reset nem reembolso retroativo.


## Queijarias e leilões vigentes — 14/10/2026
Início de novas campanhas: R$ 500, 1 Magrela, 1 L Fraco e 1 Queijo Fraco para jogador e IA, 10 embalagens e um vendedor por empresa. Uma loja inicial de cada lado e 12 neutras.

| Queijaria | Compra | Funcionários | Lotes simultâneos | Manutenção/dia |
|---|---:|---:|---:|---:|
| Rudimentar do seu Zé | inicial (avaliação R$ 4.000) | 5 | 5 | R$ 0 |
| Artesanal | R$ 15.000 | 10 | 10 | R$ 100 |
| Moderna | R$ 60.000 | 20 | 20 | R$ 400 |

Cada clique em Produzir & embalar inicia uma unidade, exigindo leite e embalagem. Com funcionário ativo, inicia automaticamente até preencher linhas. Leilões usam avaliação do imóvel + vacas/contratações de funcionários +10%; serviços usam valor de contratação +10%. Lances seguintes mínimo +10%, reserva devolvida quando superado, prazo fixo 10 dias. Dono vencedor recupera reserva; rival vencedor recebe bem/itens, dono recebe dinheiro. Perder banco/transportadora remove contrato e benefício; novo titular assume taxas existentes. Ver regras completas no CODEX_MASTER_SPEC.
