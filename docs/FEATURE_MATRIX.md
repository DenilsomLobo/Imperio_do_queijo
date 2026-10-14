# Matriz de funcionalidades e critérios de conclusão

Todos os requisitos detalhados das seções 1–26 do mestre continuam obrigatórios. A matriz agrupa gates de aceitação; interface isolada não satisfaz nenhum gate de simulação.

| Fase | Escopo | Critério verificável | Estado |
|---|---|---|---|
| 1 | Auditoria | Todos os arquivos examinados; 47 imagens catalogadas/decodificadas; sistemas/dependências identificados | Concluída |
| 2 | Arquitetura e dados | GDD/mestre/matriz/roadmap; custos centralizados; domínio separado; estado versionado e relógio único | Parcial |
| 3 | Mapas/editor | Cinco regiões verificadas; arrastar/zoom; polígonos, seleção, sprites, IDs, profundidade; importar/exportar; terrenos e vínculos reais, 14 vendas rurais conferidas | Parcial |
| 4 | Fazendas/vacas | Compra/alocação respeitam caixa e vagas; produção consome ração; estoque e qualidade corretos | Pendente |
| 5 | Fábricas | Cinco receitas consomem leite/embalagem; linhas e maturação respeitam capacidade; queijo não pronto não vende | Pendente |
| 6 | Pessoal/automação | Contratação/demissão/realocação exclusiva, salários; políticas interrompem por recurso/orçamento/gerente | Pendente |
| 7 | Comércio | Reposição real; demanda finita, políticas globais, marketing; vendas finais locais sem duplicação | Pendente |
| 8 | Finanças | Ledger reconcilia caixa/receita/despesa/lucro/patrimônio; empréstimos finitos, juros e inadimplência | Pendente |
| 9 | Capangas | Três estrelas, custos, limites de upgrades; armamento/barricadas; ocupação e moral/salário | Pendente |
| 10 | Combate | Igualdade = 50%; chance limitada; RNG apenas na resolução; cooldown/custos/recuperação, transferência e visual persistidos | Pendente |
| 11 | Rivais | Empresas usam regras/estoques/caixa finitos; progressão impede conquista prematura indiscriminada | Pendente |
| 12 | Espionagem | Missões com custo/tempo/chance/ocupação; efeitos temporários; sem recursos ou desbloqueios gratuitos | Pendente |
| 13 | Logística/exportação | Estoque reservado e transportado uma vez; veículo/motorista/escolta exclusivos; contratos/prazos/perdas reconciliados | Pendente |
| 14 | Pesquisa/reprodução | Pré-requisitos/pontos/custo/vagas respeitados; espécies especiais só por pesquisa e protótipo único | Pendente |
| 15 | Campanha | Tutorial, capítulos, rivais e territórios obrigatórios; liderança, lucro e consolidação por 7 dias; confirmação e encerramento | Pendente |
| 16 | Conta/save/ranking | IndexedDB com migrações e roundtrip integral; offline até 8h em 1× sem perdas irreversíveis/vitória; Auth e regras privadas; cloud limitada; ranking idempotente só de concluídas | Pendente |
| 17 | Qualidade/publicação | Testes de todos os cálculos da seção 24; dois fluxos integrados obrigatórios; campanha do início ao fim; build, balanceamento, segurança e publicação verificados | Pendente |

Fluxos obrigatórios: vaca → alocação → leite → queijo → barraquinha → venda → despesas → salvar/recarregar; capangas → estrelas → armamento → ataque com barricada → chance → resolução → território → salvar. Adicionar regressões de relógio, velocidade, offline, recursos finitos e vitória. Critérios negativos (sem estoque, caixa, vaga ou equipe) também devem ser testados.

Atualização rural em 13/10/2026: fases 4–11 e 16 **parcialmente implementadas**, conforme ROADMAP e CORRECTION_AUDIT. Os dois fluxos obrigatórios possuem testes integrados reais na zona rural; gates amplos ainda exigem níveis/pessoal/mercados/finanças/IA/campanha/cloud completos. Para status atual por fase, prevalece ROADMAP. Nenhum teste local substitui o gate de campanha até vitória.
