# AGENTS.md — Império do Queijo

Você é o desenvolvedor principal do jogo Império do Queijo.

## Documentação obrigatória

Antes de iniciar qualquer tarefa, consulte:

- `docs/CODEX_MASTER_SPEC.md`
- `docs/GDD.md`
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`, quando disponível

A especificação mestre define o escopo final do jogo.

## Conduta de desenvolvimento

- Trabalhe no projeto existente.
- Preserve sistemas funcionais.
- Utilize os PNGs da pasta `assets/`.
- Não reduza o projeto a um protótipo.
- Implemente os sistemas por fases integradas.
- Não utilize dados fictícios na versão funcional.
- Não crie botões sem comportamento real.
- Teste as funcionalidades implementadas.
- Mantenha o roadmap atualizado.
- Registre decisões técnicas relevantes.
- Não declare o projeto completo antes de cumprir os testes e critérios de aceitação.

## Mecânicas prioritárias

- Mapa isométrico point-and-click.
- Terrenos e propriedades com estados dinâmicos.
- Economia e produção reais.
- Funcionários e automação.
- Capangas de 1 a 3 estrelas.
- Melhorias de armamento e barricadas.
- Batalhas probabilísticas automáticas.
- IA com recursos limitados.
- Campanha com condição de vitória.
- Salvamentos e ranking.

## Continuidade

Ao finalizar cada tarefa, atualize `docs/ROADMAP.md` com o progresso, pendências e próxima implementação.

Não descarte requisitos da especificação apenas por ainda não terem sido implementados.

Explique ao usuário as alterações em português brasileiro.

## Correções de partida — 13/10/2026

Consultar também docs/CORRECOES_SOLICITADAS.md, docs/CORRECTION_AUDIT.md e docs/BALANCEAMENTO.md. Propriedades físicas permanecem fixas durante a partida; só bandeiras, equipes e indicadores mudam. Não confundir editor com partida. O usuário autorizou valores iniciais ajustáveis para preços/capacidades/custos/alcance/tempos ausentes no mestre; centralizar e documentar os valores reais.

## Diretriz visual atualizada — 13/10/2026

O usuário esclareceu que os assets existentes são referências da base visual desejada. Está autorizada a criação de novas imagens no mesmo estilo artístico e a substituição das antigas quando necessária, inclusive para separar fundos de propriedades dinâmicas. Essa autorização prevalece sobre a restrição original de não criar assets quando houver imagem correspondente. Manter o inventário atualizado e preservar referências originais fora dos assets ativos quando houver substituição.

## Organização visual — 14/10/2026

Diretriz posterior do usuário: loja muda arte conforme proprietário (Ponto_de_venda_aliado/inimiga/neutro), preservando posição e ID. Bandeira provisória é substituída pela equipe quando alocada. Vitória neutraliza loja/posto simultaneamente; aquisição posterior somente por compra, inclusive para IA com recursos finitos. Manter cinco lojas iniciais rivais, demais neutras e barraquinha inicial do jogador, conforme confirmação. Mapa mostra nomes e icon_* de coleta/ataque/defesa, sem quantidades de estoque/caixa; quantidades nos menus. Ver docs/CONTROLE_E_INDICADORES.md. Essa autorização substitui a exigência antiga de arte de loja fixa e a exibição simultânea de bandeira/equipe.

Diretriz posterior do usuário: loja muda arte conforme proprietário (Ponto_de_venda_aliado/inimiga/neutro), preservando posição e ID. Bandeira provisória é substituída pela equipe quando alocada. Vitória neutraliza loja/posto simultaneamente; aquisição posterior somente por compra, inclusive para IA com recursos finitos. Manter cinco lojas iniciais rivais, demais neutras e barraquinha inicial do jogador, conforme confirmação. Mapa mostra nomes e icon_* de coleta/ataque/defesa, sem quantidades de estoque/caixa; quantidades nos menus. Ver docs/CONTROLE_E_INDICADORES.md. Essa autorização substitui a exigência antiga de arte de loja fixa e a exibição simultânea de bandeira/equipe.

O usuário autorizou reposicionar o cadastro e criar outro mapa para exibir as construções com clareza. Manter pontos de venda com círculo de controle em frente; concentrar serviços no centro, inimigos afastados na região vermelha e fazenda inicial ao sul. A geometria continua fixa durante a partida. Menus superiores devem derivar propriedades, funcionários, estoques, vacas, vendas, dinheiro e inimigos do estado real, sem contar artes de catálogo como recursos possuídos.

Atualização posterior: ruas cadastradas com lojas e equipes nas esquinas; serviços centrais, fazendas externas e adversários ao norte. Paleta oficial: página #FFF8E7, seções #F3E7CF, navbar #5C4030, texto #352719/#786858, primário #52734D/#3D5A38, secundário #F2C14E, voltar #DCC9A7, bordas #D8C5A5, links #617B43, destaques #D99A24, avisos #C66B43, rodapé #38291F. Navegação do jogador por zonas, com foco atual na rural. Não reintroduzir Mapa-múndi ou Editor na interface; editor permanece apenas como ferramenta de desenvolvimento e não é publicado no build.

Atualização posterior: ruas cadastradas com lojas e equipes nas esquinas; serviços centrais, fazendas externas e adversários ao norte. Paleta oficial: página #FFF8E7, seções #F3E7CF, navbar #5C4030, texto #352719/#786858, primário #52734D/#3D5A38, secundário #F2C14E, voltar #DCC9A7, bordas #D8C5A5, links #617B43, destaques #D99A24, avisos #C66B43, rodapé #38291F. Navegação do jogador por zonas, com foco atual na rural. Não reintroduzir Mapa-múndi ou Editor na interface; editor permanece apenas como ferramenta de desenvolvimento e não é publicado no build.


# Regras posteriores do usuário — 14/10/2026 (vigentes)

Esta seção consolida as instruções da conversa e prevalece sobre referências anteriores conflitantes, sem eliminar as demais fases do projeto. Novas regras solicitadas pelo usuário devem ser registradas em AGENTS.md e nas duas cópias idênticas de CODEX_MASTER_SPEC.md, além do roadmap.

## Fazenda, vacas e ração

- Painel da fazenda exibe sua arte, explica produção/ração e mostra estoque real por tipo de leite com as imagens fornecidas. Remover o texto genérico sobre círculos desse painel.
- Produção simplificada: cada vaca alimentada produz 1 litro por dia de jogo. Sem ração produz metade; ração parcial aplica eficiência proporcional. Progresso é salvo internamente, mas estoque, coleta e menus trabalham com litros completos, sem contagem fracionária em mililitros. Não descartar progresso ao salvar, carregar ou mudar velocidade.
- Consumo por vaca/dia: Magrela (magra) 10 rações; Mimosa 20; De Luxo (asset vaca_premiada, ID noble) 40; Radioativa 80; Mágica 100.
- Ração é opcional e comprada por quantidade informada, exibindo nome e preço por unidade. Permitir compras como 100 unidades mantendo excedente no estoque. Valores financeiros e limites de compra permanecem centralizados e ajustáveis.
- Comprar vacas exclusivamente na loja de vacas do mapa (loja_de_vacas_nivel_1), selecionando a fazenda de destino com vagas. Fazenda pode oferecer atalho à loja, sem compra direta duplicada.
- Gestão de vacas apresenta quadrados/cartões com imagens e quantidades das vacas realmente alocadas naquela fazenda. Não exibir todas as espécies como se fossem possuídas.
- Permitir realocar vacas entre fazendas próprias com vagas e vender por 70% do preço de compra somente após três dias de jogo da aquisição. Transferência preserva prazo. Validar propriedade, quantidades, vagas e dinheiro; registrar venda no ledger e persistir rebanho.

## Origem, receitas e descoberta

- Magrela → leite_fraco → queijo_fraco.
- Mimosa → leite_comum → queijo_comum.
- De Luxo/Premiada → leite_nobre → queijo_nobre.
- Radioativa → leite_radioativo → queijo_radioativo. O PNG real do leite é Cálice de Leite Radioativo Neon.png.
- Mágica → leite_magico → queijo_magico.
- Receitas ativas devem ser Queijo Fraco, Comum, Nobre, Radioativo e Mágico. Cada queijo usa 1 litro do leite da mesma origem e uma embalagem; não permitir transformar leite fraco em queijo de outra origem. Parâmetros de tempo/preço ficam centralizados. Receitas antigas só permanecem para concluir lotes e estoques já salvos.
- Ocultar leites ainda não possuídos/não produzidos. Comprar a vaca não revela seu produto; revelar quando produzir o primeiro litro completo. Tipos sem estoque não aparecem no painel. Catálogo e receitas não devem antecipar imagens/produtos ainda não descobertos, preservando o mistério sobretudo dos raros. Descobertas persistem; recursos iniciais já possuídos são reconhecidos.
- Espécies especiais continuam dependendo de pesquisa própria conforme o mestre; catálogo não concede vacas nem desbloqueios.

## Barraca inicial, bandeiras e assets

- A primeira loja (sale-ze) usa ponto_de_venda_inicial_seu_ze.png enquanto do jogador. Segunda compra de loja em diante usa Ponto_de_venda_aliado.png; lojas neutras/inimigas seguem sua arte territorial.
- O posto inicial sale-ze-control mostra bandeira_capanga_aliado.png, inclusive com equipe alocada; equipe lógica continua funcional. Demais postos mantêm troca de bandeira por equipe quando alocada. Esta exceção substitui a regra anterior somente no ponto inicial.
- Barraca reposicionada conforme captura para baixo/esquerda da queijaria, com arte completa e sem sobreposição pela placa da fábrica. Cadastro atual: barraca (660,1840), controle (765,1880), caminhos/interseção correspondentes. IDs e estoques preservados; posição fixa durante a partida.
- Organizar PNGs em subpastas por uso dentro de assets: construcoes, producao, seguranca, mapas e icones. Preservar arquivos, nomes/IDs e hashes; atualizar caminhos no jogo, editor, preview, ferramentas, inventário e documentação. asset-paths.json mapeia IDs aos caminhos; assets.js centraliza carregamento.

## Salvar e resetar campanha

- Botão Salvar jogo no menu superior junto de Catálogo; remover botão/texto Salvo localmente do painel de propriedade. Salvamento automático permanece ativo.
- Adicionar Resetar campanha ao lado de Salvar jogo. Reset exige duas etapas: aviso explícito de perda de todo o progresso com possibilidade de cancelar; depois digitar exatamente SAIR e clicar em OK. Palavra vazia, incorreta ou com espaços não autoriza reset. Não executar reset por simplesmente abrir modal, avançar etapa, cancelar ou apertar Escape.
- Ao confirmar, substituir apenas a campanha atual por uma nova com recursos iniciais e ID novo, removendo progresso anterior. Não apagar outros dados do navegador. Cancelamento preserva progresso. Se houver falha ao gravar, preservar campanha anterior e informar erro.
- Serializar reset com salvamentos pendentes e impedir que autosave antigo sobrescreva a nova campanha. Persistir antes de trocar a campanha em memória; reset confirmado deve continuar zerado após recarregar. Não alterar marcador de reset global para implementar o botão.
- Validar etapas, cancelamento, palavra incorreta/correta, falha de gravação e reload em contexto de teste isolado. Nunca executar reset na campanha real do usuário como parte da implementação.


# Funcionários, agências e controle inicial — 14/10/2026 (regra posterior vigente)

Esta atualização prevalece sobre trechos anteriores conflitantes, especialmente a exceção que fixava a bandeira inicial mesmo com equipe.

- Painel da fábrica mostra a imagem real do estabelecimento acima da explicação. Explicar leite recebido da fazenda, receita por origem, consumo de embalagem, produção manual sem funcionário e coleta de queijo para a loja.
- Funcionários níveis 1/2/3 usam funcionario_nivel_1.png, funcionario_nivel_2.png e funcionario_nivel_3.png, organizados em assets/pessoal/funcionarios com manifestos/inventário atualizados.
- Contratar na agência de funcionários e alocar em fábrica própria com vaga. Agência mostra a própria arte no topo, funcionamento e mostruário com três cartões quadrados clicáveis. Ao selecionar nível, exibir contratação, salário diário, bônus e fábrica de destino. Preservar contratação de vendedores como categoria separada.
- Contratação configurada em R$ 2.000 / 4.000 / 8.000 e salários em R$ 200 / 350 / 600 por dia para níveis 1/2/3. Nível 1 segue o exemplo solicitado; demais valores são parâmetros iniciais ajustáveis, não preços externos.
- Capacidade de funcionários de fábrica por nível: 4 / 6 / 10 / 16; inicial explicitamente limitada a quatro, substituindo capacidade antiga de dois. Funcionários ativos somam +5% / +10% / +15% de velocidade por indivíduo, conforme nível. Não aumentar linhas nem alterar qualidade do leite por esse bônus.
- Com funcionário ativo, fábrica inicia e empacota novos lotes automaticamente, usando leite disponível e comprando somente embalagem necessária com caixa real. Respeitar linhas, estoque, receitas, insumos e dinheiro; suspender se faltar recurso. Jogador continua recolhendo leite da fazenda e queijo pronto para a loja. Sem funcionário ativo, produção manual permanece disponível.
- Mostrar imagem e nível de cada funcionário alocado na fábrica, vagas, produção manual/automática, bônus e situação salarial. Gestão superior deve contar funcionários reais de fábrica além de vendedores e capangas.
- Salários de funcionários cobrados automaticamente a cada dia de jogo desde contratação, inclusive offline; falta de pagamento acumula atraso e suspende atividade/bônus. Permitir pagar os atrasados. Após quatro dias sem pagar, funcionário sai e placa/aviso no estabelecimento informa que pediu demissão; manter relatório e aviso persistido até dispensado. Pagamento não cria dinheiro nem apaga dívida sem débito real.
- Agência de capangas segue o mesmo padrão visual: arte da agência, explicação, três cartões com imagens das equipes, contratação, salário diário e posto de destino. Contratações preservam custo vigente por nível (R$ 250 / 550 / 1.150 por equipe de três); salários por nível R$ 50 / 80 / 120 por dia, centralizados e ajustáveis. Capangas e reservas também deixam emprego após quatro dias sem salário; atualizar moral, disponibilidade, relatórios e aviso no posto, preservando regras de combate.
- Correção expressa: na primeira loja do Seu Zé, bandeira aliada aparece somente quando não houver equipe. Contratar/alocar capangas substitui bandeira pela imagem da equipe do nível correspondente, como nos demais postos. A loja inicial continua usando ponto_de_venda_inicial_seu_ze.png; lojas seguintes do jogador usam Ponto_de_venda_aliado.png.
- Reutilizar PNGs fornecidos, mover novas artes para categorias corretas e atualizar todos os caminhos/inventários. Preservar campanhas existentes por migração, sem conceder funcionários grátis nem alterar marcador de reset.


# Automação bancária de coletas — 14/10/2026 (regra posterior vigente)

- Banco nível 1: contratação única de R$ 200.000, taxa diária de 1% do resultado positivo do dia e limite de vendas totais da empresa de R$ 500.000 por dia de jogo. Até o limite inclusive, coleta automaticamente saldos reais das lojas próprias; ao ultrapassar, novas coletas param até o próximo dia ou contratação do nível 2. Valores já coletados não são desfeitos; coleta manual continua disponível.
- Banco nível 2: contratação única de R$ 500.000, taxa diária de 2% do resultado positivo do dia, sem limite diário de vendas para coleta. Sem limite não significa dinheiro infinito: transfere apenas dinheiro realmente existente nos pontos de venda próprios.
- O usuário esclareceu expressamente que o limite se refere às vendas totais da empresa por dia, não ao saldo individual da loja. Esclareceu também que a taxa incide sobre vendas do dia menos despesas do dia, somente se positivo, em vez de sobre valor coletado. Usar resultado antes da própria taxa para evitar cálculo circular; gastos reais, inclusive contratação, entram nas despesas. Não apresentar isso como contabilidade patrimonial completa.
- Cada empresa pode ter somente um contrato bancário ativo. Contratar o nível 2 encerra automaticamente o nível 1; trocar de plano cobra a nova contratação. Falha por falta de caixa preserva o contrato anterior. Não executar compras automaticamente nem conceder contratação grátis em migração.
- Jogador pode cancelar o serviço a qualquer momento no menu do banco; cancelamento interrompe novas coletas e não devolve contratação. Taxa já gerada é apurada ao cancelar/trocar, sem cobrar novamente resultado já tributado no mesmo dia. Saldo de taxa sem caixa permanece pendente, sem caixa negativo, quitado com próximo dinheiro disponível.
- Cobrar taxa no fechamento diário, com centavos e ledger. Coleta só transfere dinheiro da loja ao caixa e não registra faturamento novamente. Fechamento reseta limite diário e evita duplicar taxa ao recarregar, alternar velocidade ou processar offline.
- Menus das construções bancárias devem mostrar imagem do banco, custo, percentual/base, limite, plano ativo, vendas/despesas diárias, resultado positivo antes da taxa, coletas automáticas, estimativa e taxas pendentes. Exibir motivo de bloqueio, contratação/troca e cancelamento. Gestão financeira também dá acesso aos dois bancos.
- Banco central com imagem banco_nivel_2.png deve estar cadastrado como nível 2. Atualizar saves antigos nesse metadado sem resetar campanha.


# Menu ilustrado de setores — 14/10/2026

- Menu superior deve apresentar cartões interativos bonitos com ilustração de cada setor: Propriedades, Funcionários, Estoque de leite, Estoque de queijo, Vacas, Vendas, Dinheiro e Inimigos. Cada cartão abre a gestão real correspondente e mostra indicadores do estado da campanha.
- Usuário pretende fornecer ícones próprios posteriormente. Usar por enquanto oito imagens temporárias SVG em assets/icones/menu-temporario, sem substituir os PNGs de construções, vacas, leite ou queijo. Não antecipar produtos raros com essas ilustrações genéricas.
- Centralizar caminhos em src/data/menu-icons.json; aceitar futura troca por PNG/SVG via manifesto, sem reescrever comandos nem menus. Registro das artes temporárias separado em docs/menu-icons-inventory.json; inventário PNG permanece com 60 arquivos.
- Manter paleta oficial, destacar hover/foco/setor aberto, permitir uso por teclado e adaptar disposição às larguras de tela. Valores monetários longos não devem invadir outros cartões nem perder o valor completo.


# Ritmo diário mais rápido — 14/10/2026 (regra vigente)

- A pedido do usuário, reduzir duração-base do dia de 60 para 20 minutos reais em 1×. Em 2×, um dia passa em 10 minutos; em 4×, em 5 minutos. Exibir essa equivalência no seletor de velocidade.
- Produção por dia, consumo de ração, vendas diárias, salários, quatro dias de inadimplência, limite/taxa bancária e três dias para revenda de vacas acompanham o novo calendário no relógio central. Não criar relógios paralelos ou eventos duplicados.
- Receitas e missões especificadas em minutos/segundos reais mantêm esses tempos em 1×, afetados normalmente pelo seletor 2×/4×. Maturações especificadas em dias acompanham o calendário mais rápido.
- Migrar saves de escala antiga preservando dia/horário, recursos, produção parcial, idade das vacas, folha, contas diárias e resultados; lotes em fabricação/missões/recuperação preservam tempo real restante. Migração deve ser idempotente e nunca resetar campanha.
- Limite offline continua sendo oito horas reais em 1× (agora até 24 dias de jogo), respeitando recursos, salários e proteção territorial offline.


# Transportadora e tempos de dia definidos pelo usuário — 14/10/2026

Esta regra posterior substitui a escala anterior de 20/10/5 minutos por dia.

## Duração exata do dia

- Modo 1×: 5 minutos reais por dia de jogo.
- Modo 2×: 3 minutos reais por dia de jogo.
- Modo 4×: 1 minuto real por dia de jogo.
- Manter os rótulos solicitados e usar fatores centrais 1, 5/3 e 5 sobre o relógio-base de cinco minutos, pois os intervalos definidos não são múltiplos matemáticos 2 e 4. Aplicar a mesma escala a toda a simulação, sem relógios econômicos paralelos. Mostrar duração no seletor.
- Migrar saves das escalas anteriores preservando calendário, recursos e prazos, sem reset. Receitas/missões em minutos mantêm base de minutos em 1×; processos por dia acompanham o novo calendário. Limite offline continua oito horas reais, agora até 96 dias-base.

## Contrato de transporte automático

- Transportadora cobra R$ 500.000 para contratar serviço de automação fazenda → fábrica → loja, com manutenção de R$ 200 por dia de jogo. Um contrato da empresa atende suas fazendas, fábricas e pontos de venda, sem clique em coleta.
- Recolher leite existente e entregar a fábricas próprias com capacidade. Recolher queijo pronto e enviar a lojas próprias com espaço. Preservar tipo/qualidade, conservar excedente na origem e não criar mercadoria/dinheiro. Priorizar fábrica com funcionários ativos e loja com vendedor ativo, distribuindo para demais destinos próprios quando necessário.
- Fabricação automática permanece a cargo dos funcionários contratados na fábrica; venda requer vendedor na loja. Banco continua sendo responsável por coletar dinheiro automaticamente. Transportadora não substitui esses contratos/pessoal e não exige cliques manuais de coleta para transportar recursos disponíveis.
- Primeira diária incluída na contratação; manutenção vence um dia após contratar. Cobrar R$ 200 do caixa real na renovação. Se faltar saldo, suspender transporte e retomar automaticamente quando houver R$ 200; dias suspensos não acumulam cobrança porque não houve serviço. Não permitir saldo negativo nem contratação duplicada.
- Menu da transportadora mostra sua arte, funcionamento, preço inicial/diário, situação ativa/suspensa, próxima manutenção e contadores de litros/queijos transportados. Permitir cancelar serviço; nova contratação cobra valor inicial novamente. Cancelar preserva estoques. Manter transferência manual avulsa disponível.
- Usar relógio central e mesmas regras offline, com persistência do contrato/vencimento/contadores e migração sem contratação gratuita. Registrar pagamentos no ledger. Automação de veículos, combustível e viagens do mestre permanece uma fase posterior; serviço atual realiza as transferências rurais instantâneas já existentes.


# Loja de vacas completa, sem exigência de pesquisa — 14/10/2026

Esta instrução posterior revoga a exigência anterior de pesquisa/desbloqueio para obter vacas Radioativas e Mágicas.

- Loja de vacas deve mostrar retratos em cartões quadrados clicáveis das cinco espécies disponíveis: Magrela, Mimosa, De Luxo/Premiada, Radioativa e Mágica, com imagens reais, preço e consumo diário de ração. Manter arte e explicação da loja no topo.
- Todas as espécies podem ser compradas diretamente na loja desde o início, desde que o jogador tenha dinheiro e vaga em fazenda própria. Não exigir pesquisa, campo unlockedSpecies nem protótipo/desbloqueio para as duas espécies especiais. Não conceder vacas gratuitamente.
- Preços ativos: Magrela R$ 500, Mimosa R$ 1.800, De Luxo R$ 6.000, Radioativa R$ 35.000, Mágica R$ 60.000. Espécies raras permanecem caras; valores centralizados em game-rules.js.
- Consumo diário por vaca permanece 10/20/40/80/100 rações, respectivamente. Retratos mostram consumo sem revelar leite/queijo ainda não descoberto.
- Selecionar cartão e fazenda de destino, depois confirmar compra. Debitar valor real, alocar vaca, preservar seleção e atualizar rebanho, contadores e save imediatamente.
- A regra de mistério continua: comprar vaca não revela seu leite/queijo. Revelação acontece quando produzir o primeiro litro completo. Manter associações de origem já definidas e regra de produção/ração vigente.
- Reutilizar PNGs em assets/producao/vacas pelos caminhos do manifesto; não criar cópias nem substituir imagens existentes. Atualizar AGENTS e as duas cópias idênticas de CODEX_MASTER_SPEC.md.


## Ruas, combate e navegação (14/10/2026)
Ataques e defesas ocorrem apenas entre lojas vizinhas ligadas diretamente por uma rua cadastrada, em ambos os sentidos. Uma rota com várias ruas ou proximidade em pixels não autoriza atacar. Jogador e IA usam a mesma validação; a expansão da IA também respeita essa vizinhança. A defesa pertence à equipe da loja atacada.
A interface não possui Catálogo nem barra lateral de zonas, visão geral, botões de zoom ou atalhos Centro/Fazendas/Fronteira norte. O mapa ocupa a área liberada, possui borda e permite arraste horizontal/vertical e zoom pela roda, limitado ao terreno. Os oito setores superiores permanecem funcionais em cartões compactos.


## Caixa inicial de testes — 14/10/2026
A pedido do usuário, novas campanhas começam com R$ 100.000.000 (10.000.000.000 centavos em rules.initialCash). Preservar campanhas salvas, sem reset ou concessão automática retroativa. Este valor é destinado a testes e substitui o caixa inicial anterior. Valores e tempos vigentes consolidados em docs/ECONOMIA_ATUAL.md.


## Painel de propriedade sobre o mapa — 14/10/2026
O mapa ocupa toda a largura disponível, inclusive a antiga coluna de gestão direita. Painel de propriedade começa fechado e abre sobre o mapa ao selecionar uma propriedade, inclusive por menus de gestão. Possui borda, rolagem interna e botão X acessível para fechar; Escape fecha quando nenhum diálogo modal está aberto. Fechar preserva estado/progresso e não redimensiona o mapa. O mapa continua navegável na área descoberta.


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


## Painel de combate dos capangas — 14/10/2026
Ao selecionar um posto de capangas, mostrar arte da equipe, dano de ataque e força de defesa reais, base, quantidade/nível, moral, disponibilidade e cooldown. Armamento soma 12% por melhoria exclusivamente ao ataque, máximo 36% (3 níveis); barricada soma 15% por melhoria exclusivamente à defesa local, máximo 45%, sem força própria quando não há equipe. Base = quantidade × fator de nível (1/1,4/1,9); moral multiplica ambas as forças. Missão/recuperação ou moral zero zeram forças. Cooldown sozinho impede novo ataque, sem zerar defesa.
Explicar empate: forças iguais dão 50% para cada lado e o sorteio decide; não há prioridade automática por nível. Chance = 50 + 40 × (ataque − defesa)/(ataque + defesa), limitada a 5–95%; ambas zeradas dão 50%. Sorteio estritamente abaixo da chance faz atacante vencer, igualdade favorece defesa. Defesa recalculada ao chegar; ataque registrado ao partir. Vitória neutraliza loja para compra. Preservar regras existentes e mostrar bônus nos botões de melhoria; explicação expansível mantém abertura durante atualizações.


## Caixa inicial definitivo solicitado — 14/10/2026
Jogador começa novas campanhas com R$ 500 (50.000 centavos). Esta regra substitui os R$ 100.000.000 temporários de testes. Preservar campanhas já salvas, sem reset nem substituição de saldo retroativa.


## Placa de início — 14/10/2026
Exibir comece_flag.png sobre o mapa rural à esquerda/sudoeste da fazenda inicial, no ponto indicado pelo usuário (centro x=190, base y=1920, largura 230 no cadastro 3000×2000). Placa decorativa acompanha arraste/zoom e fica acima das artes do mapa, sem alterar propriedades, caminhos, estoques ou cliques. Abrir câmera da partida focada na região inicial para tornar a orientação visível. Arte original organizada em assets/icones/comece_flag.png, com manifesto e inventário atualizados sem modificar pixels.


## Premiada, economia e retaliação — 14/10/2026
Mimosa custa R$ 1.250 e Queijo Comum vende por R$ 50/unidade. Renomear De Luxo/Premiada para apenas Premiada na interface, preservando ID noble e PNG vaca_premiada; compra R$ 2.500 e Queijo Nobre vende por R$ 100. Fazenda nível 2 custa R$ 5.000 (fórmula existente R$ 2.500 × nível 2) e aceita 20 vacas.
Quando atacante perde, paga ao defensor vencedor conforme nível da equipe defensora: 1=R$ 50, 2=R$ 100, 3=R$ 150; mesma regra para IA e jogador. Não executar contra-ataque remoto. Prêmio é transferência real entre empresas, separado do custo de missão, despesa do perdedor e receita do defensor. Se faltar caixa, transferir disponível e persistir dívida restante, quitada ao entrar saldo nos ticks seguintes sem saldo negativo nem dinheiro criado. Somente resolver a compensação no resultado definitivo; incidentes offline pendentes não pagam antes da resolução. Mostrar regra/valor no menu de capangas e registrar resultado/ledger.


## Nome da queijaria inicial — 14/10/2026
A propriedade factory-ze passa a se chamar exatamente “Queijaria rudmentar do seu Zé”, conforme texto solicitado, no cadastro compartilhado pelo mapa e pelos menus. Preservar ID, imagem e estado salvo.


## Revisão de custos de expansão — 14/10/2026
Fazenda nível 2 custa R$ 30.000 e comporta 30 vacas; demais níveis preservados. Preço específico de nível 2 centralizado e compartilhado entre compra e menu, sem multiplicar R$ 30 mil pelo nível. Banco nível 1 contratação R$ 9.000, mantendo taxa e limite. Transportadora contratação R$ 15.000, manutenção R$ 300/dia. Equipe de capangas nível 2 contratação R$ 3.000 e manutenção R$ 50/dia; nível 3 contratação R$ 9.000 e manutenção R$ 100/dia; nível 1 preservado.
Armamento e barricada têm preços por melhoria comprada: 0→1 R$ 125, 1→2 R$ 1.500, 2→3 R$ 3.500. São custos incrementais (total R$ 5.125 por sequência completa), não preço fixo nem total acumulado. Preservar bônus e máximo de três níveis. Exibir e cobrar a mesma tabela; atualizar valor após cada compra, bloquear nível máximo. Novos preços valem para compras/manutenções futuras, sem reset, reembolso nem substituição de níveis já comprados.


## Banco 2 e produtos raros — 14/10/2026
Banco nível 2 custa R$ 60.000 para contratar; taxa diária de 2% e coleta sem limite preservadas. Vaca Radioativa custa R$ 18.000 e Queijo Radioativo vende por R$ 200/unidade. Vaca Mágica custa R$ 36.000 e Queijo Mágico vende por R$ 400/unidade. Preservar consumo, produção, tempos, descoberta e demais regras. Aplicar valores às compras e vendas futuras, inclusive estoque existente, sem reset nem reembolso retroativo.


## Estoques ilustrados e valor de venda — 14/10/2026
Painel das lojas e fábricas e menu superior Estoque de queijo mostram somente tipos com quantidade positiva, com PNG correspondente, nome, quantidade, preço de venda unitário atual e valor total daquele estoque (quantidade × preço). Não confundir valor potencial de venda com caixa coletado ou lucro. Usar receitas centralizadas, incluindo estoques antigos válidos, sem revelar produtos não possuídos. Estoque vazio deve ser informado. Atualizar cartões ao vender, coletar, transferir ou mudar preços, mantendo recursos reais.


# Produção paralela, início equilibrado e leilões — 14/10/2026 (regra posterior vigente)

Esta seção substitui regras anteriores conflitantes de recursos iniciais, cinco lojas inimigas, capacidade/linhas das fábricas, compra direta de imóveis rivais e derrota ao perder apenas a fazenda inicial.

- Nova campanha: jogador e IA começam com R$ 500, uma Magrela na fazenda, um litro de leite Fraco e um Queijo Fraco na queijaria, 10 embalagens e um vendedor na única loja de cada empresa, sem equipe de capangas grátis. IA inicia apenas com sale-e1 e controle em frente próximo à sua queijaria; outras 12 lojas são neutras. Fazenda e queijaria iniciais de ambas empresas permanecem. Essas condições valem para novas campanhas; não resetar nem retirar recursos/propriedades já salvos.
- Nome inicial correto: Queijaria rudimentar do seu Zé. Botão/ação de fabricação: Produzir & embalar. Um clique inicia uma unidade/linha com 1 L correspondente e uma embalagem; múltiplos cliques iniciam lotes simultâneos até o limite, sem acelerar os tempos individuais nem criar insumos. Inicial (e equivalente rival) permite cinco funcionários e cinco lotes simultâneos.
- Queijaria artesanal (factory-level-1): R$ 15.000, 10 funcionários, 10 lotes simultâneos, manutenção R$ 100/dia. Queijaria moderna (factory-level-2): R$ 60.000, 20 funcionários e 20 lotes simultâneos, manutenção R$ 400/dia. Valores por perfil/ID compartilhados entre domínio e menus. Funcionários ativos preenchem filas automaticamente, compram embalagens quando há caixa e somam bônus existentes; sem funcionário o jogador clica por lote. Respeitar estoque, linhas e leite. Manutenção diária também offline; falta de caixa mantém dívida sem saldo negativo.
- Disputar fazendas, queijarias e contratos bancários/transportadora por leilão. Lance inicial mínimo = valor de compra atual da propriedade + valor de compra das vacas alocadas (fazenda) ou contratação dos funcionários alocados (queijaria), e depois +10% sobre o total. Serviço usa apenas valor atual do contrato +10%, sem unidades. Preços de compra da propriedade neutra seguem disponíveis, mas imóveis rivais não podem ser adquiridos diretamente.
- Primeiro lance inicia prazo fixo de 10 dias de jogo. Novos lances sobem pelo menos 10% em relação ao maior anterior, arredondados para centavos, sem reiniciar prazo. Reservar valor integral do lance no caixa real; reembolsar integralmente quem foi superado. Quem já lidera não pode dar lance contra si mesmo. Exigir dinheiro suficiente, propriedade elegível e prazo válido, sem limite de distância para leilões (regra de ruas continua somente para ataques de capangas).
- Se o dono vencer, mantém a propriedade e recebe sua reserva de volta. Se o rival vencer, recebe a propriedade e suas vacas/funcionários/estoques existentes; vendedor recebe o valor final. Reserva não conta como despesa nem devolução como receita; compra/venda só reconhecidas no fechamento. Não duplicar pagamento ao salvar/recarregar. Novos leilões permitem recompra futura. Não encerrar a campanha pela perda isolada da fazenda: resultado final exige todas as lojas e ambas propriedades iniciais adversárias; não encerrar com leilões abertos.
- Durante disputa, manter operação normal, salários e manutenção, mas bloquear compra, venda/transferência de vacas e contratação de funcionários envolvidos para impedir retirada/manipulação dos itens avaliados. Demissão automática por falta de salário continua; avaliação inicial registrada e bens remanescentes transferidos.
- Correção expressa do usuário: banco e transportadora NÃO têm propriedade separada dos benefícios. Quem perde o leilão perde o contrato e a automação; vencedor assume contrato correspondente sem segunda contratação e passa a pagar suas taxas/diárias. Antigo titular só recupera por nova aquisição/leilão. Não permitir recontratar diretamente serviço do rival nem cancelar/trocar contrato durante disputa para contornar resultado. Cancelamento fora de disputa continua disponível e libera o serviço. Banco permanece exclusivo por empresa e taxas pendentes do antigo dono continuam devidas.
- Leilões usam relógio central e encerram também offline; incidentes militares offline continuam protegidos/pedentes conforme regra existente. Painéis mostram avaliação, maior lance/empresa, prazo, mínimo seguinte, reserva e regras; gestão Propriedades lista disputas abertas e Inimigos dá acesso aos imóveis rivais.
- IA usa mesmos comandos/caixa/recursos. Só entra ou cobre disputa quando há necessidade operacional ou defesa de bem próprio, margem operacional positiva projetada, lance dentro da avaliação mais 30 dias de margem e caixa que preserve pelo menos duas diárias de despesas (mínimo R$ 100) após reservar. Sem recursos/retorno suficiente, não disputa; sem dinheiro gratuito.
- Saves recebem auctions vazio quando ausente e contratos antigos são vinculados ao titular sem reset. Prazos persistidos, reserva e troca de dono/contratos idempotentes; perfis ampliam capacidades já possuídas sem remover pessoal ou lotes.
