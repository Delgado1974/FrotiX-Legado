# sp_RecalcularEstatisticasVeiculoUnidade

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasVeiculoUnidade
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM EstatisticaVeiculoUnidade;

        INSERT INTO EstatisticaVeiculoUnidade (
            UnidadeId, Unidade, TotalVeiculos, VeiculosAtivos, DataAtualizacao
        )
        SELECT
            MIN(v.UnidadeId), -- primeiro UnidadeId encontrado por sigla
            ISNULL(u.Sigla, 'Sem Unidade'),
            COUNT(*),
            SUM(CASE WHEN v.Status = 1 THEN 1 ELSE 0 END),
            GETDATE()
        FROM Veiculo v
        LEFT JOIN Unidade u ON v.UnidadeId = u.UnidadeId
        GROUP BY u.Sigla;

        COMMIT TRANSACTION;
        PRINT 'Estatísticas por unidade recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## Explicação por blocos

- **Transação**: limpa e repovoa `EstatisticaVeiculoUnidade`.
- **Cálculo**: total e ativos por sigla de unidade; mantém um `UnidadeId` representativo.
- **Uso**: snapshot regional; chamado nas rotinas “todas” e “mês atual”.
