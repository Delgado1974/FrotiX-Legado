# Documentação: ViewLavagem.cs

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

O Model `ViewLavagem` representa uma VIEW do banco de dados que consolida informações de lavagens de veículos com dados relacionados de motoristas, veículos e lavadores.

**Principais características:**

✅ **View do Banco**: Representa uma VIEW SQL  
✅ **Dados Consolidados**: Inclui informações de múltiplas tabelas  
✅ **Lavadores Múltiplos**: Campo `LavadoresId` e `Lavadores` (string concatenada)  
✅ **Duração**: Campo `DuracaoMinutos` calculado

---

## Estrutura do Model

```csharp
public class ViewLavagem
{
    public Guid LavagemId { get; set; }
    public Guid MotoristaId { get; set; }
    public Guid VeiculoId { get; set; }
    public string? LavadoresId { get; set; }      // IDs concatenados
    public string? Data { get; set; }             // Formatada
    public string? HorarioInicio { get; set; }    // Formatado
    public string? HorarioFim { get; set; }       // Formatado
    public int? DuracaoMinutos { get; set; }      // Calculado
    public string? Lavadores { get; set; }        // Nomes concatenados
    public string? DescricaoVeiculo { get; set; }
    public string? Nome { get; set; }             // Nome do motorista
}
```

**Propriedades Principais:**

- **Lavagem**: LavagemId, Data, HorarioInicio, HorarioFim, DuracaoMinutos
- **Lavadores**: LavadoresId (IDs), Lavadores (nomes)
- **Veículo**: VeiculoId, DescricaoVeiculo
- **Motorista**: MotoristaId, Nome

---

## Mapeamento Model ↔ Banco de Dados

### View: `ViewLavagem`

**Tipo**: VIEW (não é tabela)

**Tabelas Envolvidas**:
- `Lavagem` (tabela principal)
- `Motorista` (JOIN)
- `Veiculo` (JOIN)
- `LavadoresLavagem` (JOIN para múltiplos lavadores)

**Cálculos na View**:
- `DuracaoMinutos`: DATEDIFF(MINUTE, HorarioInicio, HorarioFim)
- `Lavadores`: STRING_AGG ou CONCAT de nomes dos lavadores

---

## Notas Importantes

1. **Lavadores Múltiplos**: Uma lavagem pode ter múltiplos lavadores
2. **Duração Calculada**: Campo DuracaoMinutos é calculado na view
3. **Datas Formatadas**: Data e horários vêm formatados como string

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
