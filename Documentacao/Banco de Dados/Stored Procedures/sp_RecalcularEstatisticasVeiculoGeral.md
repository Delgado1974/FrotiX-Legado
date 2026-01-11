# sp_RecalcularEstatisticasVeiculoGeral

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasVeiculoGeral
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Limpa tabela
        DELETE FROM EstatisticaVeiculoGeral;

        -- Insere estatísticas gerais
        INSERT INTO EstatisticaVeiculoGeral (
            TotalVeiculos, VeiculosAtivos, VeiculosInativos,
            VeiculosProprios, VeiculosLocados, IdadeMediaAnos,
            KmMedioRodado, ValorMensalLocacao, DataAtualizacao
        )
        SELECT
            COUNT(*),
            SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END),
            SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END),
            SUM(CASE WHEN VeiculoProprio = 1 THEN 1 ELSE 0 END),
            SUM(CASE WHEN VeiculoProprio = 0 THEN 1 ELSE 0 END),
            ISNULL(AVG(CAST(YEAR(GETDATE()) - AnoFabricacao AS DECIMAL(10,2))), 0),
            ISNULL(AVG(CAST(Quilometragem AS DECIMAL(18,2))), 0),
            ISNULL(SUM(CASE WHEN VeiculoProprio = 0 THEN ISNULL(ValorMensal, 0) ELSE 0 END), 0),
            GETDATE()
        FROM Veiculo;

        COMMIT TRANSACTION;
        PRINT 'Estatísticas gerais de veículos recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## Explicação por blocos

- **Transação**: apaga e recria o snapshot em `EstatisticaVeiculoGeral`.
- **Cálculos**: totais de frota, ativos/inativos, próprios/locados, idade média, km médio e soma de valor mensal dos locados.
- **Data de atualização**: grava `GETDATE()`.
- **Uso**: parte do snapshot corrente de veículos; chamado em `sp_RecalcularTodasEstatisticasVeiculos` e na versão “mês atual”.
