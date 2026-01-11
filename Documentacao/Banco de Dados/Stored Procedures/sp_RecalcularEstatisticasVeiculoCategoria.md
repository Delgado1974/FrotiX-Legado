# sp_RecalcularEstatisticasVeiculoCategoria

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasVeiculoCategoria
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM EstatisticaVeiculoCategoria;

        INSERT INTO EstatisticaVeiculoCategoria (
            Categoria, TotalVeiculos, VeiculosAtivos,
            VeiculosProprios, VeiculosLocados, DataAtualizacao
        )
        SELECT
            ISNULL(Categoria, 'Sem Categoria'),
            COUNT(*),
            SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END),
            SUM(CASE WHEN VeiculoProprio = 1 THEN 1 ELSE 0 END),
            SUM(CASE WHEN VeiculoProprio = 0 THEN 1 ELSE 0 END),
            GETDATE()
        FROM Veiculo
        GROUP BY Categoria;

        COMMIT TRANSACTION;
        PRINT 'Estatísticas por categoria recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## Explicação por blocos

- **Transação**: limpa e repopula `EstatisticaVeiculoCategoria`.
- **Cálculos**: total, ativos, próprios, locados agrupados por categoria (ou “Sem Categoria”).
- **Data**: registra `GETDATE()`.
- **Uso**: snapshot de categoria; chamado por rotinas “todas” e “mês atual”.
