# PROMPT MESTRE — DESENVOLVIMENTO COMPLETO DE IMPÉRIO DO QUEIJO

## SUA FUNÇÃO

Você será o arquiteto de software, programador principal, desenvolvedor de jogos, implementador da interface e responsável pelos testes do projeto **IMPÉRIO DO QUEIJO**.

Seu objetivo é desenvolver um jogo completo para navegadores, do início da campanha até a vitória final, utilizando as imagens disponibilizadas na pasta `assets/`.

**ATENÇÃO: NÃO QUERO APENAS UM PROTÓTIPO, UMA DEMONSTRAÇÃO OU UMA VERSÃO COM MECÂNICAS FICTÍCIAS.**

Quero o desenvolvimento progressivo de todos os sistemas descritos neste documento, integrados entre si, com interfaces funcionais, economia consistente, inteligência artificial, progresso salvo, condições reais de vitória e ranking.

Você poderá dividir o trabalho em etapas para garantir qualidade, mas o escopo final será o jogo completo.

Não considere uma funcionalidade concluída apenas porque existe um botão visual. O botão deve executar uma ação real, atualizar o estado do jogo, recalcular as consequências e persistir os dados.

---

# 1. ANÁLISE INICIAL DO PROJETO

Antes de começar:

1. Examine todos os arquivos existentes.
2. Identifique a arquitetura atual.
3. Leia `AGENTS.md`, o GDD e os documentos de desenvolvimento, se existirem.
4. Examine todas as imagens e pastas dentro de `assets/`.
5. Identifique os recursos já implementados e preserve o que funciona.
6. Identifique dependências, scripts de execução e testes.
7. Apresente um diagnóstico da situação atual.
8. Crie um plano para transformar o projeto existente no jogo completo.

Não recrie o projeto do zero sem necessidade.

Se o projeto ainda não possuir a estrutura necessária, proponha uma organização adequada.

## Stack recomendada

- JavaScript ES Modules.
- Phaser 3 para mapas, câmera, animações e objetos interativos.
- HTML e CSS para menus, HUD e painéis administrativos.
- Vite para desenvolvimento e build.
- Vitest para testes automatizados.
- IndexedDB para salvamentos locais.
- Firebase Hosting para publicação.
- Firebase Authentication para autenticação.
- Cloud Firestore para salvamentos na nuvem e ranking.

Mantenha a lógica econômica desacoplada da representação visual.

---

# 2. VISÃO GERAL DO JOGO

Império do Queijo é um jogo single-player de estratégia, economia, construção e conquista territorial.

O jogador começa com uma empresa praticamente falida, administrando uma pequena fazenda e uma queijaria rudimentar.

Seu objetivo é transformar esse empreendimento no maior império de queijos de Queijópolis.

Durante a campanha, precisará:

- Produzir leite.
- Criar diferentes variedades de queijo.
- Comprar vacas.
- Construir e melhorar fazendas.
- Construir e melhorar fábricas.
- Contratar funcionários.
- Administrar estoques e despesas.
- Abrir barraquinhas e mercados.
- Comprar e conquistar propriedades.
- Automatizar processos.
- Contratar capangas.
- Defender e conquistar pontos territoriais.
- Investir em pesquisas.
- Realizar exportações.
- Competir com empresas controladas por IA.
- Dominar a cidade e alcançar os objetivos finais da campanha.

O jogo terá começo, desenvolvimento e conclusão definitiva.

Não haverá multiplayer competitivo em tempo real. Cada jogador possui sua própria campanha.

Os resultados finais serão enviados a um ranking compartilhado.

---

# 3. IDENTIDADE VISUAL

O visual será 2D isométrico, cartunesco, colorido e lúdico.

Referências de experiência:

- Navegação e administração inspiradas em Forge of Empires.
- Interação com propriedades inspirada em Hay Day.
- Comparação de forças e probabilidade de sucesso inspiradas em mecânicas de disputa de The Crims.

As referências são apenas conceituais. Não copiar código, imagens, interfaces ou conteúdo protegido desses jogos.

## Pasta assets

Todas as imagens serão fornecidas pelo usuário em:

`assets/`

Sua responsabilidade é examinar os arquivos reais e criar um catálogo de assets.

Não presumir que todos os arquivos possuem nomes padronizados.

Criar um registro central relacionando os arquivos a seus usos:

- Mapas.
- Fazendas.
- Fábricas.
- Mercados.
- Barraquinhas.
- Bancos.
- Agência de funcionários.
- Loja de vacas.
- Transportadora.
- Capangas.
- Bandeiras.
- Vacas.
- Árvores e objetos decorativos.
- Efeitos e elementos de interface.

As propriedades deverão utilizar PNGs com transparência quando disponíveis.

Não incorporar edifícios dinâmicos diretamente à imagem de fundo do mapa.

