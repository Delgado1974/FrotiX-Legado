-- =====================================================
-- Script: Tabelas Estatísticas para Dashboard de Veículos
-- Objetivo: Acelerar o carregamento do dashboard usando
--           dados pré-calculados atualizados via triggers
-- Data: 2026-01-05
-- =====================================================

USE FrotiX;
GO

-- =====================================================
-- CORREÇÃO: Atualizar NULLs para 0 nas tabelas existentes
-- (Corrige erro SqlBuffer.get_Decimal() no Dashboard Abastecimento)
-- =====================================================

PRINT 'Corrigindo valores NULL nas tabelas de estatísticas existentes...';

-- EstatisticaAbastecimentoMensal
IF EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoMensal' AND xtype='U')
BEGIN
    UPDATE EstatisticaAbastecimentoMensal SET ValorTotal = 0 WHERE ValorTotal IS NULL;
    UPDATE EstatisticaAbastecimentoMensal SET LitrosTotal = 0 WHERE LitrosTotal IS NULL;
    UPDATE EstatisticaAbastecimentoMensal SET TotalAbastecimentos = 0 WHERE TotalAbastecimentos IS NULL;
    PRINT '  - EstatisticaAbastecimentoMensal corrigida';
END

-- EstatisticaAbastecimentoCombustivel
IF EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoCombustivel' AND xtype='U')
BEGIN
    UPDATE EstatisticaAbastecimentoCombustivel SET ValorTotal = 0 WHERE ValorTotal IS NULL;
    UPDATE EstatisticaAbastecimentoCombustivel SET LitrosTotal = 0 WHERE LitrosTotal IS NULL;
    UPDATE EstatisticaAbastecimentoCombustivel SET MediaValorLitro = 0 WHERE MediaValorLitro IS NULL;
    UPDATE EstatisticaAbastecimentoCombustivel SET TotalAbastecimentos = 0 WHERE TotalAbastecimentos IS NULL;
    PRINT '  - EstatisticaAbastecimentoCombustivel corrigida';
END

-- EstatisticaAbastecimentoCategoria
IF EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoCategoria' AND xtype='U')
BEGIN
    UPDATE EstatisticaAbastecimentoCategoria SET ValorTotal = 0 WHERE ValorTotal IS NULL;
    UPDATE EstatisticaAbastecimentoCategoria SET LitrosTotal = 0 WHERE LitrosTotal IS NULL;
    UPDATE EstatisticaAbastecimentoCategoria SET TotalAbastecimentos = 0 WHERE TotalAbastecimentos IS NULL;
    PRINT '  - EstatisticaAbastecimentoCategoria corrigida';
END

-- EstatisticaAbastecimentoTipoVeiculo
IF EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoTipoVeiculo' AND xtype='U')
BEGIN
    UPDATE EstatisticaAbastecimentoTipoVeiculo SET ValorTotal = 0 WHERE ValorTotal IS NULL;
    UPDATE EstatisticaAbastecimentoTipoVeiculo SET LitrosTotal = 0 WHERE LitrosTotal IS NULL;
    UPDATE EstatisticaAbastecimentoTipoVeiculo SET TotalAbastecimentos = 0 WHERE TotalAbastecimentos IS NULL;
    PRINT '  - EstatisticaAbastecimentoTipoVeiculo corrigida';
END

-- EstatisticaAbastecimentoVeiculo
IF EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoVeiculo' AND xtype='U')
BEGIN
    UPDATE EstatisticaAbastecimentoVeiculo SET ValorTotal = 0 WHERE ValorTotal IS NULL;
    UPDATE EstatisticaAbastecimentoVeiculo SET LitrosTotal = 0 WHERE LitrosTotal IS NULL;
    UPDATE EstatisticaAbastecimentoVeiculo SET TotalAbastecimentos = 0 WHERE TotalAbastecimentos IS NULL;
    PRINT '  - EstatisticaAbastecimentoVeiculo corrigida';
END

-- EstatisticaAbastecimentoVeiculoMensal
IF EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaAbastecimentoVeiculoMensal' AND xtype='U')
BEGIN
    UPDATE EstatisticaAbastecimentoVeiculoMensal SET ValorTotal = 0 WHERE ValorTotal IS NULL;
    UPDATE EstatisticaAbastecimentoVeiculoMensal SET LitrosTotal = 0 WHERE LitrosTotal IS NULL;
    UPDATE EstatisticaAbastecimentoVeiculoMensal SET TotalAbastecimentos = 0 WHERE TotalAbastecimentos IS NULL;
    PRINT '  - EstatisticaAbastecimentoVeiculoMensal corrigida';
END

-- HeatmapAbastecimentoMensal
IF EXISTS (SELECT * FROM sysobjects WHERE name='HeatmapAbastecimentoMensal' AND xtype='U')
BEGIN
    UPDATE HeatmapAbastecimentoMensal SET ValorTotal = 0 WHERE ValorTotal IS NULL;
    UPDATE HeatmapAbastecimentoMensal SET TotalAbastecimentos = 0 WHERE TotalAbastecimentos IS NULL;
    PRINT '  - HeatmapAbastecimentoMensal corrigida';
