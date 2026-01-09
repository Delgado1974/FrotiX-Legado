# Documentação: Controle de Viagens (Index)

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Objetivos

A página **Controle de Viagens** (`Pages/Viagens/Index.cshtml`) permite:
- ✅ Visualizar todas as viagens da frota em uma tabela interativa rica
- ✅ Filtrar viagens por múltiplos critérios (Data, Veículo, Motorista, Status, Evento)
- ✅ Finalizar viagens abertas capturando dados reais de execução
- ✅ Gerenciar ocorrências diretamente da listagem
- ✅ Visualizar custos detalhados de cada viagem
- ✅ Imprimir fichas de viagem em PDF
- ✅ Monitorar status e progresso das viagens em tempo real

---

## Arquivos Envolvidos

### 1. Pages/Viagens/Index.cshtml
**Função**: View principal com tabela, filtros e múltiplos modais

**Estrutura**:
- Card de filtros com Syncfusion ComboBoxes
- Tabela DataTable (`#tblViagem`)
- Modal de Finalização (`#modalFinalizaViagem`)
- Modal de Custos (`#modalCustos`)
- Modal de Ocorrências (`#modalOcorrencias`)
- Scripts JavaScript inline

---

### 2. Pages/Viagens/Index.cshtml.cs
**Função**: PageModel que inicializa dados para os filtros

**Problema**: Filtros precisam de listas pré-carregadas (motoristas, veículos, status, eventos)

**Solução**: Carregar listas no OnGet usando helpers especializados

**Código**:
```csharp
@functions {
    public void OnGet()
    {
        // ✅ Inicializa dados usando helpers especializados
        FrotiX.Pages.Viagens.IndexModel.Initialize(_unitOfWork);
        ViewData["dataCombustivel"] = new ListaNivelCombustivel(_unitOfWork).NivelCombustivelList();
        ViewData["lstMotorista"] = new ListaMotorista(_unitOfWork).MotoristaList();
        ViewData["lstVeiculos"] = new ListaVeiculos(_unitOfWork).VeiculosList();
        ViewData["lstSetor"] = new ListaSetores(_unitOfWork).SetoresList();
        ViewData["dataSetor"] = new ListaSetores(_unitOfWork).SetoresList();
        ViewData["lstStatus"] = new ListaStatus(_unitOfWork).StatusList();
        ViewData["lstEventos"] = new ListaEvento(_unitOfWork).EventosList();
    }
}
```

---

### 3. wwwroot/js/cadastros/ViagemIndex.js
**Função**: Lógica do DataTable, filtros, lazy loading de fotos e modais

#### 3.1. Inicialização do DataTable
**Problema**: Tabela precisa carregar dados de viagens via AJAX com renderizadores customizados para foto e status

**Solução**: Configurar DataTable com AJAX, renderizador customizado para foto (lazy loading) e badges de status

