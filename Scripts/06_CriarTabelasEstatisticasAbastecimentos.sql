-- =====================================================
-- Script: Tabelas Estatísticas para Dashboard Abastecimentos
-- Objetivo: Acelerar o carregamento do dashboard usando
--           dados pré-calculados atualizados via triggers
-- Data: 2026-01-05
-- =====================================================

USE FrotiX;
GO

-- =====================================================
-- 1. TABELA: Estatísticas Gerais Mensais de Abastecimento
-- Totais gerais por ano/mês
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoMensal' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaAbastecimentoMensal (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        Mes INT NOT NULL,

        -- Totais
        TotalAbastecimentos INT DEFAULT 0,
        ValorTotal DECIMAL(18,2) DEFAULT 0,
        LitrosTotal DECIMAL(18,2) DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatAbastMensal UNIQUE (Ano, Mes)
    );

    CREATE INDEX IX_EstatAbastMensal_AnoMes ON EstatisticaAbastecimentoMensal(Ano, Mes);

    PRINT 'Tabela EstatisticaAbastecimentoMensal criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaAbastecimentoMensal já existe.';
GO

-- =====================================================
-- 2. TABELA: Estatísticas por Combustível
-- Por ano/mês/combustível
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoCombustivel' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaAbastecimentoCombustivel (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        Mes INT NOT NULL,
        TipoCombustivel NVARCHAR(100) NOT NULL,

        -- Totais
        TotalAbastecimentos INT DEFAULT 0,
        ValorTotal DECIMAL(18,2) DEFAULT 0,
        LitrosTotal DECIMAL(18,2) DEFAULT 0,
        MediaValorLitro DECIMAL(18,4) DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatAbastComb UNIQUE (Ano, Mes, TipoCombustivel)
    );

    CREATE INDEX IX_EstatAbastComb_AnoMes ON EstatisticaAbastecimentoCombustivel(Ano, Mes);
    CREATE INDEX IX_EstatAbastComb_Comb ON EstatisticaAbastecimentoCombustivel(TipoCombustivel);

    PRINT 'Tabela EstatisticaAbastecimentoCombustivel criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaAbastecimentoCombustivel já existe.';
GO

-- =====================================================
-- 3. TABELA: Estatísticas por Categoria de Veículo
-- Por ano/mês/categoria (Ambulância, Carga Leve, etc)
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoCategoria' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaAbastecimentoCategoria (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        Mes INT NOT NULL,
        Categoria NVARCHAR(100) NOT NULL,

        -- Totais
        TotalAbastecimentos INT DEFAULT 0,
        ValorTotal DECIMAL(18,2) DEFAULT 0,
        LitrosTotal DECIMAL(18,2) DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatAbastCat UNIQUE (Ano, Mes, Categoria)
    );

    CREATE INDEX IX_EstatAbastCat_AnoMes ON EstatisticaAbastecimentoCategoria(Ano, Mes);
    CREATE INDEX IX_EstatAbastCat_Cat ON EstatisticaAbastecimentoCategoria(Categoria);

    PRINT 'Tabela EstatisticaAbastecimentoCategoria criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaAbastecimentoCategoria já existe.';
GO

-- =====================================================
-- 4. TABELA: Estatísticas por Tipo/Modelo de Veículo
-- Por ano/mês/tipoVeiculo (Ex: Gol, Corolla, etc)
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoTipoVeiculo' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaAbastecimentoTipoVeiculo (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        Mes INT NOT NULL,
        TipoVeiculo NVARCHAR(100) NOT NULL,

        -- Totais
        TotalAbastecimentos INT DEFAULT 0,
        ValorTotal DECIMAL(18,2) DEFAULT 0,
        LitrosTotal DECIMAL(18,2) DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatAbastTipo UNIQUE (Ano, Mes, TipoVeiculo)
    );

    CREATE INDEX IX_EstatAbastTipo_AnoMes ON EstatisticaAbastecimentoTipoVeiculo(Ano, Mes);
    CREATE INDEX IX_EstatAbastTipo_Tipo ON EstatisticaAbastecimentoTipoVeiculo(TipoVeiculo);

    PRINT 'Tabela EstatisticaAbastecimentoTipoVeiculo criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaAbastecimentoTipoVeiculo já existe.';
GO

