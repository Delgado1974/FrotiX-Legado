# Documentação: Contrato.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `Contrato` representa contratos de prestação de serviços (locação de veículos, motoristas, operadores, etc.). Controla vigência, valores, repactuações e tipos de serviços contratados.

**Principais características:**

✅ **Contratos de Serviços**: Locação de veículos, motoristas, operadores, etc.  
✅ **Vigência e Prorrogação**: Controle de períodos  
✅ **Repactuação**: Campo DataRepactuacao para repactuações  
✅ **Tipos de Serviço**: Flags para diferentes tipos (Encarregados, Operadores, Motoristas, Lavadores)  
✅ **Custos Mensais**: Custos mensais por tipo de serviço

## Estrutura do Model

```csharp
public class Contrato
{
    [Key]
    public Guid ContratoId { get; set; }

    [Required]
    [Display(Name = "Número")]
    public string? NumeroContrato { get; set; }

    [Required]
    [Display(Name = "Ano Contrato")]
    public string? AnoContrato { get; set; }

    [Required]
    [Display(Name = "Vigência")]
    public int? Vigencia { get; set; }

    [Display(Name = "Prorrogação")]
    public int? Prorrogacao { get; set; }

    [Required]
    [Display(Name = "Ano Processo")]
    public int? AnoProcesso { get; set; }

    [Required]
    [Display(Name = "Número Processo")]
    public string? NumeroProcesso { get; set; }

    [Required]
    [Display(Name = "Objeto do Contrato")]
    public string? Objeto { get; set; }

    [Required]
    [Display(Name = "Tipo do Contrato")]
    public string? TipoContrato { get; set; }

    [Display(Name = "Data da Última Repactuação")]
    public DateTime? DataRepactuacao { get; set; }

    [Required]
    [Display(Name = "Início do Contrato")]
    public DateTime? DataInicio { get; set; }

    [Required]
    [Display(Name = "Final do Contrato")]
    public DateTime? DataFim { get; set; }

    [Required]
    [DataType(DataType.Currency)]
    [Display(Name = "Valor (R$)")]
    public double? Valor { get; set; }

    // Flags de tipos de serviço
    public bool ContratoEncarregados { get; set; }
    public bool ContratoOperadores { get; set; }
    public bool ContratoMotoristas { get; set; }
    public bool ContratoLavadores { get; set; }

    // Custos mensais
    [DataType(DataType.Currency)]
    [Display(Name = "Operador (R$)")]
    public double? CustoMensalEncarregado { get; set; }

    [DataType(DataType.Currency)]
    [Display(Name = "Operador (R$)")]
    public double? CustoMensalOperador { get; set; }

    [DataType(DataType.Currency)]
    [Display(Name = "Motorista (R$)")]
    public double? CustoMensalMotorista { get; set; }

    [DataType(DataType.Currency)]
    [Display(Name = "Lavador (R$)")]
    public double? CustoMensalLavador { get; set; }

    // Relacionamentos
    public Guid? FornecedorId { get; set; }
    [ForeignKey("FornecedorId")]
    public virtual Fornecedor? Fornecedor { get; set; }
}
```

## Interconexões

Controllers de contrato, veículo, motorista, operador e lavador usam este modelo extensivamente.

## Classes Relacionadas no Mesmo Arquivo

### Classe: `RepactuacaoContrato`

Representa repactuações de contratos, permitindo ajustar valores, vigência e prorrogação.

```csharp
public class RepactuacaoContrato
{
    [Key]
    public Guid RepactuacaoContratoId { get; set; }
    public DateTime? DataRepactuacao { get; set; }
    public string? Descricao { get; set; }
    public double? Valor { get; set; }
    public double? Percentual { get; set; }
    public Guid ContratoId { get; set; }
    public int? Vigencia { get; set; }
    public int? Prorrogacao { get; set; }
    [NotMapped]
    public bool AtualizaContrato { get; set; }
}
```

### Classe: `ItemVeiculoContrato`

Representa itens de veículos em contratos, vinculados a repactuações.

```csharp
public class ItemVeiculoContrato
{
    [Key]
    public Guid ItemVeiculoId { get; set; }
    public int? NumItem { get; set; }
    public string? Descricao { get; set; }
    public int? Quantidade { get; set; }
    public double? ValorUnitario { get; set; }
    public Guid RepactuacaoContratoId { get; set; }
}
```

### Classe: `RepactuacaoTerceirizacao`

Representa repactuações de valores de terceirização (encarregados, operadores, motoristas, lavadores).

```csharp
public class RepactuacaoTerceirizacao
{
    [Key]
    public Guid RepactuacaoTerceirizacaoId { get; set; }
    public DateTime? DataRepactuacao { get; set; }
    public double? ValorEncarregado { get; set; }
    public double? ValorOperador { get; set; }
    public double? ValorMotorista { get; set; }
    public double? ValorLavador { get; set; }
    public int? QtdEncarregados { get; set; }
    public int? QtdOperadores { get; set; }
    public int? QtdMotoristas { get; set; }
    public int? QtdLavadores { get; set; }
    public Guid RepactuacaoContratoId { get; set; }
}
```

### Classe: `RepactuacaoServicos`

Representa repactuações de valores de serviços.

```csharp
public class RepactuacaoServicos
{
    [Key]
    public Guid RepactuacaoServicoId { get; set; }
    public DateTime? DataRepactuacao { get; set; }
    public double? Valor { get; set; }
    public Guid RepactuacaoContratoId { get; set; }
}
```

### Classe: `CustoMensalItensContrato`

Tabela de agregação de custos mensais por nota fiscal, ano e mês.

```csharp
public class CustoMensalItensContrato
{
    [Key, Column(Order = 0)]
    public Guid NotaFiscalId { get; set; }
    [Key, Column(Order = 1)]
    public int Ano { get; set; }
    [Key, Column(Order = 2)]
    public int Mes { get; set; }
    public double? CustoMensalOperador { get; set; }
    public double? CustoMensalMotorista { get; set; }
    public double? CustoMensalLavador { get; set; }
}
```

## Notas Importantes

1. **Tipos de Serviço**: Flags indicam quais tipos de serviços o contrato cobre
2. **Repactuação**: DataRepactuacao registra última repactuação
3. **Custos**: Custos mensais por tipo de serviço
4. **Quantidades**: Campos Quantidade* registram quantidades contratadas
5. **Repactuações Múltiplas**: Suporta repactuações de veículos, terceirização e serviços

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