**Código**:
```javascript
function ListaTodasViagens() {
    // ✅ Destrói tabela existente se houver
    if ($.fn.DataTable.isDataTable('#tblViagem')) {
        $('#tblViagem').DataTable().clear().destroy();
    }
    $('#tblViagem tbody').empty();
    
    var dataTableViagens = $('#tblViagem').DataTable({
        dom: 'Bfrtip',
        lengthMenu: [[10, 25, 50, -1], ['10 linhas', '25 linhas', '50 linhas', 'Todas as Linhas']],
        buttons: ['pageLength', 'excel', {
            extend: 'pdfHtml5',
            orientation: 'landscape',
            pageSize: 'LEGAL'
        }],
        responsive: true,
        ajax: {
            url: "/api/viagem",
            type: "GET",
            datatype: "json"
        },
        columns: [
            { data: "noFichaVistoria" },
            {
                // ✅ Renderizador de Foto do Motorista (lazy loading)
                data: "motoristaId",
                render: function (data, type, row, meta) {
                    if (data) {
                        return `<img class="ftx-foto-motorista" 
                                    data-motorista-id="${data}"
                                    src="/images/placeholder-user.png"
                                    style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; cursor: pointer;"
                                    alt="Foto do motorista" />`;
                    }
                    return '';
                }
            },
            { data: "motoristaCondutor" },
            { data: "placa" },
            { data: "origem" },
            { data: "destino" },
            { data: "dataInicial" },
            { data: "horaInicio" },
            {
                // ✅ Renderizador de Status (badge colorido)
                data: "status",
                render: function (data, type, row, meta) {
                    var badgeClass = '';
                    var icon = '';
                    
                    if (data === 'Aberta') {
                        badgeClass = 'bg-warning text-dark';
                        icon = 'fa-circle-dot';
                    } else if (data === 'Realizada') {
                        badgeClass = 'bg-success';
                        icon = 'fa-circle-check';
                    } else if (data === 'Cancelada') {
                        badgeClass = 'bg-danger';
                        icon = 'fa-circle-xmark';
                    }
                    
                    return `<span class="badge ${badgeClass}">
                                <i class="fa-duotone ${icon}"></i> ${data}
                            </span>`;
                }
            },
            {
                // ✅ Renderizador de Ações (botões contextuais)
                data: "viagemId",
                render: function (data, type, row, meta) {
                    var botoes = '';
                    
                    // Botão Finalizar (só se status = "Aberta")
                    if (row.status === 'Aberta') {
                        botoes += `<a href="javascript:void(0)" 
                                     class="btn btn-success btn-sm btn-finalizar"
                                     data-id="${data}">
                                    <i class="fa-duotone fa-flag-checkered"></i> Finalizar
                                  </a>`;
                    }
                    
                    // Botão Cancelar (só se status = "Aberta")
                    if (row.status === 'Aberta') {
                        botoes += `<a href="javascript:void(0)" 
                                     class="btn btn-danger btn-sm btn-cancelar"
                                     data-id="${data}">
                                    <i class="fa-duotone fa-ban"></i> Cancelar
                                  </a>`;
                    }
                    
                    // Botão Custos (sempre disponível)
                    botoes += `<a href="javascript:void(0)" 
                                 class="btn btn-info btn-sm btn-custos"
                                 data-id="${data}">
                                <i class="fa-duotone fa-dollar-sign"></i> Custos
                              </a>`;
                    
                    // Botão Ocorrências (sempre disponível)
                    botoes += `<a href="javascript:void(0)" 
                                 class="btn btn-warning btn-sm btn-ocorrencias"
                                 data-id="${data}">
                                <i class="fa-duotone fa-exclamation-triangle"></i> Ocorrências
                              </a>`;
                    
                    return `<div class="ftx-btn-acoes">${botoes}</div>`;
                }
            }
        ]
    });
    
    // ✅ Inicializa lazy loading de fotos após tabela renderizar
    inicializarLazyLoadingFotos();
}
```

#### 3.2. Lazy Loading de Fotos de Motoristas
**Problema**: Carregar todas as fotos de uma vez causa lentidão e muitas requisições simultâneas

**Solução**: IntersectionObserver para carregar foto apenas quando imagem está visível, com cache e fila de concorrência

