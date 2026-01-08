# Funcionalidade - AtaRegistroPrecos - Index

## Visão Geral
Esta página é responsável pela listagem das Atas de Registro de Preços cadastradas no sistema. Ela apresenta uma tabela com os principais dados das atas e opções de filtragem e ação, seguindo o padrão visual do sistema FrotiX.

**Caminho do Arquivo:** `Pages/AtaRegistroPrecos/Index.cshtml`
**PageModel:** `Pages/AtaRegistroPrecos/Index.cshtml.cs`

## Estrutura da Página (Razor View)

A página define o título e breadcrumbs, e utiliza o layout padrão. O `ViewData` configura metadados utilizados pelo layout mestre para renderizar cabeçalhos e ícones.

### Cabeçalho e Estilos (`HeadBlock`)
Define estilos específicos para:
*   **Outline de botões:** Efeito visual no botão de adicionar.
*   **Badges de Status (`.ftx-badge-status`):** Visualização padronizada para status (ativo/inativo).
*   **Ações da Tabela (`.ftx-actions`):** Estilização dos botões de ação dentro da grid.

```html
@{
    ViewData["Title"] = "Atas de Registro de Preços";
    ViewData["PageName"] = "ataregistroprecos_index";
    ViewData["Heading"] = "<i class='fa-duotone fa-folders'></i> Cadastros: <span class='fw-300'>Atas de Registro de Preços</span>";
    // ...
}

@section HeadBlock {
    <style>
        /* Estilos para outline de botões, badges de status e ações da tabela */
        .ftx-card-header .btn-fundo-laranja { ... }
        .ftx-badge-status { ... }
        /* ... */
    </style>
}
```

### Conteúdo Principal
A estrutura principal é composta por um painel (`.panel`) que contém:
1.  **Header (`.ftx-card-header`):** Exibe o título da página e o botão de ação principal "Adicionar Ata".
2.  **Corpo (`.panel-content`):** Contém a tabela HTML (`#tblAta`) que serve de base para o plugin DataTables.

```html
<div class="row">
    <div class="col-xl-12">
        <div id="panel-1" class="panel">
            <!-- ===== HEADER FROTIX ===== -->
            <div class="ftx-card-header">
                <h2 class="titulo-paginas">
                    <i class="fa-duotone fa-folders"></i>
                    Atas de Registro de Preços
                </h2>
                <div class="ftx-card-actions">
                    <a href="/AtaRegistroPrecos/Upsert" class="btn btn-fundo-laranja" data-ftx-loading>
                        <i class="fa-duotone fa-clone-plus icon-pulse me-1"></i> Adicionar Ata
                    </a>
                </div>
            </div>

            <div class="panel-container show">
                <div class="panel-content">
                    <div class="box-body">
                        <!-- Tabela de Listagem -->
                        <table id="tblAta" class="table table-bordered table-striped" width="100%">
                            <thead>
                                <tr>
                                    <th>Ata</th>
                                    <th>Processo</th>
                                    <th>Objeto</th>
                                    <th>Empresa</th>
                                    <th>Vigência</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

### Scripts (`ScriptsBlock`)
Carrega o Bootstrap e o script específico da funcionalidade `ata.js`, que é responsável por inicializar o DataTables e manipular os dados da grid via AJAX.

```html
@section ScriptsBlock {
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" crossorigin="anonymous" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

    <script src="~/js/cadastros/ata.js" asp-append-version="true"></script>
}
```

## Lógica de Backend (PageModel)

O arquivo `Index.cshtml.cs` contém a classe `IndexModel`. Nesta implementação, o método `OnGet` é utilizado apenas para inicialização básica e tratamento de exceções. O carregamento de dados é realizado inteiramente pelo cliente (JavaScript) chamando APIs, padrão comum em implementações SPA-like ou ricas em interatividade.

```csharp
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.AtaRegistroPrecos
{
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
            try
            {
                // Lógica de inicialização (vazio atualmente)
            }
            catch (Exception error)
            {
                // Utiliza helper global de alerta para logar erros com contexto
                Alerta.TratamentoErroComLinha("Index.cshtml.cs" , "OnGet" , error);
                return;
            }
        }
    }
}
```
