# Condições de campanha e equipes — 14/10/2026

Diretriz atual do usuário substitui o indicador visual de estrelas: nível representado por capangas_aliado_nivel_1/2/3 e capangas_inimigos_nivel_1/2/3. Estrelas removidas do mapa e menus, atributo interno stars preservado para compatibilidade e cálculo. Nível 3 usa cópia sem edição dos dois trios de veteranos já fornecidos; originais preservados e aliases registrados no inventário (57 PNGs).

Agência de capangas vende equipes de três integrantes nível 1/2/3 por R$ 250/550/1.150, valores derivados de contratação + custos acumulados de evolução existentes. Selecionar posto próprio e nível na agência; débito real, alocação exclusiva e salários existentes. Botão de contratar no posto encaminha à agência. Evolução/armas/barricadas já funcionais preservadas.

Ícones de coleta sempre centralizados acima da propriedade. Removidas exceções laterais da captura anterior. Arte de ataque/defesa continua sobre o posto durante a missão. Nome no mapa, recursos nos menus.

## Vitória e derrota efetivas

Controlar = possuir loja e posto vinculados, não neutralizar ou somente atacar. Todos os 14 pontos (incluindo loja inicial e neutros) devem pertencer à empresa; neutros impedem liberação. Nenhum serviço público ou terreno decorativo participa.

Jogador controla 14/14: fazenda e fábrica inimigas tornam-se compráveis, mesmo ainda pertencendo ao rival. Preços por nível usados realmente: fazenda R$ 2.500 × nível, fábrica R$ 4.000 × nível. Comprar ambas mantendo controle integral encerra a campanha com victory. Comprar somente uma não vence.

Rival controla 14/14: fazenda do Seu Zé torna-se comprável. IA tenta comprar pelo mesmo comando com caixa finito; somente compra efetiva encerra campanha com defeat. A sequência interpreta o pedido do usuário como liberação territorial seguida de compra final; não declarar derrota antecipada quando o rival não pode pagar. Até a aquisição final, combate/recuperação territorial continuam possíveis. O jogador perde após compra de sua fazenda; não é preciso comprar sua fábrica.

Resultado persistido em campaign.outcome/finishedAt, banner explica objetivo e encerramento. Relógio/produção/IA/ações param após resultado, missões e incidentes pendentes são encerrados e equipes liberadas. Consulta aos menus e salvamento continuam disponíveis. IndexedDB mantém vitória/derrota no reload.

## Reinício solicitado

src/data/session-reset.json registra requested-reset-2026-10-14-01. No próximo carregamento, campanha sem esse marcador é substituída por createGame e salva imediatamente. Ação explicitamente autorizada pelo usuário. Reset ocorre uma vez; createGame inclui o marcador, compras/progresso novos sobrevivem ao reload. Não alterar marcador em tarefas futuras sem novo pedido de reinício. Origem oficial continua http://127.0.0.1:5173 via INICIAR_JOGO.cmd.

## Verificação e continuidade

43 testes passaram em nove arquivos, com gates 14/14, vitória após ambas compras, derrota após compra rival, IA efetiva, interrupção pós-resultado e preço/nível 3. QA campanha no Chrome: reset único, compras persistidas, aquisição final nos menus, vitória/derrota após reload. QA cadeia produtiva/coleta/combate/gestão preservado; build aprovado. Capturas docs/qa-campaign-victory.png e qa-campaign-defeat.png; script scripts/qa-campaign.mjs usa armazenamento isolado de teste.

Esta é a condição de encerramento da campanha rural solicitada agora, não a declaração de conclusão de todo o mestre. Outras regiões, pessoal/automação completos, bancos/contabilidade, logística/pesquisa, cloud/ranking e balanceamento integral continuam pendentes. A condição anterior de sete dias/lucro/territórios globais fica histórica para o final rural: novo pedido tem precedência. Não apagar requisitos restantes do mestre.