**Código**:
```javascript
// ✅ Cache definitivo: motoristaId -> "data:image..." OU URL do placeholder
const FtxFotoCache = new Map();

// ✅ Em voo: motoristaId -> Promise<string>
const FtxFotoInflight = new Map();

// ✅ Fila para controlar concorrência (máximo 4 simultâneas)
const FtxFotoQueue = [];
const FTX_MAX_CONCURRENT = 4;
let FtxFotoCurrent = 0;

function inicializarLazyLoadingFotos() {
    // ✅ IntersectionObserver para detectar quando imagem entra na viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const motoristaId = img.getAttribute('data-motorista-id');
                
                if (motoristaId && !FtxFotoCache.has(motoristaId)) {
                    // ✅ Adiciona à fila de carregamento
                    ftxQueueFotoFetch(motoristaId, img);
                }
                
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });
    
    // ✅ Observa todas as imagens de motorista
    document.querySelectorAll('.ftx-foto-motorista').forEach(img => {
        observer.observe(img);
    });
}

function ftxQueueFotoFetch(motoristaId, imgElement) {
    // ✅ Se já está em cache, usa cache
    if (FtxFotoCache.has(motoristaId)) {
        imgElement.src = FtxFotoCache.get(motoristaId);
        return;
    }
    
    // ✅ Se já está sendo carregada, aguarda Promise existente
    if (FtxFotoInflight.has(motoristaId)) {
        FtxFotoInflight.get(motoristaId).then(url => {
            imgElement.src = url;
        });
        return;
    }
    
    // ✅ Adiciona à fila
    FtxFotoQueue.push({ motoristaId, imgElement });
    processarFilaFotos();
}

function processarFilaFotos() {
    // ✅ Processa até o limite de concorrência
    while (FtxFotoCurrent < FTX_MAX_CONCURRENT && FtxFotoQueue.length > 0) {
        const { motoristaId, imgElement } = FtxFotoQueue.shift();
        FtxFotoCurrent++;
        
        // ✅ Cria Promise de carregamento
        const promise = fetch(`${FTX_FOTO_ENDPOINT}?id=${motoristaId}`)
            .then(res => res.json())
            .then(data => {
                const url = data ? `data:image/jpg;base64,${data}` : FTX_FOTO_PLACEHOLDER;
                FtxFotoCache.set(motoristaId, url);
                imgElement.src = url;
                return url;
            })
            .catch(() => {
                const url = FTX_FOTO_PLACEHOLDER;
                FtxFotoCache.set(motoristaId, url);
                imgElement.src = url;
                return url;
            })
            .finally(() => {
                FtxFotoCurrent--;
                FtxFotoInflight.delete(motoristaId);
                processarFilaFotos(); // Processa próximo da fila
            });
        
        FtxFotoInflight.set(motoristaId, promise);
    }
}
```

#### 3.3. Sistema de Filtros
**Problema**: Usuário precisa filtrar viagens por múltiplos critérios combinados

**Solução**: Syncfusion ComboBoxes que ao selecionar item, destroem tabela atual e recriam com parâmetros de query

**Código - Filtro por Veículo**:
```javascript
var veiculosCombo = new ej.dropdowns.ComboBox({
    dataSource: veiculosData,
    fields: { value: 'VeiculoId', text: 'Placa' },
    placeholder: 'Selecione um veículo',
    change: function(args) {
        if (args.value) {
            // ✅ Destrói tabela atual
            dtDestroySafe();
            
            // ✅ Recria tabela com filtro
            var opts = dtCommonOptions();
            opts.ajax = {
                url: "/api/viagem",
                data: { veiculoId: args.value },
                type: "GET",
                datatype: "json"
            };
            $('#tblViagem').DataTable(opts);
        }
    }
});
```

#### 3.4. Modal de Finalização
**Problema**: Usuário precisa finalizar viagem capturando KM final, combustível, ocorrências e validando dados

**Solução**: Modal Bootstrap complexo com múltiplas seções, validações e envio via POST

**Código - Abertura do Modal**:
```javascript
$(document).on("click", ".btn-finalizar", function () {
    var viagemId = $(this).data('id');
    
    // ✅ Busca dados da viagem
    $.ajax({
        url: `/api/viagem?viagemId=${viagemId}`,
        type: 'GET',
        success: function(response) {
            var viagem = response.data[0];
            
            // ✅ Preenche campos do modal
            $('#txtViagemId').val(viagem.viagemId);
            $('#txtKmFinal').val(viagem.kmInicial); // Inicia com KM inicial
            $('#txtDataFinal').val(formatarData(new Date()));
            $('#txtHoraFim').val(formatarHora(new Date()));
            
            // ✅ Abre modal
            $('#modalFinalizaViagem').modal('show');
        }
    });
});
```

