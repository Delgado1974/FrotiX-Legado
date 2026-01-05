-- ============================================================
-- MIGRATION: Adicionar campos de hierarquia na tabela Recurso
-- Executar manualmente no SQL Server Management Studio (SSMS)
-- Data: 2026-01-04
-- Objetivo: Suportar navegação hierárquica com Syncfusion TreeView
-- ============================================================

-- 1. Adicionar coluna ParentId (FK para hierarquia pai-filho)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Recurso') AND name = 'ParentId')
BEGIN
    ALTER TABLE Recurso ADD ParentId UNIQUEIDENTIFIER NULL;
    PRINT 'Coluna ParentId adicionada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Coluna ParentId já existe.';
END
GO

-- 2. Adicionar coluna Icon (classe FontAwesome do ícone)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Recurso') AND name = 'Icon')
BEGIN
    ALTER TABLE Recurso ADD Icon NVARCHAR(200) NULL;
    PRINT 'Coluna Icon adicionada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Coluna Icon já existe.';
END
GO

-- 3. Adicionar coluna Href (URL da página)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Recurso') AND name = 'Href')
BEGIN
    ALTER TABLE Recurso ADD Href NVARCHAR(500) NULL;
    PRINT 'Coluna Href adicionada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Coluna Href já existe.';
END
GO

-- 4. Adicionar coluna Ativo (se o item aparece no menu)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Recurso') AND name = 'Ativo')
BEGIN
    ALTER TABLE Recurso ADD Ativo BIT NOT NULL DEFAULT 1;
    PRINT 'Coluna Ativo adicionada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Coluna Ativo já existe.';
END
GO

-- 5. Adicionar coluna Nivel (profundidade na hierarquia: 0=raiz, 1=filho, 2=neto)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Recurso') AND name = 'Nivel')
BEGIN
    ALTER TABLE Recurso ADD Nivel INT NOT NULL DEFAULT 0;
    PRINT 'Coluna Nivel adicionada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Coluna Nivel já existe.';
END
GO

-- 6. Criar Foreign Key para auto-relacionamento (Parent)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Recurso_Parent')
BEGIN
    ALTER TABLE Recurso ADD CONSTRAINT FK_Recurso_Parent
        FOREIGN KEY (ParentId) REFERENCES Recurso(RecursoId);
    PRINT 'Foreign Key FK_Recurso_Parent criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Foreign Key FK_Recurso_Parent já existe.';
END
GO

-- 7. Criar índice para performance em consultas hierárquicas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Recurso_ParentId' AND object_id = OBJECT_ID(N'Recurso'))
BEGIN
    CREATE INDEX IX_Recurso_ParentId ON Recurso(ParentId);
    PRINT 'Índice IX_Recurso_ParentId criado com sucesso.';
END
ELSE
BEGIN
    PRINT 'Índice IX_Recurso_ParentId já existe.';
END
GO

-- 8. Criar índice para busca por NomeMenu (usado na vinculação)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Recurso_NomeMenu' AND object_id = OBJECT_ID(N'Recurso'))
BEGIN
    CREATE INDEX IX_Recurso_NomeMenu ON Recurso(NomeMenu);
    PRINT 'Índice IX_Recurso_NomeMenu criado com sucesso.';
END
ELSE
BEGIN
    PRINT 'Índice IX_Recurso_NomeMenu já existe.';
END
GO

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
PRINT '';
PRINT '========================================';
PRINT 'VERIFICAÇÃO DA ESTRUTURA DA TABELA';
PRINT '========================================';

SELECT
    c.name AS Coluna,
    t.name AS Tipo,
    c.max_length AS Tamanho,
    CASE WHEN c.is_nullable = 1 THEN 'SIM' ELSE 'NÃO' END AS Nullable,
    ISNULL(dc.definition, '') AS ValorDefault
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
WHERE c.object_id = OBJECT_ID(N'Recurso')
ORDER BY c.column_id;

PRINT '';
PRINT 'Migration concluída com sucesso!';
PRINT 'Próximo passo: Executar o endpoint /api/Navigation/MigrateFromJson para migrar os dados do nav.json';
GO
