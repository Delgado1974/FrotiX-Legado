# Documentação: Combustivel - Gestão (Index)

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

A página **Combustivel - Index** permite visualizar, gerenciar e controlar o status de todos os tipos de combustível cadastrados no sistema. Tipos de combustível são entidades básicas que classificam os veículos (ex: "Gasolina", "Diesel", "Etanol", "GNV"). A página oferece:

- ✅ **Listagem completa** de tipos de combustível com informações essenciais (Descrição, Status)
- ✅ **Alternância rápida de status** (Ativo/Inativo) através de clique no badge
- ✅ **Edição direta** através de botão que redireciona para página de cadastro
- ✅ **Exclusão** com confirmação via SweetAlert e validação de dependências (veículos associados)
- ✅ **Interface responsiva** com DataTable paginado e ordenável

---

## Arquivos Envolvidos

1. **Pages/Combustivel/Index.cshtml** - View Razor da página
2. **Pages/Combustivel/Index.cshtml.cs** - PageModel (backend da página)
3. **wwwroot/js/cadastros/combustivel.js** - Lógica JavaScript do DataTable e ações
4. **Controllers/CombustivelController.cs** - Endpoints API REST

---

## 1. Pages/Combustivel/Index.cshtml

### Problema
Criar uma interface visual clara e moderna para listar tipos de combustível, com badges de status clicáveis e botões de ação padronizados.

### Solução
Utilizar estrutura HTML com DataTable, CSS customizado para badges e botões seguindo padrão visual FrotiX, e componentes Bootstrap 5.

### Código

```html
<!-- ===== HEADER FROTIX ===== -->
<div class="ftx-card-header">
    <h2 class="titulo-paginas">
        <i class="fa-duotone fa-gas-pump"></i>
        Tipos de Combustível
    </h2>
    <div class="ftx-card-actions">
        <a href="/Combustivel/Upsert" class="btn btn-fundo-laranja" data-ftx-loading>
            <i class="fa-duotone fa-clone-plus icon-pulse me-1"></i> Adicionar Combustível
        </a>
    </div>
</div>

<!-- CONTEÚDO -->
<div class="panel-container show">
    <div class="panel-content">
        <div class="box-body">
            <table id="tblCombustivel" class="table table-bordered table-striped ftx-table" width="100%">
                <thead>
                    <tr>
                        <th>Descrição do Combustível</th>
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
/* ======== OUTLINE BRANCO NO BOTÃO DO HEADER (Padrão FrotiX) ======== */
.ftx-card-header .btn-fundo-laranja {
    outline: 2px solid rgba(255, 255, 255, 0.5) !important;
    outline-offset: 1px;
    transition: all 0.2s ease;
}

.ftx-card-header .btn-fundo-laranja:hover {
    outline: 2px solid rgba(255, 255, 255, 0.8) !important;
    outline-offset: 2px;
}
```

**Carregamento do Script JavaScript:**

```html
@section ScriptsBlock {
    <script src="~/js/cadastros/combustivel.js" asp-append-version="true"></script>
}
```

---

## 2. Pages/Combustivel/Index.cshtml.cs

### Problema
O PageModel precisa apenas inicializar a página, sem carregar dados adicionais (o DataTable faz isso via API).

### Solução
Manter método `OnGet()` vazio ou com estrutura básica de try-catch para tratamento de erros.

### Código

