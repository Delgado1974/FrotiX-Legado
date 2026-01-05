-- =====================================================
-- SCRIPT 04: Corrigir link para Gestão de Recursos e Navegação
-- Execute este script para atualizar o Href no banco
-- =====================================================

-- Atualiza o Href de GerenciadorNavegacao para GestaoRecursosNavegacao
UPDATE Recurso
SET Href = 'administracao_gestaorecursosnavegacao.html',
    Nome = 'Gestão de Recursos e Navegação',
    NomeMenu = 'Gestão de Recursos e Navegação'
WHERE Href LIKE '%gerenciadornavegacao%'
   OR NomeMenu LIKE '%Gerenciador de Navegação%';

-- Verificar resultado
SELECT RecursoId, Nome, NomeMenu, Href
FROM Recurso
WHERE NomeMenu LIKE '%Navegação%' OR Href LIKE '%navegacao%';
