# Documentação: RepactuacaoVeiculo.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `RepactuacaoVeiculo` registra valores individuais de cada veículo durante repactuação de contrato de locação. Permite ajustar valores por veículo específico.

## Estrutura do Model

```csharp
public class RepactuacaoVeiculo
{
    [Key]
    public Guid RepactuacaoVeiculoId { get; set; }

    [Display(Name = "Repactuação")]
    public Guid RepactuacaoContratoId { get; set; }
    [ForeignKey("RepactuacaoContratoId")]
    public virtual RepactuacaoContrato RepactuacaoContrato { get; set; }

    [Display(Name = "Veículo")]
    public Guid VeiculoId { get; set; }
    [ForeignKey("VeiculoId")]
    public virtual Veiculo Veiculo { get; set; }

    [DataType(DataType.Currency)]
    [Display(Name = "Valor (R$)")]
    public double? Valor { get; set; }

    [Display(Name = "Observação")]
    public string? Observacao { get; set; }
}
```

## Interconexões

Controllers de repactuação de contratos usam para ajustar valores por veículo.

## Notas Importantes

1. **Repactuação**: Vinculado a RepactuacaoContrato
2. **Valor Individual**: Permite ajustar valor por veículo específico

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
