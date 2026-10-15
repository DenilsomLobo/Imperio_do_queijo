# Organização dos assets

57 PNGs organizados por uso, sem edição dos arquivos.

- construcoes/fazendas: fazendas.
- construcoes/fabricas: queijarias e fábricas.
- construcoes/lojas: barraca inicial e pontos aliados, inimigos e neutros.
- construcoes/servicos: bancos, agências, transportadora e loja de vacas.
- producao/vacas, producao/leites, producao/queijos: cadeia produtiva.
- seguranca/bandeiras, seguranca/capangas: controle e equipes.
- mapas: cenários; mapas/estradas: textura das vias.
- icones: coleta e combate.

Os nomes dos arquivos são IDs estáveis. src/data/asset-paths.json relaciona cada nome ao caminho relativo nesta pasta. src/data/assets.js resolve as URLs para jogo, editor e preview. docs/assets-inventory.json registra caminho, dimensões e hash para todos os PNGs. Ao acrescentar/mover imagem, atualize os dois manifestos e execute os testes.

Barraquinha inicial: construcoes/lojas/ponto_de_venda_inicial_seu_ze.png. Bandeira inicial: seguranca/bandeiras/bandeira_capanga_aliado.png. Demais lojas do jogador: construcoes/lojas/Ponto_de_venda_aliado.png.

Atualização de pessoal: total 60 PNGs; funcionario_nivel_1/2/3.png em pessoal/funcionarios. Bandeira inicial é substituída pela equipe alocada, conforme regra posterior.

Menu superior: oito SVGs provisórios em icones/menu-temporario (inventário separado em docs/menu-icons-inventory.json). Para trocar por imagens do usuário, coloque o PNG/SVG na pasta correspondente e atualize somente src/data/menu-icons.json. Mantenha IDs properties/employees/milk/cheese/cows/revenue/cash/enemies; registre PNG novo no inventário geral se acrescentado.
