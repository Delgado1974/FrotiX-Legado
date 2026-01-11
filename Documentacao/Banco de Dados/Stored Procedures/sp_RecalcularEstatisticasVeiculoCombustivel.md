# sp_RecalcularEstatisticasVeiculoCombustivel

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasVeiculoCombustivel
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM EstatisticaVeiculoCombustivel;

        INSERT INTO EstatisticaVeiculoCombustivel (Combustivel, TotalVeiculos, DataAtualizacao)
        SELECT
            ISNULL(c.Descricao, 'Não Informado'),
            COUNT(*),
            GETDATE()
        FROM Veiculo v
        LEFT JOIN Combustivel c ON v.CombustivelId = c.CombustivelId
        GROUP BY c.Descricao; -- Já está correto, agrupa apenas pela descrição

        COMMIT TRANSACTION;
        PRINT 'Estatísticas por combustível recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## Explicação por blocos

- **Transação**: limpa e recria `EstatisticaVeiculoCombustivel`.
- **Cálculos**: conta veículos por descrição de combustível (ou “Não Informado”).
- **Data**: registra `GETDATE()`.
- **Uso**: snapshot por combustível; chamado nas rotinas “todas” e “mês atual”.
