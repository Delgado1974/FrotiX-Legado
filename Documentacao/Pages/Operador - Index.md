# Documentação: Operador - Gestão (Index)

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

A página **Operador - Index** permite visualizar, gerenciar e controlar o status de todos os operadores cadastrados no sistema. Operadores são pessoas responsáveis por operar veículos e executar serviços. A página oferece:

- ✅ **Listagem completa** de operadores com informações essenciais (Nome, Ponto, Celular, Contrato, Status)
- ✅ **Visualização de foto** através de modal Bootstrap
- ✅ **Alternância rápida de status** (Ativo/Inativo) através de clique no badge
- ✅ **Edição direta** através de botão que redireciona para página de cadastro
- ✅ **Exclusão** com confirmação via SweetAlert e validação de dependências (contratos associados)
- ✅ **Exportação de dados** para Excel e PDF através de botões do DataTable
- ✅ **Interface responsiva** com DataTable paginado e ordenável

---

## Arquivos Envolvidos

1. **Pages/Operador/Index.cshtml** - View Razor da página (inclui modal de foto)
2. **Pages/Operador/Index.cshtml.cs** - PageModel (backend da página)
3. **wwwroot/js/cadastros/operador.js** - Lógica JavaScript do DataTable e ações
4. **Controllers/OperadorController.cs** - Endpoints API REST

---

## 1. Pages/Operador/Index.cshtml

### Problema
Criar uma interface visual clara e moderna para listar operadores, com badges de status clicáveis, botões de ação padronizados, e modal para visualização de fotos.

### Solução
Utilizar estrutura HTML com DataTable, CSS customizado para badges e botões seguindo padrão visual FrotiX, modal Bootstrap 5 para fotos, e componentes responsivos.

### Código

```html
<!-- HEADER AZUL PADRÃO FROTIX -->
<div class="ftx-card-header">
    <h2 class="titulo-paginas">
        <i class="fa-duotone fa-user-headset"></i>
        Listagem de Operadores
    </h2>
    <a href="/Operador/Upsert" class="btn btn-fundo-laranja" data-ftx-loading>
        <i class="fa-duotone fa-clone-plus icon-pulse me-1"></i>
        Adicionar Operador
    </a>
</div>

<!-- CONTEÚDO -->
<div class="panel-content">
    <div id="divOperadores">
        <table id="tblOperador" class="table table-bordered table-striped" width="100%">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Ponto</th>
                    <th>Celular</th>
                    <th>Contrato</th>
                    <th>Status</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>

<!-- MODAL FOTO DO OPERADOR -->
<div class="modal fade ftx-modal" id="modalFoto" tabindex="-1" aria-labelledby="modalFotoLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalFotoLabel">
                    <i class="fa-duotone fa-camera-retro"></i>
                    <span id="txtTituloFoto">Foto do Operador</span>
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <div class="ftx-foto-container">
                    <img id="imgViewer" src="/Images/barbudo.jpg" alt="Foto do Operador" />
                </div>
            </div>
            <div class="modal-footer justify-content-center">
                <button type="button" class="btn btn-vinho" data-bs-dismiss="modal">
                    <i class="fa-duotone fa-xmark icon-pulse"></i>
                    Fechar
                </button>
            </div>
        </div>
    </div>
</div>
```

**CSS Customizado (dentro de `<style>` no arquivo):** Similar ao de Encarregado, com badges de status, modal e botões de ação.

**Script JavaScript para Modal de Foto (dentro de `@section ScriptsBlock`):**