Não criar assets definitivos automaticamente quando houver uma imagem correspondente fornecida pelo usuário.

Se faltar uma imagem, utilize um placeholder claramente identificado e registre o recurso ausente.

---

# 4. MAPAS E REGIÕES

O jogo será dividido em regiões isométricas, cada uma com personalidade visual própria.

Regiões previstas:

1. Zona rural — início da campanha.
2. Distrito industrial.
3. Região urbana.
4. Periferia.
5. Zona comercial futurista.

O sistema deverá permitir adicionar outras regiões futuramente sem reescrever a lógica principal.

## Navegação

Implementar:

- Mapa-múndi.
- Seleção de região.
- Carregamento do mapa local.
- Movimento da câmera por arrastar.
- Zoom com a roda do mouse.
- Clique em estabelecimentos.
- Clique em terrenos vazios.
- Clique em pontos de venda.
- Clique em bandeiras e capangas.
- Destaque da propriedade selecionada.
- Retorno ao mapa-múndi.

## Sistema de terrenos

Cada terreno será um slot independente com:

- ID único.
- Região.
- Tipo de terreno.
- Coordenadas e área clicável.
- Posição visual do sprite.
- Proprietário.
- Edifício associado.
- Nível do edifício.
- Regras de compra, venda ou conquista.
- Estado de ocupação.

Os pontos de segurança terão IDs próprios e poderão estar vinculados a pontos de venda próximos.

As marcações tracejadas dos mapas servem como referência de posicionamento, mas o cadastro oficial dos terrenos será armazenado em JSON.

## Editor visual de mapas

Criar um modo de desenvolvimento para:

- Posicionar terrenos sobre os mapas.
- Redimensionar áreas clicáveis.
- Criar polígonos isométricos.
- Posicionar sprites.
- Visualizar IDs.
- Ajustar profundidade e sobreposição.
- Configurar pontos de segurança.
- Associar pontos de venda a seus pontos de segurança.
- Exportar e importar configurações JSON.

Não depender exclusivamente de detecção automática das cores dos tracejados.

## Distribuição territorial

Preservar os layouts que foram definidos durante a criação dos mapas.

Na região rural, considerar os pontos de venda previstos:

- 1 ponto inicial do jogador.
- 8 pontos neutros.
- 5 pontos inicialmente controlados por inimigos.

Cada ponto de venda deverá ter a possibilidade de um ponto de segurança associado.

No distrito industrial, considerar áreas controladas por inimigos vermelhos e roxos, terrenos neutros, pontos comerciais centrais e uma posição inicial do jogador em azul.

Na região urbana, incluir a facção de marcação laranja.

Na periferia, incluir a facção de marcação preta.

Na zona comercial futurista, incluir os terrenos e espaços de comércio e desenvolvimento previstos.

As quantidades exatas de terrenos de cada categoria deverão ser documentadas e verificadas no editor visual, conforme os mapas reais da pasta `assets/`.

O mapa não poderá conter estabelecimentos clicáveis sem registros correspondentes.

---

# 5. INÍCIO DA CAMPANHA

O jogador começa na zona rural, em um território neutro.

## Propriedades iniciais

- 1 Fazenda do Seu Zé.
- 1 Vaca Magrela.
- 1 Queijaria rudimentar.
- 1 Barraquinha inicial do Seu Zé.

Recursos iniciais sugeridos para balanceamento:

- R$ 1.500.
- 10 litros de Leite Fraco.
- 10 embalagens.
- 5 unidades de Minas Frescal Ruim.

Esses valores devem ficar em arquivos de configuração para facilitar o ajuste.

Seu Zé será um personagem importante do começo do jogo: um velho roceiro cansado, malvestido e ganancioso, responsável pela barraquinha inicial.

Criar um tutorial integrado à campanha que ensine:

1. Produção de leite.
2. Fabricação de queijo.
3. Abastecimento da barraquinha.
4. Primeiras vendas.
5. Compra de vacas.
6. Melhorias de fazenda e fábrica.
7. Contratação de funcionários.
8. Contratação de capangas.
9. Defesa e conquista territorial.
10. Automação.

Após o tutorial, o jogador terá liberdade de expansão.

---

# 6. TEMPO E SIMULAÇÃO

O jogo funciona em tempo real contínuo, sem pausa automática.

Velocidades disponíveis:

- 1×: 60 minutos reais equivalem a 1 dia de jogo.
- 2×: 30 minutos reais equivalem a 1 dia.
- 4×: 15 minutos reais equivalem a 1 dia.

A velocidade afeta todos os processos econômicos e as decisões da IA.

Utilizar um único relógio central.

Não permitir que alterações de velocidade dupliquem produção, despesas ou ações da IA.

## Progresso offline

Ao fechar o jogo:

