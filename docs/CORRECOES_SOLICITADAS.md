# Correção e adequação do projeto conforme o `codex_master`

## 1. Objetivo principal

A implementação atual não corresponde ao que foi solicitado no arquivo `codex_master`. É necessário revisar o que foi desenvolvido e corrigir a implementação para que respeite as especificações originais.

**Antes de implementar novas funcionalidades, analise o `codex_master`, identifique as divergências entre o código atual e os requisitos descritos abaixo e corrija o projeto existente.** Preserve as mecânicas, estruturas e funcionalidades que já estejam corretas.

## 2. Mapa e propriedades

O mapa deve ser preenchido com propriedades fixas, distribuídas conforme a localização e a organização territorial já previstas no projeto.

Cada propriedade que possuir uma loja deve apresentar um ponto circular visível no mapa. Esse círculo será utilizado para representar a bandeira de controle da propriedade.

As bandeiras devem indicar o estado atual do ponto:

- **Neutra:** propriedade ainda não conquistada por nenhuma facção.
- **Aliada:** propriedade sob controle do jogador ou de sua facção.
- **Inimiga:** propriedade sob controle do inimigo.

### Distribuição inicial das propriedades

A distribuição dos pontos deve respeitar a seguinte organização:

- **Região norte, identificada pela área vermelha:** concentrar os pontos inimigos.
- **Região sul:** posicionar a fazenda inicial do jogador.
- **Demais regiões:** distribuir os pontos neutros que poderão ser comprados ou conquistados posteriormente, conforme as regras do jogo.

Todo quadrado do mapa que representar uma loja deverá possuir seu respectivo círculo de controle, no qual será exibida a bandeira correspondente ao estado da propriedade.

Não deixe propriedades sem seus respectivos pontos de controle quando estes forem exigidos pela estrutura do mapa.

## 3. Propriedades estáticas e menus de interação

As propriedades do mapa devem ser estáticas. Sua posição, seu formato e sua estrutura territorial não devem mudar durante a partida.

Ao clicar em uma propriedade, o jogador deverá abrir um menu específico com as informações e as ações disponíveis para aquele local.

As propriedades não devem ser reconstruídas, movidas ou alteradas visualmente durante as ações de produção, coleta, compra ou interação.

**A distinção fundamental é:** a propriedade permanece fixa no mapa, enquanto os elementos que representam seu controle podem mudar de acordo com as mecânicas do jogo.

## 4. Sistema de produção das fazendas

As fazendas são responsáveis pela produção de leite.

O funcionamento deve seguir estas regras:

1. A fazenda produz leite automaticamente, conforme o sistema de produção definido no projeto.
2. O leite produzido fica acumulado na fazenda até ser retirado.
3. Quando houver leite disponível para coleta, deverá aparecer um ícone de leite sobre ou junto ao ponto correspondente.
4. Ao clicar no ícone de leite, o jogador coleta o leite acumulado e o transporta para uma fábrica, de acordo com as regras de transferência de recursos do jogo.
5. A quantidade transferida deve corresponder ao total disponível para retirada, respeitando eventuais limites de capacidade já definidos no projeto.

O ícone de leite deve aparecer somente quando houver recurso disponível para coleta.

## 5. Sistema de produção das fábricas

As fábricas recebem o leite produzido pelas fazendas e o transformam em queijo.

O funcionamento deve seguir estas regras:

1. O jogador deposita na fábrica o leite obtido nas fazendas.
2. A fábrica acumula o leite recebido e utiliza esse recurso para produzir queijo.
3. A produção deve ocorrer conforme os tempos, as quantidades e as regras já estabelecidos no projeto.
4. A quantidade ou o estado da produção deve ser exibido visualmente acima da fábrica.
5. Quando houver queijo pronto para coleta, deverá aparecer um ícone de queijo.
6. Ao clicar nesse ícone, o jogador coleta todo o queijo disponível para retirada, respeitando as regras de capacidade do sistema.
7. O queijo coletado é levado para uma loja, onde será convertido em dinheiro.

A interface deve diferenciar claramente a quantidade de leite armazenada, o andamento da produção e a quantidade de queijo disponível para coleta.

## 6. Sistema de venda nas lojas

As lojas recebem o queijo produzido pelas fábricas e o convertem em dinheiro.

O funcionamento deve seguir estas regras:

