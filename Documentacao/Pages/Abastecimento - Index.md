# Documentação: Abastecimento - Index

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Objetivos

A página **Abastecimento - Index** (`Pages/Abastecimento/Index.cshtml`) permite:
- ✅ Visualizar todos os abastecimentos cadastrados em uma tabela interativa
- ✅ Filtrar abastecimentos por múltiplos critérios (Veículo, Combustível, Unidade, Motorista, Data)
- ✅ Editar a quilometragem de abastecimentos existentes através de modal
- ✅ Exportar dados para Excel e PDF
- ✅ Analisar consumo de combustível e médias por veículo
- ✅ Monitorar custos unitários e totais de abastecimentos

---

## Arquivos Envolvidos

### 1. Pages/Abastecimento/Index.cshtml
**Função**: View principal com tabela, filtros e modal de edição de KM

**Estrutura**:
- Card de filtros com Syncfusion ComboBoxes
- Tabela DataTable (`#tblAbastecimentos`)
- Modal Bootstrap para editar KM (`#modalEditaKm`)
- Scripts JavaScript inline

---

### 2. Pages/Abastecimento/Index.cshtml.cs
**Função**: PageModel que inicializa dados para os filtros

**Problema**: Filtros precisam de listas pré-carregadas (veículos, combustíveis, unidades, motoristas)

**Solução**: Carregar listas no OnGet e popular ViewData

**Código**:
```csharp
public class IndexModel : PageModel
{
    private readonly IUnitOfWork _unitOfWork;
    
    public IndexModel(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    
    public void OnGet()
    {
        try
        {
            // ✅ Carrega listas para filtros
            ViewData["Veiculos"] = _unitOfWork.Veiculo.GetAll()
                .Where(v => v.Status)
                .Select(v => new { v.VeiculoId, v.Placa })
                .ToList();
            
            ViewData["Combustiveis"] = _unitOfWork.Combustivel.GetAll()
                .Where(c => c.Status)
                .ToList();
            
            ViewData["Unidades"] = _unitOfWork.Unidade.GetAll()
                .Where(u => u.Status)
                .ToList();
            
            ViewData["Motoristas"] = _unitOfWork.Motorista.GetAll()
                .Where(m => m.Status)
                .ToList();
        }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("Index.cshtml.cs", "OnGet", error);
        }
    }
}
```

---

### 3. Pages/Abastecimento/Index.cshtml (JavaScript Inline)
**Função**: Lógica do DataTable, filtros e modal de edição

#### 3.1. Inicialização do DataTable
**Problema**: Tabela precisa carregar dados de abastecimentos via AJAX com 14 colunas

**Solução**: Configurar DataTable com AJAX, renderizador customizado para botão de ação

**Código**:
```javascript
function ListaTodosAbastecimentos() {
    // ✅ Destrói tabela existente se houver
    if ($.fn.DataTable.isDataTable('#tblAbastecimentos')) {
        $('#tblAbastecimentos').DataTable().clear().destroy();
    }
    $('#tblAbastecimentos tbody').empty();
    
    // ✅ Configura formato de data para ordenação
    if ($.fn.dataTable && $.fn.dataTable.moment) {
        $.fn.dataTable.moment('DD/MM/YYYY');
    }
    
    var dataTableAbastecimentos = $('#tblAbastecimentos').DataTable({
        dom: 'Bfrtip',
        lengthMenu: [[10, 25, 50, -1], ['10 linhas', '25 linhas', '50 linhas', 'Todas as Linhas']],
        buttons: ['pageLength', 'excel', {
            extend: 'pdfHtml5',
            orientation: 'landscape',
            pageSize: 'LEGAL'
        }],
        responsive: true,
        ajax: {
            url: "/api/abastecimento",
            type: "GET",
            datatype: "json"
        },
        columns: [
            { data: "data" },
            { data: "hora" },
            { data: "placa" },
            { data: "tipoVeiculo" },
            { data: "motoristaCondutor" },
            { data: "tipoCombustivel" },
            { data: "sigla" },
            { data: "valorUnitario" },
            { data: "valorTotal" },
            { data: "litros" },
            { data: "kmRodado" },
            { data: "consumo" },
            { data: "consumoGeral" },
            {
                // ✅ Renderizador de Ação (botão para editar KM)
                data: "abastecimentoId",
                render: function (data) {
                    return `<div class="text-center">
                        <a class="btn text-white btn-acao-km"
                           data-bs-toggle="modal" 
                           data-bs-target="#modalEditaKm"
                           data-id='${data}'
                           style="cursor:pointer; background-color:#3D5771;">
                            <i class="fad fa-pen-to-square"></i>
                        </a>
                    </div>`;
                }
            }
        ]
    });
}
```

