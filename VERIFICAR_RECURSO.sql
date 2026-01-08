-- Script para verificar status da tabela Recurso
-- Execute este script no SQL Server Management Studio

-- 1. Verifica se a tabela existe
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Recurso')
        THEN 'TABELA EXISTE'
        ELSE 'TABELA NÃO EXISTE'
    END AS Status_Tabela;

-- 2. Conta quantos registros existem
SELECT COUNT(*) AS Total_Recursos FROM Recurso;

-- 3. Lista os primeiros 20 recursos (se existirem)
SELECT TOP 20
    RecursoId,
    Nome,
    NomeMenu,
    Icon,
    Href,
    Ativo,
    ParentId,
    Ordem,
    Nivel
FROM Recurso
ORDER BY Ordem;

-- 4. Verifica se há recursos raiz (sem pai)
SELECT COUNT(*) AS Recursos_Raiz
FROM Recurso
WHERE ParentId IS NULL;

-- 5. Lista estrutura hierárquica (recursos raiz e seus filhos diretos)
SELECT
    R1.Nome AS Recurso_Raiz,
    R2.Nome AS Recurso_Filho,
    R2.Ordem
FROM Recurso R1
LEFT JOIN Recurso R2 ON R1.RecursoId = R2.ParentId
WHERE R1.ParentId IS NULL
ORDER BY R1.Ordem, R2.Ordem;
