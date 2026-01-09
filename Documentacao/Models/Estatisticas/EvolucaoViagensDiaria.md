# Documentação: EvolucaoViagensDiaria.cs

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

O Model `EvolucaoViagensDiaria` representa a evolução diária de viagens, mostrando total de viagens, KM total e minutos totais por dia. Permite análise de tendências e gráficos de evolução temporal.

**Principais características:**

✅ **Evolução Diária**: Dados por dia específico  
✅ **Filtro por Motorista**: Pode ser geral (NULL) ou por motorista  
✅ **Métricas Consolidadas**: Total viagens, KM, minutos

---

## Estrutura do Model

```csharp
[Table("EvolucaoViagensDiaria")]
public class EvolucaoViagensDiaria
{
    [Key]
    public Guid Id { get; set; }

    [Column(TypeName = "date")]
    public DateTime Data { get; set; }

    public Guid? MotoristaId { get; set; } // NULL = todos os motoristas

    public int TotalViagens { get; set; }
    public decimal KmTotal { get; set; }
    public int MinutosTotais { get; set; }

    public DateTime DataAtualizacao { get; set; }

    [ForeignKey("MotoristaId")]
    public virtual Motorista Motorista { get; set; }
}
```

---

## Notas Importantes

1. **Tipo Date**: Campo `Data` é do tipo `date` (sem hora)
2. **Motorista NULL**: Representa dados gerais de todos os motoristas
3. **Gráficos**: Usado para criar gráficos de linha de evolução

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
