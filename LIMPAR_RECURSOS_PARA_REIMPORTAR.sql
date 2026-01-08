-- =============================================
-- Script para LIMPAR tabela Recurso e permitir re-importação do nav.json
-- =============================================
-- ATENÇÃO: Este script DELETA TODOS os registros da tabela Recurso!
-- Use apenas se deseja re-importar tudo do nav.json
-- =============================================

USE FrotiX_DB;  -- ⚠️ AJUSTE O NOME DO SEU BANCO AQUI!
GO

PRINT '========================================';
PRINT 'ATENÇÃO: ESTE SCRIPT VAI DELETAR TUDO!';
PRINT '========================================';
PRINT '';
PRINT 'Este script vai:';
PRINT '1. Fazer backup da tabela Recurso';
PRINT '2. DELETAR TODOS os registros de Recurso';
PRINT '3. DELETAR TODOS os registros de ControleAcesso relacionados';
PRINT '4. Permitir re-importação limpa do nav.json';
PRINT '';
PRINT 'Após executar este script, você DEVE:';
PRINT '- Acessar /Administracao/GestaoRecursosNavegacao';
PRINT '- Clicar no botão "Migrar do JSON"';
PRINT '';
PRINT '⚠️ PRESSIONE CTRL+C AGORA SE NÃO TEM CERTEZA! ⚠️';
PRINT '';
WAITFOR DELAY '00:00:05';  -- Aguarda 5 segundos
GO

BEGIN TRANSACTION;

BEGIN TRY
    -- ===============================
    -- PASSO 1: Criar backup da tabela Recurso
    -- ===============================

    PRINT 'PASSO 1: Criando backup da tabela Recurso...';

    -- Remove backup anterior se existir
    IF OBJECT_ID('dbo.Recurso_BACKUP', 'U') IS NOT NULL
        DROP TABLE dbo.Recurso_BACKUP;

    -- Cria backup
    SELECT * INTO Recurso_BACKUP FROM Recurso;

    DECLARE @QtdBackup INT = (SELECT COUNT(*) FROM Recurso_BACKUP);
    PRINT '✅ Backup criado: ' + CAST(@QtdBackup AS VARCHAR(10)) + ' registros';
    PRINT '';

    -- ===============================
    -- PASSO 2: Criar backup da tabela ControleAcesso
    -- ===============================

    PRINT 'PASSO 2: Criando backup da tabela ControleAcesso...';

    -- Remove backup anterior se existir
    IF OBJECT_ID('dbo.ControleAcesso_BACKUP', 'U') IS NOT NULL
        DROP TABLE dbo.ControleAcesso_BACKUP;

    -- Cria backup
    SELECT * INTO ControleAcesso_BACKUP FROM ControleAcesso;

    DECLARE @QtdControleBackup INT = (SELECT COUNT(*) FROM ControleAcesso_BACKUP);
    PRINT '✅ Backup criado: ' + CAST(@QtdControleBackup AS VARCHAR(10)) + ' registros';
    PRINT '';

    -- ===============================
    -- PASSO 3: Deletar ControleAcesso (FK constraint)
    -- ===============================

    PRINT 'PASSO 3: Deletando registros de ControleAcesso...';

    DELETE FROM ControleAcesso;

    PRINT '✅ ControleAcesso limpo';
    PRINT '';

    -- ===============================
    -- PASSO 4: Deletar Recurso
    -- ===============================

    PRINT 'PASSO 4: Deletando registros de Recurso...';

    DELETE FROM Recurso;

    PRINT '✅ Recurso limpo';
    PRINT '';

    -- ===============================
    -- PASSO 5: Verificação
    -- ===============================

    PRINT 'PASSO 5: Verificando limpeza...';

    DECLARE @QtdRecurso INT = (SELECT COUNT(*) FROM Recurso);
    DECLARE @QtdControle INT = (SELECT COUNT(*) FROM ControleAcesso);

    IF @QtdRecurso = 0 AND @QtdControle = 0
    BEGIN
        PRINT '✅ Limpeza concluída com sucesso!';
        PRINT '   - Recurso: ' + CAST(@QtdRecurso AS VARCHAR(10)) + ' registros';
        PRINT '   - ControleAcesso: ' + CAST(@QtdControle AS VARCHAR(10)) + ' registros';
    END
    ELSE
    BEGIN
        PRINT '❌ ERRO: Ainda há registros!';
        PRINT '   - Recurso: ' + CAST(@QtdRecurso AS VARCHAR(10)) + ' registros';
        PRINT '   - ControleAcesso: ' + CAST(@QtdControle AS VARCHAR(10)) + ' registros';
        RAISERROR('Limpeza incompleta!', 16, 1);
    END

    COMMIT TRANSACTION;

    PRINT '';
    PRINT '========================================';
    PRINT '✅ SUCESSO: Tabelas limpas!';
    PRINT '========================================';
    PRINT '';
    PRINT 'PRÓXIMOS PASSOS:';
    PRINT '1. Acesse: https://localhost:44340/Administracao/GestaoRecursosNavegacao';
    PRINT '2. Clique no botão "Migrar do JSON"';
    PRINT '3. Aguarde a conclusão da importação';
    PRINT '';
    PRINT 'BACKUPS DISPONÍVEIS EM:';
    PRINT '- dbo.Recurso_BACKUP (' + CAST(@QtdBackup AS VARCHAR(10)) + ' registros)';
    PRINT '- dbo.ControleAcesso_BACKUP (' + CAST(@QtdControleBackup AS VARCHAR(10)) + ' registros)';
    PRINT '';
    PRINT 'Para RESTAURAR os backups (em caso de erro):';
    PRINT '  DELETE FROM ControleAcesso;';
    PRINT '  DELETE FROM Recurso;';
    PRINT '  INSERT INTO Recurso SELECT * FROM Recurso_BACKUP;';
    PRINT '  INSERT INTO ControleAcesso SELECT * FROM ControleAcesso_BACKUP;';
    PRINT '';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    PRINT '';
    PRINT '========================================';
    PRINT '❌ ERRO: Limpeza falhou!';
    PRINT '========================================';
    PRINT '';
    PRINT 'Erro: ' + ERROR_MESSAGE();
    PRINT 'Linha: ' + CAST(ERROR_LINE() AS VARCHAR(10));
    PRINT '';
    PRINT 'Transação revertida. Banco permanece inalterado.';
    PRINT 'Backups NÃO foram criados.';
    PRINT '';
END CATCH;

GO
