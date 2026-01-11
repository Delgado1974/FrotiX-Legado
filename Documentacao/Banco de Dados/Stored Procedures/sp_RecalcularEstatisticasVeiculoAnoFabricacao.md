# sp_RecalcularEstatisticasVeiculoAnoFabricacao

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasVeiculoAnoFabricacao
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM EstatisticaVeiculoAnoFabricacao;

        INSERT INTO EstatisticaVeiculoAnoFabricacao (AnoFabricacao, TotalVeiculos, DataAtualizacao)
        SELECT ISNULL(AnoFabricacao, 0),
               COUNT(*),
               GETDATE()
        FROM Veiculo
        WHERE AnoFabricacao IS NOT NULL AND AnoFabricacao > 0
        GROUP BY AnoFabricacao;

        COMMIT TRANSACTION;
        PRINT 'Estatísticas por ano de fabricação recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## Explicação por blocos

- **Transação**: limpa e repovoa `EstatisticaVeiculoAnoFabricacao`.
- **Cálculo**: conta veículos por ano de fabricação (>0), grava data.
- **Uso**: snapshot etário da frota; chamado nas rotinas “todas” e “mês atual”.