-- =====================================================
-- 5. TABELA: Estatísticas por Veículo (Placa)
-- Por ano/veículo - para rankings
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoVeiculo' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaAbastecimentoVeiculo (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        VeiculoId UNIQUEIDENTIFIER NOT NULL,
        Placa NVARCHAR(20),
        TipoVeiculo NVARCHAR(100),
        Categoria NVARCHAR(100),

        -- Totais do ano
        TotalAbastecimentos INT DEFAULT 0,
        ValorTotal DECIMAL(18,2) DEFAULT 0,
        LitrosTotal DECIMAL(18,2) DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatAbastVeiculo UNIQUE (Ano, VeiculoId)
    );

    CREATE INDEX IX_EstatAbastVeiculo_Ano ON EstatisticaAbastecimentoVeiculo(Ano);
    CREATE INDEX IX_EstatAbastVeiculo_Veiculo ON EstatisticaAbastecimentoVeiculo(VeiculoId);
    CREATE INDEX IX_EstatAbastVeiculo_Valor ON EstatisticaAbastecimentoVeiculo(Ano, ValorTotal DESC);

    PRINT 'Tabela EstatisticaAbastecimentoVeiculo criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaAbastecimentoVeiculo já existe.';
GO

-- =====================================================
-- 6. TABELA: Consumo Mensal por Veículo
-- Por ano/mês/veículo - para gráficos de evolução
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoVeiculoMensal' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaAbastecimentoVeiculoMensal (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        Mes INT NOT NULL,
        VeiculoId UNIQUEIDENTIFIER NOT NULL,

        -- Totais do mês
        TotalAbastecimentos INT DEFAULT 0,
        ValorTotal DECIMAL(18,2) DEFAULT 0,
        LitrosTotal DECIMAL(18,2) DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatAbastVeiculoMes UNIQUE (Ano, Mes, VeiculoId)
    );

    CREATE INDEX IX_EstatAbastVeiculoMes_AnoMes ON EstatisticaAbastecimentoVeiculoMensal(Ano, Mes);
    CREATE INDEX IX_EstatAbastVeiculoMes_Veiculo ON EstatisticaAbastecimentoVeiculoMensal(VeiculoId);

    PRINT 'Tabela EstatisticaAbastecimentoVeiculoMensal criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaAbastecimentoVeiculoMensal já existe.';
GO

-- =====================================================
-- 7. TABELA: Heatmap de Abastecimentos
-- Dia da Semana x Hora por ano/mês
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HeatmapAbastecimentoMensal' AND xtype='U')
BEGIN
    CREATE TABLE HeatmapAbastecimentoMensal (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        Mes INT NOT NULL,
        VeiculoId UNIQUEIDENTIFIER NULL, -- NULL = todos os veículos
        TipoVeiculo NVARCHAR(100) NULL, -- NULL = todos os tipos

        DiaSemana INT NOT NULL, -- 0=Domingo, 1=Segunda, ... 6=Sábado
        Hora INT NOT NULL, -- 0-23

        TotalAbastecimentos INT DEFAULT 0,
        ValorTotal DECIMAL(18,2) DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME DEFAULT GETDATE()
    );

    -- Índice para heatmap geral (todos veículos/tipos)
    CREATE UNIQUE INDEX IX_HeatmapAbast_Geral ON HeatmapAbastecimentoMensal(Ano, Mes, DiaSemana, Hora)
        WHERE VeiculoId IS NULL AND TipoVeiculo IS NULL;

    -- Índice para heatmap por tipo de veículo
    CREATE INDEX IX_HeatmapAbast_Tipo ON HeatmapAbastecimentoMensal(Ano, Mes, TipoVeiculo)
        WHERE TipoVeiculo IS NOT NULL;

    -- Índice para heatmap por veículo específico
    CREATE INDEX IX_HeatmapAbast_Veiculo ON HeatmapAbastecimentoMensal(Ano, VeiculoId)
        WHERE VeiculoId IS NOT NULL;

    CREATE INDEX IX_HeatmapAbast_AnoMes ON HeatmapAbastecimentoMensal(Ano, Mes);

    PRINT 'Tabela HeatmapAbastecimentoMensal criada com sucesso.';
END
ELSE
    PRINT 'Tabela HeatmapAbastecimentoMensal já existe.';
GO

