# Documentação: ViewEmpenhoMulta.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW que consolida informações de empenhos de multas com saldos calculados (inicial, atual, movimentação, multas) e contagem de movimentações.

## Estrutura do Model

```csharp
public class ViewEmpenhoMulta
{
    public Guid EmpenhoMultaId { get; set; }
    public Guid OrgaoAutuanteId { get; set; }
    public string? NotaEmpenho { get; set; }
    public int? AnoVigencia { get; set; }
    
    // Saldos calculados
    public double? SaldoInicial { get; set; }
    public double? SaldoAtual { get; set; }
    public double? SaldoMovimentacao { get; set; }
    public double? SaldoMultas { get; set; }
    
    public int? Movimentacoes { get; set; }  // Contagem
}
```

## Notas Importantes

1. **Saldos Calculados**: Todos os saldos são calculados na view
2. **Específico para Multas**: Diferente de ViewEmpenhos geral
3. **Órgão**: Sempre vinculado a um órgão autuante

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
