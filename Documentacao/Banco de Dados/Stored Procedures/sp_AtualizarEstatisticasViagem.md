# sp_AtualizarEstatisticasViagem

## Código completo

```sql
CREATE PROCEDURE dbo.sp_AtualizarEstatisticasViagem
    @DataParam DATE
AS
BEGIN
    SET NOCOUNT ON
    
    DECLARE @DataRef DATE = CAST(@DataParam AS DATE)
    DECLARE @EstatisticaId INT
    
    -- ========================================================================
    -- CALCULAR ESTATÍSTICAS GERAIS
    -- ========================================================================
    
    DECLARE @TotalViagens INT = 0
    DECLARE @ViagensFinalizadas INT = 0
    DECLARE @ViagensEmAndamento INT = 0
    DECLARE @ViagensAgendadas INT = 0
    DECLARE @ViagensCanceladas INT = 0
    
    SELECT 
        @TotalViagens = ISNULL(COUNT(*), 0),
        @ViagensFinalizadas = ISNULL(SUM(CASE WHEN Status = 'Realizada' THEN 1 ELSE 0 END), 0),
        @ViagensEmAndamento = ISNULL(SUM(CASE WHEN Status = 'Aberta' THEN 1 ELSE 0 END), 0),
        @ViagensAgendadas = ISNULL(SUM(CASE WHEN Status = 'Agendada' THEN 1 ELSE 0 END), 0),
        @ViagensCanceladas = ISNULL(SUM(CASE WHEN Status = 'Cancelada' THEN 1 ELSE 0 END), 0)
    FROM Viagem
    WHERE CAST(DataInicial AS DATE) = @DataRef
    
    -- ========================================================================
    -- CALCULAR CUSTOS (apenas viagens Realizadas)
    -- IMPORTANTE: Soma TODOS os custos por viagem (Combustível + Motorista + Lavador)
    -- ========================================================================
    
    DECLARE @CustoTotal DECIMAL(18,2) = 0
    DECLARE @CustoVeiculo DECIMAL(18,2) = 0
    DECLARE @CustoMotorista DECIMAL(18,2) = 0
    DECLARE @CustoOperador DECIMAL(18,2) = 0
    DECLARE @CustoLavador DECIMAL(18,2) = 0
    DECLARE @CustoCombustivel DECIMAL(18,2) = 0
    
    SELECT 
        @CustoCombustivel = ISNULL(SUM(ISNULL(CustoCombustivel, 0)), 0),
        @CustoVeiculo = ISNULL(SUM(ISNULL(CustoVeiculo, 0)), 0),
        @CustoMotorista = ISNULL(SUM(ISNULL(CustoMotorista, 0)), 0),
        @CustoOperador = ISNULL(SUM(ISNULL(CustoOperador, 0)), 0),
        @CustoLavador = ISNULL(SUM(ISNULL(CustoLavador, 0)), 0)
    FROM Viagem
    WHERE CAST(DataInicial AS DATE) = @DataRef
      AND Status = 'Realizada'
    
    -- Custo total = soma de todos os custos
    SET @CustoTotal = @CustoCombustivel + @CustoVeiculo + @CustoMotorista + @CustoOperador + @CustoLavador
    
    -- ========================================================================
    -- CALCULAR QUILOMETRAGEM (com filtro de outliers: 1 a 2000 km)
    -- ========================================================================
    
    DECLARE @KmTotal INT = 0
    DECLARE @KmMedio DECIMAL(18,2) = 0
    DECLARE @MinutosTotal INT = 0
    DECLARE @MinutosMedio INT = 0
    DECLARE @QuilometragemTotal DECIMAL(18,2) = 0
    DECLARE @QuilometragemMedia DECIMAL(18,2) = 0
    
    SELECT 
        @KmTotal = ISNULL(SUM(ISNULL(KmRodado, 0)), 0),
        @KmMedio = ISNULL(AVG(CAST(ISNULL(KmRodado, 0) AS DECIMAL(18,2))), 0),
        @MinutosTotal = ISNULL(SUM(ISNULL(Minutos, 0)), 0),
        @MinutosMedio = ISNULL(AVG(ISNULL(Minutos, 0)), 0)
    FROM Viagem
    WHERE CAST(DataInicial AS DATE) = @DataRef
      AND Status = 'Realizada'
      AND KmRodado IS NOT NULL
      AND KmRodado BETWEEN 1 AND 2000  -- Filtro de outliers
    
    SET @QuilometragemTotal = CAST(@KmTotal AS DECIMAL(18,2))
    SET @QuilometragemMedia = @KmMedio
    
    -- ========================================================================
    -- CALCULAR JSONs AGREGADOS
    -- ========================================================================
    
    -- JSON: Viagens por Status
    DECLARE @ViagensPorStatusJson NVARCHAR(MAX)
    SELECT @ViagensPorStatusJson = (
        SELECT 
            Status AS status,
            COUNT(*) AS total
        FROM Viagem
        WHERE CAST(DataInicial AS DATE) = @DataRef
        GROUP BY Status
        FOR JSON PATH
    )
    
    -- JSON: Viagens por Motorista
    DECLARE @ViagensPorMotoristaJson NVARCHAR(MAX)
    SELECT @ViagensPorMotoristaJson = (
        SELECT 
            m.Nome AS motorista,
            COUNT(*) AS totalViagens
        FROM Viagem v
        INNER JOIN Motorista m ON v.MotoristaId = m.MotoristaId
        WHERE CAST(v.DataInicial AS DATE) = @DataRef
        GROUP BY m.Nome
        FOR JSON PATH
    )
    
    -- JSON: Viagens por Veículo
    DECLARE @ViagensPorVeiculoJson NVARCHAR(MAX)
    SELECT @ViagensPorVeiculoJson = (
        SELECT 
            ve.Placa AS veiculo,
            COUNT(*) AS totalViagens
        FROM Viagem v
        INNER JOIN Veiculo ve ON v.VeiculoId = ve.VeiculoId
        WHERE CAST(v.DataInicial AS DATE) = @DataRef
        GROUP BY ve.Placa
        FOR JSON PATH
    )
    
    -- JSON: Viagens por Finalidade
    DECLARE @ViagensPorFinalidadeJson NVARCHAR(MAX)
    SELECT @ViagensPorFinalidadeJson = (
        SELECT 
            v.Finalidade AS finalidade,
            COUNT(*) AS totalViagens
        FROM Viagem v
        WHERE CAST(v.DataInicial AS DATE) = @DataRef
          AND v.Finalidade IS NOT NULL
        GROUP BY v.Finalidade
        FOR JSON PATH
    )
    
    -- JSON: Viagens por Setor
    DECLARE @ViagensPorSetorJson NVARCHAR(MAX)
    SELECT @ViagensPorSetorJson = (
        SELECT 
            s.Nome AS setor,
            COUNT(*) AS totalViagens
        FROM Viagem v
        INNER JOIN SetorSolicitante s ON v.SetorSolicitanteId = s.SetorSolicitanteId
        WHERE CAST(v.DataInicial AS DATE) = @DataRef
        GROUP BY s.Nome
        FOR JSON PATH
    )
    
    -- JSON: Viagens por Requisitante (CORRIGIDO - estava faltando!)
    DECLARE @ViagensPorRequisitanteJson NVARCHAR(MAX)
    SELECT @ViagensPorRequisitanteJson = (
        SELECT 
            r.Nome AS requisitante,
            COUNT(*) AS totalViagens
        FROM Viagem v
        INNER JOIN Requisitante r ON v.RequisitanteId = r.RequisitanteId
        WHERE CAST(v.DataInicial AS DATE) = @DataRef
        GROUP BY r.Nome
        FOR JSON PATH
    )
    
    -- JSON: Custos por Motorista (apenas CustoMotorista)
    DECLARE @CustosPorMotoristaJson NVARCHAR(MAX)
    SELECT @CustosPorMotoristaJson = (
        SELECT 
            m.Nome AS motorista,
            SUM(ISNULL(v.CustoMotorista, 0)) AS custoTotal
        FROM Viagem v
        INNER JOIN Motorista m ON v.MotoristaId = m.MotoristaId
        WHERE CAST(v.DataInicial AS DATE) = @DataRef
          AND v.Status = 'Realizada'
        GROUP BY m.Nome
        FOR JSON PATH
    )
    
    -- JSON: Custos por Veículo (apenas CustoVeiculo - partilha do aluguel)
    DECLARE @CustosPorVeiculoJson NVARCHAR(MAX)
    SELECT @CustosPorVeiculoJson = (
        SELECT 
            ve.Placa AS veiculo,
            SUM(ISNULL(v.CustoVeiculo, 0)) AS custoTotal
        FROM Viagem v
        INNER JOIN Veiculo ve ON v.VeiculoId = ve.VeiculoId
        WHERE CAST(v.DataInicial AS DATE) = @DataRef
          AND v.Status = 'Realizada'
        GROUP BY ve.Placa
        FOR JSON PATH
    )
    
    -- JSON: KM por Veículo (com filtro de outliers)
    DECLARE @KmPorVeiculoJson NVARCHAR(MAX)
    SELECT @KmPorVeiculoJson = (
        SELECT 
            ve.Placa AS veiculo,
            SUM(ISNULL(v.KmRodado, 0)) AS kmTotal
        FROM Viagem v
        INNER JOIN Veiculo ve ON v.VeiculoId = ve.VeiculoId
        WHERE CAST(v.DataInicial AS DATE) = @DataRef
          AND v.KmRodado IS NOT NULL
          AND v.KmRodado BETWEEN 1 AND 2000  -- Filtro de outliers
        GROUP BY ve.Placa
        FOR JSON PATH
    )
    
    -- JSON: Custos por Tipo (encapsulado para evitar erro FOR JSON com UNION)
    DECLARE @CustosPorTipoJson NVARCHAR(MAX)
    SELECT @CustosPorTipoJson = (
        SELECT tipo, custo
        FROM (
            SELECT 'Combustível' AS tipo, SUM(ISNULL(CustoCombustivel, 0)) AS custo
            FROM Viagem WHERE CAST(DataInicial AS DATE) = @DataRef AND Status = 'Realizada'
            UNION ALL
            SELECT 'Veículo' AS tipo, SUM(ISNULL(CustoVeiculo, 0)) AS custo
            FROM Viagem WHERE CAST(DataInicial AS DATE) = @DataRef AND Status = 'Realizada'
            UNION ALL
            SELECT 'Motorista' AS tipo, SUM(ISNULL(CustoMotorista, 0)) AS custo
            FROM Viagem WHERE CAST(DataInicial AS DATE) = @DataRef AND Status = 'Realizada'
            UNION ALL
            SELECT 'Operador' AS tipo, SUM(ISNULL(CustoOperador, 0)) AS custo
            FROM Viagem WHERE CAST(DataInicial AS DATE) = @DataRef AND Status = 'Realizada'
            UNION ALL
            SELECT 'Lavador' AS tipo, SUM(ISNULL(CustoLavador, 0)) AS custo
            FROM Viagem WHERE CAST(DataInicial AS DATE) = @DataRef AND Status = 'Realizada'
        ) AS CustosPorTipo
        FOR JSON PATH
    )
    
    -- ========================================================================
    -- INSERIR OU ATUALIZAR
    -- ========================================================================
    
    SELECT @EstatisticaId = Id
    FROM ViagemEstatistica
    WHERE CAST(DataReferencia AS DATE) = @DataRef
    
    IF @EstatisticaId IS NOT NULL
    BEGIN
        UPDATE ViagemEstatistica
        SET 
            TotalViagens = @TotalViagens,
            ViagensFinalizadas = @ViagensFinalizadas,
            ViagensEmAndamento = @ViagensEmAndamento,
            ViagensAgendadas = @ViagensAgendadas,
            ViagensCanceladas = @ViagensCanceladas,
            
            CustoTotal = @CustoTotal,
            CustoMedioPorViagem = CASE WHEN @ViagensFinalizadas > 0 THEN @CustoTotal / @ViagensFinalizadas ELSE 0 END,
            CustoVeiculo = @CustoVeiculo,
            CustoMotorista = @CustoMotorista,
            CustoOperador = @CustoOperador,
            CustoLavador = @CustoLavador,
            CustoCombustivel = @CustoCombustivel,
            
            QuilometragemTotal = @QuilometragemTotal,
            QuilometragemMedia = @QuilometragemMedia,
            KmTotal = @KmTotal,
            KmMedio = @KmMedio,
            MinutosTotal = @MinutosTotal,
            MinutosMedio = @MinutosMedio,
            
            ViagensPorStatusJson = @ViagensPorStatusJson,
            ViagensPorMotoristaJson = @ViagensPorMotoristaJson,
            ViagensPorVeiculoJson = @ViagensPorVeiculoJson,
            ViagensPorFinalidadeJson = @ViagensPorFinalidadeJson,
            ViagensPorRequisitanteJson = @ViagensPorRequisitanteJson,
            ViagensPorSetorJson = @ViagensPorSetorJson,
            CustosPorMotoristaJson = @CustosPorMotoristaJson,
            CustosPorVeiculoJson = @CustosPorVeiculoJson,
            KmPorVeiculoJson = @KmPorVeiculoJson,
            CustosPorTipoJson = @CustosPorTipoJson,
            
            DataAtualizacao = GETDATE()
        WHERE Id = @EstatisticaId
    END
    ELSE
    BEGIN
        INSERT INTO ViagemEstatistica (
            DataReferencia,
            TotalViagens, ViagensFinalizadas, ViagensEmAndamento, ViagensAgendadas, ViagensCanceladas,
            CustoTotal, CustoMedioPorViagem, CustoVeiculo, CustoMotorista, CustoOperador, CustoLavador, CustoCombustivel,
            QuilometragemTotal, QuilometragemMedia, KmTotal, KmMedio, MinutosTotal, MinutosMedio,
            ViagensPorStatusJson, ViagensPorMotoristaJson, ViagensPorVeiculoJson, ViagensPorFinalidadeJson,
            ViagensPorRequisitanteJson, ViagensPorSetorJson,
            CustosPorMotoristaJson, CustosPorVeiculoJson, KmPorVeiculoJson, CustosPorTipoJson,
            DataCriacao
        )
        VALUES (
            @DataRef,
            @TotalViagens, @ViagensFinalizadas, @ViagensEmAndamento, @ViagensAgendadas, @ViagensCanceladas,
            @CustoTotal, CASE WHEN @ViagensFinalizadas > 0 THEN @CustoTotal / @ViagensFinalizadas ELSE 0 END,
            @CustoVeiculo, @CustoMotorista, @CustoOperador, @CustoLavador, @CustoCombustivel,
            @QuilometragemTotal, @QuilometragemMedia, @KmTotal, @KmMedio, @MinutosTotal, @MinutosMedio,
            @ViagensPorStatusJson, @ViagensPorMotoristaJson, @ViagensPorVeiculoJson, @ViagensPorFinalidadeJson,
            @ViagensPorRequisitanteJson, @ViagensPorSetorJson,
            @CustosPorMotoristaJson, @CustosPorVeiculoJson, @KmPorVeiculoJson, @CustosPorTipoJson,
            GETDATE()
        )
    END
END
```

## Explicação por blocos

- **Contexto/entrada**: calcula para um dia (`@DataParam`), guardando como `@DataRef`.
- **Estatísticas gerais**: totaliza viagens e quebra por status (Realizada, Aberta, Agendada, Cancelada).
- **Custos**: soma custos por tipo apenas para “Realizada”; `CustoTotal` é a soma de todos.
- **Quilometragem e tempo**: soma/ média de km e minutos com filtro de outliers 1–2000 km.
- **JSONs agregados**: gera coleções por status, motorista, veículo, finalidade, setor, requisitante, custos por motorista/veículo/tipo e km por veículo, todos em JSON para consumo direto em dashboards.
- **Upsert**: se já existe linha em `ViagemEstatistica` para o dia, faz UPDATE; senão INSERT; calcula custo médio por viagem finalizada.
- **Uso**: chamada diária pelo loop `sp_AtualizarTodasEstatisticasViagem`; também usada no pipeline de job de viagens.