-- =====================================================
-- 8. TABELA: Anos Disponíveis (cache)
-- Lista de anos com abastecimentos
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AnosDisponiveisAbastecimento' AND xtype='U')
BEGIN
    CREATE TABLE AnosDisponiveisAbastecimento (
        Ano INT PRIMARY KEY,
        TotalAbastecimentos INT DEFAULT 0,
        DataAtualizacao DATETIME DEFAULT GETDATE()
    );

    PRINT 'Tabela AnosDisponiveisAbastecimento criada com sucesso.';
END
ELSE
    PRINT 'Tabela AnosDisponiveisAbastecimento já existe.';
GO

-- =====================================================
-- 9. STORED PROCEDURE: Recalcular Estatísticas de um Mês
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasAbastecimentos')
    DROP PROCEDURE sp_RecalcularEstatisticasAbastecimentos;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasAbastecimentos
    @Ano INT,
    @Mes INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DataInicio DATE = DATEFROMPARTS(@Ano, @Mes, 1);
    DECLARE @DataFim DATE = EOMONTH(@DataInicio);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- =====================================================
        -- 9.1 Estatísticas Gerais do Mês
        -- =====================================================

        DELETE FROM EstatisticaAbastecimentoMensal WHERE Ano = @Ano AND Mes = @Mes;

        INSERT INTO EstatisticaAbastecimentoMensal (Ano, Mes, TotalAbastecimentos, ValorTotal, LitrosTotal, DataAtualizacao)
        SELECT
            @Ano,
            @Mes,
            COUNT(*),
            SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)),
            SUM(ISNULL(Litros, 0)),
            GETDATE()
        FROM Abastecimento
        WHERE DataHora >= @DataInicio AND DataHora < DATEADD(DAY, 1, @DataFim);

        -- =====================================================
        -- 9.2 Estatísticas por Combustível
        -- =====================================================

        DELETE FROM EstatisticaAbastecimentoCombustivel WHERE Ano = @Ano AND Mes = @Mes;

        INSERT INTO EstatisticaAbastecimentoCombustivel (Ano, Mes, TipoCombustivel, TotalAbastecimentos, ValorTotal, LitrosTotal, MediaValorLitro, DataAtualizacao)
        SELECT
            @Ano,
            @Mes,
            ISNULL(c.Descricao, 'Não Informado'),
            COUNT(*),
            SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
            SUM(ISNULL(a.Litros, 0)),
            AVG(ISNULL(a.ValorUnitario, 0)),
            GETDATE()
        FROM Abastecimento a
        LEFT JOIN Combustivel c ON a.CombustivelId = c.CombustivelId
        WHERE a.DataHora >= @DataInicio AND a.DataHora < DATEADD(DAY, 1, @DataFim)
        GROUP BY c.Descricao;

        -- =====================================================
        -- 9.3 Estatísticas por Categoria de Veículo
        -- =====================================================

        DELETE FROM EstatisticaAbastecimentoCategoria WHERE Ano = @Ano AND Mes = @Mes;

        INSERT INTO EstatisticaAbastecimentoCategoria (Ano, Mes, Categoria, TotalAbastecimentos, ValorTotal, LitrosTotal, DataAtualizacao)
        SELECT
            @Ano,
            @Mes,
            ISNULL(v.Categoria, 'Sem Categoria'),
            COUNT(*),
            SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
            SUM(ISNULL(a.Litros, 0)),
            GETDATE()
        FROM Abastecimento a
        LEFT JOIN Veiculo v ON a.VeiculoId = v.VeiculoId
        WHERE a.DataHora >= @DataInicio AND a.DataHora < DATEADD(DAY, 1, @DataFim)
        GROUP BY v.Categoria;

        -- =====================================================
        -- 9.4 Estatísticas por Tipo/Modelo de Veículo
        -- =====================================================

        DELETE FROM EstatisticaAbastecimentoTipoVeiculo WHERE Ano = @Ano AND Mes = @Mes;

        INSERT INTO EstatisticaAbastecimentoTipoVeiculo (Ano, Mes, TipoVeiculo, TotalAbastecimentos, ValorTotal, LitrosTotal, DataAtualizacao)
        SELECT
            @Ano,
            @Mes,
            ISNULL(m.DescricaoModelo, 'Não Informado'),
            COUNT(*),
            SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
            SUM(ISNULL(a.Litros, 0)),
            GETDATE()
        FROM Abastecimento a
        LEFT JOIN Veiculo v ON a.VeiculoId = v.VeiculoId
        LEFT JOIN ModeloVeiculo m ON v.ModeloId = m.ModeloId
        WHERE a.DataHora >= @DataInicio AND a.DataHora < DATEADD(DAY, 1, @DataFim)
        GROUP BY m.DescricaoModelo;

        -- =====================================================
        -- 9.5 Estatísticas por Veículo Mensal
        -- =====================================================

        DELETE FROM EstatisticaAbastecimentoVeiculoMensal WHERE Ano = @Ano AND Mes = @Mes;

        INSERT INTO EstatisticaAbastecimentoVeiculoMensal (Ano, Mes, VeiculoId, TotalAbastecimentos, ValorTotal, LitrosTotal, DataAtualizacao)
        SELECT
            @Ano,
            @Mes,
            a.VeiculoId,
            COUNT(*),
            SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
            SUM(ISNULL(a.Litros, 0)),
            GETDATE()
        FROM Abastecimento a
        WHERE a.DataHora >= @DataInicio AND a.DataHora < DATEADD(DAY, 1, @DataFim)
          AND a.VeiculoId IS NOT NULL AND a.VeiculoId <> '00000000-0000-0000-0000-000000000000'
        GROUP BY a.VeiculoId;

        -- =====================================================
        -- 9.6 Heatmap Geral (todos os veículos)
        -- =====================================================

        DELETE FROM HeatmapAbastecimentoMensal
        WHERE Ano = @Ano AND Mes = @Mes AND VeiculoId IS NULL AND TipoVeiculo IS NULL;

        INSERT INTO HeatmapAbastecimentoMensal (Ano, Mes, VeiculoId, TipoVeiculo, DiaSemana, Hora, TotalAbastecimentos, ValorTotal, DataAtualizacao)
        SELECT
            @Ano, @Mes, NULL, NULL,
            DATEPART(WEEKDAY, DataHora) - 1, -- 0=Domingo
            DATEPART(HOUR, DataHora),
            COUNT(*),
            SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)),
            GETDATE()
        FROM Abastecimento
        WHERE DataHora >= @DataInicio AND DataHora < DATEADD(DAY, 1, @DataFim)
        GROUP BY DATEPART(WEEKDAY, DataHora), DATEPART(HOUR, DataHora);

        COMMIT TRANSACTION;

        PRINT 'Estatísticas de abastecimentos do mês ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + ' recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasAbastecimentos criada com sucesso.';