END

PRINT 'Correção de NULLs concluída!';
PRINT '';
GO

-- =====================================================
-- 1. TABELA: Estatísticas Gerais de Veículos
-- Visão geral da frota (snapshot atual)
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoGeral' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoGeral (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

        -- Totais
        TotalVeiculos INT NOT NULL DEFAULT 0,
        VeiculosAtivos INT NOT NULL DEFAULT 0,
        VeiculosInativos INT NOT NULL DEFAULT 0,
        VeiculosProprios INT NOT NULL DEFAULT 0,
        VeiculosLocados INT NOT NULL DEFAULT 0,

        -- Médias
        IdadeMediaAnos DECIMAL(10,2) NOT NULL DEFAULT 0,
        KmMedioRodado DECIMAL(18,2) NOT NULL DEFAULT 0,

        -- Valores
        ValorMensalLocacao DECIMAL(18,2) NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE()
    );

    PRINT 'Tabela EstatisticaVeiculoGeral criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoGeral já existe.';
GO

-- =====================================================
-- 2. TABELA: Estatísticas por Categoria de Veículo
-- Ambulância, Carga Leve, Passeio, etc.
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoCategoria' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoCategoria (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Categoria NVARCHAR(100) NOT NULL,

        -- Totais
        TotalVeiculos INT NOT NULL DEFAULT 0,
        VeiculosAtivos INT NOT NULL DEFAULT 0,
        VeiculosProprios INT NOT NULL DEFAULT 0,
        VeiculosLocados INT NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatVeicCategoria UNIQUE (Categoria)
    );

    CREATE INDEX IX_EstatVeicCategoria ON EstatisticaVeiculoCategoria(Categoria);

    PRINT 'Tabela EstatisticaVeiculoCategoria criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoCategoria já existe.';
GO

-- =====================================================
-- 3. TABELA: Estatísticas por Status
-- Ativo, Inativo, Em Manutenção, etc.
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoStatus' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoStatus (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Status NVARCHAR(50) NOT NULL,

        -- Totais
        TotalVeiculos INT NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatVeicStatus UNIQUE (Status)
    );

    CREATE INDEX IX_EstatVeicStatus ON EstatisticaVeiculoStatus(Status);

    PRINT 'Tabela EstatisticaVeiculoStatus criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoStatus já existe.';
GO

-- =====================================================
-- 4. TABELA: Estatísticas por Tipo/Modelo
-- Gol, Corolla, Hilux, etc.
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoModelo' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoModelo (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ModeloId UNIQUEIDENTIFIER NULL,
        Modelo NVARCHAR(100) NOT NULL,

        -- Totais
        TotalVeiculos INT NOT NULL DEFAULT 0,
        VeiculosAtivos INT NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatVeicModelo UNIQUE (Modelo)
    );

    CREATE INDEX IX_EstatVeicModelo ON EstatisticaVeiculoModelo(Modelo);

    PRINT 'Tabela EstatisticaVeiculoModelo criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoModelo já existe.';
GO

-- =====================================================
-- 5. TABELA: Estatísticas por Combustível
-- Gasolina, Diesel, Flex, Elétrico, etc.
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoCombustivel' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoCombustivel (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Combustivel NVARCHAR(100) NOT NULL,

        -- Totais
        TotalVeiculos INT NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatVeicCombustivel UNIQUE (Combustivel)
    );

    CREATE INDEX IX_EstatVeicCombustivel ON EstatisticaVeiculoCombustivel(Combustivel);

    PRINT 'Tabela EstatisticaVeiculoCombustivel criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoCombustivel já existe.';
GO

-- =====================================================
-- 6. TABELA: Estatísticas por Unidade
-- Por unidade usuária
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoUnidade' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoUnidade (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UnidadeId UNIQUEIDENTIFIER NULL,
        Unidade NVARCHAR(200) NOT NULL,

        -- Totais
        TotalVeiculos INT NOT NULL DEFAULT 0,
        VeiculosAtivos INT NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatVeicUnidade UNIQUE (Unidade)
    );

    CREATE INDEX IX_EstatVeicUnidade ON EstatisticaVeiculoUnidade(Unidade);

    PRINT 'Tabela EstatisticaVeiculoUnidade criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoUnidade já existe.';
GO

-- =====================================================
-- 7. TABELA: Estatísticas por Ano de Fabricação
-- Para análise de idade da frota
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoAnoFabricacao' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoAnoFabricacao (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        AnoFabricacao INT NOT NULL,

        -- Totais
        TotalVeiculos INT NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatVeicAnoFab UNIQUE (AnoFabricacao)
    );

    CREATE INDEX IX_EstatVeicAnoFab ON EstatisticaVeiculoAnoFabricacao(AnoFabricacao);

    PRINT 'Tabela EstatisticaVeiculoAnoFabricacao criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoAnoFabricacao já existe.';
GO

