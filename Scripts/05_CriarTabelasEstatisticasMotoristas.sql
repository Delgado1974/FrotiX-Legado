-- =====================================================
-- Script: Tabelas Estatísticas para Dashboard Motoristas
-- Objetivo: Acelerar o carregamento do dashboard usando
--           dados pré-calculados atualizados via triggers
-- Data: 2026-01-04
-- =====================================================

USE FrotiX;
GO

-- =====================================================
-- 1. TABELA: Estatísticas Mensais por Motorista
-- Armazena dados agregados por motorista/ano/mês
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaMotoristasMensal' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaMotoristasMensal (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        MotoristaId UNIQUEIDENTIFIER NOT NULL,
        Ano INT NOT NULL,
        Mes INT NOT NULL,

        -- Viagens
        TotalViagens INT DEFAULT 0,
        KmTotal DECIMAL(18,2) DEFAULT 0,
        MinutosTotais INT DEFAULT 0,

        -- Multas
        TotalMultas INT DEFAULT 0,
        ValorTotalMultas DECIMAL(18,2) DEFAULT 0,

        -- Abastecimentos
        TotalAbastecimentos INT DEFAULT 0,
        LitrosTotais DECIMAL(18,2) DEFAULT 0,
        ValorTotalAbastecimentos DECIMAL(18,2) DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE(),

        CONSTRAINT FK_EstatMotMensal_Motorista FOREIGN KEY (MotoristaId)
            REFERENCES Motorista(MotoristaId),
        CONSTRAINT UQ_EstatMotMensal UNIQUE (MotoristaId, Ano, Mes)
    );

    CREATE INDEX IX_EstatMotMensal_AnoMes ON EstatisticaMotoristasMensal(Ano, Mes);
    CREATE INDEX IX_EstatMotMensal_Motorista ON EstatisticaMotoristasMensal(MotoristaId);

    PRINT 'Tabela EstatisticaMotoristasMensal criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaMotoristasMensal já existe.';
GO

-- =====================================================
-- 2. TABELA: Estatísticas Gerais Mensais (Consolidado)
-- Totais gerais por ano/mês (sem separar por motorista)
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaGeralMensal' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaGeralMensal (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        Mes INT NOT NULL,

        -- Motoristas
        TotalMotoristas INT DEFAULT 0,
        MotoristasAtivos INT DEFAULT 0,
        MotoristasInativos INT DEFAULT 0,
        Efetivos INT DEFAULT 0,
        Feristas INT DEFAULT 0,
        Cobertura INT DEFAULT 0,

        -- Viagens
        TotalViagens INT DEFAULT 0,
        KmTotal DECIMAL(18,2) DEFAULT 0,
        HorasTotais DECIMAL(18,2) DEFAULT 0,

        -- Multas
        TotalMultas INT DEFAULT 0,
        ValorTotalMultas DECIMAL(18,2) DEFAULT 0,

        -- Abastecimentos
        TotalAbastecimentos INT DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatGeralMensal UNIQUE (Ano, Mes)
    );

    CREATE INDEX IX_EstatGeralMensal_AnoMes ON EstatisticaGeralMensal(Ano, Mes);

    PRINT 'Tabela EstatisticaGeralMensal criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaGeralMensal já existe.';
GO

-- =====================================================
-- 3. TABELA: Top 10 Rankings por Mês
-- Armazena rankings pré-calculados
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RankingMotoristasMensal' AND xtype='U')
BEGIN
    CREATE TABLE RankingMotoristasMensal (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        Mes INT NOT NULL,
        TipoRanking VARCHAR(50) NOT NULL, -- 'VIAGENS', 'KM', 'HORAS', 'ABASTECIMENTOS', 'MULTAS', 'PERFORMANCE'
        Posicao INT NOT NULL,

        MotoristaId UNIQUEIDENTIFIER NOT NULL,
        NomeMotorista NVARCHAR(200),
        TipoMotorista NVARCHAR(50), -- Efetivo/Ferista/Cobertura

        -- Valores conforme o tipo de ranking
        ValorPrincipal DECIMAL(18,2) DEFAULT 0, -- Viagens/KM/Horas/etc
        ValorSecundario DECIMAL(18,2) DEFAULT 0, -- KM (para performance), Valor (para multas)
        ValorTerciario DECIMAL(18,2) DEFAULT 0, -- Horas (para performance)
        ValorQuaternario INT DEFAULT 0, -- Multas (para performance)

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE(),

        CONSTRAINT FK_RankingMot_Motorista FOREIGN KEY (MotoristaId)
            REFERENCES Motorista(MotoristaId),
        CONSTRAINT UQ_RankingMot UNIQUE (Ano, Mes, TipoRanking, Posicao)
    );

    CREATE INDEX IX_RankingMot_AnoMesTipo ON RankingMotoristasMensal(Ano, Mes, TipoRanking);

    PRINT 'Tabela RankingMotoristasMensal criada com sucesso.';
END
ELSE
    PRINT 'Tabela RankingMotoristasMensal já existe.';
GO

