# Documentação: Fornecedor - Gestão (Index)

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Objetivos

A página de **Listagem de Fornecedores** (`Pages/Fornecedor/Index.cshtml`) permite:
- ✅ Visualizar todos os fornecedores cadastrados em uma tabela interativa
- ✅ Gerenciar status (Ativo/Inativo) diretamente da listagem
- ✅ Editar fornecedores através de link para página de edição
- ✅ Excluir fornecedores com validação de dependências (contratos)
- ✅ Exportar dados para Excel e PDF
- ✅ Filtrar e ordenar dados usando recursos nativos do DataTable

---

## Arquivos Envolvidos

### 1. Pages/Fornecedor/Index.cshtml
**Função**: View principal da página com HTML da tabela

**Estrutura**:
- Botão "Adicionar Fornecedor" no header
- Tabela DataTable (`#tblFornecedor`)

**Código Principal**:
```html
<!-- Tabela principal -->
<table id="tblFornecedor" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Descricao</th>
            <th>CNPJ</th>
            <th>Contato</th>
            <th>Telefone</th>
            <th>Status</th>
            <th>Ação</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

---

### 2. Pages/Fornecedor/Index.cshtml.cs
**Função**: PageModel básico (inicialização simples)

**Código**: Similar aos outros Index.cshtml.cs, apenas retorna Page()

---

### 3. wwwroot/js/cadastros/fornecedor.js
**Função**: Lógica do DataTable e interações da página

#### 3.1. Inicialização do DataTable
**Problema**: Tabela precisa carregar dados de fornecedores via AJAX e renderizar colunas customizadas

**Solução**: Configurar DataTable com AJAX, renderizadores customizados para status e ações

**Código**:
```javascript
function loadList() {
    dataTable = $("#tblFornecedor").DataTable({
        responsive: true,
        ajax: {
            url: "/api/fornecedor",
            type: "GET",
            datatype: "json"
        },
        columns: [
            { data: "cnpj", width: "10%" },
            { data: "descricaoFornecedor", width: "25%" },
            { data: "contato01", width: "20%" },
            { data: "telefone01", width: "8%" },
            {
                // ✅ Renderizador de Status (badge clicável)
                data: "status",
                render: function (data, type, row, meta) {
                    if (data) {
                        return '<a href="javascript:void(0)" 
                                   class="updateStatusFornecedor btn btn-verde btn-xs text-white" 
                                   data-url="/api/Fornecedor/updateStatusFornecedor?Id=' + row.fornecedorId + '">
                                   Ativo
                                </a>';
                    } else {
                        return '<a href="javascript:void(0)" 
                                   class="updateStatusFornecedor btn btn-xs fundo-cinza text-white text-bold" 
                                   data-url="/api/Fornecedor/updateStatusFornecedor?Id=' + row.fornecedorId + '">
                                   Inativo
                                </a>';
                    }
                },
                width: "6%"
            },
            {
                // ✅ Renderizador de Ações (2 botões)
                data: "fornecedorId",
                render: function (data) {
                    return `<div class="text-center">
                        <a href="/Fornecedor/Upsert?id=${data}" 
                           class="btn btn-azul btn-xs text-white" 
                           aria-label="Editar o Fornecedor!">
                            <i class="far fa-edit"></i>
                        </a>
                        <a class="btn-delete btn btn-vinho btn-xs text-white" 
                           aria-label="Excluir o Fornecedor!"
                           data-id='${data}'>
                            <i class="far fa-trash-alt"></i>
                        </a>
                    </div>`;
                },
                width: "8%"
            }
        ]
    });
}
```

#### 3.2. Gestão de Status
**Problema**: Usuário precisa alternar status de fornecedor diretamente na tabela

**Solução**: Event handler que envia requisição AJAX e atualiza badge visualmente

**Código**:
```javascript
$(document).on("click", ".updateStatusFornecedor", function () {
    try {
        var url = $(this).data("url");
        var currentElement = $(this);
        
        $.get(url, function (data) {
            if (data.success) {
                AppToast.show('Verde', "Status alterado com sucesso!");
                
                if (data.type == 1) {
                    // ✅ INATIVO
                    currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                    currentElement.text("Inativo");
                } else {
                    // ✅ ATIVO
                    currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                    currentElement.text("Ativo");
                }
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("fornecedor.js", "updateStatusFornecedor.click", error);
    }
});
```

#### 3.3. Exclusão de Fornecedor
**Problema**: Usuário precisa excluir fornecedor com confirmação e validação de dependências

**Solução**: Confirmação via SweetAlert antes de excluir, backend valida contratos associados

**Código**:
```javascript
$(document).on("click", ".btn-delete", function () {
    try {
        var id = $(this).data("id");
        
        // ✅ Confirmação obrigatória antes de excluir
        Alerta.Confirmar(
            "Você tem certeza que deseja apagar este fornecedor?",
            "Não será possível recuperar os dados eliminados!",
            "Excluir",
            "Cancelar"
        ).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ FornecedorId: id });
                
                $.ajax({
                    url: "/api/Fornecedor/Delete",
                    type: "POST",
                    data: dataToPost,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data.success) {
                            AppToast.show('Verde', data.message);
                            dataTable.ajax.reload();
                        } else {
                            AppToast.show('Vermelho', data.message);
                        }
                    },
                    error: function (err) {
                        console.log(err);
                        alert("something went wrong");
                    }
                });
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("fornecedor.js", "btn-delete.click", error);
    }
});
```

---

### 4. Controllers/FornecedorController.cs
**Função**: Endpoints API para operações com fornecedores

#### 4.1. GET `/api/fornecedor`
**Problema**: Frontend precisa de lista completa de fornecedores para DataTable

**Solução**: Endpoint que retorna todos os fornecedores diretamente do repositório

**Código**:
```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        return Json(new
        {
            data = _unitOfWork.Fornecedor.GetAll()
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("FornecedorController.cs", "Get", error);
        return StatusCode(500);
    }
}
```

#### 4.2. GET `/api/Fornecedor/UpdateStatusFornecedor`
**Problema**: Frontend precisa alternar status de fornecedor

**Solução**: Endpoint que inverte status (true ↔ false) e retorna novo estado

**Código**: Similar aos outros endpoints de status (Motorista, Unidade)

#### 4.3. POST `/api/Fornecedor/Delete`
**Problema**: Frontend precisa excluir fornecedor com validação de dependências

**Solução**: Endpoint que verifica se fornecedor tem contratos associados antes de excluir

**Código**:
```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(FornecedorViewModel model)
{
    try
    {
        if (model != null && model.FornecedorId != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Fornecedor.GetFirstOrDefault(u =>
                u.FornecedorId == model.FornecedorId
            );
            
            if (objFromDb != null)
            {
                // ✅ Verifica se há contratos associados
                var contrato = _unitOfWork.Contrato.GetFirstOrDefault(u =>
                    u.FornecedorId == model.FornecedorId
                );
                
                if (contrato != null)
                {
                    // ✅ Bloqueia exclusão se houver contratos
                    return Json(new
                    {
                        success = false,
                        message = "Existem contratos associados a esse fornecedor"
                    });
                }
                
                // ✅ Exclui fornecedor
                _unitOfWork.Fornecedor.Remove(objFromDb);
                _unitOfWork.Save();
                
                return Json(new
                {
                    success = true,
                    message = "Fornecedor removido com sucesso"
                });
            }
        }
        
        return Json(new
        {
            success = false,
            message = "Erro ao apagar Fornecedor"
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("FornecedorController.cs", "Delete", error);
        return StatusCode(500);
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
3. Requisição AJAX para /api/fornecedor (GET)
   ↓
4. Backend retorna todos os fornecedores
   ↓
5. DataTable renderiza dados na tabela com renderizadores customizados
   ↓
6. Event handlers são registrados para ações (status, exclusão)
```

### Alteração de Status
```
1. Usuário clica no badge de status
   ↓
2. Requisição AJAX para /api/Fornecedor/UpdateStatusFornecedor?Id=guid
   ↓
3. Backend inverte status no banco
   ↓
4. Retorna novo status e tipo (0=Ativo, 1=Inativo)
   ↓
5. Frontend atualiza badge visualmente (cor e texto)
   ↓
6. Toast de sucesso é exibido
```

### Exclusão de Fornecedor
```
1. Usuário clica no botão de excluir
   ↓
2. Confirmação SweetAlert é exibida
   ↓
3. Se confirmado: Requisição POST para /api/Fornecedor/Delete
   ↓
4. Backend verifica se fornecedor tem contratos associados
   ↓
5. Se tem contratos: retorna erro e bloqueia exclusão
   ↓
6. Se não tem: exclui fornecedor e retorna sucesso
   ↓
7. Tabela recarrega automaticamente
```

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| GET | `/api/fornecedor` | Lista todos os fornecedores | JSON com array de fornecedores |
| GET | `/api/Fornecedor/UpdateStatusFornecedor?Id=guid` | Alterna status | `{success, message, type}` |
| POST | `/api/Fornecedor/Delete` | Exclui fornecedor | `{success, message}` |

---

## Troubleshooting

### Problema: Tabela não carrega
**Causa**: Erro no endpoint `/api/fornecedor` (500 Internal Server Error)  
**Solução**: 
- Verificar logs do servidor
- Verificar Network Tab para erros na requisição
- Verificar se repositório está funcionando corretamente

### Problema: Status não atualiza visualmente
**Causa**: Classes CSS não estão sendo aplicadas ou elemento foi recriado  
**Solução**: 
- Verificar se classes `btn-verde` e `fundo-cinza` existem no CSS
- Verificar se `currentElement` está referenciando elemento correto
- Verificar se texto está sendo atualizado corretamente

### Problema: Não consegue excluir fornecedor
**Causa**: Fornecedor está associado a um ou mais contratos  
**Solução**: 
- Verificar contratos do fornecedor na página de Contratos
- Desassociar fornecedor dos contratos primeiro
- Depois tentar excluir novamente

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

## [06/01/2026] - Criação da Documentação Inicial

**Descrição**:
Documentação inicial da listagem de Fornecedores (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
