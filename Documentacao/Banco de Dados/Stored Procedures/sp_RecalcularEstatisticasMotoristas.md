# sp_RecalcularEstatisticasMotoristas

- **Objetivo**: calcular estatísticas mensais de motoristas (viagens, km, horas, multas, abastecimentos) e rankings.
- **Acionamento**: chamado por `sp_AtualizarEstatisticasMesAtual` e `sp_RecalcularTodasEstatisticasMotoristas`; pode ser executado manualmente para um mês.
- **Parâmetros**: `@Ano` (INT), `@Mes` (INT).
- **Tabelas afetadas**: `EstatisticaMotoristasMensal`, `RankingMotoristasMensal`, `EstatisticaGeralMensal`, `HeatmapViagensMensal`, `EvolucaoViagensDiaria`.
- **Tabelas lidas**: `Viagem`, `Multa`, `Abastecimento`, `Motorista`.
- **Principais cálculos**: totais e km válidos (limite 2000 km), minutos, multas e valores; abastecimentos por motorista; rankings Top10 (viagens, km, horas, abastecimentos, multas, performance); heatmap por hora/dia (HoraInicio); evolução diária geral.\n- **Benefício para o FrotiX**: fornece KPIs operacionais de condutores e rankings para gestão de performance.\n- **Status de uso**: ativo em rotinas de atualização; não chamado no código C#.
