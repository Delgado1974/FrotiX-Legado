# Documentação: Requisitante - Gestão (Index)

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

A página **Requisitante - Index** permite visualizar, gerenciar e controlar o status de todos os requisitantes cadastrados no sistema. Requisitantes são pessoas ou setores que solicitam serviços de viagem ou manutenção de veículos. A página oferece:

- ✅ **Listagem completa** de requisitantes com informações essenciais (Ponto, Nome, Ramal, Setor, Status)
- ✅ **Alternância rápida de status** (Ativo/Inativo) através de clique no badge
- ✅ **Edição direta** através de botão que redireciona para página de cadastro
- ✅ **Exclusão** com confirmação via SweetAlert
- ✅ **Interface responsiva** com DataTable paginado e ordenável

---

## Arquivos Envolvidos

1. **Pages/Requisitante/Index.cshtml** - View Razor da página
2. **Pages/Requisitante/Index.cshtml.cs** - PageModel (backend da página)
3. **wwwroot/js/cadastros/requisitante.js** - Lógica JavaScript do DataTable e ações
4. **Controllers/RequisitanteController.cs** - Endpoints API REST

---

## 1. Pages/Requisitante/Index.cshtml

### Problema
Criar uma interface visual clara e moderna para listar requisitantes, com badges de status clicáveis e botões de ação padronizados.

### Solução
Utilizar estrutura HTML com DataTable, CSS customizado para badges e botões seguindo padrão visual FrotiX, e componentes Bootstrap 5.

### Código

```html
<!-- HEADER DO CARD - PADRÃO FROTIX -->
<div class="ftx-card-header">
    <h2 class="titulo-paginas">
        <i class="fa-duotone fa-user-tie"></i>
        Gestão de Requisitantes
    </h2>
    <div class="ftx-card-actions">
        <a href="/Requisitante/Upsert" class="btn btn-fundo-laranja" data-ftx-loading>
            <i class="fa-duotone fa-clone-plus icon-pulse me-1"></i>
            Adicionar Requisitante
        </a>
    </div>
</div>

<!-- CONTEÚDO -->
<div class="panel-content">
    <div class="box-body">
        <!-- DATATABLE -->
        <div id="divRequisitantes">
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
        </div>
    </div>
</div>
```

**CSS Customizado (dentro de `<style>` no arquivo):**

```css
/* ===== BADGES DE STATUS - PADRÃO FROTIX ===== */
.ftx-badge-status {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: .35rem .75rem !important;
    min-height: 1.65rem;
    min-width: 5.5rem;
    white-space: nowrap;
    font-size: .78rem !important;
    font-weight: 600 !important;
    line-height: 1 !important;
    border-radius: 9999px !important;
    color: #fff !important;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    gap: 0.35rem;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
}

/* Ativo - Verde */
.ftx-badge-ativo {
    background: linear-gradient(135deg, #198754 0%, #157347 100%);
}

/* Inativo - Cinza Escuro */
.ftx-badge-inativo {
    background: linear-gradient(135deg, #525960 0%, #434a51 100%);
}

/* Badge clicável */
.ftx-badge-status.ftx-badge-clickable {
    cursor: pointer;
}

.ftx-badge-status.ftx-badge-clickable:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
}

/* ===== BOTÕES DE AÇÃO - PADRÃO FROTIX ===== */
.btn-acao-ftx {
    width: 32px;
    height: 30px;
    padding: 0 !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem !important;
    font-size: 0.95rem;
    margin: 2px;
    border: none;
    color: #fff !important;
    transition: all 0.3s ease, transform 0.2s ease;
    cursor: pointer;
}

/* Editar - Azul */
.btn-acao-ftx.btn-azul {
    background-color: #325d88 !important;
    box-shadow: 0 0 8px rgba(50, 93, 136, 0.5), 0 2px 4px rgba(50, 93, 136, 0.3);
}

.btn-acao-ftx.btn-azul:hover {
    background-color: #2a4d73 !important;
    box-shadow: 0 0 20px rgba(50, 93, 136, 0.8), 0 6px 12px rgba(50, 93, 136, 0.5);
    transform: translateY(-2px);
}

/* Excluir - Vinho */
.btn-acao-ftx.btn-vinho {
    background-color: #722F37 !important;
    box-shadow: 0 0 8px rgba(114, 47, 55, 0.5), 0 2px 4px rgba(114, 47, 55, 0.3);
}

.btn-acao-ftx.btn-vinho:hover {
    background-color: #5a252c !important;
    box-shadow: 0 0 20px rgba(114, 47, 55, 0.8), 0 6px 12px rgba(114, 47, 55, 0.5);
    transform: translateY(-2px);
}

/* ===== DATATABLE HEADER - PADRÃO FROTIX ===== */
#tblRequisitante thead th {
    background-color: #4a6fa5 !important;
    color: #fff !important;
    font-weight: 600;
    border-color: #3d5d8a !important;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
}
```

