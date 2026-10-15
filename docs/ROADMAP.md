# Roadmap e continuidade

Atualizado em 13/10/2026. Objetivo final: campanha integral do Seu Zé à conquista de Queijópolis e resultado no Hall dos Magnatas. Nenhuma redução de escopo autorizada. Fases e gates em FEATURE_MATRIX.md; fonte normativa CODEX_MASTER_SPEC.md.

## IA estratégica e início sustentável — 15/10/2026

Correção de layout: eliminada a quinta faixa residual da antiga barra de campanha nas folhas de estilo. Grade agora contém cabeçalho, setores, mapa flexível e rodapé fixo de uma linha (27 px); altura usa viewport dinâmica. QA `qa-map-layout.mjs` aprovado em 1910×910, 1000×700 e 390×844: mapa acima de metade da tela, canvas acompanha resize, rodapé fica no limite inferior e abrir/fechar gestão não altera área do mapa. Capturas desktop/mobile revisadas. Sem alterar campanha ou controles. Próxima etapa visual: inserir capa/gameplays e URL reais no README quando disponíveis.

README público ampliado a pedido do usuário: apresentação do jogo, objetivo, regras vigentes, produção, economia, pessoal, combate, IA, serviços, persistência, tecnologias, instalação e QA. Reservados um espaço de capa, três demonstrações de gameplay e, no final, o endereço do site. Exemplos de imagens/links futuros permanecem comentados, sem arquivos ou endereço fictícios ativos. Documentação apenas; sem mudanças na simulação, commit ou publicação. Próxima etapa de apresentação: inserir capa, capturas/GIFs e URL reais quando disponíveis.

Preparação para GitHub: README reescrito conforme o jogo atual, `.gitignore` sem duplicações e com exclusões de dados locais/credenciais de serviço/relatórios, `check:repo` integrado ao CI, permissões de leitura e timeout no workflow. Conferência local: 311 arquivos candidatos, 252,9 MiB, maior arquivo 10 MiB, especificações idênticas e nenhum padrão de segredo detectado. Arquivos de arte e evidências de QA foram preservados. Remoto existente `DenilsomLobo/Imperio_do_queijo`, branch `main`; commit e push ainda não realizados. Publicação do site e configuração Firebase permanecem etapas separadas.

Implementado: operação de todas as fazendas/fábricas/lojas e cinco receitas, suprimentos por necessidade, alimentação com análise de retorno/capacidade, investimento e substituição do rebanho, funcionário com retorno, reserva operacional, expansão/disputa pelos 24 objetivos, bancos/transporte, melhorias militares e seleção de ataque. Detalhes em [IA_ATUAL.md](IA_ATUAL.md).

O usuário autorizou ajustar a economia inicial dos dois lados. Regras vigentes em [BALANCEAMENTO_INICIAL.md](BALANCEAMENTO_INICIAL.md): ração R$ 0,25/unidade; loja, vendedor e capangas nível 1 R$ 5/dia cada. Preservar contratações, produção, queijos, caixas R$ 500/R$ 1.000 e campanhas existentes, sem reembolso ou recálculo de dívida. Margem-base alimentada com guarnição: R$ 5,25/dia antes de outros gastos.

Validação: 192 testes em 29 arquivos aprovados, incluindo cadeia, orçamento, alimentação/gargalos, evolução de vacas, funcionário, ruas/ataques, offline, persistência, crescimento com caixa inicial e encerramento por domínio em cenário solvente. QA Chrome `qa-ai-strategy.mjs`: 30 dias resultaram em 10 vacas, cinco lojas e R$ 690,58 de caixa; sem créditos extras, sorteios fixados em 0,99. Cenário de vitória usa recursos explicitamente fornecidos apenas na fixture. QA de compras/finanças aprovado; projeção da IA revisada em desktop/mobile, barras somente em Inimigos. Nenhuma campanha real foi resetada ou financiada pela verificação.

Próxima implementação: dificuldade em campanhas longas com ações do jogador, planejamento de retorno em longo prazo e distribuição tática de reservas. Firebase continua aguardando configuração; demais fases do mestre preservadas. Estratégia atual é baseada em regras e não garante vencer toda campanha.

| Fase | Estado | Próximo resultado |
|---|---|---|
| 1 Auditoria | Concluída | Inventário e diagnóstico em ASSETS/ARCHITECTURE |
| 2 Arquitetura/GDD/configurações | Em andamento | Store central, relógio, scheduler, schemas e persistência local |
| 3 Mapas/câmera/terrenos/editor | Em andamento | Validar regiões/arte; cadastrar polígonos reais; drag de vértices e sprites; import/export completos |
| 4 Fazendas e vacas | Parcial | Rural: produção/ração/3 espécies/vagas; faltam níveis superiores e demais regiões |
| 5 Fábricas e receitas | Parcial | Cinco receitas/linha/maturação rural; faltam níveis superiores/pessoal |
| 6 Funcionários e automação | Parcial | Vendedores/capangas com salários; faltam outras categorias/políticas |
| 7 Comércio e demanda | Parcial | Estoque/vendas/demanda/caixa rural; faltam mercados/preços/marketing |
| 8 Economia/bancos | Parcial | Ledger de entradas/gastos; faltam lucro contábil/patrimônio/bancos |
| 9 Capangas e melhorias | Parcial | Equipes 1–3/armas/barricadas/moral; falta integração ampla e escoltas |
| 10 Conquista/combate | Parcial | Missões/neutralização/compra/recuperação rural; falta campanha territorial completa |
| 11 IA e rivais | Parcial | Rival rural finito e agressão gradual; faltam demais rivais e estratégias avançadas |
| 12 Espionagem/sabotagem | Pendente | Missões temporárias e consequências |
| 13 Logística/exportação | Pendente | Veículos, entregas, escolta e contratos |
| 14 Pesquisa/reprodução | Pendente | Árvore, espécies e capacidade |
| 15 Campanha/vitória | Pendente | Tutorial/capítulos/7 dias e encerramento |
| 16 Login/cloud/ranking | Parcial | Entrada/perfis e top10 local; adaptador Auth/Firestore preparado; falta configuração e validação online/conta vinculada |
| 17 Balanceamento/publicação | Pendente | Campanha integral testada e publicação |

Persistência local e relógio serão introduzidos antes dos sistemas econômicos, embora o gate completo de salvamentos permaneça na fase 16. Cada fase entrega domínio, UI real, persistência e testes integrados conforme dependências; nenhuma interface decorativa encerra fase.

## Sessão inicial

Implementado: estrutura Vite/Phaser/Vitest; manifesto dos 47 assets reais; cinco entradas regionais provisórias; editor com cadastro independente, polígonos configuráveis, posição e largura de sprites, profundidade, proprietário/regras/ocupação, vínculo de segurança, seleção, câmera por arrastar, zoom e JSON validado. Importação inválida preserva dados anteriores. Domínio puro valida IDs, coordenadas, assets e referências. Dados econômicos iniciais centralizados, ainda sem simulação.

Não implementado: campanha jogável, cadastro final dos terrenos, finanças, relógio, persistência automática, mapa-múndi ilustrado, demais sistemas das fases 4–17. Editor perde alterações ao recarregar se não exportar. Campos numéricos/JSON permitem ajustar geometria; manipulação visual de vértices/sprites ainda pendente. Não confundir o editor com demonstração de campanha.

Problemas conhecidos: imagens de fundo já contêm edifícios; associação regiões/arquivos provisória; sem Git existente. Pendências detalhadas em DECISIONS.md.