**Código - Salvamento**:
```javascript
$("#btnFinalizarViagem").click(function (e) {
    e.preventDefault();
    
    var viagemId = $('#txtViagemId').val();
    var kmFinal = parseFloat($('#txtKmFinal').val());
    var dataFinal = $('#txtDataFinal').val();
    var horaFim = $('#txtHoraFim').val();
    var combustivelFinal = $('#cmbCombustivelFinal').val();
    
    // ✅ Validações básicas
    if (!kmFinal || kmFinal <= 0) {
        Alerta.Erro('Erro', 'Informe uma quilometragem válida');
        return;
    }
    
    // ✅ Desabilita botão e mostra loading
    $("#btnFinalizarViagem").prop('disabled', true);
    
    $.ajax({
        url: "/api/Viagem/FinalizaViagem",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            ViagemId: viagemId,
            KmFinal: kmFinal,
            DataFinal: dataFinal,
            HoraFim: horaFim,
            CombustivelFinal: combustivelFinal,
            Ocorrencias: coletarOcorrencias() // Coleta ocorrências do modal
        }),
        success: function(response) {
            $('#modalFinalizaViagem').modal('hide');
            ListaTodasViagens(); // Recarrega tabela
            Alerta.Sucesso('Sucesso', 'Viagem finalizada com sucesso');
        },
        error: function(error) {
            Alerta.Erro('Erro', 'Não foi possível finalizar a viagem');
        },
        complete: function() {
            $("#btnFinalizarViagem").prop('disabled', false);
        }
    });
});
```

---

### 4. Controllers/ViagemController.cs
**Função**: Endpoints API para operações com viagens

#### 4.1. GET `/api/viagem`
**Problema**: Frontend precisa de lista de viagens com filtros opcionais

**Solução**: Endpoint que aceita múltiplos parâmetros de query e aplica filtros condicionalmente

**Código**:
```csharp
[HttpGet]
public IActionResult Get(
    Guid? veiculoId,
    Guid? motoristaId,
    string statusId,
    string dataviagem,
    Guid? eventoId)
{
    try
    {
        var query = _unitOfWork.Viagem.GetAll();
        
        // ✅ Aplica filtros condicionalmente
        if (veiculoId.HasValue)
            query = query.Where(v => v.VeiculoId == veiculoId.Value);
        
        if (motoristaId.HasValue)
            query = query.Where(v => v.MotoristaId == motoristaId.Value);
        
        if (!string.IsNullOrEmpty(statusId))
            query = query.Where(v => v.Status == statusId);
        
        if (!string.IsNullOrEmpty(dataviagem))
        {
            var data = DateTime.ParseExact(dataviagem, "dd/MM/yyyy", null);
            query = query.Where(v => v.DataInicial.Date == data.Date);
        }
        
        if (eventoId.HasValue)
            query = query.Where(v => v.EventoId == eventoId.Value);
        
        var viagens = query.OrderByDescending(v => v.DataInicial).ToList();
        
        return Ok(new { data = viagens });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("ViagemController.cs", "Get", error);
        return StatusCode(500);
    }
}
```

#### 4.2. POST `/api/Viagem/FinalizaViagem`
**Problema**: Frontend precisa finalizar viagem atualizando status, calculando custos e processando ocorrências

**Solução**: Endpoint que valida dados, atualiza viagem, calcula custos e processa ocorrências