GO

-- =====================================================
-- 10. STORED PROCEDURE: Recalcular Estatísticas Anuais por Veículo
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasAbastecimentosAnuais')
    DROP PROCEDURE sp_RecalcularEstatisticasAbastecimentosAnuais;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasAbastecimentosAnuais
    @Ano INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Recalcula estatísticas anuais por veículo (para ranking)
        DELETE FROM EstatisticaAbastecimentoVeiculo WHERE Ano = @Ano;

        INSERT INTO EstatisticaAbastecimentoVeiculo (Ano, VeiculoId, Placa, TipoVeiculo, Categoria, TotalAbastecimentos, ValorTotal, LitrosTotal, DataAtualizacao)
        SELECT
            @Ano,
            a.VeiculoId,
            v.Placa,
            m.DescricaoModelo,
            v.Categoria,
            COUNT(*),
            SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
            SUM(ISNULL(a.Litros, 0)),
            GETDATE()
        FROM Abastecimento a
        INNER JOIN Veiculo v ON a.VeiculoId = v.VeiculoId
        LEFT JOIN ModeloVeiculo m ON v.ModeloId = m.ModeloId
        WHERE YEAR(a.DataHora) = @Ano
          AND a.VeiculoId IS NOT NULL AND a.VeiculoId <> '00000000-0000-0000-0000-000000000000'
        GROUP BY a.VeiculoId, v.Placa, m.DescricaoModelo, v.Categoria;

        -- Atualiza lista de anos disponíveis
        DELETE FROM AnosDisponiveisAbastecimento WHERE Ano = @Ano;

        INSERT INTO AnosDisponiveisAbastecimento (Ano, TotalAbastecimentos, DataAtualizacao)
        SELECT @Ano, COUNT(*), GETDATE()
        FROM Abastecimento
        WHERE YEAR(DataHora) = @Ano;

        COMMIT TRANSACTION;

        PRINT 'Estatísticas anuais de abastecimentos do ano ' + CAST(@Ano AS VARCHAR) + ' recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasAbastecimentosAnuais criada com sucesso.';