- Simular progresso em velocidade-base 1×.
- Limitar o progresso a 8 horas reais, equivalentes a 8 dias de jogo.
- Respeitar estoques, insumos, capacidade e despesas.
- Processar eventos na ordem cronológica.
- Suspender ações automáticas quando faltarem recursos.
- Não permitir perdas territoriais irreversíveis por ataques enquanto o jogador estiver offline.
- Manter incidentes graves pendentes para resolução após o retorno.
- Não permitir conclusão automática definitiva da campanha sem confirmação na partida.

---

# 7. FAZENDAS E PRODUÇÃO DE LEITE

Cada fazenda possui:

- ID e nome.
- Proprietário.
- Nível.
- Capacidade de vacas.
- Vacas alocadas.
- Estoque de leite.
- Estoque de ração.
- Funcionários, quando aplicável.
- Produção diária.
- Custos operacionais.
- Melhorias.
- Capacidade de reprodução.

## Níveis de fazenda

Referência de balanceamento:

- Nível 1: 5 vacas.
- Nível 2: 12 vacas.
- Nível 3: 25 vacas.
- Nível 4: 50 vacas.

Esses números serão configuráveis.

## Espécies

Implementar:

- Vaca Magrela — Leite Fraco.
- Vaca Mimosa — Leite Comum.
- Vaca Premiada — Leite Nobre.
- Vaca Radioativa — Leite Radioativo.
- Vaca Mágica — Leite Encantado.

Prever expansão para espécies fantásticas futuras.

Valores iniciais de referência:

| Vaca | Leite/dia | Ração/dia | Compra |
|---|---:|---:|---:|
| Magrela | 8 L | 3 | R$ 500 |
| Mimosa | 16 L | 5 | R$ 1.800 |
| Premiada | 25 L | 8 | R$ 6.000 |
| Radioativa | 12 L | 10 especial | R$ 35.000 |
| Mágica | 10 L | 8 especial | R$ 60.000 |

## Qualidade

A qualidade do queijo depende da origem e qualidade do leite.

Funcionários e máquinas afetam eficiência, velocidade e capacidade, não transformam automaticamente leite ruim em queijo excelente.

Não misturar tipos de leite incompatíveis em um mesmo lote.

## Reprodução

Implementar:

- Reprodução comum.
- Melhoramento genético.
- Reprodução assistida de espécies especiais.
- Tempo e custo de reprodução.
- Limites de vagas e capacidade.
- Protótipo gratuito após desbloquear uma espécie fantástica pela primeira vez.

Vacas fantásticas serão desbloqueadas por pesquisa própria, não por espionagem ou eventos aleatórios.

---

# 8. FABRICAÇÃO DE QUEIJOS

Implementar receitas e linhas de produção.

Cada fábrica possui:

- Nível.
- Funcionários.
- Linhas de produção.
- Capacidade de fabricação.
- Estoque de leite.
- Estoque em produção.
- Capacidade de maturação.
- Estoque maturando.
- Estoque de queijo pronto.
- Embalagens.
- Despesas.
- Melhorias.
- Automação.

## Receitas iniciais

| Receita | Leite | Fabricação em 1× | Maturação | Preço-base |
|---|---:|---:|---:|---:|
| Minas Frescal | 5 L | 2 min | Nenhuma | R$ 25 |
| Meia Cura | 6 L | 3 min | 2 dias | R$ 42 |
| Curado | 7 L | 4 min | 5 dias | R$ 65 |
| Artesanal da Serra | 8 L | 5 min | 3 dias | R$ 95 |
| Imperial | 10 L | 8 min | 8 dias | R$ 160 |

Valores de referência, com ajustes econômicos centralizados.

Implementar versões de qualidade resultantes de diferentes leites.

As receitas devem consumir matéria-prima e embalagem conforme suas regras.

Queijos em fabricação ou maturação não podem ser vendidos antes de estarem prontos.

## Níveis de fábrica

- Nível 1: 1 linha, até 2 trabalhadores, maturação 20.
- Nível 2: 2 linhas, até 5 trabalhadores, maturação 60.
- Nível 3: 4 linhas, até 10 trabalhadores, maturação 160.
- Nível 4: 6 linhas, até 16 trabalhadores, maturação 350.

Criar melhorias visuais utilizando as diferentes fábricas da pasta de assets.

---

# 9. FUNCIONÁRIOS E AGÊNCIA

Criar um sistema completo de funcionários.

O jogador acessa a Agência de Funcionários no mapa.

Categorias:

- Tratadores.
- Queijeiros.
- Vendedores.
- Motoristas.
- Mecânicos.
- Gerentes.
- Pesquisadores.
- Capangas.

Cada funcionário possui:

- Categoria.
- Nível ou especialização.
- Salário.
- Custo de contratação.
- Eficiência.
- Local de trabalho.
- Estado de disponibilidade.