-- =====================================================
-- 8. TABELA: Estatísticas de Uso Mensal
-- Viagens e Abastecimentos por ano/mês
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoUsoMensal' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoUsoMensal (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        Mes INT NOT NULL,

        -- Viagens
        TotalViagens INT NOT NULL DEFAULT 0,
        KmTotalRodado DECIMAL(18,2) NOT NULL DEFAULT 0,

        -- Abastecimentos
        TotalAbastecimentos INT NOT NULL DEFAULT 0,
        LitrosTotal DECIMAL(18,2) NOT NULL DEFAULT 0,
        ValorAbastecimento DECIMAL(18,2) NOT NULL DEFAULT 0,

        -- Consumo médio (km/l)
        ConsumoMedio DECIMAL(10,2) NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatVeicUsoMensal UNIQUE (Ano, Mes)
    );

    CREATE INDEX IX_EstatVeicUsoMensal_AnoMes ON EstatisticaVeiculoUsoMensal(Ano, Mes);

    PRINT 'Tabela EstatisticaVeiculoUsoMensal criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoUsoMensal já existe.';
GO

-- =====================================================
-- 9. TABELA: Ranking de Veículos por KM Rodado
-- Top veículos que mais rodaram
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoRankingKm' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoRankingKm (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        VeiculoId UNIQUEIDENTIFIER NOT NULL,
        Placa NVARCHAR(20) NULL,
        Modelo NVARCHAR(100) NULL,

        -- Totais
        KmRodado DECIMAL(18,2) NOT NULL DEFAULT 0,
        TotalViagens INT NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatVeicRankKm UNIQUE (Ano, VeiculoId)
    );

    CREATE INDEX IX_EstatVeicRankKm_Ano ON EstatisticaVeiculoRankingKm(Ano);
    CREATE INDEX IX_EstatVeicRankKm_Km ON EstatisticaVeiculoRankingKm(Ano, KmRodado DESC);

    PRINT 'Tabela EstatisticaVeiculoRankingKm criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoRankingKm já existe.';
GO

-- =====================================================
-- 10. TABELA: Ranking de Veículos por Consumo (km/l)
-- Veículos mais e menos eficientes
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoRankingConsumo' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoRankingConsumo (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        VeiculoId UNIQUEIDENTIFIER NOT NULL,
        Placa NVARCHAR(20) NULL,
        Modelo NVARCHAR(100) NULL,

        -- Dados de consumo
        KmRodado DECIMAL(18,2) NOT NULL DEFAULT 0,
        LitrosAbastecidos DECIMAL(18,2) NOT NULL DEFAULT 0,
        ConsumoKmPorLitro DECIMAL(10,2) NOT NULL DEFAULT 0, -- km/l

        -- Totais
        TotalAbastecimentos INT NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatVeicRankConsumo UNIQUE (Ano, VeiculoId)
    );

    CREATE INDEX IX_EstatVeicRankConsumo_Ano ON EstatisticaVeiculoRankingConsumo(Ano);
    CREATE INDEX IX_EstatVeicRankConsumo_Consumo ON EstatisticaVeiculoRankingConsumo(Ano, ConsumoKmPorLitro DESC);

    PRINT 'Tabela EstatisticaVeiculoRankingConsumo criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoRankingConsumo já existe.';
GO

-- =====================================================
-- 11. TABELA: Ranking de Veículos por Litros Abastecidos
-- Top consumidores de combustível
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstatisticaVeiculoRankingLitros' AND xtype='U')
BEGIN
    CREATE TABLE EstatisticaVeiculoRankingLitros (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Ano INT NOT NULL,
        VeiculoId UNIQUEIDENTIFIER NOT NULL,
        Placa NVARCHAR(20) NULL,
        Modelo NVARCHAR(100) NULL,

        -- Dados
        LitrosAbastecidos DECIMAL(18,2) NOT NULL DEFAULT 0,
        ValorTotal DECIMAL(18,2) NOT NULL DEFAULT 0,
        TotalAbastecimentos INT NOT NULL DEFAULT 0,

        -- Controle
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_EstatVeicRankLitros UNIQUE (Ano, VeiculoId)
    );

    CREATE INDEX IX_EstatVeicRankLitros_Ano ON EstatisticaVeiculoRankingLitros(Ano);
    CREATE INDEX IX_EstatVeicRankLitros_Litros ON EstatisticaVeiculoRankingLitros(Ano, LitrosAbastecidos DESC);

    PRINT 'Tabela EstatisticaVeiculoRankingLitros criada com sucesso.';
END
ELSE
    PRINT 'Tabela EstatisticaVeiculoRankingLitros já existe.';
GO

-- =====================================================
-- 12. TABELA: Anos Disponíveis (cache)
-- Lista de anos com dados de viagens/abastecimentos
-- =====================================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AnosDisponiveisVeiculo' AND xtype='U')
BEGIN
    CREATE TABLE AnosDisponiveisVeiculo (
        Ano INT PRIMARY KEY,
        TotalViagens INT NOT NULL DEFAULT 0,
        TotalAbastecimentos INT NOT NULL DEFAULT 0,
        DataAtualizacao DATETIME NOT NULL DEFAULT GETDATE()
    );

    PRINT 'Tabela AnosDisponiveisVeiculo criada com sucesso.';
END
ELSE
    PRINT 'Tabela AnosDisponiveisVeiculo já existe.';
GO

