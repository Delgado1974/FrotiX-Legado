# Documentação: ViewProcuraFicha.md

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW simples usada para busca de fichas de vistoria por motorista, veículo e período.

## Estrutura do Model

```csharp
public class ViewProcuraFicha
{
    public Guid MotoristaId { get; set; }
    public Guid VeiculoId { get; set; }
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public string? HoraInicio { get; set; }
    public string? HoraFim { get; set; }
    public int? NoFichaVistoria { get; set; }
}
```

## Notas Importantes

1. **Busca**: VIEW para busca de fichas
2. **Filtros**: Por motorista, veículo, período e número de ficha

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
