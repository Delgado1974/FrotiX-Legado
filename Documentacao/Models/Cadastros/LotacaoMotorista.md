# Documentação: LotacaoMotorista.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `LotacaoMotorista` representa lotações de motoristas em unidades, incluindo motorista de cobertura e controle de período.

## Estrutura do Model

```csharp
public class LotacaoMotorista
{
    [Key]
    public Guid LotacaoMotoristaId { get; set; }

    public Guid MotoristaId { get; set; }
    public Guid MotoristaCoberturaId { get; set; }  // Motorista que cobre
    public Guid UnidadeId { get; set; }

    [Required]
    [Display(Name = "Data de Início")]
    public DateTime? DataInicio { get; set; }

    [Display(Name = "Data de Fim")]
    public DateTime? DataFim { get; set; }

    [Display(Name = "Lotado (S/N)")]
    public bool Lotado { get; set; }

    [Required]
    [Display(Name = "Motivo de Mudança")]
    public string? Motivo { get; set; }
}
```

## Notas Importantes

1. **Cobertura**: MotoristaCoberturaId indica motorista que cobre durante ausência
2. **Período**: DataInicio e DataFim controlam período de lotação
3. **Lotado**: Flag indica se está atualmente lotado

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
