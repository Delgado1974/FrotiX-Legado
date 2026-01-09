# Documentação: Patrimonio.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `Patrimonio` representa patrimônios (bens) da instituição. Inclui informações de identificação (NPR), localização, setor/seção e status de conferência.

**Principais características:**

✅ **NPR**: Número de Patrimônio (formato validado)  
✅ **Localização**: Localização atual e de conferência  
✅ **Setor/Seção**: Vinculado a SetorPatrimonial e SecaoPatrimonial  
✅ **Conferência**: Campos para controle de conferência patrimonial  
✅ **Imagem**: Suporte a imagem do patrimônio

## Estrutura do Model

```csharp
public class Patrimonio
{
    [Key]
    public Guid PatrimonioId { get; set; }

    [StringLength(10)]
    [Required(ErrorMessage = "O Número do Patrimônio é Obrigatório")]
    [RegularExpression(@"^\d+(\.\d+)?$", ErrorMessage = "O formato do número deve ser: números.ponto.números")]
    [Display(Name = "NPR")]
    public string? NPR { get; set; }

    [StringLength(30)]
    [Display(Name = "Marca")]
    public string? Marca { get; set; }

    [StringLength(30)]
    [Display(Name = "Modelo")]
    public string? Modelo { get; set; }

    [StringLength(100)]
    [Display(Name = "Descrição")]
    public string? Descricao { get; set; }

    [StringLength(80)]
    [Display(Name = "Número de Série")]
    public string? NumeroSerie { get; set; }

    [StringLength(150)]
    [Required(ErrorMessage = "A Localização Atual é Obrigatória")]
    [Display(Name = "Localização Atual")]
    public string? LocalizacaoAtual { get; set; }

    public DateTime? DataEntrada { get; set; }
    public DateTime? DataSaida { get; set; }
    public string? Situacao { get; set; }
    public bool Status { get; set; }
    public int? StatusConferencia { get; set; }
    public string? ImageUrl { get; set; }
    public byte[]? Imagem { get; set; }

    public Guid SetorId { get; set; }
    [ForeignKey("SetorId")]
    public virtual SetorPatrimonial? SetorPatrimonial { get; set; }

    public Guid SecaoId { get; set; }
    [ForeignKey("SecaoId")]
    public virtual SecaoPatrimonial? SecaoPatrimonial { get; set; }

    // Conferência
    public string? LocalizacaoConferencia { get; set; }
    public Guid? SetorConferenciaId { get; set; }
    public Guid? SecaoConferenciaId { get; set; }
}
```

## Validações

- **NPR**: Formato `número.ponto.número` (ex: "123.456")
- **LocalizacaoAtual**: Obrigatório

## Notas Importantes

1. **NPR Único**: Considerar constraint UNIQUE no NPR
2. **Conferência**: Campos separados para localização de conferência
3. **StatusConferencia**: 0=não conferido, 1=conferido, etc.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