Arquivos criados/alterados: package.json/lock, index.html, .gitignore, src/main.js, src/style.css, src/data/*, src/domain/* e docs/*. Assets e documentos originais preservados.

## Próxima sessão

Diretriz mais recente: navegação por zonas, sem Mapa-múndi/Editor para o jogador; foco rural. Preservar paleta oficial e malha de ruas/interseções (registro ao final). Não restaurar controles antigos por seguir o texto histórico do mestre.

Atualização de prioridade 14/10/2026: apresentação/menus e serviços centrais já integrados, conforme registro ao final. Próximo trabalho: completar capacidades dos serviços (pessoal/automação, bancos/contabilidade e logística real) e campanha, preservando novo layout e migração.

1. Ler AGENTS e os quatro docs obrigatórios, depois esta continuidade.
2. Ler CORRECTION_AUDIT e BALANCEAMENTO; executar testes e QA antes de ampliar. Cadastro rural 1+8+5, domínio/relógio/IndexedDB e cena separada já implementados.
3. Implementar upgrades/pessoal/automação da cadeia rural e contabilidade de estoque/capital/patrimônio; não tratar vendas menos gastos como lucro líquido para vitória.
4. Cadastrar serviços e demais regiões, preservar edifícios estáticos e atualizar somente controles/indicadores durante partida. Editor separado permanece funcional.
5. Expandir IA, logística, pesquisa/reprodução, tutorial/capítulos/vitória e Firebase/ranking conforme gates, sem descartar requisitos. Adicionar coordenação entre abas e migrações de saves antes de mudar versão de regras.

## Validação da sessão

- `npm test`: cinco testes de cadastro territorial passaram na primeira execução. Suíte ampliada: **8 testes passaram em 2 arquivos**, incluindo arquivos/hashes/regiões e preservação da especificação.
- `npm run build`: passou, 47 PNGs incluídos. Aviso de chunk JS ~1,22 MB antes de gzip (Phaser incluído); PNGs grandes. Carregamento por região e otimização de distribuição pendentes, mantendo originais.
- `npm audit`: zero vulnerabilidades após atualizar Vitest para 5.0.4. Cache npm dentro do workspace evita escrita fora da área permitida.
- Vite iniciou em `http://127.0.0.1:5173/`. Validação visual/interativa não realizada: ferramenta de navegador informou ausência de navegador disponível; inventário retornou `apps:[]` e `browsers:[]`. Não declarar câmera/editor validados em navegador apenas pelo build. Próxima sessão deve verificar seleção, arrastar/zoom, formulário e roundtrip de JSON no navegador.

## Continuação — iniciador Windows e acesso pelo terminal

- Criado `INICIAR_JOGO.cmd`: funciona a partir de qualquer diretório, verifica Node/npm, executa `npm ci` com cache local se Vite estiver ausente e inicia `npm start`. Mensagens de erro permanecem visíveis com `pause`. O servidor abre automaticamente o navegador padrão e escolhe outra porta se a 5173 estiver ocupada.
- Executado o `.cmd` pelo terminal: Vite iniciou primeiro em 5174, com a 5173 ocupada. Página respondeu HTTP 200. Após encerrar os servidores por um erro de monitoramento, reiniciado com sucesso em 5173.
- Corrigido erro EBUSY provocado pelos arquivos bloqueados do perfil de Chrome criado para QA: `vite.config.js` exclui perfis/logs de QA e cache npm do watcher. Diretórios temporários também ignorados no Git.
- Chrome headless executado pelo terminal e captura `docs/browser-preview.png` gerada e examinada. Tela inicial, menus regionais, painel e instruções renderizam. Isso não valida interações de câmera, editor ou fluxo de campanha, ainda pendentes.
- Usuário autorizou criar e substituir imagens quando necessário, no mesmo estilo artístico das referências. Diretriz registrada em AGENTS.md, GDD.md e DECISIONS.md; prevalece sobre a restrição visual original do mestre. Nenhum PNG original substituído nesta sessão.
- Arquivos desta continuação: INICIAR_JOGO.cmd, package.json, vite.config.js, .gitignore, README.md, AGENTS.md, docs/GDD.md, docs/DECISIONS.md, docs/ROADMAP.md e captura de QA.
- Regressão após alterações: 8 testes passaram e build aprovado; permanece o aviso já conhecido de tamanho do bundle Phaser.

## Correções solicitadas — implementação rural integrada

O estado descrito em "Sessão inicial" é histórico. Nesta sessão o usuário pediu explicitamente mapa preenchido, propriedades fixas, menus, produção/coleta/vendas, controle e combate reais. Pedido preservado em CORRECOES_SOLICITADAS.md; divergências auditadas em CORRECTION_AUDIT.md. Autorizou balanceamento inicial para lacunas.

Implementado: layout rural manual de 53 slots (18 propriedades, 14 controles, 21 terrenos). Início ao sul; cinco lojas inimigas ao norte e oito neutras. Partida abre rural automaticamente; editor anterior preservado em página separada. Sprites físicos não são reconstruídos por ações/ticks; controle lógico loja/posto é sincronizado e mostrado por círculo, bandeira e equipe. Menus reais e ícones condicionais coletam até capacidade, preservando excedente.

Domínio: vacas/ração/leite, cinco receitas/embalagens/linha/maturação, queijo/loja/vendedor/demanda/dinheiro acumulado; ledger e custos reais. Equipes, estrelas/armas/barricadas, moral/salários, alocação exclusiva, missões/alcance/custos/RNG/cooldown/recuperação/reserva, neutralização e compra. Rival com caixa/insumos finitos e produção/venda/ataques, agressão após dois dias. Offline em 1× limitado a oito horas, com missões pendentes sem perdas territoriais durante ausência. IndexedDB, saves por ação/15 s e reload.

Iniciador fixado em 5173 e detecta servidor do mesmo projeto; evita campanhas aparentemente perdidas por mudança de origem. Cache Vite por processo evita conflitos entre instâncias. Corrigido BOM no package.json que impedia CSS. `npm run dev` ainda pode usar outra porta; isso cria armazenamento independente. Usar INICIAR_JOGO.cmd para continuidade.

Arquivos: src/main.js, src/editor.js, src/game.css, src/map/game-scene.js, src/domain/game.js e testes, src/data/rural-layout.json/world.js/game-rules.js/balance.js, src/persistence/local.js e teste; editor.html, vite.config.js, scripts/start-game.mjs/qa-browser.mjs, package.json/lock, INICIAR_JOGO.cmd, README/AGENTS e documentos/capturas de QA. Nenhum asset original removido.

Verificado: **24 testes passaram**, incluindo os dois fluxos de integração, proteção offline contra ataque inimigo e reserva de defensores; teste real IndexedDB com fake-indexeddb. **Build final passou** para partida e editor; permanece aviso de bundle Phaser ~1,22 MB e otimização de assets pendente. **Último QA no Chrome passou** cadeia produtiva/coleta, compra/equipe/upgrades/ataque e salvar/recarregar, sem pageerrors; captura final com mapa preenchido examinada. Iniciador detectou e reutilizou o servidor do projeto na porta 5173.

Pendências materiais: apenas zona rural integrada, quatro regiões e serviços centrais ainda não; não há contabilidade patrimonial completa, política de preço/marketing, funcionários gerais/automação, especiais/pesquisa, logística/contratos, capítulo/tutorial/vitória ou serviços Firebase/ranking. Transferência manual rural instantânea até fase 13. Três estrelas ainda reutilizam arte nível 2 com indicador. IndexedDB valida versão, mas ainda sem migrações e trava entre abas. Escopo final intacto; nenhuma fase ampla marcada concluída indevidamente.

## Apresentação, construções e gestão — 14/10/2026

Pedido: melhorar visibilidade/beleza, colocar os PNGs no jogo, menus superiores de gestão e liberdade para novo mapa/reposicionamento. Novo fundo rural-open-v1.png, sem edifícios incorporados, no mesmo estilo de referência. Prompt/procedência em ASSET_GENERATION.md. Todos os 47 PNGs originais preservados; inventário atualizado para 48 arquivos.

Layout versão 2: 28 propriedades físicas (4 fazendas, 4 fábricas, 14 lojas e 6 serviços), 14 controles e 6 terrenos; serviços no centro, inimigos a nordeste na área vermelha, começo ao sul. Lojas têm círculo em frente. Sprites 210–310 unidades, zoom/foco/visão geral e Canvas; corrigida a escala pequena sobre cenário carregado. Ajustada sobreposição de lojas; interface não rola externamente no notebook.

Oito menus superiores: propriedades, funcionários, leite, queijo, vacas, vendas, dinheiro e inimigos. Totais reais, detalhamento e navegação à propriedade. Queijo inclui estoque pronto em loja e fábrica; não desaparece do total ao transferir. Venda acumulada por empresa vem do ledger, não de artes/controle atual do ponto. Catálogo 48 imagens com variedades especiais identificadas como dependentes de pesquisa. Tropas 3 estrelas usam os trios fornecidos.

Menus dos serviços têm comportamento: bancos mostram finanças; agências encaminham contratação de vendedores/equipes a locais próprios; loja de vacas compra/aloca; transportadora transfere estoque real. Fazendas/fábricas neutras nível 1/2 compráveis, vazias inicialmente, com limites por nível do mestre. Não foram fingidos empréstimos, veículos, pesquisadores ou funcionários ainda ausentes.

Migração layout 1→2 preserva dinheiro, estoque, vacas, controle, equipes, tempo e ID da campanha. Novos serviços/edifícios adicionados sem recursos gratuitos; save incompleto recusado. Origem de IndexedDB/iniciador continua 5173; editor adaptado às dimensões do novo mapa.

Validação: **28 testes passaram em 5 arquivos**; build passou para partida/editor. QA cadeia produtiva/coleta/combate/save/reload no Chrome passou com novas coordenadas; QA gestão passou oito menus, catálogo 48 imagens, compra real na loja de vacas, conservação de estoque e notebook 1366×768 sem scroll externo. Capturas qa-management-map.png/qa-management-laptop.png/qa-catalogue.png examinadas. Mantém aviso de bundle Phaser e assets pesados; otimização pendente.

Arquivos: novo assets/mapas/rural-open-v1.png; src/data/rural-layout.json/world.js/regions.json/game-rules.js; src/domain/game.js/management.js/management.test.js/game.test.js; src/ui/management.js; src/main.js/game.css/editor.js; src/map/game-scene.js/presentation.js; src/persistence/local.js; scripts/rebuild-rural-layout.mjs/normalize-asset-inventory.mjs/qa-browser.mjs/qa-management.mjs; package.json; documentos e capturas. Fases globais continuam parciais. Quatro regiões, pessoal/automação completos, bancos/empréstimos/contabilidade, logística/contratos, pesquisa/especiais, campanha/vitória e Firebase/ranking ainda pendentes; trava entre abas também pendente.

## Ruas, esquinas e paleta oficial — 14/10/2026

Implementado: malha de dez ruas isométricas e 14 esquinas cadastradas. Cada loja e posto compartilham intersectionId; círculo/equipe posicionados na interseção e loja ao lado, em frente ao controle. Bancos/agências/transportadora/loja de vacas em quadras centrais; fazendas produtivas externas a oeste/sul, fazenda inicial no extremo sul; empresa inimiga concentrada ao norte. IDs e estado econômico preservados, sem reiniciar dinheiro/estoques/equipes. Cenário lógico 2400×1800 e fundo anterior preservado, com ruas desenhadas como camada separada, estável durante a simulação.

Paleta completa aplicada em theme.css: creme/bege, navbar madeira, texto marrom, botões verdes/amarelos, bordas bege, avisos terracota, rodapé profundo; indicadores do mapa usam dourado/amarelo/terracota. Mapa-múndi e Editor removidos da interface. Apenas zona rural habilitada; atalhos Centro/Fazendas/Fronteira norte ajustam câmera de verdade. Editor interno preservado, adaptado às ruas, excluído do build do produto. Outras zonas seguem no escopo, mas não exibem mapas vazios ao jogador.

Arquivos: scripts/rebuild-rural-layout.mjs, src/data/rural-layout.json/world.js, src/map/streets.js/streets.test.js/game-scene.js, src/theme.css, src/main.js/editor.js, vite.config.js, scripts/qa-management.mjs, AGENTS/GDD/ARCHITECTURE/README e este roadmap. Nenhum asset bitmap ou sistema econômico foi removido.

Validação: **31 testes passaram**, incluindo alinhamento de cada círculo em duas ruas reais, limites do traçado e distribuição rural/norte. QA Chrome de gestão passou nova paleta/menus/cadastro; cadeia leite→queijo→loja→dinheiro, combate e reload passou com coordenadas atualizadas. Captura do cenário novo examinada. **Build final aprovado**, somente index.html (editor fora do produto). QA final confirmou ausência de Mapa-múndi/Editor/outros distritos vazios e navbar rgb(92,64,48), correspondente a #5C4030. Notebook 1366×768 sem rolagem externa. Aviso de bundle grande continua; funções globais de campanha e sistemas avançados continuam pendentes.


## Última atualização — mapa solicitado, 14/10/2026

Revisão visual rural integrada: cidadezinha central, campos sul/oeste e plantação sombria ao norte. 28 edifícios físicos e 14 controles, com exatamente um banco nível 2. Cidade: 2 lojas inimigas/3 neutras; campo: 1 inicial/4 neutras; norte: 3 inimigas/1 neutra. Bandeiras completas mesmo com equipes. Novo fundo rural-village-v2.png; inventário 49 PNGs, originais preservados. IDs/saves/estoques mantidos. Prompt, distribuição e ferramenta integrada em RURAL_MAP_V2.md; imagem completa em rural-map-complete.png. Exportação local isolada não acessa saves e não entra no build público.

Validação: 32 testes passaram em seis arquivos, contagens/distritos/banco único; build aprovado. QA Chrome passou produção/coleta/vendas, equipes/combate, IndexedDB/reload e oito menus/catálogo/compra real/conservação de estoque/notebook sem scroll externo. Composição examinada. Aviso de bundle grande permanece.

Próxima implementação: pessoal/automação, bancos/contabilidade e logística real conforme fases. Demais regiões, pesquisa, capítulos/vitória e cloud/ranking continuam pendentes. Revisão visual rural concluída; campanha integral permanece em desenvolvimento. Consultar RURAL_MAP_V2.md antes de reproduzir layouts históricos.

## Captura anotada — revisão 3, 14/10/2026

Diretriz visual vigente: RURAL_MAP_V3.md substitui posições/ruas do registro anterior. Área lógica 3000×2000, imóveis rurais mais dispersos, rede única de caminhos ligando destinos reais, sem braços soltos. Estrada de terra com textura PNG rural-dirt-road-v1.png gerada pela ferramenta integrada; inventário 50 PNGs, originais preservados. Todas as 14 lojas conservam bandeira próxima. Migração 2→3 corrige uma vez os dois controles cinza marcados (sale-n1/sale-n2), preserva propriedade adquirida pelo jogador e demais recursos, recolhe equipes rivais à reserva e cancela missões afetadas sem duplicação. Rival ainda pode disputar terrenos por combate normal.

35 testes passaram em sete arquivos, incluindo rede conectada/extremidades válidas e migração idempotente. Exportação atualizada para 3000×2000. Próxima implementação continua pessoal/automação, bancos/contabilidade e logística, sem descartar demais fases da campanha.

Verificação final: QA Chrome aprovado para produção/coleta/vendas, compra/equipes/combate, IndexedDB/reload e oito menus/catálogo/compra de vaca/conservação de estoque/notebook sem scroll externo; zero pageerrors. Composição final exportada e examinada. Build aprovado; aviso de bundle Phaser grande permanece. Campanha completa ainda pendente.

## Placas e coleta — 14/10/2026

Pedido da captura: melhorar fundo/letras/bordas dos indicadores, nome abaixo do edifício, contador abaixo do nome, coleta acima. Implementado em game-scene.js: placas arredondadas com sombra e borda dupla, nome em Georgia negrito sobre madeira com detalhes dourados; contador em creme com Trebuchet. Nomes visíveis em todas as construções. helper collectorPosition agora centraliza ícone acima do telhado; botão circular dourado com anel duplo e alvo de clique compatível. Indicadores continuam derivados do estado real, sem trocar edifícios/territórios ou salvamentos.

QA Chrome aprovado para coleta nas novas coordenadas, produção/vendas/combate/IndexedDB e gestão completa; zero pageerrors. Build aprovado, aviso Phaser já conhecido. Captura ampliada docs/qa-property-plates.png examinada; scripts/qa-property-plates.mjs reproduz inspeção em contexto isolado. Continuação mantém automação, contabilidade/logística e campanha conforme fases; esta revisão é visual.

## Controle dinâmico e ícones — 14/10/2026

Diretriz vigente em CONTROLE_E_INDICADORES.md: nomes no mapa, quantidades apenas nos menus; ícones fornecidos de leite/queijo/dinheiro a partir de uma unidade e clique de coleta real. Ícones de ataque/defesa enquanto missão está ativa, removidos após resultado. Bandeira provisória substituída por equipe alocada (inclusive ocupada). Lojas mudam textura aliada/inimiga/neutra conforme proprietário, preservando objeto/posição/ID; exceção explícita do usuário à arte física fixa. Vitória sempre neutraliza loja e posto; neutros só por compra, inclusive para IA com caixa finito. Usuário confirmou preservar cinco lojas iniciais rivais e demais neutras além da barraquinha inicial.

Inventário 55 PNGs, os cinco icon_* já fornecidos pelo usuário. 39 testes passaram em oito arquivos; QA Chrome produção/coleta/vendas, combate/save/reload, gestão e novas artes aprovado, zero pageerrors. Build aprovado; aviso de bundle conhecido permanece. Próximas fases continuam pessoal/automação, bancos/contabilidade/logística e campanha; nenhuma declaração de conclusão global.

## Campanha rural, agência e reset — 14/10/2026

Diretriz atual em CAMPANHA_RURAL.md: ícones sempre acima da propriedade; níveis de equipe pela arte, sem estrelas. Aliases nível 3 dos trios fornecidos, inventário 57 PNGs. Agência permite comprar/alocar equipes nível 1/2/3 por preço real e posto encaminha compra à agência. Campanha: controlar todos os 14 pontos libera imóveis finais; comprar fazenda E fábrica rivais causa vitória. Rival controla todos os pontos e compra a fazenda inicial causa derrota, com IA/caixa reais. Resultado persistido, relógio e ações encerrados; objetivo/progresso/banner no jogo. Reset único explicitamente solicitado com marcador session-reset.json; não alterar esse marcador sem novo pedido. Novo progresso não é apagado ao recarregar.

43 testes passaram em nove arquivos. QA Chrome reset/progresso no reload, compras finais/vitória/derrota persistidas aprovado; cadeia produtiva/combate/gestão também passou. Build aprovado; aviso de bundle conhecido permanece. Final rural integrado, campanha completa do mestre ainda parcial. Próximas fases: pessoal/automação, contabilidade/logística, demais regiões/pesquisa/cloud/ranking, balanceamento e testes da campanha integral. Registros anteriores de contador/estrelas/ícones laterais e ausência de condição de vitória são históricos.

Publicação autorizada pelo usuário no repositório https://github.com/DenilsomLobo/Imperio_do_queijo.git. Histórico remoto consultado: vazio. Git local inicializado em main; CI GitHub Actions para npm ci/test/build preparado. Revisão final da agência corrigiu preservação do posto/nível selecionados após compra. QA final passou cadeia produtiva/combate/gestão e reset/compras nível 3/vitória/derrota persistidas. Não manter o texto histórico de catálogo 48/50/55 como estado atual: são 57 PNGs. Não alterar session-reset.json em nova sessão sem pedido explícito.

Publicação efetivada: push da branch main aprovado pelo GitHub, commit inicial 8455ea0. Código/57 PNGs/documentação/scripts/capturas e CI enviados; arquivos de ambiente, caches, perfis de navegador e dependências excluídos. Publicação do código no repositório, sem afirmar hospedagem GitHub Pages. Para jogar em outro computador, clonar/baixar e executar INICIAR_JOGO.cmd com Node instalado. Continuidade agora pode usar histórico Git normal.

## Painel de fazenda e rebanho — 14/10/2026

Implementado conforme captura anotada: arte da fazenda; explicação de produção/ração; estoques com ícones por qualidade; ração nomeada com preço por unidade e quantidade livre de 1 a 1000; compra de vacas somente na loja com fazenda de destino; gestão de rebanho por espécie/quantidade para transferência ou venda. Sem ração produz 50%; consumo mantém proporção e limites de estoque. Venda por 70% após três dias da compra, registrada no ledger. Transferência preserva idade e valida propriedade/vagas. Botão manual de salvar removido; checkpoints automáticos mantidos.

46 testes passaram e build aprovado (aviso de bundle já conhecido). scripts/qa-farm.mjs passou no Chrome: imagens, compra de 100 rações, loja, bloqueio de revenda e reload. Captura docs/qa-farm-panel.png revisada. Arquivos: src/main.js, src/theme.css, src/data/game-rules.js, src/domain/game.js, src/domain/game.test.js, src/domain/herd.test.js, scripts/qa-farm.mjs e documentação.

Pendente de resposta do usuário: anotação 1 vaca = 1 L/dia e 1 queijo = 1 L aplica a todas as espécies/receitas ou somente Magrela/Minas Frescal? Valores do mestre preservados até definição; demais mudanças estão integradas. Próximo passo: aplicar proporção confirmada, ajustar consumo da IA e expectativas da cadeia, depois seguir roadmap global. Não resetar campanha.

## Cadeias por origem — 14/10/2026

Confirmado pelo usuário e integrado em src/data/dairy.js: Magrela → Fraco, Mimosa → Comum, Premiada → Nobre, Radioativa → Radioativo, Mágica → Mágico, mantendo qualidade do leite até o queijo. Arquivo real do leite radioativo: Cálice de Leite Radioativo Neon.png (não existe leite_radioativo.png). Estoques da fazenda/fábrica/loja usam ícones corretos; gestão de vacas exibe as cinco cadeias com artes fornecidas. Espécies especiais parametrizadas conforme mestre, compra bloqueada por pesquisa própria; sistema de pesquisa completo permanece pendente. Nenhuma espécie especial concedida por catálogo. 52 testes e build aprovados; QA Chrome da fazenda aprovado. Proporção em litros ainda não esclarecida, valores anteriores preservados. Próximo: confirmar proporção e implementar pesquisa na fase prevista.

## Descobertas, litros inteiros e barraca inicial — 14/10/2026

Diretriz posterior implementada: nenhum tipo de leite sem estoque aparece no painel; catálogo e seleção de receitas ocultam origens ainda não descobertas. Comprar uma vaca não revela seu produto. Descoberta ocorre com primeiro litro completo e persiste por empresa; leite/queijo inicial já disponível revela Fraco. Gestão de vacas agora mostra cartões quadrados com imagem/quantidade somente do rebanho de cada fazenda, sem quadro que revele cadeias futuras.

Consumos diários 10/20/40/80/100 para Magrela/Mimosa/De Luxo (asset vaca_premiada)/Radioativa/Mágica. Produção simplificada em 1 L/vaca/dia com ração e metade sem ração; estoque só recebe litros completos, progresso interno é salvo. Receitas ativas Fraco/Comum/Nobre/Radioativo/Mágico usam 1 L da origem correspondente e uma embalagem. Receitas antigas somente para processar lotes/estoques existentes. Botão Salvar jogo no cabeçalho junto de Catálogo, removida indicação Salvo localmente do painel; autosave continua.

Pedido adicional da captura integrado: sale-ze movida de (775,1740) a (660,1840), controle (765,1880), caminhos e interseção recalculados. shopAsset preserva ponto_de_venda_inicial_seu_ze.png enquanto a barraca for do jogador, em vez de substituir por loja aliada genérica. Mesmos IDs/estoques/campanha; nenhuma revisão de reset. Gerador de cadastro atualizado.

Validação: 57 testes em 11 arquivos, build aprovado e git diff --check sem erros. QA Chrome de fazenda/gestão/cadeia produtiva/combate e save/reload aprovado. Novos scripts qa-dairy.mjs e qa-initial-shop.mjs validam descoberta só após litro completo, receitas, persistência, arte inicial, separação da fábrica e clique no novo local. Capturas revisadas: qa-initial-shop-position.png e qa-dairy-discovery.png. Aviso conhecido de bundle grande permanece. Próximas fases: pesquisa para desbloqueio real de espécies especiais, pessoal/automação, finanças/logística e demais requisitos globais; não declarar campanha integral concluída.

## Barraca, bandeira inicial e organização dos PNGs — 14/10/2026

Pedido posterior implementado: sale-ze usa ponto_de_venda_inicial_seu_ze.png enquanto do jogador; sale-ze-control mantém bandeira_capanga_aliado.png inclusive com equipe alocada, sem alterar equipe lógica. Demais lojas compradas pelo jogador usam Ponto_de_venda_aliado.png; demais postos preservam troca bandeira/equipe. Esta é exceção visual explícita à diretriz anterior.

57 PNGs movidos sem edição para subpastas construcoes, producao, seguranca, mapas e icones. Nomes/IDs preservados; src/data/asset-paths.json mapeia caminhos e src/data/assets.js centraliza glob recursivo para jogo/editor/preview. Inventário com path e hashes verificados; referências de documentação e registrador de arte atualizados. assets/README.md explica organização.

59 testes passaram, build aprovado. QA Chrome: barraca com equipe inicial mantém bandeira; loja comprada usa arte aliada; descoberta/receitas/reload/gestão passaram. qa-assets.mjs verificou os 57 PNGs em jogo, editor e preview sem 404 nem erros de página. Captura qa-initial-shop-position.png revisada. Próximas fases globais permanecem no roadmap; nenhuma publicação externa ou reset realizado.

## Reset protegido e consolidação normativa — 14/10/2026

Botão Resetar campanha ao lado de Salvar jogo. Modal acessível com etapa 1 (aviso/Continuar/Cancelar) e etapa 2 (digitar exatamente SAIR + clicar OK). Campo incorreto/espaços não habilitam OK; Enter sozinho não conclui. Cancelar/Escape preservam campanha e reabrir limpa confirmação. Durante gravação, confirmação fica bloqueada contra duplicação.

Reset substitui atomicamente apenas campaigns/current por createGame com UUID novo, antes de trocar memória/cena. Usa fila saveChain e bloqueio temporário de autosave/relógio durante commit; falha mantém estado anterior e permite tentar de novo. Não altera session-reset.json. Nova campanha persistida e recarregável; dados de outras chaves mantidos. Botão só habilitado após carregar a campanha.

Regras de todos os pedidos desta conversa consolidadas em AGENTS.md e seção final idêntica nas duas cópias de CODEX_MASTER_SPEC.md: painel/rebanho, consumo, produção e receitas, descoberta, compra/realocação/venda, barraca/bandeira, subpastas e salvar/reset. Regras posteriores explicitamente prevalecem sobre trechos históricos conflitantes.

Validação: 59 testes e build passaram. scripts/qa-reset.mjs passou no Chrome em contexto isolado: duas etapas, palavras inválidas, SAIR exato, Enter, cancelar, Escape, falha simulada de IndexedDB preservando progresso, retry, substituição real e reload, preservação de outros dados. Captura qa-reset-protected.png revisada. Campanha real do usuário não foi resetada. Próximas fases globais permanecem conforme roadmap.

## Fábrica com funcionários e agências — 14/10/2026

Implementado pedido atual: fábrica com arte/funcionamento, imagem dos empregados alocados, quatro vagas iniciais, bônus cumulativo de produção, automação de lotes e embalagem comprada com caixa real. Agência de funcionários com arte e três cartões clicáveis mostrando contratação/salário/bônus/destino; vendedores preservados. Agência de capangas com arte e três cartões/custos/salários/posto. Bandeira inicial agora substituída pela equipe contratada (pedido novo revoga exceção anterior).

Contratação/salário de funcionários níveis 1/2/3: R$ 2.000/200, 4.000/350, 8.000/600. Bônus 5/10/15% somados; capacidades 4/6/10/16. Sem salário, atividade suspensa, atrasados podem ser pagos; quatro dias não pagos geram demissão e placa/relatório persistido. Capangas têm salários por nível 50/80/120 e saída após quatro dias; reservas incluídas. Coleta e envio de queijo continuam manuais; não confundir com logística automatizada.

Três PNGs novos movidos a assets/pessoal/funcionarios, manifestos/inventário atualizados: 60 PNGs. Regras atualizadas em AGENTS.md e ambas as cópias idênticas do CODEX_MASTER_SPEC.md. Novos módulos domain/workers.js e ui/staff.js; domínio/UI/gestão/mapa e migração integrados. Campanhas preservadas, sem reset.

67 testes automatizados passaram. QA Chrome novo scripts/qa-workers.mjs passou contratação real, cartões/preços, produção sem clique, embalagem paga, imagem do capanga inicial, save/reload e aviso/dismissal de demissão. QA assets (60 imagens no jogo/editor/preview), gestão e barraca passaram; capturas qa-worker-agency.png, qa-factory-workers.png e qa-guard-agency.png revisadas. Build aprovado com aviso de bundle conhecido. Próximos passos globais continuam tratadores/logística/outros funcionários, automação configurável, pesquisa/demais regiões/nuvem/ranking; não declarar campanha mestre integral concluída.

## Serviços bancários de coleta — 14/10/2026

Implementado banco 1 (R$ 200 mil, 1%, até R$ 500 mil de vendas/dia) e banco 2 (R$ 500 mil, 2%, sem limite de vendas). Usuário confirmou limite por vendas totais da empresa/dia e base de taxa vendas menos despesas se positivo. Coleta automática real de lojas próprias, sem duplicar faturamento; limite suspende novas coletas e reinicia no próximo dia. Um contrato ativo, troca encerra anterior, cancelamento imediato disponível. Taxa devida liquidada no fechamento/troca/cancelamento e preservada como dívida se faltar caixa. TaxedProfit evita repetição sobre resultado já apurado.

Painéis com foto/descrição, custo/taxa/limite, situação, motivo de bloqueio, valores diários, contratar/trocar/cancelar e acesso pela gestão financeira. bank-city corrigido de nível 1 para 2 no cadastro/gerador e migração. Regras em AGENTS, duas especificações idênticas e BALANCEAMENTO. Novos domain/banking.js, ui/banking.js e testes/QA; ledger passa a manter resumo diário. Demais finanças patrimoniais e empréstimos continuam pendentes.

75 testes passaram em 13 arquivos, incluindo contratação, exclusividade, caixa finito, limite inclusivo, banco 2 sem limite, reset diário, 1%/2%, prejuízo, cancelamento, dívida, migração e idempotência. QA Chrome qa-banking.mjs passou preços, coleta real, bloqueio diário, troca, cancelamento, save/reload e zero pageerrors em contexto isolado. Capturas qa-bank-level-1/2.png revisadas. Nenhuma contratação/reset na campanha real do usuário. Próximas fases globais continuam pessoal/logística/pesquisa/regiões/cloud/ranking, conforme roadmap; não declarar campanha completa.

## Menu ilustrado de gestão — 14/10/2026

Barra superior redesenhada com oito cartões ilustrados, totais reais, abertura de menus, estados hover/foco/aberto e ícone correspondente no cabeçalho do diálogo. Navegação por Tab/Enter, setas esquerda/direita, Home/End e Escape. Layout de oito colunas no desktop/notebook, quatro colunas em telas intermediárias e faixa com rolagem horizontal em telas pequenas. Valores completos podem quebrar linha, sem ellipsis entre cartões.

Oito SVGs temporários originais em assets/icones/menu-temporario; caminhos isolados em data/menu-icons.json para trocar pelas futuras imagens do usuário. assets.js resolve PNG/SVG por glob; catálogo e recursos continuam usando apenas seus assets normais. Inventário temporário separado em docs/menu-icons-inventory.json; 60 PNGs preservados. Novo src/sector-menu.css; UI/main atualizados. Regras em AGENTS e ambas as especificações idênticas.

QA scripts/qa-sector-menu.mjs passou oito imagens carregadas, todos os painéis reais, estado ativo, navegação por teclado, 1920/1366/900px e valor monetário longo. QA de gestão passou oito menus, catálogo, compras e viewport notebook sem scroll externo. Capturas qa-sector-menu-wide/laptop/tablet.png revisadas; build aprovado. Próximos passos: substituir ícones quando usuário os fornecer e continuar roadmap econômico/campanha; nenhuma alteração econômica ou reset nesta tarefa.

## Dia em 20 minutos — 14/10/2026

Dia reduzido de 60 para 20 min em 1×, 10 min em 2× e 5 min em 4×, com tooltip no seletor. Produção/ração/vendas/salários/taxas acompanham o calendário central. Receita em minutos mantém duração-base; não acelerar todos os processos indiscriminadamente. Limite offline preservado em 8 horas reais (24 dias).

Migração clockVersion=2 preserva dia/horário e progresso antigo sem reset; escala datas de vacas/funcionários/maturação/ledger, conserva segundos de lotes/missões/recuperação e mantém incidentes offline. Regras registradas no AGENTS e nas duas especificações idênticas.

78 testes passaram, incluindo produção/salário em 20 minutos e migração idempotente de calendário e prazos. QA Chrome de descoberta/produção/combate/bancos/funcionários e save/reload passou com os novos intervalos; scripts atualizados para a escala. Próximos passos de balanceamento e demais fases globais permanecem.

## Transportadora automática e dias 5/3/1 — 14/10/2026

Implementado serviço rural por R$ 500 mil + R$ 200/dia: leite automático de fazendas a fábricas próprias e queijo pronto a lojas próprias. Prioridade a fábrica com empregado ativo e loja com vendedor; espaço/qualidade/excedente preservados, sem recursos gratuitos. Funcionários continuam responsáveis por fabricar e banco por recolher caixa. Contrato único com cancelamento, contadores, vencimento e pausa/retomada por caixa insuficiente. Menu com foto, preços e explicações; link em gestão financeira e transferência manual avulsa preservada.

Última instrução de tempo aplicada exatamente: 1×=5 min/dia, 2×=3 min, 4×=1 min. Fatores centrais não lineares 1,5/3,5; relógio único. Migração clockVersion=3 preserva campanhas das escalas anteriores, sem reset; offline8h=96 dias-base. AGENTS e duas especificações idênticas atualizados com ambas as solicitações.

85 testes passaram em 15 arquivos. QA Chrome qa-logistics.mjs passou contratação, leite→queijo→loja→venda sem clique de coleta, manutenção, persistência/cancelamento e mediu um dia exato em cada modo 5/3/1. QA de descoberta e cadeia econômica/combate/save/reload passou. Captura qa-logistics.png revisada. Novos módulos domain/logistics.js, ui/logistics.js e testes; game/main/gestão/clock/balanceamento integrados. Próximas fases globais: veículos/viagens, demais automações, pesquisa/regiões/cloud/ranking e balanceamento completo; serviço rural atual não substitui toda a fase logística do mestre.

## Loja das cinco vacas — 14/10/2026

Pedido atual implementado: loja com cinco cartões de retrato, nome, preço e consumo diário. Todas as espécies compráveis diretamente com dinheiro/vagas, sem pesquisa para Radioativa/Mágica. Preços raros R$ 35 mil/60 mil e consumo 80/100 por dia; demais preços/consumos mantidos. Seleção por cartão, confirmação com fazenda de destino e seleção preservada após compra. Retratos reutilizam PNGs já organizados em producao/vacas; sem duplicação.

Removidos bloqueio de domínio e filtro/aviso de pesquisa da loja. Mistério dos leites/queijos continua até primeira produção. Regras anteriores de pesquisa explicitamente revogadas nos documentos obrigatórios; não é necessário resetar saves. Novo ui/cow-shop.js, main/CSS/regras/testes atualizados.

86 testes passaram; build aprovado. Novo QA Chrome qa-cow-shop.mjs passou cinco imagens, valores/consumo, compra direta das raras, alocação, seleção mantida, descoberta ainda oculta e persistência no reload. QA de fazenda/gestão passou. Captura qa-cow-shop.png revisada. Próximas fases continuam conforme roadmap global; pesquisas permanecem no escopo para outros usos, sem bloquear essas vacas.


## Consulta econômica e caixa de testes — 14/10/2026
Caixa inicial ajustado para R$ 100 milhões, somente em novas campanhas, sem resetar saves existentes. Preços, consumo, produção, vendas e pessoal consolidados em ECONOMIA_ATUAL.md a partir das regras executadas. Próxima etapa: balancear economia após testes do usuário.


## Painel de propriedade sobre o mapa — 14/10/2026
O mapa ocupa toda a largura disponível, inclusive a antiga coluna de gestão direita. Painel de propriedade começa fechado e abre sobre o mapa ao selecionar uma propriedade, inclusive por menus de gestão. Possui borda, rolagem interna e botão X acessível para fechar; Escape fecha quando nenhum diálogo modal está aberto. Fechar preserva estado/progresso e não redimensiona o mapa. O mapa continua navegável na área descoberta.

Implementado em main.js/map-layout.css; próxima etapa permanece balanceamento e testes do jogador.

Validação do painel sobreposto: 88 testes passaram, build aprovado e QA Chrome qa-property-overlay.mjs passou clique na construção, abertura via gestão, fechamento X/Escape, largura integral sem redimensionar canvas e resoluções 1920/1366. Capturas qa-property-overlay-open.png e qa-property-overlay-laptop.png revisadas.


## Produção, venda e custos revisados — 14/10/2026
- Receita por unidade em tempo-base 1×: Fraco 1 min, Comum 3 min, Nobre 5 min, Radioativo 10 min e Mágico 15 min. Relógio central escala fabricação com os modos 1×/2×/4× (dias de 5/3/1 min). Bônus dos funcionários continuam acelerando. Sem bônus e com insumos, uma linha fabrica 5 Fracos por dia. Lotes já iniciados preservam seu prazo; novos lotes usam tempos revisados.
- Loja com vendedor ativo vende todo estoque restante no fechamento diário, sem limite de 20 unidades nem bloqueio pelo teto de caixa nessa liquidação. Vendas graduais durante o dia permanecem; fechamento esvazia as sobras, registra receita real no dia encerrado antes da taxa bancária e mantém dinheiro na loja para coleta manual/banco. Sem vendedor ativo não vende. Não criar dinheiro sem estoque nem duplicar venda ao recarregar.
- Capacidade da fazenda nível 1, inclusive inicial: 10 vacas. Saves existentes passam a usar o novo limite sem reset.
- Capangas nível 1: contratação R$ 125 por equipe de 3 e manutenção R$ 25/dia. Contratação dos níveis superiores preservada em R$ 550 e R$ 1.150; diárias níveis 2/3 seguem R$ 80/120.
- Funcionário nível 1: contratação R$ 250, manutenção R$ 25/dia. Níveis 2/3 preservados.
- Ração: R$ 25 a cada 10, equivalente a R$ 2,50/unidade. Consumos de cada espécie permanecem 10/20/40/80/100 por dia.

Próxima etapa: balanceamento após testes do jogador.


## Embalagens e Magrela — atualização posterior de 14/10/2026
Pacote de 10 embalagens custa R$ 25 (R$ 2,50/unidade, inclusive compra automática). Vaca Magrela custa R$ 250. Substitui preços anteriores; consumo e produção permanecem. Aplicar em novas compras sem reembolsos nem reset de campanhas.


## Abertura e manutenção de lojas — 14/10/2026
Abrir/comprar uma loja neutra custa R$ 500. Cada loja de empresa (incluindo inicial e lojas já possuídas) cobra R$ 25 por dia no fechamento central, inclusive offline, separadamente do vendedor. Registrar despesa real no ledger. Sem saldo suficiente, pagar o disponível e manter restante como manutenção pendente, sem caixa negativo nem fechamento automático. Cobrar pendência nas próximas viradas com caixa disponível; neutras não geram manutenção. Menu informa abertura, diária e pendência. Preservar saves e estoques.

Validação da revisão econômica: 95 testes passaram em 17 arquivos, build aprovado e QA de interface Chrome passou. Novos testes cobrem venda integral mista acima do teto antigo, ausência de vendedor, não duplicação após reload, cinco Fracos por dia, capacidade de dez vacas, débitos de ração/embalagem/Magrela/pessoal, abertura e manutenção de duas lojas e pendência sem saldo negativo.


## Painel de combate dos capangas — 14/10/2026
Ao selecionar um posto de capangas, mostrar arte da equipe, dano de ataque e força de defesa reais, base, quantidade/nível, moral, disponibilidade e cooldown. Armamento soma 12% por melhoria exclusivamente ao ataque, máximo 36% (3 níveis); barricada soma 15% por melhoria exclusivamente à defesa local, máximo 45%, sem força própria quando não há equipe. Base = quantidade × fator de nível (1/1,4/1,9); moral multiplica ambas as forças. Missão/recuperação ou moral zero zeram forças. Cooldown sozinho impede novo ataque, sem zerar defesa.
Explicar empate: forças iguais dão 50% para cada lado e o sorteio decide; não há prioridade automática por nível. Chance = 50 + 40 × (ataque − defesa)/(ataque + defesa), limitada a 5–95%; ambas zeradas dão 50%. Sorteio estritamente abaixo da chance faz atacante vencer, igualdade favorece defesa. Defesa recalculada ao chegar; ataque registrado ao partir. Vitória neutraliza loja para compra. Preservar regras existentes e mostrar bônus nos botões de melhoria; explicação expansível mantém abertura durante atualizações.

Validação do painel: 98 testes passaram, build aprovado, QA Chrome qa-combat-menu.mjs passou contratação real, leitura de forças, melhorias isoladas e expansão mantida após tick. Capturas qa-combat-menu.png e qa-combat-menu-rules.png verificadas. Próxima etapa: balanceamento e demais fases do mestre.


## Caixa inicial definitivo solicitado — 14/10/2026
Jogador começa novas campanhas com R$ 500 (50.000 centavos). Esta regra substitui os R$ 100.000.000 temporários de testes. Preservar campanhas já salvas, sem reset nem substituição de saldo retroativa.

Validação: 98 testes passaram e build aprovado. Cenários de combate/compras múltiplas agora declaram caixa de teste explicitamente, independente do saldo inicial real de R$ 500. Próxima etapa: balanceamento após testes do jogador.


## Placa de início — 14/10/2026
Exibir comece_flag.png sobre o mapa rural à esquerda/sudoeste da fazenda inicial, no ponto indicado pelo usuário (centro x=190, base y=1920, largura 230 no cadastro 3000×2000). Placa decorativa acompanha arraste/zoom e fica acima das artes do mapa, sem alterar propriedades, caminhos, estoques ou cliques. Abrir câmera da partida focada na região inicial para tornar a orientação visível. Arte original organizada em assets/icones/comece_flag.png, com manifesto e inventário atualizados sem modificar pixels.

Validação da placa: 98 testes passaram, build aprovado e QA Chrome qa-start-flag.mjs confirmou carregamento sem erros. Captura docs/qa-start-flag.png revisada: placa visível à esquerda da região inicial, apontando para o começo. Próxima etapa permanece balanceamento e fases do mestre.


## Premiada, economia e retaliação — 14/10/2026
Mimosa custa R$ 1.250 e Queijo Comum vende por R$ 50/unidade. Renomear De Luxo/Premiada para apenas Premiada na interface, preservando ID noble e PNG vaca_premiada; compra R$ 2.500 e Queijo Nobre vende por R$ 100. Fazenda nível 2 custa R$ 5.000 (fórmula existente R$ 2.500 × nível 2) e aceita 20 vacas.
Quando atacante perde, paga ao defensor vencedor conforme nível da equipe defensora: 1=R$ 50, 2=R$ 100, 3=R$ 150; mesma regra para IA e jogador. Não executar contra-ataque remoto. Prêmio é transferência real entre empresas, separado do custo de missão, despesa do perdedor e receita do defensor. Se faltar caixa, transferir disponível e persistir dívida restante, quitada ao entrar saldo nos ticks seguintes sem saldo negativo nem dinheiro criado. Somente resolver a compensação no resultado definitivo; incidentes offline pendentes não pagam antes da resolução. Mostrar regra/valor no menu de capangas e registrar resultado/ledger.


## Nome da queijaria inicial — 14/10/2026
A propriedade factory-ze passa a se chamar exatamente “Queijaria rudmentar do seu Zé”, conforme texto solicitado, no cadastro compartilhado pelo mapa e pelos menus. Preservar ID, imagem e estado salvo.

Validação: 108 testes passaram em 19 arquivos e build aprovado. Retaliação cobre os três níveis, ambas as empresas, vitória do atacante sem prêmio, pagamento parcial, reload, quitação posterior e incidente offline sem duplicação. Compra de fazenda nível 2 por R$ 5 mil/capacidade 20 e vacas/preços de queijo verificados. QA Chrome do painel sobreposto passou e mostra nome atualizado da queijaria. Próxima etapa permanece balanceamento e demais fases do mestre.


## Revisão de custos de expansão — 14/10/2026
Fazenda nível 2 custa R$ 30.000 e comporta 30 vacas; demais níveis preservados. Preço específico de nível 2 centralizado e compartilhado entre compra e menu, sem multiplicar R$ 30 mil pelo nível. Banco nível 1 contratação R$ 9.000, mantendo taxa e limite. Transportadora contratação R$ 15.000, manutenção R$ 300/dia. Equipe de capangas nível 2 contratação R$ 3.000 e manutenção R$ 50/dia; nível 3 contratação R$ 9.000 e manutenção R$ 100/dia; nível 1 preservado.
Armamento e barricada têm preços por melhoria comprada: 0→1 R$ 125, 1→2 R$ 1.500, 2→3 R$ 3.500. São custos incrementais (total R$ 5.125 por sequência completa), não preço fixo nem total acumulado. Preservar bônus e máximo de três níveis. Exibir e cobrar a mesma tabela; atualizar valor após cada compra, bloquear nível máximo. Novos preços valem para compras/manutenções futuras, sem reset, reembolso nem substituição de níveis já comprados.

Validação: 110 testes passaram em 20 arquivos, build aprovado e QA Chrome de capangas passou compras reais, forças independentes e preço seguinte R$ 1.500 após primeira melhoria. Testes cobrem três custos de melhorias e bloqueio do quarto nível, preços de contratos/fazenda, contratação dos níveis 2/3 e manutenção da transportadora. Próxima etapa: balanceamento e demais fases do mestre.


## Banco 2 e produtos raros — 14/10/2026
Banco nível 2 custa R$ 60.000 para contratar; taxa diária de 2% e coleta sem limite preservadas. Vaca Radioativa custa R$ 18.000 e Queijo Radioativo vende por R$ 200/unidade. Vaca Mágica custa R$ 36.000 e Queijo Mágico vende por R$ 400/unidade. Preservar consumo, produção, tempos, descoberta e demais regras. Aplicar valores às compras e vendas futuras, inclusive estoque existente, sem reset nem reembolso retroativo.


## Estoques ilustrados e valor de venda — 14/10/2026
Painel das lojas e fábricas e menu superior Estoque de queijo mostram somente tipos com quantidade positiva, com PNG correspondente, nome, quantidade, preço de venda unitário atual e valor total daquele estoque (quantidade × preço). Não confundir valor potencial de venda com caixa coletado ou lucro. Usar receitas centralizadas, incluindo estoques antigos válidos, sem revelar produtos não possuídos. Estoque vazio deve ser informado. Atualizar cartões ao vender, coletar, transferir ou mudar preços, mantendo recursos reais.

Validação: 110 testes passaram, build aprovado e QA Chrome qa-cheese-stock.mjs passou ícones carregados, quantidade, preço unitário e valor total em Estoque de queijo e loja, sem mostrar tipo zerado. Novos preços de banco 2 e vacas raras conferidos; capturas qa-cheese-stock.png e qa-cheese-shop.png revisadas. Próxima etapa: balanceamento e demais fases do mestre.


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

Validação integrada: 123 testes passaram em 21 arquivos e build de produção aprovado. QA Chrome qa-auctions-production.mjs passou produção manual paralela 5/10/20, vagas e manutenção, início 1 L/1 queijo, lance do dono com reserva, reload e perda do contrato bancário com recontratação direta bloqueada. Testes incluem 10 dias completos/offline, reembolso único ao dono, transferência de vacas/funcionários e banco/transportadora, recompra, contrato antigo sem benefício, IA iniciando lance real rentável e recusando sem caixa, manutenção e vitória/derrota compatíveis com recompra. Capturas qa-auction-defense.png e qa-auction-bank-lost.png revisadas.

Próximas etapas: balanceamento dos retornos e expansão das estratégias econômicas da IA; demais regiões/sistemas globais permanecem no mestre. Nenhuma campanha real foi resetada; novos recursos e território inicial valem para novas campanhas, enquanto capacidades/preços/leilões são compatíveis com saves existentes.


## Preparação de envio ao GitHub — 15/10/2026
Usuário solicitou envio ao origin https://github.com/DenilsomLobo/Imperio_do_queijo.git, branch main. Projeto validado com 123 testes e build de produção. Inclusos código, assets reorganizados, documentação e evidências de QA; arquivos de ambiente, dependências e dist permanecem ignorados. Fetch inicialmente indisponível por restrição de conectividade; publicação deve ser confirmada pelo retorno do push e comparação com a referência remota. Próximas fases funcionais permanecem as descritas acima.

## Conferência de relógio e fabricação — 15/10/2026
Conferidos AGENTS.md, as duas cópias idênticas de CODEX_MASTER_SPEC.md e os pontos de configuração/execução do relógio e da produção. Valores ativos: dia-base de 300.000 ms; modos 1/2/4 usam fatores 1, 5/3 e 5 (dias reais de 5/3/1 min). Receitas Fraco/Comum/Nobre/Radioativo/Mágico: 1/3/5/10/15 min-base por unidade; bônus somados de funcionários ativos aceleram fabricação. Nenhuma regra ou campanha alterada. Validação: 19 testes passaram em clock-migration, daily-rebalance e workers. Pendências e próxima implementação: permanecem balanceamento e demais fases do mestre; nenhuma mudança de tempo solicitada nesta conferência.


## Relógio e fabricação acelerados — 15/10/2026 (regra posterior vigente)
Esta regra substitui as durações anteriores de dia e das cinco receitas ativas. Dia real: 1× = 1 minuto; 2× = 30 segundos; 4× = 10 segundos. Relógio-base de 60.000 ms e fatores centrais 1/2/6, preservando os rótulos solicitados. Toda a simulação usa esse relógio, inclusive processos diários, salários, manutenção, produção de leite e leilões.
Fabricação por unidade em 1×, sem bônus: Fraco 10 s; Comum 30 s; Nobre 60 s; Radioativo 120 s; Mágico 150 s. Modos 2×/4× dividem esses tempos por 2/6; bônus de funcionários continuam acelerando. Insumos, preços, paralelismo e receitas antigas permanecem. Uma linha pode fabricar seis Fracos por dia com insumos e sem intervalos.
Migrar saves das escalas anteriores preservando calendário, estoques, dinheiro, progresso parcial, idade das vacas e prazos em dias; lotes já iniciados e missões preservam tempo-base restante. Migração versão 4 idempotente, sem reset nem concessões. Limite offline permanece oito horas-base (até 480 dias), com recursos e proteção territorial existentes.

Implementação: configuração central, seletor com duração do dia, receitas em segundos e migração de relógio versão 4. Testes ajustados para separar combate de fechamento diário e recuperação de ataques da IA. Próxima etapa: avaliar balanceamento econômico com o novo calendário; demais fases do mestre permanecem pendentes.

Validação final desta alteração: 139 testes passaram em 21 arquivos; build de produção aprovado. Incluídos testes de migração da versão 3 sem duplicação, contratos/leilões e conclusão das cinco receitas em cada fator de velocidade. Nenhuma campanha real foi resetada.


## Lojas compartilhadas, inventário e edifícios — 15/10/2026 (regra posterior vigente)
- Coletar queijo pronto envia ao estoque único da empresa, sem selecionar loja. Todas as lojas próprias exibem esses mesmos produtos; cada unidade só pode ser vendida uma vez. Automação da transportadora usa o mesmo envio. Manter capacidade somada de 40 unidades por loja; excedente permanece na fábrica. Perder loja não apaga mercadoria já compartilhada, mas reduz espaço disponível para novos envios. Vendedor continua necessário para vender, e banco para coletar dinheiro. Dinheiro das vendas continua no caixa da loja que vendeu.
- Confirmação expressa: bônus começa na segunda loja. Uma loja = preço-base; duas = +10%; três = +20%; N lojas = +10% × máximo(0,N−1), aditivo, sem juros compostos. Aplicar preço arredondado em centavos em vendas graduais e no fechamento, inclusive offline. Recalcular por lojas atualmente próprias; mesmas regras para IA, com estoques separados por empresa. Fechamento distribui as unidades restantes entre lojas com vendedor ativo sem duplicar vendas.
- Migrar estoques antigos de lojas próprias somando uma vez no campo company.shopStock e esvaziando os campos legados; migração idempotente, sem reset, compensações financeiras ou reposição de recursos. Preservar estoques neutros legados até aquisição.
- Menu Estoque de leite passa a Estoque. Exibir ração, embalagens, leites e queijos reais com ícone e quantidade imediatamente à frente. Somar fazendas, fábricas e estoque das lojas uma única vez; recursos continuam fisicamente alocados nas propriedades. Produtos ainda não possuídos não aparecem; não antecipar raros. Setor Estoque de queijo permanece funcional.
- Criar icon_racao.png, icon_embalagem.png e icon_disputa.png, no estilo dourado dos ícones existentes, em assets/icones. Mostrar ração/embalagem nos botões de compra e inventário; disputa representa casa com duas espadas cruzadas. Manifesto e inventário atualizados.
- Menu Propriedades lista edifícios próprios, disponíveis, rivais e serviços em cartões com arte quadrada, nome, titular, compra/contrato, manutenção e disputa real. Remover etiquetas de nível dos edifícios nesse menu, preservando metadados internos necessários aos preços/perfis. Clicar fecha gestão, abre painel da propriedade e foca seu local no mapa.

Implementado estoque comercial único, bônus centralizado, migração conservadora, logística integrada, inventário ilustrado, cartões e ícones. QA Chrome isolado passou envio sem destino, duas lojas mostrando o mesmo estoque/preço, compra de ração, reload, navegação, disputa e layout mobile. Próxima implementação: balancear retorno da expansão com bônus acumulado e ampliar estratégias econômicas da IA; demais fases do mestre permanecem pendentes.

Validação final: 149 testes passaram em 23 arquivos e build de produção aprovado. Novos testes cobrem envio sem destino, conservação de unidades, bônus 0/10/20%, liquidação/reload, capacidade agregada, perda de loja, migração idempotente, IA e conteúdo real dos cartões/inventário. QA scripts/qa-shared-inventory.mjs passou em contexto Chrome isolado; capturas qa-shared-inventory.png, qa-building-cards.png, qa-shared-shop.png e qa-building-mobile.png revisadas. Nenhuma campanha real foi alterada ou resetada.


## Upgrades ilustrados dos capangas — 15/10/2026
Substituir botões textuais de armamento/barricada por duas sequências de três cartões clicáveis. Armamento usa caixa de armas; barricada usa barreira de madeira e sacos. Cada arte tem exatamente 1/2/3 estrelas no topo correspondendo ao nível. Ícones PNG transparentes em assets/icones/icon_armamento_1.png até _3 e icon_barricada_1.png até _3, com manifesto e inventário atualizados. Mostrar nível atual, adquiridos, próximo nível comprável e posteriores bloqueados, com preço incremental e bônus acumulado. Preservar comandos, custos R$ 125/1.500/3.500, bônus de ataque 12%/nível e defesa 15%/nível, limite de três, requisitos de equipe, estado salvo e caixa real. Armamento acompanha equipe; barricada pertence ao posto. Não conceder upgrades nem resetar campanha.

Implementação: ui/combat-upgrades.js renderiza as seis artes com estados acessíveis e usa os comandos de compra existentes. Próxima implementação: balanceamento/estratégias econômicas da IA e demais fases do mestre permanecem pendentes.

Validação final dos upgrades ilustrados: 149 testes passaram em 23 arquivos; build de produção aprovado. QA scripts/qa-upgrade-icons.mjs passou seis imagens carregadas, ativação por teclado, compras 1→2→3 com custos reais, forças independentes, bloqueio máximo, persistência/reload e mobile em contexto isolado. Capturas qa-upgrade-icons-initial.png, qa-upgrade-icons-max.png e qa-upgrade-icons-mobile.png revisadas. Nenhuma campanha real foi modificada/resetada. Ajustados seletores das rotinas QA anteriores para o cartão comprável.
Correção de integração: os SVGs temporários dos oito setores haviam sido removidos e substituídos por PNGs existentes na mesma pasta; menu-icons.json e menu-icons-inventory.json agora apontam aos PNGs reais, corrigindo erro de carregamento. Artes fornecidas preservadas sem edição de pixels.


## Entrada, identidade visual, caixa de testes e ranking — 15/10/2026
- Usar os oito PNGs fornecidos em assets/icones/menu-temporario no manifesto dos setores, substituindo referências aos SVGs removidos. Usar assets/text_logo.png no canto superior esquerdo e na entrada. Logo clicável volta ao index/tela inicial após salvar localmente. Reservar antes dele espaço invisível para futuro avatar, sem expor controle vazio ao teclado.
- Novas campanhas do jogador começam com R$ 100.000.000 (10.000.000.000 centavos). Essa regra de testes substitui caixa inicial anterior de R$ 500 somente para jogador; IA continua no valor atual. Não conceder dinheiro retroativo nem resetar saves existentes.
- Criar ícones Salvar, Resetar e Ranking em estilo dourado e mostrar ícone + texto nos botões superiores. Reset mantém confirmação em duas etapas e palavra exata SAIR.
- Antes de entrar, pedir nome de 2 a 30 caracteres. Nomes normalizados identificam perfis locais independentes; nome sozinho não é senha nem autenticação. Primeiro perfil adota campanha legada sem perfil, preservando recursos; perfis posteriores começam separados. Salvar atualiza campanha e pontuação do perfil atomicamente no IndexedDB. Reset altera apenas a campanha desse perfil.
- Confirmação expressa do usuário: ranking é por DINHEIRO GUARDADO NO CAIXA ATUAL, não faturamento, patrimônio, recorde histórico ou dinheiro ainda nas lojas. Exibir top 10 real, ordem decrescente, sem inventar participantes. Mostrar origem local/nuvem e erros de conexão. Ambiente atual é de testes com crédito inicial ampliado.
- Preparar Cloud Firestore e Firebase Auth anônimo por identidade/perfil, regras privadas para saves e ranking autenticado, limite 10 e separação por versão de regras. Usuário fornecerá configuração Firebase posteriormente. Até então saves e ranking locais funcionam, e nuvem é explicitamente não configurada. Não publicar/deploy nem afirmar integração online validada sem projeto configurado. Autenticação anônima depende da identidade preservada neste navegador; recuperação em outro dispositivo por conta vinculada permanece fase futura.

Implementados entrada por perfil, preservação/migração do save legado, identidade visual e botões reais, ranking local top10, adaptador REST Auth/Firestore com refresh de token, gravação atômica save+ranking e fila de sincronização, arquivos de regras/índices/configuração pública. Pendência obrigatória: receber configuração Firebase, habilitar provedor anônimo, validar regras/índice e acesso em projeto/emulador, então ativar nuvem. Ranking confiável com validação no servidor e vinculação de conta/recuperação entre dispositivos permanecem pendentes. Próxima implementação: conectar projeto Firebase fornecido e testar ida/volta real sem alterar campanhas de usuário; demais fases do mestre preservadas.

Validação desta entrega: 156 testes passaram em 25 arquivos, incluindo migração do save legado para primeiro perfil, saves independentes, reset de perfil e validação de nomes; adapter Firebase testado sem rede real com autenticação, refresh, commit save+ranking, recuperação de falha, carregamento e consulta top10. QA Chrome scripts/qa-player-entry.mjs passou entrada, nomes, novo caixa, perfis/continuidade, PNGs/logo, home, top10 por caixa e mobile em contexto isolado. QA scripts/qa-reset.mjs passou etapas, palavra exata, cancelar/Escape, falha de gravação, reset/reload e preservação do perfil/outros dados; nenhuma campanha real foi resetada. Build aprovado. Nuvem real e regras/índices no emulador permanecem pendentes da configuração Firebase.


## Rede coletiva de capangas — 15/10/2026
- Cada loja própria com uma equipe alocada no posto correspondente concede +5% de ataque e defesa a todas as equipes da mesma empresa. Contar por loja/equipe alocada, não por integrante ou estrela: 12 lojas com 12 equipes = +60%, não +180%. Jogador e IA usam a mesma fórmula e recursos separados.
- Bônus aditivo entre lojas: rede = lojas guarnecidas × 5%; multiplicar forças existentes por (1 + rede). Armamento continua somente no ataque e barricada somente na defesa; moral e indisponibilidade continuam aplicadas. Nenhuma equipe gera força própria quando ausente, em missão/recuperação ou sem moral.
- Contar apenas loja e posto de mesma empresa com equipe de quantidade positiva. Lojas vazias/neutras/rivais e equipes em reserva não contribuem. Uma equipe ainda alocada conta durante missão, recuperação ou atraso salarial até sair do posto/emprego; sua força individual continua zerada nas indisponibilidades já previstas. Contratação/alocação, realocação, neutralização e demissão recalculam a rede a partir do estado real. Sem campo de bônus acumulado no save, sem concessões/reset.
- Ataque registra força e bônus no momento da partida; defesa recalcula toda a rede ao chegar. Proibir ataque remoto e preservar regras de ruas diretas, sorteio, neutralização, salários e retaliação.
- Painel dos capangas informa percentual coletivo, lojas guarnecidas e fórmula. IA preenche postos inclusive longe da fronteira antes de atacar, aproveita reservas disponíveis, contrata com caixa real e preserva reserva de duas diárias operacionais (mínimo R$ 100). Compra de nova loja considera também contratação e manutenção da guarnição. Não criar dinheiro/equipes para IA.

Validação: 162 testes passaram em 26 arquivos. Casos novos cobrem 12 lojas/+60%, exclusões, zero de força e bônus locais, realocação/perda de propriedade/reload, defesa reforçada após partida e contratação real da IA fora da fronteira/recusa sem orçamento. QA Chrome scripts/qa-garrison-network.mjs passou bônus 5→10% após contratação na agência, força atualizada nos dois postos e reload, em contexto isolado; captura qa-garrison-network.png revisada. Próxima implementação: balancear o custo/retorno da rede militar e ampliar estratégias da IA; configuração Firebase e demais fases do mestre continuam pendentes. Nenhuma campanha real foi resetada.

Build final da rede militar aprovado. Ajustada também a especificidade do estilo dos valores monetários longos nos cartões superiores, preservando leitura completa.


## Gestão de adquiridos e vendedor revisado — 15/10/2026
- Menu Propriedades mostra somente propriedades/contratos de titularidade do jogador, incluindo os iniciais, preservando cartões, preços, manutenção e disputas dos próprios imóveis. Não listar neutros ou rivais nesse menu; continuam no mapa e em Inimigos.
- Funcionários apresenta cartões quadrados dos trabalhadores realmente contratados: funcionários de fábrica, vendedores e equipes de capangas, com retrato, custo atual de contratação, salário diário e estabelecimento de alocação. Clicar abre/foca fábrica ou loja correspondente. Equipes em reserva ficam identificadas sem inventar alocação ou botão sem destino.
- Vacas apresenta cartões dos rebanhos realmente adquiridos, agrupados por espécie/fazenda, com imagem, quantidade, preço atual unitário/grupo, custo diário da ração opcional e fazenda. Clicar leva à fazenda. Não criar diária extra para vacas nem antecipar espécies não possuídas.
- Estoque é contagem ilustrada de ração, embalagens, tipos de leite e queijos prontos, sem valores financeiros nem duplicação do estoque compartilhado. Estoque de queijo mostra também tipos/lotes realmente em fabricação ou maturação, ícone, preço de venda atual com bônus, valor potencial ao concluir e fábrica; clique leva à fábrica. Lotes não contam como mercadoria pronta nem dinheiro.
- Menu Vendas passa a Pontos de venda. Indicador superior mostra faturamento real do dia atual, exclusivamente vendas ao consumidor. Cartões apenas das lojas próprias mostram valor de compra, vendas de hoje/ontem, presença/nível dos capangas, vendedor, manutenção diária discriminada (loja, vendedor e equipe), total e caixa para coleta. Coleta, leilão e compensação de defesa não são vendas de queijo; vendas de fechamento pertencem ao dia encerrado.
- Vendedor: contratação R$ 50 e salário R$ 25/dia, centralizados em rules.sellerHire/sellerSalary. Valem para próximas contratações/diárias, inclusive vendedores já existentes; sem reembolso retroativo ou reset. Novo icon_vendedor.png em assets/icones, manifesto/inventário atualizados, utilizado nos cartões e botões de contratação.
- IA verifica alocação de capangas em cada tick online, independentemente do intervalo de estratégia/ataques, contratando somente com caixa real e reserva operacional ou aproveitando equipes em reserva. Imagem de bandeira é substituída automaticamente por capangas do nível contratado pelo renderer existente. Offline mantém regras anteriores, sem contratação militar automática; sem dinheiro não ganha equipe.

Implementação: owned-resources.js centraliza cartões de alocados, rebanhos, produção e lojas; sales.js apura vendas por dia/propriedade diretamente do ledger. Renderer existente guardAsset acompanha contratações reais; staffAiShops é chamado nos ticks online com validações de domínio e orçamento. Próxima implementação: balancear retornos e estratégias econômicas da IA; configuração Firebase e demais fases do mestre continuam pendentes.

Validação final: 170 testes passaram em 27 arquivos e build de produção aprovado. Novos casos cobrem filtro de propriedade própria, cartões de pessoal/rebanho e navegação, produção real/preço com bônus, vendas atuais/anteriores sem coleta duplicada, custo/salário do vendedor e contratação de capangas pela IA antes do intervalo estratégico com troca de arte e persistência. QA Chrome scripts/qa-owned-management.mjs passou menus, imagens, destinos, estoque sem preço, lotes/valores/fábrica, manutenção 50/75 reais, capangas inimigos e mobile em contexto isolado; capturas qa-owned-employees/cows/production/shops/mobile e qa-enemy-hired-guards revisadas. Nenhuma campanha real foi resetada ou recebeu recursos de teste pela verificação.


## Compras, vendedor, finan?as e dom?nio ? 15/10/2026
- Ra??o e embalagens permitem informar de 1 a 1.000 unidades inteiras por compra, com pre?o unit?rio/total e confirma??o da quantidade real comprada. Preservar quantidade preenchida nas atualiza??es do painel; validar saldo e limites sem compra parcial nem perda de excedente. Quantidade de embalagens deixa de ser fixa em dez.
- Loja somente vende quando possui vendedor contratado e ativo, inclusive no fechamento di?rio. Vendedor ativo acrescenta 1% ao valor de cada venda naquela loja, sem acumular vendedores de outras lojas. Aplicar ap?s o b?nus de lojas (+10% por loja pr?pria al?m da primeira), arredondando o valor unit?rio em centavos; mesma regra para IA. Vendedor suspenso n?o vende nem concede 1%.
- Dinheiro passa a Finan?as: caixa, dinheiro nas lojas, liquidez, reserva de leil?es, pend?ncias, avalia??o de im?veis/itens, receitas/despesas/resultados acumulados e di?rios, categorias, estabelecimentos, compromissos di?rios, bancos, transporte e ?ltimos movimentos reais. Cr?dito inicial n?o ? lucro e coleta n?o duplica faturamento. Diferenciar avalia??o de dinheiro dispon?vel.
- Inimigos mostra cart?es das propriedades, pontos de venda e capangas realmente pertencentes ao rival, com aloca??o, custos/manuten??o e navega??o para o estabelecimento.
- Vit?ria exige todas as lojas, fazendas e f?bricas do mapa, inclusive expans?es inicialmente neutras, mais contrato de qualquer um dos dois bancos e da transportadora. Confirma??o expressa do usu?rio: controlar qualquer um dos dois bancos e a transportadora; preservar limite de um contrato banc?rio ativo por empresa. Derrota aplica a mesma condi??o ao rival. Mapa atual: 14 lojas + 4 fazendas + 4 f?bricas + 1 objetivo banc?rio + 1 transporte = 24 objetivos. Ag?ncias p?blicas e postos associados n?o s?o objetivos adicionais. Barras mostram controle, percentual e faltantes; leil?es abertos devem terminar antes do resultado final. Preservar resultados j? registrados em campanhas antigas, sem reset.

Valida??o: 181 testes em 28 arquivos aprovados. Casos cobrem compras de mil unidades/d?bito/persist?ncia/valida??o, vendedor e 1%, aus?ncia de venda sem vendedor, resultado financeiro sem duplicar coleta, d?vidas/reservas e dom?nio sim?trico com qualquer banco, neutros, transporte e leil?es. QA Chrome scripts/qa-finances-supplies.mjs aprovado em contexto isolado: compras reais de mil, pre?o total, d?bito, entrada preservada, limite, reload, Finan?as, cart?es rivais, 24 objetivos e mobile sem transbordamento. Capturas qa-finances, qa-finances-mobile e qa-enemies-dominance. Pr?xima implementa??o: evoluir estrat?gia da IA para adquirir todos os objetivos da campanha e integrar Firebase quando configura??o for fornecida; demais fases do mestre permanecem pendentes. N?o executar reset na campanha real.


## Local das barras de progresso — 15/10/2026
As barras de progresso de vitória e derrota aparecem exclusivamente dentro do menu Inimigos. Não exibir barras acima do mapa. Preservar cálculo e regras de domínio.
Implementado: removida criação da faixa no refresh principal e seu estilo exclusivo; menu Inimigos mantém as barras existentes. Próximas etapas do mestre e configuração Firebase permanecem pendentes.


## Caixa inicial revisado - 15/10/2026
Novas campanhas: jogador R$ 500 (rules.initialCash=50000 centavos), rival R$ 1.000 (rules.aiCash=100000 centavos). Substitui o saldo temporario de testes. Preservar saldos de campanhas salvas, sem reset ou ajuste retroativo.
Validacao: 181 testes em 28 arquivos aprovados; fixtures de compras/gestao usam caixa explicito para testar suas funcionalidades sem depender do credito inicial. Auditoria da IA: economia na primeira fazenda/fabrica, queijo fraco; guarnicoes de nivel 1 e reserva de duas diarias; compra de lojas vizinhas, ataques por ruas com chance minima de 45%, leiloes condicionados a retorno/necessidade. Pendente: estrategia para cadeias multiplas, receitas superiores, aprimoramentos e aquisicao de todos os objetivos de vitoria. Configuracao Firebase continua pendente.
