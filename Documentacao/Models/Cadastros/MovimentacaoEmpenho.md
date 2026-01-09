# Documentação: MovimentacaoEmpenho.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `MovimentacaoEmpenho` representa movimentações financeiras em empenhos (créditos ou débitos). Usado para controlar saldo de empenhos.

## Estrutura do Model

```csharp
public class MovimentacaoEmpenho
{
    [Key]
    public Guid MovimentacaoId { get; set; }

    public string? Descricao { get; set; }
    public string? TipoMovimentacao { get; set; }  // "Crédito" ou "Débito"
    public double? Valor { get; set; }

    [Required]
    [Display(Name = "Data de Emissão")]
    public DateTime? DataMovimentacao { get; set; }

    [Display(Name = "Empenho")]
    public Guid EmpenhoId { get; set; }
    [ForeignKey("EmpenhoId")]
    public virtual Empenho? Empenho { get; set; }
}
```

## Interconexões

Controllers de empenho usam para registrar movimentações e calcular saldos.

## Notas Importantes

1. **TipoMovimentacao**: "Crédito" aumenta saldo, "Débito" diminui
2. **Cálculo de Saldo**: SaldoFinal = SaldoInicial - Movimentacoes - NotasFiscais

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
