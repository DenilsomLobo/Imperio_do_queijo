# Império do Queijo — GDD consolidado

Fonte normativa: [CODEX_MASTER_SPEC.md](CODEX_MASTER_SPEC.md), integralmente preservada. Este documento organiza o escopo; não substitui ou reduz os seus requisitos. Estado em 13/10/2026: zona rural integrada; campanha completa ainda em desenvolvimento.

Atualização de implementação: a cadeia rural e a disputa de pontos agora estão disponíveis; a campanha completa ainda não. Pedido de correção em CORRECOES_SOLICITADAS.md: propriedades têm geometria/arte fixa em partida, menus específicos, leite/queijo/dinheiro acumulados localmente e ícones condicionais de coleta. Loja e círculo de controle compartilham proprietário; derrota neutraliza pontos controlados, compra de neutros dá controle ao jogador. Valores ausentes autorizados pelo usuário, em BALANCEAMENTO.md. Estas instruções prevalecem sobre o comportamento visual anterior sem reduzir o escopo final.

## Experiência e progressão

Diretriz posterior 14/10/2026: zona rural organizada em ruas isométricas com lojas e capangas em interseções. Serviços em quadras centrais, fazendas externas, inimigos ao norte. Navegação por zonas substitui o mapa-múndi no produto; a interface atual apresenta apenas a rural. Editor exclusivo para desenvolvimento. Paleta oficial em src/theme.css, conforme valores fornecidos pelo usuário. Esta atualização prevalece sobre o requisito antigo de mapa-múndi.

Atualização visual 14/10/2026: mapa rural aberto com serviços centrais e edifícios em escala maior. Fazenda inicial ao sul, rivais a nordeste na área vermelha, círculo em frente a cada loja. Menus superiores abrem gestão real de propriedades, funcionários (vendedores e capangas implementados), leite, queijo pronto em fábricas/lojas, vacas, vendas, caixa e rivais. Catálogo contém todas as artes; especiais exigem pesquisa e não são concedidos por visualizar uma imagem.

Diretriz visual atualizada pelo usuário em 13/10/2026: os PNGs fornecidos são referências de estilo; novas artes e substituições estão autorizadas quando necessárias, mantendo o estilo isométrico cartunesco. Esta atualização prevalece sobre a restrição visual original do mestre, sem alterar os requisitos de jogabilidade.

Estratégia econômica single-player em navegador, visual isométrico cartunesco. Começa com Fazenda do Seu Zé, Vaca Magrela, queijaria rudimentar e barraquinha. Configuração inicial de referência: R$ 1.500, 10 L de leite fraco, 10 embalagens e 5 Minas Frescal Ruim. Tutorial integrado ensina produção, vendas, compras, melhorias, funcionários, capangas, conquista e automação. Sem diplomacia, alianças ou multiplayer competitivo em tempo real.

Cinco regiões: rural, industrial, urbana, periferia e comercial futurista. Terrenos independentes registrados em JSON, com proprietário, regras, ocupação, nível, polígono e sprite. Rural: 1 ponto comercial inicial, 8 neutros e 5 inimigos, com postos associados possíveis. A configuração visual precisa ser conferida nos mapas reais.

## Simulação e cadeia econômica

Um relógio central: 60/30/15 minutos reais por dia nas velocidades 1×/2×/4×. Offline em 1× limitado a oito horas reais; eventos cronológicos, estoque e despesas reais, incidentes graves pendentes, sem perda territorial irreversível nem vitória automática offline.

Fazendas comportam 5/12/25/50 vacas nos níveis 1–4. Magrela, Mimosa, Premiada, Radioativa e Mágica produzem leites distintos consumindo ração. Qualidade deriva do leite; eficiência não transforma qualidade. Reprodução comum, genética e assistida respeitam tempo, custo e capacidade. Espécies fantásticas dependem de pesquisa própria e recebem protótipo gratuito no primeiro desbloqueio.

Minas Frescal, Meia Cura, Curado, Artesanal da Serra e Imperial consomem leite e embalagens. Linhas, maturação, capacidade e qualidade são estados distintos; produtos não prontos não podem ser vendidos. Valores e tabelas completos nas seções 7–8 da especificação.

Funcionários: tratadores, queijeiros, vendedores, motoristas, mecânicos, gerentes, pesquisadores e capangas. Contratação, demissão, alocação exclusiva e salários. Automação comprada por melhorias e pessoal: lotes, prioridades, estoque-alvo, reposição, insumos, logística, entregas, comércio, defesa e exportações limitadas; orçamento finito e suspensão se faltar responsável.

Sete categorias comerciais, de barraquinha improvisada a mercado grande. Demanda local finita, vendedor, capacidade, despesas, lucro e segurança. Política global de preços por receita/empresa: 85%, 100%, 120% ou personalizada. Marketing distrital e reputação afetam demanda limitada. Participação de mercado conta só venda final ao consumidor local; atacado e exportação não duplicam vendas.

