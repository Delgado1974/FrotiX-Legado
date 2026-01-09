# Documentação: EmpenhoMulta.cs

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

O Model `EmpenhoMulta` representa empenhos específicos para pagamento de multas, vinculados a órgãos autuantes. Controla saldos disponíveis para pagamento de multas de trânsito.

**Principais características:**

✅ **Empenho Específico**: Dedicado a multas  
✅ **Órgão Autuante**: Vinculado a órgão específico  
✅ **Saldo Atual**: Campo SaldoAtual (diferente de SaldoFinal)

---

## Estrutura do Model

```csharp
public class EmpenhoMulta
{
    [Key]
    public Guid EmpenhoMultaId { get; set; }

    [Required(ErrorMessage = "(A nota de Empenho é obrigatória)")]
    [MinLength(12), MaxLength(12)]
    [Display(Name = "Nota de Empenho")]
    public string? NotaEmpenho { get; set; }

    [Required(ErrorMessage = "(O ano de vigência é obrigatório)")]
    [Display(Name = "Ano de Vigência")]
    public int? AnoVigencia { get; set; }

    [ValidaZero(ErrorMessage = "(O saldo inicial é obrigatório)")]
    [Required(ErrorMessage = "(O saldo inicial é obrigatório)")]
    [DataType(DataType.Currency)]
    [Display(Name = "Saldo Inicial (R$)")]
    public double? SaldoInicial { get; set; }

    [DataType(DataType.Currency)]
    [Display(Name = "Saldo Atual (R$)")]
    public double? SaldoAtual { get; set; }

    public bool Status { get; set; }

    [Display(Name = "Órgão Autuante")]
    public Guid OrgaoAutuanteId { get; set; }

    [ForeignKey("OrgaoAutuanteId")]
    public virtual OrgaoAutuante OrgaoAutuante { get; set; }
}
```

**Propriedades Principais:**

- `EmpenhoMultaId` (Guid): Chave primária
- `NotaEmpenho` (string): Número da nota (12 caracteres)
- `AnoVigencia` (int?): Ano de vigência
- `SaldoInicial` (double?): Saldo inicial
- `SaldoAtual` (double?): Saldo atual (atualizado conforme multas pagas)
- `Status` (bool): Ativo/Inativo
- `OrgaoAutuanteId` (Guid): FK para OrgaoAutuante (obrigatório)

---

## Notas Importantes

1. **Específico para Multas**: Diferente de `Empenho` geral
2. **Órgão Obrigatório**: Sempre vinculado a um órgão autuante
3. **Saldo Atual**: Atualizado conforme multas são pagas

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
