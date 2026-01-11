# sp_RecalcularEstatisticasMotoristaUnico

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasMotoristaUnico
      @MotoristaId UNIQUEIDENTIFIER,
      @Ano INT,
      @Mes INT
  AS
  BEGIN
      SET NOCOUNT ON;

      DECLARE @DataInicio DATE = DATEFROMPARTS(@Ano, @Mes, 1);
      DECLARE @DataFim DATE = EOMONTH(@DataInicio);

      BEGIN TRY
          DELETE FROM EstatisticaMotoristasMensal
          WHERE MotoristaId = @MotoristaId AND Ano = @Ano AND Mes = @Mes;

          INSERT INTO EstatisticaMotoristasMensal (MotoristaId, Ano, Mes, TotalViagens, KmTotal, MinutosTotais, DataAtualizacao)
          SELECT @MotoristaId, @Ano, @Mes,
                 COUNT(*),
                 SUM(CASE WHEN v.KmInicial IS NOT NULL AND v.KmFinal IS NOT NULL
                              AND v.KmFinal >= v.KmInicial
                              AND (v.KmFinal - v.KmInicial) <= 2000
                          THEN v.KmFinal - v.KmInicial ELSE 0 END),
                 SUM(ISNULL(v.Minutos, 0)),
                 GETDATE()
          FROM Viagem v
          WHERE v.MotoristaId = @MotoristaId
            AND v.DataInicial >= @DataInicio
            AND v.DataInicial < DATEADD(DAY, 1, @DataFim);

          IF @@ROWCOUNT = 0
          BEGIN
              INSERT INTO EstatisticaMotoristasMensal (MotoristaId, Ano, Mes, DataAtualizacao)
              VALUES (@MotoristaId, @Ano, @Mes, GETDATE());
          END

          -- Multas
          UPDATE e
          SET e.TotalMultas = ISNULL(m.Total, 0),
              e.ValorTotalMultas = ISNULL(m.Valor, 0),
              e.DataAtualizacao = GETDATE()
          FROM EstatisticaMotoristasMensal e
          LEFT JOIN (
              SELECT COUNT(*) as Total, SUM(ISNULL(ValorAteVencimento, 0)) as Valor
              FROM Multa
              WHERE MotoristaId = @MotoristaId
                AND Data >= @DataInicio AND Data < DATEADD(DAY, 1, @DataFim)
          ) m ON 1=1
          WHERE e.MotoristaId = @MotoristaId AND e.Ano = @Ano AND e.Mes = @Mes;

          -- Abastecimentos
          UPDATE e
          SET e.TotalAbastecimentos = ISNULL(a.Total, 0),
              e.LitrosTotais = ISNULL(a.Litros, 0),
              e.ValorTotalAbastecimentos = ISNULL(a.Valor, 0),
              e.DataAtualizacao = GETDATE()
          FROM EstatisticaMotoristasMensal e
          LEFT JOIN (
              SELECT COUNT(*) as Total,
                     SUM(ISNULL(Litros, 0)) as Litros,
                     SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)) as Valor
              FROM Abastecimento
              WHERE MotoristaId = @MotoristaId
                AND DataHora >= @DataInicio AND DataHora < DATEADD(DAY, 1, @DataFim)
          ) a ON 1=1
          WHERE e.MotoristaId = @MotoristaId AND e.Ano = @Ano AND e.Mes = @Mes;

          -- Heatmap individual
          DELETE FROM HeatmapViagensMensal
          WHERE Ano = @Ano AND Mes = @Mes AND MotoristaId = @MotoristaId;
          INSERT INTO HeatmapViagensMensal (Ano, Mes, MotoristaId, DiaSemana, Hora, TotalViagens, DataAtualizacao)
          SELECT @Ano, @Mes, @MotoristaId,
                 DATEPART(WEEKDAY, v.HoraInicio) - 1,
                 DATEPART(HOUR, v.HoraInicio),
                 COUNT(*),
                 GETDATE()
          FROM Viagem v
          WHERE v.MotoristaId = @MotoristaId
            AND v.DataInicial >= @DataInicio
            AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
            AND v.HoraInicio IS NOT NULL
          GROUP BY DATEPART(WEEKDAY, v.HoraInicio), DATEPART(HOUR, v.HoraInicio);

          -- Evolução diária individual
          DELETE FROM EvolucaoViagensDiaria
          WHERE Data >= @DataInicio AND Data <= @DataFim AND MotoristaId = @MotoristaId;
          INSERT INTO EvolucaoViagensDiaria (Data, MotoristaId, TotalViagens, KmTotal, MinutosTotais, DataAtualizacao)
          SELECT CAST(v.DataInicial AS DATE), @MotoristaId,
                 COUNT(*),
                 SUM(CASE WHEN v.KmInicial IS NOT NULL AND v.KmFinal IS NOT NULL
                              AND v.KmFinal >= v.KmInicial
                              AND (v.KmFinal - v.KmInicial) <= 2000
                          THEN v.KmFinal - v.KmInicial ELSE 0 END),
                 SUM(ISNULL(v.Minutos, 0)),
                 GETDATE()
          FROM Viagem v
          WHERE v.MotoristaId = @MotoristaId
            AND v.DataInicial >= @DataInicio
            AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
          GROUP BY CAST(v.DataInicial AS DATE);

      END TRY
      BEGIN CATCH
          THROW;
      END CATCH
  END
```

## Explicação por blocos

- **Escopo**: recalcula apenas o motorista informado para o mês/ano.
- **Viagens**: consolida viagens, km (até 2000) e minutos; insere linha vazia se não houver viagens.
- **Multas/abastecimentos**: agrega para o motorista no período.
- **Heatmap**: usa `HoraInicio` para dia/hora do motorista.
- **Evolução diária**: métricas diárias individuais.
- **Uso**: correções pontuais sem reprocessar todos os motoristas.
