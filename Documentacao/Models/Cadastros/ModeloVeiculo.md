# Documentação: ModeloVeiculo.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)
3. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
4. [Interconexões](#interconexões)

---

## Visão Geral

O Model `ModeloVeiculo` representa modelos de veículos cadastrados no sistema (ex: Corolla, Civic, Gol). Pertence a uma marca e é usado em veículos.

**Principais características:**

✅ **Relacionamento com Marca**: Modelo pertence a uma marca  
✅ **Cadastro Simples**: Apenas descrição e status  
✅ **Ativo/Inativo**: Permite desativar modelos sem deletar  
✅ **Hierarquia**: Marca → Modelo → Veículo

---

## Estrutura do Model

```csharp
public class ModeloVeiculo
{
    [Key]
    public Guid ModeloId { get; set; }

    [StringLength(50, ErrorMessage = "A descrição não pode exceder 50 caracteres")]
    [Required(ErrorMessage = "(A descrição do modelo é obrigatória)")]
    [Display(Name = "Modelo do Veículo")]
    public string? DescricaoModelo { get; set; }

    [Display(Name = "Ativo/Inativo")]
    public bool Status { get; set; }

    [ValidaLista(ErrorMessage = "(A Marca é obrigatória)")]
    [Display(Name = "Marca do Veículo")]
    public Guid MarcaId { get; set; }

    [ForeignKey("MarcaId")]
    public virtual MarcaVeiculo? MarcaVeiculo { get; set; }
}
```

**Propriedades:**

- `ModeloId` (Guid): Chave primária
- `DescricaoModelo` (string?): Nome do modelo (obrigatório, max 50)
- `Status` (bool): Ativo/Inativo
- `MarcaId` (Guid): FK para MarcaVeiculo (obrigatório)

### Classe: `ModeloVeiculoViewModel`

```csharp
public class ModeloVeiculoViewModel
{
    public Guid ModeloId { get; set; }
    public ModeloVeiculo? ModeloVeiculo { get; set; }
    public IEnumerable<SelectListItem>? MarcaList { get; set; }
}
```

**Uso**: ViewModel para formulários com lista de marcas.

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `ModeloVeiculo`

**Tipo**: Tabela

**Chaves e Índices**:
- **PK**: `ModeloId` (CLUSTERED)
- **FK**: `MarcaId` → `MarcaVeiculo(MarcaId)`
- **IX**: `IX_ModeloVeiculo_MarcaId` (MarcaId) - Para consultas por marca

**Tabelas Relacionadas**:
- `MarcaVeiculo` - Marca do modelo (FK obrigatória)
- `Veiculo` - Veículos têm modelo (FK ModeloId)

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **VeiculoController** → Lista Modelos por Marca

**Quando**: Dropdown de modelos precisa filtrar por marca  
**Por quê**: Modelos dependem da marca selecionada

```csharp
var modelos = _unitOfWork.ModeloVeiculo
    .GetAll(m => m.MarcaId == marcaId && m.Status == true)
    .OrderBy(m => m.DescricaoModelo)
    .Select(m => new SelectListItem
    {
        Value = m.ModeloId.ToString(),
        Text = m.DescricaoModelo
    })
    .ToList();
```

---

## Notas Importantes

1. **Dependência de Marca**: Modelo sempre pertence a uma marca
2. **Filtro por Marca**: Dropdowns de modelo devem filtrar por marca selecionada
3. **Status**: Sempre filtrar por `Status = true` em listagens

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
