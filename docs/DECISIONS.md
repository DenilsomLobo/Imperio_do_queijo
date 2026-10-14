# Decisões e ambiguidades

## Resolvido nesta sessão

- Não existe arquitetura de código anterior; usar stack recomendada na especificação.
- Mestre copiado da raiz para docs, sem modificar conteúdo.
- Não inventar cadastro definitivo a partir de posições aproximadas; começar pelo editor e validar os mapas.
- Economia, IA, combate e campanha completos permanecem no escopo; nenhuma interface do editor equivale a esses sistemas.

## Pendências de design que alteram jogabilidade

1. Confirmar qual countryside corresponde a cada região; o vínculo sequencial atual é provisório.
2. Resolver edifícios incorporados nos cenários criando fundos sem edifícios dinâmicos ou delimitando desenhos exclusivamente decorativos. Em 13/10/2026, o usuário autorizou criar e substituir assets no mesmo estilo artístico; não é necessário pedir nova autorização para isso. A produção e validação desses fundos ainda estão pendentes.
3. Cadastrar e verificar terrenos reais, inclusive os 14 pontos rurais, serviços, posições iniciais e postos de segurança. Quantidades das outras regiões dependem dessa inspeção detalhada no editor.
4. Identidade das facções adicionais e associação de cores por região; não assumir mesma empresa por cor repetida.
5. Definir capítulos, desbloqueios, territórios obrigatórios e regra objetiva de neutralização dos rivais e consolidação da vitória.
6. Completar preços de insumos, custos de construções/serviços, demanda, salários ainda não tabelados, limites de bônus, tempos e custos de missões, inadimplência e recuperação. Centralizar balanceamento e documentar escolhas.
7. Determinar mapeamento visual dos trios para estrelas 3 e produzir assets ausentes quando necessário.
8. Definir dificuldade, pontuação e desempates de ranking. Proposta a avaliar: patrimônio líquido, menor duração e ID como desempate estável.
9. Firebase: projeto, região de dados, configuração pública, limites de sincronização e validação confiável do ranking. Não publicar nesta fase.

As pendências não bloqueiam a estrutura do editor. Bloqueiam marcar mapas definitivos, economia balanceada e campanha como concluídos.

## Decisões posteriores à correção

- Rural confirmado com countryside-v6 e cadastro manual das 14 vendas com controles, fazenda/queijaria inicial ao sul e adversários no norte. Quatro mapas restantes ainda precisam de cadastro.
- Usuário definiu propriedades físicas estáticas; mudanças de controle somente em bandeiras/equipes/indicadores. Isso resolve a necessidade imediata de regenerar o fundo rural: elementos já pintados permanecem decoração, sprites cadastrados são fixos em partida.
- Valores ausentes autorizados pelo usuário; configuração executável em game-rules.js e justificativas em BALANCEAMENTO.md. Demais valores ainda ausentes seguem parametrização/documentação quando implementados, sem contrariar o mestre.
- Ataque vitorioso contra ponto ocupado neutraliza; compra de neutro dá controle ao jogador. Rival pode atacar e ocupar neutro. Geometria, imagem física e barricadas preservadas.
- Manual rural transfere instantaneamente entre propriedades próprias; logística com viagens/veículos permanece no escopo da fase 13.
- Origem fixa 5173 para não trocar IndexedDB por porta. Salvar/recarregar validado; coordenação entre abas e migrações ainda pendentes.