-- =====================================================
-- 13. STORED PROCEDURE: Recalcular Estatísticas Gerais da Frota
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasVeiculoGeral')
    DROP PROCEDURE sp_RecalcularEstatisticasVeiculoGeral;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasVeiculoGeral
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
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasVeiculoGeral criada com sucesso.';
GO

-- =====================================================
-- 14. STORED PROCEDURE: Recalcular Estatísticas por Categoria
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasVeiculoCategoria')
    DROP PROCEDURE sp_RecalcularEstatisticasVeiculoCategoria;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasVeiculoCategoria
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM EstatisticaVeiculoCategoria;

        INSERT INTO EstatisticaVeiculoCategoria (
            Categoria, TotalVeiculos, VeiculosAtivos,
            VeiculosProprios, VeiculosLocados, DataAtualizacao
        )
        SELECT
            ISNULL(Categoria, 'Sem Categoria'),
            COUNT(*),
            SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END),
            SUM(CASE WHEN VeiculoProprio = 1 THEN 1 ELSE 0 END),
            SUM(CASE WHEN VeiculoProprio = 0 THEN 1 ELSE 0 END),
            GETDATE()
        FROM Veiculo
        GROUP BY Categoria;

        COMMIT TRANSACTION;
        PRINT 'Estatísticas por categoria recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasVeiculoCategoria criada com sucesso.';
GO

-- =====================================================
-- 15. STORED PROCEDURE: Recalcular Estatísticas por Status
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasVeiculoStatus')
    DROP PROCEDURE sp_RecalcularEstatisticasVeiculoStatus;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasVeiculoStatus
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM EstatisticaVeiculoStatus;

        INSERT INTO EstatisticaVeiculoStatus (Status, TotalVeiculos, DataAtualizacao)
        SELECT
            CASE WHEN Status = 1 THEN 'Ativo' ELSE 'Inativo' END,
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
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasVeiculoStatus criada com sucesso.';
GO

-- =====================================================
-- 16. STORED PROCEDURE: Recalcular Estatísticas por Modelo
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasVeiculoModelo')
    DROP PROCEDURE sp_RecalcularEstatisticasVeiculoModelo;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasVeiculoModelo
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
            MIN(v.ModeloId), -- Pega o primeiro ModeloId encontrado para cada nome de modelo
            ISNULL(m.DescricaoModelo, 'Não Informado'),
            COUNT(*),
            SUM(CASE WHEN v.Status = 1 THEN 1 ELSE 0 END),
            GETDATE()
        FROM Veiculo v
        LEFT JOIN ModeloVeiculo m ON v.ModeloId = m.ModeloId
        GROUP BY m.DescricaoModelo; -- Agrupa apenas pelo nome do modelo

        COMMIT TRANSACTION;
        PRINT 'Estatísticas por modelo recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasVeiculoModelo criada com sucesso.';
GO

-- =====================================================
-- 17. STORED PROCEDURE: Recalcular Estatísticas por Combustível
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasVeiculoCombustivel')
    DROP PROCEDURE sp_RecalcularEstatisticasVeiculoCombustivel;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasVeiculoCombustivel
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
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasVeiculoCombustivel criada com sucesso.';
GO

-- =====================================================
-- 18. STORED PROCEDURE: Recalcular Estatísticas por Unidade
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasVeiculoUnidade')
    DROP PROCEDURE sp_RecalcularEstatisticasVeiculoUnidade;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasVeiculoUnidade
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
            MIN(v.UnidadeId), -- Pega o primeiro UnidadeId encontrado para cada sigla
            ISNULL(u.Sigla, 'Sem Unidade'),
            COUNT(*),
            SUM(CASE WHEN v.Status = 1 THEN 1 ELSE 0 END),
            GETDATE()
        FROM Veiculo v
        LEFT JOIN Unidade u ON v.UnidadeId = u.UnidadeId
        GROUP BY u.Sigla; -- Agrupa apenas pela sigla da unidade

        COMMIT TRANSACTION;
        PRINT 'Estatísticas por unidade recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasVeiculoUnidade criada com sucesso.';
GO

-- =====================================================
-- 19. STORED PROCEDURE: Recalcular Estatísticas por Ano de Fabricação
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasVeiculoAnoFabricacao')
    DROP PROCEDURE sp_RecalcularEstatisticasVeiculoAnoFabricacao;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasVeiculoAnoFabricacao
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM EstatisticaVeiculoAnoFabricacao;

        INSERT INTO EstatisticaVeiculoAnoFabricacao (AnoFabricacao, TotalVeiculos, DataAtualizacao)
        SELECT
            ISNULL(AnoFabricacao, 0),
            COUNT(*),
            GETDATE()
        FROM Veiculo
        WHERE AnoFabricacao IS NOT NULL AND AnoFabricacao > 0
        GROUP BY AnoFabricacao;

        COMMIT TRANSACTION;
        PRINT 'Estatísticas por ano de fabricação recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasVeiculoAnoFabricacao criada com sucesso.';
GO

-- =====================================================
-- 20. STORED PROCEDURE: Recalcular Estatísticas de Uso Mensal
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularEstatisticasVeiculoUsoMensal')
    DROP PROCEDURE sp_RecalcularEstatisticasVeiculoUsoMensal;
