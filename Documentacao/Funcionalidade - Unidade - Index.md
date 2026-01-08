# Documentação: Unidade - Gestão (Index)

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

A página de **Listagem de Unidades** (`Pages/Unidade/Index.cshtml`) exibe as unidades organizacionais (departamentos, secretarias, etc.) cadastradas no sistema. Fornece uma visão rápida dos contatos principais e status.

### Características Principais
- ✅ **Listagem Resumida**: Exibe Sigla, Nome, Primeiro Contato, Ponto e Ramal.
- ✅ **Status**: Indicador de unidade ativa ou inativa.
- ✅ **Ações**: Acesso à edição.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Unidade/
│       └── Index.cshtml             # View da Listagem
│
├── Controllers/
│   └── UnidadeController.cs         # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── unidade.js           # Lógica do DataTable
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
<table id="tblUnidade" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Sigla</th>
            <th>Nome da Unidade</th>
            <th>Contato</th>
            <th>Ponto</th>
            <th>Ramal</th>
            <th>Status</th>
            <th>Ação</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

---

## Lógica de Frontend (JavaScript)

O arquivo `unidade.js` inicializa o DataTable.

```javascript
dataTable = $("#tblUnidade").DataTable({
    ajax: {
        url: "/api/Unidade",
        type: "GET",
        datatype: "json"
    },
    columns: [
        { data: "sigla" },
        { data: "descricao" },
        { data: "primeiroContato" },
        { data: "pontoPrimeiroContato" },
        { data: "primeiroRamal" },
        { data: "status", render: function(d) { return d ? "Ativo" : "Inativo"; } },
        { data: "unidadeId", render: function(d) { return `<a href="/Unidade/Upsert?id=${d}" class="btn btn-primary"><i class="fa-duotone fa-pencil"></i></a>`; } }
    ]
});
```

---

## Endpoints API

### GET `/api/Unidade`
Retorna a lista de todas as unidades.

---

## Troubleshooting

### Tabela vazia
**Causa**: Falha na requisição `/api/Unidade`.
**Solução**: Verifique o Network tab do navegador.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da listagem de Unidades (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
