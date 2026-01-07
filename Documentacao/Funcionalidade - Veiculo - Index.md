# Documentação: Gestão de Veículos (Index)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.1

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades Específicas](#funcionalidades-específicas)
4. [Endpoints API](#endpoints-api)
5. [Frontend](#frontend)
6. [Validações](#validações)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Gestão de Veículos** é a listagem principal de todos os veículos cadastrados no sistema FrotiX. Ela permite visualizar, filtrar, adicionar, editar, excluir e alterar o status (ativo/inativo) dos veículos.

### Características Principais

- ✅ **Listagem Completa**: Exibe todos os veículos com informações essenciais.
- ✅ **DataTable Interativo**: Paginação, ordenação e pesquisa rápida.
- ✅ **Ações Rápidas**: Edição e exclusão direta na linha do registro.
- ✅ **Toggle de Status**: Ativar/Desativar veículo com um clique.
- ✅ **Feedback Visual**: Toasts de sucesso/erro e confirmação para ações destrutivas.
- ✅ **Proteção de Integridade**: Impede exclusão de veículos com vínculos (Contratos, Viagens).

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Veiculo/
│       └── Index.cshtml             # Página principal (HTML + CSS inline)
│
├── Controllers/
│   └── VeiculoController.cs         # Endpoints da API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── veiculo_index.js     # Lógica do DataTable e ações
│   └── css/
│       └── frotix.css               # Estilos globais
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização da página |
| **jQuery DataTables** | Grid de listagem avançada |
| **Bootstrap 5** | Layout e componentes visuais |
| **Font Awesome Duotone** | Ícones |
| **SweetAlert2** | Modais de confirmação |
| **Toastr** | Notificações flutuantes |

---

## Funcionalidades Específicas

### 1. Listagem de Veículos
Utiliza o plugin DataTables para exibir os dados retornados pela API.

**Colunas Exibidas:**
1. **Placa**: Identificador visual do veículo.
2. **Marca/Modelo**: Descrição combinada.
3. **Contrato**: Origem do veículo (ex: Contrato X, Próprio).
4. **Sigla**: Sigla da unidade vinculada.
5. **Combustível**: Tipo de combustível principal.
6. **Consumo**: Média de consumo (km/l).
7. **Km**: Quilometragem atual.
8. **Reserva**: Indicador se é veículo reserva.
9. **Status**: Botão interativo (Ativo/Inativo).
10. **Ação**: Botões de Editar e Excluir.

### 2. Alterar Status (Ativo/Inativo)
Permite alterar o status do veículo diretamente na grid.
- **Visual**: Botão Verde (Ativo) ou Cinza (Inativo).
- **Comportamento**: Clique dispara requisição AJAX para alternar status.
- **Feedback**: Atualiza a cor e ícone do botão instantaneamente após sucesso.

### 3. Exclusão de Veículo
Permite remover um veículo do sistema, desde que não possua vínculos impeditivos.
- **Fluxo**: Clique no ícone de lixeira → Confirmação SweetAlert → Requisição API.
- **Validação Backend**: Verifica se existe vínculo com Contratos ou Viagens.

---

## Endpoints API

**Base URL**: `/api/Veiculo`

### 1. GET `/api/Veiculo`
Retorna a lista de todos os veículos para popular o DataTable.

**Método**: `VeiculoController.Get()`

**Implementação**:
```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        var objVeiculos = _unitOfWork
            .ViewVeiculos.GetAllReduced(selector: vv => new
            {
                vv.VeiculoId,
                vv.Placa,
                vv.Quilometragem,
                vv.MarcaModelo,
                vv.Sigla,
                vv.Descricao,
                vv.Consumo,
                vv.OrigemVeiculo,
                vv.DataAlteracao,
                vv.NomeCompleto,
                vv.VeiculoReserva,
                vv.Status,
                vv.CombustivelId,
                vv.VeiculoProprio,
            })
            .ToList();

        return Json(new
        {
            data = objVeiculos
        });
    }
    // catch...
}
```

### 2. POST `/api/Veiculo/Delete`
Remove um veículo do banco de dados.

**Body**: `{ "VeiculoId": "uuid" }`

**Método**: `VeiculoController.Delete(VeiculoViewModel model)`

**Implementação (Validação de Vínculos)**:
```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(VeiculoViewModel model)
{
    // ...
    var veiculoContrato = _unitOfWork.VeiculoContrato.GetFirstOrDefault(u =>
        u.VeiculoId == model.VeiculoId
    );
    if (veiculoContrato != null)
    {
        return Json(new {
            success = false,
            message = "Não foi possível remover o veículo. Ele está associado a um ou mais contratos!"
        });
    }

    var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(u =>
        u.VeiculoId == model.VeiculoId
    );
    if (objViagem != null)
    {
        return Json(new {
            success = false,
            message = "Não foi possível remover o veículo. Ele está associado a uma ou mais viagens!"
        });
    }

    _unitOfWork.Veiculo.Remove(objFromDb);
    _unitOfWork.Save();
    return Json(new { success = true, message = "Veículo removido com sucesso" });
    // ...
}
```

### 3. GET `/api/Veiculo/UpdateStatusVeiculo`
Alterna o status do veículo (toggle).

**Parâmetros**: `Id` (Guid)

**Método**: `VeiculoController.UpdateStatusVeiculo(Guid Id)`

**Implementação**:
```csharp
[Route("UpdateStatusVeiculo")]
public JsonResult UpdateStatusVeiculo(Guid Id)
{
    // ...
    if (objFromDb.Status == true)
    {
        objFromDb.Status = false;
        // ... msg inativo
        type = 1;
    }
    else
    {
        objFromDb.Status = true;
        // ... msg ativo
        type = 0;
    }
    _unitOfWork.Veiculo.Update(objFromDb);
    // ...
    return Json(new { success = true, message = Description, type = type });
}
```

---

## Frontend

### Estrutura HTML Principal
A tabela é definida em `Index.cshtml` com estrutura padrão do DataTables:
```html
<div id="divVeiculos">
    <table id="tblVeiculo" class="table table-bordered table-striped" width="100%">
        <thead>
            <tr>
                <th>Placa</th>
                <th>Marca/Modelo</th>
                <th>Contrato</th>
                <th>Sigla</th>
                <th>Combustível</th>
                <th>Consumo</th>
                <th>Km</th>
                <th>Reserva</th>
                <th>Status</th>
                <th>Ação</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>
```

### JavaScript (`veiculo_index.js`)

**Inicialização do DataTable**:
Configura as colunas, URLs e renderizadores customizados.
```javascript
function loadList() {
    dataTable = $("#tblVeiculo").DataTable({
        columnDefs: [
            // Configurações de largura e alinhamento...
            { targets: 0, className: "text-center", width: "9%" },
            { targets: 1, className: "text-left", width: "17%" },
            // ...
        ],
        responsive: true,
        ajax: {
            url: "/api/veiculo",
            type: "GET",
            datatype: "json"
        },
        columns: [
            { data: "placa" },
            { data: "marcaModelo" },
            { data: "origemVeiculo" },
            // ...
            {
                data: "consumo",
                render: function (data) {
                    if (data === null || data === undefined) return "0,00";
                    return parseFloat(data).toFixed(2).replace(".", ",");
                }
            },
            // ... Status e Ações abaixo
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
            emptyTable: "Sem Dados para Exibição"
        },
        width: "100%"
    });
}
```

**Renderização de Status (Botão Interativo)**:
```javascript
{
    data: "status",
    render: function (data, type, row, meta) {
        if (data) {
            return `<a href="javascript:void(0)"
                       class="updateStatusVeiculo btn btn-verde text-white"
                       data-url="/api/Veiculo/updateStatusVeiculo?Id=${row.veiculoId}"
                       data-ejtip="Desativar veículo"
                       style="cursor:pointer; padding: 4px 10px; font-size: 12px; border-radius: 6px;">
                        <i class="fa-duotone fa-circle-check me-1"></i> Ativo
                    </a>`;
        } else {
            return `<a href="javascript:void(0)"
                       class="updateStatusVeiculo btn fundo-cinza text-white"
                       data-url="/api/Veiculo/updateStatusVeiculo?Id=${row.veiculoId}"
                       data-ejtip="Ativar veículo"
                       style="...">
                        <i class="fa-duotone fa-circle-xmark me-1"></i> Inativo
                    </a>`;
        }
    }
}
```

**Alteração de Status (Evento Click)**:
```javascript
$(document).on("click", ".updateStatusVeiculo", function () {
    var url = $(this).data("url");
    var currentElement = $(this);

    $.get(url, function (data) {
        if (data.success) {
            AppToast.show('Verde', "Status alterado com sucesso!", 2000);

            if (data.type == 1) { // Mudou para Inativo
                currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                currentElement.html('<i class="fa-duotone fa-circle-xmark me-1"></i> Inativo');
            } else { // Mudou para Ativo
                currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                currentElement.html('<i class="fa-duotone fa-circle-check me-1"></i> Ativo');
            }
        } else {
            AppToast.show('Vermelho', "Não foi possível alterar o status.", 2000);
        }
    });
});
```

**Exclusão (SweetAlert e AJAX)**:
```javascript
$(document).on("click", ".btn-delete", function () {
    var id = $(this).data("id");

    Alerta.Confirmar(
        "Confirmar Exclusão",
        "Você tem certeza que deseja apagar este veículo? Não será possível recuperar os dados eliminados!",
        "Sim, excluir",
        "Cancelar"
    ).then(function (confirmed) {
        if (confirmed) {
            var dataToPost = JSON.stringify({ VeiculoId: id });

            $.ajax({
                url: "/api/Veiculo/Delete",
                type: "POST",
                data: dataToPost,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if (data.success) {
                        AppToast.show('Verde', data.message || "Veículo excluído com sucesso.", 2000);
                        if (dataTable) dataTable.ajax.reload();
                    } else {
                        AppToast.show('Vermelho', data.message || "Erro ao excluir veículo.", 2000);
                    }
                },
                // ... tratamento de erro
            });
        }
    });
});
```

---

## Validações

### Validações de Exclusão (Backend)
O sistema impede a exclusão física do registro se houver integridade referencial a ser mantida:

1. **Vínculo com Contratos**: Verifica tabela `VeiculoContrato`.
   ```csharp
   var veiculoContrato = _unitOfWork.VeiculoContrato.GetFirstOrDefault(u => u.VeiculoId == model.VeiculoId);
   if (veiculoContrato != null) { /* Retorna erro */ }
   ```
2. **Vínculo com Viagens**: Verifica tabela `Viagem`.
   ```csharp
   var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(u => u.VeiculoId == model.VeiculoId);
   if (objViagem != null) { /* Retorna erro */ }
   ```

---

## Troubleshooting

### Problema: Botão de Excluir exibe erro genérico
**Sintoma**: Ao tentar excluir, aparece toast vermelho "Algo deu errado".
**Causa**: Exceção não tratada no servidor ou falha de rede.
**Solução**: Verificar logs do servidor (`LogErros`). O bloco catch no frontend apenas mostra toast genérico se o servidor retornar 500.

### Problema: Status não muda visualmente
**Sintoma**: Clica no botão de status, toast de sucesso aparece, mas botão não muda de cor.
**Causa**: Falha na manipulação do DOM no callback `success` do AJAX.
**Verificação**: O código usa `currentElement` capturado antes da chamada AJAX para garantir o contexto correto:
```javascript
var currentElement = $(this);
$.get(url, function (data) {
    // usa currentElement aqui
});
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de listagem de veículos (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
