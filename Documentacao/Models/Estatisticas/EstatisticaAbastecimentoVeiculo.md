# Documentação: EstatisticaAbastecimentoVeiculo.cs

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

O Model `EstatisticaAbastecimentoVeiculo` representa estatísticas de abastecimentos agrupadas por veículo e ano, incluindo informações do veículo (placa, tipo, categoria) e métricas consolidadas (total, valor, litros).

**Principais características:**

✅ **Agrupamento por Veículo**: Estatísticas por veículo  
✅ **Informações do Veículo**: Placa, tipo, categoria incluídos  
✅ **Agregação Anual**: Dados por ano (não mensal)

---

## Estrutura do Model

```csharp
[Table("EstatisticaAbastecimentoVeiculo")]
public class EstatisticaAbastecimentoVeiculo
{
    [Key]
    public Guid Id { get; set; }

    public int Ano { get; set; }
    public Guid VeiculoId { get; set; }
    
    [StringLength(20)]
    public string? Placa { get; set; }
    
    [StringLength(100)]
    public string? TipoVeiculo { get; set; }
    
    [StringLength(100)]
    public string? Categoria { get; set; }

    public int TotalAbastecimentos { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal LitrosTotal { get; set; }

    public DateTime DataAtualizacao { get; set; }
}
```

---

## Notas Importantes

1. **Agrupamento**: Por veículo e ano
2. **Dados do Veículo**: Incluídos para facilitar consultas sem JOIN

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
