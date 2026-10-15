# Regras ativas da zona rural

Fonte única: `src/data/game-rules.js`, regras `rural-0.2`, dinheiro em centavos. O usuário autorizou valores iniciais ajustáveis para lacunas em 13/10/2026. Os valores são usados efetivamente pelo jogo.

## Mantido do mestre

Atualização 14/10/2026: fazendas neutras custam R$ 2.500 × nível e fábricas R$ 4.000 × nível; começam vazias, sem insumos ou vacas gratuitos. Capacidade 5/12/25/50, linhas 1/2/4/6 e maturação 20/60/160/350 conforme nível, seguindo o mestre. Serviços centrais são públicos e não entram nas propriedades possuídas. Alcance continua 800 unidades; o início ao sul agora fica afastado dos inimigos.

R$ 1.500, uma Magrela, 10 L fracos, 10 embalagens e 5 Minas Frescal Ruim. Magrela 8 L/3 rações por dia, R$ 500; Mimosa 16 L/5, R$ 1.800; Premiada 25 L/8, R$ 6.000. Fazenda nível 1: cinco vacas. Sem ração inicial gratuita; comprar insumo para produzir.

Cinco receitas e tempos/preços/maturações da seção 8, uma linha e maturação 20. Lote de uma unidade consome uma embalagem; leites separados, sem mistura. Qualidade permanece no ID do produto. Preços atuais usam preço-base por receita; multiplicadores de qualidade e política global de preços seguem pendentes.

Vendedor iniciante: contratar R$ 150, salário R$ 35/dia, máximo 20 vendas/dia. Seu Zé é o vendedor inicial. Uma venda a cada três minutos em 1×, somente com estoque, demanda e capacidade no caixa. Receita ocorre na venda; coleta transfere saldo sem duplicar receita.

Um dia = 60 minutos reais em 1×, com 2×/4× sobre todo o scheduler. Offline em 1× até oito horas; ataques ficam pendentes e IA não inicia conquista offline.

Combate: equipe de três, estrelas 1/1,4/1,9; armamento +12% e barricada +15% por nível, máximo 3. Fórmula `clamp(50 + 40 × (A−D)/(A+D), 5, 95)`. Zero/zero = 50%, mas ataque exige equipe com força positiva. Defesa não recebe bônus ofensivo de armamento. RNG apenas na resolução, com estado persistido.

## Valores autorizados para lacunas

| Parâmetro | Valor |
|---|---|
| Ração / embalagem | R$ 2 / R$ 1 por unidade |
| Ponto neutro | R$ 400 |
| Equipe de três capangas / salário diário | R$ 250 / R$ 50 |
| Promoção 1→2 / 2→3 | R$ 300 / R$ 600 |
| Armamento / barricada por nível | R$ 200 |
| Missão | R$ 50 e 60 segundos em 1× |
| Recuperação / cooldown | 5 / 2 minutos de simulação |
| Alcance | 800 pixels do mapa original |
| Leite na fazenda / fábrica | 100 L por local |
| Queijo na fábrica / loja | 40 unidades por local |
| Saldo máximo na loja | R$ 1.000 |
| Caixa inicial rival | R$ 15.000 antes das equipes iniciais |
| Ciclo de IA / início de agressão | 3 minutos / após dois dias |

Moral normal = 1; dia não pago reduz 0,5, equipe abandona após três salários consecutivos não pagos. Pagamento recupera 0,25 até 1. Equipes em reserva também recebem salários. Vendedor sem salário suspende vendas até próximo pagamento diário.

Vitória contra jogador/inimigo neutraliza ponto, preserva edificio/barricadas e interrompe vendedor. Jogador compra neutro e contrata vendedor/equipe. Rival pode atacar e ocupar neutro. Defensor derrotado recupera em posto livre ou reserva, sem morte permanente.

Transferência manual rural é instantânea entre propriedades da mesma empresa, limitada pela capacidade e preservando excedente na origem. Transporte com tempo, veículos, combustível e escolta permanece na fase 13.

Relatório atual: vendas, gastos e saldos. **Vendas menos gastos não é lucro líquido contábil**. Valorização de estoques, capitalização, patrimônio, bancos e juros permanecem na fase 8; esse indicador não decide vitória.

## Revisão da fazenda — 14/10/2026

Instrução posterior da captura: ração opcional. Sem ração a vaca produz metade; com ração suficiente mantém produção total; ração parcial produz proporcionalmente entre 50% e 100%. Consumo continua por espécie (3/5/8 ao dia). Compra aceita quantidade 1–1000 a R$ 2 cada, saldo real.

