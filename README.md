# 🧀 Império do Queijo

**Da barraquinha do Seu Zé à disputa por um império.**

Império do Queijo é um jogo de gestão, produção e estratégia territorial para navegador. Construa sua cadeia de leite e queijo, cuide das contas, contrate funcionários e proteja seus pontos de venda enquanto disputa o mapa com a **Família Coalho**, uma empresa rival controlada pela IA.

> 🚧 **Em desenvolvimento:** a campanha rural já reúne sistemas jogáveis e integrados. Outras fases e funcionalidades continuam no [roadmap](docs/ROADMAP.md).

## IMPÉRIO DO QUEIJO

![Império do Queijo](https://portifolio-denilsom-lobo.web.app/images/games/imperio-do-queijo.png)

## 🎮 Como é jogar

Você começa com uma fazenda, uma queijaria, uma barraquinha, uma Magrela e **R$ 500 no caixa**. O rival começa com **R$ 1.000**. O objetivo é transformar uma operação pequena em uma empresa capaz de dominar o mapa.

O ciclo principal é:

**Criar vacas → produzir leite → fabricar queijo → abastecer lojas → vender → recolher dinheiro → reinvestir.**

Cada decisão tem custo. Comprar mais vacas aumenta a oferta de leite, mas exige capacidade de processamento. Abrir lojas amplia a rede de vendas e seus bônus, mas também cria despesas. Contratar capangas fortalece sua empresa e permite disputar a fronteira.

O mapa tem visual isométrico e navegação point-and-click: clique nas construções para gerenciá-las, arraste para explorar e use a roda do mouse para aproximar ou afastar. Os cartões superiores dão acesso às propriedades, funcionários, estoque, queijos, vacas, pontos de venda, finanças e inimigos.

## 🏆 Objetivo da campanha

Para vencer, controle os **24 objetivos** da zona rural:

| Objetivo | Quantidade necessária |
| --- | ---: |
| Pontos de venda | 14 |
| Fazendas | 4 |
| Fábricas | 4 |
| Banco | Qualquer um dos dois |
| Transportadora | 1 |

As expansões inicialmente neutras também contam. A Família Coalho vence se cumprir a mesma condição. Leilões abertos precisam terminar antes da confirmação do resultado. As barras de vitória e avanço rival aparecem somente dentro do menu **Inimigos**.

## 📜 Regras e sistemas

### Tempo de jogo

| Velocidade selecionada | Duração real de um dia |
| --- | ---: |
| 1× | 1 minuto |
| 2× | 30 segundos |
| 4× | 10 segundos |

Produção, vendas, salários e manutenção acompanham o mesmo relógio. Os rótulos de velocidade correspondem às durações acima; os tempos-base das receitas também aceleram. A simulação offline considera até oito horas reais em 1×, respeitando recursos e as regras de proteção territorial.

### Fazendas, vacas e leite

- Cada vaca alimentada produz **1 litro por dia de jogo**. Sem ração, produz metade; alimentação parcial gera eficiência proporcional.
- O estoque apresenta litros completos. O progresso fracionário é preservado internamente, inclusive ao salvar.
- Compre vacas na loja de vacas e escolha uma fazenda própria com vagas. As cinco espécies estão disponíveis para compra, sem exigência de pesquisa na versão atual.
- É possível transferir vacas entre fazendas próprias com capacidade. A revenda paga **70% do preço de compra**, após pelo menos **três dias de jogo** da aquisição.
- Comprar uma espécie não revela automaticamente seus produtos: a descoberta ocorre ao produzir o primeiro litro completo.

| Vaca | Compra | Ração por dia | Origem do leite |
| --- | ---: | ---: | --- |
| Magrela | R$ 250 | 10 unidades | Fraco |
| Mimosa | R$ 1.250 | 20 unidades | Comum |
| Premiada | R$ 2.500 | 40 unidades | Nobre |
| Radioativa | R$ 18.000 | 80 unidades | Radioativo |
| Mágica | R$ 36.000 | 100 unidades | Mágico |

**Ração: R$ 0,25 por unidade.** As compras permitem escolher de 1 a 1.000 unidades por vez, com preço total informado e excedente mantido no estoque.

### Fabricação dos queijos

Cada unidade exige **1 litro do leite da mesma origem e uma embalagem**. Leite fraco, por exemplo, só fabrica Queijo Fraco. Uma embalagem custa **R$ 2,50**; também pode ser comprada por quantidade.

| Queijo | Tempo-base em 1×, sem bônus | Preço-base de venda |
| --- | ---: | ---: |
| Fraco | 10 segundos | R$ 25 |
| Comum | 30 segundos | R$ 50 |
| Nobre | 1 minuto | R$ 100 |
| Radioativo | 2 minutos | R$ 200 |
| Mágico | 2 minutos e 30 segundos | R$ 400 |

As fábricas possuem limites de linhas e estoque. Sem funcionários, a fabricação é iniciada manualmente. Funcionários ativos iniciam novos lotes e compram apenas as embalagens necessárias com o caixa da empresa. A coleta manual continua disponível; a transportadora contratada automatiza as transferências.

### Lojas e estoque compartilhado

- Abrir uma loja neutra custa **R$ 500**; cada loja própria cobra **R$ 5 por dia**.
- Uma loja só vende com **vendedor contratado e ativo**. A contratação custa **R$ 50**, com salário de **R$ 5 por dia**.
- Vendedor ativo acrescenta **1% ao preço de venda daquela loja**.
- Cada loja própria além da primeira acrescenta **10% ao preço-base**, de forma acumulativa: duas lojas dão +10%, três dão +20%, e assim por diante.
- O bônus de vendedor é aplicado depois do bônus da rede, com arredondamento em centavos. Exemplo: Queijo Fraco em uma rede de duas lojas, vendido por vendedor ativo, vale **R$ 27,78**.
- Queijos enviados ficam em um **estoque compartilhado**, visível em todas as lojas próprias. Cada unidade só pode ser vendida uma vez.
- Lojas com vendedor ativo vendem gradualmente e liquidam as sobras no fechamento diário. O dinheiro fica na loja até ser recolhido manualmente ou pelo banco.

### Funcionários e automação

Funcionários de fábrica aceleram a produção por indivíduo ativo:

| Nível | Contratação | Salário por dia | Bônus de velocidade |
| --- | ---: | ---: | ---: |
| 1 | R$ 250 | R$ 25 | +5% |
| 2 | R$ 4.000 | R$ 350 | +10% |
| 3 | R$ 8.000 | R$ 600 | +15% |

Os bônus somam velocidade, respeitando linhas e insumos; não mudam a origem ou qualidade do leite. Salários atrasados suspendem a atividade e os bônus. Funcionários de fábrica e capangas podem sair após quatro dias sem pagamento.

### Capangas e disputa territorial

As equipes têm três integrantes e podem evoluir de uma a três estrelas.

| Equipe | Contratação | Salário por dia |
| --- | ---: | ---: |
| Nível 1 | R$ 125 | R$ 5 |
| Nível 2 | R$ 3.000 | R$ 50 |
| Nível 3 | R$ 9.000 | R$ 100 |

- Cada loja própria com equipe alocada concede **+5% de ataque e defesa para toda a empresa**. Doze lojas guarnecidas somam +60%. Equipes em reserva não contam para esse bônus.
- Armamento concede **+12% de ataque por melhoria**, até +36%.
- Barricadas concedem **+15% de defesa local por melhoria**, até +45%, e precisam de equipe para produzir força de defesa.
- Armamento e barricadas custam, por sequência de melhorias: **R$ 125 → R$ 1.500 → R$ 3.500** por compra.
- Ataques só ocorrem entre lojas ligadas diretamente pela mesma rua cadastrada. Proximidade visual ou um caminho passando por outras lojas não autorizam atacar.
- O combate é probabilístico: considera quantidade, estrelas, moral, equipamento e bônus da rede. Forças iguais dão 50% de chance para cada lado.
- Atacar custa **R$ 50** e envolve deslocamento, recuperação e intervalo entre ataques. A defesa é recalculada quando o ataque chega.
- Vencer neutraliza a loja e seu posto; a aquisição posterior exige compra. Perder como atacante gera compensação ao defensor conforme o nível da equipe defensora, usando dinheiro real e dívida se faltar caixa.

### Bancos, transporte e leilões

| Serviço | Contratação | Regra principal |
| --- | ---: | --- |
| Banco nível 1 | R$ 9.000 | Coleta automática; taxa de 1% do resultado positivo do dia; limite de R$ 500.000 em vendas totais da empresa/dia |
| Banco nível 2 | R$ 60.000 | Coleta automática; taxa de 2% do resultado positivo do dia; sem limite diário de vendas para coleta |
| Transportadora | R$ 15.000 | Transporte automático fazenda → fábrica → lojas; manutenção de R$ 300/dia |

A empresa pode ter **um contrato bancário ativo**. O banco transfere dinheiro realmente existente nas lojas; a transportadora move recursos existentes e respeita capacidade. Esses serviços não substituem os funcionários de produção nem o vendedor.

Fazendas, fábricas e serviços podem entrar em leilão. O prazo é de **dez dias de jogo**, com aumento mínimo de **10% no lance**. O valor é reservado do caixa; perder a disputa devolve o lance superado. A transferência de um serviço também transfere o contrato, com suas obrigações futuras.

### Finanças e adversário

O menu **Finanças** mostra caixa, dinheiro nas lojas, receitas, despesas, resultados, pendências, compromissos diários e movimentações. Recolher dinheiro da loja não conta como uma nova venda. O crédito inicial também não é lucro.

A **Família Coalho** administra suas propriedades com recursos limitados. A IA produz, compra insumos, investe no rebanho, contrata pessoal, amplia a rede, disputa leilões e melhora sua segurança. Ela compara custos, capacidade e retorno antes de investir, mantém reserva operacional e escolhe ataques por chance e orçamento. Suas decisões e projeções aparecem em **Inimigos**. Não recebe dinheiro infinito nem prevê os sorteios de combate.

## 🚀 Primeiros passos

1. Informe seu nome para criar ou continuar um perfil local.
2. Visite a queijaria e envie os queijos prontos às lojas.
3. Compre ração na fazenda e acompanhe a produção de leite.
4. Recolha o leite, escolha a receita correspondente e inicie a fabricação.
5. Envie o queijo pronto, acompanhe as vendas e recolha o dinheiro da loja.
6. Reinvista sem comprometer salários, manutenção e insumos. Expanda a segurança junto da empresa.

## 💾 Salvamento e ranking

O salvamento local usa **IndexedDB**, com salvamento automático e botão manual. Perfis são identificados pelo nome informado na entrada. O ranking considera o **dinheiro disponível no caixa**, exibindo os dez maiores saldos.

Para continuar, use o mesmo navegador, perfil e endereço/porta. Clonar o projeto ou enviar o código ao GitHub não transfere campanhas. Evite abrir a mesma campanha simultaneamente em várias abas. Resetar campanha exige confirmação em duas etapas e digitar exatamente **SAIR**; isso apaga o progresso daquela campanha.

A integração com **Firebase Authentication e Cloud Firestore** está preparada, mas depende da configuração do projeto e da validação das regras/índices. Sem configuração, o jogo mantém salvamento e ranking locais. A validação econômica autoritativa do ranking no servidor ainda está pendente. Veja [FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md).

## 🛠️ Tecnologias usadas

| Tecnologia | Uso no projeto |
| --- | --- |
| JavaScript com módulos ES | Regras, simulação, IA e interface |
| Phaser 3 | Mapa, câmera, interação e renderização do jogo |
| Vite | Servidor de desenvolvimento e build |
| HTML e CSS | Menus, formulários, painéis e interface responsiva |
| IndexedDB | Persistência local de campanhas, perfis e ranking |
| Firebase Authentication / Cloud Firestore REST | Integração preparada para identidade anônima, saves e ranking em nuvem |
| Vitest e fake-indexeddb | Testes automatizados de regras e persistência |
| Playwright Core com Google Chrome | Verificação de fluxos e interface no navegador |
| Node.js e npm | Ferramentas e gerenciamento de dependências |
| GitHub Actions | Verificação do repositório, testes e build |

## 💻 Executar o projeto localmente

Use **Node.js 24** e npm. Após clonar o repositório:

```sh
npm ci
npm start
```

No Windows, também é possível abrir **INICIAR_JOGO.cmd**. Se o PowerShell bloquear `npm.ps1`, utilize `npm.cmd` nos comandos.

O jogo abre em **http://127.0.0.1:5173/**. Mantenha o servidor aberto e encerre com Ctrl+C. O iniciador reutiliza um servidor deste projeto ou informa se a porta está ocupada. Para iniciar apenas o servidor, use `npm run dev`.

Para preparar Firebase, copie `.env.example` para `.env.local` e siga a documentação. Não envie chaves privadas de contas de serviço ao Git. Variáveis `VITE_*` são públicas no código do navegador.

### Verificar e gerar o build

```sh
npm run check:repo
npm test
npm run build
```

O build fica em `dist/`, ignorado pelo Git. O editor interno está disponível em `/editor.html` apenas no desenvolvimento e fica fora do build do jogador. O GitHub Actions verifica o projeto em pushes e pull requests; não publica o site automaticamente.

Para os testes de navegador, tenha Google Chrome instalado e um servidor em execução:

```sh
npm run dev -- --port 5174
```

Em outro terminal:

```sh
node scripts/qa-ai-strategy.mjs
node scripts/qa-finances-supplies.mjs
node scripts/qa-owned-management.mjs
```

Os scripts usam contextos isolados. A variável `QA_URL` permite indicar outro endereço.

### Estrutura do repositório

```text
assets/           Imagens e ícones
src/data/         Regras e cadastros do mapa
src/domain/       Simulação, economia, IA e testes de regras
src/map/          Mapa, câmera e apresentação territorial
src/ui/           Gestão e painéis do jogador
src/persistence/  IndexedDB e integração Firebase
scripts/          Inicialização, conferências e QA
.github/          Automação do GitHub Actions
docs/             Especificações, decisões e evidências
```

## 📚 Documentação e desenvolvimento

- [Especificação mestre](docs/CODEX_MASTER_SPEC.md)
- [GDD](docs/GDD.md)
- [Roadmap e pendências](docs/ROADMAP.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Economia e balanceamento inicial](docs/BALANCEAMENTO_INICIAL.md)
- [Valores vigentes](docs/ECONOMIA_ATUAL.md)
- [Funcionamento da IA](docs/IA_ATUAL.md)
- [Configuração Firebase](docs/FIREBASE_SETUP.md)
- [Critérios de implementação por fase](docs/FEATURE_MATRIX.md)

Valores apresentados refletem a implementação atual e podem evoluir durante o desenvolvimento. A campanha rural está integrada; novas regiões e demais fases do mestre continuam no roadmap. As duas cópias de `CODEX_MASTER_SPEC.md` devem permanecer idênticas. Este repositório não presume uma licença de redistribuição para código ou artes sem definição expressa.

## 🎬 Demonstrações de gameplay

### 1. Fazenda, leite e produção de queijo

![Gameplay 1 — produção de queijo](https://portifolio-denilsom-lobo.web.app/images/git_hub_imgs/imp_quei_01.png)

### 2. Lojas, vendas e gestão financeira

![Gameplay 2 — vendas e gestão](https://portifolio-denilsom-lobo.web.app/images/git_hub_imgs/imp_quei_02.png)

### 3. Capangas e disputa pelo território

![Gameplay 3 — disputa territorial](https://portifolio-denilsom-lobo.web.app/images/git_hub_imgs/imp_quei_03.png)

## 🌐 Jogue no navegador

 **LINK DO SITE PARA JOGAR:** 
[🧀 Jogar Império do Queijo](https://portifolio-denilsom-lobo.web.app/games/Imperio_do_queijo/play/)
