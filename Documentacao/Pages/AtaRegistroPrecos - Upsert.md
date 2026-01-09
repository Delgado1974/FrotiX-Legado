# Funcionalidade - AtaRegistroPrecos - Upsert

## Visão Geral
Esta página permite a criação (Insert) e edição (Update) de uma Ata de Registro de Preços. A funcionalidade é complexa, envolvendo um formulário principal para dados da Ata e uma grid interativa para gerenciamento dos itens (veículos) associados.

**Caminho do Arquivo:** `Pages/AtaRegistroPrecos/Upsert.cshtml`
**PageModel:** `Pages/AtaRegistroPrecos/Upsert.cshtml.cs`

## Estrutura da Página (Razor View)

A página utiliza o layout padrão com estilos customizados para formulários compactos e integra componentes de terceiros como Syncfusion Grid.

### Estilos e Dependências
Define estilos CSS locais para ajustes finos em inputs (`.form-control-xs`) e labels. Carrega o CSS do Toastr e o script globalize do Syncfusion.

```html
<style>
    .form-control-xs {
        height: calc(1em + .775rem + 2px) !important;
        /* ... outros estilos de formatação ... */
    }
    /* ... */
</style>

@section HeadBlock {
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css" />
    <script src="https://cdn.syncfusion.com/js/assets/external/jquery.globalize.min.js"></script>
}
```

### Formulário Principal
O formulário é envolvido por uma tag `<form method="post" asp-action="Upsert">`. Os campos são vinculados ao `AtaObj.AtaRegistroPrecos` via TagHelpers.

#### Campos de Identificação e Dados Gerais
Campos como Ano/Número da Ata e Processo, Fornecedor (Dropdown) e Objeto.

```html
<!-- Hidden ID -->
@if (Model.AtaObj.AtaRegistroPrecos.AtaId != Guid.Empty)
{
    <input type="hidden" asp-for="AtaObj.AtaRegistroPrecos.AtaId" />
}

<!-- Linha 1: Identificação -->
<div class="row">
    <div class="col-2">
        <div class="form-group">
            <label class="label font-weight-bold" asp-for="AtaObj.AtaRegistroPrecos.AnoAta"></label>
            <input id="txtAno" class="form-control form-control-xs" asp-for="AtaObj.AtaRegistroPrecos.AnoAta" />
        </div>
    </div>
    <!-- ... NumeroAta, NumeroProcesso, AnoProcesso ... -->
</div>

<!-- Linha 2: Fornecedor e Objeto -->
<div class="row">
    <div class="col-6">
        <div class="form-group">
            <label class="label font-weight-bold" asp-for="AtaObj.AtaRegistroPrecos.FornecedorId"></label>
            @Html.DropDownListFor(m => m.AtaObj.AtaRegistroPrecos.FornecedorId,
            Model.AtaObj.FornecedorList,
            "- Selecione um Fornecedor -",
            new { @class = "form-control form-control-xs" })
        </div>
    </div>
    <!-- ... Objeto ... -->
</div>
```

#### Vigência e Valores
Campos de data e valor monetário. O campo valor utiliza máscara e evento `onKeyPress` para formatação.

```html
<div class="row">
    <div class="col-3">
        <!-- Data Inicio -->
    </div>
    <div class="col-3">
        <!-- Data Fim -->
    </div>
    <div class="col-3">
        <div class="form-group">
            <label class="label font-weight-bold" asp-for="AtaObj.AtaRegistroPrecos.Valor"></label>
            <input id="valor" class="form-control form-control-xs" data-inputmask="'alias': 'currency'" style="text-align: right;" asp-for="AtaObj.AtaRegistroPrecos.Valor" onKeyPress="return(moeda(this,'.',',',event))" />
        </div>
    </div>
</div>
```

### Grid de Veículos (Itens da Ata)
A página apresenta duas seções condicionais para manipulação de itens, controladas via JavaScript (display: none/block).

1.  **Modo de Adição (`#divVeiculosAdd`):** Exibe uma `ejs-grid` editável (`#grdVeiculos`) que permite adicionar itens localmente antes do salvamento.
    *   Toolbar: Add, Update, Delete, Cancel.
    *   Evento `QueryCellInfo="calculate"`: Realiza cálculos de totais em tempo real.

2.  **Modo de Edição (`#divVeiculosEdit`):** Exibe um seletor de repactuação e uma `ejs-grid` somente leitura (`#grdVeiculos2`) que carrega dados do servidor.

```html
<!-- Grid para Adição -->
<div id="divVeiculosAdd" class="row" style="display:none">
    <ejs-grid id="grdVeiculos" toolbar="@(new List<string>() { "Add", "Update", "Delete", "Cancel" })" ... QueryCellInfo="calculate">
        <e-grid-columns>
            <e-grid-column field="numitem" headerText="Item" ...></e-grid-column>
            <e-grid-column field="descricao" headerText="Descrição do Veículo" ...></e-grid-column>
            <!-- ... Quantidade, Valor Unitário, Valor Total ... -->
        </e-grid-columns>
    </ejs-grid>
    <!-- Campo Total Geral calculado via JS -->
    <input id="txtTotal" ... disabled />
</div>

<!-- Grid para Visualização na Edição -->
<div id="divVeiculosEdit" class="row" style="display:none">
    <select id="lstRepactuacao" ...>...</select>
    <ejs-grid id="grdVeiculos2" ...>...</ejs-grid>
</div>
```

### Botões de Ação
Os botões utilizam `asp-page-handler` para direcionar a submissão para métodos específicos no PageModel ("Submit" ou "Edit").