GO

CREATE PROCEDURE sp_RecalcularEstatisticasVeiculoUsoMensal
    @Ano INT,
    @Mes INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @DataInicio DATE = DATEFROMPARTS(@Ano, @Mes, 1);
        DECLARE @DataFim DATE = EOMONTH(@DataInicio);

        DELETE FROM EstatisticaVeiculoUsoMensal WHERE Ano = @Ano AND Mes = @Mes;

        -- Viagens do mês
        DECLARE @TotalViagens INT = 0;
        DECLARE @KmTotal DECIMAL(18,2) = 0;

        SELECT
            @TotalViagens = COUNT(*),
            @KmTotal = ISNULL(SUM(ISNULL(KmFinal, 0) - ISNULL(KmInicial, 0)), 0)
        FROM Viagem
        WHERE DataInicial >= @DataInicio AND DataInicial < DATEADD(DAY, 1, @DataFim);

        -- Abastecimentos do mês
        DECLARE @TotalAbastecimentos INT = 0;
        DECLARE @LitrosTotal DECIMAL(18,2) = 0;
        DECLARE @ValorAbastecimento DECIMAL(18,2) = 0;

        SELECT
            @TotalAbastecimentos = COUNT(*),
            @LitrosTotal = ISNULL(SUM(ISNULL(Litros, 0)), 0),
            @ValorAbastecimento = ISNULL(SUM(ISNULL(Litros, 0) * ISNULL(ValorUnitario, 0)), 0)
        FROM Abastecimento
        WHERE DataHora >= @DataInicio AND DataHora < DATEADD(DAY, 1, @DataFim);

        -- Consumo médio (km/l)
        DECLARE @ConsumoMedio DECIMAL(10,2) = 0;
        IF @LitrosTotal > 0
            SET @ConsumoMedio = @KmTotal / @LitrosTotal;

        INSERT INTO EstatisticaVeiculoUsoMensal (
            Ano, Mes, TotalViagens, KmTotalRodado,
            TotalAbastecimentos, LitrosTotal, ValorAbastecimento,
            ConsumoMedio, DataAtualizacao
        )
        VALUES (
            @Ano, @Mes, @TotalViagens, @KmTotal,
            @TotalAbastecimentos, @LitrosTotal, @ValorAbastecimento,
            @ConsumoMedio, GETDATE()
        );

        COMMIT TRANSACTION;
        PRINT 'Estatísticas de uso do mês ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + ' recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Stored Procedure sp_RecalcularEstatisticasVeiculoUsoMensal criada com sucesso.';
GO

-- =====================================================
-- 21. STORED PROCEDURE: Recalcular Rankings Anuais
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularRankingsVeiculoAnual')
    DROP PROCEDURE sp_RecalcularRankingsVeiculoAnual;
GO

