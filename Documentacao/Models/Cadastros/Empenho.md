# Documentação: Empenho.cs

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

O Model `Empenho` representa empenhos orçamentários vinculados a contratos ou atas de registro de preços. Controla saldos disponíveis para despesas e movimentações financeiras.

**Principais características:**

✅ **Controle Orçamentário**: Gerencia saldos de empenhos  
✅ **Vinculação**: Pode estar vinculado a Contrato ou Ata  
✅ **Vigência**: Período de vigência do empenho  
✅ **Saldo**: Saldo inicial e final controlados

---

## Estrutura do Model

```csharp
public class Empenho
{
    [Key]
    public Guid EmpenhoId { get; set; }

    [Required(ErrorMessage = "(A nota de Empenho é obrigatória)")]
    [MinLength(12), MaxLength(12)]
    [Display(Name = "Nota de Empenho")]
    public string? NotaEmpenho { get; set; }

    [DataType(DataType.DateTime)]
    [Required(ErrorMessage = "(A data de emissão é obrigatória)")]
    [Display(Name = "Data de Emissão")]
    public DateTime? DataEmissao { get; set; }

    [DataType(DataType.DateTime)]
    [Required(ErrorMessage = "(A data de vigência inicial é obrigatória)")]
    [Display(Name = "Vigência Inicial")]
    public DateTime? VigenciaInicial { get; set; }

    [DataType(DataType.DateTime)]
    [Required(ErrorMessage = "(A data de vigência final é obrigatória)")]
    [Display(Name = "Vigência Final")]
    public DateTime? VigenciaFinal { get; set; }

    [ValidaZero(ErrorMessage = "(O ano de vigência é obrigatório)")]
    [Required(ErrorMessage = "(O ano de vigência é obrigatório)")]
    [Display(Name = "Ano de Vigência")]
    public int? AnoVigencia { get; set; }

    [ValidaZero(ErrorMessage = "(O saldo inicial é obrigatório)")]
    [Required(ErrorMessage = "(O saldo inicial é obrigatório)")]
    [DataType(DataType.Currency)]
    [Display(Name = "Saldo Inicial (R$)")]
    public double? SaldoInicial { get; set; }

    [DataType(DataType.Currency)]
    [Display(Name = "Saldo Final (R$)")]
    public double? SaldoFinal { get; set; }

    [Display(Name = "Contrato")]
    public Guid? ContratoId { get; set; }

    [ForeignKey("ContratoId")]
    public virtual Contrato Contrato { get; set; }

    [Display(Name = "Ata de Registro de Preços")]
    public Guid? AtaId { get; set; }

    [ForeignKey("AtaId")]
    public virtual AtaRegistroPrecos AtaRegistroPrecos { get; set; }
}
```

**Propriedades Principais:**

- `EmpenhoId` (Guid): Chave primária
- `NotaEmpenho` (string): Número da nota de empenho (12 caracteres)
- `DataEmissao` (DateTime?): Data de emissão
- `VigenciaInicial`/`VigenciaFinal` (DateTime?): Período de vigência
- `AnoVigencia` (int?): Ano de vigência
- `SaldoInicial` (double?): Saldo inicial do empenho
- `SaldoFinal` (double?): Saldo final (calculado)
- `ContratoId` (Guid?): FK para Contrato (opcional)
- `AtaId` (Guid?): FK para AtaRegistroPrecos (opcional)

**Validações:**

- `NotaEmpenho`: Deve ter exatamente 12 caracteres
- `SaldoInicial`: Deve ser > 0 (ValidaZero)

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `Empenho`

**Tipo**: Tabela

**Chaves e Índices**:
- **PK**: `EmpenhoId` (CLUSTERED)
- **FK**: `ContratoId` → `Contrato(ContratoId)` (opcional)
- **FK**: `AtaId` → `AtaRegistroPrecos(AtaId)` (opcional)

---

## Interconexões

### Quem Chama Este Arquivo

Controllers de empenho e relatórios financeiros usam este modelo.

---

## Lógica de Negócio

### Cálculo de Saldo Final

Saldo final é calculado subtraindo movimentações e notas:

```csharp
var movimentacoes = _unitOfWork.MovimentacaoEmpenho
    .GetAll(m => m.EmpenhoId == empenhoId)
    .Sum(m => m.Valor);

var notas = _unitOfWork.NotaFiscal
    .GetAll(n => n.EmpenhoId == empenhoId)
    .Sum(n => n.ValorNF);

empenho.SaldoFinal = empenho.SaldoInicial - movimentacoes - notas;
```

---

## Notas Importantes

1. **Vinculação Opcional**: Pode estar vinculado a Contrato OU Ata (não ambos obrigatoriamente)
2. **Saldo Final**: Calculado automaticamente
3. **Nota de Empenho**: Formato fixo de 12 caracteres

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
