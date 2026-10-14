# Controle de lojas, coleta e combate — 14/10/2026

Diretriz atual substitui as instruções anteriores sobre arte física imutável **somente para as lojas**: posições, objetos e IDs continuam fixos; textura passa a seguir proprietário real. Aliada Ponto_de_venda_aliado.png; rival Ponto_de_venda_inimiga.png; neutra Ponto_de_venda_neutro.png. Compra atualiza loja/posto juntos. Bandeira provisória quando não há equipe; equipe alocada substitui a bandeira, inclusive quando ocupada/em recuperação. Estrelas usam placa madeira/dourado. Não mostrar bandeira e tropa simultâneas.

Usuário confirmou manter cinco lojas iniciais rivais, oito neutras e a barraquinha inicial do jogador. Derrota em combate sempre neutraliza loja/posto; não transfere propriedade nem deixa loja aliada com posto inimigo. Neutros são comprados por jogador ou IA, debitando R$ 400 reais do caixa simulado. Inimigo também não pode atacar neutros para adquiri-los. IA compra um neutro próximo por ciclo de decisão após ativação da agressividade, respeitando caixa e alcance.

Mapa mostra nomes e ícones, sem contadores de leite, queijo ou dinheiro. Quantidades reais nos painéis de propriedade/gestão. Coleta aparece a partir de 1 L agregado, 1 queijo pronto ou R$ 1 no caixa; clique transfere até capacidade e preserva excedente. Usa icon_leite.png/icon_queijo.png/icon_money.png. Posicionamento das indicações da captura em collectorPosition, incluindo lateral da fábrica inicial e pontos indicados. Ícones attack/defense usam icon_ataque.png/icon_defesa.png dos assets fornecidos; aparecem em origem/alvo durante missão ou incidente pendente, somem na resolução. Inventário 55 PNGs, cinco novos ícones fornecidos pelo usuário; nenhuma imagem foi gerada nesta revisão.

## Regras atuais de batalha

Ataque = quantidade × fator de estrelas × (1 + nível de arma × 0,12) × moral. Estrelas: 1/1,4/1,9. Defesa = quantidade × fator de estrelas × moral × (1 + nível de barricada × 0,15). Armas influenciam ataque; barricadas defesa. Equipes ocupadas, em recuperação ou sem moral não têm força disponível. Probabilidade = limitar(50 + 40 × (ataque − defesa)/(ataque + defesa), 5, 95); se ambas forças zero, 50%. Forças iguais dão 50%. Sorteio feito no resultado da missão; não é vitória garantida por investimento.

Custo por ataque R$ 50; alcance 800 unidades de mapa; duração 60 segundos simulados; cooldown 120 segundos; recuperação do derrotado 300 segundos. Velocidade da partida afeta o tempo simulado. Equipes derrotadas seguem recuperação e realocação/reserva, sem duplicação. Resultado em relatórios. Incidentes offline são pendentes para resolver no retorno.

## Verificação e continuidade

39 testes passaram em oito arquivos, incluindo limiares de coleta, artes por proprietário, equipe ocupada substituindo bandeira, ícones por missão, neutralização sincronizada e compra paga pelo rival. QA Chrome produção/coleta/vendas, combate/save/reload, gestão e composição aprovado; build aprovado com aviso conhecido do bundle Phaser. QA específico reproduzível em scripts/qa-combat-indicators.mjs, capturas qa-combat-active.png/qa-combat-resolved.png. Continuar pessoal/automação, contabilidade/logística e campanha completa conforme ROADMAP, sem reduzir escopo.
