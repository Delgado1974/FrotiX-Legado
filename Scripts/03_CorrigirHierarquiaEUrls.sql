-- =====================================================
-- SCRIPT 03: Corrigir Hierarquia (ParentId) e URLs
-- Execute após os scripts de ícones
-- =====================================================

-- Primeiro, vamos identificar os IDs dos itens PAI (nivel 0)
-- Depois vamos atribuir ParentId aos filhos

-- PASSO 1: Verificar estado atual
SELECT RecursoId, Nome, NomeMenu, Nivel, ParentId, Ordem, Href, Ativo
FROM Recurso
ORDER BY Nivel, Ordem;

-- PASSO 2: Identificar os IDs dos menus de nível 0 (raiz)
-- Execute esta query primeiro para ver os IDs

SELECT RecursoId, Nome FROM Recurso WHERE Nivel = 0 ORDER BY Ordem;

-- =====================================================
-- PASSO 3: DEFINIR HIERARQUIA
-- Substitua os GUIDs pelos reais do seu banco
-- =====================================================

-- DASHBOARD (nivel 0) - normalmente não tem filhos diretos no menu

-- VEÍCULOS E MOTORISTAS (nivel 0)
-- Filhos: Veículos, Motoristas, Manutenções, Multas
UPDATE Recurso SET ParentId = (SELECT RecursoId FROM Recurso WHERE NomeMenu = 'Veículos e Motoristas' AND Nivel = 0)
WHERE NomeMenu IN ('Veículos', 'Motoristas', 'Manutenções', 'Multas') AND Nivel = 1;

-- OPERAÇÕES (nivel 0)
-- Filhos: Viagens, Rotas, Agendamento
UPDATE Recurso SET ParentId = (SELECT RecursoId FROM Recurso WHERE NomeMenu = 'Operações' AND Nivel = 0)
WHERE NomeMenu IN ('Viagens', 'Rotas', 'Agendamento') AND Nivel = 1;

-- CONTROLE DE COMBUSTÍVEL (nivel 0)
-- Filhos: Abastecimentos, Dashboard Abastecimento
UPDATE Recurso SET ParentId = (SELECT RecursoId FROM Recurso WHERE NomeMenu = 'Controle de Combustível' AND Nivel = 0)
WHERE NomeMenu IN ('Abastecimentos', 'Dashboard Abastecimento') AND Nivel = 1;

-- FINANCEIRO (nivel 0)
-- Filhos: Faturamento, Receitas, Despesas, Fluxo de Caixa
UPDATE Recurso SET ParentId = (SELECT RecursoId FROM Recurso WHERE NomeMenu = 'Financeiro' AND Nivel = 0)
WHERE NomeMenu IN ('Faturamento', 'Receitas', 'Despesas', 'Fluxo de Caixa') AND Nivel = 1;

-- CADASTROS GERAIS (nivel 0)
-- Filhos de nivel 1: Clientes, Operadores, Locais, Pontos de Rota, etc.
UPDATE Recurso SET ParentId = (SELECT RecursoId FROM Recurso WHERE NomeMenu = 'Cadastros Gerais' AND Nivel = 0)
WHERE NomeMenu IN ('Clientes', 'Operadores', 'Locais', 'Pontos de Rota', 'Postos de Combustível', 'Oficinas',
                   'Categorias de Veículos', 'Tipos de Combustível', 'Tipos de Viagem', 'Tipos de Ocorrência',
                   'Tipos de Despesa', 'Tipos de Receita', 'Formas de Pagamento') AND Nivel = 1;

-- RELATÓRIOS (nivel 0)
-- Filhos: por definir baseado nos dados
UPDATE Recurso SET ParentId = (SELECT RecursoId FROM Recurso WHERE NomeMenu = 'Relatórios' AND Nivel = 0)
WHERE Nivel = 1 AND NomeMenu LIKE 'Relatório%';