#### 3.2. Sistema de Filtros
**Problema**: Usuário precisa filtrar abastecimentos por Veículo, Combustível, Unidade, Motorista ou Data

**Solução**: Syncfusion ComboBoxes que ao selecionar item, destroem tabela atual e recriam com endpoint específico

**Código - Filtro por Veículo**:
```javascript
var veiculosCombo = new ej.dropdowns.ComboBox({
    dataSource: veiculosData,
    fields: { value: 'VeiculoId', text: 'Placa' },
    placeholder: 'Selecione um veículo',
    change: function(args) {
        if (args.value) {
            // ✅ Define que está escolhendo veículo
            escolhendoVeiculo = true;
            escolhendoUnidade = false;
            escolhendoMotorista = false;
            escolhendoCombustivel = false;
            escolhendoData = false;
            
            // ✅ Limpa outros filtros
            unidadesCombo.value = "";
            motoristasCombo.value = "";
            combustiveisCombo.value = "";
            $('#txtData').val("");
            
            // ✅ Destrói tabela atual
            dtDestroySafe();
            
            // ✅ Recria tabela com filtro de veículo
            var opts = dtCommonOptions();
            opts.ajax = {
                url: "/api/abastecimento/AbastecimentoVeiculos",
                data: { Id: args.value },
                type: "GET",
                datatype: "json"
            };
            $('#tblAbastecimentos').DataTable(opts);
        }
    }
});
```

**Código - Filtro por Data**:
```javascript
$("#txtData").change(function () {
    // ✅ Converte formato de data de YYYY-MM-DD para DD/MM/YYYY
    const partes = $('#txtData').val().split("-");
    const [year, month, day] = partes;
    const dataAbastecimento = `${day}/${month}/${year}`;
    
    // ✅ Limpa todos os outros filtros
    veiculosCombo.value = "";
    unidadesCombo.value = "";
    motoristasCombo.value = "";
    combustiveisCombo.value = "";
    
    escolhendoData = true;
    escolhendoVeiculo = false;
    escolhendoUnidade = false;
    escolhendoMotorista = false;
    escolhendoCombustivel = false;
    
    // ✅ Destrói tabela atual
    dtDestroySafe();
    
    // ✅ Recria tabela com filtro de data
    var opts = dtCommonOptions();
    opts.ajax = {
        url: "/api/abastecimento/AbastecimentoData",
        data: { dataAbastecimento: dataAbastecimento },
        type: "GET",
        datatype: "json"
    };
    $('#tblAbastecimentos').DataTable(opts);
});
```

#### 3.3. Modal de Edição de KM
**Problema**: Usuário precisa editar quilometragem de abastecimento já registrado

**Solução**: Modal Bootstrap que busca dados do abastecimento ao abrir e envia atualização via POST

**Código - Abertura do Modal**:
```javascript
$('#modalEditaKm').on('shown.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var abastecimentoId = button.data('id');
    
    // ✅ Busca dados do abastecimento
    $.ajax({
        url: '/api/abastecimento',
        type: 'GET',
        success: function(response) {
            var abastecimento = response.data.find(a => 
                a.abastecimentoId === abastecimentoId
            );
            if (abastecimento) {
                $('#txtId').val(abastecimento.abastecimentoId);
                $('#txtKm').val(abastecimento.kmRodado);
            }
        }
    });
});
```

