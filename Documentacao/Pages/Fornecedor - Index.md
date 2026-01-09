# Documentação: Fornecedor - Gestão (Index)

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

A página de **Listagem de Fornecedores** (`Pages/Fornecedor/Index.cshtml`) é responsável por exibir todos os fornecedores cadastrados no sistema. Ela oferece uma visão tabular com os principais dados cadastrais e permite a navegação para a edição.

### Características Principais
- ✅ **Listagem Completa**: Exibe Descrição, CNPJ, Contato, Telefone e Status.
- ✅ **Ordenação e Pesquisa**: Funcionalidades nativas do DataTable.
- ✅ **Acesso Rápido**: Botão para adicionar novo fornecedor e editar existentes.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Fornecedor/
│       └── Index.cshtml             # View da Listagem
│
├── Controllers/
│   └── FornecedorController.cs      # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── fornecedor.js        # Lógica do DataTable
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização da página |
| **jQuery DataTables** | Grid de dados |
| **Bootstrap 5** | Layout |

---

## Estrutura da Interface

A tabela é renderizada com a classe `table-bordered table-striped` e preenchida dinamicamente.

```html
<table id="tblFornecedor" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Descricao</th>
            <th>CNPJ</th>
            <th>Contato</th>
            <th>Telefone</th>
            <th>Status</th>
            <th>Ação</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

---

## Lógica de Frontend (JavaScript)

O arquivo `fornecedor.js` inicializa o DataTable.

```javascript
dataTable = $("#tblFornecedor").DataTable({
    ajax: {
        url: "/api/Fornecedor",
        type: "GET",
        datatype: "json"
    },
    columns: [
        { data: "descricaoFornecedor" },
        { data: "cnpj" },
        { data: "contato01" },
        { data: "telefone01" },
        {
            data: "status",
            render: function(data) {
                return data ? "Ativo" : "Inativo";
            }
        },
        {
            data: "fornecedorId",
            render: function(data) {
                return `<a href="/Fornecedor/Upsert?id=${data}" class="btn btn-primary text-white"><i class="fa-duotone fa-pencil"></i></a>`;
            }
        }
    ]
});
```

---

## Endpoints API

### GET `/api/Fornecedor`
Retorna a lista completa de fornecedores.

---

## Troubleshooting

### Tabela vazia
**Causa**: Falha na requisição `/api/Fornecedor`.
**Solução**: Verifique o Network tab do navegador. Se retornar 500, verifique os logs do servidor.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da listagem de Fornecedores (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
