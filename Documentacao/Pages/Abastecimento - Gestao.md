# Documentação: Gestão de Abastecimento

> **Última Atualização**: 06/01/2025
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades](#funcionalidades)
4. [Filtros](#filtros)
5. [Endpoints API](#endpoints-api)
6. [Modal de Edição de KM](#modal-de-edição-de-km)
7. [Exportação de Dados](#exportação-de-dados)
8. [Estrutura da Interface](#estrutura-da-interface)
9. [JavaScript e Interações](#javascript-e-interações)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A funcionalidade **Gestão de Abastecimento** é responsável por:

- **Listar** todos os abastecimentos realizados na frota
- **Filtrar** abastecimentos por: Data, Veículo, Combustível, Unidade e Motorista
- **Editar** a quilometragem (KM Rodado) de cada abastecimento via modal
- **Exportar** dados em Excel e PDF
- **Importar** abastecimentos via arquivo Excel (funcionalidade separada em `/Abastecimento/Importacao`)

### Informações Exibidas por Abastecimento

Cada registro na tabela exibe as seguintes informações:

| Campo | Descrição | Tipo |
|-------|-----------|------|
| **Data** | Data do abastecimento (formato DD/MM/YYYY) | String |
| **Hora** | Hora do abastecimento | String |
| **Placa** | Placa do veículo | String |
| **Veículo** | Tipo/Descrição do veículo | String |
| **Motorista** | Nome do motorista condutor | String |
| **Combustível** | Tipo de combustível (Gasolina, Diesel, etc) | String |
| **Unidade** | Unidade gerenciadora do abastecimento | String |
| **Valor Unitário (R$)** | Preço por litro | Decimal |
| **Valor Total (R$)** | Preço total do abastecimento | Decimal |
| **Litros** | Quantidade de combustível abastecido | Decimal |
| **Kms** | Quilometragem rodada (KM Rodado - editável) | Integer |
| **Consumo** | Consumo calculado (KM / Litros) | Decimal |
| **Média** | Consumo médio geral do veículo | Decimal |
| **Ação** | Botão para editar quilometragem | Button |

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Abastecimento/
│       └── Index.cshtml
├── Controllers/
│   ├── AbastecimentoController.cs (Principal)
│   ├── AbastecimentoController.Import.cs
│   ├── AbastecimentoController.Pendencias.cs
│   └── AbastecimentoController.DashboardAPI.cs
└── wwwroot/
    ├── css/
    │   └── frotix.css (Estilos globais)
    └── js/
        └── (Inline scripts na página)
```

### Padrão Arquitetônico

A funcionalidade segue o padrão **MVC com API REST**:

1. **View (Razor Pages)**: `Pages/Abastecimento/Index.cshtml` - Interface HTML com DataTable
2. **Controller**: `Controllers/AbastecimentoController.cs` - Endpoints API REST
3. **Repository Pattern**: `IUnitOfWork` - Acesso aos dados via UoW
4. **JavaScript**: Scripts inline para interação com DataTable e Syncfusion ComboBox

---

## Funcionalidades

### 1. Listagem de Abastecimentos

**Localização**: Tabela principal na página `/Abastecimento/Index`

**Características**:
- Exibição em DataTable (jQuery DataTable)
- Paginação (10, 25, 50 ou todos os registros)
- Ordenação por qualquer coluna
- Responsividade
- Idioma em Português (BR)

**Função JavaScript**: `ListaTodosAbastecimentos()`
```javascript
// Inicializa DataTable com todos os abastecimentos
function ListaTodosAbastecimentos() {
    // Destrói DataTable anterior
    if ($.fn.DataTable.isDataTable('#tblAbastecimentos')) {
        $('#tblAbastecimentos').DataTable().clear().destroy();
    }

    // Cria novo DataTable
    var dataTableAbastecimentos = $('#tblAbastecimentos').DataTable({
        dom: 'Bfrtip',
        buttons: ['pageLength', 'excel', 'pdf'],
        ajax: { url: "/api/abastecimento", type: "GET" },
        columns: [
            // 14 colunas mapeadas para dados
        ]
    });
}
```

**Quando é chamada**:
- Ao carregar a página (document.ready)
- Ao limpar todos os filtros
- Ao desabilitar um filtro sem deixar valor selecionado

---

### 2. Sistema de Filtros

A página possui um **Card de Filtros** com 5 filtros principais:

#### a) Filtro por Data

**Campo**: `#txtData` (Input HTML5 type="date")

**Funcionamento**:
- Utiliza input nativo HTML5
- Formato: `YYYY-MM-DD` internamente, `DD/MM/YYYY` na exibição
- Ao selecionar, chama `DefineEscolhaData()` e depois `txtData.change()`

**Lógica**:
```javascript
$("#txtData").change(function () {
    const partes = $('#txtData').val().split("-");
    const [year, month, day] = partes;
    const dataAbastecimento = `${day}/${month}/${year}`;

    // Destroi DataTable anterior
    dtDestroySafe();

    // Cria nova DataTable com filtro
    var opts = dtCommonOptions();
    opts.ajax = {
        url: "/api/abastecimento/AbastecimentoData",
        data: { dataAbastecimento: dataAbastecimento },
        type: "GET"
    };

    $('#tblAbastecimentos').DataTable(opts);
});
```

#### b) Filtro por Veículo

**Campo**: `#lstVeiculos` (Syncfusion ComboBox)

**Características**:
- ComboBox com busca integrada (Contains)
- Permite filtrar em tempo real
- Botão para limpar seleção
- Altura padronizada: 38px

**Evento de Mudança**: `VeiculosValueChange()`
- Verifica flag `escolhendoVeiculo`
- Se valor for nulo, lista todos
- Caso contrário, filtra por `VeiculoId`

#### c) Filtro por Combustível

**Campo**: `#lstCombustivel` (Syncfusion ComboBox)

**Características**:
- Mesmo padrão do filtro de Veículo
- Carrega combustíveis cadastrados
- Busca e limpeza habilitadas

**Evento de Mudança**: `CombustivelValueChange()`

#### d) Filtro por Unidade

**Campo**: `#lstUnidade` (Syncfusion ComboBox)

**Características**:
- ComboBox filtrado por Unidade
- Ordenação alfabética
- Integração com View `ViewAbastecimentos`

**Evento de Mudança**: `UnidadeValueChange()`

#### e) Filtro por Motorista

**Campo**: `#lstMotorista` (Syncfusion ComboBox)

**Características**:
- Lista todos os motoristas cadastrados
- Busca por nome
- Ordenação alfabética

**Evento de Mudança**: `MotoristaValueChange()`

### Comportamento dos Filtros

**Importante**: Apenas **UM filtro pode estar ativo por vez**.

Quando um filtro é selecionado:
1. Sua flag é setada para `true` (ex: `escolhendoVeiculo = true`)
2. As demais flags são setadas para `false`
3. Os outros ComboBox são resetados
4. O campo de Data é limpo
5. A DataTable é recarregada com novos dados

**Exemplo de Reset de Filtros**:
```javascript
function VeiculosValueChange() {
    // Reset de outros filtros
    $("#txtData").val('');
    var combustivel = document.getElementById('lstCombustivel').ej2_instances[0];
    combustivel.value = "";
    var unidades = document.getElementById('lstUnidade').ej2_instances[0];
    unidades.value = "";
    var motoristas = document.getElementById('lstMotorista').ej2_instances[0];
    motoristas.value = "";

    // Recarrega tabela com novo filtro
    var veiculoId = veiculos.value.toString();
    // ... carrega dados filtrados
}
```

---

## Endpoints API

### 1. GET `/api/abastecimento`

**Descrição**: Retorna todos os abastecimentos ordenados por data (mais recente primeiro)

**Método**: `AbastecimentoController.Get()`

**Resposta (200 OK)**:
```json
{
    "data": [
        {
            "abastecimentoId": "uuid",
            "data": "06/01/2025",
            "hora": "14:30",
            "placa": "ABC-1234",
            "tipoVeiculo": "Van",
            "motoristaCondutor": "João Silva",
            "tipoCombustivel": "Gasolina",
            "sigla": "SP",
            "valorUnitario": 5.50,
            "valorTotal": 110.00,
            "litros": 20.00,
            "kmRodado": 150,
            "consumo": 7.50,
            "consumoGeral": 8.20
        }
    ]
}
```

**Erro (500)**:
- Retorna status 500 com logging via `Alerta.TratamentoErroComLinha()`

---

### 2. GET `/api/abastecimento/AbastecimentoVeiculos`

**Descrição**: Retorna abastecimentos filtrados por Veículo ID

**Parâmetros de Query**:
- `id` (Guid): ID do veículo

**Método**: `AbastecimentoController.AbastecimentoVeiculos(Guid Id)`

**Resposta**: Mesmo formato do endpoint anterior, mas filtrado

**Filtro Aplicado**:
```csharp
var dados = _unitOfWork.ViewAbastecimentos.GetAll()
    .Where(va => va.VeiculoId == Id)
    .OrderByDescending(va => va.DataHora)
    .ToList();
```

---

### 3. GET `/api/abastecimento/AbastecimentoCombustivel`

**Descrição**: Retorna abastecimentos filtrados por Combustível ID

**Parâmetros de Query**:
- `id` (Guid): ID do combustível

**Método**: `AbastecimentoController.AbastecimentoCombustivel(Guid Id)`

**Filtro Aplicado**:
```csharp
var dados = _unitOfWork.ViewAbastecimentos.GetAll()
    .Where(va => va.CombustivelId == Id)
    .OrderByDescending(va => va.DataHora)
    .ToList();
```

---

### 4. GET `/api/abastecimento/AbastecimentoUnidade`

**Descrição**: Retorna abastecimentos filtrados por Unidade ID

**Parâmetros de Query**:
- `id` (Guid): ID da unidade

**Método**: `AbastecimentoController.AbastecimentoUnidade(Guid Id)`

**Filtro Aplicado**:
```csharp
var dados = _unitOfWork.ViewAbastecimentos.GetAll()
    .Where(va => va.UnidadeId == Id)
    .OrderByDescending(va => va.DataHora)
    .ToList();
```

---

### 5. GET `/api/abastecimento/AbastecimentoMotorista`

**Descrição**: Retorna abastecimentos filtrados por Motorista ID

**Parâmetros de Query**:
- `id` (Guid): ID do motorista

**Método**: `AbastecimentoController.AbastecimentoMotorista(Guid Id)`

**Filtro Aplicado**:
```csharp
var dados = _unitOfWork.ViewAbastecimentos.GetAll()
    .Where(va => va.MotoristaId == Id)
    .OrderByDescending(va => va.DataHora)
    .ToList();
```

---

### 6. GET `/api/abastecimento/AbastecimentoData`

**Descrição**: Retorna abastecimentos filtrados por data específica

**Parâmetros de Query**:
- `dataAbastecimento` (string): Data no formato DD/MM/YYYY

**Método**: `AbastecimentoController.AbastecimentoData(string dataAbastecimento)`

**Filtro Aplicado**:
```csharp
var dados = _unitOfWork.ViewAbastecimentos.GetAll()
    .Where(va => va.Data == dataAbastecimento)
    .OrderByDescending(va => va.DataHora)
    .ToList();
```

**Nota**: A comparação é por string, não por DateTime. O campo `Data` na View é armazenado como string no formato DD/MM/YYYY.

---

### 7. POST `/api/Abastecimento/EditaKm`

**Descrição**: Atualiza a quilometragem de um abastecimento

**Parâmetros (Body JSON)**:
```json
{
    "abastecimentoId": "uuid",
    "kmRodado": 150
}
```

**Método**: `AbastecimentoController.EditaKm([FromBody] Abastecimento abastecimento)`

**Resposta (200 OK)**:
```json
{
    "success": true,
    "message": "Abastecimento atualizado com sucesso",
    "type": 0
}
```

**Processo**:
1. Busca abastecimento por ID
2. Atualiza propriedade `KmRodado`
3. Persiste no banco de dados
4. Retorna sucesso

**Erro**: Retorna status 500 com logging

---

### 8. GET `/api/abastecimento/VeiculoList`

**Descrição**: Retorna lista de veículos para o ComboBox de filtro

**Método**: `AbastecimentoController.VeiculoList()`

**Resposta (200 OK)**:
```json
{
    "data": [
        {
            "veiculoId": "uuid",
            "placaMarcaModelo": "ABC-1234 - Ford/Ranger"
        }
    ]
}
```

---

### 9. GET `/api/abastecimento/CombustivelList`

**Descrição**: Retorna lista de combustíveis para o ComboBox

**Método**: `AbastecimentoController.CombustivelList()`

**Resposta (200 OK)**:
```json
{
    "data": [
        {
            "id": "uuid",
            "descricao": "Gasolina"
        }
    ]
}
```

---

### 10. GET `/api/abastecimento/UnidadeList`

**Descrição**: Retorna lista de unidades para o ComboBox

**Método**: `AbastecimentoController.UnidadeList()`

---

### 11. GET `/api/abastecimento/MotoristaList`

**Descrição**: Retorna lista de motoristas para o ComboBox

**Método**: `AbastecimentoController.MotoristaList()`

---

## Modal de Edição de KM

### Características Visuais

- **ID**: `#modalEditaKm`
- **Classe Bootstrap**: `modal fade`
- **Tamanho**: `modal-lg`
- **Header**: Cor azul padrão FrotiX (`modal-header-azul`)

### Estrutura HTML

```html
<div class="modal fade" id="modalEditaKm" tabindex="-1" aria-labelledby="lblModalEditaKm" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header modal-header-azul">
                <h5 class="modal-title" id="lblModalEditaKm">
                    <i class="fa-duotone fa-gauge-high me-2"></i>
                    Edita a Quilometragem do Abastecimento
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="frmQuilometragem">
                    <input type="hidden" id="txtId" />
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label class="form-label fw-bold">
                                    <i class="fa-duotone fa-road text-primary me-1"></i>
                                    Quilometragem
                                </label>
                                <input id="txtKm" class="form-control" type="number"
                                       placeholder="Digite a quilometragem" />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button id="btnEditaKm" class="btn btn-azul" type="button">
                    <span class="btn-text">
                        <i class="fa-duotone fa-check me-1"></i> Confirmar Alteração
                    </span>
                    <span class="btn-loading d-none">
                        <i class="fa-duotone fa-spinner-third fa-spin me-1"></i> Aguarde...
                    </span>
                </button>
                <button type="button" class="btn btn-vinho" data-bs-dismiss="modal">
                    <i class="fa-duotone fa-circle-xmark icon-pulse"></i> Fechar
                </button>
            </div>
        </div>
    </div>
</div>
```

### Fluxo de Abertura do Modal

1. **Clique no botão de ação**: Usuário clica no ícone de editar na tabela
2. **Evento `shown.bs.modal`**: Modal é exibido
   ```javascript
   $('#modalEditaKm').on('shown.bs.modal', function (event) {
       var button = $(event.relatedTarget);
       var abastecimentoId = button.data("id");
       $('#txtId').val(abastecimentoId);

       // Busca dados na DataTable
       var dt = $('#tblAbastecimentos').DataTable();
       dt.rows().every(function() {
           var rowData = this.data();
           if (String(rowData.abastecimentoId) === String(abastecimentoId)) {
               $('#txtKm').val(rowData.kmRodado || '');
               return false; // break
           }
       });
   });
   ```

3. **Campo é preenchido**: O valor de `kmRodado` é carregado da DataTable

### Fluxo de Submissão

1. **Validação**: Verifica se `kmRodado` está preenchido
   ```javascript
   if (KmRodado === '') {
       // Exibe erro
       return;
   }
   ```

2. **Loading**: Ativa spinner no botão
   ```javascript
   $("#btnEditaKm").prop('disabled', true);
   $("#btnEditaKm .btn-text").addClass('d-none');
   $("#btnEditaKm .btn-loading").removeClass('d-none');
   ```

3. **AJAX Request**: Envia dados para a API
   ```javascript
   $.ajax({
       type: "post",
       url: "/api/Abastecimento/EditaKm",
       contentType: "application/json; charset=utf-8",
       dataType: "json",
       data: JSON.stringify({
           "AbastecimentoId": $('#txtId').val(),
           "KmRodado": KmRodado
       }),
       success: function (data) {
           AppToast.show('Verde', data.message);
           $('#tblAbastecimentos').DataTable().ajax.reload(null, false);
           $('#modalEditaKm').modal('hide');
       },
       error: function (data) {
           AppToast.show('Vermelho', 'Erro ao salvar a quilometragem.');
       },
       complete: function () {
           // Desativa loading
           $("#btnEditaKm").prop('disabled', false);
           $("#btnEditaKm .btn-text").removeClass('d-none');
           $("#btnEditaKm .btn-loading").addClass('d-none');
       }
   });
   ```

4. **Atualização da Tabela**: DataTable é recarregada via AJAX
5. **Fechamento**: Modal é fechado automaticamente

### Fluxo de Fechamento do Modal

```javascript
.on("hide.bs.modal", function () {
    $('#txtKm').attr('value', '');
    $("#btnEditaKm").prop('disabled', false);
    $("#btnEditaKm .btn-text").removeClass('d-none');
    $("#btnEditaKm .btn-loading").addClass('d-none');
});
```

---

## Exportação de Dados

### Formatos Suportados

A DataTable oferece **2 formatos** de exportação:

1. **Excel**: Exporta tabela completa em `.xlsx`
2. **PDF**: Exporta tabela em formato paisagem (`landscape`) com tamanho `LEGAL`

### Implementação

Os botões de exportação são gerados automaticamente pelo DataTable via configuração:

```javascript
buttons: [
    'pageLength',
    'excel',
    {
        extend: 'pdfHtml5',
        orientation: 'landscape',
        pageSize: 'LEGAL'
    }
]
```

**Localização**: Dom `Bfrtip`
- `B`: Buttons
- `f`: Filter
- `r`: Processing
- `t`: Table
- `i`: Info
- `p`: Pagination

### Funcionalidade

- Os botões aparecem **acima da tabela**
- Exportam os dados **visíveis na página** (respeitam filtros)
- Excel inclui todas as 14 colunas
- PDF é otimizado para paisagem due ao número de colunas

---

## Estrutura da Interface

### Card de Filtros

**Container**: `.ftx-inner-card`

**Características CSS**:
- Fundo branco com borda sutil cinza
- Box-shadow suave `0 2px 8px rgba(0, 0, 0, 0.06)`
- Border-radius: 10px
- Padding interno padronizado

**Header do Card**:
- Classe: `.ftx-inner-card-header`
- Fundo degradado (azul claro)
- Ícone de filtro com cores FrotiX

**Body do Card**:
- Classe: `.ftx-inner-card-body`
- Grid responsivo: `row g-3`
- Colunas: 12 (mobile), 6 (tablet), 3 (desktop)

### Componentes Syncfusion

Todos os ComboBox utilizam a padronização FrotiX:

**CSS para Syncfusion**:
```css
.e-ddl.e-input-group,
.e-ddl.e-input-group.e-control-wrapper {
    height: 38px !important;
    border: none !important;
    box-shadow: 0 0 0 1px #ced4da !important;
    border-radius: 0.375rem !important;
    background-color: #fff !important;
}

/* Focus state */
.e-ddl.e-input-group:focus-within {
    box-shadow: 0 0 0 1px #3D5771, 0 0 0 0.25rem rgba(61, 87, 113, 0.25) !important;
}
```

**Por que `box-shadow` em vez de `border`**: Syncfusion remove bordas parciais via CSS interno, então `box-shadow` garante bordas em todos os lados.

### Botão de Ação KM

**Localização**: Última coluna da tabela (`Ação`)

**Características**:
- **Tamanho**: 28px x 28px
- **Cor**: Azul escuro (#3D5771)
- **Ícone**: `fa-duotone fa-pen-to-square` (caneta)
- **Hover**: Animação "wiggle" + glow azul aumentado

**CSS da Animação**:
```css
@@keyframes buttonWiggle {
    0% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-2px) rotate(-1deg); }
    50% { transform: translateY(-3px) rotate(0deg); }
    75% { transform: translateY(-2px) rotate(1deg); }
    100% { transform: translateY(0) rotate(0deg); }
}

.btn-acao-km:hover {
    transform: translateY(-2px);
    animation: buttonWiggle 0.5s ease-in-out !important;
    background-color: #2d4559 !important;
    box-shadow: 0 0 20px rgba(61, 87, 113, 0.8), 0 6px 12px rgba(61, 87, 113, 0.5) !important;
}
```

---

## JavaScript e Interações

### Variáveis Globais

```javascript
var escolhendoVeiculo = false;
var escolhendoUnidade = false;
var escolhendoMotorista = false;
var escolhendoCombustivel = false;
var escolhendoData = false;
```

Estas flags controlam **qual filtro está ativo no momento**, garantindo que apenas um funcione por vez.

### Funções Principais

#### `ListaTodosAbastecimentos()`

Inicializa a DataTable com todos os registros. Chamada:
- Na primeira carga (`document.ready`)
- Ao limpar um filtro

#### `DefineEscolhaVeiculo()`, `DefineEscolhaUnidade()`, etc.

Funções de **gate** que:
1. Resetam todas as flags para false
2. Setam a sua própria flag para true
3. Checam se há valor selecionado
4. Se nulo, chamam `ListaTodosAbastecimentos()`

#### `dtDestroySafe()`

Destrói a DataTable de forma segura:
```javascript
function dtDestroySafe() {
    if ($.fn.DataTable.isDataTable('#tblAbastecimentos')) {
        $('#tblAbastecimentos').DataTable().clear().destroy();
    }
    $('#tblAbastecimentos tbody').empty();
}
```

#### `dtCommonOptions()`

Retorna objeto com configurações padrão de DataTable reutilizáveis:
- DOM, paginação, botões
- Definições de colunas
- Textos em português
- Configuração de responsividade

**Padrão de Uso**:
```javascript
var opts = dtCommonOptions();
opts.ajax = { url: "/api/abastecimento/...", ... };
opts.columns = [ ... ];
$('#tblAbastecimentos').DataTable(opts);
```

#### `renderBotaoAcao(abastecimentoId)`

Função auxiliar que **renderiza o botão de editar KM**:
```javascript
function renderBotaoAcao(abastecimentoId) {
    return `<div class="text-center">
        <a class="btn text-white btn-acao-km"
           data-bs-toggle="modal" data-bs-target="#modalEditaKm"
           style="..."
           data-id='${abastecimentoId}'>
            <i class="fad fa-pen-to-square"></i>
        </a>
    </div>`;
}
```

Retorna HTML que é inserido na coluna "Ação" pela DataTable.

### Ciclo de Vida da Página

```
1. document.ready
   ├── ListaTodosAbastecimentos()
   ├── Bind events nos filtros:
   │   ├── #txtData.change
   │   ├── #lstVeiculos.close (evento Syncfusion)
   │   ├── #lstCombustivel.close
   │   ├── #lstUnidade.close
   │   └── #lstMotorista.close
   │
2. Interação do Usuário
   ├── Seleciona filtro
   ├── Função DefineEscolha...() é disparada
   ├── dtDestroySafe() destroi tabela antiga
   ├── dtCommonOptions() cria config
   ├── DataTable(opts) cria nova tabela com novos dados
   │
3. Usuário clica em botão de editar
   ├── Modal #modalEditaKm é aberto
   ├── Evento shown.bs.modal é disparado
   ├── Dados são carregados na tabela
   │
4. Usuário confirma alteração
   ├── #btnEditaKm.click() é disparado
   ├── AJAX POST para /api/Abastecimento/EditaKm
   ├── DataTable().ajax.reload() atualiza dados
   ├── Modal é fechado
```

### Tratamento de Erros

Todas as funções implementam **try-catch** com chamada para:

```javascript
Alerta.TratamentoErroComLinha("Index.cshtml", "nomeFuncao", error);
```

Este sistema de logging é padrão FrotiX e registra:
- Nome do arquivo
- Nome da função
- Objeto erro completo

---

## Troubleshooting

### Problema: DataTable não carrega dados

**Possíveis Causas**:
1. Endpoint API retorna erro (verificar console)
2. CORS não configurado (verificar Network)
3. Dados malformados JSON

**Solução**:
```javascript
// Adicionar console.log no AJAX da DataTable
ajax: {
    url: "/api/abastecimento",
    type: "GET",
    error: function(xhr, error, thrown) {
        console.error("AJAX Error:", error, xhr.status);
        Alerta.TratamentoErroComLinha("Index.cshtml", "AJAX Error", new Error(thrown));
    }
}
```

---

### Problema: ComboBox Syncfusion sem bordas superior/inferior

**Causa**: CSS interno do Syncfusion remove bordas parciais

**Solução**: Usar `box-shadow` em vez de `border` (já implementado):
```css
.e-ddl.e-input-group {
    box-shadow: 0 0 0 1px #ced4da !important;
    border: none !important;
}
```

---

### Problema: Modal não limpa após fechar

**Causa**: Valores não são resetados no evento `hide.bs.modal`

**Solução**: Evento já implementado:
```javascript
.on("hide.bs.modal", function () {
    $('#txtKm').attr('value', '');
    $("#btnEditaKm").prop('disabled', false);
    // ... reset de estados
});
```

---

### Problema: Filtros interferem uns nos outros

**Causa**: Flags de escolha não estão sendo resetadas corretamente

**Solução**: Verificar função `DefineEscolha...()`:
```javascript
function DefineEscolhaVeiculo() {
    escolhendoVeiculo = true;
    escolhendoUnidade = false;
    escolhendoMotorista = false;
    escolhendoCombustivel = false;
    escolhendoData = false;
}
```

---

### Problema: Abastecimentos não aparecem após editar KM

**Causa**: DataTable não está recarregando dados

**Solução**: Verificar chamada no success do AJAX:
```javascript
success: function (data) {
    // Recarrega DataTable (não destroi, apenas recarrega)
    $('#tblAbastecimentos').DataTable().ajax.reload(null, false);
}
```

O parâmetro `false` indica para **NÃO resetar para primeira página**.

---

### Problema: Toast/Notificação não aparece

**Causa**: `AppToast.show()` não está definido

**Solução**: Verificar se biblioteca global está carregada em `_Layout.cshtml`:
```html
<script src="~/js/app-toast.js"></script>
```

Uso correto:
```javascript
AppToast.show('Verde', 'Mensagem de sucesso');
AppToast.show('Vermelho', 'Mensagem de erro');
```

---

### Problema: Spinner de loading fica travado no botão

**Causa**: Exceção no success/error não é capturada, complete não executa

**Solução**: Adicionar try-catch em todos os callbacks:
```javascript
success: function (data) {
    try {
        AppToast.show('Verde', data.message);
        $('#tblAbastecimentos').DataTable().ajax.reload(null, false);
        $('#modalEditaKm').modal('hide');
    } catch (error) {
        Alerta.TratamentoErroComLinha("Index.cshtml", "btnEditaKm.success", error);
    }
}
```

---

<br><br><br>

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)
> **PADRÃO**: `## [Data/Hora] - Título da Modificação`

---

## [06/01/2025] - Criação da Documentação Inicial

**Descrição**:
Documentação inicial da funcionalidade de Gestão de Abastecimento criada para padronização e referência futura. Inclui:

- Visão geral completa da funcionalidade
- Arquitetura (estrutura de arquivos e padrões)
- 11 endpoints API documentados
- Sistema de filtros (5 tipos)
- Modal de edição de quilometragem
- Exportação em Excel/PDF
- Estrutura da interface (CSS e componentes)
- JavaScript e interações (ciclo de vida, funções principais)
- Seção de troubleshooting com 7 problemas comuns
- Exemplos de código para cada feature

**Arquivos Afetados**:
- `Documentacao/Funcionalidade - Abastecimento - Gestao.md` (CRIADO)

**Status**: ✅ **Documentado**

---

**Fim do LOG**

---

**Última atualização deste arquivo**: 06/01/2025
**Responsável pela documentação**: Claude (AI Assistant)
**Versão do documento**: 1.0