**Carregamento do Script JavaScript:**

```html
@section ScriptsBlock {
    <script src="~/js/cadastros/requisitante.js" asp-append-version="true"></script>
}
```

---

## 2. Pages/Requisitante/Index.cshtml.cs

### Problema
O PageModel precisa apenas inicializar a página, sem carregar dados adicionais (o DataTable faz isso via API).

### Solução
Manter método `OnGet()` vazio ou com estrutura básica de try-catch para tratamento de erros.

### Código

```csharp
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Requisitante
{
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
            try
            {
                // ✅ Página não precisa carregar dados aqui
                // O DataTable carrega dados via AJAX da API /api/requisitante
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

## 3. wwwroot/js/cadastros/requisitante.js

### Problema 1: Inicializar DataTable com colunas formatadas
**Problema**: Precisamos criar uma tabela interativa que carregue dados da API, com renderização customizada para status (badges clicáveis) e ações (botões de editar/excluir).

**Solução**: Configurar jQuery DataTable com AJAX, definindo renderizadores personalizados para as colunas de Status e Ações.

### Código

```javascript
function loadList()
{
    try
    {
        dataTable = $("#tblRequisitante").DataTable({
            order: [], // ✅ Sem ordenação padrão
            columnDefs: [
                {
                    targets: 0, // Ponto
                    className: "text-center",
                    width: "8%",
                },
                {
                    targets: 1, // Nome
                    className: "text-left",
                    width: "25%",
                },
                {
                    targets: 2, // Ramal
                    className: "text-center",
                    width: "8%",
                },
                {
                    targets: 3, // Setor
                    className: "text-left",
                    width: "25%",
                },
                {
                    targets: 4, // Status
                    className: "text-center",
                    width: "10%",
                },
                {
                    targets: 5, // Ação
                    className: "text-center",
                    width: "10%",
                },
            ],

            responsive: true,
            ajax: {
                url: "/api/requisitante", // ✅ Endpoint API
                type: "GET",
                datatype: "json",
            },
            columns: [
                { data: "ponto" },
                { data: "nome" },
                { data: "ramal" },
                { data: "nomeSetor" },
                {
                    // ✅ Renderizador de Status - Badge Padrão FrotiX CLICÁVEL
                    data: "status",
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            var id = row.requisitanteId;
                            if (data)
                            {
                                // ATIVO - Verde
                                return '<span class="ftx-badge-status ftx-badge-ativo ftx-badge-clickable btn-toggle-status" ' +
                                       'data-url="/api/Requisitante/updateStatusRequisitante?Id=' + id + '" ' +
                                       'title="Clique para desativar">' +
                                       '<i class="fa-duotone fa-circle-check"></i> ' +
                                       'Ativo</span>';
                            } else
                            {
                                // INATIVO - Cinza
                                return '<span class="ftx-badge-status ftx-badge-inativo ftx-badge-clickable btn-toggle-status" ' +
                                       'data-url="/api/Requisitante/updateStatusRequisitante?Id=' + id + '" ' +
                                       'title="Clique para ativar">' +
                                       '<i class="fa-duotone fa-circle-xmark"></i> ' +
                                       'Inativo</span>';
                            }
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("requisitante.js", "DataTable.render.status", error);
                            return "";
                        }
                    },
                },
                {
                    // ✅ Renderizador de Ações - Botões Padrão FrotiX com ícones duotone
                    data: "requisitanteId",
                    render: function (data)
                    {
                        try
                        {
                            return '<div class="d-flex justify-content-center gap-1">' +
                                       '<a href="/Requisitante/Upsert?id=' + data + '" ' +
                                          'class="btn-acao-ftx btn-azul" ' +
                                          'title="Editar requisitante">' +
                                           '<i class="fa-duotone fa-pen-to-square" style="--fa-primary-color:#fff; --fa-secondary-color:#90caf9;"></i>' +
                                       '</a>' +
                                       '<button type="button" class="btn-acao-ftx btn-vinho btn-delete" ' +
                                               'data-id="' + data + '" ' +
                                               'title="Excluir requisitante">' +
                                           '<i class="fa-duotone fa-trash-can" style="--fa-primary-color:#fff; --fa-secondary-color:#ffcdd2;"></i>' +
                                       '</button>' +
                                   '</div>';
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("requisitante.js", "DataTable.render.acoes", error);
                            return "";
                        }
                    },
                },
            ],

            language: {
                url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                emptyTable: "Sem Dados para Exibição",
            },
            width: "100%",
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("requisitante.js", "loadList", error);
    }
}
```

### Problema 2: Implementar exclusão com confirmação
**Problema**: Ao clicar no botão de excluir, precisamos confirmar a ação do usuário antes de enviar a requisição à API.

**Solução**: Usar SweetAlert (`Alerta.Confirmar`) para solicitar confirmação, e só então fazer a chamada AJAX POST para `/api/Requisitante/Delete`.

### Código

```javascript
// Evento de exclusão de requisitante
$(document).on("click", ".btn-delete", function ()
{
    try
    {
        var id = $(this).data("id");

        // ✅ Mostra diálogo de confirmação
        Alerta.Confirmar(
            "Confirmar Exclusão",
            "Você tem certeza que deseja apagar este requisitante? Não será possível recuperar os dados eliminados!",
            "Sim, excluir",
            "Cancelar"
        ).then((willDelete) =>
        {
            try
            {
                if (willDelete)
                {
                    var dataToPost = JSON.stringify({ RequisitanteId: id });
                    var url = "/api/Requisitante/Delete";
                    $.ajax({
                        url: url,
                        type: "POST",
                        data: dataToPost,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data)
                        {
                            try
                            {
                                if (data.success)
                                {
                                    AppToast.show("Verde", data.message, 2000);
                                    dataTable.ajax.reload(); // ✅ Recarrega tabela
                                } else
                                {
                                    AppToast.show("Vermelho", data.message, 2000);
                                }
                            }
                            catch (error)
                            {
                                Alerta.TratamentoErroComLinha("requisitante.js", "ajax.Delete.success", error);
                            }
                        },
                        error: function (err)
                        {
                            try
                            {
                                console.error(err);
                                AppToast.show("Vermelho", "Ocorreu um erro ao tentar excluir o requisitante.", 2000);
                            }
                            catch (error)
                            {
                                Alerta.TratamentoErroComLinha("requisitante.js", "ajax.Delete.error", error);
                            }
                        },
                    });
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("requisitante.js", "btn-delete.Confirmar.then", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("requisitante.js", "btn-delete.click", error);
    }
});
```

### Problema 3: Alternar status ao clicar no badge
**Problema**: Quando o usuário clica no badge de status (Ativo/Inativo), precisamos alternar o status do requisitante e atualizar a visualização do badge sem recarregar a página inteira.

**Solução**: Fazer chamada AJAX GET para `/api/Requisitante/updateStatusRequisitante`, e atualizar dinamicamente as classes CSS e o conteúdo HTML do badge baseado na resposta (`data.type`).

### Código

```javascript
// Evento de clique no badge de status para alternar Ativo/Inativo
$(document).on("click", ".btn-toggle-status", function ()
{
    try
    {
        var url = $(this).data("url");
        var currentElement = $(this);

        $.get(url, function (data)
        {
            try
            {
                if (data.success)
                {
                    AppToast.show("Verde", "Status alterado com sucesso!", 2000);

                    if (data.type == 1)
                    {
                        // ✅ Mudou para INATIVO - Cinza
                        currentElement
                            .removeClass('ftx-badge-ativo')
                            .addClass('ftx-badge-inativo')
                            .attr('title', 'Clique para ativar')
                            .html('<i class="fa-duotone fa-circle-xmark" style="--fa-primary-color:#fff; --fa-secondary-color:#adb5bd;"></i>Inativo');
                    }
                    else 
                    {
                        // ✅ Mudou para ATIVO - Verde
                        currentElement
                            .removeClass('ftx-badge-inativo')
                            .addClass('ftx-badge-ativo')
                            .attr('title', 'Clique para desativar')
                            .html('<i class="fa-duotone fa-circle-check" style="--fa-primary-color:#fff; --fa-secondary-color:#c8e6c9;"></i>Ativo');
                    }
                }
                else 
                {
                    AppToast.show("Vermelho", "Erro ao alterar status.", 2000);
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("requisitante.js", "btn-toggle-status.get.callback", error);
            }
        }).fail(function ()
        {
            try
            {
                AppToast.show("Vermelho", "Erro ao alterar status do requisitante.", 2000);
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("requisitante.js", "btn-toggle-status.get.fail", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("requisitante.js", "btn-toggle-status.click", error);
    }
});
```

**Inicialização no Document Ready:**

```javascript
$(document).ready(function ()
{
    try
    {
        loadList(); // ✅ Carrega DataTable

        // Eventos já registrados acima (delete e toggle-status)
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("requisitante.js", "document.ready", error);
    }
});
```

---

## 4. Controllers/RequisitanteController.cs

### Problema 1: Retornar lista de requisitantes para DataTable
**Problema**: O DataTable precisa receber dados em formato JSON com estrutura específica (`{ data: [...] }`), incluindo informações do setor relacionado.

**Solução**: Fazer JOIN entre `Requisitante` e `SetorSolicitante`, ordenar por nome, e retornar objeto anônimo com campos necessários.

### Código

```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        // ✅ JOIN com SetorSolicitante para obter nome do setor
        var result = (
            from r in _unitOfWork.Requisitante.GetAll()
            join s in _unitOfWork.SetorSolicitante.GetAll()
                on r.SetorSolicitanteId equals s.SetorSolicitanteId
            orderby r.Nome
            select new
            {
                r.Ponto,
                r.Nome,
                r.Ramal,
                NomeSetor = s.Nome, // ✅ Nome do setor
                r.Status,
                r.RequisitanteId,
            }
        ).ToList();

        return Json(new
        {
            data = result // ✅ Formato esperado pelo DataTable
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("RequisitanteController.cs", "Get", error);
        return View();
    }
}
```

### Problema 2: Excluir requisitante
**Problema**: Ao excluir um requisitante, precisamos validar se o ID é válido, buscar o registro no banco, e removê-lo usando o UnitOfWork.

**Solução**: Validar o modelo recebido, buscar o requisitante pelo ID, e chamar `Remove()` seguido de `Save()`.

### Código

```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(RequisitanteViewModel model)
{
    try
    {
        if (model != null && model.RequisitanteId != Guid.Empty)
        {
            // ✅ Busca requisitante no banco
            var objFromDb = _unitOfWork.Requisitante.GetFirstOrDefault(u =>
                u.RequisitanteId == model.RequisitanteId
            );
            if (objFromDb != null)
            {
                _unitOfWork.Requisitante.Remove(objFromDb);
                _unitOfWork.Save(); // ✅ Persiste exclusão
                return Json(
                    new
                    {
                        success = true,
                        message = "Requisitante removido com sucesso"
                    }
                );
            }
        }
        return Json(new
        {
            success = false,
            message = "Erro ao apagar Requisitante"
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("RequisitanteController.cs", "Delete", error);
        return Json(new { success = false, message = "Erro ao deletar requisitante" });
    }
}
```

### Problema 3: Alternar status do requisitante
**Problema**: Ao clicar no badge de status, precisamos inverter o valor booleano `Status` do requisitante e retornar informações sobre a mudança (tipo 0=Ativo, 1=Inativo) para atualizar a interface.

**Solução**: Buscar o requisitante, inverter `Status`, atualizar no banco, e retornar JSON com `success`, `message` e `type`.

### Código

```csharp
[Route("UpdateStatusRequisitante")]
public JsonResult UpdateStatusRequisitante(Guid Id)
{
    try
    {
        if (Id != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Requisitante.GetFirstOrDefault(u =>
                u.RequisitanteId == Id
            );
            string Description = "";
            int type = 0;

            if (objFromDb != null)
            {
                if (objFromDb.Status == true)
                {
                    // ✅ Muda para INATIVO
                    objFromDb.Status = false;
                    Description = string.Format(
                        "Atualizado Status do Requisitante [Nome: {0}] (Inativo)",
                        objFromDb.Nome
                    );
                    type = 1; // ✅ Tipo 1 = Inativo
                }
                else
                {
                    // ✅ Muda para ATIVO
                    objFromDb.Status = true;
                    Description = string.Format(
                        "Atualizado Status do Requisitante [Nome: {0}] (Ativo)",
                        objFromDb.Nome
                    );
                    type = 0; // ✅ Tipo 0 = Ativo
                }
                _unitOfWork.Requisitante.Update(objFromDb);
                _unitOfWork.Save(); // ✅ Persiste alteração
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
        Alerta.TratamentoErroComLinha(
            "RequisitanteController.cs",
            "UpdateStatusRequisitante",
            error
        );
        return new JsonResult(new
        {
            sucesso = false
        });
    }
}
```

**Outros Endpoints Disponíveis (não usados diretamente pela Index, mas documentados para referência):**

- `GET /api/Requisitante/GetAll` - Retorna lista completa com LEFT JOIN (permite setor nulo)
- `GET /api/Requisitante/GetById?id={guid}` - Retorna um requisitante específico
- `POST /api/Requisitante/Upsert` - Cria ou atualiza requisitante (usado pela página Upsert)
- `GET /api/Requisitante/GetSetores` - Retorna lista de setores ativos (usado pela página Upsert)
- `GET /api/Requisitante/GetSetoresHierarquia` - Retorna setores em estrutura hierárquica
- `POST /api/Requisitante/AtualizarRequisitanteRamalSetor` - Atualiza apenas Ramal e Setor

---

## Fluxo de Funcionamento

### Fluxo 1: Carregamento Inicial da Página

1. **Usuário acessa** `/Requisitante` ou `/Requisitante/Index`
2. **Servidor renderiza** `Pages/Requisitante/Index.cshtml` (PageModel `OnGet()` não carrega dados)
3. **Browser carrega** `requisitante.js` via `@section ScriptsBlock`
4. **JavaScript executa** `$(document).ready()` → chama `loadList()`
5. **DataTable inicializa** e faz requisição AJAX GET para `/api/requisitante`
6. **Controller `Get()`** executa JOIN entre `Requisitante` e `SetorSolicitante`, ordena por nome
7. **Controller retorna** JSON `{ data: [...] }`
8. **DataTable renderiza** colunas com dados, aplicando renderizadores customizados para Status e Ações
9. **Badges de status** são renderizados como elementos clicáveis com classes CSS `btn-toggle-status`
10. **Botões de ação** são renderizados com classes `btn-acao-ftx btn-azul` (editar) e `btn-vinho btn-delete` (excluir)

### Fluxo 2: Alternar Status (Clique no Badge)

1. **Usuário clica** no badge de status (Ativo ou Inativo)
2. **Event handler** `.btn-toggle-status` captura o clique
3. **JavaScript extrai** `data-url` do elemento (ex: `/api/Requisitante/updateStatusRequisitante?Id={guid}`)
4. **AJAX GET** é enviado para a URL
5. **Controller `UpdateStatusRequisitante()`** busca o requisitante pelo ID
6. **Controller inverte** `Status` (true → false ou false → true)
7. **Controller atualiza** no banco via `Update()` e `Save()`
8. **Controller retorna** JSON `{ success: true, message: "...", type: 0 ou 1 }`
9. **JavaScript recebe** resposta e atualiza classes CSS do badge (`removeClass` / `addClass`)
10. **JavaScript atualiza** HTML interno do badge (ícone e texto) baseado em `data.type`
11. **AppToast** exibe mensagem de sucesso

### Fluxo 3: Excluir Requisitante

1. **Usuário clica** no botão de excluir (ícone de lixeira)
2. **Event handler** `.btn-delete` captura o clique
3. **JavaScript extrai** `data-id` do botão
4. **SweetAlert `Alerta.Confirmar()`** exibe diálogo de confirmação
5. **Se usuário confirma** (`willDelete === true`):
   - JavaScript monta objeto JSON `{ RequisitanteId: id }`
   - **AJAX POST** é enviado para `/api/Requisitante/Delete`
   - **Controller `Delete()`** valida o modelo e busca o requisitante
   - **Controller remove** via `Remove()` e `Save()`
   - **Controller retorna** JSON `{ success: true, message: "..." }`
   - **JavaScript recebe** resposta e exibe `AppToast` de sucesso
   - **DataTable recarrega** via `dataTable.ajax.reload()`
6. **Se usuário cancela**, nada acontece

### Fluxo 4: Editar Requisitante

1. **Usuário clica** no botão de editar (ícone de lápis)
2. **Link HTML** redireciona para `/Requisitante/Upsert?id={guid}`
3. **Página Upsert** carrega e permite edição (documentada separadamente)

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Parâmetros | Retorno |
|--------|----------|-----------|------------|---------|
| **GET** | `/api/requisitante` | Lista todos os requisitantes para DataTable | Nenhum | `{ data: [{ ponto, nome, ramal, nomeSetor, status, requisitanteId }, ...] }` |
| **POST** | `/api/Requisitante/Delete` | Exclui um requisitante | Body: `{ RequisitanteId: Guid }` | `{ success: bool, message: string }` |
| **GET** | `/api/Requisitante/updateStatusRequisitante` | Alterna status (Ativo ↔ Inativo) | Query: `Id={Guid}` | `{ success: bool, message: string, type: int }` (type: 0=Ativo, 1=Inativo) |

---

## Troubleshooting

### Problema: Setor não aparece na listagem
**Causa**: O JOIN entre `Requisitante` e `SetorSolicitante` pode falhar se o `SetorSolicitanteId` for nulo ou inválido.

**Solução**: 
- Verificar se o requisitante tem `SetorSolicitanteId` válido no banco
- Se necessário, usar `GetAll()` com LEFT JOIN (como no endpoint `GetAll`) para permitir setor nulo
- Verificar se o setor existe e está ativo (`Status = true`)

### Problema: Badge de status não alterna ao clicar
**Causa**: Possíveis causas:
1. Event handler não está registrado (JavaScript não carregou)
2. URL do `data-url` está incorreta
3. Controller retornou erro

**Solução**:
- Abrir Console do navegador (F12) e verificar erros JavaScript
- Verificar se a URL em `data-url` está correta: `/api/Requisitante/updateStatusRequisitante?Id={guid}`
- Verificar logs do servidor para erros no Controller
- Verificar se o ID do requisitante é válido (Guid não vazio)

### Problema: Exclusão não funciona
**Causa**: Possíveis causas:
1. SweetAlert não está carregado (`Alerta.Confirmar` não existe)
2. Modelo não está sendo serializado corretamente
3. Controller retornou erro

**Solução**:
- Verificar se `alerta.js` está carregado antes de `requisitante.js`
- Verificar formato do JSON enviado: `{ RequisitanteId: "guid-string" }`
- Verificar logs do servidor
- Verificar se o requisitante existe no banco antes de excluir

### Problema: DataTable não carrega dados
**Causa**: Possíveis causas:
1. Endpoint `/api/requisitante` retornou erro
2. Formato do JSON não está correto (deve ser `{ data: [...] }`)
3. CORS ou autenticação bloqueando requisição

**Solução**:
- Abrir Network tab do navegador (F12) e verificar resposta da requisição AJAX
- Verificar se o Controller retorna `Json(new { data = result })`
- Verificar se há erros no Console do navegador
- Verificar se o usuário está autenticado (alguns endpoints podem exigir autenticação)

### Problema: Botões de ação não aparecem
**Causa**: CSS não está carregado ou classes CSS não existem.

**Solução**:
- Verificar se o `<style>` dentro de `Index.cshtml` está presente
- Verificar se as classes `.btn-acao-ftx`, `.btn-azul`, `.btn-vinho` estão definidas
- Verificar se FontAwesome está carregado (para ícones `fa-duotone`)

---

## Notas Técnicas

- **Padrão Visual FrotiX**: Badges e botões seguem cores e estilos definidos no padrão visual do sistema
- **Event Delegation**: Eventos são registrados via `$(document).on("click", ".btn-delete", ...)` para funcionar com elementos dinâmicos do DataTable
- **Try-Catch em Todos os Blocos**: Todo código JavaScript possui tratamento de erro com `Alerta.TratamentoErroComLinha()` para facilitar debugging
- **UnitOfWork Pattern**: Controller usa `IUnitOfWork` para abstrair acesso ao banco de dados
- **Validação de Guid**: Controller valida se o Guid não está vazio antes de buscar no banco
- **Ordenação**: Lista é ordenada por `Nome` do requisitante (ascendente)

---

## Log de Modificações

### [08/01/2026] - Expansão para Padrão FrotiX Simplificado
**Descrição**: Documentação completamente reescrita seguindo o padrão "Problema → Solução → Código", com fluxos detalhados, tabela de endpoints e troubleshooting expandido.

**Status**: ✅ **Completo**

**Responsável**: Claude (AI Assistant)  
**Versão**: 2.0

### [06/01/2026] - Criação da Documentação
**Descrição**: Documentação inicial da listagem de Requisitantes (Index).

**Status**: ✅ **Substituído pela versão 2.0**

**Responsável**: Claude (AI Assistant)  
**Versão**: 1.0