CREATE PROCEDURE sp_RecalcularRankingsVeiculoAnual
    @Ano INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- =====================================================
        -- Ranking por KM Rodado
        -- =====================================================
        DELETE FROM EstatisticaVeiculoRankingKm WHERE Ano = @Ano;

        INSERT INTO EstatisticaVeiculoRankingKm (
            Ano, VeiculoId, Placa, Modelo, KmRodado, TotalViagens, DataAtualizacao
        )
        SELECT
            @Ano,
            vi.VeiculoId,
            v.Placa,
            m.DescricaoModelo,
            SUM(ISNULL(vi.KmFinal, 0) - ISNULL(vi.KmInicial, 0)),
            COUNT(*),
            GETDATE()
        FROM Viagem vi
        INNER JOIN Veiculo v ON vi.VeiculoId = v.VeiculoId
        LEFT JOIN ModeloVeiculo m ON v.ModeloId = m.ModeloId
        WHERE YEAR(vi.DataInicial) = @Ano
          AND vi.VeiculoId IS NOT NULL AND vi.VeiculoId <> '00000000-0000-0000-0000-000000000000'
        GROUP BY vi.VeiculoId, v.Placa, m.DescricaoModelo;

        -- =====================================================
        -- Ranking por Litros Abastecidos
        -- =====================================================
        DELETE FROM EstatisticaVeiculoRankingLitros WHERE Ano = @Ano;

        INSERT INTO EstatisticaVeiculoRankingLitros (
            Ano, VeiculoId, Placa, Modelo, LitrosAbastecidos, ValorTotal, TotalAbastecimentos, DataAtualizacao
        )
        SELECT
            @Ano,
            a.VeiculoId,
            v.Placa,
            m.DescricaoModelo,
            SUM(ISNULL(a.Litros, 0)),
            SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
            COUNT(*),
            GETDATE()
        FROM Abastecimento a
        INNER JOIN Veiculo v ON a.VeiculoId = v.VeiculoId
        LEFT JOIN ModeloVeiculo m ON v.ModeloId = m.ModeloId
        WHERE YEAR(a.DataHora) = @Ano
          AND a.VeiculoId IS NOT NULL AND a.VeiculoId <> '00000000-0000-0000-0000-000000000000'
        GROUP BY a.VeiculoId, v.Placa, m.DescricaoModelo;

        -- =====================================================
        -- Ranking por Consumo (km/l)
        -- =====================================================
        DELETE FROM EstatisticaVeiculoRankingConsumo WHERE Ano = @Ano;

        -- Primeiro, obter KM por veículo
        WITH KmPorVeiculo AS (
            SELECT
                VeiculoId,
                SUM(ISNULL(KmFinal, 0) - ISNULL(KmInicial, 0)) AS KmRodado
            FROM Viagem
            WHERE YEAR(DataInicial) = @Ano
              AND VeiculoId IS NOT NULL AND VeiculoId <> '00000000-0000-0000-0000-000000000000'
            GROUP BY VeiculoId
        ),
        LitrosPorVeiculo AS (
            SELECT
                VeiculoId,
                SUM(ISNULL(Litros, 0)) AS LitrosAbastecidos,
                COUNT(*) AS TotalAbastecimentos
            FROM Abastecimento
            WHERE YEAR(DataHora) = @Ano
              AND VeiculoId IS NOT NULL AND VeiculoId <> '00000000-0000-0000-0000-000000000000'
            GROUP BY VeiculoId
        )
        INSERT INTO EstatisticaVeiculoRankingConsumo (
            Ano, VeiculoId, Placa, Modelo, KmRodado, LitrosAbastecidos,
            ConsumoKmPorLitro, TotalAbastecimentos, DataAtualizacao
        )
        SELECT
            @Ano,
            COALESCE(k.VeiculoId, l.VeiculoId),
            v.Placa,
            m.DescricaoModelo,
            ISNULL(k.KmRodado, 0),
            ISNULL(l.LitrosAbastecidos, 0),
            CASE WHEN ISNULL(l.LitrosAbastecidos, 0) > 0
                 THEN ROUND(ISNULL(k.KmRodado, 0) / l.LitrosAbastecidos, 2)
                 ELSE 0 END,
            ISNULL(l.TotalAbastecimentos, 0),
            GETDATE()
        FROM KmPorVeiculo k
        FULL OUTER JOIN LitrosPorVeiculo l ON k.VeiculoId = l.VeiculoId
        INNER JOIN Veiculo v ON COALESCE(k.VeiculoId, l.VeiculoId) = v.VeiculoId
        LEFT JOIN ModeloVeiculo m ON v.ModeloId = m.ModeloId
        WHERE ISNULL(k.KmRodado, 0) > 0 OR ISNULL(l.LitrosAbastecidos, 0) > 0;

        -- =====================================================
        -- Atualizar Anos Disponíveis
        -- =====================================================
        DELETE FROM AnosDisponiveisVeiculo WHERE Ano = @Ano;

        INSERT INTO AnosDisponiveisVeiculo (Ano, TotalViagens, TotalAbastecimentos, DataAtualizacao)
        SELECT
            @Ano,
            (SELECT COUNT(*) FROM Viagem WHERE YEAR(DataInicial) = @Ano),
            (SELECT COUNT(*) FROM Abastecimento WHERE YEAR(DataHora) = @Ano),
            GETDATE();

        COMMIT TRANSACTION;
        PRINT 'Rankings anuais de veículos do ano ' + CAST(@Ano AS VARCHAR) + ' recalculados com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Stored Procedure sp_RecalcularRankingsVeiculoAnual criada com sucesso.';
GO

-- =====================================================
-- 22. STORED PROCEDURE: Recalcular TODAS as Estatísticas da Frota
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RecalcularTodasEstatisticasVeiculos')
    DROP PROCEDURE sp_RecalcularTodasEstatisticasVeiculos;
GO