-- =====================================================
-- 4. TABELA: Heatmap de Viagens por Mês
-- Armazena dados do mapa de calor pré-calculados
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HeatmapViagensMensal' AND xtype='U')
BEGIN
    CREATE TABLE HeatmapViagensMensal (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        Mes INT NOT NULL,
        MotoristaId UNIQUEIDENTIFIER NULL, -- NULL = todos os motoristas

        DiaSemana INT NOT NULL, -- 0=Domingo, 1=Segunda, ... 6=Sábado
        Hora INT NOT NULL, -- 0-23
        TotalViagens INT DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE()
    );

    -- Índice único para quando MotoristaId é NULL (todos os motoristas)
    CREATE UNIQUE INDEX IX_HeatmapViagens_Todos ON HeatmapViagensMensal(Ano, Mes, DiaSemana, Hora)
        WHERE MotoristaId IS NULL;

    -- Índice único para quando MotoristaId tem valor (motorista específico)
    CREATE UNIQUE INDEX IX_HeatmapViagens_Motorista ON HeatmapViagensMensal(Ano, Mes, MotoristaId, DiaSemana, Hora)
        WHERE MotoristaId IS NOT NULL;

    CREATE INDEX IX_HeatmapViagens_AnoMes ON HeatmapViagensMensal(Ano, Mes);

    PRINT 'Tabela HeatmapViagensMensal criada com sucesso.';
END
ELSE
    PRINT 'Tabela HeatmapViagensMensal já existe.';
GO

-- =====================================================
-- 5. TABELA: Evolução Diária de Viagens
-- Dados diários para gráfico de evolução
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EvolucaoViagensDiaria' AND xtype='U')
BEGIN
    CREATE TABLE EvolucaoViagensDiaria (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Data DATE NOT NULL,
        MotoristaId UNIQUEIDENTIFIER NULL, -- NULL = todos os motoristas

        TotalViagens INT DEFAULT 0,
        KmTotal DECIMAL(18,2) DEFAULT 0,
        MinutosTotais INT DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE()
    );

    -- Índice único para quando MotoristaId é NULL (todos os motoristas)
    CREATE UNIQUE INDEX IX_EvolucaoViagens_Todos ON EvolucaoViagensDiaria(Data)
        WHERE MotoristaId IS NULL;

    -- Índice único para quando MotoristaId tem valor (motorista específico)
    CREATE UNIQUE INDEX IX_EvolucaoViagens_Motorista ON EvolucaoViagensDiaria(Data, MotoristaId)
        WHERE MotoristaId IS NOT NULL;

    CREATE INDEX IX_EvolucaoViagens_Data ON EvolucaoViagensDiaria(Data);

    PRINT 'Tabela EvolucaoViagensDiaria criada com sucesso.';
END
ELSE
    PRINT 'Tabela EvolucaoViagensDiaria já existe.';
GO

