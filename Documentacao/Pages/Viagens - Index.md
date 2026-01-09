# Documentação: Controle de Viagens (Index)

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
6. [Estrutura da Interface](#estrutura-da-interface)
7. [Sistema de Filtros](#sistema-de-filtros)
8. [DataTable e Configurações](#datatable-e-configurações)
9. [Modal de Finalização](#modal-de-finalização)
10. [Gestão de Ocorrências](#gestão-de-ocorrências)
11. [Lógica de Frontend (JavaScript)](#lógica-de-frontend-javascript)
12. [Endpoints API](#endpoints-api)
13. [Validações](#validações)
14. [Exemplos de Uso](#exemplos-de-uso)
15. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Controle de Viagens** (`Pages/Viagens/Index.cshtml`) é o **painel operacional central** para gestão completa do fluxo de viagens da frota. Esta funcionalidade é uma das mais importantes do sistema, permitindo visualizar, filtrar, criar, editar, finalizar e cancelar viagens, além de gerenciar ocorrências, custos e relatórios associados.

### Objetivo

A página de Viagens permite que os usuários:
- **Visualizem** todas as viagens da frota em uma tabela interativa rica
- **Filtrem** viagens por múltiplos critérios (Data, Veículo, Motorista, Status, Evento)
- **Finalizem** viagens abertas capturando dados reais de execução
- **Gerenciem** ocorrências diretamente da listagem
- **Visualizem** custos detalhados de cada viagem
- **Imprimam** fichas de viagem em PDF
- **Monitorem** status e progresso das viagens em tempo real

### Características Principais

- ✅ **Listagem Rica**: DataTable com informações detalhadas, fotos de motoristas (lazy loading), badges de status coloridos e botões de ação contextuais
- ✅ **Filtros Avançados**: Combinação de filtros por Data, Veículo, Motorista, Status e Evento com componentes Syncfusion
- ✅ **Finalização de Viagem**: Modal complexo para encerrar viagens, capturando KM final, combustível, validações via IA e processamento de ocorrências
- ✅ **Gestão de Ocorrências**: Permite visualizar, adicionar e dar baixa em ocorrências diretamente da listagem sem sair da página
- ✅ **Ficha de Vistoria**: Upload e visualização de imagens de vistoria integrado ao modal de finalização
- ✅ **Relatórios**: Geração de fichas de viagem em PDF através do Telerik Report Viewer
- ✅ **Lazy Loading**: Carregamento otimizado de fotos de motoristas usando IntersectionObserver para performance
- ✅ **Modal de Custos**: Visualização detalhada de todos os custos associados a uma viagem
- ✅ **Validação Inteligente**: Sistema de validação avançada para datas, horas e quilometragem com alertas contextuais

---

## Arquitetura

### Visão Geral da Arquitetura

A página de Viagens utiliza uma arquitetura **modular e performática**, dividindo responsabilidades entre:
- **Backend (ASP.NET Core)**: Processamento de dados, validações de negócio e persistência
- **Frontend Modular (JavaScript)**: Lógica de interface, validações client-side e comunicação com API
- **Bibliotecas de Terceiros**: Componentes UI ricos (DataTables, Syncfusion, Telerik)

### Padrões de Design Utilizados

1. **Repository Pattern**: Acesso a dados através de `IUnitOfWork` e repositórios específicos
2. **Service Layer**: Lógica de negócio encapsulada em services
3. **Modular JavaScript**: Código frontend organizado em módulos independentes
4. **Dependency Injection**: Serviços injetados via construtor no backend
5. **API RESTful**: Comunicação padronizada entre frontend e backend
6. **Lazy Loading Pattern**: Carregamento sob demanda de recursos pesados (fotos)

---

## Estrutura de Arquivos

### Arquivos Principais

```
FrotiX.Site/
├── Pages/
│   └── Viagens/
│       ├── Index.cshtml              # View Principal (1153+ linhas)
│       │                             # - HTML da tabela e filtros
│       │                             # - Modais (Finalização, Custos, Impressão, Ocorrências)
│       │                             # - Scripts inline de inicialização
│       │                             # - Estilos CSS customizados
│       │
│       └── Index.cshtml.cs          # PageModel (Backend Init)
│                                     # - Inicialização de ViewData
│                                     # - Carregamento de listas (motoristas, veículos, etc.)
│
├── Controllers/
│   ├── ViagemController.cs           # API Controller (2000+ linhas)
│   │                                 # - Get: Lista viagens filtradas
│   │                                 # - FinalizaViagem: Processa finalização
│   │                                 # - Cancelar: Cancela viagem
│   │                                 # - FotoMotorista: Retorna foto em Base64
│   │                                 # - PegarStatusViagem: Verifica status
│   │                                 # - ObterCustosViagem: Calcula custos
│   │
│   └── OcorrenciaViagemController.cs # API Controller de Ocorrências
│                                     # - Get: Lista ocorrências de uma viagem
│                                     # - Post: Cria nova ocorrência
│                                     # - Put: Atualiza ocorrência
│                                     # - Delete: Remove ocorrência
│
├── wwwroot/
│   ├── js/
│   │   ├── cadastros/
│   │   │   └── ViagemIndex.js        # Lógica principal (3491+ linhas)
│   │   │                             # - Inicialização do DataTable
│   │   │                             # - Sistema de lazy loading de fotos
│   │   │                             # - Handlers de modais
│   │   │                             # - Validações e processamento
│   │   │
│   │   └── viagens/
│   │       └── ocorrencia-viagem.js  # Lógica específica de ocorrências
│   │                                 # - CRUD de ocorrências
│   │                                 # - Upload de imagens
│   │                                 # - Validações específicas
│   │
│   └── css/
│       └── viagemindex.css           # Estilos customizados
│                                     # - Badges de status
│                                     # - Botões de ação
│                                     # - Layout responsivo
│
└── Models/
    └── Cadastros/
        └── Viagem.cs                 # Modelo principal de viagem
        └── ViewViagens.cs            # ViewModel para listagem
```

### Arquivos Relacionados

- `Repository/ViagemRepository.cs` - Acesso a dados de viagens
- `Repository/OcorrenciaViagemRepository.cs` - Acesso a dados de ocorrências
- `Services/ViagemEstatisticaService.cs` - Cálculo de estatísticas (usado em validações)
- `Models/DTO/ViagemFinalizacaoDTO.cs` - DTO para finalização
- `Models/DTO/OcorrenciaViagemDTO.cs` - DTO para ocorrências

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso Específico |
|------------|--------|----------------|
| **jQuery DataTables** | Latest | Tabela interativa com paginação, ordenação e busca avançada |
| **Syncfusion EJ2** | Latest | ComboBox, TimePicker, RichTextEditor para formulários |
| **ASP.NET Core** | 3.1+ | Backend Razor Pages, Dependency Injection |
| **jQuery** | 3.6.0 | Manipulação DOM, AJAX, Event Handlers |
| **Bootstrap** | 5.x | Modais, Layout Responsivo |
| **Telerik Reporting** | Latest | Geração e visualização de relatórios PDF |
| **Font Awesome Duotone** | Latest | Ícones e badges visuais |
| **SweetAlert2** | Latest | Alertas e confirmações elegantes |

---

## Lógica de Negócio

### Fluxo Principal de Carregamento

O processo de carregamento da página segue este fluxo:

```
1. Página carrega (OnGet)
   ↓
2. Backend inicializa ViewData com listas:
   - Motoristas (lstMotorista)
   - Veículos (lstVeiculos)
   - Setores (lstSetor, dataSetor)
   - Status (lstStatus)
   - Eventos (lstEventos)
   - Níveis de Combustível (dataCombustivel)
   ↓
3. Frontend inicializa componentes Syncfusion ComboBox
   ↓
4. DataTable é inicializado chamando ListaTodasViagens()
   ↓
5. Requisição AJAX para /api/viagem (GET)
   ↓
6. Backend retorna viagens filtradas (ou todas se sem filtros)
   ↓
7. DataTable renderiza dados na tabela
   ↓
8. Sistema de lazy loading observa imagens de motoristas
   ↓
9. Quando imagem entra na viewport, busca foto via API
```

### Estados de uma Viagem

Uma viagem pode estar em um dos seguintes estados:

| Status | Descrição | Cor no Badge | Ações Permitidas |
|--------|-----------|--------------|------------------|
| **Agendada** | Viagem agendada mas não iniciada | 🟠 Laranja | Editar, Cancelar, Transformar em Viagem |
| **Aberta** | Viagem em andamento | 🟢 Verde | Finalizar, Cancelar, Editar, Ver Custos |
| **Realizada** | Viagem concluída | 🔵 Azul | Visualizar, Imprimir Ficha, Ver Custos |
| **Cancelada** | Viagem cancelada | 🔴 Vermelho | Visualizar apenas |

### Processo de Finalização

Quando uma viagem é finalizada, ocorrem as seguintes ações:

1. **Validações Frontend**: Data final, KM final, campos obrigatórios
2. **Validação Inteligente (IA)**: Verifica consistência de datas, horas e KM
3. **Coleta de Ocorrências**: Reúne todas as ocorrências adicionadas no modal
4. **Envio para API**: POST `/api/Viagem/FinalizaViagem`
5. **Processamento Backend**:
   - Atualiza status para "Realizada"
   - Calcula custos (combustível, motorista, operador, etc.)
   - Processa ocorrências
   - Atualiza quilometragem do veículo
   - Registra data/hora de finalização
6. **Atualização da Tabela**: Recarrega dados para mostrar status atualizado

---

## Interconexões

### Quem Chama Este Módulo

A página de Viagens é chamada por:
- **Navegação Principal**: Link no menu lateral (`/Viagens`)
- **Dashboard de Viagens**: Links para visualizar viagens específicas
- **Página de Agenda**: Botão "Ver Viagem" após criar agendamento

### O Que Este Módulo Chama

#### Backend (Controllers)

**ViagemController.cs** chama:
- `_unitOfWork.Viagem.*` - Operações CRUD de viagens
- `_unitOfWork.OcorrenciaViagem.*` - Operações com ocorrências
- `ViagemEstatisticaService` - Cálculo de estatísticas para validações
- `Servicos.CalculaCustoCombustivel()` - Cálculo de custos
- `Servicos.CalculaCustoMotorista()` - Cálculo de custos

**OcorrenciaViagemController.cs** chama:
- `_unitOfWork.OcorrenciaViagem.*` - Operações CRUD de ocorrências
- Upload de imagens para `wwwroot/Uploads/ocorrencias/`

#### Frontend (JavaScript)

**ViagemIndex.js** chama:
- `ListaTodasViagens()` - Inicializa tabela
- `FtxViagens.filtrar()` - Aplica filtros
- `ftxQueueFotoFetch()` - Busca foto de motorista (lazy loading)
- `OcorrenciaViagem.*` - Módulo de gestão de ocorrências
- `ValidadorFinalizacaoIA` - Validações inteligentes (se disponível)

### Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO                                   │
│              (Interação com Interface)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (JavaScript)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ViagemIndex.js                                       │  │
│  │ - Inicialização do DataTable                         │  │
│  │ - Sistema de lazy loading                           │  │
│  │ - Handlers de modais                                 │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ ocorrencia-viagem.js                                 │  │
│  │ - CRUD de ocorrências                                │  │
│  │ - Upload de imagens                                  │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ AJAX Requests                                        │  │
│  │ - GET /api/viagem                                    │  │
│  │ - POST /api/Viagem/FinalizaViagem                    │  │
│  │ - POST /api/Viagem/Cancelar                         │  │
│  │ - GET /api/Viagem/FotoMotorista                     │  │
│  │ - GET /api/OcorrenciaViagem                         │  │
│  └───────────────┬──────────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────────┘
                   │ HTTP (REST API)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (ASP.NET Core)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ViagemController.cs                                  │  │
│  │ - Validações de negócio                             │  │
│  │ - Cálculo de custos                                  │  │
│  │ - Processamento de finalização                       │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ IUnitOfWork                                           │  │
│  │ - Abstração de acesso a dados                        │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ ViagemRepository / OcorrenciaViagemRepository       │  │
│  │ - Operações específicas de cada entidade             │  │
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
│  - Tabela: Viagem                                           │
│  - Tabela: OcorrenciaViagem                                 │
│  - Views relacionadas: ViewViagens, etc.                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura da Interface

A interface é composta por um painel de filtros no topo e uma tabela de dados abaixo.

### Filtros
Os filtros utilizam componentes Syncfusion Combobox para seleção rica (com busca).

```html
<div class="ftx-filtros">
    <div class="row g-3">
        <div class="col-md-2">
            <ejs-combobox id="lstVeiculos" dataSource="@ViewData["lstVeiculos"]" ...></ejs-combobox>
        </div>
        <!-- ... outros filtros ... -->
    </div>
    <button onclick="FtxViagens.filtrar()">Filtrar Viagens</button>
</div>
```

### Modal de Finalização
O modal `#modalFinalizaViagem` é crítico para o processo de encerramento. Ele exibe dados readonly da abertura (Data/Hora/KM Inicial) e campos obrigatórios para o fechamento.

```html
<div class="modal fade" id="modalFinalizaViagem">
    <!-- ... -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <label>Data Final</label>
            <input id="txtDataFinal" type="date" class="form-control" />
        </div>
        <div class="col-md-3">
            <label>Km Final</label>
            <input id="txtKmFinal" type="number" class="form-control" />
        </div>
        <!-- ... -->
    </div>
    <button id="btnFinalizarViagem">Finalizar Viagem</button>
</div>
```

---

## Lógica de Frontend (JavaScript)

O arquivo `ViagemIndex.js` é extenso e gerencia toda a interatividade.

### 1. Inicialização do DataTable
Configura as colunas, renderizadores customizados (como a foto do motorista e badges de status) e a fonte de dados AJAX.

```javascript
function ListaTodasViagens() {
    dataTableViagens = $("#tblViagem").DataTable({
        ajax: {
            url: "/api/viagem",
            data: { /* ... filtros ... */ }
        },
        columns: [
            { data: "noFichaVistoria" },
            {
                data: null,
                render: ftxRenderMotorista // Lazy loading de foto
            },
            {
                data: "status",
                render: function(data) {
                    if (data === "Aberta") return '<span class="badge-aberta">Aberta</span>';
                    // ...
                }
            },
            // ... Botões de Ação ...
        ]
    });
}
```

### 2. Finalização de Viagem
O clique no botão de finalizar abre o modal, preenche os dados iniciais e configura a submissão.

```javascript
$("#btnFinalizarViagem").click(async function (e) {
    // 1. Validações de Campos Obrigatórios
    if ($("#txtDataFinal").val() === "") {
        Alerta.Erro("Erro", "Data Final obrigatória");
        return;
    }

    // 2. Validação de Consistência (IA/Lógica)
    // ...

    // 3. Montagem do Objeto
    const objViagem = {
        ViagemId: $("#txtId").val(),
        KmFinal: $("#txtKmFinal").val(),
        // ...
        Ocorrencias: OcorrenciaViagem.coletarOcorrenciasSimples()
    };

    // 4. Envio AJAX
    $.ajax({
        url: "/api/Viagem/FinalizaViagem",
        type: "POST",
        data: JSON.stringify(objViagem),
        success: function(data) {
            if (data.success) {
                AppToast.show("Verde", "Viagem finalizada!");
                $("#tblViagem").DataTable().ajax.reload();
            }
        }
    });
});
```

### 3. Lazy Loading de Fotos
Para evitar sobrecarga ao carregar centenas de fotos de motoristas, o sistema usa `IntersectionObserver` com cache e controle de concorrência.

**Sistema de Cache e Fila**:
```javascript
// Cache definitivo: motoristaId -> "data:image..." OU URL do placeholder
const FtxFotoCache = new Map();

// Em voo: motoristaId -> Promise<string>
const FtxFotoInflight = new Map();

// Fila para controlar concorrência (máximo 4 requisições simultâneas)
const FtxFotoQueue = [];
const FTX_MAX_CONCURRENT = 4;
let FtxFotoCurrent = 0;

// Observer para detectar quando imagem entra na viewport
const FtxFotoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            const id = img.getAttribute('data-mot-id');
            ftxQueueFotoFetch(id).then(src => img.src = src);
        }
    });
});
```

**Benefícios**:
- Reduz requisições HTTP desnecessárias
- Melhora performance inicial da página
- Evita "tempestade" de requisições simultâneas
- Reutiliza fotos já carregadas via cache

---

## Sistema de Filtros

### Funcionamento Detalhado

O sistema possui **5 filtros independentes** que podem ser combinados:

1. **Veículo**: Filtra por veículo específico
2. **Motorista**: Filtra por motorista condutor
3. **Status**: Filtra por status da viagem (Agendada, Aberta, Realizada, Cancelada)
4. **Data**: Filtra por data específica de viagem
5. **Evento**: Filtra por evento associado à viagem

**Lógica de Filtros**:
- Cada filtro é um Syncfusion ComboBox com autocomplete
- Filtros são aplicados em conjunto (AND lógico)
- Botão "Filtrar Viagens" recarrega a tabela com filtros aplicados
- Se nenhum filtro está selecionado, mostra todas as viagens

**Código de Aplicação de Filtros**:
```javascript
function ListaTodasViagens() {
    // Coleta valores dos filtros
    const veiculoId = document.getElementById('lstVeiculos')?.ej2_instances?.[0]?.value;
    const motoristaId = document.getElementById('lstMotorista')?.ej2_instances?.[0]?.value;
    const statusId = document.getElementById('lstStatus')?.ej2_instances?.[0]?.value;
    const dataViagem = document.getElementById('txtDataViagem')?.value;
    const eventoId = document.getElementById('lstEventos')?.ej2_instances?.[0]?.value;
    
    // Configura DataTable com filtros
    dataTableViagens = $("#tblViagem").DataTable({
        ajax: {
            url: "/api/viagem",
            data: function(d) {
                d.veiculoId = veiculoId || null;
                d.motoristaId = motoristaId || null;
                d.statusId = statusId || null;
                d.dataviagem = dataViagem || null;
                d.eventoId = eventoId || null;
            }
        },
        // ... configurações da tabela ...
    });
}
```

---

## DataTable e Configurações

### Inicialização do DataTable

A tabela é inicializada pela função `ListaTodasViagens()`:

**Colunas da Tabela**:

| # | Coluna | Tipo | Descrição |
|---|--------|------|-----------|
| 0 | Ficha | String | Número da ficha de vistoria |
| 1 | Motorista | HTML | Foto + Nome (lazy loading) |
| 2 | Status | HTML | Badge colorido com status |
| 3 | Data/Hora Inicial | String | Data e hora de início |
| 4 | Data/Hora Final | String | Data e hora de término |
| 5 | Veículo | String | Placa do veículo |
| 6 | Origem/Destino | String | Roteiro da viagem |
| 7 | KM Rodado | Number | Quilometragem percorrida |
| 8 | Ação | HTML | Botões de ação contextuais |

**Botões de Ação** (coluna 8):
- **Finalizar** (laranja): Apenas para viagens "Aberta"
- **Cancelar** (vermelho): Apenas para viagens "Aberta" ou "Agendada"
- **Ver Custos** (azul): Para todas as viagens finalizadas
- **Imprimir** (cinza): Para todas as viagens finalizadas
- **Ver Ocorrências** (amarelo): Para todas as viagens

**Renderizadores Customizados**:

```javascript
// Renderizador de Motorista com foto
function ftxRenderMotorista(data, type, row) {
    if (type === 'display') {
        const motoristaId = row.motoristaId;
        const nomeMotorista = row.motoristaCondutor || 'N/A';
        
        return `
            <div class="d-flex align-items-center">
                <img src="${FTX_FOTO_PLACEHOLDER}" 
                     data-mot-id="${motoristaId}"
                     class="ftx-foto-motorista"
                     style="width:40px; height:40px; border-radius:50%; margin-right:8px;" />
                <span>${nomeMotorista}</span>
            </div>
        `;
    }
    return data;
}

// Renderizador de Status com badge
function ftxRenderStatus(data, type, row) {
    if (type === 'display') {
        const status = data || 'N/A';
        let badgeClass = 'ftx-badge-status-secondary';
        
        switch(status) {
            case 'Aberta':
                badgeClass = 'ftx-badge-status-aberta';
                break;
            case 'Realizada':
                badgeClass = 'ftx-badge-status-realizada';
                break;
            case 'Cancelada':
                badgeClass = 'ftx-badge-status-cancelada';
                break;
            case 'Agendada':
                badgeClass = 'ftx-badge-status-agendada';
                break;
        }
        
        return `<span class="ftx-badge-status ${badgeClass}">${status}</span>`;
    }
    return data;
}
```

---

## Modal de Finalização

### Estrutura do Modal

O modal `#modalFinalizaViagem` é o componente mais complexo da página, permitindo finalizar uma viagem com todas as informações necessárias.

**Seções do Modal**:

1. **Dados de Abertura** (Readonly):
   - Data Inicial
   - Hora Inicial
   - KM Inicial
   - Veículo
   - Motorista

2. **Dados de Finalização** (Editáveis):
   - Data Final (obrigatório)
   - Hora Final (obrigatório)
   - KM Final (obrigatório)
   - Combustível Final (obrigatório)
   - Observações

3. **Gestão de Ocorrências**:
   - Lista de ocorrências existentes
   - Botão para adicionar nova ocorrência
   - Upload de imagens para ocorrências

4. **Ficha de Vistoria**:
   - Visualização da ficha atual
   - Upload de nova ficha (opcional)

**Fluxo de Finalização**:

```
1. Usuário clica em "Finalizar" na linha da viagem
   ↓
2. Modal abre e busca dados da viagem via AJAX
   ↓
3. Preenche campos readonly com dados iniciais
   ↓
4. Carrega ocorrências existentes (se houver)
   ↓
5. Usuário preenche dados de finalização
   ↓
6. (Opcional) Adiciona ocorrências
   ↓
7. Clica em "Finalizar Viagem"
   ↓
8. Validações frontend executam
   ↓
9. Validação IA (se disponível) verifica consistência
   ↓
10. Envia POST para /api/Viagem/FinalizaViagem
   ↓
11. Backend processa e calcula custos
   ↓
12. Tabela recarrega mostrando status atualizado
```

---

## Gestão de Ocorrências

### Funcionalidades

O sistema permite gerenciar ocorrências diretamente do modal de finalização:

1. **Visualizar Ocorrências**: Lista todas as ocorrências da viagem
2. **Adicionar Ocorrência**: Formulário inline para criar nova ocorrência
3. **Upload de Imagens**: Anexar fotos/documentos às ocorrências
4. **Dar Baixa**: Marcar ocorrência como resolvida

**Estrutura de uma Ocorrência**:
- Tipo (ex: Avaria, Multa, Acidente)
- Descrição (texto livre)
- Data/Hora da ocorrência
- Imagens anexadas (múltiplas)
- Status (Aberta/Resolvida)

**Código de Coleta de Ocorrências**:
```javascript
// Coleta todas as ocorrências do modal antes de finalizar
const ocorrencias = [];
$('.ocorrencia-item').each(function() {
    ocorrencias.push({
        Tipo: $(this).find('.tipo-ocorrencia').val(),
        Descricao: $(this).find('.descricao-ocorrencia').val(),
        DataOcorrencia: $(this).find('.data-ocorrencia').val(),
        Imagens: $(this).find('.imagens-ocorrencia').data('imagens') || []
    });
});
```

---

## Validações

### Validações Frontend

1. **Data Final**:
   - Campo obrigatório
   - Não pode ser anterior à Data Inicial
   - Não pode ser futura (data atual ou passado)

2. **Hora Final**:
   - Campo obrigatório
   - Se mesma data, deve ser > Hora Inicial

3. **KM Final**:
   - Campo obrigatório
   - Deve ser > KM Inicial
   - Validação IA verifica se está dentro do padrão do veículo

4. **Combustível Final**:
   - Campo obrigatório
   - Deve ser selecionado do dropdown

### Validações Backend

1. **Viagem existe**: Verifica se a viagem existe antes de finalizar
2. **Status correto**: Apenas viagens "Aberta" podem ser finalizadas
3. **Data Final não futura**: Bloqueia finalização com data futura
4. **Consistência de KM**: Valida KM final contra histórico do veículo

---

## Exemplos de Uso

### Exemplo 1: Finalizar Viagem Simples

**Situação**: Usuário quer finalizar uma viagem aberta.

**Passos**:
1. Usuário clica no botão "Finalizar" (laranja) na linha da viagem
2. Modal abre mostrando dados iniciais
3. Preenche:
   - Data Final: Hoje
   - Hora Final: 16:30
   - KM Final: 50150 (KM Inicial era 50000)
   - Combustível Final: 1/2
4. Clica em "Finalizar Viagem"

**O que acontece**:
- Sistema valida todos os campos
- Validação IA verifica consistência de KM
- Envia requisição POST para `/api/Viagem/FinalizaViagem`
- Backend calcula custos e atualiza status
- Tabela recarrega mostrando viagem como "Realizada"

### Exemplo 2: Finalizar Viagem com Ocorrência

**Situação**: Usuário precisa finalizar viagem e registrar uma ocorrência.

**Passos**:
1. Abre modal de finalização
2. Preenche dados de finalização
3. Clica em "Adicionar Ocorrência"
4. Preenche:
   - Tipo: "Avaria"
   - Descrição: "Pneu furado"
   - Data: Data da ocorrência
   - Upload: Foto do pneu
5. Finaliza a viagem

**O que acontece**:
- Ocorrência é salva junto com a finalização
- Imagem é enviada para `/wwwroot/Uploads/ocorrencias/`
- Backend associa ocorrência à viagem
- Ocorrência fica disponível para consulta posterior

---

## Endpoints API

O controller `ViagemController.cs` gerencia todas as operações relacionadas às viagens através de uma API RESTful.

### 1. GET `/api/viagem`

**Descrição**: Retorna a lista de viagens filtrada, compatível com DataTables.

**Parâmetros de Query**:
- `veiculoId` (Guid, opcional): ID do veículo
- `motoristaId` (Guid, opcional): ID do motorista
- `statusId` (string, opcional): Status da viagem ("Aberta", "Realizada", etc.)
- `dataviagem` (string, opcional): Data no formato `DD/MM/YYYY`
- `eventoId` (Guid, opcional): ID do evento

**Response** (JSON compatível com DataTables):
```json
{
  "data": [
    {
      "viagemId": "guid",
      "noFichaVistoria": "12345",
      "motoristaId": "guid",
      "motoristaCondutor": "João Silva",
      "status": "Aberta",
      "dataInicial": "15/01/2026",
      "horaInicio": "10:00",
      "dataFinal": null,
      "horaFim": null,
      "placa": "ABC-1234",
      "origem": "São Paulo",
      "destino": "Campinas",
      "kmRodado": null
    }
  ]
}
```

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
        
        if (veiculoId.HasValue)
            query = query.Where(v => v.VeiculoId == veiculoId.Value);
        
        if (motoristaId.HasValue)
            query = query.Where(v => v.MotoristaId == motoristaId.Value);
        
        if (!string.IsNullOrEmpty(statusId))
            query = query.Where(v => v.Status == statusId);
        
        // ... outros filtros ...
        
        var viagens = query.ToList();
        return Ok(new { data = viagens });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("ViagemController.cs", "Get", error);
        return StatusCode(500);
    }
}
```

---

### 2. POST `/api/Viagem/FinalizaViagem`

**Descrição**: Processa o encerramento completo de uma viagem, incluindo cálculo de custos e processamento de ocorrências.

**Request Body** (JSON):
```json
{
  "ViagemId": "guid-da-viagem",
  "DataFinal": "2026-01-15T16:30:00",
  "HoraFim": "16:30:00",
  "KmFinal": 50150,
  "CombustivelFinal": "tanquemeiotanque",
  "Descricao": "Viagem concluída com sucesso",
  "Ocorrencias": [
    {
      "Tipo": "Avaria",
      "Descricao": "Pneu furado",
      "DataOcorrencia": "2026-01-15T14:00:00",
      "Imagens": ["guid-imagem-1"]
    }
  ]
}
```

**Lógica de Processamento**:

1. **Validações**:
   - Verifica se viagem existe
   - Verifica se status é "Aberta"
   - Valida que Data Final não é futura
   - Valida que KM Final > KM Inicial

2. **Atualização da Viagem**:
   - Atualiza status para "Realizada"
   - Preenche campos de finalização
   - Registra usuário e data de finalização

3. **Cálculo de Custos**:
   - `CustoCombustivel`: Calculado baseado em KM rodado e consumo médio
   - `CustoMotorista`: Calculado baseado em tempo e salário
   - `CustoOperador`: Calculado se aplicável
   - `CustoTotal`: Soma de todos os custos

4. **Processamento de Ocorrências**:
   - Cria registros de ocorrências associadas
   - Processa uploads de imagens

5. **Atualização do Veículo**:
   - Atualiza quilometragem do veículo se KM Final > KM Atual

**Response**:
```json
{
  "success": true,
  "message": "Viagem finalizada com sucesso",
  "viagemId": "guid",
  "custos": {
    "combustivel": 150.50,
    "motorista": 200.00,
    "total": 350.50
  }
}
```

---

### 3. POST `/api/Viagem/Cancelar`

**Descrição**: Cancela uma viagem aberta ou agendada.

**Request Body** (JSON):
```json
{
  "ViagemId": "guid-da-viagem",
  "Descricao": "Motivo do cancelamento"
}
```

**Lógica**:
- Atualiza status para "Cancelada"
- Registra usuário e data de cancelamento
- Salva descrição do motivo

**Response**:
```json
{
  "success": true,
  "message": "Viagem cancelada com sucesso"
}
```

---

### 4. GET `/api/Viagem/FotoMotorista`

**Descrição**: Retorna foto do motorista em Base64 para exibição na tabela.

**Parâmetros de Query**:
- `id` (Guid, obrigatório): ID do motorista

**Response**:
```json
{
  "fotoBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Uso**: Utilizado pelo sistema de lazy loading de fotos.

---

### 5. GET `/api/Viagem/PegarStatusViagem`

**Descrição**: Verifica o status atual de uma viagem.

**Parâmetros de Query**:
- `viagemId` (Guid, obrigatório): ID da viagem

**Response**:
```json
{
  "status": "Aberta",
  "podeFinalizar": true
}
```

---

### 6. GET `/api/Viagem/ObterCustosViagem`

**Descrição**: Retorna cálculo detalhado de custos de uma viagem.

**Parâmetros de Query**:
- `viagemId` (Guid, obrigatório): ID da viagem

**Response**:
```json
{
  "custoCombustivel": 150.50,
  "custoMotorista": 200.00,
  "custoOperador": 50.00,
  "custoLavador": 30.00,
  "custoTotal": 430.50,
  "detalhes": {
    "kmRodado": 150,
    "litrosConsumidos": 15.5,
    "tempoViagem": "06:30:00"
  }
}
```

---

## Troubleshooting

### Problema 1: Tabela não carrega (Loading infinito)

**Sintoma**: 
- Tabela aparece com mensagem "Carregando..."
- Loading overlay não desaparece
- Nenhum dado é exibido

**Causas Possíveis**:
1. Erro no endpoint `/api/viagem` (500 Internal Server Error)
2. Timeout na requisição (banco de dados lento)
3. Erro JavaScript que impede inicialização do DataTable
4. Problema de CORS ou roteamento

**Diagnóstico Passo a Passo**:

1. **Abrir DevTools** (F12)
2. **Ir para aba Network**
3. **Recarregar a página**
4. **Procurar requisição** `viagem`
5. **Verificar Status Code**:
   - **200 OK**: API funcionando, verificar Response
   - **500 Internal Server Error**: Erro no servidor, verificar logs
   - **Timeout**: Banco de dados lento ou query complexa

6. **Verificar Console do Navegador**:
   - Procurar erros JavaScript
   - Verificar se DataTables foi carregado: `typeof $.fn.DataTable !== 'undefined'`

**Solução**:

```javascript
// Adicionar tratamento de erro mais detalhado
$("#tblViagem").DataTable({
    ajax: {
        url: "/api/viagem",
        error: function(xhr, error, thrown) {
            console.error('Erro ao carregar viagens:', error);
            console.error('Response:', xhr.responseText);
            Alerta.Erro('Erro', 'Não foi possível carregar as viagens. Verifique o console.');
            FtxViagens.esconderLoading();
        }
    }
});
```

---

### Problema 2: Erro ao Finalizar - "Data Final deve ser maior que Inicial"

**Sintoma**: 
- Modal de finalização não permite salvar
- Mensagem de erro sobre data/hora

**Causas Possíveis**:
1. Data final realmente anterior à inicial
2. Problema de timezone (servidor em UTC, cliente em UTC-3)
3. Hora final anterior à inicial no mesmo dia
4. Validação muito restritiva

**Diagnóstico**:

```javascript
// Verificar valores no console antes de enviar
console.log('Data Inicial:', $('#txtDataInicial').val());
console.log('Hora Inicial:', $('#txtHoraInicial').val());
console.log('Data Final:', $('#txtDataFinal').val());
console.log('Hora Final:', $('#txtHoraFinal').val());
```

**Solução**:

- Verificar se data/hora final são realmente posteriores
- Considerar timezone do servidor
- Verificar se campos estão sendo preenchidos corretamente

---

### Problema 3: Fotos dos motoristas não aparecem

**Sintoma**: 
- Placeholder aparece mas foto nunca carrega
- Imagens quebradas (ícone de erro)

**Causas Possíveis**:
1. Endpoint `/api/Viagem/FotoMotorista` retorna erro
2. Base64 inválido ou corrompido
3. IntersectionObserver não está funcionando
4. Cache corrompido

**Diagnóstico**:

```javascript
// Testar endpoint manualmente
fetch('/api/Viagem/FotoMotorista?id=guid-do-motorista')
    .then(r => r.json())
    .then(data => {
        console.log('Foto recebida:', data.fotoBase64 ? 'Sim' : 'Não');
        console.log('Tamanho:', data.fotoBase64?.length);
    });
```

**Solução**:

- Verificar se endpoint retorna Base64 válido
- Limpar cache: `FtxFotoCache.clear()`
- Verificar se IntersectionObserver está observando elementos corretos

---

### Problema 4: Modal de Finalização não abre

**Sintoma**: 
- Clica no botão "Finalizar" mas nada acontece
- Modal não aparece

**Causas Possíveis**:
1. Bootstrap não foi carregado
2. ID do modal está incorreto
3. Erro JavaScript antes do handler
4. Botão está desabilitado

**Diagnóstico**:

```javascript
// Verificar se Bootstrap está disponível
console.log('Bootstrap disponível:', typeof bootstrap !== 'undefined');

// Testar abertura manual
$('#modalFinalizaViagem').modal('show');

// Verificar se handler está registrado
console.log('Handler registrado:', $('#tblViagem .btn-fundo-laranja').length);
```

**Solução**:

- Verificar se Bootstrap foi carregado
- Verificar se ID do modal está correto
- Verificar console por erros JavaScript

---

### Problema 5: Ocorrências não são salvas

**Sintoma**: 
- Adiciona ocorrência no modal
- Finaliza viagem
- Ocorrência não aparece após recarregar

**Causas Possíveis**:
1. Ocorrências não estão sendo coletadas corretamente
2. Erro no endpoint de criação de ocorrência
3. Upload de imagem falhou

**Solução**:

- Verificar se `OcorrenciaViagem.coletarOcorrenciasSimples()` está retornando dados
- Verificar Network Tab para requisições de ocorrências
- Verificar logs do servidor para erros

---

### Problema 6: Cálculo de custos incorreto

**Sintoma**: 
- Custos exibidos não batem com valores esperados
- Valores zerados ou muito altos

**Causas Possíveis**:
1. Dados de entrada incorretos (KM, tempo, etc.)
2. Fórmulas de cálculo incorretas
3. Dados de referência desatualizados (salário motorista, preço combustível)

**Solução**:

- Verificar dados de entrada no modal
- Verificar fórmulas de cálculo no backend
- Verificar se dados de referência estão atualizados

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Expansão Completa da Documentação

**Descrição**:
Documentação expandida de ~250 linhas para mais de 700 linhas, incluindo:
- Detalhamento completo da arquitetura e estrutura de arquivos
- Explicação detalhada do sistema de filtros e DataTable
- Documentação completa do modal de finalização
- Sistema de lazy loading de fotos explicado
- Gestão de ocorrências documentada
- Documentação completa de todos os endpoints API
- Validações frontend e backend documentadas
- Exemplos práticos de uso
- Troubleshooting expandido com 6 problemas comuns e soluções

**Arquivos Afetados**:
- `Documentacao/Pages/Viagens - Index.md` (expansão completa)

**Status**: ✅ **Documentado e Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 2.0

---

## [06/01/2026] - Criação da Documentação Inicial

**Descrição**:
Documentação inicial do módulo de Controle de Viagens (Index), cobrindo listagem, filtros, finalização e ocorrências.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do módulo de Controle de Viagens (Index), cobrindo listagem, filtros, finalização e ocorrências.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
