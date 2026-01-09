# Documentação: Contrato - Gestão (Index)

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Objetivos

A página de **Listagem de Contratos** (`Pages/Contrato/Index.cshtml`) permite:
- ✅ Visualizar todos os contratos cadastrados com informações financeiras e de vigência
- ✅ Gerenciar status (Ativo/Inativo) diretamente da listagem com bloqueio automático de ações
- ✅ Acessar documentos, itens e repactuações de cada contrato
- ✅ Editar contratos através de link para página de edição
- ✅ Excluir contratos com validação inteligente de dependências (7 tipos verificados)
- ✅ Exportar dados para Excel e PDF
- ✅ Filtrar e ordenar dados usando recursos nativos do DataTable

---

## Arquivos Envolvidos

### 1. Pages/Contrato/Index.cshtml
**Função**: View principal da página com HTML da tabela

**Estrutura**:
- Header com botão "Adicionar Contrato"
- Tabela DataTable (`#tblContrato`)
- Estilos CSS customizados inline

**Código Principal**:
```html
<!-- Tabela principal -->
<table id="tblContrato" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Contrato</th>
            <th>Processo</th>
            <th>Objeto</th>
            <th>Empresa</th>
            <th>Vigência</th>
            <th>(R$) Anual</th>
            <th>(R$) Mensal</th>
            <th>Prorrogação</th>
            <th>Status</th>
            <th>Ação</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

---

### 2. Pages/Contrato/Index.cshtml.cs
**Função**: PageModel básico (inicialização simples)

**Código**:
```csharp
public class IndexModel : PageModel
{
    public void OnGet()
    {
        try
        {
            // Página de listagem - dados carregados via AJAX/DataTable
        }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("Index.cshtml.cs", "OnGet", error);
        }
    }
}
```

---

### 3. wwwroot/js/cadastros/contrato.js
**Função**: Lógica do DataTable, validação de dependências e gestão de status

#### 3.1. Inicialização do DataTable
**Problema**: Tabela precisa carregar dados de contratos via AJAX e renderizar colunas customizadas com bloqueio condicional de ações

**Solução**: Configurar DataTable com AJAX, renderizadores customizados para status e ações (com bloqueio quando inativo)

**Código**:
```javascript
function loadList() {
    dataTable = $("#tblContrato").DataTable({
        order: [[0, "desc"]], // Ordena por Contrato decrescente
        
        responsive: true,
        ajax: {
            url: "/api/contrato",
            type: "GET",
            datatype: "json"
        },
        columns: [
            { data: "contratoCompleto" },
            { data: "processoCompleto" },
            { data: "objeto" },
            { data: "descricaoFornecedor" },
            { data: "periodo" },
            { data: "valorFormatado" },
            { data: "valorMensal" },
            { data: "vigenciaCompleta" },
            {
                // ✅ Renderizador de Status (badge clicável)
                data: "status",
                render: function (data, type, row, meta) {
                    if (data) {
                        return `<a href="javascript:void(0)" 
                                   class="updateStatusContrato ftx-badge-status btn-verde" 
                                   data-url="/api/Contrato/updateStatusContrato?Id=${row.contratoId}">
                                   <i class="fa-duotone fa-circle-check"></i>
                                   Ativo
                                </a>`;
                    } else {
                        return `<a href="javascript:void(0)" 
                                   class="updateStatusContrato ftx-badge-status fundo-cinza" 
                                   data-url="/api/Contrato/updateStatusContrato?Id=${row.contratoId}">
                                   <i class="fa-duotone fa-circle-xmark"></i>
                                   Inativo
                                </a>`;
                    }
                }
            },
            {
                // ✅ Renderizador de Ações (5 botões com bloqueio condicional)
                data: "contratoId",
                render: function (data, type, row) {
                    // ✅ Verifica se contrato está inativo
                    var isInativo = !row.status;
                    var disabledClass = isInativo ? 'disabled' : '';
                    var disabledStyle = isInativo ? 'pointer-events: none; opacity: 0.5;' : '';
                    
                    return `<div class="ftx-actions" data-contrato-id="${data}">
                                <a href="/Contrato/Upsert?id=${data}" 
                                   class="btn btn-azul btn-icon-28" 
                                   data-ejtip="Editar Contrato">
                                    <i class="fa-duotone fa-pen-to-square"></i>
                                </a>
                                <a href="javascript:void(0)" 
                                   class="btn btn-delete btn-vinho btn-icon-28" 
                                   data-ejtip="Excluir Contrato"
                                   data-id="${data}">
                                    <i class="fa-duotone fa-trash-can"></i>
                                </a>
                                <a href="javascript:void(0)" 
                                   class="btn btn-documentos btn-info btn-icon-28 ${disabledClass}" 
                                   data-ejtip="Documentos do Contrato"
                                   style="${disabledStyle}"
                                   data-id="${data}">
                                    <i class="fa-duotone fa-file-pdf"></i>
                                </a>
                                <a href="${isInativo ? 'javascript:void(0)' : '/Contrato/ItensContrato?contratoId=' + data}" 
                                   class="btn btn-itens fundo-cinza btn-icon-28 ${disabledClass}" 
                                   data-ejtip="Itens do Contrato"
                                   style="${disabledStyle}"
                                   data-id="${data}">
                                    <i class="fa-duotone fa-sitemap"></i>
                                </a>
                                <a href="${isInativo ? 'javascript:void(0)' : '/Contrato/RepactuacaoContrato?id=' + data}" 
                                   class="btn btn-repactuacao fundo-chocolate btn-icon-28 ${disabledClass}" 
                                   data-ejtip="Adicionar Repactuação"
                                   style="${disabledStyle}"
                                   data-id="${data}">
                                    <i class="fa-duotone fa-handshake"></i>
                                </a>
                            </div>`;
                }
            }
        ]
    });
}
```

#### 3.2. Validação de Dependências Antes de Excluir
**Problema**: Usuário precisa saber quais dependências impedem exclusão antes de tentar excluir

**Solução**: Verificar dependências via API antes de mostrar confirmação, exibir alerta detalhado se houver dependências

**Código**:
```javascript
$(document).on("click", ".btn-delete", function () {
    try {
        var id = $(this).data("id");
        
        // ✅ Primeiro verifica se há dependências
        $.ajax({
            url: "/api/Contrato/VerificarDependencias?id=" + id,
            type: "GET",
            dataType: "json",
            success: function (result) {
                if (result.success && result.possuiDependencias) {
                    // ✅ Não pode excluir - mostrar mensagem com detalhes
                    var mensagem = "Este contrato não pode ser excluído pois possui:\n\n";
                    
                    if (result.veiculosContrato > 0) {
                        mensagem += "• " + result.veiculosContrato + " veículo(s) associado(s)\n";
                    }
                    if (result.encarregados > 0) {
                        mensagem += "• " + result.encarregados + " encarregado(s) vinculado(s)\n";
                    }
                    if (result.operadores > 0) {
                        mensagem += "• " + result.operadores + " operador(es) vinculado(s)\n";
                    }
                    if (result.lavadores > 0) {
                        mensagem += "• " + result.lavadores + " lavador(es) vinculado(s)\n";
                    }
                    if (result.motoristas > 0) {
                        mensagem += "• " + result.motoristas + " motorista(s) vinculado(s)\n";
                    }
                    if (result.empenhos > 0) {
                        mensagem += "• " + result.empenhos + " empenho(s) vinculado(s)\n";
                    }
                    if (result.notasFiscais > 0) {
                        mensagem += "• " + result.notasFiscais + " nota(s) fiscal(is) vinculada(s)\n";
                    }
                    
                    mensagem += "\nRemova as associações antes de excluir o contrato.";
                    
                    Alerta.Warning("Exclusão não permitida", mensagem);
                } else {
                    // ✅ Pode excluir - mostrar confirmação
                    Alerta.Confirmar(
                        "Você tem certeza que deseja apagar este contrato?",
                        "Não será possível recuperar os dados eliminados!",
                        "Excluir",
                        "Cancelar"
                    ).then((willDelete) => {
                        if (willDelete) {
                            // Enviar requisição de exclusão
                            var dataToPost = JSON.stringify({ ContratoId: id });
                            $.ajax({
                                url: "/api/Contrato/Delete",
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
                                }
                            });
                        }
                    });
                }
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("contrato.js", "btn-delete.click", error);
    }
});
```

#### 3.3. Gestão de Status com Bloqueio de Ações
**Problema**: Quando contrato está inativo, ações de Documentos/Itens/Repactuação devem ser bloqueadas

**Solução**: Event handler que atualiza status e bloqueia/desbloqueia botões dinamicamente

**Código**:
```javascript
$(document).on("click", ".updateStatusContrato", function () {
    try {
        var url = $(this).data("url");
        var currentElement = $(this);
        var row = currentElement.closest('tr');
        
        $.get(url, function (data) {
            if (data.success) {
                AppToast.show('Verde', "Status alterado com sucesso!");
                
                // ✅ Botões que devem ser bloqueados/desbloqueados
                var botoesBloqueaveis = row.find('.btn-documentos, .btn-itens, .btn-repactuacao');
                
                if (currentElement.hasClass("btn-verde")) {
                    // ✅ Era Ativo, agora é Inativo - BLOQUEAR botões
                    currentElement
                        .removeClass("btn-verde")
                        .addClass("fundo-cinza")
                        .html('<i class="fa-duotone fa-circle-xmark"></i> Inativo');
                    
                    botoesBloqueaveis
                        .addClass('disabled')
                        .css({ 'pointer-events': 'none', 'opacity': '0.5' });
                    
                    row.find('.btn-repactuacao').attr('href', 'javascript:void(0)');
                } else {
                    // ✅ Era Inativo, agora é Ativo - DESBLOQUEAR botões
                    currentElement
                        .removeClass("fundo-cinza")
                        .addClass("btn-verde")
                        .html('<i class="fa-duotone fa-circle-check"></i> Ativo');
                    
                    botoesBloqueaveis
                        .removeClass('disabled')
                        .css({ 'pointer-events': '', 'opacity': '' });
                    
                    var contratoId = row.find('.btn-repactuacao').data('id');
                    row.find('.btn-repactuacao').attr('href', '/Contrato/RepactuacaoContrato?id=' + contratoId);
                }
            }
        });
    } catch (error) {
        Alerta.TratamentoErroComLinha("contrato.js", "updateStatusContrato.click", error);
    }
});
```

---

### 4. Controllers/ContratoController.cs
**Função**: Endpoints API para operações com contratos

#### 4.1. GET `/api/contrato`
**Problema**: Frontend precisa de lista completa de contratos formatada para DataTable

**Solução**: Endpoint que faz JOIN com Fornecedor e formata valores, datas e vigência

**Código**:
```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        var result = (
            from c in _unitOfWork.Contrato.GetAll()
            join f in _unitOfWork.Fornecedor.GetAll()
                on c.FornecedorId equals f.FornecedorId
            orderby c.AnoContrato descending
            select new
            {
                // ✅ Formata contrato como "Ano/Número"
                ContratoCompleto = c.AnoContrato + "/" + c.NumeroContrato,
                // ✅ Formata processo como "Número/Ano" (últimos 2 dígitos)
                ProcessoCompleto = c.NumeroProcesso + "/" + c.AnoProcesso.ToString().Substring(2, 2),
                c.Objeto,
                f.DescricaoFornecedor,
                // ✅ Formata período como "DD/MM/AA a DD/MM/AA"
                Periodo = c.DataInicio?.ToString("dd/MM/yy") + " a " + c.DataFim?.ToString("dd/MM/yy"),
                // ✅ Formata valor anual em moeda brasileira
                ValorFormatado = c.Valor?.ToString("C"),
                // ✅ Calcula valor mensal (Anual / 12)
                ValorMensal = (c.Valor / 12)?.ToString("C"),
                // ✅ Formata vigência completa
                VigenciaCompleta = c.Vigencia + "ª vigência + " + c.Prorrogacao + " prorrog.",
                c.Status,
                c.ContratoId
            }
        ).ToList().OrderByDescending(c => c.ContratoCompleto);
        
        return Json(new { data = result });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("ContratoController.cs", "Get", error);
        return StatusCode(500);
    }
}
```

#### 4.2. GET `/api/Contrato/VerificarDependencias`
**Problema**: Frontend precisa saber quais dependências impedem exclusão antes de tentar excluir

**Solução**: Endpoint que conta registros em 7 tabelas relacionadas e retorna quantidade de cada tipo

**Código**:
```csharp
[Route("VerificarDependencias")]
public IActionResult VerificarDependencias(Guid id)
{
    int veiculosContrato = 0;
    int encarregados = 0;
    int operadores = 0;
    int lavadores = 0;
    int motoristas = 0;
    int empenhos = 0;
    int notasFiscais = 0;
    
    try
    {
        // ✅ Cada verificação em try/catch separado para não falhar se uma tabela não existir
        try { veiculosContrato = _unitOfWork.VeiculoContrato.GetAll(x => x.ContratoId == id).Count(); } catch { }
        try { encarregados = _unitOfWork.Encarregado.GetAll(x => x.ContratoId == id).Count(); } catch { }
        try { operadores = _unitOfWork.Operador.GetAll(x => x.ContratoId == id).Count(); } catch { }
        try { lavadores = _unitOfWork.Lavador.GetAll(x => x.ContratoId == id).Count(); } catch { }
        try { motoristas = _unitOfWork.Motorista.GetAll(x => x.ContratoId == id).Count(); } catch { }
        try { empenhos = _unitOfWork.Empenho.GetAll(x => x.ContratoId == id).Count(); } catch { }
        try { notasFiscais = _unitOfWork.NotaFiscal.GetAll(x => x.ContratoId == id).Count(); } catch { }
        
        var possuiDependencias = veiculosContrato > 0 || encarregados > 0 || 
                                 operadores > 0 || lavadores > 0 || motoristas > 0 ||
                                 empenhos > 0 || notasFiscais > 0;
        
        return Json(new
        {
            success = true,
            possuiDependencias = possuiDependencias,
            veiculosContrato = veiculosContrato,
            encarregados = encarregados,
            operadores = operadores,
            lavadores = lavadores,
            motoristas = motoristas,
            empenhos = empenhos,
            notasFiscais = notasFiscais
        });
    }
    catch (Exception ex)
    {
        return Json(new
        {
            success = false,
            message = "Erro ao verificar dependências: " + ex.Message
        });
    }
}
```

#### 4.3. POST `/api/Contrato/Delete`
**Problema**: Frontend precisa excluir contrato incluindo repactuações e itens relacionados

**Solução**: Endpoint que valida dependências básicas, remove repactuações/itens e depois exclui contrato

**Código**:
```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(ContratoViewModel model)
{
    try
    {
        if (model != null && model.ContratoId != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Contrato.GetFirstOrDefault(u =>
                u.ContratoId == model.ContratoId
            );
            
            if (objFromDb != null)
            {
                // ✅ Validações básicas (veículos e empenhos)
                var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
                    v.ContratoId == model.ContratoId
                );
                if (veiculo != null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Existem veículos associados a esse contrato"
                    });
                }
                
                var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                    u.ContratoId == model.ContratoId
                );
                if (empenho != null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Existem empenhos associados a esse contrato"
                    });
                }
                
                // ✅ Remove repactuações e itens relacionados
                var objRepactuacao = _unitOfWork.RepactuacaoContrato.GetAll(riv =>
                    riv.ContratoId == model.ContratoId
                );
                foreach (var repactuacao in objRepactuacao)
                {
                    var objItemRepactuacao = _unitOfWork.ItemVeiculoContrato.GetAll(ivc =>
                        ivc.RepactuacaoContratoId == repactuacao.RepactuacaoContratoId
                    );
                    foreach (var itemveiculo in objItemRepactuacao)
                    {
                        _unitOfWork.ItemVeiculoContrato.Remove(itemveiculo);
                    }
                    _unitOfWork.RepactuacaoContrato.Remove(repactuacao);
                }
                
                // ✅ Exclui contrato
                _unitOfWork.Contrato.Remove(objFromDb);
                _unitOfWork.Save();
                
                return Json(new
                {
                    success = true,
                    message = "Contrato removido com sucesso"
                });
            }
        }
        
        return Json(new
        {
            success = false,
            message = "Erro ao apagar Contrato"
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("ContratoController.cs", "Delete", error);
        return StatusCode(500);
    }
}
```

#### 4.4. GET `/api/Contrato/UpdateStatusContrato`
**Problema**: Frontend precisa alternar status de contrato

**Solução**: Endpoint que inverte status (true ↔ false) e retorna novo estado

**Código**:
```csharp
[Route("UpdateStatusContrato")]
public JsonResult UpdateStatusContrato(Guid Id)
{
    try
    {
        if (Id != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Contrato.GetFirstOrDefault(u => u.ContratoId == Id);
            
            if (objFromDb != null)
            {
                int type = 0;
                string Description = "";
                
                if (objFromDb.Status == true)
                {
                    // ✅ Inverte para Inativo
                    objFromDb.Status = false;
                    Description = $"Atualizado Status do Contrato [Nome: {objFromDb.AnoContrato}/{objFromDb.NumeroContrato}] (Inativo)";
                    type = 1;
                }
                else
                {
                    // ✅ Inverte para Ativo
                    objFromDb.Status = true;
                    Description = $"Atualizado Status do Contrato [Nome: {objFromDb.AnoContrato}/{objFromDb.NumeroContrato}] (Ativo)";
                    type = 0;
                }
                
                _unitOfWork.Contrato.Update(objFromDb);
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
        Alerta.TratamentoErroComLinha("ContratoController.cs", "UpdateStatusContrato", error);
        return Json(new { sucesso = false });
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
3. Requisição AJAX para /api/contrato (GET)
   ↓
4. Backend retorna todos os contratos com JOIN em Fornecedor
   ↓
5. Backend formata dados (valores, datas, vigência)
   ↓
6. DataTable renderiza dados com renderizadores customizados
   ↓
7. Botões são bloqueados/desbloqueados conforme status inicial
```

### Alteração de Status
```
1. Usuário clica no badge de status
   ↓
2. Requisição AJAX para /api/Contrato/UpdateStatusContrato?Id=guid
   ↓
3. Backend inverte status no banco
   ↓
4. Retorna novo status e tipo (0=Ativo, 1=Inativo)
   ↓
5. Frontend atualiza badge visualmente
   ↓
6. Frontend bloqueia/desbloqueia botões (Documentos, Itens, Repactuação)
   ↓
7. Toast de sucesso é exibido
```

### Exclusão com Validação de Dependências
```
1. Usuário clica no botão de excluir
   ↓
2. Requisição GET para /api/Contrato/VerificarDependencias?id=guid
   ↓
3. Backend conta dependências em 7 tabelas relacionadas
   ↓
4. Se possui dependências:
   - Mostra alerta detalhado com quantidade de cada tipo
   - Bloqueia exclusão
   ↓
5. Se não possui dependências:
   - Mostra confirmação SweetAlert
   - Se confirmado: Requisição POST para /api/Contrato/Delete
   ↓
6. Backend valida veículos e empenhos (validação adicional)
   ↓
7. Backend remove repactuações e itens relacionados
   ↓
8. Backend exclui contrato
   ↓
9. Tabela recarrega automaticamente
```

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| GET | `/api/contrato` | Lista todos os contratos formatados | JSON com array de contratos |
| GET | `/api/Contrato/VerificarDependencias?id=guid` | Verifica 7 tipos de dependências | `{success, possuiDependencias, veiculosContrato, encarregados, operadores, lavadores, motoristas, empenhos, notasFiscais}` |
| GET | `/api/Contrato/UpdateStatusContrato?Id=guid` | Alterna status | `{success, message, type}` |
| POST | `/api/Contrato/Delete` | Exclui contrato com limpeza | `{success, message}` |

---

## Troubleshooting

### Problema: Tabela não carrega
**Causa**: Erro no endpoint `/api/contrato` (500 Internal Server Error)  
**Solução**: 
- Abrir DevTools (F12) → Network → Verificar requisição `contrato`
- Verificar logs do servidor
- Verificar se JOIN com Fornecedor está funcionando

### Problema: Valores formatados incorretamente
**Causa**: Configuração regional do servidor diferente de pt-BR  
**Solução**: 
- Verificar cultura do servidor (deve ser pt-BR)
- Verificar se `ToString("C")` está formatando corretamente

### Problema: Status não atualiza visualmente
**Causa**: Classes CSS não estão sendo aplicadas ou elemento foi recriado  
**Solução**: 
- Verificar se classes `btn-verde` e `fundo-cinza` existem no CSS
- Verificar se `currentElement` está referenciando elemento correto
- Verificar se `row` está sendo encontrado corretamente

### Problema: Botões não bloqueiam quando inativo
**Causa**: Renderizador não está aplicando classes/styles corretamente  
**Solução**: 
- Verificar se `row.status` está sendo lido corretamente
- Verificar se classes `disabled` e styles estão sendo aplicados
- Verificar se `href` está sendo alterado para `javascript:void(0)`

### Problema: Validação de dependências não funciona
**Causa**: Endpoint `/api/Contrato/VerificarDependencias` não existe ou retorna erro  
**Solução**: 
- Verificar se arquivo `ContratoController.VerificarDependencias.cs` existe
- Verificar Network Tab para erros na requisição
- Verificar se resposta está no formato esperado

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
Documentação expandida de ~143 linhas para mais de 700 linhas.

**Status**: ✅ **Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