**Código - Salvamento**:
```javascript
$("#btnEditaKm").click(function (e) {
    e.preventDefault();
    
    var abastecimentoId = $('#txtId').val();
    var novoKm = $('#txtKm').val();
    
    // ✅ Validação básica
    if (!novoKm || novoKm <= 0) {
        Alerta.Erro('Erro', 'Informe uma quilometragem válida');
        return;
    }
    
    // ✅ Desabilita botão e mostra loading
    $("#btnEditaKm").prop('disabled', true);
    $("#btnEditaKm .btn-text").addClass('d-none');
    $("#btnEditaKm .btn-loading").removeClass('d-none');
    
    $.ajax({
        url: "/api/Abastecimento/EditaKm",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            AbastecimentoId: abastecimentoId,
            KmRodado: parseFloat(novoKm)
        }),
        success: function(response) {
            $('#modalEditaKm').modal('hide');
            // ✅ Recarrega tabela
            ListaTodosAbastecimentos();
            Alerta.Sucesso('Sucesso', 'Quilometragem atualizada com sucesso');
        },
        error: function(error) {
            Alerta.Erro('Erro', 'Não foi possível atualizar a quilometragem');
        },
        complete: function() {
            // ✅ Reabilita botão
            $("#btnEditaKm").prop('disabled', false);
            $("#btnEditaKm .btn-text").removeClass('d-none');
            $("#btnEditaKm .btn-loading").addClass('d-none');
        }
    });
});
```

---

### 4. Controllers/AbastecimentoController.cs
**Função**: Endpoints API para operações com abastecimentos

#### 4.1. GET `/api/abastecimento`
**Problema**: Frontend precisa de lista completa de abastecimentos ordenada por data/hora

**Solução**: Endpoint que retorna todos os abastecimentos da view `ViewAbastecimentos` ordenados decrescente

**Código**:
```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        var dados = _unitOfWork
            .ViewAbastecimentos.GetAll()
            .OrderByDescending(va => va.DataHora)
            .ToList();
        
        return Ok(new { data = dados });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "Get", error);
        return StatusCode(500);
    }
}
```

#### 4.2. GET `/api/abastecimento/AbastecimentoVeiculos`
**Problema**: Frontend precisa filtrar abastecimentos por veículo específico

**Solução**: Endpoint que filtra view por `VeiculoId`

**Código**:
```csharp
[Route("AbastecimentoVeiculos")]
[HttpGet]
public IActionResult AbastecimentoVeiculos(Guid Id)
{
    try
    {
        var dados = _unitOfWork
            .ViewAbastecimentos.GetAll()
            .Where(va => va.VeiculoId == Id)
            .OrderByDescending(va => va.DataHora)
            .ToList();
        
        return Ok(new { data = dados });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "AbastecimentoVeiculos", error);
        return StatusCode(500);
    }
}
```

#### 4.3. GET `/api/abastecimento/AbastecimentoCombustivel`
**Problema**: Frontend precisa filtrar abastecimentos por tipo de combustível

**Solução**: Endpoint que filtra view por `CombustivelId`

**Código**: Similar ao `AbastecimentoVeiculos`, mas filtra por `CombustivelId`

#### 4.4. GET `/api/abastecimento/AbastecimentoUnidade`
**Problema**: Frontend precisa filtrar abastecimentos por unidade

**Solução**: Endpoint que filtra view por `UnidadeId`

**Código**: Similar ao `AbastecimentoVeiculos`, mas filtra por `UnidadeId`

#### 4.5. GET `/api/abastecimento/AbastecimentoMotorista`
**Problema**: Frontend precisa filtrar abastecimentos por motorista

**Solução**: Endpoint que filtra view por `MotoristaId`

**Código**: Similar ao `AbastecimentoVeiculos`, mas filtra por `MotoristaId`

#### 4.6. GET `/api/abastecimento/AbastecimentoData`
**Problema**: Frontend precisa filtrar abastecimentos por data específica

**Solução**: Endpoint que filtra view por campo `Data` (formato DD/MM/YYYY)

**Código**:
```csharp
[Route("AbastecimentoData")]
[HttpGet]
public IActionResult AbastecimentoData(string dataAbastecimento)
{
    try
    {
        var dados = _unitOfWork
            .ViewAbastecimentos.GetAll()
            .Where(va => va.Data == dataAbastecimento)
            .OrderByDescending(va => va.DataHora)
            .ToList();
        
        return Ok(new { data = dados });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "AbastecimentoData", error);
        return StatusCode(500);
    }
}
```

#### 4.7. POST `/api/Abastecimento/EditaKm`
**Problema**: Frontend precisa atualizar quilometragem de abastecimento existente

**Solução**: Endpoint que busca abastecimento e atualiza apenas campo `KmRodado`

