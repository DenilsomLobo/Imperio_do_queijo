# Roadmap e continuidade

Atualizado em 13/10/2026. Objetivo final: campanha integral do Seu Zé à conquista de Queijópolis e resultado no Hall dos Magnatas. Nenhuma redução de escopo autorizada. Fases e gates em FEATURE_MATRIX.md; fonte normativa CODEX_MASTER_SPEC.md.

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
| 16 Login/cloud/ranking | Parcial | IndexedDB/offline rural; faltam migrações/Auth/cloud/ranking |
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

Arquivos: novo assets/rural-open-v1.png; src/data/rural-layout.json/world.js/regions.json/game-rules.js; src/domain/game.js/management.js/management.test.js/game.test.js; src/ui/management.js; src/main.js/game.css/editor.js; src/map/game-scene.js/presentation.js; src/persistence/local.js; scripts/rebuild-rural-layout.mjs/normalize-asset-inventory.mjs/qa-browser.mjs/qa-management.mjs; package.json; documentos e capturas. Fases globais continuam parciais. Quatro regiões, pessoal/automação completos, bancos/empréstimos/contabilidade, logística/contratos, pesquisa/especiais, campanha/vitória e Firebase/ranking ainda pendentes; trava entre abas também pendente.

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
