# Regras ativas da zona rural

Fonte única: `src/data/game-rules.js`, regras `rural-0.2`, dinheiro em centavos. O usuário autorizou valores iniciais ajustáveis para lacunas em 13/10/2026. Os valores são usados efetivamente pelo jogo.

## Mantido do mestre

Atualização 14/10/2026: fazendas neutras custam R$ 2.500 × nível e fábricas R$ 4.000 × nível; começam vazias, sem insumos ou vacas gratuitos. Capacidade 5/12/25/50, linhas 1/2/4/6 e maturação 20/60/160/350 conforme nível, seguindo o mestre. Serviços centrais são públicos e não entram nas propriedades possuídas. Alcance continua 800 unidades; o início ao sul agora fica afastado dos inimigos.

R$ 1.500, uma Magrela, 10 L fracos, 10 embalagens e 5 Minas Frescal Ruim. Magrela 8 L/3 rações por dia, R$ 500; Mimosa 16 L/5, R$ 1.800; Premiada 25 L/8, R$ 6.000. Fazenda nível 1: cinco vacas. Sem ração inicial gratuita; comprar insumo para produzir.

Cinco receitas e tempos/preços/maturações da seção 8, uma linha e maturação 20. Lote de uma unidade consome uma embalagem; leites separados, sem mistura. Qualidade permanece no ID do produto. Preços atuais usam preço-base por receita; multiplicadores de qualidade e política global de preços seguem pendentes.

Vendedor iniciante: contratar R$ 150, salário R$ 35/dia, máximo 20 vendas/dia. Seu Zé é o vendedor inicial. Uma venda a cada três minutos em 1×, somente com estoque, demanda e capacidade no caixa. Receita ocorre na venda; coleta transfere saldo sem duplicar receita.

Um dia = 60 minutos reais em 1×, com 2×/4× sobre todo o scheduler. Offline em 1× até oito horas; ataques ficam pendentes e IA não inicia conquista offline.

Combate: equipe de três, estrelas 1/1,4/1,9; armamento +12% e barricada +15% por nível, máximo 3. Fórmula `clamp(50 + 40 × (A−D)/(A+D), 5, 95)`. Zero/zero = 50%, mas ataque exige equipe com força positiva. Defesa não recebe bônus ofensivo de armamento. RNG apenas na resolução, com estado persistido.

## Valores autorizados para lacunas

| Parâmetro | Valor |
|---|---|
| Ração / embalagem | R$ 2 / R$ 1 por unidade |
| Ponto neutro | R$ 400 |
| Equipe de três capangas / salário diário | R$ 250 / R$ 50 |
| Promoção 1→2 / 2→3 | R$ 300 / R$ 600 |
| Armamento / barricada por nível | R$ 200 |
| Missão | R$ 50 e 60 segundos em 1× |
| Recuperação / cooldown | 5 / 2 minutos de simulação |
| Alcance | 800 pixels do mapa original |
| Leite na fazenda / fábrica | 100 L por local |
| Queijo na fábrica / loja | 40 unidades por local |
| Saldo máximo na loja | R$ 1.000 |
| Caixa inicial rival | R$ 15.000 antes das equipes iniciais |
| Ciclo de IA / início de agressão | 3 minutos / após dois dias |

Moral normal = 1; dia não pago reduz 0,5, equipe abandona após três salários consecutivos não pagos. Pagamento recupera 0,25 até 1. Equipes em reserva também recebem salários. Vendedor sem salário suspende vendas até próximo pagamento diário.

Vitória contra jogador/inimigo neutraliza ponto, preserva edificio/barricadas e interrompe vendedor. Jogador compra neutro e contrata vendedor/equipe. Rival pode atacar e ocupar neutro. Defensor derrotado recupera em posto livre ou reserva, sem morte permanente.

Transferência manual rural é instantânea entre propriedades da mesma empresa, limitada pela capacidade e preservando excedente na origem. Transporte com tempo, veículos, combustível e escolta permanece na fase 13.

Relatório atual: vendas, gastos e saldos. **Vendas menos gastos não é lucro líquido contábil**. Valorização de estoques, capitalização, patrimônio, bancos e juros permanecem na fase 8; esse indicador não decide vitória.
