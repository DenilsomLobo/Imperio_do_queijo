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


## Upgrades ilustrados dos capangas — 15/10/2026
Substituir botões textuais de armamento/barricada por duas sequências de três cartões clicáveis. Armamento usa caixa de armas; barricada usa barreira de madeira e sacos. Cada arte tem exatamente 1/2/3 estrelas no topo correspondendo ao nível. Ícones PNG transparentes em assets/icones/icon_armamento_1.png até _3 e icon_barricada_1.png até _3, com manifesto e inventário atualizados. Mostrar nível atual, adquiridos, próximo nível comprável e posteriores bloqueados, com preço incremental e bônus acumulado. Preservar comandos, custos R$ 125/1.500/3.500, bônus de ataque 12%/nível e defesa 15%/nível, limite de três, requisitos de equipe, estado salvo e caixa real. Armamento acompanha equipe; barricada pertence ao posto. Não conceder upgrades nem resetar campanha.


## Entrada, identidade visual, caixa de testes e ranking — 15/10/2026
- Usar os oito PNGs fornecidos em assets/icones/menu-temporario no manifesto dos setores, substituindo referências aos SVGs removidos. Usar assets/text_logo.png no canto superior esquerdo e na entrada. Logo clicável volta ao index/tela inicial após salvar localmente. Reservar antes dele espaço invisível para futuro avatar, sem expor controle vazio ao teclado.
- Novas campanhas do jogador começam com R$ 100.000.000 (10.000.000.000 centavos). Essa regra de testes substitui caixa inicial anterior de R$ 500 somente para jogador; IA continua no valor atual. Não conceder dinheiro retroativo nem resetar saves existentes.
- Criar ícones Salvar, Resetar e Ranking em estilo dourado e mostrar ícone + texto nos botões superiores. Reset mantém confirmação em duas etapas e palavra exata SAIR.
- Antes de entrar, pedir nome de 2 a 30 caracteres. Nomes normalizados identificam perfis locais independentes; nome sozinho não é senha nem autenticação. Primeiro perfil adota campanha legada sem perfil, preservando recursos; perfis posteriores começam separados. Salvar atualiza campanha e pontuação do perfil atomicamente no IndexedDB. Reset altera apenas a campanha desse perfil.
- Confirmação expressa do usuário: ranking é por DINHEIRO GUARDADO NO CAIXA ATUAL, não faturamento, patrimônio, recorde histórico ou dinheiro ainda nas lojas. Exibir top 10 real, ordem decrescente, sem inventar participantes. Mostrar origem local/nuvem e erros de conexão. Ambiente atual é de testes com crédito inicial ampliado.
- Preparar Cloud Firestore e Firebase Auth anônimo por identidade/perfil, regras privadas para saves e ranking autenticado, limite 10 e separação por versão de regras. Usuário fornecerá configuração Firebase posteriormente. Até então saves e ranking locais funcionam, e nuvem é explicitamente não configurada. Não publicar/deploy nem afirmar integração online validada sem projeto configurado. Autenticação anônima depende da identidade preservada neste navegador; recuperação em outro dispositivo por conta vinculada permanece fase futura.


## Rede coletiva de capangas — 15/10/2026
- Cada loja própria com uma equipe alocada no posto correspondente concede +5% de ataque e defesa a todas as equipes da mesma empresa. Contar por loja/equipe alocada, não por integrante ou estrela: 12 lojas com 12 equipes = +60%, não +180%. Jogador e IA usam a mesma fórmula e recursos separados.
- Bônus aditivo entre lojas: rede = lojas guarnecidas × 5%; multiplicar forças existentes por (1 + rede). Armamento continua somente no ataque e barricada somente na defesa; moral e indisponibilidade continuam aplicadas. Nenhuma equipe gera força própria quando ausente, em missão/recuperação ou sem moral.
- Contar apenas loja e posto de mesma empresa com equipe de quantidade positiva. Lojas vazias/neutras/rivais e equipes em reserva não contribuem. Uma equipe ainda alocada conta durante missão, recuperação ou atraso salarial até sair do posto/emprego; sua força individual continua zerada nas indisponibilidades já previstas. Contratação/alocação, realocação, neutralização e demissão recalculam a rede a partir do estado real. Sem campo de bônus acumulado no save, sem concessões/reset.
- Ataque registra força e bônus no momento da partida; defesa recalcula toda a rede ao chegar. Proibir ataque remoto e preservar regras de ruas diretas, sorteio, neutralização, salários e retaliação.
- Painel dos capangas informa percentual coletivo, lojas guarnecidas e fórmula. IA preenche postos inclusive longe da fronteira antes de atacar, aproveita reservas disponíveis, contrata com caixa real e preserva reserva de duas diárias operacionais (mínimo R$ 100). Compra de nova loja considera também contratação e manutenção da guarnição. Não criar dinheiro/equipes para IA.


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


## Local das barras de progresso — 15/10/2026
As barras de progresso de vitória e derrota aparecem exclusivamente dentro do menu Inimigos. Não exibir barras acima do mapa. Preservar cálculo e regras de domínio.


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
