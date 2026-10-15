# Arquitetura

## Diagnóstico inicial

Na primeira inspeção havia apenas 47 PNGs e dois documentos vazios; estes foram preenchidos durante a sessão e relidos. Não havia código, dependências, testes, scripts, histórico Git ou sistemas funcionais a preservar. A especificação na raiz foi copiada integralmente para `docs/CODEX_MASTER_SPEC.md`, caminho exigido por AGENTS.md. Manter esse documento como fonte normativa; sincronizar a cópia da raiz quando editar a especificação.

## Decisão técnica ADR-001

Adotar stack recomendada: JavaScript ES Modules, Phaser 3.90, Vite e Vitest. HTML/CSS para painéis; Phaser para mapa/câmera. Domínio puro em `src/domain`, configurações em `src/data`, arte original em `assets`. Importações Vite geram URLs com hash e preservam nomes irregulares. Todos os PNGs têm registro central em `assets-inventory.json`; o manifesto de runtime é gerado pelo glob de arquivos reais, sem URLs presumidas.

Mapa atual: estado único `maps`, uma região selecionada e terreno selecionado por referência. Cena consulta os registros e renderiza sprites e polígonos. Painel aplica alteração atomicamente após validação. Importação inválida não modifica o mapa anterior. Editor usa mesmo formato JSON previsto para a campanha; ID, região, proprietário, edifício, nível, ocupação, compra/venda/conquista, polígono, posição visual, escala/profundidade e vínculo com segurança.

Não há regras econômicas no renderer. Editor altera cadastro, não representa compra/conquista no jogo. Terrenos iniciais vazios deliberadamente: coordenadas inventadas não constituem cadastro definitivo. Vinculação v6–v10 às cinco regiões é provisória. Revisar antes da campanha. Edifícios incorporados ao fundo não são entidades interativas.

## Evolução obrigatória

### Implementação rural atual — 13/10/2026

Os parágrafos anteriores registram o diagnóstico inicial. O runtime atual foi separado: `src/main.js` coordena UI/comandos; `src/map/game-scene.js` mantém sprites físicos em `staticObjects` e atualiza exclusivamente bandeiras/equipes/indicadores. `src/editor.js` e `editor.html` preservam o editor, com cadastro rural pré-carregado, sem alterar uma campanha em andamento.

`src/data/rural-layout.json` é o cadastro oficial manual; `src/data/world.js` deriva polígonos/slots/controles usando o domínio de mapas existente. Estado da partida guarda IDs e atributos econômicos/territoriais, sem posições editáveis. Comandos não alteram layout, imagem nem formato físico.

`src/domain/game.js`: comandos transacionais em clone, relógio central com passo 1 s e resíduo, produção/vendas, ledger, equipes/missões, RNG persistido, IA com regras e recursos finitos. `advance` recebe tempo já convertido pelo multiplicador; `syncClock` aplica a velocidade anterior antes de alterá-la. Offline recebe tempo real em 1× limitado a oito horas; missões são adiadas, nunca resolvem perda territorial offline. Mesma lógica de limite de estoque/caixa é usada pela IA.

`src/persistence/local.js`: IndexedDB com versão do banco/save/regras, validação de estado, checkpoint por comando/15 s e fila serial de escrita. Sem migrações ainda: save incompatível é recusado e não sobrescrito pela sessão de fallback. Atualização visual não grava por frame. A origem do iniciador foi fixada em 127.0.0.1:5173 porque IndexedDB é isolado por origem/porta; outro servidor do mesmo projeto é reutilizado via endpoint local de saúde, sem expor caminhos. Uso manual em outra porta cria campanha independente.

Balanceamento ativo em game-rules.js; balance.js é adapter de compatibilidade, sem configurações econômicas concorrentes. Transporte rural manual instantâneo; tempo/custo/veículos serão integrados na fase logística. Relatório atual não substitui contabilidade patrimonial/lucro líquido.

Separar `src/main.js` em cena, controlador do editor e views na próxima etapa. Introduzir store central versionado com comandos transacionais; sistemas recebem estado e tempo de simulação, sem depender de Phaser/DOM. Um scheduler cronológico e RNG injetável; velocidades somente multiplicam tempo. Dinheiro em centavos e ledger com IDs de transação. Estoques por produto/qualidade/local com reservas explícitas; equipes e funcionários com ocupação exclusiva.

