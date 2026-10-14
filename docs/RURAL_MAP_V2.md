# Zona rural: cidadezinha e plantações — 14/10/2026

Pedido final: apenas um banco de nível 2. Usados os PNGs originais dos edifícios, sem gerar substitutos. Fundo novo `assets/rural-village-v2.png`; geração pela ferramenta integrada image_gen. Fundo anterior preservado. Inventário: 49 PNGs.

| Distrito | Edifícios | Lojas e bandeiras |
|---|---|---|
| Cidadezinha | Fábrica nível 2, transportadora, duas agências, banco nível 1 e banco nível 2 | 2 inimigas e 3 neutras |
| Sul/oeste | Fábrica inicial e nível 1, fazenda inicial e níveis 1/2, loja de vacas | 1 inicial aliada e 4 neutras |
| Norte sombrio | Fazenda e fábrica inimigas | 3 inimigas e 1 neutra |

Total: 28 edifícios e 14 bandeiras. Cada loja possui controle em uma esquina cadastrada. Bandeiras mantêm tamanho visível mesmo com equipe; tropas ficam ao lado. IDs, saves, recursos e domínio existentes preservados. A geografia permanece fixa durante a partida; ownership continua dinâmico. District é metadado visual, não concessão de recursos ou propriedade.

`scripts/rebuild-rural-layout.mjs` reproduz posições e caminhos; `scripts/export-rural-map.mjs` exporta `docs/rural-map-complete.png` em 2400×1800 pelo Chrome. `map-preview.html` é ferramenta local de exportação, com estado inicial isolado e sem escrita/carregamento de salvamentos, excluída do build público. Jogo continua aberto por INICIAR_JOGO.cmd.

Plantações do fundo são paisagismo; não contam como estoque ou sistema agrícola novo. Serviços conservam as capacidades reais já implementadas. Continuação: pessoal/automação, bancos/contabilidade, logística e campanha conforme ROADMAP.

## Prompt final do fundo (modo integrado)

Use case: stylized-concept. Asset type: background terrain for an isometric farming strategy game. Create a beautiful detailed hand-painted cozy farming RPG landscape, warm storybook 3D cartoon illustration like classic farming life games, landscape 3:2. Orthographic elevated isometric view, no horizon. This is ONLY terrain; existing buildings will be composited separately. A lush green countryside at southwest with golden wheat, neat vegetable rows, flower borders, wooden fences, orchard trees and a winding turquoise brook near outer western and southern edges. At center and eastern middle, a spacious bright village clearing with a few small flower beds and trees, mostly unobstructed grass and pale earth, ample room for 12 separate buildings and roads added by the engine. Across the northern quarter, a clearly darker ominous mafia plantation: muted olive and rusty terracotta soil, dark planted rows, sparse crooked trees, rocky wooded northern boundary, no dramatic black void. Keep northern central clearings usable for six buildings. Southwest building clearing at x10-35% y55-90%, center village clearings x40-80% y40-75%, northern clearings x40-80% y15-35%. Landscape surrounds placement areas gracefully; richly textured but visually readable at small scale. Consistent sunlight from upper left. Do not draw ANY buildings, houses, stalls, flags, characters, cows, text, UI or icons. No large roads or rigid grid; roads will be overlaid in the game. Full bleed terrain, no border. Make the center usable and open without looking empty, fields predominantly farther outward.
