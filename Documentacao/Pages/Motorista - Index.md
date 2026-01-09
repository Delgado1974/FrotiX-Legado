# Documentação: Motorista - Gestão (Index)

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Objetivos

A página de **Listagem de Motoristas** (`Pages/Motorista/Index.cshtml`) permite:
- ✅ Visualizar todos os motoristas cadastrados em uma tabela interativa
- ✅ Visualizar fotos dos motoristas através de modal
- ✅ Gerenciar status (Ativo/Inativo) diretamente da listagem
- ✅ Editar motoristas através de link para página de edição
- ✅ Excluir motoristas com confirmação de segurança
- ✅ Exportar dados para Excel e PDF
- ✅ Filtrar e ordenar dados usando recursos nativos do DataTable

---

## Arquivos Envolvidos

### 1. Pages/Motorista/Index.cshtml
**Função**: View principal da página com HTML da tabela e modal de foto

**Estrutura**:
- Header com botão "Novo Motorista"
- Tabela DataTable (`#tblMotorista`)
- Modal Bootstrap para exibir foto (`#modalFoto`)

**Código Principal**:
```html
<!-- Tabela principal -->
<table id="tblMotorista" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Nome</th>
            <th>Ponto</th>
            <th>CNH</th>
            <th>Categoria</th>
            <th>Celular</th>
            <th>Unidade</th>
            <th>Contrato</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Ações</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>

<!-- Modal de Foto -->
<div class="modal fade ftx-modal" id="modalFoto">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header modal-header-azul">
                <h5 class="modal-title">
                    <i class="fa-duotone fa-camera-retro me-2"></i>
                    Foto do Motorista
                </h5>
            </div>
            <div class="modal-body">
                <div class="ftx-foto-container">
                    <img id="imgViewer" src="/Images/barbudo.jpg" class="ftx-foto-img" />
                </div>
            </div>
        </div>
    </div>
</div>
```

---

### 2. Pages/Motorista/Index.cshtml.cs
**Função**: PageModel básico (inicialização simples)

**Código**:
```csharp
public class IndexModel : PageModel
{
    public void OnGet()
    {
        try
        {
            // Página carregada via AJAX no DataTable
        }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("Index.cshtml.cs", "OnGet", error);
        }
    }
}
```

---

### 3. wwwroot/js/cadastros/motorista.js
**Função**: Lógica do DataTable e interações da página

#### 3.1. Inicialização do DataTable
**Problema**: Tabela precisa carregar dados de motoristas via AJAX e renderizar colunas customizadas

**Solução**: Configurar DataTable com AJAX, renderizadores customizados para status e ações

**Código**:
```javascript
function loadList() {
    dataTable = $("#tblMotorista").DataTable({
        autoWidth: false,
        dom: "Bfrtip",
        lengthMenu: [
            [10, 25, 50, -1],
            ["10 linhas", "25 linhas", "50 linhas", "Todas as Linhas"]
        ],
        buttons: [
            "pageLength",
            "excel",
            {
                extend: "pdfHtml5",
                orientation: "landscape",
                pageSize: "LEGAL"
            }
        ],
        responsive: true,
        ajax: {
            url: "/api/motorista",
            type: "GET",
            datatype: "json"
        },
        columns: [
            { data: "nome" },
            { data: "ponto" },
            { data: "cnh" },
            { data: "categoriaCNH" },
            { data: "celular01" },
            { data: "sigla" },
            { data: "contratoMotorista" },
            { data: "efetivoFerista" },
            {
                // ✅ Renderizador de Status (badge clicável)
                data: "status",
                render: function (data, type, row, meta) {
                    if (data) {
                        // ATIVO = btn-verde
                        return `<a href="javascript:void(0)"
                                   class="updateStatusMotorista btn btn-verde btn-xs"
                                   data-ejtip="Motorista ativo - clique para inativar"
                                   data-url="/api/Motorista/UpdateStatusMotorista?Id=${row.motoristaId}">
                                    <i class="fa-duotone fa-circle-check"></i> Ativo
                                </a>`;
                    } else {
                        // INATIVO = fundo-cinza
                        return `<a href="javascript:void(0)"
                                   class="updateStatusMotorista btn fundo-cinza btn-xs"
                                   data-ejtip="Motorista inativo - clique para ativar"
                                   data-url="/api/Motorista/UpdateStatusMotorista?Id=${row.motoristaId}">
                                    <i class="fa-duotone fa-circle-xmark"></i> Inativo
                                </a>`;
                    }
                }
            },
            {
                // ✅ Renderizador de Ações (3 botões)
                data: "motoristaId",
                render: function (data) {
                    return `<div class="ftx-btn-acoes">
                                <a href="/Motorista/Upsert?id=${data}"
                                   class="btn btn-editar btn-icon-28"
                                   data-ejtip="Editar Motorista">
                                    <i class="fa-duotone fa-pen-to-square"></i>
                                </a>
                                <a href="javascript:void(0)"
                                   class="btn fundo-vermelho btn-icon-28 btn-delete"
                                   data-ejtip="Excluir Motorista"
                                   data-id="${data}">
                                    <i class="fa-duotone fa-trash-can"></i>
                                </a>
                                <a href="javascript:void(0)"
                                   class="btn btn-foto btn-icon-28"
                                   data-ejtip="Foto do Motorista"
                                   data-id="${data}">
                                    <i class="fa-duotone fa-camera-retro"></i>
                                </a>
                            </div>`;
                }
            }
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
            emptyTable: "Sem Dados para Exibição"
        }
    });
}
```

