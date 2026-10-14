# Ajustes da captura anotada — 14/10/2026

Pedido: controles marcados em cinza neutros, imóveis do sul/oeste mais afastados, bandeira próxima a cada loja, eliminar caminhos sem destino e trocar a arte das ruas. Usuário autorizou criar outra estrada a partir da referência enviada na conversa.

## Resultado e continuidade

Espaço lógico 3000×2000, mesmo fundo paisagístico. Imóveis rurais distribuídos em diferentes alturas e distâncias, com a fazenda inicial ao sul, loja de vacas no acesso noroeste e quatro lojas neutras em locais distintos. Cadastro mantém 28 edifícios, 14 bandeiras e apenas um banco de nível 2. Lojas town sale-n1/sale-n2 são os dois controles cinza marcados.

Rede de caminhos gerada por pares de destinos em scripts/rebuild-rural-layout.mjs. Cada extremidade corresponde a um controle de loja ou à entrada de um edifício. Todas as construções pertencem a uma única rede conectada; lojas possuem pelo menos dois acessos. Removidos braços artificiais de esquina e pontas sem destino. Textura PNG repetida e rotacionada em TileSprite, sem alongar a imagem sobre a rua inteira. Todas as bandeiras mantêm círculo e proximidade da loja.

Migração layout 2→3 aplica uma vez a neutralidade de sale-n1/sale-n2 nos saves antigos. Preserva aquisições do jogador, dinheiro, tempo, estoque, caixa das lojas e demais territórios. Equipes inimigas desses locais retornam à reserva sem duplicação; missões nesses controles são encerradas e equipes liberadas. Partidas novas já começam com os controles neutros. A IA continua finita e pode disputar esses locais futuramente, pelas regras normais de combate; não há bandeira cinza falsa sobre propriedade inimiga. IDs permanecem estáveis.

Arte nova: assets/rural-dirt-road-v1.png, 2172×724 com transparência, ferramenta integrada image_gen. Referência: estrada de terra, pedras e bordas de grama enviada pelo usuário. Nenhum original substituído. Inventário atualizado para 50 PNGs. Preview reproduzível em docs/rural-map-complete.png pelo scripts/export-rural-map.mjs. Exportação continua isolada dos saves. Removidas duplicações de import/desenho de ruas do editor interno.

## Prompt final (modo integrado)

Use case: stylized-concept. Asset type: seamless game road texture strip with transparent background. Create one long straight horizontal country dirt road segment for a cozy colorful hand-painted isometric farming game. Warm golden ochre compacted soil center with subtle cart wheel ruts, a few small stones, soft irregular grassy verges with tiny white daisies along upper and lower sides. Beautiful painterly cartoon detail matching rustic farm buildings. Orthographic straight overhead texture, flat ground, no perspective extrusion. Wide rectangular 3:1 composition, road goes uninterrupted from left edge to right edge, no closed end caps. Left and right edges must match for tiling. Upper and lower grass edges fade naturally into actual transparent background, road itself opaque. The road occupies central 65 percent of image height. No buildings, people, flags, labels, borders, black background, UI or extra objects. One road strip only, not a sprite sheet.

## Validação

35 testes passaram em sete arquivos: rede conectada, extremidades com destino, círculo/loja vinculados, quantidades por distrito e migração idempotente preservando recursos/equipes/aquisições. QA visual e funcional do Chrome e build registrados no ROADMAP. A campanha completa continua em desenvolvimento; próxima fase mantém pessoal/automação, bancos/contabilidade e logística real.
