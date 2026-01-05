-- ============================================================================
-- SCRIPT: Índices de Performance para Gestão de Eventos
-- OBJETIVO: Otimizar queries de agregação de custos por evento
-- DATA: 2026-01-05
-- ============================================================================

USE [FrotiX]
GO

PRINT '========================================';
PRINT 'Criando índices de performance...';
PRINT '========================================';
PRINT '';

-- ============================================================================
-- ÍNDICE 1: Otimização de agregação de custos por evento
-- ============================================================================
-- Este índice otimiza a query que agrega custos das viagens por evento
-- Usado em: ViagemController.ListaEventos (linha 67-81)
--
-- BENEFÍCIO: Reduz tempo de agregação de minutos para milissegundos
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Viagem_EventoId_Include_Custos' AND object_id = OBJECT_ID('dbo.Viagem'))
BEGIN
    PRINT 'Criando índice IX_Viagem_EventoId_Include_Custos...';

    CREATE NONCLUSTERED INDEX IX_Viagem_EventoId_Include_Custos
    ON dbo.Viagem (EventoId)
    INCLUDE (
        CustoCombustivel,
        CustoMotorista,
        CustoVeiculo,
        CustoOperador,
        CustoLavador
    )
    WHERE EventoId IS NOT NULL;

    PRINT '✅ Índice IX_Viagem_EventoId_Include_Custos criado com sucesso!';
    PRINT '';
END
ELSE
BEGIN
    PRINT '⚠️  Índice IX_Viagem_EventoId_Include_Custos já existe.';
    PRINT '';
END

-- ============================================================================
-- ÍNDICE 2: Otimização de busca e ordenação de eventos por nome
-- ============================================================================
-- Este índice otimiza a ordenação e busca de eventos
-- Usado em: ViagemController.ListaEventos (linha 55)
--
-- BENEFÍCIO: Melhora performance de ordenação e busca por nome
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Evento_Nome' AND object_id = OBJECT_ID('dbo.Evento'))
BEGIN
    PRINT 'Criando índice IX_Evento_Nome...';

    CREATE NONCLUSTERED INDEX IX_Evento_Nome
    ON dbo.Evento (Nome);

    PRINT '✅ Índice IX_Evento_Nome criado com sucesso!';
    PRINT '';
END
ELSE
BEGIN
    PRINT '⚠️  Índice IX_Evento_Nome já existe.';
    PRINT '';
END

-- ============================================================================
-- VERIFICAÇÃO: Exibe informações dos índices criados
-- ============================================================================

PRINT '========================================';
PRINT 'Verificando índices criados...';
PRINT '========================================';
PRINT '';

-- Índices da tabela Viagem relacionados a EventoId
SELECT
    i.name AS [Nome do Índice],
    i.type_desc AS [Tipo],
    CASE WHEN i.is_unique = 1 THEN 'Sim' ELSE 'Não' END AS [Único],
    STUFF((
        SELECT ', ' + c.name
        FROM sys.index_columns ic
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id
        AND ic.index_id = i.index_id
        AND ic.is_included_column = 0
        ORDER BY ic.key_ordinal
        FOR XML PATH('')
    ), 1, 2, '') AS [Colunas Chave],
    STUFF((
        SELECT ', ' + c.name
        FROM sys.index_columns ic
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id
        AND ic.index_id = i.index_id
        AND ic.is_included_column = 1
        ORDER BY ic.index_column_id
        FOR XML PATH('')
    ), 1, 2, '') AS [Colunas Incluídas]
FROM sys.indexes i
WHERE i.object_id = OBJECT_ID('dbo.Viagem')
AND i.name LIKE 'IX_Viagem_EventoId%'
ORDER BY i.name;

PRINT '';

-- Índices da tabela Evento relacionados a Nome
SELECT
    i.name AS [Nome do Índice],
    i.type_desc AS [Tipo],
    CASE WHEN i.is_unique = 1 THEN 'Sim' ELSE 'Não' END AS [Único],
    STUFF((
        SELECT ', ' + c.name
        FROM sys.index_columns ic
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id
        AND ic.index_id = i.index_id
        AND ic.is_included_column = 0
        ORDER BY ic.key_ordinal
        FOR XML PATH('')
    ), 1, 2, '') AS [Colunas Chave]
FROM sys.indexes i
WHERE i.object_id = OBJECT_ID('dbo.Evento')
AND i.name LIKE 'IX_Evento_Nome%'
ORDER BY i.name;

PRINT '';
PRINT '========================================';
PRINT '✅ Script concluído com sucesso!';
PRINT '========================================';
PRINT '';
PRINT 'PRÓXIMOS PASSOS:';
PRINT '1. Testar a página Gestão de Eventos';
PRINT '2. Verificar tempo de carregamento (meta: < 2 segundos)';
PRINT '3. Monitorar performance das queries no SQL Server Profiler';
PRINT '';

GO