Não permitir alocação simultânea do mesmo funcionário em dois trabalhos incompatíveis.

## Queijeiros

- Aprendiz: R$ 60/dia, eficiência 70%.
- Queijeiro: R$ 130/dia, eficiência 100%.
- Mestre: R$ 280/dia, eficiência 130%.
- Lenda do Coalho: R$ 550/dia, eficiência 160%.

## Vendedores

- Iniciante: contratação R$ 150, salário R$ 35/dia, até 20 queijos/dia.
- Experiente: R$ 500, R$ 75/dia, até 40.
- Especialista: R$ 1.500, R$ 150/dia, até 65.
- Mestre: R$ 4.000, R$ 280/dia, até 100.

Implementar demissão, realocação, contratação e despesas recorrentes.

---

# 10. AUTOMAÇÃO

A automação será adquirida por melhorias e contratação de funcionários.

Não estará obrigatoriamente vinculada à derrota de rivais.

Automatizar:

- Repetição de lotes.
- Produção por prioridade.
- Controle de estoque-alvo.
- Reposição de barraquinhas.
- Compras de ração e embalagens.
- Distribuição e logística.
- Gestão de entregas.
- Acompanhamento comercial.
- Defesa por políticas.
- Aceitação limitada de contratos de exportação.

Implementar políticas configuráveis.

As automações devem consumir recursos reais e respeitar limites de orçamento.

A ausência do gerente responsável poderá suspender a funcionalidade dependente dele.

---

# 11. PONTOS DE VENDA E MERCADOS

Cada ponto de venda possui:

- Proprietário.
- Vendedor.
- Estoque.
- Capacidade.
- Demanda local.
- Faturamento.
- Despesas.
- Lucro.
- Melhorias.
- Ponto de segurança associado.

Tipos:

- Barraquinha improvisada.
- Barraquinha organizada.
- Quiosque.
- Barraquinha premium.
- Mercadinho.
- Mercado.
- Mercado grande.

O jogador começa com uma barraquinha.

Pontos comerciais adicionais poderão ser comprados ou conquistados, dependendo da situação territorial.

## Preços

Utilizar uma política global de preço por receita e empresa, não preços independentes em cada barraquinha.

Estratégias:

- Popular: 85% do preço-base.
- Equilibrada: 100%.
- Valorização: 120%.
- Personalizada.

A demanda é finita.

A participação de mercado deve considerar vendas finais reais ao consumidor em Queijópolis.

Vendas atacadistas não podem ser contadas duas vezes.

## Marketing

Implementar campanhas por distrito:

- Panfletagem.
- Rádio.
- Festival.
- Campanha premium.

Reputação global e popularidade local influenciam demanda, respeitando limites de consumidores.

---

# 12. SISTEMA COMPLETO DE CAPANGAS

Este será um dos sistemas estratégicos centrais do jogo.

As batalhas serão automáticas e resolvidas por atributos, investimentos e probabilidade de sucesso.

O jogador não movimentará personagens manualmente pelo mapa.

## Postos

Cada ponto de segurança possui:

- ID.
- Terreno ou ponto comercial vinculado.
- Proprietário.
- Estado.
- Equipe alocada.
- Nível de capangas.
- Ataque.
- Defesa.
- Integridade/condição.
- Armamento.
- Barricadas.
- Moral.
- Custos.
- Tempo de recuperação e disponibilidade.

## Estados visuais

Quando o posto estiver vazio, mostrar uma bandeira.

A bandeira será:

- Azul: jogador/aliado.
- Cinza: neutro.
- Cor da facção inimiga: adversário.

Quando capangas forem contratados e alocados, substituir a bandeira pela imagem de capangas correspondente.

Quando a equipe for retirada, ficar temporariamente incapacitada ou abandonar o posto por falta de pagamento, restaurar a bandeira.

Não implementar morte permanente inicialmente. Equipes derrotadas ficam incapacitadas e entram em recuperação, preservando as regras anteriores do GDD.

## Estrelas

Cada equipe terá até 3 estrelas.

**1 estrela — Capangas Iniciantes**

- Baratos.
- Menor ataque e defesa.
- Ideais para o começo da campanha.

**2 estrelas — Capangas Experientes**

- Melhor ataque e defesa.
- Custo maior.
- Exigem investimento para promoção.

**3 estrelas — Capangas Veteranos**

- Ataque e defesa elevados.
- Alto custo de contratação e manutenção.
- Eficientes em ataques e proteção territorial.

A evolução deve ser adquirida com dinheiro e respeitar pré-requisitos configuráveis.

As estrelas representam o nível da equipe, sem eliminar a possibilidade de diferenças de quantidade, moral e equipamentos.

## Melhorias compráveis

**ARMAMENTO**

