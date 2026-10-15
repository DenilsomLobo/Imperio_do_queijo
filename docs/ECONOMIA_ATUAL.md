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
| Fraco | 10 s | R$ 25 |
| Comum | 30 s | R$ 50 |
| Nobre | 1 min | R$ 100 |
| Radioativo | 2 min | R$ 200 |
| Mágico | 2 min 30 s | R$ 400 |

Cada receita produz uma unidade, usa 1 L do leite correspondente e uma embalagem (R$ 2,50; pacote de 10 por R$ 25), sem maturação adicional. Funcionários ativos aceleram fabricação: tempo base / (1 + soma dos bônus de 5%, 10% ou 15% por nível). Modo 2× divide tempos-base por 2; modo 4× divide por 6.

Vendas graduais durante o dia: uma unidade por vez a cada 1/20 de dia. Ao final do dia, todo estoque restante é vendido, com vendedor ativo, independentemente do limite gradual e do teto de caixa. Vendedor custa R$ 50 para contratar e R$ 25/dia. Abrir loja custa R$ 500, manutenção R$ 25/dia por loja, separada do vendedor.

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

Salários seguem dias de jogo: 1 min em 1×, 30 s em 2×, 10 s em 4×. Após quatro dias sem salário funcionários/capangas se demitem.


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


## Relógio e fabricação acelerados — 15/10/2026 (regra posterior vigente)
Esta regra substitui as durações anteriores de dia e das cinco receitas ativas. Dia real: 1× = 1 minuto; 2× = 30 segundos; 4× = 10 segundos. Relógio-base de 60.000 ms e fatores centrais 1/2/6, preservando os rótulos solicitados. Toda a simulação usa esse relógio, inclusive processos diários, salários, manutenção, produção de leite e leilões.
Fabricação por unidade em 1×, sem bônus: Fraco 10 s; Comum 30 s; Nobre 60 s; Radioativo 120 s; Mágico 150 s. Modos 2×/4× dividem esses tempos por 2/6; bônus de funcionários continuam acelerando. Insumos, preços, paralelismo e receitas antigas permanecem. Uma linha pode fabricar seis Fracos por dia com insumos e sem intervalos.
Migrar saves das escalas anteriores preservando calendário, estoques, dinheiro, progresso parcial, idade das vacas e prazos em dias; lotes já iniciados e missões preservam tempo-base restante. Migração versão 4 idempotente, sem reset nem concessões. Limite offline permanece oito horas-base (até 480 dias), com recursos e proteção territorial existentes.


## Lojas compartilhadas, inventário e edifícios — 15/10/2026 (regra posterior vigente)
- Coletar queijo pronto envia ao estoque único da empresa, sem selecionar loja. Todas as lojas próprias exibem esses mesmos produtos; cada unidade só pode ser vendida uma vez. Automação da transportadora usa o mesmo envio. Manter capacidade somada de 40 unidades por loja; excedente permanece na fábrica. Perder loja não apaga mercadoria já compartilhada, mas reduz espaço disponível para novos envios. Vendedor continua necessário para vender, e banco para coletar dinheiro. Dinheiro das vendas continua no caixa da loja que vendeu.
- Confirmação expressa: bônus começa na segunda loja. Uma loja = preço-base; duas = +10%; três = +20%; N lojas = +10% × máximo(0,N−1), aditivo, sem juros compostos. Aplicar preço arredondado em centavos em vendas graduais e no fechamento, inclusive offline. Recalcular por lojas atualmente próprias; mesmas regras para IA, com estoques separados por empresa. Fechamento distribui as unidades restantes entre lojas com vendedor ativo sem duplicar vendas.
- Migrar estoques antigos de lojas próprias somando uma vez no campo company.shopStock e esvaziando os campos legados; migração idempotente, sem reset, compensações financeiras ou reposição de recursos. Preservar estoques neutros legados até aquisição.
- Menu Estoque de leite passa a Estoque. Exibir ração, embalagens, leites e queijos reais com ícone e quantidade imediatamente à frente. Somar fazendas, fábricas e estoque das lojas uma única vez; recursos continuam fisicamente alocados nas propriedades. Produtos ainda não possuídos não aparecem; não antecipar raros. Setor Estoque de queijo permanece funcional.
- Criar icon_racao.png, icon_embalagem.png e icon_disputa.png, no estilo dourado dos ícones existentes, em assets/icones. Mostrar ração/embalagem nos botões de compra e inventário; disputa representa casa com duas espadas cruzadas. Manifesto e inventário atualizados.
- Menu Propriedades lista edifícios próprios, disponíveis, rivais e serviços em cartões com arte quadrada, nome, titular, compra/contrato, manutenção e disputa real. Remover etiquetas de nível dos edifícios nesse menu, preservando metadados internos necessários aos preços/perfis. Clicar fecha gestão, abre painel da propriedade e foca seu local no mapa.


