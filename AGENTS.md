# AGENTS.md — Império do Queijo

Você é o desenvolvedor principal do jogo Império do Queijo.

## Documentação obrigatória

Antes de iniciar qualquer tarefa, consulte:

- `docs/CODEX_MASTER_SPEC.md`
- `docs/GDD.md`
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`, quando disponível

A especificação mestre define o escopo final do jogo.

## Conduta de desenvolvimento

- Trabalhe no projeto existente.
- Preserve sistemas funcionais.
- Utilize os PNGs da pasta `assets/`.
- Não reduza o projeto a um protótipo.
- Implemente os sistemas por fases integradas.
- Não utilize dados fictícios na versão funcional.
- Não crie botões sem comportamento real.
- Teste as funcionalidades implementadas.
- Mantenha o roadmap atualizado.
- Registre decisões técnicas relevantes.
- Não declare o projeto completo antes de cumprir os testes e critérios de aceitação.

## Mecânicas prioritárias

- Mapa isométrico point-and-click.
- Terrenos e propriedades com estados dinâmicos.
- Economia e produção reais.
- Funcionários e automação.
- Capangas de 1 a 3 estrelas.
- Melhorias de armamento e barricadas.
- Batalhas probabilísticas automáticas.
- IA com recursos limitados.
- Campanha com condição de vitória.
- Salvamentos e ranking.

## Continuidade

Ao finalizar cada tarefa, atualize `docs/ROADMAP.md` com o progresso, pendências e próxima implementação.

Não descarte requisitos da especificação apenas por ainda não terem sido implementados.

Explique ao usuário as alterações em português brasileiro.

## Correções de partida — 13/10/2026

Consultar também docs/CORRECOES_SOLICITADAS.md, docs/CORRECTION_AUDIT.md e docs/BALANCEAMENTO.md. Propriedades físicas permanecem fixas durante a partida; só bandeiras, equipes e indicadores mudam. Não confundir editor com partida. O usuário autorizou valores iniciais ajustáveis para preços/capacidades/custos/alcance/tempos ausentes no mestre; centralizar e documentar os valores reais.

## Diretriz visual atualizada — 13/10/2026

O usuário esclareceu que os assets existentes são referências da base visual desejada. Está autorizada a criação de novas imagens no mesmo estilo artístico e a substituição das antigas quando necessária, inclusive para separar fundos de propriedades dinâmicas. Essa autorização prevalece sobre a restrição original de não criar assets quando houver imagem correspondente. Manter o inventário atualizado e preservar referências originais fora dos assets ativos quando houver substituição.

## Organização visual — 14/10/2026

Diretriz posterior do usuário: loja muda arte conforme proprietário (Ponto_de_venda_aliado/inimiga/neutro), preservando posição e ID. Bandeira provisória é substituída pela equipe quando alocada. Vitória neutraliza loja/posto simultaneamente; aquisição posterior somente por compra, inclusive para IA com recursos finitos. Manter cinco lojas iniciais rivais, demais neutras e barraquinha inicial do jogador, conforme confirmação. Mapa mostra nomes e icon_* de coleta/ataque/defesa, sem quantidades de estoque/caixa; quantidades nos menus. Ver docs/CONTROLE_E_INDICADORES.md. Essa autorização substitui a exigência antiga de arte de loja fixa e a exibição simultânea de bandeira/equipe.

Diretriz posterior do usuário: loja muda arte conforme proprietário (Ponto_de_venda_aliado/inimiga/neutro), preservando posição e ID. Bandeira provisória é substituída pela equipe quando alocada. Vitória neutraliza loja/posto simultaneamente; aquisição posterior somente por compra, inclusive para IA com recursos finitos. Manter cinco lojas iniciais rivais, demais neutras e barraquinha inicial do jogador, conforme confirmação. Mapa mostra nomes e icon_* de coleta/ataque/defesa, sem quantidades de estoque/caixa; quantidades nos menus. Ver docs/CONTROLE_E_INDICADORES.md. Essa autorização substitui a exigência antiga de arte de loja fixa e a exibição simultânea de bandeira/equipe.

O usuário autorizou reposicionar o cadastro e criar outro mapa para exibir as construções com clareza. Manter pontos de venda com círculo de controle em frente; concentrar serviços no centro, inimigos afastados na região vermelha e fazenda inicial ao sul. A geometria continua fixa durante a partida. Menus superiores devem derivar propriedades, funcionários, estoques, vacas, vendas, dinheiro e inimigos do estado real, sem contar artes de catálogo como recursos possuídos.

Atualização posterior: ruas cadastradas com lojas e equipes nas esquinas; serviços centrais, fazendas externas e adversários ao norte. Paleta oficial: página #FFF8E7, seções #F3E7CF, navbar #5C4030, texto #352719/#786858, primário #52734D/#3D5A38, secundário #F2C14E, voltar #DCC9A7, bordas #D8C5A5, links #617B43, destaques #D99A24, avisos #C66B43, rodapé #38291F. Navegação do jogador por zonas, com foco atual na rural. Não reintroduzir Mapa-múndi ou Editor na interface; editor permanece apenas como ferramenta de desenvolvimento e não é publicado no build.

Atualização posterior: ruas cadastradas com lojas e equipes nas esquinas; serviços centrais, fazendas externas e adversários ao norte. Paleta oficial: página #FFF8E7, seções #F3E7CF, navbar #5C4030, texto #352719/#786858, primário #52734D/#3D5A38, secundário #F2C14E, voltar #DCC9A7, bordas #D8C5A5, links #617B43, destaques #D99A24, avisos #C66B43, rodapé #38291F. Navegação do jogador por zonas, com foco atual na rural. Não reintroduzir Mapa-múndi ou Editor na interface; editor permanece apenas como ferramenta de desenvolvimento e não é publicado no build.