CREATE PROCEDURE sp_RecalcularTodasEstatisticasVeiculos
AS
BEGIN
    SET NOCOUNT ON;

    PRINT 'Iniciando recálculo de todas as estatísticas de veículos...';
    PRINT '';

    -- Estatísticas da frota (snapshot atual)
    PRINT '1. Recalculando estatísticas gerais da frota...';
    EXEC sp_RecalcularEstatisticasVeiculoGeral;

    PRINT '2. Recalculando estatísticas por categoria...';
    EXEC sp_RecalcularEstatisticasVeiculoCategoria;

    PRINT '3. Recalculando estatísticas por status...';
    EXEC sp_RecalcularEstatisticasVeiculoStatus;

    PRINT '4. Recalculando estatísticas por modelo...';
    EXEC sp_RecalcularEstatisticasVeiculoModelo;

    PRINT '5. Recalculando estatísticas por combustível...';
    EXEC sp_RecalcularEstatisticasVeiculoCombustivel;

    PRINT '6. Recalculando estatísticas por unidade...';
    EXEC sp_RecalcularEstatisticasVeiculoUnidade;

    PRINT '7. Recalculando estatísticas por ano de fabricação...';
    EXEC sp_RecalcularEstatisticasVeiculoAnoFabricacao;

    -- Estatísticas de uso (por ano/mês)
    PRINT '';
    PRINT '8. Recalculando estatísticas de uso mensal...';

    DECLARE @AnoMes TABLE (Ano INT, Mes INT);

    -- Anos/meses de viagens
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(DataInicial), MONTH(DataInicial)
    FROM Viagem
    WHERE DataInicial IS NOT NULL;

    -- Anos/meses de abastecimentos (sem duplicar)
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(DataHora), MONTH(DataHora)
    FROM Abastecimento
    WHERE DataHora IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM @AnoMes am WHERE am.Ano = YEAR(DataHora) AND am.Mes = MONTH(DataHora));

    DECLARE @Ano INT, @Mes INT;
    DECLARE cur CURSOR FOR SELECT DISTINCT Ano, Mes FROM @AnoMes ORDER BY Ano, Mes;

    OPEN cur;
    FETCH NEXT FROM cur INTO @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT '   Processando ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + '...';
        EXEC sp_RecalcularEstatisticasVeiculoUsoMensal @Ano, @Mes;
        FETCH NEXT FROM cur INTO @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;

    -- Rankings anuais
    PRINT '';
    PRINT '9. Recalculando rankings anuais...';

    DECLARE @Anos TABLE (Ano INT);
    INSERT INTO @Anos SELECT DISTINCT Ano FROM @AnoMes;

    DECLARE cur2 CURSOR FOR SELECT Ano FROM @Anos ORDER BY Ano;
    OPEN cur2;
    FETCH NEXT FROM cur2 INTO @Ano;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT '   Processando rankings de ' + CAST(@Ano AS VARCHAR) + '...';
        EXEC sp_RecalcularRankingsVeiculoAnual @Ano;
        FETCH NEXT FROM cur2 INTO @Ano;
    END

    CLOSE cur2;
    DEALLOCATE cur2;

    PRINT '';
    PRINT '=====================================================';
    PRINT 'Todas as estatísticas de veículos foram recalculadas!';
    PRINT '=====================================================';
END
GO

PRINT 'Stored Procedure sp_RecalcularTodasEstatisticasVeiculos criada com sucesso.';
GO

-- =====================================================
-- 23. STORED PROCEDURE: Atualização Rápida (mês atual)
-- =====================================================

IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AtualizarEstatisticasVeiculosMesAtual')
    DROP PROCEDURE sp_AtualizarEstatisticasVeiculosMesAtual;
GO

CREATE PROCEDURE sp_AtualizarEstatisticasVeiculosMesAtual
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Ano INT = YEAR(GETDATE());
    DECLARE @Mes INT = MONTH(GETDATE());

    -- Atualiza snapshot da frota
    EXEC sp_RecalcularEstatisticasVeiculoGeral;
    EXEC sp_RecalcularEstatisticasVeiculoCategoria;
    EXEC sp_RecalcularEstatisticasVeiculoStatus;
    EXEC sp_RecalcularEstatisticasVeiculoModelo;
    EXEC sp_RecalcularEstatisticasVeiculoCombustivel;
    EXEC sp_RecalcularEstatisticasVeiculoUnidade;
    EXEC sp_RecalcularEstatisticasVeiculoAnoFabricacao;

    -- Atualiza mês atual
    EXEC sp_RecalcularEstatisticasVeiculoUsoMensal @Ano, @Mes;
    EXEC sp_RecalcularRankingsVeiculoAnual @Ano;

    -- Atualiza mês anterior
    IF @Mes = 1
    BEGIN
        SET @Ano = @Ano - 1;
        SET @Mes = 12;
    END
    ELSE
        SET @Mes = @Mes - 1;

    EXEC sp_RecalcularEstatisticasVeiculoUsoMensal @Ano, @Mes;

    PRINT 'Estatísticas de veículos do mês atual e anterior atualizadas!';
END
GO

PRINT 'Stored Procedure sp_AtualizarEstatisticasVeiculosMesAtual criada com sucesso.';
GO

-- =====================================================
-- 24. TRIGGER: Atualizar estatísticas ao modificar Veiculo
-- =====================================================

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_Veiculo_AtualizarEstatisticas')
    DROP TRIGGER trg_Veiculo_AtualizarEstatisticas;
GO

CREATE TRIGGER trg_Veiculo_AtualizarEstatisticas
ON Veiculo
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Atualiza estatísticas da frota (snapshot)
    EXEC sp_RecalcularEstatisticasVeiculoGeral;
    EXEC sp_RecalcularEstatisticasVeiculoCategoria;
    EXEC sp_RecalcularEstatisticasVeiculoStatus;
    EXEC sp_RecalcularEstatisticasVeiculoModelo;
    EXEC sp_RecalcularEstatisticasVeiculoCombustivel;
    EXEC sp_RecalcularEstatisticasVeiculoUnidade;
    EXEC sp_RecalcularEstatisticasVeiculoAnoFabricacao;
END
GO

PRINT 'Trigger trg_Veiculo_AtualizarEstatisticas criado com sucesso.';
GO

-- =====================================================
-- 25. TRIGGER: Atualizar estatísticas ao modificar Viagem
-- =====================================================

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_Viagem_AtualizarEstatisticasVeiculo')
    DROP TRIGGER trg_Viagem_AtualizarEstatisticasVeiculo;
GO

