# Documentação: Unidade - Gestão (Index)

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Objetivos

A página de **Listagem de Unidades** (`Pages/Unidade/Index.cshtml`) permite:
- ✅ Visualizar todas as unidades organizacionais cadastradas
- ✅ Gerenciar status (Ativo/Inativo) diretamente da listagem
- ✅ Visualizar informações de contato (primeiro, segundo, terceiro contato)
- ✅ Acessar funcionalidades relacionadas (lotação de motoristas, veículos da unidade)
- ✅ Editar unidades através de link para página de edição
- ✅ Excluir unidades com validação de dependências (veículos)
- ✅ Exportar dados para Excel e PDF

---

## Arquivos Envolvidos

### 1. Pages/Unidade/Index.cshtml
**Função**: View principal da página com HTML da tabela

**Estrutura**:
- Header com botão "Adicionar Unidade"
- Tabela DataTable (`#tblUnidade`)

**Código Principal**:
```html
<!-- Tabela principal -->
<table id="tblUnidade" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Sigla</th>
            <th>Nome da Unidade</th>
            <th>Contato</th>
            <th>Ponto</th>
            <th>Ramal</th>
            <th>Status</th>
            <th>Ação</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

---

### 2. Pages/Unidade/Index.cshtml.cs
**Função**: PageModel básico (inicialização simples)

**Código**:
```csharp
public class IndexModel : PageModel
{
    public IActionResult OnGet()
    {
        try
        {
            return Page();
        }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("Index.cshtml.cs", "OnGet", error);
            return Page();
        }
    }
}
```

---

### 3. wwwroot/js/cadastros/unidade.js
**Função**: Lógica do DataTable e interações da página

#### 3.1. Inicialização do DataTable
**Problema**: Tabela precisa carregar dados de unidades via AJAX e renderizar colunas customizadas

**Solução**: Configurar DataTable com AJAX, renderizadores customizados para status e ações

**Código**:
```javascript
function loadList() {
    dataTable = $("#tblUnidade").DataTable({
        responsive: true,
        ajax: {
            url: "/api/unidade",
            type: "GET",
            datatype: "json"
        },
        columns: [
            { data: "sigla" },
            { data: "descricao" },
            { data: "primeiroContato" },
            { data: "pontoPrimeiroContato" },
            { data: "primeiroRamal" },
            {
                // ✅ Renderizador de Status (badge clicável)
                data: "status",
                render: function (data, type, row, meta) {
                    if (data) {
                        return '<a href="javascript:void(0)" ' +
                            'class="updateStatus btn btn-verde text-white" ' +
                            'data-url="/api/Unidade/UpdateStatus?Id=' + row.unidadeId + '" ' +
                            'data-ejtip="Unidade ativa - clique para inativar">' +
                            'Ativo</a>';
                    } else {
                        return '<a href="javascript:void(0)" ' +
                            'class="updateStatus btn fundo-cinza text-white text-bold" ' +
                            'data-url="/api/Unidade/UpdateStatus?Id=' + row.unidadeId + '" ' +
                            'data-ejtip="Unidade inativa - clique para ativar">' +
                            'Inativo</a>';
                    }
                }
            },
            {
                // ✅ Renderizador de Ações (3 botões)
                data: "unidadeId",
                render: function (data) {
                    return `<div class="text-center">
                        <a href="/Unidade/Upsert?id=${data}" 
                           class="btn btn-azul text-white" 
                           data-ejtip="Editar unidade">
                            <i class="far fa-edit"></i>
                        </a>
                        <a class="btn-delete btn btn-vinho text-white" 
                           data-id="${data}"
                           data-ejtip="Excluir unidade">
                            <i class="far fa-trash-alt"></i>
                        </a>
                        <a href="/Unidade/VeiculosUnidade?id=${data}" 
                           class="btn fundo-chocolate text-white" 
                           data-ejtip="Veículos da unidade">
                            <i class="far fa-cars"></i>
                        </a>
                    </div>`;
                }
            }
        ]
    });
}
```

#### 3.2. Gestão de Status
**Problema**: Usuário precisa alternar status de unidade diretamente na tabela

**Solução**: Event handler que envia requisição AJAX e atualiza badge visualmente sem recarregar tabela

**Código**:
```javascript
$(document).on("click", ".updateStatus", function () {
    try {
        var url = $(this).data("url");
        var currentElement = $(this);
        
        $.get(url, function (data) {
            if (data.success) {
                AppToast.show("Verde", "Status alterado com sucesso!", 2000);
                
                if (data.type == 1) {
                    // ✅ INATIVO
                    currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                    currentElement.text("Inativo");
                } else {
                    // ✅ ATIVO
                    currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                    currentElement.text("Ativo");
                }
            } else {
                AppToast.show("Vermelho", "Erro ao alterar o status. Tente novamente.", 2000);
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("unidade.js", "updateStatus.click", error);
    }
});
```

#### 3.3. Exclusão de Unidade
**Problema**: Usuário precisa excluir unidade com confirmação e validação de dependências

**Solução**: Confirmação via SweetAlert antes de excluir, backend valida veículos associados

**Código**:
```javascript
$(document).on("click", ".btn-delete", function () {
    try {
        var id = $(this).data("id");
        
        // ✅ Confirmação obrigatória antes de excluir
        Alerta.Confirmar(
            "Confirmar Exclusão",
            "Você tem certeza que deseja apagar esta unidade? Não será possível recuperar os dados eliminados!",
            "Sim, excluir",
            "Cancelar"
        ).then(function (confirmed) {
            if (confirmed) {
                var dataToPost = JSON.stringify({ UnidadeId: id });
                
                $.ajax({
                    url: "/api/Unidade/Delete",
                    type: "POST",
                    data: dataToPost,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data.success) {
                            AppToast.show("Verde", data.message, 2000);
                            dataTable.ajax.reload();
                        } else {
                            AppToast.show("Vermelho", data.message, 2000);
                        }
                    },
                    error: function (err) {
                        console.error(err);
                        AppToast.show("Vermelho", "Ocorreu um erro ao excluir a unidade", 2000);
                    }
                });
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("unidade.js", "btn-delete.click", error);
    }
});
```

---

### 4. Controllers/UnidadeController.cs
**Função**: Endpoints API para operações com unidades

#### 4.1. GET `/api/unidade`
**Problema**: Frontend precisa de lista completa de unidades para DataTable

**Solução**: Endpoint que retorna todas as unidades diretamente do repositório

**Código**:
```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        return Json(new
        {
            data = _unitOfWork.Unidade.GetAll()
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("UnidadeController.cs", "Get", error);
        return Json(new
        {
            success = false,
            message = "Erro ao carregar dados"
        });
    }
}
```

#### 4.2. GET `/api/Unidade/UpdateStatus`
**Problema**: Frontend precisa alternar status de unidade

**Solução**: Endpoint que inverte status (true ↔ false) e retorna novo estado

**Código**:
```csharp
[Route("UpdateStatus")]
public JsonResult UpdateStatus(Guid Id)
{
    try
    {
        if (Id != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Unidade.GetFirstOrDefault(u => u.UnidadeId == Id);
            
            if (objFromDb != null)
            {
                int type = 0;
                string Description = "";
                
                if (objFromDb.Status == true)
                {
                    // ✅ Inverte para Inativo
                    objFromDb.Status = false;
                    Description = $"Atualizado Status da Unidade [Nome: {objFromDb.Descricao}] (Inativo)";
                    type = 1;
                }
                else
                {
                    // ✅ Inverte para Ativo
                    objFromDb.Status = true;
                    Description = $"Atualizado Status da Unidade [Nome: {objFromDb.Descricao}] (Ativo)";
                    type = 0;
                }
                
                _unitOfWork.Unidade.Update(objFromDb);
                _unitOfWork.Save();
                
                return Json(new
                {
                    success = true,
                    message = Description,
                    type = type
                });
            }
        }
        
        return Json(new { success = false });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("UnidadeController.cs", "UpdateStatus", error);
        return Json(new { success = false });
    }
}
```

#### 4.3. POST `/api/Unidade/Delete`
**Problema**: Frontend precisa excluir unidade com validação de dependências

**Solução**: Endpoint que verifica se unidade tem veículos associados antes de excluir

**Código**:
```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(UnidadeViewModel model)
{
    try
    {
        if (model != null && model.UnidadeId != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Unidade.GetFirstOrDefault(u =>
                u.UnidadeId == model.UnidadeId
            );
            
            if (objFromDb != null)
            {
                // ✅ Verifica se há veículos associados
                var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                    u.UnidadeId == model.UnidadeId
                );
                
                if (veiculo != null)
                {
                    // ✅ Bloqueia exclusão se houver veículos
                    return Json(new
                    {
                        success = false,
                        message = "Existem veículos associados a essa unidade"
                    });
                }
                
                // ✅ Exclui unidade
                _unitOfWork.Unidade.Remove(objFromDb);
                _unitOfWork.Save();
                
                return Json(new
                {
                    success = true,
                    message = "Unidade removida com sucesso"
                });
            }
        }
        
        return Json(new
        {
            success = false,
            message = "Erro ao apagar Unidade"
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("UnidadeController.cs", "Delete", error);
        return Json(new
        {
            success = false,
            message = "Erro ao deletar unidade"
        });
    }
}
```

---

## Fluxo de Funcionamento

### Carregamento da Página
```
1. Página carrega (OnGet)
   ↓
2. Frontend inicializa DataTable chamando loadList()
   ↓
3. Requisição AJAX para /api/unidade (GET)
   ↓
4. Backend retorna todas as unidades
   ↓
5. DataTable renderiza dados na tabela com renderizadores customizados
   ↓
6. Event handlers são registrados para ações (status, exclusão)
```

### Alteração de Status
```
1. Usuário clica no badge de status
   ↓
2. Requisição AJAX para /api/Unidade/UpdateStatus?Id=guid
   ↓
3. Backend inverte status no banco
   ↓
4. Retorna novo status e tipo (0=Ativo, 1=Inativo)
   ↓
5. Frontend atualiza badge visualmente (cor e texto)
   ↓
6. Toast de sucesso é exibido
```

### Exclusão de Unidade
```
1. Usuário clica no botão de excluir
   ↓
2. Confirmação SweetAlert é exibida
   ↓
3. Se confirmado: Requisição POST para /api/Unidade/Delete
   ↓
4. Backend verifica se unidade tem veículos associados
   ↓
5. Se tem veículos: retorna erro e bloqueia exclusão
   ↓
6. Se não tem: exclui unidade e retorna sucesso
   ↓
7. Tabela recarrega automaticamente
```

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| GET | `/api/unidade` | Lista todas as unidades | JSON com array de unidades |
| GET | `/api/Unidade/UpdateStatus?Id=guid` | Alterna status | `{success, message, type}` |
| POST | `/api/Unidade/Delete` | Exclui unidade | `{success, message}` |

---

## Troubleshooting

### Problema: Tabela não carrega
**Causa**: Erro no endpoint `/api/unidade` (500 Internal Server Error)  
**Solução**: 
- Abrir DevTools (F12) → Network → Verificar requisição `unidade`
- Verificar logs do servidor
- Verificar se repositório está funcionando corretamente

### Problema: Status não atualiza visualmente
**Causa**: Classes CSS não estão sendo aplicadas ou elemento foi recriado  
**Solução**: 
- Verificar se classes `btn-verde` e `fundo-cinza` existem no CSS
- Verificar se `currentElement` está referenciando elemento correto
- Verificar se texto está sendo atualizado corretamente

### Problema: Não consegue excluir unidade
**Causa**: Unidade está associada a um ou mais veículos  
**Solução**: 
- Verificar veículos da unidade na página `/Unidade/VeiculosUnidade`
- Desassociar veículos da unidade primeiro (mover para outra unidade ou deixar sem unidade)
- Depois tentar excluir novamente

### Problema: Botão de Veículos não funciona
**Causa**: Link está incorreto ou página não existe  
**Solução**: 
- Verificar se link está correto no renderizador
- Verificar se página `/Unidade/VeiculosUnidade` existe
- Verificar se ID está sendo passado corretamente no `href`

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Reescrita no Padrão FrotiX Simplificado

**Descrição**:
Documentação reescrita seguindo padrão simplificado e didático:
- Objetivos claros no início
- Arquivos listados com Problema/Solução/Código
- Fluxos de funcionamento explicados passo a passo
- Troubleshooting simplificado

**Status**: ✅ **Reescrito**

**Responsável**: Claude (AI Assistant)
**Versão**: 2.0

---

## [08/01/2026] - Expansão Completa da Documentação

**Descrição**:
Documentação expandida de ~137 linhas para mais de 500 linhas.

**Status**: ✅ **Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