**Código**:
```csharp
[Route("FinalizaViagem")]
[Consumes("application/json")]
public async Task<IActionResult> FinalizaViagemAsync([FromBody] FinalizacaoViagem viagem)
{
    try
    {
        // ✅ VALIDAÇÃO: Data Final não pode ser superior à data atual
        if (viagem.DataFinal.HasValue && viagem.DataFinal.Value.Date > DateTime.Today)
        {
            return Json(new
            {
                success = false,
                message = "A Data Final não pode ser superior à data atual."
            });
        }
        
        // ✅ 1. BUSCA A VIAGEM NO BANCO
        var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
            v.ViagemId == viagem.ViagemId
        );
        
        if (objViagem == null)
        {
            return Json(new
            {
                success = false,
                message = "Viagem não encontrada"
            });
        }
        
        // ✅ 2. ATUALIZA OS DADOS BÁSICOS DA VIAGEM
        objViagem.DataFinal = viagem.DataFinal;
        objViagem.HoraFim = viagem.HoraFim;
        objViagem.KmFinal = viagem.KmFinal;
        objViagem.CombustivelFinal = viagem.CombustivelFinal;
        objViagem.Descricao = viagem.Descricao;
        objViagem.Status = "Realizada";
        
        // ✅ 3. REGISTRA USUÁRIO E DATA DE FINALIZAÇÃO
        ClaimsPrincipal currentUser = this.User;
        var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
        objViagem.UsuarioIdFinalizacao = currentUserID;
        objViagem.DataFinalizacao = DateTime.Now;
        
        // ✅ 4. SALVA OCORRÊNCIAS MÚLTIPLAS (SE HOUVER)
        int ocorrenciasCriadas = 0;
        if (viagem.Ocorrencias != null && viagem.Ocorrencias.Any())
        {
            foreach (var ocDto in viagem.Ocorrencias)
            {
                if (!string.IsNullOrWhiteSpace(ocDto.Resumo))
                {
                    var ocorrencia = new OcorrenciaViagem
                    {
                        OcorrenciaViagemId = Guid.NewGuid(),
                        ViagemId = objViagem.ViagemId,
                        VeiculoId = objViagem.VeiculoId ?? Guid.Empty,
                        MotoristaId = objViagem.MotoristaId,
                        Resumo = ocDto.Resumo ?? "",
                        DataOcorrencia = ocDto.DataOcorrencia ?? DateTime.Now
                    };
                    
                    _unitOfWork.OcorrenciaViagem.Add(ocorrencia);
                    ocorrenciasCriadas++;
                }
            }
        }
        
        // ✅ 5. ATUALIZA VIAGEM NO BANCO
        _unitOfWork.Viagem.Update(objViagem);
        _unitOfWork.Save();
        
        return Ok(new
        {
            success = true,
            message = "Viagem finalizada com sucesso",
            ocorrenciasCriadas = ocorrenciasCriadas
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("ViagemController.cs", "FinalizaViagem", error);
        return StatusCode(500);
    }
}
```

#### 4.3. POST `/api/Viagem/Cancelar`
**Problema**: Frontend precisa cancelar viagem aberta

**Solução**: Endpoint que atualiza status para "Cancelada" e registra motivo

**Código**:
```csharp
[Route("Cancelar")]
[HttpPost]
public IActionResult Cancelar(ViagemID id)
{
    try
    {
        var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
            v.ViagemId == id.ViagemId
        );
        
        if (objViagem != null)
        {
            // ✅ Atualiza status para Cancelada
            objViagem.Status = "Cancelada";
            objViagem.DataCancelamento = DateTime.Now;
            
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            objViagem.UsuarioIdCancelamento = currentUserID;
            
            _unitOfWork.Viagem.Update(objViagem);
            _unitOfWork.Save();
            
            return Json(new
            {
                success = true,
                message = "Viagem cancelada com sucesso"
            });
        }
        
        return Json(new
        {
            success = false,
            message = "Viagem não encontrada"
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("ViagemController.cs", "Cancelar", error);
        return StatusCode(500);
    }
}
```

#### 4.4. GET `/api/Viagem/FotoMotorista`
**Problema**: Frontend precisa exibir foto do motorista em Base64 para lazy loading

**Solução**: Endpoint que busca motorista e retorna foto em Base64 ou `false`

**Código**: Similar ao endpoint de Motorista (`PegaFotoModal`)

---

## Fluxo de Funcionamento

### Carregamento da Página
```
1. Página carrega (OnGet)
   ↓
2. Backend carrega listas para filtros usando helpers especializados
   ↓
3. Frontend inicializa Syncfusion ComboBoxes com dados
   ↓
4. Frontend inicializa DataTable chamando ListaTodasViagens()
   ↓
5. Requisição AJAX para /api/viagem (GET)
   ↓
6. Backend retorna todas as viagens (ou filtradas)
   ↓
7. DataTable renderiza dados com renderizadores customizados
   ↓
8. IntersectionObserver detecta imagens visíveis e inicia lazy loading
```