1. O jogador leva o queijo produzido até uma loja.
2. O queijo é depositado na loja, respeitando a capacidade e as regras econômicas do jogo.
3. A loja processa o queijo depositado e gera dinheiro conforme o sistema de conversão definido no projeto.
4. O dinheiro produzido fica acumulado na loja até ser coletado.
5. Quando houver dinheiro disponível para retirada, deverá aparecer um ícone de dinheiro sobre ou junto à loja.
6. Ao clicar no ícone de dinheiro, o jogador coleta todo o dinheiro disponível para retirada, respeitando eventuais limites de capacidade.

O ícone de dinheiro deverá aparecer quando houver saldo acumulado disponível ou quando a loja atingir sua capacidade de armazenamento, conforme as regras definidas no projeto.

A loja deve manter seu ponto fixo no mapa. A produção, o armazenamento e a coleta devem ser representados por indicadores e menus, sem alterar a estrutura territorial.

## 7. Controle territorial, bandeiras e combate

As alterações visuais relacionadas à propriedade territorial devem acontecer somente nos pontos de controle das lojas e nos pontos de capangas.

As propriedades físicas do mapa permanecem estáticas. O que muda é o estado de controle representado pela bandeira e, quando aplicável, pela imagem do ponto de capangas.

### Regras de combate e conquista

1. Os pontos aliados podem atacar pontos inimigos próximos, seguindo as regras de alcance, movimentação e combate estabelecidas no projeto.
2. Os pontos inimigos também devem poder atacar pontos aliados e neutros próximos, de acordo com as mesmas regras gerais de combate.
3. Quando um ponto inimigo for derrotado e perder seu controle territorial, ele deverá se tornar neutro.
4. Um ponto neutro poderá ser comprado pelo jogador, conforme as condições e os custos definidos no projeto.
5. Após adquirir um ponto neutro, o jogador poderá posicionar um capanga para defendê-lo.
6. Os capangas aliados devem defender os pontos controlados e atacar pontos inimigos próximos, quando houver condições para isso.
7. Os inimigos devem utilizar uma lógica equivalente para defender seus territórios, atacar pontos próximos e tentar expandir seu controle.
8. A bandeira exibida no ponto deve ser atualizada conforme o estado territorial: neutro, aliado ou inimigo.

As mudanças visuais devem refletir o estado real do jogo. Não basta trocar a imagem de uma bandeira sem atualizar o controle lógico do ponto correspondente.

## 8. Requisitos de implementação

Antes de finalizar a correção, verifique os seguintes itens:

- O mapa possui as propriedades distribuídas conforme a organização territorial solicitada.
- Todos os pontos que representam lojas possuem círculos de controle e bandeiras.
- A fazenda inicial está localizada na região sul.
- Os pontos inimigos estão concentrados na região norte, na área vermelha.
- Os demais pontos estão disponíveis como propriedades neutras.
- As propriedades permanecem estáticas durante toda a partida.
- Cada propriedade abre seu menu de interação ao ser clicada.
- As fazendas produzem e acumulam leite.
- As fábricas recebem leite, produzem queijo e exibem o estado da produção.
- O queijo pode ser coletado integralmente e levado às lojas.
- As lojas convertem queijo em dinheiro e permitem coletar o saldo acumulado.
- Os ícones de coleta aparecem conforme a disponibilidade dos recursos.
- As bandeiras refletem corretamente o controle territorial.
- Os pontos aliados e inimigos conseguem combater e disputar propriedades de acordo com as regras estabelecidas.
- Os pontos inimigos derrotados podem se tornar neutros.
- Os pontos neutros podem ser comprados e receber capangas para defesa e ataque.
- As imagens das propriedades não mudam indevidamente durante a produção ou a coleta.
- O código continua compatível com a arquitetura e as tecnologias já utilizadas no projeto.

## 9. Orientação final ao Codex

Não implemente uma versão simplificada que apenas reproduza visualmente parte dessas funcionalidades. O objetivo é corrigir e completar a implementação existente para que as mecânicas funcionem de maneira integrada.

Analise o `codex_master` e os arquivos atuais antes de modificar o código. Reutilize os sistemas existentes sempre que possível, evite duplicar funcionalidades e não remova comportamentos que já estejam corretos.

Se algum detalhe não estiver definido, procure primeiro a resposta no `codex_master` e na arquitetura existente. Não invente regras de jogo, custos, tempos de produção, capacidades ou sistemas de combate que contradigam as especificações existentes.

Ao concluir, informe quais arquivos foram modificados, quais divergências foram corrigidas e quais requisitos foram implementados ou ainda dependem de definição.