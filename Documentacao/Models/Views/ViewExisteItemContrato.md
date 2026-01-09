# Documentação: ViewExisteItemContrato.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW que verifica existência de itens de contrato e repactuações. Usada para validações e consultas de itens de contrato.

## Estrutura do Model

```csharp
public class ViewExisteItemContrato
{
    public Guid ItemVeiculoId { get; set; }
    public Guid ExisteVeiculo { get; set; }      // Flag de existência
    public Guid RepactuacaoContratoId { get; set; }
    public int? NumItem { get; set; }
    public string? Descricao { get; set; }
    public int? Quantidade { get; set; }
    public double? ValUnitario { get; set; }
}
```

## Notas Importantes

1. **Validação**: Campo ExisteVeiculo indica se veículo existe no contrato
2. **Repactuação**: Vinculado a repactuações de contrato

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