Vacas podem ser realocadas entre fazendas da mesma empresa com vagas. Venda rende 70% do preço e exige três dias de jogo desde aquisição; realocação não reinicia nem remove bloqueio. Saves anteriores não têm data individual: migração inicia prazo de três dias a partir do tempo salvo, sem apagar progresso. Vacas iniciais de novas campanhas contam desde dia 1. Proporção 1 L/dia e 1 L/queijo aguarda esclarecimento de abrangência.

## Regra vigente de litros e ração — 14/10/2026

Substitui consumos/produtividades anteriores: todas as vacas produzem 1 L por dia alimentadas, 0,5 L/dia de progresso sem ração. Ração por vaca/dia: Magrela 10, Mimosa 20, De Luxo 40, Radioativa 80, Mágica 100. De Luxo usa ID noble e imagem vaca_premiada.png, preservando saves.

Queijo Fraco/Comum/Nobre/Radioativo/Mágico: cada unidade exige 1 L do leite de mesma origem + uma embalagem; tempos 2/3/4/5/8 minutos, preços R$ 25/42/65/95/160. Receitas simplificadas novas sem etapa de maturação; lotes antigos preservam seus tempos de fabricação/maturação. Estes são os parâmetros centralizados para a revisão solicitada, não valores redefinidos no renderer. Receitas antigas ficam disponíveis somente para leitura de saves e não podem iniciar novos lotes.

Estoques e coleta trabalham com litros inteiros; milkProgress preserva andamento fracionário sem exibir mililitros. Migração separa frações já existentes sem apagá-las; coleta agrega progresso residual quando há espaço e somente libera novo litro ao completar a unidade. Descoberta persiste; espécies especiais continuam exigindo pesquisa própria.


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


## Premiada, economia e retaliação — 14/10/2026
Mimosa custa R$ 1.250 e Queijo Comum vende por R$ 50/unidade. Renomear De Luxo/Premiada para apenas Premiada na interface, preservando ID noble e PNG vaca_premiada; compra R$ 2.500 e Queijo Nobre vende por R$ 100. Fazenda nível 2 custa R$ 5.000 (fórmula existente R$ 2.500 × nível 2) e aceita 20 vacas.
Quando atacante perde, paga ao defensor vencedor conforme nível da equipe defensora: 1=R$ 50, 2=R$ 100, 3=R$ 150; mesma regra para IA e jogador. Não executar contra-ataque remoto. Prêmio é transferência real entre empresas, separado do custo de missão, despesa do perdedor e receita do defensor. Se faltar caixa, transferir disponível e persistir dívida restante, quitada ao entrar saldo nos ticks seguintes sem saldo negativo nem dinheiro criado. Somente resolver a compensação no resultado definitivo; incidentes offline pendentes não pagam antes da resolução. Mostrar regra/valor no menu de capangas e registrar resultado/ledger.


## Revisão de custos de expansão — 14/10/2026
Fazenda nível 2 custa R$ 30.000 e comporta 30 vacas; demais níveis preservados. Preço específico de nível 2 centralizado e compartilhado entre compra e menu, sem multiplicar R$ 30 mil pelo nível. Banco nível 1 contratação R$ 9.000, mantendo taxa e limite. Transportadora contratação R$ 15.000, manutenção R$ 300/dia. Equipe de capangas nível 2 contratação R$ 3.000 e manutenção R$ 50/dia; nível 3 contratação R$ 9.000 e manutenção R$ 100/dia; nível 1 preservado.
Armamento e barricada têm preços por melhoria comprada: 0→1 R$ 125, 1→2 R$ 1.500, 2→3 R$ 3.500. São custos incrementais (total R$ 5.125 por sequência completa), não preço fixo nem total acumulado. Preservar bônus e máximo de três níveis. Exibir e cobrar a mesma tabela; atualizar valor após cada compra, bloquear nível máximo. Novos preços valem para compras/manutenções futuras, sem reset, reembolso nem substituição de níveis já comprados.


## Banco 2 e produtos raros — 14/10/2026
Banco nível 2 custa R$ 60.000 para contratar; taxa diária de 2% e coleta sem limite preservadas. Vaca Radioativa custa R$ 18.000 e Queijo Radioativo vende por R$ 200/unidade. Vaca Mágica custa R$ 36.000 e Queijo Mágico vende por R$ 400/unidade. Preservar consumo, produção, tempos, descoberta e demais regras. Aplicar valores às compras e vendas futuras, inclusive estoque existente, sem reset nem reembolso retroativo.


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
