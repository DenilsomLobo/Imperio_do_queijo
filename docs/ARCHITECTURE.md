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

Novo fundo em assets/rural-open-v1.png, gerado com image_gen; espaço lógico do layout 2400×1600, independente da resolução do PNG. world.js preserva dimensões, largura dos sprites, nível e tipo de serviço. Editor e cena respeitam as mesmas dimensões. Renderizador Canvas ativo; sprites físicos continuam estáveis entre ticks e comandos. Camera fit/focus/zoom são ações reais. collectorPosition centraliza geometria dos indicadores e é usado também pelo QA.

Gestão desacoplada: domain/management.js deriva totais do estado; ui/management.js apresenta oito menus e catálogo. Propriedades excluem serviços públicos/controles; funcionários somam vendedores e integrantes de equipes, incluindo reserva. Leite soma fazendas/fábricas; queijo pronto soma fábricas/lojas, deixando lotes em andamento separados. Vendas históricas usam ledger por empresa, evitando atribuir vendas antigas do rival ao comprar uma loja.

Serviços do layout têm proprietário public e menus que encaminham aos mesmos comandos de domínio: agência contrata vendedor/equipe na propriedade selecionada; loja de vacas compra e aloca; transportadora transfere queijo; bancos abrem os dados financeiros existentes. Não há empréstimos/viagens simulados por botões vazios. Fazendas/fábricas neutras são compráveis com custo por nível e iniciam vazias; capacidade de vacas, linhas e maturação dependem do nível.

migrateSave leva layout antigo (sem layoutVersion) à versão 2, preservando IDs de propriedades/controles, dinheiro, recursos, equipes, campanha e tempo; acrescenta somente novos registros. Registros antigos de terrenos não utilizados são removidos, sem apagar ativos produtivos. Saves incompletos nas propriedades preexistentes são recusados, sem reposição de recursos iniciais. Versão de regras permanece compatível; load migra antes de validar.

[Câmeras Phaser](https://docs.phaser.io/phaser/concepts/cameras) e [entrada Phaser](https://docs.phaser.io/phaser/concepts/input), consultadas para coordenadas de mundo e navegação. Testes focam invariantes de domínio; validação visual deve ser registrada separadamente do build.

## Cadastro visual rural — 14/10/2026

Cada propriedade possui district (town/countryside/north), exclusivamente visual. scripts/rebuild-rural-layout.mjs gera posições e rede de caminhos; domínio continua independente do terreno bitmap. Exportação via map-preview.html/src/map-preview.js usa createGame isolado e presentationOnly da cena, sem IndexedDB, ações ou relógio. Página de exportação excluída do build público.

Revisão 3: grafo de estradas com from/to em IDs físicos e extremidades exatamente em controles/entradas; textura transparente em TileSprite. Teste verifica conectividade global, destinos e vínculos dos controles. migrateSave 2→3 aplica a correção territorial solicitada uma vez, preservando aquisições do jogador e devolvendo equipes afetadas à reserva; detalhes em RURAL_MAP_V3.md.

Atualização de controle: presentation.js concentra seleção de textura por dono/equipe, limiares e posicionamento de coleta e indicadores de missão. Cena atualiza textura da loja com setTexture sem recriar objeto ou mover geometria. resolve sempre neutraliza o par loja/posto; IA compra neutros pelo comando buyProperty, com ledger real. Nomes/estrelas em placas de madeira; sem contadores de recursos no canvas. Instruções vigentes em CONTROLE_E_INDICADORES.md prevalecem sobre arte estática da loja descrita nos registros anteriores.

campaign.js centraliza contagem territorial, autorização de compras finais e resultado. command e ações da IA usam o mesmo gate de caixa/controle; updateCampaign determina final, advance para após outcome. createGame inclui resetRevision de session-reset.json para reinício único autorizado; carregamento só substitui campanha com marcador anterior. Estrelas são atributo interno compatível, sem indicação gráfica; agência vende níveis reais. Originais dos trios preservados com aliases nível 3. Detalhes e precedências em CAMPANHA_RURAL.md.
