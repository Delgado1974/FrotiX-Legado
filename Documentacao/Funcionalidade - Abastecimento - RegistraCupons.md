# Documentação: Abastecimento - Registro de Cupons (Listagem)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades Específicas](#funcionalidades-específicas)
4. [Endpoints API](#endpoints-api)
5. [Frontend](#frontend)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Registro de Cupons** lista os lotes de cupons de abastecimento registrados (digitalizados). Permite visualizar a data de registro, acessar a edição/visualização do PDF e excluir registros. É o ponto de entrada para a gestão documental dos abastecimentos.

### Características Principais

- ✅ **Listagem via DataTable**: Grid interativo com paginação e ordenação.
- ✅ **Filtro por Data**: Permite filtrar os registros por uma data específica.
- ✅ **Visualização de PDF**: Modal integrado para visualizar o arquivo digitalizado do lote.
- ✅ **Ações**: Editar (Upsert) e Excluir registro.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Abastecimento/
│       ├── RegistraCupons.cshtml    # View (HTML + JS inline)
│
├── Controllers/
│   └── AbastecimentoController.cs   # API (provável local dos endpoints)
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **jQuery DataTables** | Grid de listagem |
| **Kendo UI PDF Viewer** | Visualização de arquivos PDF |
| **Syncfusion RTE** | Editor de texto rico (para observações) |
| **Bootstrap 5** | Layout e Modais |

---

## Funcionalidades Específicas

### 1. Listagem de Registros
A tabela exibe a data do registro e botões de ação.

**Código de Inicialização (DataTable)**:
```javascript
function ListaTblCupons(URLapi, IDapi) {
    // ... loading script ...
    dataTableCupons = $('#tblCupons').DataTable({
        ajax: {
            url: URLapi,
            type: "GET",
            data: { id: IDapi },
            datatype: "json"
        },
        columns: [
            { "data": "dataRegistro" },
            {
                "data": "registroCupomId",
                "render": function (data, type, full, meta) {
                    return `<div class="text-center">
                                <a href="/Abastecimento/UpsertCupons?id=${data}" class="btn ...">
                                    <i class="fa-duotone fa-edit"></i>
                                </a>
                                <a class="btn btn-apagar ..." data-id='${data}'>
                                    <i class="fa-duotone fa-window-close"></i>
                                </a>
                            </div>`;
                }
            },
            // ... row number
        ],
        // ... configurações de linguagem e botões
    });
}
```

### 2. Filtro por Data
Ao selecionar uma data no input `#txtData`, a tabela é recarregada chamando um endpoint específico.

**Lógica de Filtro**:
```javascript
$("#txtData").change(function () {
    var date = $('#txtData').val().split("-");
    // Formata para DD/MM/YYYY
    var dataAbastecimento = (date[2] + "/" + date[1] + "/" + date[0]);

    URLapi = "api/abastecimento/PegaRegistroCuponsData";
    IDapi = dataAbastecimento;

    ListaTblCupons(URLapi, IDapi);
});
```

### 3. Exclusão de Registro
Botão na grid que chama a API de exclusão após confirmação.

**Lógica de Exclusão**:
```javascript
$(document).on('click', '.btn-apagar', function () {
    var id = $(this).data('id');
    // SweetAlert Confirm
    // ...
    $.ajax({
        url: '/api/Abastecimento/DeleteRegistro',
        type: "GET",
        data: { 'IDapi': id },
        success: function (data) {
            if (data.success) {
                AppToast.show('Verde', data.message);
                ListaTodosRegistros();
            } else {
                AppToast.show('Vermelho', data.message);
            }
        }
    });
});
```

---

## Endpoints API

### 1. GET `api/abastecimento/ListaRegistroCupons`
Retorna todos os registros de cupons cadastrados.

### 2. GET `api/abastecimento/PegaRegistroCuponsData`
Retorna registros filtrados por data.
- **Parâmetro**: `id` (String da data formatada DD/MM/YYYY).

### 3. GET `api/Abastecimento/DeleteRegistro`
Exclui um registro de cupom.
- **Parâmetro**: `IDapi` (Guid).

### 4. GET `api/Abastecimento/PegaRegistroCupons`
Retorna detalhes de um registro específico (PDF, Observações) para o modal.
- **Parâmetro**: `IDapi` (Guid).

---

## Frontend

### Modal de Visualização (`#modalRegistro`)
Embora a edição principal ocorra na página `UpsertCupons`, esta página possui um modal (`#modalRegistro`) que parece ser usado para visualização rápida, carregando o PDF via Kendo UI PDF Viewer.

```javascript
$('#modalRegistro').on('shown.bs.modal', function (event) {
    // ...
    $.ajax({
        url: "/api/Abastecimento/PegaRegistroCupons",
        data: { IDapi: RegistroId },
        success: function (data) {
            // Carrega RTE
            var rte = document.getElementById('rte').ej2_instances[0];
            rte.value = data.observacoes;

            // Carrega PDF Viewer
            $("#pdfViewer").kendopdfViewer({
                pdfjsProcessing: {
                    file: "/DadosEditaveis/Cupons/" + data.registroPDF
                }
            });
        }
    });
});
```

---

## Troubleshooting

### Problema: Tabela vazia após filtrar data
**Sintoma**: Usuário seleciona data, tabela mostra "Nenhum registro encontrado".
**Causa**: Formato da data enviado para a API pode estar incorreto (espera DD/MM/YYYY) ou não há registros exatos naquele dia.
**Verificação**: Check `console.log(dataAbastecimento)` no evento change.

### Problema: PDF não carrega no modal
**Sintoma**: Modal abre mas área do PDF fica branca.
**Causa**: Caminho do arquivo incorreto em `/DadosEditaveis/Cupons/` ou arquivo físico inexistente no servidor.
**Solução**: Verificar se o nome do arquivo retornado pela API bate com o arquivo em disco.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de Registro de Cupons (Listagem).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
