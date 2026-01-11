# sp_RecalcularEstatisticasMotoristas

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasMotoristas
      @Ano INT,
      @Mes INT
  AS
  BEGIN
      SET NOCOUNT ON;

      DECLARE @DataInicio DATE = DATEFROMPARTS(@Ano, @Mes, 1);
      DECLARE @DataFim DATE = EOMONTH(@DataInicio);
      DECLARE @Hoje DATE = GETDATE();

      BEGIN TRY
          BEGIN TRANSACTION;

          -- Limpa dados existentes do mês
          DELETE FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes;

          -- Viagens por motorista
          INSERT INTO EstatisticaMotoristasMensal (MotoristaId, Ano, Mes, TotalViagens, KmTotal, MinutosTotais, DataAtualizacao)
          SELECT v.MotoristaId, @Ano, @Mes,
                 COUNT(*),
                 SUM(CASE WHEN v.KmInicial IS NOT NULL AND v.KmFinal IS NOT NULL
                              AND v.KmFinal >= v.KmInicial
                              AND (v.KmFinal - v.KmInicial) <= 2000
                          THEN v.KmFinal - v.KmInicial ELSE 0 END),
                 SUM(ISNULL(v.Minutos, 0)),
                 GETDATE()
          FROM Viagem v
          WHERE v.MotoristaId IS NOT NULL
            AND v.DataInicial >= @DataInicio
            AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
          GROUP BY v.MotoristaId;

          -- Multas por motorista
          UPDATE e
          SET e.TotalMultas = ISNULL(m.Total, 0),
              e.ValorTotalMultas = ISNULL(m.Valor, 0),
              e.DataAtualizacao = GETDATE()
          FROM EstatisticaMotoristasMensal e
          LEFT JOIN (
              SELECT MotoristaId, COUNT(*) as Total, SUM(ISNULL(ValorAteVencimento, 0)) as Valor
              FROM Multa
              WHERE Data >= @DataInicio AND Data < DATEADD(DAY, 1, @DataFim)
                AND MotoristaId IS NOT NULL
              GROUP BY MotoristaId
          ) m ON e.MotoristaId = m.MotoristaId
          WHERE e.Ano = @Ano AND e.Mes = @Mes;

          -- Motoristas só com multas
          INSERT INTO EstatisticaMotoristasMensal (MotoristaId, Ano, Mes, TotalMultas, ValorTotalMultas, DataAtualizacao)
          SELECT m.MotoristaId, @Ano, @Mes,
                 COUNT(*),
                 SUM(ISNULL(m.ValorAteVencimento, 0)),
                 GETDATE()
          FROM Multa m
          WHERE m.MotoristaId IS NOT NULL
            AND m.Data >= @DataInicio
            AND m.Data < DATEADD(DAY, 1, @DataFim)
            AND NOT EXISTS (
                SELECT 1 FROM EstatisticaMotoristasMensal e
                WHERE e.MotoristaId = m.MotoristaId AND e.Ano = @Ano AND e.Mes = @Mes
            )
          GROUP BY m.MotoristaId;

          -- Abastecimentos por motorista
          UPDATE e
          SET e.TotalAbastecimentos = ISNULL(a.Total, 0),
              e.LitrosTotais = ISNULL(a.Litros, 0),
              e.ValorTotalAbastecimentos = ISNULL(a.Valor, 0),
              e.DataAtualizacao = GETDATE()
          FROM EstatisticaMotoristasMensal e
          LEFT JOIN (
              SELECT MotoristaId, COUNT(*) as Total,
                     SUM(ISNULL(Litros, 0)) as Litros,
                     SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)) as Valor
              FROM Abastecimento
              WHERE DataHora >= @DataInicio AND DataHora < DATEADD(DAY, 1, @DataFim)
                AND MotoristaId IS NOT NULL AND MotoristaId <> '00000000-0000-0000-0000-000000000000'
              GROUP BY MotoristaId
          ) a ON e.MotoristaId = a.MotoristaId
          WHERE e.Ano = @Ano AND e.Mes = @Mes;

          -- Estatísticas gerais do mês
          DELETE FROM EstatisticaGeralMensal WHERE Ano = @Ano AND Mes = @Mes;
          INSERT INTO EstatisticaGeralMensal (
              Ano, Mes,
              TotalMotoristas, MotoristasAtivos, MotoristasInativos,
              Efetivos, Feristas, Cobertura,
              TotalViagens, KmTotal, HorasTotais,
              TotalMultas, ValorTotalMultas,
              TotalAbastecimentos,
              DataAtualizacao
          )
          SELECT
              @Ano, @Mes,
              (SELECT COUNT(*) FROM Motorista),
              (SELECT COUNT(*) FROM Motorista WHERE Status = 1),
              (SELECT COUNT(*) FROM Motorista WHERE Status = 0),
              (SELECT COUNT(*) FROM Motorista WHERE Status = 1 AND (EfetivoFerista = 'Efetivo' OR EfetivoFerista IS NULL OR EfetivoFerista = '')),    
              (SELECT COUNT(*) FROM Motorista WHERE Status = 1 AND EfetivoFerista = 'Ferista'),
              (SELECT COUNT(*) FROM Motorista WHERE Status = 1 AND EfetivoFerista = 'Cobertura'),
              ISNULL((SELECT SUM(TotalViagens) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
              ISNULL((SELECT SUM(KmTotal) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
              ISNULL((SELECT SUM(MinutosTotais) / 60.0 FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
              ISNULL((SELECT SUM(TotalMultas) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
              ISNULL((SELECT SUM(ValorTotalMultas) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
              ISNULL((SELECT SUM(TotalAbastecimentos) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
              GETDATE();

          -- Rankings Top 10 (viagens, km, horas, abastecimentos, multas, performance)
          DELETE FROM RankingMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes;
          INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, DataAtualizacao)
          SELECT TOP 10 @Ano, @Mes, 'VIAGENS', ROW_NUMBER() OVER (ORDER BY e.TotalViagens DESC),
              e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'), e.TotalViagens, GETDATE()
          FROM EstatisticaMotoristasMensal e
          INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
          WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.TotalViagens > 0
          ORDER BY e.TotalViagens DESC;

          INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, DataAtualizacao)
          SELECT TOP 10 @Ano, @Mes, 'KM', ROW_NUMBER() OVER (ORDER BY e.KmTotal DESC),
              e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'), e.KmTotal, GETDATE()
          FROM EstatisticaMotoristasMensal e
          INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
          WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.KmTotal > 0
          ORDER BY e.KmTotal DESC;

          INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, DataAtualizacao)
          SELECT TOP 10 @Ano, @Mes, 'HORAS', ROW_NUMBER() OVER (ORDER BY e.MinutosTotais DESC),
              e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'), ROUND(e.MinutosTotais / 60.0, 1), GETDATE()
          FROM EstatisticaMotoristasMensal e
          INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
          WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.MinutosTotais > 0
          ORDER BY e.MinutosTotais DESC;

          INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, DataAtualizacao)
          SELECT TOP 10 @Ano, @Mes, 'ABASTECIMENTOS', ROW_NUMBER() OVER (ORDER BY e.TotalAbastecimentos DESC),
              e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'), e.TotalAbastecimentos, GETDATE()
          FROM EstatisticaMotoristasMensal e
          INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
          WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.TotalAbastecimentos > 0
          ORDER BY e.TotalAbastecimentos DESC;

          INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, ValorSecundario, DataAtualizacao)
          SELECT TOP 10 @Ano, @Mes, 'MULTAS', ROW_NUMBER() OVER (ORDER BY e.TotalMultas DESC),
              e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'), e.TotalMultas, e.ValorTotalMultas, GETDATE()
          FROM EstatisticaMotoristasMensal e
          INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
          WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.TotalMultas > 0
          ORDER BY e.TotalMultas DESC;

          INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, ValorSecundario, ValorTerciario, ValorQuaternario, DataAtualizacao)
          SELECT TOP 10 @Ano, @Mes, 'PERFORMANCE', ROW_NUMBER() OVER (ORDER BY e.TotalViagens DESC),
              e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'),
              e.TotalViagens, e.KmTotal, ROUND(e.MinutosTotais / 60.0, 1), e.TotalMultas, GETDATE()
          FROM EstatisticaMotoristasMensal e
          INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
          WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.TotalViagens > 0
          ORDER BY e.TotalViagens DESC;

          -- Heatmap (HoraInicio)
          DELETE FROM HeatmapViagensMensal WHERE Ano = @Ano AND Mes = @Mes AND MotoristaId IS NULL;
          INSERT INTO HeatmapViagensMensal (Ano, Mes, MotoristaId, DiaSemana, Hora, TotalViagens, DataAtualizacao)
          SELECT @Ano, @Mes, NULL,
                 DATEPART(WEEKDAY, v.HoraInicio) - 1,
                 DATEPART(HOUR, v.HoraInicio),
                 COUNT(*),
                 GETDATE()
          FROM Viagem v
          WHERE v.MotoristaId IS NOT NULL
            AND v.DataInicial >= @DataInicio
            AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
            AND v.HoraInicio IS NOT NULL
          GROUP BY DATEPART(WEEKDAY, v.HoraInicio), DATEPART(HOUR, v.HoraInicio);

          -- Evolução diária (todos motoristas)
          DELETE FROM EvolucaoViagensDiaria WHERE Data >= @DataInicio AND Data <= @DataFim AND MotoristaId IS NULL;
          INSERT INTO EvolucaoViagensDiaria (Data, MotoristaId, TotalViagens, KmTotal, MinutosTotais, DataAtualizacao)
          SELECT CAST(v.DataInicial AS DATE), NULL,
                 COUNT(*),
                 SUM(CASE WHEN v.KmInicial IS NOT NULL AND v.KmFinal IS NOT NULL
                              AND v.KmFinal >= v.KmInicial
                              AND (v.KmFinal - v.KmInicial) <= 2000
                          THEN v.KmFinal - v.KmInicial ELSE 0 END),
                 SUM(ISNULL(v.Minutos, 0)),
                 GETDATE()
          FROM Viagem v
          WHERE v.MotoristaId IS NOT NULL
            AND v.DataInicial >= @DataInicio
            AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
          GROUP BY CAST(v.DataInicial AS DATE);

          COMMIT TRANSACTION;
          PRINT 'Estatísticas do mês ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + ' recalculadas com sucesso.';

      END TRY
      BEGIN CATCH
          ROLLBACK TRANSACTION;
          THROW;
      END CATCH
  END
```

## Explicação por blocos

- **Intervalo**: define início/fim do mês alvo.
- **Viagens**: consolida total, km (limite 2000), minutos por motorista.
- **Multas/abastecimentos**: junta contagem e valores por motorista; insere motoristas com só multas.
- **Estatística geral**: totais de motoristas e KPIs agregados do mês.
- **Rankings**: Top 10 por viagens, km, horas, abastecimentos, multas, performance.
- **Heatmap**: usa `HoraInicio`; grava agregados por hora/dia.
- **Evolução diária**: consolida viagens/ km / minutos por dia (todos motoristas).
- **Transação**: rollback em erro; imprime sucesso por mês.