Melhoria ofensiva comprada pelo jogador.

Níveis de armamento:

- Nível 0: sem melhoria.
- Nível 1: armamento simples.
- Nível 2: armamento reforçado.
- Nível 3: armamento avançado.

Cada nível aumenta a força de ataque de maneira configurável.

**BARRICADAS**

Melhoria defensiva comprada para o posto.

Níveis de barricadas:

- Nível 0: sem melhoria.
- Nível 1: barricada improvisada.
- Nível 2: barricada reforçada.
- Nível 3: barricada fortificada.

Cada nível aumenta a defesa do posto.

Armamento pertence à equipe ou seu equipamento; barricada pertence à instalação.

Não permitir que uma melhoria comprada para um posto seja aplicada gratuitamente a todos os demais.

## Fórmula de combate

Criar um sistema de comparação de forças.

Um modelo inicial é:

Força ofensiva = força-base da equipe × quantidade efetiva × multiplicador das estrelas × bônus de armamento × moral × outros modificadores.

Força defensiva = força-base da equipe × quantidade efetiva × multiplicador das estrelas × bônus de barricadas × moral × vantagens do posto.

Valores sugeridos:

- 1 estrela: multiplicador 1,00.
- 2 estrelas: multiplicador 1,40.
- 3 estrelas: multiplicador 1,90.
- Armamento: +12% por nível.
- Barricadas: +15% por nível.

Não permitir acúmulo ilimitado de bônus.

Modelo inicial de probabilidade:

Chance de vitória (%) = limitar entre 5% e 95% o resultado de:

50 + 40 × (Força ofensiva − Força defensiva) / (Força ofensiva + Força defensiva)

Aplicar modificadores contextuais limitados e documentados quando houver necessidade.

Quando as forças forem iguais e não houver vantagens adicionais, a probabilidade deve ser de 50%.

Mesmo uma equipe superior não terá vitória absolutamente garantida.

O resultado será sorteado apenas na resolução da missão, utilizando um gerador aleatório controlável nos testes.

## Exemplos

Equipe atacante:

- 3 capangas de 2 estrelas.
- Armamento nível 2.
- Moral normal.

Equipe defensora:

- 3 capangas de 2 estrelas.
- Barricadas nível 2.
- Moral normal.

Como ambos têm o mesmo nível, as melhorias alteram suas forças e consequentemente a chance de vitória.

O painel deve mostrar uma estimativa calculada, não uma porcentagem inventada.

## Ataques

O jogador poderá:

1. Selecionar um posto inimigo.
2. Consultar as informações disponíveis.
3. Selecionar uma equipe própria.
4. Ver a estimativa de chance de sucesso.
5. Conferir o custo e a duração.
6. Confirmar a missão.
7. Aguardar a resolução automática.
8. Consultar o resultado.

Exibir:

- Ataque total.
- Defesa estimada do alvo.
- Chance de sucesso.
- Tempo da operação.
- Custos.
- Risco de retaliação.
- Disponibilidade dos capangas.

Não permitir atacar sem uma equipe disponível.

## Resultados

Vitória:

- O posto inimigo é neutralizado ou conquistado conforme as regras territoriais.
- O estado do território muda.
- A imagem da bandeira/capangas é atualizada.
- O jogador recebe um relatório.

Derrota:

- A equipe atacante fica temporariamente incapacitada.
- O ataque gera custos e consequências.
- O território permanece com o defensor.

Se a defesa perder, os defensores entram em recuperação.

Implementar cooldown, custos e limites para impedir ataques infinitos.

## Salários

Capangas recebem salários por dia de jogo.

A falta de pagamento provoca redução de moral, indisponibilidade e eventual abandono, conforme regras de inadimplência.

A perda de uma equipe não apaga automaticamente as melhorias físicas de barricadas do posto.

## Defesa

Uma equipe alocada deverá proteger o posto correspondente.

Implementar reação automática a ataques recebidos, respeitando os atributos e melhorias.

## Escoltas

Capangas também poderão ser designados para escoltar caminhões.

Uma equipe em escolta ficará indisponível para defesa ou ataque enquanto estiver ocupada.

---

# 13. ESPIONAGEM E GUERRA COMERCIAL

Além dos ataques territoriais, implementar missões automáticas:

- Reconhecimento.
- Espionagem comercial.
- Espionagem científica.
- Sabotagem industrial.
- Sabotagem logística.
- Ataque a comboios.
- Interferência comercial.

Cada missão possui:

- Custo.
- Tempo.
- Equipe necessária.
- Risco.
- Chance calculada de sucesso.
- Resultado.
- Possíveis consequências.

Espionagem revela informações aproximadas e temporárias.

Não permite roubar desbloqueios permanentes de vacas fantásticas ou pesquisas concluídas.