-- =====================================================
-- 6. STORED PROCEDURE: Recalcular Estatísticas de um Mês
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasMotoristas')
    DROP PROCEDURE sp_RecalcularEstatisticasMotoristas;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasMotoristas
    @Ano INT,
    @Mes INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DataInicio DATE = DATEFROMPARTS(@Ano, @Mes, 1);
    DECLARE @DataFim DATE = EOMONTH(@DataInicio);
    DECLARE @Hoje DATE = GETDATE();

    BEGIN TRY
        BEGIN TRANSACTION;

        -- =====================================================
        -- 6.1 Estatísticas por Motorista
        -- =====================================================

        -- Limpa dados existentes do mês
        DELETE FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes;

        -- Insere estatísticas de viagens por motorista
        INSERT INTO EstatisticaMotoristasMensal (MotoristaId, Ano, Mes, TotalViagens, KmTotal, MinutosTotais, DataAtualizacao)
        SELECT
            v.MotoristaId,
            @Ano,
            @Mes,
            COUNT(*),
            SUM(CASE
                WHEN v.KmInicial IS NOT NULL AND v.KmFinal IS NOT NULL
                     AND v.KmFinal >= v.KmInicial
                     AND (v.KmFinal - v.KmInicial) <= 2000
                THEN v.KmFinal - v.KmInicial
                ELSE 0
            END),
            SUM(ISNULL(v.Minutos, 0)),
            GETDATE()
        FROM Viagem v
        WHERE v.MotoristaId IS NOT NULL
          AND v.DataInicial >= @DataInicio
          AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
        GROUP BY v.MotoristaId;

        -- Atualiza multas por motorista
        UPDATE e
        SET e.TotalMultas = ISNULL(m.Total, 0),
            e.ValorTotalMultas = ISNULL(m.Valor, 0),
            e.DataAtualizacao = GETDATE()
        FROM EstatisticaMotoristasMensal e
        LEFT JOIN (
            SELECT MotoristaId, COUNT(*) as Total, SUM(ISNULL(ValorAteVencimento, 0)) as Valor
            FROM Multa
            WHERE Data >= @DataInicio AND Data < DATEADD(DAY, 1, @DataFim)
              AND MotoristaId IS NOT NULL
            GROUP BY MotoristaId
        ) m ON e.MotoristaId = m.MotoristaId
        WHERE e.Ano = @Ano AND e.Mes = @Mes;

        -- Insere motoristas que só têm multas (sem viagens)
        INSERT INTO EstatisticaMotoristasMensal (MotoristaId, Ano, Mes, TotalMultas, ValorTotalMultas, DataAtualizacao)
        SELECT
            m.MotoristaId,
            @Ano,
            @Mes,
            COUNT(*),
            SUM(ISNULL(m.ValorAteVencimento, 0)),
            GETDATE()
        FROM Multa m
        WHERE m.MotoristaId IS NOT NULL
          AND m.Data >= @DataInicio
          AND m.Data < DATEADD(DAY, 1, @DataFim)
          AND NOT EXISTS (
              SELECT 1 FROM EstatisticaMotoristasMensal e
              WHERE e.MotoristaId = m.MotoristaId AND e.Ano = @Ano AND e.Mes = @Mes
          )
        GROUP BY m.MotoristaId;

        -- Atualiza abastecimentos por motorista
        UPDATE e
        SET e.TotalAbastecimentos = ISNULL(a.Total, 0),
            e.LitrosTotais = ISNULL(a.Litros, 0),
            e.ValorTotalAbastecimentos = ISNULL(a.Valor, 0),
            e.DataAtualizacao = GETDATE()
        FROM EstatisticaMotoristasMensal e
        LEFT JOIN (
            SELECT MotoristaId, COUNT(*) as Total,
                   SUM(ISNULL(Litros, 0)) as Litros,
                   SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)) as Valor
            FROM Abastecimento
            WHERE DataHora >= @DataInicio AND DataHora < DATEADD(DAY, 1, @DataFim)
              AND MotoristaId IS NOT NULL AND MotoristaId <> '00000000-0000-0000-0000-000000000000'
            GROUP BY MotoristaId
        ) a ON e.MotoristaId = a.MotoristaId
        WHERE e.Ano = @Ano AND e.Mes = @Mes;

        -- =====================================================
        -- 6.2 Estatísticas Gerais do Mês
        -- =====================================================

        DELETE FROM EstatisticaGeralMensal WHERE Ano = @Ano AND Mes = @Mes;

        INSERT INTO EstatisticaGeralMensal (
            Ano, Mes,
            TotalMotoristas, MotoristasAtivos, MotoristasInativos,
            Efetivos, Feristas, Cobertura,
            TotalViagens, KmTotal, HorasTotais,
            TotalMultas, ValorTotalMultas,
            TotalAbastecimentos,
            DataAtualizacao
        )
        SELECT
            @Ano,
            @Mes,
            -- Motoristas (snapshot atual)
            (SELECT COUNT(*) FROM Motorista),
            (SELECT COUNT(*) FROM Motorista WHERE Status = 1),
            (SELECT COUNT(*) FROM Motorista WHERE Status = 0),
            (SELECT COUNT(*) FROM Motorista WHERE Status = 1 AND (EfetivoFerista = 'Efetivo' OR EfetivoFerista IS NULL OR EfetivoFerista = '')),
            (SELECT COUNT(*) FROM Motorista WHERE Status = 1 AND EfetivoFerista = 'Ferista'),
            (SELECT COUNT(*) FROM Motorista WHERE Status = 1 AND EfetivoFerista = 'Cobertura'),
            -- Viagens do mês
            ISNULL((SELECT SUM(TotalViagens) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            ISNULL((SELECT SUM(KmTotal) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            ISNULL((SELECT SUM(MinutosTotais) / 60.0 FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            -- Multas do mês
            ISNULL((SELECT SUM(TotalMultas) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            ISNULL((SELECT SUM(ValorTotalMultas) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            -- Abastecimentos do mês
            ISNULL((SELECT SUM(TotalAbastecimentos) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            GETDATE();

        -- =====================================================
        -- 6.3 Rankings Top 10
        -- =====================================================

        DELETE FROM RankingMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes;

        -- Top 10 por Viagens
        INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, DataAtualizacao)
        SELECT TOP 10
            @Ano, @Mes, 'VIAGENS', ROW_NUMBER() OVER (ORDER BY e.TotalViagens DESC),
            e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'), e.TotalViagens, GETDATE()
        FROM EstatisticaMotoristasMensal e
        INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
        WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.TotalViagens > 0
        ORDER BY e.TotalViagens DESC;

        -- Top 10 por KM
        INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, DataAtualizacao)
        SELECT TOP 10
            @Ano, @Mes, 'KM', ROW_NUMBER() OVER (ORDER BY e.KmTotal DESC),
            e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'), e.KmTotal, GETDATE()
        FROM EstatisticaMotoristasMensal e
        INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
        WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.KmTotal > 0
        ORDER BY e.KmTotal DESC;

        -- Top 10 por Horas
        INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, DataAtualizacao)
        SELECT TOP 10
            @Ano, @Mes, 'HORAS', ROW_NUMBER() OVER (ORDER BY e.MinutosTotais DESC),
            e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'), ROUND(e.MinutosTotais / 60.0, 1), GETDATE()
        FROM EstatisticaMotoristasMensal e
        INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
        WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.MinutosTotais > 0
        ORDER BY e.MinutosTotais DESC;

        -- Top 10 por Abastecimentos
        INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, DataAtualizacao)
        SELECT TOP 10
            @Ano, @Mes, 'ABASTECIMENTOS', ROW_NUMBER() OVER (ORDER BY e.TotalAbastecimentos DESC),
            e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'), e.TotalAbastecimentos, GETDATE()
        FROM EstatisticaMotoristasMensal e
        INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
        WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.TotalAbastecimentos > 0
        ORDER BY e.TotalAbastecimentos DESC;

        -- Top 10 por Multas
        INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, ValorSecundario, DataAtualizacao)
        SELECT TOP 10
            @Ano, @Mes, 'MULTAS', ROW_NUMBER() OVER (ORDER BY e.TotalMultas DESC),
            e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'), e.TotalMultas, e.ValorTotalMultas, GETDATE()
        FROM EstatisticaMotoristasMensal e
        INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
        WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.TotalMultas > 0
        ORDER BY e.TotalMultas DESC;

        -- Top 10 Performance (por viagens, com KM, Horas e Multas)
        INSERT INTO RankingMotoristasMensal (Ano, Mes, TipoRanking, Posicao, MotoristaId, NomeMotorista, TipoMotorista, ValorPrincipal, ValorSecundario, ValorTerciario, ValorQuaternario, DataAtualizacao)
        SELECT TOP 10
            @Ano, @Mes, 'PERFORMANCE', ROW_NUMBER() OVER (ORDER BY e.TotalViagens DESC),
            e.MotoristaId, m.Nome, ISNULL(m.EfetivoFerista, 'Efetivo'),
            e.TotalViagens, e.KmTotal, ROUND(e.MinutosTotais / 60.0, 1), e.TotalMultas, GETDATE()
        FROM EstatisticaMotoristasMensal e
        INNER JOIN Motorista m ON e.MotoristaId = m.MotoristaId
        WHERE e.Ano = @Ano AND e.Mes = @Mes AND e.TotalViagens > 0
        ORDER BY e.TotalViagens DESC;

        -- =====================================================
        -- 6.4 Heatmap de Viagens (Todos os motoristas)
        -- =====================================================

        DELETE FROM HeatmapViagensMensal WHERE Ano = @Ano AND Mes = @Mes AND MotoristaId IS NULL;

        INSERT INTO HeatmapViagensMensal (Ano, Mes, MotoristaId, DiaSemana, Hora, TotalViagens, DataAtualizacao)
        SELECT
            @Ano, @Mes, NULL,
            DATEPART(WEEKDAY, v.DataInicial) - 1, -- 0=Domingo, ajuste para SQL Server
            DATEPART(HOUR, v.DataInicial),
            COUNT(*),
            GETDATE()
        FROM Viagem v
        WHERE v.MotoristaId IS NOT NULL
          AND v.DataInicial >= @DataInicio
          AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
        GROUP BY DATEPART(WEEKDAY, v.DataInicial), DATEPART(HOUR, v.DataInicial);

        -- =====================================================
        -- 6.5 Evolução Diária de Viagens (Todos os motoristas)
        -- =====================================================

        DELETE FROM EvolucaoViagensDiaria
        WHERE Data >= @DataInicio AND Data <= @DataFim AND MotoristaId IS NULL;

        INSERT INTO EvolucaoViagensDiaria (Data, MotoristaId, TotalViagens, KmTotal, MinutosTotais, DataAtualizacao)
        SELECT
            CAST(v.DataInicial AS DATE),
            NULL,
            COUNT(*),
            SUM(CASE
                WHEN v.KmInicial IS NOT NULL AND v.KmFinal IS NOT NULL
                     AND v.KmFinal >= v.KmInicial
                     AND (v.KmFinal - v.KmInicial) <= 2000
                THEN v.KmFinal - v.KmInicial
                ELSE 0
            END),
            SUM(ISNULL(v.Minutos, 0)),
            GETDATE()
        FROM Viagem v
        WHERE v.MotoristaId IS NOT NULL
          AND v.DataInicial >= @DataInicio
          AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
        GROUP BY CAST(v.DataInicial AS DATE);

        COMMIT TRANSACTION;

        PRINT 'Estatísticas do mês ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + ' recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasMotoristas criada com sucesso.';
GO

-- =====================================================
-- 7. STORED PROCEDURE: Recalcular Estatísticas de um Motorista em um Mês
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasMotoristaUnico')
    DROP PROCEDURE sp_RecalcularEstatisticasMotoristaUnico;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasMotoristaUnico
    @MotoristaId UNIQUEIDENTIFIER,
    @Ano INT,
    @Mes INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DataInicio DATE = DATEFROMPARTS(@Ano, @Mes, 1);
    DECLARE @DataFim DATE = EOMONTH(@DataInicio);

    BEGIN TRY
        -- Limpa estatísticas existentes deste motorista/mês
        DELETE FROM EstatisticaMotoristasMensal
        WHERE MotoristaId = @MotoristaId AND Ano = @Ano AND Mes = @Mes;

        -- Recalcula viagens
        INSERT INTO EstatisticaMotoristasMensal (MotoristaId, Ano, Mes, TotalViagens, KmTotal, MinutosTotais, DataAtualizacao)
        SELECT
            @MotoristaId,
            @Ano,
            @Mes,
            COUNT(*),
            SUM(CASE
                WHEN v.KmInicial IS NOT NULL AND v.KmFinal IS NOT NULL
                     AND v.KmFinal >= v.KmInicial
                     AND (v.KmFinal - v.KmInicial) <= 2000
                THEN v.KmFinal - v.KmInicial
                ELSE 0
            END),
            SUM(ISNULL(v.Minutos, 0)),
            GETDATE()
        FROM Viagem v
        WHERE v.MotoristaId = @MotoristaId
          AND v.DataInicial >= @DataInicio
          AND v.DataInicial < DATEADD(DAY, 1, @DataFim);

        -- Se não inseriu nada (sem viagens), insere registro vazio
        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO EstatisticaMotoristasMensal (MotoristaId, Ano, Mes, DataAtualizacao)
            VALUES (@MotoristaId, @Ano, @Mes, GETDATE());
        END

        -- Atualiza multas
        UPDATE e
        SET e.TotalMultas = ISNULL(m.Total, 0),
            e.ValorTotalMultas = ISNULL(m.Valor, 0),
            e.DataAtualizacao = GETDATE()
        FROM EstatisticaMotoristasMensal e
        LEFT JOIN (
            SELECT COUNT(*) as Total, SUM(ISNULL(ValorAteVencimento, 0)) as Valor
            FROM Multa
            WHERE MotoristaId = @MotoristaId
              AND Data >= @DataInicio AND Data < DATEADD(DAY, 1, @DataFim)
        ) m ON 1=1
        WHERE e.MotoristaId = @MotoristaId AND e.Ano = @Ano AND e.Mes = @Mes;

        -- Atualiza abastecimentos
        UPDATE e
        SET e.TotalAbastecimentos = ISNULL(a.Total, 0),
            e.LitrosTotais = ISNULL(a.Litros, 0),
            e.ValorTotalAbastecimentos = ISNULL(a.Valor, 0),
            e.DataAtualizacao = GETDATE()
        FROM EstatisticaMotoristasMensal e
        LEFT JOIN (
            SELECT COUNT(*) as Total,
                   SUM(ISNULL(Litros, 0)) as Litros,
                   SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)) as Valor
            FROM Abastecimento
            WHERE MotoristaId = @MotoristaId
              AND DataHora >= @DataInicio AND DataHora < DATEADD(DAY, 1, @DataFim)
        ) a ON 1=1
        WHERE e.MotoristaId = @MotoristaId AND e.Ano = @Ano AND e.Mes = @Mes;

        -- Atualiza Heatmap deste motorista
        DELETE FROM HeatmapViagensMensal
        WHERE Ano = @Ano AND Mes = @Mes AND MotoristaId = @MotoristaId;

        INSERT INTO HeatmapViagensMensal (Ano, Mes, MotoristaId, DiaSemana, Hora, TotalViagens, DataAtualizacao)
        SELECT
            @Ano, @Mes, @MotoristaId,
            DATEPART(WEEKDAY, v.DataInicial) - 1,
            DATEPART(HOUR, v.DataInicial),
            COUNT(*),
            GETDATE()
        FROM Viagem v
        WHERE v.MotoristaId = @MotoristaId
          AND v.DataInicial >= @DataInicio
          AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
        GROUP BY DATEPART(WEEKDAY, v.DataInicial), DATEPART(HOUR, v.DataInicial);

        -- Atualiza Evolução diária deste motorista
        DELETE FROM EvolucaoViagensDiaria
        WHERE Data >= @DataInicio AND Data <= @DataFim AND MotoristaId = @MotoristaId;

        INSERT INTO EvolucaoViagensDiaria (Data, MotoristaId, TotalViagens, KmTotal, MinutosTotais, DataAtualizacao)
        SELECT
            CAST(v.DataInicial AS DATE),
            @MotoristaId,
            COUNT(*),
            SUM(CASE
                WHEN v.KmInicial IS NOT NULL AND v.KmFinal IS NOT NULL
                     AND v.KmFinal >= v.KmInicial
                     AND (v.KmFinal - v.KmInicial) <= 2000
                THEN v.KmFinal - v.KmInicial
                ELSE 0
            END),
            SUM(ISNULL(v.Minutos, 0)),
            GETDATE()
        FROM Viagem v
        WHERE v.MotoristaId = @MotoristaId
          AND v.DataInicial >= @DataInicio
          AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
        GROUP BY CAST(v.DataInicial AS DATE);

    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasMotoristaUnico criada com sucesso.';
GO

-- =====================================================
-- 8. STORED PROCEDURE: Recalcular TODOS os meses históricos
-- (Executar uma vez para popular dados iniciais)
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularTodasEstatisticasMotoristas')
    DROP PROCEDURE sp_RecalcularTodasEstatisticasMotoristas;
GO

CREATE PROCEDURE sp_RecalcularTodasEstatisticasMotoristas
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AnoMes TABLE (Ano INT, Mes INT);

    -- Busca todos os anos/meses com viagens
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(DataInicial), MONTH(DataInicial)
    FROM Viagem
    WHERE DataInicial IS NOT NULL AND MotoristaId IS NOT NULL
    ORDER BY YEAR(DataInicial), MONTH(DataInicial);

    -- Adiciona meses de multas que não estão em viagens
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(Data), MONTH(Data)
    FROM Multa
    WHERE Data IS NOT NULL
      AND MotoristaId IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM @AnoMes am
          WHERE am.Ano = YEAR(Data) AND am.Mes = MONTH(Data)
      );

    -- Adiciona meses de abastecimentos que não estão nas anteriores
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(DataHora), MONTH(DataHora)
    FROM Abastecimento
    WHERE DataHora IS NOT NULL
      AND MotoristaId IS NOT NULL
      AND MotoristaId <> '00000000-0000-0000-0000-000000000000'
      AND NOT EXISTS (
          SELECT 1 FROM @AnoMes am
          WHERE am.Ano = YEAR(DataHora) AND am.Mes = MONTH(DataHora)
      );

    DECLARE @Ano INT, @Mes INT;
    DECLARE cur CURSOR FOR SELECT Ano, Mes FROM @AnoMes ORDER BY Ano, Mes;

    OPEN cur;
    FETCH NEXT FROM cur INTO @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT 'Processando ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + '...';
        EXEC sp_RecalcularEstatisticasMotoristas @Ano, @Mes;
        FETCH NEXT FROM cur INTO @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;

    PRINT 'Todas as estatísticas foram recalculadas!';
END
GO

PRINT 'Stored Procedure sp_RecalcularTodasEstatisticasMotoristas criada com sucesso.';
GO

-- =====================================================
-- 9. TRIGGERS para manter dados atualizados
-- =====================================================

-- Trigger para Viagem
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_Viagem_AtualizarEstatisticasMotoristas')
    DROP TRIGGER trg_Viagem_AtualizarEstatisticasMotoristas;
GO

CREATE TRIGGER trg_Viagem_AtualizarEstatisticasMotoristas
ON Viagem
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Coleta motoristas/meses afetados (inseridos/atualizados)
    DECLARE @Afetados TABLE (MotoristaId UNIQUEIDENTIFIER, Ano INT, Mes INT);

    INSERT INTO @Afetados (MotoristaId, Ano, Mes)
    SELECT DISTINCT MotoristaId, YEAR(DataInicial), MONTH(DataInicial)
    FROM inserted
    WHERE MotoristaId IS NOT NULL AND DataInicial IS NOT NULL;

    INSERT INTO @Afetados (MotoristaId, Ano, Mes)
    SELECT DISTINCT MotoristaId, YEAR(DataInicial), MONTH(DataInicial)
    FROM deleted
    WHERE MotoristaId IS NOT NULL AND DataInicial IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM @Afetados a
          WHERE a.MotoristaId = deleted.MotoristaId
            AND a.Ano = YEAR(deleted.DataInicial)
            AND a.Mes = MONTH(deleted.DataInicial)
      );

    -- Recalcula estatísticas para cada motorista/mês afetado
    DECLARE @MotoristaId UNIQUEIDENTIFIER, @Ano INT, @Mes INT;
    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
        SELECT DISTINCT MotoristaId, Ano, Mes FROM @Afetados;

    OPEN cur;
    FETCH NEXT FROM cur INTO @MotoristaId, @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_RecalcularEstatisticasMotoristaUnico @MotoristaId, @Ano, @Mes;
        FETCH NEXT FROM cur INTO @MotoristaId, @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;

    -- Recalcula estatísticas gerais dos meses afetados
    DECLARE cur2 CURSOR LOCAL FAST_FORWARD FOR
        SELECT DISTINCT Ano, Mes FROM @Afetados;

    OPEN cur2;
    FETCH NEXT FROM cur2 INTO @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Atualiza apenas os totais gerais
        UPDATE EstatisticaGeralMensal
        SET TotalViagens = ISNULL((SELECT SUM(TotalViagens) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            KmTotal = ISNULL((SELECT SUM(KmTotal) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            HorasTotais = ISNULL((SELECT SUM(MinutosTotais) / 60.0 FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            DataAtualizacao = GETDATE()
        WHERE Ano = @Ano AND Mes = @Mes;

        -- Atualiza heatmap geral do mês
        DELETE FROM HeatmapViagensMensal WHERE Ano = @Ano AND Mes = @Mes AND MotoristaId IS NULL;

        DECLARE @DataInicio DATE = DATEFROMPARTS(@Ano, @Mes, 1);
        DECLARE @DataFim DATE = EOMONTH(@DataInicio);

        INSERT INTO HeatmapViagensMensal (Ano, Mes, MotoristaId, DiaSemana, Hora, TotalViagens, DataAtualizacao)
        SELECT
            @Ano, @Mes, NULL,
            DATEPART(WEEKDAY, v.DataInicial) - 1,
            DATEPART(HOUR, v.DataInicial),
            COUNT(*),
            GETDATE()
        FROM Viagem v
        WHERE v.MotoristaId IS NOT NULL
          AND v.DataInicial >= @DataInicio
          AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
        GROUP BY DATEPART(WEEKDAY, v.DataInicial), DATEPART(HOUR, v.DataInicial);

        -- Atualiza evolução diária geral
        DELETE FROM EvolucaoViagensDiaria
        WHERE Data >= @DataInicio AND Data <= @DataFim AND MotoristaId IS NULL;

        INSERT INTO EvolucaoViagensDiaria (Data, MotoristaId, TotalViagens, KmTotal, MinutosTotais, DataAtualizacao)
        SELECT
            CAST(v.DataInicial AS DATE),
            NULL,
            COUNT(*),
            SUM(CASE
                WHEN v.KmInicial IS NOT NULL AND v.KmFinal IS NOT NULL
                     AND v.KmFinal >= v.KmInicial
                     AND (v.KmFinal - v.KmInicial) <= 2000
                THEN v.KmFinal - v.KmInicial
                ELSE 0
            END),
            SUM(ISNULL(v.Minutos, 0)),
            GETDATE()
        FROM Viagem v
        WHERE v.MotoristaId IS NOT NULL
          AND v.DataInicial >= @DataInicio
          AND v.DataInicial < DATEADD(DAY, 1, @DataFim)
        GROUP BY CAST(v.DataInicial AS DATE);

        FETCH NEXT FROM cur2 INTO @Ano, @Mes;
    END

    CLOSE cur2;
    DEALLOCATE cur2;
END
GO

PRINT 'Trigger trg_Viagem_AtualizarEstatisticasMotoristas criado com sucesso.';
GO

-- Trigger para Multa
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_Multa_AtualizarEstatisticasMotoristas')
    DROP TRIGGER trg_Multa_AtualizarEstatisticasMotoristas;
GO

CREATE TRIGGER trg_Multa_AtualizarEstatisticasMotoristas
ON Multa
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Afetados TABLE (MotoristaId UNIQUEIDENTIFIER, Ano INT, Mes INT);

    INSERT INTO @Afetados (MotoristaId, Ano, Mes)
    SELECT DISTINCT MotoristaId, YEAR(Data), MONTH(Data)
    FROM inserted
    WHERE MotoristaId IS NOT NULL AND Data IS NOT NULL;

    INSERT INTO @Afetados (MotoristaId, Ano, Mes)
    SELECT DISTINCT MotoristaId, YEAR(Data), MONTH(Data)
    FROM deleted
    WHERE MotoristaId IS NOT NULL AND Data IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM @Afetados a
          WHERE a.MotoristaId = deleted.MotoristaId
            AND a.Ano = YEAR(deleted.Data)
            AND a.Mes = MONTH(deleted.Data)
      );

    DECLARE @MotoristaId UNIQUEIDENTIFIER, @Ano INT, @Mes INT;
    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
        SELECT DISTINCT MotoristaId, Ano, Mes FROM @Afetados;

    OPEN cur;
    FETCH NEXT FROM cur INTO @MotoristaId, @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Atualiza apenas multas do motorista
        UPDATE e
        SET e.TotalMultas = ISNULL(m.Total, 0),
            e.ValorTotalMultas = ISNULL(m.Valor, 0),
            e.DataAtualizacao = GETDATE()
        FROM EstatisticaMotoristasMensal e
        LEFT JOIN (
            SELECT COUNT(*) as Total, SUM(ISNULL(ValorAteVencimento, 0)) as Valor
            FROM Multa
            WHERE MotoristaId = @MotoristaId
              AND YEAR(Data) = @Ano AND MONTH(Data) = @Mes
        ) m ON 1=1
        WHERE e.MotoristaId = @MotoristaId AND e.Ano = @Ano AND e.Mes = @Mes;

        -- Atualiza estatísticas gerais de multas
        UPDATE EstatisticaGeralMensal
        SET TotalMultas = ISNULL((SELECT SUM(TotalMultas) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            ValorTotalMultas = ISNULL((SELECT SUM(ValorTotalMultas) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            DataAtualizacao = GETDATE()
        WHERE Ano = @Ano AND Mes = @Mes;

        FETCH NEXT FROM cur INTO @MotoristaId, @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;
END
GO

PRINT 'Trigger trg_Multa_AtualizarEstatisticasMotoristas criado com sucesso.';
GO

-- Trigger para Abastecimento
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_Abastecimento_AtualizarEstatisticasMotoristas')
    DROP TRIGGER trg_Abastecimento_AtualizarEstatisticasMotoristas;
GO

CREATE TRIGGER trg_Abastecimento_AtualizarEstatisticasMotoristas
ON Abastecimento
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Afetados TABLE (MotoristaId UNIQUEIDENTIFIER, Ano INT, Mes INT);

    INSERT INTO @Afetados (MotoristaId, Ano, Mes)
    SELECT DISTINCT MotoristaId, YEAR(DataHora), MONTH(DataHora)
    FROM inserted
    WHERE MotoristaId IS NOT NULL
      AND MotoristaId <> '00000000-0000-0000-0000-000000000000'
      AND DataHora IS NOT NULL;

    INSERT INTO @Afetados (MotoristaId, Ano, Mes)
    SELECT DISTINCT MotoristaId, YEAR(DataHora), MONTH(DataHora)
    FROM deleted
    WHERE MotoristaId IS NOT NULL
      AND MotoristaId <> '00000000-0000-0000-0000-000000000000'
      AND DataHora IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM @Afetados a
          WHERE a.MotoristaId = deleted.MotoristaId
            AND a.Ano = YEAR(deleted.DataHora)
            AND a.Mes = MONTH(deleted.DataHora)
      );

    DECLARE @MotoristaId UNIQUEIDENTIFIER, @Ano INT, @Mes INT;
    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
        SELECT DISTINCT MotoristaId, Ano, Mes FROM @Afetados;

    OPEN cur;
    FETCH NEXT FROM cur INTO @MotoristaId, @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Atualiza apenas abastecimentos do motorista
        UPDATE e
        SET e.TotalAbastecimentos = ISNULL(a.Total, 0),
            e.LitrosTotais = ISNULL(a.Litros, 0),
            e.ValorTotalAbastecimentos = ISNULL(a.Valor, 0),
            e.DataAtualizacao = GETDATE()
        FROM EstatisticaMotoristasMensal e
        LEFT JOIN (
            SELECT COUNT(*) as Total,
                   SUM(ISNULL(Litros, 0)) as Litros,
                   SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)) as Valor
            FROM Abastecimento
            WHERE MotoristaId = @MotoristaId
              AND YEAR(DataHora) = @Ano AND MONTH(DataHora) = @Mes
        ) a ON 1=1
        WHERE e.MotoristaId = @MotoristaId AND e.Ano = @Ano AND e.Mes = @Mes;

        -- Atualiza estatísticas gerais de abastecimentos
        UPDATE EstatisticaGeralMensal
        SET TotalAbastecimentos = ISNULL((SELECT SUM(TotalAbastecimentos) FROM EstatisticaMotoristasMensal WHERE Ano = @Ano AND Mes = @Mes), 0),
            DataAtualizacao = GETDATE()
        WHERE Ano = @Ano AND Mes = @Mes;

        FETCH NEXT FROM cur INTO @MotoristaId, @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;
END
GO

PRINT 'Trigger trg_Abastecimento_AtualizarEstatisticasMotoristas criado com sucesso.';
GO

-- =====================================================
-- 10. JOB PARA ATUALIZAR ESTATÍSTICAS DE HORA EM HORA
-- =====================================================

-- Nota: Este job requer SQL Server Agent ativo
-- Em servidores Express, use o Agendador de Tarefas do Windows

-- Primeiro, verifica se o SQL Server Agent está disponível
IF EXISTS (SELECT * FROM sys.configurations WHERE name = 'Agent XPs' AND value_in_use = 1)
BEGIN
    -- Remove job existente se houver
    IF EXISTS (SELECT * FROM msdb.dbo.sysjobs WHERE name = 'FrotiX_AtualizarEstatisticasMotoristas')
    BEGIN
        EXEC msdb.dbo.sp_delete_job @job_name = 'FrotiX_AtualizarEstatisticasMotoristas';
        PRINT 'Job anterior removido.';
    END

    -- Cria o Job
    DECLARE @jobId BINARY(16);

    EXEC msdb.dbo.sp_add_job
        @job_name = N'FrotiX_AtualizarEstatisticasMotoristas',
        @enabled = 1,
        @description = N'Atualiza as tabelas estatísticas do Dashboard de Motoristas a cada hora',
        @category_name = N'[Uncategorized (Local)]',
        @owner_login_name = N'sa',
        @job_id = @jobId OUTPUT;

    PRINT 'Job criado com sucesso.';

    -- Adiciona Step para recalcular mês atual
    EXEC msdb.dbo.sp_add_jobstep
        @job_id = @jobId,
        @step_name = N'Recalcular Estatísticas do Mês Atual',
        @step_id = 1,
        @subsystem = N'TSQL',
        @command = N'
            DECLARE @Ano INT = YEAR(GETDATE());
            DECLARE @Mes INT = MONTH(GETDATE());
            EXEC sp_RecalcularEstatisticasMotoristas @Ano, @Mes;
            -- Recalcula também o mês anterior (para viagens/multas lançadas retroativamente)
            IF @Mes = 1
            BEGIN
                SET @Ano = @Ano - 1;
                SET @Mes = 12;
            END
            ELSE
                SET @Mes = @Mes - 1;
            EXEC sp_RecalcularEstatisticasMotoristas @Ano, @Mes;
        ',
        @database_name = N'FrotiX',
        @on_success_action = 1, -- Quit with success
        @on_fail_action = 2; -- Quit with failure

    PRINT 'Step do Job criado.';

    -- Adiciona Schedule (a cada hora)
    EXEC msdb.dbo.sp_add_jobschedule
        @job_id = @jobId,
        @name = N'Execução Horária',
        @enabled = 1,
        @freq_type = 4, -- Daily
        @freq_interval = 1,
        @freq_subday_type = 8, -- Hours
        @freq_subday_interval = 1, -- A cada 1 hora
        @active_start_date = 20260101,
        @active_start_time = 0; -- 00:00:00

    PRINT 'Schedule do Job criado (a cada hora).';

    -- Associa o Job ao servidor local
    EXEC msdb.dbo.sp_add_jobserver
        @job_id = @jobId,
        @server_name = N'(LOCAL)';

    PRINT 'Job associado ao servidor.';
    PRINT '';
    PRINT 'Job FrotiX_AtualizarEstatisticasMotoristas criado e configurado para executar a cada hora!';
END
ELSE
BEGIN
    PRINT '';
    PRINT '=====================================================';
    PRINT 'AVISO: SQL Server Agent não está disponível.';
    PRINT 'Para servidores SQL Express, use o Agendador de';
    PRINT 'Tarefas do Windows com o comando:';
    PRINT '';
    PRINT 'sqlcmd -S localhost -d FrotiX -Q "DECLARE @A INT=YEAR(GETDATE()),@M INT=MONTH(GETDATE()); EXEC sp_RecalcularEstatisticasMotoristas @A,@M;"';
    PRINT '=====================================================';
END
GO

-- =====================================================
-- 11. STORED PROCEDURE: Atualização rápida do mês atual
-- (Para chamada manual ou via aplicação)
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AtualizarEstatisticasMesAtual')
    DROP PROCEDURE sp_AtualizarEstatisticasMesAtual;
GO

CREATE PROCEDURE sp_AtualizarEstatisticasMesAtual
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Ano INT = YEAR(GETDATE());
    DECLARE @Mes INT = MONTH(GETDATE());

    -- Recalcula mês atual
    EXEC sp_RecalcularEstatisticasMotoristas @Ano, @Mes;

    -- Recalcula também mês anterior
    IF @Mes = 1
    BEGIN
        SET @Ano = @Ano - 1;
        SET @Mes = 12;
    END
    ELSE
        SET @Mes = @Mes - 1;

    EXEC sp_RecalcularEstatisticasMotoristas @Ano, @Mes;

    PRINT 'Estatísticas do mês atual e anterior atualizadas!';
END
GO

PRINT 'Stored Procedure sp_AtualizarEstatisticasMesAtual criada.';
GO

-- =====================================================
-- 12. EXECUTAR CARGA INICIAL DE DADOS
-- =====================================================

PRINT '';
PRINT '=====================================================';
PRINT 'IMPORTANTE: Execute os comandos abaixo para popular';
PRINT 'os dados iniciais das tabelas estatísticas:';
PRINT '';
PRINT '-- Primeira execução (popular todos os dados históricos):';
PRINT 'EXEC sp_RecalcularTodasEstatisticasMotoristas;';
PRINT '';
PRINT '-- Para atualizações manuais (mês atual e anterior):';
PRINT 'EXEC sp_AtualizarEstatisticasMesAtual;';
PRINT '=====================================================';
PRINT '';
GO