```csharp
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Combustivel
{
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
            try
            {
                // ✅ Página não precisa carregar dados aqui
                // O DataTable carrega dados via AJAX da API /api/combustivel
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

## 3. wwwroot/js/cadastros/combustivel.js

### Problema 1: Inicializar DataTable com colunas formatadas
**Problema**: Precisamos criar uma tabela interativa que carregue dados da API, com renderização customizada para status (badges clicáveis) e ações (botões de editar/excluir).

**Solução**: Configurar jQuery DataTable com AJAX, definindo renderizadores personalizados para as colunas de Status e Ações.

### Código

```javascript
function loadList()
{
    try
    {
        dataTable = $("#tblCombustivel").DataTable({
            columnDefs: [
                {
                    targets: 1, // Status
                    className: "text-center",
                    width: "15%",
                },
                {
                    targets: 2, // Ação
                    className: "text-center",
                    width: "15%",
                },
            ],
            responsive: true,
            ajax: {
                url: "/api/combustivel", // ✅ Endpoint API
                type: "GET",
                datatype: "json"
            },
            columns: [
                { data: "descricao", width: "70%" },
                {
                    // ✅ Renderizador de Status - Badge clicável
                    data: "status",
                    render: function (data, type, row, meta) {
                        try
                        {
                            if (data)
                                // ATIVO - Verde
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusCombustivel btn btn-verde btn-xs text-white" 
                                           data-url="/api/Combustivel/UpdateStatusCombustivel?Id=${row.combustivelId}">Ativo</a>`;
                            else
                                // INATIVO - Cinza
                                return `<a href="javascript:void(0)" 
                                           class="updateStatusCombustivel btn btn-xs fundo-cinza text-white text-bold" 
                                           data-url="/api/Combustivel/UpdateStatusCombustivel?Id=${row.combustivelId}">Inativo</a>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("combustivel.js", "render@status", error);
                        }
                    },
                    width: "15%",
                },
                {
                    // ✅ Renderizador de Ações - Botões de Editar e Excluir
                    data: "combustivelId",
                    render: function (data) {
                        try
                        {
                            return `<div class="ftx-actions">
                                <a href="/Combustivel/Upsert?id=${data}" 
                                   class="btn btn-icon-28 btn-azul" 
                                   data-ejtip="Editar combustível">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a href="javascript:void(0)" 
                                   class="btn-delete btn btn-icon-28 btn-vinho" 
                                   data-ejtip="Excluir combustível"
                                   data-id="${data}">
                                    <i class="far fa-trash-alt"></i>
                                </a>
                            </div>`;
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("combustivel.js", "render@acoes", error);
                        }
                    },
                    width: "15%",
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
        Alerta.TratamentoErroComLinha("combustivel.js", "loadList", error);
    }
}
```

### Problema 2: Implementar exclusão com confirmação e validação de dependências
**Problema**: Ao clicar no botão de excluir, precisamos confirmar a ação do usuário antes de enviar a requisição à API. Além disso, o backend deve validar se existem veículos associados ao tipo de combustível.

**Solução**: Usar SweetAlert (`Alerta.Confirmar`) para solicitar confirmação, e só então fazer a chamada AJAX POST para `/api/Combustivel/Delete`. O backend valida dependências antes de excluir.

### Código

```javascript
// Evento de exclusão de tipo de combustível
$(document).on("click", ".btn-delete", function () {
    try
    {
        var id = $(this).data("id");

        // ✅ Mostra diálogo de confirmação
        Alerta.Confirmar(
            "Você tem certeza que deseja apagar este tipo de combustível?",
            "Não será possível recuperar os dados eliminados!",
            "Excluir",
            "Cancelar"
        ).then((willDelete) => {
            try
            {
                if (willDelete) {
                    var dataToPost = JSON.stringify({ CombustivelId: id });
                    var url = "/api/Combustivel/Delete";
                    $.ajax({
                        url: url,
                        type: "POST",
                        data: dataToPost,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            try
                            {
                                if (data.success) {
                                    AppToast.show('Verde', data.message);
                                    dataTable.ajax.reload(); // ✅ Recarrega tabela
                                } else {
                                    AppToast.show('Vermelho', data.message);
                                }
                            }
                            catch (error)
                            {
                                Alerta.TratamentoErroComLinha("combustivel.js", "success", error);
                            }
                        },
                        error: function (err) {
                            try
                            {
                                console.log(err);
                                AppToast.show('Vermelho', 'Erro ao excluir o combustível');
                            }
                            catch (error)
                            {
                                Alerta.TratamentoErroComLinha("combustivel.js", "error", error);
                            }
                        },
                    });
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("combustivel.js", "callback@swal.then#0", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("combustivel.js", "callback@$.on#2", error);
    }
});
```

### Problema 3: Alternar status ao clicar no badge
**Problema**: Quando o usuário clica no badge de status (Ativo/Inativo), precisamos alternar o status do tipo de combustível e atualizar a visualização do badge sem recarregar a página inteira.

**Solução**: Fazer chamada AJAX GET para `/api/Combustivel/UpdateStatusCombustivel`, e atualizar dinamicamente as classes CSS e o conteúdo HTML do badge baseado na resposta (`data.type`).

### Código

```javascript
// Evento de clique no badge de status para alternar Ativo/Inativo
$(document).on("click", ".updateStatusCombustivel", function () {
    try
    {
        var url = $(this).data("url");
        var currentElement = $(this);

        $.get(url, function (data) {
            try
            {
                if (data.success) {
                    AppToast.show('Verde', "Status alterado com sucesso!");
                    var text = "Ativo";

                    if (data.type == 1) {
                        // ✅ Mudou para INATIVO - Cinza
                        text = "Inativo";
                        currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                    } else {
                        // ✅ Mudou para ATIVO - Verde
                        currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                    }

                    currentElement.text(text); // ✅ Atualiza texto do badge
                } else {
                    AppToast.show('Vermelho', 'Erro ao alterar o status');
                }
            }
            catch (error)
            {
                Alerta.TratamentoErroComLinha("combustivel.js", "callback@$.get#1", error);
            }
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("combustivel.js", "callback@$.on#2", error);
    }
});
```

**Inicialização no Document Ready:**

```javascript
$(document).ready(function () {
    try
    {
        loadList(); // ✅ Carrega DataTable

        // Eventos já registrados acima (delete e toggle-status)
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("combustivel.js", "callback@$.ready#0", error);
    }
});
```

---

## 4. Controllers/CombustivelController.cs

### Problema 1: Retornar lista de tipos de combustível para DataTable
**Problema**: O DataTable precisa receber dados em formato JSON com estrutura específica (`{ data: [...] }`).

**Solução**: Retornar todos os registros de `Combustivel` diretamente do repositório usando `GetAll()`.

### Código

```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        return Json(new
        {
            data = _unitOfWork.Combustivel.GetAll() // ✅ Retorna todos os tipos de combustível
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("CombustivelController.cs", "Get", error);
        return StatusCode(500);
    }
}
```

### Problema 2: Excluir tipo de combustível com validação de dependências
**Problema**: Ao excluir um tipo de combustível, precisamos validar se existem veículos associados a ele. Se houver, a exclusão deve ser bloqueada.

**Solução**: Buscar o tipo de combustível pelo ID, verificar se existe algum `Veiculo` com `CombustivelId` igual ao ID do tipo de combustível. Se existir, retornar erro. Caso contrário, excluir o tipo de combustível.

### Código

```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(CombustivelViewModel model)
{
    try
    {
        if (model != null && model.CombustivelId != Guid.Empty)
        {
            // ✅ Busca tipo de combustível no banco
            var objFromDb = _unitOfWork.Combustivel.GetFirstOrDefault(u =>
                u.CombustivelId == model.CombustivelId
            );
            if (objFromDb != null)
            {
                // ✅ Verifica se há veículos associados
                var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                    u.CombustivelId == model.CombustivelId
                );
                if (veiculo != null)
                {
                    // ✅ Bloqueia exclusão se houver veículos
                    return Json(
                        new
                        {
                            success = false,
                            message = "Existem veículos associados a essa combustível",
                        }
                    );
                }
                // ✅ Exclui tipo de combustível
                _unitOfWork.Combustivel.Remove(objFromDb);
                _unitOfWork.Save(); // ✅ Persiste exclusão
                return Json(
                    new
                    {
                        success = true,
                        message = "Tipo de Combustível removido com sucesso",
                    }
                );
            }
        }
        return Json(
            new
            {
                success = false,
                message = "Erro ao apagar Tipo de Combustível"
            }
        );
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("CombustivelController.cs", "Delete", error);
        return StatusCode(500);
    }
}
```

### Problema 3: Alternar status do tipo de combustível
**Problema**: Ao clicar no badge de status, precisamos inverter o valor booleano `Status` do tipo de combustível e retornar informações sobre a mudança (tipo 0=Ativo, 1=Inativo) para atualizar a interface.

**Solução**: Buscar o tipo de combustível, inverter `Status`, atualizar no banco, e retornar JSON com `success`, `message` e `type`.

**⚠️ NOTA IMPORTANTE**: O código atual **não chama `Save()`** após `Update()`, o que pode impedir a persistência da alteração. Isso pode ser um bug que precisa ser corrigido.

### Código

```csharp
[Route("UpdateStatusCombustivel")]
public JsonResult UpdateStatusCombustivel(Guid Id)
{
    try
    {
        if (Id != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Combustivel.GetFirstOrDefault(u =>
                u.CombustivelId == Id
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
                        "Atualizado Status do Tipo de Combustível [Nome: {0}] (Inativo)",
                        objFromDb.Descricao
                    );
                    type = 1; // ✅ Tipo 1 = Inativo
                }
                else
                {
                    // ✅ Muda para ATIVO
                    objFromDb.Status = true;
                    Description = string.Format(
                        "Atualizado Status do Tipo de Combustível  [Nome: {0}] (Ativo)",
                        objFromDb.Descricao
                    );
                    type = 0; // ✅ Tipo 0 = Ativo
                }
                _unitOfWork.Combustivel.Update(objFromDb);
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
        Alerta.TratamentoErroComLinha(
            "CombustivelController.cs",
            "UpdateStatusCombustivel",
            error
        );
        return new JsonResult(new
        {
            sucesso = false
        });
    }
}
```

---

## Fluxo de Funcionamento

### Fluxo 1: Carregamento Inicial da Página

1. **Usuário acessa** `/Combustivel` ou `/Combustivel/Index`
2. **Servidor renderiza** `Pages/Combustivel/Index.cshtml` (PageModel `OnGet()` não carrega dados)
3. **Browser carrega** `combustivel.js` via `@section ScriptsBlock`
4. **JavaScript executa** `$(document).ready()` → chama `loadList()`
5. **DataTable inicializa** e faz requisição AJAX GET para `/api/combustivel`
6. **Controller `Get()`** retorna todos os tipos de combustível do repositório
7. **Controller retorna** JSON `{ data: [...] }`
8. **DataTable renderiza** colunas com dados, aplicando renderizadores customizados para Status e Ações
9. **Badges de status** são renderizados como elementos clicáveis com classes CSS `updateStatusCombustivel`
10. **Botões de ação** são renderizados com classes `btn-azul` (editar) e `btn-vinho btn-delete` (excluir)

### Fluxo 2: Alternar Status (Clique no Badge)

1. **Usuário clica** no badge de status (Ativo ou Inativo)
2. **Event handler** `.updateStatusCombustivel` captura o clique
3. **JavaScript extrai** `data-url` do elemento (ex: `/api/Combustivel/UpdateStatusCombustivel?Id={guid}`)
4. **AJAX GET** é enviado para a URL
5. **Controller `UpdateStatusCombustivel()`** busca o tipo de combustível pelo ID
6. **Controller inverte** `Status` (true → false ou false → true)
7. **Controller atualiza** no banco via `Update()` (⚠️ **BUG**: não chama `Save()`)
8. **Controller retorna** JSON `{ success: true, message: "...", type: 0 ou 1 }`
9. **JavaScript recebe** resposta e atualiza classes CSS do badge (`removeClass` / `addClass`)
10. **JavaScript atualiza** texto do badge baseado em `data.type`
11. **AppToast** exibe mensagem de sucesso

### Fluxo 3: Excluir Tipo de Combustível

1. **Usuário clica** no botão de excluir (ícone de lixeira)
2. **Event handler** `.btn-delete` captura o clique
3. **JavaScript extrai** `data-id` do botão
4. **SweetAlert `Alerta.Confirmar()`** exibe diálogo de confirmação
5. **Se usuário confirma** (`willDelete === true`):
   - JavaScript monta objeto JSON `{ CombustivelId: id }`
   - **AJAX POST** é enviado para `/api/Combustivel/Delete`
   - **Controller `Delete()`** valida o modelo e busca o tipo de combustível
   - **Controller verifica** se existe `Veiculo` associado
   - **Se existe veículo**: retorna erro `{ success: false, message: "Existem veículos associados..." }`
   - **Se não existe**: remove via `Remove()` e `Save()`
   - **Controller retorna** JSON `{ success: true, message: "..." }`
   - **JavaScript recebe** resposta e exibe `AppToast` de sucesso ou erro
   - **DataTable recarrega** via `dataTable.ajax.reload()` se sucesso
6. **Se usuário cancela**, nada acontece

### Fluxo 4: Editar Tipo de Combustível

1. **Usuário clica** no botão de editar (ícone de lápis)
2. **Link HTML** redireciona para `/Combustivel/Upsert?id={guid}`
3. **Página Upsert** carrega e permite edição (documentada separadamente)

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Parâmetros | Retorno |
|--------|----------|-----------|------------|---------|
| **GET** | `/api/combustivel` | Lista todos os tipos de combustível para DataTable | Nenhum | `{ data: [{ descricao, status, combustivelId }, ...] }` |
| **POST** | `/api/Combustivel/Delete` | Exclui um tipo de combustível (com validação de veículos) | Body: `{ CombustivelId: Guid }` | `{ success: bool, message: string }` |
| **GET** | `/api/Combustivel/UpdateStatusCombustivel` | Alterna status (Ativo ↔ Inativo) | Query: `Id={Guid}` | `{ success: bool, message: string, type: int }` (type: 0=Ativo, 1=Inativo) |

---

## Troubleshooting

### Problema: Status não persiste após alternar
**Causa**: O método `UpdateStatusCombustivel` no Controller não chama `_unitOfWork.Save()` após `Update()`, então a alteração não é persistida no banco de dados.

**Solução**: 
- Adicionar `_unitOfWork.Save();` após `_unitOfWork.Combustivel.Update(objFromDb);` na linha 132 do `CombustivelController.cs`
- Verificar se o UnitOfWork está configurado corretamente para persistir alterações

### Problema: Não consegue excluir tipo de combustível
**Causa**: Tipo de combustível está associado a um ou mais veículos.

**Solução**: 
- Verificar veículos associados ao tipo de combustível na página de Veículos
- Alterar o tipo de combustível dos veículos primeiro
- Depois tentar excluir o tipo de combustível novamente

### Problema: Badge de status não alterna visualmente
**Causa**: Possíveis causas:
1. Event handler não está registrado (JavaScript não carregou)
2. URL do `data-url` está incorreta
3. Controller retornou erro ou não persistiu alteração (bug do `Save()`)

**Solução**:
- Abrir Console do navegador (F12) e verificar erros JavaScript
- Verificar se a URL em `data-url` está correta: `/api/Combustivel/UpdateStatusCombustivel?Id={guid}`
- Verificar logs do servidor para erros no Controller
- Verificar se o ID do tipo de combustível é válido (Guid não vazio)
- **Corrigir bug do `Save()`** mencionado acima

### Problema: DataTable não carrega dados
**Causa**: Possíveis causas:
1. Endpoint `/api/combustivel` retornou erro
2. Formato do JSON não está correto (deve ser `{ data: [...] }`)
3. CORS ou autenticação bloqueando requisição

**Solução**:
- Abrir Network tab do navegador (F12) e verificar resposta da requisição AJAX
- Verificar se o Controller retorna `Json(new { data = ... })`
- Verificar se há erros no Console do navegador
- Verificar se o usuário está autenticado (alguns endpoints podem exigir autenticação)

### Problema: Botões de ação não aparecem
**Causa**: CSS não está carregado ou classes CSS não existem.

**Solução**:
- Verificar se as classes `.btn-azul`, `.btn-vinho`, `.btn-verde`, `.fundo-cinza` estão definidas no CSS global
- Verificar se FontAwesome está carregado (para ícones `far fa-edit` e `far fa-trash-alt`)

---

## Notas Técnicas

- **Validação de Dependências**: A exclusão de tipo de combustível valida se existem veículos associados antes de permitir a exclusão, evitando inconsistências no banco de dados
- **Event Delegation**: Eventos são registrados via `$(document).on("click", ".btn-delete", ...)` para funcionar com elementos dinâmicos do DataTable
- **Try-Catch em Todos os Blocos**: Todo código JavaScript possui tratamento de erro com `Alerta.TratamentoErroComLinha()` para facilitar debugging
- **UnitOfWork Pattern**: Controller usa `IUnitOfWork` para abstrair acesso ao banco de dados
- **Validação de Guid**: Controller valida se o Guid não está vazio antes de buscar no banco
- **⚠️ BUG CONHECIDO**: O método `UpdateStatusCombustivel` não chama `Save()` após `Update()`, o que pode impedir a persistência da alteração de status

---

## Log de Modificações

### [08/01/2026] - Expansão para Padrão FrotiX Simplificado
**Descrição**: Documentação completamente reescrita seguindo o padrão "Problema → Solução → Código", com fluxos detalhados, tabela de endpoints e troubleshooting expandido. Incluída nota sobre bug conhecido no método `UpdateStatusCombustivel`.

**Status**: ✅ **Completo**

**Responsável**: Claude (AI Assistant)  
**Versão**: 2.0

### [08/01/2026] - Criação da Documentação
**Descrição**: Documentação inicial da listagem de Tipos de Combustível (Index).

**Status**: ✅ **Substituído pela versão 2.0**

**Responsável**: Claude (AI Assistant)  
**Versão**: 0.1