GO

-- =====================================================
-- 11. STORED PROCEDURE: Recalcular TODOS os dados históricos
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularTodasEstatisticasAbastecimentos')
    DROP PROCEDURE sp_RecalcularTodasEstatisticasAbastecimentos;
GO

CREATE PROCEDURE sp_RecalcularTodasEstatisticasAbastecimentos
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AnoMes TABLE (Ano INT, Mes INT);

    -- Busca todos os anos/meses com abastecimentos
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(DataHora), MONTH(DataHora)
    FROM Abastecimento
    WHERE DataHora IS NOT NULL
    ORDER BY YEAR(DataHora), MONTH(DataHora);

    DECLARE @Ano INT, @Mes INT;
    DECLARE cur CURSOR FOR SELECT Ano, Mes FROM @AnoMes ORDER BY Ano, Mes;

    OPEN cur;
    FETCH NEXT FROM cur INTO @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT 'Processando ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + '...';
        EXEC sp_RecalcularEstatisticasAbastecimentos @Ano, @Mes;
        FETCH NEXT FROM cur INTO @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;

    -- Recalcula estatísticas anuais
    DECLARE @Anos TABLE (Ano INT);
    INSERT INTO @Anos SELECT DISTINCT Ano FROM @AnoMes;

    DECLARE cur2 CURSOR FOR SELECT Ano FROM @Anos ORDER BY Ano;
    OPEN cur2;
    FETCH NEXT FROM cur2 INTO @Ano;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT 'Processando estatísticas anuais de ' + CAST(@Ano AS VARCHAR) + '...';
        EXEC sp_RecalcularEstatisticasAbastecimentosAnuais @Ano;
        FETCH NEXT FROM cur2 INTO @Ano;
    END

    CLOSE cur2;
    DEALLOCATE cur2;

    PRINT 'Todas as estatísticas de abastecimentos foram recalculadas!';
END
GO

PRINT 'Stored Procedure sp_RecalcularTodasEstatisticasAbastecimentos criada com sucesso.';
GO

-- =====================================================
-- 12. STORED PROCEDURE: Atualização rápida do mês atual
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AtualizarEstatisticasAbastecimentosMesAtual')
    DROP PROCEDURE sp_AtualizarEstatisticasAbastecimentosMesAtual;
GO

CREATE PROCEDURE sp_AtualizarEstatisticasAbastecimentosMesAtual
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Ano INT = YEAR(GETDATE());
    DECLARE @Mes INT = MONTH(GETDATE());

    -- Recalcula mês atual
    EXEC sp_RecalcularEstatisticasAbastecimentos @Ano, @Mes;
    EXEC sp_RecalcularEstatisticasAbastecimentosAnuais @Ano;

    -- Recalcula também mês anterior
    IF @Mes = 1
    BEGIN
        SET @Ano = @Ano - 1;
        SET @Mes = 12;
    END
    ELSE
        SET @Mes = @Mes - 1;

    EXEC sp_RecalcularEstatisticasAbastecimentos @Ano, @Mes;

    PRINT 'Estatísticas de abastecimentos do mês atual e anterior atualizadas!';
END
GO

PRINT 'Stored Procedure sp_AtualizarEstatisticasAbastecimentosMesAtual criada.';
GO

-- =====================================================
-- 13. TRIGGER para manter dados atualizados
-- =====================================================

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_Abastecimento_AtualizarEstatisticas')
    DROP TRIGGER trg_Abastecimento_AtualizarEstatisticas;
GO

CREATE TRIGGER trg_Abastecimento_AtualizarEstatisticas
ON Abastecimento
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Coleta anos/meses afetados
    DECLARE @Afetados TABLE (Ano INT, Mes INT);

    INSERT INTO @Afetados (Ano, Mes)
    SELECT DISTINCT YEAR(DataHora), MONTH(DataHora)
    FROM inserted
    WHERE DataHora IS NOT NULL;

    INSERT INTO @Afetados (Ano, Mes)
    SELECT DISTINCT YEAR(DataHora), MONTH(DataHora)
    FROM deleted
    WHERE DataHora IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM @Afetados a
          WHERE a.Ano = YEAR(deleted.DataHora)
            AND a.Mes = MONTH(deleted.DataHora)
      );

    -- Recalcula estatísticas para cada mês afetado
    DECLARE @Ano INT, @Mes INT;
    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
        SELECT DISTINCT Ano, Mes FROM @Afetados;

    OPEN cur;
    FETCH NEXT FROM cur INTO @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_RecalcularEstatisticasAbastecimentos @Ano, @Mes;
        FETCH NEXT FROM cur INTO @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;

    -- Recalcula estatísticas anuais
    DECLARE cur2 CURSOR LOCAL FAST_FORWARD FOR
        SELECT DISTINCT Ano FROM @Afetados;

    OPEN cur2;
    FETCH NEXT FROM cur2 INTO @Ano;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_RecalcularEstatisticasAbastecimentosAnuais @Ano;
        FETCH NEXT FROM cur2 INTO @Ano;
    END

    CLOSE cur2;
    DEALLOCATE cur2;
