# Inventário de assets

Atualização 14/10/2026: **48 PNGs no catálogo**, incluindo os 47 fornecidos preservados e o novo `rural-open-v1.png`. Banco/agências/loja de vacas/transportadora e quatro variantes de fazenda/fábrica estão cadastrados no mapa. Itens, variedades e tropas aparecem no catálogo; os trios são usados como arte de três estrelas. Prompt e procedência em ASSET_GENERATION.md. Dimensões, formato, bytes e SHA-256 em assets-inventory.json. Os originais foram preservados.

| ID | Arquivo | Dimensões | Canal alfa |
|---|---|---|---|
| 1 | agencia_capanga_nivel_1.png | 1254 × 1254 | True |
| 2 | agencia_funcionario_nivel_1.png | 1254 × 1254 | True |
| 3 | banco_nivel_1.png | 1254 × 1254 | True |
| 4 | banco_nivel_2.png | 1254 × 1254 | True |
| 5 | bandeira_capanga_aliado.png | 511 × 719 | True |
| 6 | bandeira_capanga_inimiga.png | 519 × 719 | True |
| 7 | bandeira_capanga_neutra.png | 511 × 719 | True |
| 8 | Cálice de Leite Radioativo Neon.png | 1254 × 1254 | True |
| 9 | capangas_aliado_nivel_1.png | 588 × 594 | True |
| 10 | capangas_aliado_nivel_2.png | 1254 × 1254 | True |
| 11 | capangas_inimigos_nivel_1.png | 604 × 569 | True |
| 12 | capangas_inimigos_nivel_2.png | 1254 × 1254 | True |
| 13 | countryside-v10.png | 1536 × 1024 | False |
| 14 | countryside-v6.png | 2176 × 1024 | False |
| 15 | countryside-v7.png | 1536 × 1024 | False |
| 16 | countryside-v8.png | 1536 × 1024 | False |
| 17 | countryside-v9.png | 1536 × 1024 | False |
| 18 | fabrica_de_queijo_inicial.png | 1254 × 1254 | True |
| 19 | fabrica_de_queijo_inimigo_nivel_1.png | 1254 × 1254 | True |
| 20 | fabrica_de_queijo_nivel_1.png | 1254 × 1254 | True |
| 21 | fabrica_de_queijo_nivel_2.png | 1254 × 1254 | True |
| 22 | fazenda_inicial_seu-ze.png | 1254 × 1254 | True |
| 23 | fazenda_inimigo_1.png | 1254 × 1254 | True |
| 24 | fazenda_nivel_1.png | 1254 × 1254 | True |
| 25 | fazenda_nivel_2.png | 1254 × 1254 | True |
| 26 | leite_comum.png | 1254 × 1254 | True |
| 27 | leite_fraco.png | 1254 × 1254 | True |
| 28 | leite_magico.png | 1254 × 1254 | True |
| 29 | leite_nobre.png | 1254 × 1254 | True |
| 30 | loja_de_vacas_nivel_1.png | 1254 × 1254 | True |
| 31 | Ponto_de_venda_aliado.png | 1254 × 1254 | True |
| 32 | ponto_de_venda_inicial_seu_ze.png | 1254 × 1254 | True |
| 33 | Ponto_de_venda_inimiga.png | 1254 × 1254 | True |
| 34 | Ponto_de_venda_neutro.png | 1254 × 1254 | True |
| 35 | queijo_comum.png | 1254 × 1254 | True |
| 36 | queijo_fraco.png | 1254 × 1254 | True |
| 37 | queijo_magico.png | 1254 × 1254 | True |
| 38 | queijo_nobre.png | 1254 × 1254 | True |
| 39 | queijo_radioativo.png | 1254 × 1254 | True |
| 40 | transportadora_nivel_1.png | 1254 × 1254 | True |
| 41 | Trio de Bandoleiros Mascarados em Combate.png | 1254 × 1254 | True |
| 42 | Trio de Mercenários Mascarados do Oeste.png | 1312 × 1199 | True |
| 43 | vaca_magica.png | 1305 × 1205 | True |
| 44 | vaca_magrela.png | 1304 × 1206 | True |
| 45 | vaca_mimosa.png | 1305 × 1206 | True |
| 46 | vaca_premiada.png | 1305 × 1206 | True |
| 47 | vaca_radioativa.png | 1305 × 1205 | True |

## Análise visual

- 5 cenários: countryside-v6 a v10. Contêm construções e decorações incorporadas à arte; não devem representar propriedades dinâmicas. A vinculação inicial a regiões é provisória e exige revisão no editor.
- 18 edifícios e pontos comerciais: 4 fazendas, 4 fábricas, 4 pontos de venda, 2 bancos, 2 agências, loja de vacas e transportadora.
- 3 bandeiras: azul, vermelha e cinza.
- 6 imagens de grupos armados: aliados/inimigos níveis 1 e 2 e dois trios adicionais. Não inferir estrelas dos trios sem validação.
- 5 vacas: magrela, mimosa, premiada, radioativa e mágica.
- 5 leites: fraco, comum, nobre, mágico e cálice radioativo.
- 5 queijos: fraco, comum, nobre, radioativo e mágico.
- Escala, recorte e ancoragem variam; largura e posição visual são configuráveis por terreno.
- Canal alfa existe nos 42 PNGs não usados como mapas; isso não significa que todos os pixels do fundo sejam transparentes.

## Lacunas

Não há sprites separados de laboratório, veículos, mercados superiores, funcionários individuais, logo, efeitos ou edifícios níveis 3/4. Também faltam bandeiras específicas roxa, laranja e preta e identificação confirmada de capangas 3 estrelas. Registrar placeholders apenas quando esses sistemas forem implementados; não substituir os assets existentes.

## Limitação dos mapas

Os mapas são ilustrações completas, não conjuntos de tiles. A arte possui edifícios estáticos que não podem mudar de proprietário ou nível. A etapa territorial deve validar cada polígono manualmente e decidir como tratar esses elementos antes de iniciar a campanha. Não tornar edifícios pintados clicáveis sem cadastro correspondente.

Atualização 14/10/2026: 49 PNGs. rural-village-v2.png é o fundo ativo; os 47 originais e rural-open-v1.png estão preservados. Metadados/hashes em assets-inventory.json; prompt e procedência em RURAL_MAP_V2.md.

Revisão posterior: **50 PNGs**, incluindo rural-dirt-road-v1.png (2172×724, transparência) para as ruas. Prompt final e integração em RURAL_MAP_V3.md; nenhuma referência original removida.

Atualização de ícones: **55 PNGs**, com icon_money.png, icon_leite.png, icon_queijo.png, icon_ataque.png e icon_defesa.png fornecidos pelo usuário e integrados à partida. Hashes/dimensões registrados; categoria icon e origem usuário, sem atribuir geração destes arquivos à ferramenta.
