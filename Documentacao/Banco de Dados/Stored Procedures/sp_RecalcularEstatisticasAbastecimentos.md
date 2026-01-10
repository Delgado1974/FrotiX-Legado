# sp_RecalcularEstatisticasAbastecimentos

- **Objetivo**: recalcular estatísticas mensais de abastecimento para um ano/mês específico.
- **Acionamento**: chamado por `sp_AtualizarEstatisticasAbastecimentosMesAtual` e `sp_RecalcularTodasEstatisticasAbastecimentos`; pode ser executado manualmente.
- **Parâmetros**: `@Ano` (INT), `@Mes` (INT).
- **Tabelas afetadas**: `EstatisticaAbastecimentoMensal`, `EstatisticaAbastecimentoCombustivel`, `EstatisticaAbastecimentoCategoria`, `EstatisticaAbastecimentoTipoVeiculo`, `EstatisticaAbastecimentoVeiculoMensal`, `HeatmapAbastecimentoMensal`.
- **Tabelas lidas**: `Abastecimento`, `Combustivel`, `Veiculo`, `ModeloVeiculo`.
- **Principais cálculos**: totais de abastecimentos, litros e valor; médias de valor/litro; consolidação por combustível, categoria, modelo e veículo; heatmap (dia da semana x hora) geral.
- **Benefício para o FrotiX**: fornece KPIs de abastecimento por mês e alimenta rankings anuais.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
