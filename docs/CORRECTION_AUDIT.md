# Auditoria das correções

Pedido integral em CORRECOES_SOLICITADAS.md. Mestre/arquitetura relidos; última instrução prevalece: propriedades físicas fixas, controle/equipes/indicadores variáveis. Balanceamento adicional autorizado pelo usuário e documentado em BALANCEAMENTO.md.

| Divergência | Correção |
|---|---|
| Apenas editor com registros vazios | Partida abre na zona rural com fazenda/queijaria/barraquinha, 14 vendas, 14 controles e 21 terrenos |
| Sem organização territorial | Layout manual nas coordenadas do PNG: 5 inimigos no norte vermelho, início ao sul, 8 neutros |
| Controle e edifício confundidos | Sprites/geometry do layout fixo, estado econômico/territorial separado |
| Sem menus de partida | Menus específicos; editor preservado em editor.html e independente da campanha |
| Sem leite real | Produção automática consumindo ração; acumulado na fazenda; transferência com limite |
| Sem fábricas | Cinco receitas, leite/embalagem, linha exclusiva, maturação, estoque pronto e status visual |
| Sem comércio real | Vendedor, demanda/capacidade, dinheiro na loja, coleta e faturamento sem duplicação |
| Sem coleta visual | Ícones condicionais executam as mesmas ações reais dos menus |
| Sem controle ou combate | Compra, vínculo loja/posto, equipe, estrelas, upgrades, alcance, custo, missões, RNG, cooldown e recuperação |
| Rivais decorativos | Rival rural com caixa e insumos finitos, produção/vendas e expansão progressiva |
| Sem salvamento | IndexedDB versionado, saves seriados por ação e a cada 15 s, reload e offline limitado |
| Iniciador mudava origem e separava saves | npm start usa 5173 fixa e reutiliza servidor do mesmo projeto |

## Verificação

Testes cobrem mapa/imutabilidade, cadeia econômica, limites, maturação, demanda, relógio, combate, neutralização/compra, recuperação, IA e offline. Adapter IndexedDB verificado com fake-indexeddb.

QA no Chrome pelo terminal: cliques em ícones/propriedades, leite → queijo → venda → coleta; compra/equipe/promoção/armamento/ataque; salvar/recarregar sem pageerrors. Script scripts/qa-browser.mjs usa contexto isolado e relógio controlado, sem alterar campanha do usuário. Capturas qa-rural-map.png e qa-rural-reloaded.png.

## Pendências

Correções integradas na zona rural. Quatro regiões restantes ainda exigem cadastro/integração. Serviços pintados no centro rural permanecem decorativos até sua fase; não recebem botões fictícios. Editor permite ajustar/exportar cadastro, mas não modifica partida em andamento. Nível 3 usa arte de nível 2 com três estrelas até validação de asset específico.

Permanecem obrigatórios: construções/níveis superiores, funcionários/automação completos, mercados e marketing, finanças patrimoniais/bancos, logística/exportação, pesquisa/reprodução, demais rivais, tutorial/capítulos/vitória, Auth/cloud/ranking e balanceamento final. Não declarar campanha completa.
