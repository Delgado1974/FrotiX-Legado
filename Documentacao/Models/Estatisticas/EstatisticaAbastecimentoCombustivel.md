# Documentação: EstatisticaAbastecimentoCombustivel.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)
3. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)

---

## Visão Geral

O Model `EstatisticaAbastecimentoCombustivel` representa estatísticas mensais de abastecimentos agrupadas por tipo de combustível. Inclui média de valor por litro calculada.

**Principais características:**

✅ **Agrupamento por Combustível**: Estatísticas por tipo (Gasolina, Diesel, etc.)  
✅ **Média de Preço**: Campo `MediaValorLitro` calculado  
✅ **Agregação Mensal**: Dados por mês/ano

---

## Estrutura do Model

```csharp
[Table("EstatisticaAbastecimentoCombustivel")]
public class EstatisticaAbastecimentoCombustivel
{
    [Key]
    public Guid Id { get; set; }

    public int Ano { get; set; }
    public int Mes { get; set; }
    
    [StringLength(100)]
    public string TipoCombustivel { get; set; } = string.Empty;

    public int TotalAbastecimentos { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal LitrosTotal { get; set; }
    public decimal MediaValorLitro { get; set; }

    public DateTime DataAtualizacao { get; set; }
}
```

**Propriedades Especiais:**

- `MediaValorLitro`: Média do valor unitário do combustível no período

---

## Notas Importantes

1. **Média Calculada**: `MediaValorLitro = ValorTotal / LitrosTotal`
2. **Análise de Preços**: Usado para acompanhar variação de preços

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
