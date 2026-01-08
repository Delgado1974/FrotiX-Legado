# Documentação: Agenda de Viagens

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Interface do Calendário](#interface-do-calendário)
4. [Modal de Agendamento](#modal-de-agendamento)
5. [Endpoints API](#endpoints-api)
6. [Frontend e Dependências](#frontend-e-dependências)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Agenda de Viagens** é o painel operacional central para o agendamento e visualização de todas as viagens e eventos da frota. Utiliza uma interface de calendário interativo (FullCalendar) para exibir a ocupação de veículos e motoristas, permitindo criar, editar e monitorar viagens.

### Características Principais

- ✅ **Visualização Mensal/Semanal/Diária**: Calendário completo com navegação intuitiva.
- ✅ **Legenda de Status**: Cores distintas para Agendamento, Evento, Aberta, Realizada e Cancelada.
- ✅ **Modal Unificado (Upsert)**: Interface única para criar e editar agendamentos e viagens.
- ✅ **Recorrência Avançada**: Suporte a agendamentos repetitivos (Diário, Semanal, Mensal, Dias Específicos).
- ✅ **Validação em Tempo Real**: Verifica disponibilidade de veículos e motoristas.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Agenda/
│       ├── Index.cshtml             # View Principal (HTML + Configs)
│       └── Index.cshtml.cs          # PageModel (Backend Init)
│
├── Controllers/
│   └── AgendaController.cs          # API de Dados do Calendário
│
├── wwwroot/js/agendamento/          # Módulo JavaScript Modularizado
│   ├── main.js                      # Ponto de entrada
│   ├── components/
│   │   ├── calendario.js            # Configuração do FullCalendar
│   │   ├── modal-config.js          # Lógica do Modal
│   │   └── recorrencia.js           # Lógica de Recorrência
│   └── services/
│       └── agendamento.service.js   # Comunicação com API
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **FullCalendar 6** | Componente visual de calendário |
| **Syncfusion EJ2** | Dropdowns, DatePickers, NumericTextBox |
| **Kendo UI** | Upload e alguns controles legados |
| **ASP.NET Core API** | Backend de dados |
| **Modular JS** | Organização do código frontend em módulos |

---

## Interface do Calendário

O calendário é renderizado dentro da `div#agenda` e consome dados da API.

**Inicialização (`calendario.js`)**:
```javascript
var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: {
        url: '/api/Agenda/CarregaViagens',
        method: 'GET',
        failure: function() {
            AppToast.show('Vermelho', 'Erro ao carregar eventos!');
        }
    },
    eventClick: function(info) {
        abrirModalEdicao(info.event.id);
    },
    dateClick: function(info) {
        abrirModalNovo(info.dateStr);
    }
});
calendar.render();
```

**Legenda de Cores**:
- 🟠 **Agendamento**: #D55102
- 🟤 **Evento**: #4C2B08
- 🟢 **Aberta**: #3d5c3d
- 🔵 **Realizada**: #154c62
- 🔴 **Cancelada**: #722F37

---

## Modal de Agendamento

O modal `#modalViagens` é uma interface complexa dividida em seções lógicas para gerenciar todo o ciclo de vida da viagem.

### Seções do Formulário
1. **Informações Básicas**: Datas, Horas, Ficha de Vistoria (apenas viagem).
2. **Roteiro**: Origem, Destino, Finalidade (combo hierárquico).
3. **Evento**: Seleção ou cadastro rápido de eventos (se Finalidade = Evento).
4. **Transporte**: Motorista, Veículo, Quilometragem (Inicial/Final/Atual), Combustível.
5. **Requisitante**: Seleção de solicitante e setor.
6. **Recorrência**: Configuração de repetições (apenas novos agendamentos).
7. **Descrição**: Editor de texto rico para detalhes.

**Lógica de Validação (`validacao.js`)**:
```javascript
function validarFormulario() {
    if (!$("#txtDataInicial").val()) {
        mostrarErro("Data Inicial é obrigatória");
        return false;
    }
    // ... validações de hora, motorista, veículo ...
    return true;
}
```

---

## Endpoints API

O controller `AgendaController.cs` gerencia as operações.

### 1. GET `/api/Agenda/CarregaViagens`
Retorna eventos para o FullCalendar.
- **Parâmetros**: `start`, `end` (Datas ISO).
- **Lógica**: Busca na view `ViewViagensAgenda`, ajusta timezone (-3h) e formata para JSON do FullCalendar.

### 2. POST `/api/Agenda/Agendamento`
Cria ou atualiza um agendamento/viagem.
- **Lógica Complexa**:
  - Se for novo e recorrente: Cria N registros de viagem no banco.
  - Se for edição: Atualiza registro existente.
  - Se for transformação (Agendamento -> Viagem): Atualiza status e preenche dados de execução (KM, datas reais).

### 3. GET `/api/Agenda/VerificarAgendamento`
Verifica conflitos de horário para um veículo ou motorista antes de salvar.

### 4. GET `/api/Agenda/ObterAgendamento`
Retorna dados completos de uma viagem específica para preencher o modal de edição.

---

## Frontend e Dependências

A página carrega diversas bibliotecas de terceiros via CDN e scripts locais modulares.

**Bibliotecas Externas**:
- FullCalendar 6.1.15
- Kendo UI 2024.3.806
- Syncfusion EJ2 (Essential JS 2)
- PDF.js (para visualização de anexos)
- SweetAlert e Toastr (notificações)

**Estrutura Modular (`Index.cshtml`)**:
Os scripts são carregados em ordem específica no `ScriptsBlock` para garantir dependências:
1. Core (Ajax, State, ApiClient)
2. Utils (Date, Formatters)
3. Services (AgendamentoService, ViagemService)
4. Components (Modal, Calendario, Recorrencia)
5. Main (Inicialização)

---

## Troubleshooting

### Problema: Calendário não carrega eventos
**Sintoma**: Calendário aparece vazio, loading infinito ou erro no console.
**Causa**: Erro na API `/CarregaViagens` ou formato de data incorreto.
**Diagnóstico**: Verificar Network Tab do navegador. Se retornar 500, verificar logs do servidor. Se retornar 200 mas vazio, verificar filtro de datas (`start`/`end`) enviado pelo FullCalendar.

### Problema: Modal não abre ao clicar na data
**Sintoma**: Clique no dia não faz nada.
**Causa**: Script de inicialização do modal (`modal-config.js`) falhou ou dependência do Bootstrap não carregou.
**Solução**: Verificar console por erros JS. O modal depende de `bootstrap.Modal`.

### Problema: Recorrência não gera todas as viagens
**Sintoma**: Selecionou "Semanal" por 1 ano, mas gerou apenas 1 viagem.
**Causa**: Timeout na API (processamento demorado) ou erro na lógica do loop `for` no `AgendaController`.
**Solução**: Verificar logs para ver se houve exceção durante a iteração de datas.

### Problema: Foto do motorista não aparece no combo
**Sintoma**: Ícone quebrado ou imagem padrão.
**Causa**: Template do Syncfusion ComboBox falhou em renderizar ou URL da imagem (Base64) é inválida/muito grande.
**Verificação**: Função `onLstMotoristaCreated` no script inline do `Index.cshtml`.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da Agenda de Viagens.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
