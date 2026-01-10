# sp_RecalcularEstatisticasAbastecimentosAnuais

- **Objetivo**: recalcular estatísticas anuais de abastecimento por veículo.
- **Acionamento**: chamado por `sp_AtualizarEstatisticasAbastecimentosMesAtual` e `sp_RecalcularTodasEstatisticasAbastecimentos`; pode ser executado manualmente por ano.
- **Parâmetros**: `@Ano` (INT).
- **Tabelas afetadas**: `EstatisticaAbastecimentoVeiculo`, `AnosDisponiveisAbastecimento`.
- **Tabelas lidas**: `Abastecimento`, `Veiculo`, `ModeloVeiculo`.
- **Principais cálculos**: total de abastecimentos, litros e valor por veículo, placa, modelo e categoria; registra anos disponíveis e totais.
- **Benefício para o FrotiX**: baseia rankings e análises anuais de consumo/custo da frota.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
