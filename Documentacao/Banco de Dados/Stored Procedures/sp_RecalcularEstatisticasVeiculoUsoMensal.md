# sp_RecalcularEstatisticasVeiculoUsoMensal

- **Objetivo**: consolidar uso mensal da frota (viagens, km e abastecimentos) para um mês/ano.
- **Acionamento**: usado por `sp_RecalcularTodasEstatisticasVeiculos` e `sp_AtualizarEstatisticasVeiculosMesAtual`.
- **Parâmetros**: `@Ano` (INT), `@Mes` (INT).
- **Tabelas afetadas**: `EstatisticaVeiculoUsoMensal`.
- **Tabelas lidas**: `Viagem`, `Abastecimento`.
- **Principais cálculos**: total de viagens, km rodado, abastecimentos, litros e valor; consumo médio (km/l) do mês.
- **Benefício para o FrotiX**: fornece KPIs mensais de uso e consumo para BI e planejamento.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