## Segurança e concorrência

Postos possuem equipes, moral, armamento, barricadas, integridade e recuperação. Sem equipe disponível exibem bandeira; equipes ocupadas não podem ser reutilizadas. Estrelas 1–3: multiplicadores 1/1,4/1,9; armamento +12%/nível e barricada +15%/nível, com limites configurados. Chance base: clamp(50 + 40 × (ataque − defesa)/(ataque + defesa), 5, 95). Sorteio apenas na resolução, RNG injetável. Derrotados recuperam, sem morte permanente inicial; barricadas persistem. Missões têm duração, custo e cooldown; salários não pagos afetam moral e disponibilidade.

Reconhecimento, espionagem comercial/científica, sabotagem industrial/logística, ataques a comboios e interferência comercial: efeitos temporários, recursos com origem real, nenhum roubo de desbloqueio permanente.

Rivais: Família Coalho, Sindicato da Mussarela, Queijaria Real, Leite Supremo S.A. e facções adicionais configuráveis. Cada empresa usa caixa, insumos, pessoal, estoque, veículos, pesquisa e dívidas reais. Decisões por retorno, risco e ameaça; agressividade limitada pela progressão, sem recursos gratuitos.

## Expansão, finanças e pesquisa

Transportadora: terceirização, três classes de veículos, motoristas, combustível, manutenção, capacidade, prazos, prioridades e escoltas exclusivas. Exportação por contratos para destinos externos, qualidade, prazo, penalidade e risco; sem seguro. Perdas contábeis sem duplicação.

Laboratório em quatro níveis, pesquisadores, pontos, custos e pré-requisitos. Pesquisa genética e leitomancia liberam espécies fantásticas. Bancos diferenciados oferecem empréstimos finitos com juros, prazo, pagamento, inadimplência e garantias. Ledger para toda transação; caixa, receita, lucro e patrimônio distintos.

## Conclusão e serviços

Vitória: neutralizar todos os rivais principais, controlar territórios estratégicos obrigatórios, liderar vendas locais e manter lucro positivo e consolidação por sete dias. Excluir áreas decorativas/públicas/não conquistáveis. Confirmar conclusão na partida, encerrar simulação e registrar resultado completo com patrimônio líquido, dívida e métricas finais.

IndexedDB local com versão e migrações; Firebase Auth e-mail/senha e apelido; Firestore para sincronização e Hall dos Magnatas. Ranking somente de campanhas concluídas, por patrimônio líquido, separado por dificuldade e versão de regras, sem duplicação por campanha. Segurança por usuário. Simulação cliente não garante resultado inviolável; preparar validação confiável futura.

HUD, menus e todos os painéis da seção 19 devem operar no estado central. Nenhum botão decorativo conta como sistema implementado. Critérios verificáveis estão em [FEATURE_MATRIX.md](FEATURE_MATRIX.md).

## Direção visual vigente — mapa rural

Cidade central com fábrica nível 2, transportadora, agências e dois bancos (um de cada nível). Fazendas, fábrica inicial/nível 1 e loja de vacas no campo sul/oeste; produção rival no norte sombrio. Distribuição exata das 14 lojas e bandeiras em RURAL_MAP_V2.md. Plantações são paisagismo, sem produzir recursos implicitamente. Propriedades físicas mantêm IDs e posições durante a partida.

Revisão da captura anotada: posições e rede de caminhos atuais em RURAL_MAP_V3.md. Estradas com arte de terra, conectadas a destinos reais; círculo/bandeira em cada loja. Dois controles cinza corrigidos para neutros na migração 2→3, sem neutralizar territórios comprados pelo jogador. Não fixar neutralidade para sempre: conquistas posteriores continuam sujeitas ao combate real.

Diretriz vigente de controle e apresentação em CONTROLE_E_INDICADORES.md: arte da loja acompanha dono real; bandeira substituída pela equipe alocada; vitória neutraliza loja e posto, compra posterior obrigatória para qualquer empresa. Estoques/caixa só nos menus, coleta no mapa indicada pelos icon_* fornecidos a partir de uma unidade. Ataque/defesa indicados apenas durante missão pendente. Cinco lojas iniciais rivais mantidas por confirmação expressa.

Condição atual de encerramento rural em CAMPANHA_RURAL.md: controle integral das 14 lojas libera compras finais. Jogador vence comprando fazenda e fábrica rivais; rival vence comprando fazenda inicial após controle integral. Resultado persistido e simulação encerrada. Níveis da equipe somente por arte, compra na agência. Ícones sempre acima da propriedade. Critérios globais anteriores não devem impedir o final rural autorizado; demais sistemas continuam no escopo.