#### 3.2. Gestão de Status
**Problema**: Usuário precisa alternar status de motorista diretamente na tabela

**Solução**: Event handler que envia requisição AJAX e atualiza badge visualmente sem recarregar tabela

**Código**:
```javascript
$(document).on("click", ".updateStatusMotorista", function () {
    try {
        var url = $(this).data("url");
        var currentElement = $(this);
        
        $.get(url, function (data) {
            if (data.success) {
                AppToast.show("Verde", "Status alterado com sucesso!", 2000);
                
                if (data.type == 0) {
                    // ✅ ATIVO = VERDE
                    currentElement.html('<i class="fa-duotone fa-circle-check"></i> Ativo');
                    currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                    currentElement.attr('data-ejtip', 'Motorista ativo - clique para inativar');
                } else {
                    // ✅ INATIVO = CINZA
                    currentElement.html('<i class="fa-duotone fa-circle-xmark"></i> Inativo');
                    currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                    currentElement.attr('data-ejtip', 'Motorista inativo - clique para ativar');
                }
            } else {
                Alerta.Erro("Erro ao Alterar Status", "Ocorreu um erro ao tentar alterar o status. Tente novamente.", "OK");
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("motorista.js", "updateStatusMotorista.click", error);
    }
});
```

#### 3.3. Exclusão de Motorista
**Problema**: Usuário precisa excluir motorista com confirmação e validação de dependências

**Solução**: Confirmação via SweetAlert antes de excluir, backend valida dependências

**Código**:
```javascript
$(document).on("click", ".btn-delete", function () {
    try {
        var id = $(this).data("id");
        
        // ✅ Confirmação obrigatória antes de excluir
        Alerta.Confirmar(
            "Confirmar Exclusão",
            "Você tem certeza que deseja apagar este motorista? Não será possível recuperar os dados eliminados!",
            "Sim, excluir",
            "Cancelar"
        ).then((confirmed) => {
            if (confirmed) {
                var dataToPost = JSON.stringify({ MotoristaId: id });
                
                $.ajax({
                    url: "/api/Motorista/Delete",
                    type: "POST",
                    data: dataToPost,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data.success) {
                            AppToast.show("Verde", data.message, 3000);
                            dataTable.ajax.reload();
                        } else {
                            AppToast.show("Vermelho", data.message, 3000);
                        }
                    },
                    error: function (err) {
                        console.error("Erro ao deletar motorista:", err);
                        AppToast.show("Vermelho", "Erro ao processar a exclusão", 3000);
                    }
                });
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("motorista.js", "btn-delete.click", error);
    }
});
```

#### 3.4. Modal de Foto
**Problema**: Usuário precisa visualizar foto do motorista em tamanho maior

**Solução**: Modal Bootstrap que busca foto em Base64 via AJAX e exibe, com fallback para imagem padrão

