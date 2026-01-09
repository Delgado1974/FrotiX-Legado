# Documentação: ViewEmpenhos.cs

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

O Model `ViewEmpenhos` representa uma VIEW do banco de dados que consolida informações de empenhos com saldos calculados (inicial, final, movimentação, notas) e contagem de movimentações.

**Principais características:**

✅ **View do Banco**: Representa uma VIEW SQL  
✅ **Saldos Calculados**: SaldoInicial, SaldoFinal, SaldoMovimentacao, SaldoNotas  
✅ **Contagem**: Campo Movimentacoes com quantidade

---

## Estrutura do Model

```csharp
public class ViewEmpenhos
{
    [Key]
    public Guid EmpenhoId { get; set; }

    public string? NotaEmpenho { get; set; }
    public DateTime? DataEmissao { get; set; }
    public int? AnoVigencia { get; set; }
    public DateTime? VigenciaInicial { get; set; }
    public DateTime? VigenciaFinal { get; set; }

    // Saldos calculados
    public double? SaldoInicial { get; set; }
    public double? SaldoFinal { get; set; }
    public double? SaldoMovimentacao { get; set; }
    public double? SaldoNotas { get; set; }

    public int? Movimentacoes { get; set; }  // Contagem

    // GUIDs vazios em vez de NULL
    public Guid ContratoId { get; set; }
    public Guid AtaId { get; set; }
}
```

**Propriedades Principais:**

- **Empenho**: EmpenhoId, NotaEmpenho, DataEmissao, AnoVigencia
- **Vigência**: VigenciaInicial, VigenciaFinal
- **Saldos**: SaldoInicial, SaldoFinal, SaldoMovimentacao, SaldoNotas
- **Contagem**: Movimentacoes (quantidade de movimentações)

---

## Mapeamento Model ↔ Banco de Dados

### View: `ViewEmpenhos`

**Tipo**: VIEW (não é tabela)

**Cálculos na View**:
- `SaldoFinal`: SaldoInicial - Movimentacoes - Notas
- `SaldoMovimentacao`: Soma das movimentações
- `SaldoNotas`: Soma das notas fiscais
- `Movimentacoes`: COUNT de movimentações

**Nota Especial**: View usa `ISNULL` para garantir GUID vazio (`00000000-0000-0000-0000-000000000000`) em vez de NULL nos campos ContratoId e AtaId.

---

## Notas Importantes

1. **Saldos Calculados**: Todos os saldos são calculados na view
2. **GUID Vazio**: ContratoId e AtaId usam GUID vazio em vez de NULL
3. **Performance**: View otimizada para consultas de saldos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