**Código**:
```csharp
[Route("EditaKm")]
[HttpPost]
[Consumes("application/json")]
public IActionResult EditaKm([FromBody] Abastecimento abastecimento)
{
    try
    {
        // ✅ Busca abastecimento existente
        var objAbastecimento = _unitOfWork.Abastecimento.GetFirstOrDefault(a =>
            a.AbastecimentoId == abastecimento.AbastecimentoId
        );
        
        // ✅ Atualiza apenas KM rodado
        objAbastecimento.KmRodado = abastecimento.KmRodado;
        
        _unitOfWork.Abastecimento.Update(objAbastecimento);
        _unitOfWork.Save();
        
        return Ok(new
        {
            success = true,
            message = "Abastecimento atualizado com sucesso",
            type = 0
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "EditaKm", error);
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
2. Backend carrega listas para filtros (veículos, combustíveis, unidades, motoristas)
   ↓
3. Frontend inicializa Syncfusion ComboBoxes com dados
   ↓
4. Frontend inicializa DataTable chamando ListaTodosAbastecimentos()
   ↓
5. Requisição AJAX para /api/abastecimento (GET)
   ↓
6. Backend retorna todos os abastecimentos da ViewAbastecimentos
   ↓
7. DataTable renderiza dados na tabela
```

### Aplicação de Filtro
```
1. Usuário seleciona item em um ComboBox (ex: Veículo)
   ↓
2. Event handler `change` é disparado
   ↓
3. Limpa outros filtros
   ↓
4. Destrói tabela atual (dtDestroySafe)
   ↓
5. Recria tabela com endpoint específico (ex: /api/abastecimento/AbastecimentoVeiculos)
   ↓
6. Tabela recarrega com dados filtrados
```

### Edição de KM
```
1. Usuário clica no botão de ação (ícone de lápis)
   ↓
2. Modal Bootstrap abre automaticamente
   ↓
3. Event handler `shown.bs.modal` busca dados do abastecimento
   ↓
4. Preenche campo txtKm com KM atual
   ↓
5. Usuário edita o valor
   ↓
6. Clica em "Confirmar Alteração"
   ↓
7. Validação básica (KM > 0)
   ↓
8. Requisição POST para /api/Abastecimento/EditaKm
   ↓
9. Backend atualiza apenas campo KmRodado
   ↓
10. Tabela recarrega automaticamente
```

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| GET | `/api/abastecimento` | Lista todos os abastecimentos | Nenhum |
| GET | `/api/abastecimento/AbastecimentoVeiculos` | Filtra por veículo | `Id` (Guid) |
| GET | `/api/abastecimento/AbastecimentoCombustivel` | Filtra por combustível | `Id` (Guid) |
| GET | `/api/abastecimento/AbastecimentoUnidade` | Filtra por unidade | `Id` (Guid) |
| GET | `/api/abastecimento/AbastecimentoMotorista` | Filtra por motorista | `Id` (Guid) |
| GET | `/api/abastecimento/AbastecimentoData` | Filtra por data | `dataAbastecimento` (string DD/MM/YYYY) |
| POST | `/api/Abastecimento/EditaKm` | Atualiza quilometragem | `{AbastecimentoId, KmRodado}` |

---

## Troubleshooting

### Problema: Tabela não carrega
**Causa**: Erro no endpoint `/api/abastecimento` ou view `ViewAbastecimentos` não existe  
**Solução**: 
- Verificar logs do servidor
- Verificar se view existe no banco de dados
- Verificar Network Tab para erros na requisição

### Problema: Filtros não funcionam
**Causa**: ComboBoxes não estão inicializados ou endpoints retornam erro  
**Solução**: 
- Verificar se dados estão sendo carregados no OnGet
- Verificar se Syncfusion está carregado corretamente
- Verificar Network Tab para erros nas requisições de filtro

### Problema: Modal de edição não abre
**Causa**: Bootstrap modal não está funcionando ou evento não está registrado  
**Solução**: 
- Verificar se Bootstrap está carregado
- Verificar se atributo `data-bs-toggle="modal"` está correto
- Verificar se ID do modal está correto

### Problema: KM não atualiza após salvar
**Causa**: Endpoint `/api/Abastecimento/EditaKm` retorna erro ou tabela não recarrega  
**Solução**: 
- Verificar Network Tab para erros na requisição POST
- Verificar se função `ListaTodosAbastecimentos()` está sendo chamada após sucesso
- Verificar logs do servidor

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
Documentação expandida de ~200 linhas para mais de 600 linhas.

**Status**: ✅ **Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
