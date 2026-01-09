# Documentação: Agenda.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estrutura do Model](#estrutura-do-model)
5. [Interconexões](#interconexões)
6. [Lógica de Negócio](#lógica-de-negócio)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Model `Agenda` representa um evento de viagem agendada no calendário do sistema. É usado para exibir viagens agendadas, realizadas e canceladas em formato de calendário, permitindo visualização temporal das atividades da frota.

**Principais características:**

✅ **Visualização em Calendário**: Representa viagens como eventos no calendário  
✅ **Cores Personalizadas**: Cada tipo de viagem pode ter cor diferente  
✅ **Status de Viagem**: Reflete o status atual da viagem (Agendada, Realizada, Cancelada)  
✅ **Dia Todo ou Horário Específico**: Suporta eventos de dia inteiro ou com horário  
✅ **Integração com Viagem**: Vinculado diretamente à tabela Viagem

### Objetivo

O `Agenda` resolve o problema de:
- Visualizar viagens em formato de calendário
- Identificar rapidamente viagens agendadas vs realizadas
- Organizar visualmente atividades da frota por data
- Facilitar agendamento e planejamento de viagens
- Integrar com componentes de calendário (Syncfusion, FullCalendar)

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Entity Framework Core | 5.0+ | ORM |
| Syncfusion EJ2 | - | Componente de calendário |
| FullCalendar | - | Alternativa de calendário |

### Padrões de Design

- **DTO Pattern**: `Agenda` é um DTO para visualização, não uma tabela
- **View Pattern**: Dados vêm de view `ViewViagensAgenda`

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/Cadastros/Agenda.cs
```

### Arquivos Relacionados
- `Controllers/AgendaController.cs` - Endpoints para eventos do calendário
- `Pages/Agenda/Index.cshtml` - Página do calendário
- `Models/Views/ViewViagensAgenda.cs` - View que alimenta a agenda
- `wwwroot/js/agenda/*.js` - JavaScript do calendário

---

## Estrutura do Model

```csharp
public class Agenda
{
    public Guid ViagemId { get; set; }
    public DateTime HoraInicial { get; set; }
    public DateTime HoraFinal { get; set; }
    public DateTime DataInicial { get; set; }
    public string Descricao { get; set; }
    public string Titulo { get; set; }
    public string Status { get; set; }
    public bool DiaTodo { get; set; }
    public string CorEvento { get; set; }
    public string CorTexto { get; set; }
    public string Finalidade { get; set; }
}
```

**Propriedades Principais:**

- `ViagemId` (Guid): ID da viagem relacionada
- `HoraInicial` (DateTime): Hora de início do evento
- `HoraFinal` (DateTime): Hora de término do evento
- `DataInicial` (DateTime): Data inicial da viagem
- `Descricao` (string): Descrição detalhada do evento
- `Titulo` (string): Título exibido no calendário
- `Status` (string): Status da viagem (Agendada, Realizada, Cancelada)
- `DiaTodo` (bool): Se o evento ocupa o dia inteiro
- `CorEvento` (string): Cor de fundo do evento (hex ou nome)
- `CorTexto` (string): Cor do texto do evento
- `Finalidade` (string): Finalidade da viagem

### Classe: `AgendaViewModel`

```csharp
public class AgendaViewModel
{
    public string Status { get; set; }
}
```

**Uso**: ViewModel simples para filtros de status.

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **AgendaController.GetEventos()** → Lista Eventos do Calendário

**Quando**: Calendário precisa carregar eventos  
**Por quê**: Retornar viagens formatadas como eventos de calendário

```csharp
[HttpGet]
[Route("GetEventos")]
public IActionResult GetEventos(DateTime? start, DateTime? end)
{
    var viagens = _unitOfWork.ViewViagensAgenda
        .GetAll(v => v.DataInicial >= start && v.DataInicial <= end)
        .Select(v => new Agenda
        {
            ViagemId = v.ViagemId,
            Titulo = v.Titulo,
            DataInicial = v.DataInicial,
            HoraInicial = v.HoraInicio ?? v.DataInicial,
            HoraFinal = v.HoraFim ?? v.DataInicial.AddHours(1),
            Status = v.Status,
            CorEvento = ObterCorPorStatus(v.Status),
            // ...
        })
        .ToList();
    
    return Ok(viagens);
}
```

#### 2. **Pages/Agenda/Index.cshtml** → Renderiza Calendário

**Quando**: Usuário acessa página de agenda  
**Por quê**: Exibir calendário com eventos

```razor
@model FrotiX.Models.Agenda

<ejs-schedule id="schedule" 
              dataSource="@ViewData["eventos"]"
              eventSettings="@(new ScheduleEventSettings { DataSource = Model })">
</ejs-schedule>
```

### O Que Este Arquivo Usa

- **ViewViagensAgenda**: Fonte de dados das viagens
- **Viagem**: Tabela origem dos dados

### Fluxo de Dados

```
ViewViagensAgenda (VIEW SQL)
    ↓
AgendaController.GetEventos()
    ↓
Conversão para Agenda (DTO)
    ↓
JSON para frontend
    ↓
Syncfusion Schedule Component
    ↓
Calendário renderizado
```

---

## Lógica de Negócio

### Determinação de Cores por Status

As cores dos eventos são determinadas pelo status da viagem:

```csharp
private string ObterCorPorStatus(string status)
{
    return status switch
    {
        "Agendada" => "#007bff",    // Azul
        "Realizada" => "#28a745",    // Verde
        "Cancelada" => "#dc3545",    // Vermelho
        "Em Andamento" => "#ffc107", // Amarelo
        _ => "#6c757d"               // Cinza (padrão)
    };
}
```

### Evento de Dia Todo vs Horário Específico

```csharp
if (viagem.DiaTodo)
{
    agenda.HoraInicial = viagem.DataInicial.Date; // 00:00
    agenda.HoraFinal = viagem.DataInicial.Date.AddDays(1); // 23:59
}
else
{
    agenda.HoraInicial = viagem.HoraInicio ?? viagem.DataInicial;
    agenda.HoraFinal = viagem.HoraFim ?? agenda.HoraInicial.AddHours(1);
}
```

---

## Exemplos de Uso

### Cenário 1: Carregar Eventos do Mês

**Situação**: Calendário precisa carregar eventos do mês atual

**Código**:
```csharp
var inicioMes = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
var fimMes = inicioMes.AddMonths(1).AddDays(-1);

var eventos = _unitOfWork.ViewViagensAgenda
    .GetAll(v => v.DataInicial >= inicioMes && v.DataInicial <= fimMes)
    .Select(v => new Agenda { /* mapeamento */ })
    .ToList();
```

**Resultado**: Lista de eventos do mês para exibição no calendário

---

## Troubleshooting

### Problema: Eventos não aparecem no calendário

**Sintoma**: Calendário está vazio mesmo com viagens cadastradas

**Causa**: Filtro de data ou conversão incorreta

**Solução**: Verificar range de datas e mapeamento de `ViewViagensAgenda` para `Agenda`

---

## Notas Importantes

1. **DTO**: `Agenda` é um DTO, não uma tabela
2. **Fonte de Dados**: Dados vêm de `ViewViagensAgenda`
3. **Formato**: Compatível com Syncfusion Schedule e FullCalendar
4. **Performance**: View otimizada para consultas de calendário

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `Agenda`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