Sabotagem gera prejuízos temporários e não destrói permanentemente instalações.

Não criar dinheiro ou mercadorias do nada ao realizar ataques.

Não implementar diplomacia ou alianças entre empresas.

---

# 14. TRANSPORTADORA E LOGÍSTICA

Implementar:

- Contratação de entregas terceirizadas.
- Compra de veículos próprios.
- Contratação de motoristas.
- Capacidade por veículo.
- Combustível.
- Manutenção.
- Entregas automáticas.
- Prioridade de estoque.
- Tempo de transporte.
- Escoltas com capangas.

Veículos:

- Utilitário leve.
- Caminhão de distribuição.
- Caminhão de carga.

A transportadora deverá possuir painel próprio.

O jogador poderá visualizar seus veículos, motoristas, contratos e entregas.

---

# 15. EXPORTAÇÃO

Implementar contratos com distribuidores externos.

Cada contrato possui:

- Destino.
- Produto.
- Qualidade exigida.
- Quantidade.
- Valor de pagamento.
- Prazo.
- Penalidade.
- Custo logístico.
- Risco.
- Escolta.
- Estado de entrega.

Destinos iniciais sugeridos:

- Juiz de Fora.
- Belo Horizonte.
- Rio de Janeiro.
- São Paulo.

Os destinos externos não precisam de mapas próprios jogáveis.

A exportação ocorre por contratos e viagens automáticas.

Não haverá seguro de carga.

Prejuízos devem refletir mercadorias realmente perdidas, sem contabilização duplicada.

Exportações não contam como participação de mercado dentro de Queijópolis.

---

# 16. PESQUISAS E LABORATÓRIO

Criar laboratório com níveis:

- Laboratório improvisado.
- Centro de Pesquisa Leiteira.
- Laboratório experimental.
- Instituto do Queijo Impossível.

Implementar pesquisadores e geração de pontos.

Áreas:

- Melhoramento básico.
- Reprodução avançada.
- Leite nobre.
- Genética radioativa.
- Leitomancia.
- Ciência do Queijo Impossível.

Pesquisas possuem:

- Pré-requisitos.
- Custo financeiro.
- Pontos necessários.
- Progresso.
- Desbloqueios permanentes.

A pesquisa deverá permitir desbloquear vacas Radioativas e Mágicas.

Não permitir progresso sem os recursos necessários.

---

# 17. SISTEMA BANCÁRIO E FINANCEIRO

Criar painéis para os bancos do mapa.

Implementar:

- Saldo.
- Receitas.
- Despesas.
- Lucro líquido.
- Fluxo de caixa.
- Patrimônio.
- Empréstimos.
- Juros.
- Prazos.
- Pagamentos.
- Inadimplência.
- Garantias, quando aplicável.
- Histórico financeiro.

Distinguir lucro, faturamento, caixa e patrimônio líquido.

Bancos modestos e modernos poderão oferecer condições diferentes conforme o estágio da campanha.

Não permitir empréstimos ilimitados.

Toda movimentação financeira deverá gerar um registro contábil.

---

# 18. INTELIGÊNCIA ARTIFICIAL DOS RIVAIS

Os concorrentes terão empresas reais dentro da simulação.

Cada rival possuirá:

- Caixa.
- Fazendas e vacas.
- Fábricas.
- Funcionários.
- Mercados.
- Capangas.
- Pesquisas.
- Estoques.
- Veículos.
- Dívidas.
- Receitas e despesas.
- Objetivos econômicos e territoriais.

A IA não pode criar recursos infinitos.

## Personalidades

Considerar os concorrentes já definidos no GDD:

- Família Coalho: tradicional e defensiva.
- Sindicato da Mussarela: agressivo e territorial.
- Queijaria Real: premium e especializada.
- Leite Supremo S.A.: industrial e altamente competitiva.

Incluir as facções adicionais indicadas pelos mapas, com IDs e configurações próprias, sem presumir que cores repetidas significam obrigatoriamente a mesma empresa.

A identidade final das facções adicionais deverá ficar parametrizada em dados editáveis.

## Dificuldade progressiva

O adversário próximo ao território inicial será mais fraco.

Adversários distantes serão progressivamente mais ricos e inteligentes.

O concorrente final deverá ser o mais competitivo.

A IA poderá:

- Produzir.
- Comprar insumos.
- Comprar vacas.
- Expandir instalações.
- Contratar funcionários.
- Automatizar processos.
- Ajustar preços.
- Fazer marketing.
- Defender territórios.
- Atacar pontos.
- Melhorar capangas.
- Comprar armamento e barricadas.
- Espionar.
- Sabotar.
- Exportar.
- Gerenciar empréstimos.

As decisões devem considerar caixa, retorno esperado, risco e ameaças.

## Ritmo de campanha