## Entrada, identidade visual, caixa de testes e ranking — 15/10/2026
- Usar os oito PNGs fornecidos em assets/icones/menu-temporario no manifesto dos setores, substituindo referências aos SVGs removidos. Usar assets/text_logo.png no canto superior esquerdo e na entrada. Logo clicável volta ao index/tela inicial após salvar localmente. Reservar antes dele espaço invisível para futuro avatar, sem expor controle vazio ao teclado.
- Novas campanhas do jogador começam com R$ 100.000.000 (10.000.000.000 centavos). Essa regra de testes substitui caixa inicial anterior de R$ 500 somente para jogador; IA continua no valor atual. Não conceder dinheiro retroativo nem resetar saves existentes.
- Criar ícones Salvar, Resetar e Ranking em estilo dourado e mostrar ícone + texto nos botões superiores. Reset mantém confirmação em duas etapas e palavra exata SAIR.
- Antes de entrar, pedir nome de 2 a 30 caracteres. Nomes normalizados identificam perfis locais independentes; nome sozinho não é senha nem autenticação. Primeiro perfil adota campanha legada sem perfil, preservando recursos; perfis posteriores começam separados. Salvar atualiza campanha e pontuação do perfil atomicamente no IndexedDB. Reset altera apenas a campanha desse perfil.
- Confirmação expressa do usuário: ranking é por DINHEIRO GUARDADO NO CAIXA ATUAL, não faturamento, patrimônio, recorde histórico ou dinheiro ainda nas lojas. Exibir top 10 real, ordem decrescente, sem inventar participantes. Mostrar origem local/nuvem e erros de conexão. Ambiente atual é de testes com crédito inicial ampliado.
- Preparar Cloud Firestore e Firebase Auth anônimo por identidade/perfil, regras privadas para saves e ranking autenticado, limite 10 e separação por versão de regras. Usuário fornecerá configuração Firebase posteriormente. Até então saves e ranking locais funcionam, e nuvem é explicitamente não configurada. Não publicar/deploy nem afirmar integração online validada sem projeto configurado. Autenticação anônima depende da identidade preservada neste navegador; recuperação em outro dispositivo por conta vinculada permanece fase futura.


