# Documentação: Multa.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `Multa` representa multas de trânsito recebidas por veículos/motoristas da frota. Inclui informações da infração, valores, prazos, documentos PDF e controle de pagamento.

**Principais características:**

✅ **Multas de Trânsito**: Registro completo de multas  
✅ **Valores Duplos**: Valor até vencimento e após vencimento  
✅ **PDFs**: Múltiplos documentos PDF (autuação, penalidade, comprovante)  
✅ **Controle de Pagamento**: Campos Paga, DataPagamento, ValorPago  
✅ **Processo**: Campo ProcessoEDoc para processos administrativos

## Estrutura do Model

```csharp
public class Multa
{
    [Key]
    public Guid MultaId { get; set; }

    [Required]
    [Display(Name = "Nº da Infração")]
    public string? NumInfracao { get; set; }

    [Required]
    [Display(Name = "Data Infração")]
    public DateTime? Data { get; set; }

    [Required]
    [Display(Name = "Hora")]
    public DateTime? Hora { get; set; }

    [Required]
    [Display(Name = "Localização da Infração")]
    public string? Localizacao { get; set; }

    [Display(Name = "Data de Vencimento")]
    public DateTime? Vencimento { get; set; }

    [DataType(DataType.Currency)]
    [Display(Name = "Valor Até Vencimento")]
    public double? ValorAteVencimento { get; set; }

    [Required]
    [DataType(DataType.Currency)]
    [Display(Name = "Valor Após Vencimento")]
    public double? ValorPosVencimento { get; set; }

    public string? Observacao { get; set; }

    // PDFs
    public string? AutuacaoPDF { get; set; }
    public string? PenalidadePDF { get; set; }
    public string? ComprovantePDF { get; set; }
    public string? ProcessoEdocPDF { get; set; }
    public string? OutrosDocumentosPDF { get; set; }

    // Status
    public bool? Paga { get; set; }
    public bool? EnviadaSecle { get; set; }
    public string? Fase { get; set; }
    public string? ProcessoEDoc { get; set; }
    public string? Status { get; set; }

    // Viagem relacionada
    [Display(Name = "Nº Ficha Vistoria da Viagem")]
    public int? NoFichaVistoria { get; set; }

    // Prazos
    [Required]
    [Display(Name = "Data Notificação")]
    public DateTime? DataNotificacao { get; set; }

    [Required]
    [Display(Name = "Data Limite Reconhecimento")]
    public DateTime? DataLimite { get; set; }

    // Pagamento
    public double? ValorPago { get; set; }
    public DateTime? DataPagamento { get; set; }
    public string? FormaPagamento { get; set; }

    // Relacionamentos
    public Guid? MotoristaId { get; set; }
    [ForeignKey("MotoristaId")]
    public virtual Motorista? Motorista { get; set; }

    public Guid? VeiculoId { get; set; }
    [ForeignKey("VeiculoId")]
    public virtual Veiculo? Veiculo { get; set; }

    public Guid? OrgaoAutuanteId { get; set; }
    [ForeignKey("OrgaoAutuanteId")]
    public virtual OrgaoAutuante? OrgaoAutuante { get; set; }

    public Guid? TipoMultaId { get; set; }
    [ForeignKey("TipoMultaId")]
    public virtual TipoMulta? TipoMulta { get; set; }

    public Guid? EmpenhoMultaId { get; set; }
    [ForeignKey("EmpenhoMultaId")]
    public virtual EmpenhoMulta? EmpenhoMulta { get; set; }

    // Contratos
    public Guid? ContratoVeiculoId { get; set; }
    public Guid? ContratoMotoristaId { get; set; }
    public Guid? AtaVeiculoId { get; set; }
}
```

## Interconexões

Controllers de multa usam este modelo para CRUD e relatórios.

## Notas Importantes

1. **Valores Duplos**: ValorAteVencimento e ValorPosVencimento
2. **PDFs Múltiplos**: Vários campos para diferentes tipos de documentos
3. **Paga Nullable**: Campo Paga é bool? (pode ser null se não foi processado)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