```javascript
$(document).ready(function () {
    try {
        // ✅ Handler delegado para botão de foto
        $(document).on('click', '.btn-foto', function(e) {
            try {
                e.preventDefault();
                e.stopPropagation();
                
                var operadorId = $(this).data('id');
                var nomeOperador = $(this).closest('tr').find('td:eq(0)').text();
                
                // ✅ Limpar imagem anterior
                $('#imgViewer').attr('src', '/Images/barbudo.jpg');
                $('#txtTituloFoto').text('Carregando...');
                
                // ✅ Abrir modal
                var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalFoto'));
                modal.show();
                
                // ✅ Carregar foto via API
                $.ajax({
                    type: "GET",
                    url: "/api/Operador/PegaFotoModal",
                    data: { id: operadorId },
                    success: function (res) {
                        try {
                            if (res === false || !res) {
                                $('#txtTituloFoto').html('Operador sem Foto: <b>' + nomeOperador + '</b>');
                                $('#imgViewer').attr('src', '/Images/barbudo.jpg');
                            } else {
                                $('#txtTituloFoto').html('Foto: <b>' + nomeOperador + '</b>');
                                $('#imgViewer').attr('src', 'data:image/jpg;base64,' + res);
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("Operador/Index.cshtml", "PegaFotoModal.success", error);
                        }
                    },
                    error: function (err) {
                        try {
                            console.error("Erro ao carregar foto:", err);
                            $('#txtTituloFoto').text('Erro ao carregar foto');
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("Operador/Index.cshtml", "PegaFotoModal.error", error);
                        }
                    }
                });
            } catch (error) {
                Alerta.TratamentoErroComLinha("Operador/Index.cshtml", "btn-foto.click", error);
            }
        });

        // ✅ Limpar ao fechar modal
        $('#modalFoto').on('hide.bs.modal', function () {
            try {
                $('#imgViewer').attr('src', '/Images/barbudo.jpg');
                $('#txtTituloFoto').text('Foto do Operador');
            } catch (error) {
                Alerta.TratamentoErroComLinha("Operador/Index.cshtml", "modalFoto.hide", error);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("Operador/Index.cshtml", "document.ready", error);
    }
});
```

**Carregamento do Script JavaScript:**

```html
@section ScriptsBlock {
    <script src="~/js/cadastros/operador.js" asp-append-version="true"></script>
    <!-- Script do modal de foto já incluído acima -->
}
```

---

## 2. Pages/Operador/Index.cshtml.cs

### Problema
O PageModel precisa apenas inicializar a página, sem carregar dados adicionais (o DataTable faz isso via API).

### Solução
Manter método `OnGet()` vazio ou com estrutura básica de try-catch para tratamento de erros.

### Código

```csharp
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Operador
{
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
            try
            {
                // ✅ Página não precisa carregar dados aqui
                // O DataTable carrega dados via AJAX da API /api/operador
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Index.cshtml.cs", "OnGet", error);
                return;
            }
        }
    }
}
```

---

## 3. wwwroot/js/cadastros/operador.js

### Problema 1: Inicializar DataTable com colunas formatadas e botões de exportação
**Problema**: Precisamos criar uma tabela interativa que carregue dados da API, com renderização customizada para status (badges clicáveis) e ações (botões de editar/foto/excluir), além de permitir exportação para Excel e PDF.

**Solução**: Configurar jQuery DataTable com AJAX, definindo renderizadores personalizados para as colunas de Status e Ações, e habilitando botões de exportação usando DataTables Buttons extension.

### Código

