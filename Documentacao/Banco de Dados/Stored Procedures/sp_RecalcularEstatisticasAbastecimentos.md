# sp_RecalcularEstatisticasAbastecimentos

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasAbastecimentos
    @Ano INT,
    @Mes INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DataInicio DATE = DATEFROMPARTS(@Ano, @Mes, 1);
    DECLARE @DataFim DATE = EOMONTH(@DataInicio);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 9.1 Estatísticas Gerais do Mês
        DELETE FROM EstatisticaAbastecimentoMensal WHERE Ano = @Ano AND Mes = @Mes;
        INSERT INTO EstatisticaAbastecimentoMensal (Ano, Mes, TotalAbastecimentos, ValorTotal, LitrosTotal, DataAtualizacao)
        SELECT @Ano, @Mes, COUNT(*),
               SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)),
               SUM(ISNULL(Litros, 0)),
               GETDATE()
        FROM Abastecimento
        WHERE DataHora >= @DataInicio AND DataHora < DATEADD(DAY, 1, @DataFim);

        -- 9.2 Estatísticas por Combustível
        DELETE FROM EstatisticaAbastecimentoCombustivel WHERE Ano = @Ano AND Mes = @Mes;
        INSERT INTO EstatisticaAbastecimentoCombustivel (Ano, Mes, TipoCombustivel, TotalAbastecimentos, ValorTotal, LitrosTotal, MediaValorLitro, DataAtualizacao)
        SELECT @Ano, @Mes, ISNULL(c.Descricao, 'Não Informado'),
               COUNT(*),
               SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
               SUM(ISNULL(a.Litros, 0)),
               AVG(ISNULL(a.ValorUnitario, 0)),
               GETDATE()
        FROM Abastecimento a
        LEFT JOIN Combustivel c ON a.CombustivelId = c.CombustivelId
        WHERE a.DataHora >= @DataInicio AND a.DataHora < DATEADD(DAY, 1, @DataFim)
        GROUP BY c.Descricao;

        -- 9.3 Estatísticas por Categoria de Veículo
        DELETE FROM EstatisticaAbastecimentoCategoria WHERE Ano = @Ano AND Mes = @Mes;
        INSERT INTO EstatisticaAbastecimentoCategoria (Ano, Mes, Categoria, TotalAbastecimentos, ValorTotal, LitrosTotal, DataAtualizacao)
        SELECT @Ano, @Mes, ISNULL(v.Categoria, 'Sem Categoria'),
               COUNT(*),
               SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
               SUM(ISNULL(a.Litros, 0)),
               GETDATE()
        FROM Abastecimento a
        LEFT JOIN Veiculo v ON a.VeiculoId = v.VeiculoId
        WHERE a.DataHora >= @DataInicio AND a.DataHora < DATEADD(DAY, 1, @DataFim)
        GROUP BY v.Categoria;

        -- 9.4 Estatísticas por Tipo/Modelo de Veículo
        DELETE FROM EstatisticaAbastecimentoTipoVeiculo WHERE Ano = @Ano AND Mes = @Mes;
        INSERT INTO EstatisticaAbastecimentoTipoVeiculo (Ano, Mes, TipoVeiculo, TotalAbastecimentos, ValorTotal, LitrosTotal, DataAtualizacao)
        SELECT @Ano, @Mes, ISNULL(m.DescricaoModelo, 'Não Informado'),
               COUNT(*),
               SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
               SUM(ISNULL(a.Litros, 0)),
               GETDATE()
        FROM Abastecimento a
        LEFT JOIN Veiculo v ON a.VeiculoId = v.VeiculoId
        LEFT JOIN ModeloVeiculo m ON v.ModeloId = m.ModeloId
        WHERE a.DataHora >= @DataInicio AND a.DataHora < DATEADD(DAY, 1, @DataFim)
        GROUP BY m.DescricaoModelo;

        -- 9.5 Estatísticas por Veículo Mensal
        DELETE FROM EstatisticaAbastecimentoVeiculoMensal WHERE Ano = @Ano AND Mes = @Mes;
        INSERT INTO EstatisticaAbastecimentoVeiculoMensal (Ano, Mes, VeiculoId, TotalAbastecimentos, ValorTotal, LitrosTotal, DataAtualizacao)
        SELECT @Ano, @Mes, a.VeiculoId,
               COUNT(*),
               SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
               SUM(ISNULL(a.Litros, 0)),
               GETDATE()
        FROM Abastecimento a
        WHERE a.DataHora >= @DataInicio AND a.DataHora < DATEADD(DAY, 1, @DataFim)
          AND a.VeiculoId IS NOT NULL AND a.VeiculoId <> '00000000-0000-0000-0000-000000000000'
        GROUP BY a.VeiculoId;

        -- 9.6 Heatmap Geral (todos os veículos)
        DELETE FROM HeatmapAbastecimentoMensal
        WHERE Ano = @Ano AND Mes = @Mes AND VeiculoId IS NULL AND TipoVeiculo IS NULL;
        INSERT INTO HeatmapAbastecimentoMensal (Ano, Mes, VeiculoId, TipoVeiculo, DiaSemana, Hora, TotalAbastecimentos, ValorTotal, DataAtualizacao)
        SELECT @Ano, @Mes, NULL, NULL,
               DATEPART(WEEKDAY, DataHora) - 1,
               DATEPART(HOUR, DataHora),
               COUNT(*),
               SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)),
               GETDATE()
        FROM Abastecimento
        WHERE DataHora >= @DataInicio AND DataHora < DATEADD(DAY, 1, @DataFim)
        GROUP BY DATEPART(WEEKDAY, DataHora), DATEPART(HOUR, DataHora);

        COMMIT TRANSACTION;
        PRINT 'Estatísticas de abastecimentos do mês ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + ' recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## Explicação por blocos

- **Intervalo**: define primeiro e último dia do mês alvo.
- **Limpa e repopula**: tabelas mensais de abastecimento por mês/combustível/categoria/modelo/veículo e heatmap.
- **Cálculos**: contagem, litros, valor total, média de valor/litro; heatmap por dia da semana e hora.
- **Transação**: todo o recálculo é transacional; rollback em erro.
- **Uso**: chamado pelas rotinas de mês atual e de recálculo completo; pode ser executado manualmente para um mês/ano específico.
