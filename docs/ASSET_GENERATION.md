# Cenário rural aberto — 14/10/2026

Ferramenta: image_gen integrada, sem fallback CLI/API. Uso: stylized-concept, fundo bitmap para composição com os PNGs existentes.

Arquivo final: `assets/mapas/rural-open-v1.png` (1536×1024), exibido em espaço lógico 2400×1600. Novo arquivo; os cinco cenários antigos permanecem no catálogo como referências. Metadados/SHA-256 em assets-inventory.json.

## Prompt final

Use case: stylized-concept. Asset type: landscape background plate for Brazilian cartoon isometric cheese tycoon game. Create a polished colorful 2D isometric game terrain background, wide landscape 1536x1024. Cheerful hand painted 3D-like cartoon game art, warm sunlight, lush emerald grass, soft shadows, natural dirt footpaths, same rich whimsical rustic farm asset aesthetic. CRUCIAL: keep 85% of the interior as very broad uninterrupted flat grass for placing separate large building sprites. No buildings, no houses, no markets, no cows, no flags, no fixed rectangular slots, no fences, no text, no UI, no icons. Minimal quiet terrain. Trees, rocks, a small stream and flower patches only around the outermost 8% border, not the centre. Top right quadrant transitions to a broad muted terracotta red dry grass district for enemy building placement, still flat empty terrain, no fortress, no fire. South bottom third lush green farm land, middle central area open grassy village plain. A few understated pale dirt paths cross diagonal isometric orientations but do not divide into dense grid. Flat nonperspective background for software sprite compositing, no horizon, no sky, no tiltshift, no tiny dense details. Map must be attractive but visually subordinate to separate building sprites. Fully opaque landscape image.

## Verificação

Imagem examinada: gramado central livre, margem decorada, área vermelha a nordeste, sem edifícios incorporados. Copiada para workspace e integrada aos registros de região/mapa. Capturas do jogo examinadas em 1900×1080 e 1366×768. Construções e círculos são definidos no JSON e sobrepostos como sprites separados.

## Cenário rural atualizado

Novo asset assets/mapas/rural-village-v2.png gerado pela ferramenta integrada image_gen, preservando as referências originais. Prompt final completo e parâmetros em RURAL_MAP_V2.md.