**Código**:
```javascript
$(document).on("click", ".btn-foto", function (e) {
    try {
        const motoristaId = $(this).data('id');
        const modalElement = document.getElementById('modalFoto');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // ✅ Busca foto em Base64
        $.ajax({
            type: "GET",
            url: "/api/Motorista/PegaFotoModal",
            data: { id: motoristaId },
            success: function (res) {
                if (res) {
                    // ✅ Exibe foto em Base64
                    $("#imgViewer").attr("src", "data:image/jpg;base64," + res);
                } else {
                    // ✅ Fallback para imagem padrão
                    $("#imgViewer").attr("src", "/Images/barbudo.jpg");
                }
            },
            error: function() {
                // ✅ Fallback em caso de erro
                $("#imgViewer").attr("src", "/Images/barbudo.jpg");
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("motorista.js", "btn-foto.click", error);
    }
});
```

---

### 4. Controllers/MotoristaController.cs
**Função**: Endpoints API para operações com motoristas

#### 4.1. GET `/api/motorista`
**Problema**: Frontend precisa de lista completa de motoristas formatada para DataTable

**Solução**: Endpoint que retorna todos os motoristas da view `ViewMotoristas` com dados formatados

**Código**:
```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        var result = (
            from vm in _unitOfWork.ViewMotoristas.GetAll()
            select new
            {
                vm.MotoristaId,
                vm.Nome,
                vm.Ponto,
                vm.CNH,
                vm.Celular01,
                vm.CategoriaCNH,
                // ✅ Formata sigla (pode ser null)
                Sigla = vm.Sigla != null ? vm.Sigla : "",
                // ✅ Formata contrato (Ano/Número - Fornecedor ou Tipo ou "(sem contrato)")
                ContratoMotorista = vm.AnoContrato != null
                    ? (vm.AnoContrato + "/" + vm.NumeroContrato + " - " + vm.DescricaoFornecedor)
                    : vm.TipoCondutor != null ? vm.TipoCondutor
                    : "(sem contrato)",
                vm.Status,
                vm.EfetivoFerista,
                vm.Foto
            }
        ).ToList();
        
        return Json(new { data = result });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("MotoristaController.cs", "Get", error);
        return View();
    }
}
```

#### 4.2. GET `/api/Motorista/PegaFotoModal`
**Problema**: Modal precisa exibir foto do motorista em Base64

**Solução**: Endpoint que busca motorista e retorna foto em Base64 ou `false` se não houver

**Código**:
```csharp
[Route("PegaFotoModal")]
public JsonResult PegaFotoModal(Guid id)
{
    try
    {
        var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u => 
            u.MotoristaId == id
        );
        
        if (objFromDb != null && objFromDb.Foto != null && objFromDb.Foto.Length > 0)
        {
            // ✅ Converte byte[] para Base64
            string base64 = Convert.ToBase64String(objFromDb.Foto);
            return Json(base64);
        }
        
        return Json(false);
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("MotoristaController.cs", "PegaFotoModal", error);
        return Json(false);
    }
}
```

#### 4.3. GET `/api/Motorista/UpdateStatusMotorista`
**Problema**: Frontend precisa alternar status de motorista

**Solução**: Endpoint que inverte status (true ↔ false) e retorna novo estado

**Código**:
```csharp
[Route("UpdateStatusMotorista")]
public JsonResult UpdateStatusMotorista(Guid Id)
{
    try
    {
        if (Id != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                u.MotoristaId == Id
            );
            
            if (objFromDb != null)
            {
                int type = 0;
                string Description = "";
                
                if (objFromDb.Status == true)
                {
                    // ✅ Inverte para Inativo
                    objFromDb.Status = false;
                    Description = $"Atualizado Status do Motorista [Nome: {objFromDb.Nome}] (Inativo)";
                    type = 1;
                }
                else
                {
                    // ✅ Inverte para Ativo
                    objFromDb.Status = true;
                    Description = $"Atualizado Status do Motorista [Nome: {objFromDb.Nome}] (Ativo)";
                    type = 0;
                }
                
                _unitOfWork.Motorista.Update(objFromDb);
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
        Alerta.TratamentoErroComLinha("MotoristaController.cs", "UpdateStatusMotorista", error);
        return Json(new { success = false });
    }
}
```

#### 4.4. POST `/api/Motorista/Delete`
**Problema**: Frontend precisa excluir motorista com validação de dependências

**Solução**: Endpoint que verifica se motorista tem contratos associados antes de excluir

