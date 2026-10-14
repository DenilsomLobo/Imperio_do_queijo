# Império do Queijo

Jogo em desenvolvimento progressivo conforme [especificação mestre](docs/CODEX_MASTER_SPEC.md). A zona rural possui produção, coleta, vendas e disputa territorial integradas. A campanha completa, demais regiões e ranking seguem no roadmap.

Atualização 14/10/2026: campanha rural com finais reais. Controle todos os 14 pontos de venda para liberar a compra da fazenda e fábrica inimigas; comprar ambas encerra com vitória. O rival pode vencer ao controlar todos os pontos e comprar sua fazenda. Resultado e progresso ficam no IndexedDB; simulação para após encerramento. Agência de capangas vende equipes nível 1/2/3; nível mostrado pela arte, sem estrelas. Ícones de coleta sempre acima das propriedades. Catálogo atual: 57 PNGs. Detalhes em [CAMPANHA_RURAL.md](docs/CAMPANHA_RURAL.md).

Para executar após baixar/clonar este repositório no Windows: instale Node.js 24 LTS e dê dois cliques em INICIAR_JOGO.cmd. No terminal: npm ci, npm start. GitHub Actions valida testes e build em cada push; publicar o código no GitHub não altera a origem do salvamento local.

Atualização 14/10/2026: campanha rural com finais reais. Controle todos os 14 pontos de venda para liberar a compra da fazenda e fábrica inimigas; comprar ambas encerra com vitória. O rival pode vencer ao controlar todos os pontos e comprar sua fazenda. Resultado e progresso ficam no IndexedDB; simulação para após encerramento. Agência de capangas vende equipes nível 1/2/3; nível mostrado pela arte, sem estrelas. Ícones de coleta sempre acima das propriedades. Catálogo atual: 57 PNGs. Detalhes em [CAMPANHA_RURAL.md](docs/CAMPANHA_RURAL.md).

Para executar após baixar/clonar este repositório no Windows: instale Node.js 24 LTS e dê dois cliques em INICIAR_JOGO.cmd. No terminal: npm ci, npm start. GitHub Actions valida testes e build em cada push; publicar o código no GitHub não altera a origem do salvamento local.

Novo mapa rural com construções maiores e serviços centrais. Os oito cartões superiores abrem a gestão real da empresa; clique numa propriedade da lista para localizá-la. **Catálogo** exibe os 48 PNGs. Use **Ver todo o mapa** e +/− para ajustar câmera. Serviços encaminham às ações existentes; funções avançadas como empréstimos, veículos e pesquisa ainda estão no roadmap.

Ruas e esquinas ligam as lojas e seus postos. Escolha **Zona rural** e use os atalhos **Centro**, **Fazendas** e **Fronteira norte**. Interface do jogador sem mapa-múndi/editor; demais zonas serão liberadas quando integradas à campanha. Tema segue a paleta creme/bege/madeira fornecida pelo usuário.

Para abrir no Windows, dê dois cliques em **INICIAR_JOGO.cmd**. Verifica Node/npm, instala dependências quando necessário e abre o navegador em **http://127.0.0.1:5173/**. Mantenha a janela do servidor aberta; encerre com Ctrl+C. Se o mesmo projeto já estiver rodando, reutiliza o servidor. Outra aplicação ocupando 5173 causa erro explícito; a porta não muda para preservar o acesso ao mesmo salvamento.

Node.js 22.12+ ou 24 LTS. Pelo terminal: instalar com `npm ci --cache .npm-cache`, executar `npm start` para abrir o navegador, `npm run dev` para apenas iniciar o servidor, testar com `npm test` e gerar build com `npm run build`.

Comece clicando na queijaria e levando os cinco queijos iniciais à barraquinha. Compre ração na fazenda para produzir leite. Clique no ícone de leite para transferir à fábrica; inicie um lote e, quando pronto, clique no queijo para abastecer a loja. As vendas geram saldo local; clique no dinheiro para transferi-lo ao caixa. Colete somente até a capacidade do destino; o excedente permanece na origem. Tempos seguem o mestre: Minas Frescal leva dois minutos em 1×; uma Magrela produz 8 L por dia (uma hora real).

Clique numa loja neutra para comprá-la, depois no círculo associado para contratar/realocar capangas, promover, melhorar equipamento e atacar inimigos em alcance. Ataques probabilísticos custam caixa e levam tempo; derrota incapacita a equipe e vitória neutraliza o ponto ocupado. A IA começa agressão territorial após dois dias. Salários e insumos são reais.

Salvamento automático IndexedDB a cada 15 s e após ações; botão **Salvar agora** disponível. Reabra na mesma origem/porta/perfil para continuar. Offline em 1× até oito horas, com ataques pendentes para resolução após retorno. Evite abrir a mesma campanha em múltiplas abas: coordenação entre abas ainda pendente.

Ferramenta interna de desenvolvimento em `/editor.html` no servidor dev, sem botão para o jogador e excluída do build. Ajusta/exporta JSON sem mover propriedades na campanha em andamento. `npm run test:browser` executa QA em Chrome instalado e servidor ativo (padrão QA 5174, configurável por QA_URL), usando contexto isolado.

Documentação: [roadmap](docs/ROADMAP.md), [GDD](docs/GDD.md), [arquitetura](docs/ARCHITECTURE.md), [assets](docs/ASSETS.md), [critérios](docs/FEATURE_MATRIX.md), [decisões pendentes](docs/DECISIONS.md).
