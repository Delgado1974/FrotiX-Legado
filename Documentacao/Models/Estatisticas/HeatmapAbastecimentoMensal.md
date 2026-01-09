# Documentação: HeatmapAbastecimentoMensal.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `HeatmapAbastecimentoMensal` representa dados para criação de heatmaps de abastecimentos, mostrando distribuição por dia da semana e hora do dia. Similar a `HeatmapViagensMensal`, mas para abastecimentos.

---

## Estrutura do Model

```csharp
[Table("HeatmapAbastecimentoMensal")]
public class HeatmapAbastecimentoMensal
{
    [Key]
    public Guid Id { get; set; }

    public int Ano { get; set; }
    public int Mes { get; set; }
    public Guid? VeiculoId { get; set; }        // NULL = todos os veículos
    public string? TipoVeiculo { get; set; }    // NULL = todos os tipos
    public int DiaSemana { get; set; }          // 0=Domingo, 1=Segunda, ... 6=Sábado
    public int Hora { get; set; }                // 0-23

    public int TotalAbastecimentos { get; set; }
    public decimal ValorTotal { get; set; }

    public DateTime DataAtualizacao { get; set; }
}
```

---

## Notas Importantes

1. **Filtros Opcionais**: VeiculoId e TipoVeiculo podem ser NULL para dados gerais
2. **Heatmap**: Usado para visualização de padrões de abastecimento

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
