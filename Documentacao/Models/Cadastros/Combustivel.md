# Documentação: Combustivel.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estrutura do Model](#estrutura-do-model)
5. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
6. [Interconexões](#interconexões)
7. [Lógica de Negócio](#lógica-de-negócio)
8. [Exemplos de Uso](#exemplos-de-uso)
9. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Model `Combustivel` representa os tipos de combustível disponíveis no sistema (ex: Gasolina, Diesel, Etanol, GNV). É uma tabela de cadastro simples mas essencial para o controle de abastecimentos.

**Principais características:**

✅ **Cadastro Simples**: Apenas descrição e status  
✅ **Ativo/Inativo**: Permite desativar tipos sem deletar  
✅ **Relacionamento com Abastecimento**: Cada abastecimento deve ter um combustível  
✅ **Média de Preço**: Classe auxiliar `MediaCombustivel` para cálculos

### Objetivo

O `Combustivel` resolve o problema de:
- Cadastrar tipos de combustível disponíveis
- Controlar quais combustíveis estão ativos
- Vincular abastecimentos a tipos específicos
- Calcular médias de preço por tipo

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Entity Framework Core | 5.0+ | ORM |
| ASP.NET Core | 5.0+ | Validações |

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/Cadastros/Combustivel.cs
```

### Arquivos Relacionados
- `Controllers/CombustivelController.cs` - CRUD de combustíveis
- `Pages/Combustivel/Index.cshtml` - Listagem
- `Repository/CombustivelRepository.cs` - Acesso a dados

---

## Estrutura do Model

```csharp
public class Combustivel
{
    [Key]
    public Guid CombustivelId { get; set; }

    [StringLength(50, ErrorMessage = "O combustível não pode exceder 50 caracteres")]
    [Required(ErrorMessage = "(O tipo de combustível é obrigatório)")]
    [Display(Name = "Tipo de Combustível")]
    public string Descricao { get; set; }

    [Display(Name = "Ativo/Inativo")]
    public bool Status { get; set; }
}
```

**Propriedades:**

- `CombustivelId` (Guid): Chave primária
- `Descricao` (string): Nome do tipo de combustível (ex: "Gasolina", "Diesel")
- `Status` (bool): Se está ativo (true) ou inativo (false)

### Classe: `MediaCombustivel`

```csharp
public class MediaCombustivel
{
    [Key, Column(Order = 0)]
    public Guid NotaFiscalId { get; set; }

    [Key, Column(Order = 1)]
    public Guid CombustivelId { get; set; }

    [Key, Column(Order = 2)]
    public int Ano { get; set; }

    [Key, Column(Order = 3)]
    public int Mes { get; set; }

    public double PrecoMedio { get; set; }
}
```

**Uso**: Calcula preço médio por combustível, mês e ano (chave composta).

### Classe: `CombustivelViewModel`

```csharp
public class CombustivelViewModel
{
    public Guid CombustivelId { get; set; }
}
```

**Uso**: ViewModel simples para formulários.

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `Combustivel`

**Tipo**: Tabela

**SQL de Criação**:
```sql
CREATE TABLE [dbo].[Combustivel] (
    [CombustivelId] uniqueidentifier NOT NULL PRIMARY KEY,
    [Descricao] nvarchar(50) NOT NULL,
    [Status] bit NOT NULL DEFAULT 1
);
```

**Mapeamento Model ↔ Banco**:

| Campo no Model | Campo no Banco | Tipo SQL | Tipo C# | Nullable | Descrição |
|----------------|----------------|----------|---------|----------|-----------|
| `CombustivelId` | `CombustivelId` | `uniqueidentifier` | `Guid` | ❌ | Chave primária |
| `Descricao` | `Descricao` | `nvarchar(50)` | `string` | ❌ | Tipo de combustível |
| `Status` | `Status` | `bit` | `bool` | ❌ | Ativo/Inativo |

**Chaves e Índices**:
- **PK**: `CombustivelId` (CLUSTERED)
- **IX**: `IX_Combustivel_Descricao` (Descricao) - Para busca

**Tabelas Relacionadas**:
- `Abastecimento` - FK para CombustivelId

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **AbastecimentoController** → Lista Combustíveis para Dropdown

**Quando**: Formulário de abastecimento precisa de lista de combustíveis  
**Por quê**: Popular dropdown de seleção

```csharp
var combustiveis = _unitOfWork.Combustivel
    .GetAll(c => c.Status == true)
    .Select(c => new SelectListItem
    {
        Value = c.CombustivelId.ToString(),
        Text = c.Descricao
    })
    .ToList();
```

#### 2. **Pages/Abastecimento/Index.cshtml.cs** → Inicializa Lista

**Quando**: Página de abastecimento carrega  
**Por quê**: Disponibilizar lista para filtros

```csharp
ViewData["lstCombustivel"] = new ListaCombustivel(_unitOfWork).CombustivelList();
```

### O Que Este Arquivo Usa

- Nenhuma dependência (tabela base)

### Fluxo de Dados

```
Combustivel (tabela)
    ↓
CombustivelRepository.GetAll()
    ↓
Filtro por Status = true
    ↓
SelectListItem (para dropdowns)
    ↓
ViewData / JSON
    ↓
Frontend (dropdowns, filtros)
```

---

## Lógica de Negócio

### Filtro de Combustíveis Ativos

Apenas combustíveis com `Status = true` aparecem em dropdowns:

```csharp
var ativos = _unitOfWork.Combustivel
    .GetAll(c => c.Status == true)
    .ToList();
```

### Cálculo de Preço Médio

A classe `MediaCombustivel` armazena preços médios calculados:

```csharp
// Exemplo de cálculo
var abastecimentos = _unitOfWork.Abastecimento
    .GetAll(a => a.CombustivelId == combustivelId 
              && a.DataHora.Value.Year == ano
              && a.DataHora.Value.Month == mes);

var precoMedio = abastecimentos.Average(a => a.ValorUnitario);
```

---

## Exemplos de Uso

### Cenário 1: Listar Combustíveis Ativos

**Situação**: Dropdown precisa de lista de combustíveis

**Código**:
```csharp
var combustiveis = _unitOfWork.Combustivel
    .GetAll(c => c.Status == true)
    .OrderBy(c => c.Descricao)
    .Select(c => new SelectListItem
    {
        Value = c.CombustivelId.ToString(),
        Text = c.Descricao
    })
    .ToList();
```

**Resultado**: Lista ordenada de combustíveis ativos

---

## Troubleshooting

### Problema: Combustível não aparece em dropdowns

**Sintoma**: Combustível cadastrado não aparece nas listas

**Causa**: `Status = false`

**Solução**: Ativar combustível ou remover filtro de status

---

## Notas Importantes

1. **Simplicidade**: Tabela muito simples, apenas descrição e status
2. **Status**: Sempre filtrar por `Status = true` em listagens
3. **Descrição Única**: Considerar constraint UNIQUE na descrição
4. **MediaCombustivel**: Classe auxiliar para cálculos de preço médio

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `Combustivel`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
