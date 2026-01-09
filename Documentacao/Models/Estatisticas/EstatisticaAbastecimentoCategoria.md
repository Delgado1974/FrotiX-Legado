# Documentação: EstatisticaAbastecimentoCategoria.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)
3. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
4. [Interconexões](#interconexões)

---

## Visão Geral

O Model `EstatisticaAbastecimentoCategoria` representa estatísticas mensais de abastecimentos agrupadas por categoria de veículo. Permite análise de consumo e custos por tipo de veículo (ex: Sedan, SUV, Caminhão).

**Principais características:**

✅ **Agrupamento por Categoria**: Estatísticas por categoria de veículo  
✅ **Agregação Mensal**: Dados por mês/ano  
✅ **Métricas Consolidadas**: Total, valor, litros

---

## Estrutura do Model

```csharp
[Table("EstatisticaAbastecimentoCategoria")]
public class EstatisticaAbastecimentoCategoria
{
    [Key]
    public Guid Id { get; set; }

    public int Ano { get; set; }
    public int Mes { get; set; }
    
    [StringLength(100)]
    public string Categoria { get; set; } = string.Empty;

    public int TotalAbastecimentos { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal LitrosTotal { get; set; }

    public DateTime DataAtualizacao { get; set; }
}
```

**Propriedades:**

- `Categoria` (string): Categoria do veículo (ex: "Sedan", "SUV", "Caminhão")
- `TotalAbastecimentos`: Quantidade de abastecimentos na categoria
- `ValorTotal`: Valor total gasto
- `LitrosTotal`: Total de litros abastecidos

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `EstatisticaAbastecimentoCategoria`

**Tipo**: Tabela de agregação

**Chaves e Índices**:
- **PK**: `Id` (CLUSTERED)
- **IX**: `IX_EstatisticaAbastecimentoCategoria_Ano_Mes_Categoria` (Ano, Mes, Categoria)

---

## Interconexões

Controllers de dashboard e relatórios consultam esta tabela para análises por categoria de veículo.

---

## Notas Importantes

1. **Agrupamento**: Dados agrupados por categoria do veículo
2. **Performance**: Pré-calculado para consultas rápidas

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
