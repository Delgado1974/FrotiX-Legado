# Documentação: Requisitante (Funcionalidade)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Listagem (Index)](#listagem-index)
4. [Cadastro/Edição (Upsert)](#cadastroedicao-upsert)
5. [Endpoints API](#endpoints-api)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O módulo de **Requisitantes** gerencia os usuários ou colaboradores que podem solicitar viagens ou serviços no sistema. Eles são vinculados a um **Setor** (Centro de Custo).

### Características Principais
- ✅ **CRUD Simples**: Gerenciamento de Nome, Ponto, Ramal, E-mail e Setor.
- ✅ **Vínculo com Setor**: Uso de DropdownTree para selecionar o setor em uma estrutura hierárquica.
- ✅ **Status**: Controle de Ativo/Inativo.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Requisitante/
│       ├── Index.cshtml             # Listagem
│       └── Upsert.cshtml            # Formulário
│
├── Controllers/
│   └── RequisitanteController.cs    # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── requisitante.js      # Lógica JS
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **Syncfusion DropdownTree** | Seleção de Setores Hierárquicos |
| **jQuery DataTables** | Grid de listagem |
| **ASP.NET Core Razor Pages** | Renderização |

---

## Listagem (Index)

A página `Index.cshtml` exibe a lista de requisitantes.

### Estrutura da Tabela
A tabela consome a API `/api/Requisitante`.

**Colunas:**
1. Ponto (Matrícula)
2. Nome
3. Ramal
4. Setor (Nome do Setor vinculado)
5. Status (Badge Ativo/Inativo)
6. Ação (Editar)

---

## Cadastro/Edição (Upsert)

A página `Upsert.cshtml` contém o formulário.

### Campos do Formulário
- **Ponto**: Identificador único (Matrícula).
- **Nome**: Nome completo.
- **Ramal**: Telefone interno.
- **Email**: Contato principal.
- **Setor Solicitante**: Componente `ejs-dropdowntree` que carrega a árvore de setores.

### Lógica de Setor (DropdownTree)
O componente Syncfusion é configurado para permitir a seleção de setores filhos.

```javascript
// Pré-seleção no Upsert (JS Inline)
var setorId = "@Model.RequisitanteObj.Requisitante.SetorSolicitanteId";
if (setorId && setorId !== emptyGuid) {
    document.getElementById("ddtree").ej2_instances[0].value = [setorId];
}
```

---

## Endpoints API

### GET `/api/Requisitante`
Retorna a lista de requisitantes.

### POST `/Requisitante/Upsert` (Handler)
Processa a criação ou atualização.

---

## Troubleshooting

### Dropdown de Setor vazio
**Causa**: Falha ao carregar a árvore de setores no `ViewData["dataSource"]`.
**Solução**: Verifique o `OnGet` do `UpsertModel` e se a tabela de Setores está populada.

### Erro ao salvar Requisitante
**Causa**: Ponto duplicado ou E-mail inválido (se houver validação).
**Solução**: Verifique as mensagens de validação (`asp-validation-for`).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do módulo de Requisitantes.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
