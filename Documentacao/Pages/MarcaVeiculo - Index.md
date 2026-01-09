# Documentação: MarcaVeiculo - Gestão (Index)

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

A página **MarcaVeiculo - Index** permite visualizar, gerenciar e controlar o status de todas as marcas de veículos cadastradas no sistema. Marcas de veículos são entidades básicas que agrupam modelos de veículos (ex: "Ford", "Volkswagen", "Fiat"). A página oferece:

- ✅ **Listagem completa** de marcas com informações essenciais (Descrição da Marca, Status)
- ✅ **Alternância rápida de status** (Ativo/Inativo) através de clique no badge
- ✅ **Edição direta** através de botão que redireciona para página de cadastro
- ✅ **Exclusão** com confirmação via SweetAlert e validação de dependências (modelos associados)
- ✅ **Interface responsiva** com DataTable paginado e ordenável

---

## Arquivos Envolvidos

1. **Pages/MarcaVeiculo/Index.cshtml** - View Razor da página
2. **Pages/MarcaVeiculo/Index.cshtml.cs** - PageModel (backend da página)
3. **wwwroot/js/cadastros/marcaveiculo.js** - Lógica JavaScript do DataTable e ações
4. **Controllers/MarcaVeiculoController.cs** - Endpoints API REST

---

## 1. Pages/MarcaVeiculo/Index.cshtml

### Problema
Criar uma interface visual clara e moderna para listar marcas de veículos, com badges de status clicáveis e botões de ação padronizados.

### Solução
Utilizar estrutura HTML com DataTable, CSS customizado para badges e botões seguindo padrão visual FrotiX, e componentes Bootstrap 5.

### Código

```html
<!-- HEADER DO CARD -->
<div class="ftx-card-header">
    <h2 class="titulo-paginas">
        <i class="fa-duotone fa-car-bus"></i>
        Listagem de Marcas de Veículos
    </h2>
    <div class="ftx-card-actions">
        <a href="/MarcaVeiculo/Upsert"
           class="btn btn-fundo-laranja"
           data-ftx-loading>
            <i class="fa-duotone fa-clone-plus icon-pulse me-1"></i>
            Adicionar Nova Marca
        </a>
    </div>
</div>

<!-- CONTEÚDO -->
<div class="panel-content">
    <div class="box-body">
        <table id="tblMarcaVeiculo" class="table table-bordered table-striped" width="100%">
            <thead>
                <tr>
                    <th>Marca do Veículo</th>
                    <th>Status</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>
```

**CSS Customizado (dentro de `<style>` no arquivo):**

```css
.fundo-cinza {
    background-color: #2F4F4F;
    color: aliceblue;
}

.label {
    color: white;
}

/* Outline branco no botão do header (Padrão FrotiX) */
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
    <script src="~/js/cadastros/marcaveiculo.js" asp-append-version="true"></script>
}
```

---

## 2. Pages/MarcaVeiculo/Index.cshtml.cs

### Problema
O PageModel precisa apenas inicializar a página, sem carregar dados adicionais (o DataTable faz isso via API).

### Solução
Manter método `OnGet()` vazio ou com estrutura básica de try-catch para tratamento de erros.

### Código

