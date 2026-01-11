# sp_RecalcularEstatisticasVeiculoStatus

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasVeiculoStatus
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM EstatisticaVeiculoStatus;

        INSERT INTO EstatisticaVeiculoStatus (Status, TotalVeiculos, DataAtualizacao)
        SELECT CASE WHEN Status = 1 THEN 'Ativo' ELSE 'Inativo' END,
               COUNT(*),
               GETDATE()
        FROM Veiculo
        GROUP BY Status;

        COMMIT TRANSACTION;
        PRINT 'Estatísticas por status recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## Explicação por blocos

- **Transação**: limpa e repovoa `EstatisticaVeiculoStatus`.
- **Cálculo**: conta veículos por status (1=Ativo, 0=Inativo), grava data.
- **Uso**: parte do snapshot; chamado nas rotinas “todas” e “mês atual”.