## Gestão de adquiridos e vendedor revisado — 15/10/2026
- Menu Propriedades mostra somente propriedades/contratos de titularidade do jogador, incluindo os iniciais, preservando cartões, preços, manutenção e disputas dos próprios imóveis. Não listar neutros ou rivais nesse menu; continuam no mapa e em Inimigos.
- Funcionários apresenta cartões quadrados dos trabalhadores realmente contratados: funcionários de fábrica, vendedores e equipes de capangas, com retrato, custo atual de contratação, salário diário e estabelecimento de alocação. Clicar abre/foca fábrica ou loja correspondente. Equipes em reserva ficam identificadas sem inventar alocação ou botão sem destino.
- Vacas apresenta cartões dos rebanhos realmente adquiridos, agrupados por espécie/fazenda, com imagem, quantidade, preço atual unitário/grupo, custo diário da ração opcional e fazenda. Clicar leva à fazenda. Não criar diária extra para vacas nem antecipar espécies não possuídas.
- Estoque é contagem ilustrada de ração, embalagens, tipos de leite e queijos prontos, sem valores financeiros nem duplicação do estoque compartilhado. Estoque de queijo mostra também tipos/lotes realmente em fabricação ou maturação, ícone, preço de venda atual com bônus, valor potencial ao concluir e fábrica; clique leva à fábrica. Lotes não contam como mercadoria pronta nem dinheiro.
- Menu Vendas passa a Pontos de venda. Indicador superior mostra faturamento real do dia atual, exclusivamente vendas ao consumidor. Cartões apenas das lojas próprias mostram valor de compra, vendas de hoje/ontem, presença/nível dos capangas, vendedor, manutenção diária discriminada (loja, vendedor e equipe), total e caixa para coleta. Coleta, leilão e compensação de defesa não são vendas de queijo; vendas de fechamento pertencem ao dia encerrado.
- Vendedor: contratação R$ 50 e salário R$ 25/dia, centralizados em rules.sellerHire/sellerSalary. Valem para próximas contratações/diárias, inclusive vendedores já existentes; sem reembolso retroativo ou reset. Novo icon_vendedor.png em assets/icones, manifesto/inventário atualizados, utilizado nos cartões e botões de contratação.
- IA verifica alocação de capangas em cada tick online, independentemente do intervalo de estratégia/ataques, contratando somente com caixa real e reserva operacional ou aproveitando equipes em reserva. Imagem de bandeira é substituída automaticamente por capangas do nível contratado pelo renderer existente. Offline mantém regras anteriores, sem contratação militar automática; sem dinheiro não ganha equipe.


## Compras, vendedor, finan?as e dom?nio ? 15/10/2026
- Ra??o e embalagens permitem informar de 1 a 1.000 unidades inteiras por compra, com pre?o unit?rio/total e confirma??o da quantidade real comprada. Preservar quantidade preenchida nas atualiza??es do painel; validar saldo e limites sem compra parcial nem perda de excedente. Quantidade de embalagens deixa de ser fixa em dez.
- Loja somente vende quando possui vendedor contratado e ativo, inclusive no fechamento di?rio. Vendedor ativo acrescenta 1% ao valor de cada venda naquela loja, sem acumular vendedores de outras lojas. Aplicar ap?s o b?nus de lojas (+10% por loja pr?pria al?m da primeira), arredondando o valor unit?rio em centavos; mesma regra para IA. Vendedor suspenso n?o vende nem concede 1%.
- Dinheiro passa a Finan?as: caixa, dinheiro nas lojas, liquidez, reserva de leil?es, pend?ncias, avalia??o de im?veis/itens, receitas/despesas/resultados acumulados e di?rios, categorias, estabelecimentos, compromissos di?rios, bancos, transporte e ?ltimos movimentos reais. Cr?dito inicial n?o ? lucro e coleta n?o duplica faturamento. Diferenciar avalia??o de dinheiro dispon?vel.
- Inimigos mostra cart?es das propriedades, pontos de venda e capangas realmente pertencentes ao rival, com aloca??o, custos/manuten??o e navega??o para o estabelecimento.
- Vit?ria exige todas as lojas, fazendas e f?bricas do mapa, inclusive expans?es inicialmente neutras, mais contrato de qualquer um dos dois bancos e da transportadora. Confirma??o expressa do usu?rio: controlar qualquer um dos dois bancos e a transportadora; preservar limite de um contrato banc?rio ativo por empresa. Derrota aplica a mesma condi??o ao rival. Mapa atual: 14 lojas + 4 fazendas + 4 f?bricas + 1 objetivo banc?rio + 1 transporte = 24 objetivos. Ag?ncias p?blicas e postos associados n?o s?o objetivos adicionais. Barras mostram controle, percentual e faltantes; leil?es abertos devem terminar antes do resultado final. Preservar resultados j? registrados em campanhas antigas, sem reset.


## Caixa inicial revisado - 15/10/2026
Novas campanhas: jogador R$ 500 (rules.initialCash=50000 centavos), rival R$ 1.000 (rules.aiCash=100000 centavos). Substitui o saldo temporario de testes. Preservar saldos de campanhas salvas, sem reset ou ajuste retroativo.


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