CREATE TRIGGER trg_Viagem_AtualizarEstatisticasVeiculo
ON Viagem
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Coleta anos/meses afetados
    DECLARE @Afetados TABLE (Ano INT, Mes INT);

    INSERT INTO @Afetados (Ano, Mes)
    SELECT DISTINCT YEAR(DataInicial), MONTH(DataInicial)
    FROM inserted
    WHERE DataInicial IS NOT NULL;

    INSERT INTO @Afetados (Ano, Mes)
    SELECT DISTINCT YEAR(DataInicial), MONTH(DataInicial)
    FROM deleted
    WHERE DataInicial IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM @Afetados a
          WHERE a.Ano = YEAR(deleted.DataInicial)
            AND a.Mes = MONTH(deleted.DataInicial)
      );

    -- Recalcula para cada mês afetado
    DECLARE @Ano INT, @Mes INT;
    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
        SELECT DISTINCT Ano, Mes FROM @Afetados;

    OPEN cur;
    FETCH NEXT FROM cur INTO @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_RecalcularEstatisticasVeiculoUsoMensal @Ano, @Mes;
        FETCH NEXT FROM cur INTO @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;

    -- Recalcula rankings anuais
    DECLARE cur2 CURSOR LOCAL FAST_FORWARD FOR
        SELECT DISTINCT Ano FROM @Afetados;

    OPEN cur2;
    FETCH NEXT FROM cur2 INTO @Ano;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_RecalcularRankingsVeiculoAnual @Ano;
        FETCH NEXT FROM cur2 INTO @Ano;
    END

    CLOSE cur2;
    DEALLOCATE cur2;
END
GO

PRINT 'Trigger trg_Viagem_AtualizarEstatisticasVeiculo criado com sucesso.';
GO

-- =====================================================
-- 26. JOB: Atualização automática de hora em hora
-- =====================================================

USE msdb;
GO

-- Remove job existente se houver
IF EXISTS (SELECT job_id FROM msdb.dbo.sysjobs WHERE name = N'FrotiX_AtualizarEstatisticasVeiculos')
BEGIN
    EXEC msdb.dbo.sp_delete_job @job_name = N'FrotiX_AtualizarEstatisticasVeiculos';
    PRINT 'Job existente removido.';
END
GO

-- Cria o Job
EXEC msdb.dbo.sp_add_job
    @job_name = N'FrotiX_AtualizarEstatisticasVeiculos',
    @enabled = 1,
    @description = N'Atualiza as tabelas estatísticas de veículos do FrotiX de hora em hora',
    @category_name = N'Database Maintenance',
    @owner_login_name = N'sa';
GO

-- Adiciona o Step do Job
EXEC msdb.dbo.sp_add_jobstep
    @job_name = N'FrotiX_AtualizarEstatisticasVeiculos',
    @step_name = N'Executar sp_AtualizarEstatisticasVeiculosMesAtual',
    @step_id = 1,
    @subsystem = N'TSQL',
    @command = N'EXEC sp_AtualizarEstatisticasVeiculosMesAtual;',
    @database_name = N'FrotiX',
    @retry_attempts = 3,
    @retry_interval = 5,
    @on_success_action = 1,
    @on_fail_action = 2;
GO

-- Cria o Schedule (de hora em hora)
EXEC msdb.dbo.sp_add_jobschedule
    @job_name = N'FrotiX_AtualizarEstatisticasVeiculos',
    @name = N'Executar de hora em hora',
    @enabled = 1,
    @freq_type = 4,
    @freq_interval = 1,
    @freq_subday_type = 8,
    @freq_subday_interval = 1,
    @active_start_date = 20260101,
    @active_end_date = 99991231,
    @active_start_time = 003000,
    @active_end_time = 235959;
GO

-- Associa o Job ao servidor local
EXEC msdb.dbo.sp_add_jobserver
    @job_name = N'FrotiX_AtualizarEstatisticasVeiculos',
    @server_name = N'(local)';
GO

PRINT 'Job FrotiX_AtualizarEstatisticasVeiculos criado com sucesso (executa de hora em hora).';
GO

USE FrotiX;
GO

-- =====================================================
-- 27. INSTRUÇÕES FINAIS
-- =====================================================

PRINT '';
PRINT '=====================================================';
PRINT 'SCRIPT CONCLUÍDO COM SUCESSO!';
PRINT '=====================================================';
PRINT '';
PRINT 'IMPORTANTE: Execute o comando abaixo para popular';
PRINT 'os dados iniciais das tabelas estatísticas:';
PRINT '';
PRINT '-- Primeira execução (popular todos os dados históricos):';
PRINT 'EXEC sp_RecalcularTodasEstatisticasVeiculos;';
PRINT '';
PRINT '-- Para atualizações manuais (mês atual e anterior):';
PRINT 'EXEC sp_AtualizarEstatisticasVeiculosMesAtual;';
PRINT '';
PRINT '-- Job criado: FrotiX_AtualizarEstatisticasVeiculos';
PRINT '-- Executa automaticamente de hora em hora';
PRINT '';
PRINT 'NOTA: Este script também corrige valores NULL nas';
PRINT 'tabelas de estatísticas de abastecimento existentes.';
PRINT '=====================================================';
PRINT '';
GO
