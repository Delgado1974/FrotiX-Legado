# Documentação: Contrato - Gestão (Index)

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

A página de **Listagem de Contratos** (`Pages/Contrato/Index.cshtml`) é o ponto de entrada para o gerenciamento de contratos. Exibe uma tabela com os principais dados dos contratos cadastrados, como número, fornecedor, vigência e valores.

### Características Principais
- ✅ **Visão Geral**: Tabela com resumo financeiro e de prazos.
- ✅ **Ações**: Botões para editar e visualizar detalhes.
- ✅ **Status**: Indicação visual de contratos ativos e inativos.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Contrato/
│       └── Index.cshtml             # View da Listagem
│
├── Controllers/
│   └── ContratoController.cs        # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── contrato.js          # Lógica do DataTable
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização |
| **jQuery DataTables** | Grid de dados |
| **Bootstrap 5** | Layout |

---

## Estrutura da Interface

A tabela é o componente central da página.

```html
<table id="tblContrato" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Contrato</th>
            <th>Processo</th>
            <th>Objeto</th>
            <th>Empresa</th>
            <th>Vigência</th>
            <th>(R$) Anual</th>
            <th>(R$) Mensal</th>
            <th>Prorrogação</th>
            <th>Status</th>
            <th>Ação</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

---

## Lógica de Frontend (JavaScript)

O arquivo `contrato.js` inicializa o DataTable e configura as colunas.

```javascript
dataTable = $("#tblContrato").DataTable({
    ajax: {
        url: "/api/Contrato",
        type: "GET",
        datatype: "json"
    },
    columns: [
        { data: "numeroContrato" },
        { data: "numeroProcesso" },
        { data: "objeto" },
        { data: "fornecedor.descricaoFornecedor" },
        { data: "vigencia" },
        { data: "valorAnual", render: $.fn.dataTable.render.number('.', ',', 2, 'R$ ') },
        { data: "valorMensal", render: $.fn.dataTable.render.number('.', ',', 2, 'R$ ') },
        { data: "prorrogacao" },
        { data: "status", render: function(d) { return d ? "Ativo" : "Inativo"; } },
        { data: "contratoId", render: function(d) { return `<a href="/Contrato/Upsert?id=${d}" class="btn btn-primary"><i class="fa-duotone fa-pencil"></i></a>`; } }
    ]
});
```

---

## Endpoints API

### GET `/api/Contrato`
Retorna a lista de todos os contratos cadastrados.

---

## Troubleshooting

### Valores formatados incorretamente
**Causa**: Configuração regional do DataTable ou dados não numéricos.
**Solução**: Verifique o renderizador da coluna (`$.fn.dataTable.render.number`).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da listagem de Contratos (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
