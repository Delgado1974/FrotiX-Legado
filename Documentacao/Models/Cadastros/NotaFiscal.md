# Documentação: NotaFiscal.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `NotaFiscal` representa notas fiscais vinculadas a empenhos, contratos ou atas. Inclui valores, glosas e campos calculados para custos mensais.

**Principais características:**

✅ **Notas Fiscais**: Registro de NF vinculadas a empenhos  
✅ **Glosa**: Campos ValorGlosa e MotivoGlosa  
✅ **Referência**: Ano e mês de referência  
✅ **Custos Calculados**: Campos `[NotMapped]` para custos mensais

## Estrutura do Model

```csharp
public class NotaFiscal
{
    [Key]
    public Guid NotaFiscalId { get; set; }

    [Required]
    [Display(Name = "Número da Nota Fiscal")]
    public int? NumeroNF { get; set; }

    [Required]
    [DataType(DataType.DateTime)]
    [Display(Name = "Data de Emissão")]
    public DateTime? DataEmissao { get; set; }

    [Required]
    [DataType(DataType.Currency)]
    [Display(Name = "Valor (R$)")]
    public double? ValorNF { get; set; }

    [Required]
    [Display(Name = "Tipo de Nota Fiscal")]
    public string? TipoNF { get; set; }

    [Display(Name = "Objeto da Nota Fiscal")]
    public string? Objeto { get; set; }

    [DataType(DataType.Currency)]
    [Display(Name = "Valor de Glosa (R$)")]
    public double? ValorGlosa { get; set; }

    [MaxLength(150)]
    [Display(Name = "Motivo da Glosa")]
    public string? MotivoGlosa { get; set; }

    [Required]
    [Display(Name = "Ano/Ref.")]
    public int? AnoReferencia { get; set; }

    [Required]
    [Display(Name = "Mês/Ref.")]
    public int? MesReferencia { get; set; }

    // Relacionamentos
    public Guid? ContratoId { get; set; }
    [ForeignKey("ContratoId")]
    public virtual Contrato? Contrato { get; set; }

    public Guid? AtaId { get; set; }
    [ForeignKey("ContratoId")]  // ⚠️ Erro: deveria ser AtaId
    public virtual AtaRegistroPrecos? AtaRegistroPrecos { get; set; }

    [Required]
    [Display(Name = "Empenho")]
    public Guid? EmpenhoId { get; set; }
    [ForeignKey("EmpenhoId")]
    public virtual Empenho? Empenho { get; set; }

    public Guid? VeiculoId { get; set; }
    [ForeignKey("VeiculoId")]
    public virtual Veiculo? Veiculo { get; set; }

    // Campos calculados (não mapeados)
    [NotMapped]
    [Display(Name = "(R$) Mensal Gasolina")]
    public double? MediaGasolina { get; set; }

    [NotMapped]
    [Display(Name = "(R$) Mensal Diesel")]
    public double? MediaDiesel { get; set; }

    [NotMapped]
    [Display(Name = "(R$) Operador")]
    public double? CustoMensalOperador { get; set; }

    [NotMapped]
    [Display(Name = "(R$) Motorista")]
    public double? CustoMensalMotorista { get; set; }

    [NotMapped]
    [Display(Name = "(R$) Lavador")]
    public double? CustoMensalLavador { get; set; }
}
```

## Notas Importantes

1. **Erro no FK**: Campo `AtaId` tem `[ForeignKey("ContratoId")]` - deveria ser `[ForeignKey("AtaId")]`
2. **Campos Calculados**: MediaGasolina, MediaDiesel, etc. são `[NotMapped]` (calculados em runtime)
3. **Empenho Obrigatório**: EmpenhoId é obrigatório

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
