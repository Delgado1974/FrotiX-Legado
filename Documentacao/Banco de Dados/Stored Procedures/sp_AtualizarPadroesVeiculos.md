# sp_AtualizarPadroesVeiculos

## Código completo

```sql
CREATE PROCEDURE dbo.sp_AtualizarPadroesVeiculos
AS
BEGIN
    SET NOCOUNT ON
    
    DECLARE @KM_MAXIMO_VIAGEM INT = 2000
    DECLARE @VeiculosProcessados INT
    
    PRINT '  Calculando padrões estatísticos por veículo...'
    
    -- Limpar tabela
    DELETE FROM VeiculoPadraoViagem
    
    -- PASSO 1: Calcular agregações básicas
    ;WITH AgregacoesVeiculo AS (
        SELECT 
            VeiculoId,
            AVG(CAST(COALESCE(MinutosNormalizado, Minutos) AS DECIMAL(18,2))) AS AvgDuracaoMinutos,
            AVG(CAST(COALESCE(KmRodadoNormalizado, KmFinal - KmInicial) AS DECIMAL(18,2))) AS AvgKmPorViagem,
            CASE 
                WHEN COUNT(DISTINCT CAST(COALESCE(DataInicialNormalizada, DataInicial) AS DATE)) > 0 
                THEN SUM(CAST(COALESCE(KmRodadoNormalizado, KmFinal - KmInicial) AS DECIMAL(18,2))) / 
                     COUNT(DISTINCT CAST(COALESCE(DataInicialNormalizada, DataInicial) AS DATE))
                ELSE NULL 
            END AS AvgKmPorDia,
            ISNULL(STDEV(CAST(COALESCE(KmRodadoNormalizado, KmFinal - KmInicial) AS DECIMAL(18,2))), 0) AS StdDevKm,
            COUNT(*) AS TotalViagens,
            CASE 
                WHEN AVG(CAST(COALESCE(MinutosNormalizado, Minutos) AS FLOAT)) < 120 THEN 'DIARIO'
                WHEN AVG(CAST(COALESCE(MinutosNormalizado, Minutos) AS FLOAT)) > 480 THEN 'LONGA_DURACAO'
                ELSE 'MISTO'
            END AS TipoUsoCalculado
        FROM Viagem
        WHERE Status = 'Realizada'
          AND VeiculoId IS NOT NULL
          AND COALESCE(KmRodadoNormalizado, KmFinal - KmInicial) BETWEEN 1 AND @KM_MAXIMO_VIAGEM
        GROUP BY VeiculoId
        HAVING COUNT(*) >= 5
    ),
    -- PASSO 2: Calcular percentis
    PercentisPorVeiculo AS (
        SELECT DISTINCT
            VeiculoId,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY COALESCE(KmRodadoNormalizado, KmFinal - KmInicial)) 
                OVER (PARTITION BY VeiculoId) AS MedianaKm,
            PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY COALESCE(KmRodadoNormalizado, KmFinal - KmInicial)) 
                OVER (PARTITION BY VeiculoId) AS Q1,
            PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY COALESCE(KmRodadoNormalizado, KmFinal - KmInicial)) 
                OVER (PARTITION BY VeiculoId) AS Q3
        FROM Viagem
        WHERE Status = 'Realizada'
          AND VeiculoId IS NOT NULL
          AND COALESCE(KmRodadoNormalizado, KmFinal - KmInicial) BETWEEN 1 AND @KM_MAXIMO_VIAGEM
    )
    -- PASSO 3: Inserir dados combinados
    INSERT INTO VeiculoPadraoViagem (
        VeiculoId, 
        AvgDuracaoMinutos, 
        AvgKmPorViagem, 
        AvgKmPorDia,
        MaxKmNormalPorViagem,
        MedianaKm,
        Q1Km,
        Q3Km,
        IQRKm,
        LimiteInferiorKm,
        LimiteSuperiorKm,
        TotalViagensAnalisadas,
        TipoUso,
        DataAtualizacao
    )
    SELECT 
        A.VeiculoId,
        A.AvgDuracaoMinutos,
        A.AvgKmPorViagem,
        A.AvgKmPorDia,
        -- Max normal = média + 2 desvios padrão (mínimo 500km)
        CASE 
            WHEN A.AvgKmPorViagem + 2 * A.StdDevKm > 500
            THEN A.AvgKmPorViagem + 2 * A.StdDevKm
            ELSE 500
        END AS MaxKmNormal,
        P.MedianaKm,
        P.Q1,
        P.Q3,
        P.Q3 - P.Q1 AS IQR,
        P.Q1 - 1.5 * (P.Q3 - P.Q1) AS LimiteInferior,
        P.Q3 + 1.5 * (P.Q3 - P.Q1) AS LimiteSuperior,
        A.TotalViagens,
        A.TipoUsoCalculado,
        GETDATE()
    FROM AgregacoesVeiculo A
    INNER JOIN PercentisPorVeiculo P ON A.VeiculoId = P.VeiculoId
    
    SELECT @VeiculosProcessados = @@ROWCOUNT
    
    PRINT '  ✓ Padrões calculados para ' + CAST(@VeiculosProcessados AS VARCHAR) + ' veículos'
    
    RETURN @VeiculosProcessados
END
```

## Explicação por blocos

- **Limpeza inicial**: zera `VeiculoPadraoViagem` para recarga completa.
- **Passo 1 – agregações**: para veículos com ≥5 viagens realizadas e km entre 1–2000, calcula médias (duração, km/viagem, km/dia), desvio padrão e classifica o tipo de uso (DIARIO/LONGA_DURACAO/MISTO).
- **Passo 2 – percentis**: computa mediana, Q1, Q3 de km rodado por veículo.
- **Passo 3 – inserção**: insere linha por veículo com limites IQR, max km normal (média + 2*desvio, mínimo 500 km), IQR e tipo de uso.
- **Resultado**: imprime quantidade processada e retorna o total; base é usada depois em `sp_NormalizarViagens` para corrigir outliers de km.
