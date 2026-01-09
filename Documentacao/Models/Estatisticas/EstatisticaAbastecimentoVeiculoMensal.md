# Documentação: EstatisticaAbastecimentoVeiculoMensal.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `EstatisticaAbastecimentoVeiculoMensal` representa estatísticas mensais de abastecimentos agrupadas por veículo específico. Permite análise individual de consumo e custos por veículo.

---

## Estrutura do Model

```csharp
[Table("EstatisticaAbastecimentoVeiculoMensal")]
public class EstatisticaAbastecimentoVeiculoMensal
{
    [Key]
    public Guid Id { get; set; }

    public int Ano { get; set; }
    public int Mes { get; set; }
    public Guid VeiculoId { get; set; }

    public int TotalAbastecimentos { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal LitrosTotal { get; set; }

    public DateTime DataAtualizacao { get; set; }
}
```

---

## Notas Importantes

1. **Por Veículo**: Agrupamento por veículo específico (VeiculoId)
2. **Mensal**: Dados por mês/ano
3. **Análise Individual**: Permite análise de consumo por veículo

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