**Código**:
```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(MotoristaViewModel model)
{
    try
    {
        if (model != null && model.MotoristaId != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                u.MotoristaId == model.MotoristaId
            );
            
            if (objFromDb != null)
            {
                // ✅ Verifica se motorista está associado a contratos
                var motoristaContrato = _unitOfWork.MotoristaContrato.GetFirstOrDefault(u =>
                    u.MotoristaId == model.MotoristaId
                );
                
                if (motoristaContrato != null)
                {
                    // ✅ Bloqueia exclusão se houver contratos
                    return Json(new
                    {
                        success = false,
                        message = "Não foi possível remover o motorista. Ele está associado a um ou mais contratos!"
                    });
                }
                
                // ✅ Exclui motorista
                _unitOfWork.Motorista.Remove(objFromDb);
                _unitOfWork.Save();
                
                return Json(new
                {
                    success = true,
                    message = "Motorista removido com sucesso"
                });
            }
        }
        
        return Json(new
        {
            success = false,
            message = "Erro ao apagar motorista"
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("MotoristaController.cs", "Delete", error);
        return View();
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
3. Requisição AJAX para /api/motorista (GET)
   ↓
4. Backend retorna todos os motoristas da ViewMotoristas
   ↓
5. DataTable renderiza dados na tabela com renderizadores customizados
   ↓
6. Event handlers são registrados para ações (status, exclusão, foto)
```

### Alteração de Status
```
1. Usuário clica no badge de status
   ↓
2. Requisição AJAX para /api/Motorista/UpdateStatusMotorista?Id=guid
   ↓
3. Backend inverte status no banco
   ↓
4. Retorna novo status e tipo (0=Ativo, 1=Inativo)
   ↓
5. Frontend atualiza badge visualmente (cor e texto)
   ↓
6. Toast de sucesso é exibido
```

### Visualização de Foto
```
1. Usuário clica no botão de foto (ícone de câmera)
   ↓
2. Modal Bootstrap abre
   ↓
3. Requisição AJAX para /api/Motorista/PegaFotoModal?id=guid
   ↓
4. Backend retorna foto em Base64 ou false
   ↓
5. Se foto existe: exibe "data:image/jpg;base64,..."
   ↓
6. Se não existe: exibe imagem padrão (/Images/barbudo.jpg)
```

### Exclusão de Motorista
```
1. Usuário clica no botão de excluir
   ↓
2. Confirmação SweetAlert é exibida
   ↓
3. Se confirmado: Requisição POST para /api/Motorista/Delete
   ↓
4. Backend verifica se motorista tem contratos associados
   ↓
5. Se tem contratos: retorna erro e bloqueia exclusão
   ↓
6. Se não tem: exclui motorista e retorna sucesso
   ↓
7. Tabela recarrega automaticamente
```

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| GET | `/api/motorista` | Lista todos os motoristas | JSON com array de motoristas |
| GET | `/api/Motorista/PegaFotoModal?id=guid` | Retorna foto em Base64 | String Base64 ou `false` |
| GET | `/api/Motorista/UpdateStatusMotorista?Id=guid` | Alterna status | `{success, message, type}` |
| POST | `/api/Motorista/Delete` | Exclui motorista | `{success, message}` |

---

## Troubleshooting

### Problema: Tabela não carrega (Loading infinito)
**Causa**: Erro no endpoint `/api/motorista` (500 Internal Server Error)  
**Solução**: 
- Abrir DevTools (F12) → Network → Verificar requisição `motorista`
- Verificar logs do servidor
- Verificar se view `ViewMotoristas` existe no banco

### Problema: Foto não carrega (imagem quebrada)
**Causa**: String Base64 inválida ou campo `Foto` vazio no banco  
**Solução**: 
- Verificar se campo `Foto` no banco tem dados válidos
- Verificar se Base64 está sendo gerado corretamente
- O sistema possui fallback para `/Images/barbudo.jpg` que deve funcionar

### Problema: Status não atualiza visualmente
**Causa**: Classes CSS não estão sendo aplicadas ou elemento foi recriado  
**Solução**: 
- Verificar se classes `btn-verde` e `fundo-cinza` existem no CSS
- Verificar se `currentElement` está referenciando elemento correto
- Recarregar tabela após atualização: `dataTable.ajax.reload()`

### Problema: Não consegue excluir motorista
**Causa**: Motorista está associado a um ou mais contratos  
**Solução**: 
- Verificar contratos do motorista na página de Contratos
- Desassociar motorista dos contratos primeiro
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

## [08/01/2026] - Expansão Completa da Documentação

**Descrição**:
Documentação expandida de ~194 linhas para mais de 600 linhas.

**Status**: ✅ **Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
