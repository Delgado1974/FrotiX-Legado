# sp_RecalcularEstatisticasVeiculoModelo

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasVeiculoModelo
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM EstatisticaVeiculoModelo;

        INSERT INTO EstatisticaVeiculoModelo (
            ModeloId, Modelo, TotalVeiculos, VeiculosAtivos, DataAtualizacao
        )
        SELECT
            MIN(v.ModeloId), -- primeiro ModeloId encontrado por descrição
            ISNULL(m.DescricaoModelo, 'Não Informado'),
            COUNT(*),
            SUM(CASE WHEN v.Status = 1 THEN 1 ELSE 0 END),
            GETDATE()
        FROM Veiculo v
        LEFT JOIN ModeloVeiculo m ON v.ModeloId = m.ModeloId
        GROUP BY m.DescricaoModelo;

        COMMIT TRANSACTION;
        PRINT 'Estatísticas por modelo recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## Explicação por blocos

- **Transação**: limpa e recria `EstatisticaVeiculoModelo`.
- **Cálculo**: total e ativos por descrição de modelo; mantém um `ModeloId` representativo.
- **Uso**: snapshot de modelo; chamado nas rotinas “todas” e “mês atual”.