Os rivais não poderão conquistar indiscriminadamente todos os territórios dos outros concorrentes antes de o jogador avançar.

A IA deve preservar a progressão gradual da campanha.

Os rivais continuarão economicamente ativos, mas sua agressividade territorial deverá respeitar regras de progressão e balanceamento.

O rival final deve priorizar seu próprio crescimento e evitar atacar prematuramente a região inicial.

Não criar recursos gratuitos para compensar dificuldades da IA.

---

# 19. MENUS E INTERFACES

Implementar interfaces completas.

## Tela inicial

- Logo Império do Queijo.
- Login.
- Criar conta.
- Nova campanha.
- Continuar campanha.
- Ranking.
- Configurações.
- Créditos.

## HUD do jogo

Exibir:

- Dinheiro.
- Dia e horário.
- Velocidade 1×/2×/4×.
- Estoque de leite.
- Estoque de queijo.
- Lucro.
- Alertas.
- Acesso ao mapa-múndi.
- Acesso ao menu principal.

## Painéis

Criar painéis funcionais para:

- Fazenda.
- Vaca.
- Fábrica.
- Produção.
- Barraquinha.
- Mercado.
- Funcionários.
- Agência de funcionários.
- Loja de vacas.
- Transportadora.
- Banco.
- Pesquisa.
- Capangas.
- Posto de segurança.
- Combate.
- Espionagem.
- Exportações.
- Finanças.
- Construções.
- Melhorias.
- Concorrentes.
- Territórios.
- Relatórios.

Todos os painéis devem consultar e atualizar o mesmo estado central.

As alterações devem aparecer no mapa e nos relatórios imediatamente.

---

# 20. CAMPANHA E VITÓRIA

O jogo terá capítulos de progressão.

O jogador deverá começar pequeno e enfrentar concorrentes gradualmente mais difíceis.

A vitória exige domínio econômico e territorial de Queijópolis.

Implementar condições finais objetivas e verificáveis:

- Todos os rivais principais da campanha neutralizados.
- Controle de todos os territórios estratégicos conquistáveis obrigatórios.
- Liderança nas vendas ao consumidor dentro de Queijópolis.
- Lucro líquido positivo durante sete dias consecutivos de jogo.
- Consolidação da campanha por sete dias conforme os requisitos definidos.

Terrenos decorativos, serviços públicos e propriedades não conquistáveis não contam para a exigência territorial.

Os critérios de vitória não podem depender de ganhar dinheiro infinitamente.

Ao atingir as condições, encerrar a campanha.

Exibir a tela final com:

- Nome da empresa.
- Dias de jogo.
- Territórios conquistados.
- Rivais neutralizados.
- Faturamento total.
- Lucro acumulado.
- Dinheiro final.
- Dívidas.
- Patrimônio líquido.
- Pontuação.
- Classificação.

Após a vitória, registrar a campanha como concluída.

Permitir consultar o resultado e iniciar outra campanha.

Não manter a campanha vencida produzindo indefinidamente.

---

# 21. LOGIN, SALVAMENTO E FIREBASE

O jogador possuirá uma conta individual.

Priorizar Firebase Authentication com e-mail e senha e um apelido público.

Caso sejam necessários códigos de convite, implementá-los separadamente da autenticação.

Nunca utilizar um token de autenticação como senha permanente.

Salvar:

- Perfil.
- Campanha.
- Tempo.
- Economia.
- Territórios.
- Propriedades.
- Vacas.
- Funcionários.
- Estoques.
- Pesquisas.
- Capangas.
- Batalhas.
- Contratos.
- Estado dos rivais.
- Progresso e conclusão.

Manter salvamento local com IndexedDB.

Adicionar sincronização com Firestore para contas autenticadas.

Utilizar versionamento de salvamentos e migrações.

Reduzir a frequência de gravações na nuvem para respeitar limites gratuitos.

Não executar leituras e gravações a cada frame.

Criar regras de segurança que impeçam um usuário de acessar ou alterar dados privados de outra conta.

Não afirmar que o ranking é impossível de manipular apenas porque existe autenticação. Se a simulação ocorrer no cliente, registrar a limitação e preparar arquitetura para futura validação confiável.

---

# 22. RANKING

Criar a seção Hall dos Magnatas.

Registrar apenas resultados de campanhas concluídas.

Ranking principal por patrimônio líquido final, com critérios de desempate documentados.

Mostrar também:

- Apelido.
- Dificuldade.
- Lucro acumulado.
- Dias de jogo.
- Data da vitória.
- Pontuação final.

Separar rankings por dificuldade e, quando houver alterações importantes de balanceamento, por versão de regras.

Cada campanha deve ser registrada de forma consistente, sem duplicações por recarregamento de página.

---

# 23. ARQUITETURA E ORGANIZAÇÃO