```html
<div class="row">
    <div class="col-6">
        @if (Model.AtaObj.AtaRegistroPrecos.AtaId != Guid.Empty)
        {
            <button id="btnEdita" method="post" asp-page-handler="Edit" asp-route-id=@Model.AtaObj.AtaRegistroPrecos.AtaId ...>
                Atualizar Ata
            </button>
        }
        else
        {
            <button id="btnAdiciona" type="submit" value="Submit" asp-page-handler="Submit" ...>
                Criar Ata
            </button>
        }
    </div>
    <!-- Botão Cancelar -->
</div>
```

## Lógica Javascript (`ScriptsBlock`)

A lógica client-side é extensa e lida com persistência assíncrona, cálculos e formatação.

### Função `InsereRegistro()`
Esta função implementa a lógica de persistência via AJAX API, **alternativa** ao submit tradicional do formulário.
*   Nota: No código atual, os botões chamam handlers C# (`OnPostSubmit`). Esta função JS parece ser desenhada para um fluxo onde o frontend gerencia toda a transação, incluindo a inserção em cadeia dos itens da grid.

**Fluxo de Inserção:**
1.  Formata valores monetários (remove pontos, troca vírgula).
2.  Monta objeto JSON `objAta`.
3.  POST para `api/AtaRegistroPrecos/InsereAta`.
4.  No sucesso, itera sobre as linhas da grid `#grdVeiculos`.
5.  Para cada linha, monta `objItemAta` e faz POST para `api/AtaRegistroPrecos/InsereItemAta`.
6.  Redireciona para o Index.

**Fluxo de Edição:**
1.  Monta objeto JSON.
2.  POST para `api/AtaRegistroPrecos/EditaAta`.

```javascript
function InsereRegistro() {
    try {
        if ($('#AtaObj_AtaRegistroPrecos_AtaId').val() == '00000000-...') {
            // ... Formatação de valores ...
            var objAta = JSON.stringify({ ... });

            $.ajax({
                type: "post",
                url: "api/AtaRegistroPrecos/InsereAta",
                // ...
                success: function (data) {
                    var RepactuacaoId = data.data;
                    var gridObj = document.getElementById('grdVeiculos').ej2_instances[0];
                    var getRows = gridObj.getRows();

                    for (var i = 0; i < getRows.length; i++) {
                        // ... Formata valores do item ...
                        var objItemAta = JSON.stringify({
                            "NumItem": ...,
                            "RepactuacaoAtaId": RepactuacaoId
                        });

                        $.ajax({ url: "api/AtaRegistroPrecos/InsereItemAta", ... });
                    }
                    location.replace("/ataregistroprecos");
                }
            });
        } else {
            // Lógica de Edição via API
             $.ajax({ url: "api/AtaRegistroPrecos/EditaAta", ... });
        }
    } catch (error) { ... }
}
```

### Funções Utilitárias
*   `moeda(a, e, r, t)`: Implementa máscara de moeda customizada para inputs.
*   `calculate(args)`: Chamado pelo evento `QueryCellInfo` da Grid.
    *   Calcula `Total = Unitário * Quantidade`.
    *   Atualiza a célula "Valor Total" da linha.
    *   Itera sobre todas as linhas para atualizar o `#txtTotal` (Total Geral).

```javascript
function calculate(args) {
    var valorunitario = args.data.valorunitario;
    var quantidade = args.data.quantidade;
    // ... cálculo ...
    if (args.column.headerText == "Valor Total") {
        $(args.cell).text(valortotal);
    }
    // ... soma total grid ...
    $("#txtTotal").val(valortotalgeral);
}
```

### Evento `lstRepactuacao.change`
Utilizado no modo de edição. Quando o usuário seleciona uma repactuação:
1.  Chama `api/GridAta/DataSourceAta`.
2.  Filtra os dados pelo `repactuacaoId`.
3.  Atualiza o `dataSource` da Grid `#grdVeiculos2`.
4.  Calcula e exibe o total geral no `#txtTotalEdit`.

## Lógica de Backend (PageModel)

A classe `UpsertModel` gerencia o estado da página e as ações de servidor.

### Inicialização
O construtor injeta `IUnitOfWork` (dados), `IWebHostEnvironment` e `INotyfService` (notificações).

### Método `OnGet(Guid id)`
Prepara o ViewModel. Se um ID é fornecido, busca a Ata no banco de dados para edição.

```csharp
public IActionResult OnGet(Guid id)
{
    SetViewModel(); // Carrega listas (Fornecedores)
    if (id != Guid.Empty)
    {
        AtaObj.AtaRegistroPrecos = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u => u.AtaId == id);
    }
    return Page();
}
```

### Métodos `OnPostSubmit` e `OnPostEdit`
Estes métodos lidam com a submissão tradicional do formulário HTML.

**Importante:** Estes métodos persistem apenas a entidade `AtaRegistroPrecos`. A persistência dos itens (Veículos) que estão na grid client-side depende da execução do JavaScript `InsereRegistro` (via API). Se o formulário for submetido diretamente para estes handlers sem passar pelo JS de itens, apenas o cabeçalho da Ata será salvo.

```csharp
public IActionResult OnPostSubmit()
{
    if (!ModelState.IsValid) { return Page(); }

    // Verifica duplicidade (Ano/Numero)
    var existeAta = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(...);
    if (existeAta != null) { ... }

    _unitOfWork.AtaRegistroPrecos.Add(AtaObj.AtaRegistroPrecos);
    _unitOfWork.Save();

    _notyf.Success("Ata adicionada com sucesso!" , 3);
    return RedirectToPage("./Index");
}

public IActionResult OnPostEdit(Guid id)
{
    // ... Validações e atualização ...
    _unitOfWork.AtaRegistroPrecos.Update(AtaObj.AtaRegistroPrecos);
    _unitOfWork.Save();
    return RedirectToPage("./Index");
}
```
