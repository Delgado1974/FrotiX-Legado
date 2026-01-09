# Documentação: MovimentacaoEmpenhoMulta.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `MovimentacaoEmpenhoMulta` representa movimentações financeiras em empenhos específicos para multas. Vinculado a uma multa específica.

## Estrutura do Model

```csharp
public class MovimentacaoEmpenhoMulta
{
    [Key]
    public Guid MovimentacaoId { get; set; }

    public string? Descricao { get; set; }
    public string? TipoMovimentacao { get; set; }
    public double? Valor { get; set; }
    public DateTime? DataMovimentacao { get; set; }

    public Guid MultaId { get; set; }
    [ForeignKey("MultaId")]
    public virtual Multa? Multa { get; set; }

    public Guid EmpenhoMultaId { get; set; }
    [ForeignKey("EmpenhoMultaId")]
    public virtual EmpenhoMulta? EmpenhoMulta { get; set; }
}
```

## Notas Importantes

1. **Específico para Multas**: Diferente de MovimentacaoEmpenho geral
2. **Vinculado a Multa**: Sempre vinculado a uma multa específica

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