-- ADMINISTRAÇÃO (nivel 0)
-- Filhos: Usuários, Controle de Acesso, Configurações, Logs, Gerenciador Navegação, etc.
UPDATE Recurso SET ParentId = (SELECT RecursoId FROM Recurso WHERE NomeMenu = 'Administração' AND Nivel = 0)
WHERE NomeMenu IN ('Usuários', 'Controle de Acesso', 'Configurações', 'Logs do Sistema',
                   'Gerenciador Navegação', 'Gestão de Recursos e Navegação', 'Backup') AND Nivel = 1;

-- =====================================================
-- PASSO 4: CORRIGIR URLs (Href)
-- Converte formato antigo para ASP.NET Core Razor Pages
-- =====================================================

-- Dashboard
UPDATE Recurso SET Href = '/Dashboard/Index' WHERE NomeMenu = 'Dashboard' AND Nivel = 0;

-- Veículos
UPDATE Recurso SET Href = '/Veiculos/Index' WHERE NomeMenu = 'Veículos' AND Nivel = 1;
UPDATE Recurso SET Href = 'javascript:void(0);' WHERE NomeMenu = 'Veículos e Motoristas' AND Nivel = 0;

-- Motoristas
UPDATE Recurso SET Href = '/Motoristas/Index' WHERE NomeMenu = 'Motoristas' AND Nivel = 1;

-- Manutenções
UPDATE Recurso SET Href = '/Manutencoes/Index' WHERE NomeMenu = 'Manutenções' AND Nivel = 1;

-- Multas
UPDATE Recurso SET Href = '/Multas/Index' WHERE NomeMenu = 'Multas' AND Nivel = 1;

-- Viagens
UPDATE Recurso SET Href = '/Viagens/Index' WHERE NomeMenu = 'Viagens' AND Nivel = 1;
UPDATE Recurso SET Href = 'javascript:void(0);' WHERE NomeMenu = 'Operações' AND Nivel = 0;

-- Rotas
UPDATE Recurso SET Href = '/Rotas/Index' WHERE NomeMenu = 'Rotas' AND Nivel = 1;

-- Agendamento
UPDATE Recurso SET Href = '/Agenda/Index' WHERE NomeMenu = 'Agendamento' AND Nivel = 1;

-- Abastecimentos
UPDATE Recurso SET Href = '/Abastecimentos/Index' WHERE NomeMenu = 'Abastecimentos' AND Nivel = 1;
UPDATE Recurso SET Href = 'javascript:void(0);' WHERE NomeMenu = 'Controle de Combustível' AND Nivel = 0;

-- Dashboard Abastecimento
UPDATE Recurso SET Href = '/Abastecimentos/Dashboard' WHERE NomeMenu = 'Dashboard Abastecimento' AND Nivel = 1;

-- Faturamento
UPDATE Recurso SET Href = '/Faturamento/Index' WHERE NomeMenu = 'Faturamento' AND Nivel = 1;
UPDATE Recurso SET Href = 'javascript:void(0);' WHERE NomeMenu = 'Financeiro' AND Nivel = 0;

-- Receitas
UPDATE Recurso SET Href = '/Receitas/Index' WHERE NomeMenu = 'Receitas' AND Nivel = 1;

-- Despesas
UPDATE Recurso SET Href = '/Despesas/Index' WHERE NomeMenu = 'Despesas' AND Nivel = 1;

-- Fluxo de Caixa
UPDATE Recurso SET Href = '/FluxoCaixa/Index' WHERE NomeMenu = 'Fluxo de Caixa' AND Nivel = 1;

-- Clientes
UPDATE Recurso SET Href = '/Clientes/Index' WHERE NomeMenu = 'Clientes' AND Nivel = 1;
UPDATE Recurso SET Href = 'javascript:void(0);' WHERE NomeMenu = 'Cadastros Gerais' AND Nivel = 0;

-- Operadores
UPDATE Recurso SET Href = '/Operadores/Index' WHERE NomeMenu = 'Operadores' AND Nivel = 1;

-- Locais
UPDATE Recurso SET Href = '/Locais/Index' WHERE NomeMenu = 'Locais' AND Nivel = 1;

