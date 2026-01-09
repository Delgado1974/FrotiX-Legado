# Documentação: Veiculo.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `Veiculo` representa veículos da frota. É uma das entidades principais do sistema, com múltiplos relacionamentos e campos importantes para gestão da frota.

**Principais características:**

✅ **Cadastro Completo**: Placa, marca, modelo, quilometragem, etc.  
✅ **Múltiplos Relacionamentos**: Marca, Modelo, Unidade, Combustível, Contrato, Ata  
✅ **Tipos de Veículo**: Próprio/Locação, Reserva/Efetivo, Economildo  
✅ **Documentos**: CRLV digitalizado  
✅ **Patrimônio**: Número de patrimônio

## Estrutura do Model

```csharp
public class Veiculo
{
    [Key]
    public Guid VeiculoId { get; set; }

    [Required]
    [StringLength(10)]
    [Display(Name = "Placa")]
    public string? Placa { get; set; }

    [Display(Name = "Quilometragem")]
    public int? Quilometragem { get; set; }

    [StringLength(20)]
    [Display(Name = "Renavam")]
    public string? Renavam { get; set; }

    [StringLength(20)]
    [Display(Name = "Placa Vinculada")]
    public string? PlacaVinculada { get; set; }

    [Required]
    [Display(Name = "Ano de Fabricacao")]
    public int? AnoFabricacao { get; set; }

    [Required]
    [Display(Name = "Ano do Modelo")]
    public int? AnoModelo { get; set; }

    [Display(Name = "Carro Reserva")]
    public bool Reserva { get; set; }

    [Display(Name = "Ativo/Inativo")]
    public bool Status { get; set; }

    [Display(Name = "Veículo Próprio")]
    public bool VeiculoProprio { get; set; }

    [Display(Name = "Nº Patrimônio")]
    public string? Patrimonio { get; set; }

    [Display(Name = "Categoria")]
    public string? Categoria { get; set; }

    public byte[]? CRLV { get; set; }

    public DateTime? DataAlteracao { get; set; }
    public string? UsuarioIdAlteracao { get; set; }

    // Relacionamentos
    public Guid? PlacaBronzeId { get; set; }
    [ForeignKey("PlacaBronzeId")]
    public virtual PlacaBronze? PlacaBronze { get; set; }

    [Required]
    public Guid? MarcaId { get; set; }
    [ForeignKey("MarcaId")]
    public virtual MarcaVeiculo? MarcaVeiculo { get; set; }

    public Guid? ModeloId { get; set; }
    [ForeignKey("ModeloId")]
    public virtual ModeloVeiculo? ModeloVeiculo { get; set; }

    public Guid? UnidadeId { get; set; }
    [ForeignKey("UnidadeId")]
    public virtual Unidade? Unidade { get; set; }

    public Guid? CombustivelId { get; set; }
    [ForeignKey("CombustivelId")]
    public virtual Combustivel? Combustivel { get; set; }

    // Contratos e Atas (através de tabelas intermediárias)
    public Guid? ItemVeiculoId { get; set; }
    public Guid? ItemVeiculoAtaId { get; set; }
}
```

## Interconexões

Controllers de veículo, viagem, abastecimento e manutenção usam extensivamente este modelo.

## Notas Importantes

1. **Placa Única**: Considerar constraint UNIQUE na Placa
2. **Reserva**: Campo Reserva indica se é veículo reserva ou efetivo
3. **VeiculoProprio**: Indica se é próprio da instituição ou locado
4. **CRLV**: Documento digitalizado armazenado como byte[]

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