Organizar o código em sistemas independentes.

Criar módulos para:

- Relógio.
- Estado global.
- Persistência.
- Mapas.
- Terrenos.
- Propriedades.
- Recursos.
- Economia.
- Vacas.
- Reprodução.
- Produção.
- Maturação.
- Funcionários.
- Vendas.
- Demanda.
- Marketing.
- Logística.
- Exportação.
- Banco.
- Pesquisa.
- Capangas.
- Combate.
- Segurança.
- Espionagem.
- IA.
- Campanha.
- Vitória.
- Ranking.
- Autenticação.

Utilizar dados e configurações centralizados para custos, atributos, receitas e progressão.

Evitar números mágicos espalhados pelo código.

Evitar dependências circulares.

Utilizar testes para cálculos econômicos e combate.

---

# 24. TESTES E QUALIDADE

Criar testes automatizados para:

- Produção de leite.
- Consumo de ração.
- Capacidade das fazendas.
- Produção de queijo.
- Maturação.
- Estoques.
- Vendas.
- Cálculo de lucro.
- Salários.
- Compra de propriedades.
- Upgrade de construções.
- Upgrade de capangas.
- Armamento.
- Barricadas.
- Probabilidade de combate.
- Resolução de combate.
- Transferência de território.
- Recuperação de capangas.
- IA com recursos finitos.
- Logística.
- Contratos.
- Progresso offline.
- Alternância entre velocidades.
- Salvamento e carregamento.
- Vitória final.

Realizar testes de integração para fluxos completos.

Exemplo obrigatório:

Comprar uma vaca → alocá-la → produzir leite → fabricar queijo → enviar à barraquinha → vender → receber dinheiro → descontar despesas → salvar → recarregar → confirmar o estado correto.

Outro exemplo:

Comprar capangas → melhorar para duas estrelas → adquirir armamento → atacar um posto com barricadas → calcular chance → resolver combate → atualizar propriedade → salvar o resultado.

Nenhum sistema deverá criar recursos sem origem econômica.

---

# 25. PLANO DE ENTREGA

Este projeto é grande, portanto desenvolva por fases, mas mantenha o objetivo final de entregar o jogo completo.

Fases obrigatórias:

1. Auditoria do projeto e dos assets.
2. Arquitetura, GDD consolidado e configurações.
3. Mapas, câmera, terrenos e editor visual.
4. Fazendas e vacas.
5. Fábricas e receitas.
6. Funcionários e automação.
7. Barraquinhas, mercados, vendas e demanda.
8. Economia, bancos e finanças.
9. Capangas, estrelas, armamento e barricadas.
10. Conquista territorial e combate automático.
11. IA e expansão dos rivais.
12. Espionagem e sabotagem.
13. Logística e exportação.
14. Pesquisa e reprodução.
15. Campanha completa, capítulos e vitória.
16. Login, salvamentos na nuvem e ranking.
17. Balanceamento, testes completos e publicação.

Crie `docs/ROADMAP.md` e registre o estado de cada fase.

Ao terminar uma sessão, deixe instruções claras para a próxima, indicando:

- O que está implementado.
- O que foi testado.
- O que não funciona.
- Os arquivos alterados.
- Problemas conhecidos.
- A próxima tarefa.

Não marque como concluído um sistema que tenha apenas interface ou dados falsos.

---

# 26. INSTRUÇÃO FINAL

Quero um jogo completo e funcional, não apenas um esqueleto.

Implemente as etapas progressivamente e mantenha todo o código consistente.

Reutilize os assets da pasta `assets/`.

Não substitua imagens reais por placeholders sem necessidade.

Não invente recursos que contrariem o GDD.

Não elimine sistemas complexos apenas para terminar mais rapidamente.

Se uma funcionalidade for extensa, divida sua implementação em tarefas menores, mas preserve sua especificação completa.

Não peça confirmação a cada arquivo criado. Avance autonomamente nas tarefas técnicas aprovadas, executando testes e corrigindo erros.

Solicite minha decisão quando houver uma escolha importante de design, uma ambiguidade que altere a jogabilidade ou uma ação externa que necessite autorização.

**PRIMEIRA TAREFA:**

Analise o repositório atual e todos os arquivos da pasta `assets/`.

Crie:

- Um inventário de assets.
- Um GDD consolidado.
- Um documento de arquitetura.
- Um roadmap de implementação.
- Uma lista de decisões ainda ambíguas.
- Uma matriz de funcionalidades com seus critérios de conclusão.

Depois comece a implementação pela arquitetura do mapa interativo e sistema de terrenos, preservando as funcionalidades já existentes.

O projeto somente estará concluído quando for possível começar com o Seu Zé, desenvolver a empresa, enfrentar os concorrentes, conquistar Queijópolis, terminar a campanha e registrar um resultado no ranking.