-- Pontos de Rota
UPDATE Recurso SET Href = '/PontosRota/Index' WHERE NomeMenu = 'Pontos de Rota' AND Nivel = 1;

-- Postos de Combustível
UPDATE Recurso SET Href = '/Postos/Index' WHERE NomeMenu = 'Postos de Combustível' AND Nivel = 1;

-- Oficinas
UPDATE Recurso SET Href = '/Oficinas/Index' WHERE NomeMenu = 'Oficinas' AND Nivel = 1;

-- Categorias de Veículos
UPDATE Recurso SET Href = '/CategoriasVeiculos/Index' WHERE NomeMenu = 'Categorias de Veículos' AND Nivel = 1;

-- Tipos (todos os tipos de cadastros auxiliares)
UPDATE Recurso SET Href = '/TiposCombustivel/Index' WHERE NomeMenu = 'Tipos de Combustível' AND Nivel = 1;
UPDATE Recurso SET Href = '/TiposViagem/Index' WHERE NomeMenu = 'Tipos de Viagem' AND Nivel = 1;
UPDATE Recurso SET Href = '/TiposOcorrencia/Index' WHERE NomeMenu = 'Tipos de Ocorrência' AND Nivel = 1;
UPDATE Recurso SET Href = '/TiposDespesa/Index' WHERE NomeMenu = 'Tipos de Despesa' AND Nivel = 1;
UPDATE Recurso SET Href = '/TiposReceita/Index' WHERE NomeMenu = 'Tipos de Receita' AND Nivel = 1;
UPDATE Recurso SET Href = '/FormasPagamento/Index' WHERE NomeMenu = 'Formas de Pagamento' AND Nivel = 1;

-- Relatórios (placeholder - ajustar conforme páginas existentes)
UPDATE Recurso SET Href = 'javascript:void(0);' WHERE NomeMenu = 'Relatórios' AND Nivel = 0;

-- Administração
UPDATE Recurso SET Href = 'javascript:void(0);' WHERE NomeMenu = 'Administração' AND Nivel = 0;
UPDATE Recurso SET Href = '/Administracao/Usuarios/Index' WHERE NomeMenu = 'Usuários' AND Nivel = 1;
UPDATE Recurso SET Href = '/Administracao/ControleAcesso/Index' WHERE NomeMenu = 'Controle de Acesso' AND Nivel = 1;
UPDATE Recurso SET Href = '/Administracao/Configuracoes/Index' WHERE NomeMenu = 'Configurações' AND Nivel = 1;
UPDATE Recurso SET Href = '/Administracao/Logs/Index' WHERE NomeMenu = 'Logs do Sistema' AND Nivel = 1;
UPDATE Recurso SET Href = '/Administracao/GestaoRecursosNavegacao' WHERE NomeMenu IN ('Gerenciador Navegação', 'Gestão de Recursos e Navegação') AND Nivel = 1;
UPDATE Recurso SET Href = '/Administracao/Backup/Index' WHERE NomeMenu = 'Backup' AND Nivel = 1;

-- =====================================================
-- PASSO 5: VERIFICAR RESULTADO
-- =====================================================

-- Verificar hierarquia
SELECT
    r.RecursoId,
    r.Nome,
    r.NomeMenu,
    r.Nivel,
    p.Nome AS NomePai,
    r.ParentId,
    r.Href,
    r.Ativo
FROM Recurso r
LEFT JOIN Recurso p ON r.ParentId = p.RecursoId
ORDER BY r.Nivel, COALESCE(p.Ordem, 0), r.Ordem;

-- Contar itens por nível e com/sem pai
SELECT
    Nivel,
    COUNT(*) AS Total,
    SUM(CASE WHEN ParentId IS NULL THEN 1 ELSE 0 END) AS SemPai,
    SUM(CASE WHEN ParentId IS NOT NULL THEN 1 ELSE 0 END) AS ComPai
FROM Recurso
GROUP BY Nivel
ORDER BY Nivel;
