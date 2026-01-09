# Documentação: CorridasTaxiLegCanceladas.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `CorridasTaxiLegCanceladas` representa corridas de táxi legislativo que foram canceladas. Registra motivo e tipo de cancelamento.

## Estrutura do Model

```csharp
public class CorridasCanceladasTaxiLeg
{
    [Key]
    public Guid CorridaCanceladaId { get; set; }

    public string? Origem { get; set; }
    public string? Setor { get; set; }
    public string? SetorExtra { get; set; }
    public string? Unidade { get; set; }
    public string? UnidadeExtra { get; set; }
    public int? QtdPassageiros { get; set; }
    public string? MotivoUso { get; set; }

    public DateTime? DataAgenda { get; set; }
    public string? HoraAgenda { get; set; }
    public DateTime? DataHoraCancelamento { get; set; }
    public string? HoraCancelamento { get; set; }
    public string? TipoCancelamento { get; set; }
    public string? MotivoCancelamento { get; set; }
    public int? TempoEspera { get; set; }
}
```

## Notas Importantes

1. **Cancelamentos**: Registra corridas canceladas
2. **TipoCancelamento**: Indica tipo de cancelamento
3. **TempoEspera**: Tempo de espera antes do cancelamento

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