```javascript
function loadList()
{
    try
    {
        dataTable = $("#tblOperador").DataTable({
            autoWidth: false,
            dom: 'Bfrtip', // ✅ B = Buttons (exportação)
            lengthMenu: [
                [10, 25, 50, -1],
                ['10 linhas', '25 linhas', '50 linhas', 'Todas as Linhas']
            ],
            buttons: ['pageLength', 'excel', { extend: 'pdfHtml5', orientation: 'landscape', pageSize: 'LEGAL' }], // ✅ Botões de exportação
            order: [[0, 'asc']], // ✅ Ordena por Nome (ascendente)
            columnDefs: [
                { targets: 0, className: "text-left", width: "25%" }, // Nome
                { targets: 1, className: "text-center", width: "8%" }, // Ponto
                { targets: 2, className: "text-center", width: "12%" }, // Celular
                { targets: 3, className: "text-left", width: "25%" }, // Contrato
                { targets: 4, className: "text-center", width: "10%" }, // Status
                { targets: 5, className: "text-center", width: "20%" } // Ação
            ],
            responsive: true,
            ajax: {
                url: "/api/operador", // ✅ Endpoint API
                type: "GET",
                datatype: "json"
            },
            columns: [
                { data: "nome" },
                { data: "ponto" },
                { data: "celular01" },
                { data: "contratoOperador" }, // ✅ Formato: "Ano/Numero - Fornecedor"
                {
                    // ✅ Renderizador de Status - Badge clicável
                    data: "status",
                    render: function (data, type, row) {
                        try {
                            if (data) {
                                // ATIVO - Verde
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusOperador badge-ativo" 
                                           data-ejtip="Operador ativo - clique para inativar" 
                                           data-url="/api/Operador/UpdateStatusOperador?Id=${row.operadorId}">
                                            <i class="fa-duotone fa-circle-check"></i> Ativo
                                        </a>`;
                            } else {
                                // INATIVO - Cinza
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusOperador badge-inativo" 
                                           data-ejtip="Operador inativo - clique para ativar" 
                                           data-url="/api/Operador/UpdateStatusOperador?Id=${row.operadorId}">
                                            <i class="fa-duotone fa-circle-xmark"></i> Inativo
                                        </a>`;
                            }
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("operador.js", "render.status", error);
                            return "";
                        }
                    }
                },
                {
                    // ✅ Renderizador de Ações - Botões de Editar, Foto e Excluir
                    data: "operadorId",
                    render: function (data) {
                        try {
                            return `<div class="ftx-btn-acoes">
                                        <a href="/Operador/Upsert?id=${data}" 
                                           class="btn btn-editar btn-icon-28" 
                                           data-ejtip="Editar Operador">
                                            <i class="fa-duotone fa-pen-to-square"></i>
                                        </a>
                                        <a href="javascript:void(0)" 
                                           class="btn btn-foto btn-icon-28" 
                                           data-ejtip="Foto do Operador" 
                                           data-id="${data}">
                                            <i class="fa-duotone fa-camera-retro"></i>
                                        </a>
                                        <a href="javascript:void(0)" 
                                           class="btn fundo-vermelho btn-icon-28 btn-delete" 
                                           data-ejtip="Excluir Operador" 
                                           data-id="${data}">
                                            <i class="fa-duotone fa-trash-can"></i>
                                        </a>
                                    </div>`;
                        } catch (error) {
                            Alerta.TratamentoErroComLinha("operador.js", "render.acoes", error);
                            return "";
                        }
                    }
                }
            ],
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                emptyTable: "Nenhum operador encontrado"
            },
            width: "100%"
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("operador.js", "loadList", error);
    }
}
```

### Problema 2: Implementar exclusão com confirmação e validação de dependências
**Problema**: Ao clicar no botão de excluir, precisamos confirmar a ação do usuário antes de enviar a requisição à API. Além disso, o backend deve validar se existem contratos associados ao operador.

**Solução**: Usar SweetAlert (`Alerta.Confirmar`) para solicitar confirmação, e só então fazer a chamada AJAX POST para `/api/Operador/Delete`. O backend valida dependências antes de excluir.

### Código

```javascript
// Handler delegado para excluir operador
$(document).on("click", ".btn-delete", function () {
    try {
        var id = $(this).data("id");

        // ✅ Mostra diálogo de confirmação
        Alerta.Confirmar(
            "Confirmar Exclusão",
            "Você tem certeza que deseja apagar este operador?",
            "Sim, excluir",
            "Cancelar"
        ).then((willDelete) => {
            try {
                if (willDelete) {
                    var dataToPost = JSON.stringify({ OperadorId: id });
                    $.ajax({
                        url: "/api/Operador/Delete",
                        type: "POST",
                        data: dataToPost,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            try {
                                if (data.success) {
                                    AppToast.show("Verde", data.message, 2000);
                                    dataTable.ajax.reload(); // ✅ Recarrega tabela
                                } else {
                                    AppToast.show("Vermelho", data.message, 3000);
                                }
                            } catch (error) {
                                Alerta.TratamentoErroComLinha("operador.js", "Delete.success", error);
                            }
                        },
                        error: function (err) {
                            try {
                                console.error("Erro ao excluir:", err);
                                AppToast.show("Vermelho", "Erro ao excluir operador", 3000);
                            } catch (error) {
                                Alerta.TratamentoErroComLinha("operador.js", "Delete.error", error);
                            }
                        }
                    });
                }
            } catch (error) {
                Alerta.TratamentoErroComLinha("operador.js", "Delete.confirmar", error);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("operador.js", "btn-delete.click", error);
    }
});
```

### Problema 3: Alternar status ao clicar no badge
**Problema**: Quando o usuário clica no badge de status (Ativo/Inativo), precisamos alternar o status do operador e atualizar a visualização do badge sem recarregar a página inteira.

**Solução**: Fazer chamada AJAX GET para `/api/Operador/UpdateStatusOperador`, e atualizar dinamicamente as classes CSS e o conteúdo HTML do badge baseado na resposta (`data.type`).

### Código

```javascript
// Handler delegado para alterar status
$(document).on("click", ".updateStatusOperador", function () {
    try {
        var url = $(this).data("url");
        var currentElement = $(this);

        $.get(url, function (data) {
            try {
                if (data.success) {
                    AppToast.show("Verde", "Status alterado com sucesso!", 2000);

                    if (data.type == 1) {
                        // ✅ Mudou para INATIVO - Cinza
                        currentElement.html('<i class="fa-duotone fa-circle-xmark"></i> Inativo');
                        currentElement.removeClass("badge-ativo").addClass("badge-inativo");
                        currentElement.attr("data-ejtip", "Operador inativo - clique para ativar");
                    } else {
                        // ✅ Mudou para ATIVO - Verde
                        currentElement.html('<i class="fa-duotone fa-circle-check"></i> Ativo');
                        currentElement.removeClass("badge-inativo").addClass("badge-ativo");
                        currentElement.attr("data-ejtip", "Operador ativo - clique para inativar");
                    }
                } else {
                    Alerta.Erro("Erro ao Alterar Status", "Ocorreu um erro ao tentar alterar o status.", "OK");
                }
            } catch (error) {
                Alerta.TratamentoErroComLinha("operador.js", "updateStatus.callback", error);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("operador.js", "updateStatusOperador.click", error);
    }
});
```

**Inicialização no Document Ready:**

```javascript
$(document).ready(function () {
    try {
        loadList(); // ✅ Carrega DataTable

        // Eventos já registrados acima (delete e toggle-status)
    } catch (error) {
        Alerta.TratamentoErroComLinha("operador.js", "document.ready", error);
    }
});
```

---

## 4. Controllers/OperadorController.cs

### Problema 1: Retornar lista de operadores com informações de contrato e fornecedor
**Problema**: O DataTable precisa receber dados em formato JSON com estrutura específica (`{ data: [...] }`), incluindo informações do contrato relacionado e do fornecedor do contrato.

**Solução**: Fazer JOINs entre `Operador`, `Contrato` e `Fornecedor` usando LEFT JOIN para permitir operadores sem contrato, e formatar o campo `ContratoOperador` como "Ano/Numero - Fornecedor".

### Código

```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        // ✅ JOINs complexos: Operador → Contrato → Fornecedor
        var result = (
            from o in _unitOfWork.Operador.GetAll()

            join ct in _unitOfWork.Contrato.GetAll()
                on o.ContratoId equals ct.ContratoId
                into ctr
            from ctrResult in ctr.DefaultIfEmpty() // ✅ LEFT JOIN

            join f in _unitOfWork.Fornecedor.GetAll()
                on ctrResult == null
                    ? Guid.Empty
                    : ctrResult.FornecedorId equals f.FornecedorId
                into frd
            from frdResult in frd.DefaultIfEmpty() // ✅ LEFT JOIN

            join us in _unitOfWork.AspNetUsers.GetAll()
                on o.UsuarioIdAlteracao equals us.Id

            select new
            {
                o.OperadorId,
                o.Nome,
                o.Ponto,
                o.Celular01,
                // ✅ Formata contrato como "Ano/Numero - Fornecedor" ou "(Sem Contrato)"
                ContratoOperador = ctrResult != null
                    ? (
                        ctrResult.AnoContrato
                        + "/"
                        + ctrResult.NumeroContrato
                        + " - "
                        + frdResult.DescricaoFornecedor
                    )
                    : "<b>(Sem Contrato)</b>",
                o.Status,
                o.Foto,
                DatadeAlteracao = o.DataAlteracao?.ToString("dd/MM/yy"),
                us.NomeCompleto,
            }
        ).ToList();

        return Json(new
        {
            data = result // ✅ Formato esperado pelo DataTable
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("OperadorController.cs", "Get", error);
        return Json(new
        {
            data = new List<object>()
        });
    }
}
```

### Problema 2: Excluir operador com validação de dependências
**Problema**: Ao excluir um operador, precisamos validar se existem contratos associados a ele através da tabela `OperadorContrato`. Se houver, a exclusão deve ser bloqueada.

**Solução**: Buscar o operador pelo ID, verificar se existe algum registro em `OperadorContrato` com `OperadorId` igual ao ID do operador. Se existir, retornar erro. Caso contrário, excluir o operador.

### Código

```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(OperadorViewModel model)
{
    try
    {
        if (model != null && model.OperadorId != Guid.Empty)
        {
            // ✅ Busca operador no banco
            var objFromDb = _unitOfWork.Operador.GetFirstOrDefault(u =>
                u.OperadorId == model.OperadorId
            );
            if (objFromDb != null)
            {
                // ✅ Verifica se há contratos associados
                var operadorContrato = _unitOfWork.OperadorContrato.GetFirstOrDefault(u =>
                    u.OperadorId == model.OperadorId
                );
                if (operadorContrato != null)
                {
                    // ✅ Bloqueia exclusão se houver contratos
                    return Json(
                        new
                        {
                            success = false,
                            message = "Não foi possível remover o operador. Ele está associado a um ou mais contratos!",
                        }
                    );
                }

                // ✅ Exclui operador
                _unitOfWork.Operador.Remove(objFromDb);
                _unitOfWork.Save(); // ✅ Persiste exclusão
                return Json(
                    new
                    {
                        success = true,
                        message = "Operador removido com sucesso"
                    }
                );
            }
        }
        return Json(new
        {
            success = false,
            message = "Erro ao apagar operador"
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("OperadorController.cs", "Delete", error);
        return Json(new
        {
            success = false,
            message = "Erro ao apagar operador"
        });
    }
}
```

### Problema 3: Alternar status do operador
**Problema**: Ao clicar no badge de status, precisamos inverter o valor booleano `Status` do operador e retornar informações sobre a mudança (tipo 0=Ativo, 1=Inativo) para atualizar a interface.

**Solução**: Buscar o operador, inverter `Status`, atualizar no banco, e retornar JSON com `success`, `message` e `type`.

**⚠️ NOTA IMPORTANTE**: O código atual **não chama `Save()`** após `Update()`, o que pode impedir a persistência da alteração. Isso pode ser um bug que precisa ser corrigido.

### Código

```csharp
[Route("UpdateStatusOperador")]
public JsonResult UpdateStatusOperador(Guid Id)
{
    try
    {
        if (Id != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Operador.GetFirstOrDefault(u => u.OperadorId == Id);
            string Description = "";
            int type = 0;

            if (objFromDb != null)
            {
                if (objFromDb.Status == true)
                {
                    // ✅ Muda para INATIVO
                    objFromDb.Status = false;
                    Description = string.Format(
                        "Atualizado Status do Operador [Nome: {0}] (Inativo)",
                        objFromDb.Nome
                    );
                    type = 1; // ✅ Tipo 1 = Inativo
                }
                else
                {
                    // ✅ Muda para ATIVO
                    objFromDb.Status = true;
                    Description = string.Format(
                        "Atualizado Status do Operador  [Nome: {0}] (Ativo)",
                        objFromDb.Nome
                    );
                    type = 0; // ✅ Tipo 0 = Ativo
                }
                _unitOfWork.Operador.Update(objFromDb);
                // ⚠️ BUG: Falta chamar _unitOfWork.Save() aqui!
                // Deveria ser: _unitOfWork.Save();
            }
            return Json(
                new
                {
                    success = true,
                    message = Description,
                    type = type, // ✅ Usado pelo JS para atualizar badge
                }
            );
        }
        return Json(new
        {
            success = false
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("OperadorController.cs", "UpdateStatusOperador", error);
        return new JsonResult(new
        {
            success = false
        });
    }
}
```

### Problema 4: Retornar foto do operador para modal
**Problema**: Quando o usuário clica no botão de foto, precisamos retornar a foto do operador em formato Base64 para exibir no modal.

**Solução**: Buscar o operador pelo ID, verificar se tem foto (`Foto != null`), converter para Base64, e retornar como JSON. Se não tiver foto, retornar `false`.

### Código

```csharp
[HttpGet]
[Route("PegaFotoModal")]
public JsonResult PegaFotoModal(Guid id)
{
    try
    {
        var objFromDb = _unitOfWork.Operador.GetFirstOrDefault(u => u.OperadorId == id);
        if (objFromDb != null && objFromDb.Foto != null)
        {
            // ✅ Converte foto para Base64
            string base64 = Convert.ToBase64String(objFromDb.Foto);
            return Json(base64);
        }
        return Json(false); // ✅ Sem foto
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("OperadorController.cs", "PegaFotoModal", error);
        return new JsonResult(new
        {
            success = false
        });
    }
}
```

---

## Fluxo de Funcionamento

### Fluxo 1: Carregamento Inicial da Página

1. **Usuário acessa** `/Operador` ou `/Operador/Index`
2. **Servidor renderiza** `Pages/Operador/Index.cshtml` (PageModel `OnGet()` não carrega dados)
3. **Browser carrega** `operador.js` via `@section ScriptsBlock`
4. **JavaScript executa** `$(document).ready()` → chama `loadList()`
5. **DataTable inicializa** e faz requisição AJAX GET para `/api/operador`
6. **Controller `Get()`** executa JOINs complexos entre `Operador`, `Contrato` e `Fornecedor`
7. **Controller formata** campo `ContratoOperador` como "Ano/Numero - Fornecedor" ou "(Sem Contrato)"
8. **Controller retorna** JSON `{ data: [...] }`
9. **DataTable renderiza** colunas com dados, aplicando renderizadores customizados para Status e Ações
10. **Badges de status** são renderizados como elementos clicáveis com classes CSS `updateStatusOperador`
11. **Botões de ação** são renderizados com classes `btn-editar` (editar), `btn-foto` (foto) e `btn-delete` (excluir)

### Fluxo 2: Visualizar Foto (Clique no Botão de Foto)

1. **Usuário clica** no botão de foto (ícone de câmera)
2. **Event handler** `.btn-foto` captura o clique (registrado no `Index.cshtml`)
3. **JavaScript extrai** `data-id` do botão e nome do operador da linha da tabela
4. **Modal Bootstrap** é aberto via `bootstrap.Modal.getOrCreateInstance()`
5. **Imagem temporária** é exibida (`/Images/barbudo.jpg`) enquanto carrega
6. **AJAX GET** é enviado para `/api/Operador/PegaFotoModal?id={guid}`
7. **Controller `PegaFotoModal()`** busca o operador pelo ID
8. **Controller verifica** se tem foto (`Foto != null`)
9. **Se tem foto**: converte para Base64 e retorna string
10. **Se não tem foto**: retorna `false`
11. **JavaScript recebe** resposta e atualiza `src` da imagem com `data:image/jpg;base64,{base64}` ou mantém imagem padrão
12. **Título do modal** é atualizado com nome do operador

### Fluxo 3: Alternar Status (Clique no Badge)

1. **Usuário clica** no badge de status (Ativo ou Inativo)
2. **Event handler** `.updateStatusOperador` captura o clique
3. **JavaScript extrai** `data-url` do elemento (ex: `/api/Operador/UpdateStatusOperador?Id={guid}`)
4. **AJAX GET** é enviado para a URL
5. **Controller `UpdateStatusOperador()`** busca o operador pelo ID
6. **Controller inverte** `Status` (true → false ou false → true)
7. **Controller atualiza** no banco via `Update()` (⚠️ **BUG**: não chama `Save()`)
8. **Controller retorna** JSON `{ success: true, message: "...", type: 0 ou 1 }`
9. **JavaScript recebe** resposta e atualiza classes CSS do badge (`removeClass` / `addClass`)
10. **JavaScript atualiza** HTML interno do badge (ícone e texto) e tooltip baseado em `data.type`
11. **AppToast** exibe mensagem de sucesso

### Fluxo 4: Excluir Operador

1. **Usuário clica** no botão de excluir (ícone de lixeira)
2. **Event handler** `.btn-delete` captura o clique
3. **JavaScript extrai** `data-id` do botão
4. **SweetAlert `Alerta.Confirmar()`** exibe diálogo de confirmação
5. **Se usuário confirma** (`willDelete === true`):
   - JavaScript monta objeto JSON `{ OperadorId: id }`
   - **AJAX POST** é enviado para `/api/Operador/Delete`
   - **Controller `Delete()`** valida o modelo e busca o operador
   - **Controller verifica** se existe `OperadorContrato` associado
   - **Se existe contrato**: retorna erro `{ success: false, message: "Não foi possível remover..." }`
   - **Se não existe**: remove via `Remove()` e `Save()`
   - **Controller retorna** JSON `{ success: true, message: "..." }`
   - **JavaScript recebe** resposta e exibe `AppToast` de sucesso ou erro
   - **DataTable recarrega** via `dataTable.ajax.reload()` se sucesso
6. **Se usuário cancela**, nada acontece

### Fluxo 5: Editar Operador

1. **Usuário clica** no botão de editar (ícone de lápis)
2. **Link HTML** redireciona para `/Operador/Upsert?id={guid}`
3. **Página Upsert** carrega e permite edição (documentada separadamente)

### Fluxo 6: Exportar Dados

1. **Usuário clica** em botão de exportação (Excel ou PDF) na barra de ferramentas do DataTable
2. **DataTables Buttons** processa os dados da tabela atual (com filtros aplicados)
3. **Para Excel**: gera arquivo `.xlsx` e faz download
4. **Para PDF**: gera arquivo `.pdf` em formato landscape e faz download

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Parâmetros | Retorno |
|--------|----------|-----------|------------|---------|
| **GET** | `/api/operador` | Lista todos os operadores para DataTable (com JOINs) | Nenhum | `{ data: [{ operadorId, nome, ponto, celular01, contratoOperador, status, foto, ... }, ...] }` |
| **POST** | `/api/Operador/Delete` | Exclui um operador (com validação de contratos) | Body: `{ OperadorId: Guid }` | `{ success: bool, message: string }` |
| **GET** | `/api/Operador/UpdateStatusOperador` | Alterna status (Ativo ↔ Inativo) | Query: `Id={Guid}` | `{ success: bool, message: string, type: int }` (type: 0=Ativo, 1=Inativo) |
| **GET** | `/api/Operador/PegaFotoModal` | Retorna foto do operador em Base64 | Query: `id={Guid}` | `string` (Base64) ou `false` |

---

## Troubleshooting

### Problema: Status não persiste após alternar
**Causa**: O método `UpdateStatusOperador` no Controller não chama `_unitOfWork.Save()` após `Update()`, então a alteração não é persistida no banco de dados.

**Solução**: 
- Adicionar `_unitOfWork.Save();` após `_unitOfWork.Operador.Update(objFromDb);` na linha 178 do `OperadorController.cs`
- Verificar se o UnitOfWork está configurado corretamente para persistir alterações

### Problema: Foto não aparece no modal
**Causa**: Possíveis causas:
1. Operador não tem foto cadastrada (`Foto` é `null`)
2. Erro na conversão Base64
3. Erro na requisição AJAX

**Solução**:
- Verificar se o operador tem foto no banco de dados
- Abrir Console do navegador (F12) e verificar erros JavaScript
- Verificar Network tab para ver resposta da requisição `/api/Operador/PegaFotoModal`
- Verificar logs do servidor para erros no Controller

### Problema: Não consegue excluir operador
**Causa**: Operador está associado a um ou mais contratos através da tabela `OperadorContrato`.

**Solução**: 
- Verificar contratos associados ao operador na página de Contratos
- Desassociar operador dos contratos primeiro
- Depois tentar excluir novamente

### Problema: Contrato aparece como "(Sem Contrato)" mas deveria aparecer
**Causa**: Possíveis causas:
1. `ContratoId` do operador está vazio ou inválido
2. JOIN falhou (contrato não existe ou foi excluído)
3. Fornecedor do contrato não existe

**Solução**:
- Verificar se o operador tem `ContratoId` válido no banco
- Verificar se o contrato existe e está ativo
- Verificar se o fornecedor do contrato existe
- Verificar logs do servidor para erros no JOIN

### Problema: DataTable não carrega dados
**Causa**: Possíveis causas:
1. Endpoint `/api/operador` retornou erro
2. Formato do JSON não está correto (deve ser `{ data: [...] }`)
3. JOINs complexos estão causando erro (null reference)

**Solução**:
- Abrir Network tab do navegador (F12) e verificar resposta da requisição AJAX
- Verificar se o Controller retorna `Json(new { data = result })`
- Verificar se há erros no Console do navegador
- Verificar logs do servidor para erros nos JOINs
- Verificar se todas as tabelas relacionadas existem (`Contrato`, `Fornecedor`, `AspNetUsers`)

### Problema: Botões de exportação não aparecem
**Causa**: DataTables Buttons extension não está carregada ou configurada incorretamente.

**Solução**:
- Verificar se `dataTables.buttons.min.js` está incluído na página
- Verificar se `buttons.bootstrap5.min.css` está incluído
- Verificar se `dom: 'Bfrtip'` está configurado no DataTable
- Verificar se `buttons: [...]` está configurado corretamente

---

## Notas Técnicas

- **JOINs Complexos**: A listagem usa múltiplos LEFT JOINs para incluir informações de Contrato e Fornecedor, permitindo operadores sem contrato
- **Validação de Dependências**: A exclusão de operador valida se existem contratos associados antes de permitir a exclusão, evitando inconsistências no banco de dados
- **Modal de Foto**: A foto é carregada via AJAX e exibida em modal Bootstrap 5, usando Base64 para transferência
- **Exportação de Dados**: DataTables Buttons permite exportar dados filtrados para Excel e PDF sem recarregar a página
- **Event Delegation**: Eventos são registrados via `$(document).on("click", ".btn-delete", ...)` para funcionar com elementos dinâmicos do DataTable
- **Try-Catch em Todos os Blocos**: Todo código JavaScript possui tratamento de erro com `Alerta.TratamentoErroComLinha()` para facilitar debugging
- **UnitOfWork Pattern**: Controller usa `IUnitOfWork` para abstrair acesso ao banco de dados
- **Validação de Guid**: Controller valida se o Guid não está vazio antes de buscar no banco
- **⚠️ BUG CONHECIDO**: O método `UpdateStatusOperador` não chama `Save()` após `Update()`, o que pode impedir a persistência da alteração de status

---

## Log de Modificações

### [08/01/2026] - Expansão para Padrão FrotiX Simplificado
**Descrição**: Documentação completamente reescrita seguindo o padrão "Problema → Solução → Código", com fluxos detalhados, tabela de endpoints e troubleshooting expandido. Incluída documentação do modal de foto e dos JOINs complexos. Incluída nota sobre bug conhecido no método `UpdateStatusOperador`.

**Status**: ✅ **Completo**

**Responsável**: Claude (AI Assistant)  
**Versão**: 2.0

### [08/01/2026] - Criação da Documentação
**Descrição**: Documentação inicial da listagem de Operadores (Index).

**Status**: ✅ **Substituído pela versão 2.0**

**Responsável**: Claude (AI Assistant)  
**Versão**: 0.1