END
GO

PRINT 'Trigger trg_Abastecimento_AtualizarEstatisticas criado com sucesso.';
GO

-- =====================================================
-- 14. JOB: Atualização automática de hora em hora
-- =====================================================

USE msdb;
GO

-- Remove job existente se houver
IF EXISTS (SELECT job_id FROM msdb.dbo.sysjobs WHERE name = N'FrotiX_AtualizarEstatisticasAbastecimentos')
BEGIN
    EXEC msdb.dbo.sp_delete_job @job_name = N'FrotiX_AtualizarEstatisticasAbastecimentos';
    PRINT 'Job existente removido.';
END
GO

-- Cria o Job
EXEC msdb.dbo.sp_add_job
    @job_name = N'FrotiX_AtualizarEstatisticasAbastecimentos',
    @enabled = 1,
    @description = N'Atualiza as tabelas estatísticas de abastecimentos do FrotiX de hora em hora',
    @category_name = N'Database Maintenance',
    @owner_login_name = N'sa';
GO

-- Adiciona o Step do Job
EXEC msdb.dbo.sp_add_jobstep
    @job_name = N'FrotiX_AtualizarEstatisticasAbastecimentos',
    @step_name = N'Executar sp_AtualizarEstatisticasAbastecimentosMesAtual',
    @step_id = 1,
    @subsystem = N'TSQL',
    @command = N'EXEC sp_AtualizarEstatisticasAbastecimentosMesAtual;',
    @database_name = N'FrotiX',
    @retry_attempts = 3,
    @retry_interval = 5,
    @on_success_action = 1, -- Quit with success
    @on_fail_action = 2;    -- Quit with failure
GO

-- Cria o Schedule (de hora em hora)
EXEC msdb.dbo.sp_add_jobschedule
    @job_name = N'FrotiX_AtualizarEstatisticasAbastecimentos',
    @name = N'Executar de hora em hora',
    @enabled = 1,
    @freq_type = 4,           -- Diário
    @freq_interval = 1,       -- A cada 1 dia
    @freq_subday_type = 8,    -- Horas
    @freq_subday_interval = 1, -- A cada 1 hora
    @active_start_date = 20260101,
    @active_end_date = 99991231,
    @active_start_time = 000000,  -- Começa à meia-noite
    @active_end_time = 235959;    -- Até 23:59:59
GO

-- Associa o Job ao servidor local
EXEC msdb.dbo.sp_add_jobserver
    @job_name = N'FrotiX_AtualizarEstatisticasAbastecimentos',
    @server_name = N'(local)';
GO

PRINT 'Job FrotiX_AtualizarEstatisticasAbastecimentos criado com sucesso (executa de hora em hora).';
GO

USE FrotiX;
GO

-- =====================================================
-- 15. INSTRUÇÕES FINAIS
-- =====================================================

PRINT '';
PRINT '=====================================================';
PRINT 'IMPORTANTE: Execute o comando abaixo para popular';
PRINT 'os dados iniciais das tabelas estatísticas:';
PRINT '';
PRINT '-- Primeira execução (popular todos os dados históricos):';
PRINT 'EXEC sp_RecalcularTodasEstatisticasAbastecimentos;';
PRINT '';
PRINT '-- Para atualizações manuais (mês atual e anterior):';
PRINT 'EXEC sp_AtualizarEstatisticasAbastecimentosMesAtual;';
PRINT '';
PRINT '-- Job criado: FrotiX_AtualizarEstatisticasAbastecimentos';
PRINT '-- Executa automaticamente de hora em hora';
PRINT '=====================================================';
PRINT '';
GO
