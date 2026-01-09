# Documentação: ViagemCalendarDTO.cs

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
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O DTO `ViagemCalendarDTO` é um objeto de transferência de dados usado para representar viagens no formato compatível com componentes de calendário (como FullCalendar ou Syncfusion Schedule). Facilita a conversão de dados de viagem para o formato esperado pelos componentes de calendário.

**Principais características:**

✅ **Formato de Calendário**: Estrutura compatível com FullCalendar/Syncfusion  
✅ **Campos de Data/Hora Separados**: Mantém data e hora separadas além de campos combinados  
✅ **Cores Personalizáveis**: Suporta cores de fundo e texto para eventos  
✅ **DTO Simples**: Apenas transferência de dados, sem lógica de negócio

### Objetivo

O `ViagemCalendarDTO` resolve o problema de:
- Converter dados de viagem para formato de calendário
- Manter compatibilidade com diferentes componentes de calendário
- Facilitar serialização JSON para APIs
- Separar dados de apresentação de dados de negócio

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ASP.NET Core | 5.0+ | Serialização JSON |
| FullCalendar | - | Componente de calendário (opcional) |
| Syncfusion EJ2 | - | Componente Schedule (opcional) |

### Padrões de Design

- **DTO Pattern**: Objeto apenas para transferência de dados
- **Adapter Pattern**: Adapta dados de Viagem para formato de calendário

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/DTO/ViagemCalendarDTO.cs
```

### Arquivos Relacionados
- `Controllers/AgendaController.cs` - Endpoints que retornam eventos
- `Pages/Agenda/Index.cshtml` - Página do calendário
- `Models/Cadastros/Agenda.cs` - Model relacionado
- `Models/Views/ViewViagensAgenda.cs` - View que alimenta dados

---

## Estrutura do Model

```csharp
public class ViagemCalendarDTO
{
    public Guid id { get; set; }
    public string title { get; set; }
    public DateTime? start { get; set; }        // Data/hora combinada início
    public DateTime? end { get; set; }          // Data/hora combinada fim
    public DateTime? dataInicial { get; set; }  // Data inicial separada
    public DateTime? horaInicio { get; set; }   // Hora inicial separada
    public DateTime? dataFinal { get; set; }    // Data final separada
    public DateTime? horaFim { get; set; }      // Hora final separada
    public string backgroundColor { get; set; }
    public string textColor { get; set; }
    public string descricao { get; set; }
}
```

**Propriedades:**

- `id` (Guid): ID da viagem (compatível com FullCalendar)
- `title` (string): Título do evento no calendário
- `start` (DateTime?): Data/hora de início combinada (formato FullCalendar)
- `end` (DateTime?): Data/hora de fim combinada (formato FullCalendar)
- `dataInicial` (DateTime?): Data inicial separada
- `horaInicio` (DateTime?): Hora inicial separada
- `dataFinal` (DateTime?): Data final separada
- `horaFim` (DateTime?): Hora final separada
- `backgroundColor` (string): Cor de fundo do evento (hex ou nome)
- `textColor` (string): Cor do texto do evento
- `descricao` (string): Descrição detalhada do evento

**Nota**: Campos `start` e `end` são para compatibilidade com FullCalendar. Campos separados (`dataInicial`, `horaInicio`, etc.) são específicos do FrotiX.

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **AgendaController.GetEventos()** → Converte Viagens para DTO

**Quando**: Calendário precisa carregar eventos  
**Por quê**: Converter dados de viagem para formato de calendário

```csharp
[HttpGet]
[Route("GetEventos")]
public IActionResult GetEventos(DateTime? start, DateTime? end)
{
    var viagens = _unitOfWork.ViewViagensAgenda
        .GetAll(v => v.DataInicial >= start && v.DataInicial <= end)
        .Select(v => new ViagemCalendarDTO
        {
            id = v.ViagemId,
            title = v.Titulo ?? $"Viagem {v.NoFichaVistoria}",
            start = v.HoraInicio ?? v.DataInicial,
            end = v.HoraFim ?? v.DataFinal ?? v.DataInicial.AddHours(1),
            dataInicial = v.DataInicial,
            horaInicio = v.HoraInicio,
            dataFinal = v.DataFinal,
            horaFim = v.HoraFim,
            backgroundColor = ObterCorPorStatus(v.Status),
            textColor = "#ffffff",
            descricao = v.Descricao
        })
        .ToList();
    
    return Ok(viagens);
}
```

#### 2. **Frontend (JavaScript)** → Consome DTO via AJAX

**Quando**: Calendário carrega eventos  
**Por quê**: Receber dados no formato esperado

```javascript
$.ajax({
    url: '/api/Agenda/GetEventos',
    data: { start: inicioMes, end: fimMes },
    success: function(eventos) {
        // eventos é array de ViagemCalendarDTO
        $('#calendar').fullCalendar('addEventSource', eventos);
    }
});
```

### O Que Este Arquivo Usa

- **ViewViagensAgenda**: Fonte de dados das viagens
- **Viagem**: Tabela origem

### Fluxo de Dados

```
ViewViagensAgenda (VIEW SQL)
    ↓
AgendaController.GetEventos()
    ↓
Conversão para ViagemCalendarDTO
    ↓
Serialização JSON
    ↓
Frontend (FullCalendar/Syncfusion)
    ↓
Calendário renderizado
```

---

## Exemplos de Uso

### Cenário 1: Converter Viagem para Evento de Calendário

**Situação**: API precisa retornar viagem como evento

**Código**:
```csharp
var viagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == viagemId);

var evento = new ViagemCalendarDTO
{
    id = viagem.ViagemId,
    title = $"Viagem {viagem.NoFichaVistoria} - {viagem.Origem} → {viagem.Destino}",
    start = viagem.HoraInicio ?? viagem.DataInicial,
    end = viagem.HoraFim ?? viagem.DataFinal ?? viagem.DataInicial.AddHours(1),
    dataInicial = viagem.DataInicial,
    horaInicio = viagem.HoraInicio,
    dataFinal = viagem.DataFinal,
    horaFim = viagem.HoraFim,
    backgroundColor = ObterCorPorStatus(viagem.Status),
    textColor = "#ffffff",
    descricao = $"Finalidade: {viagem.Finalidade}"
};

return Ok(evento);
```

**Resultado**: DTO pronto para serialização JSON

---

## Troubleshooting

### Problema: Eventos não aparecem no calendário

**Sintoma**: API retorna dados mas calendário não exibe

**Causa**: Formato de data/hora incorreto ou campos obrigatórios faltando

**Solução**: Verificar se `start` e `end` estão no formato correto (ISO 8601)

---

## Notas Importantes

1. **DTO**: Apenas transferência de dados, sem validações
2. **Formato**: Compatível com FullCalendar e Syncfusion Schedule
3. **Campos Duplicados**: `start/end` e `dataInicial/horaInicio` servem propósitos diferentes
4. **Cores**: Valores hexadecimais ou nomes CSS válidos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do DTO `ViagemCalendarDTO`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