Adapters de persistência: IndexedDB primeiro, Firestore depois, com DTO versionado, migrações, validação e gravação por checkpoint/debounce, nunca por frame. Registrar campanha e versão de regras; ranking com ID idempotente. Firebase exige configuração do projeto e regras testadas antes de publicação. Não armazenar segredos no cliente.

Módulos de domínio previstos: clock/state/resources/economy/cows/breeding/production/maturation/employees/sales/demand/marketing/logistics/export/banking/research/security/combat/espionage/AI/campaign/victory. Adapters: persistence/auth/ranking; apresentação: maps/properties/HUD/panels/editor. Dependência unidirecional: UI → comandos → domínio → eventos; adapters não importam cena.

## Formato de mapas v1

`{version:1,id,background,slots:[{id,region,type,owner,building,level,occupation,rules,polygon,sprite,securityId}]}`. Coordenadas no espaço original da imagem. Polygon: pelo menos três pontos finitos. Tipo: land/farm/factory/sale/security/service. Sprite: x/y/width/depth, ancoragem inferior central. IDs únicos por região; campanhas usam IDs qualificados pela região. Relação de segurança validada no mesmo mapa. Exportação JSON é explícita; recarregar não salva automaticamente alterações do editor.

## Referências técnicas

### Apresentação e migração — 14/10/2026

Atualização posterior: rural-layout.json define dez ruas e 14 interseções, cada qual ligada a uma loja e seu posto. world.js preserva roads/intersections/intersectionId; map/streets.js recorta e desenha vias em camadas sob os sprites. Ruas são geometria determinística, não desenhos incorporados ao PNG, garantindo correspondência com pontos clicáveis. Espaço lógico atualizado para 2400×1800. IDs de partida mantidos; somente posições visuais alteradas, sem novo reset/migração econômica.

theme.css centraliza os HEX oficiais e aplica tema ao produto e ferramenta interna. Main remove ações Mapa-múndi/Editor, habilita só zona rural e atalhos de câmera Centro/Fazendas/Fronteira norte. Outras zonas serão disponibilizadas com cadastro/progressão reais. Build Vite inclui somente index.html; editor.html permanece no código para desenvolvimento, com ruas e mesmas dimensões.

Novo fundo em assets/mapas/rural-open-v1.png, gerado com image_gen; espaço lógico do layout 2400×1600, independente da resolução do PNG. world.js preserva dimensões, largura dos sprites, nível e tipo de serviço. Editor e cena respeitam as mesmas dimensões. Renderizador Canvas ativo; sprites físicos continuam estáveis entre ticks e comandos. Camera fit/focus/zoom são ações reais. collectorPosition centraliza geometria dos indicadores e é usado também pelo QA.

Gestão desacoplada: domain/management.js deriva totais do estado; ui/management.js apresenta oito menus e catálogo. Propriedades excluem serviços públicos/controles; funcionários somam vendedores e integrantes de equipes, incluindo reserva. Leite soma fazendas/fábricas; queijo pronto soma fábricas/lojas, deixando lotes em andamento separados. Vendas históricas usam ledger por empresa, evitando atribuir vendas antigas do rival ao comprar uma loja.

Serviços do layout têm proprietário public e menus que encaminham aos mesmos comandos de domínio: agência contrata vendedor/equipe na propriedade selecionada; loja de vacas compra e aloca; transportadora transfere queijo; bancos abrem os dados financeiros existentes. Não há empréstimos/viagens simulados por botões vazios. Fazendas/fábricas neutras são compráveis com custo por nível e iniciam vazias; capacidade de vacas, linhas e maturação dependem do nível.

migrateSave leva layout antigo (sem layoutVersion) à versão 2, preservando IDs de propriedades/controles, dinheiro, recursos, equipes, campanha e tempo; acrescenta somente novos registros. Registros antigos de terrenos não utilizados são removidos, sem apagar ativos produtivos. Saves incompletos nas propriedades preexistentes são recusados, sem reposição de recursos iniciais. Versão de regras permanece compatível; load migra antes de validar.

