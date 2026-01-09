# Documentação: ViewViagensAgenda.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW que consolida viagens formatadas para exibição em calendário/agenda. Inclui campos específicos para componentes de calendário (start, end, cores) e informações de eventos relacionados.

## Estrutura do Model

```csharp
public class ViewViagensAgenda
{
    public Guid ViagemId { get; set; }
    public string? Descricao { get; set; }
    public DateTime? DataInicial { get; set; }
    public DateTime? HoraInicio { get; set; }
    public string? Status { get; set; }
    public bool? StatusAgendamento { get; set; }
    public bool? FoiAgendamento { get; set; }
    public string? Finalidade { get; set; }
    public string? NomeEvento { get; set; }
    public Guid? VeiculoId { get; set; }
    public Guid? MotoristaId { get; set; }
    public Guid? EventoId { get; set; }
    public string? Titulo { get; set; }
    public DateTime? Start { get; set; }          // Para calendário
    public DateTime? End { get; set; }            // Para calendário
    public DateTime? DataFinal { get; set; }
    public DateTime? HoraFim { get; set; }
    public string? CorEvento { get; set; }
    public string? CorTexto { get; set; }
    public string? DescricaoEvento { get; set; }
    public string? DescricaoMontada { get; set; }
}
```

## Interconexões

Usada por `AgendaController` e `Pages/Agenda/Index.cshtml` para exibir viagens no calendário.

## Notas Importantes

1. **Formato Calendário**: Campos Start/End para compatibilidade com componentes de calendário
2. **Cores**: CorEvento e CorTexto para personalização visual
3. **Eventos**: Inclui informações de eventos relacionados

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