```csharp
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.MarcaVeiculo
{
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
            try
            {
                // ✅ Página não precisa carregar dados aqui
                // O DataTable carrega dados via AJAX da API /api/marcaVeiculo
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

## 3. wwwroot/js/cadastros/marcaveiculo.js

### Problema 1: Inicializar DataTable com colunas formatadas
**Problema**: Precisamos criar uma tabela interativa que carregue dados da API, com renderização customizada para status (badges clicáveis) e ações (botões de editar/excluir).

**Solução**: Configurar jQuery DataTable com AJAX, definindo renderizadores personalizados para as colunas de Status e Ações.

### Código

```javascript
function loadList()
{
    try
    {
        dataTable = $("#tblMarcaVeiculo").DataTable({
            columnDefs: [
                {
                    targets: 1, // Status
                    className: "text-center",
                    width: "20%"
                },
                {
                    targets: 2, // Ação
                    className: "text-center",
                    width: "20%"
                }
            ],
            responsive: true,
            ajax: {
                url: "/api/marcaVeiculo", // ✅ Endpoint API
                type: "GET",
                datatype: "json"
            },
            columns: [
                { data: "descricaoMarca", width: "30%" },
                {
                    // ✅ Renderizador de Status - Badge clicável
                    data: "status",
                    render: function (data, type, row, meta)
                    {
                        try
                        {
                            if (data)
                            {
                                // ATIVO - Verde
                                return '<a href="javascript:void(0)" ' +
                                    'class="updateStatusMarcaVeiculo btn btn-verde text-white" ' +
                                    'data-url="/api/MarcaVeiculo/updateStatusMarcaVeiculo?Id=' + row.marcaId + '" ' +
                                    'data-ejtip="Marca ativa - clique para inativar" ' +
                                    'style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">' +
                                    'Ativo</a>';
                            }
                            else
                            {
                                // INATIVO - Cinza
                                return '<a href="javascript:void(0)" ' +
                                    'class="updateStatusMarcaVeiculo btn fundo-cinza text-white text-bold" ' +
                                    'data-url="/api/MarcaVeiculo/updateStatusMarcaVeiculo?Id=' + row.marcaId + '" ' +
                                    'data-ejtip="Marca inativa - clique para ativar" ' +
                                    'style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">' +
                                    'Inativo</a>';
                            }
                        }
                        catch (error)
                        {
                            Alerta.TratamentoErroComLinha("marcaveiculo.js", "render.status", error);
                            return "";
                        }
                    },
                    className: "text-center",
                    width: "10%"
                },
                {
                    // ✅ Renderizador de Ações - Botões de Editar e Excluir
                    data: "marcaId",
                    render: function (data)
                    {
                        try
                        {
                            return `<div class="text-center">
                                <a href="/MarcaVeiculo/Upsert?id=${data}" 
                                   class="btn btn-azul text-white" 
                                   data-ejtip="Editar marca de veículo" 
                                   style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn-delete btn btn-vinho text-white" 
                                   data-ejtip="Excluir marca de veículo" 
                                   style="cursor:pointer; padding: 2px 6px !important; font-size: 12px !important; margin: 1px !important;" 
                                   data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                            </div>`;
                        } catch (error)
                        {
                            Alerta.TratamentoErroComLinha("marcaveiculo.js", "render.acoes", error);
                        }
                    },
                    width: "20%"
                }
            ],
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                emptyTable: "Sem Dados para Exibição"
            },
            width: "100%"
        });
    }
    catch (error)
    {
        Alerta.TratamentoErroComLinha("marcaveiculo.js", "loadList", error);
    }
}
```

### Problema 2: Implementar exclusão com confirmação e validação de dependências
**Problema**: Ao clicar no botão de excluir, precisamos confirmar a ação do usuário antes de enviar a requisição à API. Além disso, o backend deve validar se existem modelos de veículos associados à marca.

**Solução**: Usar SweetAlert (`Alerta.Confirmar`) para solicitar confirmação, e só então fazer a chamada AJAX POST para `/api/MarcaVeiculo/Delete`. O backend valida dependências antes de excluir.

### Código

```javascript
// Evento de exclusão de marca de veículo
$(document).on("click", ".btn-delete", function ()
{
    try
    {
        var id = $(this).data("id");

        // ✅ Mostra diálogo de confirmação
        Alerta.Confirmar(
            "Confirmar Exclusão",
            "Você tem certeza que deseja apagar esta marca de veículo? Não será possível recuperar os dados eliminados!",
            "Sim, excluir",
            "Cancelar"
        ).then(function (confirmed)
        {
            try
            {
                if (confirmed)
                {
                    var dataToPost = JSON.stringify({ MarcaId: id });
                    var url = "/api/MarcaVeiculo/Delete";
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
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("marcaveiculo.js", "ajax.success", error);
                            }
                        },
                        error: function (err)
                        {
                            try
                            {
                                console.log(err);
                                Alerta.Erro("Erro", "Ocorreu um erro ao tentar excluir a marca de veículo.");
                            } catch (error)
                            {
                                Alerta.TratamentoErroComLinha("marcaveiculo.js", "ajax.error", error);
                            }
                        }
                    });
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("marcaveiculo.js", "confirmar.then", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("marcaveiculo.js", "click.btn-delete", error);
    }
});
```

### Problema 3: Alternar status ao clicar no badge
**Problema**: Quando o usuário clica no badge de status (Ativo/Inativo), precisamos alternar o status da marca e atualizar a visualização do badge sem recarregar a página inteira.

**Solução**: Fazer chamada AJAX GET para `/api/MarcaVeiculo/updateStatusMarcaVeiculo`, e atualizar dinamicamente as classes CSS e o conteúdo HTML do badge baseado na resposta (`data.type`).

### Código

```javascript
// Evento de clique no badge de status para alternar Ativo/Inativo
$(document).on("click", ".updateStatusMarcaVeiculo", function ()
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
                    var text = "Ativo";

                    if (data.type == 1)
                    {
                        // ✅ Mudou para INATIVO - Cinza
                        text = "Inativo";
                        currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                    } else
                    {
                        // ✅ Mudou para ATIVO - Verde
                        currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                    }

                    currentElement.text(text); // ✅ Atualiza texto do badge
                } else
                {
                    Alerta.Erro("Erro", "Ocorreu um erro ao alterar o status da marca.");
                }
            } catch (error)
            {
                Alerta.TratamentoErroComLinha("marcaveiculo.js", "get.success", error);
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("marcaveiculo.js", "click.updateStatusMarcaVeiculo", error);
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
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("marcaveiculo.js", "document.ready", error);
    }
});
```

---

## 4. Controllers/MarcaVeiculoController.cs

### Problema 1: Retornar lista de marcas para DataTable
**Problema**: O DataTable precisa receber dados em formato JSON com estrutura específica (`{ data: [...] }`).

**Solução**: Retornar todos os registros de `MarcaVeiculo` diretamente do repositório usando `GetAll()`.

### Código

```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        return Json(new
        {
            data = _unitOfWork.MarcaVeiculo.GetAll() // ✅ Retorna todas as marcas
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("MarcaVeiculoController.cs", "Get", error);
        return View(); // padronizado
    }
}
```

### Problema 2: Excluir marca com validação de dependências
**Problema**: Ao excluir uma marca, precisamos validar se existem modelos de veículos associados a ela. Se houver, a exclusão deve ser bloqueada.

**Solução**: Buscar a marca pelo ID, verificar se existe algum `ModeloVeiculo` com `MarcaId` igual ao ID da marca. Se existir, retornar erro. Caso contrário, excluir a marca.

### Código

```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(MarcaVeiculoViewModel model)
{
    try
    {
        if (model != null && model.MarcaId != Guid.Empty)
        {
            // ✅ Busca marca no banco
            var objFromDb = _unitOfWork.MarcaVeiculo.GetFirstOrDefault(u =>
                u.MarcaId == model.MarcaId
            );
            if (objFromDb != null)
            {
                // ✅ Verifica se há modelos associados
                var modelo = _unitOfWork.ModeloVeiculo.GetFirstOrDefault(u =>
                    u.MarcaId == model.MarcaId
                );
                if (modelo != null)
                {
                    // ✅ Bloqueia exclusão se houver modelos
                    return Json(
                        new
                        {
                            success = false,
                            message = "Existem modelos associados a essa marca",
                        }
                    );
                }
                // ✅ Exclui marca
                _unitOfWork.MarcaVeiculo.Remove(objFromDb);
                _unitOfWork.Save(); // ✅ Persiste exclusão
                return Json(
                    new
                    {
                        success = true,
                        message = "Marca de veículo removida com sucesso",
                    }
                );
            }
        }
        return Json(new
        {
            success = false,
            message = "Erro ao apagar marca de veículo"
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("MarcaVeiculoController.cs", "Delete", error);
        return View(); // padronizado
    }
}
```

### Problema 3: Alternar status da marca
**Problema**: Ao clicar no badge de status, precisamos inverter o valor booleano `Status` da marca e retornar informações sobre a mudança (tipo 0=Ativo, 1=Inativo) para atualizar a interface.

**Solução**: Buscar a marca, inverter `Status`, atualizar no banco, e retornar JSON com `success`, `message` e `type`.

**⚠️ NOTA IMPORTANTE**: O código atual **não chama `Save()`** após `Update()`, o que pode impedir a persistência da alteração. Isso pode ser um bug que precisa ser corrigido.

### Código

```csharp
[Route("UpdateStatusMarcaVeiculo")]
public JsonResult UpdateStatusMarcaVeiculo(Guid Id)
{
    try
    {
        if (Id != Guid.Empty)
        {
            var objFromDb = _unitOfWork.MarcaVeiculo.GetFirstOrDefault(u =>
                u.MarcaId == Id
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
                        "Atualizado Status da Marca [Nome: {0}] (Inativo)",
                        objFromDb.DescricaoMarca
                    );
                    type = 1; // ✅ Tipo 1 = Inativo
                }
                else
                {
                    // ✅ Muda para ATIVO
                    objFromDb.Status = true;
                    Description = string.Format(
                        "Atualizado Status da Marca  [Nome: {0}] (Ativo)",
                        objFromDb.DescricaoMarca
                    );
                    type = 0; // ✅ Tipo 0 = Ativo
                }
                _unitOfWork.MarcaVeiculo.Update(objFromDb);
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
            "MarcaVeiculoController.cs",
            "UpdateStatusMarcaVeiculo",
            error
        );
        return new JsonResult(new
        {
            sucesso = false
        }); // padronizado
    }
}
```

---

## Fluxo de Funcionamento

### Fluxo 1: Carregamento Inicial da Página

1. **Usuário acessa** `/MarcaVeiculo` ou `/MarcaVeiculo/Index`
2. **Servidor renderiza** `Pages/MarcaVeiculo/Index.cshtml` (PageModel `OnGet()` não carrega dados)
3. **Browser carrega** `marcaveiculo.js` via `@section ScriptsBlock`
4. **JavaScript executa** `$(document).ready()` → chama `loadList()`
5. **DataTable inicializa** e faz requisição AJAX GET para `/api/marcaVeiculo`
6. **Controller `Get()`** retorna todas as marcas do repositório
7. **Controller retorna** JSON `{ data: [...] }`
8. **DataTable renderiza** colunas com dados, aplicando renderizadores customizados para Status e Ações
9. **Badges de status** são renderizados como elementos clicáveis com classes CSS `updateStatusMarcaVeiculo`
10. **Botões de ação** são renderizados com classes `btn-azul` (editar) e `btn-vinho btn-delete` (excluir)

### Fluxo 2: Alternar Status (Clique no Badge)

1. **Usuário clica** no badge de status (Ativo ou Inativo)
2. **Event handler** `.updateStatusMarcaVeiculo` captura o clique
3. **JavaScript extrai** `data-url` do elemento (ex: `/api/MarcaVeiculo/updateStatusMarcaVeiculo?Id={guid}`)
4. **AJAX GET** é enviado para a URL
5. **Controller `UpdateStatusMarcaVeiculo()`** busca a marca pelo ID
6. **Controller inverte** `Status` (true → false ou false → true)
7. **Controller atualiza** no banco via `Update()` (⚠️ **BUG**: não chama `Save()`)
8. **Controller retorna** JSON `{ success: true, message: "...", type: 0 ou 1 }`
9. **JavaScript recebe** resposta e atualiza classes CSS do badge (`removeClass` / `addClass`)
10. **JavaScript atualiza** texto do badge baseado em `data.type`
11. **AppToast** exibe mensagem de sucesso

### Fluxo 3: Excluir Marca

1. **Usuário clica** no botão de excluir (ícone de lixeira)
2. **Event handler** `.btn-delete` captura o clique
3. **JavaScript extrai** `data-id` do botão
4. **SweetAlert `Alerta.Confirmar()`** exibe diálogo de confirmação
5. **Se usuário confirma** (`confirmed === true`):
   - JavaScript monta objeto JSON `{ MarcaId: id }`
   - **AJAX POST** é enviado para `/api/MarcaVeiculo/Delete`
   - **Controller `Delete()`** valida o modelo e busca a marca
   - **Controller verifica** se existe `ModeloVeiculo` associado
   - **Se existe modelo**: retorna erro `{ success: false, message: "Existem modelos associados..." }`
   - **Se não existe**: remove via `Remove()` e `Save()`
   - **Controller retorna** JSON `{ success: true, message: "..." }`
   - **JavaScript recebe** resposta e exibe `AppToast` de sucesso ou erro
   - **DataTable recarrega** via `dataTable.ajax.reload()` se sucesso
6. **Se usuário cancela**, nada acontece

### Fluxo 4: Editar Marca

1. **Usuário clica** no botão de editar (ícone de lápis)
2. **Link HTML** redireciona para `/MarcaVeiculo/Upsert?id={guid}`
3. **Página Upsert** carrega e permite edição (documentada separadamente)

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Parâmetros | Retorno |
|--------|----------|-----------|------------|---------|
| **GET** | `/api/marcaVeiculo` | Lista todas as marcas para DataTable | Nenhum | `{ data: [{ descricaoMarca, status, marcaId }, ...] }` |
| **POST** | `/api/MarcaVeiculo/Delete` | Exclui uma marca (com validação de modelos) | Body: `{ MarcaId: Guid }` | `{ success: bool, message: string }` |
| **GET** | `/api/MarcaVeiculo/updateStatusMarcaVeiculo` | Alterna status (Ativo ↔ Inativo) | Query: `Id={Guid}` | `{ success: bool, message: string, type: int }` (type: 0=Ativo, 1=Inativo) |

---

## Troubleshooting

### Problema: Status não persiste após alternar
**Causa**: O método `UpdateStatusMarcaVeiculo` no Controller não chama `_unitOfWork.Save()` após `Update()`, então a alteração não é persistida no banco de dados.

**Solução**: 
- Adicionar `_unitOfWork.Save();` após `_unitOfWork.MarcaVeiculo.Update(objFromDb);` na linha 133 do `MarcaVeiculoController.cs`
- Verificar se o UnitOfWork está configurado corretamente para persistir alterações

### Problema: Não consegue excluir marca
**Causa**: Marca está associada a um ou mais modelos de veículos.

**Solução**: 
- Verificar modelos associados à marca na página de Modelos de Veículos
- Excluir ou alterar a marca dos modelos primeiro
- Depois tentar excluir a marca novamente

### Problema: Badge de status não alterna visualmente
**Causa**: Possíveis causas:
1. Event handler não está registrado (JavaScript não carregou)
2. URL do `data-url` está incorreta
3. Controller retornou erro ou não persistiu alteração (bug do `Save()`)

**Solução**:
- Abrir Console do navegador (F12) e verificar erros JavaScript
- Verificar se a URL em `data-url` está correta: `/api/MarcaVeiculo/updateStatusMarcaVeiculo?Id={guid}`
- Verificar logs do servidor para erros no Controller
- Verificar se o ID da marca é válido (Guid não vazio)
- **Corrigir bug do `Save()`** mencionado acima

### Problema: DataTable não carrega dados
**Causa**: Possíveis causas:
1. Endpoint `/api/marcaVeiculo` retornou erro
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

- **Validação de Dependências**: A exclusão de marca valida se existem modelos associados antes de permitir a exclusão, evitando inconsistências no banco de dados
- **Event Delegation**: Eventos são registrados via `$(document).on("click", ".btn-delete", ...)` para funcionar com elementos dinâmicos do DataTable
- **Try-Catch em Todos os Blocos**: Todo código JavaScript possui tratamento de erro com `Alerta.TratamentoErroComLinha()` para facilitar debugging
- **UnitOfWork Pattern**: Controller usa `IUnitOfWork` para abstrair acesso ao banco de dados
- **Validação de Guid**: Controller valida se o Guid não está vazio antes de buscar no banco
- **⚠️ BUG CONHECIDO**: O método `UpdateStatusMarcaVeiculo` não chama `Save()` após `Update()`, o que pode impedir a persistência da alteração de status

---

## Log de Modificações

### [08/01/2026] - Expansão para Padrão FrotiX Simplificado
**Descrição**: Documentação completamente reescrita seguindo o padrão "Problema → Solução → Código", com fluxos detalhados, tabela de endpoints e troubleshooting expandido. Incluída nota sobre bug conhecido no método `UpdateStatusMarcaVeiculo`.

**Status**: ✅ **Completo**

**Responsável**: Claude (AI Assistant)  
**Versão**: 2.0

### [06/01/2026] - Criação da Documentação
**Descrição**: Documentação inicial da listagem de Marcas de Veículos (Index).

**Status**: ✅ **Substituído pela versão 2.0**

**Responsável**: Claude (AI Assistant)  
**Versão**: 0.1
