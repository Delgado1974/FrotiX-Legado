# sp_RecalcularEstatisticasVeiculoUsoMensal

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasVeiculoUsoMensal
    @Ano INT,
    @Mes INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @DataInicio DATE = DATEFROMPARTS(@Ano, @Mes, 1);
        DECLARE @DataFim DATE = EOMONTH(@DataInicio);

        DELETE FROM EstatisticaVeiculoUsoMensal WHERE Ano = @Ano AND Mes = @Mes;

        DECLARE @TotalViagens INT = 0;
        DECLARE @KmTotal DECIMAL(18,2) = 0;

        SELECT @TotalViagens = COUNT(*),
               @KmTotal = ISNULL(SUM(ISNULL(KmFinal, 0) - ISNULL(KmInicial, 0)), 0)
        FROM Viagem
        WHERE DataInicial >= @DataInicio AND DataInicial < DATEADD(DAY, 1, @DataFim);

        DECLARE @TotalAbastecimentos INT = 0;
        DECLARE @LitrosTotal DECIMAL(18,2) = 0;
        DECLARE @ValorAbastecimento DECIMAL(18,2) = 0;

        SELECT @TotalAbastecimentos = COUNT(*),
               @LitrosTotal = ISNULL(SUM(ISNULL(Litros, 0)), 0),
               @ValorAbastecimento = ISNULL(SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)), 0)
        FROM Abastecimento
        WHERE DataHora >= @DataInicio AND DataHora < DATEADD(DAY, 1, @DataFim);

        DECLARE @ConsumoMedio DECIMAL(10,2) = 0;
        IF @LitrosTotal > 0
            SET @ConsumoMedio = @KmTotal / @LitrosTotal;

        INSERT INTO EstatisticaVeiculoUsoMensal (
            Ano, Mes, TotalViagens, KmTotalRodado,
            TotalAbastecimentos, LitrosTotal, ValorAbastecimento,
            ConsumoMedio, DataAtualizacao
        )
        VALUES (
            @Ano, @Mes, @TotalViagens, @KmTotal,
            @TotalAbastecimentos, @LitrosTotal, @ValorAbastecimento,
            @ConsumoMedio, GETDATE()
        );

        COMMIT TRANSACTION;
        PRINT 'Estatísticas de uso do mês ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + ' recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## Explicação por blocos

- **Intervalo**: mês/ano informados.
- **Viagens**: total e km rodado (simples diferença KmFinal-KmInicial).
- **Abastecimentos**: total, litros e valor do mês.
- **Consumo médio**: km total / litros totais se houver litros.
- **Persistência**: grava em `EstatisticaVeiculoUsoMensal`; transação protege o recálculo.
- **Uso**: chamado nas rotinas “todas” e “mês atual”.