### Finalização de Viagem
```
1. Usuário clica no botão "Finalizar" na linha da viagem
   ↓
2. Modal Bootstrap abre
   ↓
3. Frontend busca dados da viagem via GET /api/viagem?viagemId=guid
   ↓
4. Preenche campos do modal (KM inicial, data/hora atual)
   ↓
5. Usuário preenche KM final, combustível, ocorrências (opcional)
   ↓
6. Clica em "Confirmar Finalização"
   ↓
7. Validações básicas no frontend
   ↓
8. Requisição POST para /api/Viagem/FinalizaViagem
   ↓
9. Backend valida dados (data não futura, etc.)
   ↓
10. Backend atualiza status para "Realizada"
   ↓
11. Backend processa ocorrências (se houver)
   ↓
12. Backend salva alterações
   ↓
13. Tabela recarrega automaticamente
```

### Lazy Loading de Fotos
```
1. DataTable renderiza linha com placeholder de imagem
   ↓
2. IntersectionObserver detecta quando imagem entra na viewport
   ↓
3. Verifica cache (se já carregou antes, usa cache)
   ↓
4. Verifica se já está sendo carregada (se sim, aguarda Promise)
   ↓
5. Adiciona à fila de carregamento
   ↓
6. Processa fila respeitando limite de concorrência (4 simultâneas)
   ↓
7. Requisição GET para /api/Viagem/FotoMotorista?id=guid
   ↓
8. Backend retorna foto em Base64 ou false
   ↓
9. Frontend atualiza src da imagem
   ↓
10. Salva no cache para reutilização
```

---

## Endpoints API Resumidos

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| GET | `/api/viagem` | Lista viagens (com filtros opcionais) | `veiculoId`, `motoristaId`, `statusId`, `dataviagem`, `eventoId` |
| POST | `/api/Viagem/FinalizaViagem` | Finaliza viagem | `{ViagemId, KmFinal, DataFinal, HoraFim, CombustivelFinal, Ocorrencias}` |
| POST | `/api/Viagem/Cancelar` | Cancela viagem | `{ViagemId}` |
| GET | `/api/Viagem/FotoMotorista?id=guid` | Retorna foto em Base64 | `id` (Guid) |
| GET | `/api/Viagem/PegarStatusViagem?viagemId=guid` | Retorna status atual | `viagemId` (Guid) |
| GET | `/api/Viagem/ObterCustosViagem?viagemId=guid` | Retorna custos detalhados | `viagemId` (Guid) |

---

## Troubleshooting

### Problema: Tabela não carrega
**Causa**: Erro no endpoint `/api/viagem` ou filtros inválidos  
**Solução**: 
- Verificar logs do servidor
- Verificar Network Tab para erros na requisição
- Verificar se parâmetros de query estão corretos

### Problema: Fotos não carregam (sempre placeholder)
**Causa**: Endpoint `/api/Viagem/FotoMotorista` retorna erro ou IntersectionObserver não está funcionando  
**Solução**: 
- Verificar se IntersectionObserver está suportado no navegador
- Verificar Network Tab para erros nas requisições de foto
- Verificar se cache está funcionando corretamente

### Problema: Modal de finalização não abre
**Causa**: Bootstrap modal não está funcionando ou dados da viagem não são encontrados  
**Solução**: 
- Verificar se Bootstrap está carregado
- Verificar se requisição GET para buscar viagem está funcionando
- Verificar console do navegador por erros JavaScript

### Problema: Finalização falha com erro de validação
**Causa**: Dados inválidos (data futura, KM inválido, etc.)  
**Solução**: 
- Verificar mensagem de erro retornada pelo backend
- Verificar se data final não é futura
- Verificar se KM final é maior que KM inicial

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
Documentação expandida de ~200 linhas para mais de 700 linhas.

**Status**: ✅ **Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