[Câmeras Phaser](https://docs.phaser.io/phaser/concepts/cameras) e [entrada Phaser](https://docs.phaser.io/phaser/concepts/input), consultadas para coordenadas de mundo e navegação. Testes focam invariantes de domínio; validação visual deve ser registrada separadamente do build.

## Cadastro visual rural — 14/10/2026

Cada propriedade possui district (town/countryside/north), exclusivamente visual. scripts/rebuild-rural-layout.mjs gera posições e rede de caminhos; domínio continua independente do terreno bitmap. Exportação via map-preview.html/src/map-preview.js usa createGame isolado e presentationOnly da cena, sem IndexedDB, ações ou relógio. Página de exportação excluída do build público.

Revisão 3: grafo de estradas com from/to em IDs físicos e extremidades exatamente em controles/entradas; textura transparente em TileSprite. Teste verifica conectividade global, destinos e vínculos dos controles. migrateSave 2→3 aplica a correção territorial solicitada uma vez, preservando aquisições do jogador e devolvendo equipes afetadas à reserva; detalhes em RURAL_MAP_V3.md.

Atualização de controle: presentation.js concentra seleção de textura por dono/equipe, limiares e posicionamento de coleta e indicadores de missão. Cena atualiza textura da loja com setTexture sem recriar objeto ou mover geometria. resolve sempre neutraliza o par loja/posto; IA compra neutros pelo comando buyProperty, com ledger real. Nomes/estrelas em placas de madeira; sem contadores de recursos no canvas. Instruções vigentes em CONTROLE_E_INDICADORES.md prevalecem sobre arte estática da loja descrita nos registros anteriores.

campaign.js centraliza contagem territorial, autorização de compras finais e resultado. command e ações da IA usam o mesmo gate de caixa/controle; updateCampaign determina final, advance para após outcome. createGame inclui resetRevision de session-reset.json para reinício único autorizado; carregamento só substitui campanha com marcador anterior. Estrelas são atributo interno compatível, sem indicação gráfica; agência vende níveis reais. Originais dos trios preservados com aliases nível 3. Detalhes e precedências em CAMPANHA_RURAL.md.

## Rebanho e ração — 14/10/2026

Comandos transacionais moveCow/sellCow gerem quantidades agregadas e cowAges por espécie (timestamps em tempo de jogo, uma entrada por vaca). Transferência retira mais antigas primeiro e preserva timestamps; venda exige quantidade elegível e credita ledger. buyCow registra aquisição; migrateSave acrescenta histórico conservador às campanhas antigas sem histórico. Ração parcial pondera produtividade de 50% a 100%, limitada pela capacidade, também offline. Nenhum novo reset nem dependência externa.

Dairy: src/data/dairy.js centraliza IDs persistidos weak/common/noble/radioactive/magic e arquivos reais de vaca/leite/queijo. Receitas preservam qualidade no ID receita:qualidade; visual consulta esse registro. Vacas especiais exigem unlockedSpecies por empresa, nunca simples presença da arte. Sistema de pesquisa ainda será responsável por conceder esse desbloqueio.

## Litros, descoberta e apresentação inicial — 14/10/2026

Stock milk armazena litros completos; milkProgress guarda progresso por qualidade. Scheduler acumula progresso e emite unidades inteiras, limitado pelo estoque; não soma frações de qualidades diferentes para completar litro. migrateSave separa frações legadas de forma idempotente. collectMilk conserva resíduos em progresso, completando unidades por qualidade quando possível. discoveredMilk por empresa registra primeiras produções; data/dairy.js deriva também produtos atualmente possuídos para compatibilidade. UI não usa posse da vaca como revelação do leite. Catálogo oculta artes de produtos não descobertos. ui/herd.js compartilha cartões de rebanho de uma fazenda no painel e na gestão global.

Novas receitas têm quality fixa e 1 L/embalagem; comando recusa origem incompatível e novas execuções de receitas legadas. Lotes/estoques antigos continuam resolvendo sem reset. Saving manual está no cabeçalho e usa a mesma fila de persistência automática.

Posição da barraca inicial atualizada no gerador e JSON, mantendo ID. Caminhos/interseção acompanham controle. shopAsset tem exceção explícita para sale-ze do jogador: arte fornecida da barraca inicial; outros donos mantêm apresentação territorial normal.

## Manifesto de caminhos — 14/10/2026

PNG IDs continuam sendo os nomes dos arquivos; localização física passa a asset-paths.json. data/assets.js importa assets/**/*.png e valida que todos os caminhos do manifesto resolvem, fornecendo mesmo dicionário usado pelos três entrypoints. Inventário inclui file (ID) e path (localização), sem duplicar nem editar os PNGs; testes validam bijeção, dimensões e hashes.

Exceção visual solicitada: guardAsset sempre retorna bandeira aliada para sale-ze-control do jogador, inclusive com equipe. Equipe continua no domínio e pode defender/atacar; demais postos mantêm equipe visível quando alocada. Largura do sprite deriva da arte de bandeira/equipe, sem inflar bandeira por haver equipe lógica.

## Reset explícito da campanha — 14/10/2026

ui/reset-campaign.js mantém as duas etapas do diálogo e exige string exata SAIR + clique em OK. onReset do controlador constrói estado novo com UUID de campanha, serializa gravação na fila existente e só então troca state/seleção/cena. IDB put na chave current substitui registro em transação única: não excluir banco nem limpar object store. resettingCampaign bloqueia novos checkpoints e avanço durante commit; snapshots anteriores precedem nova campanha na fila. Falha não troca state, nem desbloqueia escrita de fallback com storageFailed; sucesso libera persistência. Etapas de confirmação não pausam a simulação contínua. session-reset.json fica inalterado.

## Pessoal e automação de fábrica — 14/10/2026

workers.js contém funções de capacidade, bônus dos ativos e processamento salarial com callbacks para ledger/relatórios, sem importar game.js. Factory guarda workers [{id,level,missedWages,nextWageAt}] e staffNotices. Migração inicializa arrays vazios, preservando empregados existentes. hireWorker/payWorkerWages validam empresa, capacidade e caixa em comandos transacionais.

Scheduler paga folha no vencimento por empregado, somando atrasados; atraso desativa o bônus/automação, quarto vencimento não pago gera aviso persistido e remove empregado. Lotes existentes preservam progresso e recebem avanço adicional dt × bônus enquanto funcionários estão ativos; maturação não recebe bônus. Após resolver lotes, fábrica com ativo preenche linhas disponíveis por ordem das receitas com leite, compra uma embalagem por lote se necessário e financeiramente possível e usa o mesmo comando produce. Nenhum queijo é enviado automaticamente à loja.

Capangas usam salário por estrelas; atrasados incluídos no débito e demissão no quarto dia, inclusive reserva. Posto guarda aviso; guardAsset volta a trocar bandeira por equipe também em sale-ze-control, conforme nova regra.

ui/staff.js apresenta mostruários, preços e cartões alocados. Eventos usam comandos reais, mantendo destino/nível selecionado após contratar. Painéis de fábrica/serviço/fazenda têm portrait acima da explicação. Assinatura de painel inclui mudanças de pessoal/atraso/avisos, atualizando sem perder campos por tick. Mapa mostra placa de demissão baseada em staffNotices, dispensável por comando. Gestão agrega workers ao total de funcionários.

## Contrato bancário e movimento diário — 14/10/2026

Company.bank é contrato único {level,propertyId,startedAt}; bankDebt guarda taxa pendente; dailyFinance acompanha dia, revenue, expenses, bankFees, taxedProfit e collected. ledger atualiza totais diários sem varrer histórico a cada tick. banking.js recebe callback de escrituração já associado ao estado, sem importar game.js. Limite usa dailyFinance.revenue da empresa, não caixa da loja.

closeBankDays roda na transição do relógio antes de transações do novo dia; apura taxa sobre resultado positivo anterior, excluindo a própria taxa da base, reseta movimento diário e paga dívida com caixa disponível. processBankServices coleta somente tills de lojas do titular sob limite, sem nova receita, e liquida taxa pendente. Mesma lógica online/offline/velocidades. Cancelar/trocar apura taxa sobre parcela positiva ainda não tributada (taxedProfit evita dupla cobrança), substitui contrato em comando transacional, sem reembolso de contratação. Falta de dinheiro na troca não altera estado anterior.

Migração reconstrói movimento diário pelo ledger somente se ausente, inicializa dívida zero, preserva contrato e ajusta nível do serviço bank-city ao cadastro corrigido (2). Payload/validação incluem contrato/movimento/dívida sem novo reset. Menus usam ui/banking.js e estatísticas atualizadas por tick; assinatura inclui plano ativo.

## Ícones substituíveis do menu — 14/10/2026

menu-icons.json relaciona os oito IDs de setor a caminhos PNG/SVG; data/assets.js exporta menuIcons separadamente do dicionário de arte da campanha, mantendo catálogo/contagem de recursos independentes dos ícones provisórios. UI reutiliza IDs de gestão existentes e sincroniza aria-expanded/destaque com o diálogo; comandos de domínio inalterados. sector-menu.css controla os cartões e a adaptação do grid de altura automática.

## Escala diária versão 2 — 14/10/2026

DAY=20×60×1000, offlineLimit independente de DAY (8 horas reais). createGame grava clockVersion=2. clock-migration.js converte saves sem versão antes das demais migrações: escala calendário/time/histórico/idades/vencimentos diários/maturação/progresso de venda, preserva segundos restantes de fabricação/missões/equipes e marcador de incidente offline. savedAt em tempo civil permanece intacto. Resumos diários mantêm o mesmo índice do dia; migração não executa ledger nem concede produção. Receitas/combate/IA em minutos continuam com configurações existentes.

## Transportadora e escala 3 — 14/10/2026

Company.logistics guarda propertyId, startedAt, nextFeeAt, suspended e acumuladores milkMoved/cheeseMoved. logistics.js recebe act/ledger associados ao estado, reutiliza collectMilk/collectCheese e roda no fim do tick antes do banco. Transfere só ativos da empresa, respeitando capacidade e sobras; fábrica com trabalhador pago e loja com vendedor ativo têm prioridade. Recursos chegam à produção no tick seguinte; sem timers extras ou disparos por UI.

Manutenção pré-paga ao renovar cobertura diária, primeira diária incluída no preço inicial. Suspensão sem recursos mantém vencimento pendente, sem acumular novas diárias; ao haver caixa cobra uma diária e cobre próximo DAY. Cancelamento remove só contrato, sem mexer nos estoques. Migração inicia logistics:null para saves sem contrato, valida dados, preserva estado existente.

ClockVersion=3 suporta migração das escalas 1 (60 min/dia) e 2 (20 min/dia) para DAY=300000. Velocidades solicitadas 1×/2×/4× têm fatores 1,5/3,5, correspondendo a 5/3/1 minutos por dia; syncClock e tooltip usam speedFactors centralizado. Adapter balance também expõe fatores. Contratos de transporte têm datas/vencimentos convertidos como calendário. Offline segue 8h reais.

## Compra direta das cinco vacas — 14/10/2026

Requisito de pesquisa retirado das regras das espécies e de buyCow. src/ui/cow-shop.js gera cartões usando rules.cows + dairy.cowAsset e o manifesto de imagens, sem antecipar produtos. Campo de seleção interno service-species permanece para os eventos e QA; retratos clicáveis atualizam escolha/aria-pressed e confirmação preserva escolha/destino após render. Não altera DTO nem requer reset/migração: antigas permissões de pesquisa, se presentes, ficam ignoradas para compra. discoveredMilk segue independente da posse da vaca.


### Combate por ruas e mapa ampliado — 14/10/2026
Implementado: vizinhança direta das lojas pelo cadastro de ruas, compartilhada por comandos de ataque, seleção de alvos e IA. Barra de zonas e Catálogo removidos; setores compactos, mapa com borda e câmera limitada ao terreno, arraste e zoom. Verificado com 88 testes, build de produção e QA de menus em três larguras e navegação no navegador. Evidência: docs/qa-map-navigation.png.


## Gestão sobreposta ao mapa — 14/10/2026
main possui uma única coluna e posição relativa. #property-menu é um aside posicionado sobre o mapa, fechado inicialmente via hidden; selectProperty controla abertura, X/Escape fecham sem apagar dados. Limites, rolagem e borda são definidos em map-layout.css. Canvas mantém dimensões ao alternar painel, preservando câmera e navegação.


## Revisão econômica diária — 14/10/2026
Antes da virada bancária, tick liquida estoques restantes de lojas com vendedor ativo, registra receitas em DAY-1 e só então avança o relógio e fecha banco. Mantém as vendas graduais sem duplicar unidades. Manutenção por loja no bloco diário registra pagamentos reais; maintenanceDebt usa fallback zero em saves antigos. Valores de contratação de equipes por nível centralizados em teamHirePrices para preservar níveis 2/3 ao alterar nível 1. Tempos novos afetam novos lotes e acompanham speedFactors centrais; lotes salvos mantêm due.


## Painel de forças do posto — 14/10/2026
ui/combat.js renderiza dados usando attackStrength/defenseStrength/chance do domínio e constantes de game-rules, evitando cálculo paralelo. main.stats integra o painel em qualquer posto; refresh preserva details aberto. Botões indicam bônus específico de ataque/defesa. Não altera resolução probabilística existente.


## Compensação pela defesa vencedora — 14/10/2026
resolve gera retaliationDebts no atacante somente quando perde o resultado definitivo, usando retaliationByLevel do nível defensor. settleRetaliation transfere dinheiro real com duas entradas no ledger e conserva restante em dívida serializável; executa no resultado e nos ticks após coletas. Incidentes offline continuam sem resultado até resolvePending, portanto não geram prêmio antecipado. Migração de saves usa fallback de lista vazia sem reset. Painel de capangas explica regra e prêmio do posto.


## Preços de melhorias e fazenda nível 2 — 14/10/2026
weaponUpgrade e barricadeUpgrade são tabelas em centavos indexadas pelo nível atual (0/1/2). Comandos e botões usam a mesma posição; limite 3 é validado antes do débito. propertyPurchasePrice centraliza exceção de R$ 30 mil para fazenda nível 2 sem afetar preços dos demais níveis. Adapter balance utiliza farmCapacities central em vez de cópia desatualizada. Contratos/manutenções e recrutamento seguem parâmetros atuais, sem migração destrutiva.


## Cartões de estoque de queijo — 14/10/2026
ui/cheese-stock.js compartilha renderização entre main.stats e management.content(cheese). Usa recipe.price e dairy.cheeseAsset, filtra quantidades positivas, e calcula quantidade × preço sem alterar recursos. Compatível com IDs de receitas legadas; lista vazia informa ausência de queijo pronto. Atualização segue refresh existente, preços raros e banco 2 centralizados em game-rules.


## Leilões e perfis produtivos — 14/10/2026
factoryProfiles em game-rules.js define preço, linhas, funcionários e manutenção por ID, distinguindo inicial (5), artesanal (10) e moderna (20) apesar do cadastro legado de nível. Domínio, comandos, payroll/capacidade e UI compartilham factoryProfile. Manutenção de queijaria usa fechamento diário e dívida sem saldo negativo. Recursos novos simétricos no createGame; layout altera somente padrão inicial de ownership, sem reaplicar em saves existentes.

auctions.js centraliza elegibilidade, avaliação por propriedade+vacas/contratações, mínimo em centavos, reserva integral/reembolso e fechamento. state.auctions é persistido por ID, iniciado com prazo fixo de 10 DAY. Reserva/devolução movimentam caixa sem receita/despesa; aquisição/venda reconhecidas no fechamento. change de titular de serviços acontece no game.js: encerra contrato anterior e taxas antigas continuam devidas; vencedor assume automação e futuras diárias/taxas. Travas nos comandos impedem alteração de unidades avaliadas e cancelamento/troca de contrato em disputa.

Tick finaliza leilões inclusive offline, depois de operações do dia; updateCampaign só encerra sem disputas abertas e exige lojas mais ambas propriedades iniciais, permitindo recompra após perda isolada. MigrateSave acrescenta auctions vazio e vincula contratos antigos ao dono sem reset. Validação verifica leilões, titulares, valores/prazos e persistência. Clock migration também converte prazos de leilões. UI de auctions.js mostra avaliação, reserva, prazo e lance; gestão lista disputas. IA usa auctionDecision e o mesmo comando bidProperty: margem positiva, necessidade operacional, teto de avaliação+30 dias de retorno e caixa com reserva de 2 diárias, mínimo R$ 100.
