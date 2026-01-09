# Documentação: ViewFluxoEconomildoData.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW similar a `ViewFluxoEconomildo`, mas com campo Data como DateTime em vez de string formatada. Usada para consultas que precisam ordenar/filtrar por data.

## Estrutura do Model

```csharp
public class ViewFluxoEconomildoData
{
    public Guid VeiculoId { get; set; }
    public Guid ViagemEconomildoId { get; set; }
    public Guid MotoristaId { get; set; }
    public string? TipoCondutor { get; set; }
    public DateTime? Data { get; set; }           // DateTime raw
    public string? MOB { get; set; }
    public string? HoraInicio { get; set; }
    public string? HoraFim { get; set; }
    public int? QtdPassageiros { get; set; }
    public string? NomeMotorista { get; set; }
    public string? DescricaoVeiculo { get; set; }
}
```

## Notas Importantes

1. **Data Raw**: Campo Data é DateTime para ordenação/filtros
2. **Diferença**: Similar a ViewFluxoEconomildo mas com Data como DateTime

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
