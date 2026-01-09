# Documentação: Agenda de Viagens

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
6. [Interface do Calendário](#interface-do-calendário)
7. [Modal de Agendamento](#modal-de-agendamento)
8. [Sistema de Recorrência](#sistema-de-recorrência)
9. [Validações](#validações)
10. [Endpoints API](#endpoints-api)
11. [Frontend e Dependências](#frontend-e-dependências)
12. [Exemplos de Uso](#exemplos-de-uso)
13. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Agenda de Viagens** (`Pages/Agenda/Index.cshtml`) é o **painel operacional central** do sistema FrotiX para o agendamento, visualização e gestão completa de todas as viagens e eventos da frota. Esta funcionalidade é uma das mais complexas do sistema, envolvendo múltiplos arquivos JavaScript modulares, lógica de recorrência avançada, validações inteligentes e integração com diversos serviços.

### Objetivo

A Agenda permite que os usuários:
- **Visualizem** todas as viagens e eventos em um calendário interativo
- **Agendem** novas viagens com configurações de recorrência complexas
- **Editem** agendamentos existentes (com suporte a edição em massa de recorrentes)
- **Transformem** agendamentos em viagens abertas ou realizadas
- **Monitorem** a ocupação de veículos e motoristas em tempo real
- **Gerenciem** conflitos de horário automaticamente

### Características Principais

- ✅ **Visualização Mensal/Semanal/Diária**: Calendário completo (FullCalendar 6) com navegação intuitiva e suporte a múltiplas visualizações
- ✅ **Legenda de Status Visual**: Cores distintas para cada status (Agendamento, Evento, Aberta, Realizada, Cancelada) com legenda interativa
- ✅ **Modal Unificado (Upsert)**: Interface única e complexa para criar, editar e visualizar agendamentos e viagens
- ✅ **Recorrência Avançada**: Suporte completo a agendamentos repetitivos:
  - **Diária**: Todos os dias entre duas datas
  - **Semanal**: Dias específicos da semana (ex: Segunda, Quarta, Sexta)
  - **Quinzenal**: A cada 2 semanas nos dias selecionados
  - **Mensal**: No mesmo dia do mês (ex: dia 15 de cada mês)
  - **Variada**: Datas específicas selecionadas manualmente no calendário
- ✅ **Validação em Tempo Real**: Verifica disponibilidade de veículos e motoristas antes de salvar
- ✅ **Validação Inteligente (IA)**: Sistema de validação avançada para datas, horas e quilometragem com alertas contextuais
- ✅ **Gestão de Conflitos**: Detecta e previne sobreposição de horários para veículos e motoristas
- ✅ **Integração com Relatórios**: Visualização de fichas de viagem diretamente no modal
- ✅ **Suporte a Eventos**: Cadastro rápido de eventos e associação com viagens
- ✅ **Gestão de Requisitantes**: Cadastro rápido de requisitantes e setores diretamente do modal

---

## Arquitetura

### Visão Geral da Arquitetura

A Agenda utiliza uma arquitetura **modular e escalável**, dividindo responsabilidades entre:
- **Backend (ASP.NET Core)**: Processamento de dados, validações de negócio e persistência
- **Frontend Modular (JavaScript)**: Lógica de interface, validações client-side e comunicação com API
- **Bibliotecas de Terceiros**: Componentes UI ricos (FullCalendar, Syncfusion, Kendo)

### Padrões de Design Utilizados

1. **Repository Pattern**: Acesso a dados através de `IUnitOfWork` e repositórios específicos
2. **Service Layer**: Lógica de negócio encapsulada em services (`AgendamentoService`, `ViagemService`)
3. **Modular JavaScript**: Código frontend organizado em módulos independentes e reutilizáveis
4. **Dependency Injection**: Serviços injetados via construtor no backend
5. **API RESTful**: Comunicação padronizada entre frontend e backend

---

## Estrutura de Arquivos

### Arquivos Principais

```
FrotiX.Site/
├── Pages/
│   └── Agenda/
│       ├── Index.cshtml              # View Principal (1600+ linhas)
│       │                             # - HTML do modal e calendário
│       │                             # - Configurações de componentes Syncfusion
│       │                             # - Scripts inline de inicialização
│       │                             # - Templates de foto de motorista
│       │
│       └── Index.cshtml.cs           # PageModel (46 linhas)
│                                     # - Inicialização de ViewData
│                                     # - Carregamento de listas (motoristas, veículos, etc.)
│
├── Controllers/
│   └── AgendaController.cs           # API Controller (1500+ linhas)
│                                     # - CarregaViagens: Retorna eventos do calendário
│                                     # - Agendamento: Cria/atualiza agendamentos
│                                     # - VerificarAgendamento: Valida conflitos
│                                     # - ObterAgendamento: Busca dados para edição
│                                     # - Métodos de recorrência e transformação
│
├── wwwroot/js/agendamento/          # Módulo JavaScript Modularizado
│   ├── main.js                       # Ponto de entrada (2400+ linhas)
│   │                                 # - Inicialização de componentes
│   │                                 # - Configuração de botões e eventos
│   │                                 # - Validações de campos
│   │                                 # - Handlers de recorrência
│   │
│   ├── components/
│   │   ├── calendario.js             # Configuração do FullCalendar (400+ linhas)
│   │   │                             # - Inicialização do calendário
│   │   │                             # - Event handlers (click, drag, resize)
│   │   │                             # - Formatação de eventos
│   │   │
│   │   ├── modal-config.js           # Configuração de títulos do modal (200+ linhas)
│   │   │                             # - Títulos dinâmicos por tipo
│   │   │                             # - Ícones e cores personalizadas
│   │   │
│   │   ├── modal-viagem-novo.js      # Lógica completa do modal (2700+ linhas)
│   │   │                             # - Criação de objetos de agendamento
│   │   │                             # - Envio e comunicação com API
│   │   │                             # - Edição de agendamentos
│   │   │                             # - Limpeza e inicialização de campos
│   │   │
│   │   ├── recorrencia.js            # Lógica de recorrência (500+ linhas)
│   │   │                             # - Geração de datas por tipo
│   │   │                             # - Validação de períodos
│   │   │                             # - Cálculo de datas semanais/mensais
│   │   │
│   │   ├── recorrencia-init.js       # Inicialização de controles de recorrência
│   │   ├── recorrencia-logic.js      # Lógica adicional de recorrência
│   │   ├── validacao.js              # Validações completas (800+ linhas)
│   │   │                             # - Validação de todos os campos
│   │   │                             # - Validações de negócio
│   │   │                             # - Validações de recorrência
│   │   │
│   │   ├── controls-init.js          # Inicialização de controles Syncfusion
│   │   ├── event-handlers.js         # Handlers de eventos do calendário
│   │   ├── dialogs.js                # Gerenciamento de diálogos
│   │   ├── exibe-viagem.js           # Exibição de dados de viagem
│   │   ├── evento.js                 # Lógica específica de eventos
│   │   ├── relatorio.js              # Integração com relatórios Telerik
│   │   └── reportviewer-close-guard.js # Proteção ao fechar relatório
│   │
│   ├── services/
│   │   ├── agendamento.service.js    # Service de agendamentos (300+ linhas)
│   │   │                             # - CRUD de agendamentos
│   │   │                             # - Busca e validações
│   │   │
│   │   ├── viagem.service.js         # Service de viagens (200+ linhas)
│   │   │                             # - Operações com viagens
│   │   │                             # - Verificação de status
│   │   │
│   │   ├── evento.service.js         # Service de eventos
│   │   └── requisitante.service.js   # Service de requisitantes
│   │
│   ├── core/
│   │   ├── api-client.js             # Cliente HTTP para APIs
│   │   ├── state.js                  # Gerenciamento de estado
│   │   └── ajax-helper.js            # Helpers para AJAX
│   │
│   └── utils/
│       ├── date.utils.js             # Utilitários de data
│       ├── formatters.js             # Formatadores de dados
│       ├── calendario-config.js      # Configurações do calendário
│       ├── syncfusion.utils.js       # Utilitários Syncfusion
│       └── kendo-editor-helper.js    # Helpers do editor Kendo
│
├── wwwroot/css/
│   ├── modal-viagens-consolidado.css # Estilos do modal
│   └── modal-viagens-headers.css     # Estilos dos headers
│
└── Models/
    └── Cadastros/Agenda.cs           # Modelo de dados da Agenda
```

### Arquivos Relacionados

- `Repository/ViagemRepository.cs` - Acesso a dados de viagens
- `Repository/EventoRepository.cs` - Acesso a dados de eventos
- `Repository/RequisitanteRepository.cs` - Acesso a dados de requisitantes
- `Services/ViagemEstatisticaService.cs` - Cálculo de estatísticas (usado em validações)
- `Models/DTO/ViagemCalendarDTO.cs` - DTO para eventos do calendário
- `Models/Cadastros/Viagem.cs` - Modelo principal de viagem

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso Específico |
|------------|--------|----------------|
| **FullCalendar** | 6.1.15 | Componente visual de calendário com suporte a múltiplas visualizações |
| **Syncfusion EJ2** | Latest | Dropdowns, DatePickers, NumericTextBox, ComboBox, MultiSelect, DropDownTree |
| **Kendo UI** | 2024.3.806 | Editor de texto rico, Upload, Report Viewer |
| **ASP.NET Core** | 3.1+ | Backend API, Razor Pages, Dependency Injection |
| **jQuery** | 3.6.0 | Manipulação DOM, AJAX, Event Handlers |
| **Bootstrap** | 5.x | Modais, Layout Responsivo |
| **Moment.js** | Latest | Manipulação de datas e horas |
| **PDF.js** | 2.2.2 | Visualização de PDFs de fichas de vistoria |
| **SweetAlert2** | Latest | Alertas e confirmações elegantes |
| **Telerik Reporting** | Latest | Geração e visualização de relatórios |

---

## Lógica de Negócio

### Fluxo Principal de Criação de Agendamento

O processo de criação de um agendamento segue este fluxo:

```
1. Usuário clica em uma data no calendário
   ↓
2. Modal abre em modo "Novo Agendamento"
   ↓
3. Usuário preenche dados básicos (data, hora, origem, destino)
   ↓
4. Sistema valida campos obrigatórios (frontend)
   ↓
5. Se recorrência selecionada:
   - Sistema gera lista de datas baseada no tipo
   - Valida período máximo (365 dias)
   ↓
6. Usuário clica "Salvar"
   ↓
7. Validação completa (frontend + backend)
   ↓
8. Verificação de conflitos (veículo/motorista)
   ↓
9. Se válido:
   - Cria N registros no banco (se recorrente)
   - OU cria 1 registro (se único)
   ↓
10. Calendário atualiza automaticamente
```

### Estados de uma Viagem

Uma viagem pode estar em um dos seguintes estados:

| Status | Descrição | Cor no Calendário | Ações Permitidas |
|--------|-----------|-------------------|------------------|
| **Agendada** | Viagem agendada mas não iniciada | 🟠 #D55102 | Editar, Cancelar, Transformar em Viagem |
| **Aberta** | Viagem em andamento | 🟢 #3d5c3d | Editar, Finalizar, Cancelar |
| **Realizada** | Viagem concluída | 🔵 #154c62 | Visualizar apenas (sem edição) |
| **Cancelada** | Viagem cancelada | 🔴 #722F37 | Visualizar apenas (sem edição) |

### Transformação de Agendamento em Viagem

Quando um agendamento é transformado em viagem, ocorrem as seguintes ações:

1. **Status muda** de "Agendada" para "Aberta" ou "Realizada"
2. **Campos de finalização** são habilitados (Data Final, Hora Final, KM Final)
3. **Ficha de Vistoria** pode ser preenchida
4. **Quilometragem** é carregada automaticamente do veículo
5. **Data de Criação** é registrada com usuário atual
6. **Flag `FoiAgendamento`** é definida como `true` para histórico

---

## Interconexões

### Quem Chama Este Módulo

A Agenda é chamada por:
- **Navegação Principal**: Link no menu lateral (`/Agenda`)
- **Dashboard de Viagens**: Links para criar agendamento rápido
- **Página de Viagens**: Botão "Agendar Nova Viagem"

### O Que Este Módulo Chama

#### Backend (Controllers)

**AgendaController.cs** chama:
- `_unitOfWork.Viagem.*` - Operações CRUD de viagens
- `_unitOfWork.Evento.*` - Busca de eventos
- `_unitOfWork.Requisitante.*` - Busca de requisitantes
- `_context.ViewViagensAgenda` - View otimizada para calendário
- `ViagemEstatisticaService` - Cálculo de estatísticas para validações

**ViagemController.cs** (chamado indiretamente):
- `GET /api/Viagem/PegarStatusViagem` - Verifica se viagem está aberta
- `GET /api/Viagem/FotoMotorista` - Busca foto do motorista

#### Frontend (JavaScript)

**main.js** chama:
- `window.InitializeCalendar()` - Inicializa calendário
- `window.criarAgendamentoNovo()` - Cria objeto de agendamento
- `window.enviarNovoAgendamento()` - Envia para API
- `window.recuperarViagemEdicao()` - Busca dados para edição
- `window.editarAgendamento()` - Processa edição
- `window.handleRecurrence()` - Processa recorrência
- `window.ValidaCampos()` - Valida formulário completo
- `ValidadorFinalizacaoIA` - Validações inteligentes (se disponível)

**agendamento.service.js** chama:
- `window.ApiClient.get()` - Requisições GET
- `window.ApiClient.post()` - Requisições POST

**calendario.js** chama:
- `window.abrirModalEdicao()` - Abre modal para edição
- `window.abrirModalNovo()` - Abre modal para novo agendamento
- `window.calendar.refetchEvents()` - Atualiza eventos do calendário

### Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO                                  │
│              (Interação com Interface)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (JavaScript)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ main.js                                               │  │
│  │ - Inicialização                                       │  │
│  │ - Event Handlers                                     │  │
│  │ - Validações                                         │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ calendario.js                                         │  │
│  │ - Renderização do FullCalendar                       │  │
│  │ - Eventos de clique                                  │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ modal-viagem-novo.js                                  │  │
│  │ - Gerenciamento do modal                             │  │
│  │ - Criação de objetos                                  │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ services/agendamento.service.js                       │  │
│  │ - Comunicação HTTP com API                           │  │
│  └───────────────┬──────────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────────┘
                   │ HTTP (REST API)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (ASP.NET Core)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ AgendaController.cs                                   │  │
│  │ - Validações de negócio                              │  │
│  │ - Processamento de recorrência                       │  │
│  │ - Verificação de conflitos                           │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ IUnitOfWork                                           │  │
│  │ - Abstração de acesso a dados                        │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ ViagemRepository / EventoRepository / etc.          │  │
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
│  - View: ViewViagensAgenda                                  │
│  - Tabelas relacionadas: Evento, Requisitante, etc.        │
└─────────────────────────────────────────────────────────────┘
```

### Quando Cada Componente é Chamado

| Situação | Componente Chamado | Quando |
|----------|-------------------|--------|
| **Página carrega** | `main.js → InitializeCalendar()` | `$(document).ready()` |
| **Usuário clica em data** | `calendario.js → dateClick handler` | Evento FullCalendar |
| **Usuário clica em evento** | `calendario.js → eventClick handler` | Evento FullCalendar |
| **Modal abre** | `modal-viagem-novo.js → abrirModalNovo()` | Clique em data vazia |
| **Modal abre para edição** | `modal-viagem-novo.js → abrirModalEdicao()` | Clique em evento existente |
| **Usuário preenche formulário** | `validacao.js → ValidaCampos()` | Focusout em campos |
| **Usuário salva** | `main.js → handleCriarNovoAgendamento()` | Clique em "Salvar" |
| **Sistema valida conflitos** | `AgendaController → VerificarAgendamento()` | Antes de salvar |
| **Sistema cria agendamento** | `AgendaController → Agendamento()` | Após validações |
| **Calendário atualiza** | `calendario.js → refetchEvents()` | Após salvar/excluir |

---

## Interface do Calendário

O calendário é o componente visual central da Agenda, renderizado dentro da `div#agenda` e alimentado por dados da API.

### Inicialização do Calendário

**Arquivo**: `wwwroot/js/agendamento/components/calendario.js`  
**Função**: `window.InitializeCalendar(URL)`

**Código Principal**:
```javascript
var calendarEl = document.getElementById("agenda");
window.calendar = new FullCalendar.Calendar(calendarEl, {
    timeZone: "local",
    lazyFetching: true,  // Carrega eventos sob demanda
    headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay"
    },
    buttonText: {
        today: "Hoje",
        dayGridMonth: "mensal",
        timeGridWeek: "semanal",
        timeGridDay: "diário"
    },
    initialView: "diaSemana",  // Alterado em: 08/01/2026
    locale: "pt-br",
    events: {
        url: "/api/Agenda/CarregaViagens",
        method: "GET",
        failure: function() {
            AppToast.show('Vermelho', 'Erro ao carregar eventos!');
        }
    },
    eventClick: function(info) {
        // Abre modal para edição
        abrirModalEdicao(info.event.id);
    },
    dateClick: function(info) {
        // Abre modal para novo agendamento
        abrirModalNovo(info.dateStr);
    },
    eventDidMount: function(info) {
        // Personalização visual de cada evento
        // Adiciona tooltips, classes CSS, etc.
    }
});
calendar.render();
```

### Legenda de Cores

A legenda é renderizada acima do calendário e mostra o significado de cada cor:

| Status | Cor Hexadecimal | Cor Visual | Descrição |
|--------|----------------|------------|-----------|
| **Agendamento** | #D55102 | 🟠 Laranja | Viagem agendada mas não iniciada |
| **Evento** | #4C2B08 | 🟤 Marrom | Evento cadastrado no sistema |
| **Aberta** | #3d5c3d | 🟢 Verde | Viagem em andamento |
| **Realizada** | #154c62 | 🔵 Azul Escuro | Viagem concluída com sucesso |
| **Cancelada** | #722F37 | 🔴 Vermelho Escuro | Viagem cancelada |

**Código da Legenda** (em `Index.cshtml`):
```html
<div class="legenda-cores">
    <div class="legenda-item">
        <div class="legenda-bola" style="background-color: #D55102;"></div>
        <span class="legenda-texto">Agendamento</span>
    </div>
    <!-- ... outros itens ... -->
</div>
```

### Carregamento de Eventos

O FullCalendar faz requisições automáticas para `/api/Agenda/CarregaViagens` sempre que:
- A página carrega pela primeira vez
- O usuário navega para outro mês/semana/dia
- `calendar.refetchEvents()` é chamado manualmente

**Parâmetros enviados**:
- `start`: Data inicial do período (ISO 8601)
- `end`: Data final do período (ISO 8601)

**Resposta esperada** (JSON):
```json
[
  {
    "id": "guid-da-viagem",
    "title": "Viagem para São Paulo",
    "start": "2026-01-15T10:00:00",
    "end": "2026-01-15T11:00:00",
    "backgroundColor": "#D55102",
    "textColor": "#FFFFFF",
    "extendedProps": {
      "status": "Agendada",
      "veiculo": "ABC-1234"
    }
  }
]
```

---

## Modal de Agendamento

O modal `#modalViagens` é uma **interface extremamente complexa** que gerencia todo o ciclo de vida de uma viagem, desde o agendamento até a finalização. Ele possui mais de **50 campos** organizados em seções lógicas.

### Estrutura do Modal

O modal é dividido em **7 seções principais**, cada uma com sua própria lógica e validações:

#### 1. Informações Básicas

**Campos**:
- `txtDataInicial` (Syncfusion DatePicker) - Data inicial da viagem
- `txtHoraInicial` (Syncfusion TimePicker) - Hora inicial
- `txtDataFinal` (Input Date) - Data final (apenas para viagens)
- `txtHoraFinal` (Input Time) - Hora final (apenas para viagens)
- `txtDuracao` (Calculado) - Duração calculada automaticamente
- `txtNoFichaVistoria` (Input) - Número da ficha de vistoria

**Lógica**:
- A duração é calculada automaticamente quando data/hora final são preenchidas
- A ficha de vistoria só aparece quando transformando agendamento em viagem
- Validação IA verifica se data final não é futura

**Código de Cálculo de Duração** (`main.js`):
```javascript
window.calcularDuracaoViagem = function() {
    const dataInicial = document.getElementById("txtDataInicial")?.ej2_instances?.[0]?.value;
    const horaInicial = $("#txtHoraInicial").val();
    const dataFinal = $("#txtDataFinal").val();
    const horaFinal = $("#txtHoraFinal").val();
    
    if (!dataInicial || !horaInicial || !dataFinal || !horaFinal) {
        $("#txtDuracao").val("");
        return;
    }
    
    // Combina data + hora
    const inicio = moment(`${dataInicial} ${horaInicial}`, "YYYY-MM-DD HH:mm");
    const fim = moment(`${dataFinal} ${horaFinal}`, "YYYY-MM-DD HH:mm");
    
    // Calcula diferença
    const duracao = moment.duration(fim.diff(inicio));
    const horas = Math.floor(duracao.asHours());
    const minutos = duracao.minutes();
    
    $("#txtDuracao").val(`${horas}h ${minutos}min`);
};
```

#### 2. Roteiro

**Campos**:
- `txtOrigem` (Syncfusion ComboBox) - Local de origem (autocomplete)
- `txtDestino` (Syncfusion ComboBox) - Local de destino (autocomplete)
- `lstFinalidade` (Syncfusion DropDownTree) - Finalidade hierárquica

**Lógica**:
- Origem e Destino são preenchidos com valores históricos (últimas viagens)
- Finalidade é um dropdown hierárquico (ex: "Transporte > Executivo > Reunião")
- Quando Finalidade = "Evento", mostra seção de eventos

**Código de Autocomplete** (`modal-viagem-novo.js`):
```javascript
// Origem e Destino são populados com valores históricos
const listaOrigem = @Html.Raw(Json.Serialize(ViewData["ListaOrigem"]));
const listaDestino = @Html.Raw(Json.Serialize(ViewData["ListaDestino"]));

// Syncfusion ComboBox com autocomplete
var origemCombo = new ej.dropdowns.ComboBox({
    dataSource: listaOrigem,
    allowCustom: true,  // Permite digitar valores novos
    filterType: 'Contains',
    placeholder: 'Digite ou selecione a origem'
});
```

#### 3. Evento

**Campos** (visíveis apenas se Finalidade = "Evento"):
- `lstEventos` (Syncfusion ComboBox) - Lista de eventos cadastrados
- `btnInserirEvento` - Botão para cadastro rápido
- Accordion com formulário de novo evento

**Lógica**:
- Se evento selecionado, busca dados do evento e preenche automaticamente
- Permite cadastro rápido de evento sem sair do modal
- Valida se evento está ativo antes de associar

#### 4. Transporte

**Campos**:
- `lstMotorista` (Syncfusion ComboBox) - Motorista com foto
- `lstVeiculo` (Syncfusion ComboBox) - Veículo
- `txtKmAtual` (Readonly) - KM atual do veículo
- `txtKmInicial` (Syncfusion NumericTextBox) - KM inicial da viagem
- `txtKmFinal` (Syncfusion NumericTextBox) - KM final (apenas viagens)
- `txtKmPercorrido` (Calculado) - KM rodados
- `lstCombustivelInicial` (Syncfusion ComboBox) - Nível de combustível inicial
- `lstCombustivelFinal` (Syncfusion ComboBox) - Nível de combustível final

**Lógica Especial - Foto do Motorista**:
O ComboBox de motorista usa templates customizados para exibir fotos:

```javascript
// Template para itens da lista (dropdown)
motoristaCombo.itemTemplate = function(data) {
    let imgSrc = '/images/barbudo.jpg'; // Padrão
    
    if (data.Foto && data.Foto.startsWith('data:image')) {
        imgSrc = data.Foto; // Base64 do servidor
    }
    
    return `
        <div class="d-flex align-items-center">
            <img src="${imgSrc}" 
                 style="height:40px; width:40px; border-radius:50%;" />
            <span>${data.Nome}</span>
        </div>`;
};
```

**Validação de KM**:
- KM Inicial deve ser igual ao KM Atual do veículo
- KM Final deve ser maior que KM Inicial
- Sistema calcula KM Percorrido automaticamente
- Validação IA verifica se KM está dentro do padrão do veículo

#### 5. Requisitante

**Campos**:
- `lstRequisitante` (Syncfusion ComboBox) - Requisitante
- `ddtSetor` (Syncfusion DropDownTree) - Setor hierárquico
- `txtRamal` (Syncfusion TextBox) - Ramal do requisitante
- `btnRequisitante` - Botão para cadastro rápido

**Lógica**:
- Quando requisitante é selecionado, busca setor automaticamente
- Permite cadastro rápido de requisitante via accordion
- Valida se requisitante está ativo

#### 6. Recorrência

**Campos** (visíveis apenas para novos agendamentos):
- `lstRecorrente` (Syncfusion DropDownList) - Sim/Não
- `lstPeriodos` (Syncfusion DropDownList) - Tipo (Diária, Semanal, etc.)
- `lstDias` (Syncfusion MultiSelect) - Dias da semana (para Semanal/Quinzenal)
- `lstDiasMes` (Syncfusion DropDownList) - Dia do mês (para Mensal)
- `calDatasSelecionadas` (Syncfusion Calendar) - Calendário para seleção (para Variada)
- `txtFinalRecorrencia` (Syncfusion DatePicker) - Data final da recorrência

**Lógica Complexa**:
A recorrência é gerenciada pelo arquivo `recorrencia.js` e `recorrencia-logic.js`. Veja seção específica abaixo.

#### 7. Descrição

**Campo**:
- `rteDescricao` (Kendo UI Editor) - Editor de texto rico

**Funcionalidades**:
- Formatação de texto (negrito, itálico, listas)
- Upload de imagens
- Links e tabelas
- HTML completo

### Estados do Modal

O modal pode estar em diferentes estados, cada um com comportamentos específicos:

| Estado | Quando | Campos Habilitados | Botões Visíveis |
|--------|--------|-------------------|-----------------|
| **Novo Agendamento** | Clique em data vazia | Todos (exceto finalização) | Salvar, Cancelar |
| **Editar Agendamento** | Clique em evento "Agendada" | Todos (exceto finalização) | Salvar, Apagar, Cancelar |
| **Editar Viagem Aberta** | Clique em evento "Aberta" | Todos | Salvar, Apagar, Cancelar |
| **Visualizar Viagem Realizada** | Clique em evento "Realizada" | Nenhum (readonly) | Imprimir, Fechar |
| **Visualizar Viagem Cancelada** | Clique em evento "Cancelada" | Nenhum (readonly) | Fechar |
| **Transformar em Viagem** | Botão "Registra Viagem" | Todos incluindo finalização | Registra Viagem, Cancelar |

### Inicialização do Modal

Quando o modal abre, ocorre uma sequência complexa de inicializações:

**Arquivo**: `main.js` - Função `configurarModais()`

**Sequência de Inicialização**:
```javascript
$("#modalViagens").on("shown.bs.modal", function(event) {
    // 1. Resetar flags
    window.modalJaFoiLimpo = false;
    
    // 2. Inicializar event handlers dos controles
    if (window.aguardarControlesEInicializar) {
        window.aguardarControlesEInicializar();
    }
    
    // 3. Verificar se é novo ou edição
    const viagemId = document.getElementById("txtViagemId").value;
    const isEdicao = viagemId && viagemId !== "";
    
    // 4. Inicializar controles de recorrência (se novo)
    setTimeout(() => {
        if (!window.carregandoViagemExistente) {
            window.inicializarRecorrencia();
        }
    }, 500);
    
    // 5. Compactar campos de recorrência
    setTimeout(() => {
        RecorrenciasCompactar();
    }, 800);
    
    // 6. Configurar eventos do requisitante
    setTimeout(() => {
        // Configuração complexa do evento SELECT
    }, 2000);
    
    // 7. Cálculos iniciais
    window.calcularDistanciaViagem();
    window.calcularDuracaoViagem();
});
```

---

## Sistema de Recorrência

O sistema de recorrência é uma das funcionalidades mais complexas da Agenda, permitindo criar múltiplos agendamentos de uma vez com diferentes padrões.

### Tipos de Recorrência

#### 1. Diária (D)

**Como Funciona**:
- Cria um agendamento para **cada dia** entre a data inicial e a data final (inclusive)
- Não considera fins de semana ou feriados
- Exemplo: De 01/01/2026 até 31/01/2026 = 31 agendamentos

**Código** (`main.js`):
```javascript
if (periodoRecorrente === "D") {
    const dataInicial = document.getElementById("txtDataInicial")?.ej2_instances?.[0]?.value;
    const dataFinalRecorrencia = document.getElementById("txtFinalRecorrencia")?.ej2_instances?.[0]?.value;
    
    const datasRecorrentes = [];
    let dataAtual = new Date(dataInicial);
    const dataFim = new Date(dataFinalRecorrencia);
    
    // ✅ CORREÇÃO: usar <= para incluir o último dia
    while (dataAtual <= dataFim) {
        datasRecorrentes.push(window.toDateOnlyString(dataAtual));
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    await window.handleRecurrence(periodoRecorrente, datasRecorrentes);
}
```

#### 2. Semanal (S)

**Como Funciona**:
- Repete nos **dias da semana selecionados** (ex: Segunda, Quarta, Sexta)
- Considera apenas os dias selecionados dentro do período
- Exemplo: Segunda e Quarta, de 01/01 até 31/01 = ~8-9 agendamentos

**Código** (`main.js`):
```javascript
if (periodoRecorrente === "S") {
    const lstDias = document.getElementById("lstDias")?.ej2_instances?.[0];
    const diasSelecionados = lstDias?.value || []; // [0, 2, 4] = Dom, Ter, Qui
    
    const datasRecorrentes = gerarDatasSemanais(
        dataInicial,
        dataFinalRecorrencia,
        diasSelecionados,
        1 // Intervalo de 1 semana
    );
    
    await window.handleRecurrence(periodoRecorrente, datasRecorrentes);
}
```

**Função `gerarDatasSemanais`**:
```javascript
function gerarDatasSemanais(dataInicial, dataFinal, diasSemana, intervaloSemanas = 1) {
    const datas = [];
    let dataAtual = new Date(dataInicial);
    const fim = new Date(dataFinal);
    let contadorSemanas = 0;
    
    while (dataAtual <= fim) {
        const diaSemanaAtual = dataAtual.getDay(); // 0=Domingo, 6=Sábado
        
        if (diasSemana.includes(diaSemanaAtual)) {
            // Para quinzenal, só adiciona em semanas alternadas
            if (intervaloSemanas === 1 || contadorSemanas % intervaloSemanas === 0) {
                datas.push(window.toDateOnlyString(dataAtual));
            }
        }
        
        dataAtual.setDate(dataAtual.getDate() + 1);
        
        // Incrementa contador de semanas no domingo
        if (dataAtual.getDay() === 0) {
            contadorSemanas++;
        }
    }
    
    return datas;
}
```

#### 3. Quinzenal (Q)

**Como Funciona**:
- Similar à Semanal, mas repete a **cada 2 semanas**
- Usa a mesma função `gerarDatasSemanais` com `intervaloSemanas = 2`

#### 4. Mensal (M)

**Como Funciona**:
- Repete no **mesmo dia do mês** (ex: dia 15)
- Avança um mês a cada iteração
- Exemplo: Dia 15, de 15/01 até 15/12 = 12 agendamentos

**Código**:
```javascript
if (periodoRecorrente === "M") {
    const diaMes = document.getElementById("lstDiasMes")?.ej2_instances?.[0]?.value;
    
    const datasRecorrentes = [];
    let dataAtual = new Date(dataInicial);
    const dataFim = new Date(dataFinalRecorrencia);
    
    while (dataAtual <= dataFim) {
        datasRecorrentes.push(window.toDateOnlyString(dataAtual));
        // Avança para o próximo mês
        dataAtual.setMonth(dataAtual.getMonth() + 1);
    }
}
```

#### 5. Variada (V)

**Como Funciona**:
- Usa um **calendário Syncfusion** para seleção manual de datas
- O usuário clica nas datas desejadas no calendário
- Cria agendamentos apenas para as datas selecionadas
- Mais flexível, permite padrões irregulares

**Código**:
```javascript
if (periodoRecorrente === "V") {
    const calDatasSelecionadas = document.getElementById("calDatasSelecionadas")?.ej2_instances?.[0];
    const datasSelecionadas = calDatasSelecionadas?.values || [];
    
    const datasFormatadas = datasSelecionadas.map(d =>
        window.toDateOnlyString(new Date(d))
    );
    
    await window.handleRecurrence(periodoRecorrente, datasFormatadas);
}
```

### Processamento de Recorrência no Backend

Quando múltiplas datas são geradas, o backend cria um registro para cada data:

**Arquivo**: `Controllers/AgendaController.cs` - Método `AgendamentoAsync()`

**Lógica**:
```csharp
if (isNew == true && viagem.Recorrente == "S") {
    // Para cada data gerada
    foreach (var dataSelecionada in DatasSelecionadasAdicao) {
        Viagem novaViagem = new Viagem();
        
        // Copia todos os dados do agendamento original
        AtualizarDadosAgendamento(novaViagem, viagem);
        
        // Define data específica desta ocorrência
        novaViagem.DataInicial = dataSelecionada;
        novaViagem.HoraInicio = // Combina data + hora
        
        // Define RecorrenciaViagemId (ID da primeira viagem)
        if (primeiraIteracao) {
            novaViagem.RecorrenciaViagemId = novaViagem.ViagemId;
        } else {
            novaViagem.RecorrenciaViagemId = primeiraViagemId;
        }
        
        _unitOfWork.Viagem.Add(novaViagem);
    }
    
    _unitOfWork.Save();
}
```

### Edição de Agendamentos Recorrentes

Quando um agendamento recorrente é editado, o sistema oferece duas opções:

1. **Editar Apenas Este**: Modifica apenas o agendamento atual
2. **Editar Todos**: Modifica todos os agendamentos da série

**Código** (`main.js`):
```javascript
if (objViagem.recorrente === "S") {
    const confirmacao = await Alerta.Confirmar(
        "Editar Agendamento Recorrente",
        "Deseja aplicar as alterações a todos os agendamentos recorrentes ou apenas ao atual?",
        "Todos",
        "Apenas ao Atual"
    );
    
    window.editarTodosRecorrentes = confirmacao;
    
    await window.editarAgendamentoRecorrente(
        viagemId,
        confirmacao,
        objViagem.dataInicial,
        objViagem.recorrenciaViagemId,
        window.editarTodosRecorrentes
    );
}
```

---

## Validações

O sistema possui **múltiplas camadas de validação** para garantir a integridade dos dados.

### Validações Frontend

**Arquivo**: `wwwroot/js/agendamento/components/validacao.js`  
**Classe**: `ValidadorAgendamento`

#### Validações Básicas

1. **Data Inicial**:
   - Campo obrigatório
   - Não pode ser anterior a hoje (com exceção de 1 dia para ajustes)
   - Valida formato

2. **Finalidade**:
   - Campo obrigatório
   - Deve ser selecionada do dropdown hierárquico

3. **Origem e Destino**:
   - Campos obrigatórios
   - Podem ser valores novos (custom) ou existentes

4. **Motorista e Veículo**:
   - Campos obrigatórios
   - Verifica se estão ativos

5. **Requisitante e Setor**:
   - Campos obrigatórios
   - Setor é carregado automaticamente quando requisitante é selecionado

#### Validações de Finalização

Quando campos de finalização são preenchidos (Data Final, Hora Final, KM Final), validações adicionais são executadas:

1. **Data Final não pode ser futura** (bloqueante)
2. **Data Final deve ser >= Data Inicial** (bloqueante)
3. **Hora Final deve ser > Hora Inicial** (se mesmo dia) (bloqueante)
4. **KM Final deve ser > KM Inicial** (bloqueante)
5. **Duração não pode ser muito longa** (aviso com confirmação)
6. **KM fora do padrão do veículo** (aviso com confirmação - IA)

#### Validações de Recorrência

1. **Período máximo**: 365 dias entre data inicial e final
2. **Dias selecionados**: Pelo menos 1 dia para Semanal/Quinzenal
3. **Dia do mês**: Obrigatório para Mensal
4. **Datas selecionadas**: Pelo menos 1 data para Variada

### Validações Backend

**Arquivo**: `Controllers/AgendaController.cs`

#### Validações de Negócio

1. **Data Final não pode ser futura**:
```csharp
if (viagem.DataFinal.HasValue && viagem.DataFinal.Value.Date > DateTime.Today) {
    return BadRequest(new {
        success = false,
        message = "A Data Final não pode ser superior à data atual."
    });
}
```

2. **Verificação de Conflitos**:
O sistema verifica se há conflitos de horário antes de salvar:

```csharp
[HttpGet("VerificarAgendamento")]
public async Task<IActionResult> VerificarAgendamento(
    Guid? veiculoId,
    Guid? motoristaId,
    DateTime dataInicial,
    DateTime? dataFinal,
    Guid? viagemIdExcluir = null) // Para edição
{
    // Busca viagens que se sobrepõem
    var conflitos = await _unitOfWork.Viagem.GetAll()
        .Where(v =>
            (v.VeiculoId == veiculoId || v.MotoristaId == motoristaId) &&
            v.Status != "Cancelada" &&
            v.ViagemId != viagemIdExcluir &&
            // Lógica de sobreposição de horários
            ((v.DataInicial <= dataFinal && v.DataFinal >= dataInicial) ||
             (v.DataInicial <= dataInicial && v.HoraFim >= horaInicial))
        )
        .ToListAsync();
    
    if (conflitos.Any()) {
        return Ok(new { temConflito = true, conflitos });
    }
    
    return Ok(new { temConflito = false });
}
```

### Validação Inteligente (IA)

O sistema possui validação inteligente opcional que aprende padrões de cada veículo:

**Arquivo**: `wwwroot/js/validacao/ValidadorFinalizacaoIA.js` (se disponível)

**Funcionalidades**:
- Analisa histórico de KM do veículo
- Detecta anomalias (KM muito alto/baixo)
- Sugere correções baseadas em padrões históricos
- Valida datas/horas com contexto (duração muito longa, etc.)

**Exemplo de Validação IA de KM**:
```javascript
async analisarKm(veiculoId, kmInicial, kmFinal) {
    // Busca estatísticas do veículo
    const stats = await fetch(`/api/Viagem/EstatisticasVeiculo?veiculoId=${veiculoId}`);
    const dados = await stats.json();
    
    const kmRodado = kmFinal - kmInicial;
    const zScore = (kmRodado - dados.kmMedio) / dados.kmDesvioPadrao;
    
    if (Math.abs(zScore) > 2.5) {
        return {
            valido: false,
            nivel: 'aviso',
            titulo: 'Quilometragem Fora do Padrão',
            mensagem: `Este veículo normalmente percorre ${dados.kmMedio} km. Você informou ${kmRodado} km.`
        };
    }
    
    return { valido: true };
}
```

---

## Endpoints API

O controller `AgendaController.cs` gerencia todas as operações relacionadas à Agenda através de uma API RESTful.

### 1. GET `/api/Agenda/CarregaViagens`

**Descrição**: Retorna eventos formatados para o FullCalendar exibir no calendário.

**Parâmetros de Query**:
- `start` (DateTime, obrigatório): Data inicial do período (ISO 8601)
- `end` (DateTime, obrigatório): Data final do período (ISO 8601)

**Exemplo de Requisição**:
```
GET /api/Agenda/CarregaViagens?start=2026-01-01T00:00:00&end=2026-02-01T00:00:00
```

**Lógica de Processamento**:

1. **Ajuste de Timezone**: O FullCalendar envia datas em UTC, mas o banco está em UTC-3. O sistema ajusta:
```csharp
DateTime startMenos3 = start.AddHours(-3);
DateTime endMenos3 = end.AddHours(-3);
```

2. **Busca na View**: Usa a view `ViewViagensAgenda` que já calcula cores e títulos:
```csharp
var viagens = _context.ViewViagensAgenda
    .AsNoTracking()
    .Where(v => v.DataInicial.HasValue
        && v.DataInicial >= startMenos3
        && v.DataInicial < endMenos3)
    .ToList();
```

3. **Formatação para FullCalendar**: Converte para formato esperado:
```csharp
var eventos = viagens.Select(v => new {
    id = v.ViagemId.ToString(),
    title = v.Titulo ?? "Viagem",
    start = v.Start?.ToString("yyyy-MM-ddTHH:mm:ss") ?? v.DataInicial?.ToString("yyyy-MM-ddTHH:mm:ss"),
    end = v.End?.ToString("yyyy-MM-ddTHH:mm:ss") ?? v.DataInicial?.AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss"),
    backgroundColor = v.CorEvento ?? "#808080",
    textColor = v.CorTexto ?? "#FFFFFF",
    extendedProps = new {
        status = v.Status,
        veiculo = v.PlacaVeiculo,
        motorista = v.NomeMotorista
    }
}).ToList();
```

**Response** (JSON):
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Viagem para São Paulo",
    "start": "2026-01-15T10:00:00",
    "end": "2026-01-15T11:00:00",
    "backgroundColor": "#D55102",
    "textColor": "#FFFFFF",
    "extendedProps": {
      "status": "Agendada",
      "veiculo": "ABC-1234",
      "motorista": "João Silva"
    }
  }
]
```

**Performance**: 
- Usa `AsNoTracking()` para consultas read-only (mais rápido)
- View pré-calculada evita JOINs complexos em tempo de execução
- Cache implícito do Entity Framework para consultas repetidas

---

### 2. POST `/api/Agenda/Agendamento`

**Descrição**: Cria ou atualiza um agendamento/viagem. Este é o endpoint mais complexo do sistema.

**Request Body** (JSON):
```json
{
  "ViagemId": "00000000-0000-0000-0000-000000000000", // Guid.Empty para novo
  "DataInicial": "2026-01-15T10:00:00",
  "HoraInicio": "10:00:00",
  "DataFinal": "2026-01-15T14:00:00", // Opcional, apenas para viagens
  "HoraFim": "14:00:00", // Opcional
  "Origem": "São Paulo",
  "Destino": "Campinas",
  "FinalidadeId": "guid-da-finalidade",
  "MotoristaId": "guid-do-motorista",
  "VeiculoId": "guid-do-veiculo",
  "KmInicial": 50000,
  "KmFinal": 50100, // Opcional
  "RequisitanteId": "guid-do-requisitante",
  "SetorSolicitanteId": "guid-do-setor",
  "Recorrente": "S", // "N", "S", "Q", "M", "V"
  "DatasSelecionadas": ["2026-01-15", "2026-01-22"], // Para recorrência
  "Status": "Agendada", // "Agendada", "Aberta", "Realizada", "Cancelada"
  "Descricao": "<p>Descrição em HTML</p>"
}
```

**Lógica Complexa por Cenário**:

#### Cenário 1: Novo Agendamento Único (Não Recorrente)

```csharp
if (isNew == true && viagem.Recorrente != "S") {
    Viagem novaViagem = new Viagem();
    AtualizarDadosAgendamento(novaViagem, viagem);
    novaViagem.Status = "Agendada";
    novaViagem.StatusAgendamento = true;
    novaViagem.FoiAgendamento = false;
    novaViagem.UsuarioIdAgendamento = currentUserID;
    novaViagem.DataAgendamento = DateTime.Now;
    
    _unitOfWork.Viagem.Add(novaViagem);
    _unitOfWork.Save();
    
    return Ok(new { success = true, viagemId = novaViagem.ViagemId });
}
```

#### Cenário 2: Novo Agendamento Recorrente

```csharp
if (isNew == true && viagem.Recorrente == "S") {
    Guid primeiraViagemId = Guid.Empty;
    bool primeiraIteracao = true;
    
    foreach (var dataSelecionada in DatasSelecionadasAdicao) {
        Viagem novaViagem = new Viagem();
        AtualizarDadosAgendamento(novaViagem, viagem);
        novaViagem.DataInicial = dataSelecionada;
        
        if (primeiraIteracao) {
            primeiraViagemId = novaViagem.ViagemId;
            novaViagem.RecorrenciaViagemId = primeiraViagemId;
            primeiraIteracao = false;
        } else {
            novaViagem.RecorrenciaViagemId = primeiraViagemId;
        }
        
        _unitOfWork.Viagem.Add(novaViagem);
    }
    
    _unitOfWork.Save();
    return Ok(new { success = true, totalCriado = DatasSelecionadasAdicao.Count });
}
```

#### Cenário 3: Editar Agendamento Existente

```csharp
if (isNew == false) {
    var viagemExistente = await _unitOfWork.Viagem.GetFirstOrDefaultAsync(
        v => v.ViagemId == viagem.ViagemId
    );
    
    if (viagemExistente == null) {
        return NotFound();
    }
    
    // Atualiza campos
    AtualizarDadosAgendamento(viagemExistente, viagem);
    
    // Se transformando em viagem
    if (viagem.Status == "Aberta" || viagem.Status == "Realizada") {
        viagemExistente.FoiAgendamento = true;
        viagemExistente.UsuarioIdCriacao = currentUserID;
        viagemExistente.DataCriacao = DateTime.Now;
    }
    
    _unitOfWork.Viagem.Update(viagemExistente);
    _unitOfWork.Save();
    
    return Ok(new { success = true });
}
```

**Validações Executadas**:
1. Data Final não pode ser futura
2. Verificação de conflitos (veículo/motorista)
3. Validação de campos obrigatórios
4. Validação de recorrência (período máximo 365 dias)

**Response**:
```json
{
  "success": true,
  "viagemId": "guid-da-viagem",
  "message": "Agendamento criado com sucesso"
}
```

---

### 3. GET `/api/Agenda/VerificarAgendamento`

**Descrição**: Verifica se há conflitos de horário antes de salvar um agendamento.

**Parâmetros de Query**:
- `veiculoId` (Guid, opcional): ID do veículo
- `motoristaId` (Guid, opcional): ID do motorista
- `dataInicial` (DateTime, obrigatório): Data/hora inicial
- `dataFinal` (DateTime, opcional): Data/hora final
- `viagemIdExcluir` (Guid, opcional): ID da viagem a excluir da verificação (para edição)

**Exemplo de Requisição**:
```
GET /api/Agenda/VerificarAgendamento?veiculoId=xxx&dataInicial=2026-01-15T10:00:00&dataFinal=2026-01-15T14:00:00
```

**Lógica de Verificação**:

O sistema verifica se há viagens que se sobrepõem temporalmente:

```csharp
var conflitos = await _unitOfWork.Viagem.GetAll()
    .Where(v =>
        (v.VeiculoId == veiculoId || v.MotoristaId == motoristaId) &&
        v.Status != "Cancelada" &&
        v.ViagemId != viagemIdExcluir &&
        // Sobreposição: início antes do fim E fim depois do início
        v.DataInicial < dataFinal &&
        (v.DataFinal ?? v.DataInicial.AddHours(1)) > dataInicial
    )
    .Select(v => new {
        v.ViagemId,
        v.DataInicial,
        v.DataFinal,
        v.Status,
        PlacaVeiculo = v.Veiculo.Placa,
        NomeMotorista = v.Motorista.Nome
    })
    .ToListAsync();
```

**Response**:
```json
{
  "temConflito": true,
  "conflitos": [
    {
      "viagemId": "guid",
      "dataInicial": "2026-01-15T09:00:00",
      "dataFinal": "2026-01-15T12:00:00",
      "status": "Agendada",
      "placaVeiculo": "ABC-1234",
      "nomeMotorista": "João Silva"
    }
  ]
}
```

**Uso no Frontend**:
```javascript
const conflitos = await fetch(`/api/Agenda/VerificarAgendamento?veiculoId=${veiculoId}&dataInicial=${dataInicial}&dataFinal=${dataFinal}`);
const resultado = await conflitos.json();

if (resultado.temConflito) {
    const confirma = await Alerta.Confirmar(
        "Conflito de Horário",
        `O veículo/motorista já está ocupado neste horário. Deseja continuar mesmo assim?`,
        "Sim, Continuar",
        "Cancelar"
    );
    
    if (!confirma) {
        return false; // Impede salvamento
    }
}
```

---

### 4. GET `/api/Agenda/ObterAgendamento`

**Descrição**: Retorna dados completos de uma viagem específica para preencher o modal de edição.

**Parâmetros de Query**:
- `id` (Guid, obrigatório): ID da viagem

**Exemplo de Requisição**:
```
GET /api/Agenda/ObterAgendamento?id=123e4567-e89b-12d3-a456-426614174000
```

**Lógica**:

Busca a viagem com todos os relacionamentos necessários:

```csharp
var viagem = await _unitOfWork.Viagem.GetFirstOrDefaultAsync(
    v => v.ViagemId == id,
    includeProperties: "Motorista,Veiculo,Requisitante,SetorSolicitante,Evento"
);

if (viagem == null) {
    return NotFound();
}

// Monta objeto de resposta
var resposta = new {
    viagemId = viagem.ViagemId,
    dataInicial = viagem.DataInicial,
    horaInicio = viagem.HoraInicio?.ToString("HH:mm"),
    dataFinal = viagem.DataFinal,
    horaFim = viagem.HoraFim?.ToString("HH:mm"),
    origem = viagem.Origem,
    destino = viagem.Destino,
    finalidadeId = viagem.FinalidadeId,
    motoristaId = viagem.MotoristaId,
    veiculoId = viagem.VeiculoId,
    kmInicial = viagem.KmInicial,
    kmFinal = viagem.KmFinal,
    requisitanteId = viagem.RequisitanteId,
    setorSolicitanteId = viagem.SetorSolicitanteId,
    eventoId = viagem.EventoId,
    status = viagem.Status,
    descricao = viagem.Descricao,
    recorrenciaViagemId = viagem.RecorrenciaViagemId,
    recorrente = viagem.RecorrenciaViagemId != null ? "S" : "N"
};
```

**Response**:
```json
{
  "viagemId": "guid",
  "dataInicial": "2026-01-15T00:00:00",
  "horaInicio": "10:00",
  "dataFinal": null,
  "horaFim": null,
  "origem": "São Paulo",
  "destino": "Campinas",
  "finalidadeId": "guid",
  "motoristaId": "guid",
  "veiculoId": "guid",
  "kmInicial": 50000,
  "kmFinal": null,
  "requisitanteId": "guid",
  "setorSolicitanteId": "guid",
  "eventoId": null,
  "status": "Agendada",
  "descricao": "<p>Descrição</p>",
  "recorrenciaViagemId": "guid",
  "recorrente": "S"
}
```

---

### 5. GET `/api/Agenda/BuscarViagensRecorrencia`

**Descrição**: Busca todas as viagens de uma série recorrente.

**Parâmetros de Query**:
- `id` (Guid, obrigatório): ID da primeira viagem da série (RecorrenciaViagemId)

**Uso**: Quando o usuário quer editar ou excluir todos os agendamentos recorrentes.

**Response**:
```json
[
  {
    "viagemId": "guid-1",
    "dataInicial": "2026-01-15T00:00:00",
    "recorrenciaViagemId": "guid-principal",
    "status": "Agendada"
  },
  {
    "viagemId": "guid-2",
    "dataInicial": "2026-01-22T00:00:00",
    "recorrenciaViagemId": "guid-principal",
    "status": "Agendada"
  }
]
```

---

### 6. POST `/api/Agenda/ApagaAgendamento`

**Descrição**: Exclui um agendamento (soft delete ou hard delete).

**Request Body**:
```json
{
  "ViagemId": "guid-da-viagem"
}
```

**Lógica**:
- Se viagem está "Agendada": Pode excluir completamente
- Se viagem está "Aberta" ou "Realizada": Apenas pode cancelar (muda status)

---

### 7. GET `/api/Agenda/TesteView` e `/api/Agenda/DiagnosticoAgenda`

**Descrição**: Endpoints de diagnóstico e debug para troubleshooting.

**Uso**: Ajudam a identificar problemas com carregamento de eventos ou dados da view.

**Response**: Retorna estatísticas e informações de debug sobre a view e dados.

---

## Frontend e Dependências

A página Agenda possui uma estrutura de dependências complexa, carregando múltiplas bibliotecas de terceiros e scripts modulares locais.

### Bibliotecas Externas (CDN)

#### FullCalendar 6.1.15
- **CDN**: `https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js`
- **Uso**: Componente visual de calendário
- **Localização**: Carregado no `HeadBlock` do `Index.cshtml`
- **Dependências**: Nenhuma (standalone)

#### Syncfusion EJ2 (Essential JS 2)
- **CDN**: Múltiplos arquivos via bundle
- **Componentes Usados**:
  - `ej2-dropdowns` - ComboBox, DropDownList, MultiSelect, DropDownTree
  - `ej2-calendars` - DatePicker, TimePicker, Calendar
  - `ej2-inputs` - NumericTextBox, TextBox
  - `ej2-popups` - Dialog
- **Localização**: Carregado via bundle no `ScriptsBlock`
- **Dependências**: Requer jQuery

#### Kendo UI 2024.3.806
- **CDN**: `https://kendo.cdn.telerik.com/2024.3.806/js/kendo.all.min.js`
- **Componentes Usados**:
  - `kendo.ui.Editor` - Editor de texto rico para descrição
  - `kendo.ui.Upload` - Upload de arquivos (futuro)
  - `telerikReportViewer` - Visualizador de relatórios Telerik
- **Dependências**: Requer jQuery

#### jQuery 3.6.0
- **CDN**: `https://code.jquery.com/jquery-3.6.0.min.js`
- **Uso**: Manipulação DOM, AJAX, Event Handlers
- **Dependências**: Nenhuma

#### Bootstrap 5.x
- **CDN**: Via layout principal
- **Uso**: Modais, Layout Responsivo, Accordions
- **Dependências**: Requer jQuery para alguns componentes

#### Moment.js
- **CDN**: Via bundle ou local
- **Uso**: Manipulação de datas e horas, cálculos de duração
- **Dependências**: Nenhuma

#### PDF.js 2.2.2
- **CDN**: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.2.2/pdf.js`
- **Uso**: Visualização de PDFs de fichas de vistoria
- **Worker**: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.2.2/pdf.worker.js`
- **Dependências**: Nenhuma

#### SweetAlert2
- **CDN**: Via bundle ou local
- **Uso**: Alertas elegantes e confirmações
- **Wrapper**: `sweetalert_interop.js` para integração com C#

### Estrutura de Carregamento de Scripts

Os scripts são carregados em **ordem específica** no `@section ScriptsBlock` para garantir que dependências estejam disponíveis:

**Ordem de Carregamento** (`Index.cshtml`):

```html
@section ScriptsBlock {
    <!-- 1. CORE - Funcionalidades básicas -->
    <script src="~/js/agendamento/core/ajax-helper.js"></script>
    <script src="~/js/agendamento/core/state.js"></script>
    <script src="~/js/agendamento/core/api-client.js"></script>
    
    <!-- 2. UTILS - Utilitários e helpers -->
    <script src="~/js/agendamento/utils/date.utils.js"></script>
    <script src="~/js/agendamento/utils/formatters.js"></script>
    <script src="~/js/agendamento/utils/calendario-config.js"></script>
    <script src="~/js/agendamento/utils/syncfusion.utils.js"></script>
    <script src="~/js/agendamento/utils/kendo-editor-helper.js"></script>
    
    <!-- 3. SERVICES - Comunicação com API -->
    <script src="~/js/agendamento/services/agendamento.service.js"></script>
    <script src="~/js/agendamento/services/viagem.service.js"></script>
    <script src="~/js/agendamento/services/evento.service.js"></script>
    <script src="~/js/agendamento/services/requisitante.service.js"></script>
    
    <!-- 4. COMPONENTS - Componentes funcionais -->
    <script src="~/js/agendamento/components/modal-config.js"></script>
    <script src="~/js/agendamento/components/calendario.js"></script>
    <script src="~/js/agendamento/components/modal-viagem-novo.js"></script>
    <script src="~/js/agendamento/components/recorrencia.js"></script>
    <script src="~/js/agendamento/components/recorrencia-init.js"></script>
    <script src="~/js/agendamento/components/recorrencia-logic.js"></script>
    <script src="~/js/agendamento/components/validacao.js"></script>
    <script src="~/js/agendamento/components/controls-init.js"></script>
    <script src="~/js/agendamento/components/event-handlers.js"></script>
    <script src="~/js/agendamento/components/dialogs.js"></script>
    <script src="~/js/agendamento/components/exibe-viagem.js"></script>
    <script src="~/js/agendamento/components/evento.js"></script>
    <script src="~/js/agendamento/components/relatorio.js"></script>
    <script src="~/js/agendamento/components/reportviewer-close-guard.js"></script>
    
    <!-- 5. MAIN - Ponto de entrada e inicialização -->
    <script src="~/js/agendamento/main.js"></script>
}
```

### Variáveis Globais

O sistema utiliza várias variáveis globais para controle de estado:

```javascript
// Estado do modal
window.modalJaFoiLimpo = false;
window.modalIsOpening = false;
window.modalDebounceTimer = null;

// Estado de carregamento
window.carregandoViagemExistente = false;
window.ultimoViagemIdCarregado = null;

// Estado de recorrência
window.editarTodosRecorrentes = false;
window.ignorarEventosRecorrencia = false;

// Estado de transformação
window.transformandoEmViagem = false;

// Instâncias de componentes
window.calendar = null; // Instância do FullCalendar
window.defaultRTE = null; // Instância do Kendo Editor
window.telerikReportViewer = null; // Instância do Report Viewer
```

### Inicialização do Sistema

A inicialização ocorre quando o DOM está pronto:

**Arquivo**: `main.js` - Função `inicializar()`

**Sequência**:
1. Configurar localização Syncfusion (PT-BR)
2. Inicializar tooltips em modais
3. Configurar botões (Confirmar, Apagar, Cancelar, etc.)
4. Configurar validações de campos
5. Configurar modais e seus eventos
6. Configurar accordions (Requisitante, Evento)
7. Inicializar calendário
8. Carregar dados iniciais (setores, eventos)
9. Inicializar sistema de relatórios

**Código**:
```javascript
$(document).ready(function() {
    inicializar();
    console.log('[Main] Inicialização completa');
});
```

### CSS Customizado

A página utiliza CSS customizado para estilização específica:

**Arquivos**:
- `wwwroot/css/modal-viagens-consolidado.css` - Estilos do modal
- `wwwroot/css/modal-viagens-headers.css` - Estilos dos headers
- Estilos inline no `Index.cshtml` para legenda e componentes específicos

**Classes Principais**:
- `.legenda-cores` - Container da legenda
- `.legenda-item` - Item individual da legenda
- `.lstMotorista_popup` - Estilos do dropdown de motorista
- `.sw-recorrente`, `.sw-periodo` - Classes para campos de recorrência compactos

---

## Exemplos de Uso

### Exemplo 1: Criar Agendamento Único Simples

**Situação**: Usuário quer agendar uma viagem para amanhã às 10h.

**Passos**:
1. Usuário clica na data de amanhã no calendário
2. Modal abre em modo "Novo Agendamento"
3. Preenche:
   - Data Inicial: Amanhã (já preenchida automaticamente)
   - Hora Inicial: 10:00
   - Origem: "São Paulo"
   - Destino: "Campinas"
   - Finalidade: Seleciona do dropdown
   - Motorista: Seleciona do combo (com foto)
   - Veículo: Seleciona do combo
   - Requisitante: Seleciona do combo
   - Setor: Carregado automaticamente
4. Clica em "Salvar"

**O que acontece**:
- Sistema valida todos os campos
- Verifica conflitos de horário
- Cria 1 registro no banco com Status = "Agendada"
- Calendário atualiza mostrando o novo evento em laranja

**Código Executado**:
```javascript
// Frontend
const agendamento = window.criarAgendamentoNovo();
await window.enviarNovoAgendamento(agendamento);

// Backend
Viagem novaViagem = new Viagem();
AtualizarDadosAgendamento(novaViagem, viagem);
novaViagem.Status = "Agendada";
_unitOfWork.Viagem.Add(novaViagem);
_unitOfWork.Save();
```

---

### Exemplo 2: Criar Agendamento Recorrente Semanal

**Situação**: Usuário quer agendar viagem toda Segunda e Quarta às 14h, por 3 meses.

**Passos**:
1. Usuário clica em uma Segunda-feira no calendário
2. Modal abre
3. Preenche dados básicos (origem, destino, motorista, veículo)
4. Marca "Recorrente" como "Sim"
5. Seleciona "Período" como "Semanal"
6. Seleciona dias: Segunda e Quarta (no MultiSelect)
7. Define "Data Final Recorrência" para 3 meses depois
8. Clica em "Salvar"

**O que acontece**:
- Sistema gera lista de datas: Todas as Segundas e Quartas entre as duas datas
- Exemplo: De 15/01/2026 até 15/04/2026 = ~26 agendamentos
- Para cada data, cria um registro no banco
- Todos compartilham o mesmo `RecorrenciaViagemId` (ID da primeira)
- Calendário atualiza mostrando todos os eventos

**Código Executado**:
```javascript
// Frontend - Gera datas
const datasRecorrentes = gerarDatasSemanais(
    dataInicial,
    dataFinalRecorrencia,
    [1, 3], // Segunda=1, Quarta=3
    1 // Intervalo de 1 semana
);
// Resultado: ["2026-01-15", "2026-01-17", "2026-01-22", ...]

await window.handleRecurrence("S", datasRecorrentes);

// Backend - Cria registros
foreach (var dataSelecionada in DatasSelecionadasAdicao) {
    Viagem novaViagem = new Viagem();
    // ... copia dados ...
    novaViagem.DataInicial = dataSelecionada;
    novaViagem.RecorrenciaViagemId = primeiraViagemId;
    _unitOfWork.Viagem.Add(novaViagem);
}
_unitOfWork.Save();
```

---

### Exemplo 3: Transformar Agendamento em Viagem

**Situação**: O agendamento foi realizado e o usuário quer registrar os dados reais.

**Passos**:
1. Usuário clica no evento "Agendada" no calendário
2. Modal abre em modo "Editar Agendamento"
3. Clica no botão "Registra Viagem"
4. Sistema habilita campos de finalização:
   - Data Final
   - Hora Final
   - KM Final
   - Combustível Final
5. Preenche dados reais:
   - Data Final: Hoje
   - Hora Final: 16:30
   - KM Final: 50150 (KM Inicial era 50000)
6. Clica em "Registra Viagem"

**O que acontece**:
- Sistema valida que Data Final não é futura
- Valida que KM Final > KM Inicial
- Calcula KM rodados automaticamente (150 km)
- Atualiza status para "Aberta" ou "Realizada"
- Define `FoiAgendamento = true` para histórico
- Registra usuário e data de criação

**Código Executado**:
```javascript
// Frontend
$("#btnViagem").click(function() {
    // Habilita campos de finalização
    $("#divDataFinal, #divHoraFinal, #divKmFinal").show();
    
    // Busca KM atual do veículo
    $.ajax({
        url: "/Viagens/Upsert?handler=PegaKmAtualVeiculo",
        data: { id: veiculoId },
        success: function(res) {
            $("#txtKmAtual").val(res.data);
            $("#txtKmInicial").val(res.data);
        }
    });
});

// Backend
viagemExistente.Status = "Realizada";
viagemExistente.DataFinal = viagem.DataFinal;
viagemExistente.KmFinal = viagem.KmFinal;
viagemExistente.FoiAgendamento = true;
viagemExistente.UsuarioIdCriacao = currentUserID;
_unitOfWork.Viagem.Update(viagemExistente);
```

---

### Exemplo 4: Editar Todos os Agendamentos Recorrentes

**Situação**: Usuário quer mudar o horário de todos os agendamentos de uma série.

**Passos**:
1. Usuário clica em um dos eventos recorrentes
2. Modal abre
3. Altera a Hora Inicial de 10:00 para 14:00
4. Clica em "Salvar"
5. Sistema pergunta: "Aplicar a todos ou apenas ao atual?"
6. Usuário escolhe "Todos"

**O que acontece**:
- Sistema busca todos os agendamentos com o mesmo `RecorrenciaViagemId`
- Para cada um, atualiza a Hora Inicial
- Mantém as datas individuais de cada ocorrência
- Salva todas as alterações em uma transação

**Código Executado**:
```javascript
// Frontend
const confirmacao = await Alerta.Confirmar(
    "Editar Agendamento Recorrente",
    "Aplicar a todos ou apenas ao atual?",
    "Todos",
    "Apenas ao Atual"
);

if (confirmacao) {
    // Busca todos os recorrentes
    const agendamentosRecorrentes = await window.obterAgendamentosRecorrentes(recorrenciaId);
    
    // Edita cada um
    for (const agendamento of agendamentosRecorrentes) {
        await window.editarAgendamentoRecorrente(
            agendamento.viagemId,
            true, // editarTodos = true
            novaHoraInicial
        );
    }
}

// Backend
var agendamentosRecorrentes = await _unitOfWork.Viagem.GetAll()
    .Where(v => v.RecorrenciaViagemId == recorrenciaId)
    .ToListAsync();

foreach (var agendamento in agendamentosRecorrentes) {
    agendamento.HoraInicio = novaHoraInicio;
    _unitOfWork.Viagem.Update(agendamento);
}
_unitOfWork.Save();
```

---

## Troubleshooting

### Problema 1: Calendário não carrega eventos

**Sintoma**: 
- Calendário aparece vazio
- Loading infinito (spinner girando)
- Erro no console do navegador

**Causas Possíveis**:
1. Erro na API `/api/Agenda/CarregaViagens` (500 Internal Server Error)
2. Formato de data incorreto enviado pelo FullCalendar
3. View `ViewViagensAgenda` não existe ou tem erro
4. Problema de timezone (datas não correspondem ao período esperado)
5. Banco de dados inacessível ou lento

**Diagnóstico Passo a Passo**:

1. **Abrir DevTools do Navegador** (F12)
2. **Ir para aba Network**
3. **Recarregar a página**
4. **Procurar requisição** `CarregaViagens`
5. **Verificar Status Code**:
   - **200 OK**: API funcionando, verificar Response
   - **500 Internal Server Error**: Erro no servidor, verificar logs
   - **404 Not Found**: Rota não encontrada, verificar roteamento
   - **Timeout**: Banco de dados lento ou view complexa

6. **Se Status 200 mas Response vazio**:
   - Verificar se `start` e `end` estão corretos
   - Verificar se há dados no banco para o período
   - Testar endpoint diretamente: `/api/Agenda/TesteView`

7. **Verificar Console do Navegador**:
   - Procurar erros JavaScript
   - Verificar se FullCalendar foi carregado: `typeof FullCalendar !== 'undefined'`

**Solução**:

```javascript
// Adicionar tratamento de erro mais detalhado
calendar.setOption('events', {
    url: '/api/Agenda/CarregaViagens',
    failure: function(error) {
        console.error('Erro ao carregar eventos:', error);
        AppToast.show('Vermelho', 'Erro ao carregar eventos. Verifique o console.');
        
        // Tentar endpoint de diagnóstico
        fetch('/api/Agenda/DiagnosticoAgenda')
            .then(r => r.json())
            .then(diagnostico => {
                console.log('Diagnóstico:', diagnostico);
            });
    }
});
```

**Verificação no Backend**:
```csharp
// Adicionar logs detalhados
_logger.LogInformation($"[CarregaViagens] Período solicitado: {start} até {end}");
_logger.LogInformation($"[CarregaViagens] Período ajustado: {startMenos3} até {endMenos3}");
_logger.LogInformation($"[CarregaViagens] Registros encontrados: {viagens.Count}");
```

---

### Problema 2: Modal não abre ao clicar na data

**Sintoma**: 
- Clique no dia do calendário não faz nada
- Nenhum modal aparece
- Sem erros visíveis

**Causas Possíveis**:
1. Event handler `dateClick` não foi registrado
2. Bootstrap não carregou (`bootstrap.Modal` undefined)
3. Elemento `#modalViagens` não existe no DOM
4. JavaScript não foi carregado ou teve erro antes

**Diagnóstico**:

1. **Verificar Console**:
```javascript
// No console do navegador
typeof FullCalendar !== 'undefined' // Deve retornar "object"
typeof bootstrap !== 'undefined' // Deve retornar "object"
document.getElementById('modalViagens') // Deve retornar elemento
```

2. **Verificar Event Handler**:
```javascript
// Verificar se dateClick está configurado
console.log(window.calendar.getOption('dateClick')); // Deve retornar função
```

3. **Testar Manualmente**:
```javascript
// No console
$("#modalViagens").modal("show"); // Deve abrir o modal
```

**Solução**:

```javascript
// Garantir que dateClick está configurado
calendar.setOption('dateClick', function(info) {
    console.log('Date clicked:', info.dateStr);
    try {
        abrirModalNovo(info.dateStr);
    } catch (error) {
        console.error('Erro ao abrir modal:', error);
        Alerta.Erro('Erro', 'Não foi possível abrir o modal. Verifique o console.');
    }
});
```

---

### Problema 3: Recorrência não gera todas as viagens

**Sintoma**: 
- Selecionou "Semanal" por 1 ano (52 semanas)
- Esperava ~104 agendamentos (2 dias por semana)
- Mas apenas 1 ou poucos foram criados

**Causas Possíveis**:
1. Timeout na API (processamento demorado)
2. Erro durante iteração no backend
3. Validação falhando para algumas datas
4. Transação sendo revertida por erro

**Diagnóstico**:

1. **Verificar Logs do Servidor**:
   - Procurar exceções durante `AgendamentoAsync`
   - Verificar se todas as iterações do `foreach` foram executadas

2. **Verificar Response da API**:
```javascript
// Adicionar log no frontend
const response = await fetch('/api/Agenda/Agendamento', {
    method: 'POST',
    body: JSON.stringify(agendamento)
});

const result = await response.json();
console.log('Total criado:', result.totalCriado);
console.log('Datas processadas:', result.datasProcessadas);
```

3. **Verificar Banco de Dados**:
```sql
-- Contar quantos foram realmente criados
SELECT COUNT(*) 
FROM Viagem 
WHERE RecorrenciaViagemId = 'guid-da-primeira-viagem';
```

**Solução**:

```csharp
// Adicionar tratamento de erro por item
int sucesso = 0;
int erros = 0;
var errosDetalhados = new List<string>();

foreach (var dataSelecionada in DatasSelecionadasAdicao) {
    try {
        Viagem novaViagem = new Viagem();
        // ... código de criação ...
        _unitOfWork.Viagem.Add(novaViagem);
        sucesso++;
    } catch (Exception ex) {
        erros++;
        errosDetalhados.Add($"Erro na data {dataSelecionada}: {ex.Message}");
        _logger.LogError(ex, $"Erro ao criar viagem para data {dataSelecionada}");
    }
}

_unitOfWork.Save();

return Ok(new {
    success = erros == 0,
    totalCriado = sucesso,
    totalErros = erros,
    errosDetalhados = errosDetalhados
});
```

---

### Problema 4: Foto do motorista não aparece no combo

**Sintoma**: 
- ComboBox de motorista mostra ícone quebrado
- Ou mostra imagem padrão (`/images/barbudo.jpg`) sempre
- Foto não atualiza quando motorista é selecionado

**Causas Possíveis**:
1. Template do Syncfusion não foi configurado
2. Endpoint `/api/Viagem/FotoMotorista` retorna erro
3. Base64 da imagem é inválido ou muito grande
4. Função `onLstMotoristaCreated` não foi chamada

**Diagnóstico**:

1. **Verificar se Template foi Configurado**:
```javascript
// No console, após modal abrir
const combo = document.getElementById('lstMotorista');
console.log('Template configurado:', typeof combo.ej2_instances[0].itemTemplate);
```

2. **Testar Endpoint Manualmente**:
```javascript
// No console
fetch('/api/Viagem/FotoMotorista?id=guid-do-motorista')
    .then(r => r.json())
    .then(data => {
        console.log('Foto recebida:', data.fotoBase64 ? 'Sim' : 'Não');
        console.log('Tamanho:', data.fotoBase64?.length);
    });
```

3. **Verificar Dados do ComboBox**:
```javascript
// Verificar se dados têm campo Foto
const combo = document.getElementById('lstMotorista');
const dados = combo.ej2_instances[0].dataSource;
console.log('Primeiro motorista tem foto:', dados[0]?.Foto ? 'Sim' : 'Não');
```

**Solução**:

```javascript
// Garantir que função é chamada quando modal abre
$("#modalViagens").on("shown.bs.modal", function() {
    setTimeout(() => {
        if (typeof onLstMotoristaCreated === 'function') {
            onLstMotoristaCreated();
        } else {
            console.error('onLstMotoristaCreated não está definida!');
        }
    }, 500);
});

// Adicionar fallback no template
motoristaCombo.itemTemplate = function(data) {
    if (!data) return '';
    
    let imgSrc = '/images/barbudo.jpg';
    
    // Tentar múltiplas fontes
    if (data.Foto && data.Foto.startsWith('data:image')) {
        imgSrc = data.Foto;
    } else if (data.MotoristaId) {
        // Buscar foto via API se não estiver nos dados
        fetch(`/api/Viagem/FotoMotorista?id=${data.MotoristaId}`)
            .then(r => r.json())
            .then(result => {
                if (result.fotoBase64) {
                    data.Foto = result.fotoBase64; // Cache para próxima vez
                }
            });
    }
    
    return `
        <div class="d-flex align-items-center">
            <img src="${imgSrc}" 
                 onerror="this.src='/images/barbudo.jpg';"
                 style="height:40px; width:40px; border-radius:50%;" />
            <span>${data.Nome}</span>
        </div>`;
};
```

---

### Problema 5: Validação IA não funciona

**Sintoma**: 
- Campos de finalização não mostram alertas inteligentes
- Validações básicas funcionam, mas IA não

**Causas Possíveis**:
1. Arquivo `ValidadorFinalizacaoIA.js` não foi carregado
2. Endpoint `/api/Viagem/EstatisticasVeiculo` não existe
3. Cache de estatísticas expirou ou está vazio

**Diagnóstico**:

```javascript
// Verificar se classe existe
console.log('ValidadorFinalizacaoIA disponível:', typeof ValidadorFinalizacaoIA !== 'undefined');

// Testar endpoint
fetch('/api/Viagem/EstatisticasVeiculo?veiculoId=guid')
    .then(r => r.json())
    .then(stats => console.log('Estatísticas:', stats));
```

**Solução**:

```javascript
// Adicionar verificação antes de usar IA
if (typeof ValidadorFinalizacaoIA !== 'undefined') {
    const validador = ValidadorFinalizacaoIA.obterInstancia();
    // ... usar validador ...
} else {
    console.warn('ValidadorFinalizacaoIA não disponível, usando validação básica');
    // Fallback para validação simples
}
```

---

### Problema 6: Recorrência Variada não funciona

**Sintoma**: 
- Seleciona tipo "Variada"
- Clica datas no calendário
- Mas ao salvar, nenhuma data é processada

**Causas Possíveis**:
1. Calendário Syncfusion não está inicializado
2. Evento `change` do calendário não está capturando seleções
3. Valores não estão sendo coletados corretamente

**Diagnóstico**:

```javascript
// Verificar se calendário existe
const cal = document.getElementById('calDatasSelecionadas');
console.log('Calendário existe:', cal !== null);
console.log('Instância Syncfusion:', cal?.ej2_instances?.[0]);

// Verificar valores selecionados
const valores = cal?.ej2_instances?.[0]?.values;
console.log('Datas selecionadas:', valores);
```

**Solução**:

```javascript
// Garantir inicialização correta do calendário
const calendarObj = new ej.calendars.Calendar({
    isMultiSelection: true,
    values: [],
    change: function(args) {
        console.log('Datas selecionadas:', args.values);
        // Atualizar campo hidden ou variável global
        window.datasSelecionadasVariada = args.values;
    }
});
calendarObj.appendTo('#calDatasSelecionadas');
```

---

### Problema 7: Performance - Calendário lento com muitos eventos

**Sintoma**: 
- Calendário demora para carregar
- Navegação entre meses é lenta
- Interface trava ao abrir modal

**Causas Possíveis**:
1. Muitos eventos sendo carregados de uma vez
2. View `ViewViagensAgenda` não está otimizada
3. Fotos de motoristas sendo carregadas todas de uma vez
4. Falta de índices no banco de dados

**Soluções**:

1. **Otimizar View**:
```sql
-- Adicionar índices
CREATE INDEX IX_ViewViagensAgenda_DataInicial 
ON ViewViagensAgenda(DataInicial);

CREATE INDEX IX_ViewViagensAgenda_Status 
ON ViewViagensAgenda(Status);
```

2. **Lazy Loading de Fotos**:
```javascript
// Carregar fotos apenas quando necessário
motoristaCombo.itemTemplate = function(data) {
    // Não carregar foto até hover ou seleção
    return `<span>${data.Nome}</span>`;
};

// Carregar foto apenas quando selecionado
motoristaCombo.change = function(args) {
    if (args.itemData?.MotoristaId) {
        carregarFotoMotorista(args.itemData.MotoristaId);
    }
};
```

3. **Pagination no Backend**:
```csharp
// Limitar quantidade de eventos retornados
var viagens = _context.ViewViagensAgenda
    .AsNoTracking()
    .Where(v => /* filtros */)
    .Take(1000) // Limite máximo
    .ToList();
```

---

### Problema 8: Edição de Recorrente não funciona corretamente

**Sintoma**: 
- Edita um agendamento recorrente
- Escolhe "Editar Todos"
- Mas apenas o atual é editado

**Causas Possíveis**:
1. `RecorrenciaViagemId` não está sendo usado corretamente
2. Query não está encontrando todos os recorrentes
3. Flag `editarTodosRecorrentes` não está sendo passada

**Diagnóstico**:

```javascript
// Verificar flag
console.log('Editar todos:', window.editarTodosRecorrentes);

// Verificar RecorrenciaViagemId
const recorrenciaId = document.getElementById('txtRecorrenciaViagemId').value;
console.log('RecorrenciaViagemId:', recorrenciaId);

// Testar busca de recorrentes
fetch(`/api/Agenda/BuscarViagensRecorrencia?id=${recorrenciaId}`)
    .then(r => r.json())
    .then(viagens => console.log('Viagens encontradas:', viagens.length));
```

**Solução**:

```csharp
// Garantir que busca todos os recorrentes corretamente
var agendamentosRecorrentes = await _unitOfWork.Viagem.GetAll()
    .Where(v => 
        (v.RecorrenciaViagemId == recorrenciaId || v.ViagemId == recorrenciaId) &&
        v.Status != "Cancelada"
    )
    .ToListAsync();

_logger.LogInformation($"[EditarRecorrente] Encontrados {agendamentosRecorrentes.Count} agendamentos para editar");
```

---

---

## Referências e Links Relacionados

### Documentação Relacionada
- [Documentação de Viagens - Index](./Viagens%20-%20Index.md) - Página de listagem de viagens
- [Documentação de Viagens - Upsert](./Viagens%20-%20Upsert.md) - Página de criação/edição de viagens
- [Documentação do Controller AgendaController](../Controllers/AgendaController.md) - Detalhes da API
- [Documentação do Service ViagemEstatisticaService](../Services/ViagemEstatisticaService.md) - Validações IA

### Recursos Externos
- [FullCalendar Documentation](https://fullcalendar.io/docs)
- [Syncfusion EJ2 Documentation](https://ej2.syncfusion.com/documentation/)
- [Kendo UI Documentation](https://docs.telerik.com/kendo-ui)
- [ASP.NET Core Razor Pages](https://docs.microsoft.com/en-us/aspnet/core/razor-pages/)

### Arquivos de Configuração
- `nav.json` - Configuração do menu de navegação (define link para Agenda)
- `appsettings.json` - Configurações da aplicação (connection strings, etc.)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Expansão Completa da Documentação

**Descrição**:
Documentação expandida de ~220 linhas para mais de 1000 linhas, incluindo:
- Detalhamento completo da arquitetura e estrutura de arquivos
- Explicação detalhada de todas as funções principais
- Documentação completa de interconexões entre componentes
- Exemplos práticos de uso para cada cenário
- Troubleshooting expandido com 8 problemas comuns e soluções
- Documentação completa de todos os endpoints API
- Explicação detalhada do sistema de recorrência
- Validações frontend e backend documentadas

**Arquivos Afetados**:
- `Documentacao/Pages/Agenda - Index.md` (expansão completa)

**Status**: ✅ **Documentado e Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 2.0

---

## [06/01/2026] - Criação da Documentação Inicial

**Descrição**:
Documentação inicial da Agenda de Viagens com estrutura básica.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0

---

## Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 2.0 | 08/01/2026 | Expansão completa para 1000+ linhas com detalhamento profundo |
| 1.0 | 06/01/2026 | Versão inicial com estrutura básica |

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema de Documentação FrotiX  
**Versão**: 2.0
