# Documentação: EstatisticaAbastecimentoTipoVeiculo.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `EstatisticaAbastecimentoTipoVeiculo` representa estatísticas mensais de abastecimentos agrupadas por tipo de veículo. Similar a `EstatisticaAbastecimentoCategoria`, mas agrupa por tipo (ex: "Passeio", "Utilitário").

---

## Estrutura do Model

```csharp
[Table("EstatisticaAbastecimentoTipoVeiculo")]
public class EstatisticaAbastecimentoTipoVeiculo
{
    [Key]
    public Guid Id { get; set; }

    public int Ano { get; set; }
    public int Mes { get; set; }
    
    [StringLength(100)]
    public string TipoVeiculo { get; set; } = string.Empty;

    public int TotalAbastecimentos { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal LitrosTotal { get; set; }

    public DateTime DataAtualizacao { get; set; }
}
```

---

## Notas Importantes

1. **Diferença de Categoria**: TipoVeiculo pode ser diferente de Categoria
2. **Agrupamento**: Por tipo de veículo (campo TipoVeiculo da tabela Veiculo)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
