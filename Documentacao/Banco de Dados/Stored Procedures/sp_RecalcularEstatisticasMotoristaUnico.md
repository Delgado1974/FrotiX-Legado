# sp_RecalcularEstatisticasMotoristaUnico

- **Objetivo**: recalcular estatísticas mensais para um motorista específico.
- **Acionamento**: usado por `sp_RecalcularTodasEstatisticasMotoristas` quando necessário ou manualmente para correção pontual.
- **Parâmetros**: `@MotoristaId` (UNIQUEIDENTIFIER), `@Ano` (INT), `@Mes` (INT).
- **Tabelas afetadas**: `EstatisticaMotoristasMensal`, `HeatmapViagensMensal`, `EvolucaoViagensDiaria`.
- **Tabelas lidas**: `Viagem`, `Multa`, `Abastecimento` filtrados pelo motorista.
- **Principais cálculos**: viagens, km (limitado a 2000 km/viagem), minutos, multas, abastecimentos; heatmap por HoraInicio; evolução diária individual. Insere linha vazia se sem viagens para manter consistência.
- **Benefício para o FrotiX**: permite corrigir rapidamente indicadores de um único motorista após ajustes de dados.
- **Status de uso**: suporte a manutenção; não referenciado em código C#.
