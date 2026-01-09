# Documentação: Requisitante - Gestão (Index)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura da Interface](#estrutura-da-interface)
4. [Lógica de Frontend (JavaScript)](#lógica-de-frontend-javascript)
5. [Endpoints API](#endpoints-api)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página de **Listagem de Requisitantes** (`Pages/Requisitante/Index.cshtml`) é utilizada para visualizar e gerenciar os solicitantes de serviços (viagens/manutenção). Exibe os dados cadastrais básicos e o setor ao qual pertencem.

### Características Principais
- ✅ **Listagem Clara**: Nome, Ponto, Ramal, Setor e Status.
- ✅ **Ações**: Botões de edição direta.
- ✅ **Status**: Identificação visual de requisitantes ativos/inativos.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Requisitante/
│       └── Index.cshtml             # View da Listagem
│
├── Controllers/
│   └── RequisitanteController.cs    # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── requisitante.js      # Lógica do DataTable
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização |
| **jQuery DataTables** | Grid de dados |
| **Bootstrap 5** | Layout |

---

## Estrutura da Interface

A tabela principal da página.

```html
<table id="tblRequisitante" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Ponto</th>
            <th>Nome</th>
            <th>Ramal</th>
            <th>Setor</th>
            <th>Status</th>
            <th>Ação</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

---

## Lógica de Frontend (JavaScript)

O arquivo `requisitante.js` configura o DataTable.

```javascript
dataTable = $("#tblRequisitante").DataTable({
    ajax: {
        url: "/api/Requisitante",
        type: "GET",
        datatype: "json"
    },
    columns: [
        { data: "ponto" },
        { data: "nome" },
        { data: "ramal" },
        { data: "setorSolicitante.nome" },
        { data: "status", render: function(d) { return d ? "Ativo" : "Inativo"; } },
        { data: "requisitanteId", render: function(d) { return `<a href="/Requisitante/Upsert?id=${d}" class="btn btn-primary"><i class="fa-duotone fa-pencil"></i></a>`; } }
    ]
});
```

---

## Endpoints API

### GET `/api/Requisitante`
Retorna a lista de todos os requisitantes, incluindo a navegação para o objeto `SetorSolicitante`.

---

## Troubleshooting

### Setor não aparece na listagem
**Causa**: O objeto `SetorSolicitante` está nulo no retorno da API (possível falha no Include do Entity Framework).
**Solução**: Verifique o repositório para garantir que `.Include(r => r.SetorSolicitante)` está sendo chamado.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da listagem de Requisitantes (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
