# sp_RecalcularTodasEstatisticasMotoristas

- **Objetivo**: recalcular estatísticas de motoristas para todos os meses com viagens, multas ou abastecimentos.
- **Acionamento**: rotina administrativa; pode ser usada após correções em massa.
- **Parâmetros**: nenhum (monta lista de anos/meses a partir de `Viagem`, `Multa` e `Abastecimento`).
- **Fluxo**: percorre cada mês encontrado executando `sp_RecalcularEstatisticasMotoristas`; ao final imprime comandos de execução recomendados.
- **Tabelas afetadas**: `EstatisticaMotoristasMensal`, `RankingMotoristasMensal`, `EstatisticaGeralMensal`, `HeatmapViagensMensal`, `EvolucaoViagensDiaria` (via sub-SP).
- **Benefício para o FrotiX**: recompõe KPIs de motoristas ao atualizar dados históricos.
- **Status de uso**: rotina de manutenção; não há referência em código C#.
