-- =============================================
-- Script para Corrigir Valores Negativos na Coluna Ordem
-- Tabela: Recurso
-- Constraint: UK_Recurso_Ordem (UNIQUE INDEX)
-- =============================================
-- Este script corrige valores negativos deixados
-- pela Fase 1 quando a Fase 2 falhou
-- =============================================

USE FrotiX_DB;  -- ⚠️ AJUSTE O NOME DO SEU BANCO AQUI!
GO

PRINT '========================================';
PRINT 'DIAGNÓSTICO: Verificando valores negativos';
PRINT '========================================';
PRINT '';

-- 1. Verifica se há valores negativos
SELECT COUNT(*) AS Total_Negativos
FROM Recurso
WHERE Ordem < 0;

-- 2. Lista recursos com valores negativos
SELECT
    RecursoId,
    Nome,
    NomeMenu,
    Ordem,
    Nivel,
    ParentId,
    Ativo
FROM Recurso
WHERE Ordem < 0
ORDER BY Ordem;

PRINT '';
PRINT '========================================';
PRINT 'CORREÇÃO: Resetando valores de Ordem';
PRINT '========================================';
PRINT '';

BEGIN TRANSACTION;

BEGIN TRY
    -- ===============================
    -- ESTRATÉGIA: Usar ROW_NUMBER() para gerar valores únicos
    -- Ordenação: Nível, Nome (alfabética)
    -- ===============================

    -- Passo 1: Criar tabela temporária com novas ordenações
    SELECT
        RecursoId,
        ROW_NUMBER() OVER (ORDER BY Nivel, Nome) - 1 AS NovaOrdem
    INTO #TempOrdem
    FROM Recurso;

    PRINT 'Passo 1: Tabela temporária criada com novas ordenações';

    -- Passo 2: Atualizar todos os registros com valores temporários negativos únicos
    -- (Evita conflito com UNIQUE INDEX durante atualização)
    UPDATE R
    SET Ordem = -T.NovaOrdem - 10000  -- Valores negativos bem baixos
    FROM Recurso R
    INNER JOIN #TempOrdem T ON R.RecursoId = T.RecursoId;

    PRINT 'Passo 2: Valores temporários negativos aplicados';

    -- Passo 3: Atualizar para valores finais positivos
    UPDATE R
    SET Ordem = T.NovaOrdem
    FROM Recurso R
    INNER JOIN #TempOrdem T ON R.RecursoId = T.RecursoId;

    PRINT 'Passo 3: Valores finais positivos aplicados';

    -- Passo 4: Limpar tabela temporária
    DROP TABLE #TempOrdem;

    PRINT 'Passo 4: Tabela temporária removida';

    COMMIT TRANSACTION;

    PRINT '';
    PRINT '========================================';
    PRINT '✅ SUCESSO: Valores corrigidos!';
    PRINT '========================================';
    PRINT '';

    -- Verificação final
    SELECT
        'Total de recursos' AS Info,
        COUNT(*) AS Quantidade
    FROM Recurso
    UNION ALL
    SELECT
        'Recursos com Ordem < 0' AS Info,
        COUNT(*) AS Quantidade
    FROM Recurso
    WHERE Ordem < 0;

    PRINT '';
    PRINT 'Listando primeiros 20 recursos após correção:';
    PRINT '';

    SELECT TOP 20
        RecursoId,
        Nome,
        Ordem,
        Nivel,
        ParentId,
        Ativo
    FROM Recurso
    ORDER BY Ordem;

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    PRINT '';
    PRINT '========================================';
    PRINT '❌ ERRO: Correção falhou!';
    PRINT '========================================';
    PRINT '';
    PRINT 'Erro: ' + ERROR_MESSAGE();
    PRINT 'Linha: ' + CAST(ERROR_LINE() AS VARCHAR(10));
    PRINT '';
    PRINT 'Transação revertida. Banco permanece inalterado.';
END CATCH;

GO

PRINT '';
PRINT '========================================';
PRINT 'Script finalizado';
PRINT '========================================';
