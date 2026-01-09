# Documentação: Motorista.cs

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
6. [Validações](#validações)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Model `Motorista` representa motoristas da frota, incluindo informações pessoais, CNH, contatos e vinculação com unidades e contratos. É uma das entidades principais do sistema.

**Principais características:**

✅ **Cadastro Completo**: Informações pessoais, CNH, contatos  
✅ **CNH Digital**: Suporte a armazenamento de CNH digitalizada  
✅ **Foto**: Campo para foto do motorista  
✅ **QCard**: Código QCard para integração  
✅ **Unidade**: Vinculação com unidade  
✅ **Contrato**: Relacionamento com contratos através de `MotoristaContrato`

### Objetivo

O `Motorista` resolve o problema de:
- Cadastrar e gerenciar motoristas da frota
- Controlar validade de CNH
- Armazenar documentos digitais (CNH, foto)
- Integrar com sistema QCard
- Vincular motoristas a unidades e contratos

---

## Estrutura do Model

```csharp
public class Motorista
{
    [Key]
    public Guid MotoristaId { get; set; }

    [StringLength(100, ErrorMessage = "o Nome não pode exceder 100 caracteres")]
    [Required(ErrorMessage = "(O Nome é obrigatório)")]
    [Display(Name = "Nome do Motorista")]
    public string? Nome { get; set; }

    [StringLength(20, ErrorMessage = "o Ponto não pode exceder 20 caracteres")]
    [Required(ErrorMessage = "(O Ponto é obrigatório)")]
    [Display(Name = "Ponto")]
    public string? Ponto { get; set; }

    [DataType(DataType.DateTime)]
    [Required(ErrorMessage = "(A data de nascimento é obrigatória)")]
    [Display(Name = "Data de Nascimento")]
    public DateTime? DataNascimento { get; set; }

    [StringLength(20, ErrorMessage = "O CPF não pode exceder 20 caracteres")]
    [Required(ErrorMessage = "(O CPF é obrigatório)")]
    [Display(Name = "CPF")]
    public string? CPF { get; set; }

    [StringLength(20, ErrorMessage = "A CNH não pode exceder 20 caracteres")]
    [Required(ErrorMessage = "(A CNH é obrigatória)")]
    [Display(Name = "CNH")]
    public string? CNH { get; set; }

    [StringLength(10, ErrorMessage = "A Categoria da CNH não pode exceder 10 caracteres")]
    [Required(ErrorMessage = "(A categoria da CNH é obrigatória)")]
    [Display(Name = "Categoria da Habilitação")]
    public string? CategoriaCNH { get; set; }

    [DataType(DataType.DateTime)]
    [Required(ErrorMessage = "(A data de vencimento da CNH é obrigatória)")]
    [Display(Name = "Data de Vencimento CNH")]
    public DateTime? DataVencimentoCNH { get; set; }

    [StringLength(50, ErrorMessage = "O celular não pode exceder 50 caracteres")]
    [Required(ErrorMessage = "(O celular é obrigatório)")]
    [Display(Name = "Primeiro Celular")]
    public string? Celular01 { get; set; }

    [StringLength(50, ErrorMessage = "O celular não pode exceder 50 caracteres")]
    [Display(Name = "Segundo Celular")]
    public string? Celular02 { get; set; }

    [DataType(DataType.DateTime)]
    [Required(ErrorMessage = "(A data de ingresso é obrigatória)")]
    [Display(Name = "Data de Ingresso")]
    public DateTime? DataIngresso { get; set; }

    [Display(Name = "Origem da Indicação")]
    public string? OrigemIndicacao { get; set; }

    [Display(Name = "Tipo de Condutor")]
    public string? TipoCondutor { get; set; }

    public byte[]? Foto { get; set; }
    public byte[]? CNHDigital { get; set; }

    [Display(Name = "Ativo/Inativo")]
    public bool Status { get; set; }

    public DateTime? DataAlteracao { get; set; }
    public string? UsuarioIdAlteracao { get; set; }

    [Display(Name = "Código QCard")]
    public int? CodMotoristaQCard { get; set; }

    [Display(Name = "Unidade Vinculada")]
    public Guid? UnidadeId { get; set; }

    [ForeignKey("UnidadeId")]
    public virtual Unidade? Unidade { get; set; }
}
```

**Propriedades Principais:**

- **Identificação**: MotoristaId, Nome, CPF, Ponto
- **CNH**: CNH, CategoriaCNH, DataVencimentoCNH, CNHDigital
- **Contatos**: Celular01, Celular02
- **Documentos**: Foto, CNHDigital (byte[])
- **Vinculação**: UnidadeId, CodMotoristaQCard
- **Auditoria**: DataAlteracao, UsuarioIdAlteracao
- **Status**: Status (Ativo/Inativo)

### Classe: `MotoristaViewModel`

```csharp
public class MotoristaViewModel
{
    public Guid MotoristaId { get; set; }
    public Guid? ContratoId { get; set; }
    public Motorista? Motorista { get; set; }
    public string? NomeUsuarioAlteracao { get; set; }
    public IEnumerable<SelectListItem>? UnidadeList { get; set; }
    public IEnumerable<SelectListItem>? ContratoList { get; set; }
    public IEnumerable<SelectListItem>? CondutorList { get; set; }
}
```

**Uso**: ViewModel para formulários com listas de dropdowns.

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `Motorista`

**Tipo**: Tabela

**SQL de Criação** (exemplo):
```sql
CREATE TABLE [dbo].[Motorista] (
    [MotoristaId] uniqueidentifier NOT NULL PRIMARY KEY,
    [Nome] nvarchar(100) NOT NULL,
    [Ponto] nvarchar(20) NOT NULL,
    [DataNascimento] datetime2 NOT NULL,
    [CPF] nvarchar(20) NOT NULL,
    [CNH] nvarchar(20) NOT NULL,
    [CategoriaCNH] nvarchar(10) NOT NULL,
    [DataVencimentoCNH] datetime2 NOT NULL,
    [Celular01] nvarchar(50) NOT NULL,
    [Celular02] nvarchar(50) NULL,
    [DataIngresso] datetime2 NOT NULL,
    [OrigemIndicacao] nvarchar(100) NULL,
    [TipoCondutor] nvarchar(50) NULL,
    [Foto] varbinary(max) NULL,
    [CNHDigital] varbinary(max) NULL,
    [Status] bit NOT NULL DEFAULT 1,
    [DataAlteracao] datetime2 NULL,
    [UsuarioIdAlteracao] nvarchar(450) NULL,
    [CodMotoristaQCard] int NULL,
    [UnidadeId] uniqueidentifier NULL,
    CONSTRAINT [FK_Motorista_Unidade] FOREIGN KEY ([UnidadeId]) 
        REFERENCES [Unidade]([UnidadeId])
);
```

**Mapeamento Model ↔ Banco**:

| Campo no Model | Campo no Banco | Tipo SQL | Tipo C# | Nullable | Descrição |
|----------------|----------------|----------|---------|----------|-----------|
| `MotoristaId` | `MotoristaId` | `uniqueidentifier` | `Guid` | ❌ | Chave primária |
| `Nome` | `Nome` | `nvarchar(100)` | `string?` | ❌ | Nome completo |
| `CPF` | `CPF` | `nvarchar(20)` | `string?` | ❌ | CPF |
| `CNH` | `CNH` | `nvarchar(20)` | `string?` | ❌ | Número da CNH |
| `CategoriaCNH` | `CategoriaCNH` | `nvarchar(10)` | `string?` | ❌ | Categoria (A, B, C, etc.) |
| `DataVencimentoCNH` | `DataVencimentoCNH` | `datetime2` | `DateTime?` | ❌ | Data de vencimento |
| `Foto` | `Foto` | `varbinary(max)` | `byte[]?` | ✅ | Foto do motorista |
| `CNHDigital` | `CNHDigital` | `varbinary(max)` | `byte[]?` | ✅ | CNH digitalizada |
| `CodMotoristaQCard` | `CodMotoristaQCard` | `int` | `int?` | ✅ | Código QCard |
| `UnidadeId` | `UnidadeId` | `uniqueidentifier` | `Guid?` | ✅ | FK Unidade |

**Chaves e Índices**:
- **PK**: `MotoristaId` (CLUSTERED)
- **FK**: `UnidadeId` → `Unidade(UnidadeId)`
- **IX**: `IX_Motorista_CPF` (CPF) - Para busca por CPF
- **IX**: `IX_Motorista_CNH` (CNH) - Para busca por CNH
- **IX**: `IX_Motorista_CodMotoristaQCard` (CodMotoristaQCard) - Para integração QCard

**Tabelas Relacionadas**:
- `Unidade` - Unidade vinculada
- `MotoristaContrato` - Relacionamento N-N com contratos
- `Viagem` - Viagens realizadas pelo motorista
- `Abastecimento` - Abastecimentos realizados pelo motorista
- `Multa` - Multas recebidas pelo motorista

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **MotoristaController.Get()** → Lista Motoristas

**Quando**: Página de listagem de motoristas  
**Por quê**: Retornar todos os motoristas

```csharp
var motoristas = _unitOfWork.Motorista
    .GetAll(m => m.Status == true)
    .OrderBy(m => m.Nome)
    .ToList();
```

#### 2. **ViagemController** → Seleciona Motorista

**Quando**: Formulário de viagem precisa de lista de motoristas  
**Por quê**: Popular dropdown de seleção

```csharp
var motoristas = _unitOfWork.Motorista
    .GetAll(m => m.Status == true)
    .Select(m => new SelectListItem
    {
        Value = m.MotoristaId.ToString(),
        Text = m.Nome
    })
    .ToList();
```

### O Que Este Arquivo Usa

- **Unidade**: Relacionamento opcional
- **MotoristaContrato**: Relacionamento N-N com contratos

---

## Lógica de Negócio

### Validação de CNH Vencida

Sistema deve alertar sobre CNH próxima do vencimento:

```csharp
var diasParaVencimento = (motorista.DataVencimentoCNH.Value - DateTime.Now).Days;

if (diasParaVencimento <= 30)
{
    // Alertar sobre vencimento próximo
}
```

### Integração QCard

Campo `CodMotoristaQCard` é usado para integração com sistema QCard:

```csharp
// Buscar motorista por código QCard
var motorista = _unitOfWork.Motorista
    .GetFirstOrDefault(m => m.CodMotoristaQCard == codigoQCard);
```

---

## Validações

### Frontend

- CPF: Formato válido (11 dígitos)
- CNH: Formato válido
- Data de Vencimento CNH: Não pode ser no passado (ou alertar)

### Backend

- **Nome**: Obrigatório, max 100 caracteres
- **CPF**: Obrigatório, único (considerar constraint)
- **CNH**: Obrigatório, único (considerar constraint)
- **DataVencimentoCNH**: Obrigatório, validar formato
- **Celular01**: Obrigatório

---

## Exemplos de Uso

### Cenário 1: Criar Motorista

**Situação**: Cadastrar novo motorista

**Código**:
```csharp
var motorista = new Motorista
{
    MotoristaId = Guid.NewGuid(),
    Nome = "João da Silva",
    CPF = "12345678901",
    CNH = "12345678901",
    CategoriaCNH = "B",
    DataVencimentoCNH = new DateTime(2027, 12, 31),
    Celular01 = "(61) 99999-9999",
    DataIngresso = DateTime.Now,
    Status = true,
    UnidadeId = unidadeId
};

_unitOfWork.Motorista.Add(motorista);
_unitOfWork.Save();
```

---

## Troubleshooting

### Problema: Motorista não aparece em dropdowns

**Sintoma**: Motorista cadastrado não aparece nas listas

**Causa**: `Status = false` ou filtro incorreto

**Solução**: Verificar campo Status e filtros aplicados

---

## Notas Importantes

1. **CNH Digital**: Campo `CNHDigital` armazena PDF/imagem da CNH
2. **Foto**: Campo `Foto` armazena foto do motorista
3. **QCard**: Código QCard para integração com sistema de abastecimento
4. **TipoCondutor**: Valores comuns: "Efetivo", "Ferista", "Cobertura"

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `Motorista`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
