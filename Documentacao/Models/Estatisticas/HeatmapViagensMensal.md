# Documentação: HeatmapViagensMensal.cs

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

O Model `HeatmapViagensMensal` representa dados para criação de heatmaps (mapas de calor) de viagens, mostrando distribuição de viagens por dia da semana e hora do dia. Permite visualizar padrões de uso da frota.

**Principais características:**

✅ **Heatmap**: Dados para visualização de calor  
✅ **Distribuição Temporal**: Por dia da semana e hora  
✅ **Filtro por Motorista**: Pode ser geral ou por motorista específico  
✅ **Agregação Mensal**: Dados consolidados por mês

---

## Estrutura do Model

```csharp
[Table("HeatmapViagensMensal")]
public class HeatmapViagensMensal
{
    [Key]
    public Guid Id { get; set; }

    public int Ano { get; set; }
    public int Mes { get; set; }
    public Guid? MotoristaId { get; set; } // NULL = todos os motoristas
    public int DiaSemana { get; set; } // 0=Domingo, 1=Segunda, ... 6=Sábado
    public int Hora { get; set; } // 0-23
    public int TotalViagens { get; set; }

    public DateTime DataAtualizacao { get; set; }

    [ForeignKey("MotoristaId")]
    public virtual Motorista Motorista { get; set; }
}
```

**Propriedades:**

- `DiaSemana`: 0=Domingo, 1=Segunda, 2=Terça, ..., 6=Sábado
- `Hora`: 0-23 (hora do dia)
- `MotoristaId`: NULL = todos os motoristas, Guid = motorista específico

---

## Lógica de Negócio

### Estrutura de Heatmap

Dados são organizados em matriz:
- **Linhas**: Dias da semana (0-6)
- **Colunas**: Horas do dia (0-23)
- **Valores**: Total de viagens naquela célula

---

## Notas Importantes

1. **Visualização**: Usado para criar heatmaps visuais
2. **Padrões**: Identifica horários e dias de maior movimento
3. **Motorista NULL**: Representa dados gerais de todos os motoristas

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
