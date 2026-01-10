# sp_NormalizarAbastecimentos

## Código completo

```sql
CREATE PROCEDURE dbo.sp_NormalizarAbastecimentos
AS
BEGIN
    SET NOCOUNT ON
    
    DECLARE @TotalRegistros INT
    DECLARE @OutliersDetectados INT

    BEGIN TRY
        BEGIN TRANSACTION

        -- STEP 1: Calcular consumo original
        PRINT '  [STEP 1] Calculando consumo original...'
        
        UPDATE Abastecimento
        SET ConsumoCalculado = CAST(KmRodado AS FLOAT) / Litros
        WHERE Litros > 0 AND KmRodado > 0
        
        SELECT @TotalRegistros = @@ROWCOUNT
        PRINT '           ' + CAST(@TotalRegistros AS VARCHAR) + ' registros calculados'

        -- STEP 2: Calcular estatísticas e normalizar por veículo
        PRINT '  [STEP 2] Detectando outliers (método IQR)...'
        
        ;WITH EstatisticasVeiculo AS (
            SELECT DISTINCT
                VeiculoId,
                PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY ConsumoCalculado) OVER (PARTITION BY VeiculoId) AS Q1,
                PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ConsumoCalculado) OVER (PARTITION BY VeiculoId) AS Q3,
                PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY ConsumoCalculado) OVER (PARTITION BY VeiculoId) AS Mediana,
                PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY KmRodado) OVER (PARTITION BY VeiculoId) AS MedianaKm,
                PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY Litros) OVER (PARTITION BY VeiculoId) AS MedianaLitros
            FROM Abastecimento
            WHERE Litros > 0 AND KmRodado > 0 AND ConsumoCalculado IS NOT NULL
        ),
        LimitesVeiculo AS (
            SELECT 
                VeiculoId, Q1, Q3, Mediana, MedianaKm, MedianaLitros,
                -- IQR com limites de sanidade (3 a 30 km/l)
                CASE WHEN Q1 - 1.5 * (Q3 - Q1) < 3 THEN 3 ELSE Q1 - 1.5 * (Q3 - Q1) END AS LimiteInf,
                CASE WHEN Q3 + 1.5 * (Q3 - Q1) > 30 THEN 30 ELSE Q3 + 1.5 * (Q3 - Q1) END AS LimiteSup
            FROM EstatisticasVeiculo
        )
        UPDATE A
        SET 
            A.EhOutlier = CASE WHEN A.ConsumoCalculado < L.LimiteInf OR A.ConsumoCalculado > L.LimiteSup THEN 1 ELSE 0 END,
            A.KmRodadoNormalizado = CASE WHEN A.ConsumoCalculado < L.LimiteInf OR A.ConsumoCalculado > L.LimiteSup THEN CAST(L.MedianaKm AS INT) ELSE A.KmRodado END,
            A.LitrosNormalizado = CASE WHEN A.ConsumoCalculado < L.LimiteInf OR A.ConsumoCalculado > L.LimiteSup THEN L.MedianaLitros ELSE A.Litros END,
            A.ConsumoNormalizado = CASE WHEN A.ConsumoCalculado < L.LimiteInf OR A.ConsumoCalculado > L.LimiteSup THEN L.Mediana ELSE A.ConsumoCalculado END
        FROM Abastecimento A
        INNER JOIN LimitesVeiculo L ON A.VeiculoId = L.VeiculoId
        WHERE A.Litros > 0 AND A.KmRodado > 0 AND A.ConsumoCalculado IS NOT NULL

        SELECT @OutliersDetectados = COUNT(*) FROM Abastecimento WHERE EhOutlier = 1
        PRINT '           ' + CAST(@OutliersDetectados AS VARCHAR) + ' outliers detectados e normalizados'

        COMMIT TRANSACTION
        
        PRINT ''
        PRINT '  ✓ Normalização de abastecimentos concluída!'

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        RAISERROR(@ErrorMessage, 16, 1)
    END CATCH
END
```

## Explicação por blocos

- **Passo 1 – consumo calculado**: `ConsumoCalculado = KmRodado / Litros` para registros positivos; contabiliza quantos foram processados.
- **Estatísticas por veículo (CTE EstatisticasVeiculo)**: calcula Q1, Q3, mediana, mediana de km e litros por `VeiculoId`.
- **Limites IQR sanitizados (CTE LimitesVeiculo)**: aplica IQR com piso 3 km/l e teto 30 km/l para evitar falsos positivos.
- **Normalização**: marca outliers (`EhOutlier = 1`) e substitui km/litros/consumo por medianas do veículo quando fora dos limites.
- **Log/controle**: conta outliers tratados; toda operação é transacional com ROLLBACK em erro.
- **Impacto**: melhora a qualidade de dados de abastecimento antes de recalcular consumo de veículos, custos e estatísticas.
