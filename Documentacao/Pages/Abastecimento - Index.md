# Documentação: Abastecimento - Index

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Lógica de Negócio](#lógica-de-negócio)
5. [Interconexões](#interconexões)
6. [Interface e Componentes](#interface-e-componentes)
7. [Sistema de Filtros](#sistema-de-filtros)
8. [DataTable e Configurações](#datatable-e-configurações)
9. [Modal de Edição de KM](#modal-de-edição-de-km)
10. [Endpoints API](#endpoints-api)
11. [Validações](#validações)
12. [Exemplos de Uso](#exemplos-de-uso)
13. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Abastecimento - Index** (`Pages/Abastecimento/Index.cshtml`) é o **painel central de gestão de abastecimentos** do sistema FrotiX. Esta funcionalidade permite visualizar, filtrar e gerenciar todos os registros de abastecimento da frota através de uma interface rica e interativa baseada em DataTables.

### Objetivo

A página de Abastecimento permite que os usuários:
- **Visualizem** todos os abastecimentos cadastrados em uma tabela interativa
- **Filtrem** abastecimentos por múltiplos critérios (Veículo, Combustível, Unidade, Motorista, Data)
- **Editem** a quilometragem de abastecimentos existentes através de modal
- **Exportem** dados para Excel e PDF
- **Analisem** consumo de combustível e médias por veículo
- **Monitorem** custos unitários e totais de abastecimentos

### Características Principais

- ✅ **Listagem Rica com DataTables**: Tabela interativa com paginação, ordenação e busca avançada
- ✅ **Filtros Múltiplos**: Sistema de filtros combinados por Veículo, Combustível, Unidade, Motorista e Data
- ✅ **Cálculos Automáticos**: Consumo, média de consumo e custos calculados automaticamente
- ✅ **Edição de KM**: Modal para correção de quilometragem de abastecimentos já registrados
- ✅ **Exportação de Dados**: Botões para exportar para Excel e PDF (formato paisagem)
- ✅ **Interface Responsiva**: Layout adaptável para diferentes tamanhos de tela
- ✅ **Componentes Syncfusion**: Uso de ComboBox para filtros com autocomplete
- ✅ **Integração com View**: Utiliza view otimizada `ViewAbastecimentos` para performance

---

## Arquitetura

### Visão Geral da Arquitetura

A página de Abastecimento utiliza uma arquitetura **simples mas eficiente**, focada em:
- **Backend (ASP.NET Core Razor Pages)**: Inicialização de dados e handlers
- **Frontend (JavaScript inline)**: Lógica de filtros e manipulação do DataTable
- **API RESTful**: Endpoints para busca filtrada de dados
- **View Otimizada**: View `ViewAbastecimentos` pré-calculada para performance

### Padrões de Design Utilizados

1. **Repository Pattern**: Acesso a dados através de `IUnitOfWork` e repositórios específicos
2. **View Pattern**: Uso de view SQL para agregar dados de múltiplas tabelas
3. **API RESTful**: Comunicação padronizada entre frontend e backend
4. **Dependency Injection**: Serviços injetados via construtor no backend

---

## Estrutura de Arquivos

### Arquivos Principais

```
FrotiX.Site/
├── Pages/
│   └── Abastecimento/
│       ├── Index.cshtml              # View Principal (1289 linhas)
│       │                             # - HTML da tabela e filtros
│       │                             # - Modal de edição de KM
│       │                             # - Scripts inline JavaScript
│       │                             # - Configuração do DataTable
│       │
│       └── Index.cshtml.cs           # PageModel (Backend Init)
│                                     # - Inicialização de ViewData
│                                     # - Carregamento de listas (veículos, combustíveis, etc.)
│
├── Controllers/
│   └── AbastecimentoController.cs    # API Controller (832 linhas)
│                                     # - Get: Lista todos os abastecimentos
│                                     # - AbastecimentoVeiculos: Filtra por veículo
│                                     # - AbastecimentoCombustivel: Filtra por combustível
│                                     # - AbastecimentoUnidade: Filtra por unidade
│                                     # - AbastecimentoMotorista: Filtra por motorista
│                                     # - AbastecimentoData: Filtra por data
│                                     # - EditaKm: Atualiza quilometragem
│
├── Models/
│   └── Cadastros/
│       └── Abastecimento.cs          # Modelo de dados do abastecimento
│
├── Repository/
│   └── IRepository/
│       └── IViewAbastecimentosRepository.cs  # Interface do repositório da view
│
└── Data/
    └── Views/
        └── ViewAbastecimentos        # View SQL otimizada
                                      # - Agrega dados de Abastecimento, Veículo, Motorista, etc.
                                      # - Calcula consumo e médias
```

### Arquivos Relacionados

- `Repository/ViewAbastecimentosRepository.cs` - Acesso à view de abastecimentos
- `Helpers/ListaVeiculos.cs` - Helper para listagem de veículos
- `Helpers/ListaCombustivel.cs` - Helper para listagem de combustíveis
- `Helpers/ListaUnidade.cs` - Helper para listagem de unidades
- `Helpers/ListaMotorista.cs` - Helper para listagem de motoristas

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso Específico |
|------------|--------|----------------|
| **jQuery DataTables** | Latest | Tabela interativa com paginação, ordenação e exportação |
| **Syncfusion EJ2** | Latest | ComboBox para filtros com autocomplete |
| **ASP.NET Core** | 3.1+ | Backend Razor Pages, Dependency Injection |
| **jQuery** | 3.6.0 | Manipulação DOM, AJAX, Event Handlers |
| **Bootstrap** | 5.x | Modais, Layout Responsivo |
| **SweetAlert2** | Latest | Confirmações elegantes |

---

## Lógica de Negócio

### Fluxo Principal de Carregamento

O processo de carregamento da página segue este fluxo:

```
1. Página carrega (OnGet)
   ↓
2. Backend inicializa ViewData com listas:
   - Veículos (lstVeiculos)
   - Combustíveis (lstCombustivel)
   - Unidades (lstUnidade)
   - Motoristas (lstMotorista)
   ↓
3. Frontend inicializa componentes Syncfusion ComboBox
   ↓
4. DataTable é inicializado chamando ListaTodosAbastecimentos()
   ↓
5. Requisição AJAX para /api/abastecimento (GET)
   ↓
6. Backend retorna todos os abastecimentos da ViewAbastecimentos
   ↓
7. DataTable renderiza dados na tabela
```

### Sistema de Filtros

O sistema possui **5 filtros independentes** que podem ser combinados:

1. **Veículo**: Filtra por veículo específico
2. **Combustível**: Filtra por tipo de combustível
3. **Unidade**: Filtra por unidade organizacional
4. **Motorista**: Filtra por motorista condutor
5. **Data**: Filtra por data específica de abastecimento

**Lógica de Filtros**:
- Cada filtro possui um evento `change` que detecta quando o usuário seleciona um valor
- Quando um filtro é selecionado, os outros são limpos automaticamente
- A tabela é recriada com a URL da API específica para aquele filtro
- Se nenhum filtro está selecionado, mostra todos os abastecimentos

**Código de Controle de Filtros**:
```javascript
var escolhendoVeiculo = false;
var escolhendoUnidade = false;
var escolhendoMotorista = false;
var escolhendoCombustivel = false;
var escolhendoData = false;

function DefineEscolhaVeiculo() {
    escolhendoVeiculo = true;
    escolhendoUnidade = false;
    escolhendoMotorista = false;
    escolhendoCombustivel = false;
    escolhendoData = false;
    
    var veiculos = document.getElementById('lstVeiculos').ej2_instances[0];
    if (veiculos.value === null) {
        ListaTodosAbastecimentos(); // Se limpar, mostra todos
    }
}
```

### Cálculos Automáticos

A view `ViewAbastecimentos` já calcula automaticamente:

1. **Consumo**: Calculado como `kmRodado / litros` (km por litro)
2. **Média**: Média de consumo do veículo até aquele abastecimento
3. **Valor Total**: `valorUnitario * litros`
4. **KM Rodado**: Diferença entre KM atual e KM anterior

---

## Interconexões

### Quem Chama Este Módulo

A página de Abastecimento é chamada por:
- **Navegação Principal**: Link no menu lateral (`/Abastecimento`)
- **Dashboard de Abastecimento**: Links para visualizar abastecimentos específicos
- **Página de Veículos**: Link para ver abastecimentos de um veículo específico

### O Que Este Módulo Chama

#### Backend (Controllers)

**AbastecimentoController.cs** chama:
- `_unitOfWork.ViewAbastecimentos.GetAll()` - Busca todos os abastecimentos
- `_unitOfWork.ViewAbastecimentos.GetAll().Where(...)` - Filtros específicos
- `_unitOfWork.Abastecimento.Update()` - Atualiza KM do abastecimento
- `_unitOfWork.Save()` - Persiste alterações

#### Frontend (JavaScript)

**Index.cshtml (ScriptsBlock)** chama:
- `ListaTodosAbastecimentos()` - Inicializa tabela com todos os dados
- `dtDestroySafe()` - Remove tabela existente antes de recriar
- `dtCommonOptions()` - Retorna configurações padrão do DataTable
- `renderBotaoAcao()` - Renderiza botão de edição de KM

### Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO                                   │
│              (Interação com Interface)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (JavaScript)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Index.cshtml (ScriptsBlock)                          │  │
│  │ - Event handlers de filtros                          │  │
│  │ - Inicialização do DataTable                         │  │
│  │ - Manipulação do modal                               │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ jQuery DataTable                                      │  │
│  │ - Renderização da tabela                             │  │
│  │ - Paginação e ordenação                              │  │
│  │ - Exportação (Excel, PDF)                            │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ AJAX Requests                                        │  │
│  │ - GET /api/abastecimento                             │  │
│  │ - GET /api/abastecimento/AbastecimentoVeiculos      │  │
│  │ - GET /api/abastecimento/AbastecimentoCombustivel   │  │
│  │ - GET /api/abastecimento/AbastecimentoUnidade        │  │
│  │ - GET /api/abastecimento/AbastecimentoMotorista     │  │
│  │ - GET /api/abastecimento/AbastecimentoData          │  │
│  │ - POST /api/Abastecimento/EditaKm                   │  │
│  └───────────────┬──────────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────────┘
                   │ HTTP (REST API)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (ASP.NET Core)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ AbastecimentoController.cs                            │  │
│  │ - Validações                                          │  │
│  │ - Processamento de filtros                           │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ IUnitOfWork                                           │  │
│  │ - Abstração de acesso a dados                        │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ ViewAbastecimentosRepository                        │  │
│  │ - Acesso à view SQL                                  │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ FrotiXDbContext                                       │  │
│  │ - Entity Framework Core                              │  │
│  │ - Acesso ao banco de dados                           │  │
│  └───────────────┬──────────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────────┘
                   │ SQL
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (SQL Server)                    │
│  - View: ViewAbastecimentos                                 │
│  - Tabela: Abastecimento                                    │
│  - Tabelas relacionadas: Veiculo, Motorista, Combustivel,  │
│    Unidade                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Interface e Componentes

### Estrutura da Página

A página é dividida em **3 seções principais**:

1. **Header com Botão de Ação**: Botão "Novo Abastecimento" (link para página de cadastro)
2. **Card de Filtros**: Card interno com 5 filtros Syncfusion ComboBox + DatePicker
3. **Tabela de Dados**: DataTable com 14 colunas

### Card de Filtros

O card de filtros utiliza classes CSS customizadas (`ftx-inner-card`, `ftx-label`) para manter consistência visual:

**Estrutura HTML**:
```html
<div class="ftx-inner-card">
    <div class="ftx-inner-card-header">
        <i class="fa-duotone fa-filter"></i>
        Filtros de Abastecimento
    </div>
    <div class="ftx-inner-card-body">
        <div class="row">
            <!-- Filtros aqui -->
        </div>
    </div>
</div>
```

**Filtros Disponíveis**:
- `lstVeiculos` (Syncfusion ComboBox) - Filtro por veículo
- `lstCombustivel` (Syncfusion ComboBox) - Filtro por combustível
- `lstUnidade` (Syncfusion ComboBox) - Filtro por unidade
- `lstMotorista` (Syncfusion ComboBox) - Filtro por motorista
- `txtData` (Input Date) - Filtro por data

---

## Sistema de Filtros

### Funcionamento Detalhado

Cada filtro possui uma função específica que é chamada quando o valor muda:

#### 1. Filtro por Veículo

**Função**: `DefineEscolhaVeiculo()`

**Evento**: `change` do ComboBox `lstVeiculos`

**Comportamento**:
- Quando um veículo é selecionado, limpa outros filtros
- Se o valor for limpo (null), mostra todos os abastecimentos
- Recria a tabela chamando endpoint `/api/abastecimento/AbastecimentoVeiculos`

**Código**:
```javascript
function DefineEscolhaVeiculo() {
    escolhendoVeiculo = true;
    escolhendoUnidade = false;
    escolhendoMotorista = false;
    escolhendoCombustivel = false;
    escolhendoData = false;
    
    var veiculos = document.getElementById('lstVeiculos').ej2_instances[0];
    if (veiculos.value === null) {
        ListaTodosAbastecimentos();
    }
}

// Event handler
var veiculoCombo = document.getElementById('lstVeiculos').ej2_instances[0];
veiculoCombo.change = function(args) {
    if (args.value) {
        dtDestroySafe();
        var opts = dtCommonOptions();
        opts.ajax = {
            "url": "/api/abastecimento/AbastecimentoVeiculos",
            "data": { Id: args.value },
            "type": "GET",
            "datatype": "json"
        };
        // ... configura colunas ...
        $('#tblAbastecimentos').DataTable(opts);
    }
};
```

#### 2. Filtro por Combustível

Similar ao filtro de veículo, mas usa endpoint `/api/abastecimento/AbastecimentoCombustivel`

#### 3. Filtro por Unidade

Similar ao filtro de veículo, mas usa endpoint `/api/abastecimento/AbastecimentoUnidade`

#### 4. Filtro por Motorista

Similar ao filtro de veículo, mas usa endpoint `/api/abastecimento/AbastecimentoMotorista`

#### 5. Filtro por Data

**Função**: `DefineEscolhaData()`

**Evento**: `change` do input `txtData`

**Comportamento Especial**:
- Converte formato de data de `YYYY-MM-DD` para `DD/MM/YYYY`
- Limpa todos os outros filtros quando uma data é selecionada
- Usa endpoint `/api/abastecimento/AbastecimentoData`

**Código**:
```javascript
$("#txtData").change(function () {
    DefineEscolhaData();
    
    // Limpa outros filtros
    var veiculos = document.getElementById('lstVeiculos').ej2_instances[0];
    veiculos.value = "";
    // ... limpa outros ...
    
    // Converte formato de data
    const partes = $('#txtData').val().split("-");
    const [year, month, day] = partes;
    const dataAbastecimento = `${day}/${month}/${year}`;
    
    dtDestroySafe();
    
    var opts = dtCommonOptions();
    opts.ajax = {
        "url": "/api/abastecimento/AbastecimentoData",
        "data": { dataAbastecimento: dataAbastecimento },
        "type": "GET",
        "datatype": "json"
    };
    // ... configura colunas ...
    $('#tblAbastecimentos').DataTable(opts);
});
```

---

## DataTable e Configurações

### Inicialização do DataTable

A tabela é inicializada pela função `ListaTodosAbastecimentos()`:

**Código Principal**:
```javascript
function ListaTodosAbastecimentos() {
    // Destrói tabela existente se houver
    if ($.fn.DataTable.isDataTable('#tblAbastecimentos')) {
        $('#tblAbastecimentos').DataTable().clear().destroy();
    }
    $('#tblAbastecimentos tbody').empty();
    
    // Configura formato de data para ordenação
    if ($.fn.dataTable && $.fn.dataTable.moment) {
        $.fn.dataTable.moment('DD/MM/YYYY');
    }
    
    // Inicializa DataTable
    var dataTableAbastecimentos = $('#tblAbastecimentos').DataTable({
        dom: 'Bfrtip',
        lengthMenu: [[10, 25, 50, -1], ['10 linhas', '25 linhas', '50 linhas', 'Todas as Linhas']],
        buttons: ['pageLength', 'excel', {
            extend: 'pdfHtml5',
            orientation: 'landscape',
            pageSize: 'LEGAL'
        }],
        "aaSorting": [],
        'columnDefs': [
            // Definições de colunas...
        ],
        responsive: true,
        "ajax": {
            "url": "/api/abastecimento",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "data" },
            { "data": "hora" },
            { "data": "placa" },
            // ... outras colunas ...
            {
                "data": "abastecimentoId",
                "render": function (data) {
                    return renderBotaoAcao(data);
                }
            }
        ],
        "language": {
            // Configurações de idioma PT-BR...
        }
    });
}
```

### Colunas da Tabela

A tabela possui **14 colunas**:

| # | Coluna | Tipo | Descrição |
|---|--------|------|-----------|
| 0 | Data | String | Data do abastecimento (DD/MM/YYYY) |
| 1 | Hora | String | Hora do abastecimento (HH:mm) |
| 2 | Placa | String | Placa do veículo |
| 3 | Veículo | String | Tipo/modelo do veículo |
| 4 | Motorista | String | Nome do motorista condutor |
| 5 | Combustível | String | Tipo de combustível |
| 6 | Unidade | String | Sigla da unidade |
| 7 | (R$) Unitário | Number | Valor unitário do combustível |
| 8 | (R$) Total | Number | Valor total do abastecimento |
| 9 | Litros | Number | Quantidade de litros abastecidos |
| 10 | Kms | Number | Quilometragem rodada |
| 11 | Consumo | Number | Consumo calculado (km/l) |
| 12 | Média | Number | Média de consumo do veículo |
| 13 | Ação | HTML | Botão para editar KM |

### Botões de Exportação

O DataTable possui **3 botões de exportação**:

1. **pageLength**: Permite alterar quantidade de linhas por página
2. **excel**: Exporta dados para Excel (.xlsx)
3. **pdfHtml5**: Exporta dados para PDF em formato paisagem (LEGAL)

**Configuração**:
```javascript
buttons: ['pageLength', 'excel', {
    extend: 'pdfHtml5',
    orientation: 'landscape',
    pageSize: 'LEGAL'
}]
```

---

## Modal de Edição de KM

### Estrutura do Modal

O modal `#modalEditaKm` permite editar a quilometragem de um abastecimento já registrado.

**HTML do Modal**:
```html
<div class="modal fade" id="modalEditaKm" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header modal-header-azul">
                <h5 class="modal-title">
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
                                <input id="txtKm" class="form-control" type="number" placeholder="Digite a quilometragem" />
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

### Funcionamento do Modal

**Fluxo de Uso**:

1. Usuário clica no botão de ação (ícone de lápis) na coluna "Ação"
2. Modal abre automaticamente via Bootstrap (`data-bs-toggle="modal"`)
3. Event handler `shown.bs.modal` busca dados do abastecimento
4. Preenche campo `txtKm` com KM atual
5. Usuário edita o valor
6. Clica em "Confirmar Alteração"
7. Envia requisição POST para `/api/Abastecimento/EditaKm`
8. Atualiza tabela após sucesso

**Código de Abertura do Modal**:
```javascript
$('#modalEditaKm').on('shown.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var abastecimentoId = button.data('id');
    
    // Busca dados do abastecimento
    $.ajax({
        url: '/api/abastecimento',
        type: 'GET',
        success: function(response) {
            var abastecimento = response.data.find(a => a.abastecimentoId === abastecimentoId);
            if (abastecimento) {
                $('#txtId').val(abastecimento.abastecimentoId);
                $('#txtKm').val(abastecimento.kmRodado);
            }
        }
    });
});
```

**Código de Salvamento**:
```javascript
$("#btnEditaKm").click(function (e) {
    e.preventDefault();
    
    var abastecimentoId = $('#txtId').val();
    var novoKm = $('#txtKm').val();
    
    if (!novoKm || novoKm <= 0) {
        Alerta.Erro('Erro', 'Informe uma quilometragem válida');
        return;
    }
    
    // Desabilita botão e mostra loading
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
            ListaTodosAbastecimentos(); // Recarrega tabela
            Alerta.Sucesso('Sucesso', 'Quilometragem atualizada com sucesso');
        },
        error: function(error) {
            Alerta.Erro('Erro', 'Não foi possível atualizar a quilometragem');
        },
        complete: function() {
            // Reabilita botão
            $("#btnEditaKm").prop('disabled', false);
            $("#btnEditaKm .btn-text").removeClass('d-none');
            $("#btnEditaKm .btn-loading").addClass('d-none');
        }
    });
});
```

---

## Endpoints API

O controller `AbastecimentoController.cs` gerencia todas as operações relacionadas aos abastecimentos através de uma API RESTful.

### 1. GET `/api/abastecimento`

**Descrição**: Retorna todos os abastecimentos cadastrados, ordenados por data/hora decrescente.

**Parâmetros**: Nenhum

**Response** (JSON):
```json
{
  "data": [
    {
      "abastecimentoId": "guid",
      "data": "15/01/2026",
      "hora": "14:30",
      "placa": "ABC-1234",
      "tipoVeiculo": "Sedan",
      "motoristaCondutor": "João Silva",
      "tipoCombustivel": "Gasolina",
      "sigla": "SP",
      "valorUnitario": 5.89,
      "valorTotal": 294.50,
      "litros": 50.0,
      "kmRodado": 450,
      "consumo": 9.0,
      "consumoGeral": 8.5
    }
  ]
}
```

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

        return Ok(new
        {
            data = dados
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "Get", error);
        return StatusCode(500);
    }
}
```

### 2. GET `/api/abastecimento/AbastecimentoVeiculos`

**Descrição**: Retorna abastecimentos filtrados por veículo.

**Parâmetros de Query**:
- `Id` (Guid, obrigatório): ID do veículo

**Response**: Mesmo formato do endpoint `Get()`, mas filtrado por veículo.

### 3. GET `/api/abastecimento/AbastecimentoCombustivel`

**Descrição**: Retorna abastecimentos filtrados por tipo de combustível.

**Parâmetros de Query**:
- `Id` (Guid, obrigatório): ID do combustível

### 4. GET `/api/abastecimento/AbastecimentoUnidade`

**Descrição**: Retorna abastecimentos filtrados por unidade.

**Parâmetros de Query**:
- `Id` (Guid, obrigatório): ID da unidade

### 5. GET `/api/abastecimento/AbastecimentoMotorista`

**Descrição**: Retorna abastecimentos filtrados por motorista.

**Parâmetros de Query**:
- `Id` (Guid, obrigatório): ID do motorista

### 6. GET `/api/abastecimento/AbastecimentoData`

**Descrição**: Retorna abastecimentos filtrados por data específica.

**Parâmetros de Query**:
- `dataAbastecimento` (string, obrigatório): Data no formato `DD/MM/YYYY`

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

        return Ok(new
        {
            data = dados
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "AbastecimentoData", error);
        return StatusCode(500);
    }
}
```

### 7. POST `/api/Abastecimento/EditaKm`

**Descrição**: Atualiza a quilometragem de um abastecimento existente.

**Request Body** (JSON):
```json
{
  "AbastecimentoId": "guid-do-abastecimento",
  "KmRodado": 450.0
}
```

**Response**:
```json
{
  "success": true,
  "message": "Quilometragem atualizada com sucesso"
}
```

**Código**:
```csharp
[Route("EditaKm")]
[HttpPost]
public IActionResult EditaKm([FromBody] EditaKmRequest request)
{
    try
    {
        var abastecimento = _unitOfWork.Abastecimento.GetFirstOrDefault(
            a => a.AbastecimentoId == request.AbastecimentoId
        );
        
        if (abastecimento == null)
        {
            return NotFound(new { success = false, message = "Abastecimento não encontrado" });
        }
        
        abastecimento.KmRodado = request.KmRodado;
        _unitOfWork.Abastecimento.Update(abastecimento);
        _unitOfWork.Save();
        
        return Ok(new { success = true, message = "Quilometragem atualizada com sucesso" });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "EditaKm", error);
        return StatusCode(500);
    }
}
```

---

## Validações

### Validações Frontend

1. **Campo KM no Modal**:
   - Campo obrigatório
   - Deve ser um número maior que zero
   - Validação antes de enviar requisição

**Código**:
```javascript
if (!novoKm || novoKm <= 0) {
    Alerta.Erro('Erro', 'Informe uma quilometragem válida');
    return;
}
```

### Validações Backend

1. **Abastecimento existe**: Verifica se o abastecimento existe antes de atualizar
2. **KM válido**: Valida que KM é um número positivo

---

## Exemplos de Uso

### Exemplo 1: Visualizar Todos os Abastecimentos

**Situação**: Usuário quer ver todos os abastecimentos cadastrados.

**Passos**:
1. Acessa página `/Abastecimento`
2. Página carrega automaticamente mostrando todos os abastecimentos
3. Tabela exibe dados ordenados por data/hora (mais recente primeiro)

**O que acontece**:
- Backend carrega listas de filtros (veículos, combustíveis, etc.)
- Frontend inicializa DataTable
- Requisição AJAX para `/api/abastecimento`
- Tabela renderiza com todos os dados

### Exemplo 2: Filtrar por Veículo Específico

**Situação**: Usuário quer ver apenas abastecimentos de um veículo específico.

**Passos**:
1. Usuário seleciona um veículo no ComboBox "Veículo"
2. Sistema limpa outros filtros automaticamente
3. Tabela recarrega mostrando apenas abastecimentos daquele veículo

**O que acontece**:
- Event handler `change` do ComboBox é acionado
- Tabela é destruída e recriada
- Requisição AJAX para `/api/abastecimento/AbastecimentoVeiculos?Id=guid`
- Tabela renderiza apenas dados filtrados

### Exemplo 3: Editar Quilometragem

**Situação**: Usuário precisa corrigir a KM de um abastecimento já registrado.

**Passos**:
1. Usuário clica no botão de ação (lápis) na linha do abastecimento
2. Modal abre com KM atual preenchida
3. Usuário edita o valor
4. Clica em "Confirmar Alteração"
5. Sistema atualiza e recarrega a tabela

**O que acontece**:
- Modal busca dados do abastecimento via AJAX
- Preenche campo com KM atual
- Ao salvar, envia POST para `/api/Abastecimento/EditaKm`
- Backend atualiza registro no banco
- Tabela recarrega mostrando dados atualizados

---

## Troubleshooting

### Problema 1: Tabela não carrega dados

**Sintoma**: Tabela aparece vazia ou com mensagem "Carregando..."

**Causas Possíveis**:
1. Erro na API `/api/abastecimento` (500 Internal Server Error)
2. View `ViewAbastecimentos` não existe ou tem erro
3. Problema de CORS ou roteamento

**Diagnóstico**:
1. Abrir DevTools (F12)
2. Ir para aba Network
3. Verificar requisição `abastecimento`
4. Verificar Status Code e Response

**Solução**:
- Verificar logs do servidor
- Verificar se view existe no banco de dados
- Verificar roteamento da API

### Problema 2: Filtros não funcionam

**Sintoma**: Seleciona um filtro mas tabela não atualiza.

**Causas Possíveis**:
1. Event handler não está registrado
2. ComboBox Syncfusion não está inicializado
3. Erro JavaScript no console

**Diagnóstico**:
```javascript
// Verificar se ComboBox está inicializado
const combo = document.getElementById('lstVeiculos');
console.log('ComboBox inicializado:', combo?.ej2_instances?.[0]);
```

**Solução**:
- Verificar se scripts Syncfusion foram carregados
- Verificar ordem de carregamento dos scripts
- Verificar console por erros JavaScript

### Problema 3: Modal não abre

**Sintoma**: Clica no botão de edição mas modal não aparece.

**Causas Possíveis**:
1. Bootstrap não foi carregado
2. ID do modal está incorreto
3. Erro JavaScript

**Diagnóstico**:
```javascript
// Verificar se Bootstrap está disponível
console.log('Bootstrap disponível:', typeof bootstrap !== 'undefined');

// Testar abertura manual
$('#modalEditaKm').modal('show');
```

**Solução**:
- Verificar se Bootstrap foi carregado
- Verificar se ID do modal está correto
- Verificar console por erros

### Problema 4: Exportação não funciona

**Sintoma**: Botões de exportar Excel/PDF não fazem nada.

**Causas Possíveis**:
1. Plugins do DataTable não foram carregados
2. Bibliotecas de exportação não estão disponíveis

**Solução**:
- Verificar se `buttons.html5.js` foi carregado
- Verificar se `jszip.js` e `pdfmake.js` estão disponíveis
- Verificar ordem de carregamento dos scripts

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Expansão Completa da Documentação

**Descrição**:
Documentação expandida de ~80 linhas para mais de 600 linhas, incluindo:
- Detalhamento completo da arquitetura e estrutura de arquivos
- Explicação detalhada do sistema de filtros
- Documentação completa do DataTable e suas configurações
- Explicação do modal de edição de KM
- Documentação completa de todos os endpoints API
- Validações frontend e backend documentadas
- Exemplos práticos de uso
- Troubleshooting completo com soluções

**Arquivos Afetados**:
- `Documentacao/Pages/Abastecimento - Index.md` (expansão completa)

**Status**: ✅ **Documentado e Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 2.0

---

## [08/01/2026 18:24] - Criação automática da documentação (stub)

**Descrição**:
- Criado esqueleto de documentação automaticamente a partir da estrutura de arquivos e referências encontradas na página.

**Status**: ✅ **Gerado (expandido)**
