# Documentação: EstatisticaAbastecimentoMensal.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)
3. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
4. [Interconexões](#interconexões)
5. [Lógica de Negócio](#lógica-de-negócio)

---

## Visão Geral

O Model `EstatisticaAbastecimentoMensal` representa estatísticas consolidadas mensais de abastecimentos da frota, incluindo total de abastecimentos, valor total e litros totais. Tabela de agregação pré-calculada para dashboards.

**Principais características:**

✅ **Agregação Mensal**: Dados por mês/ano  
✅ **Métricas Consolidadas**: Total, valor, litros  
✅ **Performance**: Pré-calculado para consultas rápidas

---

## Estrutura do Model

```csharp
[Table("EstatisticaAbastecimentoMensal")]
public class EstatisticaAbastecimentoMensal
{
    [Key]
    public Guid Id { get; set; }

    public int Ano { get; set; }
    public int Mes { get; set; }
    public int TotalAbastecimentos { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal LitrosTotal { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
```

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `EstatisticaAbastecimentoMensal`

**Tipo**: Tabela de agregação

**Chaves e Índices**:
- **PK**: `Id` (CLUSTERED)
- **IX**: `IX_EstatisticaAbastecimentoMensal_Ano_Mes` (Ano, Mes)

---

## Interconexões

### Quem Chama Este Arquivo

Controllers de dashboard e relatórios de abastecimento consultam esta tabela para exibir estatísticas mensais.

---

## Lógica de Negócio

### Cálculo de Estatísticas

```csharp
var abastecimentos = _unitOfWork.Abastecimento
    .GetAll(a => a.DataHora.Value.Year == ano && a.DataHora.Value.Month == mes);

var estatistica = new EstatisticaAbastecimentoMensal
{
    Ano = ano,
    Mes = mes,
    TotalAbastecimentos = abastecimentos.Count(),
    ValorTotal = abastecimentos.Sum(a => (a.Litros * a.ValorUnitario) ?? 0),
    LitrosTotal = abastecimentos.Sum(a => a.Litros ?? 0),
    DataAtualizacao = DateTime.Now
};
```

---

## Notas Importantes

1. **Pré-calculado**: Dados calculados periodicamente
2. **Performance**: Consultas muito mais rápidas que agregar em tempo real

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
