# Documentação: VeiculoRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `VeiculoRepository` é um repository específico para a entidade `Veiculo`, estendendo o repository genérico com métodos customizados para operações específicas de veículos.

**Principais características:**

✅ **Herança**: Herda de `Repository<Veiculo>`  
✅ **Interface Específica**: Implementa `IVeiculoRepository`  
✅ **Métodos Customizados**: `GetVeiculoListForDropDown()` e `Update()` customizado

---

## Estrutura da Classe

### Herança e Implementação

```csharp
public class VeiculoRepository : Repository<Veiculo>, IVeiculoRepository
```

**Herança**: `Repository<Veiculo>` - Herda operações CRUD genéricas  
**Interface**: `IVeiculoRepository` - Define métodos específicos

---

## Construtor

```csharp
public VeiculoRepository(FrotiXDbContext db) : base(db)
{
    _db = db;
}
```

**Base**: Chama construtor da classe base `Repository<Veiculo>`

---

## Métodos Específicos

### `GetVeiculoListForDropDown()`

**Descrição**: Retorna lista de veículos formatada para DropDownList do ASP.NET Core

**Retorno**: `IEnumerable<SelectListItem>`

**Implementação**:
```csharp
public IEnumerable<SelectListItem> GetVeiculoListForDropDown()
{
    return _db.Veiculo
        .OrderBy(o => o.Placa)
        .Select(i => new SelectListItem()
        {
            Text = i.Placa,
            Value = i.VeiculoId.ToString()
        });
}
```

**Características**:
- Ordena por placa
- Retorna apenas `Placa` como texto e `VeiculoId` como valor
- Formato compatível com `@Html.DropDownListFor()`

**Uso**:
```csharp
var veiculos = unitOfWork.Veiculo.GetVeiculoListForDropDown();
ViewBag.Veiculos = veiculos;
```

---

### `Update(Veiculo veiculo)`

**Descrição**: **MÉTODO CUSTOMIZADO** - Atualiza veículo com lógica específica

**Implementação**:
```csharp
public new void Update(Veiculo veiculo)
{
    var objFromDb = _db.Veiculo.FirstOrDefault(s => s.VeiculoId == veiculo.VeiculoId);
    
    _db.Update(veiculo);
    _db.SaveChanges();
}
```

**Características**:
- Usa `new` para ocultar método da classe base
- Busca entidade do banco antes de atualizar
- Chama `SaveChanges()` diretamente (não espera `UnitOfWork.Save()`)

**Nota**: ⚠️ **Inconsistência** - Chama `SaveChanges()` diretamente, enquanto outros repositories esperam `UnitOfWork.Save()`

**Uso**:
```csharp
veiculo.Placa = "XYZ5678";
unitOfWork.Veiculo.Update(veiculo); // Já salva automaticamente
```

---

## Interconexões

### Quem Usa Este Repository

- **VeiculoController**: CRUD de veículos
- **Controllers de Relacionamentos**: Para seleção de veículos
- **Views Razor**: Para dropdowns de veículos

### O Que Este Repository Usa

- **FrotiX.Data**: `FrotiXDbContext`
- **FrotiX.Models**: `Veiculo`
- **Microsoft.AspNetCore.Mvc.Rendering**: `SelectListItem`

---

## Comparação com Repository Genérico

| Operação | Repository<Veiculo> | VeiculoRepository |
|----------|---------------------|-------------------|
| `Get()` | ✅ Sim | ✅ Sim (herdado) |
| `GetAll()` | ✅ Sim | ✅ Sim (herdado) |
| `Add()` | ✅ Sim | ✅ Sim (herdado) |
| `Update()` | ✅ Sim (genérico) | ✅ Sim (customizado) |
| `GetVeiculoListForDropDown()` | ❌ Não | ✅ Sim (específico) |

---

## Exemplos de Uso

### Exemplo 1: Dropdown em View

```csharp
// Controller
public IActionResult Create()
{
    ViewBag.Veiculos = _unitOfWork.Veiculo.GetVeiculoListForDropDown();
    return View();
}

// View Razor
@Html.DropDownListFor(m => m.VeiculoId, ViewBag.Veiculos as SelectList, "Selecione...")
```

### Exemplo 2: Atualização Customizada

```csharp
var veiculo = _unitOfWork.Veiculo.Get(veiculoId);
veiculo.Placa = "NOVA1234";
_unitOfWork.Veiculo.Update(veiculo); // Já salva automaticamente
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do VeiculoRepository

**Arquivos Afetados**:
- `Repository/VeiculoRepository.cs`

**Impacto**: Documentação de referência para repository de veículos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
