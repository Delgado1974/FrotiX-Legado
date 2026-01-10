# sp_RecalcularRankingsVeiculoAnual

- **Objetivo**: gerar rankings anuais de veículos (km rodado, litros/valor abastecido e consumo).
- **Acionamento**: usado por `sp_RecalcularTodasEstatisticasVeiculos` e `sp_AtualizarEstatisticasVeiculosMesAtual`.
- **Parâmetros**: `@Ano` (INT).
- **Tabelas afetadas**: `EstatisticaVeiculoRankingKm`, `EstatisticaVeiculoRankingLitros`, `EstatisticaVeiculoRankingConsumo`, `AnosDisponiveisVeiculo`.
- **Tabelas lidas**: `Viagem`, `Abastecimento`, `Veiculo`, `ModeloVeiculo`.
- **Principais cálculos**: km rodado e total de viagens por veículo; litros/valor abastecido; consumo km/l (km/litros) com totais de abastecimentos; registra anos com dados.
- **Benefício para o FrotiX**: suporta rankings e comparativos anuais de desempenho da frota.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
