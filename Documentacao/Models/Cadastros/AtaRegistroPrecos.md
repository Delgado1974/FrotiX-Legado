# Documentação: AtaRegistroPrecos.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `AtaRegistroPrecos` representa atas de registro de preços vinculadas a fornecedores. Similar a `Contrato`, mas para atas.

## Estrutura do Model

```csharp
public class AtaRegistroPrecos
{
    [Key]
    public Guid AtaId { get; set; }

    [Required]
    [Display(Name = "Número Ata")]
    public string? NumeroAta { get; set; }

    [Required]
    [Display(Name = "Ano Ata")]
    public string? AnoAta { get; set; }

    [Required]
    [Display(Name = "Ano Processo")]
    public int? AnoProcesso { get; set; }

    [Required]
    [Display(Name = "Número Processo")]
    public string NumeroProcesso { get; set; }

    [Required]
    [Display(Name = "Objeto da Ata")]
    public string Objeto { get; set; }

    [Required]
    [Display(Name = "Início da Ata")]
    public DateTime? DataInicio { get; set; }

    [Required]
    [Display(Name = "Final da Ata")]
    public DateTime? DataFim { get; set; }

    [Required]
    [DataType(DataType.Currency)]
    [Display(Name = "Valor (R$)")]
    public double? Valor { get; set; }

    [Display(Name = "Ativo/Inativo")]
    public bool Status { get; set; }

    [Display(Name = "Fornecedor")]
    public Guid FornecedorId { get; set; }
    [ForeignKey("FornecedorId")]
    public virtual Fornecedor Fornecedor { get; set; }
}
```

## Classes Relacionadas no Mesmo Arquivo

### Classe: `RepactuacaoAta`

Representa repactuações de atas de registro de preços.

```csharp
public class RepactuacaoAta
{
    [Key]
    public Guid RepactuacaoAtaId { get; set; }
    public DateTime? DataRepactuacao { get; set; }
    public string? Descricao { get; set; }
    public Guid AtaId { get; set; }
    [ForeignKey("AtaId")]
    public virtual AtaRegistroPrecos AtaRegistroPrecos { get; set; }
}
```

### Classe: `ItemVeiculoAta`

Representa itens de veículos em atas, vinculados a repactuações.

```csharp
public class ItemVeiculoAta
{
    [Key]
    public Guid ItemVeiculoAtaId { get; set; }
    public int? NumItem { get; set; }
    public string? Descricao { get; set; }
    public int? Quantidade { get; set; }
    public double? ValorUnitario { get; set; }
    public Guid RepactuacaoAtaId { get; set; }
    [ForeignKey("RepactuacaoAtaId")]
    public virtual RepactuacaoAta RepactuacaoAta { get; set; }
}
```

## Notas Importantes

1. **Similar a Contrato**: Estrutura similar mas para atas
2. **Fornecedor Obrigatório**: Sempre vinculado a um fornecedor
3. **Repactuação**: Suporta repactuações através de RepactuacaoAta
4. **Itens**: Itens de veículos vinculados a repactuações

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